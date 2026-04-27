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
setInterval(() => {

  const modalOpen =
    document.querySelector("#rb-upgrade-modal") ||
    document.querySelector(".upgrade-modal") ||
    document.querySelector("#rb-pro-modal.open");

  if(!modalOpen){
    document.body.classList.remove("modal-open");
  }

}, 500);
// ================= SAFE GLOBAL EARLY FIX =================

// 🔥 USA SOLO FIREBASE (SINGLE SOURCE OF TRUTH)
window.getUserAccess = function(){

  const user = window.currentUser;

  // 🔴 RB_USER NON PRONTO
  if(!window.RB_USER){
    return {
      isLogged: !!user,
      isFree: true,
      isPro: false,
      isInvestor: false,
      isAdmin: false,
      canSeeFullAnalysis: false
    };
  }

  // 🔥 NORMALIZZAZIONE
  const isAdmin    = !!window.RB_USER.isAdmin;
  const isPro      = !!window.RB_USER.isPro;
  const isInvestor = !!window.RB_USER.isInvestor;

  const isFree = !isAdmin && !isPro && !isInvestor;

  // 🔍 DEBUG QUI (CRITICO)
  console.log("🔐 ACCESS:", {
    user: window.currentUser?.email,
    RB_USER: window.RB_USER,
    computed: {
      isFree,
      isInvestor,
      isPro,
      isAdmin
    }
  });

  return {
    isLogged: !!user,
    isFree,
    isPro,
    isInvestor,
    isAdmin,
    canSeeFullAnalysis: (isPro || isAdmin)
  };
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
    inset:0;
    background:rgba(255,255,255,0.92);
    backdrop-filter:blur(4px);
    display:flex;
    align-items:center;
    justify-content:center;
    text-align:center;
    z-index:20;
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
    triggerUpgradeFlow({ source:"lock_overlay", plan });
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

  const tSafe = (it,en)=>
    (window.currentLang === "en" ? en : it);

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

    const isAdvanced =
      type === "advanced" ||
      type === "overlay" ||
      plan === "pro";

    if(isAdvanced){

      createLockOverlay(el, {
        message: message || tSafe(
          "Sblocca analisi avanzata",
          "Unlock advanced analysis"
        ),
        cta: cta || tSafe(
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

    createLockOverlay(el, {
      message: message || tSafe(
        "Sblocca analisi completa",
        "Unlock full analysis"
      ),
      cta: cta || tSafe(
        "ROI reale, rischio e simulazioni avanzate",
        "Real ROI, risk and advanced simulations"
      ),
      plan:"investor"
    });

  }

  el.style.cursor = "pointer";

  el.onclick = () => {
    triggerUpgradeFlow({ source:"free_lock", plan });
  };
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

  const tSafe = (it,en)=>
    (window.currentLang === "en" ? en : it);

  if(!window.isUserReady()){
    console.log("⏳ user non pronto");
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
      tSafe(
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
// 🔥 FUNNEL + MODAL ENGINE UNIFICATO
// SILICON VALLEY SAAS – FINAL PRODUCTION
// =====================================

// ================= FUNNEL =================

window.triggerUpgradeFlow = function(context = {}){

  if(!window.firebaseReady){
    setTimeout(()=> window.triggerUpgradeFlow(context), 300);
    return;
  }

  if(window.__upgradeShown) return;
  window.__upgradeShown = true;

  const access = window.getUserAccess();
  const { roi = 0 } = context;

  if(!access || access.isLogged === false){
    openUpgradeModal("investor", roi);
    return;
  }

  if(access.isFree){
    openUpgradeModal("investor", roi);
    return;
  }

  if(access.isInvestor){
    openUpgradeModal("pro", roi);
    return;
  }

};

// =====================================
// 🔥 FUNNEL TRIGGER ENGINE (SaaS)
// =====================================
window.triggerFunnel = function({type = "generic", roi = 0} = {}){

  const access = window.getUserAccess?.() || {};
  if(access.canSeeFullAnalysis) return;

  // ❌ anti spam
  if(window.funnelState.shown && type !== "reminder") return;

  // 🔥 ROI alto → immediato
  if(type === "roi"){
    if(roi > 10){
      openUpgradeModal(access.isInvestor ? "pro" : "investor", roi);
      window.funnelState.shown = true;
      return;
    }
  }

  // 🟡 ROI medio → delay
  if(type === "roi_soft"){
    if(roi > 6){
      setTimeout(()=>{
        openUpgradeModal(access.isInvestor ? "pro" : "investor", roi);
      }, 2000);
      window.funnelState.shown = true;
      return;
    }
  }

  // 📜 SCROLL
  if(type === "scroll"){
    openUpgradeModal(access.isInvestor ? "pro" : "investor", roi);
    window.funnelState.shown = true;
    return;
  }

  // 🧠 REMINDER
  if(type === "reminder"){
    openUpgradeModal(access.isInvestor ? "pro" : "investor", roi);
  }

};

// =====================================
// 🔥 MODAL UNIFICATO – FINAL PRODUCTION
// =====================================

window.openUpgradeModal = function(type = "investor", roi = 0){

  const access = window.getUserAccess?.() || {};
  if(!access || access.canSeeFullAnalysis) return;

  if(access.isInvestor) type = "pro";

  const safeROI = Number(roi || 0);

  document.getElementById("rb-upgrade-modal")?.remove();

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

  const safeT = (it,en)=>{
    if(typeof window.t === "function") return window.t(it,en);
    return lang === "en" ? en : it;
  };

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
    🔓 ${config["cta_" + lang]}
    <div style="font-size:11px;opacity:.85;margin-top:2px;">
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
    `;

  cta.onclick = ()=>{
    modal.remove();
    window.__upgradeShown = false;
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
    window.__upgradeShown = false;
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
      window.__upgradeShown = false;
    }
  });

};
// ================= GLOBAL HERO BACKGROUND =================

window.applyCityBackground = function(city){

  // 🔥 SUPPORTA SIA TOOL (.hero-bg) CHE ROI (.hero-roi)
  const hero =
    document.querySelector(".hero-bg") ||
    document.querySelector(".hero-roi");

  if(!hero) return;

  // 🔥 SALVA STATO (CRITICO)
  window.__CURRENT_BG_CITY__ = city;

  // 🔥 MAP IT → EN (coerente con CSS)
  const map = {
    roma:"rome",
    napoli:"naples",
    milano:"milan",
    firenze:"florence"
  };

  const cityClass = map[city] || "rome";

  // 🔥 PULIZIA CLASSI (evita accumulo / override)
  hero.classList.remove("rome","naples","milan","florence");

  // 🔥 APPLICA CLASSE
  hero.classList.add(cityClass);

  console.log("🎯 BG aggiornato:", cityClass);

};


// =====================================
// 💣 BACKGROUND LOCK SYSTEM (ANTI BUG)
// =====================================

setInterval(()=>{

  const hero =
    document.querySelector(".hero-bg") ||
    document.querySelector(".hero-roi");

  if(!hero) return;

  const city = window.__CURRENT_BG_CITY__;
  if(!city) return;

  const map = {
    roma:"rome",
    napoli:"naples",
    milano:"milan",
    firenze:"florence"
  };

  const expected = map[city] || "rome";

  // 🔥 se qualche script lo cambia → lo ripristina
  if(!hero.classList.contains(expected)){

    hero.classList.remove("rome","naples","milan","florence");
    hero.classList.add(expected);

    console.log("🔁 BG RE-APPLY (fix override)");

  }

}, 300);
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
  if(access.canSeeFullAnalysis) return;

  window.funnelState.counter++;

  // ogni 2 azioni
  if(window.funnelState.counter % 2 !== 0) return;

  setTimeout(()=>{

    triggerFunnel({
      type:"reminder",
      roi
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

  // ================= FUNNEL TRIGGER =================

// 🔥 ROI alto → subito
if(roi > 10){
  triggerFunnel({ type:"roi", roi });
}

// 🟡 ROI medio → delay
else if(roi > 6){
  triggerFunnel({ type:"roi_soft", roi });
}

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
// ================= CORE CALCULATE ENGINE (FINAL PRODUCTION SAAS) =================

window.calculate = async function(force = false){

  if(window.isCalculating && !force){
    console.warn("⛔ skip calculate (already running)");
    return;
  }

  window.isCalculating = true;
  window.__preventRecalculate = true;
  window.simulationExecuted = false;
  window.paywallShown = false;

  // 🧹 CLEAN UI (NO RESIDUI BUG)
  document.querySelectorAll(`
    .smart-overlay,
    .upgrade-msg,
    .investor-upsell
  `).forEach(el => el.remove());

  console.log("🚀 CALCULATE START");

  try{

    // ================= INPUT =================
    const isTool = !!document.getElementById("price");

    const price       = isTool ? getValue("price")       || 100000 : getValue("qr_price") || 100000;
    const equityInput = getValue("equity");

    const equity = isTool
    ? (equityInput > 0 ? equityInput : Math.round(price * 0.3))
    : Math.round(price * 0.3);
    const priceNight  = isTool ? getValue("priceNight")  || 100 : getValue("qr_night") || 100;
    const occupancy   = isTool ? getValue("occupancy")   || 65  : getValue("qr_occ") || 65;
    const expenses    = isTool ? getValue("expenses")    || 30  : getValue("qr_cost") || 30;

    const commission  = getValue("commission") || 15;
    const tax         = getValue("tax") || 21;

    const loanAmount  = getValue("loanAmount") || (price - equity);
    const interestRate= getValue("interestRate") || 3.5;
    const loanYears   = getValue("loanYears") || 20;

    const access = window.getUserAccess?.() || {};

    // ================= CALCOLO =================
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

if (!result || typeof result !== "object") {
  console.error("💥 RESULT INVALID:", result);
  return;
}

const roi   = Number(result?.roi ?? 0);
const gross = Number(result?.revenue ?? 0);
const net   = Number(result?.netAfterMortgage ?? result?.net ?? 0);

// =====================================
// 💸 LOSS VISUAL (BILINGUE + SaaS CLEAN)
// =====================================

try{

  const lossEl = document.getElementById("money-loss");
  const lossValueEl = document.getElementById("money-loss-value");

  if(lossEl && lossValueEl){

  const estimatedLoss = Math.max(0, net * 0.3);

  // 🔥 aggiorna numero
  lossValueEl.innerText = formatCurrency(estimatedLoss);

  // =====================================
  // 🔥 MICRO MIGLIORIA (QUI È IL PUNTO)
  // =====================================
  if(estimatedLoss > 1000 && !access.canSeeFullAnalysis){

    lossEl.style.display = "block";
    lossEl.style.animation = "fadeUp .4s ease";

    // =====================================
    // 🚀 BONUS → ATTIVA BLOCCO SHOCK (QUI)
    // =====================================
    const shock = document.getElementById("roi-shock-block");

    if(shock){
      shock.style.display = "block";
    }

  }

}

}catch(e){
  console.warn("⚠️ loss render error", e);
}

if(!access.canSeeFullAnalysis && roi > 10 && !window._roiToastShown){

  window._roiToastShown = true;

  setTimeout(()=>{
    showToast(
      t(
        "🔥 Questo investimento potrebbe farti guadagnare molto",
        "🔥 This investment could generate strong returns"
      ),
      "success"
    );
  }, 800);

}
    
if(!roi && !gross && !net){
  console.error("💥 RESULT EMPTY");
  return;
}

// ================= UI FINAL RENDER (CRITICO) =================
try {

  const profit = Number(result?.netAfterMortgage ?? result?.net ?? 0);
  const revenue = gross; // 🔥 FIX: usa revenue corretto
  const risk = Number(result?.risk ?? 0);

  // 🔥 KPI LIVE (TOP CARD)
  const profitEl = document.getElementById("profit-live");
  if(profitEl){
    profitEl.innerText = formatCurrency(profit);
  }

  const revenueEl = document.getElementById("revenue-live");
  if(revenueEl){
    revenueEl.innerText = formatCurrency(revenue);
  }

  // 🔥 KPI PREVIEW (BOX SOTTO)
  if(typeof updatePreviewMetrics === "function"){
    updatePreviewMetrics(roi, risk);
  }

  console.log("✅ UI FINAL RENDER OK");

} catch(e){
  console.error("💥 UI FINAL RENDER ERROR:", e);
}

// ================= POST ANALYSIS =================
runPostAnalysis(result, {
  price,
  gross,
  occupancy,
  priceNight,
  expenses
});

// ================= KPI CORE =================
renderUniversalKPI({
  net,
  revenue: gross,
  investment: price
});

// ================= ROI LIVE =================
const roiEl = document.getElementById("roi-live");

if(roiEl){

  roiEl.style.opacity = "0";

  setTimeout(()=>{
    if(access.isFree){
      roiEl.innerText = "~ " + roi.toFixed(1) + "%";
      roiEl.style.color = "#f59e0b";
    }else{
      roiEl.innerText = roi.toFixed(1) + "%";
      roiEl.style.color = "#10b981";
    }
    roiEl.style.opacity = "1";
  },150);
}

    if(!isTool){
  const disclaimer = document.getElementById("home-disclaimer");

  if(disclaimer){
    disclaimer.innerText = t(
      "Stima basata su parametri medi di mercato",
      "Estimate based on market average assumptions"
    );
    disclaimer.style.display = "block";
  }
}

// ================= MARKET =================
try{
  renderMarketBenchmark?.(window.currentCity || "roma");
  renderMarketComparison?.(gross, window.currentCity);
  renderRevenueForecast?.(gross);
  renderOccupancySensitivity?.();
}catch(e){
  console.warn("⚠️ MARKET RENDER SKIPPED:", e);
}

// ================= ADVANCED METRICS =================
const riskScore = roi > 12 ? 30 : roi > 6 ? 55 : 75;

// 🔥 FIX PREVIEW KPI
if(typeof updatePreviewMetrics === "function"){
  updatePreviewMetrics(roi, riskScore);
}

// 🔥 ROI PREVIEW + ANIMAZIONE (SAFE)
const roiPreviewEl = document.getElementById("roi-preview");

if(roiPreviewEl){

  // 🔥 evita doppia animazione SENZA bloccare il resto
  if(roiPreviewEl.dataset.animating !== "true"){

    roiPreviewEl.dataset.animating = "true";

    if(roi && roi > 0){

      roiPreviewEl.innerText = "0%";
      roiPreviewEl.style.color = getROIColor(roi);

      animateValue(roiPreviewEl, 0, roi, 800);

    }else{
      roiPreviewEl.innerText = "—";
      roiPreviewEl.style.color = "#64748b";
    }

    setTimeout(()=>{
      roiPreviewEl.dataset.animating = "false";
    }, 900);

  }
}

 // 🔥 RISK PREVIEW (MATCH ROI STYLE)
const riskPreviewEl = document.getElementById("risk-preview");

if(riskPreviewEl){

  if(riskPreviewEl.dataset.animating !== "true"){

    riskPreviewEl.dataset.animating = "true";

    if(riskScore !== null && riskScore !== undefined){

      riskPreviewEl.innerText = "0";

      // colore dinamico rischio (opposto ROI)
      let color = "#ef4444";
      if(riskScore < 40) color = "#10b981";
      else if(riskScore < 65) color = "#f59e0b";

      riskPreviewEl.style.color = color;

      // animazione numero
      let start = 0;
      const end = riskScore;
      const duration = 800;
      let startTime = null;

      function animateRisk(currentTime){
        if(!startTime) startTime = currentTime;

        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = start + (end - start) * progress;

        riskPreviewEl.innerText = Math.round(value);

        if(progress < 1){
          requestAnimationFrame(animateRisk);
        }
      }

      requestAnimationFrame(animateRisk);

    }else{
      riskPreviewEl.innerText = "—";
      riskPreviewEl.style.color = "#64748b";
    }

    setTimeout(()=>{
      riskPreviewEl.dataset.animating = "false";
    }, 900);
  }
}   
    
try{
  renderBreakEvenOccupancy?.(
    priceNight,
    expenses,
    commission,
    tax,
    0
  );

  renderInvestmentScore?.(roi, riskScore);
  renderInvestmentRanking?.(roi);
  renderRiskMeter?.(riskScore);
  renderInvestmentVerdict?.(roi, net > 0 ? price/net : 0);

  if(isTool){

  const headline = document.getElementById("investment-headline");

  if(headline && roi > 0){

    const profitYear = Math.round(net);

if(profitYear > 0){
  headline.innerText = t(
    `🔥 Questo investimento può generare €${profitYear.toLocaleString()} / anno`,
    `🔥 This investment could generate €${profitYear.toLocaleString()} / year`
  );
}else{
  headline.innerText = t(
    "⚠️ Questo investimento potrebbe generare una perdita",
    "⚠️ This investment could generate a loss"
  );
}

} // ✅ CHIUSURA if(headline)

} // ✅ CHIUSURA if(isTool)    

  renderROIMarketComparison?.(roi, window.currentCity);

  if(typeof generateInsights === "function"){
    renderInsights(generateInsights({
      roi,
      occupancy,
      priceNight,
      expenses
    }));
  }

}catch(e){
  console.warn("⚠️ ADVANCED METRICS SKIPPED:", e);
}

// ================= CHART =================
setTimeout(()=>{
  if(typeof window.renderChart === "function"){
    window.renderChart(net);
  }
},200);

// ================= FUNNEL =================
if(window.firebaseReady && access.isFree && !access.isInvestor && roi > 10){
  triggerUpgradeFlow({ roi });
}

} catch(err){
  console.error("💥 CALCULATE ERROR:", err);
}

window.isCalculating = false;
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
      window.calculate();
    setTimeout(()=>{

  const roi = window.lastAnalysisData?.roi || 0;

  if(roi > 6){
    triggerFunnel({ type:"roi", roi });
  }

}, 1500);
      
    } else {
      console.error("❌ calculate non trovata");
    }

  });

}

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

    // 🔥 SBLOCCA eventuali lock (CRITICO)
    window.__CITY_LOCKED__ = false;

    window.currentCity = city;
    window.__CURRENT_BG_CITY__ = city;
    localStorage.setItem("selected_city", city);

    applyCityBackground(city);

    console.log("📍 City cambiata manualmente:", city);

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

  const access = window.getUserAccess?.() || {};

  if(!access.isPro && !access.isAdmin) return;

  document.querySelectorAll(`...`).forEach(el => el.remove());
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

let scrollTriggered = false;

window.addEventListener("scroll", () => {

  if(scrollTriggered) return;

  if(window.scrollY > 600){

    scrollTriggered = true;

    const roi = window.lastAnalysisData?.roi || 0;

    triggerFunnel({ type:"scroll", roi });

  }

});

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
        "locked-section"
      );

      el.style.filter = "none";
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
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


// =====================================
// 💣 ANTI-OVERRIDE SYSTEM (CRITICO)
// =====================================

// 🔥 impedisce che altri script rimettano overlay dopo 200-500ms
setInterval(()=>{

  if(!window.__UI_LOCK_STATE__) return;

  const access = window.__UI_LOCK_STATE__;

  // 🟢 PRO → nessun overlay deve esistere
  if(access.isPro || access.isAdmin){

    document.querySelectorAll(`
      .lock-overlay,
      .upgrade-overlay,
      .results-overlay,
      .smart-overlay,
      .paywall-mini
    `).forEach(el=>{
      if(el.id !== "register-popup") el.remove();
    });

  }

  // 🟡 INVESTOR → blocca SOLO overlay aggressivi
  if(access.isInvestor){

  // 🔥 NON rimuovere i lock overlay
  document.querySelectorAll(`
    .results-overlay,
    .upgrade-overlay,
    .smart-overlay
  `).forEach(el=>{
    if(
      el.id !== "register-popup" &&
      !el.classList.contains("lock-overlay") // 🔥 FIX
    ){
      el.remove();
    }
  });

}

}, 400);
