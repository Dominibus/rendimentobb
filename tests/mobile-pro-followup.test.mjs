import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const root=process.env.RBB_TEST_ROOT || new URL('../',import.meta.url);
const read=f=>readFileSync(new URL(f,typeof root==='string'?new URL('file://'+root+'/'):root),'utf8');
const ui=read('js/chatbot/ui/chatbot-ui.js');
const c=vm.createContext({window:{}});vm.runInContext(ui.slice(ui.indexOf('function rbFormatPropertySnapshotROI('),ui.indexOf('window.initRBChatbotUI')),c);
for(const [data,out] of [[{roi:5.2001,realROI:1.56,equity:54000},'5.2%'],[{roi:0,equity:10000},'0.0%'],[{roi:-2.35,equity:30000},'-2.4%'],[{roi:0,equity:0},'N/A'],[{roi:0,roiAvailable:false},'N/A'],[{realROI:1.6},'--'],[{roi:null},'--'],[{roi:''},'--'],[{roi:true},'--']])test('equity snapshot '+JSON.stringify(data),()=>assert.equal(c.rbFormatEquitySnapshotROI(data),out));
test('candidate page loads real language engine before workspace',()=>{
 const html=read('immobili/candidati/index.html');const lang=html.indexOf('/js/lang.js?');assert.ok(lang>=0);assert.ok(lang<html.indexOf('/js/candidate-workspace.js?'));
});
function headerHarness({late=false,resize=true}={}){
 let h=100,header=late?null:{getBoundingClientRect:()=>({height:h})};const calls=[],events={};let ro,mo;
 const window={addEventListener:(n,f)=>events[n]=f,MutationObserver:class{constructor(f){mo=f}observe(){}disconnect(){}},...(resize?{ResizeObserver:class{constructor(f){ro=f}observe(el){assert.equal(el,header)}disconnect(){}}}:{})};
 const document={querySelector:selector=>selector==='#global-header .rb-header'?header:null,getElementById:()=>({getBoundingClientRect:()=>({height:0})}),documentElement:{style:{setProperty:(k,v)=>calls.push([k,v])}}};
 const src=read('js/mobile-shell.js');const a=src.indexOf('function trackMobileHeader(){'),b=src.indexOf('function mount(){',a);assert.ok(a>=0);
 vm.runInNewContext(src.slice(a,b)+'\ntrackMobileHeader();',{window,document,Number,Math});
 return {calls,setHeight(v){h=v},resize(){ro?.();events.resize?.()},arrive(){header={getBoundingClientRect:()=>({height:h})};mo()}};
}
test('measures fixed header, not zero-height host; follows growth and rotation',()=>{
 const h=headerHarness();assert.deepEqual(h.calls.at(-1),['--rb-shell-header-height','100px']);h.setHeight(132);h.resize();assert.equal(h.calls.at(-1)[1],'132px');h.setHeight(88);h.resize();assert.equal(h.calls.at(-1)[1],'88px');
});
test('async header insertion gets measured',()=>{const h=headerHarness({late:true});assert.equal(h.calls.length,0);h.arrive();assert.equal(h.calls.at(-1)[1],'100px')});
test('zero height cannot overwrite usable clearance',()=>{const h=headerHarness();h.setHeight(0);h.resize();assert.equal(h.calls.at(-1)[1],'100px')});
test('resize event works without ResizeObserver',()=>{const h=headerHarness({resize:false});h.setHeight(120);h.resize();assert.equal(h.calls.at(-1)[1],'120px')});
test('clearance is mobile-only and tool anchors use the measured header',()=>{
 const css=read('css/mobile-shell.css').split('/* Header clearance')[1];assert.match(css,/@media\(max-width:760px\)/);assert.match(css,/padding-top:calc\(max\(82px,var\(--rb-shell-header-height,100px\)\) \+ 12px\)!important/);assert.match(css,/#rb-analysis-inputs,#rb-simulation-summary,#rb-analysis-insights/);
});
