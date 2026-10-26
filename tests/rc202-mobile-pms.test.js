import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {createPMSApiClient} from '../js/pms-api-client.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('js/dashboard.js');
function windowFunction(name){const start=source.indexOf(`window.${name} =`);assert.ok(start>=0);return source.slice(start,source.indexOf('\n};',start)+4);}
function node(value=''){return {value,disabled:false,hidden:true,style:{},dataset:{},textContent:'',setAttribute(){},removeAttribute(){}};}
function access({demo=false,free=false,signedIn=true,lang='it'}={}){
  const calls=[];const nodes=Object.fromEntries(['booking-demo-notice','toggle-booking-form','booking-save-button','booking-demo-link'].map(id=>[id,node()]));
  const user=signedIn?{uid:'owner',getIdToken:async()=>{calls.push('token');return 'token';}}:null;
  const c={window:{currentUser:user,isDemoData:demo,currentLang:lang},auth:{currentUser:user},document:{getElementById:id=>nodes[id]},isDemo:()=>demo,canUseFirestorePMS:()=>!free,t:(it,en)=>lang==='en'?en:it,bookingOperationError:e=>calls.push(e.code)};
  vm.createContext(c);
  const start=source.indexOf('function pmsWriteRestriction()'),end=source.indexOf('// =====================================\n// 🏠 SAVE PROPERTY',start);
  vm.runInContext(source.slice(start,end),c);
  return {c,calls,nodes};
}
for(const scenario of [{name:'anonymous preview',demo:true,signedIn:false},{name:'dummy demo identity',demo:true},{name:'authenticated Free',free:true}]){
  test(`readonly controls and write guard: ${scenario.name}`,async()=>{
    const {c,calls,nodes}=access(scenario);c.renderBookingWriteAccess();
    assert.equal(nodes['booking-demo-notice'].hidden,false);assert.equal(nodes['toggle-booking-form'].disabled,true);
    assert.equal(c.requirePMSWriteAccess(),false);
    vm.runInContext(windowFunction('openBookingModal'),c);
    assert.equal(await c.window.openBookingModal(),false);
    for(const name of ['createGuestIssuePortalLink','revokeGuestIssuePortalLink','shareGuestIssuePortalWhatsApp','shareGuestIssuePortalEmail']){
      vm.runInContext(windowFunction(name),c);await c.window[name]();
    }
    assert.ok(calls.length>=5);assert.ok(calls.every(code=>code==='booking/demo_readonly'||code==='booking/plan_required'));
  });
}
for(const plan of ['investor','pro'])test(`authenticated ${plan} retains persistent access`,()=>{
  const {c,nodes}=access();assert.equal(c.pmsWriteRestriction(),null);assert.equal(c.requirePMSWriteAccess(),true);
  c.renderBookingWriteAccess();assert.equal(nodes['booking-demo-notice'].hidden,true);assert.equal(nodes['toggle-booking-form'].disabled,false);
});
test('mismatching Firebase session is rejected',()=>{const {c}=access();c.auth.currentUser={uid:'other'};assert.equal(c.pmsWriteRestriction(),'unauthorized');});
test('fake demo user cannot obtain a pending ID, token or network request',async()=>{
  let writes=0,network=0;
  const client=createPMSApiClient({getUser:()=>({uid:'demo-user'}),cryptoImpl:webcrypto,storage:{setItem(){writes++;}},fetchImpl:()=>{network++;}});
  await assert.rejects(client('save',{data:{guestName:'Fictional'}}),e=>e.code==='booking/unauthorized');
  assert.equal(writes,0);assert.equal(network,0);
});
for(const lang of ['it','en'])test(`zero expected guests never displays received out of zero: ${lang}`,()=>{
  const nodes={};for(const id of ['booking-guests','booking-documents-received','booking-authority-status','booking-registration-summary','booking-registration-progress'])nodes[id]=node();
  const c={window:{t:(it,en)=>lang==='en'?en:it},document:{getElementById:id=>nodes[id]}};vm.createContext(c);vm.runInContext(windowFunction('updateBookingGuestRegistration'),c);
  nodes['booking-guests'].value='0';nodes['booking-documents-received'].value='2';c.window.updateBookingGuestRegistration();
  assert.equal(nodes['booking-documents-received'].value,'0');assert.equal(nodes['booking-documents-received'].disabled,true);
  assert.doesNotMatch(nodes['booking-registration-progress'].textContent,/2 (di|of) 0/);
  nodes['booking-guests'].value='2';nodes['booking-documents-received'].value='5';c.window.updateBookingGuestRegistration();
  assert.equal(nodes['booking-documents-received'].value,'2');assert.equal(nodes['booking-documents-received'].disabled,false);
  assert.match(nodes['booking-registration-progress'].textContent,/2 (di|of) 2/);
});
for(const lang of ['it','en'])test(`pricing separates nightly and full stay deltas: ${lang}`,()=>{
  const nodes={};for(const id of ['booking-pricing-box','booking-total','booking-pricing-season','booking-pricing-base','booking-pricing-suggested','booking-pricing-impact'])nodes[id]=node();
  nodes['booking-total'].value='336';nodes['booking-pricing-season'].value='medium';
  const metrics={nights:3,weekendNights:0,start:new Date('2026-10-27T12:00:00Z'),checkin:'2026-10-27'};
  const c={window:{currentPropertyData:{priceNight:112},getBookingStayMetrics:()=>metrics},document:{getElementById:id=>nodes[id]},getPricingMarket:()=>null,getLocalISODate:()=> '2026-10-26',calendarDayDifference:()=>1,t:(it,en)=>lang==='en'?en:it,formatCurrency:n=>`${n.toFixed(2)} EUR`,Date};
  vm.createContext(c);vm.runInContext(windowFunction('updateBookingPricingSuggestion'),c);const result=c.window.updateBookingPricingSuggestion();
  assert.equal(result.suggestedADR,110);assert.equal(result.suggestedTotal,330);assert.equal(result.delta,-6);assert.equal(result.deltaPercent,-2);
  assert.match(nodes['booking-pricing-impact'].textContent,/-2.00 EUR\/(notte|night)/);assert.match(nodes['booking-pricing-impact'].textContent,/-6.00 EUR/);assert.match(nodes['booking-pricing-impact'].textContent,/3 (notti|nights)/);
});
test('public interactive PMS demo has no account or external write transport',()=>{
  const demo=read('js/pms-product-demo.js');assert.doesNotMatch(demo,/\bfetch\s*\(|https?:|firebase|localStorage|sessionStorage|wa\.me|mailto:/i);
  assert.match(demo,/let bookings=createDemoBookings/);assert.match(demo,/event.preventDefault\(\)/);
});
test('preview create control is a native button with a visible alternative',()=>{
  const html=read('dashboard/index.html');assert.match(html,/<button type="button"\s+id="toggle-booking-form"/);
  assert.match(html,/id="booking-demo-link" href="\/demo\/hospitality-pms\/"/);
});
test('cookie settings remain available without a floating overlay',()=>{
  const css=read('js/header.js').match(/\.rb-consent-settings\{([^}]+)\}/)[1];
  assert.match(css,/position:relative/);assert.doesNotMatch(css,/position:fixed/);assert.match(css,/min-height:44px/);
});

test('Escape closes the top PMS surface without bypassing dirty-form handling',()=>{
  let listener,formCloses=0,modalCloses=0,prevented=0;
  const form={style:{display:'flex'},getClientRects:()=>[{}]},modal={style:{display:'flex'},getClientRects:()=>[{}]};
  const c={window:{closeBookingForm:()=>{formCloses++;return false;},closeBookingsModal:()=>modalCloses++},document:{activeElement:{closest:()=>null},getElementById:id=>id==='booking-form-container'?form:modal,addEventListener:(name,fn)=>listener=fn}};
  vm.createContext(c);const start=source.indexOf('// Close only the top PMS surface;'),end=source.indexOf('\n});',start)+4;vm.runInContext(source.slice(start,end),c);
  listener({key:'Escape',preventDefault:()=>prevented++});assert.equal(formCloses,1);assert.equal(modalCloses,0);assert.equal(form.style.display,'flex');
  form.style.display='none';listener({key:'Escape',preventDefault:()=>prevented++});assert.equal(modalCloses,1);assert.equal(prevented,2);
  c.document.activeElement.closest=()=>({});listener({key:'Escape',preventDefault:()=>prevented++});assert.equal(modalCloses,1);
});
