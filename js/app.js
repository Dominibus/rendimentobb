// ===============================
// RENDIMENTOBB – EXECUTIVE ENGINE 3.2
// REFINED PROFESSIONAL VERSION
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

  let strategicComment =
    riskScore >= 70
      ? "High exposure to operational volatility. Strategic review recommended."
      : riskScore >= 40
      ? "Sustainable but sensitive to market fluctuations."
      : "Strong and resilient financial structure.";

  window.lastAnalysisData = {
    baseROI,
    pessimisticROI,
    breakEvenYears,
    netAfterMortgage,
    fiveYearProjection,
    riskScore,
    grade,
    strategicComment
  };

  // ===== UI unchanged =====

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
// PROFESSIONAL PDF (REFINED)
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
  let y = 50;

  // HEADER
  pdf.setFillColor(10,20,45);
  pdf.rect(0,0,210,35,"F");

  pdf.setTextColor(255,255,255);
  pdf.setFontSize(20);
  pdf.text("RendimentoBB", margin, 20);

  pdf.setFontSize(11);
  pdf.text("Executive Investment Report", margin, 28);

  // ROI BIG
  pdf.setTextColor(0,0,0);
  pdf.setFontSize(14);
  pdf.text("Return on Investment (ROI)", margin, y);

  y += 12;

  pdf.setFontSize(32);
  pdf.setTextColor(d.baseROI >= 0 ? 0 : 200, d.baseROI >= 0 ? 0 : 60, d.baseROI >= 0 ? 0 : 60);
  pdf.text(d.baseROI.toFixed(2) + "%", margin, y);

  y += 18;

  pdf.setTextColor(0,0,0);
  pdf.setFontSize(12);

  pdf.text("Break-even: " + d.breakEvenYears.toFixed(1) + " years", margin, y);
  y += 10;

  pdf.text("Stress ROI: " + d.pessimisticROI.toFixed(2) + "%", margin, y);
  y += 10;

  pdf.text("Annual Net: " + formatCurrency(d.netAfterMortgage), margin, y);
  y += 10;

  pdf.text("5-Year Projection: " + formatCurrency(d.fiveYearProjection), margin, y);
  y += 15;

  // RISK BAR
  pdf.text("Risk Index: " + d.riskScore + "/100", margin, y);
  y += 8;

  pdf.setFillColor(16,185,129);
  pdf.rect(margin, y, 50, 6, "F");

  pdf.setFillColor(245,158,11);
  pdf.rect(margin + 50, y, 50, 6, "F");

  pdf.setFillColor(239,68,68);
  pdf.rect(margin + 100, y, 50, 6, "F");

  const indicatorX = margin + (d.riskScore * 1.5);
  pdf.setDrawColor(0,0,0);
  pdf.line(indicatorX, y - 2, indicatorX, y + 8);

  y += 20;

  pdf.setFontSize(14);
  pdf.text("Investment Grade: " + d.grade, margin, y);
  y += 15;

  pdf.setFontSize(13);
  pdf.text("Strategic Assessment", margin, y);
  y += 10;

  pdf.setFontSize(11);
  const lines = pdf.splitTextToSize(d.strategicComment,170);
  pdf.text(lines, margin, y);

  y += lines.length * 6 + 15;

  pdf.setFontSize(13);
  pdf.text("Executive Verdict", margin, y);
  y += 10;

  const verdict =
    d.riskScore >= 70
      ? "High-risk profile. Investment not advisable under current assumptions."
      : d.riskScore >= 40
      ? "Moderate risk profile. Scenario dependent on operational discipline."
      : "Low-risk profile. Structurally sound under current assumptions.";

  const verdictLines = pdf.splitTextToSize(verdict,170);
  pdf.text(verdictLines, margin, y);

  pdf.setFontSize(8);
  pdf.setTextColor(120,120,120);
  pdf.text(
    "Generated on " + new Date().toLocaleDateString() +
    " • RendimentoBB Strategic Analysis Engine",
    margin,
    285
  );

  pdf.save("RendimentoBB_Executive_Report.pdf");
}
