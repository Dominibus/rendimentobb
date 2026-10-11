import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Firebase delegates to the shared header instead of overwriting the account navigation',()=>{
 const src=read('js/firebase-init.js');const start=src.indexOf('function updateUserUI(user) {');const end=src.indexOf('// AUTH OBSERVER',start);
 const calls=[];const user={uid:'annual',email:'annual@example.invalid'};
 const window={rbRenderHeaderUser:u=>calls.push(u)};
 vm.runInNewContext(src.slice(start,end),{window,document:{getElementById(){throw Error('Legacy renderer must not run');}}});
 const c={window,document:{getElementById(){throw Error('Legacy renderer must not run');}},user};vm.createContext(c);vm.runInContext(src.slice(start,end)+'\nupdateUserUI(user);updateUserUI(null);',c);
 assert.equal(calls[0],user);assert.equal(calls[1],null);
});
test('annual shared header has Dashboard, badge and logout from resolved access',()=>{
 const src=read('js/header.js');const start=src.indexOf('function renderUser(user){');const nodes={'user-area':{innerHTML:''},'rb-mobile-account':{},logout:{addEventListener(){}}};
 const window={currentUser:{uid:'annual'},currentPlan:'pro_yearly',currentLang:'it',innerWidth:1440,getUserAccess:()=>({isLogged:true,isPro:true,isInvestor:false,isAdmin:false})};
 const c={window,document:{getElementById:id=>nodes[id]||null,querySelectorAll:()=>[],addEventListener(){}},console,updateLangButtons(){}};vm.createContext(c);vm.runInContext(src.slice(start),c);c.renderUser(window.currentUser);
 assert.match(nodes['user-area'].innerHTML,/Dashboard/);assert.match(nodes['user-area'].innerHTML,/PRO ANNUALE/);assert.match(nodes['user-area'].innerHTML,/Logout/);
 window.currentLang='en';c.renderUser(window.currentUser);assert.match(nodes['user-area'].innerHTML,/PRO ANNUAL/);
});
test('risk hero uses the same 40 and 65 boundaries as the PDF',()=>{
 const src=read('dashboard-report/index.html');const start=src.indexOf('  riskHero.innerText =');const end=src.indexOf('\n}',start);const expression=src.slice(start,end);
 for(const [risk,expected] of [[0,'BASSO'],[33,'BASSO'],[39,'BASSO'],[40,'MEDIO'],[64,'MEDIO'],[65,'ALTO'],[100,'ALTO']]){
  const riskHero={};vm.runInNewContext(expression,{riskHero,risk,lang:'it'});assert.equal(riskHero.innerText,expected);
 }
});
test('duplicate Firebase module evaluation keeps the loaded annual state and one observer',()=>{
 const src=read('js/firebase-init.js');const start=src.indexOf('if(!window.__rbFirebaseBootstrapInitialized){');const code=src.slice(start);
 let observers=0;const listeners=[];const window={dispatchEvent(){},addEventListener(){},location:{hostname:'www.rendimentobb.it'},RBReportCache:{},RBInvestmentJourney:{}};
 const document={addEventListener:name=>listeners.push(name)};
 const c={window,document,auth:{},db:{},onAuthStateChanged(){observers++;},console,setTimeout(){},Event:function(){},resolveAccountPlan(){return 'free';}};
 vm.createContext(c);vm.runInContext('{'+code+'}',c);
 window.currentUser={uid:'annual'};window.currentPlan='pro_yearly';window.firebaseReady=true;
 const count=listeners.length;vm.runInContext('{'+code+'}',c);
 assert.equal(observers,1);assert.equal(listeners.length,count);
 assert.equal(window.currentPlan,'pro_yearly');assert.equal(window.currentUser.uid,'annual');assert.equal(window.firebaseReady,true);
 assert.equal(window.getUserAccess().isPro,true);
});
