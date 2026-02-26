const translations = {
  it: {
    title: "Simulatore B&B Revenue & Profit",
    priceLabel: "Prezzo medio a notte (€)",
    occupancyLabel: "Occupazione media (%)",
    expensesLabel: "Spese mensili (€)",
    commissionLabel: "Commissioni piattaforme (%)",
    taxLabel: "Tasse (%)",
    calculateBtn: "Calcola simulazione",
    invalidValues: "Inserisci valori validi"
  },
  en: {
    title: "B&B Revenue & Profit Simulator",
    priceLabel: "Average nightly price (€)",
    occupancyLabel: "Occupancy rate (%)",
    expensesLabel: "Monthly expenses (€)",
    commissionLabel: "Platform fees (%)",
    taxLabel: "Taxes (%)",
    calculateBtn: "Calculate simulation",
    invalidValues: "Enter valid values"
  }
};

let currentLang = "it";

function setLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];

  document.getElementById("title").innerText = t.title;
  document.getElementById("priceLabel").innerText = t.priceLabel;
  document.getElementById("occupancyLabel").innerText = t.occupancyLabel;
  document.getElementById("expensesLabel").innerText = t.expensesLabel;
  document.getElementById("commissionLabel").innerText = t.commissionLabel;
  document.getElementById("taxLabel").innerText = t.taxLabel;
  document.getElementById("calculateBtn").innerText = t.calculateBtn;

  // Gestione bottone attivo
  document.getElementById("btn-it").classList.remove("active");
  document.getElementById("btn-en").classList.remove("active");
  document.getElementById("btn-" + lang).classList.add("active");
}

// Inizializza lingua al caricamento
window.addEventListener("DOMContentLoaded", () => {
  setLanguage("it");
});
