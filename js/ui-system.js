// =============================== 
// 🔥 UI SYSTEM – RENDIMENTOBB ENTERPRISE
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  document.body.classList.add("rb-ui");

  // ===============================
  // 🔘 AUTO BUTTON NORMALIZER
  // ===============================
  document.querySelectorAll(".rb-auto-btn").forEach(btn => {

    // se non specificato → primary
    if(
      !btn.classList.contains("btn-main") &&
      !btn.classList.contains("btn-outline")
    ){
      btn.classList.add("btn-main");
    }

  });

  // ===============================
  // 🚫 HARD FIX CONFLICTS
  // ===============================
  document.querySelectorAll(".btn-main.btn-outline").forEach(btn => {
    btn.classList.remove("btn-main");
  });

  // ===============================
  // ⛔ DISABLED STATE
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

  // ===============================
  // ⚡ LOADING SYSTEM
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

    syncDisabled();
  };

});
