import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
const helper=source.slice(source.indexOf('function revealBookingForm('),source.indexOf('// =====================================\n// PRODUCTION LOGGING'));
function harness(mobile){
 const callbacks=[]; const calls=[];
 const context={window:{matchMedia:()=>({matches:mobile}),requestAnimationFrame:fn=>callbacks.push(fn)}};
 vm.createContext(context); vm.runInContext(helper,context);
 const form={style:{display:'flex'},scrollIntoView:options=>calls.push(options)};
 return {context,form,callbacks,calls};
}
test('mobile booking form is revealed after layout without focusing an input',()=>{
 const h=harness(true); h.context.revealBookingForm(h.form);
 assert.equal(h.calls.length,0); h.callbacks[0]();
 assert.equal(h.calls.length,1); assert.equal(h.calls[0].block,'start');
});
test('closing the form before the frame prevents an unwanted scroll',()=>{
 const h=harness(true); h.context.revealBookingForm(h.form); h.form.style.display='none';
 h.callbacks[0](); assert.equal(h.calls.length,0);
});
test('desktop retains its fixed modal position',()=>{
 const h=harness(false); h.context.revealBookingForm(h.form); assert.equal(h.callbacks.length,0);
});
