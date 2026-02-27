// ===============================
// SAFE LANGUAGE INIT
// ===============================

if (typeof currentLang === "undefined") {
  currentLang = "it";
}

function formatCurrency(value) {
  if (!isFinite(value)) value = 0;
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

let lastAnalysisData = null;
let roiChartInstance = null;

// ===============================
// CALCOLO MUTUO
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
    monthlyPayment: monthlyPayment,
    yearlyPayment: monthlyPayment * 12
  };
}

// ===============================
// CALCULATE
// ===============================

function calculate() {
  runRealCalculation();
}

// ===============================
// REAL CALCULATION
// ===============================

function runRealCalculation() {

  const propertyPrice = getValue("propertyPrice");
  const equity = getValue("equity");
  const loanAmount = getValue("loanAmount");
  const interestRate = getValue("interestRate");
  const loanYears = getValue("loanYears");
  const price = getValue("price");
  const occupancy = getValue("occupancy");
  const expenses = getValue("expenses");
  const commission = getValue("commission");
  const tax = getValue("tax");

  const resultsDiv = document.getElementById("results");
  const chartCanvas = document.getElementById("roiChart");

  if (!price || !occupancy || !equity) {
    resultsDiv.innerHTML = "Inserisci valori validi.";
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

  // Scenario pessimistico
  const pessimisticROI = baseROI - 5;

  lastAnalysisData = {
    propertyPrice,
    equity,
    grossYearly,
    netYearly,
    netAfterMortgage,
    baseROI,
    pessimisticROI
  };

  resultsDiv.innerHTML = `
    <div class="result-card">
      <h4>📊 Analisi Strategica</h4>
      <div>ROI attuale: <strong>${baseROI.toFixed(2)}%</strong></div>
      <div>Scenario pessimistico: <strong>${pessimisticROI.toFixed(2)}%</strong></div>
      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 Genera Report Strategico
      </button>
    </div>
  `;

  // ===============================
  // GRAFICO ROI
  // ===============================

  chartCanvas.style.display = "block";

  if (roiChartInstance) {
    roiChartInstance.destroy();
  }

  roiChartInstance = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: ['ROI Attuale', 'Scenario Pessimistico'],
      datasets: [{
        label: 'ROI %',
        data: [baseROI, pessimisticROI],
        backgroundColor: ['#22c55e', '#ef4444']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// ===============================
// PDF CON GRAFICO
// ===============================

async function generatePDF() {

  if (!lastAnalysisData) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  let y = 20;

  pdf.setFontSize(18);
  pdf.text("RendimentoBB - Strategic Report", 20, y);

  y += 15;
  pdf.setFontSize(12);

  pdf.text(`ROI Attuale: ${lastAnalysisData.baseROI.toFixed(2)}%`, 20, y);
  y += 8;
  pdf.text(`Scenario Pessimistico: ${lastAnalysisData.pessimisticROI.toFixed(2)}%`, 20, y);

  y += 15;

  // Inserimento grafico nel PDF
  const chartCanvas = document.getElementById("roiChart");
  const chartImage = chartCanvas.toDataURL("image/png", 1.0);
  pdf.addImage(chartImage, 'PNG', 20, y, 170, 80);

  pdf.save("RendimentoBB_Strategic_Report.pdf");
}
