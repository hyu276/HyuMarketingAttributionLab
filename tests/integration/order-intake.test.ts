import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {and,eq} from 'drizzle-orm';
import {db} from '../../src/db/client.ts';
import {checkoutLinks,orders,sites,visitors,workspaces} from '../../src/db/schema.ts';
import {commitImport,previewImport} from '../../src/server/imports.ts';

test('Trusted CSV commit is idempotent, refunds update, and checkout token cannot replay',async()=>{
  const database=db();
  const [workspace]=await database.insert(workspaces).values({name:'CSV integration '+randomUUID()}).returning();
  const [site]=await database.insert(sites).values({workspaceId:workspace.id,name:'CSV site',
    publicKey:'site_'+randomUUID().replaceAll('-',''),domains:['localhost']}).returning();
  const [visitor]=await database.insert(visitors).values({siteId:site.id,anonId:randomUUID()}).returning();
  const token=randomUUID()+randomUUID();
  const [link]=await database.insert(checkoutLinks).values({
    siteId:site.id,visitorId:visitor.id,tokenHash:createHash('sha256').update(token).digest('hex'),
    expiresAt:new Date(Date.now()+900000),
  }).returning();
  const header='order_id,ordered_at,status,currency,gross_item_revenue,discount_amount,refunded_amount,checkout_token,discount_code';
  const row='ORD-'+randomUUID()+','+new Date().toISOString()+',paid,VND,1000000,100000,0,'+token+',';
  const csv=header+'\n'+row;
  const p=previewImport('orders',csv);assert.equal(p.valid,true);
  assert.deepEqual(await commitImport(site.id,'orders',csv,p.digest),{duplicate:false,count:1});
  assert.deepEqual(await commitImport(site.id,'orders',csv,p.digest),{duplicate:true,count:1});
  const record=(await database.select().from(orders).where(eq(orders.checkoutLinkId,link.id)))[0];
  assert.equal(record.net,900000);
  const changed=header+'\n'+row.replace('100000,0,','100000,450000,').replace(token,'');
  const c=previewImport('orders',changed);
  assert.equal(c.valid,true);
  await commitImport(site.id,'orders',changed,c.digest);
  const [updated]=await database.select().from(orders).where(and(eq(orders.id,record.id),eq(orders.siteId,site.id)));
  assert.equal(updated.net,450000);
  assert.equal(updated.checkoutLinkId,link.id);
  const otherCsv=header+'\n'+'ORD-REPLAY-'+randomUUID()+','+new Date().toISOString()+',paid,VND,100,0,0,'+token+',';
  const r=previewImport('orders',otherCsv);
  await assert.rejects(()=>commitImport(site.id,'orders',otherCsv,r.digest),/Checkout token invalid/);
});
