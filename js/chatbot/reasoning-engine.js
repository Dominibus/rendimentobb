// ===============================================
// 🧠 RENDIMENTOBB – REASONING ENGINE
// Advanced Conversational Intelligence Layer
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
    "e quindi?",
    "and?",
    "what about",
    "more details"

  ];

  return followUps.some(word =>
    text.includes(word)
  );

};

// ===============================================
// 🧠 GET AI MEMORY
// ===============================================

window.rbGetAIContext = function(){

  return (
    window.rbAIContextMemory ||
    {}
  );

};

// ===============================================
// 🧠 CONTEXTUAL INVESTMENT SUMMARY
// ===============================================

window.rbGenerateInvestmentSummary =
function(){

  const memory =
    window.rbGetAIContext();

  const city =
    memory.lastCity || "roma";

  const roi =
    Number(memory.lastROI || 0);

  const risk =
    Number(memory.lastRisk || 0);

  const mortgage =
    Number(memory.lastMortgagePercent || 0);

  let summaryIT = [];
  let summaryEN = [];

  // ===========================================
  // 🌍 CITY
  // ===========================================

  summaryIT.push(
    `📍 Mercato analizzato: ${city}`
  );

  summaryEN.push(
    `📍 Market analyzed: ${city}`
  );

  // ===========================================
  // 📈 ROI
  // ===========================================

  if(roi >= 10){

    summaryIT.push(
      "📈 ROI superiore alla media."
    );

    summaryEN.push(
      "📈 ROI above average."
    );

  }else if(roi > 0){

    summaryIT.push(
      "📊 ROI moderato."
    );

    summaryEN.push(
      "📊 Moderate ROI."
    );

  }

  // ===========================================
  // ⚠️ RISK
  // ===========================================

  if(risk >= 70){

    summaryIT.push(
      "⚠️ Rischio operativo elevato."
    );

    summaryEN.push(
      "⚠️ High operational risk."
    );

  }else if(risk > 0){

    summaryIT.push(
      "🟡 Rischio moderato."
    );

    summaryEN.push(
      "🟡 Moderate risk."
    );

  }

  // ===========================================
  // 🏦 MORTGAGE
  // ===========================================

  if(mortgage >= 80){

    summaryIT.push(
      "🏦 Leva finanziaria aggressiva."
    );

    summaryEN.push(
      "🏦 Aggressive financial leverage."
    );

  }

  return window.t(

    summaryIT.join("\n"),

    summaryEN.join("\n")

  );

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 REASONING ENGINE READY"
);
