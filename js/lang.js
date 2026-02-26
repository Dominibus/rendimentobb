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

  const t = translations[lang];

  if (document.getElementById("title"))
    document.getElementById("title").innerText = t.title;

  if (document.getElementById("priceLabel"))
    document.getElementById("priceLabel").innerText = t.priceLabel;

  if (document.getElementById("occupancyLabel"))
    document.getElementById("occupancyLabel").innerText = t.occupancyLabel;

  if (document.getElementById("calculateBtn"))
    document.getElementById("calculateBtn").innerText = t.calculate;

  if (document.getElementById("btn-it"))
    document.getElementById("btn-it").classList.remove("active");

  if (document.getElementById("btn-en"))
    document.getElementById("btn-en").classList.remove("active");

  if (document.getElementById("btn-" + lang))
    document.getElementById("btn-" + lang).classList.add("active");
}
