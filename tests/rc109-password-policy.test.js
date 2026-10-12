import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {NEW_PASSWORD_MIN_LENGTH,NEW_PASSWORD_MAX_LENGTH,newPasswordIssue} from '../js/password-policy.js';
import {createAuthActionGuard,safeAuthDestination} from '../js/auth-safety.js';
function harness(){
 const calls={signup:[],login:[],reset:[],persist:0}, elements=new Map();
 const node=id=>{if(!elements.has(id))elements.set(id,{value:'',checked:false,hidden:false,style:{},classList:{toggle(){}},textContent:'',scrollIntoView(){},setAttribute(k,v){this[k]=v},removeAttribute(k){if(k==='maxlength')delete this.maxLength;else delete this[k]},reportValidity:()=>true,addEventListener(k,v){this[k]=v}});return elements.get(id)};
 node('email').value='temporary@example.invalid';node('name').value='Temporary';node('role').value='unknown';
 const storage=new Map();const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const c={window:{RB_LANG:{current:'it'}},document:{getElementById:node,addEventListener(){}},location:{origin:'https://www.rendimentobb.it',assign(){}},localStorage,app:{},getAuth:()=>({}),getFirestore:()=>({}),createAuthActionGuard,safeAuthDestination,NEW_PASSWORD_MIN_LENGTH,NEW_PASSWORD_MAX_LENGTH,newPasswordIssue,
 setPersistence:async()=>{calls.persist++},browserLocalPersistence:{},browserSessionPersistence:{},signInWithEmailAndPassword:async(_a,e,p)=>calls.login.push({e,p}),createUserWithEmailAndPassword:async(_a,e,p)=>{calls.signup.push({e,p});return {user:{uid:'temporary',getIdToken:async()=> 'mock'}}},doc:()=>({}),setDoc:async()=>{},sendPasswordResetEmail:async()=>calls.reset.push(true),fetch:async()=>({}),AbortSignal:{timeout:()=>null}};
 const src=readFileSync(new URL('../js/auth-page.js',import.meta.url),'utf8').replace(/^import[\s\S]*?;\n/gm,'');vm.runInNewContext(src,c);return {calls,node,c};
}
test('new passwords enforce 15 characters, preserve passphrases and reject oversized input',()=>{
 assert.equal(newPasswordIssue('a'.repeat(14)),'too-short');assert.equal(newPasswordIssue('a'.repeat(15)),null);assert.equal(newPasswordIssue('a'.repeat(4096)),null);assert.equal(newPasswordIssue('a'.repeat(4097)),'too-long');assert.equal(newPasswordIssue('una frase lunga con spazi'),null);assert.equal(newPasswordIssue('😀'.repeat(8)),'too-short');assert.equal(newPasswordIssue('😀'.repeat(15)),null);
});
test('signup rejects weak passwords before persistence or provider calls even if HTML validates',async()=>{
 const h=harness();h.node('switch-action').onclick();h.node('password').value='short';await h.node('auth-form').submit({preventDefault(){}});assert.equal(h.calls.persist,0);assert.equal(h.calls.signup.length,0);assert.match(h.node('login-message').textContent,/15/);assert.equal(h.node('password').minLength,15);
 h.node('password').value='a'.repeat(4097);await h.node('auth-form').submit({preventDefault(){}});assert.equal(h.calls.signup.length,0);assert.match(h.node('login-message').textContent,/4096/);
});
test('long passphrases are sent unchanged and existing short-password login is not blocked',async()=>{
 const h=harness();h.node('switch-action').onclick();h.node('password').value='  una frase lunga con spazi  ';await h.node('auth-form').submit({preventDefault(){}});assert.equal(h.calls.signup[0].p,'  una frase lunga con spazi  ');
 h.node('switch-action').onclick();assert.equal(h.node('password').minLength,1);assert.equal(h.node('password').maxLength,undefined);assert.equal(h.node('password-help').hidden,true);h.node('password').value='legacy';await h.node('auth-form').submit({preventDefault(){}});assert.equal(h.calls.login[0].p,'legacy');
});
test('English guidance and recovery request explain requirements without exposing account existence',async()=>{
 const h=harness();h.c.window.RB_LANG.current='en';h.node('switch-action').onclick();assert.match(h.node('password-help').textContent,/at least 15/);await h.node('forgot-password').onclick();assert.equal(h.calls.reset.length,1);assert.match(h.node('login-message').textContent,/If the address belongs to an account/);assert.match(h.node('login-message').textContent,/15/);
});
