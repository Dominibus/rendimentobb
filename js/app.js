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
    resultsDiv.innerHTML = currentLang === "it"
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

  // Scenario realistico: -10% occupazione
  const pessimisticOccupancy = occupancy * 0.9;
  const pessimisticNights = 30 * (pessimisticOccupancy / 100);
  const pessimisticGross = price * pessimisticNights * 12;
  const pessimisticFees = pessimisticGross * (commission / 100);
  const pessimisticProfit = pessimisticGross - pessimisticFees - yearlyExpenses;
  const pessimisticTax = pessimisticProfit > 0 ? pessimisticProfit * (tax / 100) : 0;
  const pessimisticNet = pessimisticProfit - pessimisticTax - mortgage.yearlyPayment;
  const pessimisticROI = (pessimisticNet / equity) * 100;

  // Risk semplice
  let riskLabel = "LOW";
  if (baseROI < 6) riskLabel = "HIGH";
  else if (baseROI < 12) riskLabel = "MEDIUM";

  lastAnalysisData = {
    propertyPrice,
    equity,
    grossYearly,
    netYearly,
    netAfterMortgage,
    baseROI,
    pessimisticROI,
    riskLabel
  };

  resultsDiv.innerHTML = `
    <div class="result-card">
      <h4>📊 ${currentLang === "it" ? "Analisi Strategica" : "Strategic Analysis"}</h4>
      <div>ROI: <strong>${baseROI.toFixed(2)}%</strong></div>
      <div>${currentLang === "it" ? "Scenario pessimistico" : "Pessimistic scenario"}: <strong>${pessimisticROI.toFixed(2)}%</strong></div>
      <div>Risk: <strong>${riskLabel}</strong></div>
      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 ${currentLang === "it" ? "Genera Report Strategico" : "Generate Strategic Report"}
      </button>
    </div>
  `;

  // ===============================
  // GRAFICO ROI
  // ===============================

  if (!chartCanvas) return;

  chartCanvas.style.display = "block";

  if (roiChartInstance) {
    roiChartInstance.destroy();
  }

  roiChartInstance = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: currentLang === "it"
        ? ['ROI Attuale', 'Scenario Pessimistico']
        : ['Current ROI', 'Pessimistic Scenario'],
      datasets: [{
        label: 'ROI %',
        data: [baseROI, pessimisticROI],
        backgroundColor: ['#22c55e', '#ef4444']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

// ===============================
// PDF PROFESSIONALE BILINGUE
// ===============================

async function generatePDF() {

  if (!lastAnalysisData) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const d = lastAnalysisData;
  const isIT = currentLang === "it";

  let y = 20;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text(
    isIT
      ? "RendimentoBB - Report Strategico"
      : "RendimentoBB - Strategic Investment Report",
    20,
    y
  );

  y += 12;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const interpretation =
    d.baseROI < 6
      ? isIT
        ? "Il rendimento è basso e l'operazione presenta elevata sensibilità operativa."
        : "Return is low and the operation shows high operational sensitivity."
      : d.baseROI < 12
      ? isIT
        ? "Il rendimento è bilanciato ma dipende dalla stabilità dell'occupazione."
        : "Return is balanced but dependent on occupancy stability."
      : isIT
        ? "Il rendimento è elevato ma potrebbe implicare maggiore rischio."
        : "Return is strong but may imply higher risk exposure.";

  const summary = isIT
    ? `
EXECUTIVE SUMMARY

ROI annuo stimato: ${d.baseROI.toFixed(2)}%.
Scenario pessimistico (-10% occupazione): ${d.pessimisticROI.toFixed(2)}%.

${interpretation}

Livello di rischio: ${d.riskLabel}.
`
    : `
EXECUTIVE SUMMARY

Estimated annual ROI: ${d.baseROI.toFixed(2)}%.
Pessimistic scenario (-10% occupancy): ${d.pessimisticROI.toFixed(2)}%.

${interpretation}

Risk level: ${d.riskLabel}.
`;

  const lines = pdf.splitTextToSize(summary, 170);
  pdf.text(lines, 20, y);

  y += lines.length * 6 + 10;

  // GRAFICO
  const chartCanvas = document.getElementById("roiChart");
  if (chartCanvas) {
    const chartImage = chartCanvas.toDataURL("image/png", 1.0);
    pdf.addImage(chartImage, 'PNG', 20, y, 170, 80);
  }

  pdf.save("RendimentoBB_Strategic_Report.pdf");
}
