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

  return (
    window.rbAIContextMemory ||
    {}
  );

};

// ===============================================
// 🧠 EXECUTIVE CROSS REASONING
// ===============================================

window.rbGenerateExecutiveReasoning = function(memory = {}){

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
    memory ||
    window.rbGetAIContext() ||
    {};

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
  // 📈 ROI INTELLIGENCE
  // ===========================================

  if(roi >= 25){

    summaryIT.push(
      `🚀 ROI estremamente elevato (${roi.toFixed(1)}%). L'investimento performa molto sopra la media di mercato.`
    );

    summaryEN.push(
      `🚀 Extremely high ROI (${roi.toFixed(1)}%). The investment performs well above market average.`
    );

  }else if(roi >= 15){

    summaryIT.push(
      `📈 ROI molto competitivo (${roi.toFixed(1)}%).`
    );

    summaryEN.push(
      `📈 Highly competitive ROI (${roi.toFixed(1)}%).`
    );

  }else if(roi > 0){

    summaryIT.push(
      `📊 ROI moderato (${roi.toFixed(1)}%).`
    );

    summaryEN.push(
      `📊 Moderate ROI (${roi.toFixed(1)}%).`
    );

  }else{

    summaryIT.push(
      `❌ ROI negativo o investimento non sostenibile (${roi.toFixed(1)}%).`
    );

    summaryEN.push(
      `❌ Negative ROI or financially unsustainable investment (${roi.toFixed(1)}%).`
    );

  }

  // ===========================================
  // ⚠️ RISK ENGINE
  // ===========================================

  if(risk >= 70){

    summaryIT.push(
      `⚠️ Il rischio operativo risulta elevato (${risk}/100).`
    );

    summaryEN.push(
      `⚠️ Operational risk appears high (${risk}/100).`
    );

  }else if(risk >= 40){

    summaryIT.push(
      `🟡 Profilo rischio moderato (${risk}/100).`
    );

    summaryEN.push(
      `🟡 Moderate risk profile (${risk}/100).`
    );

  }else{

    summaryIT.push(
      `✅ Profilo rischio stabile (${risk}/100).`
    );

    summaryEN.push(
      `✅ Stable risk profile (${risk}/100).`
    );

  }

  // ===========================================
  // 🏦 FINANCIAL STRUCTURE
  // ===========================================

  if(mortgage >= 80){

    summaryIT.push(
      "🏦 Leva finanziaria molto aggressiva."
    );

    summaryEN.push(
      "🏦 Very aggressive financial leverage."
    );

  }else if(mortgage >= 50){

    summaryIT.push(
      "🏦 Mutuo sostenibile ma da monitorare."
    );

    summaryEN.push(
      "🏦 Sustainable mortgage structure but requires monitoring."
    );

  }

  // ===========================================
  // 🏠 OCCUPANCY ENGINE
  // ===========================================

  if(occupancy >= 75){

    summaryIT.push(
      `🔥 Occupazione molto forte (${occupancy}%).`
    );

    summaryEN.push(
      `🔥 Very strong occupancy (${occupancy}%).`
    );

  }else if(occupancy <= 40){

    summaryIT.push(
      `⚠️ Occupazione debole (${occupancy}%).`
    );

    summaryEN.push(
      `⚠️ Weak occupancy (${occupancy}%).`
    );

  }

  // ===========================================
  // 💸 CASHFLOW ENGINE
  // ===========================================

  if(cashflow > 0){

    summaryIT.push(
      `💸 Cashflow positivo stimato: €${cashflow.toLocaleString()}.`
    );

    summaryEN.push(
      `💸 Positive estimated cashflow: €${cashflow.toLocaleString()}.`
    );

  }else if(cashflow < 0){

    summaryIT.push(
      `❌ Cashflow negativo stimato: €${cashflow.toLocaleString()}.`
    );

    summaryEN.push(
      `❌ Negative estimated cashflow: €${cashflow.toLocaleString()}.`
    );

  }

  // ===========================================
  // 💰 REVENUE ANALYSIS
  // ===========================================

  if(revenue > 0){

    summaryIT.push(
      `💰 Ricavi stimati: €${revenue.toLocaleString()} annui.`
    );

    summaryEN.push(
      `💰 Estimated annual revenue: €${revenue.toLocaleString()}.`
    );

  }

  // ===========================================
  // 🧾 COST ANALYSIS
  // ===========================================

  if(expenses >= revenue * 0.6){

    summaryIT.push(
      "⚠️ I costi operativi sembrano molto elevati rispetto ai ricavi."
    );

    summaryEN.push(
      "⚠️ Operating expenses appear high compared to revenue."
    );

  }

  // ===========================================
  // 🌙 NIGHT PRICE ANALYSIS
  // ===========================================

  if(nightly >= 250){

    summaryIT.push(
      "🌙 Strategia premium pricing rilevata."
    );

    summaryEN.push(
      "🌙 Premium pricing strategy detected."
    );

  }

  // ===========================================
  // 🧠 STRATEGIC AI CONCLUSION
  // ===========================================

  if(
    roi >= 15 &&
    risk <= 40 &&
    cashflow > 0
  ){

    summaryIT.push(
      "🧠 Executive AI: l'investimento mostra una struttura molto forte tra rendimento, rischio e sostenibilità."
    );

    summaryEN.push(
      "🧠 Executive AI: the investment shows a strong balance between profitability, risk and sustainability."
    );

  }

  if(
    roi <= 0 ||
    cashflow < 0
  ){

    summaryIT.push(
      "🚨 Executive AI: la struttura economica attuale presenta criticità operative e finanziarie."
    );

    summaryEN.push(
      "🚨 Executive AI: the current financial structure shows operational and financial weaknesses."
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
