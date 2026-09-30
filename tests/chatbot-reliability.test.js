import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const read = f => readFile(new URL('../'+f,import.meta.url),'utf8');
const files = ['core/memory-engine','core/conversation-engine','pdf-extraction-engine','pdf-parser-engine','document-engine','core/chatbot-file-dispatcher','ui/chatbot-ui'];
const sources = Object.fromEntries(await Promise.all(files.map(async f=>[f,await read('js/chatbot/'+f+'.js')])));
function storage(){const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
function context(selected,options={}){
 const events={};const messages=[];
 const c={window:{currentLang:'it',RB_DEBUG:false,addMessage:(role,text)=>messages.push(text),dispatchEvent(){}},document:{addEventListener:(n,cb)=>events[n]=cb,dispatchEvent(){}},CustomEvent:class{constructor(type,init={}){this.type=type;this.detail=init.detail;}},localStorage:storage(),sessionStorage:storage(),crypto:{randomUUID:()=>String(Math.random())},console:{log(){},debug(){},warn(){},error(){}},...options};
 vm.createContext(c);for(const f of selected)vm.runInContext(sources[f],c);return {c,messages,events};
}
test('legacy unowned memory is discarded',()=>{const local=storage();local.setItem('rbChatMemory',JSON.stringify({messages:[{message:'secret'}]}));const {c}=context(['core/memory-engine'],{localStorage:local});assert.equal(c.window.rbChatMemory.messages.length,0);assert.equal(local.getItem('rbChatMemory'),null);});
test('account change and logout clear messages, entities and active files',()=>{const {c}=context(['core/memory-engine']);c.window.rbSyncChatIdentity('A');c.window.rbRememberMessage({message:'secret',entities:{city:'roma'}});let cleared=0;c.window.rbDocumentManager={clear(){cleared++;}};c.window.rbSyncChatIdentity('B');assert.equal(c.window.rbChatMemory.messages.length,0);assert.equal(c.window.rbChatMemory.lastCity,null);assert.equal(cleared,1);c.window.rbRememberMessage({message:'B'});c.window.rbSyncChatIdentity(null);assert.equal(c.window.rbChatMemory.messages.length,0);});
test('same account reload restores session memory after auth resolves',()=>{const session=storage();let {c}=context(['core/memory-engine'],{sessionStorage:session});c.window.rbSyncChatIdentity('A');c.window.rbRememberMessage({message:'keep',entities:{city:'roma'}});({c}=context(['core/memory-engine'],{sessionStorage:session}));assert.equal(c.window.rbChatMemory.messages.length,0);c.window.rbSyncChatIdentity('A');assert.equal(c.window.rbChatMemory.messages[0].message,'keep');});
test('new conversation clears all remembered entities',()=>{const {c}=context(['core/memory-engine']);c.window.rbSyncChatIdentity('A');c.window.rbRememberMessage({message:'test',entities:{city:'roma',roi:20}});c.window.rbClearMemory();assert.equal(c.window.rbChatMemory.lastROI,null);assert.equal(c.window.rbChatMemory.lastCity,null);assert.equal(c.window.rbChatMemory.messages.length,0);});
test('empty conversation has no analysis; valid zero is still data',()=>{const {c}=context(['core/conversation-engine']);assert.equal(c.window.rbBuildConversationContext().hasAnalysis,false);assert.equal(c.window.rbBuildConversationContext({advisor:{roi:0}}).hasAnalysis,true);});
test('message renderer escapes markup and file names before formatting',()=>{const src=sources['ui/chatbot-ui'];const start=src.indexOf('  function escapeMessageText');const end=src.indexOf('  // ===========================================\n  // 💬 ADD MESSAGE',start);const c={};vm.createContext(c);vm.runInContext(src.slice(start,end),c);const out=c.renderExecutiveMessage('<img src=x onerror=alert(1)>\nExecutive Summary');assert.ok(!out.includes('<img'));assert.ok(out.includes('&lt;img'));assert.ok(out.includes('rb-section-title'));assert.ok(src.includes('escapeMessageText(text).replace'));});
test('unsupported files produce an explicit message',async()=>{const {c,messages}=context(['core/chatbot-file-dispatcher']);for(const name of ['scan.png','table.xlsx','word.docx'])assert.equal((await c.window.rbFileDispatcher.dispatch({name})).error,'unsupported');assert.equal(messages.length,3);});
test('surface area in square feet is converted to metres',async()=>{const {c}=context(['pdf-parser-engine']);const doc={type:'external_pdf',extractedText:'Property surface 1000 sq ft. Property price €210,000.'};await c.window.rbParseExecutivePDF(doc);assert.equal(doc.analysis.propertyFacts.surfaceSqm,92.9);});
function pdfMock(texts){return {GlobalWorkerOptions:{},getDocument(){return {promise:Promise.resolve({numPages:texts.length,getPage:async page=>({getTextContent:async()=>({items:[{str:texts[page-1]}]})}),destroy:async()=>{}})}}};}
test('PDF pages preserve provenance',async()=>{const {c}=context(['pdf-extraction-engine']);c.window.pdfjsLib=pdfMock(['Property price €210,000','Surface 85 mq']);const doc={buffer:new Uint8Array([1])};await c.window.rbExtractPDFText(doc);assert.equal(doc.extractionStatus,'ready');assert.equal(doc.pageCount,2);assert.equal(doc.textPages[1].page,2);assert.equal(doc.textPages[1].text,'Surface 85 mq');});
test('scanned PDF is not reported as successfully analyzed',async()=>{const {c,messages}=context(['document-engine','pdf-extraction-engine']);c.window.pdfjsLib=pdfMock(['']);const result=await c.window.rbAnalyzeUploadedPDF({name:'scan.pdf',size:1,arrayBuffer:async()=>new ArrayBuffer(1)});assert.equal(result.success,false);assert.equal(result.error,'no_text');assert.equal(result.document.analysis,null);assert.equal(result.document.buffer,null);assert.ok(messages.some(s=>s.includes('scansione')));assert.ok(!messages.some(s=>s.includes('PDF letto:')));});
test('missing PDF reader fails explicitly',async()=>{const {c}=context(['document-engine','pdf-extraction-engine']);const result=await c.window.rbAnalyzeUploadedPDF({name:'a.pdf',size:1,arrayBuffer:async()=>new ArrayBuffer(1)});assert.equal(result.error,'unavailable');assert.equal(result.success,false);});
test('large uploads are rejected before reading',async()=>{const {c}=context(['document-engine']);let read=false;const result=await c.window.rbAnalyzeUploadedPDF({name:'a.pdf',size:21*1024*1024,arrayBuffer:async()=>{read=true;}});assert.equal(result.error,'too_large');assert.equal(read,false);});
test('too many PDF pages are rejected',async()=>{const {c}=context(['pdf-extraction-engine']);c.window.pdfjsLib=pdfMock(Array(101).fill('x'));const doc={buffer:new Uint8Array([1])};await c.window.rbExtractPDFText(doc);assert.equal(doc.extractionStatus,'too_many_pages');});
test('successful PDF reports fields it actually recognized',async()=>{const {c,messages}=context(['document-engine','pdf-extraction-engine','pdf-parser-engine']);c.window.pdfjsLib=pdfMock(['Property price €210,000. Surface 85 mq.']);const result=await c.window.rbAnalyzeUploadedPDF({name:'brochure.pdf',size:1,arrayBuffer:async()=>new ArrayBuffer(1)});assert.equal(result.success,true);assert.ok(messages.some(s=>s.toLowerCase().includes('prezzo immobile')));assert.equal(result.document.analysis.roi,null);assert.equal(result.document.buffer,null);});
test('reset cancels an in-flight upload and prevents stale completion',async()=>{const {c,messages}=context(['core/memory-engine','document-engine','pdf-extraction-engine']);c.window.pdfjsLib=pdfMock(['Price €210,000']);let finish;const pending=c.window.rbAnalyzeUploadedPDF({name:'old.pdf',size:1,arrayBuffer:()=>new Promise(resolve=>finish=resolve)});c.window.rbClearMemory();finish(new ArrayBuffer(1));const result=await pending;assert.equal(result.error,'cancelled');assert.equal(c.window.rbActiveDocument,null);assert.ok(!messages.some(s=>s.includes('PDF letto:')));});

test('unreadable current PDF cannot use an old report or live scenario',async()=>{
 const c={window:{RB_DEBUG:false,lastExecutiveReport:{analysis:{roi:99}}},console};vm.createContext(c);
 vm.runInContext(await read('js/chatbot/core/response-engine.js'),c);
 const response=c.window.rbGenerateResponse({message:'Analizza questo PDF',documentKnowledge:{activeDocument:{status:'unreadable',fileName:'scan.pdf'}},analysisData:{roi:42}});
 assert.equal(response.type,'document_unavailable');assert.equal(response.metadata.fileName,'scan.pdf');assert.ok(!response.textIT.includes('42'));
});
test('missing-field answers distinguish unrecognized values from absent values',async()=>{
 const c={window:{RB_DEBUG:false},console};vm.createContext(c);vm.runInContext(await read('js/chatbot/core/response-engine.js'),c);
 const response=c.window.rbGenerateResponse({message:'Quali dati mancano nel PDF?',documentKnowledge:{activeDocument:{status:'ready',fileName:'brochure.pdf',analysis:{propertyPrice:210000,equity:null,gross:null,cashflow:null}}}});
 assert.equal(response.type,'document_data_quality');assert.equal(response.metadata.missingFields.length,3);assert.ok(response.textIT.includes('Non riconosciuto non significa'));
});
test('identity changes discard cached analysis; a new chat preserves current live input',()=>{
 const {c}=context(['core/memory-engine']);c.window.rbSyncChatIdentity('A');c.window.lastAnalysisData={roi:25};c.window.rbClearMemory();assert.equal(c.window.lastAnalysisData.roi,25);c.window.rbSyncChatIdentity('B');assert.equal(c.window.lastAnalysisData,null);
});

test('same completed PDF is reused without a second analysis', async()=>{
 const {c,messages}=context(['document-engine','pdf-extraction-engine','pdf-parser-engine']);
 c.window.pdfjsLib=pdfMock(['Property price €210,000.']);
 const file={name:'repeat.pdf',size:1,lastModified:123,arrayBuffer:async()=>new ArrayBuffer(1)};
 const first=await c.window.rbAnalyzeUploadedPDF(file);
 const second=await c.window.rbAnalyzeUploadedPDF(file);
 assert.equal(first.success,true);assert.equal(second.duplicate,true);
 assert.equal(c.window.rbDocumentLibrary.length,1);
 assert.equal(messages.filter(s=>s.includes('PDF letto:')).length,1);
 assert.equal(c.window.rbActiveDocument.id,first.document.id);
});
test('duplicate in-flight upload does not cancel the first reading',async()=>{
 const {c,messages}=context(['document-engine','pdf-extraction-engine','pdf-parser-engine']);
 c.window.pdfjsLib=pdfMock(['Property price €210,000.']);
 let finish;const file={name:'pending.pdf',size:1,arrayBuffer:()=>new Promise(resolve=>finish=resolve)};
 const first=c.window.rbAnalyzeUploadedPDF(file);
 const second=await c.window.rbAnalyzeUploadedPDF(file);
 assert.equal(second.error,'already_reading');finish(new ArrayBuffer(1));
 assert.equal((await first).success,true);assert.equal(messages.filter(s=>s.includes('PDF letto:')).length,1);
});
test('uploaded PDF interpretation ignores conflicting live defaults',async()=>{
 const {c}=context(['document-engine']);
 vm.runInContext(await read('js/chatbot/core/response-engine.js'),c);
 const doc={status:'ready',fileName:'roma.pdf',analysis:{roi:25.7,cashflow:10274,propertyPrice:160000,equity:40000,mortgage:120000,risk:23,gross:38325}};
 const response=c.window.rbGenerateResponse({message:'interpretami il pdf',documentKnowledge:{activeDocument:doc},analysisData:{roi:15,cashflow:0,risk:36,occupancy:65}});
 assert.equal(response.type,'document_grounded');assert.ok(response.textIT.includes('25.7%'));assert.ok(response.textIT.includes('10.274'));
 assert.ok(response.textIT.includes('75.0%'));assert.ok(!response.textIT.includes('15%'));assert.ok(!response.textIT.includes('65%'));
 assert.ok(!response.textIT.includes('ACQUISTA'));
});
test('document orchestrator answers once without invoking the live pipeline',async()=>{
 const {c}=context(['document-engine']);vm.runInContext(await read('js/chatbot/core/response-engine.js'),c);
 vm.runInContext(await read('js/chatbot/core/chatbot-orchestrator.js'),c);
 c.window.rbActiveDocument={status:'ready',fileName:'roma.pdf',analysis:{roi:25.7,cashflow:10274}};
 c.window.rbExtractEntities=()=>{throw new Error('live pipeline must not run');};
 const result=await c.window.rbProcessAIMessage('interpretami il pdf');
 assert.equal(result.success,true);assert.equal(result.response.type,'document_grounded');assert.equal(result.response.textIT.split('Fonte:').length,2);
});
test('upload messages reveal the conversation and remove the legacy executive wrapper',()=>{
 const src=sources['ui/chatbot-ui'];const start=src.indexOf('    function addMessage(');const end=src.indexOf('// 🧠 AI THINKING',start);
 const home={style:{}},quick={style:{}},messages={style:{display:'none'},children:[],appendChild(el){this.children.push(el);},scrollHeight:100};
 const c={document:{createElement:()=>({}),getElementById:id=>id==='rb-chat-home'?home:quick},messages,window:{},escapeMessageText:s=>String(s),renderExecutiveMessage:s=>String(s)};
 vm.createContext(c);vm.runInContext(src.slice(start,end),c);c.addMessage('assistant','PDF ricevuto');c.addMessage('bot','analisi');
 assert.equal(home.style.display,'none');assert.equal(messages.style.display,'block');assert.equal(messages.children.length,2);
 assert.ok(!messages.children[1].innerHTML.includes('rb-ai-card-header'));
});

test('actual Roma feasibility PDF parses and answers with its financial values',async()=>{
 const {c}=context(['pdf-parser-engine','document-engine']);
 const doc={status:'ready',type:'financial_report',fileName:'RendimentoBB-Fattibilita-roma-25.7ROI.pdf',extractedText:await read('tests/fixtures/roma-feasibility-pdf.txt')};
 await c.window.rbParseExecutivePDF(doc);
 assert.equal(doc.analysis.roi,25.7);assert.equal(doc.analysis.cashflow,10274);assert.equal(doc.analysis.propertyPrice,160000);assert.equal(doc.analysis.mortgage,120000);
 const answer=c.window.rbBuildPDFResponse('Interpretami il PDF',doc);
 assert.ok(answer.textIT.includes('25.7%'));assert.ok(answer.textIT.includes('10.274'));
});

test('financial follow-up stays on the PDF after upload',async()=>{
 const {c}=context(['document-engine']);vm.runInContext(await read('js/chatbot/core/response-engine.js'),c);vm.runInContext(await read('js/chatbot/core/chatbot-orchestrator.js'),c);
 c.window.rbActiveDocument={id:'active',status:'ready',fileName:'roma.pdf',analysis:{roi:25.7,cashflow:10274}};
 c.window.rbPDFConversationDocumentId='active';c.window.lastAnalysisData={roi:15,cashflow:0};
 const result=await c.window.rbProcessAIMessage('E il ROI?');
 assert.equal(result.response.type,'document_grounded');assert.ok(result.response.textIT.includes('25.7%'));
});
