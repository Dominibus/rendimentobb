import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
function setup(){const c={};vm.createContext(c);vm.runInContext(read('js/investment-journey.js'),c);return c;}
const scenario={amount:120000,years:25,rate:3.5,income:30000,propertyPrice:150000,occupancy:70,expenses:799,commission:15,tax:21,location:'Volla'};
test('full mortgage scenario preserves every entered input including zero costs',()=>{
 const c=setup(),values=new Map(),storage={setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k)||null,removeItem:k=>values.delete(k)};
 assert.equal(c.RBInvestmentJourney.write(storage,{...scenario,expenses:0},'annual'),true);
 const restored=c.RBInvestmentJourney.read(storage,'annual');
 for(const [key,value] of Object.entries({...scenario,expenses:0}))assert.equal(restored[key],value,key);
 for(const bad of [{propertyPrice:119999},{occupancy:0},{commission:101},{expenses:-1},{tax:'abc'},{location:'<svg>'}])assert.equal(c.RBInvestmentJourney.validate({...scenario,...bad}).valid,false);
});
test('actual Analyze importer fills all entered fields and reproduces annual revenue',()=>{
 const c=setup(),values=new Map(),nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',setCustomValidity(){},closest:()=>({setAttribute(){}}),addEventListener(){}});return nodes.get(id);};
 c.sessionStorage={setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k)||null,removeItem:k=>values.delete(k)};
 c.localStorage={removeItem(){}};c.window={firebaseReady:true,currentUser:{uid:'annual'},location:{pathname:'/tool/'}};c.document={getElementById:node};c.locationInput={value:'',dispatchEvent(){}};c.Event=class{};c.updateMortgageTransferSummary=()=>{};
 c.RBInvestmentJourney.write(c.sessionStorage,scenario,'annual');const src=read('js/app.js');const start=src.indexOf('function applySelectedMortgage(){');vm.runInContext(src.slice(start,src.indexOf('function updateMortgageTransferSummary()',start)),c);c.applySelectedMortgage();
 assert.equal(node('price').value,'150000');assert.equal(node('equity').value,'30000');assert.equal(c.locationInput.value,'Volla');
 for(const key of ['occupancy','expenses','commission','tax'])assert.equal(node(key).value,String(scenario[key]));
 assert.ok(Math.abs(Number(node('priceNight').value)*365*.7-30000)<1e-7);
 assert.equal(node('loanYears').value,'25');assert.equal(node('interestRate').value,'3.5');assert.equal(values.size,0);
});
test('mortgage Continue validates and writes the optional fields rather than the base scenario',()=>{
 const c=setup(),values=new Map(),nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',setCustomValidity(){},closest:()=>({setAttribute(){}}),reportValidity(){},focus(){},textContent:''});return nodes.get(id);};
 c.sessionStorage={setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k)||null,removeItem:k=>values.delete(k)};c.document={getElementById:node};c.window={currentUser:{uid:'annual'},location:{href:''}};c.t=it=>it;c.readMortgageInputs=()=>({amount:120000,years:25,rate:3.5,income:30000});
 for(const key of ['propertyPrice','occupancy','expenses','commission','tax','location'])node('transfer-'+key).value=String(scenario[key]);
 const src=read('mutui/index.html');const start=src.indexOf('function continueMortgage(');vm.runInContext(src.slice(start,src.indexOf('async function saveLeadFromBank',start)),c);
 assert.equal(c.continueMortgage(),true);assert.equal(c.window.location.href,'/tool/');assert.equal(c.RBInvestmentJourney.read(c.sessionStorage,'annual').propertyPrice,150000);
 c.window.location.href='';node('transfer-propertyPrice').value='100000';assert.equal(c.continueMortgage(),false);assert.equal(c.window.location.href,'');
});
