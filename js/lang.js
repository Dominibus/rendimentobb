// ===============================================
// RENDIMENTOBB – GLOBAL LANGUAGE ENGINE 5.1
// Full Static + SEO + Dynamic Sync (Stable Fix)
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

    // -----------------------------
    // Standard data-it / data-en
    // -----------------------------
    document.querySelectorAll("[data-it]").forEach(el => {

      const text = el.getAttribute("data-" + RB_LANG.current);
      if(!text) return;

      if(text.includes("<")){
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }

    });


    // -----------------------------
    // Placeholder support
    // -----------------------------
    document.querySelectorAll("[data-placeholder-it]").forEach(el => {

      const ph = el.getAttribute("data-placeholder-" + RB_LANG.current);
      if(ph){
        el.setAttribute("placeholder", ph);
      }

    });


    // -----------------------------
    // TITLE support (FIXED)
    // -----------------------------
    const titleEl = document.querySelector("title");
    if(titleEl){
      const titleText = titleEl.getAttribute("data-" + RB_LANG.current);
      if(titleText){
        document.title = titleText;   // 🔥 Stable update
      }
    }


    // -----------------------------
    // META DESCRIPTION support (HARDENED)
    // -----------------------------
    const metaDesc = document.querySelector("meta[name='description']");
    if(metaDesc){
      const descText = metaDesc.getAttribute("data-" + RB_LANG.current);
      if(descText){
        metaDesc.setAttribute("content", descText);
      }
    }

  }


  // ===============================
  // UPDATE LANGUAGE UI
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

    if(typeof calculate === "function"){
      calculate();
    }

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
