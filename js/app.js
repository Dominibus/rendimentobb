// ===============================
// PRO STATUS INIT
// ===============================

let isProUnlocked = localStorage.getItem("proUnlocked") === "true";

// Auto unlock from Stripe redirect
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("pro") === "paid") {
  isProUnlocked = true;
  localStorage.setItem("proUnlocked", "true");
}

// 🔥 INSERISCI QUI IL TUO LINK STRIPE LIVE QUANDO PRONTO
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200";

// ===============================
// UNLOCK PRO (Redirect to Stripe)
// ===============================

function unlockPro() {
  window.location.href = STRIPE_PAYMENT_LINK;
}

// ===============================
// FORMAT CURRENCY
// ===============================

function formatCurrency(value) {
  return new Intl.NumberFormat(
    currentLang === "it" ? "it-IT" : "en-US",
    {
      style: "currency",
      currency: "EUR"
    }
  ).format(value);
}

// ===============================
// CALCULATE
// ===============================

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
    ${isProUnlocked ? `
      <div style="
        background:#052e16;
        padding:12px;
        border-radius:8px;
        margin-bottom:15px;
        color:#86efac;
        font-size:13px;
      ">
        ✅ Versione PRO attiva — Analisi completa disponibile
      </div>
    ` : ``}

    <div class="result-card">
      <h4>${currentLang === "it" ? "📊 Risultato Base" : "📊 Base Result"}</h4>
      <div>
        ${currentLang === "it" ? "Guadagno netto annuo:" : "Net yearly profit:"}
        <strong>${formatCurrency(netYearly)}</strong>
      </div>
    </div>
  `;

  // =========================
  // 🔒 BLOCCO PRO PERSUASIVO
  // =========================

  if (!isProUnlocked) {

    output += `
      <div style="
        margin-top:20px;
        padding:20px;
        background:#111827;
        border-radius:12px;
        border:1px solid #334155;
        color:#e2e8f0;
      ">

        <h3 style="margin-top:0;color:#22c55e;">
          🔒 Analisi Completa Bloccata
        </h3>

        <p style="font-size:14px;line-height:1.6;">
          Stai valutando un investimento che può superare i <strong>100.000€</strong>.
          Decidere senza analisi completa significa esporsi a errori
          che possono costare decine di migliaia di euro.
        </p>

        <ul style="font-size:14px;line-height:1.8;padding-left:18px;">
          <li>✔ ROI reale con mutuo ed equity</li>
          <li>✔ Cashflow effettivo dopo rata bancaria</li>
          <li>✔ Break-even reale</li>
          <li>✔ Scenario pessimistico automatico</li>
          <li>✔ Indice di rischio 0–100</li>
        </ul>

        <p style="margin-top:15px;font-size:14px;">
          <strong>19€ per evitare un errore da 50.000€.</strong>
        </p>

        <button onclick="unlockPro()" 
          style="
            width:100%;
            margin-top:15px;
            padding:12px;
            border:none;
            border-radius:8px;
            background:#22c55e;
            color:black;
            font-weight:bold;
            cursor:pointer;
            font-size:15px;
          ">
          🔓 Sblocca Analisi Completa – 19€
        </button>

        <p style="margin-top:10px;font-size:12px;color:#94a3b8;">
          Accesso immediato dopo il pagamento.
        </p>

      </div>
    `;

    resultsDiv.innerHTML = output;
    return;
  }

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

  let badgeClass =
    riskScore >= 80
      ? "security-safe"
      : riskScore >= 60
      ? "security-warning"
      : "security-danger";

  let riskLabel =
    riskScore >= 80
      ? (currentLang === "it" ? "Investimento Solido" : "Solid Investment")
      : riskScore >= 60
      ? (currentLang === "it" ? "Zona Attenzione" : "Attention Zone")
      : (currentLang === "it" ? "Investimento Rischioso" : "Risky Investment");

  output += `
    <div class="result-card">
      <h4>${currentLang === "it" ? "📊 Analisi Completa" : "📊 Full Analysis"}</h4>
      <div>ROI: <strong>${roi.toFixed(2)}%</strong></div>
      <div>${currentLang === "it" ? "Cashflow reale annuo:" : "Real yearly cashflow:"}
      <strong>${formatCurrency(realYearlyCashflow)}</strong></div>
      <div>${currentLang === "it" ? "Break-even (anni):" : "Break-even (years):"}
      <strong>${breakEvenYears > 0 ? breakEvenYears.toFixed(1) : "-"}</strong></div>
      <div>${currentLang === "it" ? "Scenario pessimistico:" : "Pessimistic scenario:"}
      <strong>${formatCurrency(stressedCashflow)}</strong></div>
    </div>

    <div class="security-badge ${badgeClass}">
      ${currentLang === "it" ? "Indice Rischio:" : "Risk Index:"}
      ${riskScore}/100 — ${riskLabel}
    </div>
  `;

  resultsDiv.innerHTML = output;
}
