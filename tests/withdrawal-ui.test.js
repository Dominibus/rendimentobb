import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function harness(failFirst=false){
 const nodes=new Map(),calls=[];let download='';
 function element(){return {hidden:false,disabled:false,value:'',textContent:'',children:[],events:{},addEventListener(name,cb){this.events[name]=cb;},append(...kids){this.children.push(...kids);},replaceChildren(){this.children=[];},focus(){},reportValidity(){return true;},click(){download=this.download;}};}
 for(const id of ['entry','name','email','contract','summary','review','confirm','back','status','retry','result','receipt','download'])nodes.set('withdrawal-'+id,element());
 nodes.get('withdrawal-entry').elements={website:{value:''}};nodes.get('withdrawal-name').value='<script>Mario</script>';nodes.get('withdrawal-email').value='mario@example.test';nodes.get('withdrawal-contract').value='Investor purchase 2026-10-10';
 const docEvents={},window={currentLang:'it'};
 const ctx={window,document:{getElementById:id=>nodes.get(id),createElement:element,addEventListener:(name,cb)=>docEvents[name]=cb},crypto:{randomUUID:()=> 'c41b6aaa-6608-42ca-91f5-aaa111222333'},URL:{createObjectURL:()=> 'blob:receipt',revokeObjectURL(){}},Blob,setTimeout:cb=>cb(),fetch:async(url,options)=>{
  calls.push({url,body:JSON.parse(options.body)});if(failFirst&&calls.length===1)throw Error('offline');return {ok:true,json:async()=>({success:true,id:'wr_'+'a'.repeat(64),receiptText:'Receipt received at original time',receiptEmail:calls.length===1?'pending':'accepted_by_provider'})};
 }};
 vm.createContext(ctx);vm.runInContext(readFileSync(new URL('../js/withdrawal.js',import.meta.url),'utf8'),ctx);
 return {get:id=>nodes.get('withdrawal-'+id),calls,window,docEvents,download:()=>download};
}
test('review does not submit; explicit confirmation does and retry preserves immutable identifiers',async()=>{
 const h=harness();h.get('entry').events.submit({preventDefault(){}});assert.equal(h.calls.length,0);assert.equal(h.get('review').hidden,false);assert.equal(h.get('summary').children[1].textContent,'<script>Mario</script>');
 await h.get('confirm').events.click();assert.equal(h.calls.length,1);assert.equal(h.calls[0].body.confirmed,true);assert.equal(h.get('retry').hidden,false);assert.match(h.get('status').textContent,/in attesa/);
 h.window.currentLang='en';h.docEvents.rb_language_changed();assert.match(h.get('status').textContent,/pending/);
 await h.get('retry').events.click();assert.deepEqual(h.calls[1].body,h.calls[0].body);assert.equal(h.get('retry').hidden,true);assert.match(h.get('status').textContent,/accepted/);
 h.get('download').events.click();assert.match(h.download(),/RendimentoBB-recesso-/);
});
test('network failure never shows a received declaration and retry uses the same request id',async()=>{
 const h=harness(true);h.get('entry').events.submit({preventDefault(){}});await h.get('confirm').events.click();assert.match(h.get('status').textContent,/non confermato/);assert.equal(h.get('confirm').disabled,false);
 await h.get('confirm').events.click();assert.deepEqual(h.calls[0].body,h.calls[1].body);assert.match(h.get('status').textContent,/registrata/);
});
