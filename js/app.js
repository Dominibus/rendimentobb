// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 7.0
// CONVERSION OPTIMIZED + SCORE SYSTEM
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


// ================= MAIN =================

function calculate() {
  runRealCalculation();
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

  const resultsDiv = document.getElementById("results");
  const kpiContainer = document.getElementById("executive-kpi");

  if (!priceNight || !occupancy || equity <= 0) {
    resultsDiv.innerHTML = "Insert valid values.";
    return;
  }

  // ===== BASE CALCULATION =====

  const nightsPerYear = 365 * (occupancy / 100);
  const grossYearly = priceNight * nightsPerYear;

  const platformFees = grossYearly * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const operatingProfit = grossYearly - platformFees - yearlyExpenses;
  const taxCost = operatingProfit > 0 ? operatingProfit * (tax / 100) : 0;

  const netOperating = operatingProfit - taxCost;
  const mortgageYearly = calculateMortgage(loanAmount, interestRate, loanYears);
  const netAfterMortgage = netOperating - mortgageYearly;

  let roi = equity > 0 ? (netAfterMortgage / equity) * 100 : 0;
  if (!isFinite(roi)) roi = 0;

  let breakEven = netAfterMortgage > 0 ? equity / netAfterMortgage : 99;
  const fiveYearProjection = netAfterMortgage * 5;

  // ===== RISK ENGINE =====

  let risk = 40;
  if (roi < 5) risk += 20;
  if (breakEven > 15) risk += 20;
  if (occupancy < 55) risk += 15;
  if (loanAmount > equity * 3) risk += 10;

  risk = Math.max(0, Math.min(100, risk));

  let grade =
    risk < 25 ? "A" :
    risk < 45 ? "B" :
    risk < 65 ? "C" : "D";

  // ===== SCORE ENGINE =====

  let score = 100 - risk;

  if (roi < 0) score -= 20;
  if (breakEven > 20) score -= 15;

  score = Math.max(0, Math.min(100, score));

  // ===== STORE =====

  window.lastAnalysisData = {
    roi,
    breakEven,
    netAfterMortgage,
    fiveYearProjection,
    risk,
    grade,
    score
  };

  // ===== KPI COLOR LOGIC =====

  function roiClass() {
    if (roi > 15) return "kpi-positive";
    if (roi > 8) return "kpi-warning";
    return "kpi-danger";
  }

  function riskClass() {
    if (risk < 35) return "kpi-positive";
    if (risk < 60) return "kpi-warning";
    return "kpi-danger";
  }

  // ===== RENDER KPI =====

  kpiContainer.innerHTML = `
    <div class="kpi-box ${roiClass()}">
      ROI
      <strong>${roi.toFixed(2)}%</strong>
    </div>

    <div class="kpi-box">
      Break-even
      <strong>${breakEven.toFixed(1)} yrs</strong>
    </div>

    <div class="kpi-box ${riskClass()}">
      Risk Score
      <strong>${risk}/100</strong>
    </div>

    <div class="kpi-box">
      Grade
      <strong>${grade}</strong>
    </div>

    <div class="kpi-box">
      RendimentoBB Score™
      <strong>${score}/100</strong>
    </div>
  `;

  // ===== STRATEGIC INSIGHT =====

  const insightBox = document.getElementById("strategic-insight");

  if (isProUnlocked) {

    let recommendation =
      roi > 12 && risk < 40
        ? "Investment appears structurally solid."
        : roi > 6
        ? "Moderate investment. Requires stress scenario validation."
        : "High risk profile. Strategic revision recommended.";

    insightBox.innerHTML = `
      <strong>🔎 Strategic Insight</strong>
      <p style="margin-top:10px;">
        ${recommendation}
      </p>
      <div style="margin-top:20px;">
        <button onclick="generatePDF()" class="btn btn-primary">
          Download Executive PDF
        </button>
      </div>
    `;

  } else {

    insightBox.innerHTML = `
      <strong>🔒 Strategic Insight Locked</strong>
      <p>
        Unlock advanced recommendation, stress scenarios and executive PDF.
      </p>
      <a href="https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200?pro=paid"
         class="btn btn-primary">
         Unlock PRO – 19€
      </a>
    `;
  }

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


// ================= PDF =================

function generatePDF() {

  if (!isProUnlocked) {
    alert("PRO required.");
    return;
  }

  if (!window.lastAnalysisData) {
    alert("Run analysis first.");
    return;
  }

  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF("p","mm","a4");
  const d = window.lastAnalysisData;

  pdf.setFillColor(10,20,40);
  pdf.rect(0,0,210,28,"F");

  pdf.setTextColor(255,255,255);
  pdf.setFontSize(18);
  pdf.text("RendimentoBB", 20, 17);

  pdf.setTextColor(0);
  pdf.setFontSize(14);
  pdf.text("Executive Investment Report", 20, 50);

  pdf.setFontSize(30);
  pdf.text(d.roi.toFixed(2) + "% ROI", 20, 70);

  pdf.setFontSize(12);
  pdf.text("Break-even: " + d.breakEven.toFixed(1) + " yrs", 20, 90);
  pdf.text("Annual Net: " + formatCurrency(d.netAfterMortgage), 20, 100);
  pdf.text("5Y Projection: " + formatCurrency(d.fiveYearProjection), 20, 110);
  pdf.text("Risk Score: " + d.risk + "/100", 20, 120);
  pdf.text("Grade: " + d.grade, 20, 130);
  pdf.text("RendimentoBB Score: " + d.score + "/100", 20, 140);

  pdf.save("RendimentoBB_Executive_Report.pdf");
}
