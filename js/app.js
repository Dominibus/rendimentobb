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
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

let cashflowChartInstance = null;
let lastAnalysisData = null;

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
        <h3 style="color:#22c55e;">🔒 Analisi Strategica Bloccata</h3>
        <p style="color:#94a3b8;">
        Potenziale rischio stimato fino a <strong>${formatCurrency(potentialLoss)}</strong>
        in caso di scenario negativo.
        </p>
        <button onclick="unlockPro()" class="btn-primary" style="width:100%;margin-top:20px;">
        🔓 Sblocca Versione PRO – 19€
        </button>
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

  const stressedOccupancy = occupancy * 0.85;
  const stressedExpenses = yearlyExpenses * 1.15;

  const stressedNet =
    (price * 30 * (stressedOccupancy / 100) * 12) -
    yearlyFees - stressedExpenses;

  let riskScore = 100;

  if (baseROI < 6) riskScore -= 25;
  if (breakEvenYears > 12) riskScore -= 20;
  if (marginPercentage < 18) riskScore -= 20;
  if (stressedNet < 0) riskScore -= 20;

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

  let diagnosis = "";

  if (marginPercentage < 20)
    diagnosis += "Margine operativo contenuto. ";

  if (breakEvenYears > 12)
    diagnosis += "Recupero capitale lento. ";

  if (stressedNet < 0)
    diagnosis += "Elevata sensibilità a variazioni di occupazione. ";

  if (diagnosis === "")
    diagnosis = "Parametri finanziari equilibrati e sostenibili.";

  // Salvataggio per PDF
  lastAnalysisData = {
    propertyPrice,
    equity,
    grossYearly,
    netYearly,
    baseROI,
    roi5Years,
    breakEvenYears,
    marginPercentage,
    stressedNet,
    riskScore,
    statusText,
    diagnosis
  };

  output += `
    <div class="result-card">
      <h4>📊 Analisi Strategica PRO</h4>

      <div style="font-weight:bold;color:${statusColor};margin-bottom:10px;">
        ${statusText}
      </div>

      <div>ROI 5 anni: <strong>${roi5Years.toFixed(2)}%</strong></div>
      <div>Break-even capitale: <strong>${breakEvenYears ? breakEvenYears.toFixed(1) : "-"} anni</strong></div>
      <div>Margine operativo: <strong>${marginPercentage.toFixed(1)}%</strong></div>
      <div>Scenario pessimistico: <strong>${formatCurrency(stressedNet)}</strong></div>

      <div style="margin-top:15px;padding:12px;border-radius:8px;background:#0f172a;border:1px solid #334155;font-size:13px;color:#94a3b8;">
        🔎 Diagnosi professionale:<br>${diagnosis}
      </div>

      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 Genera Report PDF Professionale
      </button>
    </div>
  `;

  resultsDiv.innerHTML = output;
}

// ===============================
// GENERAZIONE PDF PROFESSIONALE
// ===============================

async function generatePDF() {

  if (!lastAnalysisData) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("RendimentoBB", 20, 20);

  pdf.setFontSize(14);
  pdf.text("Report di Valutazione Investimento B&B", 20, 30);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");

  let y = 45;

  pdf.text("Executive Summary:", 20, y);
  y += 8;

  pdf.text(`Valutazione: ${lastAnalysisData.statusText}`, 20, y);
  y += 8;

  pdf.text(`ROI 5 anni: ${lastAnalysisData.roi5Years.toFixed(2)}%`, 20, y);
  y += 8;

  pdf.text(`Break-even: ${lastAnalysisData.breakEvenYears ? lastAnalysisData.breakEvenYears.toFixed(1) : "-"} anni`, 20, y);
  y += 8;

  pdf.text(`Margine operativo: ${lastAnalysisData.marginPercentage.toFixed(1)}%`, 20, y);
  y += 8;

  pdf.text(`Scenario stress: ${formatCurrency(lastAnalysisData.stressedNet)}`, 20, y);
  y += 12;

  pdf.text("Diagnosi:", 20, y);
  y += 8;

  pdf.text(lastAnalysisData.diagnosis, 20, y);

  pdf.save("Report_RendimentoBB.pdf");
}
