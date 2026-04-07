// ===============================
// UI SYSTEM – RENDIMENTOBB
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  // ===== APPLY GLOBAL STYLE =====
  document.body.classList.add("rb-ui");

// ===============================
// UI SYSTEM – RENDIMENTOBB CLEAN FINAL
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  // apply UI class
  document.body.classList.add("rb-ui");

  // assegna SOLO ai bottoni che vuoi tu
  document.querySelectorAll(".rb-auto-btn").forEach(btn => {
    if(!btn.classList.contains("btn-outline")){
      btn.classList.add("btn-main");
    }
  });

});

});
