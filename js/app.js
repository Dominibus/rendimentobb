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

// ================= FUNNEL STATE =================
window.funnelState = {
  shown: false,
  lastTrigger: null,
  counter: 0
};

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

// ================= GLOBAL TRANSLATION (UNIFICATO) =================
window.t = window.t || function(it, en){
  return window.currentLang === "en" ? en : it;
};
window.formatCurrency = window.formatCurrency || function(v){
  const n = Number(v);
  return isNaN(n) ? "€0" : "€" + n.toLocaleString("it-IT");
};

// =====================================
// 🌍 CITY DATASET (SMART SEARCH CORE)
// =====================================

window.RB_CITY_DATA = [
  {name:"roma", label:{it:"Roma", en:"Rome"}, roi:"12.8%"},
  {name:"milano", label:{it:"Milano", en:"Milan"}, roi:"11.2%"},
  {name:"napoli", label:{it:"Napoli", en:"Naples"}, roi:"14.5%"},
  {name:"firenze", label:{it:"Firenze", en:"Florence"}, roi:"10.9%"},
  {name:"torino", label:{it:"Torino", en:"Turin"}, roi:"9.6%"},
  {name:"bologna", label:{it:"Bologna", en:"Bologna"}, roi:"10.4%"},
  {name:"venezia", label:{it:"Venezia", en:"Venice"}, roi:"13.2%"},
  {name:"verona", label:{it:"Verona", en:"Verona"}, roi:"11.1%"},
  {name:"palermo", label:{it:"Palermo", en:"Palermo"}, roi:"15.3%"},
  {name:"bari", label:{it:"Bari", en:"Bari"}, roi:"12.1%"}
];

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

window.rbAlert = function(msg){

  console.warn("🚫 ALERT BLOCCATO:", msg);

  console.trace("📍 ALERT SOURCE");

  if(typeof showToast === "function"){
    showToast(msg, "warning");
  }

};

// =====================================
// 💣 GLOBAL MODAL FIX (CRITICO)
// =====================================

window.forceCloseAllModals = function(){

  console.log("🧹 FORCE CLOSE MODALS");

  // rimuove stato globale
  document.body.classList.remove("modal-open");

  // chiude tutti i modal possibili
  document.querySelectorAll(`
    #rb-upgrade-modal,
    #rb-pro-modal,
    .upgrade-modal
  `).forEach(modal => {
    modal.remove();
  });

};

// 🔥 AUTO FIX CONTINUO
let modalGuard = setInterval(() => {

  if(!document.body.classList.contains("modal-open")) return;

  const modalOpen =
    document.querySelector("#rb-upgrade-modal") ||
    document.querySelector(".upgrade-modal");

  if(!modalOpen){
    document.body.classList.remove("modal-open");
  }

}, 800);

// 🔥 STOP dopo 10s
setTimeout(()=>{
  clearInterval(modalGuard);
},10000);

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
  const monthly = Math.max(
  0,
  Math.round(net / 12)
);

  if(qrMonth) qrMonth.innerText = formatCurrency(monthly);
  if(elMonthly) elMonthly.innerText = formatCurrency(monthly);

  // ===== BREAK EVEN =====
  let payback = net > 0
  ? (investment / net)
  : 0;

// 🔥 SAFE BANKING
if(payback > 0 && payback < 1){
  payback = 1;
}

const paybackText =
  payback > 0
    ? payback.toFixed(1) + " anni"
    : "-";

  if(qrBreak) qrBreak.innerText = paybackText;
  if(elBreak) elBreak.innerText = paybackText;

  // ===== REVENUE =====
  if(qrRev) qrRev.innerText = formatCurrency(revenue);
  if(elRevenue) elRevenue.innerText = formatCurrency(revenue);

 // ================= ACCESS CONTROL (SAFE FINAL FIX) =================

const access = window.getUserAccess?.() || {};

// ⛔ evita falso FREE durante bootstrap Firebase
if(!window.currentPlan){

  console.log("⏳ plan non pronto → skip KPI lock");

}else{

  // =====================================
// 🔓 PRO / ADMIN → FULL ACCESS
// =====================================

if(
  access.isPro ||
  access.isAdmin
){

  console.log("✅ PRO USER → SKIP RESET");

  [
    qrProfit, elAnnual,
    qrMonth, elMonthly,
    qrBreak, elBreak,
    qrRev, elRevenue
  ].forEach(el=>{

    if(!el) return;

    // 🔥 restore valore reale
    if(el.dataset.realValue){
      el.innerText = el.dataset.realValue;
    }

    // 🔥 reset completo blur
    el.style.filter = "none";
    el.style.webkitFilter = "none";
    el.style.backdropFilter = "none";
    el.style.opacity = "1";
    el.style.visibility = "visible";
    el.style.pointerEvents = "auto";
    el.style.color = "#0f172a";
    el.style.textShadow = "none";

    el.classList.remove(
      "pro-blur",
      "blur-content",
      "locked",
      "locked-content",
      "premium-lock"
    );

  });

}

// =====================================
// 🟡 INVESTOR → PARTIAL ACCESS
// =====================================

else if(access.isInvestor){

  console.log("🟡 INVESTOR PARTIAL ACCESS");

  [
    qrProfit, elAnnual,
    qrMonth, elMonthly,
    qrBreak, elBreak,
    qrRev, elRevenue
  ].forEach(el=>{

    if(!el) return;

    // 🔥 salva valore reale
    if(
      el.innerText &&
      el.innerText !== "—"
    ){
      el.dataset.realValue = el.innerText;
    }

    // 🔥 investor vede KPI
    el.style.filter = "none";
    el.style.webkitFilter = "none";
    el.style.opacity = "1";

    el.classList.remove(
      "locked",
      "premium-lock"
    );

  });

}

// =====================================
// 🔒 FREE USERS ONLY
// =====================================

else if(access.isFree){

  console.log("🔒 KPI HARD LOCK (FREE)");

  [
    qrProfit, elAnnual,
    qrMonth, elMonthly,
    qrBreak, elBreak,
    qrRev, elRevenue
  ].forEach(el=>{

    if(!el) return;

    // 🔥 salva valore reale
    if(
      el.innerText &&
      el.innerText !== "—"
    ){
      el.dataset.realValue = el.innerText;
    }

    el.innerText = "—";

    el.style.filter = "blur(6px)";
    el.style.webkitFilter = "blur(6px)";
    el.style.opacity = "0.4";

    el.classList.remove(
      "pro-blur",
      "blur-content"
    );

  });

}
// =====================================
// ⛔ ACCESS DEBUG
// =====================================

if(!access){
  console.warn("⛔ access non disponibile");
  // ❌ NON bloccare render
}

// =====================================
// 🟡 INVESTOR → teaser intelligente
// =====================================

if(access.isInvestor){

  const verdict = document.getElementById("investment-verdict");

  if(
    verdict &&
    !verdict.querySelector(".investor-upsell")
  ){

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

}  

// ================= ROI MESSAGE (HOME) =================

function updateROIMessage(roi){

  const msg = document.getElementById("hidden-roi-msg");
  if(!msg) return;

  let text = "";
  let color = "#64748b";

  if(roi > 12){
    text = t(
      "🔥 Investimento sopra la media",
      "🔥 Above average investment"
    );
    color = "#10b981"; // green SaaS
  }
  else if(roi > 6){
    text = t(
      "👍 Investimento nella media",
      "👍 Average investment"
    );
    color = "#f59e0b"; // amber SaaS
  }
  else{
    text = t(
      "⚠️ Rendimento basso",
      "⚠️ Low return"
    );
    color = "#ef4444"; // red SaaS
  }

  msg.innerHTML = text;

  // 🔥 UX PRO
  msg.style.display = "block";
  msg.style.opacity = "0";
  msg.style.transform = "translateY(6px)";
  msg.style.color = color;

  setTimeout(()=>{
    msg.style.transition = "all .3s ease";
    msg.style.opacity = "1";
    msg.style.transform = "translateY(0)";
  }, 50);

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

// ================= SAVE ANALYSIS =================

async function saveAnalysis(data){

  if(window.__savingAnalysis){
  console.log("⛔ SAVE BLOCCATO");
  return;
}

window.__savingAnalysis = true;

  if(!window.firebaseReady){
    console.log("⏳ Firebase non pronto");
    return;
  }

  if(!window.currentUser || !window.currentUser.uid){
    console.log("❌ Utente non loggato");
    return;
  }

  try{

    const safeMarketCity =
  data.marketCity ||
  window.currentCity ||
  sessionStorage.getItem("tool_city") ||
  localStorage.getItem("selected_city") ||
  "roma";

const safeRealCity =
  data.realCity ||
  data.city ||
  document.getElementById("custom-location")?.value?.trim() ||
  safeMarketCity;

await addDoc(collection(db,"analyses"),{

  uid: window.currentUser.uid,

  propertyPrice:
    data.propertyPrice ?? 0,

  equity:
    data.equity ?? 0,

  gross:
    data.gross ?? 0,

  expenses:
    data.expenses ?? 0,

  roi:
    data.roi ?? 0,

  visualROI:
    data.visualROI ?? 0,

  net:
    data.net ?? 0,

  risk:
    data.risk ?? 0,

    occupancy:
    data.occupancy ?? 0,

  investmentScore:
    data.investmentScore ?? 0,

  verdict:
    data.verdict ?? null,

  marketCity:
    safeMarketCity,

  realCity:
    safeRealCity,

  createdAt:
    serverTimestamp(),

  createdAtClient:
    new Date()

});

    console.log("✅ SALVATO FIRESTORE");

// 🔄 dashboard live refresh
window.dispatchEvent(
  new Event("analysisSaved")
);

console.log("💾 SAVE ANALYSIS CALLED");

    window.__savingAnalysis = false;

  }catch(e){

    window.__savingAnalysis = false;
    
    console.error("Errore salvataggio:", e);
  
  }

}

// =====================================
// 🔒 LOCK OVERLAY – SAAS CLEAN VERSION
// =====================================
function createLockOverlay(el, {
  message = "",
  cta = "",
  plan = "pro"
} = {}){

  if(!el || el.querySelector(".lock-overlay")) return;

  el.style.position = "relative";

  const overlay = document.createElement("div");
  overlay.className = "lock-overlay";

  overlay.style = `
    position:absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    max-height:100%;
    overflow:hidden;
    background:rgba(255,255,255,0.92);
    backdrop-filter:blur(4px);
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    z-index:5;
    pointer-events:auto;
    border-radius:12px;
    padding:16px;
    cursor:pointer;
  `;

  overlay.innerHTML = `
    <div style="max-width:260px;">
      <div style="font-size:20px;margin-bottom:6px;">🔒</div>

      <div style="
        font-size:14px;
        font-weight:600;
        color:#0f172a;
        margin-bottom:6px;
      ">
        ${message}
      </div>

      <div style="
        font-size:12px;
        color:#64748b;
      ">
        ${cta}
      </div>
    </div>
  `;

  overlay.onclick = () => {
    triggerFunnel({ type:"lock_overlay", roi:0 });
  };

  el.appendChild(overlay);
}


// =====================================
// 🧠 SMART LOCK ENGINE – FINAL
// =====================================
function applySmartLock(el, {
  type = "blur", // blur | hide | overlay | advanced
  message = "",
  cta = "",
  plan = "pro"
} = {}){

  if(!el) return;

  const access = window.getUserAccess?.() || {};

  // 🟢 PRO/ADMIN → MAI LOCK
if(access.isPro || access.isAdmin){
  return;
}

  // =============================
  // 🟢 PRO / ADMIN → FULL ACCESS
  // =============================
  if(access.canSeeFullAnalysis){
    return;
  }

  // =============================
  // 🟡 INVESTOR → PARTIAL LOCK
  // =============================
  if(access.isInvestor){
    // 🔥 RESET HARD (INVESTOR NON DEVE AVERE BLUR BASE)
    el.classList.remove("pro-blur");
    el.classList.remove("blur-content");
    el.style.filter = "none";
    el.style.opacity = "1";

    const isAdvanced =
      type === "advanced" ||
      type === "overlay" ||
      plan === "pro";

    if(isAdvanced){

      createLockOverlay(el, {
        message: message || t(
          "Sblocca analisi avanzata",
          "Unlock advanced analysis"
        ),
        cta: cta || t(
          "Include AI insights, scenari e report completo",
          "Includes AI insights, scenarios and full report"
        ),
        plan:"pro"
      });

      return;
    }

    // 🔓 tutto il resto libero
    return;
  }

  // =============================
  // 🔴 FREE USER
  // =============================

  el.classList.remove("pro-blur");

  if(type === "blur"){
    el.classList.add("pro-blur");
  }

  if(type === "hide"){
    el.style.display = "none";
  }

  if(type === "overlay"){

  // 🔥 FIX MOBILE: NON bloccare UX
  if(window.innerWidth < 768){

  el.classList.add("pro-blur");
  return;

}else{

    createLockOverlay(el, {
      message: message || t(
        "Sblocca analisi completa",
        "Unlock full analysis"
      ),
      cta: cta || t(
        "ROI reale, rischio e simulazioni avanzate",
        "Real ROI, risk and advanced simulations"
      ),
      plan:"investor"
    });

  }

}

  el.style.cursor = "pointer";

  if(!el.dataset.lockBound){

    el.dataset.lockBound = "true";

    el.addEventListener("click", (e)=>{
      e.stopPropagation();
      triggerFunnel({ type:"free_lock", roi:0 });
    });

  }

}

// =====================================
// 👑 PLAN SYSTEM – CLEAN VERSION
// =====================================

// ADMIN
window.isAdmin = function(){
  const email = window.currentUser?.email || "";
  return email === "rendimentobb@gmail.com";
};

// PREMIUM (PRO + ADMIN)
window.isPremiumUser = function(){

  const plan = window.currentPlan || "free";

  return (
    plan === "pro" ||
    plan === "pro_yearly" ||
    window.isAdmin()
  );
};

// FULL ACCESS
window.canUserAccessFull = function(){
  const access = window.getUserAccess?.() || {};
  return !!(access.isPro || access.isAdmin);
};

// GET PLAN
function getUserPlan(){
  return window.currentPlan || "free";
}

// PLAN HIERARCHY
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

  return true;
}


// =====================================
// 🔐 ACCESS CONTROL – UX CLEAN
// =====================================
function requirePlan(requiredPlan){

  if(!window.firebaseReady){
  console.log("⏳ firebase non pronto");
  return false;
}

// 👻 GUEST
if(!window.currentUser){
  showRegisterPopup?.();
  return false;
}

  const access = window.getUserAccess?.() || {};

  // PRO / ADMIN
  if(access.canSeeFullAnalysis){
    return true;
  }

  // GUEST
  if(!window.currentUser){
    showRegisterPopup?.();
    return false;
  }

  // NO PLAN
  if(!hasPlan(requiredPlan)){

    showToast(
      t(
        "🔒 Sblocca funzionalità avanzate",
        "🔒 Unlock advanced features"
      ),
      "warning"
    );

    openUpgradeModal(requiredPlan);
    return false;
  }

  return true;
}

// =====================================
// 🔥 FUNNEL TRIGGER ENGINE (SaaS)
// =====================================
window.triggerFunnel = function({type = "generic", roi = 0} = {}){

  const access = window.getUserAccess?.() || {};

  // 🟢 PRO / ADMIN → niente funnel
  if(access.canSeeFullAnalysis) return;

  // 🟡 INVESTOR → niente popup (solo UI teaser)
  if(access.isInvestor) return;

  // ❌ anti spam
  if(window.funnelState.shown && type !== "reminder") return;

  // 🔥 ROI alto → immediato
  if(type === "roi" && roi > 10){
    openUpgradeModal("investor", roi);
    window.funnelState.shown = true;
    return;
  }

  // 🟡 ROI medio → delay
  if(type === "roi_soft" && roi > 6){
    setTimeout(()=>{
      openUpgradeModal("investor", roi);
    }, 2000);
    window.funnelState.shown = true;
    return;
  }

  // 📜 SCROLL
  if(type === "scroll"){
    openUpgradeModal("investor", roi);
    window.funnelState.shown = true;
    return;
  }

  // 🧠 REMINDER
  if(type === "reminder"){
    openUpgradeModal("investor", roi);
  }

};

// 🔥 COMPATIBILITÀ HOME CTA
window.triggerHomeUpgradeFlow = function(data = {}){
  triggerFunnel({
    type:"scroll",
    roi: window.lastAnalysisData?.roi || 0,
    ...data
  });
};

// =====================================
// 🔥 MODAL UNIFICATO – FINAL PRODUCTION
// =====================================

window.openUpgradeModal = function(type = "investor", roi = 0){

  const access = window.getUserAccess?.() || {};
  if(!access || access.canSeeFullAnalysis) return;

  if(access.isInvestor) type = "pro";

  const safeROI = Number(roi || 0);

  const oldModal = document.getElementById("rb-upgrade-modal");

if(oldModal){
  oldModal.remove();
}

  const modal = document.createElement("div");
  modal.id = "rb-upgrade-modal";

  modal.style = `
    position:fixed;
    inset:0;
    background:rgba(2,6,23,0.75);
    backdrop-filter:blur(8px);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:999999;
  `;

  // ================= CONFIG =================

  let config = null;

  // ================= INVESTOR =================
  if(type === "investor"){
    config = {
      title_it: "📊 Sblocca piano Investor",
      title_en: "📊 Unlock Investor Plan",

      desc_it: "Stai analizzando un investimento con dati incompleti. Questo è il punto in cui molti investitori sbagliano.",
      desc_en: "You're analyzing an investment with incomplete data. This is where most investors make mistakes.",

      features_it: [
        "Simulazioni illimitate",
        "Analisi ROI avanzata",
        "Confronto con mercato reale",
        "Indicatori base di rischio"
      ],
      features_en: [
        "Unlimited simulations",
        "Advanced ROI analysis",
        "Real market comparison",
        "Basic risk indicators"
      ],

      proof_it: "Usato da centinaia di investitori per evitare errori costosi",
      proof_en: "Used by hundreds of investors to avoid costly mistakes",

      cta_it: "Sblocca Investor ora – €19",
      cta_en: "Unlock Investor now – €19",

      warning_it: "⚠️ Senza analisi avanzata potresti sovrastimare i guadagni",
      warning_en: "⚠️ Without advanced analysis you may overestimate returns",

      action: () => startPlanPurchase("investor")
    };
  }

  // ================= PRO =================
  if(type === "pro"){

    const dynamicTextIT =
  safeROI > 12
    ? `Questo investimento è sopra la media (${Math.round(safeROI)}%). Senza analisi completa rischi di sottovalutarlo o prendere una decisione sbagliata. Questo è il punto esatto in cui gli investitori fanno errori costosi.`
    : "Stai prendendo una decisione senza vedere rischio reale, mutuo e costi nascosti. Questo è il punto in cui gli investitori perdono soldi.";

    const dynamicTextEN =
  safeROI > 12
    ? `This investment is above average (${Math.round(safeROI)}%). Without full analysis you may underestimate it or make the wrong decision. This is exactly where investors make costly mistakes.`
    : "You're making a decision without seeing real risk, mortgage and hidden costs. This is where investors lose money.";

    config = {
      title_it: "🚀 Sblocca analisi completa",
      title_en: "🚀 Unlock full analysis",

      desc_it: dynamicTextIT,
      desc_en: dynamicTextEN,

      features_it: [
        "ROI reale completo (netto)",
        "Analisi rischio avanzata",
        "Break-even reale",
        "Simulazione mutuo integrata",
        "Report PDF professionale"
      ],
      features_en: [
        "Full real ROI (net)",
        "Advanced risk analysis",
        "Real break-even",
        "Integrated mortgage simulation",
        "Professional PDF report"
      ],

      proof_it: "Strumenti usati da investitori e consulenti immobiliari",
      proof_en: "Tools used by investors and real estate professionals",

      cta_it: "Sblocca analisi completa – €29",
      cta_en: "Unlock full analysis – €29",

      warning_it: "⚠️ Senza analisi completa puoi perdere migliaia di euro anche con ROI positivo",
      warning_en: "⚠️ Without full analysis you can lose thousands even with a positive ROI",

      action: () => startPlanPurchase("pro")
    };
  }

  if(!config) return;

  const lang = window.currentLang === "en" ? "en" : "it";

  const safeT = t;

  // ================= BOX =================

  const box = document.createElement("div");
  box.classList.add("rb-upgrade-box");

  box.style = `
    background:#ffffff;
    color:#0f172a;
    padding:28px;
    border-radius:18px;
    max-width:420px;
    width:90%;
    text-align:center;
    box-shadow:0 30px 80px rgba(0,0,0,0.25);
    animation:fadeIn .25s ease;
  `;

  // ================= TITLE =================
  const title = document.createElement("h3");
  title.textContent = config["title_" + lang];
  title.style = "font-size:20px;font-weight:700;margin-bottom:8px;";

  // ================= DESC =================
  const desc = document.createElement("p");
  desc.textContent = config["desc_" + lang];
  desc.style = "margin:8px 0 18px;font-size:14px;color:#475569;line-height:1.4;";

  // ================= 🔥 LOSS BOX =================
  const lossBox = document.createElement("div");

  const estimatedLoss = Math.max(
  0,
  (window.lastAnalysisData?.net || 0) * 0.25
);

  if(
  estimatedLoss > 1000 &&
  estimatedLoss < 50000 &&
  !access.canSeeFullAnalysis &&
  safeROI > 6
){
    lossBox.innerHTML = `
      <div style="
        margin-bottom:16px;
        padding:12px;
        border-radius:10px;
        background:rgba(239,68,68,0.08);
        border:1px solid rgba(239,68,68,0.2);
        font-size:14px;
        font-weight:600;
        color:#dc2626;
      ">
        💸 ${safeT(
          `Potresti perdere fino a €${estimatedLoss.toLocaleString()} senza analisi completa`,
          `You could lose up to €${estimatedLoss.toLocaleString()} without full analysis`
        )}
      </div>
    `;
  }

  // ================= FEATURES =================
  const list = document.createElement("div");
  list.style = "text-align:left;margin-bottom:16px;";

  config["features_" + lang].forEach(f=>{
    const item = document.createElement("div");
    item.innerHTML = `✔ ${f}`;
    item.style = "margin:6px 0;font-size:14px;color:#0f172a;";
    list.appendChild(item);
  });

  // ================= SOCIAL PROOF =================
  const proof = document.createElement("div");
  proof.innerHTML = `
    <div style="font-size:12px;color:#64748b;margin-bottom:12px;">
      ⭐ ${config["proof_" + lang]}
    </div>
  `;

 // ================= CTA =================
const cta = document.createElement("button");

cta.innerHTML = `
  <div style="font-size:14px;font-weight:700;line-height:1.2;">
    🔓 ${config["cta_" + lang]}
  </div>
  <div style="font-size:11px;opacity:.85;margin-top:4px;">
    ${safeT(
      "Accesso immediato • Nessun vincolo",
      "Instant access • No commitment"
    )}
  </div>
`;

// 🎨 colore diverso PRO vs INVESTOR
cta.style = type === "pro"
  ? `
    background:linear-gradient(135deg,#6366f1,#4f46e5);
    color:white;
    border:none;
    padding:14px;
    border-radius:12px;
    font-weight:700;
    cursor:pointer;
    width:100%;
    margin-bottom:10px;
    white-space:normal;
    line-height:1.2;
  `
  : `
    background:linear-gradient(135deg,#10b981,#059669);
    color:white;
    border:none;
    padding:14px;
    border-radius:12px;
    font-weight:700;
    cursor:pointer;
    width:100%;
    margin-bottom:10px;
    white-space:normal;
    line-height:1.2;
  `;

cta.onclick = ()=>{
  modal.remove();
  config.action();
};
  
  // ================= CLOSE =================
  const close = document.createElement("button");
  close.textContent = lang==="en" ? "Maybe later" : "Ora no";
  close.style = `
    background:none;
    border:none;
    color:#64748b;
    cursor:pointer;
    font-size:13px;
    margin-bottom:6px;
  `;

  close.onclick = ()=>{
    modal.remove();
  };

  // ================= WARNING =================
  const warning = document.createElement("div");
  warning.innerHTML = `
    <div style="margin-top:10px;font-size:13px;color:#ef4444;font-weight:600;">
      ⚠️ ${config["warning_" + lang]}
    </div>
    <div style="font-size:11px;color:#64748b;margin-top:4px;">
      ${safeT(
        "Senza analisi completa stai andando alla cieca",
        "Without full analysis you're investing blind"
      )}
    </div>
  `;

  // ================= APPEND =================
  box.append(title, desc, lossBox, list, proof, cta, close, warning);

  modal.appendChild(box);
  document.body.appendChild(modal);

// ================= CLICK OUTSIDE =================
modal.addEventListener("click",(e)=>{
  if(e.target === modal){
    modal.remove();
  }
});

};

window.applyCityBackground = function(city){

  if(window.__BG_LOCK__){
  console.log("⛔ BG LOCK → skip");
  return;
}

  const hero =
    document.querySelector(".tool-hero") ||
    document.querySelector(".hero-bg") ||
    document.querySelector(".hero-roi");

  if(!hero) return;

  const map = {
    roma:"rome",
    napoli:"naples",
    milano:"milan",
    firenze:"florence"
  };

  const cityClass = map[city] || "rome";

  // 🔥 evita re-render inutili
  if(hero.dataset.currentBg === cityClass){
    console.log("⏳ BG già applicato:", cityClass);
    return;
  }

  const bgMap = {
    rome: "/img/rome-bg.jpg",
    naples: "/img/naples-bg.jpg",
    milan: "/img/milan-bg.jpg",
    florence: "/img/florence-bg.jpg"
  };

  hero.style.backgroundImage = `
    linear-gradient(rgba(15,23,42,0.30), rgba(15,23,42,0.50)),
    url(${bgMap[cityClass]})
  `;

  hero.style.backgroundSize = "cover";
  hero.style.backgroundPosition = "center";
  hero.style.backgroundRepeat = "no-repeat";

  hero.classList.remove("rome","naples","milan","florence");
  hero.classList.add(cityClass);

  // 🔥 salva stato (non blocca più)
  hero.dataset.currentBg = cityClass;
  window.__BG_LOCK__ = true;

  console.log("🎯 BG SET:", cityClass);
};

// ================= LAST ANALYSIS STORAGE =================
window.lastAnalysisData = null;
window.simulationExecuted = false;

// ================= LEAD HASH =================
window.__LAST_LEAD_HASH__ = null;

// ================= LEAD SESSION RESET =================
window.resetLeadSession = function(){

  window.__LAST_LEAD_HASH__ = null;
  window.leadSaved = false;
  window.emailUserSent = false;

};

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

  const container = document.getElementById("roi-market-comparison");
  if(!container) return;

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
  const circle = document.getElementById("score-circle");

  if(!container) return;

  const access = window.getUserAccess?.() || {};

  // 🔴 FREE → blocco
  if(access.isFree){
    container.innerHTML = `
      <div class="kpi-box">
        🔒 ${t("Sblocca valutazione completa","Unlock full score")}
      </div>
    `;

    if(circle) circle.innerHTML = "—";
    return;
  }

// ================= SCORE CANONICO =================

const canonicalScoreData =
  typeof window.rbGenerateInvestmentScore === "function"
    ? window.rbGenerateInvestmentScore({
        roi: Number(roi || 0),

        risk: Number(riskScore || 0),

        occupancy: Number(
          window.lastAnalysisData?.occupancy ??
          window.rbChatbotData?.occupancy ??
          0
        ),

        mortgagePercent: Number(
          window.lastAnalysisData?.mortgagePercent ??
          0
        ),

        cashflow: Number(
          window.lastAnalysisData?.net ??
          window.lastAnalysisData?.cashflow ??
          0
        ),

        city:
          window.lastAnalysisData?.marketCity ??
          window.lastAnalysisData?.city ??
          window.currentCity ??
          null
      })
    : null;

const score =
  Number(
    canonicalScoreData?.score ??
    window.lastInvestmentScore?.score ??
    0
  );

  // ================= CERCHIO =================
  if(circle){

    let color = "#ef4444";

    if(score > 70) color = "#10b981";
    else if(score > 40) color = "#f59e0b";

    circle.innerHTML = `
      <div style="
        font-size:20px;
        font-weight:700;
        color:${color};
      ">
        ${score}
      </div>
    `;

    // effetto glow premium
    circle.style.boxShadow = `0 0 20px ${color}40`;
  }

  // ================= KPI BOX =================
let grade = "C";
let recommendation =
  t("Operazione non consigliata", "Investment not recommended");

if(score >= 75){

  grade = "A";

  recommendation =
    t("Acquisto consigliato", "Buy recommended");

}
else if(score > 40){

  grade = "B";

  recommendation =
    t("Attendere e ottimizzare", "Wait and optimize");

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

function renderInvestmentVerdict(
roi,
risk = 50,
cashflow = 0,
occupancy = 70
){

const box =
document.getElementById(
"investment-verdict"
);

if(!box) return;

let verdict = "BUY";
let confidence = 92;

let color = "#10b981";
let icon = "🟢";

let title =
t(
"AI Recommendation",
"AI Recommendation"
);

let description =
"";

const reasons = [];

// ROI

if(roi >= 15){

reasons.push(
t(
"ROI molto superiore alla media del mercato",
"ROI significantly above market average"
)
);

}
else if(roi >= 8){

reasons.push(
t(
"ROI competitivo",
"Competitive ROI"
)
);

}
else{

verdict = "WAIT";

color="#f59e0b";

icon="🟠";

confidence-=15;

reasons.push(
t(
"ROI inferiore alle opportunità migliori",
"ROI below the best market opportunities"
)
);

}

// CASHFLOW

if(cashflow>0){

reasons.push(
t(
"Cashflow positivo",
"Positive cashflow"
)
);

}
else{

verdict="WAIT";

confidence-=10;

reasons.push(
t(
"Cashflow da migliorare",
"Cashflow should be improved"
)
);

}

// RISK

if(risk<=30){

reasons.push(
t(
"Livello di rischio contenuto",
"Controlled risk level"
)
);

}
else if(risk>=70){

verdict="WAIT";

confidence-=10;

reasons.push(
t(
"Rischio elevato",
"High investment risk"
)
);

}

// OCCUPANCY

if(occupancy>=70){

reasons.push(
t(
"Occupazione prevista elevata",
"Strong expected occupancy"
)
);

}

description = reasons
.map(r => `
<div style="
display:flex;
align-items:flex-start;
gap:10px;
margin-bottom:10px;
">

<span style="
color:#10b981;
font-weight:700;
">

✔

</span>

<span>

${r}

</span>

</div>
`)
.join("");

box.innerHTML = `

<div class="ai-verdict-card">

<div class="ai-verdict-header">

<div class="ai-verdict-badge">

🧠 ${t(
"Executive AI Decision",
"Executive AI Decision"
)}

</div>

<h3 style="
font-size:34px;
font-weight:900;
margin:14px 0 10px;
color:${color};
letter-spacing:-1px;
">

${icon} ${verdict}

</h3>

<div class="ai-confidence">

<span>

${t(
"AI Confidence",
"AI Confidence"
)}

</span>

<strong>

${confidence}%

</strong>

</div>

</div>

<div class="ai-verdict-body">

${description}

</div>

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
          "Stai vedendo solo una parte dei dati",
          "You're only seeing part of the data"
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

      <button onclick="triggerFunnel({roi:${safeROI}})" style="
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

btn.style.display = access.canSeeFullAnalysis ? "inline-block" : "none";

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

  const access = window.getUserAccess?.() || {};

  // 🔴 FREE → blocco
  if(access.isFree){
    container.innerHTML = `
      <div style="color:#64748b;font-size:14px;">
        🔒 ${t("Sblocca per vedere insights AI","Unlock to see AI insights")}
      </div>
    `;
    return;
  }

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

  const access = window.getUserAccess?.() || {};
  if(access.canSeeFullAnalysis || access.isInvestor) return;

  window.funnelState.counter++;

  // ogni 2 azioni
  if(window.funnelState.counter % 2 !== 0) return;

  setTimeout(()=>{

    triggerFunnel({
  type:"reminder",
  roi,
});

  }, 2000);
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

  console.log("🧹 SAFE RESET");

  document.querySelectorAll(`
    .lock-overlay,
    .upgrade-overlay,
    .results-overlay,
    .smart-overlay
  `).forEach(el => {
    if(el.id !== "register-popup") el.remove();
  });

}

function removeAllBlur(){

  document.querySelectorAll(".blur-content, .pro-blur").forEach(el=>{
    el.classList.remove("blur-content","pro-blur");
    el.style.filter = "none";
    el.style.opacity = "1";
  });

}

// ================= POST ANALYSIS ENGINE (FINAL PRO CLEAN FIXED) =================

function runPostAnalysis(result, context){

  try{

    if(!result){
      console.warn("⛔ postAnalysis skipped → null result");
      return;
    }

    const access = window.getUserAccess?.() || {};

    const t = (it, en) =>
      (window.currentLang === "en" ? en : it);

    const {
  price = 0,
  gross = 0,
  occupancy = 0,
  priceNight = 0,
  expenses = 0,
  equity = 0,

  // 🔥 AGGIUNGI QUESTI
  net = 0,
  loanAmount = 0,
  mortgage = 0,
  mortgageRate = 0,
  monthlyMortgage = 0

} = context || {};

    // ================= GLOBAL STATE =================

    window.simulationExecuted = true;

    // ================= SAFE VARIABLES =================

    const roi = Number(result?.roi || 0);

    const finalROI =
      Number(
        result?.finalROI ??
        result?.roi ??
        window.finalROI ??
        window.currentROI ??
        0
      );

    console.log("🔥 ROI DEBUG",{
  resultROI: result?.roi,
  resultFinalROI: result?.finalROI,
  windowFinalROI: window.finalROI,
  windowCurrentROI: window.currentROI,
  finalROI
});

    const risk =
      Number(
        result?.risk ??
        window.riskScore ??
        0
      );

    const riskScore = risk;

    const occupancyRate =
      Number(
        occupancy ??
        result?.occupancy ??
        0
      );

    const nightly =
      Number(
        priceNight ??
        result?.pricePerNight ??
        0
      );

    const monthlyCosts =
      Number(
        expenses ??
        result?.monthlyCosts ??
        0
      );

    const annualRevenue =
      Number(
        gross ??
        result?.revenueAnnual ??
        0
      );

    const propertyPrice =
      Number(
        price ??
        result?.propertyPrice ??
        0
      );

    const mortgagePercent =
  Number(result?.mortgagePercent) > 0

    ? Number(result.mortgagePercent)

    : (
        propertyPrice > 0

          ? Math.round(
              (
                Number(
                  loanAmount ||
                  mortgage ||
                  0
                )
                /
                propertyPrice
              ) * 100
            )

          : 0
      );

    const market =
      window.currentCity ||
      "roma";

    const realCityInput =

  document
    .getElementById("custom-location")
    ?.value
    ?.trim()

  ||

  document
    .getElementById("market-city")
    ?.value

  ||

  market;

    // ================= ANALYSIS DATA =================

    window.lastAnalysisData = {
  ...result,

  loanAmount:
    Number(
      result?.loan ??
      result?.loanAmount ??
      loanAmount ??
      0
    ),

  mortgage:
    Number(
      result?.loan ??
      result?.loanAmount ??
      loanAmount ??
      0
    ),

  realROI:
    window.realROI ||
    finalROI ||
    0
};

    // ================= SAVE DEDUP =================

    const analysisHash = JSON.stringify({
      roi: finalROI.toFixed(2),
      city: market,
      price: propertyPrice,
      ts: Math.floor(Date.now() / 15000)
    });

    const now = Date.now();

const shouldSave =

!window.__LAST_SAVED_ANALYSIS__ ||

window.__LAST_SAVED_ANALYSIS__ !== analysisHash ||

(
  now -
  (window.__LAST_SAVE_TIME__ || 0)
) > 15000;

// salva hash + timestamp
if(shouldSave){

  window.__LAST_SAVED_ANALYSIS__ =
    analysisHash;

  window.__LAST_SAVE_TIME__ =
    now;
}

    // ================= CANONICAL SCORE FOR SAVE =================

const canonicalSaveScoreData =
  typeof window.rbGenerateInvestmentScore === "function"

    ? window.rbGenerateInvestmentScore({

        roi: Number(
          result?.realROI ??
          window.realROI ??
          finalROI ??
          0
        ),

        risk: Number(
          riskScore ??
          risk ??
          0
        ),

        occupancy: Number(
          occupancyRate ??
          0
        ),

        mortgagePercent: Number(
          mortgagePercent ??
          0
        ),

        cashflow: Number(
          net ??
          0
        ),

        city:
          realCityInput ||
          market ||
          "roma"

      })

    : null;

const canonicalSaveScore =
  Number(
    canonicalSaveScoreData?.score ??
    0
  );

const canonicalSaveVerdict =
  canonicalSaveScoreData?.verdict ??
  (
    canonicalSaveScore >= 75
      ? "BUY"
      : canonicalSaveScore > 40
        ? "WAIT"
        : "AVOID"
  );

    // ================= SAVE ANALYSIS =================

    const isManualAnalysis =
window.__MANUAL_ANALYSIS__ === true;

    if(
  isManualAnalysis &&
  shouldSave &&
  window.currentUser &&
  window.firebaseReady &&
  finalROI > 0
){

  saveAnalysis({
    propertyPrice: propertyPrice,
    equity,
    roi: finalROI,
    visualROI: finalROI,
    risk,
    gross,
    net,
    occupancy: occupancyRate,

investmentScore:
  canonicalSaveScore,

verdict:
  canonicalSaveVerdict,

marketCity: market,
    realCity:
      realCityInput ||
      market ||
      "roma"
  });

  console.log("✅ SALVATO FIRESTORE");
}

    console.log("📊 FINAL ROI:", finalROI);

    console.log(
  "🔥 PRE SAVE VARIABLES",
  {
    propertyPrice,
    equity,
    loanAmount,
    mortgage,
    mortgagePercent,
    monthlyMortgage
  }
);

    // =====================================
    // 🤖 CHATBOT LIVE ANALYSIS
    // =====================================

    window.lastAnalysisData = {

  // =====================================
  // 🌍 MARKET
  // =====================================

  city: market,

  marketCity: market,

  realCity:

  document.getElementById("custom-location")?.value ||

  document.getElementById("market-city")?.value ||

  market ||

  "roma",

// =====================================
// 📈 ROI
// =====================================

roi: Number(finalROI) || 0,

realROI:
  Number(
    result?.realROI ??
    window.realROI ??
    finalROI
  ) || 0,

visualROI: Number(finalROI) || 0,

  // =====================================
  // ⚠️ RISK
  // =====================================

  risk: riskScore,

  occupancy: occupancyRate,

  // =====================================
  // 💰 PROPERTY
  // =====================================

  propertyPrice:
Number(propertyPrice || 0),

equity:
Number(equity || 0),

loanAmount:
Number(
  loanAmount ||
  mortgage ||
  0
),

mortgage:
Number(
  loanAmount ||
  mortgage ||
  0
),

mortgagePercent:

Number(
  mortgagePercent ||

  (
    propertyPrice > 0

      ? Math.round(
          (
            Number(
              loanAmount ||
              mortgage ||
              0
            )
            /
            Number(propertyPrice)
          ) * 100
        )

      : 0
  )
),

// 💰 REVENUE
pricePerNight: nightly,

monthlyCosts: monthlyCosts || 0,

revenueAnnual: annualRevenue || 0,

gross:
gross ||
annualRevenue ||
0,

net:
Number(net || 0),

profit:
Number(net || 0),

netAfterMortgage:
net || 0,

netAfterMortgage:
net ||
0,

  // =====================================
  // 🏦 MORTGAGE
  // =====================================

  mortgageRate:
    mortgageRate ||
    0,

  monthlyMortgage:
  Number(monthlyMortgage || 0),

  // =====================================
  // 🧠 META
  // =====================================

  timestamp: Date.now()

};

    console.log(
  "🏦 DEBUG MORTGAGE SAVE",
  {
    loanAmount,
    mortgage,
    mortgageAmount: loanAmount,
    propertyPrice,
    equity
  }
);

    console.log(
      "🧠 FULL ANALYSIS DATA:",
      window.lastAnalysisData
   );

    console.log(
      "🤖 LIVE ANALYSIS SAVED:",
      window.lastAnalysisData
    );

// =====================================
// 📄 EXECUTIVE DOCUMENT
// =====================================

if(typeof window.buildExecutiveReport === "function"){

    const executiveReport =

        window.buildExecutiveReport(
            window.lastAnalysisData
        );

    console.log(
        "📄 EXECUTIVE REPORT CREATED",
        executiveReport
    );

    console.log(
        "📚 DOCUMENT LIBRARY",
        window.rbDocumentManager.getAll()
    );

}

    console.log("💾 POST ANALYSIS START");

    // ================= ROI UI =================

    const roiEl =
      document.getElementById("roi-live");

    if(roiEl && finalROI > 0){

      if(access.isFree){

        roiEl.innerText = "—";

      }else{

        roiEl.innerText =
          finalROI.toFixed(1) + "%";
      }
    }

    // ================= ROI MESSAGE =================

    if(typeof updateROIMessage === "function"){
      updateROIMessage(finalROI);
    }

// ================= INVESTMENT SCORE =================

console.log("🧪 SCORE FUNCTIONS",{

  rbGenerateInvestmentScore:
    window.rbGenerateInvestmentScore,

  updateInvestmentScore:
    window.updateInvestmentScore

});

    console.log(
  "🧪 WINDOW KEYS",
  Object.keys(window)
    .filter(k => k.toLowerCase().includes("score"))
);

if(

  typeof window.rbGenerateInvestmentScore === "function" &&
  typeof window.updateInvestmentScore === "function"

){

  const scoreData =
    window.rbGenerateInvestmentScore({

      roi: Number(
  result?.realROI ??
  window.realROI ??
  finalROI ??
  0
),

      risk: riskScore,

      occupancy: occupancyRate,

mortgagePercent:

  Number(
    window.lastAnalysisData?.mortgagePercent ??
    mortgagePercent ??
    0
  ),

      cashflow:

        Number(
          net ||
          0
        ),

      city: market

    });

  console.log(
    "🧠 SCORE ENGINE:",
    scoreData
  );

  window.updateInvestmentScore(
    scoreData.score
  );

}

    if(finalROI <= 0){
      console.warn("⚠️ Low ROI → UI still rendered");
    }

    // =====================================
    // 🔓 HARD UNLOCK PRO
    // =====================================

    if(access.isPro || access.isAdmin){

      console.log("🟢 REMOVE BLUR FOR PRO");

      document.body.classList.add("pro-user");

      // 🔓 remove blur
      document.querySelectorAll(`
        .blur-content,
        .pro-blur
      `).forEach(el=>{

        el.classList.remove(
          "blur-content",
          "pro-blur"
        );

        el.style.filter = "none";
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
      });

      // 🔓 remove overlays
      document.querySelectorAll(`
        .locked-overlay,
        .lock-overlay,
        .upgrade-overlay,
        .results-overlay,
        .smart-overlay
      `).forEach(el=> el.remove());

      // 🔓 show sections
      document.querySelectorAll(`
        .pro-only,
        .results-card,
        .locked-section
      `).forEach(el=>{

        el.style.display = "block";
        el.style.opacity = "1";
        el.style.visibility = "visible";
      });

      // 🔓 advanced analysis
      const advanced =
        document.getElementById("advanced-analysis");

      if(advanced){

        advanced.classList.remove(
          "locked-section",
          "upgrade-box"
        );

        advanced.style.filter = "none";
        advanced.style.opacity = "1";
        advanced.style.pointerEvents = "auto";
      }

      console.log("✅ HARD UNLOCK PRO COMPLETATO");
    }

    // ================= SMART REMINDER =================

    if(typeof triggerSmartReminder === "function"){
      triggerSmartReminder(finalROI);
    }

    // ================= FUNNEL =================

    if(
      finalROI > 10 &&
      access.isFree
    ){

      triggerFunnel?.({
        type:"roi",
        roi: finalROI
      });

    }else if(finalROI > 6){

      triggerFunnel?.({
        type:"roi_soft",
        roi: finalROI
      });
    }

    // ================= INVESTOR =================

    if(
      !access.canSeeFullAnalysis &&
      !access.isInvestor &&
      finalROI > 10
    ){
      // showUpgradeModal(finalROI);
    }
    else if(access.isInvestor){

      console.log("🟡 INVESTOR → partial unlock");
    }

    // ================= LEAD ENGINE =================

    if(finalROI <= 0){

      console.log("⛔ lead skipped → ROI 0");
      return;
    }

    const userEmail =
      window.currentUser?.email;

    let leadScore = "cold";

    try{

      if(typeof getLeadScore === "function"){

        leadScore = getLeadScore({
          roi: finalROI
        });
      }

    }catch(e){

      console.warn(
        "LeadScore fallback:",
        e
      );
    }

    // ================= LEAD DEDUP =================

    const leadHash = JSON.stringify({
      email: userEmail,
      city: market,
      price: propertyPrice
    });

    if(window.__LAST_LEAD_HASH__ === leadHash){

      console.warn("⛔ DUPLICATE LEAD BLOCKED");
      return;
    }

    window.__LAST_LEAD_HASH__ = leadHash;

    // ================= SCORE =================

    window.simulationCount =
      (window.simulationCount || 0) + 1;

    if(window.simulationCount > 3){
      leadScore = "hot";
    }

    // ================= EMAIL =================

    if(userEmail){

      window.emailUserSent = true;

        console.log("📧 SEND LEAD EMAIL",{
    email:userEmail,
    roi:finalROI,
    city:market,
    plan:window.currentPlan
  });

      fetch("/api/send-lead-email",{
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          email: userEmail,
          lang: window.currentLang || "it",
          roi: finalROI,
          city: market,
          leadScore
        })
      })
.then(async res=>{

  console.log(
    "📧 SEND LEAD RESPONSE",
    res.status,
    await res.clone().text()
  );

  if(!res.ok){

    window.emailUserSent = false;

    console.warn(
      "❌ Email send failed"
    );
  }

})
.catch(err=>{

  console.error(
    "💥 SEND LEAD ERROR",
    err
  );

  window.emailUserSent = false;
});
    }

    console.log("✅ POST ANALYSIS COMPLETED");

  }catch(err){

    console.error(
      "❌ runPostAnalysis ERROR:",
      err
    );
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

// ================= LOCATION → CITY MAPPING PRO =================

function mapLocationToCity(input){

  if(!input || input.trim() === "") return null;

  const val = input.toLowerCase().trim();

  // ================= DATABASE MIRATO =================
  const cityMap = {

    // NAPOLI
    "portici": "napoli",
    "ercolano": "napoli",
    "pompei": "napoli",

    // MILANO
    "sesto san giovanni": "milano",
    "lambrate": "milano",
    "monza": "milano",

    // ROMA
    "fiumicino": "roma",
    "ostia": "roma",

    // FIRENZE
    "prato": "firenze",
    "pistoia": "firenze"
  };

  for(const city in cityMap){
    if(val.includes(city)){
      return cityMap[city];
    }
  }

  // ================= PROVINCE =================
  const provinceMap = {
    na: "napoli",
    sa: "napoli",

    mi: "milano",
    mb: "milano",

    rm: "roma",
    lt: "roma",

    fi: "firenze",
    po: "firenze"
  };

  const match = val.match(/\((.*?)\)/);

  if(match){
    const prov = match[1].toLowerCase();
    if(provinceMap[prov]){
      return provinceMap[prov];
    }
  }

  if(
  val.includes("parma") ||
  val.includes("reggio emilia") ||
  val.includes("piacenza")
){
  console.log("🔥 PARMA FIX HIT");
  return "bologna";
}

  // ================= REGION LOGIC (🔥 QUI È IL FIX) =================

  if(val.includes("pisa") || val.includes("livorno") || val.includes("lucca")){
    return "firenze";
  }

  if(val.includes("torino") || val.includes("novara")){
    return "milano";
  }

  if(val.includes("bologna") || val.includes("modena")){
    return "firenze";
  }

  if(val.includes("napoli") || val.includes("salerno")){
    return "napoli";
  }

  if(val.includes("milano")){
    return "milano";
  }

  if(val.includes("roma")){
    return "roma";
  }

  if(val.includes("firenze")){
    return "firenze";
  }

  // ================= FALLBACK INTELLIGENTE =================

  console.log("⚠️ città non riconosciuta → fallback ROMA");

  return "roma";
}

// ================= LOCATION HELPER UX (FINAL PREMIUM) =================

const locationInput = document.getElementById("custom-location");
const helper = document.getElementById("location-helper");

if(locationInput && helper){

  locationInput.addEventListener("input", () => {

    const val = locationInput.value?.trim();

// =====================================
// 🔥 RESET SELECT DEFAULT (CRITICO)
// =====================================

const citySelector =
  document.getElementById("market-city");

if(citySelector){

  if(val !== ""){

    // 🔥 svuota select
    citySelector.value = "";

    // 🔥 disabilita select
    citySelector.disabled = true;
    citySelector.style.opacity = "0.5";

    // 🔥 input manuale prioritario
    window.__CITY_MANUAL__ = true;

    // 🔥 mapping reale città
    const mapped = mapLocationToCity(val);

    if(mapped){

      // 🔥 aggiorna città globale
      window.currentCity = mapped;

      // 🔥 salva sync
      sessionStorage.setItem("tool_city", mapped);

      console.log("🏙 CITY FROM INPUT:", mapped);

    }

  }else{

    // 🔓 riattiva select
    citySelector.disabled = false;
    citySelector.style.opacity = "1";

    window.__CITY_MANUAL__ = false;

  }

}

    // ================= EMPTY STATE =================
    if(!val){

      helper.innerText = t(
        "💡 I dati di mercato verranno applicati automaticamente",
        "💡 Market data will be applied automatically"
      );

      return;
    }

    // ================= MAPPING =================
    const mapped = mapLocationToCity(val);

    // ================= LABEL =================
    const cityLabel = {
      napoli: "Napoli",
      milano: "Milano",
      roma: "Roma",
      firenze: "Firenze"
    };

    const label = cityLabel[mapped] || "Roma";

    // ================= UX MESSAGE =================
    helper.innerText = t(
  `📍 Mercato automatico rilevato: ${label}`,
  `📍 Automatic market detected: ${label}`
);

    // ================= SYNC REALE (CRITICO) =================
    if(!window.__CITY_LOCKED__){

      if(window.__CITY_LOCKED__ && window.location.pathname.includes("/tool")){
  window.__CITY_LOCKED__ = false;
}

      // 🔥 aggiorna città globale
      window.currentCity = mapped;

      // 🔥 salva (coerenza UX)
      sessionStorage.setItem("tool_city", mapped);

      // 🔥 aggiorna background live (effetto premium)
      if(typeof applyCityBackground === "function"){

  const hero =
    document.querySelector(".tool-hero") ||
    document.querySelector(".hero-bg") ||
    document.querySelector(".hero-roi");

  window.__BG_LOCK__ = false;
  window.__CITY_MANUAL__ = true;
  applyCityBackground(mapped);
}

    }

    console.log("📍 INPUT:", val);
    console.log("🏙 MAPPED:", mapped);

  });

}
// ================= SAFE INPUT =================

function getValue(id){
  const el = document.getElementById(id);
  if(!el) return 0;

  const v = parseFloat(el.value);
  return isNaN(v) ? 0 : v;
}

window.__LAST_CALCULATION__ = 0;

window.calculate = async function(mode = false){

  console.trace("🔥 CALCULATE SOURCE", mode);

  const isUIRefresh =
  mode === "ui_refresh";

  if(window.isCalculating && !mode){
    console.warn("⛔ skip calculate (already running)");
    return;
  }

  const now = Date.now();

const isAutoImport =
  mode === true;

if(
  !isAutoImport &&
  now - window.__LAST_CALCULATION__ < 1200
){
  console.warn(
    "⛔ calculate throttled"
  );
  return;
}

window.__LAST_CALCULATION__ = now;

  window.isCalculating = true;

  // ✅ ACCESS (UNA SOLA VOLTA)
 const access = window.getUserAccess?.() || {};

// 🔥 BLOCCO REALE
if(access.isLoading){

  console.log("⏳ ACCESS LOADING");

  window.pendingCalculation = true;
  window.isCalculating = false;

  return;
}

// 🔥 firebase può essere ready anche senza currentPlan
if(!window.firebaseReady){

  console.log("⏳ FIREBASE NON READY");

  window.pendingCalculation = true;
  window.isCalculating = false;

  return;
}

// 🔥 fallback SAFE
if(!window.currentPlan){

  console.warn("⚠️ currentPlan missing → fallback FREE");

  window.currentPlan = "free";

  console.log("⏳ BLOCCO calculate → piano non pronto");

  window.pendingCalculation = true;
  window.isCalculating = false;

  return;
}

  window.__preventRecalculate = true;
  window.simulationExecuted = false;
  window.paywallShown = false;

  // 🧹 CLEAN UI
  document.querySelectorAll(`
    .smart-overlay,
    .upgrade-msg,
    .investor-upsell
  `).forEach(el => el.remove());

  // ✅ USA access (NON ridefinire)
  if(access.isInvestor || access.isPro || access.isAdmin){
    removeAllBlur();
  }

  if(!access.isFree){
    document.querySelectorAll(`
      .results-overlay,
      .upgrade-overlay
    `).forEach(el => el.remove());
  }

  console.log("🚀 CALCULATE START", access);

  // =====================================
// 🔥 HARD RESET PRO/ADMIN
// =====================================

if(access.isPro || access.isAdmin){

  document.querySelectorAll(`
    .lock-overlay,
    .results-overlay,
    .upgrade-overlay,
    .smart-overlay,
    .paywall-mini,
    .home-blur-overlay,
    .blur-content,
    .locked-section,
    .premium-lock,
    .pro-blur
  `).forEach(el => {

    // overlay veri
    if(
      el.classList.contains("lock-overlay") ||
      el.classList.contains("results-overlay") ||
      el.classList.contains("upgrade-overlay") ||
      el.classList.contains("smart-overlay") ||
      el.classList.contains("paywall-mini") ||
      el.classList.contains("home-blur-overlay")
    ){
      el.remove();
      return;
    }

    // reset blur
    el.classList.remove(
      "blur-content",
      "locked-section",
      "premium-lock",
      "pro-blur"
    );

    el.style.filter = "none";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";

  });

}

  try{

    // ================= INPUT =================
    const isTool = !!document.getElementById("price");

    const price       = isTool ? getValue("price") || 100000 : getValue("qr_price") || 100000;
    const equityInput = getValue("equity");

    let equity = isTool
  ? (equityInput > 0 ? equityInput : Math.round(price * 0.3))
  : Math.round(price * 0.3);

// 🔥 EQUITY CANNOT EXCEED PRICE

if(equity > price){

  equity = price;

}

// 🔥 MIN EQUITY REALISTICA
const minEquity = price * 0.15;

if(equity < minEquity){
  equity = minEquity;
}

    const priceNight  = isTool ? getValue("priceNight") || 100 : getValue("qr_night") || 100;
    const occupancy   = isTool ? getValue("occupancy") || 65 : getValue("qr_occ") || 65;
    const expenses    = isTool ? getValue("expenses") || 30 : getValue("qr_cost") || 30;

    const commission  = getValue("commission") || 15;
    const tax         = getValue("tax") || 21;

    // ================= LOCATION =================
    const customLocation = document.getElementById("custom-location")?.value;

    if(customLocation && customLocation.trim() !== "" && window.__CITY_FROM_INPUT__ !== false){

      const mappedCity = mapLocationToCity(customLocation);

      if(mappedCity && !window.__CITY_LOCKED__ && !window.__CITY_MANUAL__){

        window.currentCity = mappedCity;
        sessionStorage.setItem("tool_city", mappedCity);

        window.__CITY_FROM_INPUT__ = true;

        if(typeof applyCityBackground === "function"){
          applyCityBackground(mappedCity);
        }

        console.log("🏙 CITY FROM INPUT:", mappedCity);
      }
    }

    const calculatedLoan = Math.max(
  0,
  price - equity
);

const loanAmount =
  getValue("loanAmount") ||
  calculatedLoan;
    const interestRate = getValue("interestRate") || 3.5;
    const loanYears    = getValue("loanYears") || 20;

    // ================= CALCOLO =================

console.log("🔥 ROI INPUT", {
  price,
  equity,
  loanAmount,
  priceNight,
  occupancy,
  expenses,
  commission,
  tax,
  interestRate,
  loanYears
});

const result = calculateROI({
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

    console.log(
  "🔥 POST ROI VARIABLES",
  {
    price,
    equity,
    loanAmount
  }
);

console.log("🔥 ROI RESULT", result);

    if (!result || typeof result !== "object") {

  console.error(
    "💥 ROI Engine returned an invalid result",
    result
  );

  window.isCalculating = false;

  return;

}

    // ================= KPI =================
    let roi = Number(result?.roi ?? 0);

// 🔥 SAFE ROI
if(!isFinite(roi)){
  roi = 0;
}

// =====================================
// 🔥 ROI ENGINE SPLIT (HOME vs TOOL)
// =====================================

// 🏠 HOME → teaser più aggressivo
if(!isTool){

  // boost psicologico leggero
  roi = roi * 1.18;

  // cap marketing
  roi = Math.min(roi, 38);

}

// =====================================
// 🔥 ROI ENGINE PROFESSIONAL
// =====================================

// 🔥 ROI REALE
const realROI = Number(
  result?.realROI ??
  roi ??
  0
);

// 🔥 ROI VISIVO (ROI su equity)
const visualROI =
  Number(
    roi ??
    realROI ??
    0
  );

// 🔥 salva ROI reale globale
window.realROI = realROI;

// 🔥 render chart con cap visivo
renderROIChart(visualROI);

// 🔥 testo reale
const roiText = realROI.toFixed(1) + "%";

// 🔥 compatibilità legacy
const safeROI = realROI;
    
// =====================================
// 💰 FINANCIAL DATA
// =====================================

const gross = Number(
  result?.revenue ??
  result?.gross ??
  0
);

const net = Number(
  result?.netAfterMortgage ??
  result?.net ??
  result?.profit ??
  (gross * 0.38) ??
  0
);

const risk = Number(
  result?.risk ??
  result?.riskScore ??
  0
);

// =====================================
// 📊 SCORE ENGINE
// =====================================

renderInvestmentScore(
  safeROI,
  Math.round(risk)
);

// ===============================================
// 🧠 CHATBOT LIVE DATA
// ===============================================

const chatbotAccess =
window.getUserAccess?.() || {};

    console.log(
  "🔥 ROI DEBUG",
  {
    roi,
    realROI,
    visualROI,
    safeROI
  }
);

// 🔥 ROI Executive chatbot (ROI su equity)

const chatbotRealROI = Number(

  visualROI ??

  roi ??

  realROI ??

  0

);

// 🔥 FREE → ROI nascosto nel chatbot
const chatbotROI =
(
  chatbotAccess.isFree &&
  !chatbotAccess.isInvestor &&
  !chatbotAccess.isPro &&
  !chatbotAccess.isAdmin
)
? 0
: chatbotRealROI;

// 🔥 CASHFLOW / NET SMART
const chatbotNet =
(
  chatbotAccess.isFree &&
  !chatbotAccess.isInvestor &&
  !chatbotAccess.isPro &&
  !chatbotAccess.isAdmin
)
? 0
: net;

const marketCity =

  window.currentCity ||

  sessionStorage.getItem("tool_city") ||

  document.getElementById("market-city")?.value ||

  localStorage.getItem("selected_city") ||

  "";

// ===============================================
// 🧠 CHATBOT LIVE DATA
// ===============================================

window.rbChatbotData = {

  roi: chatbotROI,

  visualROI: chatbotROI,

  gross:
  (
    chatbotAccess.isFree &&
    !chatbotAccess.isInvestor &&
    !chatbotAccess.isPro &&
    !chatbotAccess.isAdmin
  )
  ? null
  : gross ?? null,

  net: chatbotNet,

  occupancy:
    occupancy ??
    occupancyRate ??
    Number(
      document.getElementById("occupancy")?.value
    ),

  occupancyRate:
    occupancy ??
    occupancyRate ??
    Number(
      document.getElementById("occupancy")?.value
    ),

  priceNight:
    priceNight ?? null,

  expenses:
    expenses ?? null,

  city:
    selectedCity ||
    marketCity ||
    window.currentCity ||
    null

};

console.log(
  "🧠 CHATBOT LIVE:",
  window.rbChatbotData
);

// =====================================
// 🔥 LIVE ENGINE
// =====================================

window.rbChatbotLive = {
  ...window.rbChatbotData
};

console.log(
  "🧠 CHATBOT LIVE:",
  window.rbChatbotLive
);

// =====================================
// 💾 LAST ANALYSIS MEMORY
// =====================================

window.lastAnalysisData = {

  roi:
    roi ??
    safeROI ??
    0,

  visualROI:
    visualROI ??
    safeROI ??
    roi ??
    0,

  gross:
    gross ??
    annualRevenue ??
    0,

  net:
    net ??
    0,

  annualProfit:
    net ??
    0,

  revenueAnnual:
    gross ??
    annualRevenue ??
    0,

  monthlyIncome:
    Math.round(
      (gross ?? 0) / 12
    ),

  monthlyProfit:
    Math.round(
      (net ?? 0) / 12
    ),

  occupancy:
    occupancy ??
    occupancyRate ??
    0,

  priceNight:
    priceNight ??
    nightly ??
    0,

  expenses:
    expenses ??
    monthlyCosts ??
    0,

  totalExpenses:
    (
      expenses ??
      monthlyCosts ??
      0
    ) * 12,

  equity:
    equity ??
    0,

  loan:
loanAmount ??
window.loan ??
window.mortgage ??
window.mortgageAmount ??
0,

mortgageAmount:
loanAmount ??
window.loan ??
window.mortgage ??
window.mortgageAmount ??
0,

monthlyMortgagePayment:
  Number(window.monthlyMortgage || 0),

  price:
    price ??
    0,

  city:
    selectedCity ||
    marketCity ||
    window.currentCity ||
    "Roma",

  timestamp:
    Date.now()

};

// =====================================
// 🧠 CITY MEMORY ENGINE
// SAFE VERSION — NO CONFLICTS
// =====================================

if (!window.rbCityMemory) {

  window.rbCityMemory = {};

}

// =====================================
// 🌍 ACTIVE CITY
// =====================================

const memoryCity = (

  window.currentCity ||

  sessionStorage.getItem("tool_city") ||

  marketCity ||

  document.getElementById("market-city")?.value ||

  "roma"

)
.toLowerCase()
.trim();

// =====================================
// 💾 SAVE CURRENT SIMULATION
// =====================================

window.rbCityMemory[memoryCity] = {

  // ROI
  roi:
    Number(
      roi ??
      realROI ??
      visualROI ??
      0
    ),

  visualROI:
    Number(
      visualROI ??
      roi ??
      0
    ),

  realROI:
    Number(
      realROI ??
      roi ??
      visualROI ??
      0
    ),

  // PROFIT
  net:
    Number(
      net ??
      annualNet ??
      yearlyProfit ??
      0
    ),

  annualProfit:
    Number(
      net ??
      annualNet ??
      yearlyProfit ??
      0
    ),

  monthlyProfit:
    Math.round(

      Number(
        net ??
        annualNet ??
        yearlyProfit ??
        0
      ) / 12

    ),

  // REVENUE
  gross:
    Number(
      gross ??
      annualRevenue ??
      revenueAnnual ??
      0
    ),

  annualRevenue:
    Number(
      gross ??
      annualRevenue ??
      revenueAnnual ??
      0
    ),

  monthlyRevenue:
    Math.round(

      Number(
        gross ??
        annualRevenue ??
        revenueAnnual ??
        0
      ) / 12

    ),

  // OPERATIONS
  occupancy:
    Number(
      occupancy ??
      occupancyRate ??
      0
    ),

  priceNight:
    Number(
      priceNight ??
      nightly ??
      0
    ),

  expenses:
    Number(
      expenses ??
      monthlyCosts ??
      0
    ),

  totalExpenses:

    Number(
      expenses ??
      monthlyCosts ??
      0
    ) * 12,

  // PROPERTY
  propertyPrice:
    Number(
      price ??
      propertyPrice ??
      purchasePrice ??
      0
    ),

  equity:
    Number(
      equity ??
      cash ??
      initialCash ??
      0
    ),

  loanAmount:
  Math.max(
    0,
    Number(

      loanAmount ??
      mortgageAmount ??

      (
        Number(
          price ??
          propertyPrice ??
          purchasePrice ??
          0
        ) -

        Number(
          equity ??
          cash ??
          initialCash ??
          0
        )

      )

    )
  ),

  // META
  city:
    memoryCity,

  updatedAt:
    Date.now()

};

// =====================================
// 🧠 GLOBAL LAST ANALYSIS
// =====================================

window.lastAnalysisData = {
  ...window.lastAnalysisData,
  ...window.rbCityMemory[memoryCity]
};
    
// =====================================
// 🔒 SAFE VARIABLES
// =====================================

const safePropertyPrice = Number(

  window.lastAnalysisData?.propertyPrice ??

  price ??

  purchasePrice ??

  document.getElementById("purchase-price")
    ?.value ??

  0

);

const safeEquity = Number(

  window.lastAnalysisData?.equity ??

  equity ??

  initialCapital ??

  cash ??

  0

);

const safeGross =

  typeof gross !== "undefined"
    ? gross
    : (
        typeof annualRevenue !== "undefined"
          ? annualRevenue
          : (
              window.lastAnalysisData?.gross ??
              0
            )
      );

const safeExpenses =

  typeof expenses !== "undefined"
    ? expenses
    : (
        typeof monthlyCosts !== "undefined"
          ? monthlyCosts
          : (
              window.lastAnalysisData?.expenses ??
              0
            )
      );
// =====================================
// 🔥 DEBUG
// =====================================

console.log(
  "🧠 CITY MEMORY UPDATED:",
  memoryCity,
  window.rbCityMemory[memoryCity]
);

console.log(
  "💾 LAST ANALYSIS SAVED:",
  window.lastAnalysisData
);

// ===============================================
// 🧠 AI INVESTMENT MEMORY SNAPSHOT
// ===============================================

if(!window.rbChatMemory){
  window.rbChatMemory = {};
}

if(!window.rbChatMemory.investmentHistory){
  window.rbChatMemory.investmentHistory = [];
}

const newSnapshot = {

  city:
    window.currentCity || "roma",

marketCity:
    window.currentCity || "roma",

realCity:
    window.currentCity || "roma",

  roi:
  Number(
    visualROI ??
    finalROI ??
    roi ??
    0
  ),

realROI:
  Number(
    result?.realROI ??
    realROI ??
    safeROI ??
    0
  ),

visualROI:
  Number(
    visualROI ??
    finalROI ??
    roi ??
    0
  ),

  gross:
    gross ?? 0,

  net:
    net ?? 0,

  expenses:
    expenses ?? 0,

  risk:
    risk ?? 0,

  occupancy:
    occupancy ?? 0,

  propertyPrice:
    price ?? 0,

  equity:
    equity ?? 0,

  mortgage:
    loanAmount ?? 0,

  timestamp:
    Date.now()

};

const lastSnapshot =
  window.rbChatMemory.investmentHistory[
    window.rbChatMemory.investmentHistory.length - 1
  ];

const isDuplicate =

  lastSnapshot &&

  lastSnapshot.city === newSnapshot.city &&

  Math.abs(
    (lastSnapshot.realROI || 0) -
    (newSnapshot.realROI || 0)
  ) < 0.01 &&

  Math.abs(
    (lastSnapshot.propertyPrice || 0) -
    (newSnapshot.propertyPrice || 0)
  ) < 1;

if(!isDuplicate){

  window.rbChatMemory.investmentHistory.push(
    newSnapshot
  );

}
    
// 🔥 KEEP ONLY LAST 10

window.rbChatMemory.investmentHistory =
  window.rbChatMemory
    .investmentHistory
    .slice(-10);

console.log(
  "🧠 INVESTMENT MEMORY:",
  window.rbChatMemory.investmentHistory
);

// =====================================
// 🌍 GLOBAL INVESTMENT HISTORY SYNC
// =====================================

window.investmentHistory =
  window.rbChatMemory.investmentHistory;

window.rbInvestmentMemory =
  window.rbChatMemory.investmentHistory;

console.log(
  "🌍 GLOBAL HISTORY SYNC:",
  window.investmentHistory
);   
    // ================= RISK PREVIEW =================

const riskPreview = document.getElementById("risk-preview");

if(riskPreview){

  if(access.isFree){

    riskPreview.innerText = "—";

  }else{

    riskPreview.innerText = Math.round(risk) + "/100";

  }

}

    // ================= UI =================
    ["roi-live","roi-preview-live","roi-card-live"].forEach(id=>{

      const el = document.getElementById(id);

      if(!el) return;

      // 🔒 FREE
      if(
        access.isFree &&
        !access.isInvestor &&
        !access.isPro &&
        !access.isAdmin
      ){

        el.innerText = "—";

      }else{

        el.innerText = roiText;

      }

    });

    const profitEl = document.getElementById("profit-live");

    if(profitEl){
      profitEl.innerText = formatCurrency(net);
    }

    const revenueEl = document.getElementById("revenue-live");

    if(revenueEl){
      revenueEl.innerText = access.isFree
        ? "—"
        : formatCurrency(gross);
    }

    renderUniversalKPI({
      net,
      revenue: gross,
      investment: price
    });
    
     // =====================================
    // 🤖 POST ANALYSIS AI
    // =====================================

     const loan =
  Math.max(
    0,
    (price || 0) - (equity || 0)
  );

runPostAnalysis(result,{

  price,

  gross,

  occupancy,

  priceNight,

  expenses,

  equity,

  loanAmount: loan,

  mortgage: loan,

  net,

  mortgageRate:
    interestRate || 0,

  monthlyMortgage:
    result?.monthlyMortgage || 0

});
    // ================= MARKET =================
    if(access.isFree){

      renderMarketComparison?.(0, window.currentCity);

      document.querySelectorAll(`
        #market-comparison,
        #revenue-forecast,
        #occupancy-sensitivity,
        #investment-ranking,
        #investment-risk-meter,
        #ai-insights
      `).forEach(el=>{
        if(el) applySmartLock(el, { type:"blur" });
      });

    }else if(access.isInvestor){

  // =====================================
  // 🔓 RESET BLUR INVESTOR
  // =====================================

  document.querySelectorAll(`
    #market-comparison,
    #revenue-forecast,
    #occupancy-sensitivity,
    #investment-ranking,
    #investment-risk-meter,
    #ai-insights
  `).forEach(el=>{

    if(!el) return;

    el.classList.remove(
      "pro-blur",
      "blur-content",
      "locked",
      "locked-content",
      "premium-lock"
    );

    el.style.filter = "none";
    el.style.webkitFilter = "none";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";

    // 🔥 rimuove overlay eventuali
    el.querySelectorAll(`
      .lock-overlay,
      .results-overlay,
      .upgrade-overlay
    `).forEach(o=>o.remove());

  });

  // =====================================
  // 📊 INVESTOR DATA
  // =====================================

  renderMarketBenchmark?.(
    window.currentCity || "roma"
  );

  renderMarketComparison?.(
    gross * 0.6,
    window.currentCity
  );

  renderRevenueForecast?.(gross);

}else{

      renderMarketBenchmark?.(window.currentCity || "roma");
      renderMarketComparison?.(gross, window.currentCity);
      renderRevenueForecast?.(gross);
      renderOccupancySensitivity?.();

    }

    // ================= FUNNEL =================

// 🔥 consideriamo FREE anche utente non loggato
const isFreeUser = !access.isPro && !access.isInvestor && !access.isAdmin;

if(window.firebaseReady && isFreeUser && roi > 10){

  console.log("🔥 TRIGGER UPGRADE FLOW", {
    roi,
    access
  });

  triggerFunnel({ roi });

}

} catch(err){

  console.error("💥 CALCULATE ERROR:", err);

} finally {

  window.isCalculating = false;

}
};
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

// 🔥 DESTROY PRECEDENTE
if(window.roiChartInstance){
  window.roiChartInstance.destroy();
}

// 🔥 CREA NUOVO CHART
window.roiChartInstance = new Chart(ctx,{

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

// ================= MAIN ROI CHART (FIX DEFINITIVO) =================
function renderROIChart(roi){

  const canvas = document.getElementById("roiChart");

  if(!canvas){
    console.warn("⛔ roiChart non trovato");
    return;
  }

  if(typeof Chart === "undefined"){
    console.warn("⛔ Chart.js non caricato");
    return;
  }

  const ctx = canvas.getContext("2d");

  // 🔥 destroy vecchio
  if(window.mainROIChart){
    window.mainROIChart.destroy();
  }

  // 🔥 colore dinamico
  let color = "#ef4444";

  if(roi >= 20){
    color = "#10b981";
  }
  else if(roi >= 10){
    color = "#f59e0b";
  }

  window.mainROIChart = new Chart(ctx,{

    type:"doughnut",

    data:{
      labels:["ROI","Remaining"],

      datasets:[{
        data:[
          Math.min(roi,100),
          Math.max(0,100-roi)
        ],

        backgroundColor:[
          color,
          "#e5e7eb"
        ],

        borderWidth:0
      }]
    },

    options:{
      responsive:true,
      maintainAspectRatio:false,
      cutout:"78%",

      plugins:{
        legend:{
          display:false
        },

        tooltip:{
          enabled:false
        }
      }
    }

  });

}

// ================= AUTO INIT =================
document.addEventListener("DOMContentLoaded", ()=>{

  // ================= INIT BASE =================
  setTimeout(renderCityROIChart, 300);

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
// 🔥 SMART SEARCH TRIGGER (ENTER + ICON)
// =====================================

(function(){

  const input = document.getElementById("city-search-input");
  const btn   = document.getElementById("city-search-btn");

  if(!input) return;

  // ================= NORMALIZE =================
  function getCity(){
    return input.value?.toLowerCase().trim();
  }

  // ================= ACTION =================
  function runSearch(){

    const city = getCity();

    if(!city) return;

    console.log("🔍 SEARCH CITY:", city);

    // 🔥 usa il tuo sistema già esistente
    if(typeof window.selectCity === "function"){
      window.selectCity(city);
    } else {
      window.location.href = `/tool/?city=${encodeURIComponent(city)}`;
    }

  }

  // ================= ENTER =================
  input.addEventListener("keydown",(e)=>{
    if(e.key === "Enter"){
      runSearch();
    }
  });

  // ================= CLICK ICON =================
  btn?.addEventListener("click", runSearch);

})();

// =====================================
// 🔥 SMART CITY AUTOCOMPLETE (AIRBNB UX)
// =====================================

(function(){

  const input = document.getElementById("city-search-input");
  const box   = document.getElementById("city-suggestions");

  if(!input || !box) return;

  const data = window.RB_CITY_DATA || [];

  // ================= RENDER =================
  function renderList(list){

    if(!list.length){
      box.style.display = "none";
      return;
    }

    box.innerHTML = list.map(city=>{

      const label = window.t(
        city.label.it,
        city.label.en
      );

      return `
        <div class="city-suggestion-item" data-city="${city.name}">
          <span>${label}</span>
          <span class="city-roi">${city.roi}</span>
        </div>
      `;
    }).join("");

    box.style.display = "block";
  }

  // ================= INPUT =================
  input.addEventListener("input", ()=>{

    const val = input.value.toLowerCase().trim();

    if(val.length < 2){
      box.style.display = "none";
      return;
    }

    let filtered = data.filter(c =>
      c.name.includes(val) ||
      c.label.it.toLowerCase().includes(val)
    );

    // 🔥 fallback intelligente (input libero sempre valido)
    if(filtered.length === 0){
      filtered = [{
        name: val,
        label: {
          it: `Cerca "${val}"`,
          en: `Search "${val}"`
        },
        roi: "—"
      }];
    }

    renderList(filtered);

  });

  // ================= FOCUS =================
  input.addEventListener("focus", ()=>{

    if(input.value.length >= 2){
      input.dispatchEvent(new Event("input"));
    }

  });

  // ================= CLICK SUGGERIMENTO =================
  box.addEventListener("click",(e)=>{

    const item = e.target.closest(".city-suggestion-item");
    if(!item) return;

    const city = item.dataset.city;

    input.value = city;
    box.style.display = "none";

    if(typeof window.selectCity === "function"){
      window.selectCity(city);
    } else {
      window.location.href = `/tool/?city=${encodeURIComponent(city)}`;
    }

  });

  // ================= CLICK OUTSIDE =================
  document.addEventListener("click",(e)=>{
    if(!e.target.closest(".city-input-wrapper")){
      box.style.display = "none";
    }
  });

})();

// =====================================
// 🌍 GOOGLE PLACES FALLBACK (READY)
// =====================================

window.initCityAutocomplete = function(){

  if(!window.google || !google.maps || !google.maps.places){
    console.warn("⚠️ Google Places non caricato");
    return;
  }

  const input = document.getElementById("city-search-input");
  if(!input) return;

  const autocomplete = new google.maps.places.Autocomplete(input,{
    types:["(cities)"],
    componentRestrictions:{ country:"it" }
  });

  autocomplete.addListener("place_changed", ()=>{

    const place = autocomplete.getPlace();

    if(!place || !place.name) return;

    const city = place.name.toLowerCase();

    console.log("🌍 GOOGLE CITY:", city);

    if(typeof window.selectCity === "function"){
      window.selectCity(city);
    } else {
      window.location.href = `/tool/?city=${encodeURIComponent(city)}`;
    }

  });

};

// ================= 🌆 AUTO LOAD CITY FROM URL (FINAL FIX) =================
(function(){

  const params = new URLSearchParams(window.location.search);
  const cityParam = params.get("city");

  if(!cityParam) return;

  const city = cityParam.toLowerCase().trim();

  console.log("🌆 City from URL:", city);

  // ================= SAVE =================
  localStorage.setItem("selected_city", city);

  // ================= UI SYNC (INPUT REALE) =================

  // 🔥 input testuale (quello visibile tipo "Portici")
  const textInput = document.querySelector("input[placeholder*='Portici']");

  if(textInput){
    textInput.value = city;
    textInput.dispatchEvent(new Event("input"));
    textInput.dispatchEvent(new Event("change"));
  }

  // 🔥 select città (se presente)
  const selectInput = document.querySelector("select");

  if(selectInput){

    const options = [...selectInput.options];

    const match = options.find(opt =>
      opt.value?.toLowerCase() === city ||
      opt.textContent?.toLowerCase().includes(city)
    );

    if(match){
      selectInput.value = match.value;
      selectInput.dispatchEvent(new Event("change"));
    }

  }

  // ================= MARKET ENGINE =================
  if(typeof renderMarketBenchmark === "function"){
    renderMarketBenchmark(city);
  }

  // ================= BACKGROUND SYNC =================
  if(typeof changeCityBackground === "function"){

    const map = {
      roma: "rome",
      napoli: "naples",
      milano: "milan",
      firenze: "florence"
    };

    if(!map[city]){
      console.warn("⚠️ City non mappata:", city);
    }

    changeCityBackground(map[city] || city);
  }

  // ================= UX BOOST (SCROLL) =================
  setTimeout(()=>{

    const target =
      document.querySelector("#simulation-section") ||
      document.querySelector(".simulation-container") ||
      document.querySelector("#simulator");

    if(target){
      target.scrollIntoView({behavior:"smooth"});
    }

  }, 400);

  // ================= AUTO TRIGGER CALC (FORZATO) =================
  setTimeout(()=>{

    if(typeof calculate === "function"){
      console.log("🚀 AUTO CALCULATE TRIGGER");
      calculate(true);
    }

  }, 800);

})();
// ================= AUTO LOAD PROPERTY FROM TOOL (NUOVO) =================

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const urlFromQuery = params.get("listing");

  const savedUrl = localStorage.getItem("listing_url");

  const finalUrl = urlFromQuery || savedUrl;

  if(finalUrl){

  console.log("📥 AUTO LOAD PROPERTY:", finalUrl);

  // 🔥 FIX PROMEMORIA
  localStorage.setItem("property_link", finalUrl);

  // 👉 input tool
  const input = document.getElementById("listing_url");
  if(input) input.value = finalUrl;

  // 👉 trigger analisi (SAFE)
  setTimeout(() => {
    if(typeof analyzePropertyFromTool === "function"){
      analyzePropertyFromTool(finalUrl);
    } else {
      console.warn("⚠️ analyzePropertyFromTool non trovata");
    }
  }, 300);

  // 👉 cleanup SOLO listing_url (non property_link!)
  localStorage.removeItem("listing_url");

}

});
// ================= ANALYZE BUTTON FIX (CRITICO) =================

const analyzeBtn = document.getElementById("analyze-btn");

if(analyzeBtn){

  analyzeBtn.addEventListener("click", () => {

    console.log("🔥 CLICK ANALYZE");

    // 🔥 RIMUOVE overlay che possono bloccare click
    document.querySelectorAll(`
      .lock-overlay,
      .results-overlay,
      .upgrade-overlay,
      .smart-overlay,
      .paywall-mini,
      .home-blur-overlay
    `).forEach(el => {
      if(el.id !== "register-popup") el.remove();
    });

    if(typeof window.calculate === "function"){

  console.log("🚀 CALCULATE TRIGGER");

  window.__MANUAL_ANALYSIS__ = true;

  window.calculate();

  setTimeout(()=>{

    console.log(
      "🔥 SAVE ANALYSIS FIRED"
    );

    const roi =
      window.lastAnalysisData?.roi || 0;

    if(roi > 6){

      triggerFunnel({
        type:"roi",
        roi
      });

    }

    // 🔥 RESET FLAG SOLO ALLA FINE
    window.__MANUAL_ANALYSIS__ = false;

  },1500);

} else {

  console.error(
    "❌ calculate non trovata"
  );

}

  });

}

// ================= EXECUTIVE PDF – BANK REAL FINAL =================

window.generateExecutivePDF = async function(){

const access = window.getUserAccess();
const isEN = window.currentLang === "en";
const T = (it,en)=> isEN ? en : it;

if(access.isInvestor){ openUpgradeModal("pro"); return; }
if(access.isFree){ openUpgradeModal("investor"); return; }
if(!access.canSeeFullAnalysis){ openUpgradeModal("pro"); return; }

if(!window.lastAnalysisData){
  showToast(T("Genera prima analisi","Run analysis first"));
  return;
}

const { jsPDF } = window.jspdf;
const doc = new jsPDF();

const d = window.lastAnalysisData;

console.log("LAST ANALYSIS DATA", {
    roi: d.roi,
    realROI: d.realROI,
    visualROI: d.visualROI,
    risk: d.risk,
    gross: d.gross,
    net: d.net
});

// ================= SAFE =================
const safe = v => isFinite(v) ? Number(v) : 0;

// ROI dell'investimento (su equity)
const roi = safe(
  d.roi
);

// ROI sul valore dell'immobile
const realROI = safe(
  d.realROI ?? d.roi
);

// Solo per grafici con scala massima 45%
const chartROI = Math.max(
  0,
  Math.min(
    roi,
    45
  )
);

console.log("CHECK PDF VARIABLES", {
    roi,
    realROI,
    chartROI
});
  
const riskScore = Math.max(
  0,
  Math.min(
    100,
    safe(
      d.risk ??
      d.riskScore ??
      window.riskScore ??
      0
    )
  )
);
  
// ================= SAFE FINANCIAL DATA =================

const revenue = safe(
  d.revenueAnnual ??
  d.gross ??
  d.revenue
);

const profit = safe(
  d.annualProfit ??
  d.net ??
  d.netAfterMortgage ??
  d.profit
);

const price = safe(

  d.propertyPrice ??

  d.price ??

  d.purchasePrice ??

  0

);

const equity = safe(
  d.equity
);

const loan = safe(
  d.mortgageAmount ??
  d.loan ??
  d.loanAmount
);

const monthly = Math.round(
  safe(
    d.monthlyProfit ??
    (profit / 12)
  )
);

const realCityInput =
  document.getElementById("custom-location")?.value?.trim();

const city =
  realCityInput ||
  d.realCity ||
  window.currentCity ||
  d.marketCity ||
  sessionStorage.getItem("tool_city") ||
  localStorage.getItem("selected_city") ||
  "roma";

// ================= FORMAT =================
const eur = v => "€" + safe(v).toLocaleString("it-IT",{maximumFractionDigits:0});
const pct = v => {

  const n = safe(v);

  return Number.isInteger(n)
    ? n + "%"
    : n.toFixed(1) + "%";

};

// ================= RATING =================
let rating = "Moderate";

if(roi >= 25){
  rating = "Outstanding";
}
else if(roi >= 18){
  rating = "Investment Grade";
}
else if(roi >= 12){
  rating = "Strong Opportunity";
}
else if(roi >= 8){
  rating = "Stable";
}
else{
  rating = "Speculative";
}

// ================= COLORS =================
const green = [16,185,129];
const dark = [15,23,42];
const gray = [100,116,139];

// ================= LOGO =================
let logo = null;
try{
  const res = await fetch("/img/logo-report.png");
  const blob = await res.blob();
  const reader = new FileReader();
  logo = await new Promise(r=>{
    reader.onloadend = ()=>r(reader.result);
    reader.readAsDataURL(blob);
  });
}catch(e){}

// ================= FOOTER =================
const footer = ()=>{

  doc.setDrawColor(230);
  doc.line(15,270,195,270);

  doc.setFontSize(8);
  doc.setTextColor(...gray);

  doc.text(
    "RendimentoBB Executive Investment Report",
    20,
    278
  );

  doc.text(
    new Date().toLocaleDateString(),
    105,
    278,
    {align:"center"}
  );

  doc.text(
    "Confidential",
    190,
    278,
    {align:"right"}
  );

};

  // ================= ROW HELPER =================

function row(label, value){

  doc.setFontSize(10);
  doc.setTextColor(...gray);

  doc.text(
    String(label),
    20,
    y
  );

  doc.setTextColor(...dark);

  doc.text(
    String(value),
    190,
    y,
    { align:"right" }
  );

  y += 10;

}

// ===================================================
// COVER
// ===================================================

doc.setFillColor(245,247,250);
doc.rect(0,0,210,297,"F");

// ================= LOGO =================

if(logo){
  doc.addImage(
    logo,
    "PNG",
    20,
    22,
    54,
    15
  );
}

// ================= REPORT LABEL =================

doc.setFontSize(9);
doc.setTextColor(...gray);

doc.text(
  "EXECUTIVE INVESTMENT REPORT",
  20,
  55
);

// ================= TITLE =================

doc.setTextColor(...dark);

doc.setFontSize(24);

doc.text(
  T(
    "Executive Investment Report",
    "Executive Investment Report"
  ),
  20,
  72
);

// ================= SUBTITLE =================

doc.setFontSize(11);

doc.setTextColor(...gray);

doc.text(
  T(
    "Analisi professionale per investimenti short-rent",
    "Professional analysis for short-rent investments"
  ),
  20,
  84
);

// ================= AI ENGINE =================

doc.setFontSize(9);

doc.text(
  T(
    "Generato da RendimentoBB AI Executive Engine",
    "Generated by RendimentoBB AI Executive Engine"
  ),
  20,
  94
);

// ================= MARKET =================

doc.setFontSize(10);

doc.text(
  T("Mercato","Market") +
  " • " +
  city.charAt(0).toUpperCase() +
  city.slice(1),
  20,
  112
);

// ================= ROI =================

doc.setTextColor(...green);

doc.setFontSize(40);

doc.text(
  pct(roi),
  20,
  158
);

// ================= ROI LABEL =================

doc.setFontSize(11);

doc.setTextColor(...gray);

doc.text(
  T(
    "Investment Return",
    "Investment Return"
  ),
  22,
  168
);

// ================= ROI BAR =================

doc.setFillColor(230,230,230);

doc.roundedRect(
  20,
  178,
  120,
  8,
  4,
  4,
  "F"
);

// ================= RATING =================

doc.setFontSize(13);

doc.setTextColor(...dark);

doc.text(
  rating,
  20,
  200
);

// =====================================
// EXECUTIVE BADGES
// =====================================

// ================= REAL AI SCORE =================

const aiScore =
  window.lastInvestmentScore?.score ?? null;

const aiLabel =
  window.lastInvestmentScore?.label ||
  window.lastInvestmentScore?.verdict ||
  null;

const fallbackScore =
  roi >= 20 ? 90 :
  roi >= 15 ? 83 :
  roi >= 10 ? 72 :
  roi >= 7 ? 60 : 45;

const investmentScore =
  aiScore != null
    ? Number(aiScore)
    : fallbackScore;

const verdict =
  aiLabel ||
  (investmentScore >= 80
    ? "BUY"
    : investmentScore >= 65
      ? "WATCH"
      : "AVOID"
  );

const confidence =
  window.lastInvestmentScore?.confidence ||
  (
    investmentScore >= 80
      ? "92%"
      : investmentScore >= 65
        ? "84%"
        : "73%"
  );

// ================= UI CARD =================

doc.setFillColor(255,255,255);

doc.roundedRect(20,228,170,28,6,6,"F");

doc.setDrawColor(235);

doc.roundedRect(20,228,170,28,6,6);

// HEADERS

doc.setFontSize(8);

doc.setTextColor(...gray);

doc.setFontSize(7);

doc.text("AI Score",28,239);
doc.text("Verdict",82,239);
doc.text("Risk",122,239);
doc.text("Confidence",154,239);

// VALUES

doc.setFontSize(13);

doc.setTextColor(...dark);

doc.text(String(investmentScore),28,249);

doc.text(verdict,82,249);

doc.text(
  riskScore < 40
    ? "Low"
    : riskScore < 65
      ? "Moderate"
      : "High",
  122,
  249
);

doc.text(
  String(confidence).endsWith("%")
    ? String(confidence)
    : String(confidence) + "%",
  154,
  249
);

// ===================================================
// EXECUTIVE
// ===================================================

doc.addPage();

if(logo){
  doc.addImage(logo,"PNG",20,10,40,12);
}

doc.setFontSize(14);
doc.setTextColor(...dark);
doc.text(
  T(
    "Executive Investment Overview",
    "Executive Investment Overview"
  ),
  20,
  30
);

doc.setFontSize(9);
doc.setTextColor(...gray);

doc.text(
  T(
    "Sintesi strategica dell'investimento generata dall'AI.",
    "Strategic investment summary generated by AI."
  ),
  20,
  38
);  

let y = 52;

// =====================================
// HERO EXECUTIVE CARD
// =====================================

doc.setFillColor(15,23,42);
doc.roundedRect(20,y,170,40,8,8,"F");

// ROI
doc.setTextColor(255);

doc.setFontSize(26);
doc.text(
  pct(roi),
  28,
  y + 22
);

doc.setFontSize(9);

doc.text(
  "RETURN ON INVESTMENT",
  28,
  y + 10
);

// Rating badge
doc.setFillColor(255,255,255);

doc.roundedRect(
  132,
  y + 7,
  48,
  16,
  5,
  5,
  "F"
);

doc.setTextColor(...dark);

doc.setFontSize(10);

doc.text(
  rating,
  156,
  y + 17,
  {align:"center"}
);

doc.setFontSize(7);

doc.setTextColor(...green);

doc.text(
  "AI VERIFIED",
  156,
  y + 24,
  {
    align:"center"
  }
);  

// Executive label
doc.setFontSize(8);

doc.setTextColor(220);

doc.text(
  "Executive AI Assessment",
  132,
  y + 31,
  {align:"center"}
);

y += 50;

doc.setFontSize(10);

doc.setTextColor(...dark);

doc.text(
  T(
    "Key Investment Metrics",
    "Key Investment Metrics"
  ),
  20,
  y - 6
);  

// =====================================
// EXECUTIVE KPI CARDS
// =====================================

const executiveKPIs = [

{
title:T("Prezzo immobile","Property Price"),
value:eur(price),
subtitle:T("Asset Value","Asset Value")
},

{
title:T("Ricavi annui","Annual Revenue"),
value:eur(revenue),
subtitle:T("Gross Income","Gross Income")
},

{
title:T("Cashflow netto","Net Cashflow"),
value:eur(profit),
subtitle:
profit >= 0
? T("Positive","Positive")
: T("Negative","Negative")
},

{
title:"ROI",
value:pct(roi),
subtitle:rating
}

];

const cardW = 38;
const cardH = 40;
const gap = 6;

executiveKPIs.forEach((card,i)=>{

const x = 20 + i*(cardW+gap);

doc.setFillColor(250,250,252);

doc.roundedRect(
x,
y,
cardW,
cardH,
5,
5,
"F"
);

doc.setDrawColor(235);

doc.roundedRect(
x,
y,
cardW,
cardH,
5,
5
);

// titolo

doc.setFontSize(7);

doc.setTextColor(...gray);

doc.text(
card.title,
x+3,
y+8,
{
maxWidth:32
}
);

// valore

doc.setFontSize(11);

doc.setTextColor(...dark);

doc.text(
card.value,
x+3,
y+22
);

// sottotitolo

doc.setFontSize(7);

doc.setTextColor(...green);

doc.text(
card.subtitle,
x+3,
y+34
);

});

y += 52;

// ===================================================
// PERFORMANCE ANALYSIS
// ===================================================

y += 8;

doc.setFontSize(13);
doc.setTextColor(...dark);

doc.text(
  T("Analisi performance","Performance analysis"),
  20,
  y
);

doc.setFontSize(8);
doc.setTextColor(...gray);

doc.text(
  T(
    "Scenari previsionali basati su occupazione e mercato",
    "Forecast scenarios based on occupancy and market"
  ),
  20,
  y + 6
);

y += 18;

const cashflowScenarios = [
  {
    label:"Low",
    value: revenue * 0.85,
    color:[239,68,68]
  },
  {
    label:"Base",
    value: revenue,
    color:[59,130,246]
  },
  {
    label:"High",
    value: revenue * 1.10,
    color:[16,185,129]
  }
];

const maxVal = revenue * 1.15;

cashflowScenarios.forEach(s=>{

  // LABEL
  doc.setFontSize(9);
  doc.setTextColor(...dark);

  doc.text(
    s.label,
    20,
    y + 4
  );

  // BG BAR
  doc.setFillColor(230,230,230);

  doc.roundedRect(
    38,
    y,
    92,
    7,
    3,
    3,
    "F"
  );

  // VALUE BAR
  const w = Math.max(
  0,
  Math.min(
    92,
    safe((s.value / maxVal) * 92)
  )
);

  doc.setFillColor(...s.color);

  doc.roundedRect(
    38,
    y,
    w,
    7,
    3,
    3,
    "F"
  );

  // VALUE TEXT
  doc.setFontSize(9);
  doc.setTextColor(...dark);

  doc.text(
    eur(s.value),
    138,
    y + 5
  );

  y += 16;

});

  // =====================================
// AI EXECUTIVE INSIGHT
// =====================================

y += 8;

doc.setFillColor(245,248,252);

doc.roundedRect(
20,
y,
170,
42,
6,
6,
"F"
);

doc.setFontSize(11);

doc.setTextColor(...dark);

doc.text(
T(
"Executive AI Insight",
"Executive AI Insight"
),
25,
y+10
);

doc.setFontSize(9);

doc.setTextColor(...gray);

let executiveInsight =
T(
"Investimento con buona sostenibilità finanziaria. Il cashflow previsto supporta una gestione stabile e la redditività risulta coerente con il mercato analizzato.",
"Investment shows good financial sustainability. Expected cashflow supports stable operations and profitability is consistent with the analysed market."
);

if(roi >= 18){

executiveInsight =
T(
"Investimento ad alta redditività con ottimo equilibrio tra rendimento e rischio. Opportunità molto competitiva per il mercato selezionato.",
"High-return investment with an excellent balance between profitability and risk. Highly competitive opportunity for the selected market."
);

}

else if(roi < 8){

executiveInsight =
T(
"Il rendimento previsto risulta inferiore al benchmark di mercato. Si consiglia di rivalutare prezzo di acquisto, ADR o livello di occupazione.",
"Expected return is below the market benchmark. Review purchase price, ADR or occupancy assumptions."
);

}

doc.text(
executiveInsight,
25,
y+20,
{
maxWidth:155
}
);

y += 55;

footer();

// ===================================================
// LOAN (BANCA)
// ===================================================

doc.addPage();
y=30;

doc.setFontSize(14);
doc.setTextColor(...dark);
doc.text(T("Richiesta finanziamento","Loan request"),20,y);

y+=12;

const rate = 0.04;
const interest = loan * rate;
const net = profit - interest;
const safePrice = Math.max(price,1);

const ltv = (loan / safePrice) * 100;
let dscr = interest > 0
  ? profit / interest
  : 0;

// 🔥 SAFE LIMIT
if(!isFinite(dscr)){
  dscr = 0;
}

// 🔥 HARD CAP
dscr = Math.min(dscr, 4.5);

row(T("Importo richiesto","Requested loan"), eur(loan));
row("LTV", ltv.toFixed(1)+"%");
row("DSCR", dscr.toFixed(2));
row(
  T(
    "Cashflow dopo interessi",
    "Cashflow after interest"
  ),
  eur(net)
);

// DECISION
y+=10;

doc.setFillColor(dscr > 1.5 ? 16 : 200, dscr > 1.5 ? 185 : 50, dscr > 1.5 ? 129 : 50);
doc.roundedRect(20,y,170,18,6,6,"F");

doc.setTextColor(255);
doc.setFontSize(11);

doc.text(
dscr > 1.5
? T("Sostenibile per finanziamento","Financing sustainable")
: T("Rischio elevato credito","High credit risk"),
25,y+12
);

footer();

// ===================================================
// MARKET
// ===================================================

doc.addPage();

y = 30;

doc.setFontSize(14);
doc.setTextColor(...dark);

doc.text(
  T("Confronto mercato","Market comparison"),
  20,
  y
);

y += 12;

// =====================================
// MARKET SNAPSHOT
// =====================================

const benchmarkROI = 12; // benchmark medio temporaneo

doc.setFillColor(248,250,252);

doc.roundedRect(
20,
y,
170,
26,
5,
5,
"F"
);

doc.setDrawColor(230);

doc.roundedRect(
20,
y,
170,
26,
5,
5
);

doc.setFontSize(8);
doc.setTextColor(...gray);

doc.text(
T("Il tuo ROI","Your ROI"),
28,
y+8
);

doc.text(
T("Benchmark","Benchmark"),
88,
y+8
);

doc.text(
T("Posizione","Position"),
145,
y+8
);

doc.setFontSize(11);
doc.setTextColor(...dark);

doc.text(
pct(roi),
28,
y+19
);

doc.text(
pct(benchmarkROI),
88,
y+19
);

doc.setTextColor(...green);

doc.text(
roi >= benchmarkROI
? "TOP"
: T("Media","Average"),
145,
y+19
);

y += 38;  

// ================= MARKET DATA =================

const marketROIMap = {
  roma: 8.4,
  milano: 7.2,
  napoli: 11.5,
  firenze: 7.9
};

const marketKey =
  String(city)
    .toLowerCase()
    .trim();

const marketROI =
  marketROIMap[marketKey] || 8.4;

// ================= KPI =================

row(
  T("ROI tuo","Your ROI"),
  pct(roi)
);

row(
  T("ROI mercato","Market ROI"),
  pct(marketROI)
);

// ================= SPACING FIX =================

y += 14;

// ================= MARKET LABEL =================

doc.setFontSize(9);
doc.setTextColor(...gray);

doc.text(
  T("Performance mercato","Market performance"),
  20,
  y
);

// ================= BAR START =================

y += 8;

// ================= MARKET BAR BG =================

doc.setFillColor(230,230,230);

doc.roundedRect(
  20,
  y,
  150,
  10,
  5,
  5,
  "F"
);

// ================= ROI BAR =================

const compareWidth = Math.max(
  0,
  Math.min(
    135,
    safe((roi / (marketROI * 2)) * 135)
  )
);

doc.setFillColor(...green);

doc.roundedRect(
  20,
  y,
  compareWidth,
  10,
  5,
  5,
  "F"
);

// ================= LABEL VALUE =================

doc.setFontSize(8);
doc.setTextColor(...dark);

const compareLabel =
  `${pct(roi)} vs ${pct(marketROI)}`;

// 🔥 barra lunga → testo sotto
if(compareWidth > 105){

  doc.text(
    compareLabel,
    20,
    y + 18
  );

  y += 12;

}else{

  doc.text(
    compareLabel,
    175,
    y + 7,
    { align:"right" }
  );

  y += 18;

}

// ================= COMMENT BOX =================

doc.setFillColor(248,250,252);

doc.roundedRect(
  20,
  y,
  170,
  36,
  5,
  5,
  "F"
);

doc.setFontSize(10);
doc.setTextColor(...dark);

// 🔥 rinominato per evitare conflitto JS
const marketBenchmarkComment =
  roi > marketROI
    ? T(
        "L'operazione supera significativamente il benchmark medio di mercato.",
        "The investment significantly outperforms the average market benchmark."
      )
    : T(
        "L'operazione risulta in linea o sotto il benchmark medio di mercato.",
        "The investment performs in line with or below average market benchmark."
      );

doc.text(
  marketBenchmarkComment,
  25,
  y + 15,
  { maxWidth: 155 }
);

footer();

// ===================================================
// RISK ANALYSIS
// ===================================================

doc.addPage();

y = 30;

doc.setFontSize(14);
doc.setTextColor(...dark);

doc.text(
  T("Analisi rischio","Risk analysis"),
  20,
  y
);

y += 15;

const riskLabel =
  riskScore < 40
  ? T("Rischio basso","Low risk")
  : riskScore < 65
  ? T("Rischio moderato","Moderate risk")
  : T("Rischio elevato","High risk");

row(
  T("Indice rischio","Risk score"),
  riskScore + "/100"
);

row(
  T("Valutazione","Assessment"),
  riskLabel
);

y += 10;

doc.setFillColor(248,250,252);
doc.roundedRect(20,y,170,48,5,5,"F");

doc.setFontSize(10);

doc.text(
  T(
    "L'analisi considera sostenibilità del cashflow, leva finanziaria, benchmark di mercato e stabilità operativa.",
    "The analysis considers cashflow sustainability, leverage, market benchmark and operational stability."
  ),
  25,
  y + 15,
  { maxWidth: 155 }
);

footer();  

// ===================================================
// CASHFLOW
// ===================================================

doc.addPage();
y=30;

doc.setFontSize(14);
doc.text(T("Cashflow","Cashflow"),20,y);

y+=12;

row(T("Ricavi","Revenue"), eur(revenue));
row(T("Cashflow netto","Net cashflow"), eur(profit));
row(T("Mensile","Monthly"), eur(monthly));

y += 18;

doc.setFontSize(11);
doc.setTextColor(...dark);

doc.text(
  T("Scenari rendimento","Performance scenarios"),
  20,
  y
);

y += 12;

const cashflowFinalScenarios = [
  {
    label:"Low",
    value:profit * 0.8,
    color:[239,68,68]
  },
  {
    label:"Base",
    value:profit,
    color:[245,158,11]
  },
  {
    label:"High",
    value:profit * 1.2,
    color:[16,185,129]
  }
];

cashflowFinalScenarios.forEach(s=>{

  doc.setFillColor(...s.color);

  doc.roundedRect(20,y,90,10,4,4,"F");

  doc.setTextColor(255);

  doc.setFontSize(9);

  doc.text(
    s.label + " " + eur(s.value),
    25,
    y + 7
  );

  y += 16;

});  

console.log("ROI PDF", {
    roi,
    realROI
});

// ===================================================
// EXECUTIVE RECOMMENDATION
// ===================================================

doc.addPage();

y = 30;

doc.setFontSize(18);
doc.setTextColor(...dark);

doc.text(
  T(
    "Executive Recommendation",
    "Executive Recommendation"
  ),
  20,
  y
);

y += 14;

// ================= VERDICT BOX =================

doc.setFillColor(15,23,42);

doc.roundedRect(
  20,
  y,
  170,
  28,
  8,
  8,
  "F"
);

doc.setFontSize(18);
doc.setTextColor(255);

doc.text(
  verdict,
  28,
  y + 18
);

doc.setFontSize(9);

doc.text(
  T(
    "AI Investment Verdict",
    "AI Investment Verdict"
  ),
  90,
  y + 18
);

y += 42;

  doc.setFontSize(12);
doc.setTextColor(...dark);

// ================= EXECUTIVE INSIGHTS =================

doc.setFontSize(12);
doc.setTextColor(...dark);

doc.text(
T(
"Punti di forza",
"Executive Strengths"
),
20,
y
);

y += 10;

const insights = [];

// ROI
if (roi >= marketROI + 5) {

    insights.push(
        T(
            "📈 Il rendimento stimato è nettamente superiore alla media del mercato e rappresenta un investimento altamente competitivo.",
            "📈 Estimated returns are significantly above market averages and represent a highly competitive investment."
        )
    );

} else if (roi >= marketROI) {

    insights.push(
        T(
            "📈 Il ROI è superiore al benchmark della città e rappresenta un investimento competitivo.",
            "📈 ROI is above the city's benchmark and represents a competitive investment."
        )
    );

} else {

    insights.push(
        T(
            "📈 Il rendimento risulta inferiore al benchmark della città e merita ulteriori valutazioni.",
            "📈 Returns are below the city's benchmark and deserve further evaluation."
        )
    );

}

// Cashflow
if (profit >= 1500) {

    insights.push(
        T(
            "💰 Il cashflow mensile offre un'elevata capacità di generare liquidità.",
            "💰 Monthly cashflow provides excellent liquidity generation."
        )
    );

} else if (profit > 0) {

    insights.push(
        T(
            "💰 Il cashflow operativo rimane positivo e sostenibile.",
            "💰 Operating cashflow remains positive and sustainable."
        )
    );

} else {

    insights.push(
        T(
            "⚠️ Il cashflow risulta negativo e potrebbe compromettere la sostenibilità dell'investimento.",
            "⚠️ Cashflow is negative and may compromise investment sustainability."
        )
    );

}

// Risk
if (riskScore <= 30) {

    insights.push(
        T(
            "🛡️ Il livello di rischio è contenuto rispetto ai parametri analizzati.",
            "🛡️ Risk exposure remains low compared to analysed metrics."
        )
    );

} else if (riskScore <= 60) {

    insights.push(
        T(
            "⚠️ Il rischio è moderato e richiede monitoraggio operativo.",
            "⚠️ Risk is moderate and requires operational monitoring."
        )
    );

} else {

    insights.push(
        T(
            "🚨 Il rischio operativo è elevato e potrebbe ridurre la stabilità del rendimento.",
            "🚨 Operational risk is high and may reduce investment stability."
        )
    );

}

doc.setFontSize(9);
doc.setTextColor(...gray);

insights.forEach(item => {

    doc.text(
        "• " + item,
        25,
        y,
        {
            maxWidth: 155
        }
    );

    y += 8;

});

y += 8;
  
// ================= NEXT STEPS =================

doc.setFontSize(12);
doc.setTextColor(...dark);

doc.text(
T(
"Prossimi passi",
"Recommended Next Steps"
),
20,
y
);

y += 10;

const nextSteps = [];

// ROI
if (roi < 20) {

    nextSteps.push(

        T(
            "Valutare una riduzione del prezzo di acquisto o un aumento dei ricavi previsti.",
            "Consider negotiating a lower purchase price or increasing projected revenue."
        )

    );

}

// Occupancy
if (occupancy < 65) {

    nextSteps.push(

        T(
            "Incrementare il tasso di occupazione attraverso una strategia di pricing più efficace.",
            "Increase occupancy through a more effective pricing strategy."
        )

    );

}

// Cashflow
if (profit <= 0) {

    nextSteps.push(

        T(
            "Rivedere la struttura dei costi e del finanziamento per ottenere un cashflow positivo.",
            "Review operating costs and financing structure to achieve positive cashflow."
        )

    );

}

// Risk
if (riskScore > 50) {

    nextSteps.push(

        T(
            "Ridurre il livello di rischio migliorando leva finanziaria e margine operativo.",
            "Reduce investment risk by improving leverage and operating margins."
        )

    );

}

// Nessuna criticità rilevante
if (nextSteps.length === 0) {

    nextSteps.push(

        T(
            "L'investimento presenta parametri solidi: monitorare periodicamente i risultati operativi.",
            "The investment shows solid metrics: periodically monitor operating performance."
        )

    );

}

doc.setFontSize(9);
doc.setTextColor(...gray);

nextSteps.forEach(step=>{

doc.text(
"• " + step,
25,
y,
{
maxWidth:155
}
);

y += 8;

});

y += 10;

doc.setFontSize(8);
doc.setTextColor(...gray);

doc.text(
"T",
20,
y
);

doc.text(
T(
"Generated by RendimentoBB AI Executive Engine • 2026",
"Generated by RendimentoBB AI Executive Engine • 2026"
),
30,
y
);

footer();

// =====================================
// 🧠 REGISTER EXECUTIVE REPORT
// =====================================

if(
  typeof window.buildExecutiveReport ===
  "function"
){

 window.lastExecutiveReport =

  window.buildExecutiveReport({

    ...d,

    realROI:
      roi,

    risk:
      riskScore,

    net:
  profit,

annualProfit:
  profit,

cashflow:
  profit,

revenueAnnual:
  revenue,

equity:
  equity,

    investmentScore,

    verdict,

    confidence,

    reportType:
  "executive_pdf",

reportSource:
  "tool_report"

  });

}

// SAVE
doc.save(`RendimentoBB-Report-${roi.toFixed(1)}.pdf`);

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

if(detectedCity && !localStorage.getItem("selected_city")){
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

 // 🔥 DISABILITATO (BUG DOUBLE CALCULATE)
// if(
//   window.simulationExecuted &&
//   typeof window.calculate === "function" &&
//   !window.__preventRecalculate
// ){
//   window.__preventRecalculate = true;
//   setTimeout(()=>{
//     window.calculate(true);
//   },50);
// }

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

  const savedPrice =
Number(
  localStorage.getItem("property_price") || 0
);

const savedCity =
localStorage.getItem("property_city");

const savedSqm =
Number(
  localStorage.getItem("property_sqm") || 0
);

  console.log(
"🔥 AUTO IMPORT START",
{
  savedPrice,
  savedCity,
  savedSqm
}
);

console.log(
"🔥 IF CHECK:",
savedPrice > 0
);

  const propertyBanner =
document.getElementById(
  "property-banner"
);

if(propertyBanner){

  propertyBanner.style.display =
    "block";

  propertyBanner.innerHTML = `

<div style="
margin-bottom:20px;
padding:18px;
border-radius:14px;
background:linear-gradient(
135deg,
#ecfdf5,
#d1fae5
);
border:1px solid #10b981;
">

<div style="
font-weight:700;
font-size:16px;
color:#065f46;
margin-bottom:8px;
">

🏠 Immobile selezionato

</div>

<div>
📍 ${savedCity || "-"}
</div>

<div>
💰 €${savedPrice.toLocaleString()}
</div>

<div>
📐 ${savedSqm} m²
</div>

</div>

`;

}

if(savedPrice > 0){

  const priceInput =
  document.getElementById("price");

  if(priceInput){
    priceInput.value = savedPrice;
  }

  const equityInput =
  document.getElementById("equity");

  if(equityInput){
    equityInput.value =
    Math.round(savedPrice * 0.3);
  }

  if(savedCity){

    const citySelect =
    document.getElementById("market-city");

    if(citySelect){

  citySelect.value =
  savedCity.toLowerCase();

  citySelect.dispatchEvent(
    new Event("change")
  );

}

    window.currentCity =
    savedCity.toLowerCase();

    localStorage.setItem(
      "selected_city",
      savedCity.toLowerCase()
    );

  }

  console.log(
    "🏠 PROPERTY IMPORTED",
    {
      savedPrice,
      savedCity,
      savedSqm
    }
  );

  const propertyBanner =
document.getElementById(
  "property-banner"
);

if(propertyBanner){

  propertyBanner.style.display = "block";

  propertyBanner.innerHTML = `

  <div style="
  background:linear-gradient(135deg,#ecfdf5,#d1fae5);
  border:1px solid #10b981;
  border-radius:16px;
  padding:18px;
  margin-bottom:20px;
  box-shadow:0 8px 20px rgba(16,185,129,0.15);
  ">

    <div style="
    font-size:18px;
    font-weight:700;
    color:#065f46;
    margin-bottom:12px;
    ">
      🏠 Property Imported
    </div>

    <div>💰 Price: €${savedPrice.toLocaleString()}</div>

    <div>📐 Size: ${savedSqm} m²</div>

    <div>📍 City: ${savedCity}</div>

  </div>

  `;

}

  setTimeout(()=>{

  console.log(
    "🚫 AUTO CALCULATE DISABLED TEST"
  );

},1000);

}  

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
    selectedCity = city;

    window.__CITY_MANUAL__ = true;
    window.__CITY_FROM_INPUT__ = false;

    sessionStorage.setItem("tool_city", city);
    console.log("🏙 CURRENT CITY:", window.currentCity);

    // 🔥 SBLOCCA PRIMA
    const hero =
      document.querySelector(".tool-hero") ||
      document.querySelector(".hero-bg") ||
      document.querySelector(".hero-roi");

    
    // 🔥 POI APPLICA
    window.__BG_LOCK__ = false;
    applyCityBackground(city);

  });

}

// ================= CITY ROUTING FIX =================

// 🔥 LOCK solo per ROI pages
window.__CITY_LOCKED__ = window.location.pathname.startsWith("/roi-bnb/");

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
const isToolPage = window.location.pathname.includes("/tool");

const cityFromStorage = isToolPage
  ? sessionStorage.getItem("tool_city")
  : localStorage.getItem("selected_city");

// ================= PRIORITÀ =================

// 🔥 PATH SEMPRE PRIORITARIO
let selectedCity = getCityFromPath();

// 🔥 NON forzare Roma subito
if(!selectedCity){
  selectedCity =
    cityFromQuery ||
    cityFromStorage ||
    (isToolPage ? sessionStorage.getItem("tool_city") : null) ||
    null;
}

// 🔥 fallback SOLO ALLA FINE (quando serve davvero)
if(!selectedCity){

  selectedCity =
    sessionStorage.getItem("tool_city") ||
    localStorage.getItem("selected_city") ||
    window.currentCity ||
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

// 🔥 TOOL deve SEMPRE aggiornare città
if(window.location.pathname.includes("/tool")){
  window.currentCity = selectedCity;
}
else if(!window.__CITY_MANUAL__){
  window.currentCity = selectedCity;
}
else{
  console.log("⛔ SKIP ROUTING OVERRIDE → manual city attiva");
}

window.__CITY_LOCKED__ = window.location.pathname.startsWith("/roi-bnb/");

// 🔥 APPLY SUBITO (UNA SOLA VOLTA)
applyCityBackground(selectedCity);


// ================= UI SYNC =================

document.addEventListener("DOMContentLoaded", () => {

  if(window.__CITY_LOCKED__){
    console.log("⛔ Override bloccati (ROI page)");
  }

  const citySelector = document.getElementById("market-city");

  if(citySelector && !window.__CITY_LOCKED__){
    citySelector.value = selectedCity;
  }

  // 🔥 APPLY UNA SOLA VOLTA (NO SPAM)
  applyCityBackground(selectedCity);

  console.log("🔥 Città attiva finale:", selectedCity);

  const hero =
    document.querySelector(".tool-hero") ||
    document.querySelector(".hero-bg") ||
    document.querySelector(".hero-roi");

  if(hero){
    hero.dataset.cityLocked = window.__CITY_LOCKED__ ? "true" : "false";
  }

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

  const access = window.getUserAccess?.() || {};

  if(!access.isPro && !access.isAdmin) return;

  document.querySelectorAll(`
  .lock-overlay,
  .upgrade-overlay,
  .results-overlay,
  .smart-overlay,
  .paywall-mini
`).forEach(el => el.remove());
}

// 🔥 ESECUZIONE FORZATA CONTINUA
// esegui solo quando serve
// document.addEventListener("rb_plan_loaded", removeGhostOverlays);
// document.addEventListener("rb_auth_ready", removeGhostOverlays);

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


/*
let scrollTriggered = false;

window.addEventListener("scroll", () => {

  if(scrollTriggered) return;

  if(window.scrollY > 600){

    scrollTriggered = true;

    const roi = window.lastAnalysisData?.roi || 0;

    const access = window.getUserAccess?.() || {};

if(access.isFree){
  triggerFunnel({ type:"scroll", roi });
}

  }

});
*/

// ================= START PLAN PURCHASE (FINAL CLEAN) =================

window.startPlanPurchase = function(plan){

  console.log("🚀 CLICK PLAN:", plan);

  const t = (it, en) =>
    (window.currentLang === "en" ? en : it);

  const user = window.currentUser;

  // 👻 GUEST → REGISTER
  if(!user){
    localStorage.setItem("pending_plan", plan);
    showRegisterPopup?.();
    return;
  }

  if(!plan){
    console.error("❌ Piano non valido");
    showToast?.(t("Errore piano","Invalid plan"),"error");
    return;
  }

  const access = window.getUserAccess?.() || {};

  // già attivo
  if(
    (plan === "pro" && access.isPro) ||
    (plan === "investor" && access.isInvestor)
  ){
    showToast?.(
      t("Hai già questo piano attivo","You already have this plan"),
      "info"
    );
    return;
  }

  // downgrade blocco
  if(plan === "investor" && access.isPro){
    showToast?.(
      t("Hai già un piano superiore","You already have a higher plan"),
      "info"
    );
    return;
  }

  // firebase non pronto
  if(!window.firebaseReady){
    showToast?.(
      t("Attendi un secondo...","Wait a moment..."),
      "info"
    );
    return;
  }

  if(typeof window.buyPlan === "function"){
    window.buyPlan(plan);
  }else{
    console.error("❌ buyPlan non trovata");
    showToast?.(t("Errore pagamento","Payment error"),"error");
  }

};


// =============================
// 🔥 PLAN CLASS SYNC (SEMPLICE)
// =============================

window.forceCorrectPlan = function(){

  const access = window.getUserAccess?.() || {};

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

};


// =============================
// 🔥 BASE UI UNLOCK (SAFE – GLOBAL RESET)
// =============================

function unlockBaseUI(){

  const access = window.getUserAccess?.() || {};

  console.log("🧹 BASE UI RESET:", access);

  // 🟢 SOLO PRO/ADMIN → pulizia totale
  if(access.isPro || access.isAdmin){

    document.querySelectorAll(`
      .home-blur-overlay,
      .results-overlay,
      .upgrade-overlay,
      .lock-overlay,
      .smart-overlay,
      .paywall-mini
    `).forEach(el => {
      if(el.id !== "register-popup"){
        el.remove();
      }
    });

    return;
  }

  // 🟡 INVESTOR → pulizia parziale
  if(access.isInvestor){

    document.querySelectorAll(`
      .results-overlay,
      .upgrade-overlay,
      .smart-overlay
    `).forEach(el => {
      if(el.id !== "register-popup"){
        el.remove();
      }
    });

    return;
  }

  // 🔴 FREE → NON TOCCARE NULLA
  console.log("🔴 FREE → nessun unlock");

}

// =============================
// 🔥 FINAL UI CONTROL (LOCKED + ANTI OVERRIDE)
// =============================

function forceUnlockUI(){

  const access = window.getUserAccess?.() || {};

  console.log("🔥 FINAL UI CONTROL:", access);

  // 🔥 FLAG GLOBALE (ANTI RE-APPLY)
  window.__UI_LOCK_STATE__ = access;

  // funzione safe remove
  const safeRemove = (selector) => {
    document.querySelectorAll(selector).forEach(el => {
      if(el.id !== "register-popup"){
        el.remove();
      }
    });
  };

// funzione unlock elementi
const unlockElements = (selector) => {

  document.querySelectorAll(selector).forEach(el => {

    el.classList.remove(
      "pro-blur",
      "locked",
      "locked-content",
      "premium-lock",
      "locked-section",
      "blur-content"
    );

    // 🔥 RESET ELEMENTO
    el.style.filter = "none";
    el.style.webkitFilter = "none";
    el.style.backdropFilter = "none";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";

    // 🔥 RESET FIGLI
    el.querySelectorAll("*").forEach(child => {

      child.classList.remove(
        "pro-blur",
        "blur-content"
      );

      child.style.filter = "none";
      child.style.webkitFilter = "none";
      child.style.backdropFilter = "none";
      child.style.opacity = "1";

    });

  });

};

  // =========================
  // 🟢 PRO / ADMIN → FULL UNLOCK
  // =========================
if(access.isPro || access.isAdmin){

  console.log("🟢 FULL UNLOCK");

  unlockElements(`
    .pro-blur,
    .locked,
    .locked-content,
    .premium-lock,
    .locked-section
  `);

  safeRemove(`
    .home-blur-overlay,
    .results-overlay,
    .upgrade-overlay,
    .lock-overlay,
    .smart-overlay,
    .paywall-mini,
    .blur-content,
    [data-paywall]
  `);

  // ✅ FIX DEFINITIVO
  document.querySelectorAll(".blur-content").forEach(el=>{
    el.classList.remove("blur-content");
  });

  document.body.classList.add("is-pro");
  document.body.classList.remove("is-free","is-investor");

  return;
}
  // =========================
  // 🟡 INVESTOR → PARTIAL UNLOCK
  // =========================
  if(access.isInvestor){

    console.log("🟡 INVESTOR SAFE UI");

    // 🔥 rimuove SOLO overlay invasivi
    safeRemove(`
      .results-overlay,
      .upgrade-overlay,
      .smart-overlay,
      .paywall-mini,
      [data-paywall]
    `);

    // 🔥 unlock base
    unlockElements(`
      .pro-blur,
      .locked,
      .locked-section
    `);

    document.body.classList.add("is-investor");
    document.body.classList.remove("is-free","is-pro");

    return;
  }

  // =========================
  // 🔴 FREE → BASE LOCK
  // =========================
  console.log("🔴 FREE UI");

  document.body.classList.add("is-free");
  document.body.classList.remove("is-pro","is-investor");

  document.querySelectorAll(".metric-card.pro-only").forEach(el=>{
    el.classList.add("pro-blur");
  });

  safeRemove(`
  .results-overlay,
  .upgrade-overlay
`);

}

document.addEventListener("rb_plan_ready", () => {

  console.log("🔥 PLAN READY → FULL UI RESYNC");

  // 🔥 sync classi body
  window.syncAccessClasses?.();

  // 🔥 unlock definitivo
  forceUnlockUI?.();
  unlockBaseUI?.();
  unlockProUI?.();

  // 🔥 reset blur residui
  removeAllBlur?.();

  // 🔥 reset overlay
  document.querySelectorAll(`
    .lock-overlay,
    .results-overlay,
    .upgrade-overlay,
    .smart-overlay,
    .paywall-mini,
    .home-blur-overlay
  `).forEach(el=>{
    if(el.id !== "register-popup"){
      el.remove();
    }
  });

  // 🔥 ricalcolo UI completo
  if(typeof window.calculate === "function"){

    window.pendingCalculation = false;

    setTimeout(()=>{

      console.log("🚀 RECALCULATE AFTER PLAN READY");

      window.calculate("ui_refresh");

    },150);

  }

});

document.addEventListener("rb_auth_ready", () => {

  console.log("🔐 AUTH READY → re-check calculate");

  if(window.pendingCalculation && typeof window.calculate === "function"){

    window.pendingCalculation = false;

    setTimeout(()=>{
      window.calculate(true);
    }, 100);

  }

});

// ===========================================
// ⌨️ ENTER KEY → START ANALYSIS
// ===========================================

document.addEventListener("keydown",(e)=>{

  if(e.key !== "Enter") return;

  const active =
    document.activeElement;

  if(!active) return;

  const tag =
    active.tagName;

  const isInput =
    tag === "INPUT" ||
    tag === "SELECT";

  if(!isInput) return;

  e.preventDefault();

  console.log(
    "⌨️ ENTER → CALCULATE"
  );

  if(typeof window.calculate === "function"){

    window.calculate(true);

  }

});

document.addEventListener("rb_plan_ready", () => {

  console.log("🔥 FUNNEL HOME CHECK");

  const access = window.getUserAccess?.() || {};

  // 🔴 SOLO FREE / GUEST
  if(!access.isPro && !access.isInvestor && !access.isAdmin){

    // evita spam
    if(sessionStorage.getItem("home_funnel_shown")) return;

    sessionStorage.setItem("home_funnel_shown", "true");

    const handleHomeFunnel = () => {

  if(window.scrollY > 2200){

    window.removeEventListener("scroll", handleHomeFunnel);

    openUpgradeModal("investor", 8);

  }

};

window.addEventListener("scroll", handleHomeFunnel);

  }

});
// =============================
// 🔥 BODY ACCESS CLASS FINAL
// =============================

window.syncAccessClasses = function(){

  const access = window.getUserAccess?.() || {};

  const isPaid =
    access.isInvestor ||
    access.isPro ||
    access.isAdmin;

  document.body.classList.toggle("is-paid", isPaid);

  console.log("🔥 ACCESS CLASS:", {
    isPaid,
    access
  });

};

// 🔥 sync iniziale
setTimeout(()=>{
  window.syncAccessClasses?.();
}, 500);

// 🔥 sync eventi
window.addEventListener("rb_plan_ready", window.syncAccessClasses);
window.addEventListener("rb_auth_ready", window.syncAccessClasses);
