// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 6.0 PRO READY
// FREE + PRO UI DIFFERENTIATION
// ===============================================

// ================= PRO UNLOCK SYSTEM =================

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

  return loanAmount * (r * Math.pow(1 + r, n)) /
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

  // ===== PRO ANALYSIS =====

  let stressResults = [];
  let rateSensitivity = [];

  if (isProUnlocked) {

    // Stress occupancy -10, -20, -30
    [0.9, 0.8, 0.7].forEach(factor => {
      const stressOcc = occupancy * factor;
      const stressGross = priceNight * 365 * (stressOcc / 100);
      const stressFees = stressGross * (commission / 100);
      const stressProfit = stressGross - stressFees - yearlyExpenses;
      const stressTax = stressProfit > 0 ? stressProfit * (tax / 100) : 0;
      const stressNet = stressProfit - stressTax - mortgageYearly;
      const stressROI = equity > 0 ? (stressNet / equity) * 100 : 0;

      stressResults.push({
        occupancy: stressOcc,
        roi: stressROI
      });
    });

    // Sensitivity tasso +1 / +2
    [1,2].forEach(extra => {
      const newRate = interestRate + extra;
      const newMortgage = calculateMortgage(loanAmount, newRate, loanYears);
      const newNet = netOperating - newMortgage;
      const newROI = equity > 0 ? (newNet / equity) * 100 : 0;

      rateSensitivity.push({
        rate: newRate,
        roi: newROI
      });
    });
  }

  window.lastAnalysisData = {
    roi,
    breakEven,
    netAfterMortgage,
    fiveYearProjection,
    risk,
    grade
  };

  // ===== UI OUTPUT =====

  let html = `
    <div style="margin-bottom:25px;">
      <h3>Executive Investment Summary</h3>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;margin-bottom:25px;">
      <div><strong>ROI:</strong> ${roi.toFixed(2)}%</div>
      <div><strong>Break-even:</strong> ${breakEven.toFixed(1)} yrs</div>
      <div><strong>Risk:</strong> ${risk}/100</div>
      <div><strong>Grade:</strong> ${grade}</div>
    </div>

    <div style="margin-bottom:20px;">
      <strong>Annual Net:</strong> ${formatCurrency(netAfterMortgage)}<br>
      <strong>5-Year Projection:</strong> ${formatCurrency(fiveYearProjection)}
    </div>
  `;

  if (isProUnlocked) {

    html += `<hr><h4>Advanced Risk Analysis</h4>`;

    stressResults.forEach(s => {
      html += `<div>Occupancy ${s.occupancy.toFixed(0)}% → ROI ${s.roi.toFixed(2)}%</div>`;
    });

    html += `<hr><h4>Interest Rate Sensitivity</h4>`;

    rateSensitivity.forEach(r => {
      html += `<div>Rate ${r.rate}% → ROI ${r.roi.toFixed(2)}%</div>`;
    });

    html += `
      <br>
      <button onclick="generatePDF()" 
      style="background:#0f172a;color:#fff;padding:12px 20px;border:none;border-radius:10px;cursor:pointer;">
      📄 Download Executive PDF
      </button>
    `;

  } else {

    html += `
      <div style="margin-top:30px;padding:20px;background:#f1f5f9;border-radius:12px;">
        <strong>🔒 Advanced Analysis Locked</strong><br>
        Unlock stress tests, rate sensitivity and full strategic report.
        <br><br>
        <a href="https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200?pro=paid"
        class="btn btn-primary">Unlock PRO – 19€</a>
      </div>
    `;
  }

  resultsDiv.innerHTML = html;
}
