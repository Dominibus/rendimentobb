import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateTourismContext,tourismMunicipality,loadTourismContext} from '../js/tourism-context.js';
import {mountTourismContext} from '../js/tourism-context-ui.js';
const baseline=JSON.parse(fs.readFileSync(new URL('../data/tourism/istat-capitals-2025.json',import.meta.url)));
const copy=()=>structuredClone(baseline);
test('20 exact administrative identities, 240 months and annual controls',()=>{
 const data=validateTourismContext(copy());assert.equal(data.records.length,20);assert.equal(data.records.flatMap(r=>r.months).length,240);
 assert.equal(tourismMunicipality(data,'118006').sourceIstat,'092009');assert.equal(tourismMunicipality(data,'092009'),null);assert.equal(tourismMunicipality(data,'Torino'),null);
 assert.equal(tourismMunicipality(data,'001272').arrivals,1831636);assert.equal(tourismMunicipality(data,'032006').personNights,1665429);
});
for(const [name,mutate]of Object.entries({
 'missing is not zero':d=>d.records[0].months[0].arrivals=null,
 'negative':d=>d.records[0].arrivals=-1,
 'annual mismatch':d=>d.records[0].arrivals++,
 'month order':d=>d.records[0].months.reverse(),
 'duplicate identity':d=>d.records[0]=d.records[1],
 'missing municipality':d=>d.records.pop(),
 'historical code substitution':d=>d.records.find(r=>r.key==='cagliari').istat='092009',
 'unreviewed year':d=>d.year=2026,
 'missing methodology':d=>d.records[0].flag='',
 'source substitution':d=>d.source.downloadURL='https://example.org/data.zip',
 'crosswalk substitution':d=>d.crosswalk.sourceURL='https://example.org/'
}))test('rejects '+name,()=>{const d=copy();mutate(d);assert.throws(()=>validateTourismContext(d));});
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.attributes={};}
 append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=nodes;}setAttribute(k,v){this.attributes[k]=v;}
 text(){return this.textContent+' '+this.children.map(c=>c.text()).join(' ');}
 find(tag){return this.tag===tag?this:this.children.map(c=>c.find(tag)).find(Boolean);}
}
test('UI IT/EN, person-night limits, missing coverage, retry and asynchronous selection isolation',async()=>{
 const previous={document:globalThis.document,window:globalThis.window,fetch:globalThis.fetch};let pending=[];const calls=[];
 try{
  globalThis.document={createElement:tag=>new Element(tag)};globalThis.window={currentLang:'it'};
  globalThis.fetch=(url,options)=>{calls.push({url,options});return new Promise(resolve=>pending.push(resolve));};
  const root=new Element('section'),ui=mountTourismContext(root);assert.equal(root.hidden,true);
  const first=ui.select('001272');assert.match(root.text(),/Carico/);
  const second=ui.select('032006');pending[1]({ok:true,json:async()=>copy()});await second;
  assert.match(root.text(),/Trieste/);assert.match(root.text(),/Discontinuità 2025/);assert.match(root.text(),/non camere-notti/);assert.match(root.text(),/non misurano tariffe/);
  pending[0]({ok:true,json:async()=>copy()});await first;assert.doesNotMatch(root.text(),/Torino/);
  assert.equal(root.find('tbody').children.length,12);assert.equal(root.find('details').open,undefined);
  window.currentLang='en';ui.render();assert.match(root.text(),/break in series/);assert.match(root.text(),/not room-nights/);
  await ui.select('999999');assert.match(root.text(),/unavailable for this selection/);assert.doesNotMatch(root.text(),/Trieste/);
  await ui.select(null);assert.equal(root.hidden,true);
  const other=new Element('section'),retryUI=mountTourismContext(other);globalThis.fetch=async()=>({ok:false});await retryUI.select('118006');assert.match(other.text(),/temporarily unavailable/);
  globalThis.fetch=async()=>({ok:true,json:async()=>copy()});await other.find('button').onclick();assert.match(other.text(),/Cagliari/);assert.match(other.text(),/092009/);assert.match(other.text(),/118006/);
  assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.cache,'no-cache');assert.equal(calls[0].url,'/data/tourism/istat-capitals-2025.json');
  globalThis.fetch=async()=>({ok:true,json:async()=>({})});await assert.rejects(loadTourismContext());
 }finally{for(const [key,value]of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
