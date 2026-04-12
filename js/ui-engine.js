// =======================================
// 🔥 RENDIMENTOBB – UI SYSTEM 2.0 PRO
// Compatibile LANG ENGINE 7.0
// =======================================

document.addEventListener("DOMContentLoaded", () => {

  document.body.classList.add("rb-ui");

  /* ===============================
  🔘 BUTTON NORMALIZER (DEFINITIVO)
  =============================== */

  function normalizeButtons(){

    document.querySelectorAll("button, a").forEach(btn => {

      // skip se già processato
      if(btn.dataset.rbReady) return;

      // auto opt-in
      if(btn.classList.contains("rb-auto-btn") || btn.classList.contains("btn")){
        
        // evita conflitti
        if(btn.classList.contains("btn-main") && btn.classList.contains("btn-outline")){
          btn.classList.remove("btn-main");
        }

        // assegna default SOLO se non ha stile
        if(
          !btn.classList.contains("btn-main") &&
          !btn.classList.contains("btn-outline") &&
          !btn.classList.contains("btn-primary")
        ){
          btn.classList.add("btn-main");
        }

      }

      btn.dataset.rbReady = "1";

    });

  }

  normalizeButtons();


  /* ===============================
  ⛔ DISABLED STATE (LIVE SAFE)
  =============================== */

  function syncDisabled(){

    document.querySelectorAll("button, a").forEach(el => {

      if(el.hasAttribute("disabled")){
        el.classList.add("is-disabled");
      } else {
        el.classList.remove("is-disabled");
      }

    });

  }

  syncDisabled();

  const observer = new MutationObserver(() => {
    syncDisabled();
  });

  observer.observe(document.body,{
    attributes:true,
    subtree:true,
    attributeFilter:["disabled"]
  });


  /* ===============================
  ⚡ LOADING SYSTEM (BILINGUE SAFE)
  =============================== */

  window.setButtonLoading = (btn, state = true) => {

    if(!btn) return;

    if(state){

      btn.classList.add("is-loading");
      btn.setAttribute("disabled", true);

      // NON toccare innerHTML → salva solo stato
      btn.dataset.loading = "1";

    } else {

      btn.classList.remove("is-loading");
      btn.removeAttribute("disabled");
      delete btn.dataset.loading;

      // 🔥 RIAPPLICA TRADUZIONE
      if(window.applyTranslations){
        applyTranslations();
      }

    }

  };


  /* ===============================
  🧠 AUTO CARD ENHANCER
  =============================== */

  document.querySelectorAll(".card").forEach(card=>{
    if(!card.classList.contains("rb-card")){
      card.classList.add("rb-card");
    }
  });


  /* ===============================
  🌐 FIX LINGUA SU ELEMENTI DINAMICI
  =============================== */

  document.addEventListener("rb_language_changed", () => {

    // riapplica su tutto (inclusi elementi JS)
    if(window.applyTranslations){
      applyTranslations();
    }

  });


  /* ===============================
  💰 CTA TRACK (MONETIZZAZIONE)
  =============================== */

  document.querySelectorAll("button, a").forEach(btn=>{

    if(
      btn.innerText.toLowerCase().includes("sblocca") ||
      btn.innerText.toLowerCase().includes("unlock")
    ){
      btn.classList.add("cta-upgrade");
    }

  });

});
