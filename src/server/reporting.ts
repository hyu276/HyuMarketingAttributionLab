import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { orders, touchpoints, checkoutLinks, costs, campaigns, couponCodes, events, workspaces, sites } from '@/db/schema';
import { attributeOrder, calculateRoas, type AttributionModel, type TrustedOrder, type Touchpoint } from '@/domain/attribution';
import { ApiError } from '@/server/http';

export type ReportOptions={siteId:string;from:string;to:string;model:AttributionModel;windowDays:1|7|30};
export async function buildReport(options:ReportOptions) {
  if(options.to<options.from)throw new ApiError(400,'INVALID_RANGE','End date precedes start date');
  const [site] = await db().select().from(sites).where(eq(sites.id,options.siteId)).limit(1);
  if(!site)throw new ApiError(404,'SITE_NOT_FOUND','Site not found');
  const [workspace] = await db().select().from(workspaces).where(eq(workspaces.id,site.workspaceId)).limit(1);
  if(workspace.currency!=='VND')throw new ApiError(400,'UNSUPPORTED_CURRENCY','MVP reports VND only');
  const allOrders=await db().select().from(orders).where(eq(orders.siteId,options.siteId)).limit(10001);
  if(allOrders.length>10000)throw new ApiError(422,'REPORT_TOO_LARGE','Narrow date range or use paginated analytics query');
  // Date grouping is explicit in the workspace timezone; UTC remains the stored source timestamp.
  const dateKey=(stamp:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:workspace.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(stamp);
  const filtered=allOrders.filter(o=>{const d=dateKey(o.orderedAt);return d>=options.from&&d<=options.to;});
  const [allTouches,allLinks,allCosts,allCampaigns,allCoupons,allEvents]=await Promise.all([
    db().select().from(touchpoints).where(eq(touchpoints.siteId,options.siteId)).limit(50001),
    db().select().from(checkoutLinks).where(eq(checkoutLinks.siteId,options.siteId)).limit(10001),
    db().select().from(costs).where(eq(costs.siteId,options.siteId)).limit(10001),
    db().select().from(campaigns).where(eq(campaigns.siteId,options.siteId)).limit(10001),
    db().select().from(couponCodes).where(eq(couponCodes.siteId,options.siteId)).limit(10001),
    db().select().from(events).where(eq(events.siteId,options.siteId)).limit(50001),
  ]);
  if(allTouches.length>50000||allEvents.length>50000||allCosts.length>10000)
    throw new ApiError(422,'REPORT_TOO_LARGE','Dataset requires pagination and background aggregation');
  const visitors=new Map(allLinks.map(link=>[link.id,link.visitorId]));
  const touches:Touchpoint[]=allTouches.map(t=>({
    id:t.id,siteId:t.siteId,visitorId:t.visitorId,occurredAt:t.occurredAt.toISOString(),
    consented:true,source:t.source,medium:t.medium,campaignId:t.campaignId,isDirect:t.isDirect,
  }));
  const campaignsById=new Map(allCampaigns.map(c=>[c.id,c]));
  const buckets=new Map<string,{campaignId:string|null;source:string;orders:number;revenue:number;basis:string}>();
  const journeys=filtered.map(o=>{
    const linkedVisitor=o.checkoutLinkId?visitors.get(o.checkoutLinkId)??null:null;
    const couponIds=o.couponCode?allCoupons.filter(c=>c.active&&c.code===o.couponCode).map(c=>c.campaignId):[];
    const trusted:TrustedOrder={id:o.id,siteId:o.siteId,orderedAt:o.orderedAt.toISOString(),
      status:o.status as TrustedOrder['status'],netRevenueVnd:o.net,verifiedVisitorId:linkedVisitor,
      verifiedCouponCampaignIds:couponIds};
    const result=attributeOrder(trusted,touches,options.model,options.windowDays);
    const label=result.basis==='unassigned'||result.basis==='ineligible_order'?result.basis:
      result.campaignId?campaignsById.get(result.campaignId)?.name??'Unknown campaign':result.source??'Direct';
    const key=result.basis+':'+(result.campaignId??result.source??'none');
    const existing=buckets.get(key)??{campaignId:result.campaignId,source:label,orders:0,revenue:0,basis:result.basis};
    if(result.basis!=='ineligible_order'){existing.orders++;existing.revenue+=result.attributedRevenueVnd;}
    buckets.set(key,existing);
    return {orderId:o.externalOrderId,occurredAt:o.orderedAt.toISOString(),status:o.status,
      netRevenueVnd:result.eligibleOrderRevenueVnd,attribution:result,sourceLabel:label};
  });
  const spendByCampaign=new Map<string,number>();
  for(const row of allCosts.filter(c=>c.spendDate>=options.from&&c.spendDate<=options.to&&c.currency==='VND')){
    spendByCampaign.set(row.campaignId,(spendByCampaign.get(row.campaignId)??0)+row.amount);
  }
  const valid=journeys.filter(j=>j.attribution.basis!=='ineligible_order');
  const observedRevenue=valid.reduce((a,j)=>a+j.netRevenueVnd,0);
  const attributed=valid.filter(j=>['observed_touch','direct'].includes(j.attribution.basis));
  const unassigned=valid.filter(j=>j.attribution.basis==='unassigned');
  const coupon=valid.filter(j=>j.attribution.basis==='coupon_fallback');
  const campaignsView=allCampaigns.map(c=>{
    const credit=valid.filter(j=>j.attribution.campaignId===c.id).reduce((a,j)=>a+j.attribution.attributedRevenueVnd,0);
    const spend=spendByCampaign.get(c.id)??null;
    return {id:c.id,name:c.name,source:c.source,medium:c.medium,spendVnd:spend,
      attributedRevenueVnd:credit,roas:calculateRoas(credit,spend)};
  });
  const scopedEvents=allEvents.filter(e=>{const date=dateKey(e.occurredAt);return date>=options.from&&date<=options.to;});
  const funnel=Object.fromEntries(['page_view','view_item','add_to_cart','begin_checkout'].map(name=>[name,scopedEvents.filter(e=>e.eventName===name).length]));
  const spendTotal=Array.from(spendByCampaign.values()).reduce((a,b)=>a+b,0);
  const assignedRevenue=attributed.reduce((a,j)=>a+j.attribution.attributedRevenueVnd,0);
  const couponRevenue=coupon.reduce((a,j)=>a+j.attribution.attributedRevenueVnd,0);
  const unassignedRevenue=unassigned.reduce((a,j)=>a+j.netRevenueVnd,0);
  if(observedRevenue!==assignedRevenue+couponRevenue+unassignedRevenue)
    throw new ApiError(500,'RECONCILIATION_ERROR','Attribution does not reconcile to trusted orders');
  return {
    site:{id:site.id,name:site.name,workspaceId:site.workspaceId},
    context:{...options,timezone:workspace.timezone,currency:'VND',orderDateBasis:true,
      modelVersion:'mal-attribution-v1',generatedAt:new Date().toISOString(),partialData:false},
    totals:{observedOrders:valid.length,observedRevenueVnd:observedRevenue,
      verifiedAttributionOrders:attributed.length,verifiedAttributedRevenueVnd:assignedRevenue,
      couponFallbackOrders:coupon.length,couponRevenueVnd:couponRevenue,
      unassignedOrders:unassigned.length,unassignedRevenueVnd:unassignedRevenue,
      spendVnd:spendTotal,roas:calculateRoas(assignedRevenue,spendTotal)},
    sources:[...buckets.values()],campaigns:campaignsView,funnel,orders:journeys,
  };
}
export function safeCsvCell(value:unknown) {
  const raw=String(value??'');
  const escaped=/^[\s]*[=+\-@\t\r]/.test(raw)?"'"+raw:raw;
  return '"'+escaped.replaceAll('"','""')+'"';
}
export function reportCsv(rows:ReadonlyArray<Record<string,unknown>>) {
  const keys=['orderId','occurredAt','status','netRevenueVnd','sourceLabel','attributionBasis'];
  return [keys.join(','),...rows.map(row=>keys.map(k=>safeCsvCell(row[k])).join(','))].join('\r\n');
}
