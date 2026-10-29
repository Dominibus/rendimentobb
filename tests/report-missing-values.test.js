import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {readInvestmentAssumptions} from '../js/investment-assumptions.js';
import {financialNumber} from '../js/portfolio-kpi.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('dashboard-report/index.html'),dashboard=read('js/dashboard.js');
const yieldHelpers=html.slice(html.indexOf('function reportPropertyYield('),html.indexOf('const realROI = reportPropertyYield'));
const helpers=yieldHelpers+html.slice(html.indexOf('function getFinancingMetrics('),html.indexOf('const canonicalInvestmentScore'));
const from=dashboard.indexOf('const analyses = querySnapshot.docs.map');
const mapping=dashboard.slice(from,dashboard.indexOf('\n});',from)+4);
function normalize(data){return vm.runInNewContext(mapping+'\nanalyses[0]',{readInvestmentAssumptions,financialNumber,dashboardDebug(){},querySnapshot:{docs:[{id:'synthetic',data:()=>data}]}});}
const functions=vm.createContext({Intl});vm.runInContext(helpers,functions);
const state=data=>functions.readReportFinancialState(data);
const labels=(data,lang)=>functions.reportFinancialLabels(state(data),lang);
const complete={propertyPrice:150225,equity:30225,roi:15.393780185,net:4652.770061,risk:36,investmentScore:78,verdict:'BUY'};
const fixtures={ownedNoValue:{...complete,propertyPrice:null,propertyMode:'owned'},capitalZero:{...complete,equity:0,roi:0},absent:{propertyPrice:150225,equity:30225,verdict:'BUY'},null:{...complete,roi:null,net:null,risk:null,investmentScore:null},zero:{...complete,roi:0,net:0,risk:0,investmentScore:0,verdict:'WAIT'},complete,owned:{...complete,propertyPrice:0,equity:12000,propertyMode:'owned'},ownedZero:{...complete,propertyPrice:0,equity:0,roi:0,net:0,risk:0,investmentScore:0,propertyMode:'owned'},ownedMissing:{propertyPrice:0,equity:0,propertyMode:'owned',verdict:'BUY'}};
const ownedNormalize=normalize;
// Use the actual page functions, not a second implementation of formatting.
function page(row,lang){
 const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{innerText:'',innerHTML:'',style:{},hidden:false});return nodes.get(id);};
 const c={Intl,lang,financialState:state(row),ownedProperty:row.propertyMode==='owned',canonicalSimulation:row,canonicalVerdict:row.verdict||'WAIT',canonicalInvestmentScore:state(row).score,price:state(row).price,equity:state(row).equity,roi:state(row).roi,risk:state(row).risk,annualProfit:state(row).cashflow,realROI:null,document:{getElementById:node,createElement:()=>({style:{}}),querySelector:()=>({appendChild(){},prepend(){}})}};
 vm.createContext(c);vm.runInContext(helpers,c);
 for(const [start,end] of [['function euro(v){','// ================= VERDICT ================='],['function renderVerdict(){','// ================= CHART ================='],['function renderAdvanced(){','// ================= PDF']]){
  const a=html.indexOf(start);vm.runInContext(html.slice(a,html.indexOf(end,a)),c);
 }
 c.renderData();c.renderVerdict();c.renderAdvanced();return {c,nodes};
}
// Real bundled jsPDF; assertions inspect text calls and produce actual PDF bytes.
const bundle={exports:{}};vm.runInNewContext(read('js/vendor/jspdf-4.2.1.umd.min.js'),{module:bundle,exports:bundle.exports,console,atob,btoa,setTimeout,clearTimeout,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer});
const pdf=html.slice(html.indexOf('async function generatePDF(){'),html.indexOf('// ================= MODAL =================')).replace('const {readInvestmentAssumptions} = await import("/js/investment-assumptions.js?v=20261009-rc91");','const {readInvestmentAssumptions} = reportHelpers;');
async function exportPDF(row,lang,name){
 let doc,saved=false,registered;const calls=[],errors=[];
 const c={reportHelpers:{readInvestmentAssumptions},reportOwnerUid:'owner',integrationReady:Promise.resolve(),reportIntegration:{coverLines:()=>['Synthetic report'],appendPDF(){}},window:{currentLang:lang,currentUser:{uid:'owner'},getUserAccess:()=>({isPro:true}),dashboardSimulations:[row],lastInvestmentScore:{score:99},RB_MARKET_DATA:{},buildExecutiveReport:x=>{registered=x;return x;},jspdf:{jsPDF:class{constructor(){doc=new bundle.exports.jsPDF();const original=doc.text.bind(doc);doc.text=(text,...args)=>{calls.push({text:String(text),page:doc.internal.getCurrentPageInfo().pageNumber});return original(text,...args);};doc.save=()=>saved=true;return doc;}}}},document:{getElementById:id=>id==='simulationSelector'?{value:'0'}:null},showUpgradeModal(){},alert:e=>errors.push(e)};
 vm.createContext(c);vm.runInContext(helpers+pdf,c);await c.generatePDF();assert.deepEqual(errors,[]);assert.equal(saved,true);
 if(process.env.RB_PDF_QA_DIR){mkdirSync(process.env.RB_PDF_QA_DIR,{recursive:true});writeFileSync(process.env.RB_PDF_QA_DIR+`/${name}-${lang}.pdf`,Buffer.from(doc.output('arraybuffer')));}
 return {calls,registered,text:calls.map(x=>x.text).join('\n')};
}
for(const lang of ['it','en'])for(const [name,raw] of Object.entries(fixtures))test(`${lang}: ${name} retains missing/zero financial data through dashboard, page and real PDF`,async()=>{
 const before=JSON.stringify(raw),row=ownedNormalize(raw),s=state(row),l=labels(row,lang),p=page(row,lang),r=await exportPDF(row,lang,name);
 for(const [id,value] of [['roi',l.roi],['risk',l.risk],['bankScoreHero',l.score],['riskHero',l.riskLabel],['marketClassHero',l.investmentClass]])assert.equal(p.nodes.get(id).innerText,value,id);
 assert.ok(r.calls.some(x=>x.page===1&&x.text===l.roi));assert.ok(r.calls.some(x=>x.page===4&&x.text===l.risk));assert.ok(r.calls.some(x=>x.page===2&&x.text===l.score));
 assert.equal(r.registered.roi,s.roi);assert.equal(r.registered.risk,s.risk);assert.equal(r.registered.net,s.cashflow);assert.equal(r.registered.investmentScore,s.score);
 assert.doesNotMatch(r.text,/NaN|Infinity|null\/100|undefined/);
 if(['absent','null','ownedMissing'].includes(name)){
  assert.equal(s.incomplete,true);assert.equal(s.risk,null);assert.equal(s.cashflow,null);assert.equal(s.score,null);
  assert.equal(p.nodes.get('verdict').innerText,l.incomplete);assert.equal(l.investmentClass,l.missing);
  assert.ok(r.text.includes(l.incomplete));assert.ok(p.nodes.get('advancedBox').innerHTML.includes(l.missing));
  assert.doesNotMatch(r.text,/RISCHIO BASSO|LOW RISK|Scenario favorevole|Favourable scenario|99\/100/);
  assert.equal(r.registered.verdict,null);
 }else assert.equal(s.incomplete,false);
 if(name==='owned'||name==='ownedNoValue'){assert.match(r.text,lang==='it'?/Scenario di gestione/:/Management scenario/);assert.doesNotMatch(r.text,/Scenario favorevole|Favourable scenario/);}
 if(name==='zero'){assert.equal(l.roi,lang==='it'?'0,0%':'0.0%');assert.equal(l.risk,'0/100');assert.equal(l.score,'0/100');assert.equal(l.investmentClass,'E');assert.ok(r.text.includes(lang==='it'?'0,00':'0.00'));}
 if(name==='capitalZero'||name==='ownedZero'||name==='ownedMissing'){assert.equal(l.roi,'N/A');assert.equal(l.payback,'N/A');assert.equal(r.registered.roi,null);}
 assert.equal(JSON.stringify(raw),before,'read-only normalization/render/export');
});
for(const field of ['roi','risk','net','investmentScore'])for(const lang of ['it','en'])test(`${lang}: missing ${field} alone suppresses a saved favorable assessment`,async()=>{
 const row=normalize({...complete,[field]:null});const p=page(row,lang),r=await exportPDF(row,lang,'one-missing-'+field);
 assert.equal(state(row).incomplete,true);assert.equal(p.nodes.get('marketClassHero').innerText,lang==='it'?'N/D':'N/A');assert.match(p.nodes.get('riskHero').innerText,/INCOMPLETA|INCOMPLETE/);assert.match(p.nodes.get('verdict').innerText,/INCOMPLETA|INCOMPLETE/);assert.doesNotMatch(r.text,/Favourable scenario|Scenario favorevole|LOW RISK|RISCHIO BASSO/);
});
test('null, blank, boolean and absent values remain absent; explicit numeric string zero survives',()=>{
 for(const bad of [null,undefined,'',' ',false,true,NaN,Infinity,{},[]]){const s=state({price:150000,equity:30000,roi:bad,risk:bad,net:bad,investmentScore:bad});for(const k of ['roi','risk','cashflow','score'])assert.equal(s[k],null);}
 for(const value of [0,'0']){const s=state({price:150000,equity:30000,roi:value,risk:value,net:value,investmentScore:value});assert.equal(s.incomplete,false);}
});
test('missing equity is not a zero denominator or an N/A exemption',()=>{
 for(const equity of [undefined,null,'',false]){const s=state({...complete,equity});assert.equal(s.roiNotApplicable,false);assert.equal(s.incomplete,true);assert.equal(labels({...complete,equity},'it').roi,'N/D');}
});
test('registered executive documents keep missing values and zero-capital ROI N/A after the PDF handoff',()=>{
 const c={document:{dispatchEvent(){}},CustomEvent:class{},window:{currentLang:'it'},crypto:{randomUUID:()=> 'synthetic-report'}};
 vm.createContext(c);vm.runInContext(read('js/chatbot/document-engine.js'),c);
 for(const missing of [undefined,null,'',false]){
  const r=c.window.buildExecutiveReport({reportSource:'dashboard_report',equity:30000,roi:missing,risk:missing,net:missing,investmentScore:missing,realROI:12});
  for(const k of ['roi','risk','cashflow','investmentScore'])assert.equal(r[k],null,k);
 }
 const r=c.window.buildExecutiveReport({reportSource:'dashboard_report',equity:30000,roi:0,risk:0,net:0,investmentScore:0});
 for(const k of ['roi','risk','cashflow','investmentScore'])assert.equal(r[k],0,k);
 const z=c.window.buildExecutiveReport({reportSource:'dashboard_report',equity:0,roi:0,realROI:10,net:0,risk:0,investmentScore:0});assert.equal(z.roi,null);assert.equal(z.cashflow,0);
});
