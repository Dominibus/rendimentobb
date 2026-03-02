// ===============================================
// RENDIMENTOBB – GLOBAL LANGUAGE ENGINE 3.0
// Homepage + Tool + PDF Ready
// ===============================================

window.currentLang = localStorage.getItem("rb_lang") || "it";

// ===============================================
// APPLY TRANSLATIONS
// ===============================================

function applyTranslations() {

  document.querySelectorAll("[data-it]").forEach(el => {

    const text = el.getAttribute("data-" + window.currentLang);
    if (!text) return;

    // Support HTML content
    if (text.includes("<br>") || text.includes("<li>")) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }

  });

  // Placeholder support (future ready)
  document.querySelectorAll("[data-placeholder-it]").forEach(el => {
    const ph = el.getAttribute("data-placeholder-" + window.currentLang);
    if (ph) el.setAttribute("placeholder", ph);
  });

}

// ===============================================
// UPDATE LANGUAGE UI
// ===============================================

function updateLanguageUI() {

  document.documentElement.setAttribute("lang", window.currentLang);

  document.getElementById("btn-it")?.classList.remove("active");
  document.getElementById("btn-en")?.classList.remove("active");
  document.getElementById("btn-" + window.currentLang)?.classList.add("active");

  const indicator = document.querySelector(".lang-indicator");
  if (indicator) {
    indicator.style.transform =
      window.currentLang === "en"
        ? "translateX(100%)"
        : "translateX(0%)";
  }

}

// ===============================================
// SET LANGUAGE
// ===============================================

function setLanguage(lang) {

  if (lang !== "it" && lang !== "en") return;

  window.currentLang = lang;
  localStorage.setItem("rb_lang", lang);

  applyTranslations();
  updateLanguageUI();

  // Re-render analysis if already calculated
  if (typeof runRealCalculation === "function" && window.lastAnalysisData) {
    runRealCalculation();
  }

}

// ===============================================
// AUTO INIT
// ===============================================

window.addEventListener("DOMContentLoaded", () => {

  const saved = localStorage.getItem("rb_lang");

  if (saved === "it" || saved === "en") {
    window.currentLang = saved;
  } else {
    window.currentLang =
      navigator.language.startsWith("en") ? "en" : "it";
  }

  applyTranslations();
  updateLanguageUI();

});
