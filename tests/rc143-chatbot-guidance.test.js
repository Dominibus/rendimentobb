import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/chatbot/core/pro-report-guide.js',import.meta.url),'utf8');
for(const q of ['Da dove inizio per usare Pro sul mio immobile?','Come comincio con Pro?','Where should I start with Pro for my property?'])test('operational onboarding takes precedence over prices: '+q,()=>{
 const window={currentUser:{uid:'owner'},getUserAccess:()=>({isPro:true})};vm.runInNewContext(source,{window});
 const r=window.rbBuildNextStepGuide(q);assert.equal(r.metadata.mode,'next_step');assert.match(r.textIT,/Hai già Pro/);assert.doesNotMatch(r.textIT,/19 €|29 €|richiesta.*interesse/);
});
for(const access of [{isInvestor:true},{isFree:true}])test('expanded onboarding preserves plan boundaries '+JSON.stringify(access),()=>{
 const window={currentUser:{uid:'owner'},getUserAccess:()=>access};vm.runInNewContext(source,{window});
 const r=window.rbBuildNextStepGuide('Da dove inizio per il mio immobile?');assert.ok(r);assert.doesNotMatch(r.textIT,/Hai già Pro/);
});
test('an uploaded document keeps its dedicated reading route',()=>{
 const window={rbDocumentManager:{getLast:()=>({id:'doc'})}};vm.runInNewContext(source,{window});
 assert.equal(window.rbBuildNextStepGuide('Da dove inizio con questo PDF?'),null);assert.equal(window.rbBuildNextStepGuide('Da dove inizio?'),null);
});
