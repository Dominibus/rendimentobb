import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('js/chatbot/core/response-engine.js');
test('plan answers work on home without an analysis and override incorrect analysis intents',()=>{
 for(const message of ['differenza tra Pro mensile e annuale','difference between monthly and yearly Pro','prezzi piani','cosa include Investor']){
  const window={location:{pathname:'/'}};const c={window,console};vm.createContext(c);vm.runInContext(source,c);
  const result=window.rbGenerateResponse({message,intent:{intent:'roi_analysis'}});
  assert.equal(result.type,'subscriptions');assert.match(result.textIT,/199/);assert.match(result.textIT,/149/);
  assert.doesNotMatch(result.textIT,/dati parziali|PDF bancario|ROI reale/);
 }
});
test('plan renewal gives an existing support path rather than a fictional account screen',()=>{
 const window={};vm.runInNewContext(source,{window,console});
 const result=window.rbGenerateResponse({message:'come disdire Pro?',intent:{}});
 assert.equal(result.type,'subscriptions');assert.match(result.textIT,/contatta l’assistenza/);
});
test('shared header starts both before and after DOMContentLoaded',()=>{
 const header=read('js/header.js');const start=header.indexOf('if(document.readyState === "loading"){',header.indexOf('function initializeSharedHeader'));
 const end=header.indexOf('/* =====================',start);const registration=header.slice(start,end);
 for(const readyState of ['loading','interactive','complete']){
  let runs=0,callback;vm.runInNewContext(registration,{initializeSharedHeader:()=>runs++,document:{readyState,addEventListener(event,fn){assert.equal(event,'DOMContentLoaded');callback=fn;}}});
  if(readyState==='loading'){assert.equal(runs,0);callback();}assert.equal(runs,1);
 }
});
