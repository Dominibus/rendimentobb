import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import '../js/account-report-cache.js';
const html = fs.readFileSync(new URL('../dashboard-report/index.html',import.meta.url),'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(x=>x.includes('function startOwnedReport'));
const storage=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)}};
function harness(access){
 const session=storage(),local=storage(),listeners={};
 const nodes = new Map();
 const node = id => { if(!nodes.has(id)) nodes.set(id,{style:{},classList:{add(){}},appendChild(){},addEventListener(){},value:"",innerText:"",innerHTML:""}); return nodes.get(id); };
 const report={textContent:'',style:{},classList:{add(){}}};
 const context={URLSearchParams,Date,console,sessionStorage:session,localStorage:local,
   Chart:function(){this.destroy=()=>{};},requestAnimationFrame:fn=>fn(),
   location:{reload(){}}, document:{getElementById:node,createElement:()=>node("created"),querySelector:()=>report,addEventListener:(name,fn)=>listeners[name]=fn},
   window:{currentLang:'it',getUserAccess:()=>access,RBReportCache:globalThis.RBReportCache,location:{search:'?price=150000&roi=90&equity=30000'},addEventListener(){}}};
 vm.createContext(context);vm.runInContext(script,context);
 return {context,session,local,report,nodes,authenticate:user=>listeners.rb_auth_ready({detail:{user}})};
}
test('direct Free and Investor report access clears prior account data without rendering it',()=>{
 for(const access of [{isFree:true},{isInvestor:true}]){
  const h=harness(access);
  globalThis.RBReportCache.write('old-pro',[{propertyPrice:150000,roi:13}],{pms:{bookings:8}},h.session,h.local);
  h.authenticate({uid:'new-account'});
  assert.match(h.report.textContent,/inclusi in Pro/);
  assert.equal(h.session.getItem('rb_owned_report_v1'),null);
  assert.equal(h.context.window.dashboardSimulations.length,0);
 }
});
test('Pro cannot reconstruct a report from query parameters or another account cache',()=>{
 const h=harness({isPro:true});
 globalThis.RBReportCache.write('other-owner',[{propertyPrice:150000,roi:90}],{},h.session,h.local);
 h.authenticate({uid:'current-pro'});
 assert.match(h.report.textContent,/Salva una simulazione valida/);
 assert.equal(h.context.window.dashboardSimulations.length,0);
});

test('Pro renders only its owned financial snapshot, ignoring manipulated query values',()=>{
 const h=harness({isPro:true});
 globalThis.RBReportCache.write('pro-owner',[{propertyPrice:150000,equity:30000,roi:26.3,net:7890,risk:25,city:'Roma',investmentScore:79}],{},h.session,h.local);
 h.authenticate({uid:'pro-owner'});
 assert.equal(h.nodes.get('roi').innerText,'26.3%');
 assert.equal(h.nodes.get('equity').innerText,new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(30000));
 assert.equal(h.context.window.dashboardSimulations[0].roi,26.3);
});
