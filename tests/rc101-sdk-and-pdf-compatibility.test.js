import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import admin from 'firebase-admin';
import {buildPDFScenarioCommentary} from '../js/pdf-scenario-commentary.js';
import {buildRevenueScenarios} from '../js/revenue-scenarios.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('updated Admin SDK preserves the server APIs used by the project without cloud requests',async()=>{
  const app=admin.initializeApp({projectId:'demo-rendimentobb-audit'},'offline-sdk-audit');
  try{
    const db=admin.firestore(app);
    for(const fn of [admin.auth(app).verifyIdToken,admin.auth(app).getUser,db.runTransaction,db.collection('audit').doc('offline').get,admin.firestore.FieldValue.serverTimestamp,admin.firestore.FieldValue.arrayUnion])assert.equal(typeof fn,'function');
  }finally{await app.delete();}
});
const bundle={exports:{}};
vm.runInNewContext(read('js/vendor/jspdf-4.2.1.umd.min.js'),{module:bundle,exports:bundle.exports,console,atob,btoa,setTimeout,clearTimeout,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer});
const jsPDF=bundle.exports.jsPDF;
const source=read('js/app.js');
const code=source.slice(source.indexOf('window.generateExecutivePDF ='),source.indexOf('// ================= AUTO CITY DETECTION'));
for(const lang of ['it','en'])for(const owned of [false,true])test(`real vendored PDF generation: ${lang}, ${owned?'owned zero capital':'purchase'}`,async()=>{
  let output,doc,filename;
  const window={currentLang:lang,getUserAccess:()=>({isPro:true,canDownloadPDF:true}),jspdf:{jsPDF:function(...args){doc=new jsPDF(...args);doc.save=name=>{filename=name;output=doc.output('arraybuffer');};return doc;}},RB_MARKET_DATA:{napoli:{roi:10.2}},
    lastAnalysisData:{propertyMode:owned?'owned':'purchase',assumptions:{source:owned?'owned_property':'simulator',loanYears:20,interestRate:3.5},roi:owned?0:23.5,roiAvailable:!owned,realROI:owned?0:4.7,annualProfit:owned?20995.24:7053.58,revenueAnnual:owned?38325:30000,price:owned?0:150000,equity:owned?0:30000,loan:owned?0:120000,annualDebtService:owned?0:8351,netOperatingIncome:owned?26576.25:19500,dscr:owned?0:2.33,risk:owned?15:25,investmentScore:owned?78:79,verdict:'BUY',city:'napoli',occupancy:70}};
  const ctx={window,sessionStorage:{getItem:()=> 'napoli'},document:{getElementById:()=>null},buildPDFScenarioCommentary,buildRevenueScenarios,calculateMortgage:()=>owned?0:8351,showToast:()=>{throw Error('unexpected toast');},openUpgradeModal:()=>{throw Error('unexpected upgrade');}};
  vm.runInNewContext(code,ctx);await window.generateExecutivePDF();
  assert.equal(jsPDF.version,'4.2.1');assert.equal(doc.getNumberOfPages(),8);
  assert.ok(output.byteLength>5000);assert.match(Buffer.from(output).toString('ascii',0,8),/^%PDF-/);
  assert.match(filename,owned?/ROI-N-A\.pdf$/:/23\.5ROI\.pdf$/);
});
