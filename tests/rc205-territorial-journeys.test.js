import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {TERRITORIAL_COVERAGE,territorialDefinition} from '../js/territorial-coverage.js';
import {REGIONAL_CAPITALS} from '../js/regional-capitals.js';
import {municipalityCoverage} from '../js/municipalities.js';
import {validateTerritorialData,loadTerritorialCity,territorialSummary} from '../js/territorial-benchmarks.js';
import {stageCommercialTransfer,consumeCommercialTransfer} from '../js/commercial-transfer.js';
import {createCommercialDemo,calculateCommercial} from '../js/commercial-property-engine.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
test('RC205 eight exact administrative identities agree with sources and catalog; twelve capitals have no substitute',async()=>{
 const config=json('scripts/territorial-sources.json'),catalog=json('data/territorial/catalog.json');
 assert.equal(TERRITORIAL_COVERAGE.length,8);
 const keys=TERRITORIAL_COVERAGE.map(c=>c.key).sort();
 assert.deepEqual(config.cities.map(c=>c.key).sort(),keys);assert.deepEqual(catalog.cities.map(c=>c.key).sort(),keys);
 let covered=0,unsupported=0;
 for(const c of REGIONAL_CAPITALS){
  const definition=territorialDefinition(c.key);
  assert.equal(municipalityCoverage(c),definition?.key||null);
  if(definition){covered++;assert.equal(c.istat,definition.istat);const data=validateTerritorialData(json('data/territorial/'+c.key+'.json'),c.key);assert.equal(data.city.url,config.cities.find(r=>r.key===c.key).url);const row=data.rows.find(r=>r[6]!==null);const summary=territorialSummary(data,row);assert.equal(summary.adr,null);assert.equal(summary.occupancy,null);assert.equal(summary.roi,null);}
  else{unsupported++;await assert.rejects(loadTerritorialCity(c.key,{fetcher:()=>assert.fail('No fetch for an unsupported city')}),/CITY_NOT_COVERED/);}
 }
 assert.equal(covered,8);assert.equal(unsupported,12);assert.equal(territorialDefinition('venice').key,'venezia');
});
for(const city of ['bari','palermo'])test('RC205 regional '+city+' aggregate fails closed when municipality scope is missing or mixed',()=>{
 const data=json('data/territorial/'+city+'.json');assert.equal(validateTerritorialData(data,city),data);assert.ok(data.city.regionalSourceRows>data.city.sourceRows);
 for(const mutate of [d=>delete d.city.geographyFilter,d=>d.city.geographyFilter.equals='Regional average',d=>d.rows[0][0]='Other municipality']){const bad=structuredClone(data);mutate(bad);assert.throws(()=>validateTerritorialData(bad,city),/INVALID_MUNICIPALITY_SCOPE/);}
});
test('RC205 mobile navigation retains analysis and dedicated PMS across guest, Free, Investor, Pro and logout',()=>{
 const src=read('js/header.js'),start=src.indexOf('function renderUser(user){');
 const nav={innerHTML:'',querySelectorAll:()=>[]},nodes={'user-area':{},'rb-mobile-account':{},'rb-mobile-nav':nav,logout:{}};
 const window={innerWidth:390,currentLang:'it',currentPlan:'free'};
 const context={window,document:{getElementById:id=>nodes[id]||null,querySelectorAll:()=>[],addEventListener(){}},console,updateLangButtons(){}};
 vm.createContext(context);vm.runInContext(src.slice(start),context);
 for(const plan of [null,'free','investor','pro_monthly',null]){
  window.currentPlan=plan||'free';window.getUserAccess=()=>({isLogged:!!plan,isFree:plan==='free',isInvestor:plan==='investor',isPro:plan==='pro_monthly',isAdmin:false});
  context.renderUser(plan?{uid:'synthetic-account'}:null);
  for(const route of ['/immobili-commerciali/','/gestione-commerciale/'])assert.equal(nav.innerHTML.split('href="'+route+'"').length-1,1,plan+' '+route);
  assert.match(nav.innerHTML,/data-en="Commercial spaces"/);assert.match(nav.innerHTML,/data-en="Commercial PMS"/);
 }
});
test('RC205 existing commercial simulator-to-PMS transfer preserves financial inputs and expires without persistence',()=>{
 const entries=new Map(),storage={setItem:(k,v)=>entries.set(k,v),getItem:k=>entries.get(k),removeItem:k=>entries.delete(k)};
 const model=createCommercialDemo('room_monthly'),before=calculateCommercial(model),now=Date.UTC(2026,9,27);
 stageCommercialTransfer(model,storage,now);const restored=consumeCommercialTransfer(storage,now+1000);
 assert.deepEqual(calculateCommercial(restored),before);assert.equal(consumeCommercialTransfer(storage,now+2000),null);
 stageCommercialTransfer(model,storage,now);assert.equal(consumeCommercialTransfer(storage,now+15*60*1000),null);assert.equal(entries.size,0);
});
test('RC205 public header entry stays before the two desktop links hidden by existing CSS, without duplicates, in IT/EN',()=>{
 const source=read('js/public-shell.js'),code=source.slice(0,source.indexOf(' const menus='))+'})();';
 for(const lang of ['it','en']){
  const links=[{href:'/tool/'},{href:'/academy/'},{href:'/about/?lang='+lang},{href:'/contact.html'}];
  const nav={querySelector:selector=>selector.includes('immobili-commerciali')?links.find(a=>a.href.includes('/immobili-commerciali/')):links.find(a=>a.href.startsWith('/about/')),insertBefore(a,b){links.splice(b?links.indexOf(b):links.length,0,a);}};
  const ctx={document:{documentElement:{lang},createElement:()=>({}),querySelectorAll:()=>[nav]},localStorage:{setItem(){}}};
  vm.runInNewContext(code,ctx);vm.runInNewContext(code,ctx);
  assert.equal(links.length,5);assert.equal(links[2].href,lang==='en'?'/en/immobili-commerciali/':'/immobili-commerciali/');
  assert.ok(links.slice(-2).every(a=>!a.href.includes('immobili-commerciali')));
 }
});
