import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/chatbot/core/pms-document-evidence.js',import.meta.url),'utf8');
const text='ANDAMENTO IMMOBILI E PORTFOLIO Ambito: Tutte le proprietà Periodo di competenza: 2026-10-01 / 2026-10-31 Ricavi attribuiti al periodo 4800,00 EUR Soggiorni nel periodo 9 Notti prenotate nel periodo 24 Occupazione del periodo 15,5% ADR 200,00 EUR RevPAR 30,97 EUR Registrazioni - tutti i periodi';
function answer(q,{body=text,pro=true}={}){const window={currentUser:{uid:'synthetic'},getUserAccess:()=>({isPro:pro})};vm.runInNewContext(source,{window,Intl,Date});return window.rbBuildPMSDocumentResponse(q,{status:'ready',id:'synthetic',fileName:'synthetic.pdf',extractedText:body});}
for(const q of ['Quali sono ricavi, occupazione e ADR del PDF?','What are revenue, occupancy and ADR in the PDF?'])test(q,()=>{const a=answer(q);assert.match(a.textIT,/4\.?800,00/);assert.match(a.textIT,/15,5%/);assert.match(a.textIT,/ADR: 200,00/);assert.match(a.textEN,/4,800\.00/);assert.match(a.textEN,/15\.5%/);assert.match(a.textEN,/ADR: €200\.00/);});
test('all requested operational metrics remain in scope',()=>{const a=answer('PDF: ricavi, occupazione, ADR, RevPAR, soggiorni, notti e scostamento');for(const s of ['4800,00','15,5%','ADR: 200,00','RevPAR: 30,97','Soggiorni: 9','Notti prenotate: 24','confronto omogeneo'])assert.ok(a.textIT.includes(s),s);});
test('financial and missing-data questions retain operational evidence and limits',()=>{for(const q of ['Ricavi e ROI effettivo del PDF?','ADR e cashflow del PDF?','Revenue and actual DSCR in the PDF?','Occupazione e quali dati mancano nel PDF?']){const a=answer(q);assert.match(a.textIT,/Questo report non calcola ROI/);assert.match(a.textIT,/4\.?800,00|ADR: 200,00|15,5%/);}});
test('missing values do not reuse dashboard or previous document',()=>{const a=answer('ricavi e ADR del PDF',{body:text.replace('ADR 200,00 EUR','')});assert.match(a.textIT,/ADR: N\/D/);assert.match(a.textIT,/4\.?800,00/);});
test('explicit zeros are preserved',()=>{const a=answer('ricavi e ADR del PDF',{body:text.replace('4800,00','0,00').replace('200,00','0,00')});assert.match(a.textIT,/periodo: 0,00/);assert.match(a.textIT,/ADR: 0,00/);});
test('Investor cannot obtain compound PDF results',()=>{const a=answer('ricavi occupazione ADR PDF',{pro:false});assert.equal(a.metadata.answerMode,'access');assert.doesNotMatch(a.textIT,/4\.800/);});
test('single metric retains focused explanation',()=>{const a=answer('Spiegami occupazione PDF');assert.match(a.textIT,/15,5%/);assert.doesNotMatch(a.textIT,/ADR: 200/);});
test('mixed report financial routing remains separate',()=>{assert.equal(answer('ROI e ADR del PDF',{body:'REPORT INVESTIMENTO E GESTIONE '+text}),null);});
