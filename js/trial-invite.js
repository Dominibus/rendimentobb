import './subscription-ui.js?v=20261016-rc140';
import {hasUsedTrial} from './subscription-offer.js?v=20261016-rc140';
import {getBillingPlanForScope,isSandboxHost} from './account-plan.js?v=20261015-rc128';
import {homeEntryState} from './home-entry.js?v=20261020-rc161';
function homeState(){return homeEntryState({user:window.currentUser,owner:window.rbAccountOwner,data:window.rbAccountData||{},hostname:location.hostname,role:window.userRole});}
function refreshHomeEntry(){
 const state=homeState(),en=window.currentLang==='en';
 const trial=state==='guest'||state==='eligible';
 const labels=trial?['Prova Investor · 30 giorni gratis →','Try Investor · 30 free days →']:state==='loading'?['Verifica il tuo accesso →','Check your access →']:['Apri il tuo pannello →','Open your dashboard →'];
 const notes=trial?['Programma tester · Senza carta o addebiti · PDF esclusi · Una prova per account/email','Tester programme · No card or charges · PDFs excluded · One trial per account/email']:state==='used'?['La tua prova è già stata utilizzata. Puoi consultare il pannello Free e le condizioni dei piani.','Your trial has already been used. You can view the Free dashboard and plan terms.']:state==='loading'?['Il profilo si sta caricando; puoi continuare a esplorare la demo.','Your profile is loading; you can keep exploring the demo.']:['Continua dalle tue analisi e dalle attività disponibili nel tuo piano.','Continue with your analyses and the tasks available on your plan.'];
 for(const el of document.querySelectorAll('[data-rb-home-entry]')){
  el.dataset.it=labels[0];el.dataset.en=labels[1];el.textContent=labels[en?1:0];
  el.setAttribute('href',trial?'/login/?intent=investor-trial':'/dashboard/');el.dataset.entryState=state;
 }
 for(const el of document.querySelectorAll('[data-rb-home-entry-note]')){el.dataset.it=notes[0];el.dataset.en=notes[1];el.textContent=notes[en?1:0];}
}
function eligible(){
 if(!window.currentUser || window.currentUser.uid==='demo-user')return true;
 if(window.rbAccountOwner!==window.currentUser.uid)return false;
 const data=window.rbAccountData||{},sandbox=isSandboxHost(location.hostname);
 return getBillingPlanForScope(data,sandbox)==='free'&&!hasUsedTrial(data,sandbox)&&window.userRole!=='admin';
}
function refresh(){
 refreshHomeEntry();
 document.querySelectorAll('[data-rb-trial-invite]').forEach(el=>el.hidden=!eligible());
 const url=new URL(location.href);
 if(window.currentUser&&window.currentUser.uid!=='demo-user'&&window.firebaseReady&&url.searchParams.get('investor_trial')==='1'){
  url.searchParams.delete('investor_trial');history.replaceState(null,'',url.pathname+url.search+url.hash);
  window.rbOpenSubscription();
 }
}
document.querySelectorAll('[data-rb-trial-start]').forEach(link=>link.addEventListener('click',event=>{
 if(link.hasAttribute('data-rb-home-entry')&&!['guest','eligible'].includes(homeState())){refreshHomeEntry();return;}
 event.preventDefault();
 if(!window.currentUser || window.currentUser.uid==='demo-user'){
  localStorage.setItem('login_redirect','/?investor_trial=1');
  localStorage.removeItem('selected_city');
  location.assign('/login/?intent=investor-trial');return;
 }
 window.rbOpenSubscription();
}));
document.addEventListener('rb_auth_ready',refresh);
document.addEventListener('rb_plan_loaded',refresh);
window.addEventListener('rb_plan_ready',refresh);
window.addEventListener('rb_auth_ready',refresh);
document.addEventListener('rb_language_changed',refreshHomeEntry);
window.addEventListener('rb_language_changed',refreshHomeEntry);
refreshHomeEntry();
if(window.firebaseReady)refresh();
