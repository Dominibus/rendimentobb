// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 12.3 STABLE
// FULL VERSION + ALERT ENGINE + MORTGAGE SAFE
// ===============================================


// ================= PRO SYSTEM =================

let isProUnlocked = localStorage.getItem("proUnlocked") === "true";
let overrideMortgage = null;

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

const TEXT = {
  it: {
    stability: "📊 Matrice Stabilità",
    solid: "SOLIDO",
    marginal: "MARGINALE",
    unsustainable: "NON SOSTENIBILE",
    annualNet: "Netto Annuale",
    roi: "ROI",
    occ: "Occupazione",
    strategicLocked: "🔒 Interpretazione Strategica Bloccata",
    unlock: "Sblocca PRO – 19€",
    strategicTitle: "🔎 Interpretazione Strategica",
    bestSolution: "🏆 Miglior Soluzione",
    applyMortgage: "Applica miglior mutuo al ROI",
    proOnly: "🔒 Funzione PRO",
    proDesc: "L'integrazione del mutuo nel ROI è disponibile solo in modalità PRO.",
    insertMortgageData: "Inserisci importo e durata.",
    executiveScore: "Executive Investment Score",
    grade: "Classe Investimento",
    risk: "Livello di Rischio",
    payback: "Payback Stimato",
    alerts: "📌 Segnali Strategici di Rischio"
  },
  en: {
    stability: "📊 Stability Matrix",
    solid: "SOLID",
    marginal: "MARGINAL",
    unsustainable: "NOT SUSTAINABLE",
    annualNet: "Annual Net",
    roi: "ROI",
    occ: "Occupancy",
    strategicLocked: "🔒 Strategic Interpretation Locked",
    unlock: "Unlock PRO – 19€",
    strategicTitle: "🔎 Strategic Interpretation",
    bestSolution: "🏆 Best Solution",
    applyMortgage: "Apply best mortgage to ROI",
    proOnly: "🔒 PRO Feature",
    proDesc: "Mortgage integration into ROI is available only in PRO mode.",
    insertMortgageData: "Insert amount and duration.",
    executiveScore: "Executive Investment Score",
    grade: "Investment Grade",
    risk: "Risk Level",
    payback: "Estimated Payback",
    alerts: "📌 Strategic Risk Signals"
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

function scenarioLabel(roi) {
  if (roi > 12) return { text: t("solid"), class: "kpi-positive" };
  if (roi > 0) return { text: t("marginal"), class: "kpi-warning" };
  return { text: t("unsustainable"), class: "kpi-danger" };
}


// ================= EXECUTIVE SCORE =================

function calculateExecutiveScore(baseROI, roi60, netOperating, mortgageYearly, equity, netAfterMortgage) {

  let score = 0;

  if (baseROI > 15) score += 30;
  else if (baseROI > 10) score += 24;
  else if (baseROI > 5) score += 18;
  else if (baseROI > 0) score += 10;

  if (roi60 > 8) score += 25;
  else if (roi60 > 3) score += 18;
  else if (roi60 > 0) score += 10;

  let dscr = mortgageYearly > 0 ? netOperating / mortgageYearly : 2;

  if (dscr > 1.5) score += 25;
  else if (dscr > 1.2) score += 18;
  else if (dscr > 1) score += 10;

  let payback = netAfterMortgage > 0 ? equity / netAfterMortgage : 99;

  if (payback < 5) score += 20;
  else if (payback < 8) score += 15;
  else if (payback < 12) score += 8;

  let grade = "D";
  if (score >= 85) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 55) grade = "C";

  let risk =
    score > 80 ? (window.currentLang === "it" ? "Basso" : "Low")
    : score > 60 ? (window.currentLang === "it" ? "Medio" : "Medium")
    : score > 40 ? (window.currentLang === "it" ? "Alto" : "High")
    : (window.currentLang === "it" ? "Critico" : "Critical");

  return { score, grade, risk, payback: payback.toFixed(1), dscr };
}


// ================= ALERT ENGINE =================

function generateAlerts(baseROI, occupancy, commission, executive) {

  const alerts = [];

  if (baseROI < 0)
    alerts.push("❌ ROI negativo: modello non sostenibile.");

  if (occupancy > 85)
    alerts.push("⚠️ Occupazione superiore all'85%: possibile sovrastima.");

  if (commission > 18)
    alerts.push("⚠️ Commissioni elevate: margine operativo ridotto.");

  if (executive.payback > 10)
    alerts.push("⚠️ Payback superiore a 10 anni: recupero capitale lento.");

  if (executive.dscr < 1.1)
    alerts.push("❌ DSCR critico: rischio finanziario elevato.");

  return alerts;
}


// ================= MAIN =================

function calculate() {

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

  const s60 = calculateScenario(
    60,
    priceNight,
    commission,
    tax,
    expenses,
    mortgageYearly,
    equity
  );

  const executive = calculateExecutiveScore(
    base.roi,
    s60.roi,
    base.netOperating,
    mortgageYearly,
    equity,
    base.netAfterMortgage
  );

  const alerts = generateAlerts(
    base.roi,
    occupancy,
    commission,
    executive
  );

  const kpiContainer = document.getElementById("executive-kpi");

  kpiContainer.innerHTML = `
    <div class="kpi-box">
      ${t("executiveScore")}
      <strong>${executive.score}/100</strong>
    </div>

    <div class="kpi-box">
      ${t("grade")}
      <strong>${executive.grade}</strong>
    </div>

    <div class="kpi-box">
      ${t("risk")}
      <strong>${executive.risk}</strong>
    </div>

    <div class="kpi-box">
      ${t("payback")}
      <strong>${executive.payback} yrs</strong>
    </div>

    <div class="kpi-box ${scenarioLabel(base.roi).class}">
      ${t("roi")}
      <strong>${base.roi.toFixed(2)}%</strong>
    </div>

    <div class="kpi-box">
      ${t("annualNet")}
      <strong>${formatCurrency(base.netAfterMortgage)}</strong>
    </div>

    <div style="grid-column:1/-1;margin-top:30px;">
      <strong>${t("alerts")}</strong>
      <div style="margin-top:10px;">
        ${alerts.length === 0
          ? "<div style='color:#10b981;'>✔ Nessun segnale critico rilevato.</div>"
          : alerts.map(a=>`<div style="margin-bottom:6px;">${a}</div>`).join("")
        }
      </div>
    </div>
  `;

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
        <a href="?pro=paid" class="btn btn-primary">
           ${t("unlock")}
        </a>
      </div>
    `;
    return;
  }

  let message =
    baseROI > 12
      ? "Investment structurally resilient."
      : baseROI > 6
      ? "Moderately viable. Optimization recommended."
      : "Structurally fragile. Review pricing or financing.";

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


// ================= MORTGAGE COMPARATOR =================

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
    { name: "Bank A", rate: rateA, data: mortgageSimulation(amount, rateA, years) },
    { name: "Bank B", rate: rateB, data: mortgageSimulation(amount, rateB, years) },
    { name: "Bank C", rate: rateC, data: mortgageSimulation(amount, rateC, years) }
  ];

  banks.sort((a, b) => a.data.totalPaid - b.data.totalPaid);

  const best = banks[0];

  resultDiv.innerHTML = `
    <h4 style="margin-bottom:20px;">${t("bestSolution")}: ${best.name}</h4>

    <div class="kpi-grid">
      ${banks.map(bank => `
        <div class="kpi-box">
          <strong>${bank.name}</strong><br>
          Rate: ${bank.rate}%<br>
          Yearly Payment: ${formatCurrency(bank.data.yearlyPayment)}<br>
          Total Interest: ${formatCurrency(bank.data.totalInterest)}
        </div>
      `).join("")}
    </div>

    <div style="margin-top:30px;text-align:center;">
      <button onclick="applyBestMortgage(${best.data.yearlyPayment})"
        class="btn btn-primary">
        ${t("applyMortgage")}
      </button>
    </div>
  `;
}

function applyBestMortgage(yearlyPayment) {

  if (!isProUnlocked) {
    alert(t("proDesc"));
    return;
  }

  overrideMortgage = yearlyPayment;
  calculate();
}
