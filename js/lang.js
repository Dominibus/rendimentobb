// ===============================================
// RENDIMENTOBB – GLOBAL LANGUAGE ENGINE 4.0 (SaaS Ready)
// Single Source of Truth for ALL Pages
// ===============================================

(function(){

  // ===============================
  // GLOBAL STATE
  // ===============================

  window.RB_LANG = {
    current: localStorage.getItem("rb_lang") || "it",
    supported: ["it", "en"]
  };


  // ===============================
  // APPLY STATIC TRANSLATIONS
  // ===============================

  function applyStaticTranslations(){

    // Standard data-it / data-en
    document.querySelectorAll("[data-it]").forEach(el => {

      const text = el.getAttribute("data-" + RB_LANG.current);
      if(!text) return;

      if(text.includes("<") ){
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }

    });

    // Placeholder support
    document.querySelectorAll("[data-placeholder-it]").forEach(el => {

      const ph = el.getAttribute("data-placeholder-" + RB_LANG.current);
      if(ph){
        el.setAttribute("placeholder", ph);
      }

    });

  }


  // ===============================
  // UPDATE UI BUTTONS
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
  // RERENDER DYNAMIC CONTENT
  // ===============================

  function rerenderDynamic(){

    // Tool engine 12.x
    if(typeof calculate === "function"){
      calculate();
    }

    // Legacy fallback
    if(typeof runRealCalculation === "function"){
      runRealCalculation();
    }

  }


  // ===============================
  // PUBLIC SET LANGUAGE
  // ===============================

  window.setLang = function(lang){

    if(!RB_LANG.supported.includes(lang)) return;

    RB_LANG.current = lang;
    localStorage.setItem("rb_lang", lang);

    applyStaticTranslations();
    updateLanguageUI();
    rerenderDynamic();

  };


  // ===============================
  // AUTO INIT
  // ===============================

  window.addEventListener("DOMContentLoaded", ()=>{

    const saved = localStorage.getItem("rb_lang");

    if(saved && RB_LANG.supported.includes(saved)){
      RB_LANG.current = saved;
    } else {
      RB_LANG.current =
        navigator.language.startsWith("en") ? "en" : "it";
    }

    applyStaticTranslations();
    updateLanguageUI();

  });

})();
