// =============================================== 
// RENDIMENTOBB – EXECUTIVE ENGINE 16.0
// PRO Firebase + Mortgage Comparator + Forecast + Investment Score + Sensitivity Engine
// ===============================================
// ================= FIRESTORE ================
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

// ===============================
// 🧠 USER ACCESS ENGINE (MASTER)
// ===============================

window.getUserAccess = function(){

  const isLogged = !!window.currentUser;

  const plan = window.currentPlan || "free";

  const isAdmin =
    window.currentUser?.email === "rendimentobb@gmail.com" ||
    window.userRole === "admin";

const isPro =
  ["pro","pro_yearly","investor"].includes(plan);

  const isInvestor =
    plan === "investor";

  return {

    isLogged,
    isAdmin,
    isPro,
    isInvestor,

    // 🔥 LIVELLI ACCESSO
    canSeeFullAnalysis: isAdmin || isPro,
    canSeeAdvanced: isAdmin || isPro || isInvestor,
    canDownloadPDF: isAdmin || isPro,
    canSeeLeads: isAdmin,

    // 🎯 UX STATES
    isGuest: !isLogged,
    isFree: isLogged && !isPro && !isInvestor
  };
};

// ================= SAFE GLOBAL EARLY FIX =================

function getLeadScore(result){

  const roi = Number(result?.roi || 0);

  if(roi >= 12){
    return "hot";
  }

  if(roi >= 8){
    return "warm";
  }

  return "cold";
}

window.quickROI = function(){

  const safeNum = (v, def=0)=>{
    const n = parseFloat(v);
    return isNaN(n) ? def : n;
  };

  // ================= INPUT =================

  const price = safeNum(document.getElementById("qr_price")?.value,250000);
  const reno  = safeNum(document.getElementById("qr_reno")?.value,30000);
  const night = safeNum(document.getElementById("qr_night")?.value,110);
  const occ   = safeNum(document.getElementById("qr_occ")?.value,65);
  const cost  = safeNum(document.getElementById("qr_cost")?.value,35);

  // ================= CALCOLO =================

  const investment = price + reno;
  const revenue = night * 365 * (occ/100);
  const net = revenue - (revenue*(cost/100));
  const roi = investment > 0 ? (net/investment)*100 : 0;

  // ================= ROI =================

  const roiEl = document.getElementById("qr_roi");
  if(roiEl){
    roiEl.innerText = roi.toFixed(1)+"%";
  }

  // ================= KPI UNIVERSALE (HOME + TOOL) =================

// 🏠 HOME (qr_*)
const qrProfit = document.getElementById("qr_profit");
const qrMonth  = document.getElementById("qr_month");
const qrBreak  = document.getElementById("qr_break");
const qrRev    = document.getElementById("qr_rev");

// 🛠 TOOL (standard)
const elMonthly = document.getElementById("profit-monthly");
const elAnnual  = document.getElementById("profit-annual");
const elBreak   = document.getElementById("break-even");
const elRevenue = document.getElementById("revenue-annual");

// ===== PROFIT =====
if(qrProfit) qrProfit.innerText = formatCurrency(net);
if(elAnnual) elAnnual.innerText = formatCurrency(net);

// ===== MONTH =====
if(qrMonth) qrMonth.innerText = formatCurrency(net / 12);
if(elMonthly) elMonthly.innerText = formatCurrency(net / 12);

// ===== BREAK EVEN =====
const payback = net > 0 ? investment / net : 0;

if(qrBreak) qrBreak.innerText = payback ? payback.toFixed(1)+" anni" : "-";
if(elBreak) elBreak.innerText = payback ? payback.toFixed(1)+" anni" : "-";

// ===== REVENUE =====
if(qrRev) qrRev.innerText = formatCurrency(revenue);
if(elRevenue) elRevenue.innerText = formatCurrency(revenue);

// ================= 🔒 HOME LOCK SYSTEM =================

const access = window.getUserAccess();

window.isProUser = function(){
  return window.getUserAccess().isPro;
};  

// 🔓 PRO / INVESTOR → vedono tutto
if(access.canSeeFullAnalysis || access.isInvestor){
  return;
}

// 🔒 FREE → nascondi dati
const lockIds = [
  "qr_profit",
  "qr_month",
  "qr_break",
  "qr_rev"
];

lockIds.forEach(id => {
  const el = document.getElementById(id);

  if(!el) return;

  el.innerText = "🔒 Pro";
  el.style.opacity = "0.6";
});  

};

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

// 🔥 FLAG GLOBALE (fonte unica)

window.isAdmin = function(){

  const email = window.currentUser?.email || "";

  // 🔥 QUI METTI LA TUA EMAIL ADMIN
  return email === "rendimentobb@gmail.com";

};

// 🔥 PREMIUM USER (ADMIN + PRO)
window.isPremiumUser = function(){

  const plan = window.currentPlan || "free"; // 🔥 AGGIUNGI QUESTO

  const isAdmin =
    window.currentUser?.email === "rendimentobb@gmail.com" ||
    window.userRole === "admin";

  const isPro =
    ["pro","pro_yearly","investor"].includes(plan);

  return isAdmin || isPro;
};

// ✅ GET PLAN PULITO (NO SIDE EFFECT)
function getUserPlan(){
  return window.currentPlan || "free";
}

// 🔥 CHECK GERARCHICO CORRETTO
function hasPlan(requiredPlan){

  const plan = getUserPlan();

  // 🟢 PRO (massimo livello)
  if(requiredPlan === "pro"){
    return plan === "pro" || plan === "pro_yearly";
  }

  // 🟡 INVESTOR (medio livello)
  if(requiredPlan === "investor"){
    return (
      plan === "investor" ||
      plan === "pro" ||
      plan === "pro_yearly"
    );
  }

  // 🟢 FREE
  if(requiredPlan === "free"){
    return true;
  }

  return false;
}

// 🔒 BLOCCO ACCESSO + REDIRECT
function requirePlan(requiredPlan){
  // 🔥 PRO → bypass totale
if(window.getUserAccess().canSeeFullAnalysis){
  return true;
}

  const plan = getUserPlan();

  // 🔐 NON LOGGATO
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

  // ❌ NON HA IL PIANO
  if(!hasPlan(requiredPlan)){

    let message = "";

    if(requiredPlan === "investor"){
      message = t(
        "Questa funzione richiede il piano Investor.",
        "This feature requires the Investor plan."
      );
    }

    if(requiredPlan === "pro"){
      message = t(
        "Questa funzione richiede il piano Pro.",
        "This feature requires the Pro plan."
      );
    }

    alert(
      window.currentLang === "it"
      ? "🔒 Sblocca analisi avanzata, strategia ROI e simulazioni complete."
      : "🔒 Unlock advanced analysis, ROI strategy and full simulations."
    );

    const goUpgrade = confirm(message);

    if(goUpgrade){
      window.location.href="/pricing/";
    }

    return false;
  }

  return true;
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
<button onclick="selectMortgage(${r.rate})" class="btn-main" style="width:100%;">
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

// 🔥 SAFE NUMBER GLOBALE (ANTI-CRASH)
function safeNumber(value){
  if(value === null || value === undefined) return 0;

  const num = Number(value);

  return isNaN(num) ? 0 : num;
}

// 👉 FONDAMENTALE
window.safeNumber = safeNumber;


// 🔥 SAFE PERCENT
function safePercent(value){
  return safeNumber(value).toFixed(1);
}

// 👉 FONDAMENTALE
window.safePercent = safePercent;


// 🔥 SAFE RENDER
function safeRender(id, callback){
  const container = document.getElementById(id);
  if(!container){
    console.warn("⚠️ container non trovato:", id);
    return;
  }

  container.style.display = "grid";

  try{
    callback(container);
  }catch(e){
    console.error("Render error:", id, e);
  }
}

// 👉 opzionale ma consigliato
window.safeRender = safeRender;

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

function unlockUI(){

  document.querySelectorAll(`
    .results-overlay,
    .locked-overlay,
    .upgrade-overlay,
    .home-blur-overlay
  `).forEach(el => el.remove());

  document.querySelectorAll(".paywall-mini").forEach(el => el.remove());

  document.querySelectorAll(`
    .pro-blur,
    .locked,
    .locked-content
  `).forEach(el => {
    el.classList.remove("pro-blur","locked","locked-content");
    el.style.filter = "none";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";
  });

}

function applyAccessControl(){

  const access = window.getUserAccess();

  // 🔓 PRO / ADMIN / INVESTOR
  if(access.canSeeFullAnalysis || access.isInvestor){

    console.log("🔓 FULL ACCESS");

    unlockUI();
    unlockProUI();

    return;
  }

  // 🔒 FREE USER
  console.log("🔒 APPLY LOCK");

  document.querySelectorAll(`
    #revenue-forecast,
    #occupancy-sensitivity,
    #break-even-kpi,
    #investment-score,
    #investment-ranking,
    #investment-risk-meter,
    #investment-verdict,
    #ai-insights
  `).forEach(el=>{

    if(!el) return;

    el.classList.add("pro-blur");

    if(!el.querySelector(".paywall-mini")){

      const overlay = document.createElement("div");

      overlay.className = "paywall-mini";

      overlay.innerHTML = `
        <div style="
          margin-top:10px;
          padding:10px;
          font-size:13px;
          text-align:center;
          color:#64748b;
        ">
          🔒 ${t(
            "Sblocca analisi avanzata",
            "Unlock advanced analysis"
          )}
        </div>
      `;

      el.appendChild(overlay);
    }

  });

}

function getValue(id){

  const el = document.getElementById(id);

  if(!el){
  return null; // 🔥 niente log → niente casino
}

  const raw = (el.value || "").toString().replace(",", ".");

  const val = parseFloat(raw);

  if(isNaN(val)){
    return null;
  }

  return val;
}

let roiChartInstance = null;

// ================= GLOBAL HERO BACKGROUND =================

window.applyCityBackground = function(city){

// 🔥 SUPPORTA SIA TOOL (.hero-bg) CHE ROI (.hero-roi)
const hero =
  document.querySelector(".hero-bg") ||
  document.querySelector(".hero-roi");

if(!hero) return;

// 🔥 PULIZIA CLASSI (evita accumulo / override)
hero.classList.remove("rome","naples","milan","florence");

// 🔥 MAP IT → EN (coerente con CSS)
const map = {
  roma:"rome",
  napoli:"naples",
  milano:"milan",
  firenze:"florence"
};

// 🔥 APPLICA CLASSE CORRETTA
const cityClass = map[city] || "rome";

hero.classList.add(cityClass);

console.log("🎯 BG aggiornato:", cityClass);

};

// ================= LAST ANALYSIS STORAGE =================
window.lastAnalysisData = null;
window.simulationExecuted = false;

// ================= MARKET COMPARISON =================

function renderMarketComparison(userRevenue, cityKey){

  const container = document.getElementById("market-comparison");
  if(!container) return;

  // 🔥 sicurezza numeri
  const revenue = window.safeNumber(userRevenue);
  const marketAvg = 28500;

  const diff = revenue - marketAvg;
  
  let diffPerc = marketAvg > 0
  ? (diff / marketAvg) * 100
  : 0;

// 🔥 evita 0.0% fake (UX SaaS)
if(Math.abs(diffPerc) < 0.1 && diff !== 0){
  diffPerc = diff > 0 ? 0.1 : -0.1;
}

diffPerc = diffPerc.toFixed(1);

  const isPositive = diff >= 0;

  const diffColor = isPositive ? "#10b981" : "#ef4444";
  const bgColor   = isPositive ? "#ecfdf5" : "#fef2f2";
  const borderCol = isPositive ? "#10b981" : "#ef4444";

  // 🔥 RESET IMPORTANTE (evita residui layout vecchi)
  container.innerHTML = "";

  // 🔥 KPI 1
  const kpi1 = `
    <div class="kpi-box">
      <div class="kpi-label">📊 Your revenue</div>
      <div class="kpi-value">
        ${formatCurrency(revenue)}
      </div>
    </div>
  `;

  // 🔥 KPI 2
  const kpi2 = `
    <div class="kpi-box">
      <div class="kpi-label">🏙 Market average</div>
      <div class="kpi-value">
        ${formatCurrency(marketAvg)}
      </div>
    </div>
  `;

  // 🔥 KPI 3 (PERFORMANCE)
  const kpi3 = `
    <div class="kpi-box" style="
      background:${bgColor};
      border:1px solid ${borderCol};
    ">
      <div class="kpi-label">⚡ Performance</div>

      <div class="kpi-value" style="color:${diffColor}">
        ${isPositive ? "▲ +" : "▼ "}${diffPerc}%
      </div>

      <div style="
        font-size:12px;
        margin-top:4px;
        color:#64748b;
      ">
        ${isPositive ? "Above market" : "Below market"}
      </div>
    </div>
  `;

  // 🔥 INSERT DIRETTO (NO WRAPPER → FIX DEFINITIVO)
  container.insertAdjacentHTML("beforeend", kpi1 + kpi2 + kpi3);

}
// ================= ROI VS MARKET =================

function renderROIMarketComparison(roi, cityKey){

  if(!window.RB_MARKET_DATA) return;

  safeRender("roi-market-comparison", (container) => {

    const market = window.RB_MARKET_DATA[cityKey];
    if(!market) return;

    const marketROI = market.roi;

    let message = "";
    let color = "#ef4444";
    let badge = "";

    if(roi > marketROI){
      message = t("ROI sopra la media","ROI above average");
      color = "#10b981";

      badge = `
      <div style="margin-bottom:12px;padding:12px;border-radius:10px;background:#ecfdf5;border:1px solid #10b981;font-weight:600;">
        ${t("ROI sopra la media","ROI above average")}
      </div>`;
    }else{
      message = t("ROI sotto la media","ROI below average");
    }

    container.innerHTML = badge + `
      <div class="kpi-box">
        <span>${t("ROI investimento","Your ROI")}</span>
        <strong>${safeNumber(roi).toFixed(1)}%</strong>
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
  });

}

// ================= REVENUE FORECAST =================

function renderRevenueForecast(baseRevenue){

const container = document.getElementById("revenue-forecast");
if(!container) return;

container.innerHTML = `

<div class="kpi-box">
  <div class="kpi-label">Low</div>
  <div class="kpi-value">
    ${formatCurrency(baseRevenue * 0.8)}
  </div>
</div>

<div class="kpi-box">
  <div class="kpi-label">Base</div>
  <div class="kpi-value">
    ${formatCurrency(baseRevenue)}
  </div>
</div>

<div class="kpi-box">
  <div class="kpi-label">High</div>
  <div class="kpi-value">
    ${formatCurrency(baseRevenue * 1.2)}
  </div>
</div>

`;

}


// ================= OCCUPANCY SENSITIVITY =================

function renderOccupancySensitivity(){

const container = document.getElementById("occupancy-sensitivity");
if(!container) return;

container.innerHTML = `

<div class="kpi-box">
  <div class="kpi-label">-10%</div>
  <div class="kpi-value">8.2%</div>
</div>

<div class="kpi-box">
  <div class="kpi-label">Base</div>
  <div class="kpi-value">10.5%</div>
</div>

<div class="kpi-box">
  <div class="kpi-label">+10%</div>
  <div class="kpi-value">12.8%</div>
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

applyAccessControl();

// ================= SMART PAYWALL (SOFT VERSION) =================

function showUpgradePopup(roi){

  const access = window.getUserAccess();

if(!window.firebaseReady || access.canSeeFullAnalysis){
  return;
}

  // 🔥 sicurezza ROI
  const safeROI = Number(roi || 0);

  if(safeROI > 8){

    console.log("Soft paywall attivo ROI:", safeROI);

    const upgradeBox = document.getElementById("upgrade-box");

    if(upgradeBox){
      upgradeBox.style.display = "block";
    }

  }

}

// ================= SMART INVESTMENT ALERT =================

function renderSmartInvestmentAlert(roi){

  const container = document.getElementById("smart-investment-alert");
  if(!container) return;

  // ================= CHECK PRO =================
 const access = window.getUserAccess();

  if(access.canSeeFullAnalysis){
    container.innerHTML = "";
    return;
  }

  // ================= ROI CHECK =================
  if(!roi || roi < 10){
    container.innerHTML = "";
    return;
  }

  // ================= RENDER OVERLAY =================
  container.innerHTML = `
  
  <div class="smart-overlay">

    <div class="smart-box fade-up">

      <div class="smart-close" onclick="this.closest('.smart-overlay').remove()">✖</div>

      <div style="font-weight:700;font-size:18px;margin-bottom:10px;">
        🔥 ${t("Investimento ad alto rendimento","High yield investment")}
      </div>

      <div style="font-size:14px;color:#64748b;margin-bottom:15px;">
        ROI stimato: <strong>${safeNumber(roi).toFixed(1)}%</strong><br>
        ${t(
          "Questo investimento potrebbe generare un forte rendimento",
          "This investment could generate strong returns"
        )}
      </div>

      <button id="smart-alert-btn" class="btn-main">
        ${t(
          "💰 Scopri quanto puoi guadagnare davvero",
          "💰 See real profit potential"
        )}
      </button>

      <div style="margin-top:10px;font-size:12px;color:#94a3b8;">
        ${t(
          "Accesso a simulazione completa professionale",
          "Access full professional simulation"
        )}
      </div>

    </div>

  </div>
  `;

  // ================= BUTTON =================
  const btn = document.getElementById("smart-alert-btn");

  if(btn){
    btn.onclick = () => {

  const isProNow = window.getUserAccess().canSeeFullAnalysis;

  if(isProNow){
    document.querySelector('#advanced-analysis')?.scrollIntoView({
      behavior:'smooth'
    });
  }else{
    startPlanPurchase('pro');
  }

};
  }

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
${roiText}: <strong>${safeNumber(roi).toFixed(1)}%</strong>
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

<button 
onclick="
  if(window.isPremiumUser()){
    document.querySelector('#advanced-analysis')?.scrollIntoView({behavior:'smooth'});
  } else {
    startPlanPurchase('pro');
  }
"
class="btn-main"
style="
margin:20px auto 10px auto;
display:block;
max-width:280px;
width:100%;
text-align:center;
"
>
${unlock}
</button>

<div style="margin-top:8px;font-size:12px;color:#64748b;">
${t(
"💰 Scopri quanto puoi guadagnare (o perdere davvero)",
"💰 See how much you can really earn (or lose)"
)}
</div>

</div>

`;

}

// ================= PDF BUTTON VISIBILITY =================

function updatePDFButton(){

const btn = document.getElementById("pdf-btn");
if(!btn) return;

if(!window.firebaseReady){
  console.log("⏳ Aspetto Firebase...");
  return;
}

const access = window.getUserAccess();

btn.style.display = access.canDownloadPDF ? "inline-block" : "none";

console.log("PDF visibility:", window.currentPlan);

}

// ================= ANIMATION + UI BOOST =================  👈 AGGIUNGI QUI

function animateValue(el, start, end, duration = 800){
  if(!el) return;

  let startTime = null;

  function animate(currentTime){
    if(!startTime) startTime = currentTime;

    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = start + (end - start) * progress;

    el.innerText = value.toFixed(1) + "%";

    if(progress < 1){
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function getROIColor(roi){
  if(roi >= 20) return "#10b981";
  if(roi >= 10) return "#f59e0b";
  return "#ef4444";
}

function getInvestmentBadge(roi){
  if(roi >= 20) return t("🚀 Investimento TOP","🚀 Top investment");
  if(roi >= 12) return t("🔥 Ottima opportunità","🔥 Great opportunity");
  if(roi >= 8) return t("👍 Buon investimento","👍 Good investment");
  return t("⚠️ Attenzione rischio","⚠️ Risk warning");
}

function getInvestmentBadgeClass(roi){
  if(roi >= 20) return "badge-top";
  if(roi >= 10) return "badge-good";
  return "badge-risk";
}

// ================= AI INSIGHT ENGINE =================

function generateInsights(data){

  const insights = [];

  const roi = data.roi;
  const occupancy = data.occupancy;
  const priceNight = data.priceNight;
  const expenses = data.expenses;

  if(roi < 5){
    insights.push({
      type:"danger",
      text:t(
        "ROI troppo basso → rischio investimento non sostenibile",
        "ROI too low → investment may not be sustainable"
      )
    });
  }

  if(occupancy < 55){
    insights.push({
      type:"warning",
      text:t(
        "Occupazione bassa → rischio stagionalità elevata",
        "Low occupancy → high seasonality risk"
      )
    });
  }

  if(priceNight < 80){
    insights.push({
      type:"warning",
      text:t(
        "Prezzo notte sotto media → possibile perdita di margine",
        "Night price below market → margin compression risk"
      )
    });
  }

  if(roi > 12){
    insights.push({
      type:"success",
      text:t(
        "Ottima opportunità → sopra media mercato",
        "Strong opportunity → above market average"
      )
    });
  }

  if(expenses > 2000){
    insights.push({
      type:"warning",
      text:t(
        "Costi operativi elevati → ottimizzabili",
        "High operating costs → optimization needed"
      )
    });
  }

  return insights;
}

function renderInsights(insights){

  const container = document.getElementById("ai-insights");
  if(!container) return;

  if(!insights.length){
  container.innerHTML = `
    <div style="color:#64748b;font-size:14px;">
      ${t("Nessun alert rilevato","No critical insights detected")}
    </div>
  `;
  return;
}

container.innerHTML = insights.map(i=>{

    let color = "#64748b";

    if(i.type === "success") color = "#10b981";
    if(i.type === "warning") color = "#f59e0b";
    if(i.type === "danger") color = "#ef4444";

    return `
      <div style="
        padding:12px;
        border-radius:10px;
        background:#f8fafc;
        border-left:4px solid ${color};
        font-size:14px;
      ">
        ${i.text}
      </div>
    `;

  }).join("");

}

// ================= LEAD ROUTING ENGINE =================
function getLeadDestination({roi, city}){

  if(roi >= 10){
    return {
      type: "immobile",
      emails: ["rendimentobb@gmail.com"]
    };
  }

  if(roi >= 6){
    return {
      type: "mutuo",
      emails: ["rendimentobb@gmail.com"]
    };
  }

  return null;
}

// ================= POST ANALYSIS ENGINE (SAAS CLEAN) =================

function runPostAnalysis(result, context){

  if(!result) return;

  const {
    price,
    gross,
    occupancy,
    priceNight,
    expenses
  } = context || {};

  // ================= SESSION (UNICA FONTE) =================
  window.simulationExecuted = true;
  window.lastAnalysisData = result;

  const roi = Number(result?.roi || 0);

  // ================= PAYWALL (UNICO) =================
const access = window.getUserAccess();
  
if(!access.canSeeFullAnalysis && !window.paywallShown){

  window.paywallShown = true;

  const highROI = roi > 10;
  const midROI  = roi > 6;

  setTimeout(()=>{

    if(highROI){

      showUpgradeModal(roi); // 🔥 HARD SELL

    }else if(midROI){

      renderSmartInvestmentAlert(roi); // 🔥 SOFT PUSH

    }else{

      showUpgradeModal(roi); // 🔥 educazione

    }

  },1000);

}

  // ================= USER =================
  const userEmail = window.currentUser?.email || null;

  // ================= SESSION COUNT =================
  window.simulationCount = (window.simulationCount || 0) + 1;

  if(!window.currentUser && window.simulationCount >= 2){
    setTimeout(()=> window.location.href="/login/", 800);
  }

  // ================= LEAD SCORE =================
  let leadScore = getLeadScore(result);

  if(window.simulationCount > 3){
    leadScore = "hot";
  }

  const leadValue =
    leadScore === "hot" ? 100 :
    leadScore === "warm" ? 40 : 0;

  const leadDestination = getLeadDestination({
    roi,
    city: window.currentCity
  });

  // ================= SAVE LEAD =================
  (async () => {

    try{

      if(window.leadSaved) return;

      const {
        addDoc,
        collection,
        serverTimestamp
      } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js");

      await addDoc(collection(db,"leads"),{
        email: userEmail,
        roi,
        score: leadScore,
        value: leadValue,
        city: window.currentCity || "unknown",
        createdAt: serverTimestamp()
      });

      window.leadSaved = true;

      // ================= PARTNER =================
      if(leadScore === "hot"){
        fetch("/api/send-lead-partner",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            email:userEmail,
            city:window.currentCity,
            roi,
            score:leadScore,
            type:leadDestination?.type || "simulator",
            partners:leadDestination?.emails || []
          })
        });
      }

    }catch(e){
      console.error("Lead error:", e);
    }

  })();

  // ================= EMAIL =================
  if(!userEmail || roi <= 0) return;

  if(window.emailUserSent) return;

  window.emailUserSent = true;

  fetch("/api/send-lead-email",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email:userEmail,
      lang:window.currentLang || "it",
      roi,
      city:window.currentCity
    })
  })
  .then(res=>{
    if(!res.ok){
      window.emailUserSent = false;
    }
  })
  .catch(()=>{
    window.emailUserSent = false;
  });

}

// ================= CORE CALCULATE ENGINE (SAAS READY – FINAL) =================

window.calculate = async function(force = false){

  // ================= GUARD =================
  if(window.isCalculating && !force){
    console.warn("⛔ skip calculate (already running)");
    return;
  }

  if(!window.firebaseReady){
    console.warn("⏳ Firebase non pronto → delay calculate");
    window.pendingCalculation = true;
    return;
  }

  window.isCalculating = true;
  window.simulationExecuted = false;
  window.paywallShown = false;

  try{

    // ================= INPUT =================
    const isTool = !!document.getElementById("price");

    const price = isTool
      ? getValue("price") || 100000
      : getValue("qr_price") || 100000;

    const equity = isTool
      ? getValue("equity") || Math.round(price * 0.3)
      : 0;

    const priceNight = isTool
      ? getValue("priceNight") || 100
      : getValue("qr_night") || 100;

    const occupancy = isTool
      ? getValue("occupancy") || 65
      : getValue("qr_occ") || 65;

    const expenses = isTool
      ? getValue("expenses") || 30
      : getValue("qr_cost") || 30;

    const commission = getValue("commission") || 15;
    const tax = getValue("tax") || 21;

    const loanAmount = getValue("loanAmount") || (price - equity);
    const interestRate = getValue("interestRate") || 3.5;
    const loanYears = getValue("loanYears") || 20;

    // ================= UI SYNC =================
    const occValue = document.getElementById("occ-value");
    if(occValue){
      occValue.innerText = occupancy + "%";
    }

    // ================= CALCOLO =================
    window.emailSent = false;

    const isLogged = !!window.currentUser;
    let result;

 if(!isLogged){

  console.log("🔓 Modalità preview attiva");
  showRegisterPopup();

}

result = calculateROI({
  price,
  equity,
  priceNight,
  occupancy,
  expenses,
  commission,
  tax,
  loanAmount,
  interestRate,
  loanYears
});

    // ================= VALIDAZIONE =================
    if (!result || typeof result !== "object") {
      console.warn("⛔ risultato non valido");
      return;
    }

    // ================= SAFE VALUES (PRIMA!) =================
    const roi   = Number(result?.roi || 0);
    const gross = Number(result?.revenue || 0);
    const net   = Number(result?.netAfterMortgage || result?.profit || 0);


    // ================= POST ANALYSIS (UNICA LOGICA BUSINESS) =================
    runPostAnalysis(result, {
      price,
      gross,
      occupancy,
      priceNight,
      expenses
    });

    // ================= UI BASE =================
    const roiEl = document.getElementById("roi-live");
    if(roiEl){
      roiEl.innerText = roi.toFixed(1) + "%";
    }

    const monthlyEl = document.getElementById("profit-monthly");
    const annualEl  = document.getElementById("profit-annual");

    if(monthlyEl) monthlyEl.innerText = formatCurrency(net / 12);
    if(annualEl)  annualEl.innerText  = formatCurrency(net);

    // ================= MARKET =================
    if(typeof renderMarketBenchmark === "function"){
      renderMarketBenchmark(window.currentCity || "napoli");
    }

    if(typeof renderMarketComparison === "function"){
      renderMarketComparison(
        gross,
        window.currentCity || "napoli"
      );
    }

    // ================= RENDER COMPLETO TOOL =================

// revenue forecast
if(typeof renderRevenueForecast === "function"){
  renderRevenueForecast(result.revenue);
}

// occupancy sensitivity
if(typeof renderOccupancySensitivity === "function"){
  renderOccupancySensitivity();
}

// break-even occupancy
if(typeof renderBreakEvenOccupancy === "function"){
  renderBreakEvenOccupancy(
    priceNight,
    expenses,
    commission,
    tax,
    result.mortgageAnnual || 0
  );
}

// investment score
const riskScore = roi > 12 ? 30 : roi > 6 ? 55 : 75;

if(typeof renderInvestmentScore === "function"){
  renderInvestmentScore(roi, riskScore);
}

// ================= SCORE CERCHIO (FIX) =================
const investmentScore = Math.min(100, Math.round(roi * 3));

if(typeof window.updateInvestmentScore === "function"){
  window.updateInvestmentScore(investmentScore);
}

// ranking
if(typeof renderInvestmentRanking === "function"){
  renderInvestmentRanking(roi);
}

// risk meter
if(typeof renderRiskMeter === "function"){
  renderRiskMeter(riskScore);
}

// verdict
if(typeof renderInvestmentVerdict === "function"){
  const payback = net > 0 ? (price / net) : 0;
  renderInvestmentVerdict(roi, payback);
}

// AI insights
if(typeof generateInsights === "function" && typeof renderInsights === "function"){
  const insights = generateInsights({
    roi,
    occupancy,
    priceNight,
    expenses
  });
  renderInsights(insights);
}

    // ================= KPI TOOL (CORRETTO) =================

const roiTool = document.getElementById("roi-preview");
if(roiTool){
  roiTool.innerText = roi.toFixed(1) + "%";
}

const riskTool = document.getElementById("risk-preview");
if(riskTool){
  const riskScore = roi > 12 ? 30 : roi > 6 ? 55 : 75;
  riskTool.innerText = riskScore + " / 100";
}

// ================= KPI HOME (SE PRESENTE) =================

const roiHome = document.getElementById("qr_roi");
if(roiHome){
  roiHome.innerText = roi.toFixed(1) + "%";
}

const profitHome = document.getElementById("profit-live");
if(profitHome){
  profitHome.innerText = window.getUserAccess().canSeeFullAnalysis
  ? formatCurrency(net)
  : "—";
}

const revenueHome = document.getElementById("revenue-live");
if(revenueHome){
  revenueHome.innerText = formatCurrency(gross);
}

    // ================= CHART =================
    setTimeout(()=>{
      if(typeof renderChart === "function"){
        renderChart(net);
      }
    },200);

    // ================= EVENT GLOBAL =================
    window.currentRevenue = result.revenue || gross || 0;

    document.dispatchEvent(
      new CustomEvent("rb_simulation_updated", {
        detail:{
          revenue: window.currentRevenue,
          roi,
          data: result
        }
      })
    );

      // ================= MARKET =================
    if(typeof renderMarketBenchmark === "function"){
      renderMarketBenchmark(window.currentCity || "napoli");
    }

    // ================= MARKET COMPARISON (FIX DEFINITIVO) =================
    if(typeof renderMarketComparison === "function"){

      console.log("🔥 renderMarketComparison RUN");

      renderMarketComparison(
      gross, // ⚠️ IMPORTANTISSIMO
      window.currentCity || "napoli"
    );

  }

    // ================= UPGRADE =================
    if(typeof triggerUpgradeIfNeeded === "function"){
      triggerUpgradeIfNeeded(roi);
    }

    // ================= LANGUAGE =================
    window.RB_LANG?.apply?.();

  }catch(err){
    console.error("💥 calculate error:", err);
  }

  window.isCalculating = false;
};

function renderChart(net){

  // 🔒 ANTI DOUBLE RENDER
  if(window.renderingChart){
    return;
  }
  window.renderingChart = true;

  // 🛑 sicurezza dati
  net = Number(net);
  if(!net || net <= 0){
    console.warn("⛔ renderChart skip → net non valido:", net);
    window.renderingChart = false;
    return;
  }

  const canvas = document.getElementById("roiChart");

  if(!canvas){
    console.warn("⛔ Canvas non presente → skip chart");
    window.renderingChart = false;
    return;
  }

  if(typeof Chart === "undefined"){
    console.warn("⏳ Chart.js non caricato → retry");
    setTimeout(()=>renderChart(net), 300);
    window.renderingChart = false;
    return;
  }

  const ctx = canvas.getContext("2d");

  if(!ctx){
    console.warn("⛔ ctx non disponibile");
    window.renderingChart = false;
    return;
  }

  // 🔥 destroy precedente
  if(roiChartInstance){
    roiChartInstance.destroy();
    roiChartInstance = null;
  }

  // ================= DATA =================
  const years = Array.from({length:10}, (_,i)=>i+1);

  const conservative = years.map(y => net * y * 0.8);
  const base = years.map(y => net * y);
  const optimistic = years.map(y => net * y * 1.2);

  // ================= CHART =================
  roiChartInstance = new Chart(ctx,{

    type:"line",

    data:{
      labels: years.map(y => t("Anno ","Year ") + y),

      datasets:[
        {
          label: t("Scenario prudente","Low scenario"),
          data: conservative,
          borderColor:"#ef4444",
          backgroundColor:"rgba(239,68,68,0.08)",
          tension:0.4,
          borderWidth:2,
          fill:true,
          pointRadius:0
        },
        {
          label: t("Scenario base","Base scenario"),
          data: base,
          borderColor:"#3b82f6",
          backgroundColor:"rgba(59,130,246,0.15)",
          tension:0.4,
          borderWidth:3,
          fill:true,
          pointRadius:0
        },
        {
          label: t("Scenario ottimistico","High scenario"),
          data: optimistic,
          borderColor:"#10b981",
          backgroundColor:"rgba(16,185,129,0.12)",
          tension:0.4,
          borderWidth:2,
          fill:true,
          pointRadius:0
        }
      ]
    },

    options:{
      responsive:true,
      maintainAspectRatio:false,
      animation:false,
      devicePixelRatio:2,

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

  console.log("✅ ROI chart renderizzato");

  // 🔓 RESET LOCK
  window.renderingChart = false;
}

// ================= CITY ROI CHART (SAFE) =================
function renderCityROIChart(){

  const canvas = document.getElementById("city-roi-chart");

  if(!canvas){
    console.warn("⏳ city chart non pronto → skip");
    return;
  }

  if(typeof Chart === "undefined"){
    console.warn("⏳ Chart.js non pronto → skip");
    return;
  }

  const ctx = canvas.getContext("2d");

  new Chart(ctx,{

    type:"doughnut",

    data:{
      labels:["Napoli","Roma","Firenze","Milano"],

      datasets:[{
        data:[16.7,14.2,12.9,10.5],

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
      responsive:true,
      cutout:"70%",

      plugins:{
        legend:{
          position:"bottom"
        }
      }

    }

  });

}



// ================= AUTO INIT =================
document.addEventListener("DOMContentLoaded", ()=>{

  // dashboard chart
  renderCityROIChart();

});

// 🔥 FIX CTA MULTIPLE
document.addEventListener("DOMContentLoaded", () => {

  const seen = new Set();

  document.querySelectorAll(".btn-main").forEach(btn => {

    const text = btn.innerText.trim();

    if(seen.has(text)){
      btn.remove();
    }else{
      seen.add(text);
    }

  });

});

// ================= EXECUTIVE PDF – BANK LEVEL =================

window.generateExecutivePDF = async function(){

const lang = window.RB_LANG?.current || window.currentLang || "it";
const tSafe = (it,en)=> lang==="it"?it:en;

// 🔒 CHECK
if(!hasPlan("pro")){
  alert("🔒 PRO required");
  return;
}

if(!window.lastAnalysisData){
  alert(tSafe("Genera prima l'analisi","Run analysis first"));
  return;
}

if(!window.jspdf){
  alert("PDF engine non caricato");
  return;
}

const { jsPDF } = window.jspdf;
const data = window.lastAnalysisData;

// ================= SAFE =================
const safe = (v)=> isFinite(v) ? Number(v) : 0;

const roi = safe(data.roi);
const revenue = safe(data.revenue);
const profit = safe(data.netAfterMortgage || data.profit);
const price = safe(data.price);
const equity = safe(data.equity);
const loan = safe(data.loan);

// ================= FORMAT =================
const eur = (v)=> "€" + safe(v).toLocaleString();
const pct = (v)=> safe(v).toFixed(1) + "%";

// ================= DOC =================
const doc = new jsPDF();
let y = 20;

// ================= HEADER =================
doc.setFillColor(15,23,42);
doc.rect(0,0,210,30,"F");

doc.setTextColor(255);
doc.setFontSize(14);
doc.text("RendimentoBB", 20, 15);

doc.setFontSize(9);
doc.setTextColor(180);
doc.text("Investment Intelligence Report", 20, 23);

// ================= KPI HERO =================
y = 40;

doc.setFillColor(16,185,129);
doc.roundedRect(20,y,170,28,6,6,"F");

doc.setTextColor(255);
doc.setFontSize(10);
doc.text("ROI", 25, y+10);

doc.setFontSize(24);
doc.text(pct(roi), 25, y+22);

let badge = "RISKY";
if(roi > 12) badge = "HIGH PERFORMANCE";
else if(roi > 6) badge = "BALANCED";

doc.setFontSize(10);
doc.text(badge, 140, y+22);

y += 40;

// ================= SUMMARY =================
doc.setTextColor(0);
doc.setFontSize(13);
doc.text("Executive Summary", 20, y);

y += 8;

doc.setFontSize(10);

let summary = "Risky investment with low return.";
if(roi > 12) summary = "High-performing investment above market average.";
else if(roi > 6) summary = "Balanced investment with solid ROI.";

doc.text(summary, 20, y, { maxWidth: 170 });

y += 14;

// ================= AI INSIGHT =================
doc.setFillColor(248,250,252);
doc.roundedRect(20,y,170,28,4,4,"F");

doc.setFontSize(10);

let insight = "Hidden risks detected.";
if(roi > 12){
  insight = "Strong investment with high profitability potential.";
}else if(roi > 6){
  insight = "Moderate investment dependent on occupancy.";
}else{
  insight = "High risk: ROI may not cover costs.";
}

doc.text(insight, 25, y+12, { maxWidth: 160 });

y += 40;

// ================= STRUCTURE =================
doc.setFontSize(13);
doc.text("Investment Structure", 20, y);

y += 8;

doc.setFontSize(10);
doc.text("Property price: " + eur(price), 20, y); y+=6;
doc.text("Equity: " + eur(equity), 20, y); y+=6;
doc.text("Loan: " + eur(loan), 20, y); y+=6;

const ltv = price > 0 ? ((loan/price)*100).toFixed(0) : 0;
doc.text("LTV: " + ltv + "%", 20, y);

y += 14;

// ================= KPI =================
doc.setFillColor(248,250,252);
doc.roundedRect(20,y,80,20,4,4,"F");

doc.setFontSize(8);
doc.setTextColor(120);
doc.text("Revenue", 25, y+7);

doc.setFontSize(12);
doc.setTextColor(0);
doc.text(eur(revenue), 25, y+15);

doc.setFillColor(248,250,252);
doc.roundedRect(110,y,80,20,4,4,"F");

doc.setFontSize(8);
doc.setTextColor(120);
doc.text("Profit", 115, y+7);

doc.setFontSize(12);
doc.setTextColor(0);
doc.text(eur(profit), 115, y+15);

y += 30;

// ================= MARKET =================
const marketAvg = 28500;
const diff = revenue - marketAvg;

doc.setFontSize(12);
doc.text("Market Comparison", 20, y);

y += 8;

doc.setFontSize(10);
doc.text("Your revenue: " + eur(revenue), 20, y); y+=6;
doc.text("Market average: " + eur(marketAvg), 20, y); y+=6;

const performance = diff >= 0 ? "Above market" : "Below market";
doc.text("Performance: " + performance, 20, y);

y += 15;

// ================= CHART BANK STYLE =================
const chartCanvas = document.getElementById("roiChart");

if(chartCanvas){

  try{

    // crea canvas HD (fix blur + taglio)
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = chartCanvas.width * 2;
    tempCanvas.height = chartCanvas.height * 2;

    const ctx = tempCanvas.getContext("2d");
    ctx.scale(2,2);
    ctx.drawImage(chartCanvas, 0, 0);

    const imgData = tempCanvas.toDataURL("image/png", 1.0);

    // titolo
    doc.setFontSize(12);
    doc.text("Performance Forecast", 20, y);

    y += 8;

    // BOX stile banca
    doc.setFillColor(255,255,255);
    doc.setDrawColor(220);
    doc.roundedRect(15, y-5, 180, 100, 6,6,"FD");

    // dimensioni corrette (NO TAGLIO)
    const imgWidth = 160;
    const imgHeight = 80;

    doc.addImage(
      imgData,
      "PNG",
      25,
      y,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );

    y += imgHeight + 20;

  }catch(e){
    console.warn("Chart error:", e);
  }
}

// ================= PAGE 2 =================
doc.addPage();
y = 30;

// ================= SCORE =================
doc.setFontSize(14);
doc.text("Investment Score", 20, y);

y += 12;

let score = Math.min(100, Math.round(roi * 3));

doc.setFontSize(36);
doc.text(score + "/100", 20, y);

// ================= RATING =================
y += 20;

doc.setFontSize(12);

let rating = "High Risk";
if(score > 75) rating = "Excellent Investment";
else if(score > 55) rating = "Moderate Opportunity";

doc.text("Rating: " + rating, 20, y);

// ================= STRATEGY =================
y += 15;

doc.setFontSize(12);
doc.text("Strategic Insight", 20, y);

y += 8;

doc.setFontSize(10);

const strategy = score > 70
  ? "Aggressive expansion recommended."
  : "Optimize pricing and occupancy.";

doc.text(strategy, 20, y, { maxWidth: 170 });

// ================= FOOTER =================
const addFooter = () => {
  doc.setDrawColor(220);
  doc.line(20, 270, 190, 270);

  doc.setFontSize(8);
  doc.setTextColor(120);

  doc.text("RendimentoBB ©", 20, 278);
  doc.text("Confidential", 160, 278);
};

addFooter();
doc.setPage(1);
addFooter();

// ================= SAVE =================
doc.save("RendimentoBB-Executive-Report.pdf");

};
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

  // ================= AUTO CITY DETECTION =================

function handleAutoCityRedirect(){

  const link = localStorage.getItem("property_link");

  if(!link) return;

  const detectedCity = extractCityFromLink(link);

  console.log("Città rilevata dal link:", detectedCity);

  if(detectedCity){
    window.location.href = "/tool/?city=" + detectedCity;
  }

}
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

window.buyPlan = async function(plan){

  const user = window.currentUser;

  if(!user){
    alert("Devi effettuare il login");
    window.location.href = "/login/";
    return;
  }

  const uid = user.uid;

  try{

    const res = await fetch("/api/create-checkout-session",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        plan: plan,
        uid: uid
      })
    });

    const data = await res.json();

    if(data.url){
      window.location.href = data.url;
    }else{
      console.error("Errore Stripe:", data);
    }

  }catch(err){
    console.error("Errore:", err);
  }

};

// ================= PROPERTY SCRAPER =================

async function scrapePropertyFromBrowser(url){

console.log("Scraper disattivato (Vercel)");

return { price: null };

}

// ================= AUTO PRICE =================

const storedPrice = localStorage.getItem("property_price");

if(storedPrice && storedPrice > 0){

const priceField = document.getElementById("price");

if(priceField){
priceField.value = storedPrice;
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

// ===============================================
// RENDIMENTOBB – APP CORE (CLEAN + UX + SYNC)
// ===============================================

document.addEventListener("DOMContentLoaded", () => {

  console.log("🚀 App init");

  // ===============================
  // MUTUI → TOOL SYNC
  // ===============================

  applySelectedMortgage();

  // ===============================
  // CHECK RATE UPDATE (se esiste)
  // ===============================

  if(typeof checkMortgageRateUpdate === "function"){
    checkMortgageRateUpdate();
  }

  // ===============================
  // AUTO CITY REDIRECT (se esiste)
  // ===============================

  if(typeof handleAutoCityRedirect === "function"){
    handleAutoCityRedirect();
  }

});

// ================= FIREBASE SYNC FIX (CRITICO) =================

document.addEventListener("rb_auth_ready", () => {

  console.log("🔥 Firebase READY → HARD SYNC");


  // ===============================
  // 🔥 CASO 1 → CALCOLO MAI PARTITO
  // ===============================

  if(window.pendingCalculation && typeof window.calculate === "function"){

    console.log("🚀 RUN pending calculation");

    window.pendingCalculation = false;

    setTimeout(()=>{
      window.calculate(true);
    },50);

    return;
  }

  // ===============================
  // 🔥 CASO 2 → GIÀ ESEGUITO (RESYNC PRO)
  // ===============================

  if(window.simulationExecuted && typeof window.calculate === "function"){

    console.log("🔁 Re-run calculate (PRO sync)");

    setTimeout(()=>{
      window.calculate(true);
    },50);

  }

  // ===============================
  // 🔥 PDF BUTTON
  // ===============================

  if(typeof updatePDFButton === "function"){
    updatePDFButton();
  }

});


// ===============================================
// APPLY MORTGAGE FROM COMPARATOR
// ===============================================

function applySelectedMortgage(){

  const savedRate =
    localStorage.getItem("selected_mortgage_rate") ||
    localStorage.getItem("mortgage_rate");

  if(!savedRate) return;

  console.log("🏦 Applying mortgage:", savedRate);

  const rateInput = document.getElementById("interestRate");

  if(rateInput){
    rateInput.value = savedRate;
  }

  // ===============================
  // UX BANNER PREMIUM
  // ===============================

  const banner = document.getElementById("mortgage-banner");

  if(banner){

    banner.innerHTML = `
    <div style="
      margin-bottom:20px;
      padding:14px;
      border-radius:12px;
      background:linear-gradient(135deg,#ecfdf5,#d1fae5);
      border:1px solid #10b981;
      font-weight:600;
      text-align:center;
      box-shadow:0 8px 20px rgba(16,185,129,0.15);
    ">
      🏦 ${
        typeof t === "function"
        ? t(
          "Mutuo selezionato automaticamente dal comparatore",
          "Mortgage auto-selected from comparator"
        )
        : "Mutuo selezionato"
      }
      <br>
      <span style="font-size:18px;color:#059669">
        ${savedRate}%
      </span>
    </div>
    `;
  }

  // ===============================
  // CLEAN STORAGE
  // ===============================

  localStorage.removeItem("selected_mortgage_rate");
  localStorage.removeItem("mortgage_rate");

}

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



}

});

if(citySelector){

citySelector.addEventListener("change",()=>{

const city = citySelector.value;

window.currentCity = city;
localStorage.setItem("selected_city", city);

changeCityBackground(city);

// non avviare automaticamente la simulazione
// calculate();

});

}

// ================= CITY ROUTING FIX =================

// 🔒 BLOCCO ANTI-OVERRIDE
window.__CITY_LOCKED__ = false;

// 1. prendi path (/roma, /milano ecc)
function getCityFromPath(){

  const path = window.location.pathname.toLowerCase();

  // ================= MARKET (NON TOCCARE) =================
  if(path.startsWith("/market/")){
    if(path.includes("roma")) return "roma";
    if(path.includes("milano")) return "milano";
    if(path.includes("firenze")) return "firenze";
    if(path.includes("napoli")) return "napoli";
  }

  // ================= ROI (FIX DEFINITIVO) =================
  if(path.startsWith("/roi-bnb/")){
    if(path.includes("roma")) return "roma";
    if(path.includes("milano")) return "milano";
    if(path.includes("firenze")) return "firenze";
    if(path.includes("napoli")) return "napoli";
  }

  return null;
}

// ================= SOURCE DATI =================

const params = new URLSearchParams(window.location.search);
const cityFromQuery = params.get("city");
const cityFromStorage = localStorage.getItem("selected_city");

// ================= PRIORITÀ =================

// 🔥 PATH SEMPRE PRIORITARIO
let selectedCity = getCityFromPath();

// fallback SOLO se non trovato
if(!selectedCity){
  selectedCity =
    cityFromQuery ||
    cityFromStorage ||
    "roma";
}

// ================= LOCK HARD (CRITICO) =================

// 🔥 se siamo su ROI → blocca definitivamente la città
if(window.location.pathname.startsWith("/roi-bnb/")){

  const pathCity = getCityFromPath();

  if(pathCity){
    selectedCity = pathCity;

    // 🔒 LOCK GLOBALE → impedisce override futuri
    window.__CITY_LOCKED__ = true;

    console.log("🔒 CITY LOCK ATTIVO:", selectedCity);
  }
}

// ================= SAVE =================

// 🔥 NON salvare nelle ROI (evita contaminazioni)
if(!window.location.pathname.startsWith("/roi-bnb/")){
  localStorage.setItem("selected_city", selectedCity);
}

window.currentCity = selectedCity;

// ================= UI SYNC =================

document.addEventListener("DOMContentLoaded", () => {

  // 🔥 se lock attivo → non permettere modifiche
  if(window.__CITY_LOCKED__){
    console.log("⛔ Override bloccati (ROI page)");
  }

  window.currentCity = selectedCity;

  const citySelector = document.getElementById("market-city");

  if(citySelector && !window.__CITY_LOCKED__){
    citySelector.value = selectedCity;
  }

  // ================= BACKGROUND =================

  // 🔥 TOOL / MARKET (NON TOCCARE)
  if(!window.location.pathname.startsWith("/roi-bnb/")){
    changeCityBackground(selectedCity);
  }

  // 🔥 ROI (FORZATO + LOCK)
  if(window.applyCityBackground){

    applyCityBackground(selectedCity);

    // 🔥 RIAPPLICA DOPO → anti script esterni
    setTimeout(()=>{
      if(window.__CITY_LOCKED__){
        applyCityBackground(selectedCity);
        console.log("🔁 Re-apply BG (anti override)");
      }
    },200);
  }

  console.log("🔥 Città attiva finale:", selectedCity);

});

// ================= NAV =================

function goToMarket(city){
  window.location.href = "/market/" + city;
}
function unlockProUI(){

  const access = window.getUserAccess();

  if(!(access.canSeeFullAnalysis || access.isInvestor)){
    console.log("⛔ NOT PRO → skip unlock");
    return;
  }

  console.log("🔥 FORCE UNLOCK PRO UI");

  window.proUnlocked = true;

  // ================= ADMIN =================
  if(window.isAdmin && window.isAdmin()){
    console.log("👑 ADMIN SBLOCCATO");

    document.body.classList.add("admin-user");
    document.body.classList.add("is-admin");

    document.querySelectorAll(".admin-only").forEach(el=>{
      el.style.display = "block";
    });
  }

  // ================= PRO STATE =================
  document.body.classList.add("pro-user");
  document.body.classList.add("is-pro");

  // ================= UNLOCK SOLO ELEMENTI BLOCCATI =================
  document.querySelectorAll(`
    .pro-blur,
    .locked,
    .locked-content,
    .premium-lock
  `).forEach(el => {

    el.classList.remove(
      "pro-blur",
      "locked",
      "locked-content",
      "premium-lock"
    );

    el.style.filter = "none";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";

  });

  // ================= SHOW PRO CONTENT =================
  document.querySelectorAll(".pro-only").forEach(el=>{
    el.style.display = "block";
    el.style.opacity = "1";
  });

  // ================= REMOVE OVERLAYS =================
  document.querySelectorAll(`
    [data-paywall],
    .locked-overlay,
    .upgrade-box,
    .paywall-box,
    .results-overlay,
    .upgrade-overlay,
    #upgrade-overlay,
    #upgrade-modal,
    .home-blur-overlay,
    .paywall-mini
  `).forEach(el => el.remove());

  console.log("✅ PRO SBLOCCATO DEFINITIVO");
}
// ================= EVENTI =================

// 🔥 QUESTI SONO FONDAMENTALI
document.addEventListener("rb_plan_loaded", applyAccessControl);
document.addEventListener("rb_auth_ready", applyAccessControl);


// ================= FIX CTA DUPLICATE =================
document.addEventListener("DOMContentLoaded", () => {

  const ctas = document.querySelectorAll(".btn-secondary");

  let found = 0;

  ctas.forEach(btn => {

    if(btn.innerText.includes("Scopri") || btn.innerText.includes("Find out")){

      found++;

      if(found > 1){
        btn.remove();
      }

    }

  });

});

// =====================================
// 🚀 OVERLAY KILLER DEFINITIVO
// =====================================

function removeGhostOverlays(){

  document.querySelectorAll(`
    .results-overlay,
    .locked-overlay,
    .home-blur-overlay,
    .upgrade-overlay,
    #upgrade-overlay,
    #upgrade-modal,
    [data-paywall]
  `).forEach(el => {

    // 🔥 NON TOCCARE REGISTER POPUP
    if(el.id === "register-popup") return;

    el.remove();

  });

}

// 🔥 ESECUZIONE FORZATA CONTINUA
// esegui solo quando serve
document.addEventListener("rb_plan_loaded", removeGhostOverlays);
document.addEventListener("rb_auth_ready", removeGhostOverlays);

// ================= PLAN LOADED HANDLER CLEAN =================

document.addEventListener("rb_plan_loaded", () => {

  console.log("🚀 PLAN LOADED → SYNC");

  // ================= UI BASE =================

  if(window.isPremiumUser()){

    console.log("🔓 PRO USER DASHBOARD");

    document.querySelectorAll(`
      .locked,
      .locked-overlay,
      .results-overlay
    `).forEach(el => el.remove());

  }else{

    console.log("🔒 FREE USER");

  }

  // ================= FORCE PLAN FIX =================

  setTimeout(() => {

    if(typeof window.forceCorrectPlan === "function"){

      window.forceCorrectPlan();

    } else {

      console.warn("⚠️ forceCorrectPlan non disponibile");

    }

  }, 100);

});

window.handleAnalyzeClick = function(){

  const isLogged = !!window.currentUser;

  // =========================
  // ❌ NON LOGGATO → BLOCCO + REGISTRAZIONE
  // =========================
  if(!isLogged){

    console.log("🔒 Utente non loggato → popup register");

    showRegisterPopup(); // 🔥 molto più efficace del vecchio modal

    return;
  }

  // =========================
  // ✅ LOGGATO → UX PREMIUM
  // =========================
  window.userHasClicked = true;

  const btn = document.querySelector(".btn-main");

  if(btn){
    const originalText = btn.innerText;

    btn.innerText = window.currentLang === "en"
      ? "Analyzing..."
      : "Analisi in corso...";

    btn.disabled = true;

    // 🔥 piccolo delay → effetto SaaS premium
    setTimeout(()=>{
      calculate(true);

      // ripristina bottone
      setTimeout(()=>{
        btn.innerText = originalText;
        btn.disabled = false;
      }, 800);

    }, 300);
  }else{
    calculate(true);
  }

};

// ================= REGISTER POPUP (FINAL FIX) =================

window.showRegisterPopup = function(){

  if(document.getElementById("register-popup")) return;

  // 🔥 mostra solo una volta per sessione
  if(sessionStorage.getItem("registerPopupShown")) return;
  sessionStorage.setItem("registerPopupShown", "true");

  const popup = document.createElement("div");
  popup.id = "register-popup";

  popup.innerHTML = `
    <div class="popup-overlay">
      <div class="popup-box">

        <h3>
          🔥 ${t(
            "Scopri se il tuo investimento è davvero profittevole",
            "See if your investment is really profitable"
          )}
        </h3>

        <p>
          ${t(
            "Registrati gratis per ottenere ROI reale, rischio e analisi completa.",
            "Sign up for free to unlock real ROI, risk and full analysis."
          )}
        </p>

        <button onclick="window.location.href='/login/'" class="btn-main">
          ${t("Registrati gratis", "Sign up free")}
        </button>

        <div class="popup-small">
          ${t(
            "Oppure continua con dati limitati",
            "Or continue with limited data"
          )}
        </div>

        <button onclick="window.closeRegisterPopup()" class="btn-outline">
          ${t("Continua senza registrarti", "Continue without account")}
        </button>

      </div>
    </div>
  `;

  document.body.appendChild(popup);

  // 🔥 blocca scroll
  document.body.style.overflow = "hidden";

  // 🔥 BLOCCA HEADER / MENU
document.body.classList.add("popup-open");

  // 🔥 click fuori = chiudi
  popup.querySelector(".popup-overlay").onclick = (e) => {
    if(e.target.classList.contains("popup-overlay")){
      window.closeRegisterPopup();
    }
  };
};


// ================= CLOSE POPUP (FIX ERRORE) =================

window.closeRegisterPopup = function(){

  const popup = document.getElementById("register-popup");

  if(popup){
    popup.remove();
  }

  document.body.style.overflow = "";

  // 🔥 SBLOCCA HEADER / MENU (QUESTA MANCAVA)
  document.body.classList.remove("popup-open");

  // 🔥 opzionale: reset stato
  window.isCalculating = false;

  console.log("✅ Popup chiuso");

};
