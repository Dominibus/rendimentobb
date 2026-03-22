// ===============================================
// RENDIMENTOBB – GLOBAL LANGUAGE ENGINE 6.1 STABLE
// ===============================================

(function(){

  // ===============================
  // GLOBAL STATE
  // ===============================

  window.RB_LANG = {
    current: localStorage.getItem("rb_lang") || "it",
    supported: ["it", "en"]
  };

  // sync globale
  window.currentLang = window.RB_LANG.current;


  // ===============================
  // APPLY STATIC TRANSLATIONS
  // ===============================

  function applyStaticTranslations(){

    // ================= TEXT =================
    document.querySelectorAll("[data-it], [data-en]").forEach(el => {

      // 🚫 NON TOCCARE HEADER DINAMICO (login, user, logout)
      if(el.closest("#global-header")) return;

      const text = el.getAttribute("data-" + RB_LANG.current);
      if(!text) return;

      // 🔥 BOTTONI SOLO TESTO (senza rompere struttura)
      if(el.tagName === "A" || el.tagName === "BUTTON"){

        // NON toccare se contiene elementi figli (icone, span ecc.)
        if(el.children.length === 0){
          el.textContent = text;
        }

      } else {
        el.innerHTML = text;
      }

    });


    // ================= PLACEHOLDER =================
    document.querySelectorAll("[data-placeholder-it]").forEach(el => {

      const ph = el.getAttribute("data-placeholder-" + RB_LANG.current);
      if(ph){
        el.setAttribute("placeholder", ph);
      }

    });

    document.querySelectorAll("[data-it-placeholder]").forEach(el => {

      const ph = el.getAttribute("data-" + RB_LANG.current + "-placeholder");
      if(ph){
        el.setAttribute("placeholder", ph);
      }

    });


    // ================= TITLE =================
    const titleEl = document.querySelector("title");
    if(titleEl){
      const titleText = titleEl.getAttribute("data-" + RB_LANG.current);
      if(titleText){
        document.title = titleText;
      }
    }


    // ================= META =================
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
    window.currentLang = lang;

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


  // ===============================
  // HELPER
  // ===============================

  window.t = function(it, en){
    if(!en) return it;
    return window.RB_LANG.current === "en" ? en : it;
  };

})();
