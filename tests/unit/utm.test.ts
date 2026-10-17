import test from 'node:test';
import assert from 'node:assert/strict';
import {buildUtmUrl,normalizeUtm} from '../../src/domain/utm.ts';
const f={source:'Facebook',medium:'Paid Social',campaign:'Autumn Laptop 2026',id:'c001'};
test('normalizes UTM and preserves existing unrelated queries and fragments',()=>{
  const u=new URL(buildUtmUrl('https://shop.example.com/p?product=x#details',f));
  assert.equal(u.searchParams.get('product'),'x');
  assert.equal(u.searchParams.get('utm_medium'),'paid_social');
  assert.equal(u.hash,'#details');
});
test('does not silently replace existing incompatible UTM',()=>{
  assert.throws(()=>buildUtmUrl('https://site.test/?utm_source=google',f),/confirm replacement/);
  assert.equal(new URL(buildUtmUrl('https://site.test/?utm_source=google',f,true)).searchParams.get('utm_source'),'facebook');
});
test('blocks unsafe protocols, credentials and empty names',()=>{
  assert.throws(()=>buildUtmUrl('javascript:alert(1)',f));
  assert.throws(()=>buildUtmUrl('http://evil.test',f));
  assert.throws(()=>buildUtmUrl('https://alice:password@shop.example.com',f));
  assert.throws(()=>buildUtmUrl('https://site.test',{...f,source:'!!'}));
  assert.ok(buildUtmUrl('http://localhost:3000',f).startsWith('http://localhost:3000/'));
  assert.equal(normalizeUtm('  Google  Search  '),'google_search');
});
