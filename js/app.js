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
  const isIT = window.currentLang === "it";

  // ===== HEADER =====
  pdf.setFillColor(10,20,40);
  pdf.rect(0,0,210,28,"F");

  pdf.setTextColor(255,255,255);
  pdf.setFontSize(18);
  pdf.text("RendimentoBB", 20, 17);

  pdf.setFontSize(9);
  pdf.text(
    isIT ? "Report Strategico di Investimento"
         : "Strategic Investment Report",
    20,
    23
  );

  pdf.setTextColor(0);

  // ===== ROI SECTION =====
  pdf.setFontSize(11);
  pdf.text(
    isIT
      ? "Cash-on-Cash Return (ROI su Equity)"
      : "Cash-on-Cash Return (Equity ROI)",
    20,
    45
  );

  pdf.setFontSize(38);
  pdf.text(d.roi.toFixed(2) + "%", 20, 63);

  pdf.setFontSize(8);
  pdf.setTextColor(120);
  pdf.text(
    isIT ? "Basato sul capitale proprio investito"
         : "Based on invested equity only",
    20,
    70
  );

  pdf.setTextColor(0);

  // ===== KPI BOX =====
  pdf.setFillColor(242,244,247);
  pdf.roundedRect(20, 78, 170, 30, 5, 5, "F");

  pdf.setFontSize(10);

  pdf.text(
    (isIT ? "Break-even: " : "Break-even: ") +
    d.breakEven.toFixed(1) +
    (isIT ? " anni" : " yrs"),
    28,
    90
  );

  pdf.text(
    (isIT ? "Stress ROI: " : "Stress ROI: ") +
    d.stressROI.toFixed(2) + "%",
    110,
    90
  );

  pdf.text(
    (isIT ? "Netto Annuo: " : "Annual Net: ") +
    formatCurrency(d.netAfterMortgage),
    28,
    102
  );

  pdf.text(
    (isIT ? "Proiezione 5 Anni: " : "5Y Projection: ") +
    formatCurrency(d.fiveYearProjection),
    110,
    102
  );

  // ===== RISK INDEX =====
  pdf.setFontSize(12);
  pdf.text(isIT ? "Indice di Rischio" : "Risk Index", 20, 125);

  const riskX = 20;
  const riskY = 130;
  const riskWidth = 170;
  const riskHeight = 8;

  pdf.setFillColor(34,197,94);
  pdf.rect(riskX, riskY, riskWidth * 0.33, riskHeight, "F");

  pdf.setFillColor(245,158,11);
  pdf.rect(riskX + riskWidth * 0.33, riskY, riskWidth * 0.34, riskHeight, "F");

  pdf.setFillColor(239,68,68);
  pdf.rect(riskX + riskWidth * 0.67, riskY, riskWidth * 0.33, riskHeight, "F");

  const indicatorPos = riskX + (riskWidth * d.risk / 100);
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.7);
  pdf.line(indicatorPos, riskY - 2, indicatorPos, riskY + riskHeight + 2);

  pdf.setFontSize(8);
  pdf.text(d.risk.toFixed(0) + "/100", indicatorPos - 5, riskY + 14);

  // ===== GRADE =====
  pdf.setFontSize(12);
  pdf.text(
    (isIT ? "Classe Investimento: " : "Investment Grade: ") + d.grade,
    20,
    150
  );

  // ===== STRATEGIC ASSESSMENT =====
  pdf.setFontSize(12);
  pdf.text(
    isIT ? "Valutazione Strategica" : "Strategic Assessment",
    20,
    165
  );

  pdf.setFillColor(245,247,250);
  pdf.roundedRect(20,170,170,20,4,4,"F");

  pdf.setFontSize(9);
  pdf.text(
    d.grade === "A"
      ? (isIT
          ? "Struttura finanziaria solida e resiliente."
          : "Strong and resilient financial structure.")
      : d.grade === "B"
      ? (isIT
          ? "Struttura sostenibile con rischio controllato."
          : "Sustainable structure with controlled risk.")
      : d.grade === "C"
      ? (isIT
          ? "Rendimento moderato con esposizione elevata."
          : "Moderate return with elevated exposure.")
      : (isIT
          ? "Profilo ad alto rischio con debolezza strutturale."
          : "High-risk profile with structural weakness."),
    25,
    183
  );

  // ===== EXECUTIVE VERDICT =====
  pdf.setFontSize(12);
  pdf.text(
    isIT ? "Verdetto Esecutivo" : "Executive Verdict",
    20,
    200
  );

  pdf.setFillColor(235,239,244);
  pdf.roundedRect(20,205,170,20,4,4,"F");

  pdf.setFontSize(9);
  pdf.text(
    d.roi > 10
      ? (isIT
          ? "Opportunità interessante nelle condizioni attuali."
          : "Attractive opportunity under current assumptions.")
      : (isIT
          ? "Richiede revisione strategica prima di procedere."
          : "Requires strategic review before proceeding."),
    25,
    218
  );

  // ===== FOOTER =====
  pdf.setFontSize(8);
  pdf.setTextColor(120);
  pdf.text(
    (isIT ? "Generato il " : "Generated on ") +
    new Date().toLocaleDateString(),
    20,
    285
  );

  pdf.save("RendimentoBB_Executive_Report.pdf");
}
