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
    { style: "currency", currency: "EUR" }
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

  // ================= BASE =================

  const nights = 30 * (occupancy / 100);
  const gross = price * nights;
  const platformFees = gross * (commission / 100);
  const profitBeforeTax = gross - expenses - platformFees;
  const taxes = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
  const netMonthly = profitBeforeTax - taxes;
  const netYearly = netMonthly * 12;

  // ================= LOAN =================

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

  let baseOutput = `
    <div>
      ${currentLang === "it" ? "Guadagno netto annuale:" : "Net yearly profit:"}
      <strong>${formatCurrency(netYearly)}</strong>
    </div>
  `;

  let proOutput = "";

  if (isProUnlocked) {

    // ========== STRESS TEST ==========

    const stressedOccupancy = occupancy + (occupancy * (stressOccupancy || 0) / 100);
    const stressedExpenses = expenses + (expenses * (stressExpenses || 0) / 100);
    const stressedRate = loanRate + (stressRate || 0);

    const stressedNights = 30 * (stressedOccupancy / 100);
    const stressedGross = price * stressedNights;
    const stressedFees = stressedGross * (commission / 100);
    const stressedProfit = stressedGross - stressedExpenses - stressedFees;
    const stressedTaxes = stressedProfit > 0 ? stressedProfit * (tax / 100) : 0;
    const stressedNetYearly = (stressedProfit - stressedTaxes) * 12;

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

    // ========== IMPACT ==========

    let incomeImpact = 0;
    if (!isNaN(familyIncome) && familyIncome > 0) {
      incomeImpact = Math.abs(stressedCashflow / (familyIncome * 12)) * 100;
    }

    // ========== RATING BANCARIO ==========

    let rating = "A";

    if (realYearlyCashflow < 0 || stressedCashflow < 0) rating = "E";
    else if (roi < 4 || incomeImpact > 25) rating = "D";
    else if (roi < TARGET_ROI) rating = "C";
    else if (roi >= TARGET_ROI && incomeImpact < 15) rating = "B";
    else rating = "A";

    // ========== ALERT INTELLIGENTI ==========

    let alertMessage = "";

    if (realYearlyCashflow < 0) {
      alertMessage = "⚠ Cashflow negativo: potresti dover coprire il mutuo con il tuo stipendio.";
    } else if (incomeImpact > 20) {
      alertMessage = "⚠ Impatto elevato sul reddito familiare.";
    } else if (breakEvenYears > 20) {
      alertMessage = "⚠ Recupero investimento molto lungo.";
    } else {
      alertMessage = "✔ Investimento finanziariamente sostenibile.";
    }

    proOutput = `
      <br>
      <div>ROI: ${roi.toFixed(2)} %</div>
      <div>Rating investimento: <strong>${rating}</strong></div>
      <div>${alertMessage}</div>

      <hr style="margin:15px 0; border:1px solid #334155;">

      <div>Stress test cashflow: ${formatCurrency(stressedCashflow)}</div>
      <div>Impatto reddito: ${incomeImpact.toFixed(1)} %</div>

      <hr style="margin:15px 0; border:1px solid #334155;">

      <div>Break-even: ${breakEvenYears > 0 ? breakEvenYears.toFixed(1) + " anni" : "-"}</div>
    `;
  } else {
    proOutput = `
      <br>
      <div style="color:#94a3b8;">
        Sblocca PRO per rating bancario, stress test avanzato e analisi rischio reale.
      </div>
      <br>
      <button onclick="unlockPro()" class="calculate">
        Sblocca PRO (€19)
      </button>
    `;
  }

  resultsDiv.innerHTML = baseOutput + proOutput;
}
