let isProUnlocked = true; // lasciamo attivo per ora

function formatCurrency(value) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function calculate() {

  const price = parseFloat(document.getElementById("price").value);
  const occupancy = parseFloat(document.getElementById("occupancy").value);
  const expenses = parseFloat(document.getElementById("expenses").value);
  const commission = parseFloat(document.getElementById("commission").value);
  const tax = parseFloat(document.getElementById("tax").value);

  const propertyPrice = parseFloat(document.getElementById("propertyPrice").value);
  const equity = parseFloat(document.getElementById("equity").value);
  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  const loanRate = parseFloat(document.getElementById("loanRate").value);
  const loanYears = parseFloat(document.getElementById("loanYears").value);

  const familyIncome = parseFloat(document.getElementById("familyIncome").value);
  const roiTarget = parseFloat(document.getElementById("roiTarget").value);

  const stressOccupancy = parseFloat(document.getElementById("stressOccupancy").value);
  const stressExpenses = parseFloat(document.getElementById("stressExpenses").value);
  const stressRate = parseFloat(document.getElementById("stressRate").value);

  const resultsDiv = document.getElementById("results");

  if (isNaN(price) || isNaN(occupancy) || isNaN(expenses) || isNaN(commission) || isNaN(tax)) {
    resultsDiv.innerHTML = "Inserisci valori validi.";
    return;
  }

  // =========================
  // BASE BUSINESS
  // =========================

  const nights = 30 * (occupancy / 100);
  const gross = price * nights;
  const platformFees = gross * (commission / 100);
  const profitBeforeTax = gross - expenses - platformFees;
  const taxes = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
  const netMonthly = profitBeforeTax - taxes;
  const netYearly = netMonthly * 12;

  // =========================
  // MUTUO
  // =========================

  let monthlyLoanPayment = 0;

  if (!isNaN(loanAmount) && !isNaN(loanRate) && !isNaN(loanYears) && loanRate > 0) {
    const monthlyRate = (loanRate / 100) / 12;
    const totalPayments = loanYears * 12;

    monthlyLoanPayment =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }

  const realYearlyCashflow = netYearly - (monthlyLoanPayment * 12);

  let roi = 0;
  let breakEvenYears = -1;

  if (!isNaN(equity) && equity > 0) {
    roi = (realYearlyCashflow / equity) * 100;
    if (realYearlyCashflow > 0) {
      breakEvenYears = equity / realYearlyCashflow;
    }
  }

  // =========================
  // STRESS TEST
  // =========================

  const stressedOcc = occupancy + (occupancy * stressOccupancy / 100);
  const stressedExp = expenses + (expenses * stressExpenses / 100);
  const stressedRate = loanRate + stressRate;

  const stressedNights = 30 * (stressedOcc / 100);
  const stressedGross = price * stressedNights;
  const stressedFees = stressedGross * (commission / 100);
  const stressedProfit = stressedGross - stressedExp - stressedFees;
  const stressedTaxes = stressedProfit > 0 ? stressedProfit * (tax / 100) : 0;
  const stressedNetYearly = (stressedProfit - stressedTaxes) * 12;

  let stressedLoan = 0;

  if (loanAmount && stressedRate > 0 && loanYears > 0) {
    const mRate = (stressedRate / 100) / 12;
    const totalPayments = loanYears * 12;
    stressedLoan =
      loanAmount *
      (mRate * Math.pow(1 + mRate, totalPayments)) /
      (Math.pow(1 + mRate, totalPayments) - 1);
  }

  const stressedCashflow = stressedNetYearly - (stressedLoan * 12);

  // =========================
  // INDICE RISCHIO
  // =========================

  let riskScore = 100;

  if (realYearlyCashflow < 0) riskScore -= 30;

  if (roi < 0) {
    riskScore -= 25;
  } else if (roi < 5) {
    riskScore -= 15;
  }

  if (breakEvenYears > 20) riskScore -= 15;

  if (stressedCashflow < 0) riskScore -= 20;

  if (familyIncome > 0 && monthlyLoanPayment / familyIncome > 0.35) {
    riskScore -= 20;
  }

  if (riskScore < 0) riskScore = 0;

  let riskLabel = "";
  let riskColor = "";

  if (riskScore >= 80) {
    riskLabel = "🟢 Investimento Solido";
    riskColor = "#22c55e";
  } else if (riskScore >= 60) {
    riskLabel = "🟡 Zona Attenzione";
    riskColor = "#eab308";
  } else if (riskScore >= 40) {
    riskLabel = "🟠 Investimento Rischioso";
    riskColor = "#f97316";
  } else {
    riskLabel = "🔴 Investimento Pericoloso";
    riskColor = "#ef4444";
  }

  // =========================
  // OUTPUT
  // =========================

  resultsDiv.innerHTML = `
    <hr>
    <h3>📊 Risultato Analisi</h3>

    <div>Guadagno netto annuo: <strong>${formatCurrency(netYearly)}</strong></div>
    <div>Cashflow reale annuo: <strong>${formatCurrency(realYearlyCashflow)}</strong></div>
    <div>ROI: <strong>${roi.toFixed(2)} %</strong></div>
    <div>Break-even: <strong>${breakEvenYears > 0 ? breakEvenYears.toFixed(1) + " anni" : "-"}</strong></div>

    <hr>

    <div>Cashflow scenario pessimistico: <strong>${formatCurrency(stressedCashflow)}</strong></div>

    <hr>

    <div style="font-size:18px; margin-top:10px; color:${riskColor};">
      <strong>Indice Rischio: ${riskScore}/100</strong>
    </div>
    <div style="font-weight:bold; color:${riskColor};">
      ${riskLabel}
    </div>
  `;
}
