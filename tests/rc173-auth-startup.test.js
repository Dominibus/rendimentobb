import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/auth-page.js',import.meta.url),'utf8');
const registration=source.split('\n').find(line=>line.startsWith("document.addEventListener('DOMContentLoaded'"));
for(const [saved,requested] of [['it','en'],['en','it']])test(`auth initial language follows window initialization: ${saved} -> ${requested}`,()=>{
 const handlers=[],tasks=[],state={language:saved,rendered:null};
 const context={document:{addEventListener:(name,fn)=>{assert.equal(name,'DOMContentLoaded');handlers.push(fn);}},setTimeout:fn=>tasks.push(fn),ui:()=>{state.rendered=state.language;}};
 vm.runInNewContext(registration,context);
 // DOMContentLoaded reaches document before window, where lang.js initializes.
 for(const fn of handlers)fn();
 state.language=requested;
 for(const task of tasks)task();
 assert.equal(state.rendered,requested);
});
