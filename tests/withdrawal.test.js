import test from 'node:test';
import assert from 'node:assert/strict';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
import {normalizeWithdrawal,submitWithdrawal,withdrawalReceipt} from '../lib/withdrawal-service.js';
import {TERMS_VERSION} from '../js/subscription-offer.js';
import {CONTRACT_TERMS} from '../js/contract-terms.js';
const body={name:'Mario Rossi',email:'mario@example.test',contract:'Investor, purchased 2026-10-10, account mario@example.test',requestId:'c41b6aaa-6608-42ca-91f5-aaa111222333',confirmed:true,lang:'it'};
function provider(fail=false){const sent=[];return {sent,emails:{send:async(mail,options)=>{sent.push({mail,options});return fail?{error:{message:'offline'}}:{data:{id:'mail-'+sent.length}};}}};}
test('withdrawal requires explicit confirmation, usable identifiers and bounded request id',()=>{
 for(const value of [{...body,confirmed:false},{...body,email:'bad'},{...body,contract:''},{...body,requestId:'bad'},{...body,website:'bot'}])assert.throws(()=>normalizeWithdrawal(value));
 assert.equal(normalizeWithdrawal({...body,email:'MARIO@example.test'}).email,'mario@example.test');
});
test('durable receipt and operator notice are idempotent, preserving the first timestamp',async()=>{
 const db=new MemoryFirestore(),resend=provider();const first=await submitWithdrawal({db,resend,body,now:100000});
 assert.equal(first.receiptEmail,'accepted_by_provider');assert.equal(first.operatorNotification,'accepted_by_provider');assert.equal(resend.sent.length,2);
 const again=await submitWithdrawal({db,resend,body,now:200000});assert.equal(first.id,again.id);assert.equal(first.receivedAt,again.receivedAt);assert.equal(resend.sent.length,2);
 const saved=(await db.collection('_withdrawal_requests').doc(first.id).get()).data();assert.equal(saved.receiptProviderId,'mail-1');assert.equal(saved.emailPending,false);
 assert.equal([...db.documents].length,1);assert.match(first.receiptText,/Mario Rossi/);
});
test('email outage preserves statement and retries the same receipt without duplicate records',async()=>{
 const db=new MemoryFirestore(),failed=provider(true);const first=await submitWithdrawal({db,resend:failed,body,now:100000});assert.equal(first.success,true);assert.equal(first.receiptEmail,'pending');
 const recovered=provider();const retry=await submitWithdrawal({db,resend:recovered,body,now:200000});assert.equal(retry.receivedAt,first.receivedAt);assert.equal(retry.receiptEmail,'accepted_by_provider');assert.equal(db.documents.size,1);
 assert.equal(failed.sent[0].options.idempotencyKey,recovered.sent[0].options.idempotencyKey);
});
test('concurrent repeated declarations send one email per recipient',async()=>{
 const db=new MemoryFirestore(),resend=provider();const values=await Promise.all([1,2,3].map(()=>submitWithdrawal({db,resend,body})));assert.equal(new Set(values.map(v=>v.id)).size,1);assert.equal(resend.sent.length,2);
});
test('changed payload cannot overwrite an existing declaration and failed persistence sends no emails',async()=>{
 const db=new MemoryFirestore(),resend=provider();await submitWithdrawal({db,resend,body});
 await assert.rejects(submitWithdrawal({db,resend,body:{...body,name:'Other user'}}),{code:'WITHDRAWAL_CONFLICT'});assert.equal(resend.sent.length,2);
 await assert.rejects(submitWithdrawal({db:{collection:()=>({doc:()=>({})}),runTransaction:async()=>{throw Error('offline');}},resend,body}));assert.equal(resend.sent.length,2);
});
test('receipt escapes submitted HTML and current contract snapshot includes the new online process',()=>{
 const mail=withdrawalReceipt({...body,id:'test',receivedAt:'2026-10-11',name:'<script>alert(1)</script>'});assert.ok(!mail.html.includes('<script>'));assert.match(mail.text,/<script>/);
 assert.equal(TERMS_VERSION,CONTRACT_TERMS.version);assert.ok(CONTRACT_TERMS.terms.some(p=>p.it.includes('Conferma recesso')&&p.en.includes('Confirm withdrawal')));
});
