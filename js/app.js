let isProUnlocked = false;
const DEFAULT_TARGET_ROI = 8;

function unlockPro() {
  const code = prompt(currentLang === "it"
    ? "Inserisci il codice di accesso PRO:"
    : "Enter PRO access code:");

  if (code === "BBPRO2025") {
    isProUnlocked = true;
    alert(currentLang === "it"
      ? "PRO sbloccato con successo!"
      : "PRO unlocked successfully!");
  } else {
    alert(currentLang === "it"
      ? "Codice non valido."
      : "Invalid code.");
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

  const familyIncome = parseFloat(document.getElementById("familyIncome")?.value);
  const stressOccupancy = parseFloat(document.getElementById("stressOccupancy")?.value);
  const stressExpenses = parseFloat(document.getElementById("stressExpenses")?.value);
  const stressRate = parseFloat(document.getElementById("stressRate")?.value);

  const roiTargetInput = document.getElementById("roiTarget");
  const TARGET_ROI = roiTargetInput && roiTargetInput.value
    ? parseFloat(roiTargetInput.value)
    : DEFAULT_TARGET_ROI;

  const resultsDiv = document.getElementById("results");

  if (isNaN(price) || isNaN(occupancy) || isNaN(expenses) || isNaN(commission) || isNaN(tax)) {
    resultsDiv.innerHTML = translations[currentLang].invalidValues;
    return;
  }

  // =====================
  // BASE CALCULATION
  // =====================

  const nights = 30 * (occupancy / 100);
  const gross = price * nights;
  const platformFees = gross * (commission / 100);
  const profitBeforeTax = gross - expenses - platformFees;
  const taxes = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
  const netMonthly = profitBeforeTax - taxes;
  const netYearly = netMonthly * 12;

  // =====================
  // LOAN
  // =====================

  let monthlyLoanPayment = 0;

  if (!isNaN(loanAmount) && !isNaN(loanRate) && !isNaN(loanYears) && loanRate > 0) {
    const monthlyRate = (loanRate / 100) / 12;
    const totalPayments = loanYears * 12;

    monthlyLoanPayment =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }

  const yearlyLoanCost = monthlyLoanPayment * 12;
  const realYearlyCashflow = netYearly - yearlyLoanCost;

  let roi = 0;
  let breakEvenYears = -1;

  if (!isNaN(equity) && equity > 0) {
    roi = (realYearlyCashflow / equity) * 100;
    if (realYearlyCashflow > 0) {
      breakEvenYears = equity / realYearlyCashflow;
    }
  }

  // =====================
  // BASE OUTPUT
  // =====================

  let baseOutput = `
    <div>
      ${currentLang === "it" ? "Guadagno netto annuale:" : "Net yearly profit:"}
      <strong>${formatCurrency(netYearly)}</strong>
    </div>
  `;

  let proOutput = "";

  if (isProUnlocked) {

    // =====================
    // STRESS TEST
    // =====================

    const stressedOccupancy = occupancy + (occupancy * (stressOccupancy || 0) / 100);
    const stressedExpenses = expenses + (expenses * (stressExpenses || 0) / 100);
    const stressedRate = loanRate + (stressRate || 0);

    const stressedNights = 30 * (stressedOccupancy / 100);
    const stressedGross = price * stressedNights;
    const stressedFees = stressedGross * (commission / 100);
    const stressedProfitBeforeTax = stressedGross - stressedExpenses - stressedFees;
    const stressedTaxes = stressedProfitBeforeTax > 0 ? stressedProfitBeforeTax * (tax / 100) : 0;
    const stressedNetYearly = (stressedProfitBeforeTax - stressedTaxes) * 12;

    let stressedMonthlyLoan = 0;

    if (loanAmount && stressedRate > 0 && loanYears > 0) {
      const mRate = (stressedRate / 100) / 12;
      const totalPayments = loanYears * 12;
      stressedMonthlyLoan =
        loanAmount *
        (mRate * Math.pow(1 + mRate, totalPayments)) /
        (Math.pow(1 + mRate, totalPayments) - 1);
    }

    const stressedCashflow = stressedNetYearly - (stressedMonthlyLoan * 12);

    // =====================
    // IMPACT ON FAMILY INCOME
    // =====================

    let incomeImpact = 0;
    if (!isNaN(familyIncome) && familyIncome > 0) {
      incomeImpact = Math.abs(stressedCashflow / (familyIncome * 12)) * 100;
    }

    // =====================
    // SOLIDITY SCORE (0–100)
    // =====================

    let solidity = 100;

    if (realYearlyCashflow < 0) solidity -= 40;
    if (roi < TARGET_ROI) solidity -= 20;
    if (breakEvenYears > 20) solidity -= 15;
    if (incomeImpact > 20) solidity -= 15;
    if (stressedCashflow < 0) solidity -= 10;

    if (solidity < 0) solidity = 0;

    let solidityClass = "positive";
    if (solidity < 50) solidityClass = "negative";

    // =====================
    // TARGET ANALYSIS
    // =====================

    const targetYearlyReturn = (equity * TARGET_ROI) / 100;
    const neededNetYearly = targetYearlyReturn + yearlyLoanCost;
    const neededNetMonthly = neededNetYearly / 12;

    const neededGrossMonthly =
      (neededNetMonthly + expenses) /
      (1 - commission / 100) /
      (1 - tax / 100);

    const neededPrice = nights > 0 ? neededGrossMonthly / nights : 0;

    // =====================
    // OUTPUT
    // =====================

    proOutput = `
      <br>

      <div>${currentLang === "it" ? "Rata mutuo mensile:" : "Monthly loan payment:"}
        ${formatCurrency(monthlyLoanPayment)}</div>

      <div>${currentLang === "it" ? "Cashflow reale annuo:" : "Real yearly cashflow:"}
        ${formatCurrency(realYearlyCashflow)}</div>

      <div>ROI: ${roi.toFixed(2)} %</div>

      <div>${currentLang === "it" ? "Anni per rientrare:" : "Break-even years:"}
        ${breakEvenYears > 0 ? breakEvenYears.toFixed(1) : "-"}</div>

      <hr style="margin:15px 0; border:1px solid #334155;">

      <div style="font-weight:bold;">
        ${currentLang === "it" ? "Stress Test (Scenario Pessimistico)" : "Stress Test (Worst Scenario)"}
      </div>

      <div>${currentLang === "it" ? "Cashflow scenario critico:" : "Worst case cashflow:"}
        ${formatCurrency(stressedCashflow)}</div>

      <div>${currentLang === "it" ? "Impatto su reddito familiare:" : "Impact on family income:"}
        ${incomeImpact.toFixed(1)} %</div>

      <hr style="margin:15px 0; border:1px solid #334155;">

      <div style="font-weight:bold;">
        ${currentLang === "it" ? "Analisi target" : "Target analysis"}
      </div>

      <div>${currentLang === "it" ? "Prezzo minimo consigliato:" : "Recommended nightly price:"}
        ${formatCurrency(neededPrice)}</div>

      <hr style="margin:15px 0; border:1px solid #334155;">

      <div class="${solidityClass}">
        <strong>
        ${currentLang === "it" ? "Indice solidità investimento:" : "Investment solidity score:"}
        ${solidity}/100
        </strong>
      </div>
    `;

  } else {

    proOutput = `
      <br>
      <div style="color:#94a3b8;">
        ${currentLang === "it"
          ? "Sblocca PRO per stress test, impatto reddito e indice solidità."
          : "Unlock PRO for stress test, income impact and solidity index."}
      </div>
      <br>
      <button onclick="unlockPro()" class="calculate">
        ${currentLang === "it"
          ? "Sblocca PRO (€19)"
          : "Unlock PRO (€19)"}
      </button>
    `;
  }

  resultsDiv.innerHTML = baseOutput + proOutput;
}
