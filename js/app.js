let isProUnlocked = false;

function unlockPro() {
  const code = prompt(
    currentLang === "it"
      ? "Inserisci il codice di accesso PRO:"
      : "Enter PRO access code:"
  );

  if (code === "BBPRO2025") {
    isProUnlocked = true;
    alert(
      currentLang === "it"
        ? "PRO sbloccato con successo!"
        : "PRO unlocked successfully!"
    );
    calculate();
  } else {
    alert(
      currentLang === "it"
        ? "Codice non valido."
        : "Invalid code."
    );
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat(
    currentLang === "it" ? "it-IT" : "en-US",
    {
      style: "currency",
      currency: "EUR"
    }
  ).format(value);
}

function calculate() {

  const price = parseFloat(document.getElementById("price").value);
  const occupancy = parseFloat(document.getElementById("occupancy").value);
  const expenses = parseFloat(document.getElementById("expenses").value);
  const commission = parseFloat(document.getElementById("commission").value);
  const tax = parseFloat(document.getElementById("tax").value);

  const equity = parseFloat(document.getElementById("equity").value);
  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  const loanRate = parseFloat(document.getElementById("loanRate").value);
  const loanYears = parseFloat(document.getElementById("loanYears").value);

  const familyIncome = parseFloat(document.getElementById("familyIncome").value);
  const stressOccupancy = parseFloat(document.getElementById("stressOccupancy").value);
  const stressExpenses = parseFloat(document.getElementById("stressExpenses").value);
  const stressRate = parseFloat(document.getElementById("stressRate").value);

  const resultsDiv = document.getElementById("results");

  if (isNaN(price) || isNaN(occupancy) || isNaN(expenses) || isNaN(commission) || isNaN(tax)) {
    resultsDiv.innerHTML =
      currentLang === "it"
        ? "Inserisci valori validi."
        : "Please enter valid values.";
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

  let output = `
    <hr>
    <h3>${currentLang === "it" ? "📊 Risultato Base" : "📊 Base Result"}</h3>
    <div>
      ${currentLang === "it" ? "Guadagno netto annuo:" : "Net yearly profit:"}
      <strong>${formatCurrency(netYearly)}</strong>
    </div>
  `;

  // =========================
  // LOAN
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
  // RISK SCORE
  // =========================

  let riskScore = 100;

  if (realYearlyCashflow < 0) riskScore -= 30;
  if (roi < 0) riskScore -= 25;
  else if (roi < 5) riskScore -= 15;
  if (breakEvenYears > 20) riskScore -= 15;
  if (stressedCashflow < 0) riskScore -= 20;

  if (familyIncome > 0 && monthlyLoanPayment / familyIncome > 0.35)
    riskScore -= 20;

  if (riskScore < 0) riskScore = 0;

  let riskLabel;
  let riskColor;

  if (riskScore >= 80) {
    riskLabel = currentLang === "it" ? "🟢 Investimento Solido" : "🟢 Solid Investment";
    riskColor = "#22c55e";
  } else if (riskScore >= 60) {
    riskLabel = currentLang === "it" ? "🟡 Zona Attenzione" : "🟡 Attention Zone";
    riskColor = "#eab308";
  } else if (riskScore >= 40) {
    riskLabel = currentLang === "it" ? "🟠 Investimento Rischioso" : "🟠 Risky Investment";
    riskColor = "#f97316";
  } else {
    riskLabel = currentLang === "it" ? "🔴 Investimento Pericoloso" : "🔴 Dangerous Investment";
    riskColor = "#ef4444";
  }

  output += `
    <hr>
    <h3>${currentLang === "it" ? "📊 Analisi Completa" : "📊 Full Analysis"}</h3>

    <div>${currentLang === "it" ? "Cashflow reale annuo:" : "Real yearly cashflow:"}
    <strong>${formatCurrency(realYearlyCashflow)}</strong></div>

    <div>ROI: <strong>${roi.toFixed(2)}%</strong></div>

    <div>${currentLang === "it" ? "Break-even (anni):" : "Break-even (years):"}
    <strong>${breakEvenYears > 0 ? breakEvenYears.toFixed(1) : "-"}</strong></div>

    <hr>

    <div>${currentLang === "it" ? "Cashflow scenario pessimistico:" : "Pessimistic scenario cashflow:"}
    <strong>${formatCurrency(stressedCashflow)}</strong></div>

    <hr>

    <div style="font-size:18px; color:${riskColor};">
      <strong>${currentLang === "it" ? "Indice Rischio:" : "Risk Index:"} ${riskScore}/100</strong>
    </div>

    <div style="color:${riskColor}; font-weight:bold;">
      ${riskLabel}
    </div>
  `;

  resultsDiv.innerHTML = output;
}
