import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync}from'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('RC200 typo normalisation preserves amounts, dates and identifiable names',()=>{
 const c=vm.createContext({window:{}});vm.runInContext(read('js/chatbot/core/query-normalizer.js'),c);
 for(const [query,expected]of [['prenottazioni 27/10/2026 143,00','prenotazioni 27/10/2026 143,00'],['calndario','calendario'],['calender 2026-10-27','calendar 2026-10-27'],['ospite Roy 305','ospite Roy 305']])assert.equal(c.window.rbNormalizeAIQuery(query).text,expected);
});
test('RC200 reported scenario recomputes independently from the complete saved inputs',async()=>{
 globalThis.window={};const {calculateROI}=await import('../js/roi-engine.js');
 const r=calculateROI({price:160000,equity:40000,loanAmount:120000,priceNight:143,occupancy:70,expenses:797,commission:15,tax:21,interestRate:3.5,loanYears:20});
 assert.ok(Math.abs(r.gross-36536.5)<.01);assert.ok(Math.abs(r.netAfterMortgage-8627.28)<.01);assert.ok(Math.abs(r.roi-21.5682)<.001);assert.equal(r.risk,23);delete globalThis.window;
});
for(const en of [false,true])test('RC200 integrated PDF column headings bind to the correct financial cells '+(en?'EN':'IT'),async()=>{
 const c=vm.createContext({window:{},console});vm.runInContext(read('js/chatbot/pdf-parser-engine.js'),c);
 const d={extractedText:en?`RendimentoBB INVESTMENT & OPERATIONS REPORT FORECAST EQUITY ROI 21.6% PURCHASE PRICE EQUITY ESTIMATED ANNUAL NET CASHFLOW 160,000.00 EUR 40,000.00 EUR 8,627.28 EUR SCORE BREAK-EVEN ESTIMATED MONTHLY NET CASHFLOW 86/100 4.6 years 718.94 EUR LOAN LTV DSCR 120,000.00 EUR 75.0% 2.57`:`RendimentoBB REPORT INVESTIMENTO E GESTIONE ROI EQUITY PREVISIONALE 21,6% PREZZO CAPITALE PROPRIO CASHFLOW NETTO STIMATO ANNUO 160.000,00 € 40.000,00 € 8627,28 € PUNTEGGIO BREAK-EVEN CASHFLOW NETTO STIMATO MENSILE 86/100 4,6 anni 718,94 € MUTUO LTV DSCR 120.000,00 € 75,0% 2,57`};
 await c.window.rbParseExecutivePDF(d);assert.equal(d.analysis.cashflow,8627.28);assert.equal(d.analysis.dscr,2.57);assert.equal(d.analysis.investmentScore,86);assert.equal(d.analysis.equity,40000);assert.equal(d.analysis.propertyPrice,160000);assert.equal(d.analysis.roi,21.6);
});
test('RC200 explicit unavailable integrated cells cannot become price or debt values',async()=>{
 const c=vm.createContext({window:{},console});vm.runInContext(read('js/chatbot/pdf-parser-engine.js'),c);
 const d={extractedText:'RendimentoBB REPORT INVESTIMENTO E GESTIONE ROI EQUITY PREVISIONALE N/A PREZZO CAPITALE PROPRIO CASHFLOW NETTO STIMATO ANNUO 160.000,00 € 0,00 € N/A MUTUO LTV DSCR 120.000,00 € 75,0% N/A'};await c.window.rbParseExecutivePDF(d);assert.equal(d.analysis.cashflow,null);assert.equal(d.analysis.dscr,null);assert.equal(d.analysis.equity,0);
});
