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
// 🧠 HELPERS
// ===========================================

const has = (...words) =>
  words.some(word => text.includes(word));

const hasAll = (...words) =>
  words.every(word => text.includes(word));  

// ===========================================
// ❓ EDUCATION / EXPLANATION
// PRIORITÀ MASSIMA
// ===========================================

const explainWords = [

  "spiega",
  "spiegami",

  "explain",

  "cos'è",
  "cos e",
  "cose",

  "cosa è",
  "cosa e",

  "what is",

  "significa",
  "meaning",

  "definizione",
  "definition"

];

const isEducation =

  explainWords.some(word =>

    text.includes(word)

  );

if(isEducation){

  return {

    intent: "education",

    confidence: 0.99,

    category: "education",

    requiresCalculation: false,

    requiresMarketData: false,

    requiresRiskAnalysis: false,

    requiresMortgageAnalysis: false,

    requiresComparison: false

  };

}

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
  "rata",

  "tasso fisso",
  "tasso variabile",

  "fisso",
  "variabile",

  "mutuo 100",

  "durata mutuo"

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
// 🌍 MARKET ANALYSIS
// ===========================================

if(

  has(

    "mercato",
    "market",
    "benchmark",
    "occupazione",
    "occupancy",
    "stagionalità",
    "domanda",
    "airbnb roma",
    "airbnb milano",
    "short rent",
    "benchmark roma",
    "benchmark milano",
    "occupazione media",
    "occupazione roma",
    "occupazione milano"

  )

){

  result.intent = "market_analysis";

  result.category = "market";

  result.confidence = 0.94;

  result.requiresMarketData = true;

}

// ===========================================
// 💼 INVESTMENT ADVISOR
// ===========================================

if(

  has(

    "conviene aprire",
    "dove investire",
    "voglio aprire",
    "aprire un b&b",
    "aprire un airbnb",
    "b&b al mare",
    "airbnb al mare",
    "ho 80k",
    "ho 100k",
    "investire a roma",
    "investire a milano"

  )

){

  result.intent = "investment_advisor";

  result.category = "strategy";

  result.confidence = 0.96;

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
  "opportunità",

  "profittevole",
  "redditività",

  "miglior città",
  "migliore città",

  "aprire b&b",
  "aprire airbnb"

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
  // 💳 SUBSCRIPTIONS / PRICING
  // ===========================================

  const subscriptionWords = [

    "pro",
    "investor",

    "abbonamento",
    "abbonamenti",

    "pricing",
    "premium",

    "piano",
    "piani",

    "quanto costa",
    "costo",

    "upgrade",

    "pro plan",
    "investor plan",

    "piano pro",
    "piano investor",

    "differenza investor",
    "differenza pro",

    "funzioni pro",
    "funzioni investor"

  ];

  if(
    subscriptionWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent = "subscriptions";

    result.category = "business";

    result.confidence = 0.97;

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
// 🧠 FALLBACK SMART
// ===========================================

if(

  result.intent === "generic"

){

  // ROI / EDUCATION

  if(
    has(
      "roi",
      "cashflow",
      "break even",
      "dscr",
      "sostenibilità"
    )
  ){

    result.intent = "education";

    result.category = "education";

    result.confidence = 0.80;

  }

  // MARKET

  else if(
    has(
      "roma",
      "milano",
      "napoli",
      "firenze",
      "benchmark",
      "occupazione"
    )
  ){

    result.intent = "market_analysis";

    result.category = "market";

    result.confidence = 0.75;

    result.requiresMarketData = true;

  }

}

// ===========================================
// 🧠 DEBUG
// ===========================================

console.log(
  "🧠 INTENT ENGINE:",
  result
);

return result;

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 INTENT ENGINE READY"
);
