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

let roiChartInstance = null;

// ================= GLOBAL STATE =================

window.roiChartInstance = null;

// =====================================
// 🔥 GLOBAL ERROR DEBUG (CRITICO)
// =====================================
window.onerror = function(msg, url, line, col, error){
  console.error("💥 JS ERROR:", {
    msg,
    url,
    line,
    col,
    error
  });
};

// ================= SAFE GLOBAL UTILS =================

window.safeNumber = window.safeNumber || function(v, d=0){
  const n = Number(v);
  return isNaN(n) ? d : n;
};

window.formatCurrency = window.formatCurrency || function(v){
  const n = Number(v);
  return isNaN(n) ? "€0" : "€" + n.toLocaleString("it-IT");
};

// ================= SAFE TOAST SYSTEM =================

window.showToast = window.showToast || function(message, type = "info"){

  console.log("🔔 TOAST:", type, message);

  const toast = document.createElement("div");

  toast.innerText = message;

  toast.style = `
    position:fixed;
    bottom:20px;
    left:50%;
    transform:translateX(-50%);
    background:#0f172a;
    color:white;
    padding:10px 16px;
    border-radius:8px;
    font-size:13px;
    z-index:999999;
    opacity:0;
    transition:all .3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(()=> toast.style.opacity = "1", 10);

  setTimeout(()=>{
    toast.style.opacity = "0";
    setTimeout(()=> toast.remove(), 300);
  }, 2500);

};

// =====================================
// 🚫 DISABLE ALERT (UX FIX + DEBUG)
// =====================================

window.alert = function(msg){

  console.warn("🚫 ALERT BLOCCATO:", msg);

  // 🔍 TRACE per trovare chi lo chiama
  console.trace("📍 ALERT SOURCE");

  // 🔥 UX → toast moderno
  if(typeof showToast === "function"){
    showToast(msg, "warning");
  }

};
// ================= SAFE GLOBAL EARLY FIX =================

// 🔥 USA SOLO FIREBASE (SINGLE SOURCE OF TRUTH)
window.getUserAccess = function(){
  return window.RB_USER
    ? {
        ...window.RB_USER,
        isLogged: !!window.currentUser
      }
    : {
        isLogged: false,
        isFree: true,
        isPro: false,
        isInvestor: false,
        isAdmin: false
      };
};

// ❌ DISABILITA vecchio sistema (evita conflitti)
window.applyAccessControl = function(){
  console.warn("⛔ OLD ACCESS SYSTEM DISABLED");
};

// ================= KPI UNIVERSALE (HOME + TOOL) =================

function renderUniversalKPI(data = {}){

  const {
    net = 0,
    revenue = 0,
    investment = 0
  } = data;

  // 🔒 SAFE CHECK (evita crash)
  if(net === null || net === undefined){
  console.warn("⚠️ net mancante → continuo render");
}

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
  const monthly = net / 12;

  if(qrMonth) qrMonth.innerText = formatCurrency(monthly);
  if(elMonthly) elMonthly.innerText = formatCurrency(monthly);

  // ===== BREAK EVEN =====
  const payback = net > 0 ? (investment / net) : 0;
  const paybackText = payback ? payback.toFixed(1) + " anni" : "-";

  if(qrBreak) qrBreak.innerText = paybackText;
  if(elBreak) elBreak.innerText = paybackText;

  // ===== REVENUE =====
  if(qrRev) qrRev.innerText = formatCurrency(revenue);
  if(elRevenue) elRevenue.innerText = formatCurrency(revenue);

  // ================= ACCESS CONTROL (SAFE) =================

  const access = window.getUserAccess?.();

  if(!access){
    console.warn("⛔ access non disponibile");
    return;
  }

  // 🟡 INVESTOR → teaser intelligente (NO DUPLICATI)
  if(access.isInvestor){

    const verdict = document.getElementById("investment-verdict");

    if(verdict && !verdict.querySelector(".investor-upsell")){

      const upsell = document.createElement("div");
      upsell.className = "investor-upsell";

      upsell.innerHTML = `
        <div style="
          margin-top:15px;
          padding:12px;
          border-radius:10px;
          background:rgba(16,185,129,0.08);
          font-size:13px;
          text-align:center;
          color:#065f46;
          font-weight:500;
        ">
          🔥 ${t(
            "Stai vedendo solo una parte del potenziale reale",
            "You are only seeing part of the real potential"
          )}
          <br>
          <span style="opacity:.8;">
            ${t(
              "Sblocca analisi completa + AI insights",
              "Unlock full analysis + AI insights"
            )}
          </span>
        </div>
      `;

      verdict.appendChild(upsell);
    }
  }
}


// ================= ROI MESSAGE (HOME) =================

function updateROIMessage(roi){

  const msg = document.getElementById("hidden-roi-msg");
  if(!msg) return;

  if(roi > 12){
    msg.innerHTML = "🔥 Investimento sopra la media";
  }
  else if(roi > 6){
    msg.innerHTML = "👍 Investimento nella media";
  }
  else{
    msg.innerHTML = "⚠️ Rendimento basso";
  }

  msg.style.display = "block";
}
// ================= HOME LOCK SYSTEM =================

window.isProUser = function(){

  const access = window.getUserAccess?.() || {};

  return !!(access.isPro || access.isAdmin);

};

// ================= MORTGAGE COMPARISON =================

window.runMortgageComparison = function(){

  const amount = parseFloat(document.getElementById("mortgageAmount").value);
  const years = parseFloat(document.getElementById("mortgageYears").value);

  const rateA = parseFloat(document.getElementById("rateA").value);
  const rateB = parseFloat(document.getElementById("rateB").value);
  const rateC = parseFloat(document.getElementById("rateC").value);

  if(!amount || !years){
    showToast(
  t("Inserisci importo e durata","Enter amount and duration"),
  "warning"
);
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

// ================= LOCK OVERLAY (GLOBAL) =================
function createLockOverlay(el, text){

  if(!el || el.querySelector(".lock-overlay")) return;

  const overlay = document.createElement("div");
overlay.style.zIndex = "999";
el.style.position = "relative";
  
  overlay.className = "lock-overlay";

  overlay.innerHTML = `
    <div class="lock-box">
      <span class="lock-icon">🔒</span>
      <div class="lock-text">${text}</div>
    </div>
  `;

  overlay.onclick = () => {
    triggerUpgradeFlow();
  };

  el.appendChild(overlay);
}

// ================= SMART LOCK ENGINE =================
function applySmartLock(el, {
  type = "blur", // blur | hide | overlay
  message = "",
  cta = "Sblocca",
  plan = "pro"
} = {}){

  if(!el) return;

  const access = window.getUserAccess();

  // 🟡 INVESTOR → NO LOCK HARD
  if(access.isInvestor){
    return;
  }

  // 🟢 PRO / ADMIN → skip totale
  if(access.canSeeFullAnalysis){
    return;
  }

  // reset sicurezza
  el.classList.remove("pro-blur");

  // ================= TYPE: BLUR =================
  if(type === "blur"){
    el.classList.add("pro-blur");
  }

  // ================= TYPE: HIDE =================
  if(type === "hide"){
    el.style.display = "none";
  }

  // ================= OVERLAY =================
  if(type === "overlay"){

    createLockOverlay(el, `
      ${message}
      <br>
      <span style="font-size:12px;opacity:.8;">
        ${cta}
      </span>
    `);

  }

  // click → upgrade
  el.style.cursor = "pointer";
  el.onclick = () => {
    triggerUpgradeFlow({ source:"lock", plan });
  };

}


// ================= PLAN SYSTEM =================

// 🔥 ADMIN
window.isAdmin = function(){
  const email = window.currentUser?.email || "";
  return email === "rendimentobb@gmail.com";
};


// 🔥 PREMIUM USER (ADMIN + PRO)
window.isPremiumUser = function(){

  const plan = window.currentPlan || "free";

  const isAdmin =
    window.currentUser?.email === "rendimentobb@gmail.com" ||
    window.userRole === "admin";

  const isPro =
    plan === "pro" || plan === "pro_yearly";

  return isAdmin || isPro;
};


// 🔓 ACCESS COMPLETO
window.canUserAccessFull = function(){

  const access = window.getUserAccess?.() || {};

  return !!(access.isPro || access.isAdmin);

};


// ✅ GET PLAN
function getUserPlan(){
  return window.currentPlan || "free";
}


// 🔥 GERARCHIA PIANI
function hasPlan(requiredPlan){

  const plan = getUserPlan();

  if(requiredPlan === "pro"){
    return plan === "pro" || plan === "pro_yearly";
  }

  if(requiredPlan === "investor"){
    return (
      plan === "investor" ||
      plan === "pro" ||
      plan === "pro_yearly"
    );
  }

  if(requiredPlan === "free"){
    return true;
  }

  return false;
}


// 🔒 ACCESS CONTROL
function requirePlan(requiredPlan){

  if(!window.isUserReady()){
    console.log("⏳ Skip requirePlan → user non pronto");
    return false;
  }

  const access = window.getUserAccess();

  // 🔓 PRO / ADMIN
  if(access.canSeeFullAnalysis){
    return true;
  }

  // 🔒 NON LOGGATO
  if(!window.currentUser && !access.isLogged){
    showRegisterPopup();
    return false;
  }

  // 🔒 NON HA PIANO
  if(!hasPlan(requiredPlan)){

    showToast(
      t(
        "🔒 Sblocca analisi completa per continuare",
        "🔒 Unlock full analysis to continue"
      ),
      "warning"
    );

    openUpgradeModal(requiredPlan);
    return false;
  }

  return true;
}
// =====================================
// 🔥 FUNNEL + MODAL ENGINE UNIFICATO
// SILICON VALLEY SAAS – FINAL
// =====================================

// ================= FUNNEL =================

window.triggerUpgradeFlow = function(context = {}){

  const access = window.getUserAccess();
  const { roi = 0 } = context;

  // 👻 GUEST
  if(!access || access.isLogged === false){
    console.log("🔥 GUEST → INVESTOR");
    openUpgradeModal("investor", roi);
    return;
  }

  // 🔴 FREE
  if(access.isFree){
    console.log("🔥 FREE → INVESTOR");
    openUpgradeModal("investor", roi);
    return;
  }

  // 🟡 INVESTOR → SOLO PRO UPSELL (NO BLOCCO)
  if(access.isInvestor){
    console.log("🟡 INVESTOR → PRO UPSELL");

    // ⚠️ IMPORTANTISSIMO:
    // niente modal aggressivo automatico
    return;
  }

  // 🟢 PRO
  console.log("✅ PRO USER → NO POPUP");
};

// =====================================
// 🔥 MODAL UNIFICATO (CORE)
// =====================================

// =====================================
// 🔥 MODAL UNIFICATO (CORE)
// =====================================

window.openUpgradeModal = function(type = "investor", roi = 0){

  const access = window.getUserAccess();
  if(!access) return;

  // 🟡 INVESTOR → BLOCCA COMPLETAMENTE IL MODAL
  if(access.isInvestor){
    console.log("🟡 INVESTOR → modal bloccato");
    return;
  }

  // 🟢 PRO / ADMIN → NIENTE MODAL
  if(access.canSeeFullAnalysis){
    return;
  }

  // rimuove eventuali modal già aperti
  const existing = document.getElementById("rb-upgrade-modal");
  if(existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "rb-upgrade-modal";

  modal.style = `
    position:fixed;
    inset:0;
    background:rgba(2,6,23,0.75);
    backdrop-filter:blur(6px);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:999999;
  `;

 // ================= CONFIG =================

let config = {};

if(type === "investor"){
  config = {
    title_it: "📊 Sblocca piano Investor",
    title_en: "📊 Unlock Investor Plan",

    desc_it: "Stai usando dati incompleti e rischi di prendere una decisione sbagliata.",
    desc_en: "You're using incomplete data and risk making the wrong decision.",

    // ❌ tolti i ✔ dalle stringhe
    features_it: [
      "Simulazioni illimitate",
      "Analisi ROI avanzata",
      "Confronto mercato"
    ],
    features_en: [
      "Unlimited simulations",
      "Advanced ROI analysis",
      "Market comparison"
    ],

    cta_it: "💰 Passa a Investor €19",
    cta_en: "💰 Upgrade to Investor €19",

    action: () => startPlanPurchase("investor")
  };
}

if(type === "pro"){
  config = {
    title_it: "🚀 Sblocca analisi completa",
    title_en: "🚀 Unlock full analysis",

    desc_it: "Stai prendendo una decisione senza vedere rischio reale, mutuo e costi nascosti.",
    desc_en: "You're making a decision without seeing the real risk, mortgage, and hidden costs.",

    // ❌ tolti i ✔ anche qui
    features_it: [
      "ROI reale completo",
      "Analisi rischio avanzata",
      "Break-even reale",
      "Report PDF professionale"
    ],
    features_en: [
      "Full real ROI",
      "Advanced risk analysis",
      "Real break-even",
      "Professional PDF report"
    ],

    cta_it: "🔥 Passa a PRO – €29",
    cta_en: "🔥 Upgrade to PRO – €29",

    action: () => startPlanPurchase("pro")
  };
}

const lang = window.currentLang === "en" ? "en" : "it";

// ================= UI =================

const box = document.createElement("div");

box.style = `
  background:white;
  padding:28px;
  border-radius:16px;
  max-width:420px;
  width:90%;
  text-align:center;
  box-shadow:0 20px 60px rgba(0,0,0,0.25);
  animation:fadeIn .3s ease;
`;

// ===== TITLE =====
const title = document.createElement("h3");
title.textContent = config["title_" + lang];
title.style.color = "#0f172a";
title.style.fontWeight = "700";
title.style.marginBottom = "10px";

// ===== DESC =====
const desc = document.createElement("p");
desc.textContent = config["desc_" + lang];
desc.style.margin = "10px 0 20px";

// ===== FEATURES =====
const list = document.createElement("div");
list.style.textAlign = "left";
list.style.marginBottom = "20px";

config["features_" + lang].forEach(f => {

  const item = document.createElement("div");

  item.innerHTML = `
    <span style="color:#10b981;font-weight:600;">✔</span>
    <span style="color:#0f172a;margin-left:6px;font-weight:500;">
      ${f.replace("✔","").trim()}
    </span>
  `;

  item.style.margin = "6px 0";
  item.style.display = "flex";
  item.style.alignItems = "center";

  list.appendChild(item);
});

// ===== CTA =====
const cta = document.createElement("button");
cta.textContent = config["cta_" + lang];

cta.style = `
  background:#10b981;
  color:white;
  border:none;
  padding:12px 18px;
  border-radius:10px;
  font-weight:600;
  cursor:pointer;
  width:100%;
  margin-bottom:10px;
`;

cta.onclick = () => {
  modal.remove();
  config.action();
};

// ===== CLOSE =====
const close = document.createElement("button");
close.textContent = lang === "en" ? "Maybe later" : "Ora no";

close.style = `
  background:none;
  border:none;
  color:#64748b;
  cursor:pointer;
`;

close.onclick = () => modal.remove();

// ===== WARNING (FIX ERRORE QUI) =====
const warning = document.createElement("div");

warning.innerHTML = `
  <div style="
    margin-top:10px;
    font-size:13px;
    color:#ef4444;
    font-weight:600;
  ">
    ⚠️ ${t(
      "Il 72% degli investitori perde soldi in questa fase",
      "72% of investors lose money at this stage"
    )}
  </div>
`;

// ===== APPEND =====
box.appendChild(title);
box.appendChild(desc);
box.appendChild(list);
box.appendChild(cta);
box.appendChild(close);
box.appendChild(warning); // ✅ ora è dentro → niente errore

modal.appendChild(box);
document.body.appendChild(modal);
};
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

  // 🔥 KPI 1-2-3
const kpi1 = `
  <div class="kpi-box">
    <div class="kpi-label">
      ${t("📊 Ricavi","📊 Your revenue")}
    </div>
    <div class="kpi-value">
      ${formatCurrency(revenue)}
    </div>
  </div>
`;

const kpi2 = `
  <div class="kpi-box">
    <div class="kpi-label">
      ${t("🏙 Media mercato","🏙 Market average")}
    </div>
    <div class="kpi-value">
      ${formatCurrency(marketAvg)}
    </div>
  </div>
`;

const kpi3 = `
  <div class="kpi-box" style="
    background:${bgColor};
    border:1px solid ${borderCol};
  ">
    <div class="kpi-label">
      ${t("⚡ Performance","⚡ Performance")}
    </div>

    <div class="kpi-value" style="color:${diffColor}">
      ${isPositive ? "▲ +" : "▼ "}${diffPerc}%
    </div>

    <div style="
      font-size:12px;
      margin-top:4px;
      color:#64748b;
    ">
      ${isPositive
        ? t("Sopra la media","Above market")
        : t("Sotto la media","Below market")}
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
  <div class="kpi-label">${t("Scenario basso","Low")}</div>
  <div class="kpi-value">
    ${formatCurrency(baseRevenue * 0.8)}
  </div>
</div>

<div class="kpi-box">
  <div class="kpi-label">${t("Scenario base","Base")}</div>
  <div class="kpi-value">
    ${formatCurrency(baseRevenue)}
  </div>
</div>

<div class="kpi-box">
  <div class="kpi-label">${t("Scenario alto","High")}</div>
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
  <div class="kpi-label">${t("Base","Base")}</div>
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


// ================= SMART PAYWALL (REAL MODAL VERSION) =================

window.showUpgradePopup = function(roi){

  const access = window.getUserAccess();

  if(access.canSeeFullAnalysis || access.isInvestor){
  return;
}

  const safeROI = Number(roi || 0);

  if(safeROI <= 8) return;

  console.log("🔥 SMART PAYWALL ATTIVO:", safeROI);

  // 🔥 evita duplicati
  if(document.querySelector(".upgrade-modal")) return;

  // ================= CREA MODAL =================
  const popup = document.createElement("div");

  popup.className = "upgrade-modal";

  popup.style.position = "fixed";
  popup.style.inset = "0";
  popup.style.zIndex = "99999";
  popup.style.display = "flex";
  popup.style.alignItems = "center";
  popup.style.justifyContent = "center";

  // ================= CONTENUTO =================
  popup.innerHTML = `
    <div style="
      background:white;
      padding:30px;
      border-radius:16px;
      max-width:420px;
      width:90%;
      text-align:center;
      box-shadow:0 30px 80px rgba(0,0,0,0.25);
    ">

      <h2 style="margin-bottom:10px;">
        🔒 ${t(
          "Stai per perdere soldi",
          "You are about to lose money"
        )}
      </h2>

      <p style="font-size:14px;color:#64748b;margin-bottom:20px">
        ${t(
          "Il tuo ROI stimato è alto, ma senza analisi completa potresti sbagliare investimento.",
          "Your ROI looks high, but without full analysis you could make a wrong investment."
        )}
      </p>

      <div style="
        font-size:26px;
        font-weight:700;
        color:#10b981;
        margin-bottom:20px;
      ">
        ROI ${safeROI.toFixed(1)}%
      </div>

      <button onclick="triggerUpgradeFlow({roi:${safeROI}})" style="
        background:#10b981;
        color:white;
        border:none;
        padding:12px 18px;
        border-radius:10px;
        font-size:14px;
        cursor:pointer;
        width:100%;
        margin-bottom:10px;
      ">
        ${t(
          "Sblocca analisi completa",
          "Unlock full analysis"
        )}
      </button>

      <div id="close-modal" style="
        font-size:12px;
        color:#64748b;
        cursor:pointer;
      ">
        ${t(
          "Continua senza (rischioso)",
          "Continue anyway (risky)"
        )}
      </div>

    </div>
  `;

// 🔥 append con delay (effetto premium)
setTimeout(()=>{
  document.body.appendChild(popup);
  document.body.classList.add("modal-open");
}, 800);

// 🔥 chiusura
popup.querySelector("#close-modal").onclick = () => {
  popup.remove();
  document.body.classList.remove("modal-open");
};

}

// ================= SMART INVESTMENT ALERT =================

function renderSmartInvestmentAlert(roi){

  const access = window.getUserAccess();

  if(access.canSeeFullAnalysis || access.isInvestor){
  return;
}

  const container = document.getElementById("smart-investment-alert");
  if(!container) return;

  if(!roi || roi < 10){
    container.innerHTML = "";
    return;
  }

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

  // ✅ BUTTON DENTRO LA FUNZIONE
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

  const access = window.getUserAccess();

if(access.canSeeFullAnalysis){
  return;
}

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

console.log("PDF visibility:", window.getUserAccess());

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

function triggerSmartReminder(roi){

  const access = window.getUserAccess();

  if(access.canSeeFullAnalysis) return;

  window.reminderCount = (window.reminderCount || 0) + 1;

  // ogni 2 azioni → popup
  if(window.reminderCount % 2 !== 0) return;

  setTimeout(()=>{
    triggerUpgradeFlow({ action:"reminder", roi });
  }, 1500);
}

// ================= LEAD SCORE ENGINE =================
function getLeadScore({ roi = 0 }){

  if(roi >= 12){
    return "hot";
  }

  if(roi >= 6){
    return "warm";
  }

  return "cold";
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

// ================= GLOBAL BLUR RESET =================
function resetGlobalBlur(){

  console.log("🧹 HARD RESET UI");

// 💣 KILL TUTTO (anche smart alert)
document.querySelectorAll(`
  .smart-overlay,
  .paywall-mini
`).forEach(el => el.remove());

// 💣 svuota anche il container
const smartBox = document.getElementById("smart-investment-alert");
if(smartBox){
  smartBox.innerHTML = "";
}
  
document.querySelectorAll(".smart-overlay").forEach(el => el.remove());

  // 🔥 FIX OVERLAY BLOCCATO
document.querySelectorAll(
  ".locked-overlay, .results-overlay, .upgrade-overlay"
).forEach(el => el.remove());

// 🔥 SBLOCCA SCROLL / CLICK
document.body.classList.remove("no-scroll");
document.body.style.pointerEvents = "auto";

  document.querySelectorAll("*").forEach(el=>{

    el.classList.remove(
      "pro-blur",
      "locked",
      "locked-content",
      "premium-lock",
      "locked-section"
    );

    // 🔥 RESET FORZATO
    if(el.style){
      el.style.filter = "none";
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
      el.style.backdropFilter = "none";
    }

  });

  // 🔥 RIMUOVE OVERLAY
  document.querySelectorAll(`
    .lock-overlay,
    .paywall-mini,
    .home-blur-overlay,
    .upgrade-overlay,
    .results-overlay,
    #upgrade-overlay,
    [data-paywall]
  `).forEach(el=>{
    if(el.id !== "register-popup"){
      el.remove();
    }
  });

}

// ================= POST ANALYSIS ENGINE (SAAS CLEAN) =================

function runPostAnalysis(result, context){

  if(!result){
    console.warn("⛔ skip postAnalysis → result nullo");
    return;
  }

  const access = window.getUserAccess() || {};

  // 🔥 DEBUG INVESTOR
  if(access.isInvestor){
    console.log("🟡 INVESTOR SAFE UNLOCK");
  }

  const {
    price,
    gross,
    occupancy,
    priceNight,
    expenses
  } = context || {};

  window.simulationExecuted = true;
  window.lastAnalysisData = result;

  const roi = Number(result?.roi || 0);

  updateROIMessage(roi);

  if(roi <= 0){
    console.warn("⚠️ ROI basso → continuo render per UX");
  }

  triggerSmartReminder(roi);

  // ================= PAYWALL =================

  if(!access.canSeeFullAnalysis && !access.isInvestor && roi > 10){
  // showUpgradeModal(roi); ❌ DISABILITATO
}
  else if(access.isInvestor && roi > 0){
    console.log("🟡 INVESTOR → NO SMART OVERLAY");
    renderSmartInvestmentAlert(roi);
  }

  // ================= LEAD ENGINE =================

  if(roi <= 0){
    console.log("⛔ skip lead → ROI 0");
    return;
  }

  const userEmail = window.currentUser?.email;

  let leadScore = "cold";

  try{
    leadScore = getLeadScore({ roi });
  }catch(e){
    console.warn("LeadScore fallback:", e);
  }

  window.simulationCount = (window.simulationCount || 0) + 1;

  if(window.simulationCount > 3){
    leadScore = "hot";
  }

  const leadDestination = getLeadDestination({
    roi,
    city: window.currentCity
  });

  console.log("🎯 LEAD:", {
    roi,
    score: leadScore,
    destination: leadDestination
  });

  // ================= SAVE LEAD FIRESTORE =================

  if(userEmail && !window.leadSaved){

    window.leadSaved = true;

    addDoc(collection(db,"leads"),{
      email: userEmail,
      roi: roi,
      score: leadScore,
      value: roi,
      city: window.currentCity || "unknown",
      createdAt: serverTimestamp()
    }).catch(e=>{
      console.error("Lead error:", e);
      window.leadSaved = false;
    });

  }

  // ================= PARTNER ROUTING =================

  if(leadScore === "hot" && leadDestination){

    fetch("/api/send-lead-partner",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email: userEmail,
        city: window.currentCity,
        roi,
        score: leadScore,
        type: leadDestination.type,
        partners: leadDestination.emails
      })
    });

  }

  // ================= EMAIL USER =================

  if(userEmail && !window.emailUserSent){

    window.emailUserSent = true;

    fetch("/api/send-lead-email",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email: userEmail,
        lang: window.currentLang || "it",
        roi,
        city: window.currentCity
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

}


// ================= MORTGAGE LEAD TRIGGER =================

const mortgageBox = document.getElementById("mortgage-lead-box");
const mortgageBtn = document.getElementById("mortgage-lead-btn");

if(mortgageBox && mortgageBtn){

  if(window.lastAnalysisData?.roi > 6){

    mortgageBox.style.display = "block";

    mortgageBtn.onclick = () => {

      if(!window.firebaseReady) return;
      if(!window.isUserReady()) return;

      if(!window.currentUser){

        localStorage.setItem("lead_type", "mutuo");

        showToast(
          t(
            "Inserisci email per ricevere le migliori offerte mutuo",
            "Enter your email to receive the best mortgage offers"
          ),
          "info"
        );

        window.location.href = "/login/";
        return;
      }

      fetch("/api/send-lead-partner",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          email: window.currentUser.email,
          type:"mutuo",
          roi: window.lastAnalysisData?.roi || 0,
          city: window.currentCity
        })
      });

      showToast(
        t(
          "🏦 Richiesta inviata. Le banche ti contatteranno",
          "🏦 Request sent. Banks will contact you"
        ),
        "success"
      );

    };

  }else{
    mortgageBox.style.display = "none";
  }

}


// ================= SAFE INPUT =================

function getValue(id){

  const el = document.getElementById(id);
  if(!el) return 0;

  const v = parseFloat(el.value);
  return isNaN(v) ? 0 : v;
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

  // 🧹 CLEAN UI (evita duplicati)
document.querySelectorAll(`
  .smart-overlay,
  .upgrade-msg,
  .investor-upsell
`).forEach(el => el.remove());

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

    const userLogged = !!window.currentUser;
    let result;

const access = window.getUserAccess();

if(!userLogged){
  console.log("👻 Guest → allowed (UI already handled)");
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

console.log("📊 RESULT RAW:", result);

    // ================= VALIDAZIONE =================
   if (!result || typeof result !== "object") {
  console.error("💥 RESULT INVALID:", result);
  return;
}

    // ================= SAFE VALUES (PRIMA!) =================
    const roi = Number(result?.roi ?? result?.ROI ?? 0);

const gross = Number(
  result?.revenue ??
  result?.gross ??
  result?.fatturato ??
  0
);

const net = Number(
  result?.netAfterMortgage ??
  result?.profit ??
  result?.net ??
  result?.utile ??
  0
);

  if(!roi && !gross && !net){
  console.error("💥 RESULT EMPTY → CHECK ROI ENGINE", result);
  return;
}


    // ================= POST ANALYSIS (UNICA LOGICA BUSINESS) =================
    runPostAnalysis(result, {
      price,
      gross,
      occupancy,
      priceNight,
      expenses
    });

    // ================= SMART PAYWALL (MODAL) =================
if(!access.isInvestor){
  showUpgradePopup(roi);
}

// ================= UI BASE (FIX REAL DATA ONLY) =================

const roiEl = document.getElementById("roi-live");
const monthlyEl = document.getElementById("profit-monthly");
const annualEl = document.getElementById("profit-annual");

// 🚨 NON mostrare dati fake
if(roi <= 0){
  console.warn("⚠️ ROI 0 → continuo comunque render");
}

// ================= ROI (SMART ACCESS) =================

if(roiEl){

  roiEl.style.opacity = "0";

  setTimeout(()=>{

    // 🔴 FREE → preview (non affidabile)
    if(access.isFree){
  roiEl.innerText = "~ " + roi.toFixed(1) + "%";
  roiEl.style.color = "#f59e0b";
}
else if(access.isInvestor){
  roiEl.innerText = roi.toFixed(1) + "%";
}
else{
  roiEl.innerText = roi.toFixed(1) + "%";
}
    roiEl.style.opacity = "1";

  },150);

}
    
// =====================================
// 🔓 UNLOCK RESULTS (FINAL CORRECT)
// =====================================

console.log("🔓 UNLOCK RESULTS:", access);

const cards = document.querySelectorAll(".metric-card");

// 🟢 PRO / ADMIN → tutto sbloccato
if(access.isPro || access.isAdmin){

  cards.forEach(el => {
    el.classList.remove("pro-blur", "locked");

    const lock = el.querySelector(".lock-overlay");
    if(lock) lock.remove();
  });

  document.querySelector(".home-blur-overlay")?.remove();
}


// 🟡 INVESTOR → parziale (NO blur, blocco SOLO PRO)
else if(access.isInvestor){

  console.log("🟡 INVESTOR → PARTIAL UNLOCK");

  cards.forEach(el => {

    // rimuove blur globale
    el.classList.remove("pro-blur");

    // blocca solo contenuti PRO
    if(el.classList.contains("pro-only")){

      el.classList.add("locked");

      // crea overlay solo se non esiste
      if(!el.querySelector(".lock-overlay")){
        el.insertAdjacentHTML("beforeend", `
          <div class="lock-overlay">
            🔒 PRO
          </div>
        `);
      }

    } else {

      // sicurezza: sblocca eventuali lock residui
      el.classList.remove("locked");

      const lock = el.querySelector(".lock-overlay");
      if(lock) lock.remove();
    }

  });

  // overlay home attenuato (non bloccante)
  const overlay = document.querySelector(".home-blur-overlay");

  if(overlay){
    overlay.style.opacity = "0.1";
    overlay.style.pointerEvents = "none";
  }

}


// 🔴 FREE → tutto bloccato
else{

  console.log("🔴 FREE → FULL LOCK");

  cards.forEach(el => {

    el.classList.add("pro-blur", "locked");

    if(!el.querySelector(".lock-overlay")){
      el.insertAdjacentHTML("beforeend", `
        <div class="lock-overlay">
          🔒 Sblocca
        </div>
      `);
    }

  });

}
    // ================= HIDDEN DATA MESSAGE =================

const hiddenBox = document.getElementById("hidden-roi-msg");

if(hiddenBox){

  if(access.isFree){

    hiddenBox.innerHTML = `
  <div style="
    margin-top:12px;
    padding:14px;
    border-radius:10px;
    background:#fff7ed;
    color:#9a3412;
    font-size:13px;
    text-align:center;
  ">
    ⚠️ ${t(
      "Questo ROI NON include rischio reale, mutuo e stagionalità",
      "This ROI does NOT include real risk, mortgage and seasonality"
    )}
    <br>
    <strong>
    ${t(
      "👉 Potresti perdere soldi senza questa analisi",
      "👉 You could lose money without this analysis"
    )}
    </strong>
  </div>
`;
  }else{
    hiddenBox.innerHTML = "";
  }

}

// ================= PROFITTI (SMART LOCK) =================

if(monthlyEl && annualEl){

  // 🔴 FREE → bloccato
  if(access.isFree){
    monthlyEl.innerText = t(
      "🔒 Disponibile nella versione completa",
      "🔒 Available in full version"
    );
    annualEl.innerText = "—";
  }

  // 🟡 INVESTOR → dati reali (ma già limitati altrove)
  else if(access.isInvestor){
    const safeNet = Math.max(0, net);

    monthlyEl.innerText = formatCurrency(safeNet / 12);
    annualEl.innerText = formatCurrency(safeNet);
  }

  // 🟢 PRO / ADMIN
  else{
    const safeNet = Math.max(0, net);

    monthlyEl.innerText = formatCurrency(safeNet / 12);
    annualEl.innerText = formatCurrency(safeNet);
  }

}

    // ================= MARKET =================
    if(typeof renderMarketBenchmark === "function"){
      renderMarketBenchmark(window.currentCity || "napoli");
    }

  // ================= RENDER COMPLETO TOOL (SMART ACCESS CONTROL) =================

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

// ================= SCORE =================
const riskScore = roi > 12 ? 30 : roi > 6 ? 55 : 75;

if(typeof renderInvestmentScore === "function"){
  renderInvestmentScore(roi, riskScore);
}

// ================= SCORE CERCHIO =================
const investmentScore = Math.min(100, Math.round(roi * 3));

if(typeof window.updateInvestmentScore === "function"){
  window.updateInvestmentScore(investmentScore);
}

// ======================================================
// 🔴 FREE → BLOCCO INTELLIGENTE (CONVERSION MODE)
// ======================================================

if(access.isFree && !access.isInvestor){

  console.log("🔒 FREE → LIMITED DATA");

  const lockedSections = [
    "investment-ranking",
    "investment-risk-meter",
    "investment-verdict",
    "ai-insights"
  ];

  lockedSections.forEach(id => {

    const el = document.getElementById(id);
    if(!el) return;

    // 🔥 NON distruggiamo il contenuto → applichiamo overlay sopra
    el.style.position = "relative";

    // 🔥 evita duplicati
    if(el.querySelector(".lock-overlay")) return;

    const overlay = document.createElement("div");
    overlay.className = "lock-overlay";

    overlay.style = `
      position:absolute;
      inset:0;
      background:rgba(255,247,237,0.92);
      backdrop-filter:blur(6px);
      border-radius:12px;

      display:flex;
      align-items:center;
      justify-content:center;
      text-align:center;

      z-index:10;
      cursor:pointer;
    `;

    overlay.innerHTML = `
      <div style="
        padding:18px;
        max-width:260px;
      ">

        <div style="
          font-weight:700;
          margin-bottom:8px;
          color:#9a3412;
        ">
          🔒 ${t(
            "Stai prendendo una decisione senza dati reali",
            "You are making a decision without real data"
          )}
        </div>

        <div style="
          font-size:12px;
          margin-bottom:12px;
          color:#7c2d12;
        ">
          ${t(
            "Il 72% degli investitori perde soldi proprio qui",
            "72% of investors lose money right here"
          )}
        </div>

        <div style="
          background:#10b981;
          color:white;
          padding:8px 12px;
          border-radius:8px;
          font-size:12px;
          font-weight:600;
          display:inline-block;
        ">
          ${t(
            "Scopri se stai perdendo soldi",
            "Find out if you're losing money"
          )}
        </div>

      </div>
    `;

    // 🔥 CLICK → funnel
    overlay.onclick = () => {
      triggerUpgradeFlow({ roi });
    };

    el.appendChild(overlay);

  });

}

// ======================================================
// 🟡 INVESTOR → PARZIALE (VALORE + UPSELL)
// ======================================================

else if(access.isInvestor){

  console.log("🟡 INVESTOR → PARTIAL DATA");

  if(typeof renderInvestmentRanking === "function"){
    renderInvestmentRanking(roi);
  }

  if(typeof renderRiskMeter === "function"){
    renderRiskMeter(riskScore);
  }

  if(typeof renderInvestmentVerdict === "function"){
    const payback = net > 0 ? (price / net) : 0;
    renderInvestmentVerdict(roi, payback);
  }

  // 🔒 AI insights limitati
  const aiBox = document.getElementById("ai-insights");

  if(aiBox){
    aiBox.innerHTML = `
      <div style="
        padding:14px;
        border-radius:10px;
        background:#ecfdf5;
        text-align:center;
        font-size:13px;
        color:#065f46;
        border:1px solid #10b981;
      ">
        🔒 ${t(
          "Stai vedendo solo una parte dell’analisi",
          "You are seeing only part of the analysis"
        )}
        <br>
        <span style="font-size:12px;opacity:.8;">
          ${t(
            "Sblocca AI insights avanzati con PRO",
            "Unlock advanced AI insights with PRO"
          )}
        </span>
      </div>
    `;
  }

}

// ======================================================
// 🟢 PRO / ADMIN → FULL
// ======================================================

else{

  console.log("🟢 PRO → FULL DATA");

  if(typeof renderInvestmentRanking === "function"){
    renderInvestmentRanking(roi);
  }

  if(typeof renderRiskMeter === "function"){
    renderRiskMeter(riskScore);
  }

  if(typeof renderInvestmentVerdict === "function"){
    const payback = net > 0 ? (price / net) : 0;
    renderInvestmentVerdict(roi, payback);
  }

  if(typeof generateInsights === "function" && typeof renderInsights === "function"){
    const insights = generateInsights({
      roi,
      occupancy,
      priceNight,
      expenses
    });
    renderInsights(insights);
  }

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
  profitHome.innerText =
    (access.canSeeFullAnalysis || access.isInvestor)
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

  if(window.renderingChart) return;
  window.renderingChart = true;

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

  // 🔥 DESTROY PRECEDENTE
  if(window.roiChartInstance){
    window.roiChartInstance.destroy();
    window.roiChartInstance = null;
  }

  // ================= DATA =================
  const years = Array.from({length:10}, (_,i)=>i+1);

  const conservative = years.map(y => net * y * 0.8);
  const base = years.map(y => net * y);
  const optimistic = years.map(y => net * y * 1.2);

  // ================= CHART =================
  window.roiChartInstance = new Chart(ctx,{
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
          position:"bottom",
          labels:{
            font:{ size:12 },
            color:"#334155"
          }
        },
        tooltip:{
          callbacks:{
            label:(ctx)=>{
              return `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`;
            }
          }
        }
      },
      scales:{
        y:{
          ticks:{
            callback:(v)=> formatCurrency(v)
          }
        }
      }
    }
  });

  console.log("✅ ROI chart renderizzato");

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

  // ================= INIT BASE =================
  renderCityROIChart();

  // ================= FIX CTA =================
  document.querySelectorAll(".btn-main").forEach(btn => {

    btn.addEventListener("click", () => {

      if(btn.dataset.clicked) return;

      btn.dataset.clicked = "true";

      setTimeout(()=>{
        btn.dataset.clicked = "";
      }, 2000);

    });

  });

});

// =====================================
// 🔥 HOME OVERLAY CONTROL (FINAL FIX)
// =====================================

document.addEventListener("rb_plan_loaded", () => {

  const access = window.getUserAccess?.();
  const overlay = document.querySelector(".home-blur-overlay");

  if(!overlay || !access) return;

  console.log("🎯 OVERLAY CHECK:", access);

  // ================= CTA =================
  const buttons = overlay.querySelectorAll("button");

  buttons.forEach(btn => {
    btn.onclick = () => {
      console.log("🔥 CLICK OVERLAY CTA");
      triggerUpgradeFlow({ source:"home_overlay" });
    };
  });

  // ================= 🟢 PRO / ADMIN =================
  if(access.isPro || access.isAdmin){
    overlay.remove();
    return;
  }

  // ================= 🟡 INVESTOR =================
  if(access.isInvestor){

    overlay.style.background = "rgba(255,255,255,0.85)";

    const title = overlay.querySelector(".overlay-title");
    const text  = overlay.querySelector(".overlay-text");

    if(title){
      title.innerText = "🚀 Sblocca il vero potenziale";
    }

    if(text){
      text.innerText = "Stai usando solo il 30% delle capacità";
    }

    return;
  }

  // ================= 🔴 FREE =================
  if(access.isFree){

    console.log("🔒 HOME OVERLAY FREE ACTIVE");

    document.querySelectorAll(".metric-card").forEach(el=>{
      el.classList.add("pro-blur");
    });

  }

});
// ================= EXECUTIVE PDF – FINAL PRODUCTION =================

window.generateExecutivePDF = async function(){

const access = window.getUserAccess();
console.log("📄 PDF ACCESS:", access);  

// 🟡 INVESTOR → UPSELL PRO
if(access.isInvestor){
  openUpgradeModal("pro");
  return;
}

// 🔴 FREE → UPSELL INVESTOR
if(access.isFree){
  openUpgradeModal("investor");
  return;
}

const lang = window.RB_LANG?.current || window.currentLang || "it";
const tSafe = (it,en)=> lang==="it"?it:en;

// 🔒 CHECK
if(!access.canSeeFullAnalysis){
  openUpgradeModal("pro");
  return;
}

if(!window.lastAnalysisData){
  showToast(
  tSafe("Genera prima l'analisi","Run analysis first"),
  "warning"
);
  return;
}

if(!window.jspdf){
  showToast(
  tSafe("Errore generazione PDF","PDF engine not loaded"),
  "error"
);
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

// ================= LOGO LOAD =================
let logoBase64 = null;

try{
  const res = await fetch("/img/logo-main.png");
  const blob = await res.blob();
  const reader = new FileReader();
  logoBase64 = await new Promise(resolve=>{
    reader.onloadend = ()=> resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}catch(e){
  console.warn("Logo load error", e);
}

// ================= FOOTER =================
const addFooter = () => {
  doc.setDrawColor(220);
  doc.line(20, 270, 190, 270);

  doc.setFontSize(8);
  doc.setTextColor(120);

  doc.text("RendimentoBB ©", 20, 278);
  doc.text("Confidential", 160, 278);
};

// ================= PAGE 1 =================
let y = 20;

// HEADER
doc.setFillColor(15,23,42);
doc.rect(0,0,210,30,"F");

// LOGO
if(logoBase64){

  // BOX bianco sotto logo
  doc.setFillColor(255,255,255);
  doc.roundedRect(18, 6, 34, 16, 3,3,"F");

  // LOGO sopra
  doc.addImage(logoBase64, "PNG", 20, 8, 30, 12);
}

// TITLE
doc.setTextColor(255);
doc.setFontSize(12);
doc.text(
  tSafe("Report di investimento","Investment Intelligence Report"),
  60,
  18
);

// KPI HERO
y = 45;

doc.setFillColor(16,185,129);
doc.roundedRect(20,y,170,28,6,6,"F");

doc.setTextColor(255);
doc.setFontSize(10);
doc.text("ROI", 25, y+10);

doc.setFontSize(24);
doc.text(pct(roi), 25, y+22);

let badge = roi > 12 ? "HIGH PERFORMANCE" : roi > 6 ? "BALANCED" : "RISKY";
doc.setFontSize(10);
doc.text(badge, 140, y+22);

y += 40;

// SUMMARY
doc.setTextColor(0);
doc.setFontSize(13);
doc.text(tSafe("Sintesi investimento","Executive Summary"), 20, y);

y += 8;

doc.setFontSize(10);

let summary = roi > 12
? "High-performing investment above market average."
: roi > 6
? "Balanced investment with solid ROI."
: "Risky investment with low return.";

doc.text(summary, 20, y, { maxWidth: 170 });

y += 14;

// STRUCTURE
doc.setFontSize(13);
doc.text(tSafe("Struttura investimento","Investment Structure"), 20, y);

y += 8;

doc.setFontSize(10);
doc.text("Property price: " + eur(price), 20, y); y+=6;
doc.text("Equity: " + eur(equity), 20, y); y+=6;
doc.text("Loan: " + eur(loan), 20, y); y+=6;

const ltv = price > 0 ? ((loan/price)*100).toFixed(0) : 0;
doc.text("LTV: " + ltv + "%", 20, y);

y += 20;

// KPI BOX
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

addFooter();

// ================= PAGE 2 – CHART =================
doc.addPage();

// titolo
doc.setFontSize(16);
doc.setTextColor(0);
doc.text("Performance Forecast", 20, 25);

// CHART FIX DEFINITIVO
const chartCanvas = document.getElementById("roiChart");

if(chartCanvas){
  try{

    await new Promise(r => setTimeout(r, 600));

    const imgData = chartCanvas.toDataURL("image/png", 1.0);

    const pageWidth = 210;
    const margin = 20;
    const usableWidth = pageWidth - (margin * 2);

    const ratio = chartCanvas.height / chartCanvas.width;

    const width = usableWidth;
    const height = width * ratio;

    const startY = 40;

    // BOX elegante
    doc.setDrawColor(220);
    doc.roundedRect(15, startY-5, 180, height + 10, 6,6);

    // IMG
    doc.addImage(imgData, "PNG", margin, startY, width, height);

  }catch(e){
    console.warn("Chart error:", e);
  }
}

addFooter();

// ================= PAGE 3 – SCORE =================
doc.addPage();

y = 40;

doc.setFontSize(16);
doc.text("Investment Score", 20, y);

y += 20;

let score = Math.min(100, Math.round(roi * 3));

doc.setFontSize(42);
doc.text(score + "/100", 20, y);

y += 20;

doc.setFontSize(12);

let rating = score > 75
? "Excellent Investment"
: score > 55
? "Moderate Opportunity"
: "High Risk";

doc.text("Rating: " + rating, 20, y);

y += 15;

doc.setFontSize(12);
doc.text("Strategic Insight", 20, y);

y += 8;

doc.setFontSize(10);

const strategy = score > 70
  ? "Aggressive expansion recommended."
  : "Optimize pricing and occupancy.";

doc.text(strategy, 20, y, { maxWidth: 170 });

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

// ================= STRIPE SUBSCRIPTION =================

window.buyPlan = async function(plan){

  const user = window.currentUser;

  if(!user){
    showRegisterPopup();
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
// 🔥 WAIT FIREBASE READY (CRITICO)
// ===============================================

function waitForFirebaseReady(callback){

  let attempts = 0;

  const interval = setInterval(()=>{

    attempts++;

    if(window.firebaseReady && window.currentPlan){

      clearInterval(interval);

      console.log("✅ FIREBASE READY:", {
        user: window.currentUser,
        plan: window.currentPlan
      });

      callback();
    }

    if(attempts > 50){
      clearInterval(interval);
      console.warn("⚠️ Firebase timeout → continuo comunque");
      callback();
    }

  }, 100);

}


// ===============================================
// 🚀 APP INIT CORRETTO (DOPO FIREBASE)
// ===============================================

document.addEventListener("DOMContentLoaded", () => {

  console.log("🚀 App init (WAIT FIREBASE)");

  document.body.classList.add("app-loading");

  waitForFirebaseReady(() => {

    console.log("🔥 APP START REALE");

    const access = window.getUserAccess?.();

    console.log("🔐 ACCESS:", access);

    // ================= RESET CLASSI =================
    document.body.classList.remove(
      "is-free",
      "is-investor",
      "is-pro",
      "is-admin"
    );

    if(access.isAdmin){
      document.body.classList.add("is-admin");
    }
    else if(access.isPro){
      document.body.classList.add("is-pro");
    }
    else if(access.isInvestor){
      document.body.classList.add("is-investor");
    }
    else{
      document.body.classList.add("is-free");
    }

    if(access.isPro || access.isAdmin){
  unlockProUI();
  forceUnlockUI();
}

if(access.isInvestor){
  console.log("🟡 INVESTOR → INIT CLEAN (NO FORCE UNLOCK)");

  // 🔥 SOLO rimuove overlay base
  unlockBaseUI();
}

    // ================= TOOL SYNC =================
    applySelectedMortgage();

    if(typeof checkMortgageRateUpdate === "function"){
      checkMortgageRateUpdate();
    }

    if(typeof handleAutoCityRedirect === "function"){
      handleAutoCityRedirect();
    }

    document.body.classList.remove("app-loading");
    document.body.classList.add("app-ready");

  });

});


// ===============================================
// 🔥 AUTO STRIPE DOPO LOGIN
// ===============================================

document.addEventListener("rb_auth_ready", () => {

  const pendingPlan = localStorage.getItem("pending_plan");

  if(pendingPlan && window.currentUser){

    console.log("🔥 AUTO START STRIPE:", pendingPlan);

    localStorage.removeItem("pending_plan");

    setTimeout(()=>{

      if(typeof window.buyPlan === "function"){
        window.buyPlan(pendingPlan);
      }else{
        console.error("❌ buyPlan non trovata");

        showToast(
          t("Errore sistema pagamento","Payment system error"),
          "error"
        );
      }

    }, 500);
  }

});

  // ===============================
  // 🔥 CASO 1 → CALCOLO MAI PARTITO
  // ===============================

  if(window.pendingCalculation && typeof window.calculate === "function"){

    console.log("🚀 RUN pending calculation");

    window.pendingCalculation = false;

    setTimeout(()=>{
      window.calculate(true);
    },50);

  }

  // ===============================
  // 🔥 CASO 2 → RESYNC PRO
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

  // ===============================
  // 🔥 DEBUG
  // ===============================

  if(window.firebaseReady){
  console.log(
    "👤 USER:",
    window.currentUser ? "LOGGED" : "GUEST",
    "| PLAN:",
    window.currentPlan
  );
}


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

const citySelectorEl = document.getElementById("market-city");

if(citySelectorEl){

  citySelectorEl.addEventListener("change",()=>{

    const city = citySelectorEl.value;

    window.currentCity = city;
    localStorage.setItem("selected_city", city);

    applyCityBackground(city);

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
    applyCityBackground(selectedCity);
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

  if(!access.canSeeFullAnalysis){
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

// ================= FIX CTA DUPLICATE =================
document.addEventListener("DOMContentLoaded", () => {

  const ctas = document.querySelectorAll(".btn-secondary");

  let found = 0;

  ctas.forEach(btn => {

    if(btn.innerText.includes("Scopri") || btn.innerText.includes("Find out")){

      found++;

      if(found > 1){
        
      }

    }

  });

});

document.addEventListener("DOMContentLoaded", () => {

  // 🔥 PRO BUTTON
  const proBtn = document.querySelector(".plan-pro .btn-main");

  if(proBtn){
    proBtn.onclick = () => {
      console.log("🔥 CLICK PRO");
      startPlanPurchase("pro");
    };
  }

  // 🔥 INVESTOR BUTTON
  const investorBtn = document.querySelector(".plan-investor .btn-main");

  if(investorBtn){
    investorBtn.onclick = () => {
      console.log("🔥 CLICK INVESTOR");
      startPlanPurchase("investor");
    };
  }

  // 🔥 YEARLY BUTTON
  const yearlyBtn = document.querySelector(".plan-annual .btn-main");

  if(yearlyBtn){
    yearlyBtn.onclick = () => {
      console.log("🔥 CLICK YEARLY");
      startPlanPurchase("pro_yearly");
    };
  }

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
    .smart-overlay,
    #upgrade-overlay,
    #upgrade-modal,
    [data-paywall]
  `).forEach(el => {

    if(el.id === "register-popup") return;

    el.remove();

  });

}

// 🔥 ESECUZIONE FORZATA CONTINUA
// esegui solo quando serve
// document.addEventListener("rb_plan_loaded", removeGhostOverlays);
// document.addEventListener("rb_auth_ready", removeGhostOverlays);

// ================= PLAN LOADED HANDLER CLEAN =================
document.addEventListener("rb_plan_loaded", () => {

  if(window.__planAlreadyApplied) return;
  window.__planAlreadyApplied = true;

  console.log("🚀 PLAN LOADED → FULL SYNC");

  document.body.classList.remove("app-loading");
  document.body.style.visibility = "visible";

  const access = window.getUserAccess();

  if(!access){
    console.warn("⛔ ACCESS NON DISPONIBILE");
    return;
  }

  // ================= DEBUG CORRETTO =================
  if(access.isFree){
    console.log("🔒 FREE USER");
  }
  else if(access.isInvestor){
    console.log("🟡 INVESTOR USER");
  }
  else if(access.isPro){
    console.log("🟢 PRO USER");
  }
  else if(access.isAdmin){
    console.log("👑 ADMIN USER");
  }

  console.log("🎯 ACCESS FINAL:", access);

// 🔥 FIX OVERLAY HOME INVESTOR (CRITICO)
if(access.isInvestor){

  console.log("🟡 FIX HOME OVERLAY INVESTOR");

  document.querySelectorAll(".home-blur-overlay").forEach(el=>{
    el.style.display = "none";
  });

}

  // ================= RESET UI =================
  removeGhostOverlays?.();
  unlockBaseUI();

  document.body.classList.remove(
    "is-free",
    "is-investor",
    "is-pro",
    "is-admin"
  );

  // ================= SET CLASSE =================
  if(access.isAdmin){
    document.body.classList.add("is-admin");
  }
  else if(access.isPro){
    document.body.classList.add("is-pro");
  }
  else if(access.isInvestor){
    document.body.classList.add("is-investor");
  }
  else{
    document.body.classList.add("is-free");
  }

  // ================= UNLOCK =================
  if(access.isPro || access.isAdmin){
  unlockProUI();
  forceUnlockUI();
}

if(access.isInvestor){
  console.log("🟡 INVESTOR → SKIP SECOND UNLOCK");
}

});

  // ================= OPTIONAL FIX =================
  if(!window.planCorrected){

    window.planCorrected = true;

    setTimeout(()=>{
      if(typeof window.forceCorrectPlan === "function"){
        // window.forceCorrectPlan();
      }
    },100);

  }
// ================= REGISTER POPUP (FINAL FIX) =================

window.showRegisterPopup = function(){

  const t = (it, en) =>
    (window.currentLang === "en" ? en : it);

  if(document.getElementById("register-popup")) return;

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

let scrollTriggered = false;

window.addEventListener("scroll", () => {

  if(scrollTriggered) return;

  if(window.scrollY > 800){

    scrollTriggered = true;

    triggerUpgradeFlow({ action:"scroll" });

  }

});

// ================= START PLAN PURCHASE (FINAL FUNNEL) =================

window.startPlanPurchase = function(plan){

  console.log("🚀 CLICK PLAN:", plan);

  const t = (it, en) =>
    (window.currentLang === "en" ? en : it);

  const user = window.currentUser;

  // 👻 GUEST → REGISTER
  if(!user){
    localStorage.setItem("pending_plan", plan);
    showRegisterPopup();
    return;
  }

  if(!plan){
    console.error("❌ Piano non valido");
    showToast(t("Errore piano","Invalid plan"),"error");
    return;
  }

  const access = window.getUserAccess();

  // già attivo
  if(
    (plan === "pro" && access.isPro) ||
    (plan === "investor" && access.isInvestor)
  ){
    showToast(
      t("Hai già questo piano attivo","You already have this plan"),
      "info"
    );
    return;
  }

  // gerarchia
  if(plan === "investor" && access.isPro){
    showToast(
      t("Hai già un piano superiore","You already have a higher plan"),
      "info"
    );
    return;
  }

  if(!window.firebaseReady){
    showToast(
      t("Attendi un secondo...","Wait a moment..."),
      "info"
    );
    return;
  }

  if(typeof window.buyPlan === "function"){
    window.buyPlan(plan);
  }else{
    console.error("❌ buyPlan non trovata");
    showToast(t("Errore pagamento","Payment error"),"error");
  }

};


// =============================
// 🔥 FORCE PLAN FALLBACK
// =============================

window.forceCorrectPlan = function(){

  const plan = window.currentPlan || "free";

  document.body.classList.remove(
    "is-free",
    "is-investor",
    "is-pro",
    "is-admin"
  );

  if(plan === "pro" || plan === "pro_yearly"){
    document.body.classList.add("is-pro");
  } 
  else if(plan === "investor"){
    document.body.classList.add("is-investor");
  } 
  else {
    document.body.classList.add("is-free");
  }

};


// =============================
// 🔥 BASE UI UNLOCK (CRITICO)
// =============================

function unlockBaseUI(){

  console.log("🧹 BASE UI UNLOCK");

  document.querySelectorAll(`
    .home-blur-overlay,
    .results-overlay,
    .upgrade-overlay
  `).forEach(el => el.remove());

  document.body.classList.remove("no-scroll");
  document.body.style.pointerEvents = "auto";

}


// =============================
// 🔥 FORCE UNLOCK UI (FINAL FIX REALE)
// =============================

function forceUnlockUI(){

  const access = window.getUserAccess?.() || {};

  console.log("🔥 FORCE UNLOCK UI SAFE:", access);

  // =========================
  // 🟢 PRO / ADMIN → FULL UNLOCK
  // =========================
  if(access.isPro || access.isAdmin){

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

    document.querySelectorAll(`
      .home-blur-overlay,
      .results-overlay,
      .upgrade-overlay,
      .lock-overlay,
      .smart-overlay,
      .paywall-mini,
      [data-paywall]
    `).forEach(el => {

      if(el.id === "register-popup") return;
      el.remove();

    });

  }

  // 🟡 INVESTOR → PARTIAL UNLOCK (FIX DEFINITIVO)
// 🟡 INVESTOR → NON GESTITO QUI
else if(access.isInvestor){

  console.log("🛑 SKIP forceUnlockUI for INVESTOR");

  return;
}

    if(!el.querySelector(".lock-overlay")){
      el.insertAdjacentHTML("beforeend", `
        <div class="lock-overlay">
          🔒 PRO
        </div>
      `);
    }

  });

}

  // =========================
  // 🔴 FREE → LOCK NORMALE
  // =========================
  else{

    console.log("🔴 FREE → no unlock");

    document.querySelectorAll(".pro-only").forEach(el => {
      el.classList.add("pro-blur");
    });

  }

}
