// ===============================================
// RENDIMENTOBB – AI ENGINE 3.0
// Silicon Valley SaaS AI Advisor
// ===============================================

window.generateAIResponse = function(message){

  const msg = message.toLowerCase();

  const kb = window.rbKnowledgeBase || {};

  // ============================================
  // ACCESS CONTROL
  // ============================================

  const access = window.getUserAccess?.() || {};

  const isFree =
    access.isFree ||
    (!access.isInvestor &&
     !access.isPro &&
     !access.isAdmin);

  const isInvestor = access.isInvestor;

  const isPro =
    access.isPro ||
    access.isAdmin;

  // ============================================
  // MESSAGE LIMIT
  // ============================================

  window.rbChatCount =
    window.rbChatCount || 0;

  window.rbChatCount++;

  if(isFree && window.rbChatCount > 5){

    return window.t(

`🔒 Hai raggiunto il limite gratuito.

Sblocca RendimentoBB PRO per accedere a:

• AI Investment Advisor
• analisi rischio
• benchmark avanzati
• cashflow reale
• strategie investimento
• simulazioni professionali`,

`🔒 You reached the free limit.

Unlock RendimentoBB PRO to access:

• AI Investment Advisor
• risk analysis
• advanced benchmarks
• real cashflow
• investment strategies
• professional simulations`

    );

  }

// ============================================
// EDUCATIONAL PRIORITY DETECTION
// ============================================

const educationalTriggers = [

  "cos'è",
  "cosa è",
  "spiegami",
  "definizione",
  "meaning",
  "what is",
  "explain"

];

const wantsEducation =
  educationalTriggers.some(trigger =>
    msg.includes(trigger)
  );

// ============================================
// EDUCATIONAL KNOWLEDGE ENGINE
// ============================================

let educationalResponse = null;

Object.values(kb).forEach(item=>{

  if(!item.keywords) return;

  item.keywords.forEach(keyword=>{

    if(msg.includes(keyword.toLowerCase())){

      educationalResponse = window.t(
        item.it,
        item.en
      );

    }

  });

});

if(
  educationalResponse &&
  wantsEducation
){

  return educationalResponse;

}

  // ============================================
  // CITY DETECTION ENGINE
  // ============================================

  let matchedCity = null;

  Object.entries(kb.cities).forEach(([key, city])=>{

    city.aliases.forEach(alias=>{

      if(msg.includes(alias)){
        matchedCity = city;
        matchedCity.key = key;
      }

    });

  });

  // ============================================
  // CITY RESPONSE
  // ============================================

  if(matchedCity){

    // ================= FREE =================

    if(isFree){

      return window.t(

`📍 ${capitalize(matchedCity.key)}

Mercato interessante per investimenti B&B.

Per visualizzare:

• rischio reale
• sostenibilità
• cashflow
• benchmark avanzati
• strategie AI

sblocca la versione PRO.`,

`📍 ${capitalize(matchedCity.key)}

Interesting market for B&B investments.

To view:

• real risk
• sustainability
• cashflow
• advanced benchmarks
• AI strategies

unlock the PRO version.`

      );

    }

    // ================= INVESTOR =================

    if(isInvestor){

      return window.t(

`📍 ${capitalize(matchedCity.key)}

ROI medio:
${matchedCity.roi}

Occupazione:
${matchedCity.occupancy}

ADR:
${matchedCity.adr}

Rischio:
${matchedCity.risk.it}

💡 Consiglio:
analizza micro-zona e stagionalità.`,

`📍 ${capitalize(matchedCity.key)}

Average ROI:
${matchedCity.roi}

Occupancy:
${matchedCity.occupancy}

ADR:
${matchedCity.adr}

Risk:
${matchedCity.risk.en}

💡 Tip:
analyze micro-location and seasonality.`

      );

    }

    // ================= PRO =================

    return window.t(

`📍 ${capitalize(matchedCity.key)} – Analisi PRO

ROI medio:
${matchedCity.roi}

Occupazione:
${matchedCity.occupancy}

ADR:
${matchedCity.adr}

Rischio:
${matchedCity.risk.it}

📈 Scenario:
mercato interessante per affitti brevi professionali.

⚠️ Attenzione:
la redditività può cambiare molto in base a:

• micro-zona
• mutuo
• gestione operativa
• stagionalità
• tasse locali

💡 Strategia consigliata:
analizza cashflow e break-even prima di investire.`,

`📍 ${capitalize(matchedCity.key)} – PRO Analysis

Average ROI:
${matchedCity.roi}

Occupancy:
${matchedCity.occupancy}

ADR:
${matchedCity.adr}

Risk:
${matchedCity.risk.en}

📈 Scenario:
interesting market for professional short rentals.

⚠️ Warning:
profitability may change significantly based on:

• micro-location
• mortgage
• operations
• seasonality
• local taxes

💡 Suggested strategy:
analyze cashflow and break-even before investing.`

    );

  }

  // ============================================
  // UNKNOWN CITY
  // ============================================

  if(
    msg.includes("portici") ||
    msg.includes("afragola") ||
    msg.includes("casoria") ||
    msg.includes("pozzuoli") ||
    msg.includes("ercolano")
  ){

    return window.t(

`📍 Non ho ancora dati completi su questa città.

💡 Inserisci il capoluogo di riferimento.

Esempi:

• Napoli
• Roma
• Milano
• Firenze

Così posso generare benchmark e analisi più accurate.`,

`📍 I don't yet have complete data for this city.

💡 Enter the nearest major city.

Examples:

• Naples
• Rome
• Milan
• Florence

This helps generate more accurate benchmarks and analysis.`

    );

  }

  // ============================================
  // MORTGAGE
  // ============================================

  if(
    msg.includes("mutuo") ||
    msg.includes("mortgage") ||
    msg.includes("rata")
  ){

    return window.t(

`🏦 Analisi mutuo B&B

Consigli principali:

• evita rate troppo elevate
• mantieni cashflow positivo
• attenzione ai tassi variabili
• considera la stagionalità

💡 Un mutuo sostenibile è spesso più importante del ROI teorico.`,

`🏦 B&B Mortgage Analysis

Main tips:

• avoid excessive installments
• maintain positive cashflow
• watch variable interest rates
• consider seasonality

💡 A sustainable mortgage is often more important than theoretical ROI.`

    );

  }

  // ============================================
  // DEFAULT RESPONSE
  // ============================================

  return window.t(

`Posso aiutarti con:

• ROI città italiane
• mutui B&B
• cashflow
• rischio investimento
• benchmark mercato
• strategie investimento

Esempi:

"Conviene investire a Napoli?"
"ROI medio Milano"
"Come scegliere un mutuo B&B?"`,

`I can help you with:

• Italian city ROI
• B&B mortgages
• cashflow
• investment risk
• market benchmarks
• investment strategies

Examples:

"Is Naples a good investment?"
"Average ROI Milan"
"How to choose a B&B mortgage?"`

  );

};

// ===============================================
// HELPERS
// ===============================================

function capitalize(str){

  if(!str) return "";

  return str.charAt(0).toUpperCase() + str.slice(1);

}
