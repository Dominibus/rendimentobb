// ===============================
// 🔥 UI SYSTEM – RENDIMENTOBB FINAL STABLE
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  // ===== APPLY GLOBAL UI =====
  document.body.classList.add("rb-ui");

  // ===============================
  // 🔘 BUTTON AUTO SYSTEM
  // ===============================

  document.querySelectorAll(".rb-auto-btn").forEach(btn => {

    // evita conflitti
    if(btn.classList.contains("btn-outline")) return;

    // assegna main di default
    if(!btn.classList.contains("btn-main")){
      btn.classList.add("btn-main");
    }

  });

  // ===============================
  // 🚫 FIX DOPPIE CLASSI
  // ===============================

  document.querySelectorAll(".btn-main.btn-outline").forEach(btn => {
    btn.classList.remove("btn-main");
  });

  // ===============================
  // 🧠 DISABLED STATE (GLOBAL)
  // ===============================

  document.querySelectorAll("[disabled]").forEach(el => {
    el.classList.add("is-disabled");
  });

  // ===============================
  // ⚡ LOADING BUTTON (future ready)
  // ===============================

  window.setButtonLoading = (btn, state = true) => {
    if(!btn) return;

    if(state){
      btn.classList.add("is-loading");
      btn.setAttribute("disabled", true);
    } else {
      btn.classList.remove("is-loading");
      btn.removeAttribute("disabled");
    }
  };

});
