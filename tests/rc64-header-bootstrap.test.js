import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('js/header.js');
const start=source.indexOf('function initializeSharedHeader(){');
const end=source.indexOf('/* =====================\n📱 MENU + LANG',start);
const bootstrap=source.slice(start,end);
test('header renders before authentication resolves and survives an unavailable import',async()=>{
 const container={dataset:{},innerHTML:''};const account={innerHTML:''};let warnings=0;
 const document={readyState:'complete',getElementById:id=>id==='global-header'?container:id==='user-area'?account:null,addEventListener(){}};
 const window={applyCityBackground(){},addEventListener(){}};
 vm.runInNewContext(bootstrap,{window,document,console:{warn(){warnings++;}},initHeaderInteractions(){},renderUser(){},Promise});
 assert.match(container.innerHTML,/<header class="rb-header">/);
 assert.match(container.innerHTML,/href="\/mutui\/"/);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(warnings,1);assert.match(container.innerHTML,/Navigazione principale/);
 assert.match(account.innerHTML,/href="\/login\/"/);assert.doesNotMatch(account.innerHTML,/PRO|Logout/);
});
test('repeated initialization does not duplicate the header or account binding',()=>{
 const container={dataset:{},innerHTML:''};let renders=0;
 const document={readyState:'loading',getElementById:()=>container,addEventListener(){}};
 const window={applyCityBackground(){renders++;},addEventListener(){}};
 const c={window,document,console:{warn(){}},initHeaderInteractions(){},renderUser(){},Promise};vm.createContext(c);vm.runInContext(bootstrap,c);
 c.initializeSharedHeader();c.initializeSharedHeader();assert.equal(renders,1);
});
test('tool has the same navigation markup before any script executes',()=>{
 const template=source.split('  container.innerHTML = `')[1].split('  `;')[0];
 const html=read('tool/index.html');assert.ok(html.includes('<div id="global-header">'+template+'</div>'));
 assert.equal((html.match(/id="global-header"/g)||[]).length,1);
 assert.equal((html.match(/id="rb-mobile"/g)||[]).length,1);
 assert.match(html,/header.js\?v=20261008-rc66/);
 assert.doesNotMatch(source,/^import .*firebase/m);
});
