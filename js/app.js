// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 13.2 STABLE
// PRO collegato a Firebase + bug fix
// ===============================================


// ================= PRO SYSTEM (FIREBASE) =================

let isProUnlocked = false;
let overrideMortgage = null;

// 🔥 funzione aggiorna stato PRO
function updateProStatus() {
  isProUnlocked = (window.currentPlan === "pro");
}

// ascolta evento Firebase
document.addEventListener("rb_plan_loaded", () => {
  updateProStatus();
  calculate();
});

// fallback iniziale
updateProStatus();


// ================= LANGUAGE =================

if (!window.currentLang) {
  window.currentLang = localStorage.getItem("rb_lang") || "it";
}

const TEXT = {
  it: {
    solid: "SOLIDO",
    marginal: "MARGINALE",
    unsustainable: "NON SOSTENIBILE",
    annualNet: "Netto Annuale",
    roi: "ROI",
    strategicLocked: "🔒 Interpretazione Strategica Bloccata",
    unlock: "Upgrade a PRO",
    strategicTitle: "🔎 Interpretazione Strategica",
    bestSolution: "🏆 Miglior Soluzione",
    applyMortgage: "Applica miglior mutuo al ROI",
    proDesc: "Funzione disponibile solo in modalità PRO.",
    insertMortgageData: "Inserisci importo e durata.",
    executiveScore: "Executive Investment Score",
    grade: "Classe Investimento",
    risk: "Livello di Rischio",
    payback: "Payback Stimato",
    yearlyPayment: "Rata Annuale",
    totalInterest: "Totale Interessi",
    rate: "Tasso",
    years: "anni",
    insightSolid: "Investimento strutturalmente resiliente.",
    insightMedium: "Moderatamente sostenibile. Ottimizzazione consigliata.",
    insightWeak: "Strutturalmente fragile. Rivedere pricing o finanziamento."
  },
  en: {
    solid: "SOLID",
    marginal: "MARGINAL",
    unsustainable: "NOT SUSTAINABLE",
    annualNet: "Annual Net",
    roi: "ROI",
    strategicLocked: "🔒 Strategic Interpretation Locked",
    unlock: "Upgrade to PRO",
    strategicTitle: "🔎 Strategic Interpretation",
    bestSolution: "🏆 Best Solution",
    applyMortgage: "Apply best mortgage to ROI",
    proDesc: "Feature available only in PRO mode.",
    insertMortgageData: "Insert amount and duration.",
    executiveScore: "Executive Investment Score",
    grade: "Investment Grade",
    risk: "Risk Level",
    payback: "Estimated Payback",
    yearlyPayment: "Yearly Payment",
    totalInterest: "Total Interest",
    rate: "Rate",
    years: "yrs",
    insightSolid: "Investment structurally resilient.",
    insightMedium: "Moderately viable. Optimization recommended.",
    insightWeak: "Structurally fragile. Review pricing or financing."
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


// 🔥 FIX ERRORE CONSOLE
function mortgageSimulation(amount, rate, years) {

  if (!amount || !rate || !years) return null;

  const r = rate / 100;
  const n = years;

  const yearlyPayment =
    amount *
    (r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1);

  const totalPaid = yearlyPayment * n;
  const totalInterest = totalPaid - amount;

  return { yearlyPayment, totalPaid, totalInterest };
}


// ================= SCENARIO =================

function calculateScenario(occ, priceNight, commission, tax, expenses, mortgageYearly, equity) {

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

  return { roi, netAfterMortgage, netOperating };
}


// ================= MAIN =================

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

  const base = calculateScenario(
    occupancy,
    priceNight,
    commission,
    tax,
    expenses,
    mortgageYearly,
    equity
  );

  renderChart(base.netAfterMortgage);
  renderStrategicInsight(base.roi);
}


// ================= STRATEGIC =================

function renderStrategicInsight(baseROI) {

  const insightBox = document.getElementById("strategic-insight");
  if (!insightBox) return;

  if (!isProUnlocked) {
    insightBox.innerHTML = `
      <strong>${t("strategicLocked")}</strong>
      <div style="margin-top:10px;">
        <button class="btn btn-primary">
           ${t("unlock")}
        </button>
      </div>
    `;
    return;
  }

  let message =
    baseROI > 12
      ? t("insightSolid")
      : baseROI > 6
      ? t("insightMedium")
      : t("insightWeak");

  insightBox.innerHTML = `
    <strong>${t("strategicTitle")}</strong>
    <p style="margin-top:10px;">${message}</p>
  `;
}


// ================= CHART =================

function renderChart(yearlyNet) {

  const ctx = document.getElementById("roiChart");
  if (!ctx || typeof Chart === "undefined") return;

  if (roiChartInstance) roiChartInstance.destroy();

  roiChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Year 1","Year 2","Year 3","Year 4","Year 5"],
      datasets: [{
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
      plugins: { legend: { display: false } }
    }
  });
}
