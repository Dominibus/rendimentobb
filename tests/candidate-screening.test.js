import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {validateCandidate,candidateNumber,candidateCSVPreview,commitCandidatePreview,validateCandidateCriteria,evaluateCandidate,orderCandidateRows,applyCandidateAssumptions,candidateToolURL,readCandidateTransfer,candidateTemplate,CANDIDATE_FIELDS,ECONOMIC_FIELDS} from '../js/candidate-screening.js';
import {explainCandidate} from '../js/candidate-copy.js';
import {installCandidateTransfer} from '../js/candidate-transfer.js';
import {installPropertyScenarioInputs,readPropertyScenario} from '../js/property-scenario-inputs.js';
const raw=(patch={})=>({reference:'C-1',city:'Roma',zone:'Nord',price:'150.000,50',sqm:'70,5',works:'0',other:'5.000',...patch});
const candidate=patch=>{const r=validateCandidate(raw(patch));assert.equal(r.valid,true,JSON.stringify(r.errors));return r.candidate;};
const criteria=(patch={})=>validateCandidateCriteria({maxTotal:'200.000',...patch}).values;
test('complete, outside and incomplete candidates have distinct states and truthful reasons',()=>{
 const a=evaluateCandidate(candidate(),criteria());assert.equal(a.status,'compatible');assert.equal(a.total,155000.5);
 const b=evaluateCandidate(candidate({price:'250.000'}),criteria());assert.equal(b.status,'outside');assert.equal(b.reasons[0].code,'maxTotal');assert.match(explainCandidate(b,'it'),/superiore al budget.*255\.000.*200\.000/s);assert.match(explainCandidate(b,'en'),/exceeds budget.*255,000.*200,000/s);
 const c=evaluateCandidate(candidate({price:'',works:''}),criteria());assert.equal(c.status,'insufficient');assert.equal(c.total,null);assert.ok(c.missing.includes('price'));assert.match(explainCandidate(c,'en'),/Missing:.*Asking price/);
});
test('zero is intentional for costs/capital/budget, while missing values stay null',()=>{
 const c=candidate({equity:'0',works:'0',other:''});assert.equal(c.equity,0);assert.equal(c.works,0);assert.equal(c.other,null);
 assert.equal(evaluateCandidate(c,criteria()).status,'insufficient');assert.equal(evaluateCandidate(candidate({equity:'0'}),criteria({availableCapital:'0'})).status,'compatible');
 assert.equal(evaluateCandidate(candidate(),criteria({maxTotal:'0'})).status,'outside');
 for(const f of ['price','sqm','loanYears'])assert.equal(validateCandidate(raw({[f]:'0'})).valid,false);
});
test('no mandatory criteria and missing equity cannot become a match; preference never changes status',()=>{
 const c=candidate();assert.equal(evaluateCandidate(c,validateCandidateCriteria({preferredZone:'Nord'}).values).status,'insufficient');
 assert.equal(evaluateCandidate(c,criteria({availableCapital:'30.000'})).status,'insufficient');
 const a=evaluateCandidate(c,criteria({preferredZone:'Sud'}));assert.equal(a.status,'compatible');assert.equal(a.preference.matches,false);
 assert.equal(evaluateCandidate(c,criteria({zone:'Sud'})).status,'outside');assert.equal(evaluateCandidate(c,criteria({city:' roma '})).status,'compatible');
});
for(const [text,format,expected]of [['150.000,50','it',150000.5],['150,000.50','en',150000.5],['0,00','it',0],['0.00','en',0],['70,5','it',70.5],['70.5','en',70.5]])test('explicit numeric format: '+text,()=>assert.equal(candidateNumber(text,format),expected));
for(const value of ['-1','NaN','Infinity','1e9','1.00,50','1,2,3',true,'€3x'])test('invalid numeric input: '+value,()=>assert.equal(validateCandidate(raw({price:value})).valid,false));
for(const patch of [{city:'<img onerror=alert(1)>'},{zone:'=HYPERLINK("x")'},{reference:'../secret'},{url:'javascript:alert(1)'},{url:'https://user:pass@example.com/'},{url:'http://example.com/'},{date:'2026-02-29'},{email:'private@example.test'}])test('reject dangerous/unexpected fields '+JSON.stringify(patch),()=>assert.equal(validateCandidate(raw(patch)).valid,false));
test('template gives synthetic complete, outside and insufficient examples, without importing anything',()=>{
 const preview=candidateCSVPreview(candidateTemplate());assert.deepEqual(candidateCSVPreview(readFileSync(new URL('../examples/candidati-sintetici.csv',import.meta.url),'utf8')),preview);assert.equal(preview.length,3);assert.ok(preview.every(r=>r.valid));assert.deepEqual(preview.map(r=>evaluateCandidate(r.candidate,criteria()).status),['compatible','outside','insufficient']);
 const existing=[];assert.equal(existing.length,0);const imported=commitCandidatePreview(existing,preview,[2,4]);assert.deepEqual(imported.map(c=>c.reference),['C-001','C-003']);assert.equal(existing.length,0);
});
test('CSV handles quoting, BOM, unknown columns, malformed quotes, row bounds and payload bounds',()=>{
 const p=candidateCSVPreview('\uFEFFreference;city;price_eur\r\nX-1;"Roma; centro";"150.000,50"');assert.equal(p[0].candidate.city,'Roma; centro');
 for(const input of ['reference;agent_email\nC-1;a@b.test','reference;reference\nC-1;C-2','reference;city\n"unclosed;Roma','reference;city\n'+Array.from({length:51},(_,i)=>`C-${i};Roma`).join('\n'),'x'.repeat(512001)])assert.throws(()=>candidateCSVPreview(input));
 assert.equal(candidateCSVPreview('reference;city\nC-1;Roma;extra')[0].valid,false);
 assert.equal(candidateCSVPreview('reference;city\nC-1;"<script>alert(1)</script>"')[0].valid,false);
});
test('duplicate references and exact URLs are reported, including duplicates within one CSV',()=>{
 let rows=candidateCSVPreview('reference;city\nC-1;Roma\nC-1;Milano');assert.ok(rows.every(r=>!r.valid&&r.errors.includes('duplicate_reference')));
 rows=candidateCSVPreview('reference;listing_url\nC-2;https://example.com/a\nC-3;https://example.com/a');assert.ok(rows.every(r=>!r.valid&&r.errors.includes('duplicate_url')));
 rows=candidateCSVPreview('reference;city\nC-1;Roma',{existing:[candidate()]});assert.equal(rows[0].valid,false);
 assert.throws(()=>commitCandidatePreview([candidate()],candidateCSVPreview('reference;city\nC-1;Roma'),[2]));
});
test('sort and filter preserve references, explanations and always put missing values last',()=>{
 const data=[candidate({reference:'A',price:'',other:''}),candidate({reference:'B',price:'100.000'}),candidate({reference:'C',price:'200.000'})];
 const rows=data.map(c=>evaluateCandidate(c,criteria()));for(const direction of ['asc','desc'])assert.equal(orderCandidateRows(rows,'price:'+direction).at(-1).candidate.reference,'A');
 assert.deepEqual(orderCandidateRows(rows,'price:asc').filter(r=>r.status==='compatible').map(r=>r.candidate.reference),['B']);
 assert.equal(rows[0].candidate.reference,'A');assert.deepEqual(orderCandidateRows(rows,'entered'),rows);
});
test('common assumptions are explicit, apply only supplied fields to selected IDs and never infer prices',()=>{
 const a=candidate({reference:'A',priceNight:'100'}),b=candidate({reference:'B',priceNight:'200'});
 const applied=applyCandidateAssumptions([a,b],['B'],{priceNight:'0',occupancy:'60',expenses:''});
 assert.equal(applied[0].priceNight,100);assert.equal(applied[1].priceNight,0);assert.equal(applied[1].origins.priceNight,'common');assert.equal(applied[1].expenses,null);assert.equal(b.priceNight,200);assert.equal(applied[1].price,b.price);
 for(const raw of [{price:'1'},{priceNight:'-10'},{}])assert.throws(()=>applyCandidateAssumptions([a],['A'],raw));
});
test('handoff carries compatible declared inputs, preserves zero and excludes costs/URL from financial inputs',()=>{
 const c=candidate({reference:'A',equity:'0',priceNight:'120',occupancy:'60',expenses:'0',interestRate:'0',loanYears:'20',url:'https://example.com/a'});
 const url=candidateToolURL(c);assert.ok(url.startsWith('/tool/?from=candidate#'));const r=readCandidateTransfer(url.slice(url.indexOf('?')));assert.equal(r.status,'valid');assert.equal(r.candidate.reference,'A');assert.equal(r.candidate.price,c.price);assert.equal(r.candidate.equity,0);assert.equal(r.candidate.interestRate,0);assert.equal(r.candidate.works,null);assert.equal(r.candidate.other,null);assert.equal(r.candidate.url,'');
 assert.equal(readCandidateTransfer('?from=candidate&c_reference=A&c_price=1&c_price=2').status,'invalid');assert.equal(readCandidateTransfer('?from=candidate&c_reference=A&c_tax=oops').status,'invalid');assert.equal(readCandidateTransfer('?from=candidate&c_reference=A&c_unknown=1').status,'invalid');
 assert.equal(readPropertyScenario('?city=roma&price=150000&night=120&occ=60').status,'valid');
});
function transferHarness(query,pending=false){
 const fields=new Map(['price','equity','priceNight','occupancy','expenses','commission','tax','interestRate','loanYears','loanAmount','property-mode','custom-location','market-city','property-scenario-status','property-banner'].map(id=>[id,{value:'OLD',dataset:{municipality:'old'},style:{},dispatchEvent(){},handlers:{},addEventListener(n,f){(this.handlers[n]??=[]).push(f);}}]));
 const events={};const window={location:{search:query.split('#')[0],hash:query.includes('#')?'#'+query.split('#')[1]:'',pathname:'/tool/'},currentLang:'it',Event:class{},sessionStorage:{getItem:()=>pending?'pending':null},rbSetPropertyMode:()=>{},calculateROI:()=>assert.fail('no calculation'),saveAnalysis:()=>assert.fail('no save')};
 const document={readyState:'complete',getElementById:id=>fields.get(id),addEventListener:(name,fn)=>events[name]=fn};return {window,document,fields,events};
}
test('actual simulator installer clears stale fields and lists transferred/missing inputs in IT/EN without writes',()=>{
 const c=candidate({priceNight:'0',equity:'0'}),h=transferHarness(candidateToolURL(c).split('?')[1]);installPropertyScenarioInputs(h.window,h.document);
 assert.equal(h.fields.get('price').value,String(c.price));assert.equal(h.fields.get('equity').value,'0');assert.equal(h.fields.get('priceNight').value,'0');assert.equal(h.fields.get('expenses').value,'');assert.equal(h.fields.get('tax').value,'');assert.equal(h.fields.get('loanAmount').value,'');assert.equal(h.fields.get('custom-location').dataset.municipality,undefined);
 assert.match(h.fields.get('property-scenario-status').textContent,/Da completare:.*Costi operativi/);h.window.currentLang='en';h.events.rb_language_changed();assert.match(h.fields.get('property-scenario-status').textContent,/No calculation, save or PMS property created/);assert.match(h.fields.get('property-scenario-status').textContent,/Works, other upfront costs and the link are not transferred/);
});
test('existing mortgage scenario takes priority and malformed candidate handoff never modifies fields',()=>{
 for(const [query,pending]of [[candidateToolURL(candidate()).split('?')[1],true],['from=candidate&c_reference=BAD&c_price=-1',false]]){const h=transferHarness(query,pending);installCandidateTransfer(h.window,h.document);assert.equal(h.fields.get('price').value,'OLD');assert.match(h.fields.get('property-scenario-status').textContent,/mutuo|non valido/);assert.equal(h.window.rbCandidateInputsReady(),pending);}
});
const responseSource=readFileSync(new URL('../js/chatbot/core/candidate-response-engine.js',import.meta.url),'utf8');
function assistant(){const w={location:{pathname:'/immobili/candidati/'},currentUser:{uid:'owner'}};const a=evaluateCandidate(candidate({price:'250.000',priceNight:'120'}),criteria());let ctx={page:'/immobili/candidati/',ownerUid:'owner',active:'C-1',rows:[{reference:'C-1',status:a.status,explanationIT:explainCandidate(a,'it'),explanationEN:explainCandidate(a,'en'),assumptions:[{value:120,origin:'common',labelIT:'Tariffa ipotizzata EUR/notte',labelEN:'Assumed nightly rate EUR'}]}]};w.rbCandidateWorkspace={getContext:()=>ctx};vm.runInNewContext(responseSource,{window:w});return {w,set:c=>ctx=c};}
for(const query of ['Perché il candidato è fuori dai criteri?','Why is this candidate outside the criteria?','Quali dati mancano?','Which assumptions did you use?','Qual è il prossimo passo?'])test('assistant uses same reasons and full limitations IT/EN: '+query,()=>{
 const {w}=assistant(),r=w.rbBuildCandidateResponse(query);assert.match(r.textIT,/superiore al budget/);assert.match(r.textEN,/exceeds budget/);assert.match(r.textEN,/explicit common assumption/);assert.match(r.textIT,/Qui non calcolo ROI/);assert.match(r.textEN,/I have not opened tabs, saved or changed candidates/);assert.equal(r.actions.length,0);
});
test('assistant rejects old page/account contexts, uses exact IDs and never falls back to PMS/PDF data',()=>{
 const {w,set}=assistant();w.lastAnalysisData={roi:999};assert.equal(w.rbBuildCandidateResponse('Leggi il PDF'),null);let r=w.rbBuildCandidateResponse('Spiega candidato C-10');assert.equal(r.metadata.state,'selection');
 w.currentUser=null;r=w.rbBuildCandidateResponse('Which candidate?');assert.equal(r.metadata.state,'unavailable');assert.doesNotMatch(JSON.stringify(r),/250\.000|999/);
 w.currentUser={uid:'owner'};w.location.pathname='/dashboard/';assert.equal(w.rbBuildCandidateResponse('Explain candidate C-1').metadata.state,'unavailable');w.location.pathname='/immobili/candidati/';set(null);assert.equal(w.rbBuildCandidateResponse('Why this candidate?').metadata.state,'unavailable');
});

test('numeric sorts do not promote a cheap candidate with incomplete costs',()=>{
 const incomplete=evaluateCandidate(candidate({reference:'CHEAP',price:'1',works:''}),criteria()),complete=evaluateCandidate(candidate({reference:'FULL'}),criteria());
 for(const key of ['price:asc','price:desc','total:asc','sqm:desc'])assert.equal(orderCandidateRows([incomplete,complete],key).at(-1).candidate.reference,'CHEAP');
});

test('real orchestrator gives candidate context priority over generic source/ROI routing',async()=>{
 const {w}=assistant();vm.runInNewContext(readFileSync(new URL('../js/chatbot/core/chatbot-orchestrator.js',import.meta.url),'utf8'),{window:w,console,Intl,Date});
 for(const q of ['Quali ipotesi hai usato per questo candidato?','Why is the candidate outside the criteria?']){const r=await w.rbProcessAIMessage(q);assert.equal(r.response.type,'candidate_explanation');assert.match(r.response.textEN,/exceeds budget/);}
});

test('candidate-specific calculation guard blocks legacy defaults until every economic input is explicit',async()=>{
 const h=transferHarness(candidateToolURL(candidate()).split('?')[1]);installCandidateTransfer(h.window,h.document);
 assert.equal(h.window.rbCandidateInputsReady(),false);assert.match(h.fields.get('property-scenario-status').textContent,/esplicitamente/);
 for(const f of ['price',...ECONOMIC_FIELDS])h.fields.get(f).value=f==='price'?'150000':f==='loanYears'?'20':'0';
 // A browser range has a value even when not supplied: filling other fields must not confirm it.
 assert.equal(h.window.rbCandidateInputsReady(),false);for(const fn of h.fields.get('occupancy').handlers.input)fn({isTrusted:true});assert.equal(h.window.rbCandidateInputsReady(),true);
 const app=readFileSync(new URL('../js/app.js',import.meta.url),'utf8'),start=app.indexOf('window.calculate = async function(mode = false){'),end=app.indexOf('\n\n',start);
 // Execute the real entry guard, before any legacy calculation body or access logic.
 const prefix=app.slice(start,end)+'\nwindow.proceeded=true;};';
 const w={location:{search:'?from=candidate'},rbCandidateInputsReady:()=>false};vm.runInNewContext(prefix,{window:w,URLSearchParams});await w.calculate();assert.equal(w.proceeded,undefined);w.rbCandidateInputsReady=()=>true;await w.calculate();assert.equal(w.proceeded,true);
});

test('duplicate reference case and nonexistent selections are rejected instead of claiming a change',()=>{
 const rows=candidateCSVPreview('reference;city\nC-1;Roma\nc-1;Roma');assert.ok(rows.every(r=>!r.valid));
 assert.throws(()=>commitCandidatePreview([],candidateCSVPreview('reference;city\nA;Roma'),[2,99]));
 assert.throws(()=>applyCandidateAssumptions([candidate()],['MISSING'],{priceNight:'100'}));
});

test('fractional occupancy transfers exactly; range cannot silently supply an absent occupancy',()=>{
 const h=transferHarness(candidateToolURL(candidate({occupancy:'60,55'})).split('?')[1]);installCandidateTransfer(h.window,h.document);assert.equal(h.fields.get('occupancy').step,'any');assert.equal(h.fields.get('occupancy').value,'60.55');assert.equal(h.fields.get('occupancy').dataset.candidateMissing,'false');
});

test('equity above the asking price is rejected, never silently capped, including common assumptions',()=>{
 assert.equal(validateCandidate(raw({equity:'200.000'})).valid,false);
 const c=candidate();assert.throws(()=>applyCandidateAssumptions([c],['C-1'],{equity:'200.000'}));assert.equal(c.equity,null);
});

test('next-step and number-source questions stay with the candidate page; multi-property requests discover the route',()=>{
 const {w}=assistant();for(const q of ['Cosa devo fare adesso?','What should I do now?','Da dove viene questo numero?','Where does this number come from?']){const r=w.rbBuildCandidateResponse(q);assert.equal(r.metadata.reference,'C-1');assert.match(r.textEN,/Next step: verify/);}
 w.location.pathname='/';const r=w.rbBuildCandidateResponse('Ho 30 immobili da valutare e confrontare');assert.match(r.textIT,/Immobili → Confronta i tuoi candidati/);assert.equal(r.metadata.state,'unavailable');
});

test('handoff numbers travel only in the fragment and fragment-only markers cannot bypass the calculation guard',()=>{
 const url=new URL(candidateToolURL(candidate()),'https://example.test');assert.equal(url.search,'?from=candidate');assert.match(url.hash,/c_price=150000.5/);assert.equal(readCandidateTransfer('', '#from=candidate&c_reference=A&c_price=1').status,'absent');
 const h=transferHarness(url.search+url.hash);let replaced;h.window.history={replaceState:(_state,_title,value)=>{replaced=value;}};installCandidateTransfer(h.window,h.document);assert.equal(replaced,'/tool/?from=candidate');
});
