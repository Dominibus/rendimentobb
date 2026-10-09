import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import {getAuth,applyActionCode} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
const params=new URLSearchParams(location.search),en=params.get('lang')==='en';
const t=(it,english)=>en?english:it;
document.documentElement.lang=en?'en':'it';
const title=document.getElementById('action-title'),message=document.getElementById('action-message'),next=document.getElementById('action-next'),note=document.getElementById('action-note'),icon=document.getElementById('status-icon');
title.textContent=t('Verifica della tua email','Verifying your email');
message.textContent=t('Stiamo verificando il link. Attendi qualche istante.','We are checking your link. Please wait a moment.');
const mode=params.get('mode'),code=params.get('oobCode');
async function run(){
 if(mode!=='verifyEmail'){
  // Firebase uses one action URL for all templates. Keep its existing password
  // reset and email recovery handlers; forward only known Firebase parameters.
  if(['resetPassword','recoverEmail','verifyAndChangeEmail','revertSecondFactorAddition'].includes(mode)&&code){
   const fallback=new URL('https://rendimento-bb.firebaseapp.com/__/auth/action');
   for(const key of ['mode','oobCode','lang'])if(params.has(key))fallback.searchParams.set(key,params.get(key));
   fallback.searchParams.set('apiKey','AIzaSyCGg0ffpwnD0VXkxFgXxyj0ZrAoVZJHdKU');
   location.replace(fallback.href);return;
  }
  fail();return;
 }
 if(!code){fail();return;}
 try{
  const app=initializeApp({apiKey:'AIzaSyCGg0ffpwnD0VXkxFgXxyj0ZrAoVZJHdKU',authDomain:'rendimento-bb.firebaseapp.com',projectId:'rendimento-bb'},'email-action');
  await applyActionCode(getAuth(app),code);
  // Success is shown only after Firebase accepts the code. No subscription is activated here.
  icon.textContent='✓';title.textContent=t('Email verificata. Benvenuto!','Email verified. Welcome!');
  message.textContent=t('Il tuo indirizzo email è stato confermato. Ora puoi tornare su RendimentoBB e continuare nel tuo account.','Your email address has been confirmed. You can now return to RendimentoBB and continue in your account.');
  next.textContent=t('Continua su RendimentoBB →','Continue to RendimentoBB →');next.href='/?investor_trial=1';next.hidden=false;
  note.textContent=t('Se vuoi provare Investor, puoi attivare 7 giorni gratuiti dall’area Abbonamento. Nessuna carta e nessun addebito automatico. La verifica email non attiva la prova.','You can activate 7 free days of Investor through Subscription. No card and no automatic charges. Email verification does not activate the trial.');
  history.replaceState(null,'',location.pathname+'?lang='+(en?'en':'it'));
 }catch{fail();}
}
function fail(){icon.textContent='!';title.textContent=t('Link non valido o già utilizzato','Link invalid or already used');message.textContent=t('Il link potrebbe essere scaduto o la tua email potrebbe essere già verificata. Accedi al tuo account per controllare lo stato e, se necessario, richiedere una nuova email dall’area Abbonamento.','The link may have expired or your email may already be verified. Sign in to check your status and request a new email through Subscription if needed.');next.textContent=t('Accedi al tuo account →','Sign in to your account →');next.href='/login/';next.hidden=false;history.replaceState(null,'',location.pathname+'?lang='+(en?'en':'it'));}
run();
