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
// 🧠 EXECUTIVE INVESTMENT SUMMARY
// ===============================================

window.rbGenerateInvestmentSummary =
function(){

  const memory =
    window.rbGetAIContext();

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
    Number(memory.lastRevenue || 0);

  const expenses =
    Number(memory.lastExpenses || 0);

  const nightly =
    Number(memory.lastNightPrice || 0);

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

  return window.t(

    summaryIT.join("\n\n"),

    summaryEN.join("\n\n")

  );

};

// ===============================================
// 🚀 ENGINE READY
// ===============================================

console.log(
  "🧠 REASONING ENGINE READY"
);
