// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 13.3 FINAL
// PRO Firebase + Mortgage Comparator FIX
// ===============================================


// ================= PRO SYSTEM =================

let isProUnlocked = false;
let overrideMortgage = null;

function updateProStatus() {
  isProUnlocked = (window.currentPlan === "pro");
}

document.addEventListener("rb_plan_loaded", () => {
  updateProStatus();
  calculate();
});

updateProStatus();


// ================= LANGUAGE =================

if (!window.currentLang) {
  window.currentLang = localStorage.getItem("rb_lang") || "it";
}

const TEXT = {
  it: {
    roi: "ROI",
    annualNet: "Netto Annuale",
    strategicLocked: "🔒 Interpretazione Strategica Bloccata",
    unlock: "Upgrade a PRO",
    strategicTitle: "🔎 Interpretazione Strategica",
    bestSolution: "🏆 Miglior Soluzione",
    applyMortgage: "Applica miglior mutuo al ROI",
    proDesc: "Funzione disponibile solo in modalità PRO.",
    insertMortgageData: "Inserisci importo e durata.",
    yearlyPayment: "Rata Annuale",
    totalInterest: "Totale Interessi",
    rate: "Tasso",
    insightSolid: "Investimento strutturalmente resiliente.",
    insightMedium: "Moderatamente sostenibile.",
    insightWeak: "Strutturalmente fragile."
  },
  en: {
    roi: "ROI",
    annualNet: "Annual Net",
    strategicLocked: "🔒 Strategic Interpretation Locked",
    unlock: "Upgrade to PRO",
    strategicTitle: "🔎 Strategic Interpretation",
    bestSolution: "🏆 Best Solution",
    applyMortgage: "Apply best mortgage to ROI",
    proDesc: "Feature available only in PRO mode.",
    insertMortgageData: "Insert amount and duration.",
    yearlyPayment: "Yearly Payment",
    totalInterest: "Total Interest",
    rate: "Rate",
    insightSolid: "Structurally resilient investment.",
    insightMedium: "Moderately viable.",
    insightWeak: "Structurally fragile."
  }
};

function t(key) {
  return TEXT[window.currentLang || "it"][key];
}


// ================= UTIL =================

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

function calculateMortgage(amount, rate, years) {

  if (!amount || !years) return 0;

  if (rate === 0)
    return amount / years;

  const r = rate / 100;
  const n = years;

  return amount *
    (r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1);
}

function mortgageSimulation(amount, rate, years) {

  if (!amount || !rate || !years) return null;

  const yearlyPayment = calculateMortgage(amount, rate, years);
  const totalPaid = yearlyPayment * years;
  const totalInterest = totalPaid - amount;

  return { yearlyPayment, totalPaid, totalInterest };
}


// ================= MAIN CALC =================

function calculate() {

  updateProStatus();

  const equity = getValue("equity");
  const priceNight = getValue("priceNight");
  const occupancy = getValue("occupancy");
  const expenses = getValue("expenses");
  const commission = getValue("commission");
  const tax = getValue("tax");

  const loanAmount = getValue("loanAmount");
  const interestRate = getValue("interestRate");
  const loanYears = getValue("loanYears");

  if (!priceNight || !occupancy || equity <= 0) return;

  const mortgageYearly = overrideMortgage !== null
    ? overrideMortgage
    : calculateMortgage(loanAmount, interestRate, loanYears);

  const nights = 365 * (occupancy / 100);
  const gross = priceNight * nights;
  const fees = gross * (commission / 100);
  const yearlyExpenses = expenses * 12;

  const operatingProfit = gross - fees - yearlyExpenses;
  const taxCost = operatingProfit > 0 ? operatingProfit * (tax / 100) : 0;
  const netAfterMortgage = operatingProfit - taxCost - mortgageYearly;

  const roi = equity > 0 ? (netAfterMortgage / equity) * 100 : 0;

  renderChart(netAfterMortgage);
  renderStrategicInsight(roi);
}


// ================= STRATEGIC =================

function renderStrategicInsight(roi) {

  const box = document.getElementById("strategic-insight");
  if (!box) return;

  if (!isProUnlocked) {
    box.innerHTML = `
      <strong>${t("strategicLocked")}</strong>
      <div style="margin-top:10px;">
        <button class="btn btn-primary">${t("unlock")}</button>
      </div>
    `;
    return;
  }

  let message =
    roi > 12 ? t("insightSolid")
    : roi > 6 ? t("insightMedium")
    : t("insightWeak");

  box.innerHTML = `
    <strong>${t("strategicTitle")}</strong>
    <p style="margin-top:10px;">${message}</p>
  `;
}


// ================= MORTGAGE COMPARATOR =================

function compareMortgages() {

  const amount = getValue("mortgageAmount");
  const years = getValue("mortgageYears");

  const rateA = getValue("rateA");
  const rateB = getValue("rateB");
  const rateC = getValue("rateC");

  const resultDiv = document.getElementById("mortgage-results");
  if (!resultDiv) return;

  if (!amount || !years) {
    resultDiv.innerHTML = t("insertMortgageData");
    return;
  }

  const banks = [
    { name: "Bank A", rate: rateA },
    { name: "Bank B", rate: rateB },
    { name: "Bank C", rate: rateC }
  ];

  const results = banks.map(bank => {
    const data = mortgageSimulation(amount, bank.rate, years);
    return { ...bank, ...data };
  });

  results.sort((a, b) => a.totalPaid - b.totalPaid);

  const best = results[0];

  resultDiv.innerHTML = `
    <h4>${t("bestSolution")}: ${best.name}</h4>
    ${results.map(r => `
      <div class="kpi-box" style="margin-top:15px;">
        <strong>${r.name}</strong><br>
        ${t("rate")}: ${r.rate}%<br>
        ${t("yearlyPayment")}: ${formatCurrency(r.yearlyPayment)}<br>
        ${t("totalInterest")}: ${formatCurrency(r.totalInterest)}
      </div>
    `).join("")}
  `;
}


// ================= CHART =================

function renderChart(net) {

  const ctx = document.getElementById("roiChart");
  if (!ctx || typeof Chart === "undefined") return;

  if (roiChartInstance) roiChartInstance.destroy();

  roiChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Year 1","Year 2","Year 3","Year 4","Year 5"],
      datasets: [{
        data: [net, net*2, net*3, net*4, net*5],
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}
