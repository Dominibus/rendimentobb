// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 16.0
// PRO Firebase + Mortgage Comparator + Forecast + Investment Score + Sensitivity Engine
// ===============================================


// ================= FIRESTORE =================

import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const db = getFirestore();


// ================= SAVE ANALYSIS =================

async function saveAnalysis(data){

  if(!window.currentUser) return;

  try{

    await addDoc(collection(db,"analyses"),{

      uid: window.currentUser.uid,
      propertyPrice: data.price,
      equity: data.equity,
      roi: data.roi,
      risk: data.risk,
      createdAt: new Date()

    });

  }catch(e){

    console.error("Errore salvataggio analisi:",e);

  }

}


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

    insertMortgageData: "Inserisci importo e durata.",

    yearlyPayment: "Rata Annuale",
    totalInterest: "Totale Interessi",
    rate: "Tasso",

    insightSolid: "Investimento strutturalmente resiliente.",
    insightMedium: "Moderatamente sostenibile.",
    insightWeak: "Strutturalmente fragile.",

    lowScenario: "Scenario prudente",
    baseScenario: "Scenario base",
    highScenario: "Scenario ottimistico",

    grade: "Investment Grade",
    riskScore: "Risk Score",
    recommendation: "Raccomandazione"
  },

  en: {
    roi: "ROI",
    annualNet: "Annual Net",

    strategicLocked: "🔒 Strategic Interpretation Locked",
    unlock: "Upgrade to PRO",
    strategicTitle: "🔎 Strategic Interpretation",

    bestSolution: "🏆 Best Solution",

    insertMortgageData: "Insert amount and duration.",

    yearlyPayment: "Yearly Payment",
    totalInterest: "Total Interest",
    rate: "Rate",

    insightSolid: "Structurally resilient investment.",
    insightMedium: "Moderately viable.",
    insightWeak: "Structurally fragile.",

    lowScenario: "Low scenario",
    baseScenario: "Base scenario",
    highScenario: "High scenario",

    grade: "Investment Grade",
    riskScore: "Risk Score",
    recommendation: "Recommendation"
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

// ================= LAST ANALYSIS STORAGE =================
window.lastAnalysisData = null;

// ================= MORTGAGE =================

function calculateMortgage(amount, rate, years) {

  if (!amount || !years) return 0;

  if (rate === 0) return amount / years;

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

// ================= MARKET BENCHMARK =================

function renderMarketBenchmark(cityKey){

  if(!window.RB_MARKET_DATA) return;

  const data = window.RB_MARKET_DATA[cityKey];

  if(!data) return;

  const priceEl = document.getElementById("benchmark-price");
  const occEl = document.getElementById("benchmark-occupancy");
  const revEl = document.getElementById("benchmark-revenue");

  if(!priceEl || !occEl || !revEl) return;

  const price = data.price;
  const occupancy = data.occupancy;

  const nights = 365 * occupancy;
  const revenue = price * nights;

  priceEl.innerHTML = formatCurrency(price);

  occEl.innerHTML =
    Math.round(occupancy * 100) + "%";

  revEl.innerHTML =
    formatCurrency(revenue);

}

// ================= MARKET COMPARISON =================

function renderMarketComparison(userRevenue, cityKey){

  if(!window.getMarketBenchmark) return;

  const market = window.getMarketBenchmark(cityKey);

  if(!market) return;

  const container = document.getElementById("market-comparison");

  if(!container) return;

  const marketRevenue = market.estimatedRevenue;

  let message = "";
  let color = "#ef4444";

  if(userRevenue > marketRevenue){

    message =
      window.currentLang === "it"
      ? "✓ Performance superiore al mercato"
      : "✓ Outperforming market";

    color = "#10b981";

  }else{

    message =
      window.currentLang === "it"
      ? "⚠ Performance sotto media mercato"
      : "⚠ Underperforming market";

  }

  container.innerHTML = `

  <div class="kpi-box">
  <span>${window.currentLang==="it"?"Ricavo stimato":"Your estimated revenue"}</span>
  <strong>${formatCurrency(userRevenue)}</strong>
  </div>

  <div class="kpi-box">
  <span>${window.currentLang==="it"?"Media mercato":"Market average"}</span>
  <strong>${formatCurrency(marketRevenue)}</strong>
  </div>

  <div class="kpi-box">
  <span>${window.currentLang==="it"?"Valutazione":"Assessment"}</span>
  <strong style="color:${color}">${message}</strong>
  </div>

  `;

}

// ================= REVENUE FORECAST =================

function renderRevenueForecast(baseRevenue){

  const container = document.getElementById("revenue-forecast");
  if(!container) return;

  const low = baseRevenue * 0.8;
  const mid = baseRevenue;
  const high = baseRevenue * 1.2;

  container.innerHTML = `

  <div class="kpi-box">
    <span>${t("lowScenario")}</span>
    <strong>${formatCurrency(low)}</strong>
  </div>

  <div class="kpi-box">
    <span>${t("baseScenario")}</span>
    <strong>${formatCurrency(mid)}</strong>
  </div>

  <div class="kpi-box">
    <span>${t("highScenario")}</span>
    <strong>${formatCurrency(high)}</strong>
  </div>

  `;

}


// ================= OCCUPANCY SENSITIVITY =================

function renderOccupancySensitivity(
priceNight,
occupancy,
expenses,
commission,
tax,
mortgage,
equity
){
  
const container = document.getElementById("occupancy-sensitivity");
if(!container) return;

function simulate(occ){

const nights = 365 * (occ/100);
const gross = priceNight * nights;

const fees = gross * (commission/100);
const yearlyExpenses = expenses * 12;

const operatingProfit = gross - fees - yearlyExpenses;

const taxCost =
operatingProfit > 0 ? operatingProfit*(tax/100) : 0;

const net = operatingProfit - taxCost - mortgage;

const roi = equity > 0 ? (net/equity)*100 : 0;

return roi.toFixed(1);

}

const low = simulate(occupancy*0.9);
const base = simulate(occupancy);
const high = simulate(occupancy*1.1);

container.innerHTML = `

<div class="kpi-box">
<span>Occupazione -10%</span>
<strong>${low}% ROI</strong>
</div>

<div class="kpi-box">
<span>Occupazione Base</span>
<strong>${base}% ROI</strong>
</div>

<div class="kpi-box">
<span>Occupazione +10%</span>
<strong>${high}% ROI</strong>
</div>

`;

}

// ================= INVESTMENT SCORE =================

function renderInvestmentScore(roi, riskScore){

const container = document.getElementById("investment-score");
if(!container) return;

let grade = "C";
let recommendation = "High Risk";

if(roi > 12){
grade = "A";
recommendation = "SAFE INVESTMENT";
}

else if(roi > 6){
grade = "B";
recommendation = "MODERATE RETURN";
}

container.innerHTML = `

<div class="kpi-box">
<span>${t("grade")}</span>
<strong>${grade}</strong>
</div>

<div class="kpi-box">
<span>${t("riskScore")}</span>
<strong>${riskScore} / 100</strong>
</div>

<div class="kpi-box">
<span>${t("recommendation")}</span>
<strong>${recommendation}</strong>
</div>

`;

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

const riskScore =
roi > 12 ? 30 :
roi > 6 ? 55 :
75;

renderChart(netAfterMortgage);

renderStrategicInsight(roi);

renderRevenueForecast(gross);

renderInvestmentScore(roi, riskScore);

// MARKET BENCHMARK + COMPARISON

const citySelect = document.querySelector(".market-select");

if(citySelect && citySelect.value){

  renderMarketBenchmark(citySelect.value);

  renderMarketComparison(gross, citySelect.value);

}  

renderOccupancySensitivity(
priceNight,
occupancy,
expenses,
commission,
tax,
mortgageYearly,
equity
);

saveAnalysis({
price: getValue("price"),
equity: equity,
roi: roi,
risk: riskScore
});

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

// ================= EXECUTIVE PDF =================

async function generateExecutivePDF(){

if(!isProUnlocked){

alert(
window.currentLang==="it"
? "La generazione PDF è disponibile solo nella versione PRO"
: "PDF generation available only in PRO version"
);

return;

}

if(!window.lastAnalysisData){

alert(
window.currentLang==="it"
? "Genera prima l'analisi investimento"
: "Run the analysis first"
);

return;

}

const { jsPDF } = window.jspdf;

const data = window.lastAnalysisData;

const doc = new jsPDF();

let y = 20;


// ================= HEADER =================

doc.setFillColor(16,185,129);
doc.rect(0,0,210,15,"F");

doc.setTextColor(255,255,255);
doc.setFontSize(14);
doc.text("RendimentoBB Strategic Engine",20,10);

doc.setTextColor(0,0,0);

y = 30;


// ================= TITLE =================

doc.setFontSize(22);

doc.text(
window.currentLang==="it"
? "Report Strategico Investimento B&B"
: "Strategic B&B Investment Report",
20,
y
);

y += 12;

doc.setFontSize(11);

doc.text(
window.currentLang==="it"
? "Analisi professionale della sostenibilità economica di un investimento in struttura ricettiva."
: "Professional financial analysis of a short-term rental investment.",
20,
y,
{maxWidth:170}
);

y += 18;


// ================= INVESTMENT STRUCTURE =================

doc.setFontSize(14);

doc.setTextColor(16,185,129);

doc.text(
window.currentLang==="it"
? "Struttura Investimento"
: "Investment Structure",
20,
y
);

doc.setTextColor(0,0,0);

y += 10;

doc.setFontSize(11);

doc.text(
(window.currentLang==="it"?"Prezzo immobile: ":"Property price: ")
+ formatCurrency(data.price),
20,y
);

y += 8;

doc.text(
(window.currentLang==="it"?"Capitale investito: ":"Equity invested: ")
+ formatCurrency(data.equity),
20,y
);

y += 8;

doc.text(
(window.currentLang==="it"?"Importo mutuo: ":"Loan amount: ")
+ formatCurrency(data.loan),
20,y
);

y += 15;


// ================= FINANCIAL PERFORMANCE =================

doc.setFontSize(14);

doc.setTextColor(16,185,129);

doc.text(
window.currentLang==="it"
? "Performance Finanziaria"
: "Financial Performance",
20,
y
);

doc.setTextColor(0,0,0);

y += 10;

doc.setFontSize(11);

doc.text(
(window.currentLang==="it"?"Ricavi annui stimati: ":"Estimated annual revenue: ")
+ formatCurrency(data.revenue),
20,y
);

y += 8;

doc.text(
(window.currentLang==="it"?"Profitto netto annuo: ":"Annual net profit: ")
+ formatCurrency(data.profit),
20,y
);

y += 8;


// ================= ROI =================

let roiColor = [239,68,68];

if(data.roi > 12) roiColor = [16,185,129];
else if(data.roi > 6) roiColor = [245,158,11];

doc.setTextColor(...roiColor);

doc.setFontSize(16);

doc.text(
(window.currentLang==="it"?"ROI investimento: ":"Investment ROI: ")
+ data.roi.toFixed(2) + "%",
20,
y+5
);

doc.setTextColor(0,0,0);

y += 20;


// ================= INVESTMENT GRADE =================

let grade = "C";
let risk = "High Risk";

if(data.roi > 12){

grade = "A";
risk = window.currentLang==="it"?"Rischio moderato":"Moderate risk";

}
else if(data.roi > 6){

grade = "B";
risk = window.currentLang==="it"?"Rischio medio":"Medium risk";

}

doc.setFontSize(14);

doc.setTextColor(16,185,129);

doc.text(
window.currentLang==="it"
? "Valutazione Investimento"
: "Investment Grade",
20,
y
);

doc.setTextColor(0,0,0);

y += 10;

doc.setFontSize(11);

doc.text(
(window.currentLang==="it"?"Investment Grade: ":"Investment Grade: ")
+ grade,
20,y
);

y += 8;

doc.text(
(window.currentLang==="it"?"Profilo di rischio: ":"Risk profile: ")
+ risk,
20,y
);

y += 15;


// ================= STRATEGIC INSIGHT =================

doc.setFontSize(14);

doc.setTextColor(16,185,129);

doc.text(
window.currentLang==="it"
? "Interpretazione Strategica"
: "Strategic Insight",
20,
y
);

doc.setTextColor(0,0,0);

y += 10;

let insight;

if(data.roi > 12){

insight =
window.currentLang==="it"
? "L'investimento mostra una redditività molto elevata rispetto al capitale investito. La leva finanziaria amplifica il ritorno sull'equity mantenendo una struttura economica sostenibile."
: "The investment shows strong profitability relative to the invested equity. Financial leverage enhances returns while maintaining a sustainable structure.";

}
else if(data.roi > 6){

insight =
window.currentLang==="it"
? "L'investimento appare sostenibile ma con margini più contenuti. La redditività dipenderà fortemente dal mantenimento di livelli di occupazione stabili."
: "The investment appears viable but returns depend heavily on maintaining stable occupancy levels.";

}
else{

insight =
window.currentLang==="it"
? "La redditività prevista risulta limitata. Per migliorare la sostenibilità dell'investimento è consigliabile ottimizzare il prezzo medio o ridurre i costi operativi."
: "Projected profitability is weak. Improving pricing strategy or reducing operating costs could enhance sustainability.";

}

doc.setFontSize(11);

doc.text(insight,20,y,{maxWidth:170});

y += 25;


// ================= FOOTER =================

doc.setDrawColor(200);
doc.line(20,y,190,y);

y += 8;

doc.setFontSize(9);

doc.setTextColor(120);

doc.text(
window.currentLang==="it"
? "Report generato da RendimentoBB Strategic Engine"
: "Report generated by RendimentoBB Strategic Engine",
20,
y
);

doc.save("RendimentoBB-Investment-Report.pdf");

}



// ================= EXPORT GLOBAL =================

window.calculate = calculate;
window.compareMortgages = compareMortgages;
window.generateExecutivePDF = generateExecutivePDF;


// ================= CAPTURE LAST ANALYSIS =================

const originalCalculate = window.calculate;

window.calculate = function(){

originalCalculate();

const equity = getValue("equity");
const priceNight = getValue("priceNight");
const occupancy = getValue("occupancy");
const loanAmount = getValue("loanAmount");
const expenses = getValue("expenses");

const nights = 365 * (occupancy / 100);
const revenue = priceNight * nights;

const profit = revenue - (expenses * 12);

const roi = equity > 0 ? (profit / equity) * 100 : 0;

window.lastAnalysisData = {

price: getValue("price"),
equity: equity,
loan: loanAmount,
revenue: revenue,
profit: profit,
roi: roi,
risk: 0

};

};
