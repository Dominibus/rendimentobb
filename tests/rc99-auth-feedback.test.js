import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/auth-page.js',import.meta.url),'utf8');
for(const lang of ['it','en'])test(`duplicate registration has visible safe feedback (${lang})`,()=>{
 let scrolled=0;const node={textContent:'',classList:{toggle(){}},scrollIntoView(){scrolled++;}};
 const ctx={window:{RB_LANG:{current:lang}},$(){return node;},t:(it,en)=>lang==='en'?en:it};
 vm.createContext(ctx);
 vm.runInContext(source.slice(source.indexOf('function message('),source.indexOf('function ui('))+source.slice(source.indexOf('function error('),source.indexOf('window.changeLang')),ctx);
 ctx.error('auth/email-already-in-use');
 assert.match(node.textContent,lang==='it'?/accedere o recuperare la password/:/signing in or resetting/);
 assert.doesNotMatch(node.textContent,/AIza|identitytoolkit|EMAIL_EXISTS/);
 assert.equal(scrolled,1);
});
