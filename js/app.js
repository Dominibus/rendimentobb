// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 9.0
// SCENARIO MULTIPLE + BREAK EVEN + STATUS
// ===============================================


// ================= PRO SYSTEM =================

let isProUnlocked = localStorage.getItem("proUnlocked") === "true";

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("pro") === "paid") {
  isProUnlocked = true;
  localStorage.setItem("proUnlocked", "true");
  window.history.replaceState({}, document.title, window.location.pathname);
}


// ================= LANGUAGE =================

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

window.lastAnalysisData = null;
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


// ================= CORE ENGINE =================

function calculate() {
  runRealCalculation();
}

function calculateScenarioROI(occ, priceNight, commission, tax, expenses, mortgageYearly, equity) {

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

  return roi;
}


function runRealCalculation() {

  const equity = getValue("equity");
  const priceNight = getValue("priceNight");
  const occupancy = getValue("occupancy");
  const expenses = getValue("expenses");
  const commission = getValue("commission");
  const tax = getValue("tax");

  const loanAmount = getValue("loanAmount");
  const interestRate = getValue("interestRate");
  const loanYears = getValue("loanYears");

  const kpiContainer = document.getElementById("executive-kpi");

  if (!priceNight || !occupancy || equity <= 0) {
    return;
  }

  const mortgageYearly = calculateMortgage(loanAmount, interestRate, loanYears);

  const baseROI = calculateScenarioROI(
    occupancy,
    priceNight,
    commission,
    tax,
    expenses,
    mortgageYearly,
    equity
  );

  const nightsPerYear = 365 * (occupancy / 100);
  const grossYearly = priceNight * nightsPerYear;
  const platformFees = grossYearly * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const operatingProfit = grossYearly - platformFees - yearlyExpenses;
  const taxCost = operatingProfit > 0 ? operatingProfit * (tax / 100) : 0;
  const netOperating = operatingProfit - taxCost;
  const netAfterMortgage = netOperating - mortgageYearly;

  let breakEven = netAfterMortgage > 0 ? equity / netAfterMortgage : 99;
  const fiveYearProjection = netAfterMortgage * 5;

  // ===== SCENARIO MULTIPLI =====

  const scenario60 = calculateScenarioROI(60, priceNight, commission, tax, expenses, mortgageYearly, equity);
  const scenario75 = calculateScenarioROI(75, priceNight, commission, tax, expenses, mortgageYearly, equity);
  const scenario85 = calculateScenarioROI(85, priceNight, commission, tax, expenses, mortgageYearly, equity);

  function roiClass(value) {
    if (value > 15) return "kpi-positive";
    if (value > 8) return "kpi-warning";
    return "kpi-danger";
  }

  // ===== RENDER =====

  kpiContainer.innerHTML = `
    <div class="kpi-box ${roiClass(baseROI)}">
      ROI
      <strong>${baseROI.toFixed(2)}%</strong>
    </div>

    <div class="kpi-box">
      Break-even
      <strong>${breakEven.toFixed(1)} yrs</strong>
    </div>

    <div class="kpi-box">
      5Y Projection
      <strong>${formatCurrency(fiveYearProjection)}</strong>
    </div>

    <div class="kpi-box">
      Annual Net
      <strong>${formatCurrency(netAfterMortgage)}</strong>
    </div>

    <div style="grid-column: 1 / -1; margin-top:25px;">
      <strong>📊 Scenario Comparison</strong>
    </div>

    <div class="kpi-box ${roiClass(scenario60)}">
      60% Occupancy
      <strong>${scenario60.toFixed(2)}%</strong>
    </div>

    <div class="kpi-box ${roiClass(scenario75)}">
      75% Occupancy
      <strong>${scenario75.toFixed(2)}%</strong>
    </div>

    <div class="kpi-box ${roiClass(scenario85)}">
      85% Occupancy
      <strong>${scenario85.toFixed(2)}%</strong>
    </div>
  `;

  renderChart(netAfterMortgage);
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
