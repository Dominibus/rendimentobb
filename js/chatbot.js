// ===============================================
// RENDIMENTOBB – AI CHATBOT UI 1.0
// ===============================================

document.addEventListener("DOMContentLoaded", initRBChatbot);

document.addEventListener(
  "rb_language_changed",
  ()=>{
    document.getElementById("rb-chatbot-wrapper")?.remove();
    initRBChatbot();
  }
);

// ===============================================
// 🧠 CONVERSATION MEMORY
// ===============================================

window.rbConversationHistory =
  window.rbConversationHistory || [];

// ===============================================
// 🌍 MARKET AI DATA
// ===============================================

window.rbMarketData = {

  roma: {
    avgROI: "8.4%",
    occupancy: "72%",
    risk: "medium"
  },

  milano: {
    avgROI: "7.1%",
    occupancy: "68%",
    risk: "low"
  },

  napoli: {
    avgROI: "9.6%",
    occupancy: "69%",
    risk: "medium"
  },

  firenze: {
    avgROI: "8.9%",
    occupancy: "74%",
    risk: "medium-low"
  },

  venezia: {
    avgROI: "10.2%",
    occupancy: "78%",
    risk: "high"
  },

  torino: {
    avgROI: "7.4%",
    occupancy: "63%",
    risk: "low"
  }

};

// ===============================================
// 🧠 AI RESPONSE ENGINE 1.0
// ===============================================

window.generateAIResponse = function(message){

  const text = message.toLowerCase().trim();

  const lastMessages =
  window.rbConversationHistory
    .slice(-6);

const previousUserMessages =
  [...lastMessages]
    .filter(m => m.role === "user");

const lastUserMessage =
  previousUserMessages[
    previousUserMessages.length - 2
  ]?.text?.toLowerCase() || "";

// =====================================
// 🧠 KNOWLEDGE BASE ENGINE
// =====================================

const matches = [];

for(const key in (window.rbKnowledgeBase || {})){

  const item = window.rbKnowledgeBase[key];

  const matched =
    item.keywords.some(keyword =>
      text.includes(keyword)
    );

  if(matched){

    matches.push({
      key,
      item,
      priority: item.priority || 1
    });

  }

}

// =====================================
// 🧠 EDUCATIONAL DETECTION
// =====================================

  const data = window.lastAnalysisData || {};

  const access = window.getUserAccess?.() || {};

  const aiTone = access.isPro
  ? "executive"
  : access.isInvestor
  ? "advanced"
  : "educational";

  const roi =
    Number(data.roi || 0);

  const risk =
    Math.round(
      Number(data.risk || data.riskScore || 0)
    );

  const city =
    window.currentCity || "roma";

  const marketData =
  window.rbMarketData?.[city];

  const profit =
    Number(
      data.netAfterMortgage ||
      data.net ||
      0
    );

  const occupancy =
  Number(
    data.occupancy ||
    data.occupancyRate ||
    0
  );

const nightly =
  Number(
    data.pricePerNight ||
    data.nightPrice ||
    0
  );

const monthlyCosts =
  Number(
    data.monthlyCosts ||
    data.monthlyExpenses ||
    0
  );

  const annualRevenue =
  Number(
    data.revenueAnnual ||
    data.annualRevenue ||
    data.grossAnnual ||
    0
  );

const costRatio =
  annualRevenue > 0
    ? (monthlyCosts * 12 / annualRevenue) * 100
    : 0;

  // =====================================
// 🧠 INTENT ENGINE
// =====================================

const intents = {

  roi: [
    "roi",
    "rendimento",
    "return",
    "profitto",
    "guadagno",
    "quanto rende",
    "quant'è il roi",
    "quanto rende investimento"
  ],

  risk: [
    "rischio",
    "risk",
    "sicuro",
    "pericoloso",
    "stabile",
    "rischioso",
    "rischi ci sono"
  ],

  cashflow: [
    "cashflow",
    "cash flow",
    "flusso di cassa",
    "liquidità",
    "guadagno reale"
  ],

  strategy: [
    "strategia",
    "consigli",
    "conviene",
    "che ne pensi",
    "cosa pensi",
    "investimento buono",
    "buon investimento",
    "cosa leggi",
    "analizza simulazione",
    "migliorare",
    "ottimizzare"
  ],

  education: [
    "cos'è",
    "cosa è",
    "cosa vuol dire",
    "significa",
    "spiegami",
    "definizione",
    "what is",
    "meaning",
    "explain"
  ]

};

  function detectIntent(intentList){

  return intentList.some(keyword =>
    text.includes(keyword)
  );

}

// =====================================
// 🧠 DETECTED INTENTS ENGINE
// =====================================

const detectedIntents = [];

if(detectIntent(intents.strategy))
  detectedIntents.push("strategy");

if(detectIntent(intents.risk))
  detectedIntents.push("risk");

if(detectIntent(intents.roi))
  detectedIntents.push("roi");

if(detectIntent(intents.cashflow))
  detectedIntents.push("cashflow");

if(detectIntent(intents.education))
  detectedIntents.push("education");

// =====================================
// 🧠 INTENT PRIORITY
// =====================================

const intentPriority = {
  strategy: 10,
  risk: 9,
  roi: 8,
  cashflow: 7,
  education: 6
};

detectedIntents.sort(
  (a,b)=>
    intentPriority[b] -
    intentPriority[a]
);

const mainIntent =
  detectedIntents[0] || null;

// =====================================
// 🧠 MAIN INTENT FLAGS
// =====================================

const wantsStrategy =
  detectedIntents.includes("strategy");

const wantsRisk =
  detectedIntents.includes("risk");

const wantsROI =
  detectedIntents.includes("roi");

const wantsCashflow =
  detectedIntents.includes("cashflow");

const wantsEducation =
  detectedIntents.includes("education");

// =====================================
// 🧠 RESPONSE COMPOSER
// =====================================

let responsePartsIT = [];
let responsePartsEN = [];

function addResponse(it,en){

  responsePartsIT.push(it);
  responsePartsEN.push(en);

}  

// =====================================
// 🧠 FOLLOW-UP UNDERSTANDING
// =====================================

const followUpWords = [
  "e quindi",
  "quindi",
  "spiegami meglio",
  "approfondisci",
  "why",
  "why?",
  "and?",
  "quindi?"
];

const isFollowUp =
  followUpWords.some(word =>
    text.includes(word)
  );

// =====================================
// 🧠 PRIORITY RESPONSE ENGINE
// =====================================

if(
  matches.length &&
  !wantsStrategy &&
  !isFollowUp
){

  matches.sort((a,b)=>
    b.priority - a.priority
  );

  const item = matches[0].item;

  const lang = window.currentLang || "it";

  const response = lang === "en"

  ? `

${item.aiTitleEN || ""}

${item.aiSummaryEN || ""}

${item.aiInsightEN || ""}

${item.warningEN || ""}

${item.recommendationsEN?.length

? `
💡 Recommendations:
• ${item.recommendationsEN.join("\n• ")}
`

: ""
}

`

  : `

${item.aiTitleIT || ""}

${item.aiSummaryIT || ""}

${item.aiInsightIT || ""}

${item.warningIT || ""}

${item.recommendationsIT?.length

? `
💡 Suggerimenti:
• ${item.recommendationsIT.join("\n• ")}
`

: ""
}

`;

  return response;

}
  
  const alreadyTalkedAboutROI =
  lastMessages.some(m =>
    m.text?.toLowerCase()?.includes("roi")
  );
// =====================================
// 📚 ROI EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  (
    text.includes("roi") ||
    text.includes("rendimento")
  )
){

  addResponse(

`📈 ROI misura la redditività del capitale investito.

💡 Nel settore B&B:

• 4-6% → conservativo
• 7-10% → competitivo
• 10%+ → aggressivo

📊 ROI attuale simulazione:
${roi ? roi.toFixed(1) + "%" : "non disponibile"}

⚠️ ROI elevato senza cashflow stabile può diventare rischioso.`,

`📈 ROI measures investment profitability compared to invested capital.

💡 In the B&B sector:

• 4-6% → conservative
• 7-10% → competitive
• 10%+ → aggressive

📊 Current simulation ROI:
${roi ? roi.toFixed(1) + "%" : "not available"}

⚠️ High ROI without stable cashflow may become risky.`

  );

}

// =====================================
// 📚 CASHFLOW EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  (
    text.includes("cashflow") ||
    text.includes("cash flow") ||
    text.includes("flusso di cassa")
  )
){

  addResponse(

`💸 Cashflow = liquidità reale generata ogni mese.

Include:
• cleaning
• utenze
• tasse
• manutenzione
• mutuo

📊 Profitto netto stimato:
${profit
  ? window.formatCurrency(profit)
  : "non disponibile"}

⚠️ Molti investimenti mostrano ROI elevati ma cashflow debole.`,

`💸 Cashflow = real liquidity generated every month.

Includes:
• cleaning
• utilities
• taxes
• maintenance
• mortgage

📊 Estimated net profit:
${profit
  ? window.formatCurrency(profit)
  : "not available"}

⚠️ Many investments show strong ROI but weak cashflow.`

  );

}

// =====================================
// 📚 RISK EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  (
    text.includes("rischio") ||
    text.includes("risk")
  )
){

  addResponse(

`⚠️ Il rischio misura la stabilità dell'investimento nel tempo.

Dipende da:
• occupazione
• costi operativi
• mutuo
• stagionalità
• regolamentazioni

📊 Rischio stimato:
${risk}/100

💡 ROI alto + rischio alto = investimento aggressivo.`,

`⚠️ Risk measures long-term investment stability.

Depends on:
• occupancy
• operating costs
• mortgage
• seasonality
• regulations

📊 Estimated risk:
${risk}/100

💡 High ROI + high risk = aggressive investment.`

  );

}

// =====================================
// 📚 OCCUPANCY EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  (
    text.includes("occupazione") ||
    text.includes("occupancy")
  )
){

  addResponse(

`🏨 Occupazione = percentuale media di notti prenotate.

💡 Nel settore short-rent:

• 50% → bassa
• 65-70% → forte
• 80%+ → molto aggressiva

📊 Occupazione simulata:
${occupancy || "non disponibile"}%

⚠️ Occupazioni troppo elevate possono essere irrealistiche.`,

`🏨 Occupancy = average percentage of booked nights.

💡 In the short-rent sector:

• 50% → low
• 65-70% → strong
• 80%+ → highly aggressive

📊 Simulated occupancy:
${occupancy || "not available"}%

⚠️ Extremely high occupancy may be unrealistic.`

  );

}

// =====================================
// 📚 DSCR EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  text.includes("dscr")
){

  addResponse(

`🏦 DSCR misura la sostenibilità del mutuo.

💡 Generalmente:

• sotto 1 → rischio elevato
• sopra 1.2 → sostenibile
• sopra 1.5 → molto forte

📌 Le banche utilizzano il DSCR per valutare finanziamenti immobiliari.`,

`🏦 DSCR measures mortgage sustainability.

💡 Generally:

• below 1 → high risk
• above 1.2 → sustainable
• above 1.5 → very strong

📌 Banks often use DSCR to evaluate real estate financing.`

  );

}

// =====================================
// 📚 BREAK EVEN EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  (
    text.includes("break even") ||
    text.includes("pareggio")
  )
){

  addResponse(

`⚖️ Break-even = tempo necessario per recuperare l'investimento.

💡 Più rapidamente lo raggiungi:

• minore rischio
• maggiore sostenibilità
• migliore stabilità operativa

⚠️ Un break-even lento aumenta l'esposizione finanziaria.`,

`⚖️ Break-even = time required to recover the investment.

💡 The faster you reach it:

• lower risk
• stronger sustainability
• better operational stability

⚠️ Slow break-even increases financial exposure.`

  );

}

// =====================================
// 🧠 COMBINED EDUCATIONAL RESPONSE
// =====================================

if(responsePartsIT.length){

  return window.t(

    responsePartsIT.join("\n\n"),

    responsePartsEN.join("\n\n")

  );

}
  // =====================================
// 🧠 CONTEXTUAL FOLLOW-UP
// =====================================

if(
  isFollowUp &&
  (
    lastUserMessage.includes("roi") ||
    alreadyTalkedAboutROI
  )
){

  return window.t(

`📈 Un ROI elevato può sembrare ottimo inizialmente, ma va sempre confrontato con:

• rischio operativo
• cashflow reale
• sostenibilità mutuo
• occupazione reale
• costi nascosti

💡 Molti investimenti con ROI aggressivi diventano instabili nel lungo periodo.`,

`📈 High ROI may initially look excellent, but should always be compared with:

• operational risk
• real cashflow
• mortgage sustainability
• real occupancy
• hidden costs

💡 Many aggressive ROI investments become unstable long-term.`

  );

}

  // =====================================
  // ❌ NO ANALYSIS YET
  // =====================================

if(!window.lastAnalysisData){

  if(wantsEducation){

    return window.t(
      "Posso spiegarti ROI, cashflow, rischio e sostenibilità anche senza simulazione.",
      "I can explain ROI, cashflow, risk and sustainability even without a simulation."
    );

  }

  return window.t(
    "Prima esegui una simulazione così posso analizzare ROI, rischio e rendimento reale.",
    "Run a simulation first so I can analyze ROI, risk and real profitability."
  );

}
// =====================================
// 📊 ROI SIMULATION
// =====================================

if(wantsROI){

    if(access.isFree){

      return window.t(
        `Il ROI stimato sembra interessante, ma senza analisi completa non puoi vedere rischio reale e sostenibilità finanziaria.`,
        `The estimated ROI looks promising, but without full analysis you cannot see real risk and financial sustainability.`
      );

    }

    if(roi >= 15){

      return window.t(
        `Ottimo segnale: il ROI attuale è ${roi.toFixed(1)}%. L'investimento risulta sopra la media del mercato di ${city}.`,
        `Strong signal: current ROI is ${roi.toFixed(1)}%. The investment is above the ${city} market average.`
      );

    }

    if(roi >= 8){

      return window.t(
        `Il ROI attuale è ${roi.toFixed(1)}%. L'investimento sembra sostenibile ma dipende molto dall'occupazione.`,
        `Current ROI is ${roi.toFixed(1)}%. The investment appears sustainable but depends heavily on occupancy.`
      );

    }

    return window.t(
      `Il ROI attuale è piuttosto basso (${roi.toFixed(1)}%). Potrebbe essere necessario ottimizzare prezzo notte o costi.`,
      `Current ROI is relatively low (${roi.toFixed(1)}%). You may need to optimize pricing or costs.`
    );

  }

  // =====================================
  // ⚠️ RISK
  // =====================================

  if(wantsRisk){

    if(access.isFree){

      return window.t(
        "L'analisi rischio completa è disponibile nei piani avanzati.",
        "Full risk analysis is available in advanced plans."
      );

    }

    if(risk <= 35){

      return window.t(
        `Il rischio stimato è basso (${risk}/100). La struttura finanziaria sembra solida.`,
        `Estimated risk is low (${risk}/100). Financial structure appears solid.`
      );

    }

    if(risk <= 65){

      return window.t(
        `Il rischio stimato è moderato (${risk}/100). Controlla bene occupazione e costi operativi.`,
        `Estimated risk is moderate (${risk}/100). Carefully monitor occupancy and operating costs.`
      );

    }

    return window.t(
      `Il rischio stimato è elevato (${risk}/100). L'investimento potrebbe non essere stabile nel lungo periodo.`,
      `Estimated risk is high (${risk}/100). The investment may not be stable long-term.`
    );

  }

  // =====================================
  // 💰 CASHFLOW
  // =====================================

  if(wantsCashflow){

    return window.t(
      `Il profitto netto stimato è di ${window.formatCurrency(profit)} annui.`,
      `Estimated annual net profit is ${window.formatCurrency(profit)}.`
    );

  }

  // =====================================
  // 🏙 CITY
  // =====================================

  if(
    text.includes("città") ||
    text.includes("city") ||
    text.includes(city)
  ){

    return window.t(
      `Stai analizzando il mercato di ${city}. I benchmark locali influenzano ROI e rischio.`,
      `You are analyzing the ${city} market. Local benchmarks affect ROI and risk.`
    );

  }

// =====================================
// 🧠 STRATEGY INSIGHTS
// =====================================

if(
  wantsStrategy &&
  window.lastAnalysisData
){

  let insightsIT = [];
  let insightsEN = [];
  let aiSignals = [];

// =================================
// 🧠 DYNAMIC OPENERS
// =================================

const executiveOpenersIT = [

  "🏦 Analisi executive avanzata completata.",

  "🧠 Sto confrontando la simulazione con benchmark short-rent.",

  "📊 La simulazione mostra metriche superiori alla media mercato.",

  "🏨 Analisi strategica investimento in corso.",

  "📈 Elaborazione avanzata sostenibilità investimento.",

  "🧠 AI predictive engine attivo.",

"📡 Analisi comparativa contro benchmark turistici.",

"🏦 Simulazione finanziaria avanzata completata.",

"📈 Analisi sostenibilità cashflow in corso.",

"🌍 Confronto dati short-rent europei completato."

];

const executiveOpenersEN = [

  "🏦 Advanced executive analysis completed.",

  "🧠 Comparing simulation against short-rent benchmarks.",

  "📊 Simulation shows metrics above market average.",

  "🏨 Strategic investment analysis in progress.",

  "📈 Advanced investment sustainability analysis.",

  "🧠 Predictive AI engine active.",

"📡 Comparative analysis against tourism benchmarks.",

"🏦 Advanced financial simulation completed.",

"📈 Cashflow sustainability analysis in progress.",

"🌍 European short-rent benchmark comparison completed."

];

insightsIT.push(
  executiveOpenersIT[
    Math.floor(
      Math.random() *
      executiveOpenersIT.length
    )
  ]
);

insightsEN.push(
  executiveOpenersEN[
    Math.floor(
      Math.random() *
      executiveOpenersEN.length
    )
  ]
);  

// =================================
// 🧠 OPENING ANALYSIS
// =================================

if(roi >= 15){

  insightsIT.push(
    "🚀 La simulazione mostra metriche molto aggressive rispetto alla media mercato."
  );

  insightsEN.push(
    "🚀 The simulation shows highly aggressive metrics compared to market averages."
  );

}else if(roi >= 8){

  insightsIT.push(
    "📈 La simulazione appare potenzialmente sostenibile."
  );

  insightsEN.push(
    "📈 The simulation appears potentially sustainable."
  );

}else{

  insightsIT.push(
    "⚠️ La simulazione mostra alcune debolezze operative."
  );

  insightsEN.push(
    "⚠️ The simulation shows some operational weaknesses."
  );

}

// =================================
// 🧠 DYNAMIC RECOMMENDATIONS
// =================================

let recommendationsIT = [];
let recommendationsEN = [];

  if(aiTone === "executive"){

  insightsIT.push(
    "🏦 Analisi executive mode attiva."
  );

  insightsEN.push(
    "🏦 Executive analysis mode active."
  );

}

if(aiTone === "advanced"){

  insightsIT.push(
    "📊 Modalità investor avanzata attiva."
  );

  insightsEN.push(
    "📊 Advanced investor mode active."
  );

}

// =================================
// 🌍 MARKET DATA
// =================================

if(marketData){

  insightsIT.push(
    `🌍 Mercato ${city}: ROI medio ${marketData.avgROI}.`
  );

  insightsEN.push(
    `🌍 ${city} market average ROI: ${marketData.avgROI}.`
  );

}

// =================================
// 🧠 AI INVESTMENT SCORE
// =================================

let investmentScore = 0;

if(roi >= 10)
  investmentScore += 30;

if(occupancy >= 65)
  investmentScore += 25;

if(risk <= 40)
  investmentScore += 25;

if(monthlyCosts <= 1200)
  investmentScore += 20;

// =================================
// 🎯 SCORE LABEL
// =================================

let scoreLabelIT = "";
let scoreLabelEN = "";

let scoreEmoji = "";

if(investmentScore >= 80){

  scoreLabelIT = "Investimento molto forte";
  scoreLabelEN = "Very strong investment";

  scoreEmoji = "🟢";

}else if(investmentScore >= 60){

  scoreLabelIT = "Investimento interessante";
  scoreLabelEN = "Promising investment";

  scoreEmoji = "🟡";

}else{

  scoreLabelIT = "Investimento rischioso";
  scoreLabelEN = "Risky investment";

  scoreEmoji = "🔴";

}

// =================================
// 📊 SCORE BAR
// =================================

const scoreBlocks =
  Math.round(investmentScore / 10);

const scoreBar =
  "█".repeat(scoreBlocks) +
  "░".repeat(10 - scoreBlocks);


 // =================================
// ROI
// =================================

if(roi >= 15){

  aiSignals.push("high_roi");

  insightsIT.push(
    "📈 ROI molto elevato rispetto alla media mercato."
  );

  insightsEN.push(
    "📈 ROI significantly above market average."
  );

}else if(roi >= 8){

  aiSignals.push("medium_roi");

  insightsIT.push(
    "📊 ROI potenzialmente sostenibile."
  );

  insightsEN.push(
    "📊 ROI appears potentially sustainable."
  );

}else{

  aiSignals.push("low_roi");

  insightsIT.push(
    "⚠️ ROI piuttosto basso."
  );

  insightsEN.push(
    "⚠️ ROI appears relatively low."
  );

  recommendationsIT.push(
    "Valuta aumento ADR, occupazione o leva finanziaria."
  );

  recommendationsEN.push(
    "Consider improving ADR, occupancy or financial leverage."
  );

}

// =================================
// OCCUPANCY
// =================================

if(occupancy < 55){

  aiSignals.push("low_occupancy");

  insightsIT.push(
    "🏨 Occupazione stimata piuttosto bassa."
  );

  insightsEN.push(
    "🏨 Estimated occupancy appears low."
  );

  recommendationsIT.push(
    "Migliora il listing Airbnb e utilizza pricing dinamico."
  );

  recommendationsEN.push(
    "Improve Airbnb listing quality and use dynamic pricing."
  );

}else if(occupancy >= 70){

  aiSignals.push("high_occupancy");

  insightsIT.push(
    "🔥 Occupazione molto forte."
  );

  insightsEN.push(
    "🔥 Occupancy is very strong."
  );

}

// =================================
// NIGHT PRICE
// =================================

if(nightly < 80){

  insightsIT.push(
    "🏷️ Prezzo notte relativamente basso."
  );

  insightsEN.push(
    "🏷️ Night price appears relatively low."
  );

}else if(nightly > 180){

  insightsIT.push(
    "💎 Prezzo notte premium."
  );

  insightsEN.push(
    "💎 Premium nightly pricing detected."
  );

}

// =================================
// COSTS
// =================================

if(monthlyCosts > 1500){

  aiSignals.push("high_costs");

  recommendationsIT.push(
    "Riduci cleaning, utenze e automatizza il check-in."
  );

  recommendationsEN.push(
    "Reduce cleaning, utilities and automate check-in."
  );

  insightsIT.push(
    "💸 Costi operativi elevati."
  );

  insightsEN.push(
    "💸 Operating costs appear high."
  );

}

// =================================
// COST RATIO
// =================================

if(costRatio >= 45){

  aiSignals.push("bad_cost_ratio");

  recommendationsIT.push(
    "I costi sono troppo elevati rispetto ai ricavi: ottimizza la gestione operativa."
  );

  recommendationsEN.push(
    "Costs are too high compared to revenue: optimize operations."
  );

  insightsIT.push(
    "⚠️ I costi assorbono gran parte dei ricavi."
  );

  insightsEN.push(
    "⚠️ Costs absorb a large portion of revenue."
  );

}

// =================================
// RISK
// =================================

if(risk <= 35){

  aiSignals.push("low_risk");

}else if(risk <= 65){

  aiSignals.push("medium_risk");

}

if(risk >= 70){

  aiSignals.push("high_risk");

  insightsIT.push(
    "⚠️ Il rischio operativo sembra elevato."
  );

  insightsEN.push(
    "⚠️ Operational risk appears high."
  );

}
  // =================================
  // FINAL STRATEGY
  // =================================

  // =================================
// 🧠 AI EXECUTIVE REASONING
// =================================

if(
  roi >= 10 &&
  occupancy >= 70 &&
  risk <= 40
){

  insightsIT.push(
    "🧠 L'investimento mostra una struttura molto competitiva rispetto ai benchmark short-rent italiani."
  );

  insightsEN.push(
    "🧠 The investment shows a highly competitive structure compared to Italian short-rent benchmarks."
  );

}

if(
  risk >= 70 &&
  monthlyCosts >= 1500
){

  insightsIT.push(
    "⚠️ La combinazione tra costi elevati e rischio operativo potrebbe comprimere il cashflow nel lungo periodo."
  );

  insightsEN.push(
    "⚠️ The combination of high operating costs and operational risk may compress long-term cashflow."
  );

}

if(
  occupancy >= 75 &&
  nightly <= 90
){

  insightsIT.push(
    "💡 L'occupazione è forte ma il prezzo notte potrebbe essere sottovalutato rispetto al mercato."
  );

  insightsEN.push(
    "💡 Occupancy is strong but nightly pricing may be undervalued compared to the market."
  );

}

  insightsIT.push(
    "💡 Analizza sempre cashflow reale e sostenibilità prima di investire."
  );

  insightsEN.push(
    "💡 Always analyze real cashflow and sustainability before investing."
  );

insightsIT.push(

`${scoreEmoji} EXECUTIVE SCORE

${investmentScore}/100

${scoreBar}

${scoreLabelIT}`

);

insightsEN.push(

`${scoreEmoji} EXECUTIVE SCORE

${investmentScore}/100

${scoreBar}

${scoreLabelEN}`

);

// =================================
// 💡 FINAL RECOMMENDATIONS
// =================================

if(recommendationsIT.length){

  insightsIT.push(

`💡 Suggerimenti AI:
• ${recommendationsIT.join("\n• ")}`
  );

}

if(recommendationsEN.length){

  insightsEN.push(

`💡 AI Recommendations:
• ${recommendationsEN.join("\n• ")}`
  );

}

// =================================
// 🧠 AI SYNTHESIS ENGINE
// =================================

if(
  aiSignals.includes("high_roi") &&
  aiSignals.includes("high_risk")
){

  insightsIT.push(
    "🧠 Il rendimento è molto elevato, ma il rischio operativo potrebbe compromettere la sostenibilità nel lungo periodo."
  );

  insightsEN.push(
    "🧠 Returns are very strong, but operational risk may compromise long-term sustainability."
  );

}

if(
  aiSignals.includes("high_roi") &&
  aiSignals.includes("high_occupancy")
){

  insightsIT.push(
    "🚀 L'investimento mostra una combinazione molto forte tra rendimento e occupazione."
  );

  insightsEN.push(
    "🚀 The investment shows a very strong combination of profitability and occupancy."
  );

}

if(
  aiSignals.includes("low_roi") &&
  aiSignals.includes("high_costs")
){

  insightsIT.push(
    "⚠️ I costi operativi stanno probabilmente limitando la redditività complessiva."
  );

  insightsEN.push(
    "⚠️ Operating costs are likely limiting overall profitability."
  );

}

if(
  aiSignals.includes("bad_cost_ratio") &&
  aiSignals.includes("medium_roi")
){

  insightsIT.push(
    "📉 Il ROI appare discreto, ma i margini potrebbero ridursi rapidamente se i costi aumentano."
  );

  insightsEN.push(
    "📉 ROI appears decent, but margins could shrink quickly if costs increase."
  );

}

if(
  aiSignals.includes("low_risk") &&
  aiSignals.includes("medium_roi")
){

  insightsIT.push(
    "✅ La simulazione sembra bilanciata tra sostenibilità e stabilità operativa."
  );

  insightsEN.push(
    "✅ The simulation appears balanced between sustainability and operational stability."
  );

}  

// =================================
// 🎭 AI ENDINGS
// =================================

const endingsIT = [

  "📌 Valuta attentamente sostenibilità e cashflow prima di procedere.",

  "📌 Un buon ROI senza stabilità operativa può diventare rischioso.",

  "📌 Ottimizzazione e controllo costi saranno fondamentali."

];

const endingsEN = [

  "📌 Carefully evaluate sustainability and cashflow before proceeding.",

  "📌 Strong ROI without operational stability may become risky.",

  "📌 Optimization and cost control will be essential."

];

const randomEndingIT =
  endingsIT.filter(
    e => !insightsIT.includes(e)
  );

insightsIT.push(

  randomEndingIT.length

  ? randomEndingIT[
      Math.floor(
        Math.random() *
        randomEndingIT.length
      )
    ]

  : endingsIT[
      Math.floor(
        Math.random() *
        endingsIT.length
      )
    ]

);

insightsEN.push(
  endingsEN[
    Math.floor(Math.random()*endingsEN.length)
  ]
);

insightsIT = [...new Set(insightsIT)];
insightsEN = [...new Set(insightsEN)];
  
const finalIT =
  insightsIT.slice(0,10).join("\n\n");

const finalEN =
  insightsEN.slice(0,10).join("\n\n");

return window.t(
  finalIT,
  finalEN
);

}

  // =====================================
  // 👑 PLAN UPSELL
  // =====================================

  if(access.isFree){

    return window.t(
      "Posso aiutarti a stimare il potenziale dell'investimento. Per analisi complete e rischio reale serve il piano Investor o PRO.",
      "I can help estimate the investment potential. Full analysis and real risk require Investor or PRO plans."
    );

  }

  if(access.isInvestor){

    return window.t(
      "Hai accesso all'analisi avanzata base. Il piano PRO sblocca AI insights completi, PDF executive e simulazioni avanzate.",
      "You have access to advanced analysis. PRO unlocks full AI insights, executive PDF and advanced simulations."
    );

  }

// =====================================
// ✅ DEFAULT
// =====================================

return window.t(
  "Posso aiutarti ad analizzare ROI, rischio, cashflow e sostenibilità dell'investimento.",
  "I can help analyze ROI, risk, cashflow and investment sustainability."
);

};

// ===============================================
// 🚀 INIT CHATBOT
// ===============================================

function initRBChatbot(){

  if(document.getElementById("rb-chatbot-wrapper"))
    return;

  const wrapper =
    document.createElement("div");

  wrapper.id =
    "rb-chatbot-wrapper";

  wrapper.innerHTML = `

  <div id="rb-chatbot-button">
    ✨
  </div>

  <div id="rb-chatbot-window">

    <!-- =========================
    HEADER
    ========================== -->

    <div class="rb-chat-header">

      <div class="rb-chat-title">
        ${window.t(
          "AI Investment Assistant",
          "AI Investment Assistant"
        )}
      </div>

      <div class="rb-chat-subtitle">
        ${window.t(
          "Powered by RendimentoBB AI",
          "Powered by RendimentoBB AI"
        )}
      </div>

    </div>

    <!-- =========================
    MESSAGES
    ========================== -->

    <div id="rb-chat-messages">

      <div class="rb-bot-message">

        ${window.t(

          "👋 Ciao. Posso analizzare ROI, rischio, cashflow e sostenibilità del tuo investimento B&B.",

          "👋 Hi. I can analyze ROI, risk, cashflow and sustainability of your B&B investment."

        )}

      </div>

    </div>

    <!-- =========================
    QUICK ACTIONS
    ========================== -->

    <div class="rb-quick-actions">

      <button class="rb-quick-btn">
        ${window.t("ROI","ROI")}
      </button>

      <button class="rb-quick-btn">
        ${window.t("Cashflow","Cashflow")}
      </button>

      <button class="rb-quick-btn">
        ${window.t("Rischio","Risk")}
      </button>

      <button class="rb-quick-btn">
        ${window.t("Conviene?","Worth it?")}
      </button>

    </div>

    <!-- =========================
    INPUT
    ========================== -->

    <div class="rb-chat-input-area">

      <input
        type="text"
        id="rb-chat-input"

        placeholder="${window.t(
          "Scrivi un messaggio...",
          "Write a message..."
        )}"
      >

      <button id="rb-chat-send">
        ➜
      </button>

    </div>

  </div>
  `;

  document.body.appendChild(wrapper);

  // =========================================
  // ELEMENTS
  // =========================================

  const button =
    document.getElementById(
      "rb-chatbot-button"
    );

  const chatWindow =
    document.getElementById(
      "rb-chatbot-window"
    );

  const sendBtn =
    document.getElementById(
      "rb-chat-send"
    );

  const input =
    document.getElementById(
      "rb-chat-input"
    );

  const messages =
    document.getElementById(
      "rb-chat-messages"
    );

  // =========================================
  // OPEN / CLOSE
  // =========================================

  button.onclick = ()=>{

    const isOpen =
      chatWindow.classList
      .contains("open");

    if(isOpen){

      chatWindow
      .classList
      .remove("open");

    }else{

      chatWindow
      .classList
      .add("open");

    }

  };

  // =========================================
  // QUICK ACTIONS
  // =========================================

  document
.querySelectorAll(".rb-quick-btn")
.forEach(btn=>{

  btn.onclick = ()=>{

    const action =
      btn.innerText.trim().toLowerCase();

    if(
      action.includes("roi")
    ){

      input.value = window.t(
        "Spiegami il ROI",
        "Explain ROI"
      );

    }

    else if(
      action.includes("cash")
    ){

      input.value = window.t(
        "Analizza cashflow",
        "Analyze cashflow"
      );

    }

    else if(
      action.includes("risch") ||
      action.includes("risk")
    ){

      input.value = window.t(
        "Analizza il rischio",
        "Analyze risk"
      );

    }

    else{

      input.value = window.t(
        "Conviene investire?",
        "Is this investment worth it?"
      );

    }

    sendMessage();

  };

});

  // =========================================
  // ESCAPE HTML
  // =========================================

  function escapeHTML(str){

    return str

      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");

  }

  // =========================================
  // SEND MESSAGE
  // =========================================

  function sendMessage(){

    sendBtn.disabled = true;

    const text =
      input.value.trim();

  // =====================================
// 🧠 CHATBOT LIMIT ENGINE
// =====================================

const access =
  window.getUserAccess?.() || {};

const today =
  new Date().toDateString();

window.rbChatUsage =
  window.rbChatUsage || {
    date: today,
    count: 0
  };

// 🔄 reset daily
if(window.rbChatUsage.date !== today){

  window.rbChatUsage.date = today;
  window.rbChatUsage.count = 0;

}

// =====================================
// 🧠 PLAN LIMITS
// =====================================

let maxMessages = Infinity;

if(access.isFree){

  maxMessages = 10;

}else if(access.isInvestor){

  maxMessages = 80;

}else if(access.isPro || access.isAdmin){

  maxMessages = Infinity;

}

// =====================================
// ⛔ LIMIT REACHED
// =====================================

if(window.rbChatUsage.count >= maxMessages){

  messages.innerHTML += `

    <div class="rb-bot-message">

      ${
        window.t(

`⚠️ Hai raggiunto il limite giornaliero del tuo piano AI.

🔓 Investor → 80 messaggi/giorno
👑 PRO → accesso illimitato`,

`⚠️ You reached your AI daily limit.

🔓 Investor → 80 messages/day
👑 PRO → unlimited access`

        )
      }

    </div>

  `;

  messages.scrollTop =
    messages.scrollHeight;

  sendBtn.disabled = false;

  return;

}

// =====================================
// ✅ INCREMENT USAGE
// =====================================

window.rbChatUsage.count++;  

    if(!text){

      sendBtn.disabled = false;
      return;

    }

    // =====================================
    // SAVE USER MESSAGE
    // =====================================

    window.rbConversationHistory.push({

      role: "user",

      text,

      time: Date.now()

    });

    // =====================================
    // USER MESSAGE UI
    // =====================================

    messages.innerHTML += `

      <div class="rb-user-message">

        ${escapeHTML(text)}

      </div>

    `;

    // =====================================
    // TYPING EFFECT
    // =====================================

    const typingId =
      "typing-" + Date.now();

    messages.innerHTML += `

      <div
        class="rb-bot-message rb-typing"
        id="${typingId}"
      >

        <span></span>
        <span></span>
        <span></span>

      </div>

    `;

    messages.scrollTop =
      messages.scrollHeight;

    // =====================================
    // AI RESPONSE
    // =====================================

    const response =
      window.generateAIResponse(text);

    const thinkingTime =

      Math.min(

        2200,

        Math.max(
          700,
          response.length * 8
        )

      );

    // =====================================
    // AI DELAY
    // =====================================

    setTimeout(()=>{

      document
      .getElementById(typingId)
      ?.remove();

      // ===============================
      // SAVE AI MESSAGE
      // ===============================

      window.rbConversationHistory.push({

        role: "assistant",

        text: response,

        time: Date.now()

      });

      // ===============================
      // LIMIT MEMORY
      // ===============================

      if(
        window.rbConversationHistory
        .length > 40
      ){

        window.rbConversationHistory =

          window.rbConversationHistory
          .slice(-40);

      }

      // ===============================
      // AI MESSAGE UI
      // ===============================

      messages.innerHTML += `

        <div class="rb-bot-message">

          ${escapeHTML(response)
            .replace(/\n/g,"<br>")}

        </div>

      `;

      messages.scrollTop =
        messages.scrollHeight;

      sendBtn.disabled = false;

      input.focus();

    }, thinkingTime);

    // =====================================
    // RESET INPUT
    // =====================================

    input.value = "";

  }

  // =========================================
  // SEND EVENTS
  // =========================================

  sendBtn.onclick =
    sendMessage;

  input.addEventListener(
    "keypress",
    e=>{

      if(e.key === "Enter"){

        sendMessage();

      }

    }
  );

}
