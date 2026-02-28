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

function calculate() {
  runRealCalculation();
}

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

  // Stress -10%
  const pessimisticOccupancy = occupancy * 0.9;
  const pessimisticNights = 30 * (pessimisticOccupancy / 100);
  const pessimisticGross = price * pessimisticNights * 12;
  const pessimisticFees = pessimisticGross * (commission / 100);
  const pessimisticProfit = pessimisticGross - pessimisticFees - yearlyExpenses;
  const pessimisticTax = pessimisticProfit > 0 ? pessimisticProfit * (tax / 100) : 0;
  const pessimisticNet = pessimisticProfit - pessimisticTax - mortgage.yearlyPayment;
  const pessimisticROI = (pessimisticNet / equity) * 100;

  lastAnalysisData = {
    baseROI,
    pessimisticROI,
    breakEvenYears,
    netAfterMortgage
  };

  resultsDiv.innerHTML = `
    <div class="result-card">
      <h4>📊 Analisi Strategica Professionale</h4>
      <div>ROI: <strong>${baseROI.toFixed(2)}%</strong></div>
      <div>Break-even: <strong>${breakEvenYears.toFixed(1)} anni</strong></div>
      <div>Scenario pessimistico: <strong>${pessimisticROI.toFixed(2)}%</strong></div>
      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 Genera Report Strategico Completo
      </button>
    </div>
  `;

  if (!chartCanvas) return;

  if (roiChartInstance) roiChartInstance.destroy();

  roiChartInstance = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: ['Anno 1','Anno 2','Anno 3','Anno 4','Anno 5'],
      datasets: [{
        label: 'Utile cumulativo',
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
      devicePixelRatio: 3, // 🔥 AUMENTA RISOLUZIONE
      plugins: { legend: { display: false } }
    }
  });
}

// ===============================
// PDF PROFESSIONALE PREMIUM
// ===============================

async function generatePDF() {

  if (!lastAnalysisData) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const d = lastAnalysisData;

  let y = 20;

  // ===============================
  // HEADER
  // ===============================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("RendimentoBB - Executive Investment Report", 20, y);

  y += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Sistema di analisi strategica per investimenti B&B", 20, y);

  y += 15;

  // ===============================
  // INDICATORE SINTETICO
  // ===============================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  let profileLabel = "Profilo Moderato";
  if (d.baseROI < 4) profileLabel = "Profilo Debole";
  else if (d.baseROI < 8) profileLabel = "Profilo Prudente";
  else if (d.baseROI < 15) profileLabel = "Profilo Buono";
  else profileLabel = "Profilo Elevato";

  pdf.text(`Valutazione sintetica: ${profileLabel}`, 20, y);

  y += 12;

  // ===============================
  // EXECUTIVE SUMMARY
  // ===============================

  pdf.setFont("helvetica", "bold");
  pdf.text("EXECUTIVE SUMMARY", 20, y);

  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  const executiveText = `
Questo investimento genera un rendimento annuo stimato del ${d.baseROI.toFixed(2)}%.

In termini semplici: per ogni 100€ investiti, il sistema prevede un ritorno di circa ${d.baseROI.toFixed(2)}€ l'anno.

Il capitale iniziale verrebbe recuperato in circa ${d.breakEvenYears.toFixed(1)} anni.

In uno scenario prudente (calo occupazione del 10%), il rendimento scenderebbe al ${d.pessimisticROI.toFixed(2)}%.
`;

  const execLines = pdf.splitTextToSize(executiveText, 170);
  pdf.text(execLines, 20, y);

  y += execLines.length * 6 + 12;

  // ===============================
  // RIEPILOGO NUMERICO CHIARO
  // ===============================

  pdf.setFont("helvetica", "bold");
  pdf.text("RIEPILOGO ECONOMICO", 20, y);

  y += 8;

  pdf.setFont("helvetica", "normal");

  const fiveYearTotal = d.netAfterMortgage * 5;

  pdf.text(`Utile netto annuo stimato: ${formatCurrency(d.netAfterMortgage)}`, 20, y);
  y += 7;

  pdf.text(`Proiezione utile netto a 5 anni: ${formatCurrency(fiveYearTotal)}`, 20, y);
  y += 7;

  pdf.text(`Tempo stimato recupero capitale: ${d.breakEvenYears.toFixed(1)} anni`, 20, y);

  y += 12;

  // ===============================
  // SPIEGAZIONE INTUITIVA
  // ===============================

  pdf.setFont("helvetica", "bold");
  pdf.text("INTERPRETAZIONE FACILE", 20, y);

  y += 8;

  pdf.setFont("helvetica", "normal");

  const simpleText = `
Se l'immobile mantiene l'attuale livello di occupazione,
l'investimento può generare un flusso di cassa positivo.

Il principale fattore di rischio è la stabilità dell'occupazione:
una riduzione significativa potrebbe comprimere i margini.

L'investimento non è ad alto rendimento speculativo,
ma può diventare stabile nel medio-lungo periodo.
`;

  const simpleLines = pdf.splitTextToSize(simpleText, 170);
  pdf.text(simpleLines, 20, y);

  y += simpleLines.length * 6 + 12;

  // ===============================
  // VALUTAZIONE FINALE FORTE
  // ===============================

  pdf.setFont("helvetica", "bold");
  pdf.text("VERDETTO STRATEGICO", 20, y);

  y += 8;

  pdf.setFont("helvetica", "normal");

  let finalVerdict = `
Operazione sostenibile ma con recupero capitale medio-lungo termine.

Adatta a investitori che cercano stabilità più che rendimento rapido.
`;

  if (d.baseROI >= 8) {
    finalVerdict = `
Operazione con buon equilibrio tra rischio e rendimento.

Adatta a investitori orientati alla crescita stabile.
`;
  }

  if (d.baseROI < 4) {
    finalVerdict = `
Operazione con rendimento limitato.

Richiede forte ottimizzazione gestionale per risultare interessante.
`;
  }

  const verdictLines = pdf.splitTextToSize(finalVerdict, 170);
  pdf.text(verdictLines, 20, y);

  y += verdictLines.length * 6 + 12;

  // ===============================
  // GRAFICO
  // ===============================

  const chartCanvas = document.getElementById("roiChart");
  if (chartCanvas) {
    const highResImage = chartCanvas.toDataURL("image/png", 1.0);
    pdf.addImage(highResImage, 'PNG', 20, y, 170, 90);
  }

  y += 95;

  // ===============================
  // FOOTER AUTOREVOLE
  // ===============================

  pdf.setFontSize(8);
  pdf.text(
    "Report generato automaticamente dal sistema RendimentoBB. Analisi basata sui dati inseriti dall'utente.",
    20,
    285
  );

  pdf.save("RendimentoBB_Executive_Report.pdf");
}
