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

  if(!window.currentUser || !window.currentUser.uid) return;

  try{

  await addDoc(collection(db,"analyses"),{
  uid: window.currentUser.uid,
  propertyPrice: data.price,
  equity: data.equity,
  roi: data.roi,
  risk: data.risk,
  city: data.city || window.currentCity || null,
  createdAt: new Date()
  });

  }catch(e){

    console.error("Errore salvataggio analisi:",e);

  }

}


// ================= PRO SYSTEM =================

function isProUnlocked(){
  return window.isProUser && window.isProUser();
}

function requirePro(feature="premium feature"){

if(!window.currentUser){

alert(
window.currentLang==="it"
? "Per utilizzare questa funzione devi creare un account gratuito."
: "Create a free account to use this feature."
);

window.location.href="/login";
return false;

}

if(!window.isProUser || !window.isProUser()){

if(confirm(
window.currentLang==="it"
? "Questa funzione è disponibile solo nella versione PRO.\n\nVuoi sbloccarla?"
: "This feature is available only in PRO version.\n\nUnlock now?"
)){
window.buyPro();
}

return false;

}

return true;

}

// evento quando firebase carica il piano
document.addEventListener("rb_plan_loaded", () => {

  console.log("Piano utente caricato:", window.currentPlan);

  if(typeof calculate === "function"){
    calculate();
  }

});


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


// ================= MORTGAGE COMPARATOR =================

window.compareMortgages = function(){

if(!window.currentUser){
alert("Devi effettuare il login.");
return;
}

if(!window.isProUser || !window.isProUser()){
alert("Questa funzione è disponibile solo nella versione PRO.");
return;
}

const amount = parseFloat(document.getElementById("mortgageAmount").value);
const years = parseFloat(document.getElementById("mortgageYears").value);

const rateA = parseFloat(document.getElementById("rateA").value)/100/12;
const rateB = parseFloat(document.getElementById("rateB").value)/100/12;
const rateC = parseFloat(document.getElementById("rateC").value)/100/12;

const months = years * 12;

function calc(rate){
return amount * rate / (1 - Math.pow(1 + rate, -months));
}

const a = calc(rateA);
const b = calc(rateB);
const c = calc(rateC);

const resultDiv = document.getElementById("mortgage-results");

if(!resultDiv) return;

resultDiv.innerHTML = `
<div class="results-grid">

<div class="metric-card">
<span>Banca A</span>
<strong>${a.toFixed(0)} €/mese</strong>
</div>

<div class="metric-card">
<span>Banca B</span>
<strong>${b.toFixed(0)} €/mese</strong>
</div>

<div class="metric-card">
<span>Banca C</span>
<strong>${c.toFixed(0)} €/mese</strong>
</div>

</div>
`;

}
// ================= MARKET BENCHMARK =================

function renderMarketBenchmark(cityKey){

  if(!window.RB_MARKET_DATA) return;

  const priceEl = document.getElementById("benchmark-price");
  const occEl = document.getElementById("benchmark-occupancy");
  const revEl = document.getElementById("benchmark-revenue");

  if(!priceEl || !occEl || !revEl) return;

  const data = window.RB_MARKET_DATA[cityKey];

  if(!data){

    priceEl.innerHTML = "—";
    occEl.innerHTML = "—";
    revEl.innerHTML = "—";

    return;
  }

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

// ================= ROI VS MARKET =================

function renderROIMarketComparison(roi, cityKey){

if(!window.RB_MARKET_DATA) return;

const container = document.getElementById("roi-market-comparison");
if(!container) return;

const market = window.RB_MARKET_DATA[cityKey];
if(!market) return;

const marketROI = market.roi || 10;

let message = "";
let color = "#ef4444";
let badge = "";

if(roi > marketROI){

message = "✓ ROI above city average";
color = "#10b981";

badge = `
<div style="
margin-bottom:12px;
padding:12px;
border-radius:10px;
background:#ecfdf5;
border:1px solid #10b981;
font-weight:600;
">

${window.currentLang==="it"
? "🏆 ROI sopra la media della città"
: "🏆 ROI above city average"}

</div>
`;

}else{

message = "⚠ ROI below city average";

}

container.innerHTML = badge + `

<div class="kpi-box">
<span>Your ROI</span>
<strong>${roi.toFixed(1)}%</strong>
</div>

<div class="kpi-box">
<span>${cityKey} average ROI</span>
<strong>${marketROI}%</strong>
</div>

<div class="kpi-box">
<span>Market comparison</span>
<strong style="color:${color}">
${message}
</strong>
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
<span>${window.currentLang==="it"?"Occupazione -10%":"Occupancy -10%"}</span>
<strong>${low}% ROI</strong>
</div>

<div class="kpi-box">
<span>${window.currentLang==="it"?"Occupazione Base":"Base Occupancy"}</span>
<strong>${base}% ROI</strong>
</div>

<div class="kpi-box">
<span>${window.currentLang==="it"?"Occupazione +10%":"Occupancy +10%"}</span>
<strong>${high}% ROI</strong>
</div>

`;

}

// ================= EXECUTIVE KPI =================

function renderExecutiveKPI(roi, net, revenue, equity){

const container = document.getElementById("executive-kpi");
if(!container) return;

const payback =
equity > 0 && net > 0
? (equity / net).toFixed(1)
: "—";

container.innerHTML = `

<div class="kpi-box">
<span>${t("roi")}</span>
<strong class="${roi >= 0 ? 'roi-positive' : 'roi-negative'}">
${roi.toFixed(2)}%
</strong>
</div>

<div class="kpi-box">
<span>${t("annualNet")}</span>
<strong>${formatCurrency(net)}</strong>
</div>

<div class="kpi-box">
<span>${window.currentLang==="it"?"Ricavi annui":"Estimated revenue"}</span>
<strong>${formatCurrency(revenue)}</strong>
</div>

<div class="kpi-box">
<span>${window.currentLang==="it"?"Payback":"Payback period"}</span>
<strong>${payback} yrs</strong>
</div>

`;

}

// ================= BREAK EVEN OCCUPANCY =================

function renderBreakEvenOccupancy(
priceNight,
expenses,
commission,
tax,
mortgage
){

const container = document.getElementById("break-even-kpi");
if(!container) return;

const yearlyExpenses = expenses * 12;

const costBase = yearlyExpenses + mortgage;

const revenuePerNight =
priceNight * (1 - commission/100) * (1 - tax/100);

if(revenuePerNight <= 0){

container.innerHTML = `
<div class="kpi-box">
<span>Break-even occupancy (min)</span>
<strong>—</strong>
</div>
`;

return;

}

const nightsNeeded = costBase / revenuePerNight;

const occupancy = (nightsNeeded / 365) * 100;

const occRounded = Math.min(100, Math.max(0, occupancy));

let color = "#ef4444";

if(occRounded < 60) color = "#10b981";
else if(occRounded < 75) color = "#f59e0b";

container.innerHTML = `

<div class="kpi-box">
<span>Break-even occupancy</span>
<strong style="color:${color}">
${occRounded.toFixed(1)}%
</strong>
</div>

<div class="kpi-box">
<span>Notti minime</span>
<strong>
${Math.round(nightsNeeded)}
</strong>
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

let gradeColor = "#ef4444";

if(grade === "A") gradeColor = "#10b981";
else if(grade === "B") gradeColor = "#f59e0b";

if(grade === "A") gradeColor = "#10b981";
else if(grade === "B") gradeColor = "#f59e0b";

container.innerHTML = `

<div class="kpi-box">
<span>${t("grade")}</span>
<strong style="color:${gradeColor};font-size:22px;">
${grade}
</strong>
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

// ================= INVESTMENT RANKING =================

function renderInvestmentRanking(roi){

const container = document.getElementById("investment-ranking");
if(!container) return;

let percentile = 50;
let label = "Average investment";

if(roi > 15){
percentile = 90;
label = "Top investment opportunity";
}
else if(roi > 10){
percentile = 75;
label = "Strong investment";
}
else if(roi > 6){
percentile = 60;
label = "Moderate opportunity";
}

container.innerHTML = `

<div class="kpi-box">
<span>Investment Ranking</span>
<strong>Top ${100-percentile}%</strong>
</div>

<div class="kpi-box">
<span>Market Position</span>
<strong>${label}</strong>
</div>

`;

}

// ================= RISK METER =================

function renderRiskMeter(riskScore){

const container = document.getElementById("investment-risk-meter");
if(!container) return;

let color = "#ef4444";
let icon = "🔴";
let labelIT = "Rischio elevato";
let labelEN = "High risk";

if(riskScore < 40){
color = "#10b981";
icon = "🟢";
labelIT = "Rischio basso";
labelEN = "Low risk";
}

else if(riskScore < 65){
color = "#f59e0b";
icon = "🟠";
labelIT = "Rischio medio";
labelEN = "Medium risk";
}

const label =
window.currentLang === "it"
? labelIT
: labelEN;

container.innerHTML = `

<div style="
padding:18px;
border-radius:12px;
background:#f8fafc;
border-left:6px solid ${color};
">

<strong style="font-size:16px;">
${icon} ${label}
</strong>

<p style="margin-top:6px;font-size:13px;color:#64748b">

${window.currentLang==="it"
? "Valutazione del rischio basata su ROI e sostenibilità finanziaria."
: "Risk evaluation based on ROI and financial sustainability."}

</p>

</div>

`;

}

// ================= INVESTMENT VERDICT =================

function renderInvestmentVerdict(roi, payback){

const box = document.getElementById("investment-verdict");
if(!box) return;

let color = "#ef4444";
let icon = "🔴";
let title = "High risk investment";
let message = "The expected return is low compared to the invested capital.";

if(roi > 12){

color = "#10b981";
icon = "🟢";
title = "Strong investment opportunity";
message = "ROI is well above market average and financial structure is solid.";

}

else if(roi > 6){

color = "#f59e0b";
icon = "🟠";
title = "Moderate investment";
message = "Returns are acceptable but depend strongly on occupancy stability.";

}

box.innerHTML = `

<div style="
padding:18px;
border-radius:12px;
background:#f8fafc;
border-left:6px solid ${color};
">

<strong style="font-size:16px;">
${icon} ${title}
</strong>

<p style="margin-top:8px;font-size:14px;">
${message}
</p>

</div>

`;

}

// ================= SMART PAYWALL =================

function showUpgradePopup(roi){

if(isProUnlocked()) return;

const lang = window.currentLang || "it";

const message = lang === "it"
? `Questo investimento sembra interessante.

ROI stimato: ${roi.toFixed(1)}%

Scopri:
• rischio reale
• comparatore mutui
• scenari mercato
• simulazioni occupazione
• report professionale

Sblocca l'analisi completa.`
: `This investment looks promising.

Estimated ROI: ${roi.toFixed(1)}%

Unlock:
• risk score
• mortgage comparator
• market scenarios
• occupancy simulations
• professional report`;

if(roi > 10){

setTimeout(()=>{

if(confirm(message)){
window.buyPro();
}

},1500);

}

}

// ================= SMART INVESTMENT ALERT =================

function renderSmartInvestmentAlert(roi){

const container = document.getElementById("smart-investment-alert");
if(!container) return;

if(window.currentPlan === "pro"){
container.innerHTML = "";
return;
}

let badge = "";

if(roi > 12){

badge = `
<div style="
margin-bottom:12px;
padding:10px;
border-radius:10px;
background:#fef3c7;
border:1px solid #f59e0b;
font-weight:600;
">

${window.currentLang==="it"
? "🔥 Investimento ad alto rendimento"
: "🔥 High Yield Investment"}

</div>
`;

}  

if(roi < 10){
container.innerHTML = "";
return;
}

container.innerHTML = badge + `

<div style="
margin-top:20px;
padding:20px;
border-radius:14px;
background:#ecfdf5;
border:1px solid #10b981;
text-align:center;
">

<strong style="font-size:16px;">
🔥 Questo investimento sembra molto interessante
</strong>

<p style="margin-top:8px;font-size:14px;">
ROI stimato: <strong>${roi.toFixed(1)}%</strong>
</p>

<p style="margin-top:10px;font-size:14px;">
Scopri nella versione PRO:
<br>
• rischio reale
<br>
• simulazioni mercato
<br>
• scenari occupazione
<br>
• report professionale
</p>

<button onclick="buyPro()" class="btn btn-primary" style="margin-top:10px;">
🔓 Sblocca versione PRO – 29€
</button>

</div>

`;

}

// ================= MAIN CALC =================

function calculate() {

const equity = getValue("equity");
const priceNight = getValue("priceNight");
const occupancy = getValue("occupancy");
const expenses = getValue("expenses");
const commission = getValue("commission");
const tax = getValue("tax");

if(!window.currentUser){

// utente non loggato può comunque fare simulazione
console.log("Utente non loggato – analisi solo locale");

}

const loanAmount = getValue("loanAmount");
const interestRate = getValue("interestRate");
const loanYears = getValue("loanYears");

if (equity <= 0) return;

const mortgageYearly =
calculateMortgage(loanAmount, interestRate, loanYears);

const nights = 365 * (occupancy / 100);
const gross = priceNight * nights;
const fees = gross * (commission / 100);
const yearlyExpenses = expenses * 12;

const operatingProfit = gross - fees - yearlyExpenses;

const taxCost = operatingProfit > 0 ? operatingProfit * (tax / 100) : 0;

const netAfterMortgage = operatingProfit - taxCost - mortgageYearly;

const roi = equity > 0 ? (netAfterMortgage / equity) * 100 : 0;
  
showUpgradePopup(roi);

window.lastROI = roi;  

const riskScore =
roi > 12 ? 30 :
roi > 6 ? 55 :
75;

// ================= PREVIEW PANEL =================

updatePreviewMetrics(roi.toFixed(1), riskScore);

const investmentScore = Math.round((roi * 2) - (riskScore * 0.5));

updateInvestmentScore(investmentScore);  

renderExecutiveKPI(roi, netAfterMortgage, gross, equity);

renderBreakEvenOccupancy(
priceNight,
expenses,
commission,
tax,
mortgageYearly
);  

renderChart(netAfterMortgage);

renderStrategicInsight(roi);

renderRevenueForecast(gross);

renderInvestmentScore(roi, riskScore);
renderInvestmentRanking(roi); 
renderRiskMeter(riskScore);  
renderSmartInvestmentAlert(roi);  
const payback =
equity > 0 && netAfterMortgage > 0
? (equity / netAfterMortgage)
: null;

renderInvestmentVerdict(roi, payback);  

// MARKET BENCHMARK + COMPARISON

const citySelect =
  document.querySelector(".market-select") ||
  document.getElementById("market-city") ||
  document.getElementById("city");

if(citySelect && citySelect.value){

  renderMarketBenchmark(citySelect.value);
  renderMarketComparison(gross, citySelect.value);
  renderROIMarketComparison(roi, citySelect.value);

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

let city =
document.getElementById("market-city")?.value ||
document.getElementById("city")?.value ||
null;

const propertyLink = localStorage.getItem("property_link") || "";

function extractCity(url){

const cities = [
"napoli",
"roma",
"milano",
"torino",
"bologna",
"firenze",
"venezia",
"genova",
"palermo"
];

for(const c of cities){
if(url.toLowerCase().includes(c)){
return c;
}
}

return null;
}

// se non è stata scelta manualmente
if(!city && propertyLink){
city = extractCity(propertyLink);
}

// fallback
if(!city){
city = "italy";
}

saveAnalysis({
price: getValue("price"),
equity: equity,
roi: roi,
risk: riskScore,
city: city
});

// SCROLL AUTOMATICO AI RISULTATI
const resultsSection = document.getElementById("results");

if(resultsSection){
resultsSection.scrollIntoView({
behavior: "smooth"
});
}

}

// ================= STRATEGIC =================

function renderStrategicInsight(roi) {

const box = document.getElementById("strategic-insight");

if (!box) return;

if(!window.isProUser || !window.isProUser()){

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

const resultDiv = document.getElementById("mortgage-results");
if (!resultDiv) return;


// ================= PRO CHECK =================

if(!window.currentUser){

resultDiv.innerHTML = `

<div class="results-card" style="text-align:center;">

<h3>🔒 Accesso richiesto</h3>

<p>
Per confrontare i mutui devi creare un account gratuito.
</p>

<button onclick="window.location.href='/login'" class="btn btn-primary">
Accedi o Registrati
</button>

</div>

`;

return;

}

if(!window.isProUser || !window.isProUser()){

resultDiv.innerHTML = `

<div class="results-card" style="text-align:center;">

<h3>🔒 Funzione PRO</h3>

<p>
Il comparatore mutui completo è disponibile nella versione PRO.
</p>

<button onclick="buyPro()" class="btn btn-primary">
🔓 Sblocca versione PRO – 29€
</button>

</div>

`;

return;

}


// ================= INPUT =================

const amount = getValue("mortgageAmount");
const years = getValue("mortgageYears");

const rateA = getValue("rateA");
const rateB = getValue("rateB");
const rateC = getValue("rateC");


if (!amount || !years) {

resultDiv.innerHTML = t("insertMortgageData");
return;

}


// ================= BANK LIST =================

const banks = [
{ name: "Bank A", rate: rateA },
{ name: "Bank B", rate: rateB },
{ name: "Bank C", rate: rateC }
];


// ================= CALCULATIONS =================

const results = banks
.map(bank => {

if(!bank.rate) return null;

const data = mortgageSimulation(amount, bank.rate, years);

return { ...bank, ...data };

})
.filter(Boolean);


if(results.length === 0){

resultDiv.innerHTML = "No mortgage data";
return;

}


// ================= SORT BEST =================

results.sort((a, b) => a.totalPaid - b.totalPaid);

const best = results[0];


// ================= RESULTS UI =================

resultDiv.innerHTML = `

<h4 style="margin-bottom:20px;">
🏆 ${t("bestSolution")}: <strong>${best.name}</strong>
</h4>

<div class="kpi-grid">

${results.map(r => `

<div class="kpi-box" style="
${r.name === best.name ? "border:2px solid #10b981;background:#ecfdf5;" : ""}
">

<strong>${r.name}</strong><br><br>

${t("rate")}: ${r.rate}%<br>

${t("yearlyPayment")}: ${formatCurrency(r.yearlyPayment)}<br>

${t("totalInterest")}: ${formatCurrency(r.totalInterest)}

</div>

`).join("")}

</div>

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

const lang = window.RB_LANG?.current || window.currentLang || "it";

if(!requirePro("pdf report")) return;

if(!window.lastAnalysisData){

alert(
lang==="it"
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
doc.rect(0,0,210,16,"F");

doc.setTextColor(255,255,255);
doc.setFontSize(14);
doc.text("RendimentoBB Strategic Engine",20,10);

doc.setTextColor(0,0,0);

y = 30;


// ================= TITLE =================

doc.setFontSize(22);

doc.text(
lang==="it"
? "Report Strategico Investimento B&B"
: "Strategic B&B Investment Report",
20,
y
);

y += 10;

doc.setFontSize(11);

doc.text(
lang==="it"
? "Analisi professionale della sostenibilità economica di un investimento in struttura ricettiva."
: "Professional financial analysis of a short-term rental investment.",
20,
y,
{maxWidth:170}
);

y += 8;


// ================= REPORT DATE =================

const reportDate = new Date().toLocaleDateString();

doc.setFontSize(9);

doc.text(
(lang==="it"?"Data report: ":"Report date: ")
+ reportDate,
20,
y
);

y += 15;


// ================= INVESTMENT STRUCTURE =================

doc.setFontSize(14);
doc.setTextColor(16,185,129);

doc.text(
lang==="it"
? "Struttura Investimento"
: "Investment Structure",
20,
y
);

doc.setTextColor(0,0,0);

y += 10;

const ltv = data.price > 0
? ((data.loan / data.price) * 100).toFixed(0)
: 0;

doc.setFontSize(11);

doc.text(
(lang==="it"?"Prezzo immobile: ":"Property price: ")
+ formatCurrency(data.price),
20,y
);

y += 7;

doc.text(
(lang==="it"?"Capitale investito: ":"Equity invested: ")
+ formatCurrency(data.equity),
20,y
);

y += 7;

doc.text(
(lang==="it"?"Importo mutuo: ":"Loan amount: ")
+ formatCurrency(data.loan),
20,y
);

y += 7;

doc.text(
(lang==="it"?"Loan to Value: ":"Loan to Value: ")
+ ltv + "%",
20,y
);

y += 15;

doc.text(
(lang==="it" ? "ROI investimento: " : "Investment ROI: ")
+ data.roi.toFixed(2) + "%",
150,
y+7
);


// ================= KPI BOX =================

doc.setFillColor(240,248,245);
doc.roundedRect(20,y,170,18,3,3,"F");

doc.setFontSize(11);

doc.text(
(lang==="it"?"Ricavi stimati: ":"Estimated revenue: ")
+ formatCurrency(data.revenue),
25,
y+7
);

doc.text(
(lang==="it"?"Profitto netto: ":"Net profit: ")
+ formatCurrency(data.profit),
95,
y+7
);

doc.text(
(lang==="it" ? "ROI: " : "ROI: ")
+ data.roi.toFixed(2) + "%",
150,
y+7
);

y += 28;


// ================= ROI =================

let roiColor = [239,68,68];

if(data.roi > 12) roiColor = [16,185,129];
else if(data.roi > 6) roiColor = [245,158,11];

doc.setTextColor(...roiColor);

doc.setFontSize(16);

doc.text(
(lang==="it"?"ROI investimento: ":"Investment ROI: ")
+ data.roi.toFixed(2) + "%",
20,
y
);

doc.setTextColor(0,0,0);

y += 18;


// ================= INVESTMENT GRADE =================

let grade = "C";
let risk = lang==="it"?"Rischio elevato":"High Risk";

if(data.roi > 12){

grade = "A";
risk = lang==="it"?"Rischio moderato":"Moderate risk";

}
else if(data.roi > 6){

grade = "B";
risk = lang==="it"?"Rischio medio":"Medium risk";

}

doc.setFontSize(14);
doc.setTextColor(16,185,129);

doc.text(
lang==="it"
? "Valutazione Investimento"
: "Investment Grade",
20,
y
);

doc.setTextColor(0,0,0);

y += 10;

doc.setFontSize(11);

doc.text(
(lang==="it"?"Investment Grade: ":"Investment Grade: ")
+ grade,
20,y
);

y += 7;

doc.text(
(lang==="it"?"Profilo di rischio: ":"Risk profile: ")
+ risk,
20,y
);

y += 15;


// ================= STRATEGIC INSIGHT =================

doc.setFontSize(14);
doc.setTextColor(16,185,129);

doc.text(
lang==="it"
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
lang==="it"
? "L'investimento mostra una redditività molto elevata rispetto al capitale investito. La leva finanziaria amplifica il ritorno sull'equity mantenendo una struttura economica sostenibile."
: "The investment shows strong profitability relative to the invested equity. Financial leverage enhances returns while maintaining a sustainable structure.";

}
else if(data.roi > 6){

insight =
lang==="it"
? "L'investimento appare sostenibile ma con margini più contenuti. La redditività dipenderà fortemente dal mantenimento di livelli di occupazione stabili."
: "The investment appears viable but returns depend heavily on maintaining stable occupancy levels.";

}
else{

insight =
lang==="it"
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
lang==="it"
? "Report generato da RendimentoBB Strategic Engine"
: "Report generated by RendimentoBB Strategic Engine",
20,
y
);


// ================= FILE NAME =================

const fileName = lang==="it"
? "RendimentoBB-Report-Investimento.pdf"
: "RendimentoBB-Investment-Report.pdf";

doc.save(fileName);

}


// ================= EXPORT GLOBAL =================

window.calculate = calculate;
window.compareMortgages = compareMortgages;
window.generateExecutivePDF = generateExecutivePDF;

window.analyzeProperty = function(){

const link = document.getElementById("property-link").value;

if(!link){
alert("Inserisci un link immobile");
return;
}

localStorage.setItem("property_link", link);

window.location.href = "/tool/";

};


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

const commission = getValue("commission");
const tax = getValue("tax");
const interestRate = getValue("interestRate");
const loanYears = getValue("loanYears");

const mortgage = calculateMortgage(loanAmount, interestRate, loanYears);

const fees = revenue * (commission / 100);

const operatingProfit = revenue - fees - (expenses * 12);

const taxCost = operatingProfit > 0
  ? operatingProfit * (tax / 100)
  : 0;

const profit = operatingProfit - taxCost - mortgage;

const roi = equity > 0 ? (profit / equity) * 100 : 0;

window.lastAnalysisData = {

price: getValue("price") || 0,
equity: equity,
loan: loanAmount,
revenue: revenue,
profit: profit,
roi: roi,
risk: roi > 12 ? 30 : roi > 6 ? 55 : 75

}; 

};

// ================= PROPERTY SCRAPER =================

async function scrapePropertyFromBrowser(url){

try{

// proxy CORS per leggere la pagina
const proxy =
"https://api.allorigins.win/raw?url=" + encodeURIComponent(url);

const response = await fetch(proxy);

const html = await response.text();

console.log("HTML loaded");

// ===== PRICE =====

let price = null;

let match = html.match(/€\s*([0-9\.\,]+)/);

if(match){

price = match[1]
.replace(/\./g,"")
.replace(",",".")
.trim();

price = parseFloat(price);

}

// ===== CITY =====

let city = null;

const cityMatch = html.match(/([A-Z][a-z]+)\s?(?:\(|\-)\s?(?:NA|RM|MI|FI)/);

if(cityMatch){
city = cityMatch[1];
}

console.log("Extracted price:", price);
console.log("Extracted city:", city);

return {
price: price || 0,
city: city || null
};

}catch(e){

console.error("Scraping error:", e);

return {
price:0,
city:null
};

}

}

// ================= PROPERTY LINK PARSER =================

async function loadPropertyFromLink(){

const link = localStorage.getItem("property_link");

if(!link) return;

console.log("Analisi immobile da link:", link);


// ===== AUTOFILL PREZZO DA SCANNER =====

const priceField =
document.querySelector("#price, #property-price");

if(priceField){

try{

const data = await scrapePropertyFromBrowser(link);

if(data && data.price){

priceField.value = data.price;

// salva città rilevata dallo scraper
if(data.city){
window.currentCity = data.city;
console.log("Città rilevata:", data.city);
}  

// salva prezzo per eventuale uso successivo
localStorage.setItem("property_price", data.price);

setTimeout(()=>{
if(typeof calculate === "function"){
calculate();
}
},300);  

}else{

alert("Errore durante l'analisi dell'annuncio.");

}

}catch(e){

console.error("Errore analisi immobile:", e);
alert("Errore durante l'analisi dell'annuncio.");

}

}


// ===== MOSTRA LINK ANALIZZATO =====

const linkBox = document.getElementById("property-source");

if(linkBox){

linkBox.innerHTML = `
<strong>📍 Immobile analizzato</strong><br>
<a href="${link}" target="_blank">${link}</a>
`;

}

let detectedCity = null;

const cityMap = {
napoli: "napoli",
roma: "roma",
milano: "milano",
firenze: "firenze",
torino: "torino",
bologna: "bologna",
venezia: "venezia",
genova: "genova",
palermo: "palermo"
};

for(const key in cityMap){

if(link.toLowerCase().includes(key)){
detectedCity = cityMap[key];
break;
}

}

} // <-- qui chiude loadPropertyFromLink()

// ================= AUTO LOAD PROPERTY =================

document.addEventListener("DOMContentLoaded", () => {

const link = localStorage.getItem("property_link");

if(link){
console.log("Analisi immobile da link:", link);
loadPropertyFromLink();
}

});
