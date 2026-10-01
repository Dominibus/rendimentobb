import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import {buildBrandedEmail,sendCheckedEmail} from '../lib/email-templates.js';
function harness(file,failRecipient=''){
 const stores=new Map(),sent=[];let sequence=0;
 const apply=(target,patch)=>{for(const [key,value] of Object.entries(patch)){const path=key.split('.');let obj=target;while(path.length>1){const k=path.shift();obj=obj[k]??=( {} );}obj[path[0]]=value;}};
 const collection=name=>{
  if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);
  const ref=id=>({id,get:async()=>({exists:store.has(id),data:()=>store.get(id)}),set:async(value,options)=>{if(options?.merge){const current=store.get(id)||{};apply(current,value);store.set(id,current);}else store.set(id,{...value});},update:async value=>{if(!store.has(id))throw Error('missing');apply(store.get(id),value);},delete:async()=>store.delete(id)});
  const query=(constraints=[],max=Infinity)=>({where:(key,op,value)=>query([...constraints,[key,value]],max),limit:n=>query(constraints,n),get:async()=>{const docs=[...store].filter(([,v])=>constraints.every(([k,x])=>v[k]===x)).slice(0,max).map(([id,v])=>({id,data:()=>v}));return {docs,empty:!docs.length};}});
  return {...query(),doc:ref,add:async data=>{const id=`mock-lead-${String(++sequence).padStart(12,'0')}`;store.set(id,{...data});return ref(id);}};
 };
 const db={collection,runTransaction:async fn=>fn({getAll:async(...refs)=>Promise.all(refs.map(r=>r.get())),get:r=>r.get(),set:(r,v)=>r.set(v),update:(r,v)=>r.update(v)})};
 const firestore=()=>db;firestore.FieldValue={serverTimestamp:()=>({seconds:1790848800,toDate:()=>new Date('2026-10-01T10:00:00Z')}),arrayUnion:(...items)=>items};
 const admin={apps:[{}],firestore,auth:()=>({verifyIdToken:async token=>token==='admin'?{uid:'admin-id',email:'rendimentobb@gmail.com',email_verified:true}:token==='unverified-admin'?{uid:'unverified-id',email:'rendimentobb@gmail.com',email_verified:false}:{uid:'user-id',email:'user@example.test'}})};
 class Resend{constructor(){this.emails={send:async(payload,options)=>{sent.push({payload,options});return payload.to?.includes(failRecipient)?{error:{message:'mock provider rejected'}}:{data:{id:`mail-${sent.length}`}};}}};}
 const ctx={admin,Resend,crypto,buildBrandedEmail,sendCheckedEmail,process:{env:{}},console:{error(){}},Buffer,Date,Intl,setTimeout};
 vm.createContext(ctx);let src=readFileSync(new URL('../'+file,import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export default async function handler','async function handler');vm.runInContext(src,ctx);
 const run=async(body,method='POST',token='')=>{const out={};const res={setHeader(){},status(code){out.status=code;return this;},json(data){out.body=data;return this;}};await ctx.handler({method,headers:{'accept-language':'it',authorization:token?`Bearer ${token}`:''},body,socket:{remoteAddress:'test'}},res);return out;};
 return {run,stores,sent,collection,ctx};
}
test('shared email is fluid table-based, escapes submitted content and supplies complete plain text',()=>{
 const mail=buildBrandedEmail({title:'<script>x</script>',intro:'Test',rows:[['Note','A & B\nsecond line']],ctaLabel:'Open',ctaURL:'javascript:alert(1)'});
 assert.ok(mail.html.includes('max-width:600px'));assert.ok(mail.html.includes('#087f5b'));assert.ok(mail.html.includes('&lt;script&gt;'));assert.ok(!mail.html.includes('href="javascript:'));assert.ok(mail.text.includes('A & B\nsecond line'));
});
test('resolved email provider error and absent accepted id both reject',async()=>{
 for(const result of [{error:{message:'rejected'}},{data:{}}])await assert.rejects(sendCheckedEmail({emails:{send:async()=>result}},{to:['test']}));
});
for(const type of ['analysis','mutui','immobili','partner','work','auth']){
 test(`lead ${type} sends separate exhaustive user and Italian admin confirmations`,async()=>{
  const h=harness('api/send-lead.js');const result=await h.run({type,email:'owner@example.test',name:'Domenico',city:'napoli',roi:-4.2,profit:-6678,price:530000,equity:159000,dscr:.94,years:20,rate:'3.5',role:'Gestore',message:'Note <script>',lang:'en',source:'test_form',requestId:`request-${type}`});
  assert.equal(result.status,200);assert.equal(result.body.leadSaved,true);assert.equal(h.sent.length,2);
  const user=h.sent[0].payload,adminMail=h.sent[1].payload;
  assert.deepEqual(Array.from(user.to),['owner@example.test']);assert.deepEqual(Array.from(adminMail.to),['rendimentobb@gmail.com']);assert.equal(adminMail.replyTo,'owner@example.test');
  assert.ok(user.html.includes('Note &lt;script&gt;'));assert.ok(adminMail.text.includes('test_form'));assert.ok(adminMail.html.includes('/dashboard-leads/'));
  if(type==='analysis'){assert.ok(user.text.includes('-€6,678.00')||user.text.includes('-€6,678'));assert.ok(adminMail.text.includes('-6.678,00'));assert.ok(adminMail.text.includes('0,94'));}
  assert.ok([...h.stores.get('leads').values()][0].emailDelivery.user.providerId);
 });
}
test('user mail rejection remains visible on saved lead while admin notification is attempted',async()=>{
 const h=harness('api/send-lead.js','owner@example.test');const r=await h.run({type:'immobili',email:'owner@example.test',city:'Roma'});
 assert.equal(r.status,200);assert.equal(r.body.leadSaved,true);assert.equal(r.body.emailDelivery.user.status,'failed');assert.equal(r.body.emailDelivery.admin.status,'accepted');assert.equal(h.sent.length,2);
});
test('admin PATCH persists only supported CRM fields; unauthenticated and normal users are refused',async()=>{
 const h=harness('api/delete-lead.js');const ref=await h.collection('leads').add({email:'lead@example.test',roi:12});
 for(const token of ['', 'user', 'unverified-admin']){const r=await h.run({leadId:ref.id,status:'won',adminNotes:'x'},'PATCH',token);assert.equal(r.status,token?403:401);}
 const bad=await h.run({leadId:ref.id,status:'owner',adminNotes:'x'},'PATCH','admin');assert.equal(bad.status,400);
 const good=await h.run({leadId:ref.id,status:'contacted',adminNotes:'Call tomorrow',roi:999},'PATCH','admin');assert.equal(good.status,200);
 const data=(await ref.get()).data();assert.equal(data.roi,12);assert.equal(data.status,'contacted');assert.equal(data.adminNotes,'Call tomorrow');
});

test('urgent host email identifies property, guest, stay and action; duplicate alert is suppressed',async()=>{
 const h=harness('api/work-email.js');
 await h.collection('bookings').doc('booking-urgent').set({uid:'user-id',propertyId:'property-1',guestName:'Mario Rossi',checkin:'2026-10-01',checkout:'2026-10-04',guestIssue:{active:true,priority:'urgent',status:'open',category:'access',note:'Key does not work'}});
 await h.collection('properties').doc('property-1').set({uid:'user-id',name:'Casa Roma'});
 await h.collection('users').doc('user-id').set({lang:'it'});
 const r=await h.run({bookingId:'booking-urgent'},'POST','user');assert.equal(r.status,200);assert.equal(r.body.sent,true);assert.equal(h.sent.length,1);
 const mail=h.sent[0].payload;assert.equal(mail.to[0],'user@example.test');assert.ok(mail.text.includes('Casa Roma'));assert.ok(mail.text.includes('Mario Rossi'));assert.ok(mail.text.includes('booking-urgent'));assert.ok(mail.html.includes('#087f5b'));
 const duplicate=await h.run({bookingId:'booking-urgent'},'POST','user');assert.equal(duplicate.body.duplicate,true);assert.equal(h.sent.length,1);
});
test('urgent host email honors ownership and notification preferences',async()=>{
 const h=harness('api/work-email.js');await h.collection('bookings').doc('booking-1').set({uid:'another-owner',guestIssue:{active:true,priority:'urgent'}});
 assert.equal((await h.run({bookingId:'booking-1'},'POST','user')).status,403);
 await h.collection('bookings').doc('booking-1').update({uid:'user-id'});await h.collection('users').doc('user-id').set({notificationPreferences:{pmsUrgentEmail:false}});
 assert.equal((await h.run({bookingId:'booking-1'},'POST','user')).body.reason,'preference_disabled');assert.equal(h.sent.length,0);
});

test('funnel provider rejection never marks the reminder as sent and releases the lock',async()=>{
 const h=harness('api/cron-funnel.js','owner@example.test');h.ctx.process.env.CRON_SECRET='mock-secret';
 await h.collection('email_funnel').doc('funnel-id').set({email:'owner@example.test',roi:10,city:'Roma',lang:'it',createdAt:{toMillis:()=>Date.now()-86400001},steps:[{type:'reminder_1',delay:0}],sentSteps:[]});
 const r=await h.run({},'GET','mock-secret');assert.equal(r.status,200);const data=(await h.collection('email_funnel').doc('funnel-id').get()).data();assert.equal(data.sentSteps.length,0);assert.equal(data.sending,false);assert.equal(data.lastError,'mock provider rejected');
});
test('successful funnel reminder is branded and cannot be sent again as the same step',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';
 await h.collection('email_funnel').doc('funnel-id').set({email:'owner@example.test',roi:10,city:'<b>Roma</b>',lang:'it',createdAt:{toMillis:()=>Date.now()-86400001},steps:[{type:'reminder_1',delay:0}],sentSteps:[]});
 await h.run({},'GET','mock-secret');assert.equal(h.sent.length,1);assert.ok(h.sent[0].payload.html.includes('&lt;b&gt;Roma'));assert.ok(h.sent[0].payload.html.includes('#087f5b'));
 await h.run({},'GET','mock-secret');assert.equal(h.sent.length,1);
});
