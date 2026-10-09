import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {buildPDFScenarioCommentary} from '../js/pdf-scenario-commentary.js';
import {buildRevenueScenarios} from '../js/revenue-scenarios.js';
const source=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('window.generateExecutivePDF ='),source.indexOf('// ================= AUTO CITY DETECTION'));
async function render(lang,equity,reference=true){
  const texts=[];let page=1,filename='';
  const doc=new Proxy({getNumberOfPages:()=>page,addPage:()=>page++,text:(value,x,y)=>texts.push({page,text:String(value),y}),splitTextToSize:value=>[value],save:name=>filename=name},{get:(target,key)=>target[key] || (()=>{})});
  const window={currentLang:lang,getUserAccess:()=>({isPro:true,canDownloadPDF:true}),jspdf:{jsPDF:function(){return doc;}},RB_MARKET_DATA:reference?{napoli:{roi:10.2}}:{},
    lastAnalysisData:{assumptions:{loanYears:20,interestRate:3.5},roi:equity?-70.5:0,realROI:-4.2,annualProfit:-21151.61,revenueAnnual:28506.5,price:500000,equity,loan:500000-equity,annualDebtService:32709.73,netOperatingIncome:14630.525,dscr:.45,risk:80,investmentScore:0,verdict:'AVOID',city:'napoli',occupancy:71}};
  const ctx={window,sessionStorage:{getItem:()=> 'napoli'},document:{getElementById:()=>null},buildPDFScenarioCommentary,buildRevenueScenarios,calculateMortgage:()=>32709.73,showToast:()=>{throw Error('unexpected toast');},openUpgradeModal:()=>{throw Error('unexpected upgrade');}};
  vm.runInNewContext(code,ctx);await window.generateExecutivePDF();return {texts,page,filename};
}
for(const lang of ['it','en'])for(const equity of [0,30000])test(`complete Tool PDF uses neutral internal references: ${lang}, equity ${equity}`,async()=>{
  const r=await render(lang,equity),all=r.texts.map(t=>t.text).join('\n'),market=r.texts.filter(t=>t.page===4).map(t=>t.text).join('\n');
  assert.equal(r.page,7);
  assert.match(market,lang==='en'?/BASES NOT COMPARABLE/:/BASI NON COMPARABILI/);
  assert.match(market,/10[.,]2%/);
  assert.doesNotMatch(all,/Below reference|Above reference|Sotto riferimento|Sopra riferimento|Market equity ROI|ROI equity di mercato|Local benchmark|Benchmark locale/);
  if(!equity){assert.match(market,/N\/A/);assert.match(r.filename,/ROI-N-A\.pdf$/);}
  else{assert.match(market,/-70[.,]5%/);assert.match(r.filename,/-70\.5ROI\.pdf$/);}
  for(const t of r.texts)assert.ok(t.y===undefined || t.y<=278);
});
test('Tool PDF does not invent a general reference for an unsupported city',async()=>{
  const r=await render('en',0,false),market=r.texts.filter(t=>t.page===4).map(t=>t.text).join('\n');
  assert.match(market,/Unavailable/);assert.doesNotMatch(market,/8[.,]4%|10[.,]2%/);
});
