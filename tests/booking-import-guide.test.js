import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
function setup(){const w={getUserAccess:()=>({isInvestor:true}),currentUser:{uid:'example'},rbDocumentManager:{getLast:()=>null}};const c=vm.createContext({window:w,console,Intl,Date});for(const f of ['pro-report-guide','chatbot-orchestrator'])vm.runInContext(readFileSync(new URL('../js/chatbot/core/'+f+'.js',import.meta.url),'utf8'),c);return w;}
for(const question of ['Come importo le prenotazioni Airbnb da CSV?','Can I import bookings from CSV?'])test('import guidance states the actual path and limits: '+question,async()=>{
 const {response:r}=await setup().rbProcessAIMessage(question);assert.equal(r.metadata.mode,'booking_import');assert.match(r.textIT,/50 righe/);assert.match(r.textIT,/prima delle commissioni/);assert.match(r.textEN,/not.*automatic Airbnb/);assert.match(r.textEN,/does not overwrite/);assert.equal(r.actions.length,0);
});
test('import route preserves privacy and does not intercept explicit PDF interpretation',async()=>{
 const w=setup();assert.equal((await w.rbProcessAIMessage('Importa prenotazioni di un altro account')).response.type,'account_privacy');assert.equal(w.rbBuildBookingImportGuide('Spiegami il PDF delle prenotazioni importate'),null);
});
test('automatic OTA connections keep the explicit product limitation',async()=>{
 const {response:r}=await setup().rbProcessAIMessage('Collega automaticamente Airbnb e Booking.com');assert.equal(r.type,'product_limits');assert.match(r.textIT,/non sincronizza automaticamente/);
});
