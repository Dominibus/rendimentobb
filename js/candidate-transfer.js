// Extends the existing property -> simulator input flow. No calculation or save.
import {readCandidateTransfer,ECONOMIC_FIELDS} from './candidate-screening.js?v=20261030-candidates';
import {label} from './candidate-copy.js?v=20261030-candidates';
export function installCandidateTransfer(window,document){
 const transfer=readCandidateTransfer(window.location.search,window.location.hash||'');if(transfer.status==='absent')return false;
 const field=id=>document.getElementById(id);
 window.rbCandidateInputsReady=()=>false;
 let noteIT='',noteEN='';
 const show=()=>{const notice=field('property-scenario-status');if(!notice)return;notice.hidden=false;notice.dataset.it=noteIT;notice.dataset.en=noteEN;notice.textContent=window.currentLang==='en'?noteEN:noteIT;const occ=field('occupancy');if(occ?.dataset.candidateMissing==='true'&&field('occ-value'))field('occ-value').textContent=window.currentLang==='en'?'Not supplied':'Da indicare';};
 const apply=()=>{
  if(transfer.status!=='valid'){noteIT='Candidato nel link non valido: nessun dato trasferito. Verifica il riferimento nella scheda originale; per ripartire senza candidato apri Analizza dal menu.';noteEN='Invalid candidate link: nothing transferred. Check the reference in the original tab; to start without a candidate open Analyse from the menu.';show();return;}
  let pending=false;try{pending=Boolean(window.sessionStorage?.getItem(window.RBInvestmentJourney?.key||'rb_mortgage_scenario_v1'));}catch{}
  if(window.rbImportedMortgage||pending){window.rbCandidateInputsReady=()=>true;noteIT='Uno scenario mutuo è già presente: non è stato sostituito dal candidato. Gestisci prima il riepilogo mutuo e riapri il candidato.';noteEN='A mortgage scenario is already present: the candidate has not replaced it. Resolve the mortgage summary first, then reopen the candidate.';show();return;}
  const c=transfer.candidate;
  if(window.location.hash)window.history?.replaceState(null,'',window.location.pathname+'?from=candidate');
  if(!field('price')||!field('equity'))return;
  window.rbSetPropertyMode?.('purchase');if(field('property-mode'))field('property-mode').value='purchase';
  const compatible=['price',...ECONOMIC_FIELDS];
  for(const f of [...compatible,'loanAmount']){const e=field(f);if(!e)continue;
   const supplied=compatible.includes(f)&&c[f]!==null;if(f==='occupancy')e.step='any';
   e.dataset.candidateMissing=supplied?'false':'true';
   // Range inputs cannot represent an empty value: keep the missing flag until a user acts.
   if(f!=='occupancy'||supplied)e.value=supplied?String(c[f]):'';
   if(f==='occupancy'&&!supplied){const value=field('occ-value');if(value)value.textContent=window.currentLang==='en'?'Not supplied':'Da indicare';}
   e.dispatchEvent(new window.Event('input',{bubbles:true}));
   if(f==='occupancy')for(const event of ['input','change'])e.addEventListener?.(event,ev=>{if(ev.isTrusted)e.dataset.candidateMissing='false';});
  }
  window.rbCandidateInputsReady=()=>{
   const missingNow=compatible.filter(f=>{const e=field(f);return !e||String(e.value).trim()===''||!Number.isFinite(Number(e.value))||e.validity?.valid===false||(f==='equity'&&Number(e.value)>Number(field('price')?.value))||(f==='occupancy'&&e.dataset.candidateMissing==='true');});
   for(const f of compatible)field(f)?.setAttribute?.('aria-invalid',missingNow.includes(f)?'true':'false');
   if(!missingNow.length){noteIT='Candidato '+c.reference+': input economici espliciti presenti. Verifica le ipotesi prima di interpretare i risultati; nessun salvataggio automatico.';noteEN='Candidate '+c.reference+': explicit economic inputs are present. Verify assumptions before interpreting results; no automatic save.';show();return true;}
   noteIT='Prima di calcolare indica esplicitamente: '+missingNow.map(f=>label(f,'it')).join(', ')+'. Nessun default è stato applicato al candidato.';
   noteEN='Before calculating, explicitly enter: '+missingNow.map(f=>label(f,'en')).join(', ')+'. No defaults have been applied to the candidate.';
   for(const f of missingNow)field(f)?.setAttribute?.('aria-invalid','true');
   field(missingNow[0])?.focus?.();show();return false;
  };
  window.currentCity='';if(field('market-city'))field('market-city').value='';
  const location=field('custom-location');if(location){delete location.dataset.municipality;location.value=c.city||'';location.dispatchEvent(new window.Event('input',{bubbles:true}));}
  if(field('property-banner'))field('property-banner').style.display='none';
  const transferred=['city',...compatible].filter(f=>c[f]!==null&&c[f]!==''),missing=['city',...compatible].filter(f=>c[f]===null||c[f]==='');
  const names=(fs,lang)=>fs.map(f=>label(f,lang)).join(', ')||(lang==='en'?'none':'nessuno');
  noteIT=`Candidato ${c.reference}. Copiati: ${names(transferred,'it')}. Da completare: ${names(missing,'it')}. Superficie ${c.sqm===null?'non indicata':c.sqm+' m²'}: solo contesto, non input del rendimento. Lavori, altre spese e link non sono trasferiti né riclassificati. Gli input economici sono ipotesi dichiarate: verifica le condizioni. Nessun calcolo, salvataggio o immobile PMS creato. L’elenco rimane nella scheda originale.`;
  noteEN=`Candidate ${c.reference}. Copied: ${names(transferred,'en')}. Complete: ${names(missing,'en')}. Floor area ${c.sqm===null?'not supplied':c.sqm+' m²'}: context only, not a return input. Works, other upfront costs and the link are not transferred or reclassified. Economic inputs are declared assumptions: verify conditions. No calculation, save or PMS property created. The list remains in the original tab.`;
  show();
 };
 if(document.readyState==='complete')apply();else document.addEventListener('DOMContentLoaded',()=>window.setTimeout(apply,0),{once:true});
 document.addEventListener('rb_language_changed',show);
 return true;
}
