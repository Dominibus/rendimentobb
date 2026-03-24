// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 16.0
// PRO Firebase + Mortgage Comparator + Forecast + Investment Score + Sensitivity Engine
// ===============================================
// ================= FIRESTORE =================
import { calculateROI } from "./roi-engine.js";

import {
renderMarketBenchmark
} from "./market-engine.js";

import {
renderExecutiveKPI
} from "./ui-engine.js";

import {
calculateMortgage,
compareMortgages as compareMortgagesEngine
} from "./mortgage-engine.js";


import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { app } from "./firebase-init.js";
const db = getFirestore(app);

window.runMortgageComparison = function(){

const amount = parseFloat(document.getElementById("mortgageAmount").value);
const years = parseFloat(document.getElementById("mortgageYears").value);

const rateA = parseFloat(document.getElementById("rateA").value);
const rateB = parseFloat(document.getElementById("rateB").value);
const rateC = parseFloat(document.getElementById("rateC").value);

if(!amount || !years){
alert("Inserisci importo e durata");
return;
}

const banks = [

{ name:{it:"Intesa Sanpaolo",en:"Intesa Sanpaolo"}, rate: rateA || 3.45 },

{ name:{it:"UniCredit",en:"UniCredit"}, rate: rateB || 3.6 },

{ name:{it:"BNL",en:"BNL"}, rate: rateC || 3.5 },

{ name:{it:"Crédit Agricole",en:"Crédit Agricole"}, rate: 3.4 },

{ name:{it:"Banco BPM",en:"Banco BPM"}, rate: 3.55 },

{ name:{it:"Mediolanum",en:"Mediolanum"}, rate: 3.48 },

{ name:{it:"CheBanca!",en:"CheBanca!"}, rate: 3.52 }

];

const results = compareMortgagesEngine(
  amount,
  years,
  banks.map(b => ({
    name: b.name,
    rate: b.rate
  }))
);

renderMortgageResults(results);

};

// ================= PLAN DEFAULT =================

function t(it, en){
  return window.currentLang === "it" ? it : en;
}

window.currentPlan = "free";

document.addEventListener("rb_auth_ready", ()=>{

if(window.currentUser && window.currentUser.uid){
  loadUserPlan(window.currentUser.uid);

  document.dispatchEvent(new Event("rb_plan_loaded"));

  console.log("🔥 Piano caricato post-auth");
}  

let freeRuns =
parseInt(localStorage.getItem("rb_free_runs") || "0");

const isLogged = !!window.currentUser;
const isPro = hasPlan("pro");

// BLOCCO SOLO DOPO AUTH READY
if(!isLogged && !isPro && freeRuns >= 3){

alert(
t(
"Hai raggiunto il limite di simulazioni gratuite. Crea un account gratuito per continuare.",
"You reached the free simulation limit. Create a free account to continue."
)
);

window.location.href="/login/";
return;

}

// incrementa solo per utenti anonimi
if(!isLogged){
freeRuns++;
localStorage.setItem("rb_free_runs", freeRuns);
}  

  const btn = document.getElementById("calc-btn");
  if(btn){
    btn.disabled = false;
  }

});


// ================= CITY FROM HOMEPAGE =================

const citySelector = document.getElementById("market-city");


// ================= SAVE ANALYSIS =================

async function saveAnalysis(data){

  if(!window.firebaseReady){
    console.log("⏳ Firebase non pronto");
    return;
  }

  if(!window.currentUser || !window.currentUser.uid){
    console.log("❌ Utente non loggato");
    return;
  }

  try{

    await addDoc(collection(db,"analyses"),{
      uid: window.currentUser.uid,
      propertyPrice: data.price,
      equity: data.equity,
      roi: data.roi,
      risk: data.risk,
      city: data.city || "italy",
      createdAt: serverTimestamp(),
      createdAtClient: new Date()
 });

    console.log("✅ SALVATO FIRESTORE");

  }catch(e){

    console.error("Errore salvataggio:", e);

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
t(
"Per usare questa funzione devi creare un account gratuito.",
"Create a free account to use this feature."
)
);

window.location.href="/login/";
return false;

}

if(!hasPlan(requiredPlan)){

const goUpgrade = confirm(
t(
"Questa funzione richiede un piano superiore.",
"This feature requires a higher plan."
)
);

if(goUpgrade){
  window.location.href="/pricing/";
}

return false;

}

return true;

}

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function loadUserPlan(uid){

  try{

    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);

    if(snap.exists()){
      window.currentPlan = snap.data().plan || "free";
    }else{
      window.currentPlan = "free";
    }

    console.log("🔥 PLAN LOADED:", window.currentPlan);

  }catch(e){
    console.error("Errore caricamento piano:", e);
    window.currentPlan = "free";
  }

}

// ================= Function Mutui =================

function renderMortgageResults(results){

const container = document.getElementById("mortgage-results");

if(!container) return;

// trova migliore
const best = results.reduce((min, r) =>
r.yearlyCost < min.yearlyCost ? r : min
, results[0]);

container.innerHTML = results.map((r)=>{

const isBest = r === best;

return `
<div style="
padding:22px;
margin-bottom:18px;
border-radius:16px;
background:${isBest ? "#ecfdf5" : "#ffffff"};
border:${isBest ? "2px solid #10b981" : "1px solid #e5e7eb"};
box-shadow:0 10px 30px rgba(0,0,0,0.05);
">

<div style="display:flex;justify-content:space-between;align-items:center;">

<div>
<strong style="font-size:16px;">
${window.currentLang === "it" ? r.name?.it : r.name?.en}
</strong>

<div style="font-size:13px;color:#64748b;margin-top:4px;">
${t("Tasso","Rate")}: ${r.rate}%
</div>
</div>

${isBest ? `
<div style="
background:#10b981;
color:white;
padding:6px 10px;
border-radius:8px;
font-size:12px;
font-weight:600;
">
${t("Migliore scelta","Best choice")}
</div>
` : ""}

</div>

<div style="margin-top:12px;font-size:14px;">
${t("Costo annuo","Yearly cost")}:
<strong>€ ${r.yearlyCost.toFixed(0)}</strong>
</div>

<div style="margin-top:12px;">
<button onclick="selectMortgage(${r.rate})" class="btn btn-primary" style="width:100%;">
${t("Simula con questo mutuo","Simulate with this mortgage")}
</button>
</div>

</div>
`;

}).join("");

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

// ================= GLOBAL HERO BACKGROUND =================

window.applyCityBackground = function(city){

const hero = document.querySelector(".hero-bg");

if(!hero) return;

hero.classList.remove("rome","naples","milan","florence");

const map = {
  roma:"rome",
  napoli:"naples",
  milano:"milan",
  firenze:"florence"
};

hero.classList.add(map[city] || "rome");

};

// ================= LAST ANALYSIS STORAGE =================
window.lastAnalysisData = null;
window.simulationExecuted = false;

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
    message = t(
      "✓ Performance superiore al mercato",
      "✓ Outperforming market"
    );
    color = "#10b981";
  }else{
    message = t(
      "⚠ Performance sotto media mercato",
      "⚠ Underperforming market"
    );
  }

  container.innerHTML = `

  <div class="kpi-box">
    <span>${t("Ricavi stimati","Estimated revenue")}</span>
    <strong>${formatCurrency(userRevenue)}</strong>
  </div>

  <div class="kpi-box">
    <span>${t("Media mercato","Market average")}</span>
    <strong>${formatCurrency(marketRevenue)}</strong>
  </div>

  <div class="kpi-box">
    <span>${t("Confronto","Comparison")}</span>
    <strong style="color:${color}">
      ${message}
    </strong>
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

const marketROI = market.roi;

let message = "";
let color = "#ef4444";
let badge = "";

if(roi > marketROI){

message = t("ROI sopra la media", "ROI above average");
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
${t("ROI sopra la media", "ROI above average")}
</div>
`;

}else{

message = t("ROI sotto la media","ROI below average");

}

container.innerHTML = badge + `

<div class="kpi-box">
<span>${t("ROI investimento","Your ROI")}</span>
<strong>${roi.toFixed(1)}%</strong>
</div>

<div class="kpi-box">
<span>${t("ROI medio città","City average ROI")} ${cityKey}</span>
<strong>${marketROI}%</strong>
</div>

<div class="kpi-box">
<span>${t("Confronto mercato","Market comparison")}</span>
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
    <span>${t("Scenario prudente","Low scenario")}</span>
    <strong>${formatCurrency(low)}</strong>
  </div>

  <div class="kpi-box">
    <span>${t("Scenario base","Base scenario")}</span>
    <strong>${formatCurrency(mid)}</strong>
  </div>

  <div class="kpi-box">
    <span>${t("Scenario ottimistico","High scenario")}</span>
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
<span>${t("Occupazione -10%","Occupancy -10%")}</span>
<strong>${low}% ROI</strong>
</div>

<div class="kpi-box">
<span>${t("Occupazione base","Base occupancy")}</span>
<strong>${base}% ROI</strong>
</div>

<div class="kpi-box">
<span>${t("Occupazione +10%","Occupancy +10%")}</span>
<strong>${high}% ROI</strong>
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
<span>${t("Occupazione break-even","Break-even occupancy")}</span>
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
<span>${t("Occupazione break-even","Break-even occupancy")}</span>
<strong style="color:${color}">
${occRounded.toFixed(1)}%
</strong>
</div>

<div class="kpi-box">
<span>${t("Notti minime","Minimum nights")}</span>
<strong>${Math.round(nightsNeeded)}</strong>
</div>

`;

}
// ================= INVESTMENT SCORE =================

function renderInvestmentScore(roi, riskScore){

const container = document.getElementById("investment-score");
if(!container) return;

let grade = "C";
let recommendation = t("Alto rischio","High risk");

if(roi > 12){
grade = "A";
recommendation = t(
"Investimento sicuro",
"Safe investment"
);
}

else if(roi > 6){
grade = "B";
recommendation = t(
"Rendimento moderato",
"Moderate return"
);
}

let gradeColor = "#ef4444";

if(grade === "A") gradeColor = "#10b981";
else if(grade === "B") gradeColor = "#f59e0b";

container.innerHTML = `

<div class="kpi-box">
<span>${t("Valutazione","Grade")}</span>
<strong style="color:${gradeColor};font-size:22px;">
${grade}
</strong>
</div>

<div class="kpi-box">
<span>${t("Indice rischio","Risk score")}</span>
<strong>${riskScore} / 100</strong>
</div>

<div class="kpi-box">
<span>${t("Raccomandazione","Recommendation")}</span>
<strong>${recommendation}</strong>
</div>

`;

}

// ================= INVESTMENT RANKING =================

function renderInvestmentRanking(roi){

const container = document.getElementById("investment-ranking");
if(!container) return;

let percentile = 50;
let label = t("Investimento medio","Average investment");

if(roi > 15){
percentile = 90;
label = t("Investimento eccellente","Top investment opportunity");
}
else if(roi > 10){
percentile = 75;
label = t("Investimento forte","Strong investment");
}
else if(roi > 6){
percentile = 60;
label = t("Opportunità moderata","Moderate opportunity");
}

container.innerHTML = `

<div class="kpi-box">
<span>${t("Ranking investimento","Investment ranking")}</span>
<strong>Top ${100-percentile}%</strong>
</div>

<div class="kpi-box">
<span>${t("Tipo investimento","Investment type")}</span>
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
  let label = t("Rischio elevato","High risk");

  if(riskScore < 40){
    label = t("Rischio basso","Low risk");
    color = "#10b981";
    icon = "🟢";
  }
  else if(riskScore < 65){
    label = t("Rischio medio","Medium risk");
    color = "#f59e0b";
    icon = "🟠";
  }
  else{
    label = t("Rischio elevato","High risk");
    color = "#ef4444";
    icon = "🔴";
  }

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

  ${t(
  "Valutazione del rischio basata su ROI e sostenibilità finanziaria.",
  "Risk evaluation based on ROI and financial sustainability."
  )}

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

let title = t(
"Investimento ad alto rischio",
"High risk investment"
);

let message = t(
"Il rendimento atteso è basso rispetto al capitale investito.",
"The expected return is low compared to the invested capital."
);

if(roi > 12){

color = "#10b981";
icon = "🟢";

title = t(
"Ottima opportunità investimento",
"Strong investment opportunity"
);

message = t(
"Il ROI è molto superiore alla media del mercato e la struttura finanziaria è solida.",
"ROI is well above market average and financial structure is solid."
);

}

else if(roi > 6){

color = "#f59e0b";
icon = "🟠";

title = t(
"Investimento moderato",
"Moderate investment"
);

message = t(
"Il rendimento è accettabile ma dipende molto dalla stabilità dell'occupazione.",
"Returns are acceptable but depend strongly on occupancy stability."
);

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

if(hasPlan("pro")) return;

const message = t(
`Questo investimento sembra interessante.

ROI stimato: ${roi.toFixed(1)}

Scopri:
• rischio reale
• comparatore mutui
• scenari mercato
• simulazioni occupazione
• report professionale

Sblocca l'analisi completa.`,
`This investment looks promising.

Estimated ROI: ${roi.toFixed(1)}

Unlock:
• risk score
• mortgage comparator
• market scenarios
• occupancy simulations
• professional report`
);

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

if(hasPlan("pro")){
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

${t("🔥 Investimento ad alto rendimento","🔥 High Yield Investment")}

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
${t("Investimento ad alto rendimento","High yield investment")}
</strong>

<p style="margin-top:8px;font-size:14px;">
ROI stimato: <strong>${roi.toFixed(1)}%</strong>
</p>

<p style="margin-top:10px;font-size:14px;">
${t(
"Questo investimento supera le medie di mercato e mostra forte potenziale.",
"This investment outperforms market averages and shows strong potential."
)}
</p>

<button onclick="startPlanPurchase('pro')" class="btn btn-primary">
${t(
"🔓 Accedi gratis per vedere l'analisi completa – 29€/mese",
"🔓 Login to unlock full analysis – €29/month"
)}
</button>

<div style="margin-top:6px;font-size:12px;color:#64748b;">
${t(
"Accesso a tutte le simulazioni professionali",
"Access to all professional simulations"
)}
</div>

</div>

`;

}

// ================= UPGRADE MODAL =================

function showUpgradeModal(roi){

const container = document.getElementById("smart-investment-alert");

if(!container) return;

const title = t("🔥 Investimento promettente","🔥 Promising investment");

const discover = t(
"Scopri l'analisi completa",
"Discover the full analysis"
);

const risk = t("rischio reale","real risk");
const benchmark = t("benchmark mercato","market benchmark");
const occupancy = t("simulazione occupazione","occupancy simulation");
const mortgage = t("comparatore mutui","mortgage comparator");
const report = t("report professionale","professional report");

const unlock = t(
"🔓 Sblocca analisi completa – 19€/mese",
"🔓 Unlock full analysis – €19/month"
);

const roiText = t("ROI stimato","Estimated ROI");

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
${t(
"Accesso completo a tutte le simulazioni professionali",
"Full access to all professional simulations"
)}
</div>

</div>

`;

}

// ================= PDF BUTTON VISIBILITY =================

function updatePDFButton(){

const btn = document.getElementById("pdf-btn");
if(!btn) return;

if(window.currentPlan === "pro" || window.currentPlan === "pro_yearly"){
  btn.style.display = "inline-block";
}else{
  btn.style.display = "none";
}

console.log("PDF visibility:", window.currentPlan);

}

// aggiorna dopo login
document.addEventListener("rb_auth_ready", ()=>{
setTimeout(updatePDFButton, 500);

});  

document.addEventListener("rb_plan_loaded", ()=>{
  updatePDFButton();
  
});

// ================= FREE LIMIT =================

function calculate(force = false){  

window.calculate = calculate;

if(!force && window.simulationExecuted){
  console.log("Simulazione già eseguita, ma forzo aggiornamento UI");
}

window.simulationExecuted = true;

const priceNight = getValue("priceNight");
const occupancy = getValue("occupancy");
const expenses = getValue("expenses");
const commission = getValue("commission") || 15;
const tax = getValue("tax") || 21;
const loanAmount = getValue("loanAmount");
const interestRate = getValue("interestRate");
const loanYears = getValue("loanYears"); 

console.log("DEBUG:", {
  priceNight,
  occupancy,
  expenses,
  commission,
  tax
}); 

const result = calculateROI({
  price: getValue("price"),
  equity: getValue("equity"),
  priceNight,
  occupancy,
  expenses,
  commission,
  tax,
  loanAmount,
  interestRate,
  loanYears
});

console.log("RESULT:", result);  

window.lastAnalysisData = {
  ...result,

  // 🔥 ALLINEAMENTO NOMI PDF
  price: getValue("price"),
  equity: getValue("equity"),
  loan: result.loan || getValue("loanAmount"),

  revenue: result.revenue || result.gross,
  profit: result.profit || result.netAfterMortgage
};  

const equity = getValue("equity");
if (equity < 0) return;

const gross = result.gross;
const operatingProfit = result.operatingProfit;
const taxCost = result.taxCost;
const mortgageYearly = result.mortgageYearly;
const netAfterMortgage = result.netAfterMortgage;
const roi = result.roi;
// 💥 HOOK MUTUO → UPSELL
if(localStorage.getItem("from_mortgage")){

const alertBox = document.getElementById("smart-investment-alert");

if(alertBox){

alertBox.innerHTML = `
<div style="
margin-top:20px;
padding:20px;
border-radius:14px;
background:#fef3c7;
border:1px solid #f59e0b;
text-align:center;
">

<strong>
${t(
"Hai ottimizzato il mutuo — ora ottimizza l’investimento",
"You optimized your mortgage — now optimize the investment"
)}
</strong>

<p style="margin-top:10px;">
${t(
"Scopri ROI reale, rischio e scenari avanzati",
"Unlock real ROI, risk and advanced scenarios"
)}
</p>

<button onclick="startPlanPurchase('pro')" class="btn btn-primary">
${t("Sblocca analisi completa","Unlock full analysis")}
</button>

</div>
`;
}

localStorage.removeItem("from_mortgage");

}  
const roiEl = document.getElementById("roi-live");
if(roiEl){
  roiEl.innerText = roi.toFixed(1) + "%";
}  
const profitEl = document.getElementById("profit-live");
if(profitEl){
  profitEl.innerText = formatCurrency(netAfterMortgage / 12);
}
const revenueEl = document.getElementById("revenue-live");
if(revenueEl){
  revenueEl.innerText = formatCurrency(gross);
} 

let city = window.currentCity || citySelector?.value || null;  

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

// ================= SAVE CORRETTO =================

if(window.currentUser && window.currentUser.uid){

  console.log("🔥 Salvataggio avviato:", window.currentUser.uid);

  saveAnalysis({
    price: getValue("price"),
    equity: equity,
    roi: roi,
    risk: riskScore,
    city: city || "italy"
  });

}else{

  console.warn("⚠️ User non pronto → ritento tra 500ms");

  setTimeout(()=>{
    if(window.currentUser && window.currentUser.uid){
      saveAnalysis({
        price: getValue("price"),
        equity: equity,
        roi: roi,
        risk: riskScore,
        city: city || "italy"
      });
    }
  },500);

}

// MARKET BENCHMARK + COMPARISON

const citySafe = city || "italy";

renderMarketBenchmark(citySafe);
renderMarketComparison(gross, citySafe);
renderROIMarketComparison(roi, citySafe);

renderOccupancySensitivity(
priceNight,
occupancy,
expenses,
commission,
tax,
mortgageYearly,
equity
);

// ===== NUOVE RENDER UI (FONDAMENTALE)

renderRevenueForecast(gross);

renderInvestmentScore(roi, riskScore);

renderInvestmentRanking(roi);

renderRiskMeter(riskScore);

renderSmartInvestmentAlert(roi);

renderChart(netAfterMortgage);  

// PAYBACK
const payback =
equity > 0 && netAfterMortgage > 0
? (equity / netAfterMortgage)
: null;

renderInvestmentVerdict(roi, payback);

renderBreakEvenOccupancy(
priceNight,
expenses,
commission,
tax,
mortgageYearly
);  

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

if(!hasPlan("pro")){

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


// ================= CHART =================

function renderChart(net){
  
const annualProfit = net;

const ctx = document.getElementById("roiChart");

if(!ctx || typeof Chart === "undefined") return;

if(roiChartInstance){
roiChartInstance.destroy();
roiChartInstance = null;
}

// anni simulazione
const years = [1,2,3,4,5,6,7,8,9,10];

// scenari
const conservative = years.map(y => net * y * 0.8);
const base = years.map(y => net * y);
const optimistic = years.map(y => net * y * 1.2);

roiChartInstance = new Chart(ctx,{

type:"line",

data:{
labels: years.map(y => t("Anno ","Year ") + y),

datasets:[

{
label: t("Scenario prudente","Low scenario"),
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
label: t("Scenario base","Base scenario"),
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
label: t("Scenario ottimistico","High scenario"),
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

// ================= CITY ROI CHART =================

function renderCityROIChart(){

const ctx = document.getElementById("city-roi-chart");

if(!ctx || typeof Chart === "undefined") return;

new Chart(ctx,{

type:"doughnut",

data:{
labels:[
"Napoli",
"Roma",
"Firenze",
"Milano"
],

datasets:[{
data:[
16.7,
14.2,
12.9,
10.5
],

backgroundColor:[
"#10b981",
"#3b82f6",
"#f59e0b",
"#6366f1"
],

borderWidth:0
}]
},

options:{
plugins:{
legend:{
position:"bottom"
}
},
cutout:"65%",
responsive:true
}

});

}

// esegue grafico dashboard
document.addEventListener("DOMContentLoaded", renderCityROIChart);

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

let chartImage = null;

try {

const canvas = document.getElementById("roiChart");

if(canvas){

// ⏳ aspetta render Chart.js
await new Promise(resolve => setTimeout(resolve, 500));

// 🔥 canvas export HD
const exportCanvas = document.createElement("canvas");
exportCanvas.width = canvas.width * 2;
exportCanvas.height = canvas.height * 2;

const ctx = exportCanvas.getContext("2d");

// sfondo bianco (FONDAMENTALE per PDF)
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

// copia grafico
ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

chartImage = exportCanvas.toDataURL("image/png", 1.0);

}

} catch(e){
console.warn("Errore chart PDF:", e);
}

console.log("CHART OK?", !!chartImage);  

console.log("PDF DATA:", data);  


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
// ================= HERO KPI =================

doc.setFillColor(16,185,129);
doc.roundedRect(20,y,170,30,6,6,"F");

doc.setTextColor(255,255,255);
doc.setFontSize(12);

doc.text("ROI",25,y+10);

doc.setFontSize(26);

doc.text(data.roi.toFixed(2)+"%",25,y+22);

// badge
doc.setFontSize(10);

let badge =
data.roi > 12
? (lang==="it"?"ALTA PERFORMANCE":"HIGH PERFORMANCE")
: data.roi > 6
? (lang==="it"?"BILANCIATO":"BALANCED")
: (lang==="it"?"RISCHIOSO":"RISKY");

doc.text(badge,120,y+22);

y += 40;

doc.setTextColor(0,0,0);

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

const ltv = data.price>0 && data.loan
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
doc.setFillColor(248,250,252);
// ================= KPI GRID =================

const boxWidth = 80;
const gap = 10;

// Revenue
doc.setFillColor(248,250,252);
doc.roundedRect(20,y,boxWidth,22,4,4,"F");

doc.setFontSize(9);
doc.setTextColor(100);

doc.text("Revenue",25,y+8);

doc.setFontSize(12);
doc.setTextColor(0);

doc.text(formatCurrency(data.revenue),25,y+16);

// Profit
doc.setFillColor(248,250,252);
doc.roundedRect(20+boxWidth+gap,y,boxWidth,22,4,4,"F");

doc.setFontSize(9);
doc.setTextColor(100);

doc.text("Profit",25+boxWidth+gap,y+8);

doc.setFontSize(12);
doc.setTextColor(0);

doc.text(formatCurrency(data.profit),25+boxWidth+gap,y+16);

y += 30;

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
t("ROI","ROI"),
20,
y
);

doc.setTextColor(0,0,0);

y+=18;

doc.setFontSize(10);
doc.setTextColor(100);

doc.text(
data.roi > 12
? "🔥 High performance investment"
: data.roi > 6
? "⚖️ Balanced investment"
: "⚠️ Risky investment",
20,
y+6
);

y+=12;
doc.setTextColor(0,0,0);  


// ================= SCENARIOS =================

doc.setFillColor(248,250,252);
doc.roundedRect(20,y-5,170,25,3,3,"F");

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

doc.text(t("Scenario prudente","Low scenario")+": "+formatCurrency(low),20,y);
doc.text(t("Scenario base","Base scenario")+": "+formatCurrency(base),20,y);
doc.text(t("Scenario ottimistico","High scenario")+": "+formatCurrency(high),20,y);

y+=15;


// ================= CHART =================

// nuova pagina dedicata
doc.addPage();
y = 30;

if(chartImage){

const chartWidth = 170;
const chartHeight = 90;

const chartX = (210 - chartWidth) / 2;

// ================= CHART HEADER =================

doc.setFontSize(10);
doc.setTextColor(120);

doc.text(
lang==="it"
? "Proiezione su base pluriennale del rendimento"
: "Multi-year performance projection",
20,
y
);

y += 12;
doc.setTextColor(16,185,129);

doc.text(
lang==="it" ? "Analisi Andamento ROI" : "ROI Trend Analysis",
20,
y
);

y += 10;

doc.addImage(chartImage, "PNG", chartX, y, chartWidth, chartHeight);

y += chartHeight + 10;

}

// ================= PAGE 2 =================

if(y > 220){
  doc.addPage();
  y = 30;
}


// ================= INVESTMENT GRADE =================

doc.setFontSize(16);
doc.setTextColor(16,185,129);

doc.text(t("Valutazione","Grade"),20,y);

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
"RendimentoBB © Strategic Investment Engine",
20,
278
);

doc.text(
lang==="it"
? "Confidenziale – Solo per analisi informativa"
: "Confidential – For analysis purposes only",
130,
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

window.selectMortgage = function(rate){

localStorage.setItem("selected_mortgage_rate", rate);

// 💥 NUOVO → salva anche contesto
localStorage.setItem("from_mortgage", "true");
localStorage.setItem("mortgage_selected_rate", rate);

window.location.href = "/tool/?from=mortgage";

};

// ================= EXPORT GLOBAL =================

window.calculate = calculate;
window.generateExecutivePDF = generateExecutivePDF;

window.analyzeProperty = function(){

  const input = document.getElementById("listing_url");

  if(!input){
    console.error("Input property-link non trovato");
    return;
  }

  const link = input.value.trim();

  if(!link){
    alert(
      t(
        "Inserisci il link dell'immobile",
        "Insert property link"
      )
    );
    return;
  }

  // salva link
  localStorage.setItem("property_link", link);
  sessionStorage.setItem("from_property_page", true);

  // ================= AUTO CITY DETECTION =================

  function extractCityFromLink(url){

    const cities = [
      "napoli",
      "roma",
      "milano",
      "firenze"
    ];

    const lower = url.toLowerCase();

    for(const city of cities){
      if(lower.includes(city)){
        return city;
      }
    }

    return null;
  }

  const detectedCity = extractCityFromLink(link);

  console.log("Città rilevata dal link:", detectedCity);

  // ================= REDIRECT =================

  if(detectedCity){
  window.location.href = "/tool/?city=" + detectedCity;
}else{
  window.location.href = "/tool/?city=napoli";
}

};
// ================= SAFE PLAN BUY =================

window.startPlanPurchase = function(plan){

const user = window.currentUser;

if(!user){

const goLogin = confirm(
t(
"Devi effettuare il login prima di acquistare il piano.",
"You must login before purchasing the plan."
)
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

// 🔥 SE GIÀ HA IL PIANO → BLOCCA
if(window.currentPlan === plan){
alert(
t(
"Hai già questo piano attivo",
"You already have this plan"
)
);
return;
}

// 🔥 upgrade logico
if(plan === "investor" && window.currentPlan === "pro"){
alert("Hai già un piano superiore");
return;
}

// utente loggato → Stripe
window.buyPlan(plan);

};

// ================= STRIPE SUBSCRIPTION =================

window.buyPlan = function(plan){

const user = window.currentUser;

if(!user){
window.location.href = "/login/";
return;
}

const uid = user.uid;

let stripeUrl = null;

// PLAN ROUTING

if(!["investor","pro","pro_yearly"].includes(plan)){
console.error("Piano non valido:", plan);
return;
}

// 🔥 INVESTOR
if(plan === "investor"){
stripeUrl =
"https://buy.stripe.com/8x200ifTC0OK3KnbmqgMw01?client_reference_id=" + uid;
}

// 🔥 PRO
if(plan === "pro"){
stripeUrl =
"https://buy.stripe.com/5kQ9ASdLuapkep1cqugMw02?client_reference_id=" + uid;
}

// 🔥 ANNUALE
if(plan === "pro_yearly"){
stripeUrl =
"https://buy.stripe.com/bJe8wObDmdBwep1fCGgMw03?client_reference_id=" + uid;
}

if(!stripeUrl){
console.error("Stripe plan non valido:", plan);
return;
}

window.location.href = stripeUrl;

};

// ================= PROPERTY SCRAPER =================

async function scrapePropertyFromBrowser(url){

console.log("Scraper disattivato (Vercel)");

return { price: null };

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

// calcolo manuale solo quando l'utente clicca "Calcola ROI"

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

if(detectedCity && !window.currentCity){
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

// carica solo se l'utente arriva dalla pagina immobile
if(link && sessionStorage.getItem("from_property_page")){
loadPropertyFromLink();
sessionStorage.removeItem("from_property_page");
}

  const occ = document.getElementById("occupancy");
const occValue = document.getElementById("occ-value");

if(occ && occValue){

occ.addEventListener("input",()=>{

occValue.innerText = occ.value + "%";

});

document.addEventListener("DOMContentLoaded", () => {

const savedRate = localStorage.getItem("selected_mortgage_rate");

if(savedRate){

const rateInput = document.getElementById("interestRate");

if(rateInput){
rateInput.value = savedRate;
}

// 💥 UX MESSAGE
const banner = document.getElementById("mortgage-banner");

if(banner){
banner.innerHTML = `
<div style="
margin-bottom:20px;
padding:14px;
border-radius:12px;
background:#ecfdf5;
border:1px solid #10b981;
font-weight:600;
text-align:center;
">
${t(
"Mutuo selezionato automaticamente dal comparatore",
"Mortgage auto-selected from comparator"
)} (${savedRate}%)
</div>
`;
}

localStorage.removeItem("selected_mortgage_rate");

}

});  

}

});

if(citySelector){

citySelector.addEventListener("change",()=>{

const city = citySelector.value;

window.currentCity = city;
localStorage.setItem("selected_city", city);

renderMarketBenchmark(city);
changeCityBackground(city);

// non avviare automaticamente la simulazione
// calculate();

});

}

// ================= CITY ROUTING FIX =================

// 1. prendi path (/roma, /milano ecc)
function getCityFromPath(){

  const path = window.location.pathname.toLowerCase();

  // SOLO market
  if(path.startsWith("/market/")){
    if(path.includes("roma")) return "roma";
    if(path.includes("milano")) return "milano";
    if(path.includes("firenze")) return "firenze";
    if(path.includes("napoli")) return "napoli";
  }

  return null;
}

// 2. fallback vecchio sistema
const params = new URLSearchParams(window.location.search);
const cityFromQuery = params.get("city");

const cityFromStorage = localStorage.getItem("selected_city");

// 3. PRIORITÀ
let selectedCity =
  getCityFromPath() ||
  cityFromQuery ||
  cityFromStorage ||
  "napoli";

// salva sempre
localStorage.setItem("selected_city", selectedCity);
window.currentCity = selectedCity;

// UI sync
document.addEventListener("DOMContentLoaded", () => {

  window.currentCity = selectedCity;

  const citySelector = document.getElementById("market-city");

  if(citySelector){
    citySelector.value = selectedCity;
  }

  changeCityBackground(selectedCity);

  console.log("🔥 Città attiva:", selectedCity);

});

// ... tutto il tuo codice sopra

function goToMarket(city){
  window.location.href = "/market/" + city;
}
