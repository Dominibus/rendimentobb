import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('whole auth ESM initializes without an optional diagnostics file; no auth operation is invoked',()=>{
 const harness=String.raw`
  import vm from 'node:vm';
  import fs from 'node:fs';
  const source=fs.readFileSync(process.argv[1],'utf8');
  const nodes=new Map(),events=[],imports=[];let forbiddenCalls=0;
  const forbidden=()=>{forbiddenCalls++;throw Error('Authentication must not run in this preflight');};
  const node=id=>{
   if(!nodes.has(id))nodes.set(id,{hidden:false,style:{},classList:{toggle(){}},
    setAttribute(){},removeAttribute(){},addEventListener(event,handler){events.push({id,event,handler});}});
   return nodes.get(id);
  };
  const context=vm.createContext({console,URLSearchParams,setTimeout:()=>{},
   window:{RB_LANG:{current:'it'}},location:{search:''},
   document:{getElementById:node,addEventListener:(event,handler)=>events.push({id:'document',event,handler})},
   localStorage:{getItem:()=>null,setItem:forbidden,removeItem:forbidden}});
  const stub=values=>new vm.SyntheticModule(Object.keys(values),function(){
   for(const [key,value] of Object.entries(values))this.setExport(key,value);
  },{context});
  const module=new vm.SourceTextModule(source,{context});
  let initialized=false;
  try {
   await module.link(spec=>{
    imports.push(spec);
    // No optional presentation dependency is provided. Its absence must not stop UI setup.
    if(spec.includes('auth-failure-message'))throw Error('Optional diagnostics unavailable');
    if(spec.includes('password-policy'))return stub({NEW_PASSWORD_MIN_LENGTH:15,NEW_PASSWORD_MAX_LENGTH:4096,newPasswordIssue:forbidden});
    if(spec.includes('firebase-init'))return stub({app:{}});
    if(spec.includes('firebase-auth'))return stub({getAuth:()=>({}),signInWithEmailAndPassword:forbidden,
     createUserWithEmailAndPassword:forbidden,sendPasswordResetEmail:forbidden,setPersistence:forbidden,
     browserSessionPersistence:{},browserLocalPersistence:{}});
    if(spec.includes('firebase-firestore'))return stub({getFirestore:()=>({}),doc:forbidden,setDoc:forbidden});
    if(spec.includes('auth-safety'))return stub({safeAuthDestination:forbidden,createAuthActionGuard:()=>({busy:false,run:forbidden})});
    throw Error('Unrecognized dependency');
   });
   await module.evaluate();initialized=true;
  } catch {}
  console.log(JSON.stringify({initialized,forbiddenCalls,
   diagnosticImports:imports.filter(s=>s.includes('auth-failure-message')).length,
   submitHandlers:events.filter(e=>e.id==='auth-form'&&e.event==='submit').length,
   resetHandler:typeof nodes.get('forgot-password')?.onclick,
   modeHandler:typeof nodes.get('switch-action')?.onclick,
   languageHandler:vm.runInContext('typeof window.changeLang',context),
   title:nodes.get('auth-title')?.textContent}));
 `;
 const result=JSON.parse(execFileSync(process.execPath,['--experimental-vm-modules','--input-type=module','-e',harness,
  fileURLToPath(new URL('../js/auth-page.js',import.meta.url))],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
 assert.equal(result.initialized,true);assert.equal(result.diagnosticImports,0);
 assert.equal(result.submitHandlers,1);assert.equal(result.resetHandler,'function');
 assert.equal(result.modeHandler,'function');assert.equal(result.languageHandler,'function');
 assert.equal(result.title,'Accesso');assert.equal(result.forbiddenCalls,0);
});
