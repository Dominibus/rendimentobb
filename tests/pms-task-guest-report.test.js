import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {MemoryFirestore} from './helpers/pms-memory-firestore.js';
import {reconcilePMSTasks} from '../js/pms-tasks.js';
const token='a'.repeat(64),id='booking123';
const base={uid:'u1',propertyId:'p1',guestName:'Test Guest',status:'checkin',guests:1,checkin:'2026-10-04',checkout:'2026-10-06',_pmsVersion:2,guestPortal:{enabled:true,tokenHash:crypto.createHash('sha256').update(token).digest('hex'),expiresAt:'2099-01-01T00:00:00Z'},guestIssue:{active:true,status:'open',priority:'medium',note:'Old issue'}};
function runtime({emailVerified=true,disabled=false,failEmail=false}={}){
 const notifications=[];
 const tasks=reconcilePMSTasks(base,{},'before');tasks.issue.status='in_progress';
 const db=new MemoryFirestore({[`bookings/${id}`]:{...base,autopilotTasks:tasks}});
 const admin={apps:[{}],firestore:()=>db,auth:()=>({getUser:async uid=>({uid,email:'owner@example.test',emailVerified,disabled})})};admin.firestore.FieldValue={serverTimestamp:()=> 'server-time'};
 const ctx={Resend:class {},sendUrgentHostNotification:async options=>{assert.equal(db.documents.get(`bookings/${id}`).guestIssue.source,'guest_portal');notifications.push(options);if(failEmail)throw Error('Provider unavailable');return {sent:true};},crypto,admin,reconcilePMSTasks,Buffer,Date,process:{env:{}},console:{error:()=>{}},createHostBookingHandler:()=>()=>{throw Error('unexpected host operation');}};vm.createContext(ctx);
 const source=readFileSync(new URL('../api/guest-report.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export default async function handler','async function handler');vm.runInContext(source,ctx);
 const response={setHeader(){},status(value){this.statusCode=value;return this;},json(value){this.body=value;return this;}};
 return {db,ctx,response,notifications};
}
test('new public guest issue persists task reopening and booking revision together',async()=>{
 const {db,ctx,response}=runtime();await ctx.handler({method:'POST',body:{action:'submit',bookingId:id,token,category:'maintenance',priority:'urgent',note:'New urgent guest report'}},response);
 assert.equal(response.statusCode,201);const row=db.documents.get(`bookings/${id}`);assert.equal(row._pmsVersion,3);assert.equal(row.autopilotTasks.issue.status,'open');assert.equal(row.autopilotTasks.issue.priority,0);assert.equal(row.guestIssue.source,'guest_portal');
});
test('public guest context remains readable without returning internal task state',async()=>{
 const {ctx,response}=runtime();await ctx.handler({method:'POST',body:{action:'context',bookingId:id,token}},response);assert.equal(response.statusCode,200);assert.equal(response.body.booking.guestFirstName,'Test');assert.equal(response.body.booking.autopilotTasks,undefined);
});
test('invalid guest link cannot mutate tasks or booking revision',async()=>{
 const {db,ctx,response}=runtime();await ctx.handler({method:'POST',body:{action:'submit',bookingId:id,token:'b'.repeat(64),category:'maintenance',priority:'urgent',note:'Invalid link report'}},response);assert.equal(response.statusCode,404);assert.equal(db.documents.get(`bookings/${id}`)._pmsVersion,2);
});
test('guest report rate limit preserves first task and avoids repeated reports',async()=>{
 const {db,ctx}=runtime(),body={action:'submit',bookingId:id,token,category:'maintenance',priority:'urgent',note:'New urgent guest report'};const makeResponse=()=>({setHeader(){},status(value){this.statusCode=value;return this;},json(value){this.body=value;return this;}});
 const first=makeResponse(),second=makeResponse();await ctx.handler({method:'POST',body},first);await ctx.handler({method:'POST',body},second);assert.equal(first.statusCode,201);assert.equal(second.statusCode,429);assert.equal(db.documents.get(`bookings/${id}`)._pmsVersion,3);
});

const submit=(ctx,response,priority='urgent',extra={})=>ctx.handler({method:'POST',body:{action:'submit',bookingId:id,token,category:'maintenance',priority,note:'New urgent guest report',...extra}},response);
test('public urgent report notifies the verified booking owner after commit, ignoring supplied recipient',async()=>{
 const {ctx,response,notifications}=runtime();await submit(ctx,response,'urgent',{email:'attacker@example.test',uid:'attacker',lang:'en'});
 assert.equal(response.statusCode,201);assert.equal(notifications.length,1);assert.equal(notifications[0].decoded.uid,'u1');assert.equal(notifications[0].decoded.email,'owner@example.test');assert.equal(notifications[0].body.bookingId,id);assert.equal(notifications[0].body.lang,'en');
});
test('public ordinary report does not invoke urgent mail',async()=>{
 const {ctx,response,notifications}=runtime();await submit(ctx,response,'medium');assert.equal(response.statusCode,201);assert.equal(notifications.length,0);
});
test('email failure preserves a successful saved guest report',async()=>{
 const {ctx,response,db,notifications}=runtime({failEmail:true});await submit(ctx,response);assert.equal(response.statusCode,201);assert.equal(notifications.length,1);assert.equal(db.documents.get(`bookings/${id}`).guestIssue.status,'open');
});
for(const options of [{emailVerified:false},{disabled:true}])test(`public report does not email unavailable owner ${JSON.stringify(options)}`,async()=>{
 const {ctx,response,notifications}=runtime(options);await submit(ctx,response);assert.equal(response.statusCode,201);assert.equal(notifications.length,0);
});
test('invalid and rate-limited public requests never trigger another email',async()=>{
 const {ctx,response,notifications}=runtime();await submit(ctx,response,'urgent',{token:'b'.repeat(64)});assert.equal(response.statusCode,404);assert.equal(notifications.length,0);
 await submit(ctx,response);assert.equal(notifications.length,1);await submit(ctx,response);assert.equal(response.statusCode,429);assert.equal(notifications.length,1);
});
