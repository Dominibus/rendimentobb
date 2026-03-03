// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 8.0
// BREAK-EVEN OCCUPANCY + STATUS BADGE
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

  const kpiContainer = document.getElementById("executive-kpi");

  if (!priceNight || !occupancy || equity <= 0) {
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

  // ===== BREAK-EVEN OCCUPANCY =====

  const fixedCosts = yearlyExpenses + mortgageYearly;

  const netPerOccupiedNight =
    priceNight *
    (1 - commission / 100) *
    (1 - tax / 100);

  let breakEvenOccupancy = 0;

  if (netPerOccupiedNight > 0) {
    breakEvenOccupancy =
      (fixedCosts / (netPerOccupiedNight * 365)) * 100;
  }

  breakEvenOccupancy = Math.max(0, Math.min(100, breakEvenOccupancy));


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


  // ===== STATUS BADGE =====

  let statusText = "";
  let statusClass = "";

  if (score > 70 && roi > 10) {
    statusText = "STRUCTURALLY SOLID";
    statusClass = "kpi-positive";
  } else if (score > 45) {
    statusText = "MODERATE STRUCTURE";
    statusClass = "kpi-warning";
  } else {
    statusText = "HIGH STRUCTURAL RISK";
    statusClass = "kpi-danger";
  }


  // ===== STORE =====

  window.lastAnalysisData = {
    roi,
    breakEven,
    netAfterMortgage,
    fiveYearProjection,
    risk,
    grade,
    score,
    breakEvenOccupancy,
    statusText
  };


  // ===== RENDER KPI =====

  kpiContainer.innerHTML = `
    <div class="kpi-box ${statusClass}">
      Investment Status
      <strong>${statusText}</strong>
    </div>

    <div class="kpi-box">
      ROI
      <strong>${roi.toFixed(2)}%</strong>
    </div>

    <div class="kpi-box">
      Break-even
      <strong>${breakEven.toFixed(1)} yrs</strong>
    </div>

    <div class="kpi-box">
      Min Occupancy Needed
      <strong>${breakEvenOccupancy.toFixed(1)}%</strong>
    </div>

    <div class="kpi-box">
      Risk Score
      <strong>${risk}/100</strong>
    </div>

    <div class="kpi-box">
      RendimentoBB Score™
      <strong>${score}/100</strong>
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

  pdf.setFontSize(28);
  pdf.text(d.roi.toFixed(2) + "% ROI", 20, 70);

  pdf.setFontSize(12);
  pdf.text("Break-even: " + d.breakEven.toFixed(1) + " yrs", 20, 90);
  pdf.text("Min Occupancy: " + d.breakEvenOccupancy.toFixed(1) + "%", 20, 100);
  pdf.text("Annual Net: " + formatCurrency(d.netAfterMortgage), 20, 110);
  pdf.text("5Y Projection: " + formatCurrency(d.fiveYearProjection), 20, 120);
  pdf.text("Risk Score: " + d.risk + "/100", 20, 130);
  pdf.text("Score: " + d.score + "/100", 20, 140);
  pdf.text("Status: " + d.statusText, 20, 150);

  pdf.save("RendimentoBB_Executive_Report.pdf");
}
