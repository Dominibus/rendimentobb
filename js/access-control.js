// ========================================
// 🔐 RENDIMENTOBB ACCESS CONTROL SYSTEM
// FINAL PRODUCTION (FIX TIMING + UNLOCK)
// ========================================

// ================= USER STATE =================
window.RB_USER = {
  isLogged: false,
  isPro: false,
  isInvestor: false,
  isAdmin: false,
  plan: "free",
  ready: false // 🔥 FIX TIMING
};

// ========================================
// 🔧 APPLY UI
// ========================================
function applyAccessUI(){

  if(!window.RB_USER || !window.RB_USER.ready){
    console.warn("⏳ RB_USER non pronto → skip UI");
    return;
  }

  const { isPro, isInvestor, isLogged } = window.RB_USER;

  console.log("🎯 APPLY UI:", window.RB_USER);

  // ========================================
  // 🔥 RESET TOTALE (CRITICO)
  // ========================================

  document.body.classList.remove(
    "is-pro",
    "is-free",
    "is-guest",
    "is-investor"
  );

  // 🔥 RIMUOVE TUTTI GLI OVERLAY RESIDUI
  document.querySelectorAll(`
    .locked-overlay,
    .upgrade-overlay,
    .home-blur-overlay,
    .paywall-mini,
    [data-paywall]
  `).forEach(el => el.remove());

  // 🔥 RESET STILI BLOCCATI
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

  // ========================================
  // 🟢 PRO / ADMIN
  // ========================================
  if(isPro){

    document.body.classList.add("is-pro");

    console.log("🟢 PRO UI");

    // rimuove paywall
    document.querySelectorAll(`
      .upgrade-box,
      .free-only
    `).forEach(el => el.remove());

    const popup = document.querySelector("#upgrade-popup");
    if(popup) popup.style.display = "none";

    return;
  }

  // ========================================
  // 🟡 INVESTOR
  // ========================================
  if(isInvestor){

    document.body.classList.add("is-investor");

    console.log("🟡 INVESTOR UI");

    // 🔓 MOSTRA contenuti base + avanzati
    document.querySelectorAll(".investor-only").forEach(el=>{
      el.style.display = "block";
    });

    // 🔒 NASCONDI SOLO PRO
    document.querySelectorAll(".pro-only").forEach(el=>{
      el.style.display = "none";
    });

    // 🔥 NASCONDI upgrade free
    document.querySelectorAll(".upgrade-box.free-only").forEach(el=>{
      el.style.display = "none";
    });

    return;
  }

  // ========================================
  // 🔓 FREE LOGGATO
  // ========================================
  if(isLogged){

    document.body.classList.add("is-free");

    console.log("🔵 FREE USER");

    document.querySelectorAll(".upgrade-box").forEach(el=>{
      el.style.display = "block";
    });

    return;
  }

  // ========================================
  // 👻 GUEST
  // ========================================
  document.body.classList.add("is-guest");

  console.log("👻 GUEST");

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

    window.RB_USER = {
  isLogged: userLogged,
  isPro: isPro || isAdmin,      // 🔥 SOLO PRO + ADMIN
  isInvestor: isInvestor,
  isAdmin: isAdmin,
  plan,
  ready: true
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
// 🧠 HELPERS (FIX DEFINITIVO)
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
// 🔒 REQUIRE PLAN
// ========================================
window.requirePro = function(){

  if(window.isPro()) return true;

  const lang = window.currentLang || "it";

  showToast(
    lang === "en"
      ? "Upgrade to PRO to access this feature"
      : "Passa a PRO per accedere a questa funzione",
    "warning"
  );

  openUpgradeModal("pro");

  return false;
};

// ========================================
// 🔥 GLOBAL ACCESS
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
// ⚡ EVENTI CORRETTI (FIX TIMING)
// ========================================

// 🔥 SOLO quando Firebase ha caricato piano
document.addEventListener("rb_plan_ready", () => {

  console.log("🔥 AccessControl init AFTER plan");

  window.initAccessControl();

});

// ❌ NON inizializzare subito (ERA IL BUG)
// document.addEventListener("DOMContentLoaded", ... ) → RIMOSSO

// 🔒 fallback sicurezza (solo se proprio non arriva Firebase)
setTimeout(() => {

  if(!window.RB_USER.ready){

    console.warn("⚠️ Fallback access control");

    window.initAccessControl();
  }

}, 1500);
