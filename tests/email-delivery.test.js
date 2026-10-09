import {scanFunnelDocuments} from '../lib/funnel-scan.js';
import {hasFunnelConsent,funnelUnsubscribeURL,funnelConfirmationURL} from "../lib/funnel-consent.js";
import {dispatchTaskNotification,urgentNotificationId} from '../lib/pms-notification-queue.js';
import {reconcilePMSTasks} from '../js/pms-tasks.js';
import {drainTaskNotifications} from '../lib/pms-notification-queue.js';
import {makeTaskNotification,taskNotificationId} from '../lib/pms-notification-queue.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import {buildBrandedEmail,sendCheckedEmail} from '../lib/email-templates.js';
function harness(file,failRecipient=''){
 const stores=new Map(),sent=[],logs=[];let sequence=0;
 const apply=(target,patch)=>{for(const [key,value] of Object.entries(patch)){const path=key.split('.');let obj=target;while(path.length>1){const k=path.shift();obj=obj[k]??=( {} );}obj[path[0]]=value;}};
 const collection=name=>{
  if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);
  const ref=id=>({id,get:async()=>({exists:store.has(id),data:()=>store.get(id)}),set:async(value,options)=>{if(options?.merge){const current=store.get(id)||{};apply(current,value);store.set(id,current);}else store.set(id,{...value});},update:async value=>{if(!store.has(id))throw Error('missing');apply(store.get(id),value);},delete:async()=>store.delete(id)});
  const query=(constraints=[],max=Infinity,cursor='',ordered=false)=>({where:(key,op,value)=>query([...constraints,[key,op,value]],max,cursor,ordered),orderBy:key=>query(constraints,max,cursor,key==='__name__'),startAfter:id=>query(constraints,max,id,ordered),limit:n=>query(constraints,n,cursor,ordered),get:async()=>{let rows=[...store].filter(([id,v])=>(!cursor || id>cursor) && constraints.every(([k,op,x])=>op==='=='?v[k]===x:typeof v[k]==='number' && v[k]<=x));if(ordered)rows.sort(([a],[b])=>a<b?-1:a>b?1:0);const docs=rows.slice(0,max).map(([id,v])=>({id,data:()=>v}));return {docs,empty:!docs.length};}});
  return {...query(),doc:ref,add:async data=>{const id=`mock-lead-${String(++sequence).padStart(12,'0')}`;store.set(id,{...data});return ref(id);}};
 };
 const db={collection,runTransaction:async fn=>fn({getAll:async(...refs)=>Promise.all(refs.map(r=>r.get())),get:r=>r.get(),set:(r,v)=>r.set(v),update:(r,v)=>r.update(v)})};
 const firestore=()=>db;firestore.FieldValue={serverTimestamp:()=>({seconds:1790848800,toDate:()=>new Date('2026-10-01T10:00:00Z')}),arrayUnion:(...items)=>items};
 const admin={apps:[{}],firestore,auth:()=>({getUser:async uid=>({uid,email:file==='api/work-email.js'?'user@example.test':'owner@example.test',emailVerified:true}),verifyIdToken:async token=>token==='admin'?{uid:'admin-id',email:'rendimentobb@gmail.com',email_verified:true}:token==='unverified-admin'?{uid:'unverified-id',email:'rendimentobb@gmail.com',email_verified:false}:{uid:'user-id',email:'user@example.test'}})};
 class Resend{constructor(){this.emails={send:async(payload,options)=>{sent.push({payload,options});return payload.to?.includes(failRecipient)?{error:{message:'mock provider rejected'}}:{data:{id:`mail-${sent.length}`}};}}};}
 const ctx={scanFunnelDocuments,hasFunnelConsent,funnelUnsubscribeURL,funnelConfirmationURL,queueDailyReminders:async()=>({checked:0,queued:0,errors:0}),dispatchTaskNotification,urgentNotificationId,reconcilePMSTasks,createHostBookingHandler:()=>()=>{throw Error("unexpected host operation");},drainTaskNotifications:options=>drainTaskNotifications({...options,pause:async()=>{}}),admin,Resend,crypto,buildBrandedEmail,sendCheckedEmail,process:{env:{}},console:{error:(...args)=>logs.push(args),info:(...args)=>logs.push(args)},Buffer,Date,Intl,setTimeout};
 vm.createContext(ctx);if(file==='api/work-email.js'||file==='api/guest-report.js'){const shared=readFileSync(new URL('../lib/pms-urgent-email.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export async function','async function');vm.runInContext(shared,ctx);}let src=readFileSync(new URL('../'+file,import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export default async function handler','async function handler');vm.runInContext(src,ctx);
 const run=async(body,method='POST',token='')=>{const out={};const res={setHeader(){},status(code){out.status=code;return this;},json(data){out.body=data;return this;}};await ctx.handler({method,headers:{'accept-language':'it',authorization:token?`Bearer ${token}`:''},body,socket:{remoteAddress:'test'}},res);return out;};
 return {run,stores,sent,logs,collection,ctx,setRejectedRecipient:value=>{failRecipient=value;}};
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
 await h.collection('users').doc('user-id').set({lang:'it',plan:'pro'});
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
 await h.collection('email_funnel').doc('funnel-id').set({marketingConsent:true,consentConfirmed:true,consentVersion:'analysis-reminders-v1',email:'owner@example.test',roi:10,city:'Roma',lang:'it',createdAt:{toMillis:()=>Date.now()-86400001},steps:[{type:'reminder_1',delay:0}],sentSteps:[]});
 const r=await h.run({},'GET','mock-secret');assert.equal(r.status,503);assert.equal(r.body.funnel.errors,1);const data=(await h.collection('email_funnel').doc('funnel-id').get()).data();assert.equal(data.sentSteps.length,0);assert.equal(data.sending,false);assert.equal(data.lastError,'mock provider rejected');
});
test('successful funnel reminder is branded and cannot be sent again as the same step',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';
 await h.collection('email_funnel').doc('funnel-id').set({marketingConsent:true,consentConfirmed:true,consentVersion:'analysis-reminders-v1',email:'owner@example.test',roi:10,city:'<b>Roma</b>',lang:'it',createdAt:{toMillis:()=>Date.now()-86400001},steps:[{type:'reminder_1',delay:0}],sentSteps:[]});
 await h.run({},'GET','mock-secret');assert.equal(h.sent.length,1);assert.ok(h.sent[0].payload.html.includes('&lt;b&gt;Roma'));assert.ok(h.sent[0].payload.html.includes('#087f5b'));
 await h.run({},'GET','mock-secret');assert.equal(h.sent.length,1);
});

function seedQueuedCronMail(h){
 const uid='user-id',email='owner@example.test',event={id:'c'.repeat(64)+'.documents.in_progress',code:'documents',status:'in_progress',actor:{uid,name:'Owner'},at:new Date().toISOString()};
 const booking={uid,propertyId:'pms-property',guestName:'Mario',checkin:'2026-10-10',checkout:'2026-10-12',status:'arrival'};
 const id=taskNotificationId(uid,event.id);
 const rows={'users':{[uid]:{plan:'pro',notificationPreferences:{pmsTaskEmail:true}}},'bookings':{'pms-booking':booking},'properties':{'pms-property':{uid,name:'Home'}},'_pms_notifications':{[id]:makeTaskNotification({uid,bookingId:'pms-booking',booking,event,propertyName:'Home',recipient:email,lang:'it',sandbox:false,now:Date.now()-1000,timestamp:()=> 'time'})}};
 for(const [collection,docs] of Object.entries(rows))h.stores.set(collection,new Map(Object.entries(docs)));
 return id;
}
test('cron endpoint requires its secret before touching the PMS queue',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';seedQueuedCronMail(h);
 for(const token of ['', 'wrong-secret'])assert.equal((await h.run({},'GET',token)).status,401);
 assert.equal(h.sent.length,0);assert.equal((await h.run({},'POST','mock-secret')).status,405);
});
test('authenticated cron drains durable PMS notifications and records safe job counters',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';const id=seedQueuedCronMail(h);
 const r=await h.run({},'GET','mock-secret');assert.equal(r.status,200);assert.equal(r.body.pmsNotifications.sent,1);
 assert.equal(h.stores.get('_pms_notifications').get(id).status,'sent');assert.equal(h.stores.get('_pms_jobs').get('task_notifications').sent,1);
 await h.run({},'GET','mock-secret');assert.equal(h.sent.length,1);
});
test('PMS recovery error is visible but does not prevent the existing funnel from running',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';h.ctx.drainTaskNotifications=async()=>{throw Error('database unavailable');};
 await h.collection('email_funnel').doc('funnel-id').set({marketingConsent:true,consentConfirmed:true,consentVersion:'analysis-reminders-v1',email:'owner@example.test',roi:10,city:'Roma',lang:'it',createdAt:{toMillis:()=>Date.now()-86400001},steps:[{type:'reminder_1',delay:0}],sentSteps:[]});
 const r=await h.run({},'GET','mock-secret');assert.equal(r.status,503);assert.equal(r.body.error,'pms_recovery_failed');assert.equal(h.sent.length,1);
});

async function seedPublicUrgent(h){
 await h.collection('users').doc('user-id').set({plan:'pro'});
 await h.collection('properties').doc('property-1').set({uid:'user-id',name:'Residenza'});
 const token='a'.repeat(64);
 await h.collection('bookings').doc('booking-public').set({uid:'user-id',propertyId:'property-1',guestName:'Mario',status:'checkin',checkin:'2026-10-05',checkout:'2026-10-06',guestPortal:{enabled:true,tokenHash:crypto.createHash('sha256').update(token).digest('hex'),expiresAt:'2099-01-01T00:00:00Z'}});
 return {action:'submit',bookingId:'booking-public',token,category:'maintenance',priority:'urgent',note:'Test public urgent air conditioning'};
}
test('public report delivers through the real shared urgent service and subsequent host send is deduplicated',async()=>{
 const h=harness('api/guest-report.js'),body=await seedPublicUrgent(h);
 const result=await h.run(body);assert.equal(result.status,201);assert.equal(h.sent.length,1);assert.equal(h.sent[0].payload.to[0],'owner@example.test');assert.ok(h.sent[0].payload.text.includes(body.note));
 const duplicate=await h.ctx.sendUrgentHostNotification({db:h.ctx.admin.firestore(),resend:new h.ctx.Resend(),decoded:{uid:'user-id',email:'owner@example.test'},body:{bookingId:body.bookingId},getAuthUser:uid=>h.ctx.admin.auth().getUser(uid),timestamp:()=> 'time'});
 assert.equal(duplicate.duplicate,true);assert.equal(h.sent.length,1);
});
test('public urgent service honors disabled preference and records rejection without failing the report',async()=>{
 const disabled=harness('api/guest-report.js'),body=await seedPublicUrgent(disabled);await disabled.collection('users').doc('user-id').set({notificationPreferences:{pmsUrgentEmail:false}});
 assert.equal((await disabled.run(body)).status,201);assert.equal(disabled.sent.length,0);
 const failed=harness('api/guest-report.js','owner@example.test');await seedPublicUrgent(failed);assert.equal((await failed.run(body)).status,201);assert.equal(failed.sent.length,1);assert.equal([...failed.stores.get('_pms_notifications').values()][0].status,'retry');assert.equal((await failed.collection('bookings').doc(body.bookingId).get()).data().guestIssue.status,'open');
});

test('cron recovers rejected urgent email with immutable payload and SDK idempotency header',async()=>{
 const h=harness('api/guest-report.js','owner@example.test'),body=await seedPublicUrgent(h);await h.run(body);
 const id=[...h.stores.get('_pms_notifications').keys()][0],row=h.stores.get('_pms_notifications').get(id);assert.equal(row.status,'retry');
 await h.collection('bookings').doc(body.bookingId).update({guestName:'Updated later'});h.setRejectedRecipient('');
 const stats=await drainTaskNotifications({db:h.ctx.admin.firestore(),resend:new h.ctx.Resend(),getAuthUser:uid=>h.ctx.admin.auth().getUser(uid),timestamp:()=> 'time',now:Date.now()+16*60*1000,pause:async()=>{}});
 assert.equal(stats.sent,1);assert.equal(h.sent.length,2);assert.deepEqual(h.sent[1].payload,h.sent[0].payload);assert.equal(h.sent[1].options.headers.get('Idempotency-Key'),`rb-pms-${id}`);assert.equal(h.stores.get('_pms_notifications').get(id).status,'sent');
 const again=await drainTaskNotifications({db:h.ctx.admin.firestore(),resend:new h.ctx.Resend(),getAuthUser:uid=>h.ctx.admin.auth().getUser(uid),timestamp:()=> 'time',now:Date.now()+17*60*1000,pause:async()=>{}});assert.equal(again.sent,0);assert.equal(h.sent.length,2);
});
for(const change of ['resolved','preference_disabled','new_issue'])test(`urgent recovery suppresses stale alert: ${change}`,async()=>{
 const h=harness('api/guest-report.js','owner@example.test'),body=await seedPublicUrgent(h);await h.run(body);h.setRejectedRecipient('');
 if(change==='preference_disabled')await h.collection('users').doc('user-id').update({notificationPreferences:{pmsUrgentEmail:false}});
 else {const booking=(await h.collection('bookings').doc(body.bookingId).get()).data();await h.collection('bookings').doc(body.bookingId).update({guestIssue:{...booking.guestIssue,...(change==='resolved'?{status:'resolved'}:{note:'Another newly reported issue'})}});}
 const stats=await drainTaskNotifications({db:h.ctx.admin.firestore(),resend:new h.ctx.Resend(),getAuthUser:uid=>h.ctx.admin.auth().getUser(uid),timestamp:()=> 'time',now:Date.now()+16*60*1000,pause:async()=>{}});assert.equal(stats.suppressed,1);assert.equal(h.sent.length,1);
});
test('legacy urgent sent records prevent resend after queue upgrade',async()=>{
 const h=harness('api/guest-report.js'),body=await seedPublicUrgent(h),id=urgentNotificationId(body.bookingId,body);await h.collection('_pms_notifications').doc(id).set({type:'guest_issue_urgent',status:'sent',uid:'user-id'});await h.run(body);assert.equal(h.sent.length,0);assert.equal(h.stores.get('_pms_notifications').get(id).status,'sent');
});

test('uncertain urgent delivery beyond safe idempotency window requires review without another send',async()=>{
 const h=harness('api/guest-report.js','owner@example.test'),body=await seedPublicUrgent(h);await h.run(body);const id=[...h.stores.get('_pms_notifications').keys()][0];await h.collection('_pms_notifications').doc(id).update({uncertain:true});h.setRejectedRecipient('');
 const stats=await drainTaskNotifications({db:h.ctx.admin.firestore(),resend:new h.ctx.Resend(),getAuthUser:uid=>h.ctx.admin.auth().getUser(uid),timestamp:()=> 'time',now:Date.now()+24*60*60*1000,pause:async()=>{}});assert.equal(stats.manualReview,1);assert.equal(h.sent.length,1);
});
test('legacy failed urgent delivery is not replayed with a potentially unsafe new provider request',async()=>{
 const h=harness('api/guest-report.js'),body=await seedPublicUrgent(h),id=urgentNotificationId(body.bookingId,body);await h.collection('_pms_notifications').doc(id).set({type:'guest_issue_urgent',status:'failed',uid:'user-id'});await h.run(body);assert.equal(h.sent.length,0);assert.equal(h.stores.get('_pms_notifications').get(id).status,'manual_review');
});

test('analysis email without optional consent does not enter a reminder funnel',async()=>{
 const h=harness('api/send-lead.js');h.ctx.process.env.CRON_SECRET='mock-secret';
 const r=await h.run({email:'user@example.test',type:'analysis',roi:20,price:150000,equity:30000});
 assert.equal(r.status,200);assert.equal(h.stores.get('email_funnel')?.size || 0,0);assert.ok(h.sent.length>0);
});
test('optional consent queues an unconfirmed record and a recipient confirmation link',async()=>{
 const h=harness('api/send-lead.js');h.ctx.process.env.CRON_SECRET='mock-secret';
 const r=await h.run({email:'user@example.test',type:'analysis',roi:20,marketingConsent:true});
 assert.equal(r.status,200);const records=[...h.stores.get('email_funnel').values()];assert.equal(records.length,1);
 assert.equal(records[0].consentConfirmed,false);assert.equal(hasFunnelConsent(records[0]),false);
 assert.ok(h.sent.some(x=>x.payload.html.includes('action=confirm')));
});
test('cron suppresses legacy, unconfirmed and revoked commercial funnels',async()=>{
 for(const consent of [{},{marketingConsent:true,consentConfirmed:false,consentVersion:'analysis-reminders-v1'},{marketingConsent:true,consentConfirmed:true,consentVersion:'analysis-reminders-v1',unsubscribed:true}]){
  const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';
  await h.collection('email_funnel').doc('legacy').set({...consent,email:'owner@example.test',roi:20,createdAt:{toMillis:()=>Date.now()-86400001},steps:[{type:'reminder_1',delay:0}],sentSteps:[]});
  assert.equal((await h.run({},'GET','mock-secret')).status,200);assert.equal(h.sent.length,0);
 }
});
test('confirmed reminders carry signed opt-out in HTML, text and provider header',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';
 await h.collection('email_funnel').doc('confirmed').set({marketingConsent:true,consentConfirmed:true,consentVersion:'analysis-reminders-v1',email:'owner@example.test',roi:20,createdAt:{toMillis:()=>Date.now()-86400001},steps:[{type:'reminder_1',delay:0}],sentSteps:[]});
 await h.run({},'GET','mock-secret');assert.equal(h.sent.length,1);
 const mail=h.sent[0].payload;assert.ok(mail.headers['List-Unsubscribe'].includes('send-followup?token='));assert.ok(mail.html.includes('Interrompi i promemoria'));assert.ok(mail.text.includes('send-followup?token='));
});

test('ambiguous funnel attempts older than the safe window require review without another send',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';
 await h.collection('email_funnel').doc('old-attempt').set({marketingConsent:true,consentConfirmed:true,consentVersion:'analysis-reminders-v1',email:'owner@example.test',roi:20,createdAt:{toMillis:()=>Date.now()-86400001},steps:[{type:'reminder_1',delay:0}],sentSteps:[],deliveryAttempts:{0:{firstAt:Date.now()-86400001}}});
 const r=await h.run({},'GET','mock-secret');assert.equal(h.sent.length,0);assert.equal(r.body.funnel.manualReview,1);
 assert.equal((await h.collection('email_funnel').doc('old-attempt').get()).data().manualReview,true);
});

test('preview cron cannot send email or change production queue records',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';h.ctx.process.env.VERCEL_ENV='preview';
 const r=await h.run({},'GET','mock-secret');assert.equal(r.status,200);assert.equal(r.body.reason,'production_only');assert.equal(h.sent.length,0);assert.equal(h.stores.size,0);
});

test('reusing a public request ID for another email does not expose delivery metadata',async()=>{
 const h=harness('api/send-lead.js');await h.run({email:'first@example.test',type:'analysis',requestId:'same-public-request'});
 const count=h.sent.length;const r=await h.run({email:'second@example.test',type:'analysis',requestId:'same-public-request'});
 assert.equal(r.status,409);assert.equal(r.body.error,'request_id_conflict');assert.equal(r.body.emailDelivery,undefined);assert.equal(h.sent.length,count);
});


test('cron initializes only after authorization and reports missing configuration safely',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.admin.apps=[];
 h.ctx.process.env.CRON_SECRET='private-secret';
 assert.equal((await h.run({},'GET','wrong')).status,401);
 assert.equal(h.logs.length,0);assert.equal(h.stores.size,0);
 const r=await h.run({},'GET','private-secret');
 assert.equal(r.status,500);assert.equal(r.body.error,'cron_configuration_missing');
 assert.equal(typeof r.body.runId,'string');assert.equal(h.sent.length,0);
 assert.equal(h.logs[0][0],'RB_CRON_START');assert.equal(h.logs[1][0],'RB_CRON_FAILED');
 assert.equal(h.logs[1][1].phase,'initialization');
 assert.ok(!JSON.stringify(h.logs).includes('private-secret'));
});
test('successful empty cron has correlated start/completion logs with safe zero counters',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';
 const r=await h.run({},'GET','mock-secret');assert.equal(r.status,200);
 const start=h.logs.find(row=>row[0]==='RB_CRON_START')[1];
 const complete=h.logs.find(row=>row[0]==='RB_CRON_COMPLETE')[1];
 assert.equal(start.runId,complete.runId);assert.equal(complete.funnel.sent,0);
 assert.equal(complete.success,true);assert.equal(complete.pms.sent,0);
});
test('cron failure log identifies its phase without leaking the database error message',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';
 const original=h.ctx.admin.firestore;
 h.ctx.admin.firestore=()=>({collection:()=>{throw Error('sensitive@example.test private-key');}});
 h.ctx.admin.firestore.FieldValue=original.FieldValue;
 const r=await h.run({},'GET','mock-secret');assert.equal(r.status,500);
 const failure=h.logs.find(row=>row[0]==='RB_CRON_FAILED')[1];
 assert.equal(failure.phase,'analysis_reminders');assert.equal(failure.error,'cron_error');
 assert.ok(!JSON.stringify(h.logs).includes('sensitive@example.test'));
});

test('cron reads beyond a full funnel page and resets its cursor after a complete scan',async()=>{
 const h=harness('api/cron-funnel.js');h.ctx.process.env.CRON_SECRET='mock-secret';
 for(let i=0;i<105;i++)await h.collection('email_funnel').doc('record-'+String(i).padStart(3,'0')).set({});
 const result=await h.run({},'GET','mock-secret');
 assert.equal(result.status,200);assert.equal(result.body.funnel.checked,105);
 assert.equal(result.body.funnel.pages,2);assert.equal(result.body.funnel.hasMore,false);
 assert.equal(h.stores.get('_pms_jobs').get('analysis_reminders').cursor,'');
});
