// ===============================
// UI SYSTEM – RENDIMENTOBB
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  // ===== APPLY GLOBAL STYLE =====
  document.body.classList.add("rb-ui");

  // ===== AUTO FIX BUTTON =====
  document.querySelectorAll("button").forEach(btn => {
    if(!btn.classList.contains("btn-main")){
      btn.classList.add("btn-main");
    }
  });

});
