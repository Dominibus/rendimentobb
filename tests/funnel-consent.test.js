import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {hasFunnelConsent,createUnsubscribeToken,readUnsubscribeToken,funnelUnsubscribeURL,funnelConfirmationURL} from '../lib/funnel-consent.js';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
const secret='test-secret',consent={marketingConsent:true,consentConfirmed:true,consentVersion:'analysis-reminders-v1'};
test('consent requires explicit flags, confirmation and known version',()=>{
 assert.equal(hasFunnelConsent(consent),true);
 for(const row of [null,{}, {...consent,marketingConsent:'true'},{...consent,consentConfirmed:false},{...consent,consentVersion:'old'},{...consent,unsubscribed:true}])assert.equal(hasFunnelConsent(row),false);
});
test('signed preferences reject tampering, missing secrets and cross-action replay',()=>{
 const token=createUnsubscribeToken('record-1',secret);
 assert.equal(readUnsubscribeToken(token,secret),'record-1');
 for(const t of [token+'0',token.replace('record-1','record-2'),'bad',[],null])assert.equal(readUnsubscribeToken(t,secret),null);
 assert.equal(readUnsubscribeToken(token,'wrong'),null);assert.equal(readUnsubscribeToken(token,''),null);
 assert.equal(readUnsubscribeToken(token,secret,'confirm'),null);
 assert.equal(readUnsubscribeToken(createUnsubscribeToken('record-1',secret,'confirm'),secret),null);
 assert.ok(!funnelUnsubscribeURL('record-1',secret).includes('@'));assert.ok(funnelConfirmationURL('record-1',secret).includes('action=confirm'));
});
function setup(){
 const db=new MemoryFirestore({'email_funnel/record-1':{...consent},'users/host':{notificationPreferences:{pmsReminderEmail:true}}});
 const source=readFileSync(new URL('../api/email-unsubscribe.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export function createUnsubscribeHandler','function createUnsubscribeHandler').replace('export default createUnsubscribeHandler();','');
 const ctx={readUnsubscribeToken,process:{env:{}},admin:{},};vm.createContext(ctx);vm.runInContext(source,ctx);
 const handler=ctx.createUnsubscribeHandler({getDatabase:()=>db,getSecret:()=>secret,timestamp:()=> 'server-time'});
 const run=async(method,token,action)=>{const r={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},send(x){this.body=x;return this;},json(x){this.body=x;return this;}};await handler({method,query:{token,action}},r);return r;};return {db,run};
}
test('GET preferences is read-only, POST opt-out is idempotent and leaves PMS preferences intact',async()=>{
 const {db,run}=setup(),token=createUnsubscribeToken('record-1',secret);
 const get=await run('GET',token);assert.equal(get.code,200);assert.ok(get.body.includes('method="post"'));assert.equal(db.documents.get('email_funnel/record-1').marketingConsent,true);
 for(let i=0;i<2;i++)assert.equal((await run('POST',token)).code,200);
 assert.equal(db.documents.get('email_funnel/record-1').unsubscribed,true);assert.equal(db.documents.get('users/host').notificationPreferences.pmsReminderEmail,true);
});
test('confirmation requires its own token and explicit POST',async()=>{
 const {db,run}=setup();db.documents.set('email_funnel/record-1',{marketingConsent:true,consentConfirmed:false,consentVersion:'analysis-reminders-v1'});
 const token=createUnsubscribeToken('record-1',secret,'confirm');
 assert.equal((await run('GET',token,'confirm')).code,200);assert.equal(db.documents.get('email_funnel/record-1').consentConfirmed,false);
 assert.equal((await run('POST',token,'confirm')).code,200);assert.equal(hasFunnelConsent(db.documents.get('email_funnel/record-1')),true);
 assert.equal((await run('POST',token)).code,400);
 assert.equal((await run('DELETE',token,'confirm')).code,405);
});
