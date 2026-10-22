import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
test('passive ROI and reminders never interrupt reading; voluntary upgrade stays available',()=>{
 const source=app.slice(app.indexOf('window.triggerFunnel = function'),app.indexOf('// 🔥 COMPATIBILITÀ HOME CTA'));
 let opened=0,scheduled=0;
 const window={getUserAccess:()=>({isFree:true}),funnelState:{shown:false}};
 const ctx={window,openUpgradeModal:()=>opened++,setTimeout:()=>scheduled++};vm.createContext(ctx);vm.runInContext(source,ctx);
 for(const type of ['roi','roi_soft','reminder'])window.triggerFunnel({type,roi:20});
 assert.equal(opened,0);assert.equal(scheduled,0);assert.equal(window.funnelState.shown,false);
 window.triggerFunnel({type:'scroll',roi:0});assert.equal(opened,1);
 window.funnelState.shown=false;window.getUserAccess=()=>({isInvestor:true});window.triggerFunnel({type:'scroll'});assert.equal(opened,1);
});
test('compact demo is applied to visitors and removed for paid accounts',()=>{
 const html=readFileSync(new URL('../dashboard/index.html',import.meta.url),'utf8');
 const source=html.slice(html.indexOf('function updateDemoBanner(){'),html.indexOf('// primo controllo immediato'));
 let access={},compact=false;const banner={style:{}};
 const window={getUserAccess:()=>access};
 const document={getElementById:()=>banner,body:{classList:{toggle:(key,value)=>{compact=value;}}}};
 const ctx={window,document};vm.createContext(ctx);vm.runInContext(source,ctx);
 ctx.updateDemoBanner();assert.equal(compact,true);
 for(const plan of [{isLogged:true,isInvestor:true},{isLogged:true,isPro:true},{isLogged:true,isAdmin:true}]){access=plan;ctx.updateDemoBanner();assert.equal(compact,false);}
 access={isLogged:true,isFree:true};ctx.updateDemoBanner();assert.equal(compact,true);
});
test('quick calculator includes currency and locale formatting without changing amounts',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const source=html.slice(html.indexOf('  const currency = n=>'),html.indexOf('  // ================= DEFAULT LOCK'));
 for(const lang of ['it','en']){
 const ctx={lang,netAnnual:16963,revenue:26098,breakEven:16.5};vm.createContext(ctx);
 vm.runInContext(source+'\nglobalThis.values={profitVal,monthVal,revVal,breakVal};',ctx);
 assert.match(ctx.values.profitVal,/€/);assert.match(ctx.values.monthVal,/€/);assert.match(ctx.values.revVal,/€/);
 assert.match(ctx.values.profitVal,lang==='it'?/16\.963/:/16,963/);
 assert.match(ctx.values.breakVal,lang==='it'?/16,5/:/16\.5/);
 }
});
