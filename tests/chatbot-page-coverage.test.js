import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,readdir} from 'node:fs/promises';
const read=f=>readFile(new URL('../'+f,import.meta.url),'utf8');
const header=await read('js/header.js');
const helper=header.slice(header.indexOf('function ensureSharedChatbot(){'),header.indexOf('function initializeSharedHeader(){',header.indexOf('function ensureSharedChatbot(){')));
function harness({loaded=false,ready=false,existing=false}={}){
 const appended=[];let scriptExists=existing;
 const c={window:{__rbChatbotLoaded:loaded,rbChatbotReady:ready},document:{querySelector:()=>scriptExists?{}:null,createElement:()=>({remove(){scriptExists=false;}}),body:{appendChild:s=>{scriptExists=true;appended.push(s);}}}};
 vm.createContext(c);vm.runInContext(helper,c);return {load:()=>c.ensureSharedChatbot(),appended};
}
test('missing page loader is loaded from the site once on demand',()=>{const h=harness();h.load();h.load();assert.equal(h.appended.length,1);assert.match(h.appended[0].src,/^\/js\/chatbot-loader\.js\?/);assert.equal(h.appended[0].async,true);});
for(const option of ['loaded','ready','existing'])test(`shared fallback preserves ${option} chatbot without duplicate download`,()=>{const h=harness({[option]:true});h.load();assert.equal(h.appended.length,0);});
test('failed loader download permits another attempt',()=>{const h=harness();h.load();h.appended[0].onerror();h.load();assert.equal(h.appended.length,2);});
async function htmlFiles(dir=new URL('../',import.meta.url)){
 const results=[];for(const entry of await readdir(dir,{withFileTypes:true})){
  if(entry.name==='node_modules'||entry.name.startsWith('.'))continue;
  const url=new URL(entry.name+(entry.isDirectory()?'/':''),dir);
  if(entry.isDirectory())results.push(...await htmlFiles(url));else if(entry.name.endsWith('.html'))results.push(url);
 }return results;
}
test('every page exposing the shared Assistant has a centralized loader fallback',async()=>{
 assert.ok(header.includes('function ensureSharedChatbot(){'));
 const handler=header.slice(header.indexOf('// 🤖 HEADER AI BUTTON'),header.indexOf('/* =====================\n🌐 LANG'));
 assert.ok(handler.includes('ensureSharedChatbot();'));
 let covered=0;
 for(const url of await htmlFiles()){
  const html=await readFile(url,'utf8');
  if(html.includes('/js/header.js')){covered++;const tags=html.match(/<script\b[^>]*src="[^"]*chatbot-loader\.js[^\"]*"[^>]*>/g)||[];assert.ok(tags.length<=1,`${url.pathname}: duplicate explicit loader`);}
  else assert.ok(url.pathname.endsWith('/login/index.html')||url.pathname.endsWith('/guest-report/index.html'),`Unexpected page without shared header: ${url.pathname}`);
 }
 assert.equal(covered,36);
});
