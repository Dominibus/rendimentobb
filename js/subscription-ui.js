import {TERMS_VERSION,OFFERS,activeTrial,timestampMillis} from './subscription-offer.js?v=20261009-rc85';
import {getBillingPlanForScope,isSandboxHost} from './account-plan.js?v=20261009-rc85';
const t=(it,en)=>window.currentLang==='en'?en:it;
const ownedData=()=>window.rbAccountOwner===window.currentUser?.uid?(window.rbAccountData||{}):{};
window.rbIsTrial=()=>activeTrial(ownedData(),isSandboxHost(location.hostname));
function add(parent,tag,text){const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;}
function link(parent,url,text){const a=add(parent,'a',text);a.href=url;a.target='_blank';a.rel='noopener';a.style.cssText='color:#008f67;margin-right:15px;';return a;}
function dialog(title){
 const d=document.createElement('dialog');d.setAttribute('aria-label',title);
 d.style.cssText='position:fixed;inset:0;margin:auto!important;box-sizing:border-box;width:min(620px,94vw);max-height:88vh;height:fit-content;overflow:auto;padding:26px;border:1px solid #dbe7e4;border-radius:20px;background:white;color:#142b3b;font:14px/1.6 system-ui;z-index:2147482000;';
 const h=add(d,'h2',title);h.style.cssText='font-size:23px;margin:0 0 12px;';
 document.body.append(d);return d;
}
function button(parent,text){const b=add(parent,'button',text);b.type='button';b.style.cssText='padding:11px 16px;border:1px solid #cbd5e1;border-radius:10px;margin:8px 8px 0 0;cursor:pointer;background:#f1f5f9;color:#142b3b;';return b;}
function conditions(d){const p=add(d,'p','');link(p,'/terms.html',t('Condizioni di abbonamento','Subscription terms'));link(p,'/privacy.html',t('Informativa privacy','Privacy notice'));link(p,'/withdrawal.html',t('Recesso e modulo','Withdrawal and form'));}
function acceptance(d){const label=add(d,'label','');label.style.cssText='display:flex;gap:10px;align-items:start;margin:18px 0;';const box=document.createElement('input');box.type='checkbox';box.style.cssText='width:18px;height:18px;flex-shrink:0;margin-top:4px;';label.append(box);add(label,'span',t('Ho letto e accetto le condizioni di abbonamento. Ho preso visione dell’informativa privacy.','I have read and accept the subscription terms and have reviewed the privacy notice.'));return box;}
window.rbReviewPurchase=plan=>new Promise(resolve=>{
 const offer=OFFERS[plan];if(!offer)return resolve(false);
 const d=dialog(t('Prima di acquistare','Before you purchase'));
 add(d,'p',`${offer.name} · €${offer.amount} / ${offer.interval==='year'?t('anno','year'):t('mese','month')}`);
 add(d,'p',offer.pdf?t('Analisi salvate, dashboard, PMS e report PDF.','Saved analyses, dashboard, PMS and PDF reports.'):t('Analisi salvate, dashboard e PMS. Report PDF esclusi.','Saved analyses, dashboard and PMS. PDF reports excluded.'));
 add(d,'p',t('Pagamento immediato e rinnovo automatico con la periodicità indicata. Per Pro Annuale, 199 € sono addebitati in un’unica soluzione ogni anno. Controlla importo totale e imposte nel checkout; in caso di differenze non procedere.','Immediate payment and automatic renewal at the stated frequency. Pro Annual is charged as a single €199 payment each year. Check the total and taxes at checkout; do not proceed if there are discrepancies.'));
 add(d,'p',t('La prova gratuita è separata: acquistando qui avvii un abbonamento a pagamento. Puoi richiedere la disattivazione del rinnovo dall’area Abbonamento o al supporto. Il recesso è distinto dalla disattivazione; non viene richiesta una rinuncia automatica ai diritti del consumatore.','The free trial is separate: purchasing here starts a paid subscription. Request stopping renewal through Subscription or support. Withdrawal is distinct from stopping renewal; no automatic waiver of consumer rights is requested.'));
 conditions(d);const box=acceptance(d);
 const back=button(d,t('Torna indietro','Go back'));const next=button(d,t('Continua al pagamento Stripe','Continue to Stripe payment'));next.disabled=true;box.onchange=()=>next.disabled=!box.checked;
 let finished=false;function finish(ok){if(finished)return;finished=true;d.close();d.remove();resolve(ok);}
 back.onclick=()=>finish(false);next.onclick=()=>{if(box.checked)finish(true);};d.addEventListener('cancel',e=>{e.preventDefault();finish(false);});d.showModal();
});
async function request(action,extra={}){
 const user=window.currentUser;if(!user)throw Error('LOGIN_REQUIRED');const uid=user.uid;
 const token=await user.getIdToken(true);if(window.currentUser?.uid!==uid)throw Error('LOGIN_REQUIRED');
 const response=await fetch('/api/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({action,locale:window.currentLang==='en'?'en':'it',...extra})});
 const data=await response.json();if(window.currentUser?.uid!==uid)throw Error('LOGIN_REQUIRED');
 if(!response.ok)throw Error(data.code||'REQUEST_FAILED');return data;
}
const errors={TRIAL_NOT_ENABLED:["La prova Investor non è ancora attiva. Contatta il supporto.","The Investor trial is not active yet. Contact support."],EMAIL_VERIFICATION_REQUIRED:['Verifica prima l’email del tuo account. Se non hai ricevuto il link, contatta il supporto.','Verify your account email first. If you have not received a link, contact support.'],TRIAL_ALREADY_USED:['La prova è già stata utilizzata per questo account o indirizzo email.','The trial has already been used for this account or email address.'],ACTIVE_SUBSCRIPTION:['Hai già un abbonamento a pagamento.','You already have a paid subscription.'],BILLING_ACCOUNT_NOT_FOUND:['Nessun account di fatturazione disponibile: contatta il supporto.','No billing account is available: contact support.'],TERMS_REQUIRED:['Le condizioni sono cambiate: ricarica la pagina.','Terms have changed: reload the page.']};
window.rbOpenSubscription=()=>{
 if(!window.currentUser){location.assign('/login/');return;}
 const d=dialog(t('Il tuo abbonamento','Your subscription'));
 const data=ownedData(),sandbox=isSandboxHost(location.hostname),billing=getBillingPlanForScope(data,sandbox),prefix=sandbox?'sandboxTrial':'trial';
 const inTrial=window.rbIsTrial();
 add(d,'p',inTrial?t('Investor in prova · termina il ','Investor trial · ends ')+new Date(timestampMillis(data[`${prefix}EndsAt`])).toLocaleString(window.currentLang==='en'?'en-GB':'it-IT'):t('Piano: ','Plan: ')+(OFFERS[billing]?.name||'Free'));
 add(d,'p',t('Prova Investor: 7 giorni senza carta e senza addebiti, con analisi salvate, dashboard e PMS. Report PDF esclusi. Alla scadenza ritorni a Free; i dati salvati non vengono eliminati automaticamente. Per continuare le funzioni Investor scegli un piano a pagamento; Pro aggiunge i report PDF.','Investor trial: 7 days without a card or charges, with saved analyses, dashboard and PMS. PDF reports excluded. At expiry you return to Free; saved data is not automatically deleted. Choose a paid plan to continue using Investor features; Pro adds PDF reports.'));
 conditions(d);
 const notice=add(d,'p','');notice.setAttribute('role','status');
 const paid=['investor','pro','pro_yearly'].includes(billing);
 if(!paid&&!inTrial&&!data[`${prefix}StartedAt`]){
  if(window.currentUser.emailVerified!==true){
    const verify=button(d,t('Richiedi email di verifica','Request verification email'));
    verify.onclick=async()=>{verify.disabled=true;try{await window.rbSendVerificationEmail();notice.textContent=t('Email richiesta. Apri il link ricevuto, poi ricarica la pagina.','Email requested. Open the received link, then reload the page.');}catch(e){notice.textContent=t('Richiesta non disponibile: riprova più tardi o contatta il supporto.','Request unavailable: retry later or contact support.');verify.disabled=false;}};
  }
  const box=acceptance(d),start=button(d,t('Attiva 7 giorni di Investor gratis','Start 7 free days of Investor'));start.disabled=true;box.onchange=()=>start.disabled=!box.checked;
  start.onclick=async()=>{if(!box.checked)return;start.disabled=true;try{await request('trial',{acceptedTerms:true,termsVersion:TERMS_VERSION});localStorage.removeItem('pending_plan');location.reload();}catch(e){notice.textContent=errors[e.message]?t(...errors[e.message]):t('Operazione non disponibile. Riprova o contatta il supporto.','Operation unavailable. Retry or contact support.');start.disabled=!box.checked;}};
 }
 if(paid||data.stripeCustomerId||data.sandboxStripeCustomerId){const manage=button(d,t('Gestisci rinnovo e fatture su Stripe','Manage renewal and invoices on Stripe'));manage.onclick=async()=>{manage.disabled=true;try{const result=await request('portal');if(!result.url?.startsWith('https://billing.stripe.com/'))throw Error('INVALID_URL');location.assign(result.url);}catch(e){notice.textContent=errors[e.message]?t(...errors[e.message]):t('Portale non disponibile: contatta support@rendimentobb.com.','Portal unavailable: contact support@rendimentobb.com.');manage.disabled=false;}};}
 if(data.stripeSessionId||data.sandboxStripeSessionId){
  const download=button(d,t('Scarica conferma e condizioni','Download confirmation and terms'));
  download.onclick=async()=>{download.disabled=true;try{
    const {contract:c}=await request('contract');
    const lang=window.currentLang==='en'?'en':'it';
    const lines=[t('RendimentoBB - conferma abbonamento','RendimentoBB - subscription confirmation'),
      `${t('Piano','Plan')}: ${c.plan}`,`${t('Acquisto','Purchase')}: ${c.purchasedAt}`,
      `${t('Importo checkout','Checkout amount')}: ${c.amountTotal===null?'N/A':(c.amountTotal/100).toFixed(2)} ${c.currency||''}`,
      `${t('Condizioni accettate','Accepted terms')}: ${c.termsVersion} · ${c.acceptedAt}`,
      `${t('Riferimento pagamento','Payment reference')}: ${c.sessionId}`,
      `${t('Ambiente','Environment')}: ${c.liveMode?t('Produzione','Live'):t('TEST - nessun acquisto reale','TEST - no real purchase')}`,'',
      ...[...(c.terms.terms||[]),...(c.terms.withdrawal||[])].map(row=>row[lang])];
    const url=URL.createObjectURL(new Blob([lines.join('\n\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='RendimentoBB-Conferma-Abbonamento.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   }catch(e){notice.textContent=t('Conferma non disponibile per questo acquisto. Contatta il supporto.','Confirmation is not available for this purchase. Contact support.');}finally{download.disabled=false;}};
 }
 link(d,'mailto:support@rendimentobb.com',t('Contatta il supporto','Contact support'));link(d,'/#pricing',t('Confronta i piani','Compare plans'));
 button(d,t('Chiudi','Close')).onclick=()=>{d.close();d.remove();};d.addEventListener('cancel',()=>d.remove());d.showModal();
};
// Enforce expiry in the client UI as well; Firestore independently uses request.time.
let wasTrial=false;
setInterval(()=>{
 if(!window.currentUser){wasTrial=false;return;}
 const active=window.rbIsTrial();
 if(wasTrial&&!active){location.reload();return;}
 wasTrial=active;
},15000);
