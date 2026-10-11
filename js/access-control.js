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
    (void 0);
    return;
  }

  // 🔥 NON interferire durante simulazione
  if(window.simulationExecuted){
    (void 0);
    return;
  }

  const { isPro, isInvestor, isLogged } = window.RB_USER;

  (void 0);

  // reset classi
  document.body.classList.remove(
    "is-pro",
    "is-free",
    "is-guest",
    "is-investor"
  );

  if(isPro){
    document.body.classList.add("is-pro");
    (void 0);
    return;
  }

  if(isInvestor){
    document.body.classList.add("is-investor");
    (void 0);
    return;
  }

  if(isLogged){
    document.body.classList.add("is-free");
    (void 0);
    return;
  }

  document.body.classList.add("is-guest");
  (void 0);
}

// ========================================
// 🚀 INIT ACCESS CONTROL (ANTI BUG)
// ========================================
window.initAccessControl = function(){

  // 🔥 BLOCCO HARD anti doppio init
  if(window.RB_USER.initialized){
    (void 0);
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

    (void 0);

    // 🔥 SOLO classi → NO overlay → NO DOM
    applyAccessUI();

    // 🔥 EVENT UNICO (NO DUPLICATI)
    document.dispatchEvent(
      new CustomEvent("rb_access_ready", {
        detail: window.RB_USER
      })
    );

  }catch(e){
    (void 0);
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

  (void 0);

  window.initAccessControl();

});

// ========================================
// 🔒 FALLBACK SAFE (ANTI RACE CONDITION)
// ========================================
setTimeout(() => {

  if(window.RB_USER.initialized) return;

  if(window.currentPlan){
    
    (void 0);

    window.initAccessControl();

  } else {

    (void 0)

;

  }

}, 3000);
