import test from 'node:test';
import assert from 'node:assert/strict';
import { previewImport } from '../../src/server/imports.ts';
import { reportCsv, safeCsvCell } from '../../src/server/reporting.ts';

const orders = [
  'order_id,ordered_at,status,currency,gross_item_revenue,discount_amount,refunded_amount,checkout_token,discount_code',
  'ORDER-1,2026-10-06T12:00:00Z,paid,VND,1000000,100000,0,,',
].join('\n');
test('valid order CSV previews with stable hash',()=>{
  const a=previewImport('orders',orders),b=previewImport('orders',orders);
  assert.equal(a.valid,true);assert.equal(a.count,1);assert.equal(a.digest,b.digest);
});
test('duplicate IDs or negative net values are rejected before commit',()=>{
  const duplicate=orders+'\nORDER-1,2026-10-06T12:00:00Z,paid,VND,1000000,0,0,,';
  assert.equal(previewImport('orders',duplicate).valid,false);
  const overRefund=orders.replace('1000000,100000,0','1000000,100000,900001');
  assert.equal(previewImport('orders',overRefund).valid,false);
});
test('spend CSV checks campaign ID and integer amount',()=>{
  const csv='row_key,campaign_id,spend_date,currency,amount\nrow1,not-a-uuid,2026-10-06,VND,42';
  assert.equal(previewImport('spend',csv).valid,false);
});
test('CSV output neutralizes spreadsheet formulas',()=>{
  assert.equal(safeCsvCell('=2+3'),'"\'=2+3"');
  const csv=reportCsv([{orderId:'=HYPERLINK("danger")',netRevenueVnd:900000}]);
  assert.ok(csv.includes("'=HYPERLINK"));
});
