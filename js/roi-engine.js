import { calculateMortgage } from "./mortgage-engine.js";

export function calculateROI(input = {}){

  // ================= SAFE INPUT =================
  const safe = (v, def = 0) => {
    const n = Number(v);
    return isNaN(n) ? def : n;
  };

  const priceNight   = safe(input.priceNight, 100);
  const occupancy    = safe(input.occupancy, 65);
  const expenses     = safe(input.expenses, 30);
  const commission   = safe(input.commission, 15);
  const tax          = safe(input.tax, 21);
  const equity       = safe(input.equity, 0);
  const loanAmount   = safe(input.loanAmount, 0);
  const interestRate = safe(input.interestRate, 3.5);
  const loanYears    = safe(input.loanYears, 20);

  // ================= CORE CALC =================

  const mortgageYearly =
    calculateMortgage(loanAmount, interestRate, loanYears) || 0;

  const nights = 365 * (occupancy / 100);

  const gross = priceNight * nights;

  const fees = gross * (commission / 100);

  const yearlyExpenses = expenses * 12;

  const operatingProfit = gross - fees - yearlyExpenses;

  const taxCost =
    operatingProfit > 0
      ? operatingProfit * (tax / 100)
      : 0;

  const netAfterMortgage =
    operatingProfit - taxCost - mortgageYearly;

  const roi =
    equity > 0
      ? (netAfterMortgage / equity) * 100
      : 0;

  // ================= EXTRA KPI (SaaS LEVEL) =================

  const monthlyProfit = netAfterMortgage / 12;

  const breakEvenYears =
    netAfterMortgage > 0 && equity > 0
      ? equity / netAfterMortgage
      : 0;

  const profitMargin =
    gross > 0
      ? (netAfterMortgage / gross) * 100
      : 0;

  const occupancyRate = occupancy;

  const adr = priceNight;

  // ================= RISK SCORE =================

  let risk = 75;

  if(roi > 12) risk = 30;
  else if(roi > 6) risk = 55;

  // ================= SAFETY FINAL =================

  const safeNum = (v) => isFinite(v) ? v : 0;

  return {

    // CORE
    gross: safeNum(gross),
    fees: safeNum(fees),
    operatingProfit: safeNum(operatingProfit),
    taxCost: safeNum(taxCost),
    mortgageYearly: safeNum(mortgageYearly),
    netAfterMortgage: safeNum(netAfterMortgage),
    roi: safeNum(roi),

    // EXTRA (🔥 QUESTO TI SBLOCCA UI)
    revenue: safeNum(gross),
    profit: safeNum(netAfterMortgage),
    monthlyProfit: safeNum(monthlyProfit),
    breakEvenYears: safeNum(breakEvenYears),
    profitMargin: safeNum(profitMargin),

    // MARKET DATA READY
    occupancy: safeNum(occupancyRate),
    priceNight: safeNum(adr),

    // RISK
    risk: safeNum(risk)

  };

}
