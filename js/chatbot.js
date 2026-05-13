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
    
`📈 ROI (Return On Investment)

Il ROI misura quanto rende il tuo investimento rispetto al capitale investito.

Esempio:

• investimento → €100.000
• profitto annuo → €10.000

ROI:
10%

💡 Nel settore B&B:

• 4-6% → conservativo
• 7-10% → molto buono
• 10%+ → aggressivo

⚠️ Un ROI alto non garantisce automaticamente un investimento sicuro.`,

`📈 ROI (Return On Investment)

ROI measures how profitable an investment is compared to invested capital.

Example:

• investment → €100,000
• annual profit → €10,000

ROI:
10%

💡 In the B&B sector:

• 4-6% → conservative
• 7-10% → very strong
• 10%+ → aggressive

⚠️ High ROI does not automatically guarantee a safe investment.`

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

`💸 Cashflow

Il cashflow rappresenta il denaro reale che rimane dopo tutte le spese operative.

Include:

• utenze
• cleaning
• tasse
• manutenzione
• eventuale mutuo

💡 Un cashflow positivo significa che il B&B genera liquidità reale ogni mese.

⚠️ Molti investimenti mostrano ROI elevati ma cashflow molto bassi.`,

`💸 Cashflow

Cashflow represents the real money remaining after all operating expenses.

Includes:

• utilities
• cleaning
• taxes
• maintenance
• mortgage payments

💡 Positive cashflow means the property generates real liquidity every month.

⚠️ Many investments show high ROI but weak cashflow.`

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

`⚠️ Rischio investimento

Il rischio misura quanto un investimento può diventare instabile nel tempo.

Nel settore B&B il rischio dipende da:

• occupazione
• costi operativi
• mutuo
• stagionalità
• regolamentazioni locali

💡 Un ROI alto con rischio elevato può diventare poco sostenibile.`,

`⚠️ Investment Risk

Risk measures how unstable an investment may become over time.

In the B&B sector risk depends on:

• occupancy
• operating costs
• mortgage
• seasonality
• local regulations

💡 A high ROI with high risk may become unsustainable.`

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

`🏨 Occupazione

L'occupazione indica la percentuale di notti prenotate durante l'anno.

💡 Nel settore short rent:

• 50% → basso
• 65-70% → ottimo
• 80%+ → molto aggressivo

⚠️ Occupazioni troppo elevate possono essere irrealistiche in alcune città.`,

`🏨 Occupancy

Occupancy represents the percentage of booked nights during the year.

💡 In the short rental sector:

• 50% → low
• 65-70% → excellent
• 80%+ → very aggressive

⚠️ Extremely high occupancy may be unrealistic in some cities.`

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

`🏦 DSCR

Il DSCR misura la capacità dell'investimento di sostenere il mutuo.

💡 Generalmente:

• sotto 1 → rischio elevato
• sopra 1.2 → sostenibile
• sopra 1.5 → molto forte

Le banche utilizzano spesso questo parametro per valutare finanziamenti immobiliari.`,

`🏦 DSCR

DSCR measures the investment's ability to sustain mortgage payments.

💡 Generally:

• below 1 → high risk
• above 1.2 → sustainable
• above 1.5 → very strong

Banks often use this metric to evaluate real estate financing.`

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

`⚖️ Break-even

Il break-even rappresenta il punto in cui ricavi e costi si equivalgono.

💡 Più rapidamente raggiungi il break-even:

• minore sarà il rischio
• maggiore sarà la stabilità operativa

⚠️ Un break-even troppo lento aumenta l'esposizione finanziaria.`,

`⚖️ Break-even

Break-even represents the point where revenues equal costs.

💡 The faster you reach break-even:

• the lower the risk
• the higher the operational stability

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

  "📈 Elaborazione avanzata sostenibilità investimento."

];

const executiveOpenersEN = [

  "🏦 Advanced executive analysis completed.",

  "🧠 Comparing simulation against short-rent benchmarks.",

  "📊 Simulation shows metrics above market average.",

  "🏨 Strategic investment analysis in progress.",

  "📈 Advanced investment sustainability analysis."

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

  insightsIT.push(
    "💡 Analizza sempre cashflow reale e sostenibilità prima di investire."
  );

  insightsEN.push(
    "💡 Always analyze real cashflow and sustainability before investing."
  );

  insightsIT.push(
  `🧠 AI Investment Score: ${investmentScore}/100`
);

insightsEN.push(
  `🧠 AI Investment Score: ${investmentScore}/100`
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
function initRBChatbot(){

  if(document.getElementById("rb-chatbot-wrapper")) return;

  const wrapper = document.createElement("div");

  wrapper.id = "rb-chatbot-wrapper";

  wrapper.innerHTML = `

  <div id="rb-chatbot-button">
    ✨
  </div>

  <div id="rb-chatbot-window">

    <div class="rb-chat-header">

      <div class="rb-chat-title">
        ${window.t(
          "AI Investment Assistant",
          "AI Investment Assistant"
        )}
      </div>

      <div class="rb-chat-subtitle">
        ${window.t(
          "Powered by RendimentoBB",
          "Powered by RendimentoBB"
        )}
      </div>

    </div>

    <div id="rb-chat-messages">

      <div class="rb-bot-message">

        ${window.t(
          "Ciao 👋 Posso aiutarti ad analizzare investimenti B&B.",
          "Hi 👋 I can help you analyze B&B investments."
        )}

      </div>

    </div>

    <div class="rb-chat-input-area">

      <input
        type="text"
        id="rb-chat-input"

        placeholder="${window.t(
          'Scrivi un messaggio...',
          'Write a message...'
        )}"
      >

      <button id="rb-chat-send">
        ➜
      </button>

    </div>

  </div>
  `;

  document.body.appendChild(wrapper);

  const button = document.getElementById("rb-chatbot-button");
  const chatWindow = document.getElementById("rb-chatbot-window");

  button.onclick = ()=>{

  const isOpen =
    chatWindow.classList.contains("open");

  if(isOpen){

    chatWindow.classList.remove("open");

  }else{

    chatWindow.classList.add("open");

  }

};

  const sendBtn = document.getElementById("rb-chat-send");
  const input = document.getElementById("rb-chat-input");

  function escapeHTML(str){

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

  function sendMessage(){

    sendBtn.disabled = true;

    const text = input.value.trim();

    if(!text){

  sendBtn.disabled = false;
  return;

}
    window.rbConversationHistory.push({
  role: "user",
  text,
  time: Date.now()
});

    const messages = document.getElementById("rb-chat-messages");

    messages.innerHTML += `
      <div class="rb-user-message">
        ${escapeHTML(text)}
      </div>
    `;

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

setTimeout(()=>{

  document.getElementById(typingId)
  ?.remove();

  window.rbConversationHistory.push({
    role: "assistant",
    text: response,
    time: Date.now()
  });

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

input.value = "";

    input.value = "";

    messages.scrollTop = messages.scrollHeight;

    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.onclick = sendMessage;

  input.addEventListener("keypress", e=>{
    if(e.key === "Enter"){
      sendMessage();
    }
  });

}
