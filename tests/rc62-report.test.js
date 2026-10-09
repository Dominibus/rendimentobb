import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {readInvestmentAssumptions} from '../js/investment-assumptions.js';
const html=readFileSync(new URL('../dashboard-report/index.html',import.meta.url),'utf8');
const financing=html.slice(html.indexOf('function getFinancingMetrics('),html.indexOf('const canonicalInvestmentScore'));
const pdf=html.slice(html.indexOf('async function generatePDF(){'),html.indexOf('// ================= MODAL =================')).replace('const {readInvestmentAssumptions} = await import("/js/investment-assumptions.js?v=20261009-rc91");','const {readInvestmentAssumptions} = reportHelpers;');
const assumptions={schemaVersion:1,calculationVersion:'roi-monthly-v1',source:'simulator',expensesUnit:'monthly_eur',propertyPrice:150000,equity:30000,loanAmount:120000,priceNight:117.41682974559687,occupancy:70,expenses:1000,commission:15,tax:21,interestRate:3.7,loanYears:25};
async function render({lang='it',city='roma',snapshot=assumptions,authorized=true,changeOwnerOnPage=false,equityAmount=30000,propertyAmount=150000}={}){
 const calls=[],errors=[];let pages=1,saved=false;
 const doc=new Proxy({text:(text,x,y)=>{calls.push({text:Array.isArray(text)?text.join(' '):text,x,y,page:pages});},addPage:()=>{pages++;if(changeOwnerOnPage)context.window.currentUser={uid:'another-owner'};},getNumberOfPages:()=>pages,splitTextToSize:(text)=>[text],save:()=>{saved=true;}},{get:(target,key)=>key in target?target[key]:(()=>{})});
 const sim={id:'analysis-id',city,price:propertyAmount,equity:equityAmount,net:6144.64,roi:20.4821,risk:25,score:79,verdict:'BUY',annualDebtService:7364.36,netOperatingIncome:17100,assumptions:snapshot};
 const context={reportHelpers:{readInvestmentAssumptions},reportOwnerUid:'owner',dashboardReportContext:{pms:{properties:4,totalRevenue:8710}},window:{currentLang:lang,currentUser:{uid:'owner'},jspdf:{jsPDF:class{constructor(){return doc;}}},getUserAccess:()=>({isPro:authorized}),dashboardSimulations:[sim],RB_MARKET_DATA:{roma:{roi:9.8}}},document:{getElementById:id=>id==='simulationSelector'?{value:'0'}:null},showUpgradeModal:()=>{},alert:x=>errors.push(x),console:{error:(...x)=>errors.push(x)},Date,Intl,Number,isFinite};
 vm.createContext(context);vm.runInContext(financing+pdf,context);await context.generatePDF();assert.deepEqual(errors,[]);return {calls,pages,saved,text:calls.map(x=>x.text).join('\n')};
}
test('PDF contains exact amounts and saved assumptions with version and ID',async()=>{
 const result=await render();assert.equal(result.saved,true);assert.equal(result.pages,8);
 for(const value of ['6144,64','3,7%','25 anni','117,41683','roi-monthly-v1','analysis-id','Costi mensili','Dato statico illustrativo'])assert.ok(result.text.includes(value),value);
 assert.ok(result.text.includes('BASI NON COMPARABILI'));assert.ok(!result.text.includes('SOPRA IL BENCHMARK'));assert.ok(!result.text.includes('10.7 p.p.'));
 assert.ok(result.calls.filter(x=>x.page===8).every(x=>x.y<=285));
});
test('legacy PDF states missing assumptions and does not invent saved rate or term',async()=>{
 const result=await render({snapshot:null});const last=result.calls.filter(x=>x.page===8).map(x=>x.text).join('\n');
 assert.ok(last.includes('Ipotesi complete non disponibili'));assert.ok(!last.includes('25 anni'));
});
test('unknown city has no invented numerical reference or comparative gap',async()=>{
 const result=await render({city:'Volla'});const page=result.calls.filter(x=>x.page===5).map(x=>x.text).join('\n');
 assert.ok(page.includes('RIFERIMENTO NON DISPONIBILE'));assert.ok(page.includes('NESSUN CONFRONTO'));assert.ok(!page.includes('8.4%'));
});
test('English PDF shows explicit terms and authentic saved inputs',async()=>{
 const result=await render({lang:'en'});assert.ok(result.text.includes('Saved simulation assumptions'));assert.ok(result.text.includes('25 years'));assert.ok(result.text.includes('BASES NOT COMPARABLE'));assert.ok(!result.text.includes('10.7 pp'));
});
test('PDF export respects premium gating and refuses changed owner during generation',async()=>{
 assert.equal((await render({authorized:false})).saved,false);assert.equal((await render({changeOwnerOnPage:true})).saved,false);
});

test('zero-equity PDF marks equity ROI as not applicable in Italian and English',async()=>{
 for(const lang of ['it','en']){const result=await render({lang,equityAmount:0,snapshot:{...assumptions,equity:0,loanAmount:150000}});assert.equal(result.saved,true);assert.ok(result.text.includes('N/A'));}
});

test('zero-equity PDF never represents ROE or equity payback as zero',async()=>{
 for(const lang of ['it','en']){
  const result=await render({lang,equityAmount:0,snapshot:{...assumptions,equity:0,loanAmount:150000}});
  const performance=result.calls.filter(x=>x.page===2),financing=result.calls.filter(x=>x.page===3);
  assert.ok(performance.some(x=>x.text==='N/A'));
  assert.ok(performance.some(x=>x.text.includes(lang==='en'?'With zero equity':'Con capitale proprio zero')));
  assert.ok(financing.some(x=>x.text==='ROE'));
  assert.ok(financing.some(x=>x.text==='N/A'));
  assert.ok(!performance.some(x=>/^0[.,]0 (anni|years)$/.test(x.text)));
  assert.ok(!financing.some(x=>x.text==='0.0%'));
 }
});

test('owned zero-value PDF keeps property yields and LTV unavailable and identifies the owned source',async()=>{
 const result=await render({equityAmount:0,propertyAmount:0,snapshot:{...assumptions,source:'owned_property',propertyPrice:0,equity:0,loanAmount:0}});
 assert.equal(result.saved,true);assert.match(result.text,/Immobile già di proprietà/);assert.match(result.text,/Non indicato/);
 assert.doesNotMatch(result.text,/NaN|Infinity/);
});
