// ========================================
// 🔐 RENDIMENTOBB ACCESS CONTROL SYSTEM
// FINAL STABLE VERSION (NO CONFLICT / NO DOUBLE INIT)
// ========================================

// ================= USER STATE =================
window.RB_USER = {
  isLogged: false,
  isPro: false,
  isInvestor: false,
  isAdmin: false,
  plan: "free",
  ready: false,
  initialized: false // 🔥 anti doppio init
};

// ========================================
// 🌐 TRANSLATION HELPER (SAFE)
// ========================================
const t = (it, en) =>
  (window.currentLang === "en" ? en : it);

// ========================================
// 🔧 SAFE UI INIT (SOLO CLASSI, ZERO DOM)
// ========================================
function applyAccessUI(){

  if(!window.RB_USER?.ready){
    console.warn("⏳ RB_USER not ready → skip UI");
    return;
  }

  // 🔥 NON interferire durante simulazione
  if(window.simulationExecuted){
    console.warn("⛔ UI locked → handled by simulator");
    return;
  }

  const { isPro, isInvestor, isLogged } = window.RB_USER;

  console.log("🎯 APPLY ACCESS UI:", window.RB_USER);

  // reset classi
  document.body.classList.remove(
    "is-pro",
    "is-free",
    "is-guest",
    "is-investor"
  );

  if(isPro){
    document.body.classList.add("is-pro");
    console.log("🟢 PRO MODE");
    return;
  }

  if(isInvestor){
    document.body.classList.add("is-investor");
    console.log("🟡 INVESTOR MODE");
    return;
  }

  if(isLogged){
    document.body.classList.add("is-free");
    console.log("🔵 FREE USER");
    return;
  }

  document.body.classList.add("is-guest");
  console.log("👻 GUEST MODE");
}

// ========================================
// 🚀 INIT ACCESS CONTROL (ANTI BUG)
// ========================================
window.initAccessControl = function(){

  // 🔥 BLOCCO HARD anti doppio init
  if(window.RB_USER.initialized){
    console.warn("⛔ AccessControl già inizializzato → skip");
    return;
  }

  try{

    const user = window.currentUser || null;
    const planRaw = window.currentPlan || "free";
    const plan = planRaw.toLowerCase();

    const userLogged = !!(user && user.uid);

    const isAdmin =
      user?.email === "rendimentobb@gmail.com";

    const isPro =
      plan === "pro" ||
      plan === "pro_yearly";

    const isInvestor =
      plan === "investor";

    window.RB_USER = {
      isLogged: userLogged,
      isPro: isPro || isAdmin,
      isInvestor: isInvestor,
      isAdmin: isAdmin,
      plan,
      ready: true,
      initialized: true // 🔥 segna init fatto
    };

    console.log("🧠 RB_USER FINAL:", window.RB_USER);

    // 🔥 SOLO classi → NO overlay → NO DOM
    applyAccessUI();

    // 🔥 EVENT UNICO (NO DUPLICATI)
    document.dispatchEvent(
      new CustomEvent("rb_access_ready", {
        detail: window.RB_USER
      })
    );

  }catch(e){
    console.error("❌ AccessControl error:", e);
  }

};

// ========================================
// 🧠 HELPERS
// ========================================
window.isPro = () => window.RB_USER?.isPro === true;

window.isInvestor = () =>
  window.RB_USER?.isInvestor === true &&
  !window.RB_USER?.isPro;

window.isLogged = () =>
  window.RB_USER?.isLogged === true;

window.isFree = () =>
  window.isLogged() &&
  !window.isPro() &&
  !window.isInvestor();

// ========================================
// 🔒 REQUIRE PRO (BILINGUE)
// ========================================
window.requirePro = function(){

  if(window.isPro()) return true;

  showToast(
    t(
      "Passa a PRO per accedere a questa funzione",
      "Upgrade to PRO to access this feature"
    ),
    "warning"
  );

  if(typeof openUpgradeModal === "function"){
    openUpgradeModal("pro");
  }

  return false;
};

// ========================================
// 🔥 GLOBAL ACCESS STANDARD
// ========================================
window.getUserAccess = function(){

  const u = window.RB_USER || {};

  return {
    isLogged: u.isLogged || false,
    isPro: u.isPro || false,
    isInvestor: u.isInvestor || false,
    isAdmin: u.isAdmin || false,
    hasPlan: u.isPro || u.isInvestor || u.isAdmin,
    canSeeFullAnalysis: u.isPro || u.isAdmin,
    canSeeAdvanced: u.isPro || u.isInvestor || u.isAdmin
  };

};

// ========================================
// ⚡ EVENTI (FIX DEFINITIVO)
// ========================================

// 🔥 SOLO quando Firebase è pronto
document.addEventListener("rb_plan_ready", () => {

  console.log("🔥 AccessControl → plan ready");

  window.initAccessControl();

});

// ========================================
// 🔒 FALLBACK SAFE (ANTI RACE CONDITION)
// ========================================
setTimeout(() => {

  if(window.RB_USER.initialized) return;

  if(window.simulationExecuted) return;

  console.warn("⚠️ Fallback AccessControl");

  window.initAccessControl();

}, 1200);
