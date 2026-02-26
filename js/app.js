let isProUnlocked = false;

function unlockPro() {
  const code = prompt("Enter PRO access code:");
  if (code === "BBPRO2025") {
    isProUnlocked = true;
    alert("PRO unlocked successfully!");
  } else {
    alert("Invalid code.");
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat(currentLang === "it" ? "it-IT" : "en-US", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function calculate() {

  // ===== BASE =====
  const price = parseFloat(document.getElementById("price").value);
  const occupancy = parseFloat(document.getElementById("occupancy").value);
  const expenses = parseFloat(document.getElementById("expenses").value);
  const commission = parseFloat(document.getElementById("commission").value);
  const tax = parseFloat(document.getElementById("tax").value);

  const resultsDiv = document.getElementById("results");

  if (isNaN(price) || isNaN(occupancy) || isNaN(expenses) || isNaN(commission) || isNaN(tax)) {
    resultsDiv.innerHTML = translations[currentLang].invalidValues;
    return;
  }

  const nights = 30 * (occupancy / 100);
  const gross = price * nights;
  const platformFees = gross * (commission / 100);
  const profitBeforeTax = gross - expenses - platformFees;
  const taxes = profitBeforeTax * (tax / 100);
  const netMonthly = profitBeforeTax - taxes;
  const netYearly = netMonthly * 12;

  // ===== INVESTMENT =====
  const equity = parseFloat(document.getElementById("equity").value);
  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  const loanRate = parseFloat(document.getElementById("loanRate").value);
  const loanYears = parseFloat(document.getElementById("loanYears").value);

  let monthlyLoanPayment = 0;

  if (!isNaN(loanAmount) && !isNaN(loanRate) && !isNaN(loanYears)) {
    const monthlyRate = (loanRate / 100) / 12;
    const totalPayments = loanYears * 12;

    monthlyLoanPayment = loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }

  const yearlyLoanCost = monthlyLoanPayment * 12;
  const realYearlyCashflow = netYearly - yearlyLoanCost;

  let roi = 0;
  let breakEvenYears = 0;

  if (!isNaN(equity) && equity > 0) {
    roi = (realYearlyCashflow / equity) * 100;
    breakEvenYears = equity / realYearlyCashflow;
  }

  // ===== RENDER =====

  let baseOutput = `
    <div>${currentLang === "it" ? "Guadagno netto annuale:" : "Net yearly profit:"}
    ${formatCurrency(netYearly)}</div>
  `;

  let proOutput = "";

  if (isProUnlocked) {
    const netClass = realYearlyCashflow >= 0 ? "positive" : "negative";

    proOutput = `
      <br>
      <div>${currentLang === "it" ? "Rata mutuo mensile:" : "Monthly loan payment:"}
      ${formatCurrency(monthlyLoanPayment)}</div>

      <div>${currentLang === "it" ? "Cashflow reale annuo:" : "Real yearly cashflow:"}
      ${formatCurrency(realYearlyCashflow)}</div>

      <div class="${netClass}">
      ROI: ${roi.toFixed(2)} %
      </div>

      <div class="${netClass}">
      ${currentLang === "it" ? "Anni per rientrare:" : "Break-even years:"}
      ${breakEvenYears.toFixed(2)}
      </div>
    `;
  } else {
    proOutput = `
      <br>
      <div style="color:#94a3b8;">
      ${currentLang === "it"
        ? "Sblocca PRO per vedere ROI e Break-even."
        : "Unlock PRO to see ROI and Break-even analysis."}
      </div>
      <br>
      <button onclick="unlockPro()" class="calculate">
        ${currentLang === "it" ? "Sblocca PRO" : "Unlock PRO"}
      </button>
    `;
  }

  resultsDiv.innerHTML = baseOutput + proOutput;
}
