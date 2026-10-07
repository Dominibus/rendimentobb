import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/chatbot/pdf-parser-engine.js',import.meta.url),'utf8');
async function parse(text){
 const c={window:{RB_DEBUG:false},console};vm.createContext(c);vm.runInContext(source,c);
 const doc={extractedText:text};await c.window.rbParseExecutivePDF(doc);return doc.analysis;
}
for(const [name,text,expected] of [
 ['narrative followed by footer date','Si consiglia di ottimizzare ADR o livello occupazione. RendimentoBB 01/10/2026',null],
 ['narrative followed by revenue','ADR e occupazione da verificare. Ricavi annui 28.506 €',null],
 ['Italian amount','ADR: 155,50 €',155.5],
 ['English amount','Average daily rate: €155.50',155.5],
 ['Italian labelled amount','Tariffa media 150 €',150],
 ['explicit unitless amount','ADR: 150',150],
 ['currency in heading','ADR (€): 155,50',155.5],
 ['PMS table','Occupazione ADR RevPAR 155 € 28 € Ospiti 19',155],
 ['zero value','ADR: 0 €',0],
 ['invalid values','ADR: 01/10/2026 ADR: 70% ADR: -150 € ADR: 100–200 €',null],
 ['whole word only','QUADRATO 150 €',null],
 ['later valid evidence','ADR da rivedere 01/10/2026. ADR: 155 €',155]
]) test(`ADR grounding: ${name}`,async()=>assert.equal((await parse(text)).adr,expected));
test('missing ADR does not reuse a previous document and keeps report indicators',async()=>{
 await parse('ADR: 155 €');
 const a=await parse('ROI EQUITY -33,9% CASHFLOW NETTO DOPO MUTUO -76.228 € DSCR: 0,18 INDICE RISCHIO 80/100 ADR da ottimizzare 02/10/2026');
 assert.equal(a.adr,null);assert.equal(a.roi,-33.9);assert.equal(a.cashflow,-76228);assert.equal(a.dscr,.18);assert.equal(a.risk,80);
});
