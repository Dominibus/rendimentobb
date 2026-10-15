import {TERMS_VERSION,OFFERS,activeTrial,timestampMillis} from './subscription-offer.js?v=20261015-rc128';
import {getBillingPlanForScope,isSandboxHost} from './account-plan.js?v=20261015-rc128';
import {isLiveSalesPaused,SALES_NOTICE} from './sales-policy.js?v=20261015-rc128';
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
function conditions(d){const p=add(d,'p','');link(p,'/terms.html',t('Condizioni di abbonamento','Subscription terms'));link(p,'/privacy.html',t('Informativa privacy','Privacy notice'));link(p,'/withdrawal.html#withdrawal-form',t('Recedere dal contratto qui','Withdraw from the contract here'));}
function acceptance(d){const label=add(d,'label','');label.style.cssText='display:flex;gap:10px;align-items:start;margin:18px 0;';const box=document.createElement('input');box.type='checkbox';box.style.cssText='width:18px;height:18px;flex-shrink:0;margin-top:4px;';label.append(box);add(label,'span',t('Ho letto e accetto le condizioni di abbonamento. Ho preso visione dell’informativa privacy.','I have read and accept the subscription terms and have reviewed the privacy notice.'));return box;}
window.rbLiveSalesPaused=()=>isLiveSalesPaused(!isSandboxHost(location.hostname));
window.rbShowSalesPause=(plan,{reason=''}={})=>{
 const inTrial=!!window.currentUser&&window.rbIsTrial();
 const activePro=!!window.currentUser&&!!(window.getUserAccess?.()?.isPro||window.getUserAccess?.()?.isAdmin);
 const report=reason==='report';
 if(activePro){
  const d=dialog(t('Accesso Pro già attivo','Pro access already active'));
  add(d,'p',t('Hai già accesso ai report Pro, ai PDF e alla guida alla lettura. Non serve prenotarti o richiedere un nuovo accesso.','You already have access to Pro reports, PDFs and guided reading. You do not need to register interest or request access again.'));
  link(d,'/dashboard/',t('Apri i tuoi report Pro','Open your Pro reports'));
  button(d,t('Chiudi','Close')).onclick=()=>{d.close();d.remove();};
  d.addEventListener('cancel',()=>d.remove());d.showModal();return;
 }
 const d=dialog(report?t('Report e PDF riservati a Pro','Reports and PDFs require Pro'):t('Partecipa ai test di RendimentoBB','Join RendimentoBB testing'));
 if(report||inTrial||activePro){
  if(report)add(d,'p',inTrial?t('La tua prova Investor è già attiva e non include i PDF. Questa funzione è riservata ai piani Pro.','Your Investor trial is already active and does not include PDFs. This feature requires a Pro plan.'):t('Questa funzione è riservata ai piani Pro. Free e Investor, anche in prova, non includono i PDF.','This feature requires a Pro plan. Free and Investor, including the trial, do not include PDFs.'));
  else if(activePro)add(d,'p',t('Hai già accesso alle funzioni Pro. Apri la dashboard per report, PDF e guida alla lettura; non occorre attivare una prova.','You already have access to Pro features. Open the dashboard for reports, PDFs and guided reading; no trial activation is needed.'));
  else add(d,'p',t('La tua prova Investor è già attiva. Puoi continuare a usare analisi, dashboard e PMS; i PDF sono riservati a Pro.','Your Investor trial is already active. You can keep using analyses, dashboard and PMS; PDFs require Pro.'));
  add(d,'p',t('In questa fase i nuovi acquisti non sono disponibili. Puoi lasciare il tuo interesse per ricevere un avviso all’apertura degli abbonamenti, senza impegno o attivazioni automatiche.','New purchases are currently unavailable. Register your interest to be notified when subscriptions open, without commitment or automatic activation.'));
 }else{
  add(d,'p',t(SALES_NOTICE.it,SALES_NOTICE.en));
  button(d,t('Scopri la prova Investor','Explore the Investor trial')).onclick=()=>{d.close();d.remove();window.rbOpenSubscription();};
 }
 link(d,'/plan-interest.html'+(['investor','pro','pro_yearly'].includes(plan)?'?plan='+encodeURIComponent(plan):''),t('Avvisami all’apertura','Notify me when subscriptions open'));
 link(d,'/contact.html',t('Contatti','Contact'));
 button(d,t('Chiudi','Close')).onclick=()=>{d.close();d.remove();};
 d.addEventListener('cancel',()=>d.remove());d.showModal();
};
const proInterestOriginals=new WeakMap();
const activeProAccess=()=>!!window.currentUser&&!!(window.getUserAccess?.()?.isPro||window.getUserAccess?.()?.isAdmin);
const proInterestURL=value=>/^(?:https:\/\/(?:www\.)?rendimentobb\.(?:it|com))?\/plan-interest\.html\?plan=pro(?:_yearly)?(?:&|$)/.test(String(value||''));
const proPricingAction=node=>/plan\s*:\s*['"]pro(?:_yearly)?['"]/.test(node?.getAttribute?.('onclick')||'');
function renderProInterestAccess(){
 const pro=activeProAccess();
 for(const e of document.querySelectorAll('a[href*="plan-interest.html?plan=pro"],a[data-rb-pro-interest]')){
  if(!proInterestOriginals.has(e)){
   const href=e.getAttribute('href');if(!proInterestURL(href))continue;
   proInterestOriginals.set(e,{href,it:e.getAttribute('data-it'),en:e.getAttribute('data-en'),text:e.textContent});
   e.setAttribute('data-rb-pro-interest','true');
  }
  const old=proInterestOriginals.get(e);
  e.setAttribute('href',pro?'/dashboard/':old.href);
  const it=pro?'Apri i tuoi report Pro':old.it||old.text,en=pro?'Open your Pro reports':old.en||old.text;
  e.setAttribute('data-it',it);e.setAttribute('data-en',en);e.textContent=t(it,en);
 }
 const form=document.getElementById?.('plan-interest-form'),select=document.getElementById?.('interest-plan');
 if(form&&select){
  const alreadyActive=pro&&['pro','pro_yearly'].includes(select.value);
  form.hidden=alreadyActive;
  let notice=document.getElementById('pro-active-interest-notice');
  if(alreadyActive&&!notice){notice=document.createElement('aside');notice.id='pro-active-interest-notice';notice.setAttribute('role','status');form.parentElement.insertBefore(notice,form);}
  if(notice){notice.hidden=!alreadyActive;if(alreadyActive){notice.textContent=t('Hai già accesso alle funzioni Pro. Non serve inviare una richiesta d’interesse. ','You already have access to Pro features. You do not need to submit an interest request. ');link(notice,'/dashboard/',t('Apri i tuoi report Pro','Open your Pro reports'));}}
 }
}
document.addEventListener('click',event=>{
 if(!window.rbLiveSalesPaused()||!activeProAccess())return;
 const node=event.target?.closest?.('a,button');if(!node)return;
 if(!node.hasAttribute?.('data-rb-pro-interest')&&!proInterestURL(node.getAttribute?.('href'))&&!proPricingAction(node))return;
 event.preventDefault();event.stopImmediatePropagation();window.location.assign('/dashboard/');
},true);
document.addEventListener('change',event=>{if(event.target?.id==='interest-plan')renderProInterestAccess();});
function renderSalesPause(){
 renderProInterestAccess();
 if(!window.rbLiveSalesPaused()){for(const e of document.querySelectorAll('[data-rb-sales-notice]'))e.hidden=true;return;}
 for(const e of document.querySelectorAll('[data-rb-sales-notice]')){
  const access=window.getUserAccess?.()||{},pro=!!window.currentUser&&(access.isPro||access.isAdmin),inTrial=!!window.currentUser&&window.rbIsTrial();
  e.hidden=false;
  e.textContent=pro?t('Hai già accesso alle funzioni Pro: report integrati, PDF e guida alla lettura. I nuovi acquisti restano sospesi; puoi continuare a usare il piano attivo.','You already have access to Pro features: integrated reports, PDFs and guided reading. New purchases remain paused; you can keep using your active plan.'):
    inTrial?t('La tua prova Investor è già attiva: analisi, dashboard e PMS sono disponibili fino alla scadenza indicata nell’account. Report integrati e PDF richiedono Pro. I nuovi acquisti sono sospesi; puoi richiedere un avviso senza impegno.','Your Investor trial is already active: analyses, dashboard and PMS remain available until your account expiry. Integrated reports and PDFs require Pro. New purchases are paused; you may request a non-binding opening notice.'):t(SALES_NOTICE.it,SALES_NOTICE.en);
 }
 for(const e of document.querySelectorAll('#pricing [onclick*="triggerUpgradeFlow"]')){
  const pro=activeProAccess()&&proPricingAction(e);
  e.setAttribute('data-it',pro?'Apri i tuoi report Pro':'Avvisami all’apertura');e.setAttribute('data-en',pro?'Open your Pro reports':'Notify me when subscriptions open');
  e.textContent=t(pro?'Apri i tuoi report Pro':'Avvisami all’apertura',pro?'Open your Pro reports':'Notify me when subscriptions open');
 }
}
document.addEventListener('DOMContentLoaded',renderSalesPause);
document.addEventListener('rb_language_changed',renderSalesPause);
for(const event of ['rb_plan_ready','rb_user_logged','rb_user_logged_out']){document.addEventListener(event,renderSalesPause);window.addEventListener?.(event,renderSalesPause);}
if(document.readyState!=='loading')renderSalesPause();
window.rbReviewPurchase=plan=>new Promise(resolve=>{
 if(window.rbLiveSalesPaused()){window.rbShowSalesPause(plan);return resolve(false);}
 const offer=OFFERS[plan];if(!offer)return resolve(false);
 const d=dialog(t('Prima di acquistare','Before you purchase'));
 add(d,'p',`${offer.name} · €${offer.amount} / ${offer.interval==='year'?t('anno','year'):t('mese','month')}`);
 add(d,'p',offer.pdf?t('Analisi salvate, dashboard e PMS, più report integrati, PDF IT/EN e guida alla lettura.','Saved analyses, dashboard and PMS, plus integrated reports, IT/EN PDFs and guided reading.'):t('Analisi salvate, dashboard e PMS. Report PDF esclusi.','Saved analyses, dashboard and PMS. PDF reports excluded.'));
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
 if(window.rbLiveSalesPaused())add(d,'p',t(SALES_NOTICE.it,SALES_NOTICE.en));
 const data=ownedData(),sandbox=isSandboxHost(location.hostname),billing=getBillingPlanForScope(data,sandbox),prefix=sandbox?'sandboxTrial':'trial';
 const paid=['investor','pro','pro_yearly'].includes(billing);
 const inTrial=!paid&&window.rbIsTrial();
 add(d,'p',inTrial?t('Investor in prova · termina il ','Investor trial · ends ')+new Date(timestampMillis(data[`${prefix}EndsAt`])).toLocaleString(window.currentLang==='en'?'en-GB':'it-IT'):t('Piano: ','Plan: ')+(OFFERS[billing]?.name||'Free'));
 if(inTrial)add(d,'p',t('La tua prova mantiene la scadenza indicata sopra. I 30 giorni del programma tester si applicano solo alle nuove attivazioni; una prova precedente non viene prolungata o riattivata.','Your trial keeps the expiry shown above. The 30-day tester programme applies only to new activations; an earlier trial is not extended or restarted.'));
 if(billing==='free') add(d,'p',t('Prova Investor: 30 giorni senza carta e senza addebiti, con analisi salvate, dashboard e PMS. Report PDF esclusi. Alla scadenza ritorni a Free; i dati salvati non vengono eliminati automaticamente. I PDF sono riservati ai piani Pro. La disponibilità dei nuovi acquisti è indicata qui.','Investor trial: 30 days without a card or charges, with saved analyses, dashboard and PMS. PDF reports excluded. At expiry you return to Free; saved data is not automatically deleted. PDFs require a Pro plan. New purchase availability is shown here.'));
 const billingPrefix=sandbox?'sandbox':'';
 const billingField=name=>data[billingPrefix?billingPrefix+name[0].toUpperCase()+name.slice(1):name];
 const periodEnd=Number(billingField('currentPeriodEnd'));
 if(paid&&Number.isFinite(periodEnd)&&periodEnd>0)add(d,'p',(billingField('cancelAtPeriodEnd')===true?t('Rinnovo disattivato · accesso fino al ','Renewal stopped · access until '):t('Periodo corrente fino al ','Current period ends '))+new Date(periodEnd*1000).toLocaleString(window.currentLang==='en'?'en-GB':'it-IT'));
 conditions(d);
 add(d,'p',t('Il recesso online prevede un riepilogo e una conferma, con ricevuta scaricabile e inviata via email. È distinto dalla disattivazione del rinnovo su Stripe.','Online withdrawal has a review and confirmation step, with a downloadable receipt sent by email. It is separate from stopping renewal on Stripe.'));
 const notice=add(d,'p','');notice.setAttribute('role','status');
 if(!paid&&!inTrial&&!data[`${prefix}StartedAt`]){
  if(window.currentUser.emailVerified!==true){
    const verify=button(d,t('Richiedi email di verifica','Request verification email'));
    verify.onclick=async()=>{verify.disabled=true;try{await window.rbSendVerificationEmail();notice.textContent=t('Email richiesta. Apri il link ricevuto, poi ricarica la pagina.','Email requested. Open the received link, then reload the page.');}catch(e){notice.textContent=t('Richiesta non disponibile: riprova più tardi o contatta il supporto.','Request unavailable: retry later or contact support.');verify.disabled=false;}};
  }
  const box=acceptance(d),start=button(d,t('Attiva 30 giorni di Investor gratis','Start 30 free days of Investor'));start.disabled=true;box.onchange=()=>start.disabled=!box.checked;
  start.onclick=async()=>{if(!box.checked)return;start.disabled=true;try{await request('trial',{acceptedTerms:true,termsVersion:TERMS_VERSION});localStorage.removeItem('pending_plan');location.reload();}catch(e){notice.textContent=errors[e.message]?t(...errors[e.message]):t('Operazione non disponibile. Riprova o contatta il supporto.','Operation unavailable. Retry or contact support.');start.disabled=!box.checked;}};
 }
 const billingCustomer=data[sandbox?'sandboxStripeCustomerId':'stripeCustomerId'];
 if(paid&&!billingCustomer)add(d,'p',t('Piano assegnato direttamente: nessun rinnovo automatico gestibile su Stripe. Per informazioni contatta il supporto.','Directly assigned plan: there is no automatic renewal to manage on Stripe. Contact support for information.'));
 if(typeof billingCustomer==='string'&&billingCustomer.startsWith('cus_')){const manage=button(d,t('Gestisci rinnovo e fatture su Stripe','Manage renewal and invoices on Stripe'));manage.onclick=async()=>{manage.disabled=true;try{const result=await request('portal');if(!result.url?.startsWith('https://billing.stripe.com/'))throw Error('INVALID_URL');location.assign(result.url);}catch(e){notice.textContent=errors[e.message]?t(...errors[e.message]):t('Portale non disponibile: contatta support@rendimentobb.com.','Portal unavailable: contact support@rendimentobb.com.');manage.disabled=false;}};}
 // Only offer a receipt from the current billing environment. A sandbox
 // purchase must never create a live download action (or vice versa).
 const contractSession=data[sandbox?'sandboxStripeSessionId':'stripeSessionId'];
 if(typeof contractSession==='string'&&/^cs_[A-Za-z0-9_]+$/.test(contractSession)){
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
