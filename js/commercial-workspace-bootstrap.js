import {mountCommercialWorkspace,createCommercialDemoClient} from './commercial-workspace-ui.js?v=20261028-rc213';
import {createCommercialClient} from './commercial-workspace-client.js?v=20261025-rc196';
import {consumeCommercialTransfer} from './commercial-transfer.js?v=20261025-rc196';
const root=document.querySelector('[data-commercial-workspace]'),english=document.documentElement.lang==='en',demo=new URLSearchParams(location.search).get('demo')==='1';
let dirty=false,app;
window.addEventListener('pagehide',()=>app?.destroy());
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
function download(csv,name){const blob=new Blob([csv],{type:name.endsWith('.json')?'application/json':'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function login(){try{localStorage.setItem('login_redirect',english?'/en/gestione-commerciale/':'/gestione-commerciale/');}catch{}location.assign('/login/');}
if(demo){
 document.body.dataset.commercialMode='demo';const demoAccount=document.querySelector('[data-commercial-account]');if(demoAccount){demoAccount.textContent=english?'Sign in':'Accedi';demoAccount.onclick=login;}
 for(const b of document.querySelectorAll('[data-public-language]'))b.dataset.url+=(b.dataset.url.includes('?')?'&':'?')+'demo=1';
 app=mountCommercialWorkspace(root,{client:createCommercialDemoClient(),english,demo:true,download,onDirty:v=>dirty=v,onLogin:login});await app.setOwner('demo');
}else{
 try{
  const {auth}=await import('./firebase-init.js?v=20261012-rc106');
  const {onAuthStateChanged,signOut}=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
  const client=createCommercialClient({getUser:()=>auth.currentUser,storage:sessionStorage});
  app=mountCommercialWorkspace(root,{client,english,download,onDirty:v=>dirty=v,onLogin:login});
  let owner=null,authEpoch=0;
  onAuthStateChanged(auth,async user=>{
   const epoch=++authEpoch;owner=user?.uid||null;await app.setOwner(owner);
   const accountButton=document.querySelector('[data-commercial-account]');
   if(epoch!==authEpoch)return;
   if(accountButton){accountButton.textContent=user?(english?'Sign out':'Esci'):(english?'Sign in':'Accedi');accountButton.onclick=user?async()=>{if(!dirty||confirm(english?'Discard unsaved edits and sign out?':'Lasciare le modifiche non salvate e uscire?')){try{await signOut(auth);}catch{const p=document.createElement('p');p.setAttribute('role','alert');p.textContent=english?'Sign-out failed. Retry; you are still signed in.':'Uscita non riuscita. Riprova: la sessione è ancora attiva.';root.prepend(p);}}}:login;}
   if(user){const draft=consumeCommercialTransfer(sessionStorage);if(draft&&confirm(english?'Import the scenario you chose as a draft? Nothing will be saved automatically.':'Importare come bozza lo scenario che hai scelto? Nessun salvataggio automatico.'))app.importDraft(draft);}
  });
  window.addEventListener('rb_plan_ready',()=>{if(owner&&!dirty)app.refresh();});
 }catch{
  const p=document.createElement('p');p.setAttribute('role','alert');p.textContent=english?'Account service unavailable. Reload to retry, or explore the clearly labelled demo.':'Servizio account non disponibile. Ricarica per riprovare oppure esplora la demo esplicitamente indicata.';root.replaceChildren(p);
 }
}
// Fixed destinations, always within this product. No hidden account switch.
for(const link of document.querySelectorAll('[data-workspace-view]'))link.addEventListener('click',e=>{e.preventDefault();root.querySelectorAll('.cw-tabs button')[Number(link.dataset.workspaceView)]?.click();root.scrollIntoView({block:'start'});});
