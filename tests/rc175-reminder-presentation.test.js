import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {buildReminderEmail} from '../lib/pms-reminder-model.js';
import {buildPDFScenarioCommentary} from '../js/pdf-scenario-commentary.js';
import {buildRevenueScenarios} from '../js/revenue-scenarios.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const item={bookingId:'same-booking',propertyName:'Casa',guestName:'Test',status:'open',dueDate:'2026-10-22',code:'arrival'};
test('one stay with two operations is reported as two tasks, not two bookings',()=>{
  const rows=[item,{...item,code:'authority'}];
  for(const lang of ['it','en']){
    const email=buildReminderEmail(rows,'2026-10-22',lang);
    assert.match(email.text,lang==='it'?/2 attività da verificare in questa email/:/2 tasks to review in this email/);
    assert.match(email.text,lang==='it'?/Con data superata: 0; oggi: 2; domani: 0/:/Past due date: 0; today: 2; tomorrow: 0/);
    assert.match(email.text,lang==='it'?/non conteggi di prenotazioni/:/not booking counts/);
    assert.match(email.text,lang==='it'?/Riepilogo basato sui dati salvati nel tuo account/:/Summary based on the data saved in your account/);
    assert.ok(!email.html.includes('Generata dai dati inviati'));assert.ok(!email.html.includes('Generated from the data submitted'));
    assert.match(email.html,/href="https:\/\/rendimentobb.it\/dashboard\/"/);
  }
});
test('summary separates overdue, today and tomorrow without counting unrelated future tasks',()=>{
  const rows=[{...item,dueDate:'2026-10-21'},item,{...item,dueDate:'2026-10-23'}];
  assert.match(buildReminderEmail(rows,'2026-10-22').text,/3 attività[^\n]*Con data superata: 1; oggi: 1; domani: 1/);
  const single=buildReminderEmail([item],'2026-10-22','en');assert.match(single.text,/1 task to review/);assert.doesNotMatch(single.text,/1 tasks/);
  assert.match(single.text,/up to 20 dated tasks/);
});
test('displayed count refers to the selected email rows when the queue caps a large account',()=>{
  const selected=Array.from({length:20},(_,i)=>({...item,bookingId:String(i)}));
  const email=buildReminderEmail(selected,'2026-10-22');
  assert.match(email.text,/20 attività da verificare in questa email/);
  assert.match(email.text,/al massimo 20 attività con data/);assert.match(email.text,/checklist completa è nel PMS/);
});

const bundle={exports:{}};
vm.runInNewContext(read('js/vendor/jspdf-4.2.1.umd.min.js'),{module:bundle,exports:bundle.exports,console,atob,btoa,setTimeout,clearTimeout,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer});
const {jsPDF}=bundle.exports,source=read('js/app.js');
const code=source.slice(source.indexOf('window.generateExecutivePDF ='),source.indexOf('// ================= AUTO CITY DETECTION'));
for(const [lang,city,expected] of [['it','firenze','Mercato • Firenze'],['en','firenze','Market • Florence'],['en','Portici (NA)','Market • Portici (NA)']])test('actual generated PDF localizes city without changing the saved location: '+lang+'/'+city,async()=>{
  const text=[];let doc;
  const data={city,realCity:city,marketCity:city,assumptions:{loanYears:20,interestRate:3.5},roi:28.6,roiAvailable:true,price:150000,equity:30000,loan:120000,annualProfit:8587.74,revenueAnnual:36463.5,risk:25,investmentScore:79,verdict:'BUY',occupancy:74};
  const before=JSON.stringify(data);
  const window={currentLang:lang,lastAnalysisData:data,getUserAccess:()=>({isPro:true,canDownloadPDF:true}),RB_MARKET_DATA:{firenze:{roi:11.1}},jspdf:{jsPDF:function(...args){doc=new jsPDF(...args);const original=doc.text;doc.text=function(value,...rest){text.push(value);return original.call(this,value,...rest);};doc.save=()=>{};return doc;}}};
  vm.runInNewContext(code,{window,document:{getElementById:()=>null},sessionStorage:{getItem:()=>city},localStorage:{getItem:()=>null},buildPDFScenarioCommentary,buildRevenueScenarios,calculateMortgage:()=>8351.42,showToast:()=>assert.fail('unexpected toast'),openUpgradeModal:()=>assert.fail('unexpected upgrade')});
  await window.generateExecutivePDF();
  assert.ok(text.includes(expected));assert.equal(doc.getNumberOfPages(),8);assert.equal(JSON.stringify(data),before);
});
