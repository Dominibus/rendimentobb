let isProUnlocked = false;

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

  // ===== BASE INPUT =====
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

  // ===== BASE CALCULATION =====
  const nights = 30 * (occupancy / 100);
  const gross = price * nights;
  const platformFees = gross * (commission / 100);
  const profitBeforeTax = gross - expenses - platformFees;
  const taxes = profitBeforeTax * (tax / 100);
  const netMonthly = profitBeforeTax - taxes;
  const netYearly = netMonthly * 12;

  // ===== INVESTMENT INPUT =====
  const equity = parseFloat(document.getElementById("equity").value);
  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  const loanRate = parseFloat(document.getElementById("loanRate").value);
  const loanYears = parseFloat(document.getElementById("loanYears").value);

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
    breakEvenYears = realYearlyCashflow !== 0
      ? equity / realYearlyCashflow
      : 0;
  }

  // ===== BASE OUTPUT =====
  let baseOutput = `
    <div>
      ${currentLang === "it" ? "Guadagno netto annuale:" : "Net yearly profit:"}
      <strong>${formatCurrency(netYearly)}</strong>
    </div>
  `;

  // ===== PRO SECTION =====
  let proOutput = "";

  if (isProUnlocked) {

    let verdict = "";
    let verdictClass = "";

    // ===== SMART VERDICT =====
    if (roi > 12) {
      verdictClass = "positive";
      verdict = currentLang === "it"
        ? "🟢 Ottimo investimento! Potresti rientrare in tempi interessanti."
        : "🟢 Excellent investment! Payback time looks attractive.";
    }
    else if (roi > 6) {
      verdictClass = "positive";
      verdict = currentLang === "it"
        ? "🟡 Investimento discreto. Valuta bene rischi e mercato."
        : "🟡 Decent investment. Evaluate risks and local demand.";
    }
    else if (roi > 0) {
      verdictClass = "negative";
      verdict = currentLang === "it"
        ? "⚠️ Investimento rischioso. Margine di sicurezza basso."
        : "⚠️ Risky investment. Low safety margin.";
    }
    else {
      verdictClass = "negative";
      verdict = currentLang === "it"
        ? "🔴 Non conveniente. Potresti non rientrare dell’investimento."
        : "🔴 Not convenient. You may not recover your investment.";
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

      <div>
        ROI: ${roi.toFixed(2)} %
      </div>

      <div>
        ${currentLang === "it" ? "Anni per rientrare:" : "Break-even years:"}
        ${breakEvenYears > 0 ? breakEvenYears.toFixed(1) : "-"}
      </div>

      <br>
      <div class="${verdictClass}" style="margin-top:10px;">
        <strong>${verdict}</strong>
      </div>

      <br>
      <div style="font-size:13px; color:#94a3b8;">
        ${currentLang === "it"
          ? "Vuoi un’analisi professionale personalizzata? Contattami."
          : "Want a personalized professional investment analysis? Contact me."}
      </div>
    `;
  }
  else {
    proOutput = `
      <br>
      <div style="color:#94a3b8;">
        ${currentLang === "it"
          ? "Vuoi sapere se l'investimento è davvero profittevole? Sblocca l’analisi avanzata."
          : "Want to know if your investment is truly profitable? Unlock advanced analysis."}
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
