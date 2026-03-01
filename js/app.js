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

  let y = 20;

  pdf.setFontSize(18);
  pdf.text("RendimentoBB – Executive Investment Report", 20, y);

  y += 15;
  pdf.setFontSize(12);

  pdf.text(`ROI: ${d.baseROI.toFixed(2)}%`, 20, y); y+=8;
  pdf.text(`Break-even: ${d.breakEvenYears.toFixed(1)} ${isIT ? "anni" : "years"}`, 20, y); y+=8;
  pdf.text(`Stress ROI: ${d.pessimisticROI.toFixed(2)}%`, 20, y); y+=8;
  pdf.text(`Risk Index: ${d.riskScore}/100`, 20, y); y+=12;

  pdf.text(
    `${isIT ? "Utile netto annuo:" : "Annual net profit:"} ${formatCurrency(d.netAfterMortgage)}`,
    20,
    y
  ); y+=8;

  pdf.text(
    `${isIT ? "Proiezione 5 anni:" : "5-year projection:"} ${formatCurrency(d.fiveYearProjection)}`,
    20,
    y
  ); y+=12;

  pdf.setFontSize(11);
  pdf.text(d.strategicComment, 20, y, { maxWidth: 170 });

  pdf.save(isIT ? "Executive_Report_IT.pdf" : "Executive_Report_EN.pdf");
}
