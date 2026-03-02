// ===============================
// RENDIMENTOBB – EXECUTIVE ENGINE 4.0 CLEAN FINAL
// CORRECT FIELD MAPPING + STABLE ROI + FULL PDF
// ===============================

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

// ===============================
// MORTGAGE
// ===============================

function calculateMortgage(loanAmount, interestRate, loanYears) {

  if (!loanAmount || !loanYears) return 0;

  if (interestRate === 0)
    return loanAmount / loanYears;

  const monthlyRate = (interestRate / 100) / 12;
  const totalPayments = loanYears * 12;

  const monthly =
    loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  return monthly * 12;
}

// ===============================
// MAIN CALCULATION
// ===============================

function calculate() {
  runRealCalculation();
}

function runRealCalculation() {

  const equity = getValue("equity");
  const priceNight = getValue("price");          // PREZZO MEDIO NOTTE
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
  let roi = (netAfterMortgage / equity) * 100;
  if (!isFinite(roi)) roi = 0;

  let breakEven = netAfterMortgage > 0
    ? equity / netAfterMortgage
    : 99;

  // ===== STRESS TEST (-15% occupancy)
  const stressOccupancy = occupancy * 0.85;
  const stressNights = 365 * (stressOccupancy / 100);
  const stressGross = priceNight * stressNights;
  const stressFees = stressGross * (commission / 100);
  const stressProfit = stressGross - stressFees - yearlyExpenses;
  const stressTax = stressProfit > 0
    ? stressProfit * (tax / 100)
    : 0;

  const stressNet =
    stressProfit - stressTax - mortgageYearly;

  let stressROI = (stressNet / equity) * 100;
  if (!isFinite(stressROI)) stressROI = 0;

  const fiveYearProjection = netAfterMortgage * 5;

  // ===== RISK SCORE =====
  let risk = 50;

  if (roi < 5) risk += 20;
  if (roi > 20) risk -= 15;
  if (breakEven > 15) risk += 20;
  if (occupancy < 55) risk += 15;

  risk = Math.max(0, Math.min(100, risk));

  let grade =
    risk < 30 ? "A" :
    risk < 50 ? "B" :
    risk < 70 ? "C" : "D";

  window.lastAnalysisData = {
    roi,
    breakEven,
    stressROI,
    netAfterMortgage,
    fiveYearProjection,
    risk,
    grade
  };

  resultsDiv.innerHTML = `
    <div style="margin-bottom:20px;">
      <h3>Executive Investment Summary</h3>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;margin-bottom:20px;">
      <div><strong>ROI:</strong> ${roi.toFixed(2)}%</div>
      <div><strong>Break-even:</strong> ${breakEven.toFixed(1)} yrs</div>
      <div><strong>Stress ROI:</strong> ${stressROI.toFixed(2)}%</div>
      <div><strong>Grade:</strong> ${grade}</div>
    </div>

    <div style="margin-bottom:15px;">
      <strong>Annual Net:</strong> ${formatCurrency(netAfterMortgage)}<br>
      <strong>5-Year Projection:</strong> ${formatCurrency(fiveYearProjection)}
    </div>

    <button onclick="generatePDF()" 
      style="background:#0f172a;color:#fff;padding:10px 18px;border:none;border-radius:8px;cursor:pointer;">
      📄 Download Executive PDF
    </button>
  `;
}

// ===============================
// PDF
// ===============================

function generatePDF() {

  if (!window.lastAnalysisData) {
    alert("Run analysis first.");
    return;
  }

  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF("p","mm","a4");
  const d = window.lastAnalysisData;

  pdf.setFillColor(15,23,42);
  pdf.rect(0,0,210,35,"F");

  pdf.setTextColor(255,255,255);
  pdf.setFontSize(20);
  pdf.text("RendimentoBB", 20, 20);
  pdf.setFontSize(11);
  pdf.text("Executive Investment Report", 20, 28);

  pdf.setTextColor(0,0,0);
  pdf.setFontSize(14);
  pdf.text("Return on Investment (ROI)", 20, 50);

  pdf.setFontSize(34);
  pdf.text(d.roi.toFixed(2) + "%", 20, 65);

  pdf.setFontSize(12);
  pdf.text("Break-even: " + d.breakEven.toFixed(1) + " yrs", 20, 85);
  pdf.text("Stress ROI: " + d.stressROI.toFixed(2) + "%", 20, 95);
  pdf.text("Annual Net: " + formatCurrency(d.netAfterMortgage), 20, 105);
  pdf.text("5Y Projection: " + formatCurrency(d.fiveYearProjection), 20, 115);

  pdf.save("RendimentoBB_Executive_Report.pdf");
}
