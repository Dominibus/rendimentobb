import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {performanceCSV} from '../js/report-csv.js';
import {PERFORMANCE_CSV_HEADERS} from '../js/csv-locales.js';
import {buildPMSOperationalReport} from '../js/pms-operational-report.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function harness(){
 const window={currentLang:'it'},c=vm.createContext({window,console,Intl,Date,document:{getElementById:()=>null}});
 for(const f of ['js/market-data.js','js/data-provenance.js','js/chatbot/core/market-evidence.js'])vm.runInContext(read(f),c);
 return {window,c};
}
const base=harness();
for(const [city,row]of Object.entries(base.window.RB_MARKET_DATA))test('RC191 C assumptions and B revenue, without invented D provenance: '+city,()=>{
 const ref=base.window.rbDataProvenance.reference(city);
 assert.equal(ref.annualRevenue,row.price*365*row.occupancy);assert.equal(ref.metadata.verifiedMarketData,false);
 for(const key of ['externalSource','observationPeriod','neighbourhood','propertyType','capacity'])assert.equal(ref.metadata[key],null);
 assert.equal(ref.metadata.category,'C');assert.equal(ref.metadata.derivedCategory,'B');
});
for(const q of ['Da quale fonte e periodo vengono ADR e occupazione dei benchmark di Napoli? Per quale zona e tipologia di immobile?','Which market has the best ROI, Rome or Naples?','Quale quartiere conviene a Napoli?','Che fonte hanno i dati di occupazione?','Confronta il mercato Roma e Milano'])test('RC191 public evidence route: '+q,async()=>{
 const {window:w,c}=harness();
 for(const f of ['query-normalizer','semantic-router','entity-engine','intent-engine','chatbot-orchestrator'])vm.runInContext(read('js/chatbot/core/'+f+'.js'),c);
 w.rbBuildPortalResponse=()=>{throw Error('must not read account');};
 const r=await w.rbProcessAIMessage(q);assert.equal(r.response.type,'market_provenance');assert.equal(r.response.metadata.verifiedMarketData,false);assert.match(r.response.textIT,/non una rilevazione/);assert.match(r.response.textEN,/undocumented/);
});
test('RC191 document, own PMS and account priorities preserved',async()=>{
 const {window:w,c}=harness();
 for(const q of ['Leggi il benchmark nel PDF','Quanto vale il mio ADR PMS?','Qual è la occupazione delle mie prenotazioni?'])assert.equal(w.rbBuildMarketEvidenceResponse(q),null,q);
 for(const f of ['query-normalizer','semantic-router','entity-engine','intent-engine','chatbot-orchestrator'])vm.runInContext(read('js/chatbot/core/'+f+'.js'),c);
 w.rbDocumentManager={getLast:()=>({id:'doc'})};w.rbPDFConversationDocumentId='doc';w.rbGenerateResponse=()=>({type:'document_grounded',textIT:'PDF evidence'});
 assert.equal((await w.rbProcessAIMessage('Spiegami il benchmark')).response.type,'document_grounded');
});
test('RC191 unsupported cities do not acquire a fake geographic reference',()=>{
 const {window:w,c}=harness();assert.equal(w.rbDataProvenance.reference('Atlantide'),null);assert.equal(w.rbDataProvenance.reference('toString'),null);
 const s=read('js/dashboard.js'),start=s.indexOf('const getPricingMarket ='),end=s.indexOf('window.getBookingStayMetrics',start);
 vm.runInContext(s.slice(start,end)+';window.pricingReference=getPricingMarket;',c);
 for(const city of ['Pisa','Atlantide','',null,'toString'])assert.equal(w.pricingReference(city),null,city);
 assert.equal(w.pricingReference('Roma').adr,w.marketData.rome.adr);assert.equal(w.pricingReference('Naples').occupancy,w.marketData.naples.occupancy);
 for(const r of [{price:100,occupancy:1.1},{price:null,occupancy:.5},{price:-1,occupancy:.5}])assert.equal(w.rbDataProvenance.annualRevenue(r),null);
 assert.equal(w.rbDataProvenance.annualRevenue({price:0,occupancy:0}),0);
});
test('RC191 real PMS leap month and mixed rates use weighted nights; closure fields are not modeled',()=>{
 const snapshot={ownerUid:'audit',portalSnapshotReady:true,propertyList:[{id:'a',name:'Low rate',closedDates:['2024-02-01']},{id:'b',name:'High rate',rooms:8}],portalBookingList:[
 {propertyId:'a',status:'completed',checkin:'2024-01-31',checkout:'2024-02-03',totalAmount:300},
 {propertyId:'b',status:'confirmed',checkin:'2024-02-28',checkout:'2024-03-02',totalAmount:900},
 {propertyId:'a',status:'cancelled',checkin:'2024-02-10',checkout:'2024-02-20',totalAmount:9999},
 {propertyId:'b',status:'pending',checkin:'2024-02-10',checkout:'2024-02-20',totalAmount:9999}]};
 const r=buildPMSOperationalReport({snapshot,ownerUid:'audit',month:'2024-02',generatedAt:'2024-03-03T12:00:00Z'});
 assert.equal(r.days,29);assert.equal(r.totals.revenue,800);assert.equal(r.totals.nights,4);assert.equal(r.totals.adr,200);assert.equal(r.totals.occupancy,4/58*100);assert.equal(r.totals.revpar,800/58);
 // This is an explicit residual model limitation, not proof of real closures being subtracted.
 assert.match(read('js/pms-operational-report.js'),/closures and multiple rooms are not modelled/);
});
test('RC191 CSV append-only localized method columns and unchanged legacy schema',()=>{
 const report={period:{start:'2026-01-01',end:'2026-02-01'},performance:{includesCurrentOrFuture:false,rows:[{id:'a',name:'Test',revenue:800,nights:4,occupancy:4/62*100,adr:200,revpar:800/62,linkState:'unlinked',missingPeriodAmounts:0,overlapNights:0}]}};
 assert.equal(PERFORMANCE_CSV_HEADERS.legacy.length,19);
 for(const lang of ['it','en']){const csv=performanceCSV(report,lang);assert.equal(PERFORMANCE_CSV_HEADERS[lang].length,22);assert.match(csv,lang==='it'?/chiusure e camere multiple non modellate/:/closures and multiple rooms not modelled/);assert.match(csv,/"800"/);assert.match(csv,/"200"/);}
 assert.doesNotMatch(performanceCSV(report),/closures|chiusure/);
});
test('RC191 market evidence dependencies load before the response engine',()=>{
 const loader=read('js/chatbot-loader.js');assert.ok(loader.indexOf('market-data.js?v=20261023-rc191')<loader.indexOf('market-evidence.js?v=20261023-rc192'));
 assert.ok(loader.indexOf('market-evidence.js?v=20261023-rc192')<loader.indexOf('core/response-engine.js'));
 assert.match(read('js/header.js'),/chatbot-loader.js\?v=20261025-rc197/);
});
globalThis.window={};
const {calculateROI}=await import('../js/roi-engine.js');
// Independent numerical solution of the mortgage balance, not the annuity implementation.
function independentDebt(loan,rate,years){if(!loan)return 0;let lo=0,hi=loan*(1+rate/1200);for(let k=0;k<90;k++){const p=(lo+hi)/2;let balance=loan;for(let m=0;m<years*12;m++)balance=balance*(1+rate/1200)-p;if(balance>0)lo=p;else hi=p;}return (lo+hi)*6;}
for(const occupancy of [0,40,95])for(const owned of [false,true])test(`RC191 excessive debt, high costs and negative cashflow: owned=${owned} occ=${occupancy}`,()=>{
 const input={propertyMode:owned?'owned':'purchase',price:150000,equity:owned?0:30000,loanAmount:200000,priceNight:110,occupancy,expenses:2500,commission:15,tax:21,interestRate:4,loanYears:20},before=JSON.stringify(input);
 const r=calculateROI(input),gross=110*365*occupancy/100,noi=gross*.85-30000,cash=noi-Math.max(0,noi)*.21-independentDebt(200000,4,20);
 for(const [actual,expected]of [[r.gross,gross],[r.noi,noi],[r.netAfterMortgage,cash]])assert.ok(Math.abs(actual-expected)<1e-6,`${actual} != ${expected}`);
 assert.ok(r.netAfterMortgage<0);assert.equal(JSON.stringify(input),before);assert.equal(r.roiAvailable,!owned);
});
for(const q of ['Gli immobili che mostrate sono annunci verificati e ancora disponibili da acquistare?','Are these properties verified listings still available to purchase?','Gli immobili sono reali?'])test('RC191 public listings question never becomes an upgrade: '+q,async()=>{
 const {window:w,c}=harness();vm.runInContext(read('js/chatbot/core/chatbot-orchestrator.js'),c);
 const r=await w.rbProcessAIMessage(q);assert.equal(r.response.type,'listing_evidence');assert.equal(r.response.metadata.verifiedListings,false);assert.match(r.response.textIT,/scenari dimostrativi/);assert.match(r.response.textEN,/demonstration scenarios/);
 for(const other of ['La mia proprietà è disponibile?','Verifica gli immobili nel PDF','My listings are available?'])assert.equal(w.rbBuildListingEvidenceResponse(other),null);
});
test('RC191 full pricing preserves known-city blend and uses own base for unknown city',()=>{
 const {window:w,c}=harness(),s=read('js/dashboard.js'),nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',style:{},dataset:{},setAttribute(){}});return nodes.get(id);};
 c.document={getElementById:node};c.t=(it,en)=>w.currentLang==='en'?en:it;c.formatCurrency=String;c.calendarDayDifference=()=>100;c.getLocalISODate=()=> '2026-10-23';
 vm.runInContext(s.slice(s.indexOf('const getPricingMarket ='),s.indexOf('window.getBookingStayMetrics =')),c);
 w.getBookingStayMetrics=()=>({start:new Date('2027-07-05T12:00:00Z'),checkin:'2027-07-05',checkout:'2027-07-07',nights:2,weekendNights:0});
 node('booking-pricing-season').value='auto';
 vm.runInContext(s.slice(s.indexOf('window.updateBookingPricingSuggestion ='),s.indexOf('window.applyBookingPricingSuggestion =')),c);
 w.currentPropertyData={city:'Roma',priceNight:100};let r=w.updateBookingPricingSuggestion();
 assert.equal(r.marketADR,142);assert.equal(r.suggestedADR,Math.round((100*.7+142*.3)*1.15*1.03));
 w.currentPropertyData={city:'Pisa',priceNight:100};r=w.updateBookingPricingSuggestion();assert.equal(r.marketADR,0);assert.equal(r.baseADR,100);assert.equal(r.suggestedADR,Math.round(100*1.15*1.03));
 w.currentPropertyData={city:'Atlantide'};r=w.updateBookingPricingSuggestion();assert.equal(r.baseADR,120);assert.equal(r.marketADR,0);assert.equal(node('booking-total').value,'');
 assert.match(node('booking-pricing-reasons').textContent,/Nessuna previsione/);
 w.currentLang='en';w.updateBookingPricingSuggestion();assert.match(node('booking-pricing-reasons').textContent,/No demand prediction/);
});
