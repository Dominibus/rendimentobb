// ========================================
// 🔐 RENDIMENTOBB ACCESS CONTROL SYSTEM
// CLEAN VERSION (NO UI CONFLICT)
// ========================================

// ================= USER STATE =================
window.RB_USER = {
  isLogged: false,
  isPro: false,
  isInvestor: false,
  isAdmin: false,
  plan: "free",
  ready: false
};

// ========================================
// 🔧 SAFE UI INIT (SOLO STATICO, NO TOOL)
// ========================================
function applyAccessUI(){

  if(!window.RB_USER?.ready){
    console.warn("⏳ RB_USER not ready → skip UI");
    return;
  }

  // 🔥 BLOCCO TOTALE se simulazione attiva
  if(window.simulationExecuted){
    console.warn("⛔ UI control locked → handled by calculate()");
    return;
  }

  const { isPro, isInvestor, isLogged } = window.RB_USER;

  console.log("🎯 APPLY ACCESS UI:", window.RB_USER);

  // ================= RESET BASE =================
  document.body.classList.remove(
    "is-pro",
    "is-free",
    "is-guest",
    "is-investor"
  );

  // ================= PRO / ADMIN =================
  if(isPro){
    document.body.classList.add("is-pro");
    console.log("🟢 PRO MODE");
    return;
  }

  // ================= INVESTOR =================
  if(isInvestor){
    document.body.classList.add("is-investor");
    console.log("🟡 INVESTOR MODE");
    return;
  }

  // ================= FREE LOGGED =================
  if(isLogged){
    document.body.classList.add("is-free");
    console.log("🔵 FREE USER");
    return;
  }

  // ================= GUEST =================
  document.body.classList.add("is-guest");
  console.log("👻 GUEST MODE");
}

// ========================================
// 🚀 INIT ACCESS CONTROL
// ========================================
window.initAccessControl = function(){

  try{

    const user = window.currentUser || null;
    const plan = (window.currentPlan || "free").toLowerCase();

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
      ready: true
    };

    console.log("🧠 RB_USER:", window.RB_USER);

    // 🔥 SOLO classi base (NO overlay / NO reset DOM)
    applyAccessUI();

    // ================= EVENT =================
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

window.isLogged = () => window.RB_USER?.isLogged === true;

window.isFree = () =>
  window.isLogged() &&
  !window.isPro() &&
  !window.isInvestor();

// ========================================
// 🔒 REQUIRE PLAN (BILINGUE)
// ========================================
window.requirePro = function(){

  if(window.isPro()) return true;

  const t = (it, en) =>
    (window.currentLang === "en" ? en : it);

  showToast(
    t(
      "Passa a PRO per accedere a questa funzione",
      "Upgrade to PRO to access this feature"
    ),
    "warning"
  );

  openUpgradeModal("pro");

  return false;
};

// ========================================
// 🔥 GLOBAL ACCESS (UNICO STANDARD)
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
// ⚡ EVENTI (TIMING FIX)
// ========================================

// 🔥 SOLO dopo Firebase / plan ready
document.addEventListener("rb_plan_ready", () => {

  console.log("🔥 AccessControl init AFTER plan");

  window.initAccessControl();

});

// 🔒 fallback sicuro (NO override tool)
setTimeout(() => {

  if(!window.RB_USER.ready && !window.simulationExecuted){

    console.warn("⚠️ Fallback access control");

    window.initAccessControl();
  }

}, 1500);
