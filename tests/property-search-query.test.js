import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/property-search.js';
async function query(params, method = 'GET') {
  const response = { code: 200, headers: {}, setHeader(k,v) { this.headers[k] = v; }, status(code) { this.code=code; return this; }, json(body) { this.body=body; return this; } };
  await handler({ method, query: params }, response); return response;
}
test('property search rejects repeated, nonfinite and out-of-range parameters', async () => {
  for (const params of [{city:['roma','napoli']}, {city:'unknown'}, {budget:'Infinity'}, {budget:'0'}, {budget:'100000001'}, {sqm:'NaN'}, {sqm:'-1'}, {sqm:'10001'}, {goal:'anything'}]) assert.equal((await query(params)).code, 400, JSON.stringify(params));
  assert.equal((await query({}, 'POST')).code, 405);
});
test('property search remains explicitly illustrative and never impersonates live listings', async () => {
  const result = await query({city:'roma', budget:'200000', sqm:'60', goal:'roi'});
  assert.equal(result.code,200); assert.equal(result.headers['Cache-Control'],'no-store');
  assert.equal(result.body.dataType,'indicative-scenarios');
  assert.doesNotMatch(JSON.stringify(result.body), /immobiliare\.it|idealista\.it/);
});
