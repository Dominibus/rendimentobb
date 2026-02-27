// ===============================
// SAFE LANGUAGE INIT
// ===============================

if (typeof currentLang === "undefined") {
  var currentLang = "it";
}

// ===============================
// PRO STATUS INIT
// ===============================

let isProUnlocked = localStorage.getItem("proUnlocked") === "true";

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("pro") === "paid") {
  isProUnlocked = true;
  localStorage.setItem("proUnlocked", "true");
}

// 🔥 INSERISCI QUI IL TUO LINK STRIPE LIVE
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200";

// ===============================
// UNLOCK PRO
// ===============================

function unlockPro() {
  window.location.href = STRIPE_PAYMENT_LINK;
}

// ===============================
// FORMAT CURRENCY
// ===============================

function formatCurrency(value) {
  if (!isFinite(value)) value = 0;

  return new Intl.NumberFormat(
    currentLang === "it" ? "it-IT" : "en-US",
    {
      style: "currency",
      currency: "EUR"
    }
  ).format(value);
}

// ===============================
// SAFE VALUE GETTER
// ===============================

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

// ===============================
// CALCULATE
// ===============================

function calculate() {

  const price = getValue("price");
  const occupancy = getValue("occupancy");
  const expenses = getValue("expenses");
  const commission = getValue("commission");
  const tax = getValue("tax");

  const equity = getValue("equity");
  const loanAmount = getValue("loanAmount");
  const loanRate = getValue("loanRate");
  const loanYears = getValue("loanYears");

  const familyIncome = getValue("familyIncome");
  const stressOccupancy = getValue("stressOccupancy");
  const stressExpenses = getValue("stressExpenses");
  const stressRate = getValue("stressRate");

  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  if (!price || !occupancy) {
    resultsDiv.innerHTML =
      currentLang === "it"
        ? "Inserisci valori validi."
        : "Please enter valid values.";
    return;
  }

  // =========================
  // BASE BUSINESS
  // =========================

  const nights = 30 * (occupancy / 100);
  const gross = price * nights;
  const platformFees = gross * (commission / 100);
  const profitBeforeTax = gross - expenses - platformFees;
  const taxes = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
  const netMonthly = profitBeforeTax - taxes;
  const netYearly = netMonthly * 12;

  let output = `
    ${isProUnlocked ? `
      <div style="background:#052e16;padding:12px;border-radius:8px;margin-bottom:15px;color:#86efac;font-size:13px;">
        ✅ Versione PRO attiva — Analisi completa disponibile
      </div>
    ` : ``}

    <div class="result-card">
      <h4>${currentLang === "it" ? "📊 Risultato Base" : "📊 Base Result"}</h4>
      <div>
        ${currentLang === "it" ? "Guadagno netto annuo:" : "Net yearly profit:"}
        <strong>${formatCurrency(netYearly)}</strong>
      </div>
    </div>
  `;

  // =========================
  // BLOCCO PRO
  // =========================

  if (!isProUnlocked) {
    output += `
      <div style="margin-top:20px;padding:20px;background:#111827;border-radius:12px;border:1px solid #334155;color:#e2e8f0;">
        <h3 style="margin-top:0;color:#22c55e;">🔒 Analisi Completa Bloccata</h3>
        <p style="font-size:14px;">
          19€ per evitare un errore da 50.000€.
        </p>
        <button onclick="unlockPro()" 
          style="width:100%;margin-top:15px;padding:12px;border:none;border-radius:8px;background:#22c55e;color:black;font-weight:bold;cursor:pointer;">
          🔓 Sblocca Analisi Completa – 19€
        </button>
      </div>
    `;

    resultsDiv.innerHTML = output;
    return;
  }

  // =========================
  // LOAN CALCULATION
  // =========================

  let monthlyLoanPayment = 0;

  if (loanAmount > 0 && loanRate > 0 && loanYears > 0) {
    const monthlyRate = (loanRate / 100) / 12;
    const totalPayments = loanYears * 12;

    monthlyLoanPayment =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }

  const realYearlyCashflow = netYearly - (monthlyLoanPayment * 12);

  let roi = 0;
  let breakEvenYears = 0;

  if (equity > 0) {
    roi = (realYearlyCashflow / equity) * 100;
    if (realYearlyCashflow > 0) {
      breakEvenYears = equity / realYearlyCashflow;
    }
  }

  // =========================
  // STRESS TEST (corretto)
  // =========================

  const stressedOcc = occupancy - (occupancy * stressOccupancy / 100);
  const stressedExp = expenses + (expenses * stressExpenses / 100);
  const stressedRate = loanRate + stressRate;

  const stressedNights = 30 * (stressedOcc / 100);
  const stressedGross = price * stressedNights;
  const stressedFees = stressedGross * (commission / 100);
  const stressedProfit = stressedGross - stressedExp - stressedFees;
  const stressedTaxes = stressedProfit > 0 ? stressedProfit * (tax / 100) : 0;
  const stressedNetYearly = (stressedProfit - stressedTaxes) * 12;

  let stressedLoan = 0;

  if (loanAmount > 0 && stressedRate > 0 && loanYears > 0) {
    const mRate = (stressedRate / 100) / 12;
    const totalPayments = loanYears * 12;

    stressedLoan =
      loanAmount *
      (mRate * Math.pow(1 + mRate, totalPayments)) /
      (Math.pow(1 + mRate, totalPayments) - 1);
  }

  const stressedCashflow = stressedNetYearly - (stressedLoan * 12);

  // =========================
  // RISK SCORE
  // =========================

  let riskScore = 100;

  if (realYearlyCashflow < 0) riskScore -= 30;
  if (roi < 0) riskScore -= 25;
  else if (roi < 5) riskScore -= 15;
  if (breakEvenYears > 20) riskScore -= 15;
  if (stressedCashflow < 0) riskScore -= 20;
  if (familyIncome > 0 && monthlyLoanPayment / familyIncome > 0.35)
    riskScore -= 20;

  if (riskScore < 0) riskScore = 0;

  let riskLabel =
    riskScore >= 80
      ? "Investimento Solido"
      : riskScore >= 60
      ? "Zona Attenzione"
      : "Investimento Rischioso";

  let riskColor =
    riskScore >= 80
      ? "#16a34a"
      : riskScore >= 60
      ? "#eab308"
      : "#dc2626";

  // =========================
  // OUTPUT COMPLETO
  // =========================

  output += `
    <div class="result-card">
      <h4>📊 Analisi Completa</h4>
      <div>ROI: <strong>${roi.toFixed(2)}%</strong></div>
      <div>Cashflow reale annuo:
      <strong>${formatCurrency(realYearlyCashflow)}</strong></div>
      <div>Break-even (anni):
      <strong>${breakEvenYears > 0 ? breakEvenYears.toFixed(1) : "-"}</strong></div>
      <div>Scenario pessimistico:
      <strong>${formatCurrency(stressedCashflow)}</strong></div>
    </div>

    <div style="margin-top:15px;padding:14px;border-radius:8px;background:${riskColor};color:white;font-weight:bold;">
      Indice Rischio: ${riskScore}/100 — ${riskLabel}
    </div>
  `;

  resultsDiv.innerHTML = output;
}
