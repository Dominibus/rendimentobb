import {buildPropertyPerformance,reportPeriod} from '../js/property-performance.js';
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
import {ownedPMSReport,pmsReviewHTML} from '../js/pms-review.js';
import {renderProperties} from './helpers/dashboard-html-harness.js';
const now=new Date('2026-10-15T12:00:00');
const fixture=()=>({ownerUid:'owner',isDemo:false,portalSnapshotReady:true,propertyList:[{id:'a',name:'Residenza De Luca',city:'Roma'},{id:'b',name:'Casa Altra',city:'Napoli'}],renovationList:[],portalBookingList:[
 {propertyId:'a',checkin:'2026-09-04',checkout:'2026-09-06',totalAmount:300,status:'completed'},
 {propertyId:'a',checkin:'2026-09-07',checkout:'2026-09-14',totalAmount:210,status:'completed'},
 {propertyId:'a',checkin:'2026-09-14',checkout:'2026-09-20',totalAmount:1000,status:'completed'},
 {propertyId:'a',checkin:'2026-09-28',checkout:'2026-10-04',totalAmount:1000,status:'completed'},
 {propertyId:'b',checkin:'2026-09-01',checkout:'2026-09-02',totalAmount:9000,status:'completed'}]});
const src=readFileSync(new URL('../js/chatbot/core/portal-facts-engine.js',import.meta.url),'utf8');
function setup(extra={}){const snapshot=fixture();let calls=0;const w={currentUser:{uid:'owner'},getUserAccess:()=>({isPro:true}),rbPMSData:snapshot,rbBuildPMSOperationalReport:options=>{calls++;return ownedPMSReport({snapshot,ownerUid:'owner',...options});},...extra};vm.runInNewContext(src,{window:w,Date,Intl});return {w,calls:()=>calls};}
test('exact live question uses the same property and September figures as PDF',()=>{
 const {w,calls}=setup();const r=w.rbBuildPortalResponse('Qual è l’andamento di Residenza De Luca a settembre 2026?',now);assert.equal(r.metadata.period.start,'2026-09-01');assert.equal(r.metadata.period.end,'2026-10-01');assert.deepEqual(Array.from(r.metadata.propertyIds),['a']);assert.match(r.textIT,/2.010,00/);assert.match(r.textIT,/18 notti/);assert.match(r.textIT,/60%/);assert.match(r.textIT,/111,67/);assert.doesNotMatch(r.textIT,/9.000|ROI medio|8-11/);assert.equal(calls(),1);
});
test('English month, explicit dates, quarter and year have deterministic ranges',()=>{
 const {w}=setup();for(const [q,start,end] of [['How did Residenza De Luca perform in September 2026?','2026-09-01','2026-10-01'],['Andamento di Residenza De Luca 2026-09-01 2026-09-30','2026-09-01','2026-10-01'],['Andamento portfolio Q3 2026','2026-07-01','2026-10-01'],['Andamento portfolio anno 2026','2026-01-01','2027-01-01']]){const r=w.rbBuildPortalResponse(q,now);assert.equal(r.metadata.period.start,start,q);assert.equal(r.metadata.period.end,end,q);}
});
test('all 12 Italian and English named months map to the intended civil month',()=>{
 const {w}=setup();const it=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'],en=['january','february','march','april','may','june','july','august','september','october','november','december'];for(const names of [it,en])for(let i=0;i<12;i++){const r=w.rbBuildPortalResponse('Andamento portfolio '+names[i]+' 2026',now);assert.equal(r.metadata.period.start,'2026-'+String(i+1).padStart(2,'0')+'-01');}
});
test('ambiguous months and unknown structures request clarification instead of substituting market data',()=>{
 const {w}=setup();assert.equal(w.rbBuildPortalResponse('Andamento portfolio settembre ottobre 2026',now).metadata.answerMode,'invalid_period');assert.equal(w.rbBuildPortalResponse('Andamento del mio immobile sconosciuto settembre 2026',now).metadata.answerMode,'unknown_property');assert.equal(w.rbBuildPortalResponse('Andamento mercato Roma',now),null);
});
test('Free, foreign owner and a failed shared model disclose no private amounts',()=>{
 for(const extra of [{getUserAccess:()=>({isFree:true})},{currentUser:{uid:'foreign'}},{rbBuildPMSOperationalReport:()=>{throw Error('unavailable');}}]){const {w}=setup(extra);const r=w.rbBuildPortalResponse('Andamento di Residenza De Luca settembre 2026',now);assert.ok(['access','unavailable'].includes(r.metadata.answerMode));assert.doesNotMatch(r.textIT,/2.010/);}
});
test('scope validation refuses unknown IDs and never falls back to whole portfolio',()=>{
 assert.throws(()=>ownedPMSReport({snapshot:fixture(),ownerUid:'owner',month:'2026-09',propertyIds:['foreign']}),/PROPERTY_NOT_FOUND/);
 assert.throws(()=>ownedPMSReport({snapshot:fixture(),ownerUid:'foreign',month:'2026-09'}),/UNAVAILABLE/);
 const empty=ownedPMSReport({snapshot:fixture(),ownerUid:'owner',month:'2026-09',propertyIds:[]});assert.equal(empty.totals.properties,0);assert.equal(empty.totals.revenue,0);
});
test('review displays evidence and period limits without ungrounded score or pricing commands',()=>{
 const report=ownedPMSReport({snapshot:fixture(),ownerUid:'owner',month:'2026-10'});
 for(const lang of ['it','en']){const html=pmsReviewHTML(report,lang);assert.match(html,/2026-10/);assert.doesNotMatch(html,/PERFORMANCE SCORE|Richiede attenzione|Needs Attention|5-8|OTA|exec-score/);assert.match(html,lang==='it'?/Mese in corso/:/Current month/);}
});
test('overlaps and missing amounts are identical in report, assistant and review',()=>{
 const f=fixture();f.portalBookingList.push({propertyId:'a',checkin:'2026-09-04',checkout:'2026-09-05',totalAmount:null,status:'completed'});
 const {w}=setup({rbPMSData:f,rbBuildPMSOperationalReport:o=>ownedPMSReport({snapshot:f,ownerUid:'owner',...o})});const r=w.rbBuildPortalResponse('Andamento di Residenza De Luca settembre 2026',now);assert.match(r.textIT,/ADR: N\/D/);assert.match(r.textIT,/sovrapposte/);assert.match(r.textIT,/18|19/);
 const html=pmsReviewHTML(ownedPMSReport({snapshot:f,ownerUid:'owner',month:'2026-09'}));assert.match(html,/anomalie/);
});
test('property card uses unique occupied nights and never grades an incomplete month',async()=>{
 const date=new Date(),yy=date.getFullYear(),mm=String(date.getMonth()+1).padStart(2,'0');const bookings=[{checkin:`${yy}-${mm}-04`,checkout:`${yy}-${mm}-06`,totalAmount:200,status:'completed'},{checkin:`${yy}-${mm}-05`,checkout:`${yy}-${mm}-07`,totalAmount:200,status:'completed'}];
 const html=await renderProperties({name:'Casa',priceNight:100},'a',bookings);assert.doesNotMatch(html,/Occupazione mensile bassa|Low monthly occupancy/);assert.match(html,/Dati prenotati del mese/);
});

test('future or open period does not create premature gap recommendations',()=>{
 const s=fixture();s.propertyList[0].analysisId='aa';
 const r=buildPropertyPerformance({snapshot:s,ownerUid:'owner',analyses:[{id:'aa',uid:'owner',propertyId:'a',gross:36500,occupancy:70}],period:reportPeriod({mode:'year',year:2026}),generatedAt:'2026-10-15T12:00:00Z'});
 assert.equal(r.performance.includesCurrentOrFuture,true);assert.ok(!r.performance.rows[0].notices.some(n=>/_gap$/.test(n.code)));
});

for(const lang of ['it','en'])test(`${lang}: active Investor trial never offers another trial, PDF gate remains Pro-only`,()=>{
 const nodes=[];
 const document={readyState:'loading',addEventListener(){},body:{append(){}},createElement(tag){const n={tag,style:{},setAttribute(){},append(){},addEventListener(){},showModal(){},remove(){},close(){}};nodes.push(n);return n;}};
 const window={currentLang:lang,currentUser:{uid:'owner'},rbAccountOwner:'owner',rbAccountData:{trialActive:true}};
 const source=readFileSync(new URL('../js/subscription-ui.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 vm.runInNewContext(source,{window,document,location:{hostname:'www.rendimentobb.it'},activeTrial:data=>data.trialActive===true,isSandboxHost:()=>false,isLiveSalesPaused:()=>true,setInterval(){}});
 for(const options of [{},{reason:'report'}]){
  nodes.length=0;window.rbShowSalesPause('pro',options);
  const texts=nodes.map(n=>n.textContent||'').join(' ');
  assert.match(texts,lang==='it'?/prova Investor è già attiva/:/Investor trial is already active/);
  assert.doesNotMatch(texts,/Scopri la prova|Explore the Investor trial/);
  assert.ok(nodes.some(n=>n.href==='/plan-interest.html?plan=pro'));
  if(options.reason)assert.match(texts,lang==='it'?/non include i PDF/:/does not include PDFs/);
 }
 window.rbAccountOwner='other';nodes.length=0;window.rbShowSalesPause('pro',{reason:'report'});
 assert.doesNotMatch(nodes.map(n=>n.textContent||'').join(' '),/già attiva|already active/);
 assert.equal(nodes.some(n=>/Scopri la prova|Explore the Investor trial/.test(n.textContent||'')),false);
});
