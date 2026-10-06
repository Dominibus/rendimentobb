import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {buildRevenueScenarios} from '../js/revenue-scenarios.js';
globalThis.window = {};
const {calculateROI} = await import('../js/roi-engine.js');
delete globalThis.window;
const source = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');
const translate = (it) => it;

test('reported Roma case has consistent -20/base/+20 annual revenue', () => {
  assert.deepEqual(buildRevenueScenarios(51100).map(s => s.value), [40880, 51100, 61320]);
});
test('zero revenue is valid; invalid or negative revenue is not fabricated', () => {
  assert.deepEqual(buildRevenueScenarios(0).map(s => s.value), [0,0,0]);
  for (const value of [null, undefined, '', true, -1, NaN, Infinity, 'abc']) assert.deepEqual(buildRevenueScenarios(value), []);
});
test('labels state the exact assumptions in Italian and English', () => {
  assert.deepEqual(buildRevenueScenarios(100, translate).map(s => s.label), ['Basso (-20%)','Base','Alto (+20%)']);
  assert.deepEqual(buildRevenueScenarios(100, (it,en) => en).map(s => s.label), ['Low (-20%)','Base','High (+20%)']);
});
test('actual simulator renderer and PDF drawing block use the same values and labels', () => {
  for (const revenue of [51100,63875,0]) {
    const container = {innerHTML: ''};
    const context = {buildRevenueScenarios, t: translate, T: translate, revenue, y: 50,
      safe: Number, formatCurrency: value => `EUR ${value}`, eur: value => `EUR ${value}`,
      document: {getElementById: () => container}, dark: [0,0,0], drawn: [], bars: [],
      doc: {setFontSize(){},setTextColor(){},setFillColor(){},
        text(text){context.drawn.push(text);},roundedRect(...args){context.bars.push(args);}}};
    vm.createContext(context);
    const render = source.slice(source.indexOf('function renderRevenueForecast('), source.indexOf('// ================= OCCUPANCY SENSITIVITY'));
    const pdf = source.slice(source.indexOf('const revenueScenarios ='), source.indexOf('// AI EXECUTIVE INSIGHT'));
    vm.runInContext(render + `\nrenderRevenueForecast(${revenue});\n` + pdf, context);
    for (const s of buildRevenueScenarios(revenue)) {
      assert.ok(container.innerHTML.includes(s.label));
      assert.ok(container.innerHTML.includes(`EUR ${s.value}`));
      assert.ok(context.drawn.includes(s.label));
      assert.ok(context.drawn.includes(`EUR ${s.value}`));
    }
    assert.equal(context.bars.length, 6);
    assert.equal(context.bars[5][2], revenue ? 92 : 0); // high case fits the scale
  }
});
test('cashflow is not proportional to revenue when costs and debt stay fixed', () => {
  const inputs = {price:200000, equity:45000, priceNight:200, occupancy:70, expenses:800};
  const base = calculateROI(inputs);
  const stressed = calculateROI({...inputs, priceNight:160});
  assert.notEqual(Math.round(stressed.netAfterMortgage), Math.round(base.netAfterMortgage * .8));
  assert.doesNotMatch(source, /value:\s*profit\s*\*\s*(0\.8|1\.2)/);
  assert.match(source, /cashflow riportato sopra appartiene solo allo scenario base/);
});
