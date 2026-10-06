(function(){
  'use strict';
  const english=()=>window.currentLang==='en';
  const status=document.getElementById('rb-investment-status');
  function setStatus(it,en){if(status)status.textContent=english()?en:it;}
  const fields=['price','equity','priceNight','expenses','occupancy'];
  const isTool=()=>Boolean(document.getElementById('price') && document.getElementById('analyze-btn'));
  window.rbOpenInvestmentAction=function(action){
    if(action?.type!=='open_investment_section')return false;
    if(action.target==='simulator' || action.target==='dashboard'){
      window.location.assign(action.target==='simulator'?'/tool/':'/dashboard/');
      return true;
    }
    if(!isTool())return false;
    const id=action.target==='inputs'?(fields.includes(action.field)?action.field:'price'):
      action.target==='analysis'?'analyze-btn':action.target==='results'?'rb-simulation-summary':null;
    if(!id)return false;
    const target=document.getElementById(id);
    if(!target)return false;
    if(id==='rb-simulation-summary' && window.simulationExecuted!==true){
      setStatus('Completa i dati e avvia l’analisi per ottenere le stime.','Complete the inputs and run the analysis to obtain estimates.');
      return false;
    }
    target.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
    if(!target.matches('input,select,button'))target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
    if(id==='analyze-btn')setStatus('Premi “Analizza investimento” per avviare o aggiornare le stime.','Press “Analyze investment” to run or update the estimates.');
    return true;
  };
  document.querySelectorAll('[data-rb-investment-question]').forEach(button=>{
    button.addEventListener('click',async()=>{
      if(typeof window.rbAskInvestmentAutopilot!=='function'){
        setStatus('L’assistente si sta caricando. Riprova tra qualche secondo.','The assistant is loading. Try again in a few seconds.');
        return;
      }
      setStatus('','');
      await window.rbAskInvestmentAutopilot(button.dataset.rbInvestmentQuestion);
    });
  });
  document.querySelectorAll('.rb-hub-links a[href^="#"]').forEach(link=>{
    link.addEventListener('click',event=>{
      const target=document.getElementById(link.getAttribute('href').slice(1));
      if(!target)return;
      event.preventDefault();
      target.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
      if(target.matches('input,select,button'))target.focus({preventScroll:true});
      else{target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
      if(target.id==='rb-simulation-summary' && window.simulationExecuted!==true)setStatus('Per ottenere le stime, completa i dati e premi il pulsante di analisi.','To obtain estimates, complete the inputs and press the analysis button.');
    });
  });
})();
