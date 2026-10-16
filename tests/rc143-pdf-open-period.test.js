import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
import {buildPMSOperationalReport,renderPMSOperationalPDF} from '../js/pms-operational-report.js';
const bundle={exports:{}};vm.runInNewContext(readFileSync(new URL('../js/vendor/jspdf-4.2.1.umd.min.js',import.meta.url),'utf8'),{module:bundle,exports:bundle.exports,console,atob,btoa,setTimeout,clearTimeout,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer});
const snapshot={ownerUid:'owner',portalSnapshotReady:true,propertyList:[{id:'a',name:'Casa'}],portalBookingList:[],renovationList:[]};
for(const [month,warn] of [['2026-09',false],['2026-10',true],['2026-11',true]])for(const lang of ['it','en'])test(`PDF period status matches its snapshot: ${month}/${lang}`,()=>{
 const r=buildPMSOperationalReport({snapshot,ownerUid:'owner',month,generatedAt:'2026-10-16T13:00:00Z'});
 const doc=renderPMSOperationalPDF(r,{jsPDF:bundle.exports.jsPDF,lang});const text=doc.internal.pages.flat().join('\n');
 assert.equal(/Periodo in corso o futuro|Current or future period/.test(text),warn);
});
test('Rome midnight closes the prior month even when UTC date is still September',()=>{
 const r=buildPMSOperationalReport({snapshot,ownerUid:'owner',month:'2026-09',generatedAt:'2026-09-30T22:30:00Z'});
 const doc=renderPMSOperationalPDF(r,{jsPDF:bundle.exports.jsPDF,lang:'en'});assert.doesNotMatch(doc.internal.pages.flat().join('\n'),/Current or future period/);
});
