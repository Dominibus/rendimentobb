// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 12.0
// STABILITY MATRIX + STRATEGIC LAYER + SMART MORTGAGE LINK
// ===============================================


// ================= PRO SYSTEM =================

let isProUnlocked = localStorage.getItem("proUnlocked") === "true";
let overrideMortgage = null;

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("pro") === "paid") {
  isProUnlocked = true;
  localStorage.setItem("proUnlocked", "true");
  window.history.replaceState({}, document.title, window.location.pathname);
}


// ================= UTIL =================

if (!window.currentLang) {
  window.currentLang = localStorage.getItem("rb_lang") || "it";
}

function formatCurrency(value) {
  if (!isFinite(value)) value = 0;
  return new Intl.NumberFormat(
    window.currentLang === "it" ? "it-IT" : "en-US",
    { style: "currency", currency: "EUR" }
  ).format(value);
}

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = parseFloat(el.value.replace(",", "."));
  return isNaN(val) ? 0 : val;
}

let roiChartInstance = null;


// ================= BASE MORTGAGE =================

function calculateMortgage(loanAmount, interestRate, loanYears) {

  if (!loanAmount || !loanYears) return 0;

  if (interestRate === 0)
    return loanAmount / loanYears;

  const r = interestRate / 100;
  const n = loanYears;

  return loanAmount *
    (r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1);
}


// ================= SCENARIO ENGINE =================

function calculateScenario(occ, priceNight, commission, tax, expenses, mortgageYearly, equity) {

  const nights = 365 * (occ / 100);
  const gross = priceNight * nights;
  const fees = gross * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const operatingProfit = gross - fees - yearlyExpenses;
  const taxCost = operatingProfit > 0 ? operatingProfit * (tax / 100) : 0;
  const netOperating = operatingProfit - taxCost;
  const netAfterMortgage = netOperating - mortgageYearly;

  let roi = equity > 0 ? (netAfterMortgage / equity) * 100 : 0;
  if (!isFinite(roi)) roi = 0;

  return { roi, netAfterMortgage };
}

function scenarioLabel(roi) {
  if (roi > 12) return { text: "SOLIDO", class: "kpi-positive" };
  if (roi > 0) return { text: "MARGINALE", class: "kpi-warning" };
  return { text: "NON SOSTENIBILE", class: "kpi-danger" };
}


// ================= MAIN CALCULATION =================

function calculate() {

  const equity = getValue("equity");
  const priceNight = getValue("priceNight");
  const occupancy = getValue("occupancy");
  const expenses = getValue("expenses");
  const commission = getValue("commission");
  const tax = getValue("tax");

  const loanAmount = getValue("loanAmount");
  const interestRate = getValue("interestRate");
  const loanYears = getValue("loanYears");

  if (!priceNight || !occupancy || equity <= 0) return;

  const mortgageYearly = overrideMortgage !== null
    ? overrideMortgage
    : calculateMortgage(loanAmount, interestRate, loanYears);

  const base = calculateScenario(
    occupancy,
    priceNight,
    commission,
    tax,
    expenses,
    mortgageYearly,
    equity
  );

  const kpiContainer = document.getElementById("executive-kpi");

  kpiContainer.innerHTML = `
    <div class="kpi-box ${scenarioLabel(base.roi).class}">
      ROI
      <strong>${base.roi.toFixed(2)}%</strong>
    </div>

    <div class="kpi-box">
      Annual Net
      <strong>${formatCurrency(base.netAfterMortgage)}</strong>
    </div>

    <div style="grid-column:1/-1;margin-top:30px;">
      <strong>📊 Stability Matrix</strong>
    </div>

    ${[60,75,85].map(o=>{
      const s = calculateScenario(o, priceNight, commission, tax, expenses, mortgageYearly, equity);
      const l = scenarioLabel(s.roi);
      return `
        <div class="kpi-box ${l.class}">
          ${o}% Occupancy
          <strong>${s.roi.toFixed(2)}%</strong>
          <div style="margin-top:6px;font-size:12px;">${l.text}</div>
        </div>
      `;
    }).join("")}
  `;

  renderChart(base.netAfterMortgage);
  renderStrategicInsight(base.roi);
}


// ================= STRATEGIC INSIGHT =================

function renderStrategicInsight(baseROI) {

  const insightBox = document.getElementById("strategic-insight");

  if (!isProUnlocked) {
    insightBox.innerHTML = `
      <strong>🔒 Strategic Interpretation Locked</strong>
      <p>Unlock structural interpretation and strategic simulation.</p>
      <a href="https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200?pro=paid"
         class="btn btn-primary">
         Unlock PRO – 19€
      </a>
    `;
    return;
  }

  let message =
    baseROI > 12
      ? "The investment shows structural resilience."
      : baseROI > 6
      ? "Moderately viable. Requires optimization."
      : "Structurally fragile. Review pricing or financing.";

  insightBox.innerHTML = `
    <strong>🔎 Strategic Interpretation</strong>
    <p style="margin-top:10px;">${message}</p>
  `;
}


// ================= CHART =================

function renderChart(yearlyNet) {

  const ctx = document.getElementById("roiChart");

  if (roiChartInstance) roiChartInstance.destroy();

  roiChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Year 1","Year 2","Year 3","Year 4","Year 5"],
      datasets: [{
        data: [
          yearlyNet,
          yearlyNet * 2,
          yearlyNet * 3,
          yearlyNet * 4,
          yearlyNet * 5
        ],
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}


// ================= MORTGAGE COMPARATOR =================

function mortgageSimulation(amount, rate, years) {

  if (!amount || !rate || !years) return null;

  const r = rate / 100;
  const n = years;

  const yearlyPayment =
    amount *
    (r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1);

  const totalPaid = yearlyPayment * n;
  const totalInterest = totalPaid - amount;

  return { yearlyPayment, totalPaid, totalInterest };
}

function compareMortgages() {

  const amount = getValue("mortgageAmount");
  const years = getValue("mortgageYears");

  const rateA = getValue("rateA");
  const rateB = getValue("rateB");
  const rateC = getValue("rateC");

  const resultDiv = document.getElementById("mortgage-results");

  if (!amount || !years) {
    resultDiv.innerHTML = "Inserisci importo e durata.";
    return;
  }

  const banks = [
    { name: "Banca A", rate: rateA, data: mortgageSimulation(amount, rateA, years) },
    { name: "Banca B", rate: rateB, data: mortgageSimulation(amount, rateB, years) },
    { name: "Banca C", rate: rateC, data: mortgageSimulation(amount, rateC, years) }
  ];

  banks.sort((a, b) => a.data.totalPaid - b.data.totalPaid);

  const best = banks[0];

  resultDiv.innerHTML = `
    <h4 style="margin-bottom:20px;">🏆 Miglior Soluzione: ${best.name}</h4>

    <div class="kpi-grid">
      ${banks.map(bank => `
        <div class="kpi-box">
          <strong>${bank.name}</strong><br>
          Tasso: ${bank.rate}%<br>
          Rata annua: ${formatCurrency(bank.data.yearlyPayment)}<br>
          Interessi totali: ${formatCurrency(bank.data.totalInterest)}
        </div>
      `).join("")}
    </div>

    <div style="margin-top:30px;text-align:center;">
      <button onclick="applyBestMortgage(${best.data.yearlyPayment})"
        class="btn btn-primary">
        Applica miglior mutuo al ROI
      </button>
    </div>
  `;
}

function applyBestMortgage(yearlyPayment) {

  if (!isProUnlocked) {

    const resultDiv = document.getElementById("mortgage-results");

    resultDiv.innerHTML += `
      <div style="margin-top:20px; padding:15px; background:#fff3cd; border-radius:10px;">
        <strong>🔒 Funzione PRO</strong><br>
        L'integrazione del mutuo nel ROI è disponibile solo in modalità PRO.
        <div style="margin-top:10px;">
          <a href="https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200?pro=paid"
             class="btn btn-primary">
             Sblocca PRO – 19€
          </a>
        </div>
      </div>
    `;

    return;
  }

  overrideMortgage = yearlyPayment;
  calculate();
}
