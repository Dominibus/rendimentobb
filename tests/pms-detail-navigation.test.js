import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {dailyChecklist,checklistDay} from '../js/pms-daily-checklist.js';
import {visiblePMSTasks} from '../js/pms-tasks.js';
import {bookingOperations,operationSelection} from '../js/pms-booking-operations.js';
const source=fs.readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
test('detail shortcuts scroll and focus the requested section without changing field values',()=>{
 const calls=[],form={style:{display:'flex'}},message={textContent:''};
 const target={style:{},value:'unchanged',scrollIntoView:()=>calls.push('scroll'),setAttribute:()=>{},focus:()=>calls.push('focus')};
 const ctx={window:{t:it=>it},document:{getElementById:id=>id==='booking-form-container'?form:id==='booking-section-message'?message:id==='booking-cleaning-box'?target:null}};
 vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('window.goToBookingSection ='),source.indexOf('window.openBookingForEdit = async')),ctx);
 assert.equal(ctx.window.goToBookingSection('cleaning'),true);assert.deepEqual(calls,['scroll','focus']);assert.equal(target.value,'unchanged');
 target.style.display='none';assert.equal(ctx.window.goToBookingSection('cleaning'),false);assert.match(message.textContent,/non si applica/);assert.equal(calls.length,2);
 form.style.display='none';assert.equal(ctx.window.goToBookingSection('cleaning'),false);assert.equal(calls.length,2);
});
test('operation and task selections do not leave two shortcuts selected',()=>{
 const container={innerHTML:''},w={t:it=>it,getTouristTaxCurrencySymbol:()=> '€'};
 const ctx={window:w,document:{getElementById:()=>container},dailyChecklist,checklistDay,visiblePMSTasks,bookingOperations,operationSelection,isConfirmedBooking:()=>true,escapeDashboardHTML:String,Intl,Date};
 vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function renderTodayBookingOperations'),source.indexOf('window.setPMSTaskStatus')),ctx);
 w.setPMSOperationFilter('arrival');assert.equal(w.rbOperationFilter,'arrival');
 w.setPMSChecklistFilter('cleaning');assert.equal(w.rbOperationFilter,null);assert.equal(w.rbChecklistFilter,'cleaning');
 w.setPMSOperationFilter('departure');assert.equal(w.rbOperationFilter,'departure');assert.equal(w.rbChecklistFilter,'daily');
});
