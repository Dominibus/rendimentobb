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

// ===============================
// STRIPE LINK
// ===============================

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

  // ================= BLOCCO NON PRO =================

  if (!isProUnlocked) {

    const potentialLoss = Math.max(propertyPrice * 0.25, equity);

    output += `
      <div style="margin-top:25px;padding:30px;background:linear-gradient(145deg,#111827,#0f172a);border-radius:18px;border:1px solid #334155;text-align:center;">
        <h3 style="color:#22c55e;font-size:20px;">🔒 Analisi Professionale Bloccata</h3>
        <p style="color:#94a3b8;margin-top:10px;">
        Senza analisi avanzata potresti sottovalutare rischi fino a 
        <strong>${formatCurrency(potentialLoss)}</strong>
        nei primi anni.
        </p>
        <div style="margin-top:20px;font-size:14px;color:#64748b;">
        ✔ Stress test realistico<br>
        ✔ Indice rischio professionale<br>
        ✔ Simulazione 5 anni<br>
        ✔ Break-even operativo reale<br>
        ✔ Confronto scenari negativi
        </div>
        <button onclick="unlockPro()" class="btn-primary" style="width:100%;margin-top:20px;">
        🔓 Sblocca Analisi PRO – 19€
        </button>
        <div style="font-size:12px;color:#64748b;margin-top:10px;">
        Pagamento una tantum • Garanzia 7 giorni
        </div>
      </div>
    `;

    resultsDiv.innerHTML = output;
    return;
  }

  // ================= PRO ANALYSIS =================

  const roi5Years = baseROI * 5;
  const breakEvenYears = netYearly > 0 ? equity / netYearly : 0;

  const marginPercentage =
    grossYearly > 0 ? (netYearly / grossYearly) * 100 : 0;

  // Stress realistico
  const stressedOccupancy = occupancy * 0.85;
  const stressedExpenses = yearlyExpenses * 1.15;

  const stressedNet =
    (price * 30 * (stressedOccupancy / 100) * 12) -
    yearlyFees - stressedExpenses;

  // Scenario ulteriore
  const severeOccupancy = occupancy * 0.70;
  const severeNet =
    (price * 30 * (severeOccupancy / 100) * 12) -
    yearlyFees - stressedExpenses;

  // ================= RISK SCORE =================

  let riskScore = 100;

  if (baseROI < 6) riskScore -= 25;
  if (breakEvenYears > 12) riskScore -= 20;
  if (marginPercentage < 18) riskScore -= 20;
  if (stressedNet < 0) riskScore -= 20;
  if (severeNet < 0) riskScore -= 15;

  riskScore = Math.max(0, Math.min(100, riskScore));

  let statusText = "";
  let statusColor = "";

  if (riskScore >= 75) {
    statusText = "🟢 Investimento Solido";
    statusColor = "#16a34a";
  } else if (riskScore >= 50) {
    statusText = "🟡 Investimento da Ottimizzare";
    statusColor = "#eab308";
  } else {
    statusText = "🔴 Investimento ad Alto Rischio";
    statusColor = "#dc2626";
  }

  // ================= DIAGNOSI =================

  let diagnosis = "";

  if (marginPercentage < 20)
    diagnosis += "Margine operativo contenuto. ";

  if (breakEvenYears > 12)
    diagnosis += "Recupero capitale lento. ";

  if (stressedNet < 0)
    diagnosis += "Alta sensibilità a calo occupazione. ";

  if (diagnosis === "")
    diagnosis = "Parametri finanziari equilibrati e sostenibili.";

  // ================= GRAFICO =================

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

  output += `
    <div class="result-card">
      <h4>📊 Analisi Professionale</h4>

      <div style="font-weight:bold;color:${statusColor};margin-bottom:10px;">
        ${statusText}
      </div>

      <div>ROI 5 anni: <strong>${roi5Years.toFixed(2)}%</strong></div>
      <div>Break-even capitale: 
      <strong>${breakEvenYears ? breakEvenYears.toFixed(1) : "-"} anni</strong></div>
      <div>Margine operativo: 
      <strong>${marginPercentage.toFixed(1)}%</strong></div>
      <div>Scenario pessimistico: 
      <strong>${formatCurrency(stressedNet)}</strong></div>

      <div style="margin-top:15px;padding:12px;border-radius:8px;background:#0f172a;border:1px solid #334155;font-size:13px;color:#94a3b8;">
        🔎 Diagnosi automatica:<br>${diagnosis}
      </div>
    </div>

    <div style="margin-top:25px;">
      <canvas id="cashflowChart"></canvas>
    </div>

    <div style="margin-top:20px;padding:14px;border-radius:8px;background:#052e16;color:#86efac;text-align:center;">
      ✅ Versione PRO attiva — Analisi completa disponibile.
    </div>
  `;

  resultsDiv.innerHTML = output;

  const ctx = document.getElementById("cashflowChart");

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
          fill: true,
          tension: 0.3
        },
        {
          label: 'Scenario stress',
          data: cumulativeStress,
          borderColor: '#f59e0b',
          tension: 0.3
        },
        {
          label: 'Capitale investito',
          data: Array(5).fill(equity),
          borderColor: '#dc2626',
          borderDash: [6,6]
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
