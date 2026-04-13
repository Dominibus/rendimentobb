// ===============================================
// RENDIMENTOBB – GLOBAL LANGUAGE ENGINE 8.0 (FIXED)
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
  // CORE TRANSLATION ENGINE (FIXED)
  // ===============================

  function applyTranslations(){

    const lang = window.RB_LANG.current;

    // ================= TEXT =================
    document.querySelectorAll("[data-it], [data-en]").forEach(el => {

      const text = el.getAttribute("data-" + lang);
      if(!text) return;

      // 🔥 FIX: evita di rompere HTML interno (icone, span ecc.)
      if(el.children.length === 0){
        el.textContent = text;
      }else{
        // aggiorna SOLO testo diretto (no figli)
        el.childNodes.forEach(node=>{
          if(node.nodeType === Node.TEXT_NODE){
            node.textContent = text;
          }
        });
      }

    });

    // ================= PLACEHOLDER =================
    document.querySelectorAll("[data-placeholder-it], [data-placeholder-en]").forEach(el => {
      const ph = el.getAttribute("data-placeholder-" + lang);
      if(ph) el.setAttribute("placeholder", ph);
    });

    document.querySelectorAll("[data-it-placeholder], [data-en-placeholder]").forEach(el => {
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

    document.documentElement.setAttribute("lang", window.RB_LANG.current);

    document.querySelectorAll("[id^='btn-']").forEach(btn=>{
      btn.classList.remove("active");
    });

    const activeBtn = document.getElementById("btn-" + window.RB_LANG.current);
    if(activeBtn){
      activeBtn.classList.add("active");
    }

  }


  // ===============================
  // RERENDER DYNAMIC (KEY FIX)
  // ===============================

  function rerenderDynamic(){

    window.currentLang = window.RB_LANG.current;

    // 🔥 EVENTO GLOBALE
    document.dispatchEvent(
      new CustomEvent("rb_language_changed", {
        detail: { lang: window.RB_LANG.current }
      })
    );

    // 🔥 FIX CRITICO: ritraduci dopo render dinamici
    setTimeout(applyTranslations, 50);
    setTimeout(applyTranslations, 150);
    setTimeout(applyTranslations, 300);

    // ================= TOOL HOOK =================
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

  }


  // ===============================
  // PUBLIC API
  // ===============================

  window.applyTranslations = applyTranslations;
  window.applyStaticTranslations = applyTranslations;

  window.setLang = function(lang){

    if(!window.RB_LANG.supported.includes(lang)) return;

    window.RB_LANG.current = lang;
    window.currentLang = lang;

    localStorage.setItem("rb_lang", lang);

    applyTranslations();
    updateLanguageUI();
    rerenderDynamic();
  };


  // ===============================
  // AUTO INIT
  // ===============================

  function initLang(){

    const saved = localStorage.getItem("rb_lang");

    if(saved && window.RB_LANG.supported.includes(saved)){
      window.RB_LANG.current = saved;
    } else {
      window.RB_LANG.current =
        navigator.language.startsWith("en") ? "en" : "it";
    }

    window.currentLang = window.RB_LANG.current;

    applyTranslations();
    updateLanguageUI();

    // 🔥 doppio passaggio per contenuti async
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
