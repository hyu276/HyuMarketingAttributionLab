import test from 'node:test';
import assert from 'node:assert/strict';
import { attributeOrder, calculateRoas, type Touchpoint, type TrustedOrder } from '../../src/domain/attribution.ts';

const order: TrustedOrder = {
  id: 'ORD-A', siteId: 'site-one', orderedAt: '2026-10-06T12:00:00Z',
  status: 'paid', netRevenueVnd: 900000, verifiedVisitorId: 'visitor-one',
};
const touches: Touchpoint[] = [
  { id:'t-facebook', siteId:'site-one', visitorId:'visitor-one', occurredAt:'2026-10-01T09:00:00Z', consented:true, source:'facebook', medium:'paid_social', campaignId:'fb', isDirect:false },
  { id:'t-google', siteId:'site-one', visitorId:'visitor-one', occurredAt:'2026-10-03T10:00:00Z', consented:true, source:'google', medium:'cpc', campaignId:'gg', isDirect:false },
  { id:'t-direct', siteId:'site-one', visitorId:'visitor-one', occurredAt:'2026-10-05T11:00:00Z', consented:true, source:null, medium:null, campaignId:null, isDirect:true },
];

test('first-touch and last-non-direct share one authoritative order total', () => {
  const first = attributeOrder(order, touches, 'first_touch');
  const last = attributeOrder(order, [...touches].reverse(), 'last_non_direct_touch');
  assert.equal(first.campaignId, 'fb');
  assert.equal(last.campaignId, 'gg');
  assert.equal(first.attributedRevenueVnd, 900000);
  assert.equal(last.attributedRevenueVnd, 900000);
  assert.equal(first.eligibleOrderRevenueVnd, last.eligibleOrderRevenueVnd);
  assert.equal(calculateRoas(first.attributedRevenueVnd, 300000), 3);
});

test('no verified journey yields unassigned or explicit unique coupon fallback', () => {
  assert.equal(attributeOrder({ ...order, verifiedVisitorId: null }, touches, 'first_touch').basis, 'unassigned');
  const coupon = attributeOrder({ ...order, verifiedVisitorId: null, verifiedCouponCampaignIds:['coupon-one'] }, touches, 'first_touch');
  assert.equal(coupon.basis, 'coupon_fallback');
  assert.equal(coupon.campaignId, 'coupon-one');
  assert.equal(attributeOrder({ ...order, verifiedVisitorId:null, verifiedCouponCampaignIds:['a','b'] }, touches, 'first_touch').basis, 'unassigned');
});

test('cross-site, cross-visitor and non-consented touches are ignored', () => {
  const invalid = touches.map((t) => ({ ...t, siteId:'other-site' }));
  assert.equal(attributeOrder(order, invalid, 'first_touch').basis, 'unassigned');
  assert.equal(attributeOrder(order, touches.map(t=>({ ...t, consented:false })), 'first_touch').basis, 'unassigned');
  assert.equal(attributeOrder(order, touches.map(t=>({ ...t, visitorId:'other' })), 'first_touch').basis, 'unassigned');
});

test('lookback boundaries inclusive and no future touch', () => {
  const boundary: Touchpoint[] = [
    { ...touches[0], occurredAt:'2026-09-29T12:00:00Z' },
    { ...touches[1], occurredAt:'2026-10-06T12:00:01Z' },
  ];
  assert.equal(attributeOrder(order, boundary, 'first_touch', 7).touchpointId, 't-facebook');
  assert.equal(attributeOrder(order, boundary, 'first_touch', 1).basis, 'unassigned');
});

test('direct fallback, pending and cancelled orders, refund-safe money', () => {
  const direct = attributeOrder(order, [touches[2]], 'last_non_direct_touch');
  assert.equal(direct.basis, 'direct');
  assert.equal(attributeOrder({...order,status:'cancelled'}, touches, 'first_touch').attributedRevenueVnd, 0);
  assert.equal(attributeOrder({...order,status:'partially_refunded',netRevenueVnd:450000}, touches,'first_touch').attributedRevenueVnd,450000);
  assert.throws(()=>attributeOrder({...order,netRevenueVnd:0.4}, touches,'first_touch'));
  assert.equal(calculateRoas(900000,0),null);
  assert.equal(calculateRoas(900000,null),null);
});

test('stable tie-breaker and out-of-order journeys', () => {
  const simultaneous = touches.slice(0,2).map((t,i)=>({...t,id: i===0?'z':'a',occurredAt:'2026-10-04T10:00:00Z'}));
  assert.equal(attributeOrder(order, simultaneous, 'first_touch').touchpointId,'a');
  assert.equal(attributeOrder(order, simultaneous, 'last_non_direct_touch').touchpointId,'z');
});
