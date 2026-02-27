// ===============================
// SAFE LANGUAGE INIT
// ===============================

if (typeof currentLang === "undefined") {
  currentLang = "it";
}

// ===============================
// PRO STATUS INIT
// ===============================

let isProUnlocked = localStorage.getItem("proUnlocked") === "true";

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get("pro") === "paid") {
  isProUnlocked = true;
  localStorage.setItem("proUnlocked", "true");
  window.history.replaceState({}, document.title, window.location.pathname);
}

// ===============================
// STRIPE LINK
// ===============================

const STRIPE_PAYMENT_LINK =
  "https://buy.stripe.com/test_dRmeVcdNBefv7Njf6w8N200";

function unlockPro() {
  const locale = currentLang === "it" ? "it" : "en";
  window.location.href =
    STRIPE_PAYMENT_LINK +
    "?locale=" +
    locale +
    "&success_url=" +
    encodeURIComponent("https://rendimentobb.com/tool/?pro=paid");
}

function formatCurrency(value) {
  if (!isFinite(value)) value = 0;
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

let lastAnalysisData = null;

// ===============================
// CALCOLO MUTUO
// ===============================

function calculateMortgage(loanAmount, interestRate, loanYears) {

  if (!loanAmount || !interestRate || !loanYears) {
    return { monthlyPayment: 0, yearlyPayment: 0 };
  }

  const monthlyRate = (interestRate / 100) / 12;
  const totalPayments = loanYears * 12;

  const monthlyPayment =
    loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  return {
    monthlyPayment: monthlyPayment,
    yearlyPayment: monthlyPayment * 12
  };
}

// ===============================
// CALCULATE (SAFE VERSION)
// ===============================

function calculate() {

  const loader = document.getElementById("analysisLoader");
  const progress = document.getElementById("loaderProgress");
  const text = document.getElementById("loaderText");
  const resultsDiv = document.getElementById("results");

  if (!resultsDiv) return;

  // Se loader NON esiste → calcolo diretto
  if (!loader) {
    runRealCalculation();
    return;
  }

  resultsDiv.style.display = "none";
  loader.style.display = "block";

  if (progress) progress.style.width = "0%";

  const steps = [
    "Analyzing investment structure...",
    "Simulating revenue projections...",
    "Calculating mortgage amortization...",
    "Evaluating financial leverage...",
    "Generating professional output..."
  ];

  let current = 0;

  const interval = setInterval(() => {

    if (progress) {
      progress.style.width = ((current + 1) * 20) + "%";
    }

    if (text) {
      text.innerText = steps[current];
    }

    current++;

    if (current === steps.length) {

      clearInterval(interval);

      setTimeout(() => {

        loader.style.display = "none";
        resultsDiv.style.display = "block";
        runRealCalculation();

      }, 600);
    }

  }, 400);
}

// ===============================
// REAL CALCULATION
// ===============================

function runRealCalculation() {

  const propertyPrice = getValue("propertyPrice");
  const equity = getValue("equity");

  const loanAmount = getValue("loanAmount");
  const interestRate = getValue("interestRate");
  const loanYears = getValue("loanYears");

  const price = getValue("price");
  const occupancy = getValue("occupancy");
  const expenses = getValue("expenses");
  const commission = getValue("commission");
  const tax = getValue("tax");

  const resultsDiv = document.getElementById("results");

  if (!price || !occupancy || !equity) {
    resultsDiv.innerHTML = "Inserisci valori validi.";
    return;
  }

  const nightsPerMonth = 30 * (occupancy / 100);
  const grossYearly = price * nightsPerMonth * 12;
  const yearlyFees = grossYearly * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const profitBeforeTax = grossYearly - yearlyFees - yearlyExpenses;
  const taxCost = profitBeforeTax > 0 ? profitBeforeTax * (tax / 100) : 0;
  let netYearly = profitBeforeTax - taxCost;

  const mortgage = calculateMortgage(loanAmount, interestRate, loanYears);
  const netAfterMortgage = netYearly - mortgage.yearlyPayment;

  let baseROI = (netAfterMortgage / equity) * 100;
  if (!isFinite(baseROI)) baseROI = 0;

  let output = `
    <div class="result-card">
      <h4>📊 Analisi Base</h4>
      <div>Fatturato annuo: <strong>${formatCurrency(grossYearly)}</strong></div>
      <div>Utile netto operativo: <strong>${formatCurrency(netYearly)}</strong></div>
      <div>Rata annua mutuo: <strong>${formatCurrency(mortgage.yearlyPayment)}</strong></div>
      <div>Utile netto dopo mutuo: <strong>${formatCurrency(netAfterMortgage)}</strong></div>
      <div>ROI con leva finanziaria: <strong>${baseROI.toFixed(2)}%</strong></div>
    </div>
  `;

  if (!isProUnlocked) {
    resultsDiv.innerHTML = output;
    return;
  }

  const roi5Years = baseROI * 5;
  const breakEvenYears = netAfterMortgage > 0 ? equity / netAfterMortgage : 0;

  lastAnalysisData = {
    propertyPrice,
    equity,
    loanAmount,
    interestRate,
    loanYears,
    grossYearly,
    netYearly,
    mortgageYearly: mortgage.yearlyPayment,
    netAfterMortgage,
    baseROI,
    roi5Years,
    breakEvenYears
  };

  output += `
    <div class="result-card">
      <h4>📊 Analisi Strategica PRO</h4>
      <div>ROI 5 anni: <strong>${roi5Years.toFixed(2)}%</strong></div>
      <div>Break-even reale: <strong>${breakEvenYears ? breakEvenYears.toFixed(1) : "-"} anni</strong></div>
      <button onclick="generatePDF()" class="btn-primary" style="margin-top:20px;">
        📄 Genera Report PDF Professionale
      </button>
    </div>
  `;

  resultsDiv.innerHTML = output;
}
