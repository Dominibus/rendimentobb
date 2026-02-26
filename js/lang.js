const translations = {
  it: {
    title: "Simulatore Rendita B&B",
    priceLabel: "Prezzo medio a notte (€)",
    occupancyLabel: "Occupazione media (%)",
    expensesLabel: "Spese mensili (€)",
    feesLabel: "Commissioni piattaforme (%)",
    taxesLabel: "Tasse (%)",
    calculate: "Calcola rendita",
    gross: "Fatturato lordo mensile:",
    net: "Guadagno netto mensile:",
    annual: "Guadagno netto annuale:"
  },
  en: {
    title: "B&B Revenue Simulator",
    priceLabel: "Average nightly price (€)",
    occupancyLabel: "Occupancy rate (%)",
    expensesLabel: "Monthly expenses (€)",
    feesLabel: "Platform fees (%)",
    taxesLabel: "Taxes (%)",
    calculate: "Calculate revenue",
    gross: "Monthly gross revenue:",
    net: "Monthly net profit:",
    annual: "Annual net profit:"
  }
};

let currentLang = "it";

function setLanguage(lang) {
  currentLang = lang;

  document.getElementById("title").innerText = translations[lang].title;
  document.getElementById("priceLabel").innerText = translations[lang].priceLabel;
  document.getElementById("occupancyLabel").innerText = translations[lang].occupancyLabel;
  document.getElementById("expensesLabel").innerText = translations[lang].expensesLabel;
  document.getElementById("feesLabel").innerText = translations[lang].feesLabel;
  document.getElementById("taxesLabel").innerText = translations[lang].taxesLabel;
  document.getElementById("calculateBtn").innerText = translations[lang].calculate;

  document.getElementById("btn-it").classList.remove("active");
  document.getElementById("btn-en").classList.remove("active");
  document.getElementById("btn-" + lang).classList.add("active");
}
