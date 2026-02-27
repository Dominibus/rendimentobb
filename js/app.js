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

  const breakEvenYears = netAfterMortgage > 0
    ? equity / netAfterMortgage
    : 99;

  // Scenario realistico -10%
  const pessimisticOccupancy = occupancy * 0.9;
  const pessimisticNights = 30 * (pessimisticOccupancy / 100);
  const pessimisticGross = price * pessimisticNights * 12;
  const pessimisticFees = pessimisticGross * (commission / 100);
  const pessimisticProfit = pessimisticGross - pessimisticFees - yearlyExpenses;
  const pessimisticTax = pessimisticProfit > 0 ? pessimisticProfit * (tax / 100) : 0;
  const pessimisticNet = pessimisticProfit - pessimisticTax - mortgage.yearlyPayment;
  const pessimisticROI = (pessimisticNet / equity) * 100;

  // ===============================
  // INVESTMENT SCORE 0–100
  // ===============================

  const loanRatio = propertyPrice ? (loanAmount / propertyPrice) * 100 : 0;
  const safetyMargin = mortgage.yearlyPayment > 0
    ? (netYearly - mortgage.yearlyPayment) / mortgage.yearlyPayment
    : 1;

  let roiScore = baseROI >= 15 ? 30 :
                 baseROI >= 10 ? 22 :
                 baseROI >= 6 ? 15 :
                 baseROI >= 3 ? 8 : 3;

  let breakScore = breakEvenYears <= 6 ? 20 :
                   breakEvenYears <= 10 ? 15 :
                   breakEvenYears <= 15 ? 10 : 5;

  let leverageScore = loanRatio <= 60 ? 15 :
                      loanRatio <= 75 ? 10 :
                      loanRatio <= 85 ? 6 : 3;

  let marginScore = safetyMargin >= 1 ? 20 :
                    safetyMargin >= 0.5 ? 14 :
                    safetyMargin >= 0.2 ? 8 : 3;

  let stressScore = pessimisticROI >= 8 ? 15 :
                    pessimisticROI >= 4 ? 10 :
                    pessimisticROI >= 0 ? 6 : 2;

  const investmentScore =
    roiScore + breakScore + leverageScore + marginScore + stressScore;

  let rating = "D";
  if (investmentScore >= 85) rating = "A+";
  else if (investmentScore >= 75) rating = "A";
  else if (investmentScore >= 65) rating = "B+";
  else if (investmentScore >= 55) rating = "B";
  else if (investmentScore >= 45) rating = "C";

  lastAnalysisData = {
    propertyPrice,
    equity,
    grossYearly,
    netYearly,
    netAfterMortgage,
    baseROI,
    pessimisticROI,
    breakEvenYears,
    investmentScore,
    rating
  };

  resultsDiv.innerHTML = `
    <div class="result-card">
      <h4>📊 ${currentLang === "it" ? "Analisi Strategica Professionale" : "Professional Strategic Analysis"}</h4>
      <div>ROI: <strong>${baseROI.toFixed(2)}%</strong></div>
      <div>${currentLang === "it" ? "Break-even" : "Break-even"}: <strong>${breakEvenYears.toFixed(1)} anni</strong></div>
      <div>${currentLang === "it" ? "Scenario pessimistico" : "Pessimistic scenario"}: <strong>${pessimisticROI.toFixed(2)}%</strong></div>
      <div style="margin-top:12px;font-size:18px;">
        Investment Score: <strong>${investmentScore}/100</strong>
      </div>
      <div style="font-size:16px;">
        Rating: <strong>${rating}</strong>
      </div>
      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 ${currentLang === "it" ? "Genera Report Strategico Completo" : "Generate Full Strategic Report"}
      </button>
    </div>
  `;

  if (!chartCanvas) return;

  chartCanvas.style.display = "block";

  if (roiChartInstance) roiChartInstance.destroy();

  roiChartInstance = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: ['Year 1','Year 2','Year 3','Year 4','Year 5'],
      datasets: [{
        label: 'Cumulative Net',
        data: [
          netAfterMortgage,
          netAfterMortgage*2,
          netAfterMortgage*3,
          netAfterMortgage*4,
          netAfterMortgage*5
        ],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.2)',
        tension: 0.3,
        fill: true
      }]
    },
    options: { responsive: true }
  });
}

// ===============================
// PDF PROFESSIONALE COMPLETO
// ===============================

async function generatePDF() {

  if (!lastAnalysisData) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const d = lastAnalysisData;
  const isIT = currentLang === "it";

  let y = 20;

  pdf.setFontSize(20);
  pdf.text("RendimentoBB", 20, y);

  y += 15;
  pdf.setFontSize(14);
  pdf.text(`Investment Score: ${d.investmentScore}/100`, 20, y);

  y += 8;
  pdf.text(`Rating: ${d.rating}`, 20, y);

  y += 15;
  pdf.setFontSize(12);

  const summary = isIT
    ? `Questo investimento genera un ROI del ${d.baseROI.toFixed(2)}% con recupero capitale stimato in ${d.breakEvenYears.toFixed(1)} anni.
Lo scenario pessimistico scende a ${d.pessimisticROI.toFixed(2)}%.
Il punteggio ${d.investmentScore}/100 indica un profilo ${d.rating}.`
    : `This investment generates a ${d.baseROI.toFixed(2)}% ROI with capital recovery in approximately ${d.breakEvenYears.toFixed(1)} years.
Pessimistic scenario drops to ${d.pessimisticROI.toFixed(2)}%.
Score ${d.investmentScore}/100 indicates rating ${d.rating}.`;

  const lines = pdf.splitTextToSize(summary, 170);
  pdf.text(lines, 20, y);

  y += lines.length * 6 + 10;

  const chartCanvas = document.getElementById("roiChart");
  if (chartCanvas) {
    const chartImage = chartCanvas.toDataURL("image/png", 1.0);
    pdf.addImage(chartImage, 'PNG', 20, y, 170, 80);
  }

  pdf.save("RendimentoBB_Professional_Report.pdf");
}
