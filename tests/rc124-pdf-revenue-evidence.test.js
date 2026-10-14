import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/chatbot/pdf-parser-engine.js',import.meta.url),'utf8');
async function parse(text){const c={window:{},console};vm.createContext(c);vm.runInContext(source,c);const d={type:'executive_report',extractedText:text};await c.window.rbParseExecutivePDF(d);return d.analysis;}
for(const formula of ['Ricavi annui = tariffa x 365 x occupazione / 100.','Annual revenue = nightly rate x 365 x occupancy / 100.'])test(`annual revenue formula must not become an amount: ${formula}`,async()=>{
 const a=await parse(`RendimentoBB ROI EQUITY PREVISIONALE 26.3% Cashflow netto annuo 7903,82 EUR ${formula}`);assert.equal(a.gross,null);
});
for(const [label,value] of [['Ricavi annui','38.325,00 €'],['Annual revenue','€38,325.00']])test(`explicit annual amount overrides formulas: ${label}`,async()=>{
 const a=await parse(`RendimentoBB ROI EQUITY PREVISIONALE 26.3% ${label} = nightly rate x 365 x occupancy / 100. Saved simulation assumptions ${label} ${value} Annual revenue = nightly rate x 365 x occupancy / 100.`);assert.equal(a.gross,38325);
});
