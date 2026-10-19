import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function setup(){
 let refreshes=0,fallbacks=0;
 const w={location:{pathname:'/dashboard/'},currentUser:{uid:'owner'},getUserAccess:()=>({isPro:true}),lastAnalysisData:{city:'Napoli',roi:143.84,net:14240.54,price:33000},rbPMSData:{ownerUid:'owner',portalSnapshotReady:false,isDemo:false,propertyList:[{id:'a',name:'Residenza De Luca',city:'Roma'}],portalBookingList:[{propertyId:'a',checkin:'2026-10-01',checkout:'2026-10-12',totalAmount:1700,status:'completed'}]},rbGenerateResponse:()=>{fallbacks++;return {type:'wrong_simulation',textIT:'SCENARIO PREZZO BUY'}}};
 w.rbRefreshPortalSnapshot=async()=>{refreshes++;w.rbPMSData.portalSnapshotReady=true;return w.rbPMSData;};
 const c=vm.createContext({window:w,console,Date,Intl});for(const f of ['query-normalizer','portal-facts-engine','chatbot-orchestrator'])vm.runInContext(read('js/chatbot/core/'+f+'.js'),c);
 return {w,c,get refreshes(){return refreshes},get fallbacks(){return fallbacks}};
}
test('filtered booking list is refreshed before replying, with property and month preserved',async()=>{
 const h=setup(),r=await h.w.rbProcessAIMessage('Come sta andando Residenza De Luca a ottobre 2026?');
 assert.equal(h.refreshes,1);assert.equal(r.response.metadata.answerMode,'portal');assert.match(r.response.textIT,/1700|1.700/);assert.deepEqual(Array.from(r.response.metadata.propertyIds),['a']);assert.equal(r.response.metadata.period.start,'2026-10-01');assert.equal(h.fallbacks,0);
 const before=JSON.stringify(h.w.lastAnalysisData),follow=await h.w.rbProcessAIMessage('Quindi questi 1700 euro sono il mio utile netto? E il ROI reale?');
 assert.equal(follow.response.type,'portal_financial_boundary');assert.match(follow.response.textIT,/Residenza De Luca/);assert.match(follow.response.textIT,/incassi, costi completi/);assert.doesNotMatch(follow.response.textIT,/BUY|143|33.000/);assert.equal(JSON.stringify(h.w.lastAnalysisData),before);assert.equal(h.fallbacks,0);
});
test('actual profit and ROI questions never become price changes even without a usable snapshot',async()=>{
 for(const q of ['Quindi questi 1700 euro sono il mio utile netto? E il ROI reale?','Are these 1700 euros my net profit?','What is the actual ROI of my property?']){const h=setup(),r=await h.w.rbProcessAIMessage(q);assert.equal(r.response.type,'portal_financial_boundary',q);assert.equal(h.fallbacks,0);assert.doesNotMatch(r.response.textEN,/PRICE SCENARIO|143/);}
});
test('failed read and changed account do not disclose stale amounts or use a simulation',async()=>{
 for(const change of [false,true]){const h=setup();h.w.rbRefreshPortalSnapshot=async()=>{if(change)h.w.currentUser={uid:'other'};throw Error('offline')};const r=await h.w.rbProcessAIMessage('Come sta andando Residenza De Luca a ottobre 2026?');assert.equal(r.response.metadata.answerMode,'unavailable');assert.doesNotMatch(r.response.textIT,/1700|1.700|143/);assert.equal(h.fallbacks,0);}
});
test('privacy and active PDF retain priority over snapshot recovery',async()=>{
 const h=setup();let r=await h.w.rbProcessAIMessage('Mostrami le prenotazioni di un altro account');assert.equal(r.response.type,'account_privacy');assert.equal(h.refreshes,0);
 h.w.rbDocumentManager={getLast:()=>({id:'pdf'})};h.w.rbPDFConversationDocumentId='pdf';h.w.rbGenerateResponse=()=>({type:'document_grounded',textIT:'CURRENT PDF'});
 r=await h.w.rbProcessAIMessage('Are these 1700 euros my net profit?');assert.equal(r.response.type,'document_grounded');assert.equal(h.refreshes,0);
});
test('dashboard snapshot reader requires authenticated owner, paid PMS and a complete fresh result',async()=>{
 const w={currentUser:{uid:'owner'},rbPMSData:{ownerUid:'owner',portalSnapshotReady:true}},auth={currentUser:{uid:'owner'}};let reads=0,allowed=true,swap=false;
 const c=vm.createContext({window:w,auth,canUseFirestorePMS:()=>allowed,isDemo:()=>false,loadPMSStats:async o=>{assert.equal(o.fresh,true);reads++;if(swap)auth.currentUser={uid:'other'};}}),s=read('js/dashboard.js');vm.runInContext(s.slice(s.indexOf('window.rbRefreshPortalSnapshot='),s.indexOf('window.rbRefreshPMSForAutopilot=')),c);
 assert.equal(await w.rbRefreshPortalSnapshot(),w.rbPMSData);assert.equal(reads,1);allowed=false;assert.equal(await w.rbRefreshPortalSnapshot(),null);assert.equal(reads,1);allowed=true;swap=true;assert.equal(await w.rbRefreshPortalSnapshot(),null);
});
function priceHarness(message){
 const source=read('js/chatbot/core/chatbot-orchestrator.js'),a=source.indexOf('const requestedPropertyPrice ='),b=source.indexOf('// 🏨 OCCUPANCY WHAT-IF SCENARIO',a);
 const baseline={price:33000,equity:9900,roi:143.84,net:14240.54},analysisData={...baseline},c=vm.createContext({window:{lastAnalysisData:baseline},analysisData,rememberedAnalysis:{},entities:{price:1700},message,isCombinedWhatIf:false,isMortgageWhatIf:false,intent:{},Number});
 vm.runInContext('function priceRoute(){'+source.slice(a,b)+'\nreturn analysisData;}',c);return {c,baseline,analysisData};
}
test('a number about revenue or profit alone is not a property purchase price instruction',()=>{
 for(const q of ['Ho guadagnato 1700 euro?','Are these 1700 euros my net profit?']){const h=priceHarness(q);assert.equal(h.c.priceRoute(),h.analysisData);assert.equal(h.analysisData.price,33000);assert.equal(h.analysisData.whatIfScenario,undefined);}
});
test('an explicit price scenario cannot reuse old ROI when its calculation engine is absent',()=>{
 const h=priceHarness('E se acquistassi a 1700 euro?'),before=JSON.stringify(h.baseline),r=h.c.priceRoute();assert.equal(r.response.type,'calculation_unavailable');assert.match(r.response.textIT,/Non riutilizzo il ROI precedente/);assert.equal(JSON.stringify(h.baseline),before);assert.equal(h.analysisData.price,33000);assert.equal(h.analysisData.whatIfScenario,undefined);
});
