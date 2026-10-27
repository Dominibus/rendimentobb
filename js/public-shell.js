(function(){
 'use strict';
 const english=document.documentElement.lang==='en';
 try{localStorage.setItem('rb_lang',english?'en':'it');}catch{}
 // RC205: keep the already available commercial pathway discoverable in both shells.
 for(const nav of document.querySelectorAll('.rb-public-desktop,.rb-public-menu nav')){
  if(!nav.querySelector('a[href*="/immobili-commerciali/"]')){
   const a=document.createElement('a');a.href=english?'/en/immobili-commerciali/':'/immobili-commerciali/';a.textContent=english?'Commercial spaces':'Locali e studi';const about=nav.querySelector('a[href^="/about/"]');nav.insertBefore(a,about);
  }
 }
 const menus=[...document.querySelectorAll('.rb-public-header details')];
 for(const menu of menus)menu.addEventListener('toggle',()=>{if(menu.open)for(const other of menus)if(other!==menu)other.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')for(const menu of menus)if(menu.open){menu.open=false;menu.querySelector('summary')?.focus();}});
 document.addEventListener('click',event=>{if(!event.target.closest('.rb-public-header'))for(const menu of menus)menu.open=false;});
 for(const menu of menus)for(const link of menu.querySelectorAll('a'))link.addEventListener('click',()=>{menu.open=false;});
 for(const button of document.querySelectorAll('[data-public-language]'))button.addEventListener('click',()=>{
  if(button.dataset.publicLanguage===document.documentElement.lang)return;
  const form=document.getElementById('bb-idea-form');
  const dirty=form&&[...form.querySelectorAll('input,textarea,select')].some(e=>e.type==='checkbox'?e.checked!==e.defaultChecked:e.tagName==='SELECT'?e.value!==([...e.options].find(o=>o.defaultSelected)||e.options[0])?.value:String(e.value||'').trim()!=='');
  if(dirty&&!window.confirm(english?'Changing language leaves this page and discards unsent form entries. Continue?':'Cambiare lingua lascia questa pagina e scarta i dati del modulo non inviati. Continuare?'))return;
  try{localStorage.setItem('rb_lang',button.dataset.publicLanguage);}catch{}
  const hash=window.location.hash;
  const safeHash=hash&&document.getElementById(hash.slice(1))?hash:'';
  window.location.assign(button.dataset.url+safeHash);
 });
 for(const button of document.querySelectorAll('[data-public-question]'))button.addEventListener('click',()=>{
  const answer=document.getElementById('public-guide-answer');
  const question=String(button.dataset.publicQuestion||'').toLowerCase();
  answer.textContent=/demo/.test(question)?(english?'The demos use fictional data and do not access your account.':'Le demo utilizzano dati fittizi e non accedono al tuo account.'):(english?'RendimentoBB provides property investment analysis, mortgages, and B&B management tools.':'RendimentoBB offre analisi di investimenti immobiliari, mutui e strumenti per la gestione B&B.');
 });
})();
