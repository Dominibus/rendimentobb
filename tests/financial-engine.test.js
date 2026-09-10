import test from "node:test";
import assert from "node:assert/strict";

globalThis.window = {};

const { calculateROI } = await import("../js/roi-engine.js");
const {
  calculateMortgage,
  mortgageSimulation,
  compareMortgages
} = await import("../js/mortgage-engine.js");

const closeTo = (actual, expected, tolerance = 0.01) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`
  );
};

const standardInput = {
  price: 150000,
  equity: 30000,
  loanAmount: 120000,
  priceNight: 150,
  occupancy: 70,
  expenses: 800,
  commission: 15,
  tax: 21,
  interestRate: 3.5,
  loanYears: 20
};

test("certified standard scenario remains stable", () => {
  const result = calculateROI(standardInput);

  closeTo(result.roi, 32.6661);
  closeTo(result.realROI, 6.5332);
  closeTo(result.netAfterMortgage, 9799.82);
  closeTo(result.monthlyProfit, 816.65);
  closeTo(result.noi, 22976.25);
  closeTo(result.capRate, 15.3175);
  closeTo(result.dscr, 2.7512);
  assert.equal(result.risk, 25);
  assert.deepEqual(result.riskBreakdown, {
    base: 10,
    roi: 0,
    occupancy: 5,
    leverage: 10,
    debtCoverage: 0,
    cashflow: 0
  });
});

test("NOI, Cap Rate and DSCR obey their canonical identities", () => {
  const result = calculateROI(standardInput);
  const expectedNOI = result.gross - result.fees - result.expensesYearly;

  closeTo(result.noi, expectedNOI, 1e-8);
  closeTo(result.netOperatingIncome, expectedNOI, 1e-8);
  closeTo(result.capRate, (result.noi / result.price) * 100, 1e-8);
  closeTo(result.dscr, result.noi / result.annualDebtService, 1e-8);
  closeTo(result.annualDebtService, result.mortgageYearly, 1e-8);
});

test("stress scenario remains negative and high risk", () => {
  const result = calculateROI({
    ...standardInput,
    price: 180000,
    loanAmount: 150000,
    priceNight: 160,
    occupancy: 40
  });

  closeTo(result.netAfterMortgage, -2337.03);
  closeTo(result.noi, 10256);
  closeTo(result.capRate, 5.6978);
  closeTo(result.dscr, 0.9824);
  assert.equal(result.risk, 95);
  assert.equal(result.riskBreakdown.debtCoverage, 20);
});

test("zero-interest mortgage amortizes principal without interest", () => {
  closeTo(calculateMortgage(120000, 0, 20), 6000, 1e-8);

  const detail = mortgageSimulation(120000, 0, 20);
  closeTo(detail.monthlyPayment, 500, 1e-8);
  closeTo(detail.totalPaid, 120000, 1e-8);
  closeTo(detail.totalInterest, 0, 1e-8);

  const comparison = compareMortgages(120000, 20, [
    { name: "Zero", rate: 0 },
    { name: "Standard", rate: 3.5 }
  ]);
  assert.equal(comparison.length, 2);
  closeTo(comparison[0].yearlyCost, 6000, 1e-8);
});

test("all-cash investment has no debt service or DSCR penalty", () => {
  const result = calculateROI({
    ...standardInput,
    equity: 150000,
    loanAmount: 0
  });

  assert.equal(result.loan, 0);
  assert.equal(result.annualDebtService, 0);
  assert.equal(result.dscr, 0);
  assert.equal(result.riskBreakdown.leverage, 0);
  assert.equal(result.riskBreakdown.debtCoverage, 0);
});

test("explicit zero commission and tax remain valid inputs", () => {
  const result = calculateROI({
    ...standardInput,
    commission: 0,
    tax: 0
  });

  assert.equal(result.fees, 0);
  assert.equal(result.taxCost, 0);
  closeTo(result.noi, result.gross - result.expensesYearly, 1e-8);
  assert.ok(result.netAfterMortgage > 9799.82);
});

test("consecutive simulations never inherit previous values", () => {
  const strong = calculateROI(standardInput);
  const weak = calculateROI({
    ...standardInput,
    occupancy: 40
  });
  const restored = calculateROI(standardInput);

  assert.ok(weak.roi < strong.roi);
  assert.ok(weak.netAfterMortgage < strong.netAfterMortgage);
  assert.ok(weak.risk > strong.risk);
  closeTo(restored.roi, strong.roi, 1e-8);
  closeTo(restored.netAfterMortgage, strong.netAfterMortgage, 1e-8);
  assert.deepEqual(restored.riskBreakdown, strong.riskBreakdown);
});

test("invalid and negative inputs never produce NaN or Infinity", () => {
  const result = calculateROI({
    price: "invalid",
    equity: -1,
    loanAmount: -1,
    priceNight: -1,
    occupancy: 200,
    expenses: -1,
    commission: -1,
    tax: -1,
    interestRate: -1,
    loanYears: -1
  });

  for(const [key, value] of Object.entries(result)){
    if(typeof value === "number"){
      assert.ok(Number.isFinite(value), `${key} must be finite`);
    }
  }
  assert.equal(result.occupancy, 100);
});
