const translations = {
  it: {
    title: "B&B Investment & Profit Analyzer",

    // Base simulation
    priceLabel: "Prezzo medio a notte (€)",
    occupancyLabel: "Occupazione media (%)",
    expensesLabel: "Spese mensili (€)",
    commissionLabel: "Commissioni piattaforme (%)",
    taxLabel: "Tasse (%)",

    // Pro section
    proTitle: "Analisi Investimento PRO",
    propertyPriceLabel: "Prezzo immobile (€)",
    equityLabel: "Capitale investito (€)",
    loanAmountLabel: "Importo mutuo (€)",
    loanRateLabel: "Tasso mutuo (%)",
    loanYearsLabel: "Durata mutuo (anni)",

    calculateBtn: "Calcola simulazione",
    invalidValues: "Inserisci valori validi"
  },

  en: {
    title: "B&B Investment & Profit Analyzer",

    // Base simulation
    priceLabel: "Average nightly price (€)",
    occupancyLabel: "Occupancy rate (%)",
    expensesLabel: "Monthly expenses (€)",
    commissionLabel: "Platform fees (%)",
    taxLabel: "Taxes (%)",

    // Pro section
    proTitle: "PRO Investment Analysis",
    propertyPriceLabel: "Property price (€)",
    equityLabel: "Equity invested (€)",
    loanAmountLabel: "Loan amount (€)",
    loanRateLabel: "Loan interest rate (%)",
    loanYearsLabel: "Loan duration (years)",

    calculateBtn: "Calculate simulation",
    invalidValues: "Enter valid values"
  }
};

let currentLang = "it";

function setLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];

  // Base
  document.getElementById("title").innerText = t.title;
  document.getElementById("priceLabel").innerText = t.priceLabel;
  document.getElementById("occupancyLabel").innerText = t.occupancyLabel;
  document.getElementById("expensesLabel").innerText = t.expensesLabel;
  document.getElementById("commissionLabel").innerText = t.commissionLabel;
  document.getElementById("taxLabel").innerText = t.taxLabel;

  // Pro section
  const proHeader = document.querySelector("h3");
  if (proHeader) proHeader.innerText = t.proTitle;

  document.getElementById("calculateBtn").innerText = t.calculateBtn;

  // Bottoni lingua
  document.getElementById("btn-it").classList.remove("active");
  document.getElementById("btn-en").classList.remove("active");
  document.getElementById("btn-" + lang).classList.add("active");
}

// Inizializzazione
window.addEventListener("DOMContentLoaded", () => {
  setLanguage("it");
});
