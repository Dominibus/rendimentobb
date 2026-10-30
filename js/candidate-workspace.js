import {CANDIDATE_FIELDS,ECONOMIC_FIELDS,CANDIDATE_HEADERS,CANDIDATE_LIMIT,validateCandidate,candidateCSVPreview,commitCandidatePreview,validateCandidateCriteria,evaluateCandidate,orderCandidateRows,applyCandidateAssumptions,candidateToolURL,candidateTemplate,normalizeCandidateText} from './candidate-screening.js?v=20261030-candidates';
import {candidateLabels,candidateStatus,label,explainCandidate} from './candidate-copy.js?v=20261030-candidates';

export function installCandidateWorkspace(window,document){
 const host=document.getElementById('candidate-workspace');if(!host)return;
 const $=id=>document.getElementById(id),en=()=>window.currentLang==='en',t=(it,eng)=>en()?eng:it;
 const state={candidates:[],criteria:validateCandidateCriteria().values,preview:[],selected:new Set(),active:null};
 let owner=window.currentUser?.uid||null,epoch=0;
 const uid=()=>window.currentUser?.uid||null;
 const add=(parent,tag,value,cls)=>{const e=document.createElement(tag);if(value!==undefined)e.textContent=value;if(cls)e.className=cls;parent.append(e);return e;};
 const status=(it,eng)=>{$('candidate-status').textContent=t(it,eng);};
 const format=()=>$('candidate-number-format').value;
 const rows=()=>state.candidates.map(c=>evaluateCandidate(c,state.criteria));
 const selectedSummary=()=>{$('candidate-selected-summary').textContent=t('Riferimenti selezionati: ','Selected references: ')+([...state.selected].join(', ')||t('nessuno','none'));};
 const reset=()=>{epoch++;state.candidates=[];state.preview=[];$('candidate-file').value='';state.criteria=validateCandidateCriteria().values;state.selected.clear();state.active=null;$('candidate-manual').reset();$('candidate-criteria').reset();$('candidate-common').reset();renderPreview();render();};
 const publish=()=>{window.rbCandidateWorkspace={getContext:()=>owner!==uid()?null:{page:'/immobili/candidati/',ownerUid:owner,active:state.active,criteria:{...state.criteria},rows:rows().map(r=>({reference:r.candidate.reference,status:r.status,explanationIT:explainCandidate(r,'it'),explanationEN:explainCandidate(r,'en'),assumptions:ECONOMIC_FIELDS.map(f=>({field:f,value:r.candidate[f],origin:r.candidate.origins[f]||null,labelIT:label(f,'it'),labelEN:label(f,'en')}))}))}};};
 function buildFields(form,prefix,fields){
  for(const f of fields){const box=add(form,'label');box.htmlFor=prefix+f;const title=add(box,'span',label(f,en()?'en':'it'));title.dataset.it=candidateLabels[f][0];title.dataset.en=candidateLabels[f][1];const input=add(box,'input');input.id=prefix+f;input.name=f;input.type='text';input.maxLength=f==='url'?2048:80;input.autocomplete='off';if(!['reference','city','zone','url','date'].includes(f))input.inputMode='decimal';if(f==='date')input.placeholder='YYYY-MM-DD';}
 }
 buildFields($('candidate-manual-fields'),'candidate-input-',CANDIDATE_FIELDS.filter(f=>!ECONOMIC_FIELDS.includes(f)));
 buildFields($('candidate-manual-economic-fields'),'candidate-input-',ECONOMIC_FIELDS);
 buildFields($('candidate-common-fields'),'candidate-common-',ECONOMIC_FIELDS);
 const readFields=(prefix,fields)=>Object.fromEntries(fields.map(f=>[f,$(prefix+f).value]));
 function renderPreview(){
  const root=$('candidate-preview');root.replaceChildren();root.hidden=!state.preview.length;
  if(!state.preview.length)return;
  add(root,'h3',t('Anteprima: nulla è stato aggiunto','Preview: nothing has been added'));
  for(const r of state.preview){const line=add(root,'label');const check=add(line,'input');check.type='checkbox';check.dataset.previewLine=String(r.line);check.disabled=!r.valid;if(r.selected===undefined)r.selected=r.valid;check.checked=r.selected;check.addEventListener('change',()=>{r.selected=check.checked;});
   add(line,'span',t('Riga ','Row ')+r.line+' · '+(r.candidate?.reference||'—')+' · '+(r.valid?t('Valida','Valid'):t('Non importabile: ','Cannot import: ')+r.errors.join(', ')));
  }
  const b=add(root,'button',t('Aggiungi le righe selezionate','Add selected rows'),'btn btn-primary');b.type='button';b.addEventListener('click',()=>{
   try{const selected=[...root.querySelectorAll('input[data-preview-line]:checked')].map(e=>Number(e.dataset.previewLine));state.candidates=commitCandidatePreview(state.candidates,state.preview,selected);state.preview=[];renderPreview();render();status('Candidati aggiunti solo a questa pagina.','Candidates added only to this page.');}catch{status('Selezione non valida, duplicati o limite di 50 candidati superato.','Invalid selection, duplicates or 50-candidate limit exceeded.');}
  });
 }
 function render(){
  const all=rows(),filter=$('candidate-filter').value,ordered=orderCandidateRows(all,$('candidate-sort').value),visible=ordered.filter(r=>filter==='all'||r.status===filter);
  if(state.active&&!visible.some(r=>r.candidate.reference===state.active))state.active=null;
  const summary=$('candidate-summary');summary.textContent=t('Candidati: ','Candidates: ')+all.length+' · '+Object.keys(candidateStatus).map(s=>`${candidateStatus[s][en()?1:0]}: ${all.filter(r=>r.status===s).length}`).join(' · ');
  const body=$('candidate-rows');body.replaceChildren();
  for(const r of visible){const c=r.candidate,tr=add(body,'tr');
   const select=add(add(tr,'td'),'input');select.type='checkbox';select.checked=state.selected.has(c.reference);select.setAttribute('aria-label',t('Seleziona ','Select ')+c.reference);select.addEventListener('change',()=>{if(select.checked)state.selected.add(c.reference);else state.selected.delete(c.reference);selectedSummary();});
   const ref=add(tr,'th',c.reference);ref.scope='row';add(tr,'td',[c.city,c.zone].filter(Boolean).join(' · ')||'—');
   for(const v of [c.price,c.sqm,r.total])add(tr,'td',v===null?t('Non disponibile','Unavailable'):new Intl.NumberFormat(en()?'en-GB':'it-IT',{maximumFractionDigits:2}).format(v));
   const result=add(tr,'td');add(result,'strong',candidateStatus[r.status][en()?1:0]);const detail=add(result,'details');add(detail,'summary',t('Motivi e dati mancanti','Reasons and missing data'));add(detail,'p',explainCandidate(r,en()?'en':'it'),'candidate-explanation');
   const economics=add(detail,'dl');for(const f of ECONOMIC_FIELDS){add(economics,'dt',label(f,en()?'en':'it'));add(economics,'dd',c[f]===null?t('Non indicato','Not supplied'):String(c[f])+' · '+(c.origins[f]==='common'?t('Ipotesi comune applicata','Applied common assumption'):t('Dichiarato dall’utente','User declared')));}
   if(c.url){const source=add(detail,'a',t('Apri il riferimento esterno','Open external reference'));source.href=c.url;source.target='_blank';source.rel='noopener noreferrer';}
   const actions=add(tr,'td');const explain=add(actions,'button',t('Spiega ','Explain ')+c.reference);explain.type='button';explain.addEventListener('click',()=>{state.active=c.reference;publish();$('candidate-explanation').textContent=explainCandidate(r,en()?'en':'it');$('candidate-explanation').focus();});
   const link=add(actions,'a',t('Completa in Analizza ↗','Complete in Analyse ↗'));link.href=candidateToolURL(c);link.target='_blank';link.rel='noopener noreferrer';
   const remove=add(actions,'button',t('Rimuovi','Remove'));remove.type='button';remove.setAttribute('aria-label',t('Rimuovi ','Remove ')+c.reference);remove.addEventListener('click',()=>{epoch++;state.candidates=state.candidates.filter(x=>x.reference!==c.reference);state.selected.delete(c.reference);if(state.active===c.reference)state.active=null;state.preview=[];renderPreview();render();});
  }
  if(!visible.length){const td=add(add(body,'tr'),'td',t('Nessun candidato in questa vista. Inserisci dati o cambia il filtro.','No candidates in this view. Enter data or change the filter.'));td.colSpan=8;}
  $('candidate-explanation').textContent=state.active?explainCandidate(all.find(r=>r.candidate.reference===state.active),en()?'en':'it'):t('Seleziona «Spiega» su un candidato. L’assistente userà gli stessi motivi.','Select “Explain” on a candidate. The assistant will use the same reasons.');
  selectedSummary();publish();
 }
 $('candidate-manual').addEventListener('submit',event=>{
  event.preventDefault();const raw=readFields('candidate-input-',CANDIDATE_FIELDS);if(!raw.reference)raw.reference='C-'+window.crypto.randomUUID();const checked=validateCandidate(raw,{format:format()});
  for(const f of CANDIDATE_FIELDS)$('candidate-input-'+f).setAttribute('aria-invalid',checked.errors.includes(f)?'true':'false');
  if(!checked.valid){$('candidate-input-'+checked.errors[0])?.focus();status('Controlla i campi: '+checked.errors.map(f=>label(f,'it')).join(', '),'Check fields: '+checked.errors.map(f=>label(f,'en')).join(', '));return;}
  if(state.candidates.length>=CANDIDATE_LIMIT||state.candidates.some(c=>normalizeCandidateText(c.reference)===normalizeCandidateText(checked.candidate.reference)||(c.url&&c.url===checked.candidate.url))){status('Riferimento/link duplicato o limite di 50 candidati.','Duplicate reference/link or 50-candidate limit.');return;}
  state.candidates.push(checked.candidate);epoch++;state.preview=[];renderPreview();event.target.reset();render();status('Candidato aggiunto. Completa i criteri e verifica le informazioni mancanti.','Candidate added. Set criteria and review missing data.');
 });
 $('candidate-file').addEventListener('change',()=>{epoch++;state.preview=[];renderPreview();});
 $('candidate-number-format').addEventListener('change',()=>{epoch++;state.preview=[];renderPreview();status('Formato valido per i prossimi inserimenti; anteprima CSV da rifare. I candidati esistenti non cambiano.','Format applies to new inputs; preview the CSV again. Existing candidates are unchanged.');});
 $('candidate-preview-button').addEventListener('click',async()=>{
  const file=$('candidate-file').files[0],request=++epoch,ownerAtRead=uid();state.preview=[];renderPreview();
  if(!file||file.size>512000){status('Seleziona un CSV fino a 500 KB.','Choose a CSV up to 500 KB.');return;}
  try{const input=await file.text();if(request!==epoch||ownerAtRead!==uid())return;state.preview=candidateCSVPreview(input,{existing:state.candidates,format:format()});renderPreview();}catch(e){if(request!==epoch)return;status('CSV rifiutato: '+(e.code||'invalid_csv')+'. Usa il modello e il formato numerico scelto.','CSV rejected: '+(e.code||'invalid_csv')+'. Use the template and selected number format.');}
 });
 $('candidate-template').addEventListener('click',()=>{const url=window.URL.createObjectURL(new window.Blob([candidateTemplate()],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='candidati-esempio.csv';a.click();window.setTimeout(()=>window.URL.revokeObjectURL(url),1000);});
 $('candidate-criteria').addEventListener('submit',event=>{event.preventDefault();const raw=Object.fromEntries(['maxTotal','minArea','availableCapital','city','zone','preferredZone'].map(f=>[f,$('criterion-'+f).value]));const checked=validateCandidateCriteria(raw,format());if(!checked.valid){status('Criteri non validi: '+checked.errors.join(', '),'Invalid criteria: '+checked.errors.join(', '));return;}state.criteria=checked.values;render();status('Criteri applicati. Nessun peso o soglia di rendimento.','Criteria applied. No weights or return thresholds.');});
 $('candidate-common').addEventListener('submit',event=>{event.preventDefault();try{const ids=[...state.selected];state.candidates=applyCandidateAssumptions(state.candidates,ids,readFields('candidate-common-',ECONOMIC_FIELDS),format());render();status('Ipotesi applicate ai riferimenti selezionati: '+ids.join(', '),'Assumptions applied to selected references: '+ids.join(', '));}catch{status('Seleziona candidati e inserisci almeno un’ipotesi valida. I valori non sono stati modificati.','Select candidates and enter at least one valid assumption. Values were not changed.');}});
 for(const id of ['candidate-sort','candidate-filter'])$(id).addEventListener('change',render);
 $('candidate-select-visible').addEventListener('click',()=>{for(const r of rows())if($('candidate-filter').value==='all'||r.status===$('candidate-filter').value)state.selected.add(r.candidate.reference);render();});
 $('candidate-deselect').addEventListener('click',()=>{state.selected.clear();render();});
 $('candidate-clear').addEventListener('click',()=>{reset();status('Elenco e criteri eliminati da questa pagina.','List and criteria cleared from this page.');});
 document.addEventListener('rb_language_changed',()=>{for(const e of host.querySelectorAll('[data-it][data-en]'))e.textContent=en()?e.dataset.en:e.dataset.it;renderPreview();render();});
 document.addEventListener('rb_auth_ready',()=>{if(owner!==uid()){owner=uid();reset();status('Account cambiato: elenco e contesto eliminati.','Account changed: list and context cleared.');}});
 window.addEventListener('pagehide',()=>{window.rbCandidateWorkspace=null;});window.addEventListener('pageshow',publish);
 render();return {state,reset,render};
}
if(typeof window!=='undefined'&&typeof document!=='undefined')installCandidateWorkspace(window,document);
