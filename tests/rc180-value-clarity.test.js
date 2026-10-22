import test from 'node:test';
import assert from 'node:assert/strict';
import {installToolPresentation} from '../js/tool-presentation.js';
globalThis.window={};
const {exampleBookings,exampleMetrics}=await import('../js/bb-demo-model.js');
delete globalThis.window;

function harness(){
 let state='missing',access={};const events=new Map();
 const next={hidden:true};const doc={getElementById:id=>id==='analyze-btn'?{}:id==='rb-result-next'?next:null,addEventListener:(name,fn)=>events.set(name,fn)};
 const win={getUserAccess:()=>access,rbGetInvestmentAnalysisState:()=>({status:state}),addEventListener:(name,fn)=>events.set(name,fn)};
 const api=installToolPresentation(win,doc);
 return {next,events,refresh:api.refresh,setState:v=>state=v,setAccess:v=>access=v};
}
test('Free next step follows a completed current result; edits immediately hide it',async()=>{
 const h=harness();assert.equal(h.next.hidden,true);
 h.setState('current');h.events.get('rb_investment_state_updated')();assert.equal(h.next.hidden,false);
 h.setState('stale');h.events.get('input')();await Promise.resolve();assert.equal(h.next.hidden,true);
 for(const status of ['missing','unavailable','pending']){h.setState(status);h.refresh();assert.equal(h.next.hidden,true);}
});
test('next step respects access transitions and never invites active paid users',()=>{
 const h=harness();h.setState('current');
 for(const access of [{isLoading:true},{isInvestor:true},{isPro:true},{isAdmin:true}]){
  h.setAccess(access);h.events.get('rb_plan_ready')();assert.equal(h.next.hidden,true);
 }
 h.setAccess({isFree:true});h.events.get('rb_auth_ready')();assert.equal(h.next.hidden,false);
});
test('PMS demo RevPAR uses available nights and is independent of cleaning completion',()=>{
 const bookings=exampleBookings(),before=exampleMetrics(bookings);
 assert.equal(before.nights,10);assert.equal(before.revenue,1170);
 assert.equal(before.adr,117);assert.equal(before.revpar,1170/31);
 bookings[1].cleaningDone=true;const after=exampleMetrics(bookings);
 assert.equal(after.tasks,before.tasks-1);
 for(const key of ['revenue','occupancy','adr','revpar'])assert.equal(after[key],before[key]);
});
