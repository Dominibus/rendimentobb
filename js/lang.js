const translations = {
  it: {
    title: "B&B Investment & Profit Analyzer",
    calculateBtn: "Analizza investimento",
    invalidValues: "Inserisci valori validi"
  },
  en: {
    title: "B&B Investment & Profit Analyzer",
    calculateBtn: "Analyze investment",
    invalidValues: "Enter valid values"
  }
};

let currentLang = "it";

function safeSetText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function setLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];

  safeSetText("title", t.title);
  safeSetText("calculateBtn", t.calculateBtn);

  document.getElementById("btn-it")?.classList.remove("active");
  document.getElementById("btn-en")?.classList.remove("active");
  document.getElementById("btn-" + lang)?.classList.add("active");
}

window.addEventListener("DOMContentLoaded", () => {
  setLanguage("it");
});
