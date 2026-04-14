// ========================================
// 🔐 RENDIMENTOBB ACCESS CONTROL SYSTEM
// SINGLE SOURCE OF TRUTH (FINAL PRODUCTION)
// ========================================

// ================= USER STATE =================
window.RB_USER = {
  isLogged: false,
  isPro: false,
  isInvestor: false,
  isAdmin: false,
  plan: "free"
}; // ✅ FIX CRITICO

// ========================================
// 🔧 APPLY UI (GLOBALE - NON ANNIDATA)
// ========================================
function applyAccessUI(){

  if(!window.RB_USER) return;

  const { isPro, isLogged } = window.RB_USER;

  console.log("🎯 APPLY UI:", window.RB_USER);

  // RESET
  document.body.classList.remove("is-pro","is-free","is-guest");

if(isPro){

  document.body.classList.add("is-pro");

  // 🔥 NASCONDI CTA FREE (FIX)
  document.querySelectorAll(`
    .upgrade-box,
    .free-only,
    [data-paywall]
  `).forEach(el => el.remove());

  // 🔓 SBLOCCA CONTENUTI
  document.querySelectorAll(`
    .pro-blur,
    .locked,
    .locked-content
  `).forEach(el=>{
    el.classList.remove("pro-blur","locked","locked-content");
    el.style.filter = "none";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";
  });

}

  // ================= FREE =================
  else if(isLogged){

    document.body.classList.add("is-free");

    document.querySelectorAll(".upgrade-box").forEach(el=>{
      el.style.display = "block";
    });

  }

  // ================= GUEST =================
  else{

  document.body.classList.add("is-guest");

  document.querySelectorAll(`
    .pro-only,
    .investor-only
  `).forEach(el=>{
    el.style.display = "none";
  });

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

    // 🔥 LOGICA UNIFICATA
    const hasFullAccess =
      isPro || isInvestor || isAdmin;

    // ================= SET GLOBAL =================
window.RB_USER = {
  isLogged: userLogged,
  isPro: hasFullAccess,
  isInvestor,
  isAdmin,
  plan
};

    console.log("🧠 RB_USER:", window.RB_USER);

    // ================= APPLY UI =================
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
window.isPro = function(){
  return window.RB_USER?.isPro === true;
};

window.isInvestor = function(){
  return window.RB_USER?.isInvestor === true;
};

window.isLogged = function(){
  return window.RB_USER?.isLogged === true;
};

window.isFree = function(){
  return !window.RB_USER?.isPro;
};

// ========================================
// 🔒 REQUIRE PLAN
// ========================================
window.requirePro = function(){

  if(window.isPro()) return true;

  const lang = window.currentLang || "it";

  const msg =
    lang === "en"
    ? "This feature requires PRO plan"
    : "Questa funzione richiede il piano PRO";

  alert(msg);

  window.location.href = "/pricing/";

  return false;
};

// ========================================
// 🔥 GLOBAL ACCESS (CORE SYSTEM)
// ========================================
window.getUserAccess = function(){

  const u = window.RB_USER || {};

  return {
    isLogged: u.isLogged || false,
    isPro: u.isPro || false,
    isInvestor: u.isInvestor || false,
    isAdmin: u.isAdmin || false,

    // 🔥 KEY FLAGS
    hasPlan: u.isPro || u.isInvestor || u.isAdmin,
    canSeeFullAnalysis: u.isPro || u.isInvestor || u.isAdmin
  };

};

// ========================================
// ⚡ AUTO INIT
// ========================================

// 🔥 quando Firebase ha caricato piano
document.addEventListener("rb_plan_ready", () => {

  console.log("🔥 AccessControl init after plan");

  window.initAccessControl();

});

// 🔒 fallback sicurezza (anti bug)
setTimeout(() => {

  if(!window.RB_USER || !window.RB_USER.plan){

    console.warn("⚠️ Fallback init access control");

    window.initAccessControl();
  }

}, 800);

// 🔥 INIT IMMEDIATO (CRITICO TOOL + HEADER)
document.addEventListener("DOMContentLoaded", () => {

  console.log("⚡ AccessControl DOM init");

  window.initAccessControl();

});
