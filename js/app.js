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

import { app } from "./firebase-init.js";
const db = getFirestore(app);

// ================= CITY FROM HOMEPAGE =================

document.addEventListener("DOMContentLoaded",()=>{

const selectedCity = localStorage.getItem("selected_city");

if(!selectedCity) return;

const select = document.querySelector(".market-select");

if(select){

select.value = selectedCity;
applyMarketData(selectedCity);
changeCityBackground(selectedCity);

}

});

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


// ================= PLAN SYSTEM =================

function getUserPlan(){
  return window.currentPlan || "free";
}

function hasPlan(requiredPlan){

const plans = {
free:0,
starter:1,
investor:2,
pro:3
};

const userPlan = getUserPlan();

return plans[userPlan] >= plans[requiredPlan];

}

function requirePlan(requiredPlan){

if(!window.currentUser){

alert(
window.currentLang === "it"
? "Per usare questa funzione devi creare un account gratuito."
: "Create a free account to use this feature."
);

window.location.href="/login/";
return false;

}

if(!hasPlan(requiredPlan)){

if(confirm(
window.currentLang==="it"
? "Questa funzione richiede un piano superiore."
: "This feature requires a higher plan."
)){
window.location.href="/pricing/";
}

return false;

}

return true;

}

// ================= LANGUAGE EVENT =================

document.addEventListener("rb_language_changed", () => {

window.currentLang = getLang();

// aggiorna chart se presente
if(window.lastROI && typeof renderChart === "function"){
renderChart(window.lastROI);
}

});

// ================= LANGUAGE SYNC =================

// lingua iniziale sincronizzata con lang.js
function getLang(){
return window.RB_LANG?.current || localStorage.getItem("rb_lang") || "it";
}

window.currentLang = getLang();

const TEXT = {

  it: {
    roi: "ROI",
    annualNet: "Netto Annuale",

    estimatedRevenue: "Ricavi annui",
    marketAverage: "Media mercato",
    assessment: "Valutazione",

    roiAboveCity: "🏆 ROI sopra la media della città",
    roiBelowCity: "⚠ ROI sotto la media della città",

    breakEvenOcc: "Occupazione break-even",
    minimumNights: "Notti minime",

    investmentRanking: "Ranking investimento",
    marketPosition: "Posizione mercato",

    highYield: "🔥 Investimento ad alto rendimento",
    highYieldDesc: "Questo investimento sembra molto interessante",

    loginRequired: "🔒 Accesso richiesto",
    createAccountMortgage: "Per confrontare i mutui devi creare un account gratuito.",
    loginRegister: "Accedi o Registrati",

    proFeature: "🔒 Funzione PRO",
    mortgageProDesc: "Il comparatore mutui completo è disponibile nella versione PRO.",

    insertPropertyLink: "Inserisci un link immobile",

    strategicLocked: "🔒 Interpretazione Strategica Bloccata",
    unlock: "Sblocca versione PRO",
    strategicTitle: "🔎 Interpretazione Strategica",

    bestSolution: "🏆 Miglior Soluzione",

    insertMortgageData: "Inserisci importo e durata.",

    yearlyPayment: "Rata Annuale",
    totalInterest: "Totale Interessi",
    rate: "Tasso",

    mortgageComparison:"Confronto mutui",
    bestMortgage:"Miglior mutuo",
    bank:"Banca",

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

    estimatedRevenue: "Estimated revenue",
    marketAverage: "Market average",
    assessment: "Assessment",

    roiAboveCity: "🏆 ROI above city average",
    roiBelowCity: "⚠ ROI below city average",

    breakEvenOcc: "Break-even occupancy",
    minimumNights: "Minimum nights",

    investmentRanking: "Investment ranking",
    marketPosition: "Market position",

    highYield: "🔥 High Yield Investment",
    highYieldDesc: "This investment looks very interesting",

    loginRequired: "🔒 Login required",
    createAccountMortgage: "Create a free account to compare mortgages.",
    loginRegister: "Login or Register",

    proFeature: "🔒 PRO Feature",
    mortgageProDesc: "Full mortgage comparator available in PRO.",

    insertPropertyLink: "Insert property link",

    strategicLocked: "🔒 Strategic Interpretation Locked",
    unlock: "Unlock PRO version",
    strategicTitle: "🔎 Strategic Interpretation",

    bestSolution: "🏆 Best Solution",

    insertMortgageData: "Insert amount and duration.",

    yearlyPayment: "Yearly Payment",
    totalInterest: "Total Interest",
    rate: "Rate",
    
    mortgageComparison:"Mortgage comparison",
    bestMortgage:"Best mortgage",
    bank:"Bank",

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

function t(key){

const lang = getLang();
  
return TEXT[lang]?.[key] || TEXT["en"]?.[key] || key;

}


// ================= UTIL =================

// ================= HERO CITY BACKGROUND =================

function changeCityBackground(city){

const hero = document.querySelector(".tool-hero");

if(!hero) return;

const images = {

roma: "/img/rome-bg.jpg",
napoli: "/img/naples-bg.jpg",
milano: "/img/milan-bg.jpg",
firenze: "/img/florence-bg.jpg"

};

if(!images[city]) return;

hero.style.background =
"linear-gradient(rgba(255,255,255,0.55),rgba(255,255,255,0.75)), url('" +
images[city] +
"')";

hero.style.backgroundSize = "cover";
hero.style.backgroundPosition = "center";

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
  <span>${t("estimatedRevenue")}</span>
  <strong>${formatCurrency(userRevenue)}</strong>
  </div>

  <div class="kpi-box">
  <span>${t("marketAverage")}</span>
  <strong>${formatCurrency(marketRevenue)}</strong>
  </div>

  <div class="kpi-box">
  <span>${t("assessment")}</span>
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

${t("roiAboveCity")}

</div>
`;

}else{

message = "⚠ ROI below city average";

}

container.innerHTML = badge + `

<div class="kpi-box">
<span>${window.currentLang==="it"?"ROI investimento":"Your ROI"}</span>
<strong>${roi.toFixed(1)}%</strong>
</div>

<div class="kpi-box">
<span>
${window.currentLang==="it"
? "ROI medio " + cityKey
: cityKey + " average ROI"}
</span>
<strong>${marketROI}%</strong>
</div>

<div class="kpi-box">
<span>${window.currentLang==="it"?"Confronto mercato":"Market comparison"}</span>
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
<span>${t("estimatedRevenue")}</span>
<strong>${formatCurrency(revenue)}</strong>
</div>

<div class="kpi-box">
<span>${window.currentLang==="it"?"Payback investimento":"Investment payback"}</span>
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
<span>${t("breakEvenOcc")}</span>
<strong style="color:${color}">
${occRounded.toFixed(1)}%
</strong>
</div>

<div class="kpi-box">
<span>${t("minimumNights")}</span>
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
let label =
window.currentLang==="it"
? "Investimento medio"
: "Average investment";

if(roi > 15){
percentile = 90;
label =
window.currentLang==="it"
? "Investimento eccellente"
: "Top investment opportunity";
}
else if(roi > 10){
percentile = 75;
label =
window.currentLang==="it"
? "Investimento forte"
: "Strong investment";
}
else if(roi > 6){
percentile = 60;
label =
window.currentLang==="it"
? "Opportunità moderata"
: "Moderate opportunity";
}

container.innerHTML = `

<div class="kpi-box">
<span>${window.currentLang==="it"?"Ranking investimento":"Investment ranking"}</span>
<strong>Top ${100-percentile}%</strong>
</div>

<div class="kpi-box">
<span>${t("investmentRanking")}</span>
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
let title =
window.currentLang==="it"
? "Investimento ad alto rischio"
: "High risk investment";
let message =
window.currentLang==="it"
? "Il rendimento atteso è basso rispetto al capitale investito."
: "The expected return is low compared to the invested capital.";

if(roi > 12){

color = "#10b981";
icon = "🟢";
title =
window.currentLang==="it"
? "Ottima opportunità investimento"
: "Strong investment opportunity";
message =
window.currentLang==="it"
? "Il ROI è molto superiore alla media del mercato e la struttura finanziaria è solida."
: "ROI is well above market average and financial structure is solid.";

}

else if(roi > 6){

color = "#f59e0b";
icon = "🟠";
title =
window.currentLang==="it"
? "Investimento moderato"
: "Moderate investment";
message =
window.currentLang==="it"
? "Il rendimento è accettabile ma dipende molto dalla stabilità dell'occupazione."
: "Returns are acceptable but depend strongly on occupancy stability.";

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

if(hasPlan("investor")) return;

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

if(roi > 8){

setTimeout(()=>{

showUpgradeModal(roi);

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
${t("highYield")}
</strong>

<p style="margin-top:8px;font-size:14px;">
ROI stimato: <strong>${roi.toFixed(1)}%</strong>
</p>

<p style="margin-top:10px;font-size:14px;">
${t("highYieldDesc")}
</p>

<button onclick="startPlanPurchase('investor')" class="btn btn-primary">
${window.currentLang==="it"
? "🔓 Accedi gratis per vedere l'analisi completa – 19€/mese"
: "🔓 Login to unlock full analysis – €19/month"}
</button>

<div style="margin-top:6px;font-size:12px;color:#64748b;">
Accesso a tutte le simulazioni professionali
</div>

</div>

`;

}

// ================= UPGRADE MODAL =================

function showUpgradeModal(roi){

const container = document.getElementById("smart-investment-alert");

if(!container) return;

const lang = window.currentLang || "it";

const title =
lang === "it"
? "🔥 Investimento promettente"
: "🔥 Promising investment";

const discover =
lang === "it"
? "Scopri l'analisi completa"
: "Discover the full analysis";

const risk =
lang === "it"
? "rischio reale"
: "real risk";

const benchmark =
lang === "it"
? "benchmark mercato"
: "market benchmark";

const occupancy =
lang === "it"
? "simulazione occupazione"
: "occupancy simulation";

const mortgage =
lang === "it"
? "comparatore mutui"
: "mortgage comparator";

const report =
lang === "it"
? "report professionale"
: "professional report";

const unlock =
lang === "it"
? "🔓 Sblocca analisi completa – 19€/mese"
: "🔓 Unlock full analysis – €19/month";

const roiText =
lang === "it"
? "ROI stimato"
: "Estimated ROI";

container.innerHTML = `

<div style="
margin-top:20px;
padding:24px;
border-radius:14px;
background:#ecfdf5;
border:1px solid #10b981;
text-align:center;
">

<h3 style="margin-bottom:10px;">
${title}
</h3>

<p>
${roiText}: <strong>${roi.toFixed(1)}%</strong>
</p>

<p style="margin-top:10px;font-size:14px;">
${discover}:
<br>
• ${risk}
<br>
• ${benchmark}
<br>
• ${occupancy}
<br>
• ${mortgage}
<br>
• ${report}
</p>

<button onclick="startPlanPurchase('investor')" class="btn btn-primary">
${unlock}
</button>

<div style="margin-top:8px;font-size:12px;color:#64748b;">
${lang === "it"
? "Accesso completo a tutte le simulazioni professionali"
: "Full access to all professional simulations"}
</div>

</div>

`;

}

// ================= MAIN CALC =================

function calculate() {
  // attende che Firebase sia pronto
if(!window.firebaseReady){

console.log("Firebase non pronto, attendo auth...");

document.addEventListener("rb_auth_ready", () => {
calculate();
},{ once:true });

document.getElementById("executive-kpi").innerHTML = `
<div class="kpi-box">
<span>Loading...</span>
<strong>...</strong>
</div>
`;

return;

}

// ================= FREE LIMIT =================

let freeRuns =
parseInt(localStorage.getItem("rb_free_runs") || "0");

if(!window.currentUser && freeRuns >= 3){

alert(
window.currentLang==="it"
? "Hai raggiunto il limite di simulazioni gratuite. Crea un account gratuito per continuare."
: "You reached the free simulation limit. Create a free account to continue."
);

window.location.href="/login/";
return;

}

// incrementa solo dopo simulazione reale
if(!window.currentUser){
freeRuns++;
localStorage.setItem("rb_free_runs", freeRuns);
}

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

if (equity < 0) return;

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

window.lastROI = roi;  

const riskScore =
roi > 12 ? 30 :
roi > 6 ? 55 :
75;

// ================= PREVIEW PANEL =================

if(typeof updatePreviewMetrics === "function"){
updatePreviewMetrics(roi.toFixed(1), riskScore);
}

const investmentScore = Math.round((roi * 2) - (riskScore * 0.5));

if(typeof updateInvestmentScore === "function"){
updateInvestmentScore(investmentScore);
}  

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
  
showUpgradePopup(roi);

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

if(window.currentUser){

saveAnalysis({
price: getValue("price"),
equity: equity,
roi: roi,
risk: riskScore,
city: city
});

} 

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

if(!hasPlan("investor")){

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

<h3>${t("loginRequired")}</h3>

<p>
${t("createAccountMortgage")}
</p>

<button onclick="window.location.href='/login'" class="btn btn-primary">
${t("loginRegister")}
</button>

</div>

`;

return;

}

if(!hasPlan("investor")){

resultDiv.innerHTML = `

<div class="results-card" style="text-align:center;">

<h3>${t("proFeature")}</h3>

<p>
${t("mortgageProDesc")}
</p>

<button onclick="startPlanPurchase('investor')" class="btn btn-primary">
🔓 Sblocca analisi completa – 19€/mese
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

if(!window.RB_MORTGAGE_RATES){

resultDiv.innerHTML =
window.currentLang==="it"
? "Dati banche non disponibili."
: "Bank data not available.";

return;

}

const banks = Object.values(window.RB_MORTGAGE_RATES).map(bank => ({

name:
bank.name[
window.RB_LANG?.current ||
window.currentLang ||
"it"
],

rate: bank.rate

}));

// ================= CALCULATIONS =================

const results = banks
.map(bank => {

if(!bank.rate) return null;

const data = mortgageSimulation(amount, bank.rate, years);

return { ...bank, ...data };

})
.filter(Boolean);


if(results.length === 0){

resultDiv.innerHTML =
window.currentLang==="it"
? "Nessun dato mutuo disponibile"
: "No mortgage data available";
return;

}


// ================= SORT BEST =================

results.sort((a, b) => a.totalPaid - b.totalPaid);

const best = results[0];


// ================= RESULTS UI =================

resultDiv.innerHTML = `

<h4 style="margin-bottom:25px;">
🏆 ${t("bestMortgage")}: <strong>${best.name}</strong>
</h4>

<div class="mortgage-grid">

${results.map((r,index) => `

<div class="mortgage-card ${r.name === best.name ? "best-mortgage" : ""}">

<div class="mortgage-header">

<div class="mortgage-rank">
#${index+1}
</div>

<div class="mortgage-bank">
🏦 ${r.name}
</div>

${r.name === best.name ? `
<div class="mortgage-badge">
🏆 ${t("bestMortgage")}
</div>
` : ""}

</div>

<div class="mortgage-main">

<div class="mortgage-rate">
<span>${t("rate")}</span>
<strong>${r.rate}%</strong>
</div>

<div class="mortgage-payment">
<span>${t("yearlyPayment")}</span>
<strong>${formatCurrency(r.yearlyPayment)}</strong>
</div>

</div>

<div class="mortgage-footer">

<div class="mortgage-interest">
<span>${t("totalInterest")}</span>
<strong>${formatCurrency(r.totalInterest)}</strong>
</div>

<button class="mortgage-roi-btn"
onclick="document.getElementById('interestRate').value=${r.rate};window.calculate();">

${window.currentLang==="it"
? "Simula ROI con questo mutuo"
: "Simulate ROI with this mortgage"}

</button>

</div>

</div>

`).join("")}

</div>

`;

}

// ================= CHART =================

function renderChart(net){
  
const annualProfit = net;

const ctx = document.getElementById("roiChart");

if(!ctx || typeof Chart === "undefined") return;

if(roiChartInstance) roiChartInstance.destroy();

// anni simulazione
const years = [1,2,3,4,5,6,7,8,9,10];

// scenari
const conservative = years.map(y => net * y * 0.8);
const base = years.map(y => net * y);
const optimistic = years.map(y => net * y * 1.2);

roiChartInstance = new Chart(ctx,{

type:"line",

data:{
labels: window.currentLang==="it"
? years.map(y=>"Anno "+y)
: years.map(y=>"Year "+y),

datasets:[

{
label: t("lowScenario"),
data: conservative,
borderColor:"#ef4444",
backgroundColor:"rgba(239,68,68,0.1)",
tension:0.35,
borderWidth:2,
fill:true,
pointRadius:2,
pointHoverRadius:5
},

{
label: t("baseScenario"),
data: base,
borderColor:"#3b82f6",
backgroundColor:"rgba(59,130,246,0.15)",
tension:0.35,
borderWidth:3,
fill:true,
pointRadius:2,
pointHoverRadius:5
},

{
label: t("highScenario"),
data: optimistic,
borderColor:"#10b981",
backgroundColor:"rgba(16,185,129,0.15)",
tension:0.35,
borderWidth:2,
fill:true,
pointRadius:2,
pointHoverRadius:5
}

]
},

options:{

responsive:true,

interaction:{
mode:"index",
intersect:false
},

plugins:{

legend:{
display:true,
position:"bottom"
},

tooltip:{
callbacks:{
label:(ctx)=>formatCurrency(ctx.raw)
}
}

},

scales:{

y:{
ticks:{
callback:(v)=>formatCurrency(v)
}
}

}

}

});

}

// ================= EXECUTIVE PDF =================

async function generateExecutivePDF(){

const lang = window.RB_LANG?.current || window.currentLang || "it";

if(!requirePlan("pro")) return;

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

let y = 34;


// ================= HEADER =================

doc.setFillColor(16,185,129);
doc.rect(0,0,210,26,"F");

doc.setTextColor(255,255,255);
doc.setFontSize(12);

doc.text("RendimentoBB Strategic Engine",20,14);

doc.setFontSize(9);

doc.text(
lang==="it"
? "Report Intelligence Investimenti"
: "Investment Intelligence Report",
20,
20
);


// ================= LOGO =================

const logo = new Image();
logo.src="/img/logo-report.png";

await new Promise(resolve=>logo.onload=resolve);

doc.addImage(logo,"PNG",140,3,55,18);


// ================= TITLE =================

doc.setTextColor(0,0,0);
doc.setFontSize(22);

doc.text(
lang==="it"
?"Report Strategico Investimento B&B"
:"Strategic B&B Investment Report",
20,
y
);

y+=10;

doc.setFontSize(11);

doc.text(
lang==="it"
?"Analisi professionale della sostenibilità economica di un investimento in struttura ricettiva."
:"Professional financial analysis of a short-term rental investment.",
20,
y,
{maxWidth:170}
);

y+=10;


// ================= DATE =================

doc.setFontSize(9);

doc.text(
(lang==="it"?"Data report: ":"Report date: ")
+ new Date().toLocaleDateString(),
20,
y
);

y+=14;


// ================= EXECUTIVE SUMMARY =================

doc.setFontSize(14);
doc.setTextColor(16,185,129);

doc.text("Executive Summary",20,y);

y+=8;

doc.setTextColor(0,0,0);

let verdict;

if(data.roi>12){
verdict = t("insightSolid");
}
else if(data.roi>6){
verdict = t("insightMedium");
}
else{
verdict = t("insightWeak");
}

doc.setFontSize(11);
doc.text(verdict,20,y,{maxWidth:170});

y+=15;


// ================= INVESTMENT STRUCTURE =================

doc.setFontSize(14);
doc.setTextColor(16,185,129);

doc.text(
lang==="it"
?"Struttura Investimento"
:"Investment Structure",
20,
y
);

y+=10;

doc.setTextColor(0,0,0);
doc.setFontSize(11);

const ltv = data.price>0
? ((data.loan/data.price)*100).toFixed(0)
:0;

doc.text(
(lang==="it"?"Prezzo immobile: ":"Property price: ")
+ formatCurrency(data.price),
20,
y
); y+=7;

doc.text(
(lang==="it"?"Capitale investito: ":"Equity invested: ")
+ formatCurrency(data.equity),
20,
y
); y+=7;

doc.text(
(lang==="it"?"Importo mutuo: ":"Loan amount: ")
+ formatCurrency(data.loan),
20,
y
); y+=7;

doc.text("Loan to Value: "+ltv+"%",20,y);

y+=14;


// ================= KPI BOX =================

doc.setDrawColor(220);
doc.roundedRect(20,y,170,22,3,3);

doc.setFontSize(11);

doc.text(
(lang==="it"?"Ricavi: ":"Revenue: ")
+ formatCurrency(data.revenue),
25,
y+9
);

doc.text(
(lang==="it"?"Profitto: ":"Profit: ")
+ formatCurrency(data.profit),
90,
y+9
);

doc.text(
t("roi")+": "+data.roi.toFixed(2)+"%",
150,
y+9
);

y+=30;

// ================= ADVANCED KPI =================

const payback =
data.profit > 0 && data.equity > 0
? (data.equity / data.profit)
: null;

doc.setDrawColor(220);
doc.roundedRect(20,y,170,26,3,3);

doc.setFontSize(11);

doc.text(
(lang==="it"?"Payback investimento: ":"Investment payback: "),
25,
y+10
);

doc.text(
payback
? payback.toFixed(1) + (lang==="it"?" anni":" yrs")
: "—",
85,
y+10
);

doc.text(
(lang==="it"?"Margine profitto: ":"Profit margin: "),
110,
y+10
);

const margin =
data.revenue > 0
? ((data.profit/data.revenue)*100)
:0;

doc.text(
margin.toFixed(1)+"%",
150,
y+10
);

y+=34;  


// ================= ROI =================

doc.setFontSize(22);
doc.setTextColor(16,185,129);

doc.text(
t("roi")+": "+data.roi.toFixed(2)+"%",
20,
y
);

doc.setTextColor(0,0,0);

y+=18;


// ================= SCENARIOS =================

doc.setFontSize(14);
doc.setTextColor(16,185,129);

doc.text(
lang==="it"
?"Scenario Ricavi"
:"Revenue Scenarios",
20,
y
);

y+=10;

doc.setFontSize(11);
doc.setTextColor(0,0,0);

const low=data.revenue*0.8;
const base=data.revenue;
const high=data.revenue*1.2;

doc.text(t("lowScenario")+": "+formatCurrency(low),20,y); y+=7;
doc.text(t("baseScenario")+": "+formatCurrency(base),20,y); y+=7;
doc.text(t("highScenario")+": "+formatCurrency(high),20,y);

y+=15;


// ================= CHART =================

const chartCanvas = document.getElementById("roiChart");

if(chartCanvas){

const scale = 4;

const exportCanvas = document.createElement("canvas");
exportCanvas.width = chartCanvas.width * scale;
exportCanvas.height = chartCanvas.height * scale;

const ctx = exportCanvas.getContext("2d");

ctx.scale(scale,scale);
ctx.drawImage(chartCanvas,0,0);

const img = exportCanvas.toDataURL("image/png",1.0);

const chartWidth = 170;
const chartHeight = 75;

if(y + chartHeight > 260){
doc.addPage();
y = 30;
}

const chartX = (210 - chartWidth)/2;

doc.addImage(
img,
"PNG",
chartX,
y,
chartWidth,
chartHeight
);

y += chartHeight + 10;

}


// ================= PAGE 2 =================

doc.addPage();
y=30;


// ================= INVESTMENT GRADE =================

doc.setFontSize(16);
doc.setTextColor(16,185,129);

doc.text(t("grade"),20,y);

y+=12;

let grade="C";
let risk="High Risk";

if(data.roi>12){
grade="A";
risk=lang==="it"?"Rischio moderato":"Moderate Risk";
}
else if(data.roi>6){
grade="B";
risk=lang==="it"?"Rischio medio":"Medium Risk";
}

doc.setFontSize(12);
doc.setTextColor(0,0,0);

doc.text("Grade: "+grade,20,y); y+=7;
doc.text((lang==="it"?"Profilo rischio: ":"Risk profile: ")+risk,20,y);

y+=15;

// ================= INVESTMENT SCORE =================

doc.setFontSize(16);
doc.setTextColor(16,185,129);

doc.text(
lang==="it"
?"Investment Score"
:"Investment Score",
20,
y
);

y+=10;

let score = Math.min(100, Math.round(data.roi * 3));

doc.setFontSize(28);

doc.setTextColor(
score > 80 ? 16 : score > 60 ? 245 : 239,
score > 80 ? 185 : score > 60 ? 158 : 68,
score > 80 ? 129 : score > 60 ? 11 : 68
);

doc.text(score + "/100",20,y);

doc.setTextColor(0,0,0);

y+=18;
  


// ================= STRATEGIC =================

doc.setFontSize(16);
doc.setTextColor(16,185,129);

doc.text(
lang==="it"
?"Interpretazione Strategica"
:"Strategic Insight",
20,
y
);

y+=10;

doc.setFontSize(11);
doc.setTextColor(0,0,0);

doc.text(verdict,20,y,{maxWidth:170});

y+=20;


// ================= FOOTER =================

doc.setDrawColor(220);
doc.line(20,270,190,270);

doc.setFontSize(9);
doc.setTextColor(120);

doc.text(
lang==="it"
?"Report generato automaticamente da RendimentoBB Strategic Engine – Analisi indicativa."
:"Report generated by RendimentoBB Strategic Engine – Informational purpose only.",
20,
278
);


// ================= PAGE NUMBERS =================

const pages = doc.internal.getNumberOfPages();

for(let i=1;i<=pages;i++){

doc.setPage(i);

doc.setFontSize(8);

doc.text(
"Page "+i+" / "+pages,
180,
290
);

}


// ================= SAVE =================

doc.save(
lang==="it"
? "RendimentoBB-Report-Investimento.pdf"
: "RendimentoBB-Investment-Report.pdf"
);

}


// ================= EXPORT GLOBAL =================

window.calculate = calculate;
window.compareMortgages = compareMortgages;
window.generateExecutivePDF = generateExecutivePDF;

window.analyzeProperty = function(){

const link = document.getElementById("property-link").value;

if(!link){
alert(t("insertPropertyLink"));
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

const operatingProfit = revenue - fees - expenses;

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

// ================= SAFE PLAN BUY =================

window.startPlanPurchase = function(plan){

const user = window.currentUser;

if(!user){

const goLogin = confirm(
window.currentLang==="it"
? "Devi effettuare il login prima di acquistare il piano."
: "You must login before purchasing the plan."
);

if(goLogin){
window.location.href="/login/";
}

return;

}

// sicurezza piano
if(!plan){
console.error("Piano non specificato");
return;
}

// utente loggato → Stripe
window.buyPlan(plan);

};

// ================= STRIPE SUBSCRIPTION =================

window.buyPlan = function(plan){

// utente già gestito globalmente dal sistema
const user = window.currentUser;

if(!user){
window.location.href = "/login/";
return;
}

const uid = user.uid;

let stripeUrl = null;

// PLAN ROUTING

if(plan === "starter"){
stripeUrl =
"https://buy.stripe.com/STARTER_LINK?client_reference_id=" + uid;
}

if(plan === "investor"){
stripeUrl =
"https://buy.stripe.com/8x200ifTC0OK3KnbmqgMw01?client_reference_id=" + uid;
}

if(plan === "pro"){
stripeUrl =
"https://buy.stripe.com/PRO_LINK?client_reference_id=" + uid;
}

if(!stripeUrl){
console.error("Stripe plan non valido:", plan);
return;
}

window.location.href = stripeUrl;
} 

// ================= PROPERTY SCRAPER =================

async function scrapePropertyFromBrowser(url){

try{

let endpoint = "";

if(url.includes("idealista")){
endpoint = "/.netlify/functions/scrape-idealista";
}
else if(url.includes("immobiliare")){
endpoint = "/.netlify/functions/scrape-immobiliare";
}
else{
console.warn("Sito non supportato");
return { price:null };
}

const response = await fetch(
endpoint + "?url=" + encodeURIComponent(url)
);

const data = await response.json();

console.log("Prezzo trovato:", data.price);

return data;

}catch(e){

console.error("Errore scraping Netlify:", e);
return { price:null };

}

}

// ================= AUTO PRICE =================

const price = localStorage.getItem("property_price");

if(price && price > 0){

const priceField = document.getElementById("price");

if(priceField){
priceField.value = price;
}

}

// ================= PROPERTY LINK PARSER =================

async function loadPropertyFromLink(){

const link = localStorage.getItem("property_link");

// ===== MOSTRA LINK ANALIZZATO =====

const linkBox = document.getElementById("property-source");

if(!link) return;

if(linkBox){

linkBox.innerHTML = `
<strong>📍 Immobile analizzato</strong><br>
<a href="${link}" target="_blank">${link}</a>

<div style="margin-top:6px;font-size:13px;color:#64748b;">
Inserisci i dati dell'annuncio per simulare il rendimento.
</div>
`;
}

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

// salva prezzo
localStorage.setItem("property_price", data.price);

setTimeout(()=>{
if(typeof calculate === "function"){
calculate();
}
},300);

}else{

// niente errore: inserimento manuale
console.log("Prezzo non rilevato - inserimento manuale");

}

}catch(e){

console.error("Errore analisi immobile:", e);
// nessun popup: utente inserirà i dati manualmente

}

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

const propertyLink = localStorage.getItem("property_link") || "";

for(const key in cityMap){

if(propertyLink.toLowerCase().includes(key)){
detectedCity = cityMap[key];
break;
}

}

if(detectedCity){
window.currentCity = detectedCity;
console.log("Città rilevata da link:", detectedCity);
} 

}

// ================= MORTGAGE RATE AUTO UPDATE =================

function checkMortgageRateUpdate(){

const lastUpdate =
parseInt(localStorage.getItem("rb_mortgage_rates_update") || "0");

const now = Date.now();

const days =
(now - lastUpdate) / (1000*60*60*24);

if(days > 7){

console.log("Aggiornamento tassi mutuo");

if(window.RB_MORTGAGE_RATES){

localStorage.setItem(
"rb_mortgage_rates_update",
Date.now()
);

}

}

}

document.addEventListener("DOMContentLoaded", () => {

checkMortgageRateUpdate();

});

// ================= AUTO LOAD PROPERTY =================

document.addEventListener("DOMContentLoaded", () => {

const link = localStorage.getItem("property_link");

if(link){
console.log("Analisi immobile da link:", link);
loadPropertyFromLink();
}

  const occ = document.getElementById("occupancy");
const occValue = document.getElementById("occ-value");

if(occ && occValue){

occ.addEventListener("input",()=>{

occValue.innerText = occ.value + "%";

});

}

});
