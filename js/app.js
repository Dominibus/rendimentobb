// ===============================
// RENDIMENTOBB – EXECUTIVE ENGINE 3.3
// FULL VERSION RESTORED
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

  let grade;
  if (riskScore < 30) grade = "A";
  else if (riskScore < 50) grade = "B";
  else if (riskScore < 70) grade = "C";
  else grade = "D";

  let riskColor =
    riskScore < 40 ? "#10b981" :
    riskScore < 70 ? "#f59e0b" :
    "#ef4444";

  window.lastAnalysisData = {
    baseROI,
    pessimisticROI,
    breakEvenYears,
    netAfterMortgage,
    fiveYearProjection,
    riskScore,
    grade
  };

  // ===============================
  // RESULTS HTML RESTORED
  // ===============================

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

    <div style="margin-bottom:20px;">
      <strong>Risk Index:</strong> ${riskScore}/100
      <div style="height:8px;background:#e5e7eb;border-radius:4px;margin-top:6px;">
        <div style="width:${riskScore}%;background:${riskColor};height:8px;border-radius:4px;"></div>
      </div>
    </div>

    <button onclick="generatePDF()" class="btn-primary">
      📄 Download Executive Report
    </button>
  `;

  // ===============================
  // CHART
  // ===============================

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
// PROFESSIONAL PDF
// ===============================

function generatePDF() {

  if (!window.lastAnalysisData) {
    alert("Run analysis first.");
    return;
  }

  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF("p","mm","a4");
  const d = window.lastAnalysisData;

  const margin = 20;
  let y = 45;

  // ===== HEADER =====
  pdf.setFillColor(15,23,42);
  pdf.rect(0,0,210,35,"F");

  pdf.setTextColor(255,255,255);
  pdf.setFontSize(20);
  pdf.text("RendimentoBB", margin, 20);

  pdf.setFontSize(11);
  pdf.text("Strategic Investment Report", margin, 28);

  // ===== ROI SECTION =====
  pdf.setTextColor(0,0,0);
  pdf.setFontSize(14);
  pdf.text("Cash-on-Cash Return (Equity ROI)", margin, y);

  y += 12;

  pdf.setFontSize(34);
  pdf.setTextColor(d.baseROI >= 0 ? 0 : 200, 0, 0);
  pdf.text(d.baseROI.toFixed(2) + "%", margin, y);

  y += 10;

  pdf.setFontSize(10);
  pdf.setTextColor(100,100,100);
  pdf.text("Based on invested equity only", margin, y);

  y += 18;

  // ===== KPI BOX =====
  pdf.setFillColor(240,243,247);
  pdf.roundedRect(margin, y, 170, 32, 4, 4, "F");

  pdf.setFontSize(11);
  pdf.setTextColor(0,0,0);

  pdf.text("Break-even: " + d.breakEvenYears.toFixed(1) + " yrs", margin+8, y+10);
  pdf.text("Stress ROI: " + d.pessimisticROI.toFixed(2) + "%", margin+95, y+10);

  pdf.text("Annual Net: " + formatCurrency(d.netAfterMortgage), margin+8, y+22);
  pdf.text("5Y Projection: " + formatCurrency(d.fiveYearProjection), margin+95, y+22);

  y += 45;

  // ===== RISK SECTION =====
  pdf.setFontSize(13);
  pdf.text("Risk Index", margin, y);

  y += 8;

  pdf.setFillColor(16,185,129);
  pdf.rect(margin, y, 55, 6, "F");

  pdf.setFillColor(245,158,11);
  pdf.rect(margin+55, y, 55, 6, "F");

  pdf.setFillColor(239,68,68);
  pdf.rect(margin+110, y, 55, 6, "F");

  const indicatorX = margin + (d.riskScore * 1.65);
  pdf.setDrawColor(0,0,0);
  pdf.line(indicatorX, y-2, indicatorX, y+8);

  pdf.setFontSize(10);
  pdf.text(d.riskScore + "/100", indicatorX-5, y+14);

  y += 22;

  // ===== GRADE =====
  pdf.setFontSize(14);
  pdf.setTextColor(0,0,0);
  pdf.text("Investment Grade: " + d.grade, margin, y);

  y += 15;

  // ===== STRATEGIC ASSESSMENT =====
  pdf.setFontSize(13);
  pdf.text("Strategic Assessment", margin, y);

  y += 8;

  pdf.setFillColor(248,250,252);
  pdf.roundedRect(margin, y, 170, 28, 4, 4, "F");

  pdf.setFontSize(11);

  const assessment =
    d.riskScore >= 70
      ? "High exposure to operational volatility. Cashflow sustainability under pressure."
      : d.riskScore >= 40
      ? "Moderate risk profile. Performance sensitive to occupancy and cost control."
      : "Strong and resilient financial structure with controlled exposure.";

  const assessLines = pdf.splitTextToSize(assessment, 160);
  pdf.text(assessLines, margin+6, y+14);

  y += 40;

  // ===== EXECUTIVE VERDICT =====
  pdf.setFontSize(13);
  pdf.text("Executive Verdict", margin, y);

  y += 8;

  pdf.setFillColor(230,236,242);
  pdf.roundedRect(margin, y, 170, 28, 4, 4, "F");

  pdf.setFontSize(11);

  const verdict =
    d.riskScore >= 70
      ? "High-risk profile. Investment not advisable under current assumptions."
      : d.riskScore >= 40
      ? "Balanced profile. Requires operational discipline and scenario monitoring."
      : "Low-risk profile. Structurally sound under current assumptions.";

  const verdictLines = pdf.splitTextToSize(verdict, 160);
  pdf.text(verdictLines, margin+6, y+14);

  // ===== FOOTER =====
  pdf.setFontSize(8);
  pdf.setTextColor(120,120,120);
  pdf.text(
    "Generated on " + new Date().toLocaleDateString() +
    " • RendimentoBB Strategic Analysis Engine",
    margin,
    285
  );

  pdf.save("RendimentoBB_Strategic_Report.pdf");
}
