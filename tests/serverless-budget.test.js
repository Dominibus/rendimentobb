import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
test('deployment remains within the 12 serverless functions budget',()=>{
 const root=fileURLToPath(new URL('../api/',import.meta.url));
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):/\.(?:js|mjs|cjs|ts)$/.test(entry.name)?[path.join(dir,entry.name)]:[]);
 const functions=walk(root);assert.ok(functions.length<=12,`Found ${functions.length} API files; maximum is 12`);
 assert.ok(functions.some(file=>file.endsWith('send-followup.js')));
 assert.ok(!functions.some(file=>file.endsWith('email-unsubscribe.js')));
});
