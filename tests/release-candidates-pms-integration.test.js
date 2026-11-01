import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {inspectProfessionalBookings} from '../js/pms-professional-queries.js';

const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
function session(path,paid=true){
 const window={location:{pathname:path},currentUser:{uid:'synthetic-owner'},getUserAccess:()=>paid?{isInvestor:true}:{},currentLang:'it',dispatchEvent(){},
  rbPMSProfessionalTools:{inspect:inspectProfessionalBookings,today:()=> '2026-11-01'},
  rbPMSData:{ownerUid:'synthetic-owner',portalSnapshotReady:true,isDemo:false,propertyList:[{id:'alpha',name:'Casa Alfa'}],portalBookingList:[{id:'arrival-1',uid:'synthetic-owner',propertyId:'alpha',status:'arrival',checkin:'2026-11-01',checkout:'2026-11-03'}]},
  rbCandidateWorkspace:{getContext:()=>({page:'/immobili/candidati/',ownerUid:'synthetic-owner',active:'C-1',rows:[{reference:'C-1',status:'insufficient',explanationIT:'Manca la superficie del candidato C-1.',explanationEN:'Candidate C-1 has no area.',assumptions:[]}]})}};
 const storage=()=>({getItem:()=>null,setItem(){},removeItem(){}});
 const c=vm.createContext({window,console,Date,Intl,document:{getElementById:()=>null,addEventListener(){},dispatchEvent(){}},localStorage:storage(),sessionStorage:storage(),CustomEvent:class{}});
 const loader=read('js/chatbot-loader.js'),start=loader.indexOf('const scripts = ['),block=loader.slice(start,loader.indexOf('];',start));
 for(const m of block.matchAll(/"(\/js\/[^"?]+)(?:\?[^\"]*)?"/g)){
  const f=m[1].slice(1);if(/vendor|ui\/|attachments|file-dispatcher|source-registry-data/.test(f))continue;
  vm.runInContext(read(f),c,{filename:f});
 }
 return {window,ask:async q=>(await window.rbProcessAIMessage(q)).response};
}
for(const q of ['Quali dati mancano per questo candidato?','Which assumptions did you use for this candidate?'])test('combined loader preserves candidate explanation: '+q,async()=>{
 const {ask}=session('/immobili/candidati/');const r=await ask(q);
 assert.equal(r.type,'candidate_explanation');assert.equal(r.metadata.reference,'C-1');assert.doesNotMatch(r.textIT,/Casa Alfa|arrival-1/);
});
for(const q of ['Quali strutture hanno arrivi oggi?','Which properties have arrivals today?'])test('combined loader preserves PMS identities: '+q,async()=>{
 const {ask}=session('/dashboard/');const r=await ask(q);
 assert.equal(r.type,'pms_professional');assert.equal(r.metadata.matchedBookings,1);assert.equal(r.actions[0].bookingId,'arrival-1');assert.doesNotMatch(r.textIT,/C-1/);
});
for(const q of ['Ci sono conflitti tra quotazioni OMI e prezzi degli annunci?','Are there conflicts between OMI values and listing prices?'])test('combined Free source question never enters PMS: '+q,async()=>{
 const {ask}=session('/dashboard/',false);const r=await ask(q);
 assert.notEqual(r.type,'pms_professional');assert.notEqual(r.type,'analysis_locked');assert.match(r.textIT,/OMI/);
});
test('leaving candidate page or changing account cannot expose candidate context',async()=>{
 const s=session('/immobili/candidati/');s.window.currentUser={uid:'another-synthetic-owner'};
 let r=await s.ask('Spiega candidato C-1');assert.equal(r.metadata.state,'unavailable');assert.doesNotMatch(r.textIT,/Manca la superficie/);
 s.window.location.pathname='/dashboard/';r=await s.ask('Spiega candidato C-1');assert.equal(r.metadata.state,'unavailable');
});
