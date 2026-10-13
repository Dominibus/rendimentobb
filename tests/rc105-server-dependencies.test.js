import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
test('server entrypoints have traceable local imports without browser query strings',()=>{
  const pending=readdirSync('api').filter(x=>x.endsWith('.js')).map(x=>resolve('api',x)),seen=new Set();
  while(pending.length){
    const file=pending.pop();if(seen.has(file))continue;seen.add(file);
    const code=readFileSync(file,'utf8');
    for(const match of code.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)){
      const specifier=match[1];assert.ok(!/[?#]/.test(specifier),`${file}: ${specifier} cannot be traced by Vercel`);
      const dependency=resolve(dirname(file),specifier);assert.ok(existsSync(dependency),dependency);pending.push(dependency);
    }
  }
  assert.ok([...seen].some(file=>file.endsWith('/js/subscription-offer.js')));
});
