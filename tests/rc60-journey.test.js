import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import search from '../api/property-search.js';
import {calculateMortgage} from '../js/mortgage-engine.js';
const helper = readFileSync(new URL('../js/investment-journey.js', import.meta.url), 'utf8');
const mortgage = readFileSync(new URL('../mutui/index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const properties = readFileSync(new URL('../immobili/index.html', import.meta.url), 'utf8');
const store = () => {const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};};
function journey(){const context=vm.createContext({});vm.runInContext(helper,context);return context.RBInvestmentJourney;}
const good={amount:120000,years:25,rate:3.7,income:30000};
test('strict mortgage parsing accepts Italian and English decimals and preserves zero',()=>{
 const j=journey();
 assert.equal(j.parseNumber('120.000,50'),120000.5);assert.equal(j.parseNumber('120,000.50'),120000.5);
 assert.equal(j.parseNumber('3,73%','rate'),3.73);assert.equal(j.parseNumber('0','rate'),0);
 assert.equal(j.parseNumber(120.123),120.123);
 for(const bad of ['123abc','Infinity','NaN','1.2.3','1,2,3','€','']) assert.equal(j.parseNumber(bad),null,bad);
});
test('mortgage validation rejects missing, negative, zero duration and fractional years',()=>{
 const j=journey();assert.ok(j.validate(good).valid);assert.ok(j.validate({...good,rate:0,income:0}).valid);
 for(const bad of [{amount:0},{amount:-100},{years:0},{years:-1},{years:25.5},{years:101},{rate:-1},{rate:'abc'},{rate:101},{income:-1},{amount:Infinity},{amount:''},{income:''}])assert.equal(j.validate({...good,...bad}).valid,false,JSON.stringify(bad));
});
test('all comparison durations and zero-rate payments use the same amortization as ROI',()=>{
 const j=journey();for(const years of [1,20,25,30,100])for(const rate of [0,3.1,3.7,3.73]){
  assert.ok(Math.abs(j.payment(120000,rate,years)*12-calculateMortgage(120000,rate,years))<1e-5);
 }
 assert.equal(j.payment(120000,3.7,0),null);
});
test('mortgage transfer is complete, short lived, owner checked and removable',()=>{
 const j=journey(),s=store();assert.ok(j.write(s,good,'owner',1000));
 const restored=j.read(s,'owner',1001);for(const field of Object.keys(good))assert.equal(restored[field],good[field]);
 assert.equal(j.read(s,'other',1002),null);assert.equal(s.getItem(j.key),null);
 j.write(s,good,'owner',1000);assert.equal(j.read(s,'owner',1000+1800001),null);
 j.write(s,good,'owner',1000);assert.equal(j.read(s,'owner',999),null);
 j.write(s,good,'owner',1000);assert.equal(j.write(s,{...good,years:0},'owner',1001),false);assert.equal(j.read(s,'owner',1002),null);
 s.setItem(j.key,'{bad json');assert.equal(j.read(s,'owner',1000),null);
});
test('annual revenue reproduces the transferred total at displayed occupancy without rounding away cents',()=>{
 const j=journey();for(const income of [0,30000,30000.75])for(const occ of [1,65,70,100]){
  const night=j.equivalentNight(income,occ);assert.ok(Math.abs(night*365*occ/100-income)<1e-7);
 }
 assert.equal(j.equivalentNight(30000,0),null);
});
function node(value=''){return {value,style:{},hidden:true,textContent:'',innerText:'',attributes:{},listeners:{},setCustomValidity(v){this.validationMessage=v},reportValidity(){return !this.validationMessage},focus(){},setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]},addEventListener(k,f){this.listeners[k]=f},closest(){return {setAttribute(){}}}};}
function mortgageUI(values=good){
 const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
 for(const [id,value]of Object.entries(values))get(id).value=String(value);
 const context=vm.createContext({Intl,Number,Object,localStorage:store(),sessionStorage:store(),window:{currentUser:{uid:'owner'},currentPlan:'pro'},document:{getElementById:get,querySelector:()=>({scrollIntoView(){}})},t:it=>it,renderExtra(){},renderDecision(){},renderAdvisor(){}});
 vm.runInContext(helper,context);
 for(const [start,end]of [['function getAccess(){','/* ================= LANG'],['function calculate(options','function lockValue('],['function lockValue(','/* ================= EXTRA'],['function renderBanks(amount','/* ================= NAV'],['function readMortgageInputs(','function continueMortgage(']])vm.runInContext(mortgage.slice(mortgage.indexOf(start),mortgage.indexOf(end,mortgage.indexOf(start))),context);
 return {context,get};
}
test('actual mortgage page applies 25 years to main and every comparison, including 3.7 percent',()=>{
 const {context,get}=mortgageUI();assert.equal(context.calculate({scroll:false}),true);
 const annual=Math.round(calculateMortgage(120000,3.7,25));assert.match(get('banks').innerHTML,new RegExp('€'+annual));assert.equal(get('yearly').innerText,annual+'€');
 assert.match(get('banks').innerHTML,/25 anni/);assert.doesNotMatch(get('banks').innerHTML,/€8500/);
});
test('actual mortgage page rejects bad data before rendering or storing a scenario',()=>{
 const {context,get}=mortgageUI({...good,amount:-100000,years:0,rate:'abc',income:-30000});
 assert.equal(context.calculate({scroll:false}),false);assert.equal(get('amount').attributes['aria-invalid'],'true');assert.equal(get('banks').innerHTML,undefined);assert.equal(context.sessionStorage.getItem(context.RBInvestmentJourney.key),null);
});
test('actual tool transfer waits for account state, consumes once, and derives equity only after a purchase price',()=>{
 const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
 get('occupancy').value='70';get('price').value='999000';get('equity').value='999000';
 const events={};const context=vm.createContext({Intl,Number,Object,Event:class{},URLSearchParams,queueMicrotask:f=>f(),sessionStorage:store(),localStorage:store(),locationInput:null,t:it=>it,window:{firebaseReady:false,currentUser:{uid:'owner'},location:{pathname:'/tool/',search:''}},document:{getElementById:get,addEventListener:(event,fn)=>(events[event]??=[]).push(fn)}});
 vm.runInContext(helper,context);context.RBInvestmentJourney.write(context.sessionStorage,good,'owner');
 const start=app.indexOf('function applySelectedMortgage(){'),end=app.indexOf('// ================= AUTO LOAD PROPERTY =================',start);vm.runInContext(app.slice(start,end),context);
 context.applySelectedMortgage();assert.equal(get('price').value,'999000');
 context.window.firebaseReady=true;context.applySelectedMortgage();assert.equal(get('price').value,'');assert.equal(get('equity').value,'');assert.equal(get('interestRate').value,'3.7');assert.equal(get('loanYears').value,'25');
 assert.equal(get('mortgage-transfer-summary').hidden,false);assert.ok(Math.abs(Number(get('priceNight').value)*365*.7-30000)<1e-7);
 for(const fn of events.DOMContentLoaded)fn();get('price').value='150000';get('price').listeners.input();assert.equal(get('equity').value,'30000');
 get('equity').value='40000';get('equity').listeners.input();get('price').value='160000';get('price').listeners.input();assert.equal(get('equity').value,'40000');
 assert.equal(context.sessionStorage.getItem(context.RBInvestmentJourney.key),null);
});
async function query(params){const res={code:200,setHeader(){},status(s){this.code=s;return this},json(data){this.body=data}};await search({method:'GET',query:params},res);return res;}
test('unsupported cities and absent city have explicit coverage and never substitute examples',async()=>{
 for(const city of ['Volla','Bologna','San Giorgio a Cremano']){const r=await query({city});assert.equal(r.code,200);assert.equal(r.body.code,'unsupported_location');assert.deepEqual(r.body.results,[]);assert.deepEqual(r.body.supportedCities,['napoli','roma','milano','firenze']);}
 assert.equal((await query({})).body.code,'location_required');
});
test('blank optional filters work for every covered city and low budgets remain genuinely empty',async()=>{
 for(const city of ['napoli','roma','milano','firenze']){const r=await query({city,budget:'',sqm:''});assert.equal(r.code,200);assert.ok(r.body.results.length);assert.ok(r.body.results.every(p=>p.city===city&&p.url===''));}
 assert.equal((await query({city:'napoli',budget:'100',sqm:'0'})).body.results.length,0);
 for(const p of [{city:'<img>'},{city:'napoli',sqm:'-1'},{city:'napoli',budget:'NaN'},{city:['roma','napoli']}])assert.equal((await query(p)).code,400);
});
test('unknown localities never become Rome or another city by geographic guess',()=>{
 const start=app.indexOf('function mapLocationToCity('),end=app.indexOf('const locationInput',start);
 const context=vm.createContext({});vm.runInContext(app.slice(start,end),context);
 for(const city of ['Volla','Portici (NA)','Bologna','Torino','Roma Nord','<svg>'])assert.equal(context.mapLocationToCity(city),null);
 for(const city of ['Roma','napoli','Milano (MI)','firenze'])assert.ok(context.mapLocationToCity(city));
});
test('unknown benchmark is explicitly unavailable and zero revenue is compared as zero',()=>{
 const source=readFileSync(new URL('../js/market-engine.js',import.meta.url),'utf8').replace(/^import .*;\n/,'').replace('export function','function');
 const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
 const context=vm.createContext({window:{currentCity:'roma',currentLang:'it',getUserAccess:()=>({isPro:true}),RB_MARKET_DATA:{roma:{price:130,occupancy:.7,annualRevenue:33000},napoli:{price:105,occupancy:.72,annualRevenue:27000}}},document:{getElementById:get,addEventListener(){}}});vm.runInContext(source,context);
 get('custom-location').value='Volla';context.renderMarketBenchmark('roma');assert.equal(get('benchmark-price').textContent,'—');assert.match(get('market-comparison').textContent,/Nessun benchmark/);
 get('custom-location').value='';context.window.currentRevenue=0;context.renderMarketBenchmark('roma');assert.match(get('market-comparison').innerHTML,/-100.0%/);
});

test('zero annual revenue shows a payment warning and no undefined percentage',()=>{
 const {context,get}=mortgageUI({...good,income:0});assert.equal(context.calculate({scroll:false}),true);
 assert.equal(get('roi-alert').className,'roi-alert roi-bad');assert.equal(get('impact').innerText,'—');
});
