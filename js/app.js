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

// STRIPE LINK
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200";

function unlockPro() {
  const locale = currentLang === "it" ? "it" : "en";
  window.location.href =
    STRIPE_PAYMENT_LINK +
    "?locale=" +
    locale +
    "&success_url=" +
    encodeURIComponent("https://rendimentobb.com/tool/?pro=paid");
}

function formatCurrency(value) {
  if (!isFinite(value)) value = 0;
  return new Intl.NumberFormat(
    currentLang === "it" ? "it-IT" : "en-US",
    { style: "currency", currency: "EUR" }
  ).format(value);
}

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

let cashflowChartInstance = null;

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
    resultsDiv.innerHTML = "Inserisci valori validi.";
    return;
  }

  // ================= BASE =================

  const nightsPerMonth = 30 * (occupancy / 100);
  const grossYearly = price * nightsPerMonth * 12;
  const yearlyFees = grossYearly * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const profitBeforeTax = grossYearly - yearlyFees - yearlyExpenses;
  const taxCost = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
  const netYearly = profitBeforeTax - taxCost;

  let baseROI = (netYearly / equity) * 100;
  if (!isFinite(baseROI)) baseROI = 0;

  let output = `
    <div class="result-card">
      <h4>📊 Analisi Base</h4>
      <div>Fatturato annuo: <strong>${formatCurrency(grossYearly)}</strong></div>
      <div>Utile netto annuo: <strong>${formatCurrency(netYearly)}</strong></div>
      <div>ROI stimato: <strong>${baseROI.toFixed(2)}%</strong></div>
    </div>
  `;

  if (!isProUnlocked) {
    output += `
      <div style="margin-top:25px;padding:25px;background:linear-gradient(145deg,#111827,#0f172a);border-radius:16px;border:1px solid #334155;text-align:center;">
        <h3 style="color:#22c55e;">🔒 Analisi Avanzata Bloccata</h3>
        <button onclick="unlockPro()" class="btn-primary" style="width:100%;">
        🔓 Sblocca Analisi Completa – 19€
        </button>
      </div>
    `;
    resultsDiv.innerHTML = output;
    return;
  }

  // ================= PRO =================

  const stressedOccupancy = occupancy * 0.8;
  const stressedExpenses = yearlyExpenses * 1.1;

  const stressedNet =
    (price * 30 * (stressedOccupancy / 100) * 12) -
    yearlyFees - stressedExpenses;

  const years = [1,2,3,4,5];
  let cumulative = [];
  let cumulativeStress = [];
  let total = 0;
  let totalStress = 0;

  for (let i = 1; i <= 5; i++) {
    total += netYearly;
    totalStress += stressedNet;
    cumulative.push(total);
    cumulativeStress.push(totalStress);
  }

  // BREAK EVEN LOGIC
  let breakEvenIndex = cumulative.findIndex(v => v >= equity);
  let breakEvenLabel = "";

  if (breakEvenIndex !== -1) {
    breakEvenLabel = `Capitale recuperato - Anno ${breakEvenIndex + 1}`;
  } else {
    breakEvenLabel = "Capitale NON recuperato nei 5 anni";
  }

  output += `
    <div class="result-card">
      <h4>📊 Analisi Professionale</h4>
      <div>${breakEvenLabel}</div>
    </div>

    <div style="margin-top:25px;">
      <canvas id="cashflowChart"></canvas>
    </div>

    <div style="margin-top:15px;padding:12px;border-radius:8px;background:#052e16;color:#86efac;text-align:center;">
      ✅ Versione PRO attiva — Analisi completa disponibile.
    </div>
  `;

  resultsDiv.innerHTML = output;

  const ctx = document.getElementById("cashflowChart");
  if (!ctx) return;

  if (cashflowChartInstance) {
    cashflowChartInstance.destroy();
  }

  cashflowChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years.map(y => "Anno " + y),
      datasets: [
        {
          label: 'Cashflow cumulativo',
          data: cumulative,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.15)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Scenario pessimistico',
          data: cumulativeStress,
          borderColor: '#f59e0b',
          tension: 0.3,
          fill: false
        },
        {
          label: 'Capitale investito',
          data: Array(5).fill(equity),
          borderColor: '#dc2626',
          borderDash: [6,6],
          tension: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#ffffff' }
        }
      },
      scales: {
        y: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}
