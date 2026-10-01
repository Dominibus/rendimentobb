import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const firebase=readFileSync(new URL('../js/firebase-init.js',import.meta.url),'utf8');
const accessSource=firebase.slice(firebase.indexOf('window.getUserAccess = function(){'),firebase.indexOf('// 🔥 MIRROR GLOBALE'));
function access(plan,role='user',logged=true){const c={window:{currentPlan:plan,userRole:role,currentUser:logged?{uid:'owner'}:null}};vm.createContext(c);vm.runInContext(accessSource,c);return c.window.getUserAccess();}
test('Free Investor Pro annual and admin have the required distinct analysis/PDF entitlements',()=>{
 const expected=[['free','user',false,false],['investor','user',true,false],['pro','user',true,true],['pro_yearly','user',true,true],['free','admin',true,true]];
 for(const [plan,role,analysis,pdf] of expected){const a=access(plan,role);assert.equal(a.canSeeFullAnalysis,analysis,plan);assert.equal(a.canDownloadPDF,pdf,plan);}
});
test('logged-out stale plan and admin role grant no paid rights',()=>{const a=access('pro_yearly','admin',false);assert.equal(a.canSeeFullAnalysis,false);assert.equal(a.canDownloadPDF,false);assert.equal(a.isAdmin,false);});

test('Investor KPI render shows full figures, restores hidden values and creates no advanced-analysis upsell',()=>{
 const source=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
 const fn=source.slice(source.indexOf('function renderUniversalKPI(data = {}){'),source.indexOf('// ================= ROI MESSAGE (HOME)'));
 const nodes=new Map();let staleRemoved=false;
 const c={window:{currentPlan:'investor',getUserAccess:()=>({isInvestor:true,canSeeFullAnalysis:true})},document:{getElementById:id=>{if(id==='investment-verdict')throw Error('Investor must not receive an analysis upsell');if(!nodes.has(id))nodes.set(id,{innerText:'',dataset:{},style:{},classList:{remove(){}}});return nodes.get(id);},querySelectorAll:()=>[{remove(){staleRemoved=true;}}]},formatCurrency:n=>String(n),t:it=>it,appDebugWarn(){}};
 vm.createContext(c);vm.runInContext(fn,c);c.renderUniversalKPI({net:-14261.69,revenue:28506.5,investment:159000});
 assert.equal(nodes.get('profit-annual').innerText,'-14261.69');assert.equal(nodes.get('profit-annual').style.opacity,'1');assert.equal(nodes.get('profit-annual').style.pointerEvents,'auto');assert.equal(staleRemoved,true);
});
