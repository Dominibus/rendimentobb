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
  window.history.replaceState({}, document.title, window.location.pathname);
}

// ===============================
// STRIPE LINK
// ===============================

const STRIPE_PAYMENT_LINK =
  "https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200";

function unlockPro() {
  const locale = currentLang === "it" ? "it" : "en";
  window.location.href =
    STRIPE_PAYMENT_LINK +
    "?locale=" +
    locale +
    "&success_url=" +
    encodeURIComponent("https://rendimentobb.com/tool/?pro=paid");
}

function formatCurrency(value) {
  if (!isFinite(value)) value = 0;
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

let lastAnalysisData = null;

// ===============================
// CALCOLO MUTUO
// ===============================

function calculateMortgage(loanAmount, interestRate, loanYears) {

  if (!loanAmount || !interestRate || !loanYears) {
    return { monthlyPayment: 0, yearlyPayment: 0 };
  }

  const monthlyRate = (interestRate / 100) / 12;
  const totalPayments = loanYears * 12;

  const monthlyPayment =
    loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  return {
    monthlyPayment: monthlyPayment,
    yearlyPayment: monthlyPayment * 12
  };
}

// ===============================
// CALCULATE
// ===============================

function calculate() {

  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  runRealCalculation();
}

// ===============================
// REAL CALCULATION
// ===============================

function runRealCalculation() {

  const propertyPrice = getValue("propertyPrice");
  const equity = getValue("equity");

  const loanAmount = getValue("loanAmount");
  const interestRate = getValue("interestRate");
  const loanYears = getValue("loanYears");

  const price = getValue("price");
  const occupancy = getValue("occupancy");
  const expenses = getValue("expenses");
  const commission = getValue("commission");
  const tax = getValue("tax");

  const resultsDiv = document.getElementById("results");

  if (!price || !occupancy || !equity) {
    resultsDiv.innerHTML = "Inserisci valori validi.";
    return;
  }

  const nightsPerMonth = 30 * (occupancy / 100);
  const grossYearly = price * nightsPerMonth * 12;
  const yearlyFees = grossYearly * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const profitBeforeTax = grossYearly - yearlyFees - yearlyExpenses;
  const taxCost = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
  let netYearly = profitBeforeTax - taxCost;

  const mortgage = calculateMortgage(loanAmount, interestRate, loanYears);
  const netAfterMortgage = netYearly - mortgage.yearlyPayment;

  let baseROI = (netAfterMortgage / equity) * 100;
  if (!isFinite(baseROI)) baseROI = 0;

  let output = `
    <div class="result-card">
      <h4>📊 Analisi Base</h4>
      <div>Fatturato annuo: <strong>${formatCurrency(grossYearly)}</strong></div>
      <div>Utile netto operativo: <strong>${formatCurrency(netYearly)}</strong></div>
      <div>Rata annua mutuo: <strong>${formatCurrency(mortgage.yearlyPayment)}</strong></div>
      <div>Utile netto dopo mutuo: <strong>${formatCurrency(netAfterMortgage)}</strong></div>
      <div>ROI con leva finanziaria: <strong>${baseROI.toFixed(2)}%</strong></div>
    </div>
  `;

  if (!isProUnlocked) {
    resultsDiv.innerHTML = output;
    return;
  }

  const roi5Years = baseROI * 5;
  const breakEvenYears = netAfterMortgage > 0 ? equity / netAfterMortgage : 0;

  // ===============================
  // RISK SCORE ENGINE
  // ===============================

  const loanRatio = propertyPrice ? (loanAmount / propertyPrice) * 100 : 0;

  let riskPoints = 0;

  if (baseROI < 8) riskPoints += 2;
  else if (baseROI < 15) riskPoints += 1;

  if (breakEvenYears > 10) riskPoints += 2;
  else if (breakEvenYears > 6) riskPoints += 1;

  if (loanRatio > 85) riskPoints += 2;
  else if (loanRatio > 70) riskPoints += 1;

  if (occupancy < 55) riskPoints += 2;
  else if (occupancy < 65) riskPoints += 1;

  let riskLabel = "LOW";
  let riskColor = "#22c55e";

  if (riskPoints >= 6) {
    riskLabel = "HIGH";
    riskColor = "#ef4444";
  } else if (riskPoints >= 3) {
    riskLabel = "MEDIUM";
    riskColor = "#f59e0b";
  }

  lastAnalysisData = {
    propertyPrice,
    equity,
    loanAmount,
    interestRate,
    loanYears,
    grossYearly,
    netYearly,
    mortgageYearly: mortgage.yearlyPayment,
    netAfterMortgage,
    baseROI,
    roi5Years,
    breakEvenYears,
    riskLabel
  };

  output += `
    <div class="result-card">
      <h4>📊 Analisi Strategica PRO</h4>
      <div>ROI 5 anni: <strong>${roi5Years.toFixed(2)}%</strong></div>
      <div>Break-even reale: <strong>${breakEvenYears ? breakEvenYears.toFixed(1) : "-"} anni</strong></div>

      <div style="
        margin-top:18px;
        padding:14px;
        border-radius:12px;
        background:rgba(255,255,255,0.03);
        border:1px solid rgba(255,255,255,0.08);
      ">
        <div style="font-size:13px; opacity:0.7;">Investment Risk Score</div>
        <div style="
          font-size:22px;
          font-weight:700;
          color:${riskColor};
          margin-top:6px;
        ">
          ${riskLabel}
        </div>
      </div>

      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 Genera Report PDF Professionale
      </button>
    </div>
  `;

  resultsDiv.innerHTML = output;
}

// ===============================
// GENERAZIONE PDF
// ===============================

async function generatePDF() {

  if (!lastAnalysisData) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const margin = 20;
  let y = 25;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("RendimentoBB - Report Professionale", margin, y);

  y += 12;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const lines = [
    `Prezzo immobile: ${formatCurrency(lastAnalysisData.propertyPrice)}`,
    `Capitale proprio: ${formatCurrency(lastAnalysisData.equity)}`,
    `Importo mutuo: ${formatCurrency(lastAnalysisData.loanAmount)}`,
    `Tasso: ${lastAnalysisData.interestRate}%`,
    `Durata: ${lastAnalysisData.loanYears} anni`,
    "",
    `Fatturato annuo: ${formatCurrency(lastAnalysisData.grossYearly)}`,
    `Utile netto operativo: ${formatCurrency(lastAnalysisData.netYearly)}`,
    `Utile netto dopo mutuo: ${formatCurrency(lastAnalysisData.netAfterMortgage)}`,
    "",
    `ROI con leva: ${lastAnalysisData.baseROI.toFixed(2)}%`,
    `ROI 5 anni: ${lastAnalysisData.roi5Years.toFixed(2)}%`,
    `Break-even: ${lastAnalysisData.breakEvenYears ? lastAnalysisData.breakEvenYears.toFixed(1) : "-"} anni`,
    "",
    `Investment Risk Score: ${lastAnalysisData.riskLabel}`
  ];

  lines.forEach(line => {
    pdf.text(line, margin, y);
    y += 7;
  });

  pdf.save("Report_RendimentoBB_Pro.pdf");
}
