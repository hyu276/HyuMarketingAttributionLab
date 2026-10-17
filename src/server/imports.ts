import { parse } from 'csv-parse/sync';
import { createHash } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { checkoutLinks, costs, imports, orders, campaigns } from '@/db/schema';
import { db } from '@/db/client';
import { ApiError } from '@/server/http';

const orderRow = z.object({
  order_id: z.string().trim().min(1).max(160),
  ordered_at: z.string().datetime({ offset:true }),
  status: z.enum(['pending','paid','fulfilled','cancelled','refunded','partially_refunded']),
  currency: z.literal('VND'),
  gross_item_revenue: z.coerce.number().int().nonnegative().safe(),
  discount_amount: z.coerce.number().int().nonnegative().safe(),
  refunded_amount: z.coerce.number().int().nonnegative().safe(),
  checkout_token: z.string().optional().default(''),
  discount_code: z.string().trim().max(90).optional().default(''),
});
const spendRow=z.object({
  row_key:z.string().trim().min(1).max(200),
  campaign_id:z.string().uuid(),
  spend_date:z.iso.date(),
  currency:z.literal('VND'),
  amount:z.coerce.number().int().nonnegative().safe(),
});
type OrderRow=z.infer<typeof orderRow>;
export type ImportKind='orders'|'spend';
export type Preview={kind:ImportKind; count:number; errors:{row:number;reason:string}[]; digest:string; valid:boolean};
function parsedRows(csv:string):Record<string,string>[] {
  if(csv.length>1000000) throw new ApiError(413,'CSV_TOO_LARGE','Maximum CSV size is 1 MB');
  try {
    const rows=parse(csv,{columns:true,bom:true,skip_empty_lines:true,trim:true,relax_quotes:false,skip_records_with_error:false}) as Record<string,string>[];
    if(rows.length>5000)throw new ApiError(413,'TOO_MANY_ROWS','Maximum 5000 rows');
    if(rows.length===0)throw new ApiError(400,'EMPTY_CSV','CSV contains no data rows');
    return rows;
  } catch(e) {if(e instanceof ApiError) throw e; throw new ApiError(400,'INVALID_CSV','Unable to parse CSV');}
}
export function previewImport(kind:ImportKind,csv:string):Preview {
  const rows=parsedRows(csv);
  const schema=kind==='orders'?orderRow:spendRow;
  const errors:{row:number;reason:string}[]=[];
  const seen=new Set<string>();
  rows.forEach((row,i)=>{
    const parsed=schema.safeParse(row);
    if(!parsed.success){errors.push({row:i+2,reason:parsed.error.issues.map(x=>x.path.join('.')+' '+x.message).join('; ')});return;}
    const key=kind==='orders'?row.order_id:row.row_key;
    if(seen.has(key))errors.push({row:i+2,reason:'Duplicate key inside file'});
    seen.add(key);
    if(kind==='orders'){
      const r=parsed.data as OrderRow;
      if(r.gross_item_revenue-r.discount_amount-r.refunded_amount<0)errors.push({row:i+2,reason:'Negative net revenue'});
    }
  });
  return {kind,count:rows.length,errors,digest:createHash('sha256').update(csv,'utf8').digest('hex'),valid:errors.length===0};
}
export async function commitImport(siteId:string,kind:ImportKind,csv:string,digest:string) {
  const preview=previewImport(kind,csv);
  if(preview.digest!==digest)throw new ApiError(409,'PREVIEW_MISMATCH','CSV must match reviewed preview');
  if(!preview.valid)throw new ApiError(400,'INVALID_ROWS','Fix preview errors before committing');
  const rows=parsedRows(csv);
  return db().transaction(async(tx)=>{
    const [already]=await tx.select().from(imports)
      .where(and(eq(imports.siteId,siteId),eq(imports.kind,kind),eq(imports.contentHash,digest))).limit(1);
    if(already?.status==='complete')return {duplicate:true,count:already.rowCount};
    if(kind==='spend'){
      for(const value of rows) {
        const r=spendRow.parse(value);
        const [validCampaign]=await tx.select({id:campaigns.id}).from(campaigns)
          .where(and(eq(campaigns.siteId,siteId),eq(campaigns.id,r.campaign_id))).limit(1);
        if(!validCampaign)throw new ApiError(400,'UNKNOWN_CAMPAIGN','Spend refers to missing or foreign campaign');
        await tx.insert(costs).values({siteId,campaignId:r.campaign_id,spendDate:r.spend_date,
          amount:r.amount,currency:r.currency,rowKey:r.row_key})
          .onConflictDoUpdate({target:[costs.siteId,costs.rowKey],set:{amount:r.amount,campaignId:r.campaign_id,
          spendDate:r.spend_date,currency:r.currency}});
      }
    } else {
      for(const value of rows) {
        const r=orderRow.parse(value);
        const [existing]=await tx.select().from(orders).where(and(eq(orders.siteId,siteId),eq(orders.externalOrderId,r.order_id))).limit(1);
        let checkoutLinkId=existing?.checkoutLinkId ?? null;
        if(!existing && r.checkout_token) {
          const hash=createHash('sha256').update(r.checkout_token).digest('hex');
          const [link]=await tx.select().from(checkoutLinks)
            .where(and(eq(checkoutLinks.siteId,siteId),eq(checkoutLinks.tokenHash,hash))).limit(1);
          if(!link || link.usedAt || link.expiresAt.getTime()<Date.now())
            throw new ApiError(400,'BAD_CHECKOUT_TOKEN','Checkout token invalid, expired or already used');
          checkoutLinkId=link.id;
          const redeemed=await tx.update(checkoutLinks).set({usedAt:new Date()})
            .where(and(eq(checkoutLinks.id,link.id),isNull(checkoutLinks.usedAt))).returning({id:checkoutLinks.id});
          if(!redeemed.length)throw new ApiError(409,'CHECKOUT_REPLAY','Checkout token already redeemed');
        }
        const net=r.gross_item_revenue-r.discount_amount-r.refunded_amount;
        const row={
          siteId,externalOrderId:r.order_id,orderedAt:new Date(r.ordered_at),currency:r.currency,
          status:r.status,gross:r.gross_item_revenue,discount:r.discount_amount,refunded:r.refunded_amount,
          net,checkoutLinkId, couponCode:r.discount_code?.toUpperCase() || null,
        };
        await tx.insert(orders).values(row)
          .onConflictDoUpdate({target:[orders.siteId,orders.externalOrderId],set:row});
      }
    }
    await tx.insert(imports).values({siteId,kind,contentHash:digest,status:'complete',rowCount:rows.length});
    return {duplicate:false,count:rows.length};
  });
}
