import './subscription-ui.js?v=20261009-rc88';
import {getBillingPlanForScope,isSandboxHost} from './account-plan.js?v=20261009-rc85';
function eligible(){
 if(!window.currentUser)return true;
 if(window.rbAccountOwner!==window.currentUser.uid)return false;
 const data=window.rbAccountData||{},sandbox=isSandboxHost(location.hostname);
 return getBillingPlanForScope(data,sandbox)==='free'&&!data[sandbox?'sandboxTrialStartedAt':'trialStartedAt']&&window.userRole!=='admin';
}
function refresh(){
 document.querySelectorAll('[data-rb-trial-invite]').forEach(el=>el.hidden=!eligible());
 const url=new URL(location.href);
 if(window.currentUser&&window.firebaseReady&&url.searchParams.get('investor_trial')==='1'){
  url.searchParams.delete('investor_trial');history.replaceState(null,'',url.pathname+url.search+url.hash);
  window.rbOpenSubscription();
 }
}
document.querySelectorAll('[data-rb-trial-start]').forEach(link=>link.addEventListener('click',event=>{
 event.preventDefault();
 if(!window.currentUser){
  localStorage.setItem('login_redirect','/?investor_trial=1');
  localStorage.removeItem('selected_city');
  location.assign('/login/');return;
 }
 window.rbOpenSubscription();
}));
document.addEventListener('rb_auth_ready',refresh);
document.addEventListener('rb_plan_loaded',refresh);
window.addEventListener('rb_plan_ready',refresh);
if(window.firebaseReady)refresh();
