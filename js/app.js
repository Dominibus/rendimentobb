// ===============================
// RENDIMENTOBB – PROFESSIONAL CORE
// VERSIONE PREMIUM COMPLETA
// ===============================

if (!window.currentLang) {
  window.currentLang = localStorage.getItem("rb_lang") || "it";
}

// ===============================
// FORMAT
// ===============================

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

  // Stress realistico -10% occupazione
  const stressOccupancy = occupancy * 0.9;
  const stressGross = price * (30 * (stressOccupancy / 100)) * 12;
  const stressFees = stressGross * (commission / 100);
  const stressProfit = stressGross - stressFees - yearlyExpenses;
  const stressTax = stressProfit > 0 ? stressProfit * (tax / 100) : 0;
  const stressNet = stressProfit - stressTax - mortgage.yearlyPayment;
  const pessimisticROI = (stressNet / equity) * 100;

  const fiveYearTotal = netAfterMortgage * 5;

  window.lastAnalysisData = {
    baseROI,
    pessimisticROI,
    breakEvenYears,
    netAfterMortgage,
    fiveYearTotal
  };

  // ===============================
  // SUGGERIMENTI INTELLIGENTI
  // ===============================

  let suggestion = "";
  let color = "#22c55e";

  if (baseROI < 4) {
    suggestion = window.currentLang === "it"
      ? "ROI basso. Serve ottimizzare prezzo medio o ridurre costi."
      : "Low ROI. Consider increasing nightly rate or reducing costs.";
    color = "#ef4444";
  }
  else if (baseROI < 8) {
    suggestion = window.currentLang === "it"
      ? "Investimento prudente. Stabilità dipende dall'occupazione."
      : "Prudent investment. Stability depends on occupancy rate.";
    color = "#f59e0b";
  }
  else {
    suggestion = window.currentLang === "it"
      ? "Ottimo equilibrio tra rischio e rendimento."
      : "Strong balance between risk and return.";
    color = "#22c55e";
  }

  resultsDiv.innerHTML = `
    <div class="result-card">
      <h4>📊 ${window.currentLang === "it"
        ? "Analisi Strategica Professionale"
        : "Professional Strategic Analysis"}</h4>

      <div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:10px;">
        <div><strong>ROI:</strong> ${baseROI.toFixed(2)}%</div>
        <div><strong>Break-even:</strong> ${breakEvenYears.toFixed(1)} ${window.currentLang === "it" ? "anni" : "years"}</div>
        <div><strong>${window.currentLang === "it" ? "Scenario stress" : "Stress scenario"}:</strong> ${pessimisticROI.toFixed(2)}%</div>
      </div>

      <div style="margin-top:15px;padding:10px;border-radius:8px;background:rgba(255,255,255,0.05);border-left:4px solid ${color}">
        ${suggestion}
      </div>

      <div style="margin-top:15px;font-size:14px;opacity:0.8;">
        ${window.currentLang === "it"
          ? `Utile netto annuo stimato: ${formatCurrency(netAfterMortgage)}<br>
             Proiezione 5 anni: ${formatCurrency(fiveYearTotal)}`
          : `Estimated annual net profit: ${formatCurrency(netAfterMortgage)}<br>
             5-year projection: ${formatCurrency(fiveYearTotal)}`}
      </div>

      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 ${window.currentLang === "it"
          ? "Genera Report Strategico Completo"
          : "Generate Full Strategic Report"}
      </button>
    </div>
  `;

  // ===============================
  // GRAFICO
  // ===============================

  if (!chartCanvas) return;
  if (roiChartInstance) roiChartInstance.destroy();

  roiChartInstance = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: window.currentLang === "it"
        ? ['Anno 1','Anno 2','Anno 3','Anno 4','Anno 5']
        : ['Year 1','Year 2','Year 3','Year 4','Year 5'],
      datasets: [{
        label: window.currentLang === "it"
          ? 'Utile cumulativo'
          : 'Cumulative profit',
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
// PDF PROFESSIONALE
// ===============================

function generatePDF() {

  if (!window.lastAnalysisData) return;

  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF();

  const d = window.lastAnalysisData;
  const isIT = window.currentLang === "it";

  let y = 20;

  pdf.setFontSize(20);
  pdf.text("RendimentoBB - Executive Investment Report", 20, y);

  y += 12;

  pdf.setFontSize(11);

  const text = isIT
    ? `
ROI annuo stimato: ${d.baseROI.toFixed(2)}%
Break-even: ${d.breakEvenYears.toFixed(1)} anni
Scenario stress: ${d.pessimisticROI.toFixed(2)}%

Utile netto annuo: ${formatCurrency(d.netAfterMortgage)}
Proiezione 5 anni: ${formatCurrency(d.fiveYearTotal)}

Questo report è generato automaticamente dal sistema RendimentoBB.
`
    : `
Estimated annual ROI: ${d.baseROI.toFixed(2)}%
Break-even: ${d.breakEvenYears.toFixed(1)} years
Stress scenario: ${d.pessimisticROI.toFixed(2)}%

Annual net profit: ${formatCurrency(d.netAfterMortgage)}
5-year projection: ${formatCurrency(d.fiveYearTotal)}

This report was automatically generated by RendimentoBB system.
`;

  const lines = pdf.splitTextToSize(text, 170);
  pdf.text(lines, 20, y);

  pdf.save(isIT
    ? "RendimentoBB_Report_IT.pdf"
    : "RendimentoBB_Report_EN.pdf");
}
