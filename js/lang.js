// ===============================================
// RENDIMENTOBB – GLOBAL LANGUAGE ENGINE 7.0 PRO
// ===============================================

(function(){

  // ===============================
  // GLOBAL STATE
  // ===============================

  window.RB_LANG = {
    current: localStorage.getItem("rb_lang") || "it",
    supported: ["it", "en"]
  };

  window.currentLang = window.RB_LANG.current;


  // ===============================
  // CORE TRANSLATION ENGINE
  // ===============================

  function applyTranslations(){

    const lang = RB_LANG.current;

    // ================= TEXT =================
    document.querySelectorAll("[data-it], [data-en]").forEach(el => {

      const text = el.getAttribute("data-" + lang);
      if(!text) return;

      // bottoni safe
      if(el.tagName === "A" || el.tagName === "BUTTON"){
  el.textContent = text;
}else {
        el.innerHTML = text;
      }

    });

    // ================= PLACEHOLDER =================
    document.querySelectorAll("[data-placeholder-it]").forEach(el => {
      const ph = el.getAttribute("data-placeholder-" + lang);
      if(ph) el.setAttribute("placeholder", ph);
    });

    document.querySelectorAll("[data-it-placeholder]").forEach(el => {
      const ph = el.getAttribute("data-" + lang + "-placeholder");
      if(ph) el.setAttribute("placeholder", ph);
    });

    // ================= TITLE =================
    const titleEl = document.querySelector("title");
    if(titleEl){
      const titleText = titleEl.getAttribute("data-" + lang);
      if(titleText) document.title = titleText;
    }

    // ================= META =================
    const metaDesc = document.querySelector("meta[name='description']");
    if(metaDesc){
      const descText = metaDesc.getAttribute("data-" + lang);
      if(descText) metaDesc.setAttribute("content", descText);
    }

  }


  // ===============================
  // UPDATE UI
  // ===============================

  function updateLanguageUI(){

    document.documentElement.setAttribute("lang", RB_LANG.current);

    document.querySelectorAll("[id^='btn-']").forEach(btn=>{
      btn.classList.remove("active");
    });

    const activeBtn = document.getElementById("btn-" + RB_LANG.current);
    if(activeBtn){
      activeBtn.classList.add("active");
    }

  }


  // ===============================
  // RERENDER DYNAMIC
  // ===============================

  function rerenderDynamic(){

    window.currentLang = RB_LANG.current;

    if(typeof calculate === "function"){
      if(window.simulationExecuted || document.readyState === "complete"){
        calculate(true);
      }
    }

    if(typeof runRealCalculation === "function"){
      runRealCalculation();
    }

    if(typeof compareMortgages === "function"){
      compareMortgages();
    }

    document.dispatchEvent(
      new CustomEvent("rb_language_changed", {
        detail: { lang: RB_LANG.current }
      })
    );
  }


  // ===============================
  // PUBLIC API
  // ===============================

  window.applyTranslations = applyTranslations;

  // 🔥 alias globale per compatibilità popup / componenti dinamici
window.applyStaticTranslations = applyTranslations;

  window.setLang = function(lang){

    if(!RB_LANG.supported.includes(lang)) return;

    RB_LANG.current = lang;
    window.currentLang = lang;

    localStorage.setItem("rb_lang", lang);

    applyTranslations();
    updateLanguageUI();
    rerenderDynamic();
  };


  // ===============================
  // AUTO INIT (SMART)
  // ===============================

  function initLang(){

    const saved = localStorage.getItem("rb_lang");

    if(saved && RB_LANG.supported.includes(saved)){
      RB_LANG.current = saved;
    } else {
      RB_LANG.current =
        navigator.language.startsWith("en") ? "en" : "it";
    }

    window.currentLang = RB_LANG.current;

    applyTranslations();
    updateLanguageUI();
    rerenderDynamic();

    // 🔥 retry per header dinamico (KEY FIX)
    setTimeout(applyTranslations, 100);
    setTimeout(applyTranslations, 300);
  }

  window.addEventListener("DOMContentLoaded", initLang);


  // ===============================
  // HELPER
  // ===============================

  window.t = function(it, en){
    if(!en) return it;
    return window.RB_LANG.current === "en" ? en : it;
  };

})();


// ===============================
// TEXT MAP
// ===============================

window.RB_TEXT = {

  risk: {
    it: "Rischio",
    en: "Risk"
  },

  breakEven: {
    it: "Break-even",
    en: "Break-even"
  },

  monthlyProfit: {
    it: "Profitto mensile",
    en: "Monthly profit"
  },

  roi: {
    it: "ROI",
    en: "ROI"
  },

  annualProfit: {
    it: "Profitto annuo",
    en: "Annual profit"
  },

  revenue: {
    it: "Ricavi",
    en: "Revenue"
  },

  partialProfit: {
    it: "Profitto stimato (parziale)",
    en: "Estimated profit (partial)"
  }

};

window.tt = function(key){
  const lang = window.RB_LANG.current || "it";
  return window.RB_TEXT?.[key]?.[lang] || key;
};
