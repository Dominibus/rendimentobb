import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/dashboard.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('async function getOwnedReportPMS('),source.indexOf('// ================= REPORT CLICK HANDLER',source.indexOf('async function getOwnedReportPMS(')));
function harness(pms,load){const c={auth:{currentUser:{uid:'owner'}},window:{currentUser:{uid:'owner'},rbPMSData:pms}};c.loadPMSStats=async()=>load(c);vm.createContext(c);vm.runInContext(code,c);return c;}
test('report waits for PMS before copying operational data',async()=>{let loaded=0;const c=harness(null,c=>{loaded++;c.window.rbPMSData={ownerUid:'owner',portalSnapshotReady:true,properties:4,bookings:13}});const pms=await c.getOwnedReportPMS('owner');assert.equal(loaded,1);assert.equal(pms.properties,4);assert.equal(pms.bookings,13);});
test('completed empty PMS is preserved without fabricated loading retries',async()=>{const pms={ownerUid:'owner',portalSnapshotReady:true,properties:0,bookings:0};const c=harness(pms,()=>assert.fail('unexpected read'));assert.equal(await c.getOwnedReportPMS('owner'),pms);});
test('partial or another owner snapshot cannot generate a report',async()=>{for(const pms of [{ownerUid:'owner',properties:0},{ownerUid:'other',portalSnapshotReady:true,properties:10}]){const c=harness(pms,()=>{});await assert.rejects(c.getOwnedReportPMS('owner'),/pms_snapshot_unavailable/);}});
test('account changed while PMS loads cannot write the old owner report',async()=>{const c=harness(null,c=>{c.window.rbPMSData={ownerUid:'owner',portalSnapshotReady:true};c.auth.currentUser={uid:'other'};});await assert.rejects(c.getOwnedReportPMS('owner'),/pms_snapshot_unavailable/);});
