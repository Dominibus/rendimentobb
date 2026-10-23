// Presentation only: no calculation, save, entitlement or financial model changes.
export function installToolPresentation(window,document){
 if(!document.getElementById('analyze-btn'))return;
 let awaitingResult=false,previousCalculation;
 const analyze=document.getElementById('analyze-btn');
 analyze.addEventListener?.('click',()=>{
  awaitingResult=true;previousCalculation=window.rbGetInvestmentAnalysisState?.()?.calculatedAt;
 });
 const refresh=()=>{
  const state=window.rbGetInvestmentAnalysisState?.()?.status || 'missing';
  const button=document.getElementById('pdf-btn'),status=document.getElementById('tool-pdf-status');
  const access=window.getUserAccess?.()||{};
  const next=document.getElementById('rb-result-next');
  if(next)next.hidden=state!=='current'||access.isLoading===true||!!(access.isInvestor||access.isPro||access.isAdmin);
  if(state==='missing'||state==='unavailable'){
   for(const id of ['profit-monthly','profit-annual','revenue-annual']){
    const element=document.getElementById(id);if(element)element.textContent='—';
   }
  }
  if(button){button.disabled=state!=='current'||!access.canDownloadPDF;button.setAttribute('aria-disabled',String(button.disabled));}
  let messages=state==='current'
   ? ['Analisi aggiornata. Il PDF è disponibile con Pro.','Analysis updated. PDF export is available with Pro.']
   : state==='stale'
   ? ['Dati modificati: ricalcola prima di esportare il PDF.','Inputs changed: recalculate before exporting the PDF.']
   : state==='pending'
   ? ['Analisi in elaborazione: attendi il risultato prima di esportare.','Analysis in progress: wait for the result before exporting.']
   : ['Completa i dati e avvia l’analisi per ottenere un report. Il PDF richiede Pro.','Complete the inputs and run the analysis to obtain a report. PDF export requires Pro.'];
  if(status){status.dataset.it=messages[0];status.dataset.en=messages[1];status.textContent=messages[window.currentLang==='en'?1:0];}
 };
 // Scroll only after a requested calculation publishes a new, current result.
 // Plan/language refreshes and validation failures must not move focus.
 const revealResult=()=>{
  refresh();if(!awaitingResult)return;
  const state=window.rbGetInvestmentAnalysisState?.()||{};
  if(state.status==='pending')return;
  awaitingResult=false;
  if(state.status!=='current'||state.calculatedAt===undefined||state.calculatedAt===previousCalculation)return;
  const target=document.getElementById('rb-simulation-summary');if(!target)return;
  target.setAttribute('tabindex','-1');
  target.focus({preventScroll:true});
  target.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 };
 window.addEventListener('rb_investment_state_updated',revealResult);
 window.addEventListener('rb_plan_ready',refresh);
 for(const event of ['rb_auth_ready','rb_language_changed'])document.addEventListener(event,refresh);
 // Wait until the authoritative state's own field listeners have run.
 for(const event of ['input','change'])document.addEventListener(event,()=>queueMicrotask(refresh));
 refresh();return {refresh};
}
