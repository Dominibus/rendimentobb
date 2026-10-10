import "./investment-journey.js?v=20261008-rc60";
// ===============================================
// RENDIMENTOBB – EXECUTIVE ENGINE 16.0
// PRO Firebase + Mortgage Comparator + Forecast + Investment Score + Sensitivity Engine
// ===============================================
// ================= FIRESTORE ================
import { buildInvestmentAssumptions, readInvestmentAssumptions } from "./investment-assumptions.js?v=20261009-rc91";
import { calculateROI } from "./roi-engine.js?v=20261009-rc91";
import { buildPDFScenarioCommentary } from "./pdf-scenario-commentary.js?v=20261006-rc45";
import { createInvestmentAnalysisState } from "./investment-analysis-state.js?v=20261009-rc91";
const investmentAnalysisState = createInvestmentAnalysisState(window, document);
import { initPropertyMode, renderPropertyModeResults } from "./property-mode.js?v=20261009-rc91";
initPropertyMode(window, document);
import { buildRevenueScenarios } from "./revenue-scenarios.js?v=20261006-rc42";
import { renderFreeSimulationPreview } from "./free-preview.js?v=20261009-rc91";

import {
renderMarketBenchmark
} from "./market-engine.js?v=20261008-rc60";

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

import { app } from "./firebase-init.js?v=20261008-rc60";
const db = getFirestore(app);

let roiChartInstance = null;

// ================= GLOBAL STATE =================

window.roiChartInstance = null;

const appDebugWarn = (...args) => {
  if(window.RB_DEBUG === true){
    console.warn(...args);
  }
};

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
  const locale = window.currentLang === "en" ? "en-US" : "it-IT";

  if(!Number.isFinite(n)){
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(0);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
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

  if(window.RB_DEBUG === true){
    appDebugWarn("🚫 ALERT BLOCCATO:", msg);
    console.trace("📍 ALERT SOURCE");
  }

  if(typeof showToast === "function"){
    showToast(msg, "warning");
  }

};

// =====================================
// 💣 GLOBAL MODAL FIX (CRITICO)
// =====================================

window.forceCloseAllModals = function(){



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
  appDebugWarn("⚠️ net mancante → continuo render");
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
  const monthly = Number.isFinite(Number(net))
    ? Number(net) / 12
    : 0;

  if(qrMonth) qrMonth.innerText = formatCurrency(monthly);
  if(elMonthly) elMonthly.innerText = formatCurrency(monthly);

  // ===== BREAK EVEN =====
  let payback = net > 0
  ? (investment / net)
  : 0;

// A sub-year capital recovery remains a sub-year estimate; do not round it up.

const paybackText =
  payback > 0
    ? payback.toFixed(1) + t(" anni", " years")
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

  

}else{

  // =====================================
// 🔓 PRO / ADMIN → FULL ACCESS
// =====================================

if(
  access.isPro ||
  access.isInvestor ||
  access.isAdmin
){

  

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
// 🔒 FREE USERS ONLY
// =====================================

else if(access.isFree){

 

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
  appDebugWarn("⛔ access non disponibile");
  // ❌ NON bloccare render
}

document.querySelectorAll(".investor-upsell").forEach(el => el.remove());

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
    {name:{it:"Scenario 1",en:"Scenario 1"},rate:Number.isFinite(rateA) ? rateA : 3.45},
    {name:{it:"Scenario 2",en:"Scenario 2"},rate:Number.isFinite(rateB) ? rateB : 3.6},
    {name:{it:"Scenario 3",en:"Scenario 3"},rate:Number.isFinite(rateC) ? rateC : 3.5},
    ...[3.4,3.55,3.48,3.52].map((rate,index)=>({name:{it:`Scenario ${index+4}`,en:`Scenario ${index+4}`},rate}))
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
  const requestId = (window.__rbAnalysisSaveRequest || 0) + 1;
  window.__rbAnalysisSaveRequest = requestId;
  const showStatus = state => {
    if(window.__rbAnalysisSaveRequest === requestId) renderAnalysisSaveStatus(state);
  };

  // The Free simulator stays local; Firestore also enforces the entitlement.
  if(!window.getUserAccess?.().isPaid){showStatus("local");return false;}

  // Readiness checks precede the lock: an early attempt must remain retryable.
  if(window.__savingAnalysis){
    showStatus("busy");
    return false;
  }
  if(!window.firebaseReady || !window.currentUser?.uid){
    showStatus("notReady");
    return false;
  }

  window.__savingAnalysis = true;
  showStatus("pending");

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
  ...(readInvestmentAssumptions(data.assumptions) ? {assumptions: readInvestmentAssumptions(data.assumptions)} : {}),

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

  realROI:
    data.realROI ?? 0,

  net:
    data.net ?? 0,

  risk:
    data.risk ?? 0,

  riskBreakdown:
    data.riskBreakdown ?? null,

  ltv:
    data.ltv ?? 0,

  dscr:
    data.dscr ?? 0,

  noi:
    data.noi ?? data.netOperatingIncome ?? 0,

  netOperatingIncome:
    data.netOperatingIncome ?? data.noi ?? 0,

  capRate:
    data.capRate ?? 0,

  annualDebtService:
    data.annualDebtService ?? data.mortgageYearly ?? 0,

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

    

// 🔄 dashboard live refresh
window.dispatchEvent(
  new Event("analysisSaved")
);



    showStatus("saved");
    return true;

  }catch(e){
    console.error("Analysis save failed", {code: String(e?.code || "unknown")});
    showStatus("failed");
    return false;
  }finally{
    window.__savingAnalysis = false;
  }

}

function renderAnalysisSaveStatus(state = window.__rbAnalysisSaveState){
  if(!state) return;
  window.__rbAnalysisSaveState = state;
  if(typeof document === "undefined") return;
  const messages = {
    local: {it:"Risultati disponibili in questa sessione. Il piano Free non salva le analisi nel database.",en:"Results are available in this session. The Free plan does not save analyses to the database."},
    pending: {it:"Salvataggio in corso: attendo la conferma del database. Mantieni aperta questa pagina.",en:"Saving: waiting for database confirmation. Keep this page open."},
    saved: {it:"Analisi salvata nel tuo archivio. Puoi ritrovarla nella dashboard.",en:"Analysis saved to your archive. You can find it in the dashboard."},
    failed: {it:"Analisi non salvata. I risultati restano visibili qui: verifica la connessione e premi di nuovo Analizza per riprovare.",en:"Analysis was not saved. Results remain visible here: check your connection and click Analyze again to retry."},
    busy: {it:"Il salvataggio precedente è ancora in corso. Questa nuova analisi non è stata salvata: attendi e premi di nuovo Analizza.",en:"The previous save is still in progress. This new analysis has not been saved: wait and click Analyze again."},
    notReady: {it:"Salvataggio non avviato: la sessione non è pronta. Verifica l’accesso e premi di nuovo Analizza.",en:"Saving has not started: the session is not ready. Check your sign-in and click Analyze again."}
  };
  if(!messages[state]) return;
  let el = document.getElementById("rb-analysis-save-status");
  if(!el){
    const results = document.getElementById("results");
    if(!results || !document.createElement) return;
    el = document.createElement("p");
    el.id = "rb-analysis-save-status";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.style.cssText = "padding:12px 16px;margin:16px 0;border:1px solid #64748b;border-radius:12px;line-height:1.5;color:inherit;background:transparent;";
    results.before(el);
  }
  el.dataset.state = state;
  const lang = window.currentLang === "en" ? "en" : "it";
  el.textContent = messages[state][lang];
}

if(typeof document !== "undefined") document.addEventListener?.("rb_language_changed", () => renderAnalysisSaveStatus());

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
        "ROI stimato, rischio e simulazioni avanzate",
        "Estimated ROI, risk and advanced simulations"
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
  
  return false;
}

// 👻 GUEST
if(!window.currentUser){
  showRegisterPopup?.();
  return false;
}

  const access = window.getUserAccess?.() || {};

  // PRO / ADMIN
  if(access.isAdmin || hasPlan(requiredPlan)){
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
  if(!access || access.canDownloadPDF) return;

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

      desc_it: "Hai provato il risultato base. Con Investor puoi approfondire lo scenario e gestire i tuoi immobili.",
      desc_en: "You have tried the basic result. Investor lets you explore the scenario and manage your properties.",

      features_it: [
        "Simulazioni e scenari salvati",
        "Analisi ROI avanzata",
        "Riferimenti interni illustrativi, senza dati di mercato verificati",
        "Analisi rischio, portfolio e PMS"
      ],
      features_en: [
        "Simulations and saved scenarios",
        "Advanced ROI analysis",
        "Illustrative internal references, without verified market data",
        "Risk analysis, portfolio and PMS"
      ],

      proof_it: "Confronta più scenari prima di decidere",
      proof_en: "Compare multiple scenarios before deciding",

      cta_it: "Sblocca Investor – €19/mese",
      cta_en: "Unlock Investor – €19/month",

      warning_it: "PDF e dashboard-report sono inclusi in Pro.",
      warning_en: "PDFs and dashboard reports are included in Pro.",

      action: () => window.location.pathname.startsWith("/tool")
        ? window.location.assign("/#pricing")
        : startPlanPurchase("investor")
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
        "ROI stimato completo (netto)",
        "Analisi rischio avanzata",
        "Break-even reale",
        "Simulazione mutuo integrata",
        "Report PDF professionale"
      ],
      features_en: [
        "Full estimated ROI (net)",
        "Advanced risk analysis",
        "Real break-even",
        "Integrated mortgage simulation",
        "Professional PDF report"
      ],

      proof_it: "Analizza rischio, mutuo e sostenibilità nello stesso report",
      proof_en: "Review risk, mortgage and sustainability in one report",

      cta_it: "Sblocca analisi completa – €29/mese",
      cta_en: "Unlock full analysis – €29/month",

      warning_it: "⚠️ Senza analisi completa puoi perdere migliaia di euro anche con ROI positivo",
      warning_en: "⚠️ Without full analysis you can lose thousands even with a positive ROI",

      action: () => window.location.pathname.startsWith("/tool")
        ? window.location.assign("/#pricing")
        : startPlanPurchase("pro")
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

  // Non attribuire una perdita in euro a una quota arbitraria del cashflow.

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
  // Production: nessun log
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

  // Production: nessun log
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

  const city = String(cityKey || "").trim().toLowerCase();
  const marketAvg = Number(window.RB_MARKET_DATA?.[city]?.annualRevenue);
  if(!Number.isFinite(marketAvg) || marketAvg <= 0){
    container.innerHTML = `<div class="kpi-box">${t("Benchmark locale non disponibile", "Local benchmark unavailable")}</div>`;
    return;
  }

  const revenue = window.safeNumber(userRevenue);

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
      ${t("🏙 Riferimento indicativo","🏙 Indicative benchmark")}
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
  const container = document.getElementById("roi-market-comparison");
  if(!container) return;
  const marketROI = window.RB_MARKET_DATA?.[cityKey]?.roi;
  const hasReference = marketROI !== null && marketROI !== undefined && Number.isFinite(Number(marketROI));
  const equity = window.lastAnalysisData?.equity;
  const zeroEquity=(typeof equity === "number" || (typeof equity === "string" && equity.trim() !== "")) && Number(equity) === 0;
  const hasEquity = !zeroEquity;
  const number = value => new Intl.NumberFormat(window.currentLang === "en" ? "en-GB" : "it-IT", {maximumFractionDigits:1}).format(Number(value));
  container.innerHTML = `
    <div class="kpi-box">
      <span>${t("ROI sul capitale proprio","Return on equity")}</span>
      <strong>${hasEquity ? number(roi)+"%" : "N/A"}</strong>
    </div>
    <div class="kpi-box">
      <span>${t("Riferimento interno illustrativo","Illustrative internal reference")}</span>
      <strong>${hasReference ? number(marketROI)+"%" : "—"}</strong>
    </div>
    <div class="kpi-box">
      <span>${t("Comparabilità","Comparability")}</span>
      <strong>${t("Basi non comparabili","Bases not comparable")}</strong>
      <p>${hasEquity
        ? t("Il riferimento interno non documenta gli stessi costi e la stessa leva della simulazione. Non misura una sovraperformance di mercato.", "The internal reference does not document the same costs and leverage as this simulation. It does not measure market outperformance.")
        : t("Il ROI equity non è applicabile con capitale proprio zero. Valuta cashflow e servizio del debito.", "Equity ROI is not applicable with zero equity. Assess cash flow and debt service.")}</p>
    </div>`;
}

// ================= REVENUE FORECAST =================

function renderRevenueForecast(baseRevenue){

const container = document.getElementById("revenue-forecast");
if(!container) return;

container.innerHTML = buildRevenueScenarios(baseRevenue, t).map(scenario => `
<div class="kpi-box">
  <div class="kpi-label">${scenario.label}</div>
  <div class="kpi-value">${formatCurrency(scenario.value)}</div>
</div>
`).join("");

}


// ================= OCCUPANCY SENSITIVITY =================

function renderOccupancySensitivity(baseResult, inputs){

const container = document.getElementById("occupancy-sensitivity");
if(!container) return;

if(!baseResult || !inputs || typeof calculateROI !== "function"){
  container.innerHTML = "";
  return;
}

const baseOccupancy = Math.max(0, Math.min(100, Number(inputs.occupancy) || 0));
const lowerOccupancy = Math.max(0, baseOccupancy - 10);
const higherOccupancy = Math.min(100, baseOccupancy + 10);
const lower = calculateROI({...inputs, occupancy: lowerOccupancy});
const higher = calculateROI({...inputs, occupancy: higherOccupancy});
const formatROI = value => `${Number(value || 0).toFixed(1)}%`;
const sensitivityValue = result => result.roiAvailable === false ? formatCurrency(result.netAfterMortgage) : formatROI(result.roi);

container.innerHTML = `

<div class="kpi-box">
  <div class="kpi-label">${lowerOccupancy}% ${t("occupazione", "occupancy")}</div>
  <div class="kpi-value">${sensitivityValue(lower)}</div>
</div>

<div class="kpi-box">
  <div class="kpi-label">${t("Base", "Base")} · ${baseOccupancy}%</div>
  <div class="kpi-value">${sensitivityValue(baseResult)}</div>
</div>

<div class="kpi-box">
  <div class="kpi-label">${higherOccupancy}% ${t("occupazione", "occupancy")}</div>
  <div class="kpi-value">${sensitivityValue(higher)}</div>
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
        roiAvailable: Number(window.lastAnalysisData?.equity) > 0,

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

if(window.lastAnalysisData?.propertyMode === "owned" || window.lastAnalysisData?.assumptions?.source === "owned_property"){
  recommendation = t("Valutare la gestione dell’immobile", "Assess property management");
}
else if(score >= 75){

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
    ${Number(window.lastAnalysisData?.equity) === 0 ? `<small>${t("ROI equity N/A: componente esclusa dall’indice. Leva, cashflow e copertura del debito restano valutati.", "Equity ROI N/A: component excluded from the index. Leverage, cash flow and debt coverage remain assessed.")}</small>` : ""}
  </div>

  <div class="kpi-box">
    <span>${t("Raccomandazione","Recommendation")}</span>
    <strong>${recommendation}</strong>
  </div>

  `;
}

// ================= INVESTMENT RANKING =================

function renderInvestmentRanking(roi, score = window.lastAnalysisData?.investmentScore){

const container = document.getElementById("investment-ranking");
if(!container) return;

const numericScore = Number(score);
const hasScore = score != null && Number.isFinite(numericScore);
const band = !hasScore
  ? t("Da calcolare", "Pending")
  : numericScore >= 75
    ? t("Alta", "High")
    : numericScore > 40
      ? t("Intermedia", "Intermediate")
      : t("Bassa", "Low");
const label = !hasScore
  ? t("Valutazione non disponibile", "Assessment unavailable")
  : numericScore >= 75
    ? t("Investimento favorevole", "Favorable investment")
    : numericScore > 40
      ? t("Da ottimizzare", "Needs optimization")
      : t("Investimento critico", "High concern investment");

container.innerHTML = `

<div class="kpi-box">
<span>${t("Fascia di valutazione","Assessment band")}</span>
<strong>${band}</strong>
</div>

<div class="kpi-box">
<span>${t("Profilo investimento","Investment profile")}</span>
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
    label = t("Rischio moderato","Moderate risk");
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
occupancy = 70,
canonicalVerdict = null
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
"Valutazione delle ipotesi",
"Assessment of assumptions"
);

let description =
"";

const reasons = [];

// ROI

if(roi >= 15){

reasons.push(
t(
"ROI superiore al riferimento illustrativo",
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

// The score engine is the single source of truth for the recommendation.
// Metric-based reasons above remain explanatory, but must never create a
// verdict that contradicts the saved report, emails or PDF.
const normalizedCanonicalVerdict = String(canonicalVerdict || "")
  .trim()
  .toUpperCase();

if(["BUY", "ACQUISTA"].includes(normalizedCanonicalVerdict)){
  verdict = "BUY";
  color = "#10b981";
  icon = "🟢";
}
else if(["WAIT", "ATTENDI"].includes(normalizedCanonicalVerdict)){
  verdict = "WAIT";
  color = "#f59e0b";
  icon = "🟠";
  confidence = Math.min(confidence, 82);
}
else if(["AVOID", "EVITA"].includes(normalizedCanonicalVerdict)){
  verdict = "AVOID";
  color = "#ef4444";
  icon = "🔴";
  confidence = Math.min(confidence, 82);
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

const ownedVerdictMode = window.lastAnalysisData?.propertyMode === "owned" || window.lastAnalysisData?.assumptions?.source === "owned_property";
const verdictLabel = ownedVerdictMode
  ? t("VALUTA LA GESTIONE", "ASSESS MANAGEMENT")
  : verdict === "BUY"
    ? t("ACQUISTA", "BUY")
    : verdict === "WAIT"
      ? t("ATTENDI", "WAIT")
      : t("EVITA", "AVOID");

box.innerHTML = `

<div class="ai-verdict-card">

<div class="ai-verdict-header">

<div class="ai-verdict-badge">

🧠 ${t(
"Esito del modello sulle ipotesi",
"Model assessment of assumptions"
)}

</div>

<h3 style="
font-size:34px;
font-weight:900;
margin:14px 0 10px;
color:${color};
letter-spacing:-1px;
">

${icon} ${verdictLabel}

</h3>

<p style="font-size:13px;line-height:1.6;">
${t("Valutazione basata sulle ipotesi inserite. Il rischio è un indice del modello, non una probabilità di perdita.", "Assessment based on entered assumptions. Risk is a model index, not a probability of loss.")}
</p>

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
  // Production: nessun log
  return;
}

const access = window.getUserAccess();

btn.style.display = access.canDownloadPDF ? "inline-block" : "none";
const pdfPanel = btn.closest("[data-pdf-only]");
if(pdfPanel) pdfPanel.dataset.pdfAllowed = String(!!access.canDownloadPDF);

if(window.RB_DEBUG === true){



}

}

document.addEventListener("rb_auth_ready", updatePDFButton);
window.addEventListener("rb_plan_ready", updatePDFButton);

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
  if(roi >= 20) return t("📈 ROI elevato","📈 High ROI");
  if(roi >= 12) return t("📈 ROI interessante","📈 Promising ROI");
  if(roi >= 8) return t("📊 ROI positivo","📊 Positive ROI");
  return t("📊 ROI da valutare","📊 Review ROI");
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
      appDebugWarn("⛔ postAnalysis skipped → null result");
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

    const resultState = document.getElementById("tool-result-state");
    if(resultState){
      resultState.dataset.it = "Analisi aggiornata";
      resultState.dataset.en = "Analysis updated";
      resultState.textContent = t("Analisi aggiornata", "Analysis updated");
    }

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

if(window.RB_DEBUG === true){



}

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
        result?.expensesMonthly ??
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
    window.realROI ??
    finalROI ??
    0
};

    // ================= SAVE DEDUP =================

    // Include the calculated scenario and account, not just rounded ROI.
    const analysisHash = JSON.stringify({
      uid: window.currentUser?.uid ?? null,
      result,
      context,
      market,
      realCity: realCityInput
    });

    const now = Date.now();
    const shouldSave =
      window.__LAST_SAVED_ANALYSIS__ !== analysisHash ||
      now - (window.__LAST_SAVE_TIME__ || 0) > 15000;

    // ================= CANONICAL SCORE FOR SAVE =================

const canonicalSaveScoreData =
  typeof window.rbGenerateInvestmentScore === "function"

    ? window.rbGenerateInvestmentScore({

        roiAvailable: Number(equity) > 0,
        roi: Number(
          finalROI ?? 0
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
  Number.isFinite(Number(finalROI))
){

  saveAnalysis({
    propertyPrice: propertyPrice,
    equity,
    roi: finalROI,
    visualROI: finalROI,
    realROI:
      Number(
        result?.realROI ??
        window.realROI ??
        (
          propertyPrice > 0
            ? (net / propertyPrice) * 100
            : 0
        )
      ),
    risk,
    riskBreakdown:
      result?.riskBreakdown ?? null,
    ltv:
      Number(result?.ltv ?? 0),
    dscr:
      Number(result?.dscr ?? 0),
    noi:
      Number(result?.noi ?? result?.netOperatingIncome ?? 0),
    netOperatingIncome:
      Number(result?.netOperatingIncome ?? result?.noi ?? 0),
    capRate:
      Number(result?.capRate ?? 0),
    annualDebtService:
      Number(result?.annualDebtService ?? result?.mortgageYearly ?? 0),
    gross,
    expenses: monthlyCosts, // Canonical EUR/month from the completed engine result.
    assumptions: context?.assumptions,
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
  }).then(saved => {
    // A failed/blocked write must not suppress an immediate manual retry.
    if(saved){
      window.__LAST_SAVED_ANALYSIS__ = analysisHash;
      window.__LAST_SAVE_TIME__ = now;
    }
  });

  
}



    // =====================================
    // 🤖 CHATBOT LIVE ANALYSIS
    // =====================================

    window.lastAnalysisData = {

  assumptions: readInvestmentAssumptions(context?.assumptions),
  interestRate: context?.assumptions?.interestRate,
  loanYears: context?.assumptions?.loanYears,

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

riskBreakdown:
  result?.riskBreakdown ?? null,

ltv:
  Number(result?.ltv ?? 0),

dscr:
  Number(result?.dscr ?? 0),

noi:
  Number(result?.noi ?? result?.netOperatingIncome ?? 0),

netOperatingIncome:
  Number(result?.netOperatingIncome ?? result?.noi ?? 0),

capRate:
  Number(result?.capRate ?? 0),

annualDebtService:
  Number(result?.annualDebtService ?? result?.mortgageYearly ?? 0),

occupancy: occupancyRate,

taxCost: Number(result?.taxCost ?? 0),

// =====================================
// 🧠 CANONICAL SCORE & VERDICT
// =====================================

investmentScore:
  canonicalSaveScore,

verdict:
  canonicalSaveVerdict,

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

expenses: monthlyCosts || 0,

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

if(window.RB_DEBUG === true){



}

// =====================================
// 📄 EXECUTIVE DOCUMENT
// =====================================

if(typeof window.buildExecutiveReport === "function"){

    const executiveReport =

        window.buildExecutiveReport(
            window.lastAnalysisData
        );



}

    

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
// Lo score è già stato calcolato durante la simulazione.
// runPostAnalysis NON deve rigenerarlo: usa la Single Source of Truth.

const existingInvestmentScore = Number(
  window.lastAnalysisData?.investmentScore ??
  result?.investmentScore ??
  window.lastInvestmentScore ??
  0
);


if(
  Number.isFinite(existingInvestmentScore) &&
  existingInvestmentScore > 0 &&
  typeof window.updateInvestmentScore === "function"
){
  window.updateInvestmentScore(existingInvestmentScore);
}

if(finalROI <= 0){
  appDebugWarn("⚠️ Low ROI → UI still rendered");
}

    // =====================================
    // 🔓 HARD UNLOCK PRO
    // =====================================

    if(access.isPro || access.isAdmin){

      
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

          }

    // ================= LEAD ENGINE =================

    if(finalROI <= 0){

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

      appDebugWarn(
        "LeadScore fallback:",
        e
      );
    }

    // ================= SCORE =================

    window.simulationCount =
      (window.simulationCount || 0) + 1;

    if(window.simulationCount > 3){
      leadScore = "hot";
    }

    // ================= EMAIL =================

    if(
      userEmail &&
      Number(window.__RB_ANALYSIS_EMAIL_SESSION_EXPIRES__ || 0) > Date.now()
    ){
      const emailPayload = {
        email: userEmail,
        name: window.currentUser?.displayName || "",
        lang: window.currentLang || "it",
        roi: finalROI,
        city: realCityInput || market,
        price: propertyPrice,
        equity: Number(equity || 0),
        profit: Number(net || 0),
        noi: Number(result?.noi ?? result?.netOperatingIncome ?? 0),
        capRate: Number(result?.capRate ?? 0),
        dscr: Number(result?.dscr ?? 0),
        annualDebtService: Number(result?.annualDebtService ?? result?.mortgageYearly ?? 0),
        type: "analysis",
        marketingConsent: document.getElementById("analysis-reminder-consent")?.checked === true,
        source: "roi_simulator",
        funnel: "analysis_completed",
        leadScore,
        requestId: window.__RB_ANALYSIS_EMAIL_SESSION_ID__ || ""
      };

      // Il motore può ricalcolare più volte (prima stima + dati di mercato).
      // Manteniamo solo l'ultimo risultato della singola azione dell'utente.
      window.__RB_PENDING_ANALYSIS_EMAIL__ = emailPayload;
      clearTimeout(window.__RB_ANALYSIS_EMAIL_TIMER__);
      window.__RB_ANALYSIS_EMAIL_TIMER__ = setTimeout(async () => {
        const payload = window.__RB_PENDING_ANALYSIS_EMAIL__;
        if(!payload) return;

        window.__RB_PENDING_ANALYSIS_EMAIL__ = null;
        window.__RB_ANALYSIS_EMAIL_SESSION_EXPIRES__ = 0;
        window.emailUserSent = true;

        try{
          const res = await fetch("/api/send-lead",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
            body:JSON.stringify(payload)
          });
          if(!res.ok) window.emailUserSent = false;
        }catch(_error){
          window.emailUserSent = false;
        }
      }, 25000);
    }


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
      // An indicative simulation is not an offer or a promise of bank contact.
      window.location.href = "/mutui/";
    };

  }else{
    mortgageBox.style.display = "none";
  }

}

// ================= LOCATION → CITY MAPPING PRO =================

function mapLocationToCity(input){
  const value = String(input || "").trim().toLowerCase().replace(/\s*\([a-z]{2}\)$/, "").trim();
  return ["napoli", "roma", "milano", "firenze"].includes(value) ? value : null;
}

const locationInput = document.getElementById("custom-location");
const helper = document.getElementById("location-helper");
if(locationInput){
  locationInput.addEventListener("input", () => {
    if(window.__CITY_LOCKED__) return;
    const value = locationInput.value.trim();
    const mapped = mapLocationToCity(value);
    const selector = document.getElementById("market-city");
    if(selector){ selector.disabled = !!value; selector.style.opacity = value ? "0.5" : "1"; if(value) selector.value = mapped || ""; }
    window.__CITY_MANUAL__ = !!value;
    window.__CITY_FROM_INPUT__ = !!value;
    window.currentCity = value ? mapped || value.toLowerCase() : selector?.value || "";
    selectedCity = window.currentCity;
    sessionStorage.setItem("tool_city", window.currentCity);
    if(helper) helper.textContent = !value ? t("Scegli una città o inserisci la tua località.", "Choose a city or enter your location.")
      : mapped ? t("Riferimenti illustrativi per la città selezionata: verifica le ipotesi.", "Illustrative references for the selected city: verify assumptions.")
      : t("Nessun benchmark locale disponibile. La simulazione usa soltanto i dati che inserisci.", "No local benchmark is available. The simulation uses only your own inputs.");
    renderMarketBenchmark(window.currentCity);
    if(mapped) { window.__BG_LOCK__ = false; applyCityBackground(mapped); }
  });
}

// ================= SAFE INPUT =================

function getValue(id){
  const el = document.getElementById(id);
  if(!el) return 0;

  const v = parseFloat(el.value);
  return isNaN(v) ? 0 : v;
}

// Preserva lo zero inserito dall'utente e usa il fallback solo per campi
// assenti, vuoti o non numerici.
function getValueOrDefault(id, fallback){
  const el = document.getElementById(id);
  if(!el) return fallback;

  const raw = String(el.value ?? "").trim();
  if(raw === "") return fallback;

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

window.__LAST_CALCULATION__ = 0;

window.calculate = async function(mode = false){

 
  const isUIRefresh =
  mode === "ui_refresh";

  if(window.isCalculating && !mode){
    appDebugWarn("⛔ skip calculate (already running)");
    return;
  }

  const now = Date.now();

const isAutoImport =
  mode === true;

if(
  !isAutoImport &&
  now - window.__LAST_CALCULATION__ < 1200
){
  appDebugWarn(
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


  window.pendingCalculation = true;
  window.isCalculating = false;

  return;
}

// 🔥 firebase può essere ready anche senza currentPlan
if(!window.firebaseReady){


  window.pendingCalculation = true;
  window.isCalculating = false;

  return;
}

// 🔥 fallback SAFE
if(!window.currentPlan){

  appDebugWarn("⚠️ currentPlan missing → fallback FREE");

  window.currentPlan = "free";


  window.pendingCalculation = true;
  window.isCalculating = false;

  return;
}

  investmentAnalysisState.invalidate();
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
    const propertyMode = isTool && document.getElementById("property-mode")?.value === "owned" ? "owned" : "purchase";

    const monthlyCostsInput =
      isTool
        ? document.getElementById("expenses")
        : null;

    if(
      isTool &&
      window.__MANUAL_ANALYSIS__ &&
      monthlyCostsInput &&
      String(monthlyCostsInput.value ?? "").trim() === ""
    ){
      monthlyCostsInput.setCustomValidity(
        t(
          "Inserisci i costi mensili stimati. Usa 0 solo se vuoi escluderli consapevolmente dall'analisi.",
          "Enter estimated monthly costs. Use 0 only if you intentionally want to exclude them from the analysis."
        )
      );
      monthlyCostsInput.reportValidity();
      monthlyCostsInput.focus();
      window.isCalculating = false;
      window.__preventRecalculate = false;
      return;
    }

    monthlyCostsInput?.setCustomValidity("");
    if(isTool && window.__MANUAL_ANALYSIS__){
      document.getElementById("equity")?.setCustomValidity?.("");
      for(const id of ["price", "equity", "priceNight", "expenses"]){
        const field = document.getElementById(id);
        if(field?.reportValidity && !field.reportValidity()){
          field.focus(); window.isCalculating = false; window.__preventRecalculate = false; return;
        }
      }
      const equityField = document.getElementById("equity");
      if(propertyMode !== "owned" && getValue("equity") > getValue("price")){
        equityField?.setCustomValidity?.(t("Il capitale proprio non può superare il prezzo immobile in questo modello.", "Equity cannot exceed the property price in this model."));
        equityField?.reportValidity?.(); window.isCalculating = false; window.__preventRecalculate = false; return;
      }
      equityField?.setCustomValidity?.("");
    }


    const price       = isTool ? (propertyMode === "owned" ? getValue("price") : getValueOrDefault("price", 100000)) : getValueOrDefault("qr_price", 100000);
    const equityInput = getValue("equity");

    let equity = isTool
  ? equityInput
  : Math.round(price * 0.3);

// 🔥 EQUITY CANNOT EXCEED PRICE

if(propertyMode !== "owned" && equity > price){

  equity = price;

}

// 🔥 MIN EQUITY REALISTICA
const minEquity = price * 0.15;

if(!isTool && equity < minEquity){
  equity = minEquity;
}

    const priceNight  = isTool ? getValueOrDefault("priceNight", 100) : getValueOrDefault("qr_night", 100);
    const occupancy   = isTool ? getValueOrDefault("occupancy", 65) : getValueOrDefault("qr_occ", 65);
    const expenses    = isTool ? getValueOrDefault("expenses", 0) : getValueOrDefault("qr_cost", 35);
    const expensesUnit = isTool ? "monthly_eur" : "percentage";

    if(isTool){
      for(const id of ["interestRate", "loanYears", "commission", "tax", ...(propertyMode === "owned" ? ["owned-loan-amount"] : [])]){
        const field = document.getElementById(id);
        if(field?.reportValidity && !field.reportValidity()){
          field.closest("details")?.setAttribute("open", "");
          field.focus(); window.isCalculating = false; window.__preventRecalculate = false; return;
        }
      }
    }

    const commission  = getValueOrDefault("commission", 15);
    const tax         = getValueOrDefault("tax", 21);

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


      }
    }

    const calculatedLoan = Math.max(
  0,
  price - equity
);

const loanAmount =
  propertyMode === "owned" ? getValue("owned-loan-amount") : getValueOrDefault("loanAmount", calculatedLoan);
    const interestRate = getValueOrDefault("interestRate", 3.5);
    const loanYearsInput = getValueOrDefault("loanYears", 20);
    const loanYears = loanYearsInput > 0 ? loanYearsInput : 20;

    // ================= CALCOLO =================

// Production: nessun log

const investmentInputSignature = investmentAnalysisState.capture();
const result = calculateROI({
  propertyMode,
  price,
  equity,
  priceNight,
  occupancy,
  expenses,
  expensesUnit,
  commission,
  tax,
  loanAmount,
  interestRate,
  loanYears
});

// Production: nessun log

// Production: nessun log

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

// All entry points use the same calculated return, without promotional adjustments.

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

// 🔥 salva ROI stimato globale
window.realROI = realROI;

// 🔥 render chart con cap visivo
renderROIChart(access.isFree ? Math.max(0, realROI) : visualROI);

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

// ===============================================
// 🧠 CHATBOT LIVE DATA
// ===============================================

const chatbotAccess =
window.getUserAccess?.() || {};

if(window.RB_DEBUG === true){


}

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

const resultCity =
  document.getElementById("tool-result-city");

if(resultCity){

  const cityLabels = {
    roma: "Roma",
    milano: "Milano",
    napoli: "Napoli",
    firenze: "Firenze"
  };

  const cityLabel =
    cityLabels[String(marketCity).toLowerCase()] ||
    customLocation?.trim() ||
    t("Mercato selezionato", "Selected market");

  resultCity.innerText =
    `${cityLabel} · ${t("Scenario base", "Base scenario")}`;

}

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

  noi:
    Number(result?.noi ?? result?.netOperatingIncome ?? 0),

  netOperatingIncome:
    Number(result?.netOperatingIncome ?? result?.noi ?? 0),

  capRate:
    Number(result?.capRate ?? 0),

  dscr:
    Number(result?.dscr ?? 0),

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


// =====================================
// 🔥 LIVE ENGINE
// =====================================

window.rbChatbotLive = {
  ...window.rbChatbotData
};



// =====================================
// 💾 LAST ANALYSIS MEMORY
// =====================================

const executiveScoreData =
  typeof window.rbGenerateInvestmentScore === "function"
    ? window.rbGenerateInvestmentScore({
        roi: Number(result?.roi ?? roi ?? 0),
        roiAvailable: Number(equity) > 0,
        risk: Number(risk ?? 0),
        occupancy: Number(occupancy ?? 0),
        mortgagePercent: Number(price > 0 ? (calculatedLoan / price) * 100 : 0),
        cashflow: Number(net ?? 0),
        city: marketCity || "roma"
      })
    : null;

window.lastAnalysisData = {

  // This snapshot precedes runPostAnalysis: score the current simulation now.
  investmentScore:
    executiveScoreData?.score ?? null,

  verdict:
    executiveScoreData
      ? (Number(executiveScoreData.score) >= 75
          ? "BUY"
          : Number(executiveScoreData.score) > 40
            ? "WAIT"
            : "AVOID")
      : null,

  roi:
    result?.roi ??
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

  realROI:
    realROI ??
    0,

  risk:
    risk ??
    0,

  riskBreakdown:
    result?.riskBreakdown ?? null,

  noi:
    Number(result?.noi ?? result?.netOperatingIncome ?? 0),

  netOperatingIncome:
    Number(result?.netOperatingIncome ?? result?.noi ?? 0),

  taxCost:
    Number(result?.taxCost ?? 0),

  capRate:
    Number(result?.capRate ?? 0),

  dscr:
    Number(result?.dscr ?? 0),

  cashflow:
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
    Number(
      result?.expensesYearly ??
      ((expenses ?? monthlyCosts ?? 0) * 12)
    ),

  expensesYearly:
    Number(
      result?.expensesYearly ??
      ((expenses ?? monthlyCosts ?? 0) * 12)
    ),

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

mortgagePercent:
  price > 0
    ? (Number(loanAmount ?? 0) / Number(price)) * 100
    : 0,

mortgageYearly:
  Number(
    result?.mortgageYearly ??
    0
  ),

monthlyMortgage:
  Number(
    result?.mortgageYearly ??
    0
  ) / 12,

monthlyMortgagePayment:
  Number(
    result?.mortgageYearly ??
    0
  ) / 12,

interestRate:
  Number(
    interestRate ??
    0
  ),

loanYears:
  Number(
    loanYears ??
    0
  ),

price:
    price ??
    0,

  propertyPrice:
    price ??
    0,

  marketCity:
    marketCity ||
    window.currentCity ||
    "Roma",

  city:
    selectedCity ||
    marketCity ||
    window.currentCity ||
    "Roma",

  timestamp:
    Date.now()

};

// Lo Score deve leggere esclusivamente lo snapshot della simulazione corrente.
renderInvestmentScore(
  Number(window.lastAnalysisData.roi ?? 0),
  Math.round(Number(window.lastAnalysisData.risk ?? 0))
);

// Render every executive panel immediately after a new simulation.
// Previously these panels were rebuilt only by the language-change event.
renderRiskMeter(
  Math.round(Number(window.lastAnalysisData.risk ?? 0))
);

renderInvestmentVerdict(
  Number(window.lastAnalysisData.roi ?? 0),
  Math.round(Number(window.lastAnalysisData.risk ?? 0)),
  Number(window.lastAnalysisData.net ?? window.lastAnalysisData.cashflow ?? 0),
  Number(window.lastAnalysisData.occupancy ?? 0),
  window.lastAnalysisData.verdict
);

renderInvestmentRanking(
  Number(window.lastAnalysisData.roi ?? 0)
);

renderROIMarketComparison(
  Number(window.lastAnalysisData.roi ?? 0),
  String(window.lastAnalysisData.marketCity ?? window.lastAnalysisData.city ?? "roma").toLowerCase()
);

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


// =====================================
// 🌍 GLOBAL INVESTMENT HISTORY SYNC
// =====================================

window.investmentHistory =
  window.rbChatMemory.investmentHistory;

window.rbInvestmentMemory =
  window.rbChatMemory.investmentHistory;


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
      investment: equity
    });

    renderCashflowProjection(net);
    
     // =====================================
    // 🤖 POST ANALYSIS AI
    // =====================================

     const loan = Number(result?.loan ?? loanAmount ?? 0);

runPostAnalysis(result,{

  assumptions: buildInvestmentAssumptions(result, {commission, tax, interestRate, loanYears}, isTool ? (propertyMode === "owned" ? "owned_property" : "simulator") : "home_preview"),

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
  Number(
    result?.mortgageYearly ??
    0
  ) / 12

});
    Object.assign(window.lastAnalysisData || (window.lastAnalysisData = {}), {propertyMode, propertyROIAvailable:result.propertyROIAvailable, roiAvailable:result.roiAvailable});
    renderFreeSimulationPreview(result, {access, document, lang:window.currentLang});
    renderPropertyModeResults(window.lastAnalysisData, {window, document, access});

    // ================= MARKET =================
    if(access.isFree){
      renderMarketBenchmark(window.currentCity);

      const marketComparison = document.getElementById("market-comparison");
      if(marketComparison){
        marketComparison.innerHTML = `<div class="kpi-box">${t(
          "Confronto disponibile con Investor o Pro",
          "Comparison available with Investor or Pro"
        )}</div>`;
      }

      document.querySelectorAll(`
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
    gross,
    window.currentCity
  );

  renderRevenueForecast?.(gross);

  renderOccupancySensitivity?.(result, {
    propertyMode, price, equity, priceNight, occupancy, expenses, expensesUnit,
    commission, tax, loanAmount, interestRate, loanYears
  });

}else{

      renderMarketBenchmark?.(window.currentCity || "roma");
      renderMarketComparison?.(gross, window.currentCity);
      renderRevenueForecast?.(gross);
      renderOccupancySensitivity?.(result, {
        propertyMode, price, equity, priceNight, occupancy, expenses, expensesUnit,
        commission, tax, loanAmount, interestRate, loanYears
      });

    }

    // ================= FUNNEL =================

// 🔥 consideriamo FREE anche utente non loggato
const isFreeUser = !access.isPro && !access.isInvestor && !access.isAdmin;

if(window.firebaseReady && isFreeUser && roi > 10){

 
  triggerFunnel({ roi });

}

if(isTool && window.simulationExecuted === true){
  investmentAnalysisState.publish(result, {equity}, investmentInputSignature);
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
    
    return;
  }

  if(typeof Chart === "undefined"){
    appDebugWarn("⏳ Chart.js non pronto → skip");
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
    appDebugWarn("⛔ roiChart non trovato");
    return;
  }

  if(typeof Chart === "undefined"){
    appDebugWarn("⛔ Chart.js non caricato");
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

// ================= CASHFLOW 5 YEARS =================
function renderCashflowProjection(annualCashflow){

  const canvas =
    document.getElementById("cashflow-5y-chart");

  if(!canvas || typeof Chart === "undefined"){
    return;
  }

  const base = Number(annualCashflow) || 0;

  const values = Array.from(
    { length: 5 },
    (_, index) =>
      Math.round(
        base > 0 ? base * Math.pow(1.03, index) : base
      )
  );

  if(window.cashflowProjectionChart){
    window.cashflowProjectionChart.destroy();
  }

  const currency = (value) =>
    new Intl.NumberFormat(
      window.currentLang === "en"
        ? "en-US"
        : "it-IT",
      {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
      }
    ).format(value);

  window.cashflowProjectionChart =
    new Chart(
      canvas.getContext("2d"),
      {
        type: "line",

        data: {
          labels: [
            t("Anno 1", "Year 1"),
            t("Anno 2", "Year 2"),
            t("Anno 3", "Year 3"),
            t("Anno 4", "Year 4"),
            t("Anno 5", "Year 5")
          ],

          datasets: [{
            label: t(
              "Cashflow annuale",
              "Annual cash flow"
            ),
            data: values,
            borderColor: "#08b67a",
            backgroundColor: "rgba(8,182,122,0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#08b67a",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2
          }]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: "#607089"
              }
            },

            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(96,112,137,0.14)"
              },
              ticks: {
                color: "#607089",
                callback: currency
              }
            }
          },

          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) =>
                  currency(context.parsed.y)
              }
            }
          }
        }
      }
    );
}

// ================= TOOL DETAIL TABS =================
function initToolDetailTabs(){

  const tabs =
    document.querySelectorAll("[data-tool-tab]");

  const panels =
    document.querySelectorAll("[data-tool-panel]");

  if(!tabs.length || !panels.length){
    return;
  }

  tabs.forEach((tab) => {

    tab.addEventListener("click", () => {

      const target =
        tab.dataset.toolTab;

      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute(
          "aria-selected",
          String(active)
        );
      });

      panels.forEach((panel) => {
        const active =
          panel.dataset.toolPanel === target;

        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });

      if(
        target === "scenarios" &&
        window.cashflowProjectionChart
      ){
        requestAnimationFrame(() => {
          window.cashflowProjectionChart.resize();
        });
      }

    });

  });
}

// ================= AUTO INIT =================
document.addEventListener("DOMContentLoaded", ()=>{

  initToolDetailTabs();

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
    appDebugWarn("⚠️ Google Places non caricato");
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
      appDebugWarn("⚠️ City non mappata:", city);
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
      
      calculate(true);
    }

  }, 800);

})();
// ================= PROPERTY LISTING SECURITY =================

function getSafePropertyListingURL(value){
  const raw = String(value ?? "").trim();
  if(!/^https?:\/\//i.test(raw) || /[\u0000-\u001f\u007f]/.test(raw)) return "";

  try{
    const url = new URL(raw);
    if(!["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password){
      return "";
    }
    return url.href;
  }catch{
    return "";
  }
}

function renderPropertyListingSource(value){
  const box = document.getElementById("property-source");
  if(!box) return;

  const link = getSafePropertyListingURL(value);
  const note = document.createElement("div");
  note.style.marginTop = "6px";
  note.style.fontSize = "13px";
  note.style.color = "#64748b";

  if(!link){
    note.textContent = t(
      "Link annuncio non valido. Inserisci un indirizzo completo http:// o https://, oppure compila i dati manualmente.",
      "Invalid listing link. Enter a complete http:// or https:// address, or fill in the details manually."
    );
    box.replaceChildren(note);
    return;
  }

  const title = document.createElement("strong");
  title.textContent = t("📍 Immobile analizzato", "📍 Analyzed property");
  const anchor = document.createElement("a");
  anchor.href = link;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = link;
  note.textContent = t(
    "Inserisci i dati dell'annuncio per simulare il rendimento.",
    "Enter the listing details to simulate returns."
  );
  box.replaceChildren(title, document.createElement("br"), anchor, note);
}

// ================= AUTO LOAD PROPERTY FROM TOOL (NUOVO) =================

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const urlFromQuery = params.get("listing");

  const savedUrl = localStorage.getItem("listing_url");

  const requestedUrl = urlFromQuery || savedUrl;
  const finalUrl = getSafePropertyListingURL(requestedUrl);

  if(requestedUrl && !finalUrl){
    localStorage.removeItem("property_link");
    localStorage.removeItem("listing_url");
    renderPropertyListingSource(requestedUrl);
    return;
  }

  if(finalUrl){


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
      appDebugWarn("⚠️ analyzePropertyFromTool non trovata");
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

  
  window.__MANUAL_ANALYSIS__ = true;
  window.__RB_ANALYSIS_EMAIL_SESSION_ID__ =
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.__RB_ANALYSIS_EMAIL_SESSION_EXPIRES__ = Date.now() + 60000;
  clearTimeout(window.__RB_ANALYSIS_EMAIL_TIMER__);
  window.__RB_PENDING_ANALYSIS_EMAIL__ = null;

  window.calculate();

  setTimeout(()=>{

 
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
if(!access.canDownloadPDF){ openUpgradeModal("pro"); return; }

if(!window.lastAnalysisData){
  showToast(T("Genera prima analisi","Run analysis first"));
  return;
}

const { jsPDF } = window.jspdf;
const doc = new jsPDF();

doc.setProperties({
  title: T("RendimentoBB - Report di fattibilità","RendimentoBB - Investment Feasibility Report"),
  subject: T("Analisi pre-investimento short-rent","Short-rent pre-investment analysis"),
  author: "RendimentoBB",
  creator: "RendimentoBB Analysis Engine"
});

const d = window.lastAnalysisData;



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
const isOwnedProperty = d.assumptions?.source === "owned_property";

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

const occupancy = d.occupancy == null ? null : Number(d.occupancy);

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
const eur = v => {
  const rounded = Math.round(safe(v));
  const sign = rounded < 0 ? "-" : "";
  const grouped = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, isEN ? "," : ".");
  return isEN ? `${sign}€${grouped}` : `${sign}${grouped} €`;
};
const pct = v => {

  const n = safe(v);

  return Number.isInteger(n)
    ? n + "%"
    : n.toFixed(1) + "%";

};

// ================= RATING =================
const pdfCommentary = buildPDFScenarioCommentary({
  cashflow: profit,
  annualDebtService: Number(d.annualDebtService ?? d.mortgageYearly),
  dscr: d.dscr == null ? null : Number(d.dscr)
}, T);
const rating = pdfCommentary.rating;

// ================= COLORS =================
const green = [16,185,129];
const dark = [15,23,42];
const gray = [100,116,139];

// ================= TYPOGRAPHIC BRAND =================
const drawBrand = (x=20,y=14,onDark=false)=>{
  doc.setFont("helvetica","bold");
  doc.setFontSize(15);
  doc.setTextColor(...(onDark ? [255,255,255] : dark));
  doc.text("RendimentoBB",x,y);
  doc.setFont("helvetica","normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...(onDark ? [110,231,183] : green));
  doc.text("SHORT-RENT INVESTMENT INTELLIGENCE",x,y+5);
};

// ================= FOOTER =================
const footer = ()=>{

  doc.setDrawColor(230);
  doc.line(15,270,195,270);

  doc.setFontSize(8);
  doc.setTextColor(...gray);

  doc.text(
    T(
      "RendimentoBB • Report di fattibilità dell'investimento",
      "RendimentoBB • Investment Feasibility Report"
    ),
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
    T("Riservato","Confidential") + ` • ${doc.getNumberOfPages()}`,
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

doc.setFillColor(...dark);
doc.rect(0,0,210,297,"F");
doc.setFillColor(...green);
doc.rect(0,34,210,1.5,"F");
drawBrand(20,15,true);

// ================= REPORT LABEL =================

doc.setFontSize(9);
doc.setTextColor(148,163,184);

doc.text(
  T("REPORT DI FATTIBILITÀ","INVESTMENT FEASIBILITY REPORT"),
  20,
  48
);

// ================= TITLE =================

doc.setTextColor(255,255,255);

doc.setFontSize(24);

doc.text(
  T(
    "Analisi di fattibilità dell'investimento",
    "Investment Feasibility Report"
  ),
  20,
  67
);

// ================= SUBTITLE =================

doc.setFontSize(11);

doc.setTextColor(203,213,225);

doc.text(
  T(
    "Analisi professionale per investimenti short-rent",
    "Professional analysis for short-rent investments"
  ),
  20,
  80
);

// ================= AI ENGINE =================

doc.setFontSize(9);

doc.text(
  T(
    "Elaborato dal motore di analisi RendimentoBB",
    "Prepared by the RendimentoBB analysis engine"
  ),
  20,
  91
);

// ================= MARKET =================

doc.setFontSize(10);

doc.text(
  T("Mercato","Market") +
  " • " +
  city.charAt(0).toUpperCase() +
  city.slice(1),
  20,
  109
);

// ================= ROI =================

doc.setTextColor(...(roi < 0 ? [220,38,38] : green));

doc.setFontSize(40);

doc.text(
  (equity > 0 ? pct(roi) : "N/A"),
  20,
  155
);

// ================= ROI LABEL =================

doc.setFontSize(11);

doc.setTextColor(...gray);

doc.text(
  T(
    "ROI stimato sul capitale proprio",
    "Estimated equity ROI"
  ),
  22,
  165
);

// The internal table is illustrative and cannot grade this scenario's return.
const coverMarketKey = String(city).toLowerCase().trim();
const coverReference = window.RB_MARKET_DATA?.[coverMarketKey]?.roi;
const coverHasReference = coverReference !== null && coverReference !== undefined && Number.isFinite(Number(coverReference));
doc.setFont("helvetica","normal");
doc.setFontSize(9);
doc.setTextColor(203,213,225);
doc.text(isOwnedProperty && equity <= 0 ? T("ROI non applicabile: valuta il cashflow previsto.","ROI not applicable: assess projected cashflow.") : T("Riferimento interno illustrativo: ","Illustrative internal reference: ") + (coverHasReference ? pct(coverReference) : T("non disponibile","unavailable")),20,180);
doc.setFontSize(8);
doc.text(T("Basi non comparabili - nessun giudizio di performance di mercato.","Bases not comparable - no market performance grade."),20,191,{maxWidth:170});

// ================= RATING =================

doc.setFontSize(13);

doc.setTextColor(255,255,255);

doc.text(
  rating,
  20,
  207
);

// =====================================
// EXECUTIVE BADGES
// =====================================

// ================= REAL AI SCORE =================

const aiScore =
  window.lastAnalysisData?.investmentScore ?? null;

const aiLabel =
  window.lastAnalysisData?.verdict ?? null;

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

// Keep the canonical machine value for saved data, but localize the text
// printed in the user-facing PDF.
const pdfVerdictLabel =
  isOwnedProperty && equity <= 0
    ? (profit > 0 ? T("Cashflow positivo", "Positive cashflow") : T("Cashflow da verificare", "Cashflow to review"))
    : verdict === "BUY"
    ? T("Favorevole", "Favourable")
    : verdict === "WAIT" || verdict === "WATCH"
      ? T("Da verificare", "Review")
      : T("Critico", "Critical");

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

doc.text(T("Punteggio investimento","Investment score"),28,239);
doc.text(T("Esito modello","Model outcome"),82,239);
doc.text(T("Rischio","Risk"),122,239);
doc.text(T("Fonte dati","Data source"),154,239);

// VALUES

doc.setFontSize(13);

doc.setTextColor(...dark);

doc.text(String(investmentScore),28,249);

doc.text(pdfVerdictLabel,82,249);

doc.text(
  riskScore < 40
    ? T("Basso","Low")
    : riskScore < 65
      ? T("Moderato","Moderate")
      : T("Alto","High"),
  122,
  249
);

doc.text(
  T("Ipotesi","Assumptions"),
  154,
  249
);

// ===================================================
// EXECUTIVE
// ===================================================

doc.addPage();

drawBrand(20,14,false);

doc.setFontSize(14);
doc.setTextColor(...dark);
doc.text(
  T(
    "Sintesi di fattibilità",
    "Feasibility Overview"
  ),
  20,
  30
);

doc.setFontSize(9);
doc.setTextColor(...gray);

doc.text(
  T(
    "Sintesi strategica basata sui dati e sulle ipotesi inserite.",
    "Strategic summary based on the entered data and assumptions."
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
  (equity > 0 ? pct(roi) : "N/A"),
  28,
  y + 22
);

doc.setFontSize(9);

doc.text(
  T(
    "ROI SUL CAPITALE PROPRIO",
    "EQUITY ROI"
  ),
  28,
  y + 10
);

// =====================================
// RATING AREA
// =====================================

// Rating badge
doc.setFillColor(255,255,255);

doc.roundedRect(
  128,
  y + 6,
  56,
  16,
  5,
  5,
  "F"
);

// Rating
doc.setTextColor(...dark);
doc.setFontSize(9);

doc.text(
  rating,
  156,
  y + 16,
  {
    align:"center"
  }
);

// DATA SOURCE
doc.setFontSize(7);
doc.setTextColor(...green);

doc.text(
  T("DATI SIMULATI","SIMULATED DATA"),
  156,
  y + 27,
  {
    align:"center"
  }
);

// Executive label
doc.setFontSize(8);
doc.setTextColor(220);

doc.text(
  T("Valutazione RendimentoBB","RendimentoBB Assessment"),
  156,
  y + 34,
  {
    align:"center"
  }
);

y += 50;

doc.setFontSize(10);

doc.setTextColor(...dark);

doc.text(
  T(
    "Indicatori chiave dell'investimento",
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
title:isOwnedProperty ? T("Valore immobile","Property value") : T("Prezzo immobile","Property Price"),
value:isOwnedProperty && price === 0 ? T("Non indicato","Not provided") : eur(price),
subtitle:T("Valore dell'asset","Asset Value")
},

{
title:T("Ricavi annui","Annual Revenue"),
value:eur(revenue),
subtitle:T("Ricavi lordi","Gross Income")
},

{
title:T("Cashflow netto","Net Cashflow"),
value:eur(profit),
subtitle:
profit >= 0
? T("Positivo","Positive")
: T("Negativo","Negative")
},

{
title:T("ROI equity","Equity ROI"),
value:equity > 0 ? pct(roi) : "N/A",
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
    "Ricavi illustrativi: -20% / base / +20%. Non sono previsioni di mercato.",
    "Illustrative revenue: -20% / base / +20%. Not market forecasts."
  ),
  20,
  y + 6
);

y += 18;

const revenueScenarios = buildRevenueScenarios(revenue, T);
const maxVal = revenueScenarios[2]?.value || 1;

revenueScenarios.forEach(s=>{

  // LABEL
  doc.setFontSize(9);
  doc.setTextColor(...dark);

  doc.text(
    s.label,
    20,
    y - 3
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

  y += 21;

});

// =====================================
// AI EXECUTIVE INSIGHT
// =====================================

y -= 4;

doc.setFillColor(245,248,252);

doc.roundedRect(
30,
y,
150,
42,
6,
6,
"F"
);

doc.setFontSize(11);

doc.setTextColor(...dark);

doc.text(
T(
"Indicazione strategica",
"Strategic insight"
),
35,
y+10
);

doc.setFontSize(9);

doc.setTextColor(...gray);

const executiveInsight = pdfCommentary.insight;

doc.text(
executiveInsight,
35,
y+20,
{
maxWidth:140
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

const safePrice = price;

const ltv = safePrice > 0 ? (loan / safePrice) * 100 : null;

const financingRate =
  safe(
    d.assumptions?.interestRate ??
    d.interestRate ??
    3.5
  );

const financingYears =
  safe(
    d.assumptions?.loanYears ??
    d.loanYears ??
    20
  );

const annualDebtService =
  safe(
    d.annualDebtService ??
    d.mortgageYearly ??
    (
      (
        d.monthlyMortgage ??
        d.monthlyMortgagePayment ??
        0
      ) * 12
    )
  );

const netOperatingIncome =
  safe(
    d.noi ??
    d.netOperatingIncome ??
    (profit + annualDebtService)
  );

const capRate =
  safePrice > 0
    ? (netOperatingIncome / safePrice) * 100
    : 0;

const dscr =
  annualDebtService > 0
    ? netOperatingIncome / annualDebtService
    : null;

const dscrLabel =
  Number.isFinite(dscr)
    ? dscr.toFixed(2)
    : "N/A";

row(
  T(
    "Importo richiesto",
    "Requested loan"
  ),
  eur(loan)
);

row(
  "LTV",
  ltv === null ? "N/A" : ltv.toFixed(1) + "%"
);

row(
  T(
    "Tasso ipotizzato",
    "Assumed interest rate"
  ),
  financingRate.toFixed(2) + "%"
);

row(
  T(
    "Durata ipotizzata",
    "Assumed loan term"
  ),
  Math.round(financingYears) +
  T(" anni", " years")
);

row(
  T(
    "Rata mutuo annua stimata",
    "Estimated annual debt service"
  ),
  eur(annualDebtService)
);

row(
  "DSCR",
  dscrLabel
);

row(
  "NOI",
  eur(netOperatingIncome)
);

const incomeTaxCost = safe(d.taxCost);
if(incomeTaxCost > 0){
  row(
    T("Imposte stimate sul risultato operativo", "Estimated income taxes on operating profit"),
    eur(incomeTaxCost)
  );
}

row(
  "Cap Rate",
  price > 0 ? capRate.toFixed(2) + "%" : "N/A"
);

row(
  T(
    "Cashflow netto dopo mutuo",
    "Net cashflow after mortgage"
  ),
  eur(profit)
);

// DECISION
y += 10;

const hasFinancing =
  loan > 0 &&
  annualDebtService > 0;

const financingSustainable =
  hasFinancing &&
  dscr >= 1.2;

const financingColor =
  !hasFinancing
    ? [100,116,139]
    : financingSustainable
      ? [16,185,129]
      : [200,50,50];

const financingLabel = buildPDFScenarioCommentary({cashflow: profit, annualDebtService, dscr}, T).financingLabel;

doc.setFillColor(
  ...financingColor
);

doc.roundedRect(
  20,
  y,
  170,
  18,
  6,
  6,
  "F"
);

doc.setTextColor(255);
doc.setFontSize(11);

doc.text(
  financingLabel,
  25,
  y + 12
);

footer();

// ===================================================
// MARKET
// ===================================================
doc.addPage();
y = 30;
doc.setFontSize(14);doc.setTextColor(...dark);
doc.text(T("Riferimento interno illustrativo","Illustrative internal reference"),20,y);
y += 16;
const marketKey = String(city).toLowerCase().trim();
const internalReference = window.RB_MARKET_DATA?.[marketKey]?.roi;
const hasLocalBenchmark = internalReference !== null && internalReference !== undefined && Number.isFinite(Number(internalReference));
row(T("ROI equity","Equity ROI"),equity > 0 ? pct(roi) : "N/A");
row(isOwnedProperty && equity <= 0 ? T("Confronto ROI","ROI comparison") : T("Riferimento interno illustrativo","Illustrative internal reference"),isOwnedProperty && equity <= 0 ? T("Non applicabile","Not applicable") : hasLocalBenchmark ? pct(internalReference) : T("Non disponibile","Unavailable"));
y += 14;
doc.setFontSize(11);doc.setTextColor(...gray);
doc.text(T("BASI NON COMPARABILI","BASES NOT COMPARABLE"),20,y);
y += 10;
doc.setFillColor(248,250,252);doc.roundedRect(20,y,170,50,5,5,"F");
doc.setFontSize(10);doc.setTextColor(...dark);
const referenceNote = equity <= 0
  ? (isOwnedProperty ? T("Immobile già posseduto: ROI sul capitale di avvio non applicabile. Valuta ricavi, costi e cashflow; il rischio considera solo i fattori disponibili.","Already owned property: return on startup capital is not applicable. Assess revenue, costs and cashflow; risk covers only available factors.") : T("Il ROI equity non è applicabile con capitale proprio zero. Valuta cashflow, servizio del debito e costi accessori. Il riferimento interno non misura la performance dello scenario.","Equity ROI is not applicable with zero equity. Assess cash flow, debt service and transaction costs. The internal reference does not measure this scenario's performance."))
  : T("La tabella interna è statica e illustrativa: non documenta una fonte esterna aggiornata né gli stessi costi e la stessa leva della simulazione. Il confronto non misura una sovraperformance o sottoperformance di mercato.","The internal table is static and illustrative: it documents neither an updated external source nor the same costs and leverage as the simulation. It does not measure market outperformance or underperformance.");
doc.text(doc.splitTextToSize(referenceNote,155),25,y+12);
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

const pdfRiskBreakdown = d.riskBreakdown || null;
const pdfRiskDetails = pdfRiskBreakdown
  ? [
      `${T("Base prudenziale","Prudential base")} +${safe(pdfRiskBreakdown.base)}`,
      equity > 0 ? `${T("ROI equity","Equity ROI")} +${safe(pdfRiskBreakdown.roi)}` : T("ROI equity: N/A, componente esclusa", "Equity ROI: N/A, component excluded"),
      `${T("Occupazione","Occupancy")} +${safe(pdfRiskBreakdown.occupancy)}`,
      `${T("Leva LTV","LTV leverage")} +${safe(pdfRiskBreakdown.leverage)}`,
      `${T("Copertura DSCR","DSCR coverage")} +${safe(pdfRiskBreakdown.debtCoverage)}`,
      `${T("Cashflow","Cashflow")} +${safe(pdfRiskBreakdown.cashflow)}`
    ]
  : null;

doc.text(
  pdfRiskDetails || T(
    "L'analisi considera sostenibilità del cashflow, leva finanziaria, copertura del debito e stabilità operativa.",
    "The analysis considers cashflow sustainability, leverage, debt coverage and operational stability."
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
  T("Come leggere gli scenari", "How to read the scenarios"),
  20,
  y
);
y += 10;
const scenarioExplanation = doc.splitTextToSize(T(
  "I ricavi illustrativi della sezione performance variano del -20% e +20% rispetto alla base. Il cashflow riportato sopra appartiene solo allo scenario base. Per confrontare altri cashflow e ROI, modifica le ipotesi e avvia una nuova analisi: costi, imposte e mutuo non variano in proporzione ai ricavi.",
  "The illustrative revenue in the performance section varies by -20% and +20% from the base. The cashflow above belongs only to the base scenario. To compare other cashflows and ROIs, change the assumptions and run a new analysis: costs, taxes and debt payments do not vary in proportion to revenue."
), 170);
doc.setFontSize(9);
doc.setTextColor(...gray);
doc.text(scenarioExplanation, 20, y);


footer();


// ===================================================
// EXECUTIVE RECOMMENDATION
// ===================================================

doc.addPage();

y = 30;

doc.setFontSize(18);
doc.setTextColor(...dark);

doc.text(
  T(
    "Valutazione del modello",
    "Model assessment"
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
  pdfVerdictLabel,
  28,
  y + 18
);

doc.setFontSize(9);

doc.text(
  T(
    "Valutazione RendimentoBB",
    "RendimentoBB Assessment"
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
    "Elementi da valutare",
    "Assessment points"
  ),
  20,
  y
);

y += 10;

const insights = [];

// ROI
if(d.assumptions?.source === "owned_property") insights.push(T("Immobile già di proprietà: il capitale di avvio esclude il valore della casa. Il ROI di avvio non è il rendimento dell’intero patrimonio immobiliare.","Already owned property: startup capital excludes the house value. Startup ROI is not return on the entire property asset."));
insights.push(equity <= 0
  ? (d.assumptions?.source === "owned_property"
    ? T("Immobile già di proprietà: nessun capitale di avvio indicato. ROI sul capitale non applicabile; valuta ricavi, costi e cashflow.","Already owned property: no startup capital provided. Return on capital is not applicable; assess revenue, costs and cashflow.")
    : T("Finanziamento al 100%: ROI equity non applicabile. Valuta cashflow, servizio del debito e costi accessori.","100% financing: equity ROI is not applicable. Assess cash flow, debt service and transaction costs."))
  : T("Il ROI deriva dalle ipotesi inserite; il riferimento interno non è un confronto di mercato verificato.","ROI derives from the entered assumptions; the internal reference is not a verified market comparison."));

// Cashflow
if (monthly >= 1500) {

  insights.push(
    T(
      "Il cashflow mensile simulato è positivo; verifica il margine anche con ricavi inferiori.",
      "Simulated monthly cashflow is positive; also check the buffer with lower revenue."
    )
  );

} else if (profit > 0) {

  insights.push(
    T(
      "Il cashflow mensile è positivo nelle ipotesi inserite, senza verifica dei risultati effettivi.",
      "Monthly cashflow is positive under the entered assumptions; actual results are not verified."
    )
  );

} else {

  insights.push(
    T(
      profit < 0 ? "Il cashflow mensile simulato è negativo: rivedi ricavi, costi e finanziamento." : "Il cashflow simulato è in pareggio: manca un margine per imprevisti.",
      profit < 0 ? "Simulated monthly cashflow is negative: review revenue, costs and financing." : "Simulated cashflow breaks even: there is no buffer for unforeseen costs."
    )
  );

}

// Risk
if (riskScore < 40) {

  insights.push(
    T(
      "L’indice del modello rientra nella fascia bassa; non misura tutti i rischi dell’immobile.",
      "The model index is in the low band; it does not measure all property risks."
    )
  );

} else if (riskScore < 65) {

  insights.push(
    T(
      "L’indice del modello rientra nella fascia moderata: verifica le ipotesi più sensibili.",
      "The model index is in the moderate band: check the most sensitive assumptions."
    )
  );

} else {

  insights.push(
    T(
      "L’indice del modello rientra nella fascia alta: approfondisci leva, ricavi e costi.",
      "The model index is in the high band: examine leverage, revenue and costs."
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
if (isOwnedProperty || roi < 20) {

  nextSteps.push(isOwnedProperty
    ? T("Confrontare tariffa, occupazione e costi operativi con dati effettivi; verificare il cashflow anche in scenari prudenti.","Compare rates, occupancy and operating costs with actual data; also test cashflow under conservative scenarios.")
    : T("Confrontare prezzo, tariffa e occupazione con dati effettivi; non aumentare le ipotesi solo per migliorare il ROI.","Check price, rate and occupancy against actual data; do not raise assumptions just to improve ROI."));

}

// Occupancy
if (Number.isFinite(occupancy) && occupancy < 65) {

  nextSteps.push(
    T(
      "Verificare occupazione e stagionalità con immobili comparabili e costi di acquisizione ospiti.",
      "Check occupancy and seasonality against comparable properties and guest acquisition costs."
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
      "Verificare le ipotesi con dati effettivi e confrontare uno scenario più prudente prima di decidere.",
      "Check assumptions against actual data and compare a more cautious scenario before deciding."
    )
  );

}

doc.setFontSize(9);
doc.setTextColor(...gray);

nextSteps.forEach(step => {

  doc.text(
    "• " + step,
    25,
    y,
    {
      maxWidth: 155
    }
  );

  y += 8;

});

y += 10;

doc.setFontSize(8);
doc.setTextColor(...gray);
doc.text(T(
  "Esito del modello su ipotesi: non è una raccomandazione di acquisto né una verifica dell'immobile. Il rischio è un indice del modello, non una probabilità di perdita.",
  "Model outcome based on assumptions: not a purchase recommendation or a property verification. Risk is a model index, not a probability of loss."
),20,y,{maxWidth:170});
y += 16;

// ================= REPORT SIGNATURE =================

doc.setFontSize(8);
doc.setTextColor(...gray);

doc.text(
  T(
    "Elaborato dal motore di analisi RendimentoBB • 2026",
    "Prepared by the RendimentoBB analysis engine • 2026"
  ),
  20,
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
      realROI,

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
doc.save(`RendimentoBB-Fattibilita-${city}-${equity > 0 ? roi.toFixed(1)+"ROI" : "ROI-N-A"}.pdf`);

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

  const link = getSafePropertyListingURL(localStorage.getItem("property_link"));

  if(!link) return;

  const detectedCity = extractCityFromLink(link);

  

  if(detectedCity){
    window.location.href = "/tool/?city=" + detectedCity;
  }

}

// ================= STRIPE SUBSCRIPTION =================

window.buyPlan = async function(plan){

  const t = (it, en) =>
    window.currentLang === "en"
      ? en
      : it;

  const user = window.currentUser;

  if(!user){

    if(typeof window.showRegisterPopup === "function"){
      window.showRegisterPopup();
    }
    else{
      window.location.href = "/login/";
    }

    return;
  }

  const validPlans = [
    "investor",
    "pro",
    "pro_yearly"
  ];

  const requestedPlan =
    String(plan || "")
      .toLowerCase()
      .trim();

  if(!validPlans.includes(requestedPlan)){

    showToast?.(
      t(
        "Piano non valido",
        "Invalid plan"
      ),
      "error"
    );

    return;
  }

  if(typeof window.rbReviewPurchase !== "function"){
    showToast?.(t("Ricarica la pagina per consultare le condizioni.","Reload the page to review the terms."),"error");return;
  }
  const purchaseOwner=user.uid;
  if(!await window.rbReviewPurchase(requestedPlan))return;
  if(window.currentUser?.uid !== purchaseOwner)return;
  try{
        const idToken =
      await user.getIdToken();

    const response =
      await fetch(
        "/api/create-checkout-session",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },

          body: JSON.stringify({
            plan: requestedPlan, acceptedTerms:true, termsVersion:"2026-10-09-rc85"
          })
        }
      );

    const data =
      await response.json();

    if(
      response.status === 409 &&
      data?.code === "ACTIVE_SUBSCRIPTION"
    ){

      showToast?.(
        t(
          "Hai già un abbonamento attivo",
          "You already have an active subscription"
        ),
        "info"
      );

      return;
    }

    if(response.status === 409 && ["CHECKOUT_IN_PROGRESS", "PAYMENT_PROCESSING", "PROFILE_REQUIRED"].includes(data?.code)){
      const message = data.code === "PAYMENT_PROCESSING"
        ? t("Pagamento già completato: attendi l’attivazione del piano e aggiorna la pagina.", "Payment already completed: wait for plan activation and refresh the page.")
        : data.code === "PROFILE_REQUIRED"
          ? t("Esci e accedi nuovamente prima di acquistare.", "Sign out and sign in again before purchasing.")
          : t("Un checkout è già in preparazione. Attendi qualche secondo e riprova.", "A checkout is already being prepared. Wait a few seconds and try again.");
      showToast?.(message, "info");
      return;
    }

    if(!response.ok){

      throw new Error(
        data?.error ||
        "Checkout request failed"
      );

    }

    if(
      typeof data.url !== "string" ||
      !data.url.startsWith(
        "https://checkout.stripe.com/"
      )
    ){

      throw new Error(
        "Invalid checkout response"
      );

    }

    window.location.assign(
      data.url
    );

  }
  catch(error){

    showToast?.(
      t(
        "Servizio di pagamento temporaneamente non disponibile. Riprova.",
        "Payment service temporarily unavailable. Please try again."
      ),
      "error"
    );

  }

};
// ================= PROPERTY SCRAPER =================

async function scrapePropertyFromBrowser(url){



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

const storedLink = localStorage.getItem("property_link");
if(!storedLink) return;
const link = getSafePropertyListingURL(storedLink);
if(!link){
  localStorage.removeItem("property_link");
  renderPropertyListingSource(storedLink);
  return;
}

// ===== MOSTRA LINK ANALIZZATO =====

renderPropertyListingSource(link);




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

}

// salva prezzo
localStorage.setItem("property_price", data.price);

// calcolo manuale solo quando l'utente clicca "Calcola ROI"

}else{

// niente errore: inserimento manuale


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

const propertyLink = link;

for(const key in cityMap){

if(propertyLink.toLowerCase().includes(key)){
detectedCity = cityMap[key];
break;
}

}

if(detectedCity && !localStorage.getItem("selected_city")){
  window.currentCity = detectedCity;
}

}

// ================= MORTGAGE RATE AUTO UPDATE =================

function checkMortgageRateUpdate(){
  // Legacy entry point retained: no market refresh without an actual data source.
  return window.RB_MORTGAGE_RATES_META || null;
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

    

      callback();
    }

    if(attempts > 50){
      clearInterval(interval);
      appDebugWarn("⚠️ Firebase timeout → continuo comunque");
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
// Production: nessun log
}


// ===============================================
// APPLY MORTGAGE FROM COMPARATOR
// ===============================================

function applySelectedMortgage(){
  if(!window.location.pathname.startsWith("/tool") || !window.firebaseReady) return;
  localStorage.removeItem("mortgage_rate"); localStorage.removeItem("selected_mortgage_rate");
  const scenario = RBInvestmentJourney.read(sessionStorage, window.currentUser?.uid || null);
  if(!scenario) return;
  RBInvestmentJourney.clear(sessionStorage);
  localStorage.removeItem("mortgage_rate"); localStorage.removeItem("selected_mortgage_rate");
  window.rbImportedMortgage = {data:scenario, linkedPrincipal:true};
  document.getElementById("interestRate").value = String(scenario.rate);
  document.getElementById("loanYears").value = String(scenario.years);
  // Do not invent the purchase price or equity: imported principal is reconciled once price is entered.
  window.rbSetPropertyMode?.("purchase");
  document.getElementById("price").value = scenario.propertyPrice === undefined ? "" : String(scenario.propertyPrice);
  document.getElementById("equity").value = scenario.propertyPrice === undefined ? "" : String(scenario.propertyPrice - scenario.amount);
  for(const field of ["occupancy", "expenses", "commission", "tax"]){
    if(scenario[field] !== undefined) document.getElementById(field).value = String(scenario[field]);
  }
  if(scenario.location && locationInput){
    locationInput.value = scenario.location;
    locationInput.dispatchEvent(new Event("input", {bubbles:true}));
  }
  const occupancy = Number(document.getElementById("occupancy").value);
  const equivalent = RBInvestmentJourney.equivalentNight(scenario.income, occupancy);
  if(equivalent !== null) document.getElementById("priceNight").value = String(equivalent);
  document.getElementById("interestRate").closest("details")?.setAttribute("open", "");
  updateMortgageTransferSummary();
}

function updateMortgageTransferSummary(){
  const imported = window.rbImportedMortgage;
  const summary = document.getElementById("mortgage-transfer-summary");
  if(!summary || !imported) return;
  summary.hidden = false;
  const data = imported.data;
  const money = value => new Intl.NumberFormat(window.currentLang === "en" ? "en-US" : "it-IT", {style:"currency", currency:"EUR"}).format(value);
  const price = Number(document.getElementById("price").value);
  const equity = Number(document.getElementById("equity").value);
  document.getElementById("mortgage-transfer-values").textContent = t("Mutuo originale", "Original loan") + ": " + money(data.amount) + " · " + data.years + t(" anni", " years") + " · " + data.rate + "% · " + t("Ricavi annui originali", "Original annual revenue") + ": " + money(data.income);
  let note = data.propertyPrice !== undefined
    ? t("Prezzo e capitale proprio trasferiti. La tariffa equivalente conserva i ricavi annui con l’occupazione mostrata. Verifica le ipotesi e completa gli eventuali costi mancanti.", "Purchase price and equity transferred. The equivalent nightly rate preserves annual revenue at the displayed occupancy. Verify assumptions and complete any missing costs.")
    : t("Inserisci il prezzo dell’immobile: il capitale proprio sarà prezzo meno mutuo. La tariffa equivalente riproduce i ricavi originali con l’occupazione mostrata; verifica entrambe le ipotesi e completa i costi.", "Enter the purchase price: equity will equal price minus loan. The equivalent nightly rate reproduces original revenue with the displayed occupancy; verify both assumptions and complete costs.");
  if(price > 0){
    note += " " + t("Mutuo nel modello", "Loan in the model") + ": " + money(Math.max(0, price - equity)) + ".";
    if(data.amount > price && imported.linkedPrincipal) note += " " + t("Il mutuo supera il prezzo: verifica gli importi.", "Loan exceeds the purchase price: check the amounts.");
  }
  if(price > 0 && equity === 0) note += " " + t("Finanziamento al 100%: ROI equity e recupero del capitale proprio non applicabili. Valuta cashflow e servizio del debito; verifica i costi accessori e le condizioni con la banca.", "100% financing: equity ROI and equity payback are not applicable. Assess cash flow and debt service; verify transaction costs and terms with the bank.");
  const revenue = Number(document.getElementById("priceNight").value) * 365 * Number(document.getElementById("occupancy").value) / 100;
  if(Math.abs(revenue - data.income) > 0.01) note += " " + t("I ricavi del modello sono stati modificati", "Model revenue has changed") + ": " + money(revenue) + ".";
  document.getElementById("mortgage-transfer-note").textContent = note;
}

document.addEventListener("rb_auth_ready", () => queueMicrotask(applySelectedMortgage));
document.addEventListener("DOMContentLoaded", () => {
  queueMicrotask(() => {
    const incoming = new URLSearchParams(window.location.search).get("location");
    if(incoming && locationInput){ locationInput.value = incoming.slice(0, 80); locationInput.dispatchEvent(new Event("input", {bubbles:true})); }
    applySelectedMortgage();
  });
  document.getElementById("price")?.addEventListener("input", () => {
    const imported = window.rbImportedMortgage;
    if(imported?.linkedPrincipal){
      const value = Number(document.getElementById("price").value);
      document.getElementById("equity").value = value >= imported.data.amount ? String(value - imported.data.amount) : "";
      document.getElementById("equity").setCustomValidity("");
    }
    updateMortgageTransferSummary();
  });
  document.getElementById("equity")?.addEventListener("input", () => {
    document.getElementById("equity").setCustomValidity("");
    if(window.rbImportedMortgage) window.rbImportedMortgage.linkedPrincipal = false;
    updateMortgageTransferSummary();
  });
  for(const id of ["priceNight", "occupancy", "interestRate", "loanYears"]) document.getElementById(id)?.addEventListener("input", updateMortgageTransferSummary);
  document.getElementById("mortgage-transfer-clear")?.addEventListener("click", () => {
    window.rbImportedMortgage = null; RBInvestmentJourney.clear(sessionStorage);
    document.getElementById("mortgage-transfer-summary").hidden = true;
  });
});
document.addEventListener("rb_language_changed", updateMortgageTransferSummary);

// ================= AUTO LOAD PROPERTY =================

document.addEventListener("DOMContentLoaded", () => {
  // A mortgage import has priority over a previous property selection.
  if(window.rbImportedMortgage || sessionStorage.getItem(RBInvestmentJourney.key)) return;

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

// Production: nessun log

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
📍 ${String(savedCity || "-").replace(/[&<>"']/g, character => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;"})[character])}
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

  const exactMarket = mapLocationToCity(savedCity);
  citySelect.value = exactMarket || "";
  if(locationInput){
    locationInput.value = savedCity;
    locationInput.dispatchEvent(new Event("input", {bubbles:true}));
  }else if(exactMarket){ citySelect.dispatchEvent(new Event("change")); }

}

    window.currentCity =
    savedCity.toLowerCase();

    localStorage.setItem(
      "selected_city",
      savedCity.toLowerCase()
    );

  }

// Production: nessun log

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

    <div>📍 City: ${String(savedCity || "").replace(/[&<>"']/g, character => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;"})[character])}</div>

  </div>

  `;

}

  setTimeout(()=>{

  // Production: nessun log

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
 
}

window.__CITY_LOCKED__ = window.location.pathname.startsWith("/roi-bnb/");

// 🔥 APPLY SUBITO (UNA SOLA VOLTA)
applyCityBackground(selectedCity);


// ================= UI SYNC =================

document.addEventListener("DOMContentLoaded", () => {

  if(window.__CITY_LOCKED__){
    
  }

  const citySelector = document.getElementById("market-city");

  if(citySelector && !window.__CITY_LOCKED__){
    citySelector.value = selectedCity;
  }

  // 🔥 APPLY UNA SOLA VOLTA (NO SPAM)
  applyCityBackground(selectedCity);

  // Production: nessun log

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
    
    return;
  }

  

  window.proUnlocked = true;

  // ================= ADMIN =================
  if(window.isAdmin && window.isAdmin()){
    

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
  document.querySelectorAll(".pro-only:not([data-pdf-only])").forEach(el=>{
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
      
      startPlanPurchase("pro");
    };
  }

  // 🔥 INVESTOR BUTTON
  const investorBtn = document.querySelector(".plan-investor .btn-main");

  if(investorBtn){
    investorBtn.onclick = () => {
      
      startPlanPurchase("investor");
    };
  }

  // 🔥 YEARLY BUTTON
  const yearlyBtn = document.querySelector(".plan-annual .btn-main");

  if(yearlyBtn){
    yearlyBtn.onclick = () => {
      
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
            "Registrati gratis per salvare la simulazione e consultare i risultati disponibili nel tuo piano.",
            "Sign up for free to save the simulation and view the results available in your plan."
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

  // 🔥 BLOCCA HEADER / MENU E RENDE VISIBILE IL POPUP
  document.body.classList.add(
    "popup-open",
    "rb-ui-popup-open"
  );

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

  // 🔥 SBLOCCA HEADER / MENU E RIPRISTINA LA PAGINA
  document.body.classList.remove(
    "popup-open",
    "rb-ui-popup-open"
  );

  // 🔥 opzionale: reset stato
  window.isCalculating = false;



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
    (plan === "pro" && access.isPro && !window.rbIsTrial?.()) ||
    (plan === "investor" && access.isInvestor && !window.rbIsTrial?.())
  ){
    showToast?.(
      t("Hai già questo piano attivo","You already have this plan"),
      "info"
    );
    return;
  }

  // downgrade blocco
  if(plan === "investor" && access.isPro && !window.rbIsTrial?.()){
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

 

}

// =============================
// 🔥 FINAL UI CONTROL (LOCKED + ANTI OVERRIDE)
// =============================

function forceUnlockUI(){

  const access = window.getUserAccess?.() || {};

 

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

      

      window.calculate("ui_refresh");

    },150);

  }

});

document.addEventListener("rb_auth_ready", () => {

  // Production: auth ready

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



  if(typeof window.calculate === "function"){

    window.calculate(true);

  }

});

document.addEventListener("rb_plan_ready", () => {

  

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

// Production: nessun log

};

// 🔥 sync iniziale
setTimeout(()=>{
  window.syncAccessClasses?.();
}, 500);

// 🔥 sync eventi
window.addEventListener("rb_plan_ready", window.syncAccessClasses);
window.addEventListener("rb_auth_ready", window.syncAccessClasses);

// =====================================
// LANGUAGE-ONLY REFRESH
// =====================================
// Rebuild translated presentation from the existing SSOT snapshot.
// This listener must never invoke calculate() or saveAnalysis().
if(!window.__rbToolLanguageRefreshBound){
  window.__rbToolLanguageRefreshBound = true;

  document.addEventListener("rb_language_changed", () => {
    const data = window.lastAnalysisData;
    if(!data || window.simulationExecuted !== true) return;

    const roi = Number(data.roi ?? data.visualROI ?? 0);
    const risk = Math.round(Number(data.risk ?? 0));
    const cashflow = Number(data.net ?? data.cashflow ?? 0);
    const occupancy = Number(data.occupancy ?? 0);
    const gross = Number(data.gross ?? data.revenueAnnual ?? 0);
    const investment = Number(data.equity ?? 0);
    const city = String(
      data.marketCity ??
      data.city ??
      window.currentCity ??
      "roma"
    ).toLowerCase();

    const score = Number(
      data.investmentScore ??
      window.lastInvestmentScore?.score ??
      0
    );

    if(typeof window.updateInvestmentScore === "function"){
      window.updateInvestmentScore(score);
    }else{
      renderInvestmentScore(roi, risk);
    }

    renderRiskMeter(risk);
    renderInvestmentVerdict(roi, risk, cashflow, occupancy, data.verdict);
    renderInvestmentRanking(roi);
    renderUniversalKPI({
      net: cashflow,
      revenue: gross,
      investment
    });

    const profitLive = document.getElementById("profit-live");
    if(profitLive){
      profitLive.textContent = formatCurrency(cashflow);
    }

    const revenueLive = document.getElementById("revenue-live");
    if(revenueLive){
      const access = window.getUserAccess?.() || {};
      revenueLive.textContent = access.isFree
        ? "—"
        : formatCurrency(gross);
    }

    renderRevenueForecast(gross);
    renderROIMarketComparison(roi, city);
    renderCashflowProjection(cashflow);
    updateROIMessage(roi);

    const badge = document.getElementById("roi-badge");
    if(badge){
      badge.textContent = getInvestmentBadge(roi);
      badge.className = getInvestmentBadgeClass(roi);
    }

    renderFreeSimulationPreview(data, {access:window.getUserAccess?.(), document, lang:window.currentLang});
    renderPropertyModeResults(data, {window, document, access:window.getUserAccess?.()});

    const resultCity = document.getElementById("tool-result-city");
    if(resultCity){
      const cityLabels = {
        roma: t("Roma", "Rome"),
        milano: t("Milano", "Milan"),
        napoli: t("Napoli", "Naples"),
        firenze: t("Firenze", "Florence")
      };
      const cityLabel = cityLabels[city] || data.realCity || city;
      resultCity.textContent =
        `${cityLabel} · ${t("Scenario base", "Base scenario")}`;
    }
  });
}

for(const id of ["price", "equity"]){
  document.getElementById(id)?.addEventListener("input", event => event.target.setCustomValidity?.(""));
}
