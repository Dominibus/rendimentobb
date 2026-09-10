// ===============================================
// RENDIMENTOBB – ROI ENGINE PRODUCTION
// Silicon Valley grade – Stable / Safe / Predictable
// ===============================================

import { calculateMortgage } from "./mortgage-engine.js";

// ================= CORE ENGINE =================
function calculateROI(input = {}){

  // ================= SAFE PARSER =================
  const safe = (v, def = 0) => {
    const n = Number(v);
    return isNaN(n) ? def : n;
  };

  const safePositive = (v, def = 0) => {
    const n = safe(v, def);
    return n < 0 ? def : n;
  };

  // ================= INPUT =================
  const price        = safePositive(input.price, 100000);
  const equity       = safePositive(input.equity, 0);
  const loanAmount   = safePositive(input.loanAmount, price - equity);

  const priceNight   = safePositive(input.priceNight, 100);
  const occupancy    = Math.min(100, safePositive(input.occupancy, 65));

  const expenses     = safePositive(input.expenses, 30);
  const commission   = safePositive(input.commission, 15);
  const tax          = safePositive(input.tax, 21);

  const interestRate = safePositive(input.interestRate, 3.5);
  const loanYears    = safePositive(input.loanYears, 20);

  // ================= CORE CALC =================
  const nights = 365 * (occupancy / 100);
  const gross = priceNight * nights;

  const fees = gross * (commission / 100);

  // 🔥 gestione smart expenses
  let yearlyExpenses = 0;
  if(expenses <= 100){
    yearlyExpenses = gross * (expenses / 100);
  } else {
    yearlyExpenses = expenses * 12;
  }

  const operatingProfit = gross - fees - yearlyExpenses;

  // Canonical property metrics: financing and income taxes are excluded.
  const netOperatingIncome = operatingProfit;

  const capRate =
    price > 0
      ? (netOperatingIncome / price) * 100
      : 0;

  const taxCost =
    operatingProfit > 0
      ? operatingProfit * (tax / 100)
      : 0;

  // ================= MORTGAGE =================
  let mortgageYearly = 0;

  try{
    mortgageYearly =
      calculateMortgage(loanAmount, interestRate, loanYears) || 0;
  }catch(e){
    console.warn("⚠️ Mortgage fallback", e);
    mortgageYearly = 0;
  }

  const netAfterMortgage =
    operatingProfit - taxCost - mortgageYearly;

  // ================= ROI =================
  const roi =
    equity > 0
      ? (netAfterMortgage / equity) * 100
      : 0;

  const realROI =
  price > 0
    ? (netAfterMortgage / price) * 100
    : 0;

  // ================= KPI =================
  const monthlyProfit = netAfterMortgage / 12;

  const breakEvenYears =
    netAfterMortgage > 0 && equity > 0
      ? equity / netAfterMortgage
      : 0;

  const profitMargin =
    gross > 0
      ? (netAfterMortgage / gross) * 100
      : 0;

  const adr = priceNight;

  // ================= RISK =================
  // Canonical composite risk: 10-point prudential floor plus
  // profitability, demand, leverage, debt coverage and cashflow.
  const ltv =
    price > 0
      ? (loanAmount / price) * 100
      : 0;

  const dscr =
    mortgageYearly > 0
      ? netOperatingIncome / mortgageYearly
      : 0;

  const roiRisk =
    roi < 0 ? 25 :
    roi < 6 ? 20 :
    roi < 10 ? 15 :
    roi < 15 ? 10 :
    roi < 20 ? 5 :
    0;

  const occupancyRisk =
    occupancy < 45 ? 20 :
    occupancy < 55 ? 15 :
    occupancy < 65 ? 10 :
    occupancy < 75 ? 5 :
    0;

  const leverageRisk =
    loanAmount <= 0 ? 0 :
    ltv >= 80 ? 10 :
    ltv >= 70 ? 8 :
    ltv >= 60 ? 5 :
    2;

  const debtCoverageRisk =
    mortgageYearly <= 0 ? 0 :
    dscr < 1 ? 20 :
    dscr < 1.2 ? 15 :
    dscr < 1.5 ? 10 :
    dscr < 2 ? 5 :
    0;

  const cashflowRisk =
    netAfterMortgage < 0 ? 10 :
    netAfterMortgage < 2400 ? 6 :
    netAfterMortgage < 6000 ? 3 :
    0;

  const riskBreakdown = {
    base: 10,
    roi: roiRisk,
    occupancy: occupancyRisk,
    leverage: leverageRisk,
    debtCoverage: debtCoverageRisk,
    cashflow: cashflowRisk
  };

  const risk = Math.min(
    100,
    Object.values(riskBreakdown).reduce(
      (total, value) => total + value,
      0
    )
  );

  // ================= SAFETY =================
  const clean = (v) => isFinite(v) ? v : 0;

  const result = {
    price: clean(price),
    equity: clean(equity),
    loan: clean(loanAmount),

    gross: clean(gross),
    revenue: clean(gross),

    fees: clean(fees),
    expensesYearly: clean(yearlyExpenses),

    operatingProfit: clean(operatingProfit),
    noi: clean(netOperatingIncome),
    netOperatingIncome: clean(netOperatingIncome),
    capRate: clean(capRate),
    taxCost: clean(taxCost),

    mortgageYearly: clean(mortgageYearly),
    annualDebtService: clean(mortgageYearly),

    netAfterMortgage: clean(netAfterMortgage),
    profit: clean(netAfterMortgage),

    roi: clean(roi),
    realROI: clean(realROI),

    monthlyProfit: clean(monthlyProfit),
    breakEvenYears: clean(breakEvenYears),
    profitMargin: clean(profitMargin),

    occupancy: clean(occupancy),
    priceNight: clean(adr),

    ltv: clean(ltv),
    dscr: clean(dscr),
    risk: clean(risk),
    riskBreakdown
  };

  if(!result || typeof result !== "object"){
    console.error("⛔ ROI ENGINE FAILED");
    return {};
  }

  return result;
}

// ================= EXPORT (MODERN) =================
export { calculateROI };

// ================= GLOBAL FIX (CRITICO) =================
window.calculateROI = calculateROI;
