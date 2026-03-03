// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 10.0
// STABILITY MATRIX + STRATEGIC LAYER
// ===============================================


// ================= PRO SYSTEM =================

let isProUnlocked = localStorage.getItem("proUnlocked") === "true";

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


// ================= MORTGAGE =================

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

  return {
    roi,
    netAfterMortgage
  };
}


function scenarioLabel(roi) {

  if (roi > 12) {
    return { text: "SOLIDO", class: "kpi-positive" };
  }

  if (roi > 0) {
    return { text: "MARGINALE", class: "kpi-warning" };
  }

  return { text: "NON SOSTENIBILE", class: "kpi-danger" };
}


// ================= MAIN =================

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

  if (!priceNight || !occupancy || equity <= 0) {
    return;
  }

  const mortgageYearly = calculateMortgage(loanAmount, interestRate, loanYears);

  const base = calculateScenario(
    occupancy,
    priceNight,
    commission,
    tax,
    expenses,
    mortgageYearly,
    equity
  );

  const s60 = calculateScenario(60, priceNight, commission, tax, expenses, mortgageYearly, equity);
  const s75 = calculateScenario(75, priceNight, commission, tax, expenses, mortgageYearly, equity);
  const s85 = calculateScenario(85, priceNight, commission, tax, expenses, mortgageYearly, equity);

  const l60 = scenarioLabel(s60.roi);
  const l75 = scenarioLabel(s75.roi);
  const l85 = scenarioLabel(s85.roi);

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

    <div style="grid-column: 1 / -1; margin-top:30px;">
      <strong>📊 Stability Matrix</strong>
    </div>

    <div class="kpi-box ${l60.class}">
      60% Occupancy
      <strong>${s60.roi.toFixed(2)}%</strong>
      <div style="margin-top:6px;font-size:12px;">${l60.text}</div>
    </div>

    <div class="kpi-box ${l75.class}">
      75% Occupancy
      <strong>${s75.roi.toFixed(2)}%</strong>
      <div style="margin-top:6px;font-size:12px;">${l75.text}</div>
    </div>

    <div class="kpi-box ${l85.class}">
      85% Occupancy
      <strong>${s85.roi.toFixed(2)}%</strong>
      <div style="margin-top:6px;font-size:12px;">${l85.text}</div>
    </div>
  `;

  renderChart(base.netAfterMortgage);

  renderStrategicInsight(base.roi, s60.roi, s75.roi, s85.roi);
}


// ================= STRATEGIC INSIGHT =================

function renderStrategicInsight(baseROI, r60, r75, r85) {

  const insightBox = document.getElementById("strategic-insight");

  if (!isProUnlocked) {

    insightBox.innerHTML = `
      <strong>🔒 Strategic Interpretation Locked</strong>
      <p>
        Unlock structural interpretation, correction suggestions
        and strategic adjustment simulation.
      </p>
      <a href="https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200?pro=paid"
         class="btn btn-primary">
         Unlock PRO – 19€
      </a>
    `;
    return;
  }

  let message = "";

  if (baseROI > 12 && r60 > 0) {
    message = "The investment shows structural resilience even under conservative occupancy scenarios.";
  } else if (baseROI > 6) {
    message = "The project is moderately viable but depends heavily on occupancy optimization.";
  } else {
    message = "The investment presents structural fragility. Review pricing strategy or financing structure.";
  }

  insightBox.innerHTML = `
    <strong>🔎 Strategic Interpretation</strong>
    <p style="margin-top:10px;">
      ${message}
    </p>
  `;
}


// ================= CHART =================

function renderChart(yearlyNet) {

  const ctx = document.getElementById("roiChart");

  if (roiChartInstance) {
    roiChartInstance.destroy();
  }

  roiChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Year 1","Year 2","Year 3","Year 4","Year 5"],
      datasets: [{
        label: "Net Projection",
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
      plugins: {
        legend: { display: false }
      }
    }
  });
}
