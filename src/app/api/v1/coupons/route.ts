import { and,eq } from 'drizzle-orm';
import { NextRequest,NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db/client';
import { campaigns,couponCodes } from '@/db/schema';
import { requireSite } from '@/server/authz';
import { requireSameOrigin,safely } from '@/server/http';
export const runtime='nodejs';
const payload=z.object({siteId:z.string().uuid(),campaignId:z.string().uuid(),code:z.string().min(2).max(90).regex(/^[A-Z0-9_-]+$/)});
export async function GET(req:NextRequest){return safely(async()=>{
  const siteId=z.string().uuid().parse(req.nextUrl.searchParams.get('siteId'));
  await requireSite(siteId);
  const records=await db().select().from(couponCodes).where(eq(couponCodes.siteId,siteId));
  return NextResponse.json({coupons:records});
});}
export async function POST(req:NextRequest){return safely(async()=>{
  requireSameOrigin(req);
  const input=payload.parse(await req.json());
  await requireSite(input.siteId,true);
  const [campaign]=await db().select().from(campaigns).where(and(eq(campaigns.id,input.campaignId),eq(campaigns.siteId,input.siteId))).limit(1);
  if(!campaign)return NextResponse.json({code:'FOREIGN_CAMPAIGN',message:'Campaign not in site'},{status:403});
  const [existing]=await db().select().from(couponCodes).where(and(eq(couponCodes.siteId,input.siteId),eq(couponCodes.code,input.code))).limit(1);
  if(existing)return NextResponse.json({code:'COUPON_EXISTS',message:'Code already mapped. Resolve ambiguity rather than guessing.'},{status:409});
  const [coupon]=await db().insert(couponCodes).values({...input,active:true}).returning();
  return NextResponse.json({coupon},{status:201});
});}
