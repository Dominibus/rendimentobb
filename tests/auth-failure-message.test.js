import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {authFailureMessage} from '../js/auth-failure-message.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

for(const [code,reference] of [
 ['auth/unauthorized-domain','AUTH-DOMAIN'],['auth/app-not-authorized','AUTH-APP'],
 ['auth/invalid-api-key','AUTH-CONFIG'],['auth/operation-not-allowed','AUTH-METHOD'],
 ['auth/web-storage-unsupported','AUTH-STORAGE'],['auth/unsupported-persistence-type','AUTH-STORAGE'],
 ['auth/invalid-persistence-type','AUTH-STORAGE'],['auth/internal-error','AUTH-INTERNAL']
])test('safe reference and bilingual explanation: '+code,()=>{
 const r=authFailureMessage(code);assert.equal(r.reference,reference);
 assert.match(r.textIT,/Riferimento: AUTH-/);assert.match(r.textEN,/Reference: AUTH-/);
 assert.ok(r.textIT.length>80&&r.textEN.length>80);assert.doesNotMatch(JSON.stringify(r),/apiKey|password=/);
});
for(const value of [undefined,null,{},'', 'auth/new-provider-error','owner@example.invalid',
 'https://example.invalid/?token=SECRET','auth/SECRET','__proto__'])test('unknown values never leak into the message: '+String(value),()=>{
 const r=authFailureMessage(value);assert.equal(r.reference,'AUTH-UNCLASSIFIED');
 assert.doesNotMatch(JSON.stringify(r),/SECRET|example\.invalid|new-provider-error|__proto__/);
 assert.match(r.textEN,/cause is unidentified/);
});
function renderError(code){
 const source=read('js/auth-page.js'),start=source.indexOf('function error(code) {'),end=source.indexOf('\nwindow.changeLang',start);
 let output;vm.runInNewContext(source.slice(start,end)+'\nerror(code);',{code,authFailureMessage,message:(...parts)=>{output=parts;}});
 return output;
}
test('actual page error renderer displays actionable configuration references',()=>{
 assert.match(renderError('auth/app-not-authorized')[1],/AUTH-APP/);
 assert.match(renderError('auth/internal-error')[1],/cause cannot be determined/);
 assert.match(renderError('arbitrary SECRET')[1],/AUTH-UNCLASSIFIED/);
 assert.doesNotMatch(renderError('arbitrary SECRET').join(' '),/SECRET/);
});
test('existing credential and network messages retain their current semantics',()=>{
 for(const code of ['auth/invalid-credential','auth/user-not-found','auth/wrong-password']){
  assert.equal(renderError(code)[1],'Sign-in failed. Check your email and password.');
 }
 assert.equal(renderError('auth/network-request-failed')[1],'Connection unavailable. Try again when online.');
 assert.equal(renderError('auth/too-many-requests')[1],'Too many attempts. Please wait before trying again.');
});
