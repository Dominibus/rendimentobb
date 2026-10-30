import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import registry from '../js/source-registry-data.js';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const storage=()=>({getItem:()=>null,setItem(){},removeItem(){}});
function setup({path='/tool/',paid=true}={}){
 const window={currentUser:{uid:'owner'},getUserAccess:()=>paid?{isInvestor:true}:{},location:{pathname:path},currentLang:'it',dispatchEvent(){},rbSourceRegistry:registry};
 const c=vm.createContext({window,console,Date,Intl,document:{getElementById:()=>null,addEventListener(){},dispatchEvent(){}},localStorage:storage(),sessionStorage:storage(),CustomEvent:class{}});
 // Use the production order, including knowledge and the real intent/response engines.
 const loader=read('js/chatbot-loader.js'),block=loader.slice(loader.indexOf('const scripts = ['),loader.indexOf('];',loader.indexOf('const scripts = [')));
 for(const m of block.matchAll(/"(\/js\/[^"?]+)(?:\?[^"]*)?"/g)){
  const f=m[1].slice(1);
  if(/vendor|ui\/|attachments|file-dispatcher|source-registry-data/.test(f))continue;
  vm.runInContext(read(f),c,{filename:f});
 }
 return {w:window,c,ask:async q=>(await window.rbProcessAIMessage(q)).response};
}
function loaded(w){w.rbPMSData={ownerUid:'owner',isDemo:false,portalSnapshotReady:true,propertyList:[{id:'a',name:'Casa Alfa'},{id:'b',name:'Casa Beta'}],portalBookingList:[{id:'stay-a',propertyId:'a',guestName:'Synthetic Alpha',checkin:'2026-10-30',checkout:'2026-11-02'},{id:'stay-b',propertyId:'b',guestName:'Synthetic Beta',checkin:'2026-11-03',checkout:'2026-11-05'}],bookings:2};return w.rbPMSData;}
const navigation=['Portami alla prenotazione da gestire.','Take me to the booking I need to manage.'];
for(const query of navigation)for(const state of ['absent','loading','error','empty','populated'])test(`PMS distinguishes ${state}: ${query}`,async()=>{
 const {w,ask}=setup();
 if(state!=='absent')loaded(w);
 if(['loading','error'].includes(state))w.rbPMSSnapshotLoad={ownerUid:'owner',status:state};
 if(state==='empty')w.rbPMSData.portalBookingList=[];
 const r=await ask(query);
 assert.ok(r.textIT&&r.textEN);assert.equal(r.metadata.state,state);
 if(['absent','loading','error'].includes(state)){
  assert.equal(r.actions.length,0);assert.doesNotMatch(r.textIT,/hai 0|nessuna prenotazione registrata/i);assert.doesNotMatch(r.textEN,/you have 0|no bookings registered/i);
  assert.match(r.textIT,/caric|snapshot/i);assert.match(r.textEN,/load|snapshot/i);
 }else if(state==='empty'){
  assert.match(r.textIT,/snapshot verificato/);assert.match(r.textEN,/verified snapshot/);assert.equal(r.actions.length,0);
 }else{
  assert.match(r.textIT,/Quale prenotazione/);assert.match(r.textEN,/Which booking/);assert.match(r.textEN,/have not opened or updated/);
  assert.deepEqual(Array.from(r.actions,a=>a.bookingId),['stay-a','stay-b']);
 }
});
test('booking navigation binds current scope and revalidates on property, account and data changes',async()=>{
 const {w,ask}=setup();loaded(w);w.bookingsPropertyFilter='a';
 const first=await ask(navigation[0]);assert.equal(first.actions.length,1);assert.equal(first.actions[0].bookingId,'stay-a');assert.equal(w.rbValidateEvidenceBookingAction(first.actions[0]),true);
 w.bookingsPropertyFilter='b';assert.equal(w.rbValidateEvidenceBookingAction(first.actions[0]),false);
 const next=await ask(navigation[1]);assert.equal(next.actions[0].bookingId,'stay-b');assert.doesNotMatch(JSON.stringify(next),/stay-a|Casa Alfa/);
 w.rbPMSData.portalBookingList=[];assert.equal(w.rbValidateEvidenceBookingAction(next.actions[0]),false);
 loaded(w);w.currentUser={uid:'other'};const foreign=await ask(navigation[0]);assert.equal(foreign.actions.length,0);assert.doesNotMatch(JSON.stringify(foreign),/stay-a|stay-b|Casa Alfa/);
 w.rbSyncChatIdentity(null);w.currentUser=null;const out=await ask(navigation[1]);assert.equal(out.metadata.state,'access');assert.equal(out.actions.length,0);assert.doesNotMatch(JSON.stringify(out),/stay-a|stay-b/);
});
test('unknown and foreign property/booking references never create destinations',async()=>{
 const {w,ask}=setup();loaded(w);w.rbPMSData.portalBookingList.push({id:'secret',propertyId:'foreign'});
 const r=await ask('Apri la prenotazione per immobile Sconosciuto');assert.equal(r.actions.length,0);assert.match(r.textEN,/cannot identify/);
 const all=await ask(navigation[1]);assert.doesNotMatch(JSON.stringify(all),/secret|foreign/);
 w.rbPMSData.portalBookingList[0].uid='other';assert.doesNotMatch(JSON.stringify(await ask(navigation[0])),/stay-a/);
});
test('demo cannot substitute for an account or survive leaving demo mode',async()=>{
 const {w,ask}=setup();loaded(w);w.rbPMSData.isDemo=true;w.rbPMSData.bookingList=w.rbPMSData.portalBookingList;
 assert.equal((await ask(navigation[0])).actions.length,0);
 w.isDemoDashboard=true;const r=await ask(navigation[0]);assert.equal(r.metadata.source,'demo_pms');assert.equal(r.actions.length,2);
 w.isDemoDashboard=false;assert.equal(w.rbValidateEvidenceBookingAction(r.actions[0]),false);
});
test('legacy aggregate answers do not convert missing snapshots or metrics into zero',()=>{
 const {w}=setup();let r=w.rbGenerateResponse({message:'Quante prenotazioni?',intent:{intent:'pms_bookings'}});
 assert.match(r.textIT,/non disponibili|non è disponibile/);assert.doesNotMatch(r.textEN,/0 bookings/);
 loaded(w);delete w.rbPMSData.bookings;r=w.rbGenerateResponse({message:'Quante prenotazioni?',intent:{intent:'pms_bookings'}});assert.equal(r.metadata.state,'missing_metric');assert.match(r.textEN,/will not replace it with zero/);
 w.rbPMSData.bookings=0;r=w.rbGenerateResponse({message:'Quante prenotazioni?',intent:{intent:'pms_bookings'}});assert.match(r.textEN,/0 bookings/);
});
for(const q of ['OMI determina il prezzo del mio immobile?','Does OMI determine my property price?','Qual è il prezzo OMI della mia casa?','What is the OMI value of my home?'])test('OMI explanation is complete and is not plan pricing: '+q,async()=>{
 const r=await setup({paid:false}).ask(q);assert.match(r.textIT,/intervalli.*territorio\/comune.*zona.*tipologia.*semestre/s);assert.match(r.textEN,/ranges.*territory\/municipality.*area.*property type.*half-year/s);
 assert.match(r.textIT,/Non determina il prezzo puntuale/);assert.match(r.textEN,/does not determine your individual property price/);
 assert.match(r.textEN,/€\/m²\/month/);assert.match(r.textEN,/2026\/1/);assert.match(r.textEN,/No live availability/);
 assert.doesNotMatch(r.textEN,/€19|€29|Annual Pro/);assert.equal(r.actions.length,0);
});
for(const q of ['Quanto costa Investor?','Quanto costa Pro?','What is the price of Investor?','What is the price of Pro?','Does the Investor trial include PDF reports?','Quali fonti sono incluse nel prezzo Pro?'])test('commercial questions retain complete existing product facts: '+q,async()=>{
 const r=await setup({paid:false}).ask(q);assert.equal(r.type,'subscriptions');if(!/include PDF/.test(q))assert.match(r.textEN,/30.day|30 day/);assert.match(r.textEN,/PDFs excluded|without PDF|do(?:es)? not include PDF/i);assert.match(r.textEN,/Investor/);assert.match(r.textIT,/Investor/);
});
for(const q of ['Perché il ROI è N/A?','Why is ROI N/A?','Perché con Free il ROI è N/A?'])test('Free receives general ROI N/A explanation without personal cause or paid figures: '+q,async()=>{
 const {w,ask}=setup({paid:false});w.lastAnalysisData={roi:987,cashflow:654,equity:0};
 const r=await ask(q);assert.match(r.textIT,/capitale proprio zero/);assert.match(r.textIT,/dati sono insufficienti/);assert.match(r.textEN,/zero equity/);assert.match(r.textEN,/insufficient data/);assert.match(r.textEN,/does not establish the cause in your case/);assert.doesNotMatch(JSON.stringify(r),/987|654|analysis_locked/);assert.equal(r.metadata.personalCauseVerified,false);
});
test('general ROI explanation does not unlock a personal analysis',async()=>{
 const {ask}=setup({paid:false});await ask('Why is ROI N/A?');const r=await ask('Qual è il mio ROI?');assert.equal(r.type,'analysis_locked');assert.match(r.textEN,/Investor and PRO/);
});
for(const [path,it,en] of [['/tool/','simulatore','simulator'],['/market/','Mercato','Market'],['/dashboard/','proprietà','property'],['/dashboard-report/','analisi','analysis'],['/','schermata','screen']])test('source clarification uses the visible page: '+path,async()=>{
 const {ask}=setup({path});for(const q of ['Da dove viene questo numero?','Quale fonte hai usato?','Quanto sono aggiornati i dati?','Where does this number come from?','Which source did you use?','How up to date are the data?']){
  const r=await ask(q);assert.match(r.textIT,new RegExp(it,'i'));assert.match(r.textEN,new RegExp(en,'i'));assert.match(r.textEN,/Observation period, acquisition and last check/);assert.match(r.textIT,/storici privi di provenienza/);assert.equal(r.actions.length,0);
 }
});
test('known source metadata distinguish observation, acquisition, inventory and unobserved check',async()=>{
 const {ask}=setup();const r=await ask('Quanto sono aggiornati i dati turismo ISTAT?');assert.match(r.textIT,/Periodo di osservazione: 2025/);assert.match(r.textEN,/Declared acquisition: 2026-10-28/);assert.match(r.textEN,/Inventory date \(not a live check\): 2026-10-29/);assert.match(r.textEN,/Last observed update: unavailable/);assert.match(r.textEN,/not source versions used by saved results/);
 const selected=await ask('ISTAT tourism');assert.match(selected.textEN,/Observation period: 2025/);
});
test('unavailable and incomplete public metadata never get substituted dates',async()=>{
 const {w,ask}=setup();w.rbSourceRegistry=null;let r=await ask('Quanto sono aggiornati i dati OMI?');assert.match(r.textEN,/metadata are unavailable/);assert.doesNotMatch(r.textEN,/2026\/1|2026-10-28/);
 w.rbSourceRegistry={datasets:[{id:'omi-values',publisher:'OMI',observationPeriod:null,acquiredAt:null,lastUpdate:{at:null}}]};r=await ask('OMI');assert.match(r.textEN,/Observation period: unavailable/);assert.match(r.textEN,/Declared acquisition: unavailable/);
});
test('PDF replacement and historical questions never borrow the current source registry',async()=>{
 const {w,ask}=setup();let doc={id:'old',fileName:'Old.pdf',status:'ready',analysis:{roi:12}};w.rbDocumentManager={getLast:()=>doc};w.rbPDFConversationDocumentId='old';
 let r=await ask('Which source did you use?');assert.match(r.textEN,/Old.pdf/);assert.doesNotMatch(r.textEN,/2026\/1|2026-10-28/);assert.match(r.textEN,/do not attribute the current registry/);
 doc={id:'new',fileName:'New.pdf',status:'ready'};w.rbPDFConversationDocumentId='new';r=await ask('Quale fonte hai usato?');assert.match(r.textIT,/New.pdf/);assert.doesNotMatch(JSON.stringify(r),/Old.pdf/);
 w.rbDocumentManager={getLast:()=>null};r=await ask('Which source did you use in the saved report?');assert.match(r.textEN,/Historical source and model versions may be unavailable/);assert.doesNotMatch(r.textEN,/2026\/1/);
});
test('language changes and logout read current page and do not retain previous property/source scope',async()=>{
 const {w,ask}=setup({path:'/dashboard/'});loaded(w);w.bookingsPropertyFilter='a';await ask(navigation[0]);
 w.currentLang='en';w.location.pathname='/market/';let r=await ask('Which source did you use?');assert.match(r.textEN,/Market-page/);assert.doesNotMatch(JSON.stringify(r),/Casa Alfa|stay-a/);
 w.rbSyncChatIdentity('owner');w.rbSyncChatIdentity(null);w.currentUser=null;r=await ask(navigation[1]);assert.equal(r.actions.length,0);assert.match(r.textEN,/Sign in/);assert.equal(w.rbPMSData,null);
});

test('real action button rechecks identity and property scope at click time',async()=>{
 const {w,ask}=setup();loaded(w);w.bookingsPropertyFilter='a';const r=await ask(navigation[1]);
 const ui=read('js/chatbot/ui/chatbot-ui.js'),start=ui.indexOf('  function addResponseActions('),end=ui.indexOf('  async function sendMessage()',start);
 const buttons=[],feedback=[];let opens=0;
 const document={createElement:tag=>({children:[],appendChild(n){this.children.push(n);if(n.type==='button')buttons.push(n);}})};
 w.openBookingFromCopilot=async id=>{assert.equal(id,'stay-a');opens++;return true;};
 const context=vm.createContext({window:w,document,messages:{appendChild(){}},windowEl:{classList:{remove(){}}},t:(it,en)=>en,addMessage:(role,text)=>feedback.push(text),reportRuntimeError:assert.fail});
 vm.runInContext(ui.slice(start,end),context);context.actions=r.actions;vm.runInContext("addResponseActions(actions,'en')",context);
 await buttons[0].onclick();assert.equal(opens,1);
 w.bookingsPropertyFilter='b';await buttons[0].onclick();assert.equal(opens,1);assert.match(feedback.at(-1),/context changed/);
 w.bookingsPropertyFilter='a';w.currentUser=null;await buttons[0].onclick();assert.equal(opens,1);
});

test('production snapshot loader exposes loading/error and discards obsolete reads',async()=>{
 const src=read('js/dashboard.js'),start=src.indexOf('async function loadPMSStats({fresh=false}={}){'),end=src.indexOf('  const properties =',start);
 // Exercise the actual asynchronous read prefix, stopping before DOM/KPI rendering.
 const prefix=src.slice(start,end)+'window.auditReadAccepted=true; }';
 const pending=[];const w={currentUser:{uid:'owner'}};
 const c=vm.createContext({window:w,canUseFirestorePMS:()=>true,getDocs:()=>new Promise((resolve,reject)=>pending.push({resolve,reject})),getDocsFromServer:()=>assert.fail('unexpected server read'),query:()=>null,collection:()=>null,where:()=>null,db:{}});
 vm.runInContext(prefix,c);
 const first=c.loadPMSStats();assert.equal(w.rbPMSSnapshotLoad.status,'loading');pending[0].reject(Error('offline'));await assert.rejects(first,/offline/);assert.equal(w.rbPMSSnapshotLoad.status,'error');
 const stale=c.loadPMSStats(),oldProperties=pending[1];
 const current=c.loadPMSStats(),newProperties=pending[2];
 newProperties.resolve({});await new Promise(setImmediate);
 const currentBookings=pending[3];assert.ok(currentBookings);
 oldProperties.resolve({});await stale;assert.equal(w.auditReadAccepted,undefined);
 currentBookings.resolve({});await current;assert.equal(w.auditReadAccepted,true);
 w.auditReadAccepted=false;const logout=c.loadPMSStats();const before=pending.length;
 w.currentUser=null;pending[4].resolve({});await logout;
 assert.equal(pending.length,before);assert.equal(w.auditReadAccepted,false);
});

test('missing required evidence module fails closed rather than using old zero/default replies',async()=>{
 let init;
 const document={readyState:'loading',addEventListener:(name,fn)=>{if(name==='DOMContentLoaded')init=fn;},dispatchEvent(){},querySelector:()=>null,createElement:()=>({}),head:{appendChild:n=>n.onload()},body:{appendChild:n=>n.onerror()}};
 const window={location:{hostname:'localhost'},rbProcessAIMessage:async()=>({response:{textEN:'You have 0 bookings'}})};
 vm.runInNewContext(read('js/chatbot-loader.js'),{window,document,CustomEvent:class{}});await init();
 const r=await window.rbProcessAIMessage('How many bookings?');assert.equal(r.response.type,'assistant_unavailable');assert.match(r.response.textEN,/cannot confirm data or tasks/);assert.equal(r.response.actions.length,0);
});

test('unowned, incomplete and pending-access snapshots cannot authorize destinations',async()=>{
 const {w,ask}=setup();loaded(w);delete w.rbPMSData.ownerUid;
 let r=await ask(navigation[0]);assert.equal(r.metadata.state,'absent');assert.equal(r.actions.length,0);assert.doesNotMatch(JSON.stringify(r),/stay-a|Casa Alfa/);
 loaded(w);delete w.rbPMSData.portalBookingList;r=await ask(navigation[1]);assert.equal(r.metadata.state,'absent');assert.equal(r.actions.length,0);
 loaded(w);w.getUserAccess=()=>({isLoading:true,isInvestor:true});r=await ask(navigation[1]);assert.equal(r.metadata.state,'loading');assert.equal(r.actions.length,0);
});
