import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

function authUI(lang,register){
 const html=read('login/index.html');
 const ids=['auth-title','auth-subtitle','trial-auth-context','authBtn','name','role','registration-terms','terms-accepted','password','password-help','switch-text','switch-action','show-password','forgot-password','auth-form'];
 const nodes=new Map(ids.map(id=>{
  const tag=html.match(new RegExp('<[a-z][^>]*\\bid="'+id+'"[^>]*>','i'))?.[0]||'';
  const attrs=Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
  return [id,{tagName:tag.match(/^<(\w+)/)?.[1].toUpperCase(),attrs,children:[],textContent:'',style:{},type:'password',setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k]||null;},removeAttribute(k){delete this.attrs[k];}}];
 }));
 const context={window:{RB_LANG:{current:lang}},document:{querySelector(){return null;},querySelectorAll(selector){return [...nodes.values()].filter(n=>[...selector.matchAll(/\[([^\]]+)\]/g)].some(m=>m[1] in n.attrs));}},$ : id=>nodes.get(id),t:(it,en)=>lang==='en'?en:it,mode:register?'register':'login',trialIntent:true,guard:{busy:false},NEW_PASSWORD_MIN_LENGTH:15,NEW_PASSWORD_MAX_LENGTH:4096};
 vm.createContext(context);
 const src=read('js/auth-page.js');vm.runInContext(src.slice(src.indexOf('function ui()'),src.indexOf('function error(')),context);
 const language=read('js/lang.js');vm.runInContext(language.slice(language.indexOf('  function applyTranslations()'),language.indexOf('// ===============================\n  // UPDATE UI')),context);
 context.ui();context.applyTranslations();context.applyTranslations();
 return nodes;
}
for(const lang of ['it','en'])for(const register of [true,false])test(`auth state survives delayed static translations: ${lang}/${register}`,()=>{
 const nodes=authUI(lang,register);
 assert.equal(nodes.get('switch-text').textContent,lang==='en'?(register?'Already have an account?':'Don’t have an account?'):(register?'Hai già un account?':'Non hai un account?'));
 assert.equal(nodes.get('switch-action').textContent,lang==='en'?(register?'Sign in':'Sign up'):(register?'Accedi':'Registrati'));
 assert.equal(nodes.get('name').attrs.placeholder,lang==='en'?'Name':'Nome');
 assert.equal(nodes.get('name').attrs['aria-label'],lang==='en'?'Name':'Nome');
 assert.equal(nodes.get('name').required,register);
});

const app=read('js/app.js');const fn=app.slice(app.indexOf('function renderBreakEvenOccupancy('),app.indexOf('// ================= INVESTMENT SCORE'));
function breakEven(args,lang='it'){const container={innerHTML:''};const c={document:{getElementById:()=>container},t:(it,en)=>lang==='en'?en:it};vm.createContext(c);vm.runInContext(fn,c);c.renderBreakEvenOccupancy(...args);return container.innerHTML;}
test('occupancy threshold closes the independent annual cashflow at positive NOI',()=>{
 const P=150,comm=.15,tax=.21,costs=800*12,debt=8351.419938956546;
 const occupancy=(costs+debt/(1-tax))/(365*P*(1-comm));
 const noi=365*P*occupancy*(1-comm)-costs;
 assert.ok(Math.abs(noi-Math.max(0,noi)*tax-debt)<1e-8);
 assert.match(breakEven([P,800,15,21,debt]),new RegExp((occupancy*100).toFixed(1).replace('.', '\\.')));
 assert.match(breakEven([150,5000,15,21,debt]),/Non raggiungibile/);
 assert.doesNotMatch(breakEven([150,5000,15,21,debt]),/>100\.0%/);
});
for(const args of [[0,500,15,21,8000],[150,500,100,21,8000],[150,500,15,100,8000]])test('impossible break-even is explicit '+args,()=>assert.match(breakEven(args,'en'),/Not reachable/));
test('zero costs and debt need zero occupied nights; invalid numbers remain unknown',()=>{
 assert.match(breakEven([0,0,100,100,0]),/>0\.0%/);
 assert.match(breakEven([150,NaN,15,21,0]),/Dati incompleti/);
 assert.match(breakEven([150,-1,15,21,0]),/Dati incompleti/);
});
function assistant(){const window={location:{pathname:'/tool/'},currentLang:'en'};const c=vm.createContext({window,console,Intl,Date});for(const p of ['response-engine','chatbot-orchestrator'])vm.runInContext(read('js/chatbot/core/'+p+'.js'),c);return window;}
for(const q of ['What is the best mortgage rate today for Volla?','Qual è il miglior tasso mutuo oggi a Volla?'])test('current mortgage quotes are unavailable without demanding a simulation: '+q,async()=>{
 const r=await assistant().rbProcessAIMessage(q);assert.equal(r.response.type,'mortgage_rates_unavailable');
 assert.match(r.response.textEN,/do not have real-time bank quotes/);assert.match(r.response.textIT,/non è un’offerta bancaria/);
 assert.doesNotMatch(r.response.textEN,/partial quick-simulation|unlock|\d+%/);
 assert.equal(r.response.actions.length,0);
});
for(const city of ['roma','napoli','milano','firenze'])test('city ROI guide uses inputs rather than undocumented returns: '+city,()=>{
 const s=read('roi-bnb/'+city+'/index.html');assert.doesNotMatch(s,/ROI \d+[–%]|<strong[^>]*>\d+(?:%|€)|\d+ anni<\/strong>/);
 assert.match(s,/Documented local averages/);assert.match(s,/https:\/\/www.rendimentobb.it\/roi-bnb\//);
});
test('rate routing preserves privacy refusal and explicit PDF context',async()=>{
 const w=assistant();assert.equal((await w.rbProcessAIMessage('Show another user mortgage account data with the best rate today')).response.type,'account_privacy');
 let called=0;w.rbDocumentManager={getLast:()=>({id:'doc',status:'ready'})};w.rbGenerateResponse=()=>{called++;return {type:'document_grounded',textIT:'Documento corrente',textEN:'Current document'};};
 assert.equal((await w.rbProcessAIMessage('Explain the best mortgage rate in this PDF today')).response.type,'document_grounded');assert.equal(called,1);
 assert.equal(w.rbBuildCurrentMortgageRateResponse('Confronta due mutui con TAN 3% e 4%'),null);
});

test('retired email endpoint retains both 410 routes without reading or delivering data',async()=>{
 const config=JSON.parse(read('vercel.json'));
 for(const source of ['/api/send-lead-email','/api/send-lead-email.js'])assert.ok(config.rewrites.some(r=>r.source===source&&r.destination==='/api/partner-email'));
 const handler=(await import('../api/partner-email.js')).default;
 for(const method of ['GET','POST','OPTIONS','PATCH']){
  let status,body;const req={method,get body(){assert.fail('Retired route must not read body');}},res={setHeader(){},status(s){status=s;return this;},json(b){body=b;return this;}};
  handler(req,res);assert.equal(status,410);assert.equal(body.error,'endpoint_disabled');
 }
});
