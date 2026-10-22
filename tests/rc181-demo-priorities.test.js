import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('function renderTodayBookingOperations'),source.indexOf('window.setPMSTaskStatus'));
for(const lang of ['it','en'])test('read-only demo explains unavailable priorities instead of claiming all-clear: '+lang,()=>{
 const container={innerHTML:''};
 const ctx={isDemo:()=>true,window:{currentLang:lang,rbChecklistBookings:[{id:'old'}],t:(it,en)=>lang==='en'?en:it},document:{getElementById:()=>container},checklistDay:()=>assert.fail('Do not compute empty operational data')};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 ctx.renderTodayBookingOperations([]);
 assert.match(container.innerHTML,lang==='en'?/not calculated/:/non sono calcolate/);
 assert.match(container.innerHTML,new RegExp((lang==='en'?'/en':'')+'/demo/hospitality-pms/'));
 assert.doesNotMatch(container.innerHTML,/Tutto sotto controllo|Everything under control|Nessuna attività|No tasks/);
 assert.equal(ctx.window.rbChecklistBookings.length,0);
});
const guide=readFileSync(new URL('../js/chatbot/core/pro-report-guide.js',import.meta.url),'utf8');
for(const q of ['Interpreta il report corrente','Spiegami il cashflow e il ROI della simulazione che sto leggendo nel report.','Interpret the current report','Explain the ROI of my analysis','E quello mensile?','What about cashflow?'])test('current report never borrows stale conversation figures: '+q,()=>{
 const window={location:{pathname:'/dashboard-report/'},lastAnalysisData:{city:'wrong',net:0,risk:0},rbChatMemory:{lastCashflow:0},rbDocumentManager:{getLast:()=>null}};
 vm.runInNewContext(guide,{window});const response=window.rbBuildProReportGuide(q);
 assert.equal(response.metadata.mode,'current_report_needs_pdf');assert.match(response.textIT,/non ho una fotografia verificata/);
 assert.doesNotMatch(response.textIT,/0,00|0\/100/);assert.deepEqual(Array.from(response.actions),[]);
});
test('uploaded PDF is not intercepted by the missing-current-report guard',()=>{
 const window={location:{pathname:'/dashboard-report/'},rbDocumentManager:{getLast:()=>({id:'pdf-current',status:'ready',extractedText:'REPORT INVESTIMENTO E GESTIONE ANDAMENTO IMMOBILI E PORTFOLIO'})},currentUser:{uid:'owner'},getUserAccess:()=>({isPro:true}),rbBuildPMSDocumentResponse:()=>({type:'document_grounded',documentId:'pdf-current'})};
 vm.runInNewContext(guide,{window});assert.equal(window.rbBuildProReportGuide('Interpreta il report corrente').type,'document_grounded');
});
