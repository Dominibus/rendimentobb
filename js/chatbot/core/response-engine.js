// ===============================================
// 🧠 RENDIMENTOBB – RESPONSE ENGINE 1.0
// Silicon Valley AI Orchestrator
// ===============================================

console.log("🔥 RESPONSE ENGINE VERSION 9");

// ===============================================
// 🧠 MAIN RESPONSE ENGINE
// ===============================================

window.rbGenerateResponse = function({

  message = "",

  entities = {},

  intent = {},

  memory = {},

  advisor = null,

  analysisData = {},

  aiSignals = []

} = {}){

  
console.log(
  "🔥 RESPONSE ENGINE CALLED",
  {
    intent,
    message
  }
);

console.log(
  "🧪 FULL INTENT OBJECT",
  JSON.stringify(intent, null, 2)
);

console.log(
  "🧪 INTENT VALUE",
  intent.intent
);

  console.log(
  "🧪 AVAILABLE ANALYSIS",
  analysisData
);

console.log(
  "🧪 MEMORY",
  memory
);

  console.log(
  "🧪 GENERATE RESPONSE START"
);

  // ===========================================
  // 🧠 RESPONSE OBJECT
  // ===========================================

  const response = {

    type: "generic",

    confidence: 0.5,

    textIT: "",

    textEN: "",

    suggestionsIT: [],

    suggestionsEN: [],

    signals: [],

    metadata: {}

  };

  // ===========================================
// 🧠 EXECUTIVE CONVERSATION FORMATTER 1.0
// ===========================================

function applyExecutiveFormatter(
  targetResponse = {}
){

const supportedTypes = [
  "roi",
  "cashflow",
  "risk",
  "strategy",
  "mortgage",
  "pms"
];

  if(
    !supportedTypes.includes(
      targetResponse.type
    )
  ){

    return targetResponse;

  }

  const headers = {

    roi: {
      it: "🧠 Executive ROI Insight",
      en: "🧠 Executive ROI Insight"
    },

    cashflow: {
      it: "🧠 Executive Cashflow Review",
      en: "🧠 Executive Cashflow Review"
    },

    risk: {
      it: "🧠 Executive Risk Assessment",
      en: "🧠 Executive Risk Assessment"
    },

strategy: {
  it: "🧠 Executive Investment Advisor",
  en: "🧠 Executive Investment Advisor"
},

mortgage: {
  it: "🧠 Executive Mortgage Advisor",
  en: "🧠 Executive Mortgage Advisor"
},

 pms: {
  it: "🧠 Executive PMS Advisor",
  en: "🧠 Executive PMS Advisor"
}   

  };

  const header =
    headers[targetResponse.type];

  if(!header){

    return targetResponse;

  }

  const textIT =
    String(
      targetResponse.textIT || ""
    ).trim();

  const textEN =
    String(
      targetResponse.textEN || ""
    ).trim();

  if(
    textIT &&
    !textIT.startsWith(header.it)
  ){

    targetResponse.textIT =
`${header.it}

${textIT}`;

  }

  if(
    textEN &&
    !textEN.startsWith(header.en)
  ){

    targetResponse.textEN =
`${header.en}

${textEN}`;

  }

  targetResponse.metadata = {

    ...(targetResponse.metadata || {}),

    presentationLayer:
      "executive_conversation_v1",

    formattedAt:
      Date.now()

  };

  return targetResponse;

}

  // ===========================================
  // 📊 SAFE DATA
  // ===========================================

const liveData = {

  // Livello legacy / filtrato dal piano
  ...(window.rbChatbotData || {}),

  // Memoria live legacy
  ...(window.rbChatbotLive || {}),

  // Memoria investimento
  ...(window.rbInvestmentMemory || {}),

  // Ultima analisi completa salvata
  ...(window.lastAnalysisData || {}),

  // Dati forniti direttamente dall'Orchestrator:
  // massima priorità e fonte più aggiornata
  ...(analysisData || {})

};

// =====================================
// 🏨 PMS DATA
// =====================================

const pmsData =

  window.rbPMSMemory ||

  window.rbPMSData ||

  {};

console.log(
  "🏨 PMS DATA:",
  pmsData
);

  const investorProfile =
  window.rbInvestorProfile || {};

  const uiNetProfit =

  Number(

    document.getElementById("profit-annual")
      ?.textContent

      ?.replace(/[^\d,-]/g, "")
      ?.replace(/\./g, "")
      ?.replace(",", ".")

  ) || 0;

// ===========================================
// 📈 PRIMARY INVESTOR ROI
// ROI sul capitale investito: stessa metrica
// usata da Simulatore, Advisor e Score Engine
// ===========================================

const roi =
  Number(

    liveData.visualROI ??

    liveData.roi ??

    window.lastAnalysisData?.visualROI ??

    window.lastAnalysisData?.roi ??

    liveData.realROI ??

    0

  );

const executiveROI =
  Number(

    liveData.visualROI ??

    window.lastAnalysisData?.visualROI ??

    liveData.roi ??

    roi ??

    0

  );

// ===========================================
// 📈 PRIMARY ROI VALUE HELPER
// ROI sul capitale investito per storico,
// confronti, portfolio e ranking
// ===========================================

function getPrimaryROIValue(
  source = {}
){

  return Number(

    source?.visualROI ??

    source?.roi ??

    source?.realROI ??

    0

  );

}

// ===========================================
// 📊 PORTFOLIO METRICS HELPER
// Shared by Portfolio Advisor, Growth Advisor,
// Best City and future Portfolio AI modules
// ===========================================

function getPortfolioMetrics(
  history = []
){

  const totalSimulations = history.length;

  const averageROI =

    totalSimulations > 0

      ? history.reduce(

          (sum,item)=>

            sum +

            getPrimaryROIValue(item),

          0

        ) / totalSimulations

      : 0;

  const bestSimulation =

    [...history].sort(

      (a,b)=>

        getPrimaryROIValue(b)

        -

        getPrimaryROIValue(a)

    )[0] || null;

  const bestROI =

    bestSimulation

      ? getPrimaryROIValue(bestSimulation)

      : 0;

  const bestCity =

    bestSimulation

      ? (

          bestSimulation.realCity ||

          bestSimulation.city ||

          bestSimulation.marketCity ||

          "N/D"

        )

      : "N/D";

  const averageCashflow =

    totalSimulations > 0

      ? history.reduce(

          (sum,item)=>

            sum +

            Number(

              item.net ??

              item.cashflow ??

              item.annualProfit ??

              0

            ),

          0

        ) / totalSimulations

      : 0;

  return {

    totalSimulations,

    averageROI,

    bestSimulation,

    bestROI,

    bestCity,

    averageCashflow

  };

}  

const risk =
  Number(

    liveData.risk ??

    window.rbChatbotLive?.risk ??

    window.rbChatbotData?.risk ??

    0

  );

const occupancy =
  Number(

    liveData.occupancy ??

    window.rbChatbotLive?.occupancy ??

    window.rbChatbotData?.occupancy ??

    0

  );

console.log(
  "🧠 LIVE RESPONSE DATA:",
  {
    roi,
    risk,
    occupancy,
    liveData,
    chatbotLive: window.rbChatbotLive,
    chatbotData: window.rbChatbotData
  }
);

  // ===========================================
// 🌍 SAFE MARKET CONTEXT
// ===========================================

const allowMarketContext =

[
  "market_analysis",
  "investment_executive",
  "investment_advisor",
  "investment_strategy",
  "comparison",
  "roi_analysis",
  "risk_analysis",
  "cashflow_analysis",
  "mortgage_analysis"
].includes(intent.intent);

const city =

allowMarketContext

? (

    entities.city ||

    memory.city ||

    window.currentCity ||

    "roma"

  )

: null;

const cityLabel =

city

? (
    window.rbCapitalize?.(city) ||
    city
  )

: "";

// ===========================================
// 🧠 INVESTMENT SCORE
// ===========================================

const investmentScore =

  window.rbGenerateInvestmentScore?.({

    roi,

    risk,

    occupancy,

    mortgagePercent:
      entities.mortgagePercent ||

      liveData.mortgagePercent ||

      0,

    cashflow:
      liveData.net ||

      liveData.cashflow ||

      0,

    city:
      cityLabel

  }) ||

  null;

console.log(
  "🧠 INVESTMENT SCORE:",
  investmentScore
);


// ===========================================
// 🧠 MEMORY CONTEXT
// ===========================================

const rememberedBudget =

  entities.amount ||

  entities.price ||

  memory.lastBudget ||

  memory.lastPropertyPrice ||

  0;

const rememberedCity =

  entities.city ||

  memory.lastCity ||

  city ||

  null;

const rememberedMortgage =

  entities.mortgagePercent ||

  memory.lastMortgagePercent ||

  liveData.mortgagePercent ||

  0;

console.log(
  "🧠 MEMORY CONTEXT:",
  {
    rememberedBudget,
    rememberedCity,
    rememberedMortgage
  }
);  

// ===========================================
// 🧠 INVESTOR MEMORY
// ===========================================

const availableCapital =

  Number(

    entities.availableCapital ||

    memory?.availableCapital ||

    window.rbChatMemory
      ?.availableCapital ||

    0

  );

const ownedProperties =

  memory.ownedProperties ||

  window.rbChatMemory?.ownedProperties ||

  0;

const monthlyCashflowGoal =

  Number(

    entities.monthlyCashflowGoal ||

    memory?.monthlyCashflowGoal ||

    window.rbChatMemory
      ?.monthlyCashflowGoal ||

    0

  );

const targetROI =

  memory.targetROI ||

  memory.lastTargetROI ||

  window.rbChatMemory?.lastTargetROI ||

  0;

console.log(
  "🧠 INVESTOR MEMORY:",
  {
    availableCapital,
    ownedProperties,
    monthlyCashflowGoal,
    targetROI
  }
);

// =====================================
// 💾 GLOBAL INVESTMENT HISTORY
// =====================================

const investmentHistory =

window.investmentHistory ||

window.dashboardInvestmentHistory ||

window.rbInvestmentHistory ||

window.rbChatMemory?.investmentHistory ||

[];

console.log(
  "💾 GLOBAL INVESTMENT HISTORY:",
  investmentHistory
);

console.log(
  "📊 HISTORY COUNT:",
  investmentHistory.length
);

console.log(
  "📊 FULL HISTORY:",
  JSON.stringify(
    investmentHistory,
    null,
    2
  )
);

  console.log(
  "🔍 HISTORY SOURCES",
  {
    investmentHistory:
      window.investmentHistory?.length,

    dashboardInvestmentHistory:
      window.dashboardInvestmentHistory?.length,

    rbInvestmentHistory:
      window.rbInvestmentHistory?.length,

    chatMemory:
      window.rbChatMemory?.investmentHistory?.length
  }
);

  // ===========================================
  // 🌍 MARKET DATA
  // ===========================================

  const market =

allowMarketContext && city

? (
    window.rbMarketData?.[city] ||
    null
  )

: null;
  

// ===========================================
// 🧠 EXECUTIVE CONTEXT
// Single Source of Truth
// ===========================================

const executiveContext = {

    liveData,

    advisor,

    investmentScore,

    market,

    city,

    cityLabel,

    memory,

    entities,

    analysisData,

    pmsData,

    investorProfile,

    investmentHistory,

    aiSignals,

    documents: {

    activeReport:

        window.lastExecutiveReport ||

        null,

    library:

        window.rbDocumentManager?.getAll?.() ||

        [],

    dashboardReports:

        window.rbDocumentManager?.getByType?.(
            "dashboard"
        ) ||

        [],

    uploadedDocuments:

        window.rbUploadedDocuments ||

        [],

    comparisons: []

}

};

// ===========================================
// 📄 ACTIVE EXECUTIVE REPORT
// ===========================================

const executiveReport =

    executiveContext.documents
        ?.activeReport ||

    null;

const executiveLibrary =

    executiveContext.documents
        ?.library ||

    [];

// ===========================================
// 🧠 DOCUMENT KNOWLEDGE
// ===========================================

const documentKnowledge =

    window.rbAnalyzeDocuments?.(

        executiveContext

    ) ||

    {};

console.log(

    "🧠 DOCUMENT KNOWLEDGE",

    documentKnowledge

);  

// ===========================================
// 🧠 EXECUTIVE REPORT MEMORY
// ===========================================

const executiveReportMemory =

executiveReport

? {

    city:
        executiveReport.city ||
        cityLabel,

    roi:
        executiveReport.roi ||
        roi,

    risk:
        executiveReport.risk ||
        risk,

    occupancy:
        executiveReport.occupancy ||
        occupancy,

    cashflow:
        executiveReport.cashflow ||
        0,

    score:
        executiveReport.score ||
        investmentScore?.score ||
        0,

    grade:
        executiveReport.grade ||
        investmentScore?.labelIT ||
        ""

}

: null;
  
// ===========================================
// 🧠 AI INSIGHTS
// ===========================================

const executiveInsightsIT = [];

const executiveInsightsEN = [];

// ===========================================
// 🧠 RESPONSE BLOCK HELPER
// ===========================================

const responseBlocksIT = [];

const responseBlocksEN = [];

function pushResponseBlock({

  priority = 0,
  textIT = "",
  textEN = ""

}){

  if(textIT){

    responseBlocksIT.push({
      priority,
      text: textIT
    });

  }

  if(textEN){

    responseBlocksEN.push({
      priority,
      text: textEN
    });

  }

}  

// ===========================================
// 🧠 LEGACY REASONING (temporary)
// Will be removed after Executive Builder migration
// ===========================================

const reasoningIT = [];

const reasoningEN = [];

// =====================================
// 🚀 HIGH PERFORMANCE
// =====================================

if(
  roi >= 20 &&
  occupancy >= 65 &&
  risk <= 40
){

  reasoningIT.push(
    "🚀 Il motore AI considera la simulazione altamente competitiva rispetto ai benchmark short-rent."
  );

  reasoningEN.push(
    "🚀 The AI engine considers this simulation highly competitive compared to short-rent benchmarks."
  );

}

// =====================================
// ⚠️ HIGH ROI + HIGH RISK
// =====================================

if(
  roi >= 20 &&
  risk >= 70
){

  reasoningIT.push(
    "⚠️ Il ROI elevato è accompagnato da una struttura operativa aggressiva."
  );

  reasoningEN.push(
    "⚠️ High ROI is combined with an aggressive operational structure."
  );

}

// =====================================
// ⚠️ LOW OCCUPANCY
// =====================================

if(
  occupancy > 0 &&
  occupancy < 45
){

  reasoningIT.push(
    "⚠️ L'occupazione attuale potrebbe compromettere cashflow e sostenibilità."
  );

  reasoningEN.push(
    "⚠️ Current occupancy may compromise cashflow and sustainability."
  );

}

// =====================================
// 💸 NEGATIVE CASHFLOW SIGNAL
// =====================================

if(aiSignals.includes("negative_cashflow")){

  reasoningIT.push(
    "💸 Il cashflow operativo mostra segnali di instabilità."
  );

  reasoningEN.push(
    "💸 Operational cashflow shows instability signals."
  );

}

// =====================================
// 🏦 HIGH LEVERAGE
// =====================================

const mortgagePercent = Number(
  liveData.mortgagePercent ||
  entities.mortgagePercent ||
  0
);

if(mortgagePercent >= 80){

  reasoningIT.push(
    "🏦 La leva finanziaria elevata aumenta la vulnerabilità ai cambiamenti di mercato."
  );

  reasoningEN.push(
    "🏦 High financial leverage increases vulnerability to market fluctuations."
  );

}

// 🚀 HIGH ROI
if(aiSignals.includes("very_high_roi")){

  executiveInsightsIT.push(
    "🚀 ROI molto elevato rispetto ai benchmark short-rent."
  );

  executiveInsightsEN.push(
    "🚀 ROI significantly above short-rent benchmarks."
  );

}

// ⚠️ HIGH RISK
if(aiSignals.includes("high_risk")){

  executiveInsightsIT.push(
    "⚠️ La simulazione mostra una struttura operativa aggressiva."
  );

  executiveInsightsEN.push(
    "⚠️ The simulation shows an aggressive operational structure."
  );

}

// 🏨 HIGH OCCUPANCY
if(aiSignals.includes("high_occupancy")){

  executiveInsightsIT.push(
    "🏨 L'occupazione supporta positivamente il cashflow."
  );

  executiveInsightsEN.push(
    "🏨 Occupancy positively supports cashflow."
  );

}

// 💸 NEGATIVE CASHFLOW
if(aiSignals.includes("negative_cashflow")){

  executiveInsightsIT.push(
    "💸 Il cashflow operativo potrebbe diventare instabile."
  );

  executiveInsightsEN.push(
    "💸 Operational cashflow may become unstable."
  );

}
  
// =====================================
// 🌍 MARKET + ROI CROSS ANALYSIS
// =====================================

if(
  market &&
  roi > 0
){

  const marketROI =
    parseFloat(
      String(market.avgROI || "")
        .replace(/[^\d.,-]/g,"")
        .replace(",", ".")
    ) || 0;

  if(
    marketROI > 0 &&
    roi >= marketROI * 1.8
  ){

    reasoningIT.push(
      "📈 Il ROI simulato è molto superiore al benchmark medio della città."
    );

    reasoningEN.push(
      "📈 Simulated ROI is significantly above the city's average benchmark."
    );

  }

}  

// ===========================================
// 🚫 NO ANALYSIS SAFETY
// ===========================================

const hasAnalysis =

  (!isNaN(roi) && roi !== 0) ||

  (!isNaN(risk) && risk !== 0) ||

  (!isNaN(occupancy) && occupancy !== 0);

  const isDashboard =

  window.location.pathname.includes(
    "/dashboard"
  );

console.log(
  "🚨 ANALYSIS CHECK",
  {
    roi,
    risk,
    occupancy,
    hasAnalysis
  }
);

// ===========================================
// 🏠 HOME QUICK SIMULATION
// ===========================================

const isHomeSimulation =

  window.location.pathname === "/" ||

  window.location.pathname === "/index.html";

console.log(
  "🧪 BLOCK PARTIAL ANALYSIS CHECK",
  {
    intent: intent.intent,
    hasAnalysis,
    isDashboard,
    isHomeSimulation,

    education:
      intent.intent === "education",

    subscriptions:
      intent.intent === "subscriptions",

    market_analysis:
      intent.intent === "market_analysis",

    investment_strategy:
      intent.intent === "investment_strategy",

    investment_advisor:
      intent.intent === "investment_advisor",

    portfolio_growth:
      intent.intent === "portfolio_growth",

    market_comparison:
      intent.intent === "market_comparison",

    report_interpretation:
      intent.intent === "report_interpretation",

    greeting:
      intent.intent === "greeting",

    roi_analysis:
      intent.intent === "roi_analysis"
  }
);  

// ===========================================
// 🚫 BLOCK PARTIAL ANALYSIS
// ===========================================

if(

  (
  (!hasAnalysis && !isDashboard) ||
  isHomeSimulation
) &&

  intent.intent !== "education" &&
  intent.intent !== "subscriptions" &&
  intent.intent !== "market_analysis" &&
  intent.intent !== "investment_strategy" &&
  intent.intent !== "investment_advisor" &&
  intent.intent !== "portfolio_growth" &&
  intent.intent !== "market_comparison" &&
  intent.intent !== "report_interpretation" &&
  intent.intent !== "greeting" &&
  intent.intent !== "pms_analysis" &&
  intent.intent !== "pms_overview" &&
  intent.intent !== "pms_bookings" &&
  intent.intent !== "pms_arrivals" &&
  intent.intent !== "pms_checkins" &&
  intent.intent !== "pms_checkouts" &&
  intent.intent !== "pms_revenue" &&
  intent.intent !== "pms_occupancy" &&
  intent.intent !== "pms_adr" &&
  intent.intent !== "pms_guests"

){

  return {

    type: "empty",

    confidence: 1,

    textIT:

`📊 Sto leggendo dati parziali dalla simulazione rapida.

Per ottenere:
• ROI reale
• cashflow avanzato
• rischio operativo
• analisi AI completa

esegui una simulazione nel simulatore principale.`,

    textEN:

`📊 I am currently reading partial quick-simulation data.

To unlock:
• real ROI
• advanced cashflow
• operational risk
• full AI analysis

run a simulation inside the main simulator.`,

    suggestionsIT: [
      "Apri simulatore completo"
    ],

    suggestionsEN: [
      "Open full simulator"
    ],

    signals: [],

    metadata: {}

  };

}

// ===========================================
// 🧠 RESPONSE VARIATIONS
// ===========================================

const roiPositiveIT = [

  "📈 ROI molto competitivo rispetto alla media short-rent.",

  "🚀 La simulazione mostra una marginalità superiore ai benchmark locali.",

  "💰 Il rendimento appare particolarmente interessante nel contesto attuale.",

  "🏨 L'investimento mostra metriche operative molto forti."

];

const roiPositiveEN = [

  "📈 ROI appears highly competitive versus short-rent averages.",

  "🚀 The simulation shows margins above local benchmarks.",

  "💰 Returns appear particularly attractive in the current market.",

  "🏨 The investment shows very strong operational metrics."

];

// ===========================================
// 🎲 RANDOM PICKER
// ===========================================

function pickRandom(arr){

  return arr[
    Math.floor(
      Math.random() * arr.length
    )
  ];

}

  // ===========================================
  // 📈 ROI RESPONSE
  // ===========================================

  if(
    intent.intent === "roi_analysis"
  ){

    console.log(
    "🔥 ROI BRANCH ENTERED",
    {
      roi,
      risk,
      occupancy
    }
  );

    response.type =
      "roi";

    console.log(
  "🔥 ROI RESPONSE CREATED",
  response
);

    response.confidence =
      0.95;

    if(roi >= 15){

      response.signals.push(
  "high_roi"
);

const marketROI =
  market?.avgROI || "8-10%";

response.textIT =

`🚀 ROI estremamente elevato.

📈 ROI sul capitale investito:
${roi.toFixed(1)}%

🌍 Mercato:
${cityLabel}

📊 Benchmark medio:
${marketROI}

${pickRandom(roiPositiveIT)}

${roi >= 40
? "⚠️ Un ROI oltre il 40% richiede verifica realistica di occupazione, costi e sostenibilità operativa."
: "✅ Il rendimento appare competitivo rispetto al benchmark."
}

🏨 Occupazione:
${occupancy}% 

⚠️ Risk score:
${risk}/100`;

response.textEN =

`🚀 Extremely high ROI detected.

📈 ROI on invested capital:
${roi.toFixed(1)}%

🌍 Market:
${cityLabel}

📊 Average benchmark:
${marketROI}

${pickRandom(roiPositiveEN)}

${roi >= 40
? "⚠️ ROI above 40% requires realistic validation of occupancy, costs and sustainability."
: "✅ Returns appear competitive versus benchmark."
}

🏨 Occupancy:
${occupancy}%

⚠️ Risk score:
${risk}/100`;

      console.log(
  "🔥 ROI TEXT GENERATED",
  {
    textIT: response.textIT,
    textEN: response.textEN
  }
);
      return applyExecutiveFormatter(
  response
);
    }

    else if(roi >= 8){

      response.signals.push(
        "medium_roi"
      );

      response.textIT =

`📈 ROI potenzialmente sostenibile.

📊 ROI simulato:
${roi.toFixed(1)}%

💡 L'investimento sembra equilibrato ma dipende da occupazione e costi.`;

      response.textEN =

`📈 ROI appears potentially sustainable.

📊 Simulated ROI:
${roi.toFixed(1)}%

💡 The investment appears balanced but depends on occupancy and costs.`;

    }

    else{

  response.signals.push(
    "low_roi"
  );

  // =====================================
  // 🚨 NEGATIVE ROI
  // =====================================

  if(roi <= 0){

    response.signals.push(
      "negative_roi"
    );

    response.textIT =

`🚨 Investimento operativo in perdita.

📉 ROI simulato:
${roi.toFixed(1)}%

⚠️ La struttura attuale non sembra sostenibile.

💡 Costi operativi, occupazione o pricing potrebbero compromettere il cashflow reale.

🏦 Prima di investire è consigliabile rivedere:
• prezzo notte
• occupazione media
• costi fissi
• leva finanziaria`;

    response.textEN =

`🚨 Investment appears operationally unprofitable.

📉 Simulated ROI:
${roi.toFixed(1)}%

⚠️ The current structure may not be financially sustainable.

💡 Operating costs, occupancy or pricing may compromise real cashflow.

🏦 Before investing it is recommended to review:
• nightly pricing
• average occupancy
• fixed costs
• financial leverage`;

  }

// =====================================
// ⚠️ LOW ROI
// =====================================

else{

  response.textIT =

`⚠️ ROI relativamente basso.

📊 ROI simulato:
${roi.toFixed(1)}%

💡 Potrebbe essere necessario ottimizzare ADR, occupazione o costi operativi.`;

  response.textEN =

`⚠️ ROI appears relatively low.

📊 Simulated ROI:
${roi.toFixed(1)}%

💡 ADR, occupancy or operational cost optimization may be required.`;

}

    }

       console.log(
      "📈 ROI RESPONSE CREATED",
      response
    );

    return applyExecutiveFormatter(
  response
);

  }

// ===========================================
// 💰 CASHFLOW RESPONSE
// ===========================================

else if(
  intent.intent === "cashflow_analysis"
){

  response.type =
    "cashflow";

  response.confidence =
    0.95;

  // =====================================
  // 💰 SAFE DATA
  // =====================================

  const rawNet =

    liveData.net ??
    liveData.netProfit ??
    liveData.profitNet ??
    uiNetProfit ??
    null;

  const rawGross =

    liveData.gross ??
    liveData.grossProfit ??
    liveData.profit ??
    0;

  const net =

    rawNet !== undefined &&
    rawNet !== null &&
    rawNet !== "" &&
    !isNaN(Number(rawNet))

      ? Number(rawNet)

      : 0;

  console.log(
    "💰 CASHFLOW FINAL DEBUG:",
    {
      rawNet,
      rawGross,
      uiNetProfit,
      finalNet: net,
      liveData
    }
  );

  // =====================================
  // 🔒 FREE LOCK
  // =====================================

  const access =

    window.getUserAccess?.() ||

    window.RB_USER ||

    {};

  if(

    !access.canSeeFullAnalysis &&

    !access.isInvestor &&

    !access.isPro &&

    !access.isAdmin

  ){

    response.signals.push(
      "cashflow_locked"
    );

    response.textIT =

`🔒 Il cashflow dettagliato è disponibile nei piani Investor e PRO.

💡 Passa a Investor o PRO per sbloccare:
• profitto netto reale
• sostenibilità operativa
• cashflow annuale
• analisi rischio avanzata`;

    response.textEN =

`🔒 Detailed cashflow analysis is available in Investor and PRO plans.

💡 Upgrade to Investor or PRO to unlock:
• real net profit
• operational sustainability
• annual cashflow
• advanced risk analysis`;

  }

  // =====================================
  // 🚨 NEGATIVE CASHFLOW
  // =====================================

  else if(net <= 0){

    response.signals.push(
      "negative_cashflow"
    );

    response.textIT =

`🚨 Cashflow operativo negativo.

💸 Profitto netto stimato:
€${net.toLocaleString("it-IT")}

⚠️ L'investimento potrebbe generare perdite operative.

💡 È consigliabile ridurre costi o aumentare occupazione e ADR.`;

    response.textEN =

`🚨 Negative operational cashflow detected.

💸 Estimated net profit:
€${net.toLocaleString("en-US")}

⚠️ The investment may generate operational losses.

💡 Reducing costs or increasing occupancy and ADR is recommended.`;

  }

  else{

    response.signals.push(
      "positive_cashflow"
    );

    response.textIT =

`✅ Cashflow operativo positivo.

💰 Profitto netto stimato:
€${net.toLocaleString("it-IT")}

📈 La simulazione mostra una sostenibilità finanziaria potenzialmente stabile.`;

    response.textEN =

`✅ Positive operational cashflow detected.

💰 Estimated net profit:
€${net.toLocaleString("en-US")}

📈 The simulation shows potentially stable financial sustainability.`;

  }

console.log(
  "💰 CASHFLOW RESPONSE CREATED",
  response
);

return applyExecutiveFormatter(
  response
);

}

// ===========================================
// ⚠️ RISK RESPONSE
// ===========================================

else if(
  intent.intent === "risk_analysis"
){

  response.type =
    "risk";

  response.confidence =
    0.94;

  if(risk >= 70){

    response.signals.push(
      "high_risk"
    );

    response.textIT =

`🚨 Rischio operativo elevato.

📊 Risk score:
${risk}/100

⚠️ Cashflow e sostenibilità potrebbero diventare instabili nel lungo periodo.`;

    response.textEN =

`🚨 High operational risk detected.

📊 Risk score:
${risk}/100

⚠️ Cashflow and sustainability may become unstable long-term.`;

  }

  else if(risk >= 40){

    response.signals.push(
      "medium_risk"
    );

    response.textIT =

`⚠️ Rischio moderato.

📊 Risk score:
${risk}/100

💡 L'investimento sembra sostenibile ma richiede monitoraggio operativo.`;

    response.textEN =

`⚠️ Moderate risk detected.

📊 Risk score:
${risk}/100

💡 The investment appears sustainable but requires operational monitoring.`;

  }

  else{

    response.signals.push(
      "low_risk"
    );

    const riskInsightIT =

      occupancy < 45

      ? "⚠️ L'occupazione attuale sta riducendo la stabilità operativa."

      : occupancy >= 65

      ? "✅ L'occupazione supporta bene il cashflow."

      : "📊 L'occupazione appare moderata.";

    const riskInsightEN =

      occupancy < 45

      ? "⚠️ Current occupancy is reducing operational stability."

      : occupancy >= 65

      ? "✅ Occupancy strongly supports cashflow."

      : "📊 Occupancy appears moderate.";

    response.textIT =

`✅ Rischio relativamente basso.

📊 Risk score:
${risk}/100

🏨 Occupazione:
${occupancy}%

${riskInsightIT}

📈 ROI sul capitale:
${roi.toFixed(1)}%`;

    response.textEN =

`✅ Risk appears relatively low.

📊 Risk score:
${risk}/100

🏨 Occupancy:
${occupancy}%

${riskInsightEN}

📈 ROI on equity:
${roi.toFixed(1)}%`;

  }

  console.log(
    "⚠️ RISK RESPONSE CREATED",
    response
  );

  return applyExecutiveFormatter(
    response
  );

}
  
 // ===========================================
// 🏦 MORTGAGE RESPONSE
// Mortgage Advisor 2.0
// ===========================================

else if(
  intent.intent === "mortgage_analysis"
){

  response.type =
  "mortgage";

  response.confidence =
    0.98;

  const mortgagePercent =

    Number(

      liveData.mortgagePercent ||

      entities.mortgagePercent ||

      0

    );

  const equity =

    Number(

      liveData.equity ||

      liveData.initialCapital ||

      0

    );

  const loanAmount =

    Number(

      liveData.loanAmount ||

      liveData.mortgage ||

      0

    );

  const netCashflow =

    Number(

      liveData.net ||

      liveData.cashflow ||

      0

    );

  let leverageLevelIT =
    "🟢 Conservativa";

  let leverageLevelEN =
    "🟢 Conservative";

  let verdictIT =
    "🟢 Finanziamento sostenibile";

  let verdictEN =
    "🟢 Sustainable financing";

  // =====================================
  // 🧠 LEVERAGE CLASSIFICATION
  // =====================================

  if(mortgagePercent >= 90){

    leverageLevelIT =
      "🔴 Molto aggressiva";

    leverageLevelEN =
      "🔴 Highly aggressive";

    verdictIT =
      "🔴 Rischio finanziario elevato";

    verdictEN =
      "🔴 High financial risk";

  }

  else if(mortgagePercent >= 80){

    leverageLevelIT =
      "🟠 Aggressiva";

    leverageLevelEN =
      "🟠 Aggressive";

    verdictIT =
      "🟠 Monitorare sostenibilità";

    verdictEN =
      "🟠 Sustainability should be monitored";

  }

  else if(mortgagePercent >= 60){

    leverageLevelIT =
      "🟡 Bilanciata";

    leverageLevelEN =
      "🟡 Balanced";

  }

  // =====================================
  // 🇮🇹
  // =====================================

  response.textIT =

`🏦 Mortgage Advisor AI

📊 Leva finanziaria:
${mortgagePercent}%

💰 Capitale investito:
€${equity.toLocaleString("it-IT")}

🏦 Importo finanziato:
€${loanAmount.toLocaleString("it-IT")}

📈 ROI:
${roi.toFixed(1)}%

💸 Cashflow:
€${Math.round(netCashflow).toLocaleString("it-IT")}

⚠️ Risk Score:
${risk}/100

🏷️ Livello leva

${leverageLevelIT}

🎯 Verdetto AI

${verdictIT}

🧠 Analisi

${
  mortgagePercent >= 90

  ? "L'operazione utilizza una leva molto elevata. Piccole variazioni di occupazione o ricavi potrebbero avere un impatto significativo sul cashflow."

  : mortgagePercent >= 80

  ? "La leva è aggressiva ma può risultare sostenibile se supportata da occupazione stabile e cashflow positivo."

  : mortgagePercent >= 60

  ? "La struttura del finanziamento appare equilibrata per una strategia di crescita immobiliare."

  : "La leva finanziaria risulta prudente e offre una buona protezione contro la volatilità del mercato."
}

🚀 Consiglio AI

${
  netCashflow > 0

  ? "Il cashflow positivo supporta la sostenibilità del finanziamento nel medio-lungo periodo."

  : "Prima di aumentare la leva finanziaria è consigliabile migliorare il cashflow operativo."
}`;

  // =====================================
  // 🇬🇧
  // =====================================

  response.textEN =

`🏦 AI Mortgage Advisor

📊 Financial Leverage:
${mortgagePercent}%

💰 Equity Invested:
€${equity.toLocaleString("en-US")}

🏦 Loan Amount:
€${loanAmount.toLocaleString("en-US")}

📈 ROI:
${roi.toFixed(1)}%

💸 Cashflow:
€${Math.round(netCashflow).toLocaleString("en-US")}

⚠️ Risk Score:
${risk}/100

🏷️ Leverage Level

${leverageLevelEN}

🎯 AI Verdict

${verdictEN}

🧠 Analysis

${
  mortgagePercent >= 90

  ? "The transaction relies on very high leverage. Small occupancy or revenue changes could significantly impact cashflow."

  : mortgagePercent >= 80

  ? "Leverage is aggressive but may remain sustainable when supported by stable occupancy and positive cashflow."

  : mortgagePercent >= 60

  ? "The financing structure appears balanced for a real estate growth strategy."

  : "Financial leverage is conservative and provides stronger protection against market volatility."
}

🚀 AI Advice

${
  netCashflow > 0

  ? "Positive cashflow supports long-term financing sustainability."

  : "Improving operational cashflow is recommended before increasing leverage."
}`;

  return applyExecutiveFormatter(
  response
);

}

// ===========================================
// 🏨 PMS RESPONSE ENGINE
// PMS Intelligence Layer
// ===========================================

else if(

  intent.intent === "pms_analysis" ||

  intent.intent === "pms_overview" ||

  intent.intent === "pms_bookings" ||

  intent.intent === "pms_arrivals" ||

  intent.intent === "pms_checkins" ||

  intent.intent === "pms_checkouts" ||

  intent.intent === "pms_revenue" ||

  intent.intent === "pms_occupancy" ||

  intent.intent === "pms_adr" ||

  intent.intent === "pms_guests"

){

  console.log(
    "🔥 PMS BLOCK ENTERED"
  );

  console.log(
    "🔥 PMS DATA:",
    pmsData
  );

  response.type =
    "pms";

  response.confidence =
    0.99;

  const properties =
    Number(
      pmsData?.properties || 0
    );

  const bookings =
    Number(
      pmsData?.bookings || 0
    );

  const revenue =
    Number(
      pmsData?.revenue || 0
    );

  const occupancyPMS =
    Number(
      pmsData?.occupancy || 0
    );

  const adr =
    Number(
      pmsData?.adr || 0
    );

  const guests =
    Number(
      pmsData?.guests || 0
    );

  const arrivals =
  Number(
    pmsData?.arrivals || 0
  );

const checkins =
  Number(
    pmsData?.checkins || 0
  );

const checkouts =
  Number(
    pmsData?.checkouts || 0
  );

// =====================================
// 🏨 PMS EXECUTIVE OVERVIEW
// =====================================

if(intent.intent === "pms_overview"){

  let performanceIT =
    "🟡 Performance regolari";

  let performanceEN =
    "🟡 Stable performance";

  let adviceIT =
    "💡 Le performance risultano equilibrate.";

  let adviceEN =
    "💡 Performance appears balanced.";

  if(occupancyPMS >= 90){

    performanceIT =
      "🟢 Occupazione eccellente";

    performanceEN =
      "🟢 Excellent occupancy";

    adviceIT =
      "💡 L'occupazione è molto elevata. Valuta un aumento progressivo delle tariffe per migliorare il RevPAR.";

    adviceEN =
      "💡 Occupancy is very high. Consider gradually increasing rates to improve RevPAR.";

  }

  else if(occupancyPMS >= 75){

    performanceIT =
      "🟢 Performance superiori alla media";

    performanceEN =
      "🟢 Above-average performance";

    adviceIT =
      "💡 Occupazione e domanda risultano solide. Mantieni pricing dinamico e monitoraggio ADR.";

    adviceEN =
      "💡 Occupancy and demand appear strong. Maintain dynamic pricing and ADR monitoring.";

  }

  else if(occupancyPMS < 60){

    performanceIT =
      "🔴 Occupazione migliorabile";

    performanceEN =
      "🔴 Occupancy can be improved";

    adviceIT =
      "💡 Valuta promozioni, ottimizzazione OTA e revisione delle tariffe.";

    adviceEN =
      "💡 Consider promotions, OTA optimization and pricing adjustments.";

  }

  response.textIT =

`🏨 PMS Executive Review

${performanceIT}

━━━━━━━━━━━━━━━

📌 Proprietà
${properties}

📅 Prenotazioni
${bookings}

👥 Ospiti
${guests}

💰 Ricavi
€${revenue.toLocaleString("it-IT")}

🏨 Occupazione
${occupancyPMS}%

💵 ADR
€${adr}

━━━━━━━━━━━━━━━

🧠 Insight AI

${
  occupancyPMS >= 80
  ? "La struttura sta performando sopra la media operativa del settore short-rent."
  : occupancyPMS >= 60
  ? "Le metriche risultano stabili ma esistono margini di miglioramento."
  : "L'occupazione attuale sta limitando il potenziale di crescita dei ricavi."
}

🎯 Priorità Operativa

${adviceIT}`;

  response.textEN =

`🏨 PMS Executive Review

${performanceEN}

━━━━━━━━━━━━━━━

📌 Properties
${properties}

📅 Bookings
${bookings}

👥 Guests
${guests}

💰 Revenue
€${revenue.toLocaleString("en-US")}

🏨 Occupancy
${occupancyPMS}%

💵 ADR
€${adr}

━━━━━━━━━━━━━━━

🧠 AI Insight

${
  occupancyPMS >= 80
  ? "The property is performing above average short-rent benchmarks."
  : occupancyPMS >= 60
  ? "Performance appears stable but there is room for improvement."
  : "Current occupancy is limiting revenue growth potential."
}

🎯 Operational Priority

${adviceEN}`;

  return response;

}

// =====================================
// 📥 ARRIVALS
// =====================================

if(intent.intent === "pms_arrivals"){

  response.textIT =
    `📥 Arrivi previsti: ${arrivals}`;

  response.textEN =
    `📥 Expected arrivals: ${arrivals}`;

  return response;
}

// =====================================
// 🔑 CHECKINS
// =====================================

if(intent.intent === "pms_checkins"){

  response.textIT =
    `🔑 Check-in previsti: ${checkins}`;

  response.textEN =
    `🔑 Expected check-ins: ${checkins}`;

  return response;
}

// =====================================
// 🚪 CHECKOUTS
// =====================================

if(intent.intent === "pms_checkouts"){

  response.textIT =
    `🚪 Check-out previsti: ${checkouts}`;

  response.textEN =
    `🚪 Expected check-outs: ${checkouts}`;

  return response;
}  

// =====================================
// 📅 PMS BOOKINGS
// =====================================

if(intent.intent === "pms_bookings"){

  response.textIT =
    `📅 Attualmente hai ${bookings} prenotazioni registrate nel PMS.`;

  response.textEN =
    `📅 You currently have ${bookings} bookings registered in the PMS.`;

  return response;

}

if(
  intent.intent === "pms_guests"
){

  response.textIT =
    `👥 Attualmente hai ${guests} ospiti registrati nel PMS.`;

  response.textEN =
    `👥 You currently have ${guests} guests registered in the PMS.`;

  return response;

}  

// =====================================
// 💰 PMS REVENUE
// =====================================

if(intent.intent === "pms_revenue"){

  response.textIT =
    `💰 I ricavi attuali registrati nel PMS sono €${revenue.toLocaleString("it-IT")}.`;

  response.textEN =
    `💰 Current PMS revenue is €${revenue.toLocaleString("en-US")}.`;

  return response;

}

// =====================================
// 🏨 PMS OCCUPANCY
// =====================================

if(intent.intent === "pms_occupancy"){

  response.textIT =
    `🏨 L'occupazione attuale è del ${occupancyPMS}%.`;

  response.textEN =
    `🏨 Current occupancy is ${occupancyPMS}%.`;

  return response;

}

// =====================================
// 💵 PMS ADR
// =====================================

if(intent.intent === "pms_adr"){

  response.textIT =
    `💵 L'ADR attuale è €${adr}.`;

  response.textEN =
    `💵 Current ADR is €${adr}.`;

  return response;

}

// ===========================================
// 📊 INVESTMENT / MARKET COMPARISON RESPONSE
// ===========================================

else if(
  intent.intent === "comparison"
){

  response.type =
    "comparison";

  response.confidence =
    0.97;

  console.log(
  "🚀 COMPARISON MODE HARD LOCK"
);

// =====================================
// 🧠 SAME CITY COMPARISON ENGINE
// =====================================

console.log(
  "🔥 FINAL COMPARISON MEMORY:",
  investmentHistory
);

console.log(
  "🧠 FINAL INVESTMENT HISTORY:",
  investmentHistory
);

console.log(
  "🔥 FINAL COMPARISON MEMORY:",
  investmentHistory
);

if(
  investmentHistory.length >= 2
){

  const current =
  investmentHistory[
    investmentHistory.length - 1
  ];

const previous =
  investmentHistory[
    investmentHistory.length - 2
  ];

const currentROI =
  getPrimaryROIValue(
    current
  );

const previousROI =
  getPrimaryROIValue(
    previous
  );

console.log(
  "🧠 COMPARISON ROI:",
  {
    currentROI,
    previousROI,
    current,
    previous
  }
);

console.log(
  "🔥 COMPARISON ACTIVE:",
  investmentHistory.length
);

console.log(
  "🔥 COMPARISON HISTORY ACTIVE",
  investmentHistory
);

  const roiDiff =
    Math.abs(
      currentROI - previousROI
    ).toFixed(1);

  response.type =
    "comparison";

  response.confidence =
    0.98;

  response.textIT =

`🆚 Confronto simulazioni AI

━━━━━━━━━━━━━━━

💰 Simulazione precedente

📈 ROI:
${previousROI.toFixed(1)}%

💵 Profitto:
€${Number(
  previous.net || 0
).toLocaleString("it-IT")}

🏨 Occupazione:
${Math.round(
  previous.occupancy || 0
)}%

━━━━━━━━━━━━━━━

💰 Simulazione attuale

📈 ROI:
${currentROI.toFixed(1)}%

💵 Profitto:
€${Number(
  current.net || 0
).toLocaleString("it-IT")}

🏨 Occupazione:
${Math.round(
  current.occupancy || 0
)}%

━━━━━━━━━━━━━━━

🧠 Insight AI

${
  currentROI > previousROI

  ? `La simulazione attuale mostra un ROI superiore di ${roiDiff}%.`

  : `La simulazione precedente risulta più profittevole di ${roiDiff}%.`
}`;

  response.textEN =

`🆚 AI Simulation Comparison

━━━━━━━━━━━━━━━

💰 Previous Simulation

📈 ROI:
${previousROI.toFixed(1)}%

💵 Profit:
€${Number(
  previous.net || 0
).toLocaleString("en-US")}

🏨 Occupancy:
${Math.round(
  previous.occupancy || 0
)}%

━━━━━━━━━━━━━━━

💰 Current Simulation

📈 ROI:
${currentROI.toFixed(1)}%

💵 Profit:
€${Number(
  current.net || 0
).toLocaleString("en-US")}

🏨 Occupancy:
${Math.round(
  current.occupancy || 0
)}%

━━━━━━━━━━━━━━━

🧠 AI Insight

${
  currentROI > previousROI

  ? `The current simulation shows a higher ROI by ${roiDiff}%.`

  : `The previous simulation appears more profitable by ${roiDiff}%.`
}`;

  console.log(
  "🛑 COMPARISON HARD STOP"
);

response.__LOCKED = true;

return structuredClone(response);

}  

// =====================================
// 🌍 CITY COMPARISON
// =====================================

const cities = [

  ...(Array.isArray(entities.cities)
    ? entities.cities
    : []),

  ...(entities.city
    ? [entities.city]
    : [])

].filter(Boolean);

if(cities.length >= 2){

  const city1 =
    cities[0]?.toLowerCase();

  const city2 =
    cities[1]?.toLowerCase();

  const market1 =
    window.rbMarketData?.[city1];

  const market2 =
    window.rbMarketData?.[city2];

  const sim1 =
    window.rbCityMemory?.[city1] || {};

  const sim2 =
    window.rbCityMemory?.[city2] || {};

  // =====================================
  // 🧠 SAFE HELPERS
  // =====================================

const getROI = (sim) => {

  return getPrimaryROIValue(
    sim
  );

};

  const getProfit = (sim) => {

    return Number(
      sim.net ??
      sim.annualProfit ??
      sim.monthlyProfit ??
      0
    );

  };

  const getOccupancy = (
    sim,
    market
  ) => {

    return Number(
      sim.occupancy ??
      parseFloat(
        market?.occupancy
      ) ??
      0
    );

  };

  const formatROI = (value) => {

    return Number(
      value || 0
    ).toFixed(1);

  };

  const formatPercent = (value) => {

    return Math.round(
      Number(value || 0)
    );

  };

  const formatCurrency = (value) => {

    return Number(
      value || 0
    ).toLocaleString(
      "it-IT",
      {
        maximumFractionDigits: 0
      }
    );

  };

  // =====================================
  // 🏆 WINNER
  // =====================================

  const roi1 =
    getROI(sim1);

  const roi2 =
    getROI(sim2);

  let winnerIT = "";
  let winnerEN = "";

  if(roi1 > roi2){

    winnerIT =
      `🏆 Miglior rendimento stimato: ${window.rbCapitalize?.(city1)}`;

    winnerEN =
      `🏆 Best estimated return: ${window.rbCapitalize?.(city1)}`;

  }

  else if(roi2 > roi1){

    winnerIT =
      `🏆 Miglior rendimento stimato: ${window.rbCapitalize?.(city2)}`;

    winnerEN =
      `🏆 Best estimated return: ${window.rbCapitalize?.(city2)}`;

  }

  else{

    winnerIT =
      "⚖️ Le due simulazioni mostrano performance simili.";

    winnerEN =
      "⚖️ Both simulations show similar performance.";

  }

// =====================================
// 🧠 AI INSIGHT ENGINE
// =====================================

const roiDifference =

  Math.abs(
    roi1 - roi2
  ).toFixed(1);

let aiInsightIT = "";
let aiInsightEN = "";

if(roi1 > roi2){

  aiInsightIT =

`🧠 Insight AI

${window.rbCapitalize?.(city1)}
mostra un ROI superiore di ${roiDifference}%.

${window.rbCapitalize?.(city2)}
offre però una possibile stabilità maggiore
grazie ad una occupazione del ${formatPercent(
  getOccupancy(
    sim2,
    market2
  )
)}%.`;

  aiInsightEN =

`🧠 AI Insight

${window.rbCapitalize?.(city1)}
shows a higher ROI by ${roiDifference}%.

${window.rbCapitalize?.(city2)}
may offer stronger operational stability
thanks to ${formatPercent(
  getOccupancy(
    sim2,
    market2
  )
)}% occupancy.`;

}

else if(roi2 > roi1){

  aiInsightIT =

`🧠 Insight AI

${window.rbCapitalize?.(city2)}
mostra un ROI superiore di ${roiDifference}%.

${window.rbCapitalize?.(city1)}
offre però una possibile stabilità maggiore
grazie ad una occupazione del ${formatPercent(
  getOccupancy(
    sim1,
    market1
  )
)}%.`;

  aiInsightEN =

`🧠 AI Insight

${window.rbCapitalize?.(city2)}
shows a higher ROI by ${roiDifference}%.

${window.rbCapitalize?.(city1)}
may offer stronger operational stability
thanks to ${formatPercent(
  getOccupancy(
    sim1,
    market1
  )
)}% occupancy.`;

}

else{

  aiInsightIT =
    "⚖️ Le due simulazioni mostrano performance simili.";

  aiInsightEN =
    "⚖️ Both simulations show similar performance.";

}

// =====================================
// ✅ VALIDATION
// =====================================

if(market1 && market2){

  response.type =
    "comparison";

  response.confidence =
    0.97;

  response.textIT =

`🆚 Confronto mercati AI

${winnerIT}

━━━━━━━━━━━━━━━

🌍 ${window.rbCapitalize?.(city1)}

📈 ROI mercato:
${market1.avgROI}

💰 ROI simulazione:
${formatROI(
  getROI(sim1)
)}%

🏨 Occupazione:
${formatPercent(
  getOccupancy(
    sim1,
    market1
  )
)}%

💵 Profitto stimato:
€${formatCurrency(
  getProfit(sim1)
)}

⚠️ Rischio:
${market1.risk}

━━━━━━━━━━━━━━━

🌍 ${window.rbCapitalize?.(city2)}

📈 ROI mercato:
${market2.avgROI}

💰 ROI simulazione:
${formatROI(
  getROI(sim2)
)}%

🏨 Occupazione:
${formatPercent(
  getOccupancy(
    sim2,
    market2
  )
)}%

💵 Profitto stimato:
€${formatCurrency(
  getProfit(sim2)
)}

⚠️ Rischio:
${market2.risk}

━━━━━━━━━━━━━━━

${aiInsightIT}`;

  response.textEN =

`🆚 AI Market Comparison

${winnerEN}

━━━━━━━━━━━━━━━

🌍 ${window.rbCapitalize?.(city1)}

📈 Market ROI:
${market1.avgROI}

💰 Simulation ROI:
${formatROI(
  getROI(sim1)
)}%

🏨 Occupancy:
${formatPercent(
  getOccupancy(
    sim1,
    market1
  )
)}%

💵 Estimated Profit:
€${formatCurrency(
  getProfit(sim1)
)}

⚠️ Risk:
${market1.risk}

━━━━━━━━━━━━━━━

🌍 ${window.rbCapitalize?.(city2)}

📈 Market ROI:
${market2.avgROI}

💰 Simulation ROI:
${formatROI(
  getROI(sim2)
)}%

🏨 Occupancy:
${formatPercent(
  getOccupancy(
    sim2,
    market2
  )
)}%

💵 Estimated Profit:
€${formatCurrency(
  getProfit(sim2)
)}

⚠️ Risk:
${market2.risk}

━━━━━━━━━━━━━━━

${aiInsightEN}`;

}

else{

  response.textIT =
    "⚠️ Dati mercato non disponibili per una delle città.";

  response.textEN =
    "⚠️ Market data unavailable for one of the cities.";

}

} // <-- CHIUSURA if(cities.length >= 2)

else{

  console.log(
    "⚠️ CITY COMPARISON SKIPPED"
  );

}

// =====================================
// 🚀 HARD RETURN COMPARISON
// =====================================

if(
  response.textIT &&
  response.textIT.length > 0
){

  console.log(
    "✅ COMPARISON FINAL RETURN"
  );

  return response;

}

  // =====================================
  // 📊 FALLBACK INVESTMENT HISTORY
  // =====================================

    const history =

  investmentHistory?.length

    ? investmentHistory

    : (

        memory?.investmentHistory ||

        window.rbChatMemory?.investmentHistory ||

        []

      );

  console.log(
  "🔥 FINAL HISTORY USED:",
  history
  );

    if(history.length >= 2){

      const current =
        history[history.length - 1];

      const previous =
        history[history.length - 2];

      response.textIT =

`📊 Confronto simulazioni

🏙 ${current.city}
📈 ROI: ${Number(current.roi || 0).toFixed(1)}%

VS

🏙 ${previous.city}
📈 ROI: ${Number(previous.roi || 0).toFixed(1)}%`;

      response.textEN =

`📊 Simulation comparison

🏙 ${current.city}
📈 ROI: ${Number(current.roi || 0).toFixed(1)}%

VS

🏙 ${previous.city}
📈 ROI: ${Number(previous.roi || 0).toFixed(1)}%`;

    }

    else{

      response.textIT =
        "⚠️ Servono almeno due simulazioni o due città da confrontare.";

      response.textEN =
        "⚠️ At least two simulations or two cities are required.";

    }

return response;

}

// ===========================================
// 🌍 MARKET RESPONSE
// ===========================================

else if(

  !response.__LOCKED &&

  response.type !== "comparison" &&

  intent.intent === "market_analysis"

){

    response.type =
      "market";

    response.confidence =
      0.91;

    if(market){

      response.textIT =

`🌍 Analisi mercato ${cityLabel}

📈 ROI medio:
${market.avgROI}

🏨 Occupazione:
${market.occupancy}

⚠️ Rischio:
${market.risk}`;

      response.textEN =

`🌍 ${cityLabel} market analysis

📈 Average ROI:
${market.avgROI}

🏨 Occupancy:
${market.occupancy}

⚠️ Risk:
${market.risk}`;

    }

    else{

  response.textIT =
    "⚠️ Nessun benchmark disponibile per questa città.";

  response.textEN =
    "⚠️ No benchmark available for this city.";

}

  }

// ===========================================
// 🏆 BEST CITY
// ===========================================

else if(
  intent.intent === "best_city"
){

  response.type =
    "best_city";

  response.confidence =
    0.99;

  const history =
    investmentHistory || [];

  if(history.length < 2){

    response.textIT =
      "⚠️ Servono almeno due simulazioni per confrontare le città.";

    response.textEN =
      "⚠️ At least two simulations are required to compare cities.";

    return response;

  }

  const cityMap = {};

  history.forEach(item=>{

    const city = (

      item.realCity ||

      item.city ||

      item.marketCity ||

      "N/D"

    ).toLowerCase();

 const roi =
  getPrimaryROIValue(
    item
  );

    const risk =
      Number(item.risk ?? 0);

    const occupancy =
      Number(item.occupancy ?? 0);

    const cashflow =
      Number(
        item.net ??
        item.cashflow ??
        0
      );

    if(!cityMap[city]){

      cityMap[city] = {

        city,

        bestROI: roi,

        avgROI: roi,

        avgRisk: risk,

        avgOccupancy: occupancy,

        avgCashflow: cashflow,

        simulations: 1

      };

      return;

    }

    cityMap[city].bestROI =
      Math.max(
        cityMap[city].bestROI,
        roi
      );

    cityMap[city].avgROI += roi;

    cityMap[city].avgRisk += risk;

    cityMap[city].avgOccupancy += occupancy;

    cityMap[city].avgCashflow += cashflow;

    cityMap[city].simulations++;

  });

  const ranked =

  Object.values(cityMap)

  .map(city=>({

    ...city,

    avgROI:
      city.avgROI /
      city.simulations,

    avgRisk:
      city.avgRisk /
      city.simulations,

    avgOccupancy:
      city.avgOccupancy /
      city.simulations,

    avgCashflow:
      city.avgCashflow /
      city.simulations

  }))

  .sort((a,b)=>{

    const scoreA =

      (
        a.avgROI * 0.45 +
        a.avgOccupancy * 0.20 +
        (100 - a.avgRisk) * 0.20 +
        (a.avgCashflow / 1000) * 0.15
      );

    const scoreB =

      (
        b.avgROI * 0.45 +
        b.avgOccupancy * 0.20 +
        (100 - b.avgRisk) * 0.20 +
        (b.avgCashflow / 1000) * 0.15
      );

    return scoreB - scoreA;

  });

  const best =
    ranked[0];

  const bestCity =

    best.city.charAt(0).toUpperCase()

    +

    best.city.slice(1);

  const bestROI =
    best.bestROI;

  const strategicInsightIT =

    best.avgROI >= 25

    ? `${bestCity} combina redditività elevata e sostenibilità operativa superiore alla media.`

    : best.avgRisk <= 35

    ? `${bestCity} emerge come il mercato più stabile tra quelli analizzati.`

    : `${bestCity} mostra il miglior equilibrio tra rendimento e rischio nel portafoglio simulato.`;

  const strategicInsightEN =

    best.avgROI >= 25

    ? `${bestCity} combines strong profitability with above-average operational sustainability.`

    : best.avgRisk <= 35

    ? `${bestCity} stands out as the most stable market among analyzed cities.`

    : `${bestCity} offers the best balance between return and risk across the simulated portfolio.`;

  let rankingIT =
    "🏆 Classifica Strategica AI\n\n";

  let rankingEN =
    "🏆 AI Strategic Ranking\n\n";

  ranked.slice(0,5).forEach((item,index)=>{

    const cityLabel =

      item.city.charAt(0).toUpperCase()

      +

      item.city.slice(1);

    rankingIT +=
`${index+1}. ${cityLabel}

📈 ROI Max: ${item.bestROI.toFixed(1)}%
📊 ROI Medio: ${item.avgROI.toFixed(1)}%
🏨 Occupazione: ${item.avgOccupancy.toFixed(0)}%
⚠️ Rischio: ${item.avgRisk.toFixed(0)}/100
💰 Cashflow: €${Math.round(item.avgCashflow).toLocaleString("it-IT")}
🧪 Simulazioni: ${item.simulations}

`;

    rankingEN +=
`${index+1}. ${cityLabel}

📈 Max ROI: ${item.bestROI.toFixed(1)}%
📊 Average ROI: ${item.avgROI.toFixed(1)}%
🏨 Occupancy: ${item.avgOccupancy.toFixed(0)}%
⚠️ Risk: ${item.avgRisk.toFixed(0)}/100
💰 Cashflow: €${Math.round(item.avgCashflow).toLocaleString("en-US")}
🧪 Simulations: ${item.simulations}

`;

  });

  response.textIT =

`🏆 Migliore città individuata

📍 ${bestCity}

📈 ROI massimo registrato:
${bestROI.toFixed(1)}%

${rankingIT}

🧠 Insight Strategico AI

${strategicInsightIT}

📊 ROI medio:
${best.avgROI.toFixed(1)}%

🏨 Occupazione media:
${best.avgOccupancy.toFixed(0)}%

⚠️ Rischio medio:
${best.avgRisk.toFixed(0)}/100

💰 Cashflow medio:
€${Math.round(best.avgCashflow).toLocaleString("it-IT")}

🎯 L'AI considera attualmente ${bestCity} la destinazione più interessante per una strategia short-rent orientata a redditività, stabilità e sostenibilità operativa.`;

  response.textEN =

`🏆 Best City Identified

📍 ${bestCity}

📈 Highest Recorded ROI:
${bestROI.toFixed(1)}%

${rankingEN}

🧠 AI Strategic Insight

${strategicInsightEN}

📊 Average ROI:
${best.avgROI.toFixed(1)}%

🏨 Average Occupancy:
${best.avgOccupancy.toFixed(0)}%

⚠️ Average Risk:
${best.avgRisk.toFixed(0)}/100

💰 Average Cashflow:
€${Math.round(best.avgCashflow).toLocaleString("en-US")}

🎯 The AI currently considers ${bestCity} the most attractive destination for a profitability-focused, stable and operationally sustainable short-rent strategy.`;

  console.log(
    "🏆 BEST CITY RESPONSE:",
    response
  );

  return response;

}

// ===========================================
// 🏆 BEST SIMULATION
// ===========================================

else if(
  intent.intent === "best_simulation"
){

  response.type = "best_simulation";

  const history =
    investmentHistory || [];

  if(!history.length){

    response.textIT =
      "⚠️ Nessuna simulazione disponibile.";

    response.textEN =
      "⚠️ No simulations available.";

    return response;
  }

const best =

  [...history].sort(
    (a,b)=>

      getPrimaryROIValue(b)

      -

      getPrimaryROIValue(a)

  )[0];

const bestROI =
  getPrimaryROIValue(
    best
  );

  response.textIT =

`🏆 Migliore simulazione

🌍 Città:
${best.city || best.marketCity || "N/D"}

📈 ROI:
${bestROI.toFixed(1)}%

💰 Profitto:
€${Number(
  best.net || 0
).toLocaleString("it-IT")}

🧠 È attualmente la simulazione più redditizia salvata nello storico.`;

  response.textEN =

`🏆 Best simulation

🌍 City:
${best.city || best.marketCity || "N/A"}

📈 ROI:
${bestROI.toFixed(1)}%

💰 Profit:
€${Number(
  best.net || 0
).toLocaleString("en-US")}

🧠 This is currently the most profitable saved simulation.`;

}  

// ===========================================
// 💳 SUBSCRIPTIONS RESPONSE
// ===========================================

else if(
  intent.intent === "subscriptions"
){

  response.type =
    "subscriptions";

  response.confidence =
    0.97;

const q =
  String(message || "")
  .toLowerCase();
  // =====================================
  // 💰 PREZZI
  // =====================================

  if(
    q.includes("costo") ||
    q.includes("prezzo") ||
    q.includes("quanto costa") ||
    q.includes("price")
  ){

    response.textIT =

`🔥 PIANI RENDIMENTOBB

🟢 INVESTOR — €19/mese
• benchmark città
• analisi avanzate
• simulazioni investimento
• metriche short-rent

🚀 PRO — €29/mese
• tutto Investor
• PDF bancario
• AI avanzata
• forecast
• analisi rischio
• mutui
• export completo`;

    response.textEN =

`🔥 RENDIMENTOBB PLANS

🟢 INVESTOR — €19/month
• city benchmarks
• advanced analysis
• investment simulations
• short-rent metrics

🚀 PRO — €29/month
• everything in Investor
• bank-level PDF
• advanced AI
• forecasts
• risk analysis
• mortgages
• full export`;

  }

  // =====================================
  // 🔥 DIFFERENZA PIANI
  // =====================================

  else if(
    q.includes("differenza") ||
    q.includes("investor") ||
    q.includes("pro")
  ){

    response.textIT =

`🚀 DIFFERENZA INVESTOR vs PRO

🟢 INVESTOR (€19)
Ideale per chi vuole:
• simulare investimenti
• confrontare città
• analizzare ROI e cashflow

🚀 PRO (€29)
Include tutto Investor +
• PDF professionale bancario
• AI avanzata
• forecast investimento
• analisi rischio completa
• simulazioni mutuo
• export avanzati

💡 PRO è pensato per investitori e professionisti short-rent.`;

    response.textEN =

`🚀 INVESTOR vs PRO

🟢 INVESTOR (€19)
Perfect for:
• investment simulations
• city comparisons
• ROI and cashflow analysis

🚀 PRO (€29)
Includes everything in Investor +
• professional bank-level PDF
• advanced AI
• investment forecasts
• full risk analysis
• mortgage simulations
• advanced exports

💡 PRO is designed for investors and short-rent professionals.`;

  }

  // =====================================
  // ❌ DISDETTA
  // =====================================

  else if(
    q.includes("disdire") ||
    q.includes("annullare") ||
    q.includes("cancellare") ||
    q.includes("cancel")
  ){

    response.textIT =

`❌ Puoi annullare il tuo abbonamento in qualsiasi momento.

L’accesso rimarrà attivo fino alla fine del periodo già pagato.

Per gestire il piano:
• accedi al tuo account
• apri area abbonamento
• seleziona gestione piano`;

    response.textEN =

`❌ You can cancel your subscription anytime.

Your access will remain active until the end of the paid period.

To manage your plan:
• log into your account
• open subscription area
• select manage plan`;

  }

  // =====================================
  // 📌 DEFAULT
  // =====================================

  else{

    response.textIT =

`💳 Posso aiutarti con:

• prezzi piani
• differenza Investor/PRO
• gestione abbonamento
• funzionalità disponibili`;

    response.textEN =

`💳 I can help you with:

• plan pricing
• Investor vs PRO
• subscription management
• available features`;

  }

}

// ===========================================
// 🧠 EXECUTIVE AI RESPONSE
// ===========================================

else if(

  intent.intent === "investment_executive" ||

  intent.intent === "executive_analysis" ||

  intent.intent === "analysis" ||

  intent.intent === "sustainability" ||

  intent.intents?.includes("sustainability") ||

  intent.intents?.includes("analysis")

){

  console.log(
  "🚀 EXECUTIVE BLOCK ENTERED",
  intent
);

  response.type =
    "executive";

  response.confidence =
    0.99;

// =====================================
// 💰 EXECUTIVE FINANCIALS
// =====================================

function getExecutiveFinancialData(){

  const rawNet =

    liveData.net ??
    liveData.netProfit ??
    liveData.profitNet ??
    liveData.cashflow ??
    null;

  const rawGross =

    liveData.gross ??
    liveData.grossProfit ??
    liveData.profit ??
    liveData.revenue ??
    0;

  const net =

    rawNet !== undefined &&
    rawNet !== null &&
    rawNet !== "" &&
    !isNaN(Number(rawNet))

      ? Number(rawNet)

      : Number(rawGross || 0);

  const gross =
    Number(rawGross || 0);

  return {

    rawNet,
    rawGross,
    net,
    gross

  };

}

// =====================================
// 🧠 EXECUTIVE SUMMARY
// =====================================

function getExecutiveSummaryIT(){

  if(!advisor){
    return "";
  }

  if(advisor.verdict === "BUY"){

    return `🟢 Executive Summary

L'operazione presenta indicatori superiori ai benchmark di mercato.

La combinazione di ROI (${roi.toFixed(1)}%), rischio contenuto (${risk}/100) e cashflow positivo (€${Math.round(net).toLocaleString("it-IT")}) colloca l'investimento nella fascia ad alta sostenibilità operativa.

L'attuale scenario di mercato supporta una valutazione favorevole nel medio-lungo termine.`;

  }

  if(advisor.verdict === "WAIT"){

    return `🟡 Executive Summary

L'investimento mostra metriche interessanti ma non ancora pienamente ottimizzate.

Alcuni indicatori risultano positivi, mentre altri richiedono miglioramenti per aumentare competitività e resilienza operativa.

Si consiglia una revisione di pricing, occupazione o struttura dei costi.`;

  }

  return `🔴 Executive Summary

La simulazione evidenzia criticità che riducono l'attrattività dell'investimento.

L'equilibrio tra rendimento, rischio e sostenibilità operativa non appare attualmente ottimale.

Prima di procedere è consigliabile rivedere il modello economico dell'operazione.`;

}

function getExecutiveSummaryEN(){

  if(!advisor){
    return "";
  }

  if(advisor.verdict === "BUY"){

    return `🟢 Executive Summary

The investment shows performance indicators above market benchmarks.

The combination of ROI (${executiveROI.toFixed(1)}%), controlled risk (${risk}/100) and positive cashflow (€${Math.round(net).toLocaleString("en-US")}) places the asset in a highly sustainable operating range.

Current market conditions support a favorable medium to long-term outlook.`;

  }

  if(advisor.verdict === "WAIT"){

    return `🟡 Executive Summary

The investment shows promising metrics but still requires optimization.

Some indicators are positive, while others should be improved to increase competitiveness and operational resilience.

Pricing, occupancy and cost structure should be reviewed.`;

  }

  return `🔴 Executive Summary

The simulation highlights weaknesses that reduce overall investment attractiveness.

The balance between return, risk and operational sustainability is currently below target levels.

A review of the business model is recommended before proceeding.`;

}  

// =====================================
// 🎯 EXECUTIVE ACTION PLAN
// =====================================

function getActionPlanIT(){

  const actions = [];

  if(advisor?.verdict === "BUY"){

    actions.push(
      "Acquisizione consigliata."
    );

  }

  if(roi >= 25){

    actions.push(
      "Performance superiore ai benchmark medi del mercato."
    );

  }

  if(occupancy >= 70){

    actions.push(
      "Domanda potenziale compatibile con una gestione short-rent stabile."
    );

  }

  if(net > 0){

    actions.push(
      "Cashflow positivo e sostenibile."
    );

  }

  if(risk > 60){

    actions.push(
      "Valutare strategie di mitigazione del rischio."
    );

  }

  return actions;

}  

// =====================================
// 🎯 EXECUTIVE ACTION PLAN (EN)
// =====================================

function getActionPlanEN(){

  const actions = [];

  if(advisor?.verdict === "BUY"){

    actions.push(
      "Acquisition is recommended."
    );

  }

  if(roi >= 25){

    actions.push(
      "Performance exceeds average market benchmarks."
    );

  }

  if(occupancy >= 70){

    actions.push(
      "Potential demand supports a stable short-rent business."
    );

  }

  if(net > 0){

    actions.push(
      "Positive and sustainable cashflow."
    );

  }

  if(risk > 60){

    actions.push(
      "Consider risk mitigation strategies."
    );

  }

  return actions;

}  

function getRecommendationsIT(){

  const recommendations = [];

  if(occupancy < 60){

    recommendations.push(
      "• Incrementare l'occupazione tramite pricing dinamico e OTA."
    );

  }

  if(risk > 50){

    recommendations.push(
      "• Ridurre il rischio operativo monitorando costi e volatilità della domanda."
    );

  }

  if(roi < 15){

    recommendations.push(
      "• Ottimizzare ADR e marginalità per migliorare il rendimento."
    );

  }

  if(net > 0){

    recommendations.push(
      "• Mantenere il cashflow positivo monitorando i costi fissi."
    );

  }

  return recommendations;

}

function getRecommendationsEN(){

  const recommendations = [];

  if(occupancy < 60){

    recommendations.push(
      "• Increase occupancy through dynamic pricing and OTA optimization."
    );

  }

  if(risk > 50){

    recommendations.push(
      "• Reduce operational risk by monitoring costs and market volatility."
    );

  }

  if(roi < 15){

    recommendations.push(
      "• Optimize ADR and margins to improve returns."
    );

  }

  if(net > 0){

    if(occupancy >= 80){

      recommendations.push(
        "• Consider gradually increasing rates to improve RevPAR."
      );

    }

    if(roi >= 40){

      recommendations.push(
        "• Validate ROI sustainability through conservative scenarios."
      );

    }

    recommendations.push(
      "• Preserve positive cashflow through cost control."
    );

  }

  return recommendations;

}  

const {

  rawNet,
  rawGross,
  net,
  gross

} = getExecutiveFinancialData();

  let executiveNarrative = null;

if(typeof window.rbGenerateExecutiveNarrative === "function"){

    try{

        executiveNarrative =
            window.rbGenerateExecutiveNarrative({

                executiveContext,

                advisor,

                documentKnowledge,

                language:
                    window.currentLanguage || "it"

            });

    }

    catch(error){

        console.warn(
            "Executive Narrative Error",
            error
        );

    }

}

console.log(
    "🧠 EXECUTIVE NARRATIVE",
    executiveNarrative
);

  const builderPreview =

window.rbBuildExecutiveResponse?.({

    executiveContext,

    advisor,

    documentKnowledge,

    executiveNarrative,

    investmentScore

});

console.log(
    "🧠 EXECUTIVE BUILDER RESULT",
    builderPreview
);

console.log(
    "🧠 EXECUTIVE BUILDER RESULT",
    builderPreview
);
  
// =====================================
// 💰 FINANCIAL DATA
// =====================================

  console.log(
    "💰 EXECUTIVE DEBUG:",
    {
      rawNet,
      rawGross,
      finalNet: net,
      finalGross: gross,
      liveData
    }
  );

  // =====================================
  // 🇮🇹 ITALIANO
  // =====================================

  const executiveIT = [];

  if(availableCapital > 0){

  executiveIT.push(
    `💰 Capitale disponibile: €${availableCapital.toLocaleString("it-IT")}`
  );

}

if(ownedProperties > 0){

  executiveIT.push(
    `🏠 Portafoglio esistente: ${ownedProperties} immobili`
  );

}

if(monthlyCashflowGoal > 0){

  executiveIT.push(
    `🎯 Obiettivo cashflow: €${monthlyCashflowGoal.toLocaleString("it-IT")}/mese`
  );

}

if(targetROI > 0){

  executiveIT.push(
    `📈 ROI target personale: ${targetROI}%`
  );

}

  executiveIT.push(
`🟢 Punti di Forza

📈 ROI: ${executiveROI.toFixed(1)}%
⚠️ Risk Score: ${risk}/100
🏨 Occupazione: ${occupancy}%
💰 Cashflow: €${Math.round(net).toLocaleString("it-IT")}`
);

   if(net > 0){

    executiveIT.push(
      `💰 Profitto netto stimato: €${net.toLocaleString(
  "it-IT",
  {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }
)}`
    );

  }

  if(gross > 0){

    executiveIT.push(
      `🏨 Ricavi annuali: €${gross.toLocaleString(
  "it-IT",
  {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }
)}`
    );

  }

  executiveIT.push(
    `🌍 Mercato analizzato: ${cityLabel}`
  );
  
// =====================================
// 🧠 EXECUTIVE DECISION LAYER
// Investment Grade + Risk Classification
// =====================================

const investmentGrade =

    executiveNarrative?.grade ||

    "N/A";

executiveIT.push(

`🏆 Investment Grade

Valutazione AI: ${investmentGrade}`

);

// =====================================
// 🛡️ EXECUTIVE RISK ASSESSMENT
// =====================================

executiveIT.push(

  executiveNarrative.riskLabelIT

);

// =====================================
// 🧠 EXECUTIVE STRATEGIC VERDICT
// Legacy Summary (temporary)
// =====================================

executiveIT.push(

  executiveNarrative.textIT

);

executiveIT.push(
  `🏨 Occupazione attuale: ${occupancy}%`
);

if(occupancy < 45){

  executiveIT.push(
    "⚠️ Un'occupazione sotto il 45% può compromettere il cashflow reale."
  );

}

// =====================================
// 🧠 EXECUTIVE SIGNALS
// =====================================

if(executiveInsightsIT.length){

  executiveIT.push(

    executiveInsightsIT.join("\n\n")

  );

}

// =====================================
// 🇬🇧 ENGLISH
// =====================================

const executiveEN = [];

if(availableCapital > 0){

  executiveEN.push(
    `💰 Available capital: €${availableCapital.toLocaleString("en-US")}`
  );

}

if(ownedProperties > 0){

  executiveEN.push(
    `🏠 Existing portfolio: ${ownedProperties} properties`
  );

}

if(monthlyCashflowGoal > 0){

  executiveEN.push(
    `🎯 Cashflow target: €${monthlyCashflowGoal.toLocaleString("en-US")}/month`
  );

}

if(targetROI > 0){

  executiveEN.push(
    `📈 Personal ROI target: ${targetROI}%`
  );

}  

// =====================================
// 🧠 ADVISOR VERDICT
// =====================================

const executiveDecision =

window.rbEvaluateInvestment?.({

    roi,
    risk,
    occupancy,

    cashflow: net,

    mortgagePercent:
      rememberedMortgage

}) || advisor;

if(executiveDecision){

  let verdictIT = "";
  let verdictEN = "";

  if(executiveDecision.verdict === "BUY"){

    verdictIT =
      "🟢 VERDETTO AI: INVESTIMENTO CONSIGLIATO";

    verdictEN =
      "🟢 AI VERDICT: RECOMMENDED INVESTMENT";

  }

  else if(executiveDecision.verdict === "WAIT"){

    verdictIT =
      "🟡 VERDETTO AI: ATTENDERE O OTTIMIZZARE";

    verdictEN =
      "🟡 AI VERDICT: WAIT OR OPTIMIZE";

  }

  else{

    verdictIT =
      "🔴 VERDETTO AI: INVESTIMENTO NON CONSIGLIATO";

    verdictEN =
      "🔴 AI VERDICT: NOT RECOMMENDED";

  }

  executiveIT.unshift(verdictIT);

  if(executiveDecision.confidence){

    executiveIT.unshift(
      `🎯 Affidabilità: ${executiveDecision.confidence}%`
    );

  }

  if(executiveDecision.score){

    executiveIT.unshift(
      `📊 Score AI: ${executiveDecision.score}/100`
    );

  }

  executiveEN.unshift(verdictEN);

  if(executiveDecision.confidence){

    executiveEN.unshift(
      `🎯 Confidence: ${executiveDecision.confidence}%`
    );

  }

  if(executiveDecision.score){

    executiveEN.unshift(
      `📊 AI Score: ${executiveDecision.score}/100`
    );

  }

}

executiveEN.push(

`🟢 Key Strengths

📈 ROI: ${executiveROI.toFixed(1)}%
⚠️ Risk Score: ${risk}/100
🏨 Occupancy: ${occupancy}%
💰 Cashflow: €${Math.round(net).toLocaleString("en-US")}`

);

if(net > 0){

  executiveEN.push(
    `💰 Estimated net profit: €${net.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }
    )}`
  );

}

if(gross > 0){

  executiveEN.push(
    `🏨 Annual revenue: €${gross.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }
    )}`
  );

}

executiveEN.push(
  `🌍 Market analyzed: ${cityLabel}`
);

  executiveEN.push(

`🏆 Investment Grade

AI Rating: ${investmentGrade}`

);

// =====================================
// 🛡️ EXECUTIVE RISK ASSESSMENT
// =====================================

executiveEN.push(

  executiveNarrative.riskLabelEN

);
  
// =====================================
// 🔥 AI CONCLUSION
// =====================================

executiveEN.push(

  executiveNarrative.textEN

);

executiveEN.push(
  `🏨 Current occupancy: ${occupancy}%`
);

if(occupancy < 45){

  executiveEN.push(
    "⚠️ Occupancy below 45% may compromise real cashflow."
  );

}
// =====================================
// 🧠 AI SIGNAL INSIGHTS
// =====================================

if(executiveInsightsEN.length){

  executiveEN.push(

    executiveInsightsEN.join("\n\n")

  );

}

// =====================================
// 🧠 EXECUTIVE MEMORY (LIVE DATA)
// =====================================

const executiveMemory = {

  ...memory,

  roi,

  risk,

  occupancy,

  cashflow:
    liveData.net ??
    liveData.cashflow ??
    net ??
    0,

  revenue:
    liveData.gross ??
    liveData.revenue ??
    gross ??
    0,

expenses:
  Number(
    liveData.expenses ??
    liveData.costs ??
    liveData.totalExpenses ??
    analysisData?.expenses ??
    window.lastAnalysisData?.expenses ??
    0
  ),

  mortgagePercent:
    rememberedMortgage ??
    0,

  city:
    rememberedCity ??
    city ??
    liveData.city ??
    liveData.realCity ??
    "roma"

};

console.log(
  "🧠 EXECUTIVE MEMORY SENT:",
  executiveMemory
);
  

  
// =====================================
// 🧠 REASONING ENGINE
// =====================================

if(reasoningIT.length){

  executiveIT.push(

    reasoningIT.join("\n\n")

  );

}
// =====================================
// 🧠 ADVISOR REASONS
// =====================================

if(advisor?.reasonsIT?.length){

  executiveIT.push(

`🧠 Motivazioni AI

${advisor.reasonsIT.join("\n")}`

  );

}

const actionPlanIT =
  getActionPlanIT();

if(actionPlanIT.length){

  executiveIT.push(

`🎯 Piano d'Azione AI

${actionPlanIT
  .map(item => `• ${item}`)
  .join("\n")}`

  );

}

// =====================================
// 📋 OPERATIONAL RECOMMENDATIONS IT
// =====================================

const recommendationsIT =
  getRecommendationsIT();

if(recommendationsIT.length){

  executiveIT.push(

`📋 Raccomandazioni Operative AI

${recommendationsIT.join("\n")}`

  );

}

// =====================================
// 🧠 AI REASONS EN
// =====================================

if(advisor?.reasonsEN?.length){

  executiveEN.push(

`🧠 AI Reasons

${advisor.reasonsEN.join("\n")}`

  );

}

// =====================================
// 🎯 ACTION PLAN EN
// =====================================

const actionPlanEN =
  getActionPlanEN();

if(actionPlanEN.length){

  executiveEN.push(

`🎯 AI Action Plan

${actionPlanEN
  .map(item => `• ${item}`)
  .join("\n")}`

  );

}

// =====================================
// 📋 OPERATIONAL RECOMMENDATIONS EN
// =====================================

const recommendationsEN =
  getRecommendationsEN();

if(recommendationsEN.length){

  executiveEN.push(

`📋 AI Operational Recommendations

${recommendationsEN.join("\n")}`

  );

}

if(reasoningEN?.length){

  executiveEN.push(
    reasoningEN.join("\n\n")
  );

}

// =====================================
// 📝 FINAL EXECUTIVE RESPONSE
// =====================================

console.log(
  "🚨 EXECUTIVE DEBUG",
  {
    builderPreview,
    executiveIT,
    executiveEN
  }
);

pushResponseBlock({

  priority: 10,

  textIT:
    builderPreview?.textIT ||
    executiveIT.join("\n\n"),

  textEN:
    builderPreview?.textEN ||
    executiveEN.join("\n\n")

});

response.textIT =
  builderPreview?.textIT ||
  executiveIT.join("\n\n");

response.textEN =
  builderPreview?.textEN ||
  executiveEN.join("\n\n");

console.log(
  "🚨 FINAL EXECUTIVE RESPONSE TEXT",
  {
    textIT: response.textIT,
    textEN: response.textEN
  }
);

return applyExecutiveFormatter(
  response
);

  }

// ===========================================
// 💡 STRATEGY RESPONSE
// ===========================================

else if(

  intent.intent === "investment_strategy" ||

  intent.intent === "investment_advisor"

){

  response.type =
    "strategy";

  response.confidence =
    0.96;

  console.log(
    "🚀 STRATEGY BLOCK EXECUTED",
    {
      intent: intent.intent,
      type: response.type
    }
  );

  console.log(
    "🚀 STRATEGY BLOCK ENTERED"
  );

response.textIT = "### TEST STRATEGY ###";
response.textEN = "### TEST STRATEGY ###";

console.log("FORCED TEST", response);

return response;
  
  console.log(
    "🧠 STRATEGY INPUT",
    {
      intent,
      roi,
      risk,
      occupancy,
      liveData
    }
  );

  // =====================================
  // 🇮🇹 ITALIANO
  // =====================================

  const strategyIT = [

    "🧠 Analisi strategica AI completata."

  ];

  if(roi > 0){

    strategyIT.push(
      `📊 ROI: ${roi.toFixed(1)}%`
    );

  }

  if(occupancy > 0){

    strategyIT.push(
      `🏨 Occupazione: ${occupancy}%`
    );

  }

  if(risk > 0){

    strategyIT.push(
      `⚠️ Risk: ${risk}/100`
    );

  }

  strategyIT.push(

    roi >= 10 && risk <= 40

    ? "💡 L'investimento mostra metriche molto competitive."

    : "💡 L'investimento richiede ottimizzazione operativa."

  );

  response.textIT =
    strategyIT.join("\n\n");

  // =====================================
  // 🇬🇧 ENGLISH
  // =====================================

  const strategyEN = [

    "🧠 AI strategic analysis completed."

  ];

  if(roi > 0){

    strategyEN.push(
      `📊 ROI: ${roi.toFixed(1)}%`
    );

  }

  if(occupancy > 0){

    strategyEN.push(
      `🏨 Occupancy: ${occupancy}%`
    );

  }

  if(risk > 0){

    strategyEN.push(
      `⚠️ Risk: ${risk}/100`
    );

  }

  strategyEN.push(

    roi >= 10 && risk <= 40

    ? "💡 The investment shows highly competitive metrics."

    : "💡 The investment requires operational optimization."

  );

  response.textEN =
    strategyEN.join("\n\n");

  console.log(
    "🧠 STRATEGY EN",
    response.textEN
  );

  console.log(
    "✅ STRATEGY RETURN",
    {
      type: response.type,
      textIT: response.textIT,
      textEN: response.textEN
    }
  );

  console.log(
  "✅ STRATEGY RESPONSE",
  response
);

  return applyExecutiveFormatter(
    response
  );

}

// ===========================================
// 🏢 PORTFOLIO GROWTH ADVISOR
// ===========================================

  else if(
  intent.intent === "portfolio_analysis"
){

  response.type =
    "portfolio_analysis";

  response.confidence =
    0.99;

// =====================================
// 📊 PORTFOLIO HISTORY ANALYSIS
// =====================================

const portfolioHistory =
  investmentHistory || [];

const {

  totalSimulations,

  averageROI,

  bestSimulation,

  bestROI,

  bestCity,

  averageCashflow

} = getPortfolioMetrics(
  portfolioHistory
);
    
const properties =

  Number(

    entities.ownedProperties ||

    memory.ownedProperties ||

    portfolioHistory.length ||

    0

  );

  let levelIT =
    "👤 Principiante";

  let levelEN =
    "👤 Beginner";

  let complexityIT =
    "🟢 Bassa";

  let complexityEN =
    "🟢 Low";

  let pmsIT =
    "Non necessario";

  let pmsEN =
    "Not required";

  let growthIT =
    "1-2 immobili";

  let growthEN =
    "1-2 properties";

  if(properties >= 3){

    levelIT =
      "🏠 Host Professionale";

    levelEN =
      "🏠 Professional Host";

    complexityIT =
      "🟡 Media";

    complexityEN =
      "🟡 Medium";

    pmsIT =
      "Consigliato";

    pmsEN =
      "Recommended";

    growthIT =
      "3-5 immobili";

    growthEN =
      "3-5 properties";

  }

  if(properties >= 10){

    levelIT =
      "🏢 Operatore Multi Property";

    levelEN =
      "🏢 Multi Property Operator";

    complexityIT =
      "🔴 Elevata";

    complexityEN =
      "🔴 High";

    pmsIT =
      "Fondamentale";

    pmsEN =
      "Essential";

    growthIT =
      "10+ immobili";

    growthEN =
      "10+ properties";

  }

  response.textIT =

`🏢 Portfolio Advisor

📊 Portafoglio attuale

${properties} immobili

🏆 Livello

${levelIT}

⚙️ Complessità operativa

${complexityIT}

🏨 PMS

${pmsIT}

🤖 Automazioni

${properties >= 5
? "Consigliate"
: "Facoltative"}

📈 Potenziale crescita

${growthIT}

🧠 Strategia AI

${
  properties <= 1

  ? "Concentrati sulla redditività della prima unità prima di espanderti."

  : properties <= 5

  ? "Standardizza processi e pricing per facilitare la crescita."

  : "Automazione e controllo KPI diventano essenziali per scalare."
}`;

  response.textEN =

`🏢 Portfolio Advisor

📊 Current Portfolio

${properties} properties

🏆 Level

${levelEN}

⚙️ Operational Complexity

${complexityEN}

🏨 PMS

${pmsEN}

🤖 Automations

${properties >= 5
? "Recommended"
: "Optional"}

📈 Growth Potential

${growthEN}

🧠 AI Strategy

${
  properties <= 1

  ? "Focus on maximizing profitability before scaling."

  : properties <= 5

  ? "Standardize operations and pricing before expansion."

  : "Automation and KPI monitoring become critical for scaling."
}`;

  return response;

}

else if(
  intent.intent === "portfolio_growth"
){

  response.type =
    "portfolio_growth";

  response.confidence =
    0.99;

// =====================================
// 📊 PORTFOLIO HISTORY ANALYSIS
// =====================================

const portfolioHistory =
  investmentHistory || [];

const {

  totalSimulations,

  averageROI,

  bestSimulation,

  bestROI,

  bestCity,

  averageCashflow

} = getPortfolioMetrics(
  portfolioHistory
);
  
  const availableCapital =

    Number(

      entities.availableCapital ||

      memory?.availableCapital ||

      window.rbChatMemory
        ?.availableCapital ||

      0

    );

  const monthlyCashflowGoal =

    Number(

      entities.monthlyCashflowGoal ||

      memory?.monthlyCashflowGoal ||

      window.rbChatMemory
        ?.monthlyCashflowGoal ||

      0

    );

  const estimatedPurchasePower =

    availableCapital > 0

      ? Math.round(
          availableCapital / 0.20
        )

      : 0;

  const conservativeProperties =

    availableCapital >= 30000

      ? 1

      : 0;

  const aggressiveProperties =

    availableCapital >= 150000

      ? 4

      : availableCapital >= 100000

      ? 3

      : availableCapital >= 50000

      ? 2

      : availableCapital >= 20000

      ? 1

      : 0;

  const estimatedProperties =
    aggressiveProperties;

  const growthProfileIT =

    aggressiveProperties >= 3

      ? "🚀 Profilo orientato alla costruzione di un portafoglio multi-immobile."

      : aggressiveProperties === 2

      ? "📈 Profilo compatibile con una crescita progressiva del portafoglio."

      : "🏠 Strategia focalizzata sull'acquisizione della prima unità redditizia.";

  const growthProfileEN =

    aggressiveProperties >= 3

      ? "🚀 Profile oriented toward building a multi-property portfolio."

      : aggressiveProperties === 2

      ? "📈 Profile compatible with progressive portfolio growth."

      : "🏠 Strategy focused on acquiring the first profitable property.";

  // =====================================
  // 🇮🇹
  // =====================================

  response.textIT =

`🏢 Piano di Crescita Immobiliare Personalizzato

📊 Simulazioni analizzate

${totalSimulations}

🏆 Miglior città rilevata

${bestCity}

📈 ROI medio storico

${averageROI.toFixed(1)}%

🚀 Miglior ROI registrato

${bestROI.toFixed(1)}%

💰 Cashflow medio storico

€${Math.round(
averageCashflow
).toLocaleString("it-IT")}

💰 Capitale disponibile

€${availableCapital.toLocaleString("it-IT")}

🏦 Potere di acquisto stimato

€${estimatedPurchasePower.toLocaleString("it-IT")}

(ipotizzando un anticipo medio del 20%)

🏠 Capacità di espansione

Strategia prudente:
${conservativeProperties} immobile

Strategia dinamica:
${aggressiveProperties} immobili

🏠 Immobili acquistabili stimati

${estimatedProperties} immobili

💵 Cashflow obiettivo

€${monthlyCashflowGoal.toLocaleString("it-IT")} / mese

🎯 Valutazione AI

${growthProfileIT}

L'obiettivo appare realistico se mantieni un ROI sostenibile, controlli il rischio operativo e reinvesti progressivamente i profitti generati.

📈 Strategia consigliata

Fase 1
• Acquisizione di immobili con cashflow positivo
• Validazione del modello operativo
• Controllo di costi e occupazione

Fase 2
• Reinvestimento dei profitti
• Crescita graduale del portafoglio
• Ottimizzazione ADR e occupazione

Fase 3
• Espansione verso un portafoglio strutturato
• Standardizzazione delle operazioni
• Automazione della gestione

🎯 KPI da monitorare

• ROI
• Cashflow
• Occupazione
• ADR
• Rischio operativo

🚀 Consiglio del Consulente AI

Con €${availableCapital.toLocaleString("it-IT")} disponibili, il capitale attuale consente realisticamente l'acquisizione iniziale di circa ${aggressiveProperties} immobili utilizzando una leva finanziaria sostenibile e una crescita progressiva del portafoglio.`;

  // =====================================
  // 🇬🇧
  // =====================================

  response.textEN =

`🏢 Personalized Real Estate Growth Plan

📊 Simulations Analyzed

${totalSimulations}

🏆 Best Performing City

${bestCity}

📈 Historical Average ROI

${averageROI.toFixed(1)}%

🚀 Highest Recorded ROI

${bestROI.toFixed(1)}%

💰 Historical Average Cashflow

€${Math.round(
averageCashflow
).toLocaleString("en-US")}

💰 Available Capital

€${availableCapital.toLocaleString("en-US")}

🏦 Estimated Purchase Power

€${estimatedPurchasePower.toLocaleString("en-US")}

(assuming a 20% average down payment)

🏠 Expansion Capacity

Conservative Strategy:
${conservativeProperties} property

Growth Strategy:
${aggressiveProperties} properties

🏠 Estimated Purchasable Properties

${estimatedProperties} properties

💵 Cashflow Target

€${monthlyCashflowGoal.toLocaleString("en-US")} / month

🎯 AI Assessment

${growthProfileEN}

The objective appears realistic if sustainable ROI is maintained, operational risk is controlled and profits are continuously reinvested.

📈 Recommended Strategy

Phase 1
• Acquire positive cashflow properties
• Validate the operating model
• Control costs and occupancy

Phase 2
• Reinvest profits
• Gradually expand the portfolio
• Optimize ADR and occupancy

Phase 3
• Expand into a structured portfolio
• Standardize operations
• Automate management

🎯 KPIs To Monitor

• ROI
• Cashflow
• Occupancy
• ADR
• Operational Risk

🚀 AI Consultant Advice

With €${availableCapital.toLocaleString("en-US")} available, your current capital could realistically support the initial acquisition of approximately ${aggressiveProperties} properties using sustainable leverage and progressive portfolio growth.`;

}

// ===========================================
// 📊 REPORT INTERPRETATION
// Executive Report Advisor
// ===========================================

else if(
  intent.intent === "report_interpretation"
){

  response.type =
    "report_interpretation";

  response.confidence =
    0.99;

  if(!hasAnalysis){

  response.textIT =

`📊 Non trovo una simulazione da interpretare.

Per ottenere una lettura executive:

• esegui una simulazione
• genera il report
• chiedimi "Interpretami il report"

Ti mostrerò:

• punti di forza
• criticità
• cashflow
• rischio
• sostenibilità
• strategia consigliata`;

  response.textEN =

`📊 I cannot find a simulation to interpret.

To get an executive review:

• run a simulation
• generate the report
• ask "Interpret the report"

I will explain:

• strengths
• weaknesses
• cashflow
• risk
• sustainability
• recommended strategy`;

  return response;

}

  const reportROI =

  Number(

    analysisData?.visualROI ??

    window.lastAnalysisData?.visualROI ??

    analysisData?.roi ??

    window.lastAnalysisData?.roi ??

    roi ??

    0

  );

  const reportRisk =
    Number(risk || 0);

  const reportOccupancy =
    Number(occupancy || 0);

  const reportCashflow =
    Number(
      analysisData?.net ||
      analysisData?.annualProfit ||
      analysisData?.cashflow ||
      0
    );

  const reportEquity =

  Number(

    analysisData?.equity ??

    window.lastAnalysisData?.equity ??

    0

  );

const paybackYears =

  reportCashflow > 0

    ? reportEquity / reportCashflow

    : null;

const investmentClass =

  investmentScore?.labelIT ||

  "Standard";

const investmentScoreValue =

  investmentScore?.score ||

  0;

  let executiveVerdictIT =
  "🟡 DA VALUTARE";

let executiveVerdictEN =
  "🟡 TO BE REVIEWED";

if(advisor){

  if(advisor.verdict === "BUY"){

    executiveVerdictIT =
      "🟢 INVESTIMENTO CONSIGLIATO";

    executiveVerdictEN =
      "🟢 RECOMMENDED INVESTMENT";

  }

  else if(advisor.verdict === "WAIT"){

    executiveVerdictIT =
      "🟡 OTTIMIZZARE PRIMA DI PROCEDERE";

    executiveVerdictEN =
      "🟡 OPTIMIZE BEFORE PROCEEDING";

  }

  else{

    executiveVerdictIT =
      "🔴 INVESTIMENTO NON CONSIGLIATO";

    executiveVerdictEN =
      "🔴 NOT RECOMMENDED";

  }

}

  const insightsIT = [];

  if(reportROI >= 20){

    insightsIT.push(
      "📈 Il ROI risulta superiore alla media della maggior parte degli investimenti immobiliari tradizionali."
    );

  }else if(reportROI >= 10){

    insightsIT.push(
      "📈 Il ROI è competitivo ma presenta ancora margini di miglioramento."
    );

  }else{

    insightsIT.push(
      "📈 Il ROI attuale suggerisce opportunità di ottimizzazione."
    );

  }

  if(reportRisk <= 30 && reportRisk > 0){

    insightsIT.push(
      "⚠️ Il profilo di rischio appare contenuto."
    );

  }else if(reportRisk > 60){

    insightsIT.push(
      "⚠️ Il rischio operativo richiede particolare attenzione."
    );

  }

  if(reportCashflow > 0){

    insightsIT.push(
      "💰 Il cashflow è positivo e contribuisce alla crescita dell'investimento."
    );

  }

  response.textIT =

`📊 Interpretazione Executive del Report

🏆 Classe Investimento

${investmentClass}
(${investmentScoreValue}/100)

🎯 Verdetto AI

${executiveVerdictIT}

📊 Score AI

${investmentScoreValue}/100

ROI: ${reportROI.toFixed(1)}%
Occupazione: ${reportOccupancy}%
Rischio: ${reportRisk}/100

💰 Cashflow annuo

€${Math.round(reportCashflow).toLocaleString("it-IT")}

💳 Capitale investito

€${Math.round(reportEquity).toLocaleString("it-IT")}

${
  paybackYears
  ? `⏳ Recupero capitale stimato

${paybackYears.toFixed(1)} anni`
  : ""
}

${insightsIT.join("\n\n")}

🎯 Punto di forza principale

L'investimento genera un rapporto molto favorevole tra capitale investito e profitto prodotto.

⚠️ Elemento da monitorare

Verificare nel tempo la sostenibilità dell'occupazione e dell'ADR per mantenere gli attuali livelli di redditività.

🚀 Strategia consigliata

Se i risultati rimangono stabili, l'investimento può essere considerato una buona base per una futura espansione del portafoglio immobiliare.`;

  const insightsEN = [];

  if(reportROI >= 20){

    insightsEN.push(
      "📈 ROI is above the average of most traditional real estate investments."
    );

  }else if(reportROI >= 10){

    insightsEN.push(
      "📈 ROI is competitive but still offers room for improvement."
    );

  }else{

    insightsEN.push(
      "📈 Current ROI suggests optimization opportunities."
    );

  }

  if(reportOccupancy >= 70){

    insightsEN.push(
      "🏨 Occupancy supports a sustainable operation."
    );

  }

  if(reportRisk <= 30 && reportRisk > 0){

    insightsEN.push(
      "⚠️ Risk profile appears controlled."
    );

  }else if(reportRisk > 60){

    insightsEN.push(
      "⚠️ Operational risk requires close monitoring."
    );

  }

  if(reportCashflow > 0){

    insightsEN.push(
      "💰 Positive cashflow supports long-term growth."
    );

  }

  response.textEN =

`📊 Executive Report Interpretation

🏆 Investment Class

${investmentClass}
(${investmentScoreValue}/100)

🎯 AI Verdict

${executiveVerdictEN}

📊 AI Score

${investmentScoreValue}/100

ROI: ${reportROI.toFixed(1)}%
Occupancy: ${reportOccupancy}%
Risk: ${reportRisk}/100

💰 Annual Cashflow

€${Math.round(reportCashflow).toLocaleString("en-US")}

💳 Invested Capital

€${Math.round(reportEquity).toLocaleString("en-US")}

${
  paybackYears
  ? `⏳ Estimated Capital Recovery

${paybackYears.toFixed(1)} years`
  : ""
}

${insightsEN.join("\n\n")}

🎯 Main Strength

The investment generates a very favorable relationship between invested capital and produced profit.

⚠️ Key Risk To Monitor

Monitor occupancy and ADR sustainability over time.

🚀 Recommended Strategy

If results remain stable, this investment can become a solid foundation for future portfolio expansion.`;

}  

// ===========================================
// 📈 IMPROVEMENT ADVISOR
// Silicon Valley Portfolio Optimization
// ===========================================

else if(
  intent.intent === "improvement_advisor"
){

  response.type =
    "improvement_advisor";

  response.confidence =
    0.99;

  const advisorScore =
  advisor?.score || 0;

const advisorVerdict =
  advisor?.verdict || "WAIT";

const advisorVerdictIT =

  advisorVerdict === "BUY"
    ? "🟢 Investimento Consigliato"

  : advisorVerdict === "WAIT"
    ? "🟡 Ottimizzare Prima di Procedere"

  : "🔴 Investimento Non Consigliato";

const advisorVerdictEN =

  advisorVerdict === "BUY"
    ? "🟢 Recommended Investment"

  : advisorVerdict === "WAIT"
    ? "🟡 Optimize Before Proceeding"

  : "🔴 Not Recommended";  

const pmsRevenue =
  pmsData?.revenue || 0;

const pmsADR =
  pmsData?.adr || 0;

const pmsBookings =
  pmsData?.bookings || 0;

const pmsOccupancy =
  Number(
    pmsData?.occupancy || 0
  );

const adrPlus10 =

  Math.round(
    pmsADR * 1.10
  );

const estimatedRevenueGain =

  Math.round(
    pmsRevenue * 0.10
  );

const occupancyTo80 =

  Math.max(
    0,
    80 - pmsOccupancy
  );  

 const cashflow =

  Number(

    liveData?.net ??

    liveData?.annualProfit ??

    liveData?.cashflow ??

    0

  ); 

  const prioritiesIT = [];
  const prioritiesEN = [];

  if(occupancy < 70){

    prioritiesIT.push(
      "🏨 Aumentare l'occupazione tramite pricing dinamico e maggiore visibilità OTA."
    );

    prioritiesEN.push(
      "🏨 Increase occupancy through dynamic pricing and stronger OTA visibility."
    );

  }

  if(roi < 20){

  prioritiesIT.push(
    "📈 Incrementare ADR e ottimizzare le tariffe per superare il 20% di ROI."
  );

  prioritiesEN.push(
    "📈 Increase ADR and optimize pricing to exceed 20% ROI."
  );

}

  if(occupancy < 75){

  prioritiesIT.push(
    "🏨 Portare l'occupazione verso il 75-80% per aumentare redditività e stabilità."
  );

  prioritiesEN.push(
    "🏨 Increase occupancy towards 75-80% to improve profitability and stability."
  );

}

  if(risk > 35){

  prioritiesIT.push(
    "⚠️ Ridurre il rischio operativo e la dipendenza dalla stagionalità."
  );

  prioritiesEN.push(
    "⚠️ Reduce operational risk and seasonal dependency."
  );

}

  if(cashflow > 0){

  prioritiesIT.push(
    "💰 Il cashflow è positivo: valuta la crescita del portfolio."
  );

  prioritiesEN.push(
    "💰 Cashflow is positive: consider portfolio expansion."
  );

}

  if(
  pmsBookings > 0 &&
  pmsADR > 0
){

  prioritiesIT.push(
`📊 PMS Insight

ADR attuale: €${pmsADR}

Se l'ADR salisse a €${adrPlus10}
(+10%)

i ricavi potrebbero aumentare
di circa €${estimatedRevenueGain.toLocaleString("it-IT")}
a parità di occupazione.`
  );

  prioritiesEN.push(
`📊 PMS Insight

Current ADR: €${pmsADR}

If ADR increased to €${adrPlus10}
(+10%)

revenue could increase by approximately
€${estimatedRevenueGain.toLocaleString("en-US")}
with the same occupancy.`
  );

}

  if(
  pmsOccupancy > 0 &&
  pmsOccupancy < 80
){

  prioritiesIT.push(
`🏨 Occupazione PMS

Occupazione attuale:
${pmsOccupancy}%

Per raggiungere l'obiettivo AI
dell'80% manca circa
${occupancyTo80}% di occupazione aggiuntiva.`
  );

  prioritiesEN.push(
`🏨 PMS Occupancy

Current occupancy:
${pmsOccupancy}%

To reach the AI target
of 80%, approximately
${occupancyTo80}% additional occupancy is needed.`
  );

}

  prioritiesIT.push(
    `📊 PMS: ADR attuale €${pmsADR}. Valutare pricing dinamico per aumentare il ricavo medio.`
  );

  prioritiesEN.push(
    `📊 PMS: Current ADR €${pmsADR}. Consider dynamic pricing to increase average revenue.`
  );

  if(pmsRevenue > 0){

  prioritiesIT.push(
    `💰 PMS: ricavi registrati €${Math.round(pmsRevenue).toLocaleString("it-IT")}. Analizza i periodi migliori per aumentare la redditività.`
  );

  prioritiesEN.push(
    `💰 PMS: recorded revenue €${Math.round(pmsRevenue).toLocaleString("en-US")}. Analyze top-performing periods to increase profitability.`
  );

}

  if(
  liveData.net &&
  Number(liveData.net) < 0
){

  prioritiesIT.push(
    "💸 Ripristinare un cashflow positivo prima di pianificare espansioni."
  );

  prioritiesEN.push(
    "💸 Restore positive cashflow before planning expansion."
  );

}

  if(!prioritiesIT.length){

  prioritiesIT.push(
    "🚀 Le metriche risultano già molto competitive. Concentrati su crescita e scalabilità."
  );

  prioritiesEN.push(
    "🚀 Metrics are already highly competitive. Focus on growth and scalability."
  );

}

  response.textIT = `

📈 AI Growth Advisor

📊 Situazione Attuale

• ROI: ${roi.toFixed(1)}%
• Rischio: ${risk}/100
• Occupazione: ${occupancy}%
• Cashflow: €${Math.round(cashflow).toLocaleString("it-IT")}
• AI Score: ${advisorScore}/100
• Verdetto: ${advisorVerdictIT}

🎯 Priorità Strategiche

${prioritiesIT.join("\n\n")}

🚀 Prossimo Livello

L'investimento risulta sostenibile. L'obiettivo principale è aumentare rendimento, scalabilità e resilienza operativa.

`;

  response.textEN = `

📈 AI Growth Advisor

📊 Current Situation

• ROI: ${roi.toFixed(1)}%
• Risk: ${risk}/100
• Occupancy: ${occupancy}%
• Cashflow: €${Math.round(cashflow).toLocaleString("en-US")}
• AI Score: ${advisorScore}/100
• Verdict: ${advisorVerdictEN}

🎯 Strategic Priorities

${prioritiesEN.join("\n\n")}

🚀 Next Level

The investment is sustainable. The main objective is to improve profitability, scalability and operational resilience.

`;

  return response;

}  

// ===========================================
// 👋 GREETING RESPONSE
// ===========================================

else if(
  intent.intent === "greeting"
){

  response.type =
    "greeting";

  response.confidence =
    1;

  response.textIT =

`👋 Ciao!

Posso aiutarti ad analizzare:

• ROI
• cashflow
• rischio
• mutui
• benchmark città
• sostenibilità B&B`;

  response.textEN =

`👋 Hi!

I can help you analyze:

• ROI
• cashflow
• risk
• mortgages
• city benchmarks
• B&B sustainability`;

}
  // ===========================================
  // 🎓 EDUCATIONAL RESPONSE
  // ===========================================

else if(
  intent.intent === "education"
){

  response.type = "education";

  response.confidence = 0.95;

  const msg =
    String(message).toLowerCase();

// ===========================================
// 🎓 ENTITY KNOWLEDGE ROUTING
// ===========================================

const knowledge =

  entities.knowledgeData ||

  window.rbKnowledgeBase?.[
    entities.knowledge
  ] ||

  null;
// ===========================================
// 📚 KNOWLEDGE / EDUCATION ROUTING
// ===========================================

if(knowledge){

  response.textIT =

    knowledge?.text?.it ||

    knowledge?.textIT ||

    `${knowledge?.aiSummaryIT || ""}

${knowledge?.aiInsightIT || ""}` ||

    "⚠️ Nessuna spiegazione disponibile.";

  response.textEN =

    knowledge?.text?.en ||

    knowledge?.textEN ||

    `${knowledge?.aiSummaryEN || ""}

${knowledge?.aiInsightEN || ""}` ||

    "⚠️ No explanation available.";

}

else{

  response.textIT =

`🎓 Posso spiegarti:

• ROI
• cashflow
• rischio
• DSCR
• occupazione
• sostenibilità
• mutui`;

  response.textEN =

`🎓 I can explain:

• ROI
• cashflow
• risk
• DSCR
• occupancy
• sustainability
• mortgages`;

}
  
}

// ===========================================
// 📚 KNOWLEDGE FALLBACK RESPONSE
// ===========================================

else if(

  ![
    "comparison",
    "portfolio_growth",
    "market_comparison",
    "report_interpretation",
    "pms_advisor"
  ].includes(
    intent.intent
  )

  &&

  !response.textIT

  &&

  (
    entities.knowledgeData ||
    entities.knowledge
  )

){

  response.type =
    "knowledge";

  response.confidence =
    0.92;

  const knowledge =

    entities.knowledgeData ||

    window.rbKnowledgeBase?.[
      entities.knowledge
    ] ||

    null;

  if(knowledge){

    response.textIT =

      knowledge?.text?.it ||

      knowledge?.textIT ||

      `

${knowledge?.aiTitleIT || ""}

${knowledge?.aiSummaryIT || ""}

${knowledge?.aiInsightIT || ""}

${knowledge?.warningIT || ""}

      `.trim();

    response.textEN =

      knowledge?.text?.en ||

      knowledge?.textEN ||

      `

${knowledge?.aiTitleEN || ""}

${knowledge?.aiSummaryEN || ""}

${knowledge?.aiInsightEN || ""}

${knowledge?.warningEN || ""}

      `.trim();

  }

}

// ===========================================
// 🧠 HUMAN CONTEXT RESPONSE
// ===========================================

else if(

  ![
    "roi_analysis",
    "risk_analysis",
    "comparison",
    "mortgage_analysis",
    "cashflow_analysis",
    "market_analysis",
    "investment_executive",
    "executive_analysis"
  ].includes(intent.intent)

  &&

  (
    entities.amount ||
    entities.price ||
    entities.mortgage ||
    entities.mortgagePercent ||
    (
      allowMarketContext &&
      entities.city
    )
  )

){

  response.type =
    "human_context";

  response.confidence =
    0.90;

  const humanIT = [];

  const humanEN = [];

  // =====================================
  // 💰 CAPITAL / PRICE
  // =====================================

  if(entities.amount || entities.price){

    const amount =

      Number(
        entities.amount ||
        entities.price ||
        0
      );

    if(amount > 0){

      humanIT.push(

`💰 Perfetto.

Terrò conto di un budget iniziale di €${amount.toLocaleString("it-IT")} per le prossime analisi.`

      );

      humanEN.push(

`💰 Perfect.

I will consider an initial budget of €${amount.toLocaleString("en-US")} for future analyses.`

      );

    }

  }

  // =====================================
  // 🌍 CITY
  // =====================================

  if(
  allowMarketContext &&
  entities.city
  ){

    const cityName =

      window.rbCapitalize?.(
        entities.city
      ) ||

      entities.city;

    humanIT.push(

`🌍 Mercato salvato:
${cityName}.`

    );

    humanEN.push(

`🌍 Market saved:
${cityName}.`

    );

  }

  // =====================================
  // 🏦 MORTGAGE
  // =====================================

  if(entities.mortgage){

    humanIT.push(

      entities.mortgagePercent

      ? `🏦 Considererò un mutuo al ${entities.mortgagePercent}%.`

      : "🏦 Considererò anche la leva finanziaria nelle prossime simulazioni."

    );

    humanEN.push(

      entities.mortgagePercent

      ? `🏦 I will consider a ${entities.mortgagePercent}% mortgage.`

      : "🏦 Financial leverage will also be considered in future simulations."

    );

  }

  // =====================================
  // 💬 FINAL
  // =====================================

  response.textIT =
    humanIT.join("\n\n");

  response.textEN =
    humanEN.join("\n\n");

}

  // ===========================================
  // 🤖 DEFAULT RESPONSE
  // ===========================================

  else{

    response.textIT =

`🤖 Posso aiutarti ad analizzare:

• ROI
• cashflow
• rischio
• sostenibilità
• mutui
• benchmark short-rent`;

    response.textEN =

`🤖 I can help analyze:

• ROI
• cashflow
• risk
• sustainability
• mortgages
• short-rent benchmarks`;

  }

// ===========================================
// 🧠 INVESTOR PROFILE ADAPTATION
// ===========================================

if(investorProfile?.aggressiveInvestor){

  responseBlocksIT.push({
    type: "profile",
    priority: 82,
    text:
      "🚀 Il tuo profilo mostra una tolleranza elevata al rischio e orientamento a crescita aggressiva."
  });

  responseBlocksEN.push({
    type: "profile",
    priority: 82,
    text:
      "🚀 Your profile shows high risk tolerance and aggressive growth orientation."
  });

}

if(investorProfile?.riskTolerance === "low"){

  responseBlocksIT.push({
    type: "profile",
    priority: 82,
    text:
      "🛡️ Il tuo profilo privilegia investimenti più stabili e sostenibili."
  });

  responseBlocksEN.push({
    type: "profile",
    priority: 82,
    text:
      "🛡️ Your profile prioritizes safer and more sustainable investments."
  });

}

if(investorProfile?.leverageBehavior === "aggressive"){

  responseBlocksIT.push({
    type: "profile",
    priority: 83,
    text:
      "🏦 L'AI rileva preferenza per utilizzo intenso della leva finanziaria."
  });

  responseBlocksEN.push({
    type: "profile",
    priority: 83,
    text:
      "🏦 AI detects preference for aggressive leverage usage."
  });

}

if(investorProfile?.targetROI){

  responseBlocksIT.push({
    type: "profile",
    priority: 84,
    text:
      `🎯 Target ROI rilevato: ${investorProfile.targetROI}%`
  });

  responseBlocksEN.push({
    type: "profile",
    priority: 84,
    text:
      `🎯 Detected ROI target: ${investorProfile.targetROI}%`
  });

}
// ===========================================
// 🧠 FINAL RESPONSE BLOCK MERGE
// ===========================================

if(
  responseBlocksIT.length &&
  response.type === "executive"
){

  response.textIT = [

    response.textIT,

    ...responseBlocksIT
      .sort((a,b) => b.priority - a.priority)
      .map(block => block.text)

  ]
  .filter(Boolean)
  .join("\n\n");

}

if(
  responseBlocksEN.length &&
  response.type === "executive"
){

  response.textEN = [

    response.textEN,

    ...responseBlocksEN
      .sort((a,b) => b.priority - a.priority)
      .map(block => block.text)

  ]
  .filter(Boolean)
  .join("\n\n");

}

// ===========================================
// 💡 CONTEXTUAL FOLLOWUP ENGINE
// ===========================================

response.suggestionsIT = [];
response.suggestionsEN = [];

// ===========================================
// 📈 ROI FOLLOWUPS
// ===========================================

if(response.type === "roi"){

  if(roi >= 20){

    response.suggestionsIT.push(
      "Confrontare benchmark città",
      "Analizzare sostenibilità lungo termine",
      "Simulare scenario conservativo"
    );

    response.suggestionsEN.push(
      "Compare city benchmarks",
      "Analyze long-term sustainability",
      "Simulate conservative scenario"
    );

  }

  else if(roi >= 10){

    response.suggestionsIT.push(
      "Ottimizzare occupazione",
      "Aumentare ADR medio",
      "Ridurre costi operativi"
    );

    response.suggestionsEN.push(
      "Optimize occupancy",
      "Increase average ADR",
      "Reduce operational costs"
    );

  }

  else{

    response.suggestionsIT.push(
      "Ridurre rischio operativo",
      "Analizzare cashflow reale",
      "Valutare un'altra città"
    );

    response.suggestionsEN.push(
      "Reduce operational risk",
      "Analyze real cashflow",
      "Evaluate another city"
    );

  }

}

// ===========================================
// ⚠️ RISK FOLLOWUPS
// ===========================================

if(response.type === "risk"){

  if(risk >= 70){

    response.suggestionsIT.push(
      "Ridurre leva finanziaria",
      "Analizzare scenario prudente",
      "Ridurre dipendenza occupazione"
    );

    response.suggestionsEN.push(
      "Reduce financial leverage",
      "Analyze conservative scenario",
      "Reduce occupancy dependency"
    );

  }

  else{

    response.suggestionsIT.push(
      "Confrontare altri mercati",
      "Ottimizzare cashflow",
      "Analizzare mutuo"
    );

    response.suggestionsEN.push(
      "Compare alternative markets",
      "Optimize cashflow",
      "Analyze mortgage impact"
    );

  }

}

// ===========================================
// 🏦 MORTGAGE FOLLOWUPS
// ===========================================

if(response.type === "mortgage"){

  response.suggestionsIT.push(
    "Simulare LTV differente",
    "Analizzare sostenibilità rata",
    "Ridurre rischio finanziario"
  );

  response.suggestionsEN.push(
    "Simulate different LTV",
    "Analyze payment sustainability",
    "Reduce financial risk"
  );

}

// ===========================================
// 🧠 EXECUTIVE FOLLOWUPS
// ===========================================

if(response.type === "executive"){

  response.suggestionsIT.push(
    "Confrontare benchmark reali",
    "Analizzare scenario pessimistico",
    "Ottimizzare redditività"
  );

  response.suggestionsEN.push(
    "Compare real benchmarks",
    "Analyze pessimistic scenario",
    "Optimize profitability"
  );

}

// ===========================================
// 🧠 AI SIGNALS
// ===========================================

response.signals = [

  ...response.signals,

  ...(window.rbGenerateAISignals?.({

    roi,
    risk,
    occupancy

  }) || [])

];

// ===========================================
// 🧠 DEBUG
// ===========================================

console.log(
  "🧠 RESPONSE ENGINE:",
  response
);

  console.log(
  "🧪 GENERATE RESPONSE END",
  response
);

return response;

};

}  


// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 RESPONSE ENGINE READY"
);
