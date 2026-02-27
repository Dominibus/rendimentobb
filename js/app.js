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
  const netYearly = profitBeforeTax - taxCost;

  const mortgage = calculateMortgage(loanAmount, interestRate, loanYears);
  const netAfterMortgage = netYearly - mortgage.yearlyPayment;

  let baseROI = (netAfterMortgage / equity) * 100;
  if (!isFinite(baseROI)) baseROI = 0;

  const roi5Years = baseROI * 5;
  const breakEvenYears = netAfterMortgage > 0 ? equity / netAfterMortgage : 0;

  // ===============================
  // SCENARIO PESSIMISTICO (-10% occupazione)
  // ===============================

  const pessimisticOccupancy = occupancy * 0.9;
  const pessimisticNights = 30 * (pessimisticOccupancy / 100);
  const pessimisticGross = price * pessimisticNights * 12;
  const pessimisticFees = pessimisticGross * (commission / 100);
  const pessimisticProfit = pessimisticGross - pessimisticFees - yearlyExpenses;
  const pessimisticTax = pessimisticProfit > 0 ? pessimisticProfit * (tax / 100) : 0;
  const pessimisticNet = pessimisticProfit - pessimisticTax - mortgage.yearlyPayment;
  const pessimisticROI = (pessimisticNet / equity) * 100;

  // ===============================
  // RISK ENGINE
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
  if (riskPoints >= 6) riskLabel = "HIGH";
  else if (riskPoints >= 3) riskLabel = "MEDIUM";

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
    pessimisticROI,
    riskLabel
  };

  resultsDiv.innerHTML = `
    <div class="result-card">
      <h4>📊 Analisi Strategica PRO</h4>
      <div>ROI annuo: <strong>${baseROI.toFixed(2)}%</strong></div>
      <div>Break-even: <strong>${breakEvenYears ? breakEvenYears.toFixed(1) : "-"} anni</strong></div>
      <div>Scenario pessimistico ROI: <strong>${pessimisticROI.toFixed(2)}%</strong></div>
      <div>Risk Score: <strong>${riskLabel}</strong></div>
      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 Genera Report Strategico Completo
      </button>
    </div>
  `;
}

// ===============================
// GENERAZIONE PDF STRATEGICO
// ===============================

async function generatePDF() {

  if (!lastAnalysisData) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const margin = 20;
  let y = 20;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("RendimentoBB - Strategic Investment Report", margin, y);

  y += 12;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const d = lastAnalysisData;

  const verdict =
    d.riskLabel === "LOW"
      ? "Operazione prudente con buona sostenibilità finanziaria."
      : d.riskLabel === "MEDIUM"
      ? "Operazione bilanciata ma sensibile a variazioni operative."
      : "Operazione speculativa con elevata esposizione al rischio.";

  const summaryText = `
EXECUTIVE SUMMARY

L'investimento analizzato genera un ROI annuo stimato del ${d.baseROI.toFixed(2)}%.
Il capitale investito verrebbe recuperato in circa ${d.breakEvenYears ? d.breakEvenYears.toFixed(1) : "-"} anni.

In uno scenario pessimistico (-10% occupazione), il ROI scenderebbe al ${d.pessimisticROI.toFixed(2)}%.

Livello di rischio stimato: ${d.riskLabel}

VERDETTO STRATEGICO:
${verdict}
`;

  const lines = pdf.splitTextToSize(summaryText, 170);
  pdf.text(lines, margin, y);

  y += lines.length * 6 + 10;

  pdf.setFont("helvetica", "bold");
  pdf.text("Dettaglio Finanziario", margin, y);

  y += 8;
  pdf.setFont("helvetica", "normal");

  const details = [
    `Prezzo immobile: ${formatCurrency(d.propertyPrice)}`,
    `Capitale proprio: ${formatCurrency(d.equity)}`,
    `Mutuo: ${formatCurrency(d.loanAmount)}`,
    `Fatturato annuo: ${formatCurrency(d.grossYearly)}`,
    `Utile netto operativo: ${formatCurrency(d.netYearly)}`,
    `Utile netto dopo mutuo: ${formatCurrency(d.netAfterMortgage)}`
  ];

  details.forEach(line => {
    pdf.text(line, margin, y);
    y += 7;
  });

  pdf.save("RendimentoBB_Strategic_Report.pdf");
}
