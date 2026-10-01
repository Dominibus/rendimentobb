import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
test("portfolio break-even distinguishes loss, zero and recoverable investment",()=>{
 const src=readFileSync(new URL("../js/dashboard.js",import.meta.url),"utf8");
 const calculation=src.match(/const confirmedBreakEven = confirmedYearlyCashflow > 0[\s\S]*?;/)[0];
 for(const [cash,expected] of [[-100,null],[0,null],[1000,30]]){
 const ctx={confirmedYearlyCashflow:cash,confirmedEquity:30000};vm.createContext(ctx);
 assert.equal(vm.runInContext(calculation+"confirmedBreakEven",ctx),expected);
 }
 assert.ok(src.includes('confirmedBreakEven === null ? t("Non raggiunto","Not reached")'));
});
