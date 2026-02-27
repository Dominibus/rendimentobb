// ===============================
// RENDIMENTOBB – LANGUAGE SYSTEM
// Compatibile con data-it / data-en
// ===============================

let currentLang = localStorage.getItem("rb_lang") || "it";

// ===============================
// SET LANGUAGE
// ===============================

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("rb_lang", lang);

  // Traduce tutti gli elementi con data-it / data-en
  document.querySelectorAll("[data-it]").forEach(el => {
    const text = el.getAttribute("data-" + lang);
    if (!text) return;

    // Se contiene HTML usa innerHTML
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
