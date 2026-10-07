import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('window.openBookingForEdit = async'),source.indexOf('window.loadBookingPropertyOptions',source.indexOf('window.openBookingForEdit = async')));
function setup(){
 const frames=[],calls=[];const form={style:{display:'flex'}};
 const nodes=Object.fromEntries(['booking-guest-registration-box','booking-tourist-tax-box','booking-cleaning-box','booking-guest-issue-box'].map(id=>[id,{style:{},scrollIntoView:()=>calls.push(id),setAttribute:()=>{},focus:()=>calls.push('focus')} ]));
 const w={currentBookingsData:[{id:'one'}],requestAnimationFrame:fn=>frames.push(fn),showBookingDetails:async b=>{w.currentSelectedBooking=b;calls.push('loaded');}};
 const ctx={window:w,document:{getElementById:id=>id==='booking-form-container'?form:nodes[id]}};vm.createContext(ctx);vm.runInContext(code,ctx);return {w,frames,calls,form};
}
for(const [section,target] of Object.entries({documents:'booking-guest-registration-box',authority:'booking-guest-registration-box',tax:'booking-tourist-tax-box',cleaning:'booking-cleaning-box',issue:'booking-guest-issue-box'}))test(`opens loaded ${section} section without changing booking`,async()=>{const h=setup();await h.w.openBookingForEdit('one',section);assert.deepEqual(h.calls,['loaded']);h.frames[0]();assert.deepEqual(h.calls,['loaded',target,'focus']);assert.deepEqual(h.w.currentBookingsData,[{id:'one'}]);});
test('standard booking and unknown sections keep ordinary navigation',async()=>{const h=setup();await h.w.openBookingForEdit('one','arrival');assert.equal(h.frames.length,0);await h.w.openBookingForEdit('missing','issue');assert.deepEqual(h.calls,['loaded']);});
test('closed or replaced booking prevents delayed section scrolling',async()=>{const h=setup();await h.w.openBookingForEdit('one','issue');h.form.style.display='none';h.frames[0]();assert.deepEqual(h.calls,['loaded']);h.form.style.display='flex';h.w.currentSelectedBooking={id:'two'};h.frames[0]();assert.deepEqual(h.calls,['loaded']);});
