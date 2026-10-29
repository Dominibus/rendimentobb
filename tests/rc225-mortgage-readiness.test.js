import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../mutui/index.html',import.meta.url),'utf8');
const start=html.indexOf('document.addEventListener("DOMContentLoaded", () => {');
const boot=html.slice(start,html.indexOf('</script>',start));
function mount({dependency=true,lang='it'}={}){
 const docEvents={},nodes=new Map();let calculations=0;
 for(const id of ['amount','years','rate','income','calc-btn','mortgage-ready-status','mortgage-input-status','transfer']){
  nodes.set(id,{disabled:true,dataset:{},events:{},addEventListener(type,fn){this.events[type]=fn;}});
 }
 const journey={payment(){},clear(){}};
 const context={window:{RBInvestmentJourney:dependency?journey:undefined},RBInvestmentJourney:journey,document:{addEventListener(type,fn){docEvents[type]=fn;},getElementById:id=>nodes.get(id),querySelector:s=>s==='[data-mortgage-transfer]'?nodes.get('transfer'):null},t:(it,en)=>lang==='en'?en:it,calculate:()=>{calculations++;},continueMortgage(){}};
 vm.runInNewContext(boot,context);
 return {nodes,load:()=>docEvents.DOMContentLoaded(),calculations:()=>calculations};
}
test('mortgage controls remain disabled until handlers exist; the first enabled click calculates once',()=>{
 for(const lang of ['it','en']){
  const s=mount({lang});assert.equal(s.nodes.get('calc-btn').disabled,true);
  s.load();const button=s.nodes.get('calc-btn');assert.equal(button.disabled,false);assert.equal(s.nodes.get('transfer').disabled,false);
  button.events.click();assert.equal(s.calculations(),1);
  assert.equal(s.nodes.get('mortgage-ready-status').textContent,lang==='en'?'Calculator ready':'Calcolatore pronto');
 }
});
test('a failed dependency does not expose a working-looking mortgage calculation button',()=>{
 const s=mount({dependency:false});s.load();assert.equal(s.nodes.get('calc-btn').disabled,true);assert.equal(s.nodes.get('transfer').disabled,true);assert.equal(s.nodes.get('calc-btn').events.click,undefined);
});
