/* Existing portal components, with separate commercial IT/EN documents. */
(function(){
 'use strict';
 const english=document.documentElement.lang==='en';
 try{localStorage.setItem('rb_lang',english?'en':'it');}catch{}
 let plannerTouched=false;
 document.addEventListener('input',event=>{if(event.target.closest?.('[data-commercial-app]'))plannerTouched=true;});
 document.addEventListener('click',event=>{if(event.target.closest?.('[data-commercial-app]'))plannerTouched=true;});
 // The common Assistant opens help for this workflow, never a remembered B&B snapshot.
 document.addEventListener('click',event=>{
  if(!event.target.closest?.('#rb-header-ai-btn'))return;
  event.preventDefault();event.stopImmediatePropagation();
  const autopilot=Array.from(document.querySelectorAll('.cw-tabs button')).find(button=>button.textContent.trim()==='Autopilot');
  if(autopilot){autopilot.click();document.querySelector('[data-commercial-workspace]')?.scrollIntoView({block:'start'});return;}
  const help=document.getElementById('commercial-input-help');
  if(help){help.open=true;help.scrollIntoView({block:'start'});help.querySelector('summary')?.focus();}
 },true);
 document.addEventListener('DOMContentLoaded',()=>{
  window.setLang=function(lang){
   if(!['it','en'].includes(lang)||lang===(english?'en':'it'))return;
   const planner=document.querySelector('[data-commercial-app]');
   if(planner&&plannerTouched&&!window.confirm(english?'Changing language leaves this page and discards unsaved planner entries. Continue?':'Cambiare lingua lascia questa pagina e cancella gli inserimenti non salvati del simulatore. Continuare?'))return;
   const path=window.location.pathname.replace(/^\/en\//,'/');
   if(!/^\/(?:immobili-commerciali|gestione-commerciale)\/$/.test(path))return;
   const params=new URLSearchParams(window.location.search);
   const demo=params.get('demo')==='1'?'?demo=1':'';
   const hash=window.location.hash;
   const safeHash=hash&&document.getElementById(hash.slice(1))?hash:'';
   // Workspace unsaved edits retain their existing beforeunload protection.
   window.location.assign((lang==='en'?'/en':'')+path+demo+safeHash);
  };
 });
})();
