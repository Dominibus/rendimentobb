import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
function* html(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(e.name==='node_modules'||e.name.startsWith('.'))continue;const p=path.join(dir,e.name);if(e.isDirectory())yield* html(p);else if(p.endsWith('.html'))yield p;}}
const read=p=>readFileSync(path.join(root,p),'utf8');
test('RC221 every portal/public-shell document loads one independent mobile shell',()=>{
 let count=0;
 for(const file of html(root)){
  const s=readFileSync(file,'utf8');if(!/\/js\/(header|public-shell)\.js/.test(s))continue;
  assert.equal((s.match(/src="\/js\/mobile-shell.js\?v=20261029-rc221" defer/g)||[]).length,1,file);
  assert.match(s,/mobile-shell.css\?v=20261029-rc221/);count++;
 }
 assert.equal(count,47);
});
test('RC221 mobile shell stays isolated from account and calculation code',()=>{
 const s=read('js/mobile-shell.js');assert.doesNotMatch(s,/firebase|fetch\(|getUserAccess|saveAnalysis|calculate\(/);
 assert.match(s,/rb-public-assistant/);assert.match(s,/compact.addEventListener\('change',syncHeader\)/);
 assert.match(s,/ResizeObserver/);assert.match(s,/footer.dataset.compactReady/);
});
test('RC221 fixed global navigation and local sticky shortcuts use safe header spacing',()=>{
 assert.match(read('css/mobile-app-rc186.css'),/position:fixed;inset:auto 0 0/);
 assert.match(read('css/mobile-app-rc186.css'),/safe-area-inset-bottom/);
 assert.match(read('css/mobile-app-rc186.css'),/rb-ui-modal-open .rb-mobile-tabs/);
 assert.match(read('css/mobile-shell.css'),/position:sticky;top:var\(--rb-shell-header-height/);
});
