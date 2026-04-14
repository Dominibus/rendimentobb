// ========================================
// 🔐 RENDIMENTOBB ACCESS CONTROL SYSTEM
// SINGLE SOURCE OF TRUTH
// ========================================

// ================= USER STATE =================
window.RB_USER = {
  isLogged: false,
  isPro: false,
  isInvestor: false,
  isAdmin: false,
  plan: "free"
};

// ================= INIT ================= 
window.initAccessControl = function(){

  try{

    const user = window.currentUser || null;
    const plan = window.currentPlan || "free";

    const isLogged = !!(user && user.uid);

    const isPro =
      plan === "pro" ||
      plan === "pro_yearly";

    const isInvestor =
      plan === "investor";

    const isAdmin =
      (user?.email === "rendimentobb@gmail.com");

    // ================= SET GLOBAL =================
    window.RB_USER = {
      isLogged,
      isPro: isPro || isInvestor,
      isInvestor,
      isAdmin,
      plan
    };

    applyAccessUI();

    console.log("🧠 RB_USER:", window.RB_USER);

   // ================= APPLY UI STATE =================

function applyAccessUI(){

  if(!window.RB_USER) return;

  const isPro = window.RB_USER.isPro;
  const isLogged = window.RB_USER.isLogged;

  console.log("🎯 APPLY UI:", { isPro, isLogged });

  // ================= PRO USER =================
  if(isPro){

    document.body.classList.add("is-pro");
    document.body.classList.remove("is-free","is-guest");

    // ❌ NASCONDI CTA + MESSAGGI PAURA
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

  // ================= FREE USER =================
  else if(isLogged){

    document.body.classList.add("is-free");
    document.body.classList.remove("is-pro","is-guest");

    document.querySelectorAll(".upgrade-box").forEach(el=>{
      el.style.display = "block";
    });

  }

  // ================= GUEST =================
  else{

    document.body.classList.add("is-guest");
    document.body.classList.remove("is-pro","is-free");

    document.querySelectorAll(".pro-only").forEach(el=>{
      el.style.display = "none";
    });

  }

}

    // ================= APPLY BODY CLASS =================
    document.body.classList.remove("is-free","is-pro","is-guest");

    if(!isLogged){
      document.body.classList.add("is-guest");
    } else if(window.RB_USER.isPro){
      document.body.classList.add("is-pro");
    } else {
      document.body.classList.add("is-free");
    }

    // ================= EVENT =================
    document.dispatchEvent(new CustomEvent("rb_access_ready"));

  }catch(e){
    console.error("❌ AccessControl error:", e);
  }

};

// ================= HELPERS =================

window.isPro = function(){
  return window.RB_USER?.isPro === true;
};

window.isLogged = function(){
  return window.RB_USER?.isLogged === true;
};

window.isFree = function(){
  return !window.RB_USER?.isPro;
};

// ================= REQUIRE =================

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

// ================= AUTO INIT =================

// 🔥 quando firebase ha caricato utente + piano
document.addEventListener("rb_plan_ready", () => {

  console.log("🔥 AccessControl init after plan");

  window.initAccessControl();

});

// fallback sicurezza
setTimeout(() => {
  if(!window.RB_USER || !window.RB_USER.plan){
    window.initAccessControl();
  }
}, 1000);

// =====================
// 🔥 GLOBAL ACCESS (CORE)
// =====================

window.getUserAccess = function(){

  const u = window.RB_USER || {};

  return {
    isLogged: u.isLogged || false,
    isPro: u.isPro || false,
    isInvestor: u.isInvestor || false,
    isAdmin: u.isAdmin || false,
    hasPlan: u.isPro || u.isInvestor || u.isAdmin
  };

};
