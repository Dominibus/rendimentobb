// ===============================
// 🔥 UI SYSTEM – RENDIMENTOBB ENTERPRISE CORE
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  document.body.classList.add("rb-ui");

  // ===============================
  // 🔘 BUTTON NORMALIZER (SMART)
  // ===============================
  const normalizeButtons = () => {

    document.querySelectorAll(".rb-auto-btn").forEach(btn => {

      // evita doppie classi incoerenti
      if(btn.classList.contains("btn-main") && btn.classList.contains("btn-outline")){
        btn.classList.remove("btn-main");
        return;
      }

      // assegna default SOLO se non specificato
      if(
        !btn.classList.contains("btn-main") &&
        !btn.classList.contains("btn-outline")
      ){
        btn.classList.add("btn-main");
      }

    });

  };

  normalizeButtons();

  // ===============================
  // ⛔ DISABLED STATE (SYNC LIVE)
  // ===============================
  const syncDisabled = () => {

    document.querySelectorAll("button, a").forEach(el => {

      if(el.hasAttribute("disabled")){
        el.classList.add("is-disabled");
      } else {
        el.classList.remove("is-disabled");
      }

    });

  };

  syncDisabled();

  // osserva cambiamenti dinamici (SUPER IMPORTANTE)
  const observer = new MutationObserver(() => {
    syncDisabled();
  });

  observer.observe(document.body, {
    attributes:true,
    subtree:true,
    attributeFilter:["disabled"]
  });

  // ===============================
  // ⚡ LOADING SYSTEM (SAFE)
  // ===============================
  window.setButtonLoading = (btn, state = true) => {

    if(!btn) return;

    if(state){

      btn.classList.add("is-loading");
      btn.setAttribute("disabled", true);

      // salva testo originale (una sola volta)
      if(!btn.dataset.originalText){
        btn.dataset.originalText = btn.innerHTML;
      }

    } else {

      btn.classList.remove("is-loading");
      btn.removeAttribute("disabled");

      // ripristina testo
      if(btn.dataset.originalText){
        btn.innerHTML = btn.dataset.originalText;
      }

    }

  };

  // ===============================
  // 🧠 AUTO CARD ENHANCER (SAFE)
  // ===============================
  document.querySelectorAll(".card").forEach(card => {
    if(!card.classList.contains("rb-card")){
      card.classList.add("rb-card");
    }
  });

});
