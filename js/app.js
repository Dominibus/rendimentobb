// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 6.0 CONVERSION READY
// FREE + PRO STRUCTURE + EXECUTIVE UI
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


  window.lastAnalysisData = {
    roi,
    breakEven,
    netAfterMortgage,
    fiveYearProjection,
    risk,
    grade
  };


  // ================= OUTPUT FREE =================

  let html = `
    <h3>Executive Investment Summary</h3>

    <div class="kpi-grid">
      <div class="kpi-box">
        ROI
        <strong>${roi.toFixed(2)}%</strong>
      </div>

      <div class="kpi-box">
        Break-even
        <strong>${breakEven.toFixed(1)} yrs</strong>
      </div>

      <div class="kpi-box">
        Risk Score
        <strong>${risk}/100</strong>
      </div>

      <div class="kpi-box">
        Grade
        <strong>${grade}</strong>
      </div>
    </div>

    <div style="margin-bottom:20px;">
      <strong>Annual Net:</strong> ${formatCurrency(netAfterMortgage)}<br>
      <strong>5-Year Projection:</strong> ${formatCurrency(fiveYearProjection)}
    </div>
  `;


  // ================= PRO SECTION =================

  if (isProUnlocked) {

    // Advanced Stress Analysis
    const stressLevels = [0.9, 0.8, 0.7];

    html += `
      <div class="advanced-section">
        <h4>Executive Advanced Risk Analysis</h4>
    `;

    stressLevels.forEach(factor => {

      const stressOcc = occupancy * factor;
      const stressGross = priceNight * 365 * (stressOcc / 100);
      const stressFees = stressGross * (commission / 100);
      const stressProfit = stressGross - stressFees - yearlyExpenses;
      const stressTax = stressProfit > 0 ? stressProfit * (tax / 100) : 0;
      const stressNet = stressProfit - stressTax - mortgageYearly;
      const stressROI = equity > 0 ? (stressNet / equity) * 100 : 0;

      html += `
        <div class="advanced-item">
          Occupancy ${stressOcc.toFixed(0)}% → ROI ${stressROI.toFixed(2)}%
        </div>
      `;
    });

    html += `
        <div style="margin-top:20px;">
          <button onclick="generatePDF()" class="btn btn-primary">
            Download Executive PDF
          </button>
        </div>
      </div>
    `;

  } else {

    html += `
      <div class="lock-box">
        <strong>🔒 Executive Analysis Locked</strong>
        <p>
          Unlock stress tests, sensitivity analysis and professional
          strategic investment report.
        </p>
        <a href="https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200?pro=paid"
           class="btn btn-primary">
           Unlock PRO – 19€
        </a>
      </div>
    `;
  }

  resultsDiv.innerHTML = html;
}



// ================= PDF (PRO ONLY) =================

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

  pdf.setFontSize(32);
  pdf.text(d.roi.toFixed(2) + "% ROI", 20, 70);

  pdf.setFontSize(12);
  pdf.text("Break-even: " + d.breakEven.toFixed(1) + " yrs", 20, 90);
  pdf.text("Annual Net: " + formatCurrency(d.netAfterMortgage), 20, 100);
  pdf.text("5Y Projection: " + formatCurrency(d.fiveYearProjection), 20, 110);
  pdf.text("Risk Score: " + d.risk + "/100", 20, 120);
  pdf.text("Grade: " + d.grade, 20, 130);

  pdf.save("RendimentoBB_Executive_Report.pdf");
}
