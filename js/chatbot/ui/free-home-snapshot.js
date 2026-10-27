// Public base results only. Never read chat memory, PDFs or the shared analysis cache.
(function(){
 'use strict';
 window.rbBuildFreeChatHomeHTML=function(){
  const access=window.getUserAccess?.()||window.RB_USER||{};
  if(!access.isLoading && (access.canSeeFullAnalysis||access.isInvestor||access.isPro||access.isAdmin))return null;
  const en=(window.currentLang||window.RB_LANG?.current)==='en';
  const t=(it,english)=>en?english:it;
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const isTool=/^\/tool(?:\/|$)/.test(window.location?.pathname||'');
  const state=isTool?window.rbGetInvestmentAnalysisState?.()||{}:{};
  const metrics=state.metrics||{};
  const finite=value=>typeof value==='number'&&Number.isFinite(value);
  const current=!access.isLoading&&isTool&&state.status==='current'&&state.tier==='free'&&metrics.roiBasis==='property'&&finite(metrics.annualCashflow)&&finite(metrics.monthlyCashflow)&&(metrics.roiAvailable===false||finite(metrics.roi));
  const help=t('Puoi chiedere «Che cos’è il cashflow?» o «Non ho capito il ROI». La lettura assistita della tua analisi richiede Investor o Pro.','You can ask “What is cashflow?” or “I do not understand ROI”. Assisted reading of your analysis requires Investor or Pro.');
  let body;
  if(current){
   const currency=value=>new Intl.NumberFormat(en?'en-GB':'it-IT',{style:'currency',currency:'EUR'}).format(value);
   const roi=metrics.roiAvailable===false?'N/A':new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:1}).format(metrics.roi)+'%';
   const entries=[[t('Località','Location'),state.city||t('Non indicata','Not entered')],[t('Cashflow / valore immobile','Cashflow / property value'),roi],[t('Cashflow annuo stimato','Estimated annual cashflow'),currency(metrics.annualCashflow)],[t('Cashflow mensile stimato','Estimated monthly cashflow'),currency(metrics.monthlyCashflow)]];
   body=`<div class="rb-ai-snapshot-title">${t('Risultati base · simulazione corrente','Base results · current simulation')}</div><div class="rb-ai-snapshot-grid">${entries.map(([label,value])=>`<div class="rb-ai-metric"><span class="rb-ai-metric-label">${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</div><p>${t('Stime delle ipotesi inserite, già mostrate nel simulatore.','Estimates from your inputs, already shown in the simulator.')}${metrics.roiAvailable===false?' '+t('ROI N/A: manca il valore dell’immobile, non è un rendimento zero.','ROI N/A: the property value is missing; this is not a zero return.'):''}</p>`;
  }else{
   const waiting=access.isLoading||state.status==='pending';
   const title=waiting?t('Attendi il risultato corrente','Wait for the current result'):isTool&&state.status==='stale'?t('Hai cambiato le ipotesi','You changed the inputs'):t('Inizia con una domanda semplice','Start with a simple question');
   const description=waiting?t('Il riepilogo sarà disponibile quando accesso e calcolo saranno pronti.','The summary will be available when access and calculation are ready.'):isTool?t('Completa o aggiorna il calcolo per vedere qui i risultati di base.','Run or update the calculation to see base results here.'):t('Posso spiegare gli indicatori e indicarti gli strumenti del sito. Apri il simulatore per provare le tue ipotesi.','I can explain metrics and help you find the site tools. Open the simulator to try your inputs.');
   body=`<strong class="rb-ai-snapshot-title">${title}</strong><p>${description}</p>`;
  }
  return `<div class="${current?'rb-ai-snapshot':'rb-ai-empty-state'}" data-rb-free-home="true">${body}<p>${help}</p><a href="/plans.html${en?'?lang=en':''}#tester-programme">${t('Scopri cosa include la prova Investor di 30 giorni','See what the 30-day Investor trial includes')}</a></div>`;
 };
})();
