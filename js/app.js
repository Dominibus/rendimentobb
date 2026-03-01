// ===============================
// RENDIMENTOBB – EXECUTIVE ENGINE
// VERSIONE CONSULENZIALE PRO UI
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
    resultsDiv.innerHTML =
      `<div style="padding:20px;">
        ${window.currentLang === "it"
          ? "Inserisci valori validi."
          : "Please enter valid values."}
      </div>`;
    return;
  }

  // ===============================
  // CORE FINANCIALS
  // ===============================

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

  // ===============================
  // RISK SCORE
  // ===============================

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
    riskLabel = window.currentLang === "it" ? "ALTO RISCHIO" : "HIGH RISK";
    badgeColor = "#ef4444";
    strategicComment = window.currentLang === "it"
      ? "Elevata esposizione a variabili operative. Revisione strategica consigliata."
      : "High exposure to operational volatility. Strategic review recommended.";
  }
  else if (riskScore >= 40) {
    riskLabel = window.currentLang === "it" ? "RISCHIO MODERATO" : "MODERATE RISK";
    badgeColor = "#f59e0b";
    strategicComment = window.currentLang === "it"
      ? "Struttura sostenibile ma sensibile a variazioni di mercato."
      : "Sustainable but sensitive to market fluctuations.";
  }
  else {
    riskLabel = window.currentLang === "it" ? "BASSO RISCHIO" : "LOW RISK";
    badgeColor = "#10b981";
    strategicComment = window.currentLang === "it"
      ? "Struttura finanziaria solida e resiliente."
      : "Strong and resilient financial structure.";
  }

  window.lastAnalysisData = {
    baseROI,
    pessimisticROI,
    breakEvenYears,
    netAfterMortgage,
    fiveYearProjection,
    riskScore,
    riskLabel,
    strategicComment
  };

  // ===============================
  // DASHBOARD RENDER
  // ===============================

  resultsDiv.innerHTML = `
    <div style="display:grid; gap:25px;">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        flex-wrap:wrap;">

        <h3 style="margin:0;">📊 Executive Investment Summary</h3>

        <span style="
          padding:8px 18px;
          border-radius:999px;
          background:${badgeColor};
          color:white;
          font-size:12px;
          font-weight:700;">
          ${riskLabel}
        </span>
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
        gap:20px;">

        ${kpiCard("ROI", baseROI.toFixed(2) + "%")}
        ${kpiCard(
          window.currentLang === "it" ? "Break-even" : "Break-even",
          breakEvenYears.toFixed(1) + (window.currentLang === "it" ? " anni" : " years")
        )}
        ${kpiCard("Stress ROI", pessimisticROI.toFixed(2) + "%")}
        ${kpiCard("Risk Index", riskScore + "/100")}

      </div>

      <div style="
        padding:18px;
        border-radius:14px;
        background:#f1f5f9;
        font-size:14px;">
        ${strategicComment}
      </div>

      <div style="font-size:14px; line-height:1.8;">
        <strong>${window.currentLang === "it" ? "Utile netto annuo:" : "Annual net profit:"}</strong>
        ${formatCurrency(netAfterMortgage)}<br>
        <strong>${window.currentLang === "it" ? "Proiezione 5 anni:" : "5-year projection:"}</strong>
        ${formatCurrency(fiveYearProjection)}
      </div>

      <button onclick="generatePDF()" class="btn-primary">
        📄 ${window.currentLang === "it"
          ? "Scarica Executive Report"
          : "Download Executive Report"}
      </button>

    </div>
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
      plugins: { legend: { display: false } },
      animation: { duration: 800 }
    }
  });
}

// ===============================
// KPI CARD
// ===============================

function kpiCard(label, value) {
  return `
    <div style="
      padding:20px;
      border-radius:18px;
      background:white;
      box-shadow:0 15px 40px rgba(15,23,42,.06);">

      <div style="font-size:12px; color:#64748b;">
        ${label}
      </div>

      <div style="
        font-size:22px;
        font-weight:700;
        margin-top:6px;">
        ${value}
      </div>

    </div>
  `;
}

// ===============================
// EXECUTIVE PDF – PROFESSIONAL
// ===============================

function generatePDF() {

  if (!window.lastAnalysisData) return;

  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF();

  const d = window.lastAnalysisData;
  const isIT = window.currentLang === "it";
  const today = new Date().toLocaleDateString(
    isIT ? "it-IT" : "en-US"
  );

  const dark = [15, 23, 42];
  const green = [16, 185, 129];
  const yellow = [245, 158, 11];
  const red = [239, 68, 68];
  const lightGray = [241, 245, 249];

  let y = 0;

  // HEADER
  pdf.setFillColor(...dark);
  pdf.rect(0, 0, 210, 40, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont(undefined, "bold");
  pdf.text("RendimentoBB", 20, 24);

  pdf.setFontSize(11);
  pdf.text("Executive Investment Report", 20, 33);

  pdf.setTextColor(0, 0, 0);

  y = 60;

  // ROI HERO
  pdf.setFontSize(12);
  pdf.text("Return on Investment (ROI)", 20, y);

  y += 10;

  pdf.setFontSize(34);
  pdf.setFont(undefined, "bold");

  if (d.baseROI >= 0) {
    pdf.setTextColor(...green);
  } else {
    pdf.setTextColor(...red);
  }

  pdf.text(d.baseROI.toFixed(2) + "%", 20, y);

  pdf.setTextColor(0, 0, 0);

  y += 22;

  // KPI BOX
  pdf.setFillColor(...lightGray);
  pdf.roundedRect(20, y - 8, 170, 34, 4, 4, "F");

  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");

  pdf.text(`Break-even: ${d.breakEvenYears.toFixed(1)} ${isIT ? "anni" : "years"}`, 25, y);
  pdf.text(`Stress ROI: ${d.pessimisticROI.toFixed(2)}%`, 110, y);
  pdf.text(`Annual Net: ${formatCurrency(d.netAfterMortgage)}`, 25, y + 12);
  pdf.text(`5-Year Projection: ${formatCurrency(d.fiveYearProjection)}`, 110, y + 12);

  y += 50;

  // RISK SCALE BAR (GRADIENT STYLE)
  pdf.setFontSize(12);
  pdf.setFont(undefined, "bold");
  pdf.text("Risk Index", 20, y);

  y += 12;

  // Green zone
  pdf.setFillColor(...green);
  pdf.rect(20, y, 55, 8, "F");

  // Yellow zone
  pdf.setFillColor(...yellow);
  pdf.rect(75, y, 55, 8, "F");

  // Red zone
  pdf.setFillColor(...red);
  pdf.rect(130, y, 60, 8, "F");

  // Indicator line
  const indicatorX = 20 + (d.riskScore / 100) * 170;
  pdf.setDrawColor(0);
  pdf.setLineWidth(1);
  pdf.line(indicatorX, y - 2, indicatorX, y + 10);

  pdf.setFontSize(10);
  pdf.text(d.riskScore + "/100", 195 - 20, y + 6);

  y += 22;

  // INVESTMENT GRADE
  let grade, gradeLabel;

  if (d.riskScore < 30) { grade = "A"; gradeLabel = "Strong"; }
  else if (d.riskScore < 50) { grade = "B"; gradeLabel = "Stable"; }
  else if (d.riskScore < 70) { grade = "C"; gradeLabel = "Speculative"; }
  else { grade = "D"; gradeLabel = "High Risk"; }

  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.text("Investment Grade: " + grade, 20, y);

  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");
  pdf.text("Classification: " + gradeLabel, 20, y + 8);

  y += 20;

  // STRATEGIC COMMENT
  pdf.setFontSize(12);
  pdf.setFont(undefined, "bold");
  pdf.text("Strategic Assessment", 20, y);

  y += 10;

  pdf.setFillColor(255, 245, 245);
  pdf.roundedRect(20, y - 6, 170, 28, 4, 4, "F");

  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");
  pdf.text(d.strategicComment, 25, y + 4, { maxWidth: 160 });

  // ===============================
// EXECUTIVE VERDICT
// ===============================

y += 35;

pdf.setFontSize(14);
pdf.setFont(undefined, "bold");
pdf.text("Executive Verdict", 20, y);

y += 10;

let recommendation;

if (d.riskScore < 30) {
  recommendation = "Investment structure solid. Proceed with confidence.";
}
else if (d.riskScore < 50) {
  recommendation = "Acceptable risk profile. Monitor operational variables.";
}
else if (d.riskScore < 70) {
  recommendation = "Speculative structure. Requires optimization before execution.";
}
else {
  recommendation = "High-risk profile. Investment not advisable under current assumptions.";
}

pdf.setFillColor(240, 240, 240);
pdf.roundedRect(20, y - 6, 170, 25, 4, 4, "F");

pdf.setFontSize(11);
pdf.setFont(undefined, "normal");
pdf.text(recommendation, 25, y + 4, { maxWidth: 160 });
  
  // FOOTER
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    `Generated on ${today} • RendimentoBB Strategic Analysis Engine`,
    20,
    285
  );

  pdf.save(
    isIT
      ? "RendimentoBB_Executive_Report_IT.pdf"
      : "RendimentoBB_Executive_Report_EN.pdf"
  );
}
