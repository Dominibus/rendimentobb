// ===============================
// RENDIMENTOBB – PROFESSIONAL CORE
// VERSIONE CON SUGGERIMENTI ATTIVI
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

  const pessimisticROI = baseROI * 0.9;
  const fiveYearProjection = netAfterMortgage * 5;

  // ===============================
  // SUGGERIMENTI DINAMICI
  // ===============================

  let suggestion = "";
  let badgeColor = "#22c55e";
  let riskLevel = "";

  if (baseROI < 4) {
    suggestion = window.currentLang === "it"
      ? "ROI basso. Valuta aumento prezzo medio o riduzione costi."
      : "Low ROI. Consider increasing nightly rate or reducing costs.";
    badgeColor = "#ef4444";
    riskLevel = window.currentLang === "it" ? "ALTO RISCHIO" : "HIGH RISK";
  }
  else if (baseROI < 8) {
    suggestion = window.currentLang === "it"
      ? "Investimento prudente. Stabilità legata all’occupazione."
      : "Prudent investment. Stability depends on occupancy.";
    badgeColor = "#f59e0b";
    riskLevel = window.currentLang === "it" ? "RISCHIO MEDIO" : "MEDIUM RISK";
  }
  else {
    suggestion = window.currentLang === "it"
      ? "Ottimo equilibrio tra rischio e rendimento."
      : "Strong balance between risk and return.";
    badgeColor = "#22c55e";
    riskLevel = window.currentLang === "it" ? "BASSO RISCHIO" : "LOW RISK";
  }

  window.lastAnalysisData = {
    baseROI,
    pessimisticROI,
    breakEvenYears,
    netAfterMortgage,
    fiveYearProjection
  };

  // ===============================
  // RENDER RISULTATI COMPLETI
  // ===============================

  resultsDiv.innerHTML = `
    <div class="result-card">

      <h4>📊 ${window.currentLang === "it"
        ? "Analisi Strategica Professionale"
        : "Professional Strategic Analysis"}</h4>

      <div style="margin:10px 0;">
        <span style="
          padding:6px 12px;
          border-radius:20px;
          font-size:12px;
          background:${badgeColor};
          color:#fff;
          font-weight:bold;">
          ${riskLevel}
        </span>
      </div>

      <div style="margin-top:10px; line-height:1.8;">
        <div><strong>ROI:</strong> ${baseROI.toFixed(2)}%</div>
        <div><strong>Break-even:</strong> ${breakEvenYears.toFixed(1)} ${window.currentLang === "it" ? "anni" : "years"}</div>
        <div><strong>${window.currentLang === "it" ? "Scenario stress" : "Stress scenario"}:</strong> ${pessimisticROI.toFixed(2)}%</div>
      </div>

      <div style="
        margin-top:15px;
        padding:12px;
        border-radius:8px;
        background:rgba(255,255,255,0.05);
        border-left:4px solid ${badgeColor};
        font-size:14px;">
        ${suggestion}
      </div>

      <div style="margin-top:15px; font-size:14px; opacity:0.8;">
        ${window.currentLang === "it"
          ? `Utile netto annuo stimato: ${formatCurrency(netAfterMortgage)}<br>
             Proiezione 5 anni: ${formatCurrency(fiveYearProjection)}`
          : `Estimated annual net profit: ${formatCurrency(netAfterMortgage)}<br>
             5-year projection: ${formatCurrency(fiveYearProjection)}`}
      </div>

      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 ${window.currentLang === "it"
          ? "Genera Report Strategico Completo"
          : "Generate Full Strategic Report"}
      </button>

    </div>
  `;

  if (!chartCanvas) return;
  if (roiChartInstance) roiChartInstance.destroy();

  roiChartInstance = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: window.currentLang === "it"
        ? ['Anno 1','Anno 2','Anno 3','Anno 4','Anno 5']
        : ['Year 1','Year 2','Year 3','Year 4','Year 5'],
      datasets: [{
        data: [
          netAfterMortgage,
          netAfterMortgage*2,
          netAfterMortgage*3,
          netAfterMortgage*4,
          netAfterMortgage*5
        ],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.15)',
        borderWidth: 3,
        tension: 0.3,
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
// PDF
// ===============================

function generatePDF() {

  if (!window.lastAnalysisData) return;

  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF();

  const d = window.lastAnalysisData;
  const isIT = window.currentLang === "it";

  let y = 20;

  pdf.setFontSize(18);
  pdf.text("RendimentoBB - Executive Report", 20, y);

  y += 12;

  pdf.setFontSize(11);

  const text = isIT
    ? `
ROI: ${d.baseROI.toFixed(2)}%
Break-even: ${d.breakEvenYears.toFixed(1)} anni
Scenario stress: ${d.pessimisticROI.toFixed(2)}%

Utile netto annuo: ${formatCurrency(d.netAfterMortgage)}
Proiezione 5 anni: ${formatCurrency(d.fiveYearProjection)}
`
    : `
ROI: ${d.baseROI.toFixed(2)}%
Break-even: ${d.breakEvenYears.toFixed(1)} years
Stress scenario: ${d.pessimisticROI.toFixed(2)}%

Annual net profit: ${formatCurrency(d.netAfterMortgage)}
5-year projection: ${formatCurrency(d.fiveYearProjection)}
`;

  const lines = pdf.splitTextToSize(text, 170);
  pdf.text(lines, 20, y);

  pdf.save(isIT ? "RendimentoBB_IT.pdf" : "RendimentoBB_EN.pdf");
}
