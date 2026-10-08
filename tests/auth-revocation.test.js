import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
for (const file of ['delete-lead.js','create-checkout-session.js']) {
  test(`${file}: revoked or disabled accounts cannot reach a write or checkout`, async () => {
    const source = readFileSync(new URL(`../api/${file}`,import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export default async function handler','async function handler');
    for (const code of ['auth/id-token-revoked','auth/user-disabled']) {
      let verified = 0;
      const admin = { apps:[{}], auth:() => ({verifyIdToken:async (token,revocationCheck) => {
        assert.equal(token,'blocked-token'); assert.equal(revocationCheck,true); verified++;
        throw Object.assign(new Error('blocked'),{code});
      }}), firestore:() => ({collection() { throw new Error('Unexpected database write/read'); }}) };
      const context = {admin, Stripe:class {}, getStripePrices:() => ({pro:'price-pro'}), process:{env:{STRIPE_SECRET_KEY:'sk_test_placeholder'}}, guardedCheckout:() => { throw new Error('Unexpected checkout'); }, CheckoutConflict:class extends Error {}};
      vm.createContext(context); vm.runInContext(source,context);
      const res = {setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
      await context.handler({method:file==='delete-lead.js'?'DELETE':'POST',headers:{authorization:'Bearer blocked-token'},body:{plan:'pro',leadId:'abcdefghijk'}},res);
      assert.equal(verified,1); assert.equal(res.code,401);
    }
  });
}
