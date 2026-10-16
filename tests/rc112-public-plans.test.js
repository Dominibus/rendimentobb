import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getPlanForScope} from '../js/account-plan.js';
import {OFFERS, TERMS_VERSION, TRIAL_DAYS} from '../js/subscription-offer.js';
import {startAccountTrial} from '../lib/account-subscription-service.js';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';

test('activated trial expires at the exact boundary without deleting saved data or permitting another trial', async()=>{
 const now=Date.UTC(2026,9,13,8,21,36), end=now+TRIAL_DAYS*86400000;
 const db=new MemoryFirestore({'users/u1':{plan:'free'},'analyses/a1':{uid:'u1',city:'Roma'},'properties/p1':{uid:'u1',name:'Casa'}});
 const args={db,uid:'u1',email:'owner@example.test',emailVerified:true,liveMode:true,acceptedTerms:true,termsVersion:TERMS_VERSION,timestamp:ms=>({seconds:ms/1000}),now};
 await startAccountTrial(args);
 const profile=db.documents.get('users/u1');
 assert.equal(getPlanForScope(profile,false,end-1),'investor');
 assert.equal(getPlanForScope(profile,false,end),'free');
 assert.equal(getPlanForScope(profile,false,end+1),'free');
 assert.deepEqual(db.documents.get('analyses/a1'),{uid:'u1',city:'Roma'});
 assert.deepEqual(db.documents.get('properties/p1'),{uid:'u1',name:'Casa'});
 await assert.rejects(startAccountTrial({...args,now:end+1}),e=>e.code==='TRIAL_ALREADY_USED');
});

test('public plan information is static, bilingual, matches the offer and is linked outside trial gating',()=>{
 const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
 const page=read('plans.html'),home=read('index.html');
 for(const offer of Object.values(OFFERS)){
  assert.ok(page.includes(`${offer.amount} € / ${offer.interval==='year'?'anno':'mese'}`));
  assert.ok(page.includes(`€${offer.amount} / ${offer.interval==='year'?'year':'month'}`));
 }
 assert.ok(page.includes(TERMS_VERSION));
 assert.ok(page.includes('senza conversione automatica'));
 assert.ok(page.includes('no automatic conversion'));
 for(const target of ['terms.html','privacy.html','withdrawal.html']){
  assert.ok(page.includes(`href="/${target}"`));
  assert.ok(fs.existsSync(new URL('../'+target,import.meta.url)));
 }
 const publicLink=home.indexOf('href="/plans.html"');
 assert.ok(publicLink>0&&publicLink<home.indexOf('<aside class="rb-trial-invite"'));
 assert.ok(read('js/footer.js').includes('href="/plans.html"'));
 // Only the contextual trial CTA is gated; plan information remains public.
 assert.doesNotMatch(page,/<(?:main|article|section)[^>]*\bhidden\b/);
 assert.match(page,/data-rb-trial-invite hidden/);
});
