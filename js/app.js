// ===============================
// RENDIMENTOBB – EXECUTIVE ENGINE 3.6 FINAL WORKING
// STABLE CALCULATION + PDF BUTTON RESTORED
// ===============================

if (!window.currentLang) {
  window.currentLang = localStorage.getItem("rb_lang") || "it";
}

function formatCurrency(value) {
  if (!isFinite(value)) value = 0;
  return new Intl.NumberFormat(
    window.currentLang === "it" ? "it-IT" : "en-US",
    { style: "currency", currency: "EUR" }
  ).format(value);
}

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

window.lastAnalysisData = null;

// ===============================
// KPI CARD
// ===============================

function kpiCard(label, value) {
  return `
    <div style="
      background:white;
      padding:20px;
      border-radius:16px;
      box-shadow:0 10px 30px rgba(0,0,0,.08);">
      <div style="font-size:12px;color:#64748b;">${label}</div>
      <div style="font-size:22px;font-weight:700;margin-top:6px;">${value}</div>
    </div>
  `;
}

// ===============================
// MORTGAGE
// ===============================

function calculateMortgage(loanAmount, interestRate, loanYears) {

  if (!loanAmount || !loanYears) {
    return { yearlyPayment: 0 };
  }

  if (interestRate === 0) {
    return { yearlyPayment: loanAmount / loanYears };
  }

  const monthlyRate = (interestRate / 100) / 12;
  const totalPayments = loanYears * 12;

  const monthlyPayment =
    loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  return {
    yearlyPayment: monthlyPayment * 12
  };
}

// ===============================
// MAIN CALCULATION
// ===============================

function calculate() {
  runRealCalculation();
}

function runRealCalculation() {

  const equity = getValue("equity");
  const priceNight = getValue("price");
  const occupancy = getValue("occupancy");
  const expenses = getValue("expenses");
  const commission = getValue("commission");
  const tax = getValue("tax");
  const loanAmount = getValue("loanAmount");
  const interestRate = getValue("interestRate");
  const loanYears = getValue("loanYears");

  const resultsDiv = document.getElementById("results");

  if (!priceNight || !occupancy || equity <= 0) {
    resultsDiv.innerHTML = "Insert valid values.";
    return;
  }

  const nightsPerMonth = 30.42 * (occupancy / 100);
  const grossYearly = priceNight * nightsPerMonth * 12;

  const yearlyFees = grossYearly * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const profitBeforeTax = grossYearly - yearlyFees - yearlyExpenses;
  const taxCost = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
  const netYearly = profitBeforeTax - taxCost;

  const mortgage = calculateMortgage(loanAmount, interestRate, loanYears);
  const netAfterMortgage = netYearly - mortgage.yearlyPayment;

  let baseROI = (netAfterMortgage / equity) * 100;
  if (!isFinite(baseROI)) baseROI = 0;

  let breakEvenYears = netAfterMortgage > 0
    ? equity / netAfterMortgage
    : 99;

  const stressNet = netAfterMortgage * 0.85;
  let pessimisticROI = (stressNet / equity) * 100;
  if (!isFinite(pessimisticROI)) pessimisticROI = 0;

  const fiveYearProjection = netAfterMortgage * 5;

  let riskScore = 50;

  if (baseROI < 4) riskScore += 25;
  if (baseROI > 15) riskScore -= 20;
  if (breakEvenYears > 15) riskScore += 20;
  if (breakEvenYears < 8) riskScore -= 15;
  if (occupancy < 55) riskScore += 15;
  if (occupancy > 75) riskScore -= 10;

  riskScore = Math.max(0, Math.min(100, riskScore));

  let grade;
  if (riskScore < 30) grade = "A";
  else if (riskScore < 50) grade = "B";
  else if (riskScore < 70) grade = "C";
  else grade = "D";

  window.lastAnalysisData = {
    baseROI,
    pessimisticROI,
    breakEvenYears,
    netAfterMortgage,
    fiveYearProjection,
    riskScore,
    grade
  };

  resultsDiv.innerHTML = `
    <div style="margin-bottom:20px;">
      <h3 style="font-size:18px;">Executive Investment Summary</h3>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:20px; margin-bottom:25px;">
      ${kpiCard("ROI", baseROI.toFixed(2) + "%")}
      ${kpiCard("Break-even", breakEvenYears.toFixed(1) + " yrs")}
      ${kpiCard("Stress ROI", pessimisticROI.toFixed(2) + "%")}
      ${kpiCard("Grade", grade)}
    </div>

    <div style="margin-bottom:20px;">
      <strong>Annual Net:</strong> ${formatCurrency(netAfterMortgage)}<br>
      <strong>5-Year Projection:</strong> ${formatCurrency(fiveYearProjection)}
    </div>

    <button onclick="generatePDF()" 
      style="background:#0f172a;color:white;padding:12px 20px;border-radius:10px;border:none;cursor:pointer;">
      📄 Download Executive PDF
    </button>
  `;
}

// ===============================
// EXECUTIVE PDF
// ===============================

function generatePDF() {

  if (!window.lastAnalysisData) {
    alert("Run analysis first.");
    return;
  }

  if (!window.jspdf) {
    alert("jsPDF not loaded.");
    return;
  }

  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF("p","mm","a4");
  const d = window.lastAnalysisData;

  const margin = 20;
  let y = 45;

  pdf.setFillColor(15,23,42);
  pdf.rect(0,0,210,35,"F");

  pdf.setTextColor(255,255,255);
  pdf.setFontSize(20);
  pdf.text("RendimentoBB", margin, 20);
  pdf.setFontSize(11);
  pdf.text("Executive Investment Report", margin, 28);

  pdf.setTextColor(0,0,0);
  pdf.setFontSize(14);
  pdf.text("Return on Investment (ROI)", margin, y);
  y += 12;

  pdf.setFontSize(34);
  pdf.text(d.baseROI.toFixed(2) + "%", margin, y);

  pdf.save("RendimentoBB_Strategic_Report.pdf");
}
