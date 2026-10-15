import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {canExportPMSReport,buildPMSOperationalReport,renderPMSOperationalPDF} from '../js/pms-operational-report.js';
const fixture=()=>({ownerUid:'owner',portalSnapshotReady:true,isDemo:false,propertyList:[{id:'a',name:'Casa Test',city:'Roma'},{id:'b',name:'Casa Due',city:'Napoli'}],renovationList:[{propertyId:'a',propertyName:'Casa Test',status:'in_progress',progressPercent:50,plannedTotal:1000,actualSpent:400}],portalBookingList:[
 {id:'one',propertyId:'a',guestName:'DO NOT EXPORT GUEST',checkin:'2026-09-28',checkout:'2026-10-04',totalAmount:600,amountRecognized:true,guests:2,status:'completed'},
 {id:'two',propertyId:'a',checkin:'2026-10-04',checkout:'2026-10-06',totalAmount:240,amountRecognized:true,guests:1,status:'checkin',requiresAttention:true},
 {id:'three',propertyId:'b',checkin:'2026-10-10',checkout:'2026-10-12',totalAmount:300,amountRecognized:true,guests:3,status:'confirmed'},
 {propertyId:'a',checkin:'2026-10-01',checkout:'2026-10-31',totalAmount:9999,status:'pending'},
 {propertyId:'a',checkin:'2026-10-01',checkout:'2026-10-31',totalAmount:9999,status:'cancelled'}]});
const build=(snapshot=fixture(),extra={})=>buildPMSOperationalReport({snapshot,ownerUid:'owner',month:'2026-10',generatedAt:'2026-10-15T08:00:00Z',...extra});
test('PMS-only export needs no analysis and allocates cross-month revenue without pending or cancelled bookings',()=>{
 const r=build();assert.equal(r.totals.properties,2);assert.equal(r.totals.bookings,3);assert.equal(r.totals.pending,1);assert.equal(r.totals.allRevenue,1140);assert.equal(r.totals.revenue,840);assert.equal(r.totals.nights,7);assert.equal(r.totals.stays,3);assert.equal(r.totals.adr,120);assert.equal(r.totals.revpar,840/62);assert.equal(r.totals.guests,6);assert.equal(r.totals.attention,1);assert.doesNotMatch(JSON.stringify(r),/DO NOT EXPORT GUEST|guestName|roi|cashflow/);
});
test('single property report excludes other properties, bookings and renovations',()=>{
 const r=build(fixture(),{propertyId:'a'});assert.equal(r.rows.length,1);assert.equal(r.totals.bookings,2);assert.equal(r.totals.revenue,540);assert.equal(r.totals.nights,5);assert.equal(r.totals.occupancy,5/31*100);assert.equal(r.renovations.length,1);
 assert.equal(build(fixture(),{propertyId:'b'}).renovations.length,0);
 assert.throws(()=>build(fixture(),{propertyId:'unknown'}),/PROPERTY_NOT_FOUND/);
});
test('another month uses civil stay dates and checkout exclusion',()=>{
 assert.equal(build(fixture(),{month:'2026-09'}).totals.revenue,300);
 const f=fixture();f.portalBookingList=[{propertyId:'a',checkin:'2026-10-24',checkout:'2026-10-26',totalAmount:200,status:'confirmed'}];assert.equal(build(f).totals.nights,2);
});
test('overlaps warn and do not double count occupied nights',()=>{
 const f=fixture();f.portalBookingList=[{propertyId:'a',checkin:'2026-10-04',checkout:'2026-10-06',totalAmount:200,status:'confirmed'},{propertyId:'a',checkin:'2026-10-05',checkout:'2026-10-07',totalAmount:200,status:'confirmed'}];const r=build(f,{propertyId:'a'});assert.equal(r.totals.nights,4);assert.equal(r.totals.occupiedNights,3);assert.equal(r.warnings.overlappingNights,1);
});
test('invalid dates, missing amounts and orphan bookings are explicit instead of invented',()=>{
 const f=fixture();f.portalBookingList=[{propertyId:'a',checkin:'2026-02-30',checkout:'2026-10-05',amountRecognized:false,status:'confirmed'},{propertyId:'missing',status:'confirmed'}];const r=build(f);assert.equal(r.warnings.invalidDates,1);assert.equal(r.warnings.missingAmounts,1);assert.equal(r.warnings.unlinkedBookings,1);assert.equal(r.totals.revenue,0);assert.equal(r.totals.adr,null);
});
test('empty account, wrong owner, demo, incomplete snapshot and invalid month are handled safely',()=>{
 const f={...fixture(),propertyList:[],portalBookingList:[],renovationList:[]};const r=build(f);assert.equal(r.totals.properties,0);assert.equal(r.totals.occupancy,null);assert.equal(r.totals.revpar,null);
 for(const change of [{ownerUid:'another'},{isDemo:true},{portalSnapshotReady:false},{portalBookingList:null}])assert.throws(()=>build({...fixture(),...change}),/UNAVAILABLE/);
 for(const month of ['2026-00','2026-13','0000-10','junk'])assert.throws(()=>build(fixture(),{month}),/INVALID_REPORT_MONTH/);
});
test('PDF access stays Pro-only and requires an authenticated account',()=>{
 assert.equal(canExportPMSReport(null,{isPro:true}),false);
 for(const access of [{},{isFree:true},{isInvestor:true},{isPro:'true'}])assert.equal(canExportPMSReport({uid:'owner'},access),false);
 for(const access of [{isPro:true},{isAdmin:true}])assert.equal(canExportPMSReport({uid:'owner'},access),true);
});
const bundle={exports:{}};vm.runInNewContext(readFileSync(new URL('../js/vendor/jspdf-4.2.1.umd.min.js',import.meta.url),'utf8'),{module:bundle,exports:bundle.exports,console,atob,btoa,setTimeout,clearTimeout,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer});
for(const lang of ['it','en'])for(const propertyId of ['', 'a'])test(`real operations PDF: ${lang}, scope=${propertyId||'all'}`,()=>{
 const r=build(fixture(),{propertyId});const pdf=renderPMSOperationalPDF(r,{jsPDF:bundle.exports.jsPDF,lang});const bytes=Buffer.from(pdf.output('arraybuffer'));
 assert.ok(bytes.length>5000);assert.ok(pdf.getNumberOfPages()>=2);assert.doesNotMatch(bytes.toString('latin1'),/DO NOT EXPORT GUEST/);
 if(process.env.RB_REPORT_QA_DIR){mkdirSync(process.env.RB_REPORT_QA_DIR,{recursive:true});writeFileSync(process.env.RB_REPORT_QA_DIR+'/PMS-'+lang+'-'+(propertyId||'all')+'.pdf',bytes);}
});
test('long property names and many rows paginate without discarding records',()=>{
 const f=fixture();f.propertyList=Array.from({length:35},(_,i)=>({id:'property-'+i,name:'Property '+i+' '+('long name '.repeat(20)),city:'City'}));f.portalBookingList=[];const r=build(f);const pdf=renderPMSOperationalPDF(r,{jsPDF:bundle.exports.jsPDF,lang:'en'});assert.equal(r.rows.length,35);assert.ok(pdf.getNumberOfPages()>5);
});
const dashboard=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
const entry=dashboard.slice(dashboard.indexOf('window.openPMSReportDialog ='),dashboard.indexOf('// ================= REPORT CLICK HANDLER'));
function entryHarness(access={isPro:true},{swapDuringRead=false}={}){
 const nodes=[],listeners={};let reads=0,saved=0,pause=0;
 const element=tag=>{const e={tag,style:{},children:[],value:'',disabled:false,setAttribute(){},appendChild(n){this.children.push(n);},addEventListener(name,fn){this[name]=fn;},remove(){this.removed=true;},close(){this.close?.callback?.();},showModal(){this.shown=true;}};nodes.push(e);return e;};
 const window={currentUser:{uid:'owner'},currentLang:'it',getUserAccess:()=>access,rbLiveSalesPaused:()=>true,rbShowSalesPause:()=>pause++,jspdf:{jsPDF(){}}};const auth={currentUser:{uid:'owner'}};
 const document={getElementById:()=>null,createElement:element,body:{appendChild(){}},addEventListener(name,fn){listeners[name]=fn;},removeEventListener(name){delete listeners[name];}};
 const c={window,auth,document,Date,t:(it,en)=>window.currentLang==='en'?en:it,canExportPMSReport,buildPMSOperationalReport,renderPMSOperationalPDF:()=>({save(){saved++;}}),getOwnedReportPMS:async()=>fixture(),loadPMSStats:async opts=>{reads++;assert.equal(opts.fresh,true);if(swapDuringRead){auth.currentUser={uid:'another'};window.currentUser={uid:'another'};}},alert:()=>assert.fail('unexpected read error')};
 vm.runInNewContext(entry,c);return {c,nodes,reads:()=>reads,saved:()=>saved,pause:()=>pause};
}
test('PMS export entrypoint works without saved simulations and supports a preselected property',async()=>{
 const h=entryHarness();await h.c.window.openPMSReportDialog('a');assert.equal(h.reads(),1);assert.equal(h.nodes.find(n=>n.tag==='select').value,'a');assert.equal(h.nodes.find(n=>n.tag==='dialog').shown,true);await h.nodes.find(n=>n.textContent==='Scarica PDF operativo').onclick();assert.equal(h.saved(),1);
});
test('Free and Investor cannot read/export operational PDF',async()=>{
 for(const access of [{isFree:true},{isInvestor:true}]){const h=entryHarness(access);await h.c.window.openPMSReportDialog();assert.equal(h.reads(),0);assert.equal(h.saved(),0);assert.equal(h.pause(),1);}
});
test('account switch while loading prevents old-account dialog',async()=>{
 const h=entryHarness({isPro:true},{swapDuringRead:true});await h.c.window.openPMSReportDialog();assert.equal(h.nodes.length,0);
});
test('account switch or Pro removal before download prevents export',async()=>{
 for(const change of ['account','plan']){const access={isPro:true};const h=entryHarness(access);await h.c.window.openPMSReportDialog();if(change==='account')h.c.auth.currentUser={uid:'another'};else access.isPro=false;await h.nodes.find(n=>n.textContent==='Scarica PDF operativo').onclick();assert.equal(h.saved(),0);}
});
