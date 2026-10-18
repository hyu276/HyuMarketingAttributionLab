import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID,createHash } from 'node:crypto';
import { db } from '../../src/db/client.ts';
import { workspaces, sites, visitors, sessions, campaigns, touchpoints, checkoutLinks, orders, costs } from '../../src/db/schema.ts';
import { buildReport } from '../../src/server/reporting.ts';

test('DB attribution reconciles a real stored journey without crossing sites',async()=>{
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL required for database integration');
  const database=db();
  const [w1]=await database.insert(workspaces).values({name:'fixture-'+randomUUID()}).returning();
  const [w2]=await database.insert(workspaces).values({name:'isolated-'+randomUUID()}).returning();
  const [site]=await database.insert(sites).values({workspaceId:w1.id,name:'Fixture store',
    publicKey:'site_'+randomUUID().replaceAll('-',''),domains:['localhost']}).returning();
  const [otherSite]=await database.insert(sites).values({workspaceId:w2.id,name:'Other store',
    publicKey:'site_'+randomUUID().replaceAll('-',''),domains:['localhost']}).returning();
  const [fb]=await database.insert(campaigns).values({siteId:site.id,utmId:'fb-'+randomUUID(),name:'Facebook autumn',source:'facebook',medium:'paid_social'}).returning();
  const [google]=await database.insert(campaigns).values({siteId:site.id,utmId:'gg-'+randomUUID(),name:'Google branded',source:'google',medium:'cpc'}).returning();
  const [visitor]=await database.insert(visitors).values({siteId:site.id,anonId:randomUUID()}).returning();
  const visits=[
    ['2026-10-01T09:00:00Z',fb.id,'facebook','paid_social',false],
    ['2026-10-03T10:00:00Z',google.id,'google','cpc',false],
    ['2026-10-05T11:00:00Z',null,null,null,true],
  ] as const;
  for(const [occurred,campaignId,source,medium,isDirect] of visits) {
    const [session]=await database.insert(sessions).values({siteId:site.id,visitorId:visitor.id,
      startedAt:new Date(occurred),lastSeenAt:new Date(occurred)}).returning();
    await database.insert(touchpoints).values({siteId:site.id,visitorId:visitor.id,sessionId:session.id,
      campaignId,source,medium,isDirect,occurredAt:new Date(occurred)});
  }
  const token=randomUUID();
  const [link]=await database.insert(checkoutLinks).values({siteId:site.id,visitorId:visitor.id,
    tokenHash:createHash('sha256').update(token).digest('hex'),expiresAt:new Date('2026-10-06T12:15:00Z'),
    usedAt:new Date('2026-10-06T12:00:00Z')}).returning();
  await database.insert(orders).values({siteId:site.id,externalOrderId:'ORD-'+randomUUID(),status:'paid',
    orderedAt:new Date('2026-10-06T12:00:00Z'),currency:'VND',gross:1000000,discount:100000,
    refunded:0,net:900000,checkoutLinkId:link.id});
  await database.insert(costs).values({siteId:site.id,campaignId:fb.id,spendDate:'2026-10-06',currency:'VND',
    amount:300000,rowKey:'spent-'+randomUUID()});
  // Other workspace has no access via site-scoped report.
  await database.insert(orders).values({siteId:otherSite.id,externalOrderId:'OTHER-'+randomUUID(),status:'paid',
    orderedAt:new Date('2026-10-06T12:00:00Z'),currency:'VND',gross:99999999,discount:0,
    refunded:0,net:99999999});
  const args={siteId:site.id,from:'2026-10-01',to:'2026-10-31',windowDays:7 as const};
  const first=await buildReport({...args,model:'first_touch'});
  const last=await buildReport({...args,model:'last_non_direct_touch'});
  assert.equal(first.totals.observedOrders,1);
  assert.equal(first.totals.observedRevenueVnd,900000);
  assert.equal(last.totals.observedRevenueVnd,900000);
  assert.equal(first.orders[0].attribution.campaignId,fb.id);
  assert.equal(last.orders[0].attribution.campaignId,google.id);
  assert.equal(first.comparison.firstTouch.verifiedAttributedRevenueVnd,900000);
  assert.equal(first.comparison.lastNonDirectTouch.verifiedAttributedRevenueVnd,900000);
  assert.equal(first.comparison.firstTouch.unassignedRevenueVnd,0);
  assert.equal(first.dataQuality.lastOrderImportAt,null); // Direct fixture insert is not a completed CSV import.
  assert.equal(first.dataQuality.spendRowCount,1);
  assert.equal(first.totals.roas,3);
  assert.equal(last.totals.roas,3); // Blended site-level ROAS includes total site spend
  assert.equal(first.campaigns.find(c=>c.id===fb.id)?.verifiedAttributedRevenueVnd,900000);
  assert.equal(last.campaigns.find(c=>c.id===google.id)?.verifiedAttributedRevenueVnd,900000);
  assert.equal(last.campaigns.find(c=>c.id===google.id)?.roas,null); // Campaign with no spend is N/A
});
