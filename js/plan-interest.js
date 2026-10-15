import {INTEREST_COPY,INTEREST_CONSENT_VERSION,INTEREST_PRIVACY_VERSION} from './plan-interest-copy.js?v=20261015-rc127';

const form=document.getElementById('plan-interest-form');
const status=document.getElementById('interest-status');
const submit=form.querySelector('button[type="submit"]');
const requested=new URLSearchParams(location.search).get('plan');
if(['investor','pro','pro_yearly'].includes(requested))form.elements.plan.value=requested;
let busy=false,saved=false;
const text=()=>INTEREST_COPY[window.currentLang==='en'?'en':'it'];
function setResult(key){status.dataset.result=key;status.textContent=text()[key];}
document.addEventListener('rb_language_changed',()=>{if(status.dataset.result)setResult(status.dataset.result);});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy||saved||!form.reportValidity())return;
 const selectedPlan=form.elements.plan.value;
 busy=true;submit.disabled=true;setResult('sending');
 try{
  const response=await fetch('/api/send-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
   type:'plan_interest',email:form.elements.email.value,plan:selectedPlan,
   notificationConsent:form.elements.notificationConsent.checked,
   consentVersion:INTEREST_CONSENT_VERSION,privacyVersion:INTEREST_PRIVACY_VERSION,
   lang:window.currentLang==='en'?'en':'it',website:form.elements.website.value
  })});
  const result=await response.json();
  if(!response.ok||result.success!==true){setResult(response.status===429?'limited':'failed');return;}
  saved=true;form.reset();form.elements.plan.value=selectedPlan;
  for(const name of ['plan','email','notificationConsent'])form.elements[name].disabled=true;
  setResult('saved');
 }catch{setResult('failed');}
 finally{busy=false;submit.disabled=saved;}
});
