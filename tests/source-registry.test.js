import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import registry from '../js/source-registry-data.js';
import {validateSourceRegistry,sourceRegistrySummary} from '../js/source-registry.js';
import {auditSourceRegistry,browserModule,root} from '../scripts/audit-source-registry.mjs';
import {renderSourceRegistry} from '../js/admin-source-registry-view.js';
const copy=()=>structuredClone(registry);
const now=Date.parse('2026-10-29T12:00:00Z');
test('registered local bytes match, coverage is complete for bundled external datasets',()=>{
 const result=auditSourceRegistry(root,{now});
 assert.equal(result.valid,true,JSON.stringify(result.errors));
 assert.ok(result.assets>=65);assert.equal(result.sources.length,14);
 assert.equal(result.remoteAvailabilityChecked,false);assert.equal(result.published,false);
 assert.equal(result.notificationsSent,false);assert.equal(result.scope,'offline_local_integrity_only');
 assert.equal(fs.readFileSync(path.join(root,'js/source-registry-data.js'),'utf8'),browserModule(registry));
});
test('corruption, new unregistered data and stale browser metadata fail closed without modifying files',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rb-registry-'));
 try{
  fs.cpSync(path.join(root,'data'),path.join(dir,'data'),{recursive:true});
  for(const d of registry.datasets)for(const a of d.assets){
   const out=path.join(dir,a.path);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(path.join(root,a.path),out);
  }
  fs.copyFileSync(path.join(root,'js/source-registry-data.js'),path.join(dir,'js/source-registry-data.js'));
  assert.equal(auditSourceRegistry(dir,{now}).valid,true);
  const target=path.join(dir,'data/tourism/istat-capitals-2025.json');
  fs.appendFileSync(target,' ');fs.writeFileSync(path.join(dir,'data/omi/unknown.json'),'{}');
  fs.appendFileSync(path.join(dir,'js/source-registry-data.js'),'//changed');
  const before=fs.readFileSync(target,'utf8'),r=auditSourceRegistry(dir,{now});
  assert.equal(r.valid,false);assert.ok(r.errors.includes('hash_mismatch:data/tourism/istat-capitals-2025.json'));
  assert.ok(r.errors.includes('unregistered_dataset:data/omi/unknown.json'));
  assert.ok(r.errors.includes('browser_manifest_mismatch'));
  assert.equal(fs.readFileSync(target,'utf8'),before);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('invalid provenance, duplicate identity, unsafe URLs and paths cannot become valid entries',()=>{
 for(const mutate of [
  r=>r.datasets.push(r.datasets[0]),r=>r.datasets[0].sourceURL=null,
  r=>r.datasets[0].assets[0].path='../outside',r=>r.datasets[0].assets[0].sha256='no',
  r=>r.datasets[0].sourceURL='javascript:alert(1)',r=>r.datasets[0].sourceURL='https://secret@example.test',
  r=>r.datasets[0].automaticPublication=true,r=>r.datasets[0].automaticAcquisition='enabled',
  r=>r.datasets[0].publishedAt='2026-02-30',r=>delete r.datasets[0].declaredFrequency,
  r=>r.datasets[0].lastUpdate={status:'success',at:'2026-10-29',error:null}
 ]){const value=copy();mutate(value);assert.throws(()=>validateSourceRegistry(value));}
});
test('review expiry and provider conditions remain distinct from successful synchronization',()=>{
 const current=sourceRegistrySummary(registry,now);
 assert.equal(current.find(s=>s.id==='inside-airbnb').state,'requires_review');
 assert.ok(current.every(s=>s.lastSuccessfulUpdate===null&&s.liveAvailability==='not_checked'));
 const expired=sourceRegistrySummary(registry,Date.parse('2026-11-29T00:00:00Z'));
 assert.ok(expired.every(s=>s.reviewDue));
 assert.equal(expired.find(s=>s.id==='istat-tourism').state,'review_due');
 assert.equal(expired.find(s=>s.id==='inside-airbnb').state,'requires_review');
 assert.throws(()=>sourceRegistrySummary(registry,NaN));
});
class Element{
 constructor(tag,doc){this.tag=tag;this.ownerDocument=doc;this.children=[];this.textContent='';}
 append(e){this.children.push(e);}
 get text(){return [this.textContent,...this.children.map(c=>c.text)].join(' ');}
}
test('admin view explains static scope and review requirements in IT and EN',()=>{
 for(const lang of ['it','en']){
  const doc={createElement:tag=>new Element(tag,doc)},parent=new Element('div',doc);
  const section=renderSourceRegistry(parent,lang,now);
  assert.equal(section.children.filter(e=>e.tag==='details').length,14);
  assert.match(section.text,lang==='it'?/non monitoraggio live/:/not live monitoring/);
  assert.match(section.text,lang==='it'?/non verificati/:/not verified/);
  assert.match(section.text,lang==='it'?/Ipotesi di simulazione/:/Simulation assumption/);
  assert.match(section.text,lang==='it'?/Da revisionare/:/Review required/);
  assert.doesNotMatch(section.text,/secret|recipient|ownerUid/);
 }
});
test('scheduled provider acquisition is blocked before HTTP and preserves existing output',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rb-policy-'));
 try{
  const target=path.join(dir,'review');
  const r=spawnSync('python3',['scripts/refresh-territorial-references.py','--output-dir',target],{cwd:root,encoding:'utf8',env:{...process.env,HTTPS_PROXY:'http://127.0.0.1:1',https_proxy:'http://127.0.0.1:1'}});
  assert.equal(r.status,0,r.stderr);
  const result=JSON.parse(fs.readFileSync(path.join(target,'report.json'),'utf8'));
  assert.equal(result.status,'blocked_provider_policy_review');
  assert.equal(result.remoteAvailabilityChecked,false);assert.equal(result.published,false);
  assert.equal(fs.existsSync(path.join(target,'candidate')),false);
  const before=fs.readFileSync(path.join(target,'report.json'),'utf8');
  const retry=spawnSync('python3',['scripts/refresh-territorial-references.py','--output-dir',target],{cwd:root,encoding:'utf8'});
  assert.notEqual(retry.status,0);assert.equal(fs.readFileSync(path.join(target,'report.json'),'utf8'),before);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
