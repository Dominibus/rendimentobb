// ===============================================
// RENDIMENTOBB – GLOBAL LANGUAGE ENGINE 6.0
// FULL SYNC STATIC + DYNAMIC + TOOL FIX
// ===============================================

(function(){

  // ===============================
  // GLOBAL STATE
  // ===============================

  window.RB_LANG = {
    current: localStorage.getItem("rb_lang") || "it",
    supported: ["it", "en"]
  };

  // 🔥 HARD SYNC WITH APP.JS
  window.currentLang = window.RB_LANG.current;


  // ===============================
  // APPLY STATIC TRANSLATIONS
  // ===============================

  function applyStaticTranslations(){

    document.querySelectorAll("[data-it]").forEach(el => {

      const text = el.getAttribute("data-" + RB_LANG.current);
      if(!text) return;

      if(text.includes("<")){
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }

    });

    document.querySelectorAll("[data-placeholder-it]").forEach(el => {

      const ph = el.getAttribute("data-placeholder-" + RB_LANG.current);
      if(ph){
        el.setAttribute("placeholder", ph);
      }

    });

    const titleEl = document.querySelector("title");
    if(titleEl){
      const titleText = titleEl.getAttribute("data-" + RB_LANG.current);
      if(titleText){
        document.title = titleText;
      }
    }

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

    // 🔥 Sync with app.js every time
    window.currentLang = RB_LANG.current;

    if(typeof calculate === "function"){
      calculate();
    }

    if(typeof runRealCalculation === "function"){
      runRealCalculation();
    }

    if(typeof compareMortgages === "function"){
      compareMortgages();
    }

    // 🔥 Dispatch global event (future-proof)
    document.dispatchEvent(
      new CustomEvent("rb_language_changed", {
        detail: { lang: RB_LANG.current }
      })
    );
  }


  // ===============================
  // PUBLIC SET LANGUAGE
  // ===============================

  window.setLang = function(lang){

    if(!RB_LANG.supported.includes(lang)) return;

    RB_LANG.current = lang;
    window.currentLang = lang; // 🔥 CRITICAL FIX

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

    window.currentLang = RB_LANG.current;

    applyStaticTranslations();
    updateLanguageUI();
    rerenderDynamic();

  });

})();
