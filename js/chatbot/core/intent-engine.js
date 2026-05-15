// ===============================================
// 🧠 RENDIMENTOBB – INTENT ENGINE 1.0
// Silicon Valley AI Intent Detection Layer
// Bilingual + Modular + Scale Ready
// ===============================================

window.rbDetectIntent = function(message = ""){

  // ===========================================
  // 🧹 NORMALIZE
  // ===========================================

  const text = String(message)
    .toLowerCase()
    .trim();

  // ===========================================
  // 🧠 DEFAULT RESULT
  // ===========================================

  const result = {

    intent: "generic",

    confidence: 0,

    category: "general",

    requiresCalculation: false,

    requiresMarketData: false,

    requiresRiskAnalysis: false,

    requiresMortgageAnalysis: false,

    requiresComparison: false

  };

  // ===========================================
  // 📈 ROI
  // ===========================================

  const roiWords = [

    "roi",
    "rendimento",
    "profitto",
    "guadagno",
    "returns",
    "yield"

  ];

  if(
    roiWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent = "roi_analysis";

    result.category = "finance";

    result.confidence = 0.95;

    result.requiresCalculation = true;

  }

  // ===========================================
  // 💸 CASHFLOW
  // ===========================================

  const cashflowWords = [

    "cashflow",
    "cash flow",
    "flusso",
    "entrate",
    "uscite",
    "utile netto"

  ];

  if(
    cashflowWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent = "cashflow_analysis";

    result.category = "finance";

    result.confidence = 0.95;

    result.requiresCalculation = true;

  }

  // ===========================================
  // ⚠️ RISK
  // ===========================================

  const riskWords = [

    "rischio",
    "risk",
    "pericoloso",
    "sicuro",
    "affidabile"

  ];

  if(
    riskWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent = "risk_analysis";

    result.category = "risk";

    result.confidence = 0.92;

    result.requiresRiskAnalysis = true;

  }

  // ===========================================
  // 🏦 MORTGAGE
  // ===========================================

  const mortgageWords = [

    "mutuo",
    "mortgage",
    "loan",
    "finanziamento",
    "ltv",
    "rata"

  ];

  if(
    mortgageWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent = "mortgage_analysis";

    result.category = "mortgage";

    result.confidence = 0.95;

    result.requiresMortgageAnalysis = true;

    result.requiresCalculation = true;

  }

  // ===========================================
  // 🌍 MARKET
  // ===========================================

  const marketWords = [

    "mercato",
    "market",
    "città",
    "city",
    "zona",
    "location"

  ];

  if(
    marketWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent = "market_analysis";

    result.category = "market";

    result.confidence = 0.90;

    result.requiresMarketData = true;

  }

  // ===========================================
  // ⚖️ COMPARISON
  // ===========================================

  const comparisonWords = [

    "vs",
    "contro",
    "meglio",
    "compare",
    "comparazione",
    "difference"

  ];

  if(
    comparisonWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent = "comparison";

    result.category = "comparison";

    result.confidence = 0.93;

    result.requiresComparison = true;

  }

  // ===========================================
  // 🧠 STRATEGY
  // ===========================================

  const strategyWords = [

    "conviene",
    "investire",
    "investimento",
    "strategia",
    "strategy",
    "opportunità"

  ];

  if(
    strategyWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent = "investment_strategy";

    result.category = "strategy";

    result.confidence = 0.91;

  }

  // ===========================================
  // ❓ EXPLANATION
  // ===========================================

  const explainWords = [

    "spiega",
    "explain",
    "cos'è",
    "what is",
    "significa",
    "meaning"

  ];

  if(
    explainWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent = "education";

    result.category = "education";

    result.confidence = 0.88;

  }

  // ===========================================
  // 👋 GREETING
  // ===========================================

  const greetingWords = [

    "ciao",
    "hello",
    "hi",
    "salve",
    "hey"

  ];

  if(
    greetingWords.some(word =>
      text === word
    )
  ){

    result.intent = "greeting";

    result.category = "social";

    result.confidence = 1;

  }

  // ===========================================
  // 🧠 DEBUG
  // ===========================================

  console.log(
    "🧠 INTENT ENGINE:",
    result
  );

  return result;

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 INTENT ENGINE READY"
);
