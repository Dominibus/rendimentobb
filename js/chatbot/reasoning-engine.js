// ===============================================
// 🧠 RENDIMENTOBB – REASONING ENGINE
// Silicon Valley Conversational Intelligence Layer
// ===============================================

// ===============================================
// 🧠 FOLLOW-UP DETECTION
// ===============================================

window.rbIsFollowUpQuestion = function(text){

  text = String(text || "")
    .toLowerCase()
    .trim();

  const followUps = [

    "e quindi",
    "quindi",
    "e col mutuo",
    "e con mutuo",
    "e il rischio",
    "e a livello rischio",
    "e secondo te",
    "quindi conviene",
    "approfondisci",
    "spiegami meglio",
    "fammi un analisi",
    "analizza",
    "conviene ancora",
    "cashflow",
    "sostenibilità",
    "come posso migliorare",
    "what about",
    "more details",
    "is it good",
    "analyze",
    "should i invest"

  ];

  return followUps.some(word =>
    text.includes(word)
  );

};

// ===============================================
// 🧠 GET AI CONTEXT
// ===============================================

window.rbGetAIContext = function(){

  return{

    ...(window.rbAIContextMemory || {}),

    ...(window.rbCanonicalAnalysis || {})

  };

};

// ===============================================
// 🧠 EXECUTIVE MEMORY NORMALIZER
// Single Source of Truth
// ===============================================

window.rbNormalizeExecutiveMemory = function(memory = {}){

  const activeMemory =
    window.rbChatMemory || {};

  const canonicalAnalysis =
    window.rbCanonicalAnalysis || {};

  return{

    ...memory,
    ...canonicalAnalysis,
    ...activeMemory,

    lastROI:
      activeMemory.lastROI ??
      canonicalAnalysis.realROI ??
      canonicalAnalysis.safeROI ??
      canonicalAnalysis.roi ??
      memory.lastROI ??
      memory.realROI ??
      memory.roi ??
      0,

    lastRisk:
      activeMemory.lastRisk ??
      canonicalAnalysis.risk ??
      canonicalAnalysis.riskScore ??
      memory.lastRisk ??
      memory.risk ??
      memory.riskScore ??
      0,

    lastOccupancy:
      activeMemory.lastOccupancy ??
      canonicalAnalysis.occupancy ??
      canonicalAnalysis.occupancyRate ??
      memory.lastOccupancy ??
      memory.occupancy ??
      memory.occupancyRate ??
      0,

    lastCashflow:
      activeMemory.lastCashflow ??
      canonicalAnalysis.cashflow ??
      canonicalAnalysis.net ??
      canonicalAnalysis.annualProfit ??
      memory.lastCashflow ??
      memory.cashflow ??
      memory.net ??
      memory.annualProfit ??
      0,

    lastRevenue:
      activeMemory.lastRevenue ??
      canonicalAnalysis.revenueAnnual ??
      canonicalAnalysis.gross ??
      canonicalAnalysis.revenue ??
      memory.lastRevenue ??
      memory.revenueAnnual ??
      memory.gross ??
      memory.revenue ??
      0,

    lastExpenses:
      activeMemory.lastExpenses ??
      canonicalAnalysis.monthlyCosts ??
      canonicalAnalysis.expenses ??
      canonicalAnalysis.costs ??
      memory.lastExpenses ??
      memory.monthlyCosts ??
      memory.expenses ??
      memory.costs ??
      0,

    lastMortgagePercent:
      activeMemory.lastMortgagePercent ??
      canonicalAnalysis.mortgagePercent ??
      memory.lastMortgagePercent ??
      memory.mortgagePercent ??
      0,

    lastNightPrice:
      activeMemory.lastNightPrice ??
      canonicalAnalysis.priceNight ??
      canonicalAnalysis.pricePerNight ??
      canonicalAnalysis.nightly ??
      memory.lastNightPrice ??
      memory.priceNight ??
      memory.pricePerNight ??
      memory.nightly ??
      0,

    lastCity:
      activeMemory.lastCity ??
      canonicalAnalysis.city ??
      canonicalAnalysis.marketCity ??
      canonicalAnalysis.realCity ??
      memory.lastCity ??
      memory.city ??
      "roma"

  };

};

// ===============================================
// 🧠 EXECUTIVE CROSS REASONING
// ===============================================

window.rbGenerateExecutiveReasoning = function(memory = {}){

  memory =
    window.rbNormalizeExecutiveMemory(memory);

  const reasoningIT = [];
  const reasoningEN = [];

  const roi =
    Number(memory.lastROI || 0);

  const risk =
    Number(memory.lastRisk || 0);

  const occupancy =
    Number(memory.lastOccupancy || 0);

  const cashflow =
    Number(memory.lastCashflow || 0);

  const mortgage =
    Number(
      memory.lastMortgagePercent ??
      memory.mortgagePercent ??
      0
    );

  const revenue =
    Number(
      memory.lastRevenue ??
      memory.revenueAnnual ??
      memory.gross ??
      0
    );

  const expenses =
    Number(
      memory.lastExpenses ??
      memory.monthlyCosts ??
      memory.expenses ??
      0
    );

  // ===========================================
  // STRONG INVESTMENT
  // ===========================================

  if(
    roi >= 20 &&
    risk <= 35 &&
    cashflow > 0
  ){

    reasoningIT.push(
      "🧠 Il rendimento elevato è supportato da un buon equilibrio tra redditività, rischio e sostenibilità finanziaria."
    );

    reasoningEN.push(
      "🧠 High profitability is supported by a balanced combination of return, risk and financial sustainability."
    );

  }

  // ===========================================
  // HIGH ROI BUT WEAK STRUCTURE
  // ===========================================

  if(
    roi >= 25 &&
    (
      occupancy < 50 ||
      cashflow <= 0
    )
  ){

    reasoningIT.push(
      "⚠️ Il ROI appare molto elevato, ma parte delle performance dipende da condizioni operative che potrebbero non essere stabili nel lungo periodo."
    );

    reasoningEN.push(
      "⚠️ ROI is very high, but part of the performance depends on operating conditions that may not remain sustainable over time."
    );

  }

  // ===========================================
  // COST PRESSURE
  // ===========================================

  if(
    revenue > 0 &&
    expenses >= revenue * 0.60
  ){

    reasoningIT.push(
      "💸 L'incidenza dei costi operativi riduce il margine disponibile e rappresenta uno dei principali elementi da ottimizzare."
    );

    reasoningEN.push(
      "💸 Operating expenses significantly reduce margins and represent one of the main optimization opportunities."
    );

  }

  // ===========================================
  // AGGRESSIVE LEVERAGE
  // ===========================================

  if(
    mortgage >= 80 &&
    cashflow <= 0
  ){

    reasoningIT.push(
      "🏦 La leva finanziaria elevata, combinata con un cashflow debole, aumenta il rischio operativo dell'investimento."
    );

    reasoningEN.push(
      "🏦 High leverage combined with weak cashflow increases the operational risk of the investment."
    );

  }

  return window.t(

    reasoningIT.join("\n\n"),

    reasoningEN.join("\n\n")

  );

};

// ===============================================
// 🧠 EXECUTIVE CONTRADICTION DETECTOR
// ===============================================

window.rbDetectExecutiveContradictions = function(memory = {}){

  memory =
    window.rbNormalizeExecutiveMemory(memory);

  const warningsIT = [];
  const warningsEN = [];

  const roi =
    Number(memory.lastROI || 0);

  const risk =
    Number(memory.lastRisk || 0);

  const occupancy =
    Number(memory.lastOccupancy || 0);

  const cashflow =
    Number(memory.lastCashflow || 0);

  const mortgage =
    Number(
      memory.lastMortgagePercent ??
      memory.mortgagePercent ??
      0
    );

  const revenue =
    Number(
      memory.lastRevenue ??
      memory.revenueAnnual ??
      memory.gross ??
      0
    );

  const expenses =
    Number(
      memory.lastExpenses ??
      memory.monthlyCosts ??
      memory.expenses ??
      0
    );

  const nightly =
    Number(
      memory.lastNightPrice ??
      memory.pricePerNight ??
      memory.nightly ??
      0
    );

  // ===========================================
  // ROI HIGH + LOW OCCUPANCY
  // ===========================================

  if(
    roi >= 25 &&
    occupancy < 45
  ){

    warningsIT.push(
      "⚠️ ROI molto elevato con occupazione bassa: il rendimento potrebbe dipendere da ipotesi particolarmente ottimistiche."
    );

    warningsEN.push(
      "⚠️ Very high ROI with low occupancy: returns may depend on optimistic assumptions."
    );

  }

  // ===========================================
  // HIGH REVENUE + NEGATIVE CASHFLOW
  // ===========================================

  if(
    revenue > 0 &&
    cashflow < 0
  ){

    warningsIT.push(
      "⚠️ I ricavi risultano elevati ma il cashflow rimane negativo. La struttura dei costi potrebbe essere eccessivamente pesante."
    );

    warningsEN.push(
      "⚠️ Revenue is strong but cashflow remains negative. Operating costs may be too high."
    );

  }

  // ===========================================
  // PREMIUM ADR + EXTREME OCCUPANCY
  // ===========================================

  if(
    nightly >= 250 &&
    occupancy >= 85
  ){

    warningsIT.push(
      "⚠️ Tariffa media e occupazione risultano entrambe molto elevate. Verificare che lo scenario sia realistico."
    );

    warningsEN.push(
      "⚠️ Average nightly rate and occupancy are both extremely high. Validate scenario assumptions."
    );

  }

  // ===========================================
  // LOW RISK + VERY HIGH LEVERAGE
  // ===========================================

  if(
    risk <= 20 &&
    mortgage >= 90
  ){

    warningsIT.push(
      "⚠️ Il rischio stimato è molto basso nonostante una leva finanziaria estremamente elevata."
    );

    warningsEN.push(
      "⚠️ Estimated risk is very low despite extremely high financial leverage."
    );

  }

  // ===========================================
  // COSTS GREATER THAN REVENUE
  // ===========================================

  if(
    revenue > 0 &&
    expenses > revenue
  ){

    warningsIT.push(
      "⚠️ I costi superano i ricavi stimati. Verificare attentamente i dati inseriti."
    );

    warningsEN.push(
      "⚠️ Expenses exceed estimated revenue. Please review the input data."
    );

  }

  return window.t(

    warningsIT.join("\n\n"),

    warningsEN.join("\n\n")

  );

};

// ===============================================
// 🧠 EXECUTIVE STRATEGIC RECOMMENDATIONS
// ===============================================

window.rbGenerateStrategicRecommendations = function(memory = {}){

  memory =
    window.rbNormalizeExecutiveMemory(memory);

  const recommendationsIT = [];
  const recommendationsEN = [];

  const roi =
    Number(memory.lastROI || 0);

  const risk =
    Number(memory.lastRisk || 0);

  const occupancy =
    Number(memory.lastOccupancy || 0);

  const cashflow =
    Number(memory.lastCashflow || 0);

  const mortgage =
    Number(
      memory.lastMortgagePercent ??
      memory.mortgagePercent ??
      0
    );

  const revenue =
    Number(
      memory.lastRevenue ??
      memory.revenueAnnual ??
      memory.gross ??
      0
    );

  const expenses =
    Number(
      memory.lastExpenses ??
      memory.monthlyCosts ??
      memory.expenses ??
      0
    );

  const nightly =
    Number(
      memory.lastNightPrice ??
      memory.pricePerNight ??
      memory.nightly ??
      0
    );

  // ===========================================
  // CASHFLOW
  // ===========================================

  if(cashflow < 0){

    recommendationsIT.push(
      "➡️ Priorità: riportare il cashflow in positivo riducendo i costi operativi o rivedendo la struttura del mutuo."
    );

    recommendationsEN.push(
      "➡️ Priority: restore positive cashflow by reducing operating costs or optimizing the mortgage structure."
    );

  }

  // ===========================================
  // OCCUPANCY
  // ===========================================

  if(occupancy < 60){

    recommendationsIT.push(
      "➡️ Incrementare il tasso di occupazione dovrebbe essere una priorità prima di aumentare le tariffe."
    );

    recommendationsEN.push(
      "➡️ Increasing occupancy should be prioritized before raising nightly rates."
    );

  }

  // ===========================================
  // HIGH COSTS
  // ===========================================

  if(
    revenue > 0 &&
    expenses >= revenue * 0.50
  ){

    recommendationsIT.push(
      "➡️ Ridurre l'incidenza dei costi operativi migliorerebbe direttamente il margine netto."
    );

    recommendationsEN.push(
      "➡️ Reducing operating expenses would directly improve net profitability."
    );

  }

  // ===========================================
  // MORTGAGE
  // ===========================================

  if(mortgage >= 80){

    recommendationsIT.push(
      "➡️ Valutare una leva finanziaria più equilibrata aumenterebbe la resilienza dell'investimento."
    );

    recommendationsEN.push(
      "➡️ A more balanced leverage strategy would improve investment resilience."
    );

  }

  // ===========================================
  // LOW ROI
  // ===========================================

  if(
    roi > 0 &&
    roi < 12
  ){

    recommendationsIT.push(
      "➡️ Il rendimento può essere migliorato intervenendo su ricavi, occupazione e ottimizzazione dei costi."
    );

    recommendationsEN.push(
      "➡️ Returns can be improved by increasing revenue, occupancy and cost efficiency."
    );

  }

  // ===========================================
  // PREMIUM
  // ===========================================

  if(
    roi >= 25 &&
    cashflow > 0 &&
    risk <= 35
  ){

    recommendationsIT.push(
      "✅ L'investimento appare ben bilanciato. Le priorità diventano la stabilità operativa e la crescita nel lungo periodo."
    );

    recommendationsEN.push(
      "✅ The investment appears well balanced. The next priority is long-term operational stability and growth."
    );

  }

  return window.t(

    recommendationsIT.join("\n\n"),

    recommendationsEN.join("\n\n")

  );

};

// ===============================================
// 🧠 EXECUTIVE CONFIDENCE ENGINE
// ===============================================

window.rbGenerateExecutiveConfidence = function(memory = {}){

  memory =
    window.rbNormalizeExecutiveMemory(memory);

  let confidence = 50;

  const reasonsIT = [];
  const reasonsEN = [];

  const fields = [

    memory.lastROI,

    memory.lastRisk,

    memory.lastOccupancy,

    memory.lastCashflow,

    memory.lastRevenue ??
    memory.revenueAnnual ??
    memory.gross,

    memory.lastExpenses ??
    memory.monthlyCosts ??
    memory.expenses,

    memory.lastMortgagePercent ??
    memory.mortgagePercent,

    memory.lastNightPrice ??
    memory.pricePerNight ??
    memory.nightly

  ];

  const available =
    fields.filter(v =>
      v !== undefined &&
      v !== null &&
      v !== ""
    ).length;

  confidence += available * 5;

  if(
    Number(memory.lastROI || 0) > 0
  ){

    confidence += 5;

    reasonsIT.push(
      "✔ ROI disponibile"
    );

    reasonsEN.push(
      "✔ ROI available"
    );

  }

  if(
    Number(memory.lastRisk || 0) >= 0
  ){

    confidence += 5;

    reasonsIT.push(
      "✔ Analisi del rischio disponibile"
    );

    reasonsEN.push(
      "✔ Risk analysis available"
    );

  }

  if(
    Number(memory.lastCashflow || 0) !== 0
  ){

    confidence += 5;

    reasonsIT.push(
      "✔ Cashflow disponibile"
    );

    reasonsEN.push(
      "✔ Cashflow available"
    );

  }

  if(
    Number(memory.lastOccupancy || 0) > 0
  ){

    confidence += 5;

    reasonsIT.push(
      "✔ Occupazione disponibile"
    );

    reasonsEN.push(
      "✔ Occupancy available"
    );

  }

  confidence =
    Math.min(
      confidence,
      100
    );

  const titleIT =
    `🎯 Affidabilità AI: ${confidence}/100`;

  const titleEN =
    `🎯 AI Confidence: ${confidence}/100`;

  return window.t(

`${titleIT}

${reasonsIT.join("\n")}`,

`${titleEN}

${reasonsEN.join("\n")}`

  );

};

// ===============================================
// 🧠 EXECUTIVE INVESTMENT SUMMARY
// ===============================================

window.rbGenerateInvestmentSummary =
function(memory = null){

  memory =
    window.rbNormalizeExecutiveMemory(

      memory ||

      window.rbGetAIContext() ||

      {}

    );

  console.log(
  "🧠 AI CONTEXT:",
  memory
);

  const executiveReasoning =
  window.rbGenerateExecutiveReasoning(
    memory
  );

  const executiveWarnings =
  window.rbDetectExecutiveContradictions(
    memory
  );

  const executiveRecommendations =
  window.rbGenerateStrategicRecommendations(
    memory
  );

  const executiveConfidence =
  window.rbGenerateExecutiveConfidence(
    memory
  );

  const city =
    memory.lastCity ||
    "roma";

  const roi =
    Number(memory.lastROI || 0);

  const risk =
    Number(memory.lastRisk || 0);

  const mortgage =
    Number(memory.lastMortgagePercent || 0);

  const occupancy =
    Number(memory.lastOccupancy || 0);

  const cashflow =
    Number(memory.lastCashflow || 0);

const revenue =
    Number(
        memory.lastRevenue ??
        memory.revenueAnnual ??
        memory.gross ??
        0
    );

const expenses =
    Number(
        memory.lastExpenses ??
        memory.monthlyCosts ??
        memory.expenses ??
        0
    );

const nightly =
    Number(
        memory.lastNightPrice ??
        memory.pricePerNight ??
        memory.nightly ??
        0
    );

  const access =
    window.getUserAccess?.() || {};

  let summaryIT = [];
  let summaryEN = [];

  // ===========================================
  // 🌍 MARKET ANALYSIS
  // ===========================================

  summaryIT.push(
    `📍 Analisi mercato: ${city}`
  );

  summaryEN.push(
    `📍 Market analysis: ${city}`
  );

// ===========================================
// 🧠 EXECUTIVE ANALYSIS
// Single Source of Truth
// ===========================================

if(memory.executiveAnalysisIT){

    summaryIT.push(
        memory.executiveAnalysisIT
    );

}

if(memory.executiveAnalysisEN){

    summaryEN.push(
        memory.executiveAnalysisEN
    );

}
  
  // ===========================================
  // 🔒 FREE USER STRATEGY
  // ===========================================

  if(
    access.isFree &&
    !access.isInvestor &&
    !access.isPro &&
    !access.isAdmin
  ){

    summaryIT.push(
      "🔒 Per analisi avanzate su rischio reale, sostenibilità e benchmark completi è richiesto il piano Investor o PRO."
    );

    summaryEN.push(
      "🔒 Advanced analysis for real risk, sustainability and benchmarks requires Investor or PRO access."
    );

  }

if(executiveReasoning){

  if(window.currentLanguage === "en"){

    summaryEN.push(
      executiveReasoning
    );

  }else{

    summaryIT.push(
      executiveReasoning
    );

  }

}

    if(executiveWarnings){

  if(window.currentLanguage === "en"){

    summaryEN.push(
      executiveWarnings
    );

  }else{

    summaryIT.push(
      executiveWarnings
    );

  }

}

  if(executiveRecommendations){

  if(window.currentLanguage === "en"){

    summaryEN.push(
      executiveRecommendations
    );

  }else{

    summaryIT.push(
      executiveRecommendations
    );

  }

}

  if(executiveConfidence){

  if(window.currentLanguage === "en"){

    summaryEN.push(
      executiveConfidence
    );

  }else{

    summaryIT.push(
      executiveConfidence
    );

  }

}
  
console.log(
  "🧠 SUMMARY IT:",
  summaryIT
);

console.log(
  "🧠 SUMMARY EN:",
  summaryEN
);

const finalSummary =
  window.t(

    summaryIT.join("\n\n"),

    summaryEN.join("\n\n")

  );

console.log(
  "🧠 FINAL SUMMARY:",
  finalSummary
);

return finalSummary;

};

// ===============================================
// 🚀 ENGINE READY
// ===============================================

console.log(
  "🧠 REASONING ENGINE READY"
);



// ===============================================
// 🧠 AI SIGNAL ENGINE
// ===============================================

window.rbGenerateAISignals = function(data = {}){

  const signals = [];

  const roi =
    Number(data.roi || 0);

  const occupancy =
    Number(data.occupancy || 0);

  const priceNight =
    Number(data.priceNight || 0);

  const gross =
    Number(data.gross || 0);

  const costs =
    Number(data.costs || 0);

  // ===============================================
  // 🚀 AGGRESSIVE PROJECTION
  // ===============================================

  if(

    roi > 40 &&

    occupancy > 65 &&

    priceNight > 180

  ){

    signals.push({
      type: "aggressive_projection",

      message:
`
🚀 La simulazione mostra metriche
molto aggressive rispetto
alla media del mercato.

Il ROI potrebbe risultare
ottimistico in scenari reali.
`
    });

  }

  // ===============================================
  // ⚠️ UNSTABLE ROI
  // ===============================================

  if(

    roi > 20 &&

    occupancy < 45

  ){

    signals.push({

      type: "unstable_roi",

      message:
`
⚠️ Il ROI appare elevato,
ma l'occupazione potrebbe
non sostenere stabilmente
questi risultati.
`
    });

  }

  // ===============================================
  // 💸 MARGIN PRESSURE
  // ===============================================

  if(

    gross > 0 &&

    costs > gross * 0.55

  ){

    signals.push({

      type: "margin_pressure",

      message:
`
💸 I costi operativi incidono
fortemente sul margine netto.

Ottimizzare le spese potrebbe
migliorare il cashflow.
`
    });

  }

  // ===============================================
  // 🏨 LOW OCCUPANCY
  // ===============================================

  if(
    occupancy < 50
  ){

    signals.push({

      type: "low_occupancy",

      message:
`
🏨 L'occupazione attuale
risulta sotto la soglia ideale
per uno short-rent competitivo.
`
    });

  }

  // ===============================================
  // 💎 PREMIUM PROPERTY
  // ===============================================

  if(

    priceNight >= 180 &&

    occupancy >= 65

  ){

    signals.push({

      type: "premium_property",

      message:
`
💎 La struttura mostra
caratteristiche premium
compatibili con fascia alta.
`
    });

  }

  console.log(
    "🧠 AI SIGNALS:",
    signals
  );

  return signals;

}

// ===============================================
// 🧠 EXECUTIVE ASSESSMENT ENGINE
// Silicon Valley 2026 Executive Intelligence Layer
// ===============================================

window.rbGenerateExecutiveAssessment = function(memory = {}){

  const assessment = {

    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    priorities: [],
    recommendations: [],
    executiveConclusion: "",
    confidence: 50,
    investmentGrade: "C"

  };

  const roi =
    Number(memory.lastROI || 0);

  const risk =
    Number(memory.lastRisk || 0);

  const occupancy =
    Number(memory.lastOccupancy || 0);

  const cashflow =
    Number(memory.lastCashflow || 0);

  const mortgage =
    Number(
      memory.lastMortgagePercent ??
      memory.mortgagePercent ??
      0
    );

  const revenue =
    Number(
      memory.lastRevenue ??
      memory.revenueAnnual ??
      memory.gross ??
      0
    );

  const expenses =
    Number(
      memory.lastExpenses ??
      memory.monthlyCosts ??
      memory.expenses ??
      0
    );

  const nightly =
    Number(
      memory.lastNightPrice ??
      memory.pricePerNight ??
      memory.nightly ??
      0
    );

  // ===========================================
  // 💚 STRENGTHS
  // ===========================================

  if(roi >= 20){

    assessment.strengths.push({

      id:"roi",

      weight:10,

      text:window.t(

        "ROI superiore alla media di mercato.",

        "ROI above market average."

      )

    });

  }

  if(risk <= 35){

    assessment.strengths.push({

      id:"risk",

      weight:8,

      text:window.t(

        "Profilo di rischio contenuto.",

        "Controlled risk profile."

      )

    });

  }

  if(cashflow > 0){

    assessment.strengths.push({

      id:"cashflow",

      weight:10,

      text:window.t(

        "Cashflow positivo.",

        "Positive cashflow."

      )

    });

  }

  if(occupancy >= 70){

    assessment.strengths.push({

      id:"occupancy",

      weight:8,

      text:window.t(

        "Ottimo tasso di occupazione.",

        "Strong occupancy rate."

      )

    });

  }

  if(expenses < revenue * 0.45 && revenue > 0){

    assessment.strengths.push({

      id:"costs",

      weight:7,

      text:window.t(

        "Ottimo controllo dei costi.",

        "Strong cost efficiency."

      )

    });

  }

  // ===========================================
  // ❤️ WEAKNESSES
  // ===========================================

  if(roi < 12){

    assessment.weaknesses.push({

      id:"roi",

      weight:10,

      text:window.t(

        "ROI inferiore agli obiettivi.",

        "ROI below target."

      )

    });

  }

  if(cashflow <= 0){

    assessment.weaknesses.push({

      id:"cashflow",

      weight:10,

      text:window.t(

        "Cashflow negativo.",

        "Negative cashflow."

      )

    });

  }

  if(risk >= 60){

    assessment.weaknesses.push({

      id:"risk",

      weight:9,

      text:window.t(

        "Rischio operativo elevato.",

        "High operational risk."

      )

    });

  }

  if(occupancy < 55){

    assessment.weaknesses.push({

      id:"occupancy",

      weight:8,

      text:window.t(

        "Occupazione insufficiente.",

        "Low occupancy."

      )

    });

  }

  if(expenses > revenue * 0.60 && revenue > 0){

    assessment.weaknesses.push({

      id:"costs",

      weight:8,

      text:window.t(

        "Costi operativi elevati.",

        "High operating costs."

      )

    });

  }

    // ===========================================
  // 🚀 OPPORTUNITIES
  // ===========================================

  if(
    occupancy < 70 &&
    roi >= 15
  ){

    assessment.opportunities.push({

      id:"occupancy",

      impact:9,

      text:window.t(

        "Incrementare l'occupazione potrebbe aumentare significativamente il rendimento.",

        "Increasing occupancy could significantly improve profitability."

      )

    });

  }

  if(
    nightly < 180 &&
    occupancy >= 65
  ){

    assessment.opportunities.push({

      id:"pricing",

      impact:8,

      text:window.t(

        "Esiste margine per aumentare la tariffa media.",

        "There is room to increase the average nightly rate."

      )

    });

  }

  if(
    expenses >= revenue * 0.45 &&
    revenue > 0
  ){

    assessment.opportunities.push({

      id:"costs",

      impact:9,

      text:window.t(

        "Una riduzione dei costi migliorerebbe immediatamente il margine netto.",

        "Reducing operating costs would immediately improve net profitability."

      )

    });

  }

  if(
    mortgage >= 60 &&
    cashflow > 0
  ){

    assessment.opportunities.push({

      id:"mortgage",

      impact:7,

      text:window.t(

        "Ottimizzare il mutuo aumenterebbe la resilienza finanziaria.",

        "Optimizing the mortgage would improve financial resilience."

      )

    });

  }

  // ===========================================
  // ⚠️ THREATS
  // ===========================================

  if(
    mortgage >= 85 &&
    cashflow <= 0
  ){

    assessment.threats.push({

      id:"leverage",

      severity:10,

      text:window.t(

        "Leva finanziaria molto aggressiva.",

        "Very aggressive financial leverage."

      )

    });

  }

  if(
    roi >= 25 &&
    occupancy < 45
  ){

    assessment.threats.push({

      id:"optimistic_roi",

      severity:9,

      text:window.t(

        "Il ROI potrebbe dipendere da ipotesi troppo ottimistiche.",

        "ROI may rely on overly optimistic assumptions."

      )

    });

  }

  if(
    revenue > 0 &&
    expenses > revenue
  ){

    assessment.threats.push({

      id:"negative_margin",

      severity:10,

      text:window.t(

        "I costi superano i ricavi stimati.",

        "Expenses exceed estimated revenue."

      )

    });

  }

  if(
    risk >= 75
  ){

    assessment.threats.push({

      id:"risk",

      severity:10,

      text:window.t(

        "Il rischio operativo è estremamente elevato.",

        "Operational risk is extremely high."

      )

    });

  }

  // ===========================================
  // 🔥 PRIORITY ENGINE
  // ===========================================

  if(cashflow <= 0){

    assessment.priorities.push({

      priority:1,

      icon:"💸",

      text:window.t(

        "Ripristinare un cashflow positivo.",

        "Restore positive cashflow."

      )

    });

  }

  if(mortgage >= 80){

    assessment.priorities.push({

      priority:2,

      icon:"🏦",

      text:window.t(

        "Ridurre la leva finanziaria.",

        "Reduce financial leverage."

      )

    });

  }

  if(occupancy < 60){

    assessment.priorities.push({

      priority:3,

      icon:"🏨",

      text:window.t(

        "Incrementare l'occupazione.",

        "Increase occupancy."

      )

    });

  }

  if(
    expenses >= revenue * 0.50 &&
    revenue > 0
  ){

    assessment.priorities.push({

      priority:4,

      icon:"📉",

      text:window.t(

        "Ottimizzare i costi operativi.",

        "Optimize operating costs."

      )

    });

  }

    // ===========================================
  // 🎯 INVESTMENT GRADE
  // ===========================================

  let score = 50;

  score += assessment.strengths.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  score -= assessment.weaknesses.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  score -= assessment.threats.reduce(
    (sum, item) => sum + item.severity,
    0
  ) * 0.5;

  score += assessment.opportunities.reduce(
    (sum, item) => sum + item.impact,
    0
  ) * 0.3;

  score =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );

  assessment.confidence = score;

  // ===========================================
  // 🏆 EXECUTIVE GRADE
  // ===========================================

  if(score >= 95){

    assessment.investmentGrade = "A+";

  }
  else if(score >= 90){

    assessment.investmentGrade = "A";

  }
  else if(score >= 80){

    assessment.investmentGrade = "B+";

  }
  else if(score >= 70){

    assessment.investmentGrade = "B";

  }
  else if(score >= 60){

    assessment.investmentGrade = "C+";

  }
  else if(score >= 50){

    assessment.investmentGrade = "C";

  }
  else if(score >= 40){

    assessment.investmentGrade = "D";

  }
  else{

    assessment.investmentGrade = "E";

  }

  // ===========================================
  // 🧠 EXECUTIVE CONCLUSION
  // ===========================================

  if(

    roi >= 20 &&

    risk <= 35 &&

    cashflow > 0

  ){

    assessment.executiveConclusion =
      window.t(

`L'investimento presenta una struttura estremamente solida.

Le metriche finanziarie risultano coerenti tra redditività, rischio e sostenibilità.

Può rappresentare un'ottima opportunità di medio-lungo periodo.`,

`The investment shows a very strong financial structure.

Profitability, risk and sustainability appear well balanced.

It represents an excellent medium to long-term opportunity.`

      );

  }

  else if(

    roi >= 15 &&

    cashflow > 0

  ){

    assessment.executiveConclusion =
      window.t(

`L'investimento appare interessante ma presenta margini di ottimizzazione.

Intervenire sui principali indicatori potrebbe incrementare ulteriormente la redditività.`,

`The investment appears promising but still offers room for optimization.

Improving key metrics could further increase profitability.`

      );

  }

  else if(

    cashflow < 0 ||

    roi < 10

  ){

    assessment.executiveConclusion =
      window.t(

`La struttura economica richiede attenzione.

Prima di procedere sarebbe opportuno migliorare gli indicatori principali per ridurre il rischio operativo.`,

`The financial structure requires attention.

Key metrics should be improved before proceeding in order to reduce operational risk.`

      );

  }

  else{

    assessment.executiveConclusion =
      window.t(

`Lo scenario risulta equilibrato ma necessita ulteriori verifiche prima di una decisione definitiva.`,

`The scenario appears balanced but requires further validation before making a final investment decision.`

      );

  }

  // ===========================================
  // 📋 SORT PRIORITIES
  // ===========================================

  assessment.priorities.sort(

    (a,b)=>

      a.priority -

      b.priority

  );

  // ===========================================
  // 📈 SORT SWOT
  // ===========================================

  assessment.strengths.sort(
    (a,b)=>b.weight-a.weight
  );

  assessment.weaknesses.sort(
    (a,b)=>b.weight-a.weight
  );

  assessment.opportunities.sort(
    (a,b)=>b.impact-a.impact
  );

  assessment.threats.sort(
    (a,b)=>b.severity-a.severity
  );

    // ===========================================
  // 📌 EXECUTIVE RECOMMENDATIONS
  // ===========================================

  assessment.recommendations =

    window
      .rbGenerateStrategicRecommendations(memory)
      .split("\n\n")
      .filter(Boolean);

  // ===========================================
  // 🧠 DEBUG
  // ===========================================

  console.log(

    "🧠 EXECUTIVE ASSESSMENT:",

    assessment

  );

  // ===========================================
  // ✅ RETURN OBJECT
  // ===========================================

  return assessment;

};
