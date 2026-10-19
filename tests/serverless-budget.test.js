// One dedicated intake API; the old Hobby cap does not describe the current Pro plan.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
test('deployment remains within the RC155 internal budget of 13 functions (Vercel Pro)',()=>{
 const root=fileURLToPath(new URL('../api/',import.meta.url));
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):/\.(?:js|mjs|cjs|ts)$/.test(entry.name)?[path.join(dir,entry.name)]:[]);
 const functions=walk(root);assert.ok(functions.length<=13,`Found ${functions.length} API files; RC155 maximum is 13`);
 assert.ok(functions.some(file=>file.endsWith('send-followup.js')));
 assert.ok(!functions.some(file=>file.endsWith('email-unsubscribe.js')));
});
