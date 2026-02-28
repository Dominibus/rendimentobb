// ===============================
// RENDIMENTOBB – LANGUAGE SYSTEM
// VERSIONE SINCRONIZZATA GLOBALE
// ===============================

// Usa variabile globale condivisa
window.currentLang = localStorage.getItem("rb_lang") || "it";

// ===============================
// SET LANGUAGE
// ===============================

function setLanguage(lang) {

  window.currentLang = lang;
  localStorage.setItem("rb_lang", lang);

  // Traduzione elementi HTML
  document.querySelectorAll("[data-it]").forEach(el => {

    const text = el.getAttribute("data-" + lang);
    if (!text) return;

    if (text.includes("<br>") || text.includes("<li>")) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  });

  // Attiva bottone lingua
  document.getElementById("btn-it")?.classList.remove("active");
  document.getElementById("btn-en")?.classList.remove("active");
  document.getElementById("btn-" + lang)?.classList.add("active");

  // 🔥 Se esiste un'analisi già fatta, la ricalcola nella nuova lingua
  if (typeof runRealCalculation === "function" && window.lastAnalysisData) {
    runRealCalculation();
  }
}

// ===============================
// AUTO LOAD LANGUAGE
// ===============================

window.addEventListener("DOMContentLoaded", () => {

  const savedLang = localStorage.getItem("rb_lang");

  if (savedLang === "en" || savedLang === "it") {
    setLanguage(savedLang);
  } else {
    const browserLang = navigator.language.startsWith("en") ? "en" : "it";
    setLanguage(browserLang);
  }

});
