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
}

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200";

// ===============================
// UNLOCK PRO
// ===============================

function unlockPro() {
  window.location.href = STRIPE_PAYMENT_LINK;
}

// ===============================
// FORMAT CURRENCY
// ===============================

function formatCurrency(value) {
  if (!isFinite(value)) value = 0;

  return new Intl.NumberFormat(
    currentLang === "it" ? "it-IT" : "en-US",
    {
      style: "currency",
      currency: "EUR"
    }
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
  // BASE BUSINESS CALCULATION
  // =========================

  const nightsPerMonth = 30 * (occupancy / 100);
  const grossMonthly = price * nightsPerMonth;
  const grossYearly = grossMonthly * 12;

  const platformFeesYearly = grossYearly * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const profitBeforeTax = grossYearly - platformFeesYearly - yearlyExpenses;
  const taxCost = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;

  const netYearly = profitBeforeTax - taxCost;

  let baseROI = (netYearly / equity) * 100;

  // =========================
  // WARNING IF LOW MARGIN
  // =========================

  let output = "";

  if (netYearly < 5000) {
    output += `
    <div style="
      background:#7f1d1d;
      padding:12px;
      border-radius:8px;
      margin-bottom:15px;
      font-size:13px;
    ">
      ⚠️ ${currentLang === "it"
        ? "Margine basso. Questo investimento potrebbe essere fragile."
        : "Low margin. This investment could be fragile."}
    </div>
    `;
  }

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
  // TEASER RISK BAR (NON PRO)
  // =========================

  if (!isProUnlocked) {

    let teaserRisk = 100 - baseROI * 2;
    if (teaserRisk < 0) teaserRisk = 0;
    if (teaserRisk > 100) teaserRisk = 100;

    output += `
      <div style="margin-top:15px;">
        <div style="font-size:13px;margin-bottom:5px;">
          ${currentLang === "it" ? "Rischio stimato (base):" : "Estimated risk (basic):"}
        </div>

        <div style="background:#1f2937;height:8px;border-radius:6px;">
          <div style="
            width:${teaserRisk}%;
            height:8px;
            border-radius:6px;
            background:linear-gradient(90deg,#eab308,#dc2626);
          "></div>
        </div>

        <div style="font-size:12px;color:#94a3b8;margin-top:5px;">
          ${currentLang === "it"
            ? "Sblocca PRO per analisi rischio completa."
            : "Unlock PRO for full risk analysis."}
        </div>
      </div>
    `;

    // =========================
    // PRO CONVERSION BLOCK
    // =========================

    output += `
      <div style="
        margin-top:25px;
        padding:25px;
        background:linear-gradient(145deg,#111827,#0f172a);
        border-radius:16px;
        border:1px solid #334155;
        text-align:center;
      ">

        <h3 style="margin-bottom:10px;color:#22c55e;">
          🔒 ${currentLang === "it" ? "Analisi Completa Bloccata" : "Full Analysis Locked"}
        </h3>

        <p style="font-size:14px;color:#94a3b8;margin-bottom:15px;">
          ${currentLang === "it"
            ? `Con questi numeri potresti perdere fino a <strong>${formatCurrency(propertyPrice * 0.2)}</strong> se il mercato cambia.`
            : `With these numbers you could lose up to <strong>${formatCurrency(propertyPrice * 0.2)}</strong> if market conditions change.`}
        </p>

        <button onclick="unlockPro()" class="btn-primary" style="width:100%;">
          🔓 ${currentLang === "it"
            ? "Sblocca Analisi Completa – 19€"
            : "Unlock Full Analysis – €19"}
        </button>

        <div style="font-size:12px;color:#64748b;margin-top:10px;">
          ${currentLang === "it"
            ? "Pagamento una tantum. Nessun abbonamento."
            : "One-time payment. No subscription."}
        </div>

      </div>
    `;

    resultsDiv.innerHTML = output;
    resultsDiv.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // =========================
  // FULL PRO ANALYSIS
  // =========================

  output += `
    <div class="result-card">
      <h4>📊 ${currentLang === "it" ? "Analisi Completa" : "Full Analysis"}</h4>

      <div>${currentLang === "it" ? "ROI reale:" : "Real ROI:"}
      <strong>${baseROI.toFixed(2)}%</strong></div>

      <div>${currentLang === "it" ? "Cashflow annuo:" : "Yearly cashflow:"}
      <strong>${formatCurrency(netYearly)}</strong></div>
    </div>
  `;

  resultsDiv.innerHTML = output;
  resultsDiv.scrollIntoView({ behavior: "smooth" });
}
