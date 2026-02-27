// ===============================
// SAFE LANGUAGE INIT
// ===============================

if (typeof currentLang === "undefined") {
  currentLang = "it";
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
  // BASE BUSINESS CALCULATION
  // =========================

  const nightsPerMonth = 30 * (occupancy / 100);
  const grossMonthly = price * nightsPerMonth;
  const grossYearly = grossMonthly * 12;

  const platformFeesYearly = grossYearly * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const profitBeforeTax = grossYearly - platformFeesYearly - yearlyExpenses;
  const taxCost = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;

  const netYearly = profitBeforeTax - taxCost;

  let baseROI = 0;
  if (equity > 0) {
    baseROI = (netYearly / equity) * 100;
  }

  let output = `
    ${isProUnlocked ? `
      <div style="background:#052e16;padding:12px;border-radius:8px;margin-bottom:15px;color:#86efac;font-size:13px;">
        ✅ Versione PRO attiva — Analisi completa disponibile
      </div>
    ` : ``}

    <div class="result-card">
      <h4>📊 ${currentLang === "it" ? "Analisi Base" : "Base Analysis"}</h4>
      <div>${currentLang === "it" ? "Fatturato annuo:" : "Yearly revenue:"}
      <strong>${formatCurrency(grossYearly)}</strong></div>

      <div>${currentLang === "it" ? "Utile netto annuo:" : "Net yearly profit:"}
      <strong>${formatCurrency(netYearly)}</strong></div>

      <div>${currentLang === "it" ? "ROI base:" : "Base ROI:"}
      <strong>${baseROI.toFixed(2)}%</strong></div>
    </div>
  `;

  // =========================
  // BLOCCO PRO
  // =========================

  if (!isProUnlocked) {
    output += `
      <div style="margin-top:20px;padding:20px;background:#111827;border-radius:12px;border:1px solid #334155;color:#e2e8f0;">
        <h3 style="margin-top:0;color:#22c55e;">🔒 ${currentLang === "it" ? "Analisi Completa Bloccata" : "Full Analysis Locked"}</h3>
        <p style="font-size:14px;">
          ${currentLang === "it" ? 
          "19€ per evitare un errore da 50.000€." : 
          "€19 to avoid a €50,000 mistake."}
        </p>
        <button onclick="unlockPro()" 
          style="width:100%;margin-top:15px;padding:12px;border:none;border-radius:8px;background:#22c55e;color:black;font-weight:bold;cursor:pointer;">
          🔓 ${currentLang === "it" ? "Sblocca Analisi Completa – 19€" : "Unlock Full Analysis – €19"}
        </button>
      </div>
    `;

    resultsDiv.innerHTML = output;
    resultsDiv.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // =========================
  // LOAN CALCULATION
  // =========================

  let yearlyLoanCost = 0;

  if (loanAmount > 0 && loanRate > 0 && loanYears > 0) {
    const monthlyRate = (loanRate / 100) / 12;
    const totalPayments = loanYears * 12;

    const monthlyLoan =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    yearlyLoanCost = monthlyLoan * 12;
  }

  const realYearlyCashflow = netYearly - yearlyLoanCost;

  let roi = 0;
  let breakEvenYears = 0;

  if (equity > 0) {
    roi = (realYearlyCashflow / equity) * 100;
    if (realYearlyCashflow > 0) {
      breakEvenYears = equity / realYearlyCashflow;
    }
  }

  // =========================
  // STRESS TEST
  // =========================

  const stressedOcc = occupancy - (occupancy * stressOccupancy / 100);
  const stressedExp = expenses + (expenses * stressExpenses / 100);

  const stressedGrossYearly = (price * 30 * (stressedOcc / 100)) * 12;
  const stressedFees = stressedGrossYearly * (commission / 100);
  const stressedProfit = stressedGrossYearly - stressedFees - (stressedExp * 12);
  const stressedTax = stressedProfit > 0 ? stressedProfit * (tax / 100) : 0;
  const stressedNet = stressedProfit - stressedTax;

  const stressedCashflow = stressedNet - yearlyLoanCost;

  // =========================
  // RISK SCORE
  // =========================

  let riskScore = 100;

  if (realYearlyCashflow < 0) riskScore -= 30;
  if (roi < 5) riskScore -= 15;
  if (breakEvenYears > 20) riskScore -= 15;
  if (stressedCashflow < 0) riskScore -= 20;

  if (familyIncome > 0 && yearlyLoanCost / (familyIncome * 12) > 0.35)
    riskScore -= 20;

  if (riskScore < 0) riskScore = 0;

  let riskLabel =
    riskScore >= 80
      ? (currentLang === "it" ? "Investimento Solido" : "Solid Investment")
      : riskScore >= 60
      ? (currentLang === "it" ? "Zona Attenzione" : "Caution Zone")
      : (currentLang === "it" ? "Investimento Rischioso" : "High Risk");

  let riskColor =
    riskScore >= 80 ? "#16a34a"
    : riskScore >= 60 ? "#eab308"
    : "#dc2626";

  output += `
    <div class="result-card">
      <h4>📊 ${currentLang === "it" ? "Analisi Completa" : "Full Analysis"}</h4>
      <div>ROI reale: <strong>${roi.toFixed(2)}%</strong></div>
      <div>Cashflow annuo reale:
      <strong>${formatCurrency(realYearlyCashflow)}</strong></div>
      <div>Break-even:
      <strong>${breakEvenYears > 0 ? breakEvenYears.toFixed(1) : "-"}</strong> anni</div>
      <div>Scenario pessimistico:
      <strong>${formatCurrency(stressedCashflow)}</strong></div>
    </div>

    <div style="margin-top:15px;padding:14px;border-radius:8px;background:${riskColor};color:white;font-weight:bold;">
      Indice Rischio: ${riskScore}/100 — ${riskLabel}
    </div>
  `;

  resultsDiv.innerHTML = output;
  resultsDiv.scrollIntoView({ behavior: "smooth" });
}
