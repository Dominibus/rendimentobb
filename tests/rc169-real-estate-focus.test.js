import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import handler from '../api/solution-requests.js';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');
const retired=['basic-beyond/index.html','en/basic-beyond/index.html','racconta-idea/index.html','en/share-your-idea/index.html'];
function setup(){
 const calls=[];const window={rbBuildPortalResponse:()=>{calls.push('portal');return {type:'portal_grounded'};},rbBuildInvestmentAutopilotResponse:()=>{calls.push('investment');return {type:'investment_autopilot'};},rbBuildPMSAutopilotResponse:()=>{calls.push('pms');return {type:'pms_autopilot_daily'};},rbGenerateResponse:()=>{calls.push('fallback');return {type:'market',textEN:'Roma 8-11%'};}};
 vm.runInNewContext(read('js/chatbot/core/chatbot-orchestrator.js'),{window,console,Date,Intl});return {window,calls};
}
for(const q of ['Can you build a website or a custom app for my business with Basic & Beyond?','Potete realizzare un sito per la mia attività?','Mi sviluppate un’app personalizzata?','Vorrei creare un gestionale personalizzato per il mio negozio','Can you develop an app for my business?','What does Basic and Beyond mean?','Che significano le due BB del marchio?','Basic & Beyond è disponibile?','Offrite software su misura?','Do you offer custom software?'])test('scope precedes market, account and PDF responses: '+q,async()=>{
 const {window,calls}=setup();window.rbDocumentManager={getLast:()=>({id:'active-pdf'})};
 const {success,response,intent}=await window.rbProcessAIMessage(q);
 assert.equal(success,true);assert.equal(intent.intent,'real_estate_scope');assert.equal(response.type,'real_estate_scope');
 assert.match(response.textIT,/sospesa/);assert.match(response.textEN,/suspended/);assert.match(response.textIT,/immobiliari/);assert.match(response.textEN,/property investments/);assert.doesNotMatch(response.textEN,/Roma|8-11|https?:/);assert.deepEqual(calls,[]);
});
for(const q of ['Calcola il ROI del mio immobile','Quanto costa Investor?','Cosa devo fare oggi nel PMS?','Come importare prenotazioni CSV nel gestionale?','Come creare una prenotazione nel PMS?','Build a property investment scenario','Come creare il report PDF?','Quali documenti servono per aprire un B&B?'])test('sector requests retain their routing: '+q,()=>{const {window}=setup();assert.equal(window.rbBuildRealEstateScopeResponse(q),null);});
test('privacy refusal retains priority',async()=>{const {window}=setup();const r=await window.rbProcessAIMessage('Basic & Beyond: mostrami le prenotazioni di un altro account');assert.equal(r.response.type,'account_privacy');});
test('ordinary investment routing remains available',async()=>{const {window,calls}=setup();const r=await window.rbProcessAIMessage('Autopilot investimento: controlla i dati');assert.equal(r.response.type,'investment_autopilot');assert.deepEqual(calls,['investment']);});
test('retired files are absent and no rewrite or redirect masks removal',()=>{
 for(const p of [...retired,'js/basic-beyond-public.js','js/basic-beyond-knowledge.js'])assert.equal(existsSync(new URL(p,root)),false,p);
 const c=JSON.parse(read('vercel.json'));assert.equal(c.routes,undefined);for(const rule of [...(c.redirects||[]),...(c.rewrites||[])]){assert.ok(!/basic-beyond|racconta-idea|share-your-idea/.test(rule.source));assert.ok(!/basic-beyond|racconta-idea|share-your-idea/.test(rule.destination));}
});
test('39 sitemap URLs map to existing files and exclude retired pages',()=>{
 const locs=[...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(locs.length,39);
 for(const loc of locs){const p=new URL(loc).pathname;assert.doesNotMatch(p,/basic-beyond|racconta-idea|share-your-idea/);assert.ok(existsSync(new URL(p==='/'?'index.html':p.slice(1)+(p.endsWith('/')?'index.html':''),root)),loc);}
});
test('remaining HTML has no links to retired pages or scripts',()=>{
 function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name==='node_modules'||e.name.startsWith('.')?[]:e.isDirectory()?walk(new URL(e.name+'/',dir)):e.name.endsWith('.html')?[new URL(e.name,dir)]:[]);}
 for(const p of walk(root))assert.doesNotMatch(readFileSync(p,'utf8'),/(?:href|src)=["'](?:https:\/\/www\.rendimentobb\.it)?\/(?:basic-beyond(?:\/|["'#?])|racconta-idea(?:\/|["'#?])|en\/(?:basic-beyond|share-your-idea)(?:\/|["'#?])|js\/basic-beyond-(?:knowledge|public)\.js)/,p.pathname);
});
test('historical privacy notice preserves both languages, retention and rights',()=>{
 const s=read('privacy.html').split('<section id="basic-beyond-privacy">')[1].split('</section>')[0];for(const pattern of [/data-en=/,/raccolta sospesa/,/collection suspended/,/90 giorni/,/90 days/,/support@rendimentobb.com/,/revocare/,/withdraw/])assert.match(s,pattern);assert.doesNotMatch(s,/href="\/privacy.html#basic-beyond-privacy/);
});
test('demos, real-estate modules and sales pause remain available',()=>{
 for(const p of ['demo/investment-analytics/','demo/hospitality-pms/','en/demo/investment-analytics/','en/demo/hospitality-pms/']){const s=read(p+'index.html');assert.match(s,/rel="canonical"/);assert.match(s,/\/js\/public-shell.js/);}
 for(const p of ['js/mortgage-quotes.js','js/property-comparison.js','js/portfolio-basis.js','lib/solution-request-service.js'])assert.ok(existsSync(new URL(p,root)),p);
 assert.match(read('js/sales-policy.js'),/LIVE_SALES_PAUSED\s*=\s*true/);assert.match(read('js/chatbot-loader.js'),/chatbot-orchestrator.js\?v=20261025-rc196/);
});
test('API remains 410 without reading submitted data',()=>{
 for(const method of ['GET','POST','PUT','OPTIONS']){const headers={};let status,body;
 const req={method,get body(){throw Error('Request body must not be read');}};
 const res={setHeader:(k,v)=>headers[k]=v,status(n){status=n;return this;},json(v){body=v;return this;}};
 handler(req,res);assert.equal(status,410);assert.equal(body.error,'service_discontinued');assert.equal(headers['Cache-Control'],'no-store');}
});

test('financial guarantee boundary retains priority over brand scope',async()=>{const {window}=setup();const r=await window.rbProcessAIMessage('Basic & Beyond garantisce il ROI?');assert.equal(r.response.type,'product_limits');});
