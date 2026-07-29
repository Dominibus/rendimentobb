// ===============================================
// 🧠 RENDIMENTOBB – RESPONSE ENGINE 1.0
// Silicon Valley AI Orchestrator
// ===============================================

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

  aiSignals = [],

  brain = null,

  executiveBrain = null,

  conversationContext = {},

  documentKnowledge = {}

} = {}){

  
  console.log(
  "🔥 RESPONSE ENGINE CALLED",
  {
    intent,
    message
  }
);

// ===============================================
// 📄 PDF INTENT NORMALIZATION
// Preserve the original document request
// ===============================================

if(
  intent?.intent === "pdf_analysis"
){

  intent = {
    ...intent,

    originalIntent:
      "pdf_analysis",

    intent:
      "report_interpretation"
  };

}

// ===============================================
// 🧠 CONVERSATION CONTEXT
// ===============================================

const {

    goal = "generic",

    topic = "generic",

    isFollowUp = false,

    isShortQuestion = false,

    hasAnalysis: conversationHasAnalysis = false,

    contextConfidence = 0,

    originalMessage = message

} = conversationContext || {};

console.log(
    "🧠 CONVERSATION CONTEXT",
    {
        goal,
        topic,
        isFollowUp,
        isShortQuestion,
        conversationHasAnalysis,
        contextConfidence,
        originalMessage
    }
);

// ===============================================
// 🧠 EXECUTIVE BRAIN
// ===============================================

const executiveInsight =

    executiveBrain?.insight ||

    null;

const executiveAnalysis =

    executiveBrain?.analysis ||

    null;

// ===============================================
// 🧠 EXECUTIVE AI DATA
// ===============================================

const executiveAI =

    executiveBrain?.executiveAI ||

    {};

const executiveLevel =

    executiveBrain?.executiveLevel ||

    "standard";

const executiveExplainability =

    executiveBrain?.explainability ||

    {};

const executiveActionPlan =

    executiveBrain?.actionPlan ||

    [];

console.log(
    "🧠 EXECUTIVE INSIGHT",
    executiveInsight
);

// ===============================================
// 🧠 EXECUTIVE DECISION
// ===============================================

const executiveDecision =

    executiveInsight?.decision ||

    executiveAnalysis?.executiveDecision ||

    advisor?.verdict ||

    "WAIT";

const strongestPoint =

    executiveInsight?.strongestPoint ||

    executiveAnalysis?.strongestPoint ||

    "";

const weakestPoint =

    executiveInsight?.weakestPoint ||

    executiveAnalysis?.weakestPoint ||

    "";

const hasCriticalIssue =

    executiveInsight?.hasCriticalIssue ||

    false;

const hasStrongInvestment =

    executiveInsight?.hasStrongInvestment ||

    false;

console.log(
    "🧠 EXECUTIVE DECISION",
    {
        executiveDecision,
        strongestPoint,
        weakestPoint,
        hasCriticalIssue,
        hasStrongInvestment
    }
);

// ===============================================
// 🧠 EXECUTIVE AI STATE
// Single Source of Truth
// ===============================================

const executiveState = {

    decision:
        executiveAI?.decision ||
        executiveDecision,

    summaryIT:
        executiveAI?.summaryIT ||
        "",

    summaryEN:
        executiveAI?.summaryEN ||
        "",

    prioritiesIT:
        executiveAI?.prioritiesIT ||
        [],

    prioritiesEN:
        executiveAI?.prioritiesEN ||
        [],

    actionPlan:
        executiveActionPlan,

    explainability:
        executiveExplainability,

    level:
        executiveLevel

};

console.log(
    "🧠 EXECUTIVE STATE",
    executiveState
);
  
  // ===========================================
  // 🧠 RESPONSE OBJECT
  // ===========================================
  
  let builderOwnsExecutiveResponse = false;

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
// 🔐 FREE ADVANCED ANALYSIS ACCESS
// ===========================================

const responseAccess =

  window.getUserAccess?.() ||

  window.RB_USER ||

  {};

const canSeeAdvancedAnalysis = Boolean(

  responseAccess.canSeeFullAnalysis ||

  responseAccess.isInvestor ||

  responseAccess.isPro ||

  responseAccess.isAdmin

);

const advancedAnalysisIntents = [

  "roi_analysis",

  "risk_analysis",

  "cashflow_analysis",

  "investment_strategy",

  "investment_advisor",

  "investment_executive",

  "executive_analysis",

  "improvement_advisor",

  "portfolio_analysis",

  "portfolio_growth"

];

if(

  !canSeeAdvancedAnalysis &&

  advancedAnalysisIntents.includes(
    intent?.intent
  )

){

  response.type =
    "analysis_locked";

  response.confidence =
    1;

  response.signals.push(
    "advanced_analysis_locked"
  );

  response.textIT =

`🔒 L’analisi completa della simulazione è riservata ai piani Investor e PRO.

Puoi continuare a visualizzare l’anteprima disponibile nel simulatore.

Con l’upgrade puoi sbloccare:

• ROI reale
• cashflow e profitto netto
• rischio operativo
• Investment Score e Verdict AI
• strategia di ottimizzazione personalizzata`;

  response.textEN =

`🔒 The complete simulation analysis is available with Investor and PRO plans.

You can continue viewing the preview available in the simulator.

Upgrade to unlock:

• real ROI
• cashflow and net profit
• operational risk
• Investment Score and AI Verdict
• personalized optimization strategy`;

  return response;

}

  // ===========================================
  // 📊 SAFE DATA
  // ===========================================

const liveData = {

  ...(window.rbChatbotData || {}),

  ...(window.rbChatbotLive || {}),

  ...(window.rbInvestmentMemory || {}),

  ...(window.lastAnalysisData || {}),

  ...(analysisData || {})

};

// =====================================
// 🧠 EXECUTIVE CONTEXT
// =====================================

const executiveContext = {

  liveData,

  analysisData:
    analysisData || {},

  entities:
    entities || {},

  memory:
    memory || {},

  advisor:
    advisor || null,

  documents: {

  activeDocument:
    documentKnowledge?.activeDocument ||
    null,

  activeReport:
    documentKnowledge?.activeReport ||
    window.lastExecutiveReport ||
    null,

  uploadedReports:
    documentKnowledge?.uploadedReports ||
    [],

library:
  documentKnowledge?.uploadedReports ||
  (
    Array.isArray(window.rbDocumentLibrary)
      ? window.rbDocumentLibrary
      : []
  )

    }  

};

console.log(
  "🧠 EXECUTIVE CONTEXT:",
  executiveContext
);  
  
// =====================================
// 📚 DOCUMENT KNOWLEDGE
// =====================================

documentKnowledge ??= {};

if(
  typeof window.rbAnalyzeDocuments ===
  "function"
){

  try{

    documentKnowledge =
      window.rbAnalyzeDocuments(
        executiveContext
      ) || {};

// =====================================
// 🧠 DOCUMENT REASONING
// =====================================

let documentReasoning = {};

if(
    typeof window.rbGenerateDocumentReasoning ===
    "function"
){

    try{

        documentReasoning =
            window.rbGenerateDocumentReasoning({

                executiveContext,

                advisor:
                    advisor || {},

                documentKnowledge,

                language:
                    window.currentLanguage ||
                    "it"

            }) || {};

    }

    catch(error){

        console.warn(
            "Document Reasoning Error",
            error
        );

    }

}

console.log(
    "🧠 DOCUMENT REASONING:",
    documentReasoning
);
    

  }
  catch(error){

    console.warn(
      "Document Knowledge Error",
      error
    );

  }

}

console.log(
  "📚 DOCUMENT KNOWLEDGE:",
  documentKnowledge
);

// =====================================
// 🧠 EXECUTIVE BRAIN V2
// =====================================

executiveBrain = executiveBrain || null;

if(
    typeof window.rbGenerateExecutiveBrainV2 ===
    "function"
){

    try{

        executiveBrain =
            window.rbGenerateExecutiveBrainV2({

                executiveContext,

                advisor:
                    advisor || {},

                documentKnowledge,

                language:
                    window.currentLanguage ||
                    "it"

            }) || null;

    }

    catch(error){

        console.warn(
            "Executive Brain Error",
            error
        );

    }

}

console.log(
    "🧠 EXECUTIVE BRAIN:",
    executiveBrain
);

// =====================================
// 🧠 EXECUTIVE NARRATIVE
// =====================================

let executiveNarrative = null;

if(
  typeof window.rbGenerateExecutiveNarrative ===
  "function"
){

  try{

    executiveNarrative =
      window.rbGenerateExecutiveNarrative({

        executiveContext,

        advisor:
          advisor || {},

        documentKnowledge,

        language:
          window.currentLanguage ||
          "it"

      }) || null;

  }
  catch(error){

    console.warn(
      "Executive Narrative Error",
      error
    );

  }

}

console.log(
  "🧠 EXECUTIVE NARRATIVE:",
  executiveNarrative
);  
  
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

const roi =
  Number(

    analysisData?.roi ??

    liveData.roi ??

    liveData.visualROI ??

    liveData.safeROI ??

    window.rbChatbotLive?.roi ??

    window.rbChatbotData?.roi ??

    liveData.realROI ??

    0

  );

const executiveROI =
  Number(

    liveData.realROI ??

    window.lastAnalysisData?.realROI ??

    liveData.safeROI ??

    window.lastAnalysisData?.safeROI ??

    roi ??

    0

  );

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

const canonicalInvestmentScore =
  Number(liveData.investmentScore);

const hasCanonicalInvestmentScore =
  liveData.investmentScore !== null &&
  liveData.investmentScore !== undefined &&
  Number.isFinite(canonicalInvestmentScore);

const investmentScore =

  hasCanonicalInvestmentScore

    ? {

        score:
          canonicalInvestmentScore,

        verdict:
          liveData.verdict ||
          advisor?.verdict ||
          "WAIT"

      }

    : (

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

        null

      );

console.log(
  "🧠 INVESTMENT SCORE:",
  investmentScore
);

  
// ===========================================
// 🎯 CANONICAL INVESTMENT RESULT
// ===========================================

const canonicalInvestment =
    investmentScore ||
    window.lastInvestmentScore ||
    {};

const canonicalVerdict =
    canonicalInvestment.verdict ||
    advisor?.verdict ||
    "WAIT";

const canonicalScore =
    Number(
        canonicalInvestment.score ??
        advisor?.score ??
        0
    );

// ===========================================
// 🧠 MEMORY CONTEXT
// ===========================================

const rememberedBudget =

  entities.price ||

  entities.budget ||

  memory.lastBudget ||

  memory.lastPropertyPrice ||

  liveData.propertyPrice ||

  liveData.price ||

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
// 🧠 AI BRAIN
// =====================================

let brainData = brain || {};

if(
  typeof window.rbProcessBrain ===
  "function"
){

  try{

brainData =
    brainData || window.rbProcessBrain({

        intent,

        entities,

        memory,

        investorProfile,

        score:
            investmentScore,

        advisor,

        reasoning:
            documentReasoning,

        documentKnowledge,

        executiveContext

    }) || {};

  }

  catch(error){

    console.warn(
      "AI Brain Error",
      error
    );

  }

}

console.log(
  "🧠 AI BRAIN:",
  brainData
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
// 🧠 EXECUTIVE REASONING ENGINE
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

// =====================================
// 🧠 CONVERSATION ANALYSIS
// =====================================

const hasConversationAnalysis =
    hasAnalysis || conversationHasAnalysis;

// =====================================
// 🧠 CONVERSATIONAL FOLLOW-UP
// =====================================

const conversationalFollowUp =

    isFollowUp &&

    hasConversationAnalysis &&
    
    isShortQuestion;  

// ===========================================
// 🏠 HOME QUICK SIMULATION
// ===========================================

const isHomeSimulation =

  window.location.pathname === "/" ||

  window.location.pathname === "/index.html";

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

📈 ROI reale simulato:
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

📈 Simulated real ROI:
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
      return response;
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

    return response;

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

  return response;

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

📈 ROI reale:
${roi.toFixed(1)}%`;

      response.textEN =

`✅ Risk appears relatively low.

📊 Risk score:
${risk}/100

🏨 Occupancy:
${occupancy}%

${riskInsightEN}

📈 Real ROI:
${roi.toFixed(1)}%`;

    }

    console.log(
      "⚠️ RISK RESPONSE CREATED",
      response
    );

    return response;

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

    // =====================================
  // 🧠 MORTGAGE WHAT-IF COMPARISON
  // =====================================

  const whatIf =
    analysisData?.whatIfScenario ||
    liveData?.whatIfScenario ||
    null;

  if(
    whatIf?.type === "mortgage" &&
    Number.isFinite(Number(whatIf.originalMortgagePercent)) &&
    Number.isFinite(Number(whatIf.requestedMortgagePercent))
  ){

    const originalMortgagePercent =
      Number(whatIf.originalMortgagePercent);

    const requestedMortgagePercent =
      Number(whatIf.requestedMortgagePercent);

    const originalLoanAmount =
      Number(whatIf.originalLoanAmount || 0);

    const newLoanAmount =
      Number(whatIf.loanAmount || liveData.loanAmount || 0);

    const originalEquity =
      Number(whatIf.originalEquity || 0);

    const newEquity =
      Number(whatIf.equity || liveData.equity || 0);

    const originalROI =
      Number(whatIf.originalROI || 0);

    const newROI =
      Number(liveData.roi || 0);

    const originalRealROI =
      Number(whatIf.originalRealROI || 0);

    const newRealROI =
      Number(liveData.realROI || 0);

    const originalCashflow =
      Number(whatIf.originalCashflow || 0);

    const newCashflow =
      Number(
        liveData.net ??
        liveData.cashflow ??
        0
      );

    const originalScore =
      Number(whatIf.originalInvestmentScore || 0);

    const newScore =
      Number(liveData.investmentScore || 0);

    const equityDelta =
      newEquity - originalEquity;

    const cashflowDelta =
      newCashflow - originalCashflow;

    const roiDelta =
      newROI - originalROI;

    const scoreDelta =
      newScore - originalScore;

    const fmtEUR_IT = value =>
      `€${Math.round(value).toLocaleString("it-IT")}`;

    const fmtEUR_EN = value =>
      `€${Math.round(value).toLocaleString("en-US")}`;

    const fmtPct = value =>
      `${Number(value).toFixed(1)}%`;

    const cashflowDirectionIT =
      cashflowDelta > 0
        ? `migliora il cashflow annuo di circa ${fmtEUR_IT(cashflowDelta)}`
        : cashflowDelta < 0
        ? `riduce il cashflow annuo di circa ${fmtEUR_IT(Math.abs(cashflowDelta))}`
        : "mantiene sostanzialmente invariato il cashflow annuo";

    const cashflowDirectionEN =
      cashflowDelta > 0
        ? `improves annual cashflow by approximately ${fmtEUR_EN(cashflowDelta)}`
        : cashflowDelta < 0
        ? `reduces annual cashflow by approximately ${fmtEUR_EN(Math.abs(cashflowDelta))}`
        : "keeps annual cashflow substantially unchanged";

    const interpretationIT =

      requestedMortgagePercent < originalMortgagePercent

      ? `La riduzione della leva richiede più capitale proprio${
          equityDelta > 0
            ? ` (${fmtEUR_IT(equityDelta)} aggiuntivi)`
            : ""
        } e ${
          roiDelta < 0
            ? "riduce il rendimento sull'equity"
            : "modifica il rendimento sull'equity"
        }, ma ${
          cashflowDelta > 0
            ? "aumenta il cashflow e rende la struttura finanziaria più resiliente"
            : "riduce l'esposizione finanziaria e rende la struttura più prudente"
        }. Non è semplicemente migliore o peggiore: privilegia stabilità e minore leva rispetto all'efficienza del capitale.`

      : requestedMortgagePercent > originalMortgagePercent

      ? `L'aumento della leva riduce il capitale proprio necessario${
          equityDelta < 0
            ? ` di ${fmtEUR_IT(Math.abs(equityDelta))}`
            : ""
        } e può aumentare l'efficienza dell'equity, ma espone maggiormente l'investimento al servizio del debito e alle variazioni operative. È una struttura più aggressiva rispetto allo scenario originale.`

      : `La leva richiesta coincide con quella dello scenario originale: non emerge una variazione strutturale del finanziamento.`;

    const interpretationEN =

      requestedMortgagePercent < originalMortgagePercent

      ? `Reducing leverage requires more equity${
          equityDelta > 0
            ? ` (${fmtEUR_EN(equityDelta)} additional capital)`
            : ""
        } and ${
          roiDelta < 0
            ? "reduces the return on equity"
            : "changes the return on equity"
        }, but ${
          cashflowDelta > 0
            ? "increases cashflow and improves financial resilience"
            : "reduces financial exposure and creates a more conservative structure"
        }. It is not simply better or worse: it prioritizes stability and lower leverage over capital efficiency.`

      : requestedMortgagePercent > originalMortgagePercent

      ? `Increasing leverage reduces the equity required${
          equityDelta < 0
            ? ` by ${fmtEUR_EN(Math.abs(equityDelta))}`
            : ""
        } and may improve equity efficiency, but increases exposure to debt service and operating fluctuations. This is a more aggressive structure than the original scenario.`

      : `The requested leverage matches the original scenario, so there is no structural financing change.`;

    response.signals.push(
      "mortgage_what_if"
    );

    response.metadata.whatIfScenario =
      whatIf;

    response.textIT =

`🏦 Scenario mutuo ${requestedMortgagePercent}%

Rispetto alla struttura originale con leva al ${originalMortgagePercent}%, il nuovo scenario ${
  equityDelta > 0
    ? `richiede ${fmtEUR_IT(equityDelta)} di capitale aggiuntivo e ${cashflowDirectionIT}`
    : equityDelta < 0
    ? `libera ${fmtEUR_IT(Math.abs(equityDelta))} di capitale e ${cashflowDirectionIT}`
    : cashflowDirectionIT
}.

📊 Scenario originale → nuovo scenario

Mutuo: ${originalMortgagePercent}% → ${requestedMortgagePercent}%
Equity: ${fmtEUR_IT(originalEquity)} → ${fmtEUR_IT(newEquity)}
Finanziamento: ${fmtEUR_IT(originalLoanAmount)} → ${fmtEUR_IT(newLoanAmount)}
ROI equity: ${fmtPct(originalROI)} → ${fmtPct(newROI)}
ROI immobile: ${fmtPct(originalRealROI)} → ${fmtPct(newRealROI)}
Cashflow: ${fmtEUR_IT(originalCashflow)} → ${fmtEUR_IT(newCashflow)}
Investment Score: ${originalScore} → ${newScore}

🧠 Interpretazione AI

${interpretationIT}`;

    response.textEN =

`🏦 ${requestedMortgagePercent}% Mortgage Scenario

Compared with the original ${originalMortgagePercent}% leverage structure, the new scenario ${
  equityDelta > 0
    ? `requires ${fmtEUR_EN(equityDelta)} of additional equity and ${cashflowDirectionEN}`
    : equityDelta < 0
    ? `releases ${fmtEUR_EN(Math.abs(equityDelta))} of equity and ${cashflowDirectionEN}`
    : cashflowDirectionEN
}.

📊 Original scenario → new scenario

Mortgage: ${originalMortgagePercent}% → ${requestedMortgagePercent}%
Equity: ${fmtEUR_EN(originalEquity)} → ${fmtEUR_EN(newEquity)}
Loan: ${fmtEUR_EN(originalLoanAmount)} → ${fmtEUR_EN(newLoanAmount)}
Equity ROI: ${fmtPct(originalROI)} → ${fmtPct(newROI)}
Property ROI: ${fmtPct(originalRealROI)} → ${fmtPct(newRealROI)}
Cashflow: ${fmtEUR_EN(originalCashflow)} → ${fmtEUR_EN(newCashflow)}
Investment Score: ${originalScore} → ${newScore}

🧠 AI Interpretation

${interpretationEN}`;

    console.log(
      "🏦 MORTGAGE WHAT-IF RESPONSE CREATED",
      {
        originalMortgagePercent,
        requestedMortgagePercent,
        originalROI,
        newROI,
        originalRealROI,
        newRealROI,
        originalCashflow,
        newCashflow,
        originalScore,
        newScore
      }
    );

    return response;

  }

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

  return response;

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

  let performanceIT =
    "🟡 Performance regolari";

  let performanceEN =
    "🟡 Stable performance";

  if(occupancyPMS >= 90){

    performanceIT =
      "🟢 Ottime performance";

    performanceEN =
      "🟢 Excellent performance";

  }

  else if(occupancyPMS < 70){

    performanceIT =
      "🔴 Occupazione migliorabile";

    performanceEN =
      "🔴 Occupancy can be improved";

  }

  let adviceIT =

    "💡 Le performance risultano equilibrate.";

  let adviceEN =

    "💡 Performance appears balanced.";

  if(occupancyPMS >= 95){

    adviceIT =
      "💡 L'occupazione è molto alta. Potresti aumentare gradualmente le tariffe per incrementare il profitto.";

    adviceEN =
      "💡 Occupancy is very high. Consider gradually increasing rates to improve profitability.";

  }

  else if(occupancyPMS < 70){

    adviceIT =
      "💡 Valuta promozioni, ottimizzazione prezzi e maggiore visibilità sui portali.";

    adviceEN =
      "💡 Consider promotions, pricing optimization and better OTA visibility.";

  }

  response.textIT =

`🏨 PMS Performance Dashboard

${performanceIT}

📌 Proprietà: ${properties}

📅 Prenotazioni: ${bookings}

👥 Ospiti: ${guests}

💰 Ricavi: €${revenue.toLocaleString("it-IT")}

🏨 Occupazione: ${occupancyPMS}%

💵 ADR: €${adr}

${adviceIT}

🧠 Il PMS sta monitorando in tempo reale le performance operative della struttura.`;

  response.textEN =

`🏨 PMS Performance Dashboard

${performanceEN}

📌 Properties: ${properties}

📅 Bookings: ${bookings}

👥 Guests: ${guests}

💰 Revenue: €${revenue.toLocaleString("en-US")}

🏨 Occupancy: ${occupancyPMS}%

💵 ADR: €${adr}

${adviceEN}

🧠 The PMS is actively monitoring property performance in real time.`;

  console.log(
    "🔥 PMS RESPONSE GENERATED:",
    response
  );

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
  Number(

    current.realROI ??

    current.visualROI ??

    current.roi ??

    0

  );

const previousROI =
  Number(

    previous.realROI ??

    previous.visualROI ??

    previous.roi ??

    0

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

    return Number(
      sim.visualROI ??
      sim.realROI ??
      sim.roi ??
      0
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

    const history = investmentHistory || [];

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

  // =====================================
// 📊 GLOBAL COMPARISON FALLBACK
// =====================================

if(

  !response.textIT &&
  !response.textEN

){

  const history =

    investmentHistory?.length

    ? investmentHistory

    : (

        memory?.investmentHistory ||

        window.rbChatMemory?.investmentHistory ||

        []

      );

  console.log(
    "🔥 GLOBAL FALLBACK HISTORY:",
    history
  );

  if(history.length >= 2){

    const current =
      history[history.length - 1];

    const previous =
      history[history.length - 2];

    response.textIT =

`📊 Confronto simulazioni AI

━━━━━━━━━━━━━━━

💰 Simulazione precedente

📈 ROI:
${Number(
  previous.roi || previous.realROI || 0
).toFixed(1)}%

💵 Profitto:
€${Number(
  previous.net || 0
).toLocaleString("it-IT")}

━━━━━━━━━━━━━━━

💰 Simulazione attuale

📈 ROI:
${Number(
  current.roi || current.realROI || 0
).toFixed(1)}%

💵 Profitto:
€${Number(
  current.net || 0
).toLocaleString("it-IT")}`;

    response.textEN =

`📊 AI Simulation Comparison

━━━━━━━━━━━━━━━

💰 Previous Simulation

📈 ROI:
${Number(
  previous.roi || previous.realROI || 0
).toFixed(1)}%

💵 Profit:
€${Number(
  previous.net || 0
).toLocaleString("en-US")}

━━━━━━━━━━━━━━━

💰 Current Simulation

📈 ROI:
${Number(
  current.roi || current.realROI || 0
).toFixed(1)}%

💵 Profit:
€${Number(
  current.net || 0
).toLocaleString("en-US")}`;

  }

  else{

    response.textIT =
      "⚠️ Servono almeno due simulazioni per il confronto.";

    response.textEN =
      "⚠️ At least two simulations are required for comparison.";

  }

}  

return response;

}

// ===========================================
// 🌍 MARKET RESPONSE
// ===========================================

if(

  !response.__LOCKED &&

  response.type !== "comparison" &&

  intent.intent === "market_analysis"

){

    response.type =
      "market";

    response.confidence =
      0.91;

    if(market){

            const marketRiskKey = String(
        market.risk ?? ""
      )
      .trim()
      .toLowerCase();

      const marketRiskIT = {

        low: "basso",
        basso: "basso",

        medium: "moderato",
        moderate: "moderato",
        medio: "moderato",
        moderato: "moderato",

        high: "alto",
        alto: "alto"

      }[marketRiskKey] || market.risk;

      const marketRiskEN = {

        low: "low",
        basso: "low",

        medium: "moderate",
        moderate: "moderate",
        medio: "moderate",
        moderato: "moderate",

        high: "high",
        alto: "high"

      }[marketRiskKey] || market.risk;

      response.textIT =

`🌍 Analisi mercato ${cityLabel}

📈 ROI medio:
${market.avgROI}

🏨 Occupazione:
${market.occupancy}

⚠️ Rischio:
${marketRiskIT}`;

      response.textEN =

`🌍 ${cityLabel} market analysis

📈 Average ROI:
${market.avgROI}

🏨 Occupancy:
${market.occupancy}

⚠️ Risk:
${marketRiskEN}`;

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

    const roi = Number(
      item.realROI ??
      item.visualROI ??
      item.roi ??
      0
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

    history.sort(
      (a,b)=>

      Number(
        b.realROI ??
        b.visualROI ??
        b.roi ??
        0
      )

      -

      Number(
        a.realROI ??
        a.visualROI ??
        a.roi ??
        0
      )

    )[0];

  const bestROI =

    Number(
      best.realROI ??
      best.visualROI ??
      best.roi ??
      0
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
  // 🧪 WHAT-IF SCENARIO CONTEXT
  // =====================================

  const executiveWhatIf =
    analysisData?.whatIfScenario ||
    liveData?.whatIfScenario ||
    null;

  const isExecutiveWhatIf =
    Boolean(
      executiveWhatIf &&
      executiveWhatIf.type
    );

  if(isExecutiveWhatIf){

    response.signals.push(
      "what_if_scenario"
    );

    response.metadata.whatIfScenario =
      executiveWhatIf;

    console.log(
      "🧪 EXECUTIVE WHAT-IF DETECTED",
      executiveWhatIf
    );

  }

  // =====================================
  // 💸 MONTHLY COSTS WHAT-IF RESPONSE
  // =====================================

  if(
    isExecutiveWhatIf &&
    executiveWhatIf.type === "monthly_costs"
  ){

    const originalCosts =
      Number(
        executiveWhatIf.originalMonthlyCosts ?? 0
      );

    const scenarioCosts =
      Number(
        executiveWhatIf.scenarioMonthlyCosts ??
        executiveWhatIf.requestedMonthlyCosts ??
        0
      );

    const originalROI =
      Number(
        executiveWhatIf.originalROI ?? 0
      );

    const scenarioROI =
      Number(
        executiveWhatIf.scenarioROI ??
        analysisData?.roi ??
        0
      );

    const originalRealROI =
      Number(
        executiveWhatIf.originalRealROI ?? 0
      );

    const scenarioRealROI =
      Number(
        executiveWhatIf.scenarioRealROI ??
        analysisData?.realROI ??
        0
      );

    const originalCashflow =
      Number(
        executiveWhatIf.originalCashflow ?? 0
      );

    const scenarioCashflow =
      Number(
        executiveWhatIf.scenarioCashflow ??
        analysisData?.cashflow ??
        analysisData?.net ??
        0
      );

    const originalScore =
      Number(
        executiveWhatIf.originalInvestmentScore ?? 0
      );

    const scenarioScore =
      Number(
        executiveWhatIf.scenarioInvestmentScore ??
        analysisData?.investmentScore ??
        0
      );

    const roiDelta =
      scenarioROI - originalROI;

    const realROIDelta =
      scenarioRealROI - originalRealROI;

    const cashflowDelta =
      scenarioCashflow - originalCashflow;

    const verdict =
      advisor?.verdict ||
      analysisData?.verdict ||
      "WAIT";

    const formatEUR =
      value =>
        Number(value || 0).toLocaleString(
          "it-IT",
          {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0
          }
        );

    const formatPct =
      value =>
        `${Number(value || 0).toFixed(2)}%`;
    
    response.type =
      "executive_what_if";

    response.confidence =
      0.99;

    response.textIT =
`🧪 SCENARIO WHAT-IF — COSTI OPERATIVI

Riducendo i costi mensili da ${formatEUR(originalCosts)} a ${formatEUR(scenarioCosts)}, lo scenario migliora la redditività dell'investimento.

📊 Impatto economico

ROI equity: ${formatPct(originalROI)} → ${formatPct(scenarioROI)} (${roiDelta >= 0 ? "+" : ""}${formatPct(roiDelta)})

ROI immobile: ${formatPct(originalRealROI)} → ${formatPct(scenarioRealROI)} (${realROIDelta >= 0 ? "+" : ""}${formatPct(realROIDelta)})

Cashflow annuo: ${formatEUR(originalCashflow)} → ${formatEUR(scenarioCashflow)} (${cashflowDelta >= 0 ? "+" : ""}${formatEUR(cashflowDelta)})

Investment Score: ${originalScore}/100 → ${scenarioScore}/100

🎯 Valutazione AI

Il taglio dei costi aumenta il cashflow annuo di ${formatEUR(cashflowDelta)} e porta il ROI equity a ${formatPct(scenarioROI)}.

Il verdetto resta ${verdict}.`;

    response.textEN =
`🧪 WHAT-IF SCENARIO — OPERATING COSTS

Reducing monthly operating costs from ${formatEUR(originalCosts)} to ${formatEUR(scenarioCosts)} improves the investment profitability.

📊 Financial impact

Equity ROI: ${formatPct(originalROI)} → ${formatPct(scenarioROI)} (${roiDelta >= 0 ? "+" : ""}${formatPct(roiDelta)})

Property ROI: ${formatPct(originalRealROI)} → ${formatPct(scenarioRealROI)} (${realROIDelta >= 0 ? "+" : ""}${formatPct(realROIDelta)})

Annual cashflow: ${formatEUR(originalCashflow)} → ${formatEUR(scenarioCashflow)} (${cashflowDelta >= 0 ? "+" : ""}${formatEUR(cashflowDelta)})

Investment Score: ${originalScore}/100 → ${scenarioScore}/100

🎯 AI Assessment

The cost reduction increases annual cashflow by ${formatEUR(cashflowDelta)} and raises equity ROI to ${formatPct(scenarioROI)}.

The verdict remains ${verdict}.`;

    response.suggestionsIT = [
      "Simula costi ancora più bassi",
      "Prova un'occupazione diversa",
      "Modifica il prezzo medio notte"
    ];

    response.suggestionsEN = [
      "Simulate lower operating costs",
      "Try a different occupancy rate",
      "Change the average nightly rate"
    ];

    console.log(
      "💸 EXECUTIVE COSTS WHAT-IF RESPONSE",
      {
        originalCosts,
        scenarioCosts,
        originalROI,
        scenarioROI,
        originalCashflow,
        scenarioCashflow,
        originalScore,
        scenarioScore
      }
    );

    return response;

  }

  // =====================================
  // 🧪 COMBINED WHAT-IF RESPONSE
  // =====================================

  if(
    isExecutiveWhatIf &&
    executiveWhatIf.type === "combined"
  ){

    const originalMortgagePercent =
      Number(
        executiveWhatIf.originalMortgagePercent ?? 0
      );

    const scenarioMortgagePercent =
      Number(
        executiveWhatIf.requestedMortgagePercent ??
        executiveWhatIf.scenarioMortgagePercent ??
        analysisData?.mortgagePercent ??
        0
      );

    const originalOccupancy =
      Number(
        executiveWhatIf.originalOccupancy ?? 0
      );

    const scenarioOccupancy =
      Number(
        executiveWhatIf.requestedOccupancy ??
        executiveWhatIf.scenarioOccupancy ??
        analysisData?.occupancy ??
        0
      );

    const originalADR =
      Number(
        executiveWhatIf.originalADR ??
        executiveWhatIf.originalNightPrice ??
        0
      );

    const scenarioADR =
      Number(
        executiveWhatIf.requestedADR ??
        executiveWhatIf.scenarioADR ??
        analysisData?.priceNight ??
        analysisData?.nightly ??
        0
      );

    const originalEquity =
      Number(
        executiveWhatIf.originalEquity ?? 0
      );

    const scenarioEquity =
      Number(
        executiveWhatIf.equity ??
        executiveWhatIf.scenarioEquity ??
        analysisData?.equity ??
        0
      );

    const originalLoan =
      Number(
        executiveWhatIf.originalLoanAmount ?? 0
      );

    const scenarioLoan =
      Number(
        executiveWhatIf.loanAmount ??
        executiveWhatIf.scenarioLoanAmount ??
        analysisData?.loanAmount ??
        0
      );

    const originalROI =
      Number(
        executiveWhatIf.originalROI ?? 0
      );

    const scenarioROI =
      Number(
        executiveWhatIf.scenarioROI ??
        analysisData?.roi ??
        0
      );

    const originalRealROI =
      Number(
        executiveWhatIf.originalRealROI ?? 0
      );

    const scenarioRealROI =
      Number(
        executiveWhatIf.scenarioRealROI ??
        analysisData?.realROI ??
        0
      );

    const originalCashflow =
      Number(
        executiveWhatIf.originalCashflow ?? 0
      );

    const scenarioCashflow =
      Number(
        executiveWhatIf.scenarioCashflow ??
        analysisData?.cashflow ??
        analysisData?.net ??
        0
      );

    const originalScore =
      Number(
        executiveWhatIf.originalInvestmentScore ?? 0
      );

    const scenarioScore =
      Number(
        executiveWhatIf.scenarioInvestmentScore ??
        analysisData?.investmentScore ??
        0
      );

    const verdict =
      analysisData?.verdict ||
      advisor?.verdict ||
      "WAIT";

    const formatEUR_IT =
      value =>
        Number(value || 0).toLocaleString(
          "it-IT",
          {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 2
          }
        );

    const formatEUR_EN =
      value =>
        Number(value || 0).toLocaleString(
          "en-US",
          {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 2
          }
        );

const formatPct =
  value =>
    `${Number(value || 0).toFixed(2)}%`;

const combinedChanges =
  Array.isArray(executiveWhatIf.changes)
    ? executiveWhatIf.changes
    : [];

const parameterLinesIT = [];
const parameterLinesEN = [];

if(combinedChanges.includes("propertyPrice")){

  parameterLinesIT.push(
    `Prezzo immobile: ${formatEUR_IT(executiveWhatIf.originalPropertyPrice)} → ${formatEUR_IT(executiveWhatIf.scenarioPropertyPrice)}`
  );

  parameterLinesEN.push(
    `Property price: ${formatEUR_EN(executiveWhatIf.originalPropertyPrice)} → ${formatEUR_EN(executiveWhatIf.scenarioPropertyPrice)}`
  );

}

if(combinedChanges.includes("mortgagePercent")){

  parameterLinesIT.push(
    `Mutuo/LTV: ${originalMortgagePercent}% → ${scenarioMortgagePercent}%`
  );

  parameterLinesEN.push(
    `Mortgage/LTV: ${originalMortgagePercent}% → ${scenarioMortgagePercent}%`
  );

}

if(combinedChanges.includes("occupancy")){

  parameterLinesIT.push(
    `Occupazione: ${originalOccupancy}% → ${scenarioOccupancy}%`
  );

  parameterLinesEN.push(
    `Occupancy: ${originalOccupancy}% → ${scenarioOccupancy}%`
  );

}

if(combinedChanges.includes("adr")){

  parameterLinesIT.push(
    `ADR: ${formatEUR_IT(originalADR)} → ${formatEUR_IT(scenarioADR)}`
  );

  parameterLinesEN.push(
    `ADR: ${formatEUR_EN(originalADR)} → ${formatEUR_EN(scenarioADR)}`
  );

}

if(combinedChanges.includes("monthlyCosts")){

  parameterLinesIT.push(
    `Costi mensili: ${formatEUR_IT(executiveWhatIf.originalMonthlyCosts)} → ${formatEUR_IT(executiveWhatIf.scenarioMonthlyCosts)}`
  );

  parameterLinesEN.push(
    `Monthly costs: ${formatEUR_EN(executiveWhatIf.originalMonthlyCosts)} → ${formatEUR_EN(executiveWhatIf.scenarioMonthlyCosts)}`
  );

}

const modifiedParametersIT =
  parameterLinesIT.join("\n");

const modifiedParametersEN =
  parameterLinesEN.join("\n");

const changesCount =
  combinedChanges.length;

response.type =
  "executive_what_if";

    response.confidence =
      0.99;

    response.signals.push(
      "combined_what_if"
    );

    response.textIT =
`🧪 SCENARIO WHAT-IF COMBINATO

Ho applicato contemporaneamente ${changesCount} modifiche richieste, mantenendo invariata la simulazione originale.

📌 Parametri modificati

${modifiedParametersIT}

🏦 Nuova struttura finanziaria

Equity: ${formatEUR_IT(originalEquity)} → ${formatEUR_IT(scenarioEquity)}
Mutuo: ${formatEUR_IT(originalLoan)} → ${formatEUR_IT(scenarioLoan)}

📊 Impatto economico

ROI equity: ${formatPct(originalROI)} → ${formatPct(scenarioROI)}
ROI immobile: ${formatPct(originalRealROI)} → ${formatPct(scenarioRealROI)}
Cashflow annuo: ${formatEUR_IT(originalCashflow)} → ${formatEUR_IT(scenarioCashflow)}
Investment Score: ${originalScore}/100 → ${scenarioScore}/100

🧠 Valutazione AI

L'effetto combinato delle modifiche porta il ROI equity a ${formatPct(scenarioROI)}, il ROI reale a ${formatPct(scenarioRealROI)} e il cashflow annuo a ${formatEUR_IT(scenarioCashflow)}.

Lo scenario risultante raggiunge un Investment Score di ${scenarioScore}/100 con verdetto ${verdict}.`;

    response.textEN =
`🧪 COMBINED WHAT-IF SCENARIO

I applied the ${changesCount} requested changes simultaneously, while keeping the original simulation unchanged.

📌 Modified Parameters

${modifiedParametersEN}

🏦 New Financial Structure

Equity: ${formatEUR_EN(originalEquity)} → ${formatEUR_EN(scenarioEquity)}
Loan: ${formatEUR_EN(originalLoan)} → ${formatEUR_EN(scenarioLoan)}

📊 Financial Impact

Equity ROI: ${formatPct(originalROI)} → ${formatPct(scenarioROI)}
Property ROI: ${formatPct(originalRealROI)} → ${formatPct(scenarioRealROI)}
Annual cashflow: ${formatEUR_EN(originalCashflow)} → ${formatEUR_EN(scenarioCashflow)}
Investment Score: ${originalScore}/100 → ${scenarioScore}/100

🧠 AI Assessment

The combined effect of the changes brings equity ROI to ${formatPct(scenarioROI)}, property ROI to ${formatPct(scenarioRealROI)} and annual cashflow to ${formatEUR_EN(scenarioCashflow)}.

The resulting scenario reaches an Investment Score of ${scenarioScore}/100 with a ${verdict} verdict.`;

    console.log(
      "🧪 EXECUTIVE COMBINED WHAT-IF RESPONSE",
      {
        scenarioMortgagePercent,
        scenarioOccupancy,
        scenarioADR,
        scenarioEquity,
        scenarioLoan,
        scenarioROI,
        scenarioRealROI,
        scenarioCashflow,
        scenarioScore,
        verdict
      }
    );

    return response;

  }

  // =====================================
  // 💰 SAFE FINANCIAL DATA
  // =====================================

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

// =====================================
// 🧠 EXECUTIVE INSIGHT
// =====================================

if(strongestPoint){

  executiveIT.push(

`🧠 Insight AI

Il principale punto di forza individuato è:

${strongestPoint}.`

  );

}

if(weakestPoint){

  executiveIT.push(

`⚠️ Area da migliorare

${weakestPoint}.`

  );

}

if(hasCriticalIssue){

  executiveIT.push(

`🚨 Attenzione

L'AI ha rilevato almeno una criticità che potrebbe compromettere la sostenibilità dell'investimento nel medio periodo.`

  );

}

if(hasStrongInvestment){

  executiveIT.push(

`🚀 Valutazione Strategica

L'Executive Brain considera questa operazione particolarmente competitiva rispetto ai benchmark disponibili.`

  );

}

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
// 🏆 INVESTMENT GRADE
// =====================================

let investmentGrade = "C";

if(
  roi >= 20 &&
  risk <= 35 &&
  occupancy >= 65
){

  investmentGrade = "A+";

}

else if(
  roi >= 15 &&
  risk <= 45
){

  investmentGrade = "A";

}

else if(
  roi >= 10
){

  investmentGrade = "B";

}

executiveIT.push(

`🏆 Investment Grade

Valutazione AI: ${investmentGrade}`

);

  if(risk <= 35){

  executiveIT.push(

`🛡️ Valutazione Rischio

La simulazione mostra una struttura operativa stabile e ben bilanciata rispetto ai benchmark del mercato.`

  );

}

else if(risk <= 60){

  executiveIT.push(

`⚠️ Valutazione Rischio

L'investimento appare sostenibile ma richiede monitoraggio operativo e controllo dei costi.`

  );

}

else{

  executiveIT.push(

`🚨 Valutazione Rischio

Il livello di rischio è elevato e potrebbe ridurre la stabilità del cashflow nel lungo periodo.`

  );

}

// =====================================
// 🔥 AI CONCLUSION
// =====================================

if(advisor){

  if(executiveDecision === "BUY"){

    executiveIT.push(

`🟢 Executive Summary

L'operazione presenta indicatori superiori ai benchmark di mercato.

La combinazione di ROI (${executiveROI.toFixed(1)}%), rischio contenuto (${risk}/100) e cashflow positivo (€${Math.round(net).toLocaleString("it-IT")}) colloca l'investimento nella fascia ad alta sostenibilità operativa.

L'attuale scenario di mercato supporta una valutazione favorevole nel medio-lungo termine.`

    );

  }

  else if(executiveDecision === "WAIT"){

    executiveIT.push(

`🟡 Executive Summary

L'investimento mostra metriche interessanti ma non ancora pienamente ottimizzate.

Alcuni indicatori risultano positivi, mentre altri richiedono miglioramenti per aumentare competitività e resilienza operativa.

Si consiglia una revisione di pricing, occupazione o struttura dei costi.`

    );

  }

  else{

    executiveIT.push(

`🔴 Executive Summary

La simulazione evidenzia criticità che riducono l'attrattività dell'investimento.

L'equilibrio tra rendimento, rischio e sostenibilità operativa non appare attualmente ottimale.

Prima di procedere è consigliabile rivedere il modello economico dell'operazione.`

    );

  }

}

executiveIT.push(
  `🏨 Occupazione attuale: ${occupancy}%`
);

if(occupancy < 45){

  executiveIT.push(
    "⚠️ Un'occupazione sotto il 45% può compromettere il cashflow reale."
  );

}

// =====================================
// 🧠 AI SIGNAL INSIGHTS
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

if(advisor){

  let verdictIT = "";
  let verdictEN = "";

  if(executiveDecision === "BUY"){

    verdictIT =
      "🟢 VERDETTO AI: INVESTIMENTO CONSIGLIATO";

    verdictEN =
      "🟢 AI VERDICT: RECOMMENDED INVESTMENT";

  }

  else if(executiveDecision === "WAIT"){

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

  executiveIT.unshift(
    verdictIT
  );

  executiveIT.unshift(
    `🎯 Affidabilità: ${advisor.confidence}%`
  );

  executiveIT.unshift(
    `📊 Score AI: ${advisor.score}/100`
  );

  executiveEN.unshift(
    verdictEN
  );

  executiveEN.unshift(
    `🎯 Confidence: ${advisor.confidence}%`
  );

  executiveEN.unshift(
    `📊 AI Score: ${advisor.score}/100`
  );

}

executiveEN.push(

`🟢 Key Strengths

📈 ROI: ${executiveROI.toFixed(1)}%
⚠️ Risk Score: ${risk}/100
🏨 Occupancy: ${occupancy}%
💰 Cashflow: €${Math.round(net).toLocaleString("en-US")}`

);

// =====================================
// 🧠 EXECUTIVE INSIGHT
// =====================================

if(strongestPoint){

  executiveEN.push(

`🧠 AI Insight

The strongest aspect identified by the AI is:

${strongestPoint}.`

  );

}

if(weakestPoint){

  executiveEN.push(

`⚠️ Area for Improvement

${weakestPoint}.`

  );

}

if(hasCriticalIssue){

  executiveEN.push(

`🚨 Attention

The AI detected at least one critical issue that could compromise the long-term sustainability of this investment.`

  );

}

if(hasStrongInvestment){

  executiveEN.push(

`🚀 Strategic Evaluation

The Executive Brain considers this investment particularly competitive compared with current market benchmarks.`

  );

}

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

 if(risk <= 35){

  executiveEN.push(

`🛡️ Risk Assessment

The simulation shows a stable and well-balanced operating structure compared to market benchmarks.`

  );

}

else if(risk <= 60){

  executiveEN.push(

`⚠️ Risk Assessment

The investment appears sustainable but requires operational monitoring and cost control.`

  );

}

else{

  executiveEN.push(

`🚨 Risk Assessment

The current risk level may reduce cashflow stability over the long term.`

  );

} 
// =====================================
// 🔥 AI CONCLUSION
// =====================================

if(advisor){

  if(executiveDecision === "BUY"){

    executiveEN.push(

`🟢 Executive Summary

The investment shows performance indicators above market benchmarks.

The combination of ROI (${executiveROI.toFixed(1)}%), controlled risk (${risk}/100) and positive cashflow (€${Math.round(net).toLocaleString("en-US")}) places the asset in a highly sustainable operating range.

Current market conditions support a favorable medium to long-term outlook.`

    );

  }

  else if(executiveDecision === "WAIT"){

    executiveEN.push(

`🟡 Executive Summary

The investment shows promising metrics but still requires optimization.

Some indicators are positive, while others should be improved to increase competitiveness and operational resilience.

Pricing, occupancy and cost structure should be reviewed.`

    );

  }

  else{

    executiveEN.push(

`🔴 Executive Summary

The simulation highlights weaknesses that reduce overall investment attractiveness.

The balance between return, risk and operational sustainability is currently below target levels.

A review of the business model is recommended before proceeding.`

    );

  }

}

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
// 🧠 EXECUTIVE REASONING ENGINE 2.0
// =====================================

let executiveSummary = "";

const isEnglishLanguage =

  String(
    window.currentLanguage ||
    "it"
  )
  .toLowerCase()
  .startsWith("en");  

const executiveReasoningMemory = {

  ...(memory || {}),

  lastROI:
    executiveROI,

  lastRisk:
    risk,

  lastOccupancy:
    occupancy,

  lastCashflow:
    net,

  lastRevenue:
    gross,

  lastExpenses:
    Number(
      liveData.expenses ??
      liveData.yearlyCosts ??
      liveData.monthlyCosts ??
      0
    ),

  lastMortgagePercent:
    mortgagePercent,

  lastNightPrice:
    Number(
      liveData.priceNight ??
      liveData.pricePerNight ??
      liveData.nightly ??
      0
    ),

  lastCity:
    city ||
    memory.lastCity ||
    "roma"

};  

if(
  typeof window.rbGenerateInvestmentSummary ===
  "function"
){

  try{

    executiveSummary =
      window.rbGenerateInvestmentSummary(
       executiveReasoningMemory
    ) || "";

  }
  catch(error){

    console.warn(
      "Executive Summary Error",
      error
    );

  }

}

console.log(
  "🧠 EXECUTIVE SUMMARY:",
  executiveSummary
);
  
// =====================================
// 🧠 REASONING ENGINE
// =====================================

if(reasoningIT.length){

  executiveIT.push(

    reasoningIT.join("\n\n")

  );

}

// Executive Summary gestito dal Builder

// =====================================
// 🧠 ADVISOR REASONS
// =====================================

if(advisor?.reasonsIT?.length){

  executiveIT.push(

`🧠 Motivazioni AI

${advisor.reasonsIT.join("\n")}`

  );

}

const actionPlanIT = [];

if(
  canonicalVerdict === "BUY"
){

  actionPlanIT.push(
    "Acquisizione consigliata."
  );

}

if(
  roi >= 25
){

  actionPlanIT.push(
    "Performance superiore ai benchmark medi del mercato."
  );

}

if(
  occupancy >= 70
){

  actionPlanIT.push(
    "Domanda potenziale compatibile con una gestione short-rent stabile."
  );

}

if(
  net > 0
){

  actionPlanIT.push(
    "Cashflow positivo e sostenibile."
  );

}

if(
  risk > 60
){

  actionPlanIT.push(
    "Valutare strategie di mitigazione del rischio."
  );

}

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

const recommendationsIT = [];

if(occupancy < 60){

  recommendationsIT.push(
    "• Incrementare l'occupazione tramite pricing dinamico e OTA."
  );

}

if(risk > 50){

  recommendationsIT.push(
    "• Ridurre il rischio operativo monitorando costi e volatilità della domanda."
  );

}

if(roi < 15){

  recommendationsIT.push(
    "• Ottimizzare ADR e marginalità per migliorare il rendimento."
  );

}

if(net > 0){

  recommendationsIT.push(
    "• Mantenere il cashflow positivo monitorando i costi fissi."
  );

}

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

const actionPlanEN = [];

if(canonicalVerdict === "BUY"){

  actionPlanEN.push(
    "Acquisition recommended."
  );

}

if(roi >= 25){

  actionPlanEN.push(
    "Performance exceeds average market benchmarks."
  );

}

if(occupancy >= 70){

  actionPlanEN.push(
    "Demand profile supports a stable short-rent operation."
  );

}

if(net > 0){

  actionPlanEN.push(
    "Positive and sustainable cashflow."
  );

}

if(risk > 60){

  actionPlanEN.push(
    "Consider risk mitigation strategies."
  );

}

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

const recommendationsEN = [];

if(occupancy < 60){

  recommendationsEN.push(
    "• Increase occupancy through dynamic pricing and OTA optimization."
  );

}

if(risk > 50){

  recommendationsEN.push(
    "• Reduce operational risk by monitoring costs and market volatility."
  );

}

if(roi < 15){

  recommendationsEN.push(
    "• Optimize ADR and margins to improve returns."
  );

}

if(net > 0){

  if(occupancy >= 80){

    recommendationsEN.push(
      "• Consider gradually increasing rates to improve RevPAR."
    );

  }

  if(roi >= 40){

    recommendationsEN.push(
      "• Validate ROI sustainability through conservative scenarios."
    );

  }

  recommendationsEN.push(
    "• Preserve positive cashflow through cost control."
  );

}

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

// Executive Summary gestito dal Builder

// =====================================
// 📝 FINAL EXECUTIVE RESPONSE
// =====================================

if(!builderOwnsExecutiveResponse){

    pushResponseBlock({

        priority: 10,

        textIT:
            executiveIT.join("\n\n"),

        textEN:
            executiveEN.join("\n\n")

    });

}

  let executiveBuilderResult = null;

if(
  typeof window.rbBuildExecutiveResponse ===
  "function"
){

  try{

    console.log(
    "🧠 BRAIN DATA TO BUILDER",
    brainData
);

    console.log(
    "🧠 BRAIN KEYS",
    Object.keys(brainData || {})
);

console.log(
    "🧠 EXECUTIVE SUMMARY FIELD",
    brainData?.executiveSummary
);

console.log(
    "🧠 SUMMARY IT FIELD",
    brainData?.summaryIT
);

executiveBuilderResult =
      window.rbBuildExecutiveResponse({

        executiveContext,

        advisor,

        documentKnowledge,

        executiveNarrative,

        investmentScore,

        reasoning: {

          it: reasoningIT,

          en: reasoningEN

        },

        brain: brainData,

        executiveBrain:
          executiveBrain ||

          brainData?.executiveBrain ||

        null,

        intent,

        message,

        aiSignals,

        financials: {

          roi,

          risk,

          occupancy,

          net,

          gross,

          mortgagePercent

        }

      }) || null;

  }
  catch(error){

    console.warn(
      "Executive Builder Error",
      error
    );

  }

}

console.log(
  "🧠 EXECUTIVE BUILDER RESULT:",
  executiveBuilderResult
);

  builderOwnsExecutiveResponse =

    !!(
        executiveBuilderResult?.textIT ||
        executiveBuilderResult?.textEN
    );

  if (
    executiveBuilderResult?.textIT
){

    response.textIT =
        executiveBuilderResult.textIT;

}

if (
    executiveBuilderResult?.textEN
){

    response.textEN =
        executiveBuilderResult.textEN;

}

  response.metadata = {

  ...(response.metadata || {}),

  executiveAI: {

    builderReady:
  !!executiveBuilderResult,

builderType:
  executiveBuilderResult?.type ||
  null,

    grade:
      executiveNarrative?.grade ||
      null,

    performance:
      executiveNarrative?.performance ||
      null,

    riskLabelIT:
      executiveNarrative?.riskLabelIT ||
      null,

    riskLabelEN:
      executiveNarrative?.riskLabelEN ||
      null,

    recommendationIT:
      executiveNarrative?.recommendationIT ||
      null,

    recommendationEN:
      executiveNarrative?.recommendationEN ||
      null,

    documentCount:
      documentKnowledge?.totalDocuments ||
      0,

    simulationReports:
      documentKnowledge?.simulationReports ||
      0,

    dashboardReports:
      documentKnowledge?.dashboardReports ||
      0,

    hasWarnings:
      documentKnowledge
        ?.executiveInsights
        ?.hasWarnings ||
      false,

    hasOpportunities:
      documentKnowledge
        ?.executiveInsights
        ?.hasOpportunities ||
      false

  }

};

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

  // =====================================
  // 🇮🇹 ITALIANO
  // =====================================

const strategyIT = [

    conversationalFollowUp

        ? "🧠 Sto continuando l'analisi della simulazione precedente."

        : "🧠 Analisi strategica AI completata."

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

if(conversationalFollowUp){

if(canonicalVerdict === "BUY"){

        strategyIT.push(
            "✅ In base ai dati dell'ultima simulazione, l'investimento appare competitivo. Se le ipotesi utilizzate (occupazione, ADR e costi) sono realistiche, il progetto merita di essere preso seriamente in considerazione."
        );

    }

else if(canonicalVerdict === "WAIT"){

        strategyIT.push(
            "⚠️ Analizzando l'ultima simulazione, prima di procedere conviene migliorare alcuni parametri operativi per aumentare la sostenibilità dell'investimento."
        );

    }

    else{

        strategyIT.push(
            "🚨 L'AI ritiene che, nelle condizioni attuali, l'investimento non sia sufficientemente solido. Prima di procedere è consigliabile rivedere redditività, rischio e sostenibilità complessiva."
        );

    }

}else{

if(canonicalVerdict === "BUY"){

        strategyIT.push(
            "💡 L'investimento mostra metriche molto competitive."
        );

    }

else if(canonicalVerdict === "WAIT"){

        strategyIT.push(
            "💡 L'investimento richiede ottimizzazione operativa."
        );

    }

    else{

        strategyIT.push(
            "💡 Nello stato attuale l'investimento non appare ancora sufficientemente competitivo."
        );

    }

}

response.textIT =
    strategyIT.join("\n\n");

  // =====================================
  // 🇬🇧 ENGLISH
  // =====================================

const strategyEN = [

    conversationalFollowUp

        ? "🧠 Continuing the analysis of your previous simulation."

        : "🧠 AI strategic analysis completed."

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

if(conversationalFollowUp){

if(canonicalVerdict === "BUY"){

        strategyEN.push(
            "✅ Based on the latest simulation, the investment appears competitive. If occupancy, ADR and costs are realistic, the opportunity deserves serious consideration."
        );

    }

else if(canonicalVerdict === "WAIT"){

        strategyEN.push(
            "⚠️ Based on the latest simulation, improving operational parameters before investing is recommended."
        );

    }

    else{

        strategyEN.push(
            "🚨 The AI believes the investment is not sufficiently solid under current conditions. Profitability, risk and sustainability should be reviewed before proceeding."
        );

    }

}else{

if(canonicalVerdict === "BUY"){

        strategyEN.push(
            "💡 The investment shows highly competitive metrics."
        );

    }

else if(canonicalVerdict === "WAIT"){

        strategyEN.push(
            "💡 The investment requires operational optimization."
        );

    }

    else{

        strategyEN.push(
            "💡 Under the current conditions the investment does not yet appear sufficiently competitive."
        );

    }

}

response.textEN =
    strategyEN.join("\n\n");

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

const totalSimulations =
  portfolioHistory.length;

const averageROI =

totalSimulations > 0

? portfolioHistory.reduce(
    (sum,item)=>
      sum +
      Number(
        item.realROI ??
        item.visualROI ??
        item.roi ??
        0
      ),
    0
  ) / totalSimulations

: 0;

const bestSimulation =

portfolioHistory.sort(
(a,b)=>

Number(
  b.realROI ??
  b.visualROI ??
  b.roi ??
  0
)

-

Number(
  a.realROI ??
  a.visualROI ??
  a.roi ??
  0
)

)[0];

const bestROI =

bestSimulation

? Number(
    bestSimulation.realROI ??
    bestSimulation.visualROI ??
    bestSimulation.roi ??
    0
  )

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

? portfolioHistory.reduce(
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

const totalSimulations =
  portfolioHistory.length;

const averageROI =

totalSimulations > 0

? portfolioHistory.reduce(
    (sum,item)=>
      sum +
      Number(
        item.realROI ??
        item.visualROI ??
        item.roi ??
        0
      ),
    0
  ) / totalSimulations

: 0;

const bestSimulation =

[...portfolioHistory]

.sort(
(a,b)=>

Number(
  b.realROI ??
  b.visualROI ??
  b.roi ??
  0
)

-

Number(
  a.realROI ??
  a.visualROI ??
  a.roi ??
  0
)

)[0];

const bestROI =

bestSimulation

? Number(
    bestSimulation.realROI ??
    bestSimulation.visualROI ??
    bestSimulation.roi ??
    0
  )

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

? portfolioHistory.reduce(
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

  const reportAccess =

    window.getUserAccess?.() ||

    window.RB_USER ||

    {};

  const canInterpretExecutiveReport =

    reportAccess.isPro ||

    reportAccess.isAdmin;

  if(!canInterpretExecutiveReport){

    response.textIT =

`🔒 L'interpretazione completa del Report Executive è disponibile nel piano PRO.

Con PRO puoi:

• generare il PDF Executive
• interpretare ROI reale e benchmark
• analizzare rischio e cashflow
• verificare sostenibilità del finanziamento
• ottenere il verdetto AI completo`;

    response.textEN =

`🔒 Full Executive Report interpretation is available with the PRO plan.

With PRO you can:

• generate the Executive PDF
• interpret real ROI and benchmarks
• analyze risk and cashflow
• assess financing sustainability
• receive the complete AI verdict`;

    return response;

  }

  const activePDFReport =

    executiveContext
      ?.documents
      ?.activeReport ||

    null;

  if(
    !hasAnalysis &&
    !activePDFReport
  ){

    response.textIT =

`📊 Non trovo una simulazione o un Report Executive da interpretare.

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

`📊 I cannot find a simulation or an Executive Report to interpret.

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

const pdfAnalysis =

  activePDFReport
    ?.analysis ||

  activePDFReport ||

  {};

const isExecutivePDFReport =

  activePDFReport ===
    window.lastExecutiveReport ||

  pdfAnalysis
    ?.reportType ===
    "executive_pdf" ||

  activePDFReport
    ?.reportType ===
    "executive_pdf";

if(!isExecutivePDFReport){

  response.textIT =

`📄 Non trovo ancora un Report Executive PDF da interpretare.

Per procedere:

• genera il PDF dalla simulazione
• poi chiedimi "Interpretami il report"

L'AI utilizzerà gli stessi valori presenti nel documento.`;

  response.textEN =

`📄 I cannot find an Executive PDF Report to interpret yet.

To continue:

• generate the PDF from the simulation
• then ask "Interpret the report"

The AI will use the same values shown in the document.`;

  return response;

}

const reportROI =

  Number(
    pdfAnalysis.roi ??
    0
  );

const reportRisk =

  Number(
    pdfAnalysis.risk ??
    0
  );

const reportOccupancy =

  pdfAnalysis.occupancy !== null &&
  pdfAnalysis.occupancy !== undefined

    ? Number(
        pdfAnalysis.occupancy
      )

    : null;

const reportCashflow =

  Number(
    pdfAnalysis.cashflow ??
    pdfAnalysis.annualProfit ??
    0
  );

const reportEquity =

  Number(
    pdfAnalysis.equity ??
    0
  );
const paybackYears =

  reportCashflow > 0

    ? reportEquity / reportCashflow

    : null;

const rawInvestmentScore =

  Number(
    pdfAnalysis
      ?.investmentScore ??
    0
  );

const investmentScoreValue =

  Number.isFinite(rawInvestmentScore)

    ? Math.round(rawInvestmentScore)

    : 0;

const investmentClass =

  investmentScoreValue >= 90

    ? "Outstanding"

    : investmentScoreValue >= 80

      ? "Excellent"

      : investmentScoreValue >= 70

        ? "Strong"

        : "Standard";

const reportVerdict =

  pdfAnalysis
    ?.verdict ||

  null;

let executiveVerdictIT =

  reportVerdict

    ? `🟢 ${reportVerdict.toUpperCase()}`

    : "🟡 DA VALUTARE";

let executiveVerdictEN =

  reportVerdict === "Operazione istituzionale"

    ? "🟢 INSTITUTIONAL-GRADE OPPORTUNITY"

    : reportVerdict

      ? `🟢 ${reportVerdict.toUpperCase()}`

      : "🟡 TO BE REVIEWED";

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
${reportOccupancy !== null ? `Occupazione: ${reportOccupancy}%\n` : ""}Rischio: ${reportRisk}/100

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
${reportOccupancy !== null ? `Occupancy: ${reportOccupancy}%\n` : ""}Risk: ${reportRisk}/100

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
  canonicalVerdict ||
  advisor?.verdict ||
  "WAIT";
  
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

// =====================================
// 🎯 STRATEGIC PRIORITY
// =====================================

let strategicPriorityIT = "";
let strategicPriorityEN = "";

if(cashflow <= 0){

  strategicPriorityIT =
    "🎯 Priorità AI: riportare il cashflow in territorio positivo prima di pianificare qualsiasi crescita.";

  strategicPriorityEN =
    "🎯 AI Priority: restore positive cashflow before planning any expansion.";

}

else if(risk >= 60){

  strategicPriorityIT =
    "🎯 Priorità AI: ridurre il rischio operativo prima di cercare rendimenti più elevati.";

  strategicPriorityEN =
    "🎯 AI Priority: reduce operational risk before pursuing higher returns.";

}

else if(roi < 8){

  strategicPriorityIT =
    "🎯 Priorità AI: il principale limite dell'investimento è il ROI reale. Prima di espandere il portafoglio conviene aumentare la redditività dell'operazione.";

  strategicPriorityEN =
    "🎯 AI Priority: the main limitation of this investment is the real ROI. Improve profitability before expanding your portfolio.";

}

else if(occupancy < 65){

  strategicPriorityIT =
    "🎯 Priorità AI: aumentare l'occupazione della struttura prima di intervenire sui prezzi.";

  strategicPriorityEN =
    "🎯 AI Priority: increase occupancy before changing pricing.";

}

else{

  strategicPriorityIT =
    "🎯 Priorità AI: l'investimento è equilibrato. Concentrati sull'aumento della redditività e sulla scalabilità.";

  strategicPriorityEN =
    "🎯 AI Priority: the investment is balanced. Focus on profitability growth and scalability.";

}

// =====================================
// 🧠 AI STRATEGIC REASONING
// =====================================

let strategicReasonIT = "";
let strategicReasonEN = "";

if(cashflow <= 0){

strategicReasonIT =
`Il flusso di cassa negativo indica che i ricavi attuali non sono ancora sufficienti a coprire tutti i costi operativi e finanziari.

Prima di valutare nuove acquisizioni è opportuno individuare quale componente incide maggiormente sul risultato economico: ADR, occupazione, costi di gestione oppure leva finanziaria.

Una volta ripristinato un cashflow positivo sarà possibile pianificare una crescita del portafoglio con un livello di rischio più sostenibile.`;

strategicReasonEN =
`Negative cashflow indicates that current revenues are not yet sufficient to cover operating and financing costs.

Before considering new acquisitions, it is advisable to identify which factor is having the greatest impact on profitability: ADR, occupancy, operating costs or financial leverage.

Once positive cashflow has been restored, portfolio growth can be planned on a more sustainable basis.`;

}

else if(risk >= 60){

  strategicReasonIT =
    `Il livello di rischio (${risk}/100) è superiore a quello normalmente consigliato per una crescita stabile del portafoglio.`;

  strategicReasonEN =
    `The current risk level (${risk}/100) is higher than recommended for stable portfolio growth.`;

}

else if(roi < 8){

  strategicReasonIT =
    `Il ROI reale (${roi.toFixed(1)}%) è il parametro che limita maggiormente questa operazione. Rischio e cashflow risultano invece sufficientemente equilibrati.`;

  strategicReasonEN =
    `The real ROI (${roi.toFixed(1)}%) is the main limiting factor. Risk and cashflow are currently acceptable.`;

}

else{

  strategicReasonIT =
    "L'investimento presenta fondamentali equilibrati. Le prossime ottimizzazioni possono concentrarsi sull'incremento della redditività.";

  strategicReasonEN =
    "The investment fundamentals are balanced. Future improvements should focus on increasing profitability.";

}

// =====================================
// 📋 EXECUTIVE SUMMARY
// =====================================

let executiveSummaryIT = "";
let executiveSummaryEN = "";

if(
    roi >= 20 &&
    cashflow > 0 &&
    risk <= 35
){

executiveSummaryIT =
"L'investimento mostra un profilo molto equilibrato. Cashflow positivo, rischio contenuto e redditività competitiva. Le prossime ottimizzazioni possono concentrarsi sulla crescita del portafoglio.";

    executiveSummaryEN =
"The investment shows a well-balanced profile. Cashflow is positive, risk is under control and profitability is competitive. Future improvements can focus on portfolio growth.";

}

else if(cashflow <= 0){

executiveSummaryIT =
`L'analisi evidenzia che il principale limite dell'investimento è il cashflow negativo (€${Math.round(cashflow).toLocaleString("it-IT")} annui).

L'occupazione (${occupancy}%) non rappresenta la criticità principale, mentre il livello di rischio (${risk}/100) e la redditività complessiva stanno impedendo all'operazione di generare un flusso di cassa sostenibile.

Prima di pianificare nuove acquisizioni conviene riportare l'investimento in equilibrio economico.`;

executiveSummaryEN =
`The analysis shows that the main limitation of this investment is the negative cashflow (€${Math.round(cashflow).toLocaleString("en-US")} per year).

Current occupancy (${occupancy}%) is not the primary issue, while the overall risk (${risk}/100) and profitability are preventing the investment from generating sustainable cashflow.

Before considering new acquisitions, restoring financial balance should be the priority.`;

}

else if(risk >= 60){

    executiveSummaryIT =
"Il rendimento è interessante ma il livello di rischio è superiore a quello normalmente consigliato. Conviene ridurre la volatilità prima di espandere il portafoglio.";

    executiveSummaryEN =
"Profitability is attractive but operational risk is higher than recommended. Reducing volatility should come before expansion.";

}

else if(roi < 8){

    executiveSummaryIT =
"L'investimento è stabile ma il ROI reale è ancora inferiore ai benchmark normalmente ricercati dagli investitori.";

    executiveSummaryEN =
"The investment is stable but real ROI is still below the level generally sought by investors.";

}

else{

    executiveSummaryIT =
"L'investimento presenta fondamentali equilibrati e buoni margini di miglioramento.";

    executiveSummaryEN =
"The investment fundamentals are balanced and still offer room for improvement.";

}

// =====================================
// 🎯 EXECUTIVE DECISION
// =====================================

let executiveDecisionIT = "";
let executiveDecisionEN = "";

if(
    roi >= 20 &&
    cashflow > 0 &&
    risk <= 35
){

    executiveDecisionIT =
"L'investimento è pronto per una possibile espansione del portafoglio se si presentano opportunità con caratteristiche simili.";

    executiveDecisionEN =
"The investment is ready for potential portfolio expansion if similar opportunities arise.";

}

else if(cashflow <= 0){

    executiveDecisionIT =
"Prima di nuovi investimenti è consigliabile ripristinare un cashflow positivo.";

    executiveDecisionEN =
"Restore positive cashflow before considering new investments.";

}

else if(risk >= 60){

    executiveDecisionIT =
"La priorità è ridurre il rischio operativo prima di aumentare l'esposizione del portafoglio.";

    executiveDecisionEN =
"The priority is reducing operational risk before increasing portfolio exposure.";

}

else if(roi < 8){

    executiveDecisionIT =
"Conviene aumentare la redditività dell'immobile attuale prima di valutare nuove acquisizioni.";

    executiveDecisionEN =
"Improve the profitability of the current property before considering new acquisitions.";

}

else{

    executiveDecisionIT =
"L'investimento ha una buona base operativa. Le prossime decisioni possono concentrarsi sulla crescita mantenendo l'attuale equilibrio.";

    executiveDecisionEN =
"The investment has a solid operational foundation. Future decisions can focus on growth while maintaining the current balance.";

}
  

// =====================================
// 🎯 AI PRIORITIES
// =====================================

if(cashflow <= 0){

  prioritiesIT.push(
    "💸 Ripristinare un cashflow positivo prima di pianificare espansioni."
  );

  prioritiesEN.push(
    "💸 Restore positive cashflow before planning expansion."
  );

}

else if(risk > 35){

  prioritiesIT.push(
    "⚠️ Ridurre il rischio operativo e la dipendenza dalla stagionalità."
  );

  prioritiesEN.push(
    "⚠️ Reduce operational risk and seasonal dependency."
  );

}

else if(roi < 20){

  prioritiesIT.push(
    "📈 Incrementare ADR e ottimizzare le tariffe per superare il 20% di ROI."
  );

  prioritiesEN.push(
    "📈 Increase ADR and optimize pricing to exceed 20% ROI."
  );

}

else if(occupancy < 75){

  prioritiesIT.push(
    "🏨 Portare l'occupazione verso il 75-80% per aumentare redditività e stabilità."
  );

  prioritiesEN.push(
    "🏨 Increase occupancy towards 75-80% to improve profitability and stability."
  );

}

else{

  prioritiesIT.push(
    "💰 Il cashflow è positivo: valuta la crescita del portafoglio."
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

if(pmsADR > 0){

  prioritiesIT.push(
`📊 PMS: ADR attuale €${pmsADR}. Valutare pricing dinamico per aumentare il ricavo medio.`
  );

  prioritiesEN.push(
`📊 PMS: Current ADR €${pmsADR}. Consider dynamic pricing to increase average revenue.`
  );

}

  if(pmsRevenue > 0){

  prioritiesIT.push(
    `💰 PMS: ricavi registrati €${Math.round(pmsRevenue).toLocaleString("it-IT")}. Analizza i periodi migliori per aumentare la redditività.`
  );

  prioritiesEN.push(
    `💰 PMS: recorded revenue €${Math.round(pmsRevenue).toLocaleString("en-US")}. Analyze top-performing periods to increase profitability.`
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

📋 Executive Summary

${executiveSummaryIT}

🎯 Priorità Strategiche

${strategicPriorityIT}

🧠 Perché

${strategicReasonIT}

━━━━━━━━━━━━━━━━━━

${prioritiesIT.join("\n\n")}

━━━━━━━━━━━━━━━━━━

🎯 Decisione AI

${executiveDecisionIT}

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

📋 Executive Summary

${executiveSummaryEN}

🎯 Strategic Priorities

${strategicPriorityEN}

🧠 Why

${strategicReasonEN}

━━━━━━━━━━━━━━━━━━

${prioritiesEN.join("\n\n")}

━━━━━━━━━━━━━━━━━━

🎯 AI Decision

${executiveDecisionEN}

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

`👋 Ciao, sono RendimentoBB AI.

Posso analizzare il tuo investimento, confrontare città o aiutarti a migliorare ROI e cashflow.

Da dove vuoi iniziare?`;

  response.textEN =

`👋 Hi, I'm RendimentoBB AI.

I can analyze your investment, compare cities, or help you improve ROI and cash flow.

Where would you like to start?`;

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

    if(

    conversationalFollowUp

){

    response.type = "conversation";

    response.confidence = Math.max(
        0.90,
        contextConfidence || 0.90
    );

    response.textIT =

`Sto continuando ad analizzare l'ultima simulazione.

Puoi chiedermi ad esempio:

• perché l'AI ha dato questo verdetto
• cosa migliorare
• quali sono i rischi
• se conviene davvero investire
• come aumentare il ROI`;

    response.textEN =

`I'm continuing the analysis of your latest simulation.

You can ask for example:

• why the AI reached this verdict
• what should be improved
• where the risks are
• whether the investment is really worth it
• how to improve ROI`;

}

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

if(
  investorProfile?.leverageBehavior === "aggressive" &&
  ![
    "investment_executive",
    "executive_analysis"
  ].includes(intent?.intent)
){

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
  !builderOwnsExecutiveResponse &&
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
  !builderOwnsExecutiveResponse &&
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

return response;

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 RESPONSE ENGINE READY"
);
