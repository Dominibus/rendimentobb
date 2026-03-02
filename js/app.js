// ===============================
// RENDIMENTOBB – EXECUTIVE ENGINE 3.1
// STABLE PREMIUM VERSION
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
let roiChartInstance = null;

// ===============================
// MORTGAGE
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
    monthlyPayment,
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
  const price = getValue("price");
  const occupancy = getValue("occupancy");
  const expenses = getValue("expenses");
  const commission = getValue("commission");
  const tax = getValue("tax");
  const loanAmount = getValue("loanAmount");
  const interestRate = getValue("interestRate");
  const loanYears = getValue("loanYears");

  const resultsDiv = document.getElementById("results");
  const chartCanvas = document.getElementById("roiChart");

  if (!price || !occupancy || !equity) {
    resultsDiv.innerHTML = "Insert valid values.";
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

  const breakEvenYears = netAfterMortgage > 0
    ? equity / netAfterMortgage
    : 99;

  const pessimisticROI = baseROI * 0.85;
  const fiveYearProjection = netAfterMortgage * 5;

  let riskScore = 50;

  if (baseROI < 4) riskScore += 25;
  if (baseROI > 12) riskScore -= 20;
  if (breakEvenYears > 15) riskScore += 20;
  if (breakEvenYears < 8) riskScore -= 15;
  if (occupancy < 55) riskScore += 15;
  if (occupancy > 75) riskScore -= 10;

  riskScore = Math.max(0, Math.min(100, riskScore));

  let riskLabel, badgeColor, strategicComment;

  if (riskScore >= 70) {
    riskLabel = "HIGH RISK";
    badgeColor = "#ef4444";
    strategicComment = "High exposure to operational volatility. Strategic review recommended.";
  } else if (riskScore >= 40) {
    riskLabel = "MODERATE RISK";
    badgeColor = "#f59e0b";
    strategicComment = "Sustainable but sensitive to market fluctuations.";
  } else {
    riskLabel = "LOW RISK";
    badgeColor = "#10b981";
    strategicComment = "Strong and resilient financial structure.";
  }

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
    riskLabel,
    grade,
    strategicComment
  };

  resultsDiv.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
      <h3 style="font-size:18px;">Executive Investment Summary</h3>
      <span style="
        background:${badgeColor};
        color:white;
        padding:6px 16px;
        border-radius:999px;
        font-size:12px;
        font-weight:700;">
        ${riskLabel}
      </span>
    </div>

    <div style="
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
      gap:20px;
      margin-bottom:25px;">

      ${kpiCard("ROI", baseROI.toFixed(2) + "%", baseROI)}
      ${kpiCard("Break-even", breakEvenYears.toFixed(1) + " yrs")}
      ${kpiCard("Stress ROI", pessimisticROI.toFixed(2) + "%")}
      ${kpiCard("Grade", grade)}

    </div>

    <div style="font-size:14px; line-height:1.8; margin-bottom:15px;">
      <strong>Annual Net:</strong> ${formatCurrency(netAfterMortgage)}<br>
      <strong>5-Year Projection:</strong> ${formatCurrency(fiveYearProjection)}
    </div>

    <button onclick="generatePDF()" class="btn-primary" style="margin-top:15px;">
      📄 Download Executive Report
    </button>
  `;

  if (!chartCanvas) return;
  if (roiChartInstance) roiChartInstance.destroy();

  roiChartInstance = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: ['Year 1','Year 2','Year 3','Year 4','Year 5'],
      datasets: [{
        data: [
          netAfterMortgage,
          netAfterMortgage*2,
          netAfterMortgage*3,
          netAfterMortgage*4,
          netAfterMortgage*5
        ],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.12)',
        borderWidth: 3,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

// ===============================
// KPI CARD
// ===============================

function kpiCard(label, value, roiValue = null) {

  let color = "#0f172a";

  if (roiValue !== null) {
    if (roiValue < 0) color = "#ef4444";
    else if (roiValue > 10) color = "#10b981";
  }

  return `
    <div style="
      background:white;
      padding:22px;
      border-radius:20px;
      box-shadow:0 20px 50px rgba(15,23,42,.08);">
      <div style="font-size:12px; color:#64748b;">${label}</div>
      <div style="font-size:24px; font-weight:800; margin-top:6px; color:${color};">
        ${value}
      </div>
    </div>
  `;
}

// ===============================
// STABLE SILICON PDF
// ===============================

function generatePDF() {

  if (!window.lastAnalysisData) {
    alert("Run analysis first.");
    return;
  }

  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF("p","mm","a4");
  const d = window.lastAnalysisData;

  // Header
  pdf.setFillColor(12,18,35);
  pdf.rect(0,0,210,35,"F");

  pdf.setTextColor(255,255,255);
  pdf.setFontSize(20);
  pdf.text("RendimentoBB",20,20);

  pdf.setFontSize(11);
  pdf.text("Executive Investment Report",20,28);

  // Body
  pdf.setTextColor(0,0,0);
  pdf.setFontSize(26);
  pdf.text("ROI " + d.baseROI.toFixed(2) + "%",20,60);

  pdf.setFontSize(12);
  pdf.text("Break-even: " + d.breakEvenYears.toFixed(1) + " years",20,75);
  pdf.text("Stress ROI: " + d.pessimisticROI.toFixed(2) + "%",20,85);
  pdf.text("Risk Score: " + d.riskScore + "/100",20,95);
  pdf.text("Annual Net: " + formatCurrency(d.netAfterMortgage),20,105);
  pdf.text("5-Year Projection: " + formatCurrency(d.fiveYearProjection),20,115);

  pdf.text("Investment Grade: " + d.grade,20,130);

  pdf.setFontSize(11);
  pdf.text("Strategic Assessment:",20,145);

  const lines = pdf.splitTextToSize(d.strategicComment,170);
  pdf.text(lines,20,155);

  pdf.save("RendimentoBB_Executive_Report.pdf");
}
