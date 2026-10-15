import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {buildReportContext,reportCatalogue,provenanceLabel,integratedReport,reportPeriod} from '../js/report-provenance.js';
import {mountReportIntegration} from '../js/dashboard-report-integration.js';
const fixture=()=>buildReportContext({ownerUid:'owner',generatedAt:'2026-10-15T12:00:00Z',snapshot:{ownerUid:'owner',portalSnapshotReady:true,propertyList:[{id:'rome',name:'Residenza De Luca',city:'Roma',analysisId:'linked-rome'},{id:'castle',name:'Castello De Luca',city:'Anacapri',analysisId:'linked-castle'}],portalBookingList:[{propertyId:'rome',checkin:'2026-09-01',checkout:'2026-09-04',totalAmount:300,status:'completed',guestName:'SECRET GUEST',guestContact:'SECRET CONTACT'},{propertyId:'castle',checkin:'2026-09-01',checkout:'2026-09-02',totalAmount:9000,status:'completed'}],renovationList:[{propertyId:'rome',propertyName:'Residenza De Luca',actualSpent:5500,plannedTotal:13750},{propertyId:'castle',propertyName:'Castello De Luca',actualSpent:10,plannedTotal:100}]},analyses:[{uid:'owner',id:'linked-rome',city:'Roma',propertyId:'rome',isPortfolio:true,gross:38325,equity:30000,roi:32.7,createdAt:{seconds:1780000000}},{uid:'owner',id:'scenario-rome',city:'Roma',roi:32.7,gross:38325,createdAt:{seconds:1780000000}},{uid:'owner',id:'manual-rome',city:'Roma',isPortfolio:true,createdAt:{seconds:1780000000}},{uid:'owner',id:'linked-castle',propertyId:'castle',isPortfolio:true},{uid:'foreign',id:'foreign',propertyId:'rome',isPortfolio:true}]});
const period=reportPeriod({month:'2026-09'});
test('same-city same-ROI scenarios are distinguished by real portfolio status and immutable analysis IDs',()=>{
 const c=fixture(),list=reportCatalogue(c,'owner');assert.equal(list.length,4);
 for(const lang of ['it','en']){const linked=provenanceLabel(list[0],lang),scenario=provenanceLabel(list[1],lang),manual=provenanceLabel(list[2],lang);assert.match(linked,/Residenza De Luca/);assert.match(linked,/linked-rome/);assert.match(scenario,/scenario-rome/);assert.notEqual(linked,scenario);assert.match(manual,lang==='en'?/In portfolio.*No PMS link/:/Nel portfolio.*Senza collegamento PMS/);}
});
test('scenario without a verified property never inherits another property or the whole account',()=>{
 const c=fixture();assert.equal(integratedReport(c,{ownerUid:'owner',analysisId:'scenario-rome',period}),null);
 const linked=integratedReport(c,{ownerUid:'owner',analysisId:'linked-rome',period});assert.equal(linked.totals.revenue,300);assert.equal(linked.totals.properties,1);assert.equal(linked.renovations.length,1);assert.equal(linked.renovations[0].actualSpent,5500);assert.equal(linked.performance.summary.expected,3150);assert.equal(linked.rows[0].nights,3);
 const account=integratedReport(c,{ownerUid:'owner',analysisId:'scenario-rome',period,portfolio:true});assert.equal(account.totals.revenue,9300);assert.equal(account.totals.properties,2);
});
test('foreign owners, broken reciprocal links and duplicate property claims fail closed',()=>{
 assert.deepEqual(reportCatalogue(fixture(),'foreign'),[]);assert.throws(()=>integratedReport(fixture(),{ownerUid:'foreign',analysisId:'linked-rome',period}),/UNAVAILABLE/);
 for(const mutate of [c=>c.snapshot.propertyList[0].analysisId='different',c=>c.snapshot.propertyList[1].analysisId='linked-rome',c=>c.analyses.push({...c.analyses[0]})]){const c=fixture();mutate(c);assert.equal(reportCatalogue(c,'owner')[0].linkState,'inconsistent');assert.equal(integratedReport(c,{ownerUid:'owner',analysisId:'linked-rome',period}),null);}
 assert.throws(()=>buildReportContext({ownerUid:'foreign',snapshot:fixture().snapshot}),/UNAVAILABLE/);
});
test('report handoff excludes guest identities and foreign analyses; serialization retains the model',()=>{
 const c=fixture(),raw=JSON.stringify(c);assert.doesNotMatch(raw,/SECRET|guestName|guestContact|foreign/);const copy=JSON.parse(raw);assert.equal(integratedReport(copy,{ownerUid:'owner',analysisId:'linked-rome',period}).totals.revenue,300);
});
function dom(){
 const ids=new Map();class Node{constructor(tag){this.tagName=tag;this.children=[];this.style={};this.events={};this.value='';this.checked=false;}set id(v){this._id=v;ids.set(v,this);}get id(){return this._id;}appendChild(n){this.children.push(n);n.parentElement=this;return n;}prepend(n){this.children.unshift(n);n.parentElement=this;}replaceChildren(){this.children=[];}addEventListener(k,fn){this.events[k]=fn;}remove(){this.removed=true;}get textContent(){return [this._text||'',...this.children.map(n=>n.textContent)].join(' ');}set textContent(v){this._text=String(v);this.children=[];}}
 const root=new Node('main'),output=new Node('section');output.id='operational-report';root.appendChild(output);
 return {root,ids,document:{createElement:tag=>new Node(tag),querySelector:()=>root,getElementById:id=>ids.get(id)}};
}
const bundle={exports:{}};vm.runInNewContext(readFileSync(new URL('../js/vendor/jspdf-4.2.1.umd.min.js',import.meta.url),'utf8'),{module:bundle,exports:bundle.exports,console,atob,btoa,setTimeout,clearTimeout,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer});const jsPDF=bundle.exports.jsPDF;
for(const lang of ['it','en'])test(`real ${lang} integrated PDF preserves previous pages, isolates property and appends account only on request`,()=>{
 const d=dom();globalThis.document=d.document;let allowed=true,changed=0;
 try{const ui=mountReportIntegration({context:fixture(),ownerUid:'owner',analysisId:'linked-rome',allowed:()=>allowed,onChoicesChanged:()=>changed++});d.ids.get('report-period-mode').value='month';ui.render(lang);
 assert.match(d.root.textContent,/Residenza De Luca/);assert.doesNotMatch(d.ids.get('operational-report').textContent,/9[.,]?000/);
 d.ids.get('report-analysis-filter').value='portfolio';d.ids.get('report-analysis-filter').events.change();assert.equal(changed,1);assert.equal(ui.visible({id:'scenario-rome'}),false);assert.equal(ui.visible({id:'manual-rome'}),true);
 const pdf=new jsPDF();pdf.text('PREVIOUS FINANCIAL PAGE',20,20);const previous=pdf.internal.pages[1].join('\n');ui.appendPDF(pdf,lang);assert.equal(pdf.internal.pages[1].join('\n'),previous);assert.ok(pdf.getNumberOfPages()>=4);
 const text=pdf.internal.pages.flat().join('\n');assert.match(text,/Residenza De Luca/);assert.doesNotMatch(text,/Castello De Luca|SECRET/);
 d.ids.get('report-include-account').checked=true;d.ids.get('report-include-account').events.change();assert.match(d.ids.get('operational-report').textContent,/Castello De Luca/);
 const combined=new jsPDF();ui.appendPDF(combined,lang);assert.match(combined.internal.pages.flat().join('\n'),/Castello De Luca/);
 if(process.env.RB_PDF_QA_DIR){mkdirSync(process.env.RB_PDF_QA_DIR,{recursive:true});writeFileSync(process.env.RB_PDF_QA_DIR+'/integrated-'+lang+'.pdf',Buffer.from(combined.output('arraybuffer')));}
 allowed=false;assert.throws(()=>ui.appendPDF(pdf,lang),/ACCESS_CHANGED/);ui.render(lang);assert.equal(d.root.children[0].removed,true);
 }finally{delete globalThis.document;}
});
test('custom invalid periods cannot export and one-property account does not duplicate the property report',()=>{
 const d=dom();globalThis.document=d.document;
 try{const c=fixture();c.snapshot.propertyList=c.snapshot.propertyList.slice(0,1);const ui=mountReportIntegration({context:c,ownerUid:'owner',analysisId:'linked-rome',allowed:()=>true,onChoicesChanged(){}});d.ids.get('report-period-mode').value='month';d.ids.get('report-include-account').checked=true;
 const a=new jsPDF();ui.appendPDF(a);d.ids.get('report-include-account').checked=false;const b=new jsPDF();ui.appendPDF(b);assert.equal(a.getNumberOfPages(),b.getNumberOfPages());
 d.ids.get('report-period-mode').value='custom';d.ids.get('report-period-from').value='2026-10-03';d.ids.get('report-period-to').value='2026-10-01';assert.throws(()=>ui.appendPDF(new jsPDF()),/INVALID_REPORT_PERIOD/);
 }finally{delete globalThis.document;}
});

for(const lang of ['it','en'])test(`complete dashboard PDF ${lang} uses the real shared renderer and retains financial assumptions`,async()=>{
 const d=dom();globalThis.document=d.document;const contextData=fixture();
 try{
 const ui=mountReportIntegration({context:contextData,ownerUid:'owner',analysisId:'linked-rome',allowed:()=>true,onChoicesChanged(){}});d.ids.get('report-period-mode').value='month';
 const sim={id:'linked-rome',city:'Roma',price:150000,equity:30000,net:9799.82,roi:32.7,risk:25,score:86,verdict:'BUY',annualDebtService:13176.43,netOperatingIncome:22976.25,assumptions:null};
 const html=readFileSync(new URL('../dashboard-report/index.html',import.meta.url),'utf8');
 const financing=html.slice(html.indexOf('function getFinancingMetrics('),html.indexOf('const canonicalInvestmentScore'));
 const pdf=html.slice(html.indexOf('async function generatePDF(){'),html.indexOf('// ================= MODAL =================')).replace('const {readInvestmentAssumptions} = await import("/js/investment-assumptions.js?v=20261009-rc91");','const {readInvestmentAssumptions} = reportHelpers;');
 const {readInvestmentAssumptions}=await import('../js/investment-assumptions.js');
 let rendered,saved=false;const errors=[];
 const ctx={reportHelpers:{readInvestmentAssumptions},reportOwnerUid:'owner',integrationReady:Promise.resolve(),reportIntegration:ui,dashboardReportContext:{reporting:contextData},window:{currentLang:lang,currentUser:{uid:'owner'},getUserAccess:()=>({isPro:true}),dashboardSimulations:[sim],RB_MARKET_DATA:{},jspdf:{jsPDF:class{constructor(){rendered=new jsPDF();rendered.save=()=>saved=true;return rendered;}}}},document:{getElementById:id=>id==='simulationSelector'?{value:'0'}:null},showUpgradeModal(){},alert:message=>errors.push(message),console,Date,Intl,Number,isFinite};
 vm.createContext(ctx);vm.runInContext(financing+pdf,ctx);await ctx.generatePDF();assert.deepEqual(errors,[]);assert.equal(saved,true);
 const text=rendered.internal.pages.flat().join('\n');assert.match(text,/linked-rome/);assert.match(text,/Residenza De Luca/);assert.doesNotMatch(text,/Castello De Luca|SECRET/);assert.ok(rendered.getNumberOfPages()>=10);
 if(process.env.RB_PDF_QA_DIR)writeFileSync(process.env.RB_PDF_QA_DIR+'/complete-'+lang+'.pdf',Buffer.from(rendered.output('arraybuffer')));
 }finally{delete globalThis.document;}
});

function route({selected='linked-rome',access={isPro:true},changeOwner=false}={}){
 const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');const handler=source.slice(source.indexOf('async function handleReportClick(){'),source.indexOf('// ================= GLOBAL CLICK HANDLER',source.indexOf('async function handleReportClick(){')));
 const data=fixture(),all=data.analyses.map(a=>({...a,price:150000,equity:30000}));let written=null,notice=null;
 const window={currentUser:{uid:'owner'},dashboardSimulations:all,bestInvestmentData:all[1],getUserAccess:()=>access,rbShowSalesPause:(plan,options)=>notice={plan,options},RBReportCache:{write:(uid,simulations,context)=>written={uid,simulations,context}},location:{}};
 const ctx={window,auth:{currentUser:{uid:'owner'}},canExportPMSReport:(user,a)=>Boolean(user?.uid&&(a.isPro||a.isAdmin)),loadPMSStats:async()=>{if(changeOwner)window.currentUser={uid:'other'};},getOwnedReportPMS:async()=>data.snapshot,getDocsFromServer:async()=>({docs:data.analyses.map(a=>({id:a.id,data:()=>a}))}),query(){},collection(){},where(){},db:{},buildReportContext,sessionStorage:{},localStorage:{},URLSearchParams,Date,t:it=>it,alert:message=>{throw Error(message);},dashboardDebug(){}};
 vm.createContext(ctx);vm.runInContext(handler,ctx);return {run:()=>ctx.handleReportClick(selected),written:()=>written,notice:()=>notice,window};
}
test('portfolio-card route opens the explicitly chosen analysis rather than the best scenario',async()=>{
 const h=route();await h.run();assert.equal(h.written().simulations[0].id,'linked-rome');assert.equal(h.written().context.reporting.ownerUid,'owner');assert.equal(h.window.location.href,'/dashboard-report/?source=dashboard');assert.doesNotMatch(JSON.stringify(h.written()),/SECRET GUEST|SECRET CONTACT/);
});
test('Investor trial route and owner changes cannot publish a professional report handoff',async()=>{
 const free=route({access:{isInvestor:true}});await free.run();assert.equal(free.written(),null);assert.equal(free.notice().plan,'pro');assert.equal(free.notice().options.reason,'report');
 const switched=route({changeOwner:true});await switched.run();assert.equal(switched.written(),null);assert.equal(switched.window.location.href,undefined);
});
