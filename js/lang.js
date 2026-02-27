const translations = {
  it: {
    title: "Analizzatore Rischio Investimento B&B",

    step1Title: "🪜 STEP 1 – Come funzionerà il tuo B&B?",
    step1Desc: "Inserisci le stime realistiche della tua attività.",

    priceLabel: "Prezzo medio a notte (€)",
    occupancyLabel: "Occupazione media (%)",
    expensesLabel: "Spese mensili (€)",
    commissionLabel: "Commissioni piattaforme (%)",
    taxLabel: "Tasse (%)",

    step2Title: "🏠 STEP 2 – Quanto costa l’immobile?",
    step2Desc: "Inserisci il prezzo totale della casa che vuoi acquistare.",

    step3Title: "💰 STEP 3 – Quanto investi di tasca tua?",
    step3Desc: "Somma che puoi utilizzare senza chiedere un mutuo.",

    step4Title: "🏦 STEP 4 – Simulazione Mutuo",
    step4Desc: "Se non sai l’importo del mutuo, fai: Prezzo immobile - capitale proprio.",

    loanAmountLabel: "Importo mutuo (€)",
    loanRateLabel: "Tasso mutuo (%)",
    loanYearsLabel: "Durata mutuo (anni)",

    step5Title: "📊 STEP 5 – Situazione personale",
    step5Desc: "Serve per capire se l’investimento è sostenibile per te.",

    familyIncomeLabel: "Reddito familiare mensile (€)",
    roiTargetLabel: "ROI target desiderato (%)",

    step6Title: "⚠️ STEP 6 – Scenario Pessimistico",
    step6Desc: "Simuliamo cosa succede se le cose vanno peggio del previsto.",

    stressOccLabel: "Riduzione occupazione (%)",
    stressExpLabel: "Aumento spese (%)",
    stressRateLabel: "Aumento tasso mutuo (%)",

    analyzeBtn: "Analizza Rischio Investimento",

    proInfo: `
🔒 Questo strumento ti aiuta a:
<br>• Evitare investimenti rischiosi
<br>• Capire l’impatto reale sul tuo reddito
<br>• Stimare la solidità finanziaria
<br>• Simulare scenari negativi
    `
  },

  en: {
    title: "B&B Investment Risk Analyzer",

    step1Title: "🪜 STEP 1 – How will your B&B operate?",
    step1Desc: "Enter realistic estimates for your business.",

    priceLabel: "Average nightly price (€)",
    occupancyLabel: "Occupancy rate (%)",
    expensesLabel: "Monthly expenses (€)",
    commissionLabel: "Platform fees (%)",
    taxLabel: "Taxes (%)",

    step2Title: "🏠 STEP 2 – Property purchase price",
    step2Desc: "Enter the total purchase price of the property.",

    step3Title: "💰 STEP 3 – Your personal investment",
    step3Desc: "Amount you can invest without taking a loan.",

    step4Title: "🏦 STEP 4 – Mortgage Simulation",
    step4Desc: "If unsure about the loan amount: Property price - equity.",

    loanAmountLabel: "Loan amount (€)",
    loanRateLabel: "Mortgage interest rate (%)",
    loanYearsLabel: "Mortgage duration (years)",

    step5Title: "📊 STEP 5 – Personal financial situation",
    step5Desc: "Helps determine if the investment is sustainable for you.",

    familyIncomeLabel: "Monthly household income (€)",
    roiTargetLabel: "Desired ROI target (%)",

    step6Title: "⚠️ STEP 6 – Pessimistic Scenario",
    step6Desc: "Simulate what happens if things go worse than expected.",

    stressOccLabel: "Occupancy reduction (%)",
    stressExpLabel: "Expense increase (%)",
    stressRateLabel: "Interest rate increase (%)",

    analyzeBtn: "Analyze Investment Risk",

    proInfo: `
🔒 This tool helps you:
<br>• Avoid risky investments
<br>• Understand real income impact
<br>• Estimate financial solidity
<br>• Simulate negative scenarios
    `
  }
};

let currentLang = "it";

function setLanguage(lang) {
  currentLang = lang;

  document.querySelectorAll("[data-translate]").forEach(el => {
    const key = el.getAttribute("data-translate");
    if (translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  document.getElementById("btn-it")?.classList.remove("active");
  document.getElementById("btn-en")?.classList.remove("active");
  document.getElementById("btn-" + lang)?.classList.add("active");
}

window.addEventListener("DOMContentLoaded", () => {
  setLanguage("it");
});
