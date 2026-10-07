import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/chatbot/pdf-extraction-engine.js',import.meta.url),'utf8');
function setup({pages=['ROI -4,2%'],failure,stall,fastTimeout=false,numPages=pages.length}={}){
 let options,destroyed=0,deadline;
 const task={promise:stall==='load'?new Promise(()=>{}):failure?Promise.reject(failure):Promise.resolve({numPages,getPage:async()=>({getTextContent:()=>stall==='page'?new Promise(()=>{}):Promise.resolve({items:[{str:pages[0]}]})})}),destroy:async()=>{destroyed++;}};
 const c={window:{pdfjsLib:{GlobalWorkerOptions:{},getDocument:o=>{options=o;return task;}}},console:{error(){},warn(){},debug(){}},Uint8Array,setTimeout:(cb,ms)=>{deadline=ms;return setTimeout(cb,fastTimeout?0:ms);},clearTimeout};
 vm.createContext(c);vm.runInContext(source,c);
 return {run:doc=>c.window.rbExtractPDFText(doc),c,inspect:()=>({options,destroyed,deadline})};
}
const doc=()=>({buffer:new Uint8Array([1,2]),extractedText:'old',textPages:[{}],analysis:{roi:99},executiveContext:{score:99}});
test('PDF extraction disables eval and uses the matching local worker and fonts',async()=>{
 const s=setup();const input=doc();const r=await s.run(input);const i=s.inspect();assert.equal(r.extractionStatus,'ready');assert.equal(i.options.isEvalSupported,false);assert.equal(i.options.useWasm,false);assert.equal(i.options.disableFontFace,true);assert.equal(i.options.standardFontDataUrl,'/js/vendor/pdfjs/standard_fonts/');assert.equal(s.c.window.pdfjsLib.GlobalWorkerOptions.workerSrc,'/js/vendor/pdfjs/pdf.worker.min.mjs');assert.notEqual(i.options.data,input.buffer);assert.equal(i.destroyed,1);assert.equal(i.deadline,60000);assert.equal(r.analysis,null);
});
for(const stall of ['load','page'])test(`PDF timeout during ${stall} destroys the task and clears stale data`,async()=>{const s=setup({stall,fastTimeout:true});const r=await s.run(doc());assert.equal(r.extractionStatus,'timeout');assert.equal(r.extractedText,'');assert.equal(r.textPages.length,0);assert.equal(r.pageCount,0);assert.equal(r.analysis,null);assert.equal(r.executiveContext,null);assert.equal(s.inspect().destroyed,1);});
test('password failures clear old results and destroy the task',async()=>{const s=setup({failure:Object.assign(new Error(),{name:'PasswordException'})});const r=await s.run(doc());assert.equal(r.extractionStatus,'password_required');assert.equal(r.analysis,null);assert.equal(s.inspect().destroyed,1);});
test('page limit destroys the task once',async()=>{const s=setup({numPages:101});const r=await s.run(doc());assert.equal(r.extractionStatus,'too_many_pages');assert.equal(s.inspect().destroyed,1);});
test('text limit clears partial pages and destroys the task',async()=>{const s=setup({pages:['x'.repeat(250001)]});const r=await s.run(doc());assert.equal(r.extractionStatus,'too_much_text');assert.equal(r.textPages.length,0);assert.equal(r.extractedText,'');assert.equal(s.inspect().destroyed,1);});
test('missing reader clears previous analysis',async()=>{const s=setup();s.c.window.pdfjsLib=null;const r=await s.run(doc());assert.equal(r.extractionStatus,'unavailable');assert.equal(r.analysis,null);assert.equal(r.extractedText,'');});
test('loader imports the local module instead of the legacy external script',async()=>{const loader=await readFile(new URL('../js/chatbot-loader.js',import.meta.url),'utf8');assert.ok(loader.includes('return import(src)'));assert.ok(loader.includes('window.pdfjsLib=pdfjs')||loader.includes('window.pdfjsLib = pdfjs'));assert.ok(!loader.includes('3.11.174'));});
test('real vendored PDF reader and worker extract text from a PDF',async()=>{
 // Text extraction uses no canvas or geometry; Node lacks the browser DOMMatrix global.
 globalThis.DOMMatrix ??= class {};
 const pdfjs=await import('../js/vendor/pdfjs/pdf.min.mjs');
 assert.equal(pdfjs.version,'6.4.299');
 pdfjs.GlobalWorkerOptions.workerSrc=new URL('../js/vendor/pdfjs/pdf.worker.min.mjs',import.meta.url).href;
 const stream='BT /F1 12 Tf 50 700 Td (ROI -4,2% DSCR 0,94 Cashflow -6.678 EUR) Tj ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
 let pdf='%PDF-1.4\n';const offsets=[0];objects.forEach((o,i)=>{offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 const task=pdfjs.getDocument({data:new Uint8Array(Buffer.from(pdf)),isEvalSupported:false,useWasm:false,disableFontFace:true,standardFontDataUrl:new URL('../js/vendor/pdfjs/standard_fonts/',import.meta.url).pathname});
 try{const p=await task.promise;assert.equal(p.numPages,1);const text=(await (await p.getPage(1)).getTextContent()).items.map(i=>i.str).join(' ');assert.ok(text.includes('Cashflow -6.678 EUR'));assert.ok(text.includes('DSCR 0,94'));}finally{await task.destroy();}
});
