// ===============================
// RENDIMENTOBB – GLOBAL LANGUAGE ENGINE 2.0
// Sincronizzato Homepage + Tool + PDF
// ===============================

window.currentLang = localStorage.getItem("rb_lang") || "it";

// ===============================
// APPLY TRANSLATIONS
// ===============================

function applyTranslations() {

  document.querySelectorAll("[data-it]").forEach(el => {

    const text = el.getAttribute("data-" + window.currentLang);
    if (!text) return;

    if (text.includes("<br>") || text.includes("<li>")) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }

  });

}

// ===============================
// UPDATE LANGUAGE UI
// ===============================

function updateLanguageUI() {

  // HTML lang attribute (SEO + consistency)
  document.documentElement.setAttribute("lang", window.currentLang);

  // Toggle buttons
  document.getElementById("btn-it")?.classList.remove("active");
  document.getElementById("btn-en")?.classList.remove("active");
  document.getElementById("btn-" + window.currentLang)?.classList.add("active");

  // Premium indicator slider (homepage style)
  const indicator = document.querySelector(".lang-indicator");
  if (indicator) {
    indicator.style.transform =
      window.currentLang === "en"
        ? "translateX(100%)"
        : "translateX(0%)";
  }

}

// ===============================
// SET LANGUAGE
// ===============================

function setLanguage(lang) {

  if (lang !== "it" && lang !== "en") return;

  window.currentLang = lang;
  localStorage.setItem("rb_lang", lang);

  applyTranslations();
  updateLanguageUI();

  // 🔄 Se esiste analisi già fatta, re-render
  if (typeof runRealCalculation === "function" && window.lastAnalysisData) {
    runRealCalculation();
  }

}

// ===============================
// AUTO INIT
// ===============================

window.addEventListener("DOMContentLoaded", () => {

  const savedLang = localStorage.getItem("rb_lang");

  if (savedLang === "it" || savedLang === "en") {
    window.currentLang = savedLang;
  } else {
    window.currentLang =
      navigator.language.startsWith("en") ? "en" : "it";
  }

  applyTranslations();
  updateLanguageUI();

});
