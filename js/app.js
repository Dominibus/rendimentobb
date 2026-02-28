// ===============================
// RENDIMENTOBB – EXECUTIVE ENGINE
// VERSIONE CONSULENZIALE PREMIUM
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
      window.currentLang === "it"
        ? "Inserisci valori validi."
        : "Please enter valid values.";
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

  // ===============================
  // PROFESSIONAL RISK SCORE 0–100
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
      ? "Investimento con elevata esposizione a variabili operative. Richiede revisione strategica."
      : "High exposure to operational volatility. Strategic review recommended.";
  }
  else if (riskScore >= 40) {
    riskLabel = window.currentLang === "it" ? "RISCHIO MODERATO" : "MODERATE RISK";
    badgeColor = "#f59e0b";
    strategicComment = window.currentLang === "it"
      ? "Investimento sostenibile ma sensibile a variazioni di mercato."
      : "Sustainable but sensitive to market fluctuations.";
  }
  else {
    riskLabel = window.currentLang === "it" ? "BASSO RISCHIO" : "LOW RISK";
    badgeColor = "#10b981";
    strategicComment = window.currentLang === "it"
      ? "Struttura finanziaria solida con buona resilienza."
      : "Strong financial structure with good resilience.";
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
  // RENDER EXECUTIVE SUMMARY
  // ===============================

  resultsDiv.innerHTML = `
    <div class="result-card">

      <h4>📊 Executive Investment Summary</h4>

      <div style="margin:12px 0;">
        <span style="
          padding:6px 14px;
          border-radius:20px;
          font-size:12px;
          background:${badgeColor};
          color:#fff;
          font-weight:600;">
          ${riskLabel}
        </span>
      </div>

      <div style="margin-top:15px; line-height:1.9; font-size:15px;">
        <div><strong>ROI:</strong> ${baseROI.toFixed(2)}%</div>
        <div><strong>Break-even:</strong> ${breakEvenYears.toFixed(1)} ${window.currentLang === "it" ? "anni" : "years"}</div>
        <div><strong>Stress ROI:</strong> ${pessimisticROI.toFixed(2)}%</div>
        <div><strong>Risk Index:</strong> ${riskScore}/100</div>
      </div>

      <div style="
        margin-top:18px;
        padding:14px;
        border-radius:12px;
        background:#f1f5f9;
        font-size:14px;">
        ${strategicComment}
      </div>

      <div style="margin-top:18px; font-size:14px;">
        <strong>${window.currentLang === "it" ? "Utile netto annuo:" : "Annual net profit:"}</strong>
        ${formatCurrency(netAfterMortgage)}<br>
        <strong>${window.currentLang === "it" ? "Proiezione 5 anni:" : "5-year projection:"}</strong>
        ${formatCurrency(fiveYearProjection)}
      </div>

      <button onclick="generatePDF()" class="btn-primary" style="margin-top:22px;">
        📄 ${window.currentLang === "it"
          ? "Scarica Executive Report"
          : "Download Executive Report"}
      </button>

    </div>
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
      plugins: { legend: { display: false } },
      animation: { duration: 800 }
    }
  });
}

// ===============================
// EXECUTIVE PDF
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

  const lines = [
    `ROI: ${d.baseROI.toFixed(2)}%`,
    `Break-even: ${d.breakEvenYears.toFixed(1)} ${isIT ? "anni" : "years"}`,
    `Stress ROI: ${d.pessimisticROI.toFixed(2)}%`,
    `Risk Index: ${d.riskScore}/100`,
    "",
    `${isIT ? "Utile netto annuo:" : "Annual net profit:"} ${formatCurrency(d.netAfterMortgage)}`,
    `${isIT ? "Proiezione 5 anni:" : "5-year projection:"} ${formatCurrency(d.fiveYearProjection)}`,
    "",
    d.strategicComment
  ];

  lines.forEach(line => {
    pdf.text(line, 20, y);
    y += 8;
  });

  pdf.save(isIT ? "Executive_Report_IT.pdf" : "Executive_Report_EN.pdf");
}
