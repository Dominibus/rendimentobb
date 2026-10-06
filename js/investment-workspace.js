(function(){
  'use strict';
  const english=()=>window.currentLang==='en';
  const status=document.getElementById('rb-investment-status');
  function setStatus(it,en){if(status)status.textContent=english()?en:it;}
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
      if(target.id==='results' && window.simulationExecuted!==true)setStatus('Per ottenere le stime, completa i dati e premi il pulsante di analisi.','To obtain estimates, complete the inputs and press the analysis button.');
    });
  });
})();
