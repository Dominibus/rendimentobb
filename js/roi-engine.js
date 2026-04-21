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
  let risk = 75;

  if(roi >= 15) risk = 25;
  else if(roi >= 10) risk = 40;
  else if(roi >= 6) risk = 60;
  else risk = 80;

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
    taxCost: clean(taxCost),

    mortgageYearly: clean(mortgageYearly),

    netAfterMortgage: clean(netAfterMortgage),
    profit: clean(netAfterMortgage),

    roi: clean(roi),

    monthlyProfit: clean(monthlyProfit),
    breakEvenYears: clean(breakEvenYears),
    profitMargin: clean(profitMargin),

    occupancy: clean(occupancy),
    priceNight: clean(adr),

    risk: clean(risk)
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
