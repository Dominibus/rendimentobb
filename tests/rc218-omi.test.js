import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateOMI,exactOMIRow,loadOMI,omiCapital} from '../js/omi-context.js';
import {mountOMIContext} from '../js/omi-context-ui.js';
const all=fs.readdirSync(new URL('../data/omi/',import.meta.url)).filter(n=>n.endsWith('.json')).map(n=>JSON.parse(fs.readFileSync(new URL('../data/omi/'+n,import.meta.url))));
const roma=all.find(d=>d.municipality.key==='roma');const clone=()=>structuredClone(roma);
test('20 capitals, exact identities, 6006 source rows and complete zone coverage',()=>{
 assert.equal(all.length,20);let count=0;
 for(const d of all){assert.equal(validateOMI(d,d.municipality.istat),d);count+=d.rows.length;for(const r of d.rows)assert.equal(exactOMIRow(d,r[0],r[1],r[3]),r);assert.deepEqual(d.geometryCheck.zoneCodesWithoutPerimeter,[]);}
 assert.equal(count,6006);assert.equal(all.find(d=>d.municipality.key==='cagliari').municipality.sourceIstat,'20092009');assert.equal(omiCapital('092009'),null);assert.equal(omiCapital('Torino'),null);assert.equal(exactOMIRow(roma,'unknown','20','NORMALE'),null);
});
for(const [label,mutate]of Object.entries({
 'wrong identity':d=>d.municipality.istat='001272',
 'historical code guessed':d=>d.municipality.sourceIstat='058091',
 'wrong cadastral code':d=>d.municipality.cadastral='F839',
 'wrong period':d=>d.period='2026/2',
 'duplicate quotation':d=>d.rows.push(d.rows[0]),
 'missing zone':d=>d.zones=[],
 'orphan quotation':d=>d.rows[0][0]='elsewhere',
 'inverted range':d=>{d.rows[0][5]=100;d.rows[0][6]=50;},
 'zero range':d=>{d.rows[0][5]=0;d.rows[0][6]=0;},
 'partial missing value':d=>d.rows[0][5]=null,
 'surface missing for numeric range':d=>d.rows[0][7]=null,
 'source hash missing':d=>d.source.valuesSHA256='',
 'invalid acquisition date':d=>d.source.acquiredAt='2026-99-99',
 'foreign source':d=>d.source.url='https://example.org/'
}))test('rejects '+label,()=>{const d=clone();mutate(d);assert.throws(()=>validateOMI(d,'058091'));});
class E{constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.attrs={};this.listeners={};this.textContent='';}append(...n){this.children.push(...n);}replaceChildren(...n){this.children=n;}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,v){this.listeners[k]=v;}text(){return this.textContent+' '+this.children.map(n=>n.text()).join(' ');}find(fn){if(fn(this))return this;for(const n of this.children){const found=n.find(fn);if(found)return found;}}querySelector(s){const key=/data-omi-field="([^"]+)"/.exec(s)?.[1];return this.find(n=>n.dataset.omiField===key);}focus(){this.focused=true;}}
test('UI exact selection, separate sale/rent surfaces, IT/EN, reset, retry and async isolation',async()=>{
 const bari=all.find(d=>d.municipality.key==='bari');
 const old={document:globalThis.document,window:globalThis.window,fetch:globalThis.fetch};const calls=[];const pending=[];
 try{
  globalThis.document={createElement:t=>new E(t)};globalThis.window={currentLang:'it'};
  globalThis.fetch=(url,options)=>{calls.push({url,options});return new Promise(resolve=>pending.push(resolve));};
  const root=new E('section'),ui=mountOMIContext(root);assert.equal(root.hidden,true);
  const first=ui.select('001272'),second=ui.select('072006');assert.match(root.text(),/Carico/);
  pending[1]({ok:true,json:async()=>structuredClone(bari)});await second;assert.match(root.text(),/Bari/);assert.doesNotMatch(root.text(),/Torino/);assert.equal(root.find(n=>n.tag==='details').open,false);assert.doesNotMatch(root.text(),/Compravendita/);
  pending[0]({ok:true,json:async()=>all.find(d=>d.municipality.key==='torino')});await first;assert.match(root.text(),/Bari/);
  const target=bari.rows.find(r=>r[7]!==r[10]&&r[5]!==null&&r[8]!==null);assert.ok(target);
  for(const [field,value]of [['zone',target[0]],['type',target[1]],['state',target[3]]]){const select=root.querySelector('[data-omi-field="'+field+'"]');select.value=value;select.listeners.change();}
  assert.match(root.text(),/Compravendita/);assert.match(root.text(),/Locazione/);assert.match(root.text(),/lorda \(L\)/);assert.match(root.text(),/netta \(N\)/);assert.match(root.text(),/non è una tariffa turistica per notte/);assert.match(root.text(),/Riga originale VALORI:/);
  assert.equal(root.querySelector('[data-omi-field="state"]').focused,true);
  window.currentLang='en';ui.render();assert.match(root.text(),/not a nightly tourist rate/);assert.match(root.text(),/gross floor area/);assert.match(root.text(),/net floor area/);
  const zone=root.querySelector('[data-omi-field="zone"]');zone.value=bari.zones.find(z=>z.id!==target[0]).id;zone.listeners.change();assert.doesNotMatch(root.text(),/Original VALORI row/);assert.equal(root.querySelector('[data-omi-field="type"]').value,'');
  await ui.select('050026');assert.match(root.text(),/not integrated/);assert.doesNotMatch(root.text(),/Bari/);assert.equal(calls.length,2);
  await ui.select(null);assert.equal(root.hidden,true);
  globalThis.fetch=async()=>({ok:false});const errRoot=new E('section'),retry=mountOMIContext(errRoot);await retry.select('072006');assert.match(errRoot.text(),/temporarily unavailable/);
  globalThis.fetch=async()=>({ok:true,json:async()=>structuredClone(bari)});await errRoot.find(n=>n.tag==='button').onclick();assert.match(errRoot.text(),/Bari/);
  const aosta=all.find(d=>d.municipality.key==='aosta');const missing=aosta.rows.find(r=>r[8]===null);globalThis.fetch=async()=>({ok:true,json:async()=>structuredClone(aosta)});await retry.select('007003');
  for(const [field,value]of [['zone',missing[0]],['type',missing[1]],['state',missing[3]]]){const select=errRoot.querySelector('[data-omi-field="'+field+'"]');select.value=value;select.listeners.change();}
  assert.match(errRoot.text(),/Unavailable/);assert.doesNotMatch(errRoot.text(),/€0/);assert.match(errRoot.text(),/condition does not meaningfully distinguish/);
  assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.cache,'no-cache');
  let fetched=false;globalThis.fetch=async()=>{fetched=true;};await assert.rejects(loadOMI('../roma'));assert.equal(fetched,false);
 }finally{for(const [k,v]of Object.entries(old)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
});
