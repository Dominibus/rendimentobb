// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 5.0 STABLE
// CORRECT FIELD MAPPING + REAL ROI + PRO PDF
// ===============================================

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

// ===============================================
// MORTGAGE
// ===============================================

function calculateMortgage(loanAmount, interestRate, loanYears) {

  if (!loanAmount || !loanYears) return 0;

  if (interestRate === 0)
    return loanAmount / loanYears;

  const yearlyRate = interestRate / 100;
  const n = loanYears;

  const yearly =
    loanAmount *
    (yearlyRate * Math.pow(1 + yearlyRate, n)) /
    (Math.pow(1 + yearlyRate, n) - 1);

  return yearly;
}

// ===============================================
// MAIN CALCULATION
// ===============================================

function calculate() {
  runRealCalculation();
}

function runRealCalculation() {

  // ===== CORRECT FIELD MAPPING =====
  const propertyPrice = getValue("price");
  const equity = getValue("equity");

  const priceNight = getValue("priceNight"); // ✔ corretto
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

  // ===== REVENUE =====
  const nightsPerYear = 365 * (occupancy / 100);
  const grossYearly = priceNight * nightsPerYear;

  const platformFees = grossYearly * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const operatingProfit = grossYearly - platformFees - yearlyExpenses;

  const taxCost = operatingProfit > 0
    ? operatingProfit * (tax / 100)
    : 0;

  const netOperating = operatingProfit - taxCost;

  const mortgageYearly = calculateMortgage(
    loanAmount,
    interestRate,
    loanYears
  );

  const netAfterMortgage = netOperating - mortgageYearly;

  // ===== ROI =====
  let roi = equity > 0
    ? (netAfterMortgage / equity) * 100
    : 0;

  if (!isFinite(roi)) roi = 0;

  // ===== BREAK EVEN =====
  let breakEven =
    netAfterMortgage > 0
      ? equity / netAfterMortgage
      : 99;

  // ===== STRESS TEST (-15% occupancy)
  const stressOccupancy = occupancy * 0.85;
  const stressNights = 365 * (stressOccupancy / 100);
  const stressGross = priceNight * stressNights;

  const stressFees = stressGross * (commission / 100);
  const stressProfit = stressGross - stressFees - yearlyExpenses;

  const stressTax =
    stressProfit > 0
      ? stressProfit * (tax / 100)
      : 0;

  const stressNet =
    stressProfit - stressTax - mortgageYearly;

  let stressROI =
    equity > 0
      ? (stressNet / equity) * 100
      : 0;

  if (!isFinite(stressROI)) stressROI = 0;

  const fiveYearProjection = netAfterMortgage * 5;

  // ===== RISK ENGINE 2.0 =====
  let risk = 40;

  if (roi < 5) risk += 20;
  if (roi > 20) risk -= 15;
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
    stressROI,
    netAfterMortgage,
    fiveYearProjection,
    risk,
    grade
  };

  // ===== OUTPUT =====
  resultsDiv.innerHTML = `
    <div style="margin-bottom:25px;">
      <h3>Executive Investment Summary</h3>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;margin-bottom:25px;">
      <div><strong>ROI:</strong> ${roi.toFixed(2)}%</div>
      <div><strong>Break-even:</strong> ${breakEven.toFixed(1)} yrs</div>
      <div><strong>Stress ROI:</strong> ${stressROI.toFixed(2)}%</div>
      <div><strong>Grade:</strong> ${grade}</div>
    </div>

    <div style="margin-bottom:20px;">
      <strong>Annual Net:</strong> ${formatCurrency(netAfterMortgage)}<br>
      <strong>5-Year Projection:</strong> ${formatCurrency(fiveYearProjection)}
    </div>

    <button onclick="generatePDF()" 
      style="background:#0f172a;color:#fff;padding:12px 20px;border:none;border-radius:10px;cursor:pointer;">
      📄 Download Executive PDF
    </button>
  `;
}

// ===============================================
// PDF GENERATION – PROFESSIONAL STRUCTURE
// ===============================================

function generatePDF() {

  if (!window.lastAnalysisData) {
    alert("Run analysis first.");
    return;
  }

  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF("p","mm","a4");
  const d = window.lastAnalysisData;

  // Header
  pdf.setFillColor(15,23,42);
  pdf.rect(0,0,210,30,"F");

  pdf.setTextColor(255,255,255);
  pdf.setFontSize(18);
  pdf.text("RendimentoBB", 20, 18);

  pdf.setFontSize(10);
  pdf.text("Strategic Investment Report", 20, 25);

  pdf.setTextColor(0,0,0);

  pdf.setFontSize(12);
  pdf.text("Cash-on-Cash Return (Equity ROI)", 20, 45);

  pdf.setFontSize(28);
  pdf.text(d.roi.toFixed(2) + "%", 20, 60);

  pdf.setFontSize(11);
  pdf.text("Break-even: " + d.breakEven.toFixed(1) + " yrs", 20, 75);
  pdf.text("Stress ROI: " + d.stressROI.toFixed(2) + "%", 20, 83);

  pdf.text("Annual Net: " + formatCurrency(d.netAfterMortgage), 20, 95);
  pdf.text("5Y Projection: " + formatCurrency(d.fiveYearProjection), 20, 103);

  pdf.text("Investment Grade: " + d.grade, 20, 115);

  pdf.setFontSize(8);
  pdf.text(
    "Generated by RendimentoBB Strategic Analysis Engine",
    20,
    285
  );

  pdf.save("RendimentoBB_Executive_Report.pdf");
}
