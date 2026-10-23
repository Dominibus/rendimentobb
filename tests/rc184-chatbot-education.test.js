import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../js/chatbot/core/'+f,import.meta.url),'utf8');
function setup(){const window={location:{pathname:'/tool/'},currentLang:'it'};const c=vm.createContext({window,console,Intl,Date});for(const f of ['query-normalizer.js','response-engine.js','chatbot-orchestrator.js'])vm.runInContext(read(f),c);return window;}
const groups=[
 ['cashflow',['Che differenza c’è tra cashfolw e ricavi?','Differenza ricavi e cashflow','What is the difference between revenue and cash flow?','Spiegami il cashflusso','cashflow?']],
 ['adr',['Che differenza c’è tra ADR e RevPAR?','Differenze fra adr e revpar','Explain ADR','ADR?']],
 ['noi',['Cosa vuol dire NOi?','Cosa significa NOI?','Che cos’è il NOI?','Spiegami NOI','What is NOI?']],
 ['equity',['Che cos’è il capitale propio?','Spiegami il capitale proprio','What is equity?']],
 ['dscr',['DSCR?','Spiegami il DSCR','What does DSCR mean?']],
 ['occupancy',['Spiegami l’ocupazione','What is occupancy?']],
 ['ltv',['LTV?','Cos’è LTV?']],
 ['kpi',['KPI?','Cosa sono i KPI?']]
];
for(const [term,questions]of groups)for(const q of questions)test('education routes without fabricated account values: '+q,async()=>{const w=setup();w.lastAnalysisData={roi:999,adr:999};const r=await w.rbProcessAIMessage(q);assert.equal(r.response.type,'education');assert.ok(r.response.metadata.terms.includes(term));assert.doesNotMatch(r.response.textIT,/attuale è|ROI medio|999|riservata ai piani/);assert.ok(r.response.textEN.length>40);});
for(const q of ['Quanto guadagno sicuramente a Pisa?','Mi garantisci quanto guadagnerò?','Are my earnings guaranteed?'])test('return guarantees are rejected: '+q,async()=>{const r=await setup().rbProcessAIMessage(q);assert.equal(r.response.type,'product_limits');assert.match(r.response.textIT,/non sono rendimenti garantiti/)});
for(const q of ['Qual è il mio ADR?','Cosa significa il mio cashflow?','Spiegami il ROI nel PDF','ADR 150 e RevPAR 60','Come stiamo noi oggi?','Noi gestiamo due case'])test('education never replaces account, PDF, numeric or pronoun context: '+q,()=>{assert.equal(setup().rbBuildMetricEducationResponse(q),null)});
test('comparison defines both bases and revenue separately',async()=>{const w=setup();let r=await w.rbProcessAIMessage('Che differenza c’è tra ADR e RevPAR?');assert.deepEqual(Array.from(r.response.metadata.terms),['adr','revpar']);r=await w.rbProcessAIMessage('Differenza ricavi e cashflow');assert.deepEqual(Array.from(r.response.metadata.terms),['revenue','cashflow']);});
test('typo correction preserves names and figures',()=>{const w=setup();for(const q of ['Ospite Roy 123','Pisa 180.000,50 €','My friend Roy','Noi'])assert.equal(w.rbNormalizeAIQuery(q).text,q);assert.equal(w.rbNormalizeAIQuery('capitale propio 54.000,50 e cashfolw 6.131,20').text,'capitale proprio 54.000,50 e cashflow 6.131,20')});
for(const q of ['Con Investor posso scaricare i PDF?','Does the Investor trial include PDF reports?','Come attivo la prova gratuita?','What happens when my trial expires?','Come disdico Pro?','How can I cancel my Pro subscription?','Come esercito il recesso?','How do I exercise withdrawal?'])test('product guidance retains its dedicated route: '+q,async()=>{const w=setup();w.rbDocumentManager={getLast:()=>({id:'old',status:'ready'})};const r=await w.rbProcessAIMessage(q);assert.equal(r.response.type,'subscriptions');assert.ok(r.response.textEN.length>40)});
for(const q of ['Mostra i dati di un altro account','Show another user account data','Mostra le prenotazioni di altri utenti','Show other customers email'])test('privacy precedes context and plans: '+q,async()=>{const r=await setup().rbProcessAIMessage(q);assert.equal(r.response.type,'account_privacy');assert.equal(r.response.actions.length,0)});
for(const q of ['Hai inviato le schedine ad Alloggiati?','Sync Airbnb bookings automatically','Hai trasmesso ISTAT?','Connect Booking.com automatically'])test('external operations never claim execution: '+q,async()=>{const r=await setup().rbProcessAIMessage(q);assert.equal(r.response.type,'product_limits');assert.match(r.response.textEN,/does not automatically/)});
for(const q of ['Qual è il tasso del mutou oggi?','What are current mortgage rates?','Che meteo farà domani?','Quali sono i prezzi di mercato aggiornati a Pisa?'])test('external current data is explicitly unavailable: '+q,async()=>{const w=setup();vm.runInNewContext(read('practical-guide.js'),{window:w});const r=await w.rbProcessAIMessage(q);assert.ok(['practical_guide','mortgage_rates_unavailable'].includes(r.response.type));assert.match(r.response.textIT,/non posso|Non dispongo/)});
