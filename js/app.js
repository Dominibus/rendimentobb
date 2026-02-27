// ===============================
// SAFE LANGUAGE INIT
// ===============================

if (typeof currentLang === "undefined") {
  currentLang = "it";
}

// ===============================
// PRO STATUS INIT
// ===============================

let isProUnlocked = localStorage.getItem("proUnlocked") === "true";

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get("pro") === "paid") {
  isProUnlocked = true;
  localStorage.setItem("proUnlocked", "true");
  window.history.replaceState({}, document.title, window.location.pathname);
}

// 🔥 METTI QUI IL TUO LINK STRIPE LIVE
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200";

// ===============================
// UNLOCK PRO
// ===============================

function unlockPro() {
  const locale = currentLang === "it" ? "it" : "en";
  window.location.href =
    STRIPE_PAYMENT_LINK +
    "?locale=" +
    locale +
    "&success_url=" +
    encodeURIComponent("https://rendimentobb.com/tool/?pro=paid");
}

// ===============================
// FORMAT CURRENCY
// ===============================

function formatCurrency(value) {
  if (!isFinite(value)) value = 0;
  return new Intl.NumberFormat(
    currentLang === "it" ? "it-IT" : "en-US",
    { style: "currency", currency: "EUR" }
  ).format(value);
}

// ===============================
// SAFE VALUE GETTER
// ===============================

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

// ===============================
// CALCULATE
// ===============================

function calculate() {

  const propertyPrice = getValue("propertyPrice");
  const price = getValue("price");
  const occupancy = getValue("occupancy");
  const expenses = getValue("expenses");
  const commission = getValue("commission");
  const tax = getValue("tax");
  const equity = getValue("equity");

  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  if (!price || !occupancy || !equity) {
    resultsDiv.innerHTML =
      currentLang === "it"
        ? "Inserisci valori validi."
        : "Please enter valid values.";
    return;
  }

  // =========================
  // BASE CALCULATION
  // =========================

  const nights = 30 * (occupancy / 100);
  const grossYearly = price * nights * 12;
  const fees = grossYearly * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const profitBeforeTax = grossYearly - fees - yearlyExpenses;
  const taxCost = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
  const netYearly = profitBeforeTax - taxCost;

  let baseROI = (netYearly / equity) * 100;
  if (!isFinite(baseROI)) baseROI = 0;

  let output = "";

  // =========================
  // BASE RESULT
  // =========================

  output += `
    <div class="result-card">
      <h4>📊 ${currentLang === "it" ? "Analisi Base" : "Base Analysis"}</h4>

      <div>${currentLang === "it" ? "Fatturato annuo:" : "Yearly revenue:"}
      <strong>${formatCurrency(grossYearly)}</strong></div>

      <div>${currentLang === "it" ? "Utile netto annuo:" : "Net yearly profit:"}
      <strong>${formatCurrency(netYearly)}</strong></div>

      <div>${currentLang === "it" ? "ROI stimato:" : "Estimated ROI:"}
      <strong>${baseROI.toFixed(2)}%</strong></div>
    </div>
  `;

  // =========================
  // NON PRO VERSION
  // =========================

  if (!isProUnlocked) {

    const potentialLoss = Math.max(propertyPrice * 0.2, equity);

    output += `
      <div style="margin-top:20px;padding:25px;background:linear-gradient(145deg,#111827,#0f172a);border-radius:16px;border:1px solid #334155;text-align:center;">
        
        <h3 style="margin-bottom:10px;color:#22c55e;">
          🔒 ${currentLang === "it" ? "Analisi Completa Bloccata" : "Full Analysis Locked"}
        </h3>

        <p style="font-size:14px;color:#94a3b8;margin-bottom:15px;">
          ${currentLang === "it"
            ? `Potresti perdere fino a <strong>${formatCurrency(potentialLoss)}</strong> in uno scenario negativo.`
            : `You could lose up to <strong>${formatCurrency(potentialLoss)}</strong> in a negative scenario.`}
        </p>

        <button onclick="unlockPro()" class="btn-primary" style="width:100%;">
          🔓 ${currentLang === "it"
            ? "Sblocca Analisi Completa – 19€"
            : "Unlock Full Analysis – €19"}
        </button>

        <div style="font-size:12px;color:#64748b;margin-top:8px;">
          ${currentLang === "it"
            ? "Pagamento una tantum. Garanzia 7 giorni."
            : "One-time payment. 7-day money-back guarantee."}
        </div>

      </div>
    `;

    resultsDiv.innerHTML = output;
    resultsDiv.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // =========================
  // PRO VERSION CALCULATION
  // =========================

  const roi5Years = baseROI * 5;
  const breakEvenYears = netYearly > 0 ? equity / netYearly : 0;

  const stressedOccupancy = occupancy * 0.75;
  const stressedGross = price * 30 * (stressedOccupancy / 100) * 12;
  const stressedNet = stressedGross - fees - yearlyExpenses;
  const stressedCashflow = stressedNet > 0 ? stressedNet * 0.8 : stressedNet;

  let riskScore = 100;
  if (baseROI < 5) riskScore -= 25;
  if (breakEvenYears > 15) riskScore -= 20;
  if (stressedCashflow < 0) riskScore -= 25;
  if (netYearly < 5000) riskScore -= 20;

  riskScore = Math.max(0, Math.min(100, riskScore));

  let riskColor =
    riskScore > 75 ? "#16a34a"
    : riskScore > 50 ? "#eab308"
    : "#dc2626";

  output += `
    <div class="result-card">
      <h4>📊 ${currentLang === "it" ? "Analisi Completa PRO" : "Full PRO Analysis"}</h4>

      <div>ROI 5 anni:
      <strong>${roi5Years.toFixed(2)}%</strong></div>

      <div>${currentLang === "it" ? "Break-even:" : "Break-even:"}
      <strong>${breakEvenYears ? breakEvenYears.toFixed(1) : "-"} anni</strong></div>

      <div>${currentLang === "it" ? "Scenario pessimistico:" : "Pessimistic scenario:"}
      <strong>${formatCurrency(stressedCashflow)}</strong></div>
    </div>

    <div style="margin-top:15px;padding:14px;border-radius:8px;background:${riskColor};color:white;font-weight:bold;text-align:center;">
      ${currentLang === "it" ? "Indice di rischio:" : "Risk index:"} ${riskScore}/100
    </div>

    <div style="margin-top:15px;padding:12px;border-radius:8px;background:#052e16;color:#86efac;font-size:13px;text-align:center;">
      ✅ ${currentLang === "it"
        ? "Versione PRO attiva — Analisi completa disponibile."
        : "PRO version active — Full analysis unlocked."}
    </div>
  `;

  resultsDiv.innerHTML = output;
  resultsDiv.scrollIntoView({ behavior: "smooth" });
}
