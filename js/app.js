// ===============================
// RENDIMENTOBB – APP CORE SYSTEM
// VERSIONE DEFINITIVA BILINGUE
// ===============================

// Usa sempre la lingua globale
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
// GET INPUT VALUE
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
// MORTGAGE CALCULATION
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

  // Stress test realistico (-10% occupazione)
  const pessimisticOccupancy = occupancy * 0.9;
  const pessimisticNights = 30 * (pessimisticOccupancy / 100);
  const pessimisticGross = price * pessimisticNights * 12;
  const pessimisticFees = pessimisticGross * (commission / 100);
  const pessimisticProfit = pessimisticGross - pessimisticFees - yearlyExpenses;
  const pessimisticTax = pessimisticProfit > 0 ? pessimisticProfit * (tax / 100) : 0;
  const pessimisticNet = pessimisticProfit - pessimisticTax - mortgage.yearlyPayment;
  const pessimisticROI = (pessimisticNet / equity) * 100;

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
      <div>${
        window.currentLang === "it" ? "Break-even" : "Break-even"
      }: <strong>${breakEvenYears.toFixed(1)} ${
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

// ===============================
// PROFESSIONAL BILINGUAL PDF
// ===============================

async function generatePDF() {

  if (!window.lastAnalysisData) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const d = window.lastAnalysisData;
  const isIT = window.currentLang === "it";

  let y = 20;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text(
    isIT
      ? "RendimentoBB - Executive Investment Report"
      : "RendimentoBB - Executive Investment Report",
    20,
    y
  );

  y += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  const fiveYearTotal = d.netAfterMortgage * 5;

  const summary = isIT
    ? `
Questo investimento genera un rendimento annuo stimato del ${d.baseROI.toFixed(2)}%.

Significa che ogni 100€ investiti producono circa ${d.baseROI.toFixed(2)}€ l'anno.

L'utile netto stimato annuale è ${formatCurrency(d.netAfterMortgage)}.

Il capitale iniziale verrebbe recuperato in circa ${d.breakEvenYears.toFixed(1)} anni.

In uno scenario prudente (-10% occupazione),
il rendimento scenderebbe al ${d.pessimisticROI.toFixed(2)}%.

Proiezione utile netto a 5 anni: ${formatCurrency(fiveYearTotal)}.
`
    : `
This investment generates an estimated annual return of ${d.baseROI.toFixed(2)}%.

This means every €100 invested may generate about €${d.baseROI.toFixed(2)} per year.

Estimated annual net profit is ${formatCurrency(d.netAfterMortgage)}.

Initial capital would be recovered in approximately ${d.breakEvenYears.toFixed(1)} years.

Under a conservative scenario (-10% occupancy),
ROI would decrease to ${d.pessimisticROI.toFixed(2)}%.

Projected 5-year cumulative profit: ${formatCurrency(fiveYearTotal)}.
`;

  const lines = pdf.splitTextToSize(summary, 170);
  pdf.text(lines, 20, y);

  y += lines.length * 6 + 10;

  const chartCanvas = document.getElementById("roiChart");
  if (chartCanvas) {
    const img = chartCanvas.toDataURL("image/png", 1.0);
    pdf.addImage(img, 'PNG', 20, y, 170, 90);
  }

  pdf.setFontSize(8);
  pdf.text(
    isIT
      ? "Report generato automaticamente dal sistema RendimentoBB."
      : "Report automatically generated by RendimentoBB system.",
    20,
    285
  );

  pdf.save(
    isIT
      ? "RendimentoBB_Report_IT.pdf"
      : "RendimentoBB_Report_EN.pdf"
  );
}
