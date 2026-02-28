// ===============================
// RENDIMENTOBB – APP CORE
// VERSIONE DEFINITIVA SYNC LANG
// ===============================

// NON inizializziamo la lingua qui.
// Deve arrivare da lang.js.
if (!window.currentLang) {
  window.currentLang = localStorage.getItem("rb_lang") || "it";
}

// ===============================
// FORMAT CURRENCY
// ===============================

function formatCurrency(value) {
  if (!isFinite(value)) value = 0;

  return new Intl.NumberFormat(
    window.currentLang === "it" ? "it-IT" : "en-US",
    {
      style: "currency",
      currency: "EUR"
    }
  ).format(value);
}

// ===============================
// GET VALUE
// ===============================

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
// CALCULATION
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

  window.lastAnalysisData = {
    baseROI,
    pessimisticROI,
    breakEvenYears,
    netAfterMortgage
  };

  resultsDiv.innerHTML = `
    <div class="result-card">
      <h4>📊 ${
        window.currentLang === "it"
          ? "Analisi Strategica Professionale"
          : "Professional Strategic Analysis"
      }</h4>
      <div>ROI: <strong>${baseROI.toFixed(2)}%</strong></div>
      <div>Break-even: <strong>${breakEvenYears.toFixed(1)} ${
        window.currentLang === "it" ? "anni" : "years"
      }</strong></div>
      <div>${
        window.currentLang === "it"
          ? "Scenario pessimistico"
          : "Pessimistic scenario"
      }: <strong>${pessimisticROI.toFixed(2)}%</strong></div>
      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 ${
          window.currentLang === "it"
            ? "Genera Report Strategico Completo"
            : "Generate Full Strategic Report"
        }
      </button>
    </div>
  `;

  if (!chartCanvas) return;
  if (roiChartInstance) roiChartInstance.destroy();

  roiChartInstance = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels:
        window.currentLang === "it"
          ? ['Anno 1','Anno 2','Anno 3','Anno 4','Anno 5']
          : ['Year 1','Year 2','Year 3','Year 4','Year 5'],
      datasets: [{
        label:
          window.currentLang === "it"
            ? 'Utile cumulativo'
            : 'Cumulative net profit',
        data: [
          netAfterMortgage,
          netAfterMortgage*2,
          netAfterMortgage*3,
          netAfterMortgage*4,
          netAfterMortgage*5
        ],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.2)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      devicePixelRatio: 3,
      plugins: { legend: { display: false } }
    }
  });
}
