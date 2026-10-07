import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {buildPDFScenarioCommentary} from '../js/pdf-scenario-commentary.js';
import {buildRevenueScenarios} from '../js/revenue-scenarios.js';
import {updateSimulationROILabel,renderFreeSimulationPreview} from '../js/free-preview.js';
test('main ROI label follows paid/free access and updates translation attributes',()=>{
 for(const access of [{isFree:true},{isInvestor:true},{isPro:true},{isAdmin:true}])for(const lang of ['it','en']){
  const label={dataset:{}};const document={getElementById:id=>id==='roi-main-basis'?label:null};
  renderFreeSimulationPreview({},{access,document,lang});
  const paid=!access.isFree;assert.equal(label.textContent,lang==='en'?(paid?'Return on equity':'Property ROI'):(paid?'ROI sul capitale proprio':'ROI immobile'));
  assert.equal(label.dataset.it,paid?'ROI sul capitale proprio':'ROI immobile');
  updateSimulationROILabel({access:{isFree:true},document,lang});assert.equal(label.dataset.it,'ROI immobile');
 }
});
test('PDF commentary prioritizes losses and distinguishes zero from positive cashflow',()=>{
 assert.match(buildPDFScenarioCommentary({cashflow:-100,annualDebtService:1000,dscr:2}).insight,/disavanzo/);
 assert.match(buildPDFScenarioCommentary({cashflow:0}).insight,/pareggio/);
 assert.match(buildPDFScenarioCommentary({cashflow:100}).insight,/positivo nelle ipotesi/);
});
test('DSCR states do not certify financing and distinguish limited coverage from uncovered debt',()=>{
 for(const [debt,dscr,pattern] of [[0,null,/Nessuna rata/],[1000,null,/non disponibile/],[1000,.94,/sotto 1/],[1000,1.1,/limitato/],[1000,1.94,/ipotesi simulate/]])assert.match(buildPDFScenarioCommentary({cashflow:1,annualDebtService:debt,dscr}).financingLabel,pattern);
 const en=buildPDFScenarioCommentary({cashflow:-1,annualDebtService:1000,dscr:.94},(it,en)=>en);assert.match(en.insight,/deficit/);assert.match(en.financingLabel,/below 1/);
});
test('PDF verdict localizes the outcome without changing canonical machine values',()=>{
 const src=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');const start=src.indexOf('const pdfVerdictLabel =');const end=src.indexOf('const confidence =',start);
 for(const [verdict,label] of [['BUY','Favorevole'],['WAIT','Da verificare'],['WATCH','Da verificare'],['AVOID','Critico']]){
  const c={verdict,T:it=>it};vm.runInNewContext(src.slice(start,end)+'\nresult=pdfVerdictLabel;',c);assert.equal(c.result,label);assert.equal(c.verdict,verdict);
 }
 const pdf=src.slice(src.indexOf('window.generateExecutivePDF ='),src.indexOf('// SAVE',start));
 assert.doesNotMatch(pdf,/Qualità istituzionale|Investment Grade|T\("Completi"|Punti di forza|Finanziamento stimato sostenibile/);
 assert.match(pdf,/non è una raccomandazione di acquisto/);
});
test('complete PDF generator preserves seven pages and prints scenario metrics with revised commentary',async()=>{
 const app=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
 const code=app.slice(app.indexOf('window.generateExecutivePDF ='),app.indexOf('// ================= AUTO CITY DETECTION'));
 for(const net of [2446.89,0,-6678]){
  const texts=[];let pages=1;let filename;
  const doc=new Proxy({getNumberOfPages:()=>pages,addPage(){pages++;},text(value,x,y){texts.push({value:String(value),y,page:pages});},splitTextToSize:value=>[value],save:name=>filename=name},{get(target,key){return target[key]||(()=>{});}});
  const window={currentLang:'it',getUserAccess:()=>({isPro:true,canDownloadPDF:true}),jspdf:{jsPDF:function(){return doc;}},
   RB_MARKET_DATA:{roma:{roi:9.8}},lastAnalysisData:{roi:net/300,realROI:net/1500,annualProfit:net,revenueAnnual:27375,price:150000,equity:30000,loan:120000,annualDebtService:8351,mortgageYearly:8351,netOperatingIncome:13669,noi:13669,dscr:1.64,risk:58,investmentScore:41,verdict:'WAIT',city:'roma',occupancy:50}};
  const c={window,sessionStorage:{getItem:()=> 'roma'},document:{getElementById:()=>null},buildPDFScenarioCommentary,
   buildRevenueScenarios,
   calculateMortgage:()=>8351,showToast(){throw Error('Unexpected toast');},openUpgradeModal(){throw Error('Unexpected upgrade');}};
  vm.runInNewContext(code,c);await window.generateExecutivePDF();
  assert.equal(pages,7);assert.match(filename,/RendimentoBB-Fattibilita/);
  const joined=texts.map(t=>t.value).join('\n');assert.match(joined,/Da verificare/);assert.match(joined,/Ipotesi/);assert.match(joined,/Elementi da valutare/);
  assert.match(joined,net<0?/disavanzo/:net===0?/pareggio/:/positivo nelle ipotesi/);
  for(const item of texts)assert.ok(item.y===undefined || item.y<=278,`Text overflow on page ${item.page}: ${item.y}`);
 }
});
