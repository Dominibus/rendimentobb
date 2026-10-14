import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../api/work-email.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export default async function handler','async function handler');
async function request({code,token='invalid-token',action='task_updates'}={}){
 const calls={verify:0,delivery:0,logs:0};let status,payload;
 const context={process:{env:{}},Resend:class{},admin:{apps:[{}],firestore:()=>({}),auth:()=>({verifyIdToken:async(received,revoked)=>{calls.verify++;assert.equal(received,token);assert.equal(revoked,true);if(code)throw Object.assign(Error('never return credentials'),{code});return {uid:'test-owner',email_verified:true};}})},sendTaskUpdates:async()=>{calls.delivery++;return {httpStatus:200,success:true}},sendUrgentHostNotification:async()=>{calls.delivery++;return {httpStatus:200,success:true}},console:{error:()=>calls.logs++}};
 vm.createContext(context);vm.runInContext(source,context);
 const req={method:'POST',headers:token?{authorization:`Bearer ${token}`}:{},body:{action}};
 const res={setHeader(){},status(value){status=value;return this},json(value){payload=value;return this}};
 await context.handler(req,res);return {status,payload,calls};
}
for(const code of ['auth/argument-error','auth/invalid-id-token','auth/id-token-expired','auth/id-token-revoked','auth/user-disabled'])test(`PMS email rejects ${code} before any delivery`,async()=>{
 const r=await request({code});assert.equal(r.status,401);assert.equal(r.payload.error,'invalid_authentication');assert.equal(r.calls.delivery,0);assert.equal(r.calls.logs,0);
});
test('missing credentials are rejected without token verification or delivery',async()=>{const r=await request({token:''});assert.equal(r.status,401);assert.equal(r.calls.verify,0);assert.equal(r.calls.delivery,0)});
test('non-authentication service failures remain generic server errors',async()=>{const r=await request({code:'internal/unavailable'});assert.equal(r.status,500);assert.equal(r.payload.error,'notification_failed');assert.equal(r.calls.delivery,0);assert.equal(r.calls.logs,1)});
for(const action of ['task_updates','urgent'])test(`valid authentication still reaches ${action} handler`,async()=>{const r=await request({token:'valid-test-token',action});assert.equal(r.status,200);assert.equal(r.calls.delivery,1)});

test("authentication-provider internal outages are not misclassified as bad credentials",async()=>{const r=await request({code:"auth/internal-error"});assert.equal(r.status,500);assert.equal(r.payload.error,"notification_failed");assert.equal(r.calls.delivery,0)});
