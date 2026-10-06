import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
const helper=source.slice(source.indexOf('window.openPMSInvestmentTool ='),source.indexOf('window.showPMSTab ='));
test('investment shortcut reveals the scenario tab before scrolling and focusing its tool',()=>{
  const calls=[],frame=[];
  const target={scrollIntoView:()=>calls.push('scroll'),setAttribute:(name,value)=>calls.push([name,value]),focus:()=>calls.push('focus')};
  const ctx={window:{showPMSTab:tab=>calls.push(tab)},document:{getElementById:()=>target},requestAnimationFrame:fn=>frame.push(fn)};
  vm.createContext(ctx);vm.runInContext(helper,ctx);
  assert.equal(ctx.window.openPMSInvestmentTool('revenue-simulator'),true);
  assert.deepEqual(calls,['roi']);
  frame[0]();
  assert.deepEqual(calls,['roi','scroll',['tabindex','-1'],'focus']);
});
test('investment shortcuts reject unrelated targets and missing sections',()=>{
  const ctx={window:{showPMSTab:()=>assert.fail('must not change tab')},document:{getElementById:()=>null},requestAnimationFrame:()=>assert.fail('must not scroll')};
  vm.createContext(ctx);vm.runInContext(helper,ctx);
  assert.equal(ctx.window.openPMSInvestmentTool('booking-form-container'),false);
  assert.equal(ctx.window.openPMSInvestmentTool('roi-market-comparison'),false);
});
