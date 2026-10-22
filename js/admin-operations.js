import {auth} from './firebase-init.js?v=20261016-rc140';
import {onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import {renderOperations} from './admin-operations-view.js?v=20261022-rc178';
const root=document.getElementById('operations-content');
const feedback=document.getElementById('operations-feedback');
const refresh=document.getElementById('operations-refresh');
const t=(it,en)=>window.currentLang==='en'?en:it;
const allowed=user=>user?.emailVerified===true&&String(user.email||'').toLowerCase()==='rendimentobb@gmail.com';
let data=null,generation=0,controller=null,state='locked',loadedAt=0;
function paint(){
 refresh.disabled=!allowed(auth.currentUser)||state==='loading';
 root.replaceChildren();
 if(data)renderOperations(root,data,window.currentLang);
 feedback.textContent=state==='locked'?t('Accesso riservato all’amministratore con email verificata.','Access requires an administrator with a verified email.'):
 state==='loading'?t('Lettura dei dati operativi…','Reading operational data…'):
 state==='error'?t('Lettura non riuscita. I dati precedenti sono stati rimossi: premi Aggiorna per riprovare.','Read failed. Previous data have been cleared: select Refresh to retry.'):
 t('Dati letti su richiesta. Non è un controllo continuo né una verifica di tutti i servizi.','Data read on request. This is not continuous monitoring or a check of all services.');
}
function clear(){generation++;controller?.abort();controller=null;data=null;loadedAt=0;state='locked';paint();}
async function load(){
 const user=auth.currentUser;
 if(!allowed(user)){clear();return;}
 const current=++generation;controller?.abort();controller=new AbortController();const activeController=controller;const signal=activeController.signal;
 data=null;state='loading';paint();
 const timeout=setTimeout(()=>activeController.abort(),20000);
 try{
 const token=await user.getIdToken();
 if(current!==generation||auth.currentUser?.uid!==user.uid)return;
 const response=await fetch('/api/delete-lead?view=operations',{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal});
 if(!response.ok)throw Error('read_failed');
 const result=await response.json();
 if(result?.schemaVersion!==1)throw Error('invalid_response');
 if(current!==generation||!allowed(auth.currentUser)||auth.currentUser.uid!==user.uid)return;
 data=result;state='ready';loadedAt=Date.now();
 }catch{if(current===generation){data=null;state='error';}}
 finally{clearTimeout(timeout);if(current===generation)paint();}
}
refresh.addEventListener('click',()=>load());
onAuthStateChanged(auth,user=>{clear();if(allowed(user))load();});
document.addEventListener('rb_auth_ready',()=>{if(allowed(auth.currentUser)&&state==='locked')load();});
document.addEventListener('rb_language_changed',paint);
// Re-evaluate staleness locally, without polling Firestore or retaining data across sessions.
setInterval(()=>{if(data&&!document.hidden){if(!allowed(auth.currentUser)){clear();return;}paint();}},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&data&&Date.now()-loadedAt>300000){data=null;state='error';paint();}});
paint();

