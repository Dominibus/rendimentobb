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

  const roiTargetInput = document.getElementById("roiTarget");
  const TARGET_ROI = roiTargetInput && roiTargetInput.value
    ? parseFloat(roiTargetInput.value)
    : DEFAULT_TARGET_ROI;

  const resultsDiv = document.getElementById("results");

  if (isNaN(price) || isNaN(occupancy) || isNaN(expenses) || isNaN(commission) || isNaN(tax)) {
    resultsDiv.innerHTML = translations[currentLang].invalidValues;
    return;
  }

  // =========================
  // BASE BUSINESS CALCULATION
  // =========================

  const nights = 30 * (occupancy / 100);
  const gross = price * nights;
  const platformFees = gross * (commission / 100);
  const profitBeforeTax = gross - expenses - platformFees;
  const taxes = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
  const netMonthly = profitBeforeTax - taxes;
  const netYearly = netMonthly * 12;

  // =========================
  // LOAN CALCULATION
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

  const yearlyLoanCost = monthlyLoanPayment * 12;
  const realYearlyCashflow = netYearly - yearlyLoanCost;

  let roi = 0;
  let breakEvenYears = 0;

  if (!isNaN(equity) && equity > 0) {
    roi = (realYearlyCashflow / equity) * 100;
    breakEvenYears = realYearlyCashflow > 0
      ? equity / realYearlyCashflow
      : -1;
  }

  // =========================
  // BASE OUTPUT
  // =========================

  let baseOutput = `
    <div>
      ${currentLang === "it" ? "Guadagno netto annuale:" : "Net yearly profit:"}
      <strong>${formatCurrency(netYearly)}</strong>
    </div>
  `;

  let proOutput = "";

  if (isProUnlocked) {

    // =========================
    // TARGET ANALYSIS
    // =========================

    const targetYearlyReturn = (equity * TARGET_ROI) / 100;
    const neededCashflow = targetYearlyReturn;

    const neededNetYearly = neededCashflow + yearlyLoanCost;
    const neededNetMonthly = neededNetYearly / 12;

    const neededGrossMonthly =
      (neededNetMonthly + expenses) /
      (1 - commission / 100) /
      (1 - tax / 100);

    const neededPrice = nights > 0
      ? neededGrossMonthly / nights
      : 0;

    const neededOccupancy =
      price > 0
        ? (neededGrossMonthly / price) / 30 * 100
        : 0;

    // =========================
    // PREZZO MASSIMO IMMOBILE
    // =========================

    const sustainableCashflow = targetYearlyReturn;
    const sustainableMortgage = netYearly - sustainableCashflow;

    let maxLoanSupported = 0;

    if (loanRate > 0 && loanYears > 0 && sustainableMortgage > 0) {
      const monthlyRate = (loanRate / 100) / 12;
      const totalPayments = loanYears * 12;

      maxLoanSupported =
        (sustainableMortgage / 12) *
        ((Math.pow(1 + monthlyRate, totalPayments) - 1) /
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)));
    }

    const maxPropertyPrice = maxLoanSupported + equity;

    // =========================
    // RISK ANALYSIS
    // =========================

    let riskMessage = "";
    let riskClass = "positive";

    if (realYearlyCashflow < 0) {
      riskClass = "negative";
      riskMessage = currentLang === "it"
        ? "🔴 Cashflow negativo. Alto rischio."
        : "🔴 Negative cashflow. High risk.";
    } else if (roi < 5) {
      riskClass = "negative";
      riskMessage = currentLang === "it"
        ? "🟠 ROI basso. Margine debole."
        : "🟠 Low ROI. Weak margin.";
    } else if (breakEvenYears > 20) {
      riskClass = "negative";
      riskMessage = currentLang === "it"
        ? "🟡 Recupero troppo lungo."
        : "🟡 Very long break-even.";
    } else {
      riskClass = "positive";
      riskMessage = currentLang === "it"
        ? "🟢 Investimento sostenibile."
        : "🟢 Sustainable investment.";
    }

    proOutput = `
      <br>

      <div>
        ${currentLang === "it" ? "Rata mutuo mensile:" : "Monthly loan payment:"}
        ${formatCurrency(monthlyLoanPayment)}
      </div>

      <div>
        ${currentLang === "it" ? "Cashflow reale annuo:" : "Real yearly cashflow:"}
        ${formatCurrency(realYearlyCashflow)}
      </div>

      <div>ROI: ${roi.toFixed(2)} %</div>

      <div>
        ${currentLang === "it" ? "Anni per rientrare:" : "Break-even years:"}
        ${breakEvenYears > 0 ? breakEvenYears.toFixed(1) : "-"}
      </div>

      <hr style="margin:15px 0; border:1px solid #334155;">

      <div style="font-weight:bold;">
        ${currentLang === "it"
          ? `Analisi target (ROI ${TARGET_ROI}%)`
          : `Target analysis (${TARGET_ROI}% ROI)`}
      </div>

      <div>
        ${currentLang === "it"
          ? "Prezzo minimo consigliato a notte:"
          : "Recommended minimum nightly price:"}
        ${formatCurrency(neededPrice)}
      </div>

      <div>
        ${currentLang === "it"
          ? "Occupazione minima necessaria:"
          : "Required minimum occupancy:"}
        ${neededOccupancy.toFixed(1)} %
      </div>

      <hr style="margin:15px 0; border:1px solid #334155;">

      <div style="font-weight:bold;">
        ${currentLang === "it"
          ? "Prezzo massimo immobile consigliato:"
          : "Maximum recommended property price:"}
        ${formatCurrency(maxPropertyPrice)}
      </div>

      <br>

      <div class="${riskClass}">
        <strong>${riskMessage}</strong>
      </div>
    `;
  } else {

    proOutput = `
      <br>
      <div style="color:#94a3b8;">
        ${currentLang === "it"
          ? "Sblocca PRO per vedere ROI avanzato, prezzo massimo immobile e analisi rischio."
          : "Unlock PRO to see advanced ROI, max property price and risk analysis."}
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
