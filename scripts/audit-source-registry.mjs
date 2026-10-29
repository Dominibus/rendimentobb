#!/usr/bin/env node
// Offline only. --write-browser changes the derived metadata module, never datasets.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateSourceRegistry,sourceRegistrySummary} from '../js/source-registry.js';
export const root = fileURLToPath(new URL('../',import.meta.url));
export function browserModule(registry){
  return '// Generated from data/source-registry.json. Do not edit. Public metadata only.\nexport default '+JSON.stringify(registry,null,2)+';\n';
}
export function auditSourceRegistry(base = root, {now = Date.now(), checkBrowser = true} = {}){
  const basePath = fs.realpathSync(base);
  const registry = validateSourceRegistry(JSON.parse(fs.readFileSync(path.join(base,'data/source-registry.json'),'utf8')));
  const errors = [], seen = new Map();
  for(const d of registry.datasets) for(const asset of d.assets){
    if(seen.has(asset.path) && seen.get(asset.path) !== asset.sha256) errors.push('conflicting_hash:'+asset.path);
    seen.set(asset.path,asset.sha256);
    try{
      const target = fs.realpathSync(path.join(base,asset.path));
      if(!target.startsWith(basePath+path.sep)) throw Error('outside_root');
      const hash = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
      if(hash !== asset.sha256) errors.push('hash_mismatch:'+asset.path);
    }catch{errors.push('unreadable_asset:'+asset.path);}
  }
  // A new bundled external dataset must not silently bypass the inventory.
  for(const folder of ['geography','tourism','omi','territorial']){
    for(const filename of fs.readdirSync(path.join(base,'data',folder))){
      const relative = 'data/'+folder+'/'+filename;
      if(filename.endsWith('.json') && !seen.has(relative)) errors.push('unregistered_dataset:'+relative);
    }
  }
  if(checkBrowser){
    try{if(fs.readFileSync(path.join(base,'js/source-registry-data.js'),'utf8') !== browserModule(registry)) errors.push('browser_manifest_mismatch');}
    catch{errors.push('browser_manifest_missing');}
  }
  return {schemaVersion:1,registryVersion:registry.registryVersion,baselineCommit:registry.baselineCommit,
    checkedAt:new Date(now).toISOString(),scope:'offline_local_integrity_only',
    valid:errors.length === 0,assets:seen.size,errors,
    sources:sourceRegistrySummary(registry,now),
    published:false,remoteAvailabilityChecked:false,notificationsSent:false};
}
if(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
  const args = process.argv.slice(2);
  if(args.some(a => a !== '--write-browser')) throw Error('Unknown argument');
  if(args.includes('--write-browser')){
    const registry = validateSourceRegistry(JSON.parse(fs.readFileSync(path.join(root,'data/source-registry.json'),'utf8')));
    fs.writeFileSync(path.join(root,'js/source-registry-data.js'),browserModule(registry));
  }
  const result = auditSourceRegistry();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.valid) process.exitCode = 1;
}
