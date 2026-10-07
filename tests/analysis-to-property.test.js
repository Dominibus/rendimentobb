import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/dashboard.js',import.meta.url),'utf8');
const slice=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
const actions=slice('window.openPropertyFromAnalysis = async function(analysisId){','window.openPropertyEditor = async function(id){');
const close=slice('window.closePropertyModal = function(){','// =====================================\n// 🛠️ RENOVATION PLANNER');
const save=slice('window.saveProperty = async function(){','\nif(canUseFirestorePMS()){\n\n\n');
function harness(){
 const nodes=new Map(),writes=[],events=[],alerts=[];
 const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',style:{},focus(){this.focused=true;}});return nodes.get(id);};
 const c={window:{currentUser:{uid:'owner'},dashboardSimulations:[{id:'a1',city:'Firenze',price:200000,equity:45000,roi:-4.2,realROI:-0.9,net:-1260,risk:78,occupancy:50}]},
 document:{getElementById:node},t:x=>x,canUseFirestorePMS:()=>true,db:{},
 populatePropertyAnalysisSelect:()=>{},updatePropertyTouristTaxVisibility:()=>{},
 alert:x=>alerts.push(x),dashboardError:(...args)=>events.push(['error',...args]),
 serverTimestamp:()=> 'SERVER_TIME',doc:(...args)=>({id:args.length===1?'new-property':args.at(-1)}),collection:(db,name)=>name,
 query:()=>({}),where:()=>({}),getDocs:async()=>({docs:[]}),
 writeBatch:()=>({set:(ref,data)=>writes.push(['property',ref,data]),update:(ref,data)=>writes.push(['analysis',ref,data]),commit:async()=>events.push('commit')}),
 addDoc:async()=>{throw new Error('linked flow must use a batch');},
 loadProperties:async()=>events.push('properties'),loadPMSStats:async()=>events.push('stats'),loadDashboard:async()=>events.push('dashboard')};
 c.window.showPMSTab=tab=>events.push(tab);c.window.openPropertyEditor=async id=>events.push(['editor',id]);
 vm.createContext(c);vm.runInContext(actions+close,c);c.closePropertyModal=c.window.closePropertyModal;vm.runInContext(save,c);
 return {c,node,writes,events,alerts};
}
test('analysis add opens preselected form without database writes and cancel resets context',async()=>{
 const {c,node,writes}=harness();
 await c.window.openPropertyFromAnalysis('a1');
 assert.equal(node('property-analysis').value,'a1');assert.equal(node('property-city').value,'Firenze');
 assert.equal(node('property-name').value,'');assert.equal(node('property-name').focused,true);
 assert.equal(node('property-modal').style.display,'flex');assert.equal(writes.length,0);
 c.window.closePropertyModal();assert.equal(c.window.pendingPropertyAnalysisId,null);
 c.window.openPropertyModal();assert.equal(node('property-analysis').value,'');
});
test('save from analysis creates linked property batch then shows properties after refresh',async()=>{
 const {c,node,writes,events}=harness();
 await c.window.openPropertyFromAnalysis('a1');node('property-name').value='Casa Firenze';
 await c.window.saveProperty();
 assert.equal(writes.length,2);assert.equal(writes[0][2].analysisId,'a1');assert.equal(writes[0][2].name,'Casa Firenze');
 assert.equal(writes[0][2].investmentSnapshot.roi,-4.2);
 assert.equal(writes[1][2].propertyId,'new-property');assert.equal(writes[1][2].isPortfolio,true);
 assert.deepEqual(events,['commit','properties','stats','dashboard','properties']);
});
test('analysis flow requires a name, gates Free, and opens existing linked property',async()=>{
 const {c,writes,alerts,events}=harness();
 await c.window.openPropertyFromAnalysis('a1');await c.window.saveProperty();
 assert.equal(writes.length,0);assert.equal(alerts.length,1);
 c.window.closePropertyModal();c.canUseFirestorePMS=()=>false;
 await c.window.openPropertyFromAnalysis('a1');assert.equal(c.window.pendingPropertyAnalysisId,null);
 c.canUseFirestorePMS=()=>true;c.window.dashboardSimulations[0].propertyId='existing';
 await c.window.openPropertyFromAnalysis('a1');assert.deepEqual(events,[['editor','existing']]);
});
test('strategic add action delegates to creation while portfolio removal keeps its own behavior',async()=>{
 const {c,events}=harness();
 c.updateDoc=async(...args)=>events.push(['update',args.at(-1)]);
 vm.runInContext(slice('async function togglePortfolioAnalysis(e){','// ================= DOWNLOAD REPORT DASHBOARD'),c);
 const makeEvent=btn=>({target:{closest:()=>btn},preventDefault(){},stopPropagation(){}});
 await c.togglePortfolioAnalysis(makeEvent({dataset:{id:'a1',active:'true',linked:'false',action:'create-property'}}));
 assert.equal(c.window.pendingPropertyAnalysisId,'a1');assert.equal(events.length,0);
 await c.togglePortfolioAnalysis(makeEvent({dataset:{id:'a1',active:'true',linked:'false'}}));
 assert.equal(events[0][0],'update');assert.equal(events[0][1].isPortfolio,false);
});
