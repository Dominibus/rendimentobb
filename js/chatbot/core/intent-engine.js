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

    const entities =
  window.rbExtractEntities
    ? window.rbExtractEntities(text)
    : {};
  
    .toLowerCase()
    .trim();

  // ===========================================
  // 🧠 DEFAULT RESULT
  // ===========================================

  const result = {

    intent: "generic",

    confidence: 0,

    priority: 0,

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
// 🧠 APPLY INTENT
// ===========================================

const applyIntent = (config = {}) => {

  const nextPriority =
    Number(config.priority || 0);

  if(
    nextPriority <= result.priority
  ){
    return;
  }

  Object.assign(
    result,
    config
  );

};

  // ===========================================
  // ❓ EDUCATION / EXPLANATION
  // PRIORITÀ MASSIMA
  // ===========================================

  const explainWords = [

    // 🇮🇹 ITALIANO
    "spiega",
    "spiegami",

    "cos'è",
    "cos e",
    "cose",

    "cosa è",
    "cosa e",

    "significa",
    "definizione",

    // 🇬🇧 ENGLISH
    "explain",

    "what is",

    "meaning",
    "definition"

  ];

  const isEducation =

    explainWords.some(word =>

      text.includes(word)

    );

  if(isEducation){

  applyIntent({

    intent: "education",

    confidence: 0.99,

    priority: 100,

    category: "education"

  });

}

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

    // 🇮🇹 ITALIANO
    "roi",
    "rendimento",

    "profitto",
    "guadagno",

    "redditività",

    "ritorno investimento",

    // 🇬🇧 ENGLISH
    "returns",
    "yield",

    "profit",
    "profitability",

    "return on investment"

  ];

  if(
    roiWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent =
      "roi_analysis";

    result.category =
      "finance";

    result.confidence =
      0.95;

    result.requiresCalculation =
      true;

  }

  // ===========================================
  // 💸 CASHFLOW
  // ===========================================

  const cashflowWords = [

    // 🇮🇹 ITALIANO
    "cashflow",
    "cash flow",

    "flusso",
    "flusso cassa",

    "entrate",
    "uscite",

    "utile netto",

    "profitto netto",

    "guadagno mensile",

    // 🇬🇧 ENGLISH
    "cashflow",
    "cash flow",

    "income",
    "expenses",

    "net profit",

    "monthly income",

    "monthly profit"

  ];

  if(
    cashflowWords.some(word =>
      text.includes(word)
    )
  ){

    result.intent =
      "cashflow_analysis";

    result.category =
      "finance";

    result.confidence =
      0.95;

    result.requiresCalculation =
      true;

  }

// ===========================================
// ⚠️ RISK
// ===========================================

const riskWords = [

  // 🇮🇹 ITALIANO
  "rischio",
  "pericoloso",

  "sicuro",
  "affidabile",

  "alto rischio",
  "basso rischio",

  "rischioso",
  "instabile",

  "volatilità",
  "fragile",

  "mercato rischioso",
  "investimento rischioso",

  // 🇬🇧 ENGLISH
  "risk",
  "risky",

  "safe",
  "unsafe",

  "reliable",
  "stable",
  "unstable",

  "high risk",
  "low risk",

  "volatility",
  "fragile",

  "risky investment",
  "risky market"

];

if(
  riskWords.some(word =>
    text.includes(word)
  )
){

  result.intent =
    "risk_analysis";

  result.category =
    "risk";

  result.confidence =
    0.92;

  result.requiresRiskAnalysis =
    true;

}

// ===========================================
// 🏦 MORTGAGE
// ===========================================

const mortgageWords = [

  // 🇮🇹 ITALIANO
  "mutuo",
  "con mutuo",
  "con un mutuo",

  "finanziamento",
  "finanziare",

  "leva",
  "leva finanziaria",

  "ltv",
  "rata",

  "tasso fisso",
  "tasso variabile",

  "fisso",
  "variabile",

  "mutuo 100",
  "mutuo 90",
  "mutuo 80",

  "durata mutuo",

  "finanziato",

  // 🇬🇧 ENGLISH
  "mortgage",
  "loan",

  "financing",
  "finance property",

  "leverage",
  "financial leverage",

  "monthly payment",
  "mortgage payment",

  "fixed rate",
  "variable rate",

  "interest rate",

  "100 mortgage",
  "90 mortgage",
  "80 mortgage",

  "mortgage duration",
  "loan duration",

  "financed property"

];

if(
  mortgageWords.some(word =>
    text.includes(word)
  )
){

  applyIntent({

  intent:
    "mortgage_analysis",

  category:
    "mortgage",

  confidence:
    0.95,

  priority:
    80,

  requiresMortgageAnalysis:
    true,

  requiresCalculation:
    true

});

}

// ===========================================
// 🌍 MARKET ANALYSIS
// ===========================================

if(

  has(

    // 🇮🇹 ITALIANO
    "mercato",
    "benchmark",

    "occupazione",
    "occupazione media",

    "stagionalità",
    "domanda",

    "airbnb roma",
    "airbnb milano",

    "benchmark roma",
    "benchmark milano",

    "occupazione roma",
    "occupazione milano",

    "short rent",

    // 🇬🇧 ENGLISH
    "market",
    "market analysis",

    "market benchmark",

    "occupancy",
    "average occupancy",

    "seasonality",
    "demand",

    "airbnb rome",
    "airbnb milan",

    "rome benchmark",
    "milan benchmark",

    "rome occupancy",
    "milan occupancy",

    "short-term rental",
    "short rent market"

  )

){

  result.intent =
    "market_analysis";

  result.category =
    "market";

  result.confidence =
    0.94;

  result.requiresMarketData =
    true;

}

// ===========================================
// 💼 INVESTMENT ADVISOR
// ===========================================

if(

  has(

    // 🇮🇹 ITALIANO
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
    "investire a milano",

    // 🇬🇧 ENGLISH
    "should i open",
    "where to invest",

    "i want to open",

    "open a bnb",
    "open an airbnb",

    "beach bnb",
    "beach airbnb",

    "i have 80k",
    "i have 100k",

    "invest in rome",
    "invest in milan",

    "best city to invest",
    "best market to invest"

  )

){

  result.intent =
    "investment_advisor";

  result.category =
    "strategy";

  result.confidence =
    0.96;

  result.requiresMarketData =
    true;

}

// ===========================================
// ⚖️ COMPARISON
// ===========================================

const comparisonWords = [

  // 🇮🇹 ITALIANO
  "vs",
  "contro",

  "meglio",
  "peggio",

  "comparazione",
  "confronto",

  "differenza",

  // 🇬🇧 ENGLISH
  "compare",
  "comparison",

  "difference",

  "better",
  "worse",

  "versus"

];

if(
  comparisonWords.some(word =>
    text.includes(word)
  )
){

  result.intent =
    "comparison";

  result.category =
    "comparison";

  result.confidence =
    0.93;

  result.requiresComparison =
    true;

}

 // ===========================================
// 🧠 STRATEGY
// ===========================================

const strategyWords = [

  // 🇮🇹 ITALIANO
  "conviene",
  "conveniente",

  "investire",
  "investimento",

  "strategia",
  "opportunità",

  "profittevole",
  "redditività",

  "vale la pena",

  "miglior città",
  "migliore città",

  "aprire b&b",
  "aprire airbnb",

  "analisi executive",
  "analisi investimento",
  "report investimento",

  "analisi dettagliata",
  "analisi completa ai",

  "analisi strategica",
  "analisi completa",
  "analisi avanzata",

  "analisi professionale",
  "analisi ai",

  "fammi un'analisi",
  "analizza investimento",

  "valuta investimento",
  "valuta questo investimento",
  "valuta questo b&b",

  "conviene ancora",

  "come posso migliorare",
  "migliorare rendimento",

  "cashflow reale",
  "investimento sostenibile",
  "questo investimento",

  // 🇬🇧 ENGLISH
  "strategy",
  "investment strategy",

  "investment",

  "profitable",
  "profitability",

  "worth it",
  "does it make sense",

  "should i invest",
  "good investment",

  "best city",
  "best market",

  "open airbnb",
  "open bnb",

  "executive",
  "executive report",
  "executive analysis",

  "investment report",
  "advanced analysis",

  "investment advisor",
  "advisor",

  "analyze investment",
  "analyze this investment",

  "evaluate investment",
  "evaluate this bnb",

  "executive ai",

  "how can i improve",
  "improve performance",

  "real cashflow",
  "investment sustainability",

  "is it sustainable",
  "sustainable investment",

  "is this investment good",
  "is this investment worth it"

];

if(
  strategyWords.some(word =>
    text.includes(word)
  )
){

  // =====================================
  // 🧠 EXECUTIVE AI
  // =====================================

  if(

    has(

      // 🇮🇹 ITALIANO
      "analisi executive",
      "executive",

      "analisi completa",
      "analisi avanzata",

      "fammi un'analisi",
      "analizza investimento",

      "valuta investimento",
      "conviene ancora",

      "analisi professionale",
      "analisi ai",

      "come posso migliorare",
      "migliorare rendimento",

      "cashflow reale",

      "sostenibilità investimento",
      "sostenibile",
      "è sostenibile",

      "investimento sostenibile",

      "questo investimento",
      "conviene questo investimento",

      "vale la pena",
      "conveniente",

      // 🇬🇧 ENGLISH
      "sustainable",
      "sustainability",

      "is it sustainable",
      "investment sustainability",

      "sustainable investment",

      "is this investment good",
      "is this investment worth it",

      "worth it",
      "does it make sense",

      "should i invest",
      "good investment",

      "executive analysis",
      "advanced analysis",

      "analyze investment",
      "analyze this investment",

      "evaluate investment",

      "profitable investment"

    )

  ){

    result.intent =
      "investment_executive";

    result.category =
      "executive";

    result.confidence =
      0.99;

    result.requiresCalculation =
      true;

    result.requiresRiskAnalysis =
      true;

    result.requiresMarketData =
      true;

  }

  // =====================================
  // 📈 STANDARD STRATEGY
  // =====================================

  else{

    result.intent =
      "investment_strategy";

    result.category =
      "strategy";

    result.confidence =
      0.91;

  }

}

// ===========================================
// 💳 SUBSCRIPTIONS / PRICING
// ===========================================

const subscriptionWords = [

  // 🇮🇹 ITALIANO
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

  "piano pro",
  "piano investor",

  "differenza investor",
  "differenza pro",

  "funzioni pro",
  "funzioni investor",

  // 🇬🇧 ENGLISH
  "subscription",
  "subscriptions",

  "price",
  "pricing plan",

  "how much",
  "cost",

  "pro plan",
  "investor plan",

  "plan difference",

  "pro features",
  "investor features"

];

if(
  subscriptionWords.some(word =>
    text.includes(word)
  )
){

  result.intent =
    "subscriptions";

  result.category =
    "business";

  result.confidence =
    0.97;

}
 // ===========================================
// 👋 GREETING
// ===========================================

const greetingWords = [

  // 🇮🇹 ITALIANO
  "ciao",
  "salve",
  "hey",

  "buongiorno",
  "buonasera",

  // 🇬🇧 ENGLISH
  "hello",
  "hi",
  "hey",

  "good morning",
  "good evening"

];

if(
  greetingWords.some(word =>
    text === word
  )
){

  result.intent =
    "greeting";

  result.category =
    "social";

  result.confidence =
    1;

}

// ===========================================
// 🧠 FALLBACK SMART
// ===========================================

if(

  result.intent === "generic"

){

// =======================================
// 📚 EDUCATION / FINANCE
// =======================================

if(

  has(

      // 🇮🇹 ITALIANO
      "roi",
      "cashflow",

      "break even",
      "dscr",

      "profitto",
      "rendimento",

      "tasse",
      "fiscalità",
      "imposte",

      "iva",
      "cedolare",

      "mutuo",
      "cash flow",

      "sostenibilità",

      // 🇬🇧 ENGLISH
      "cash flow",

      "profit",
      "yield",

      "returns",

      "tax",
      "taxes",

      "mortgage",

      "sustainability"

    )

  ){

    result.intent =
      "education";

    result.category =
      "education";

    result.confidence =
      0.92;

  }

  // =======================================
  // 🌍 MARKET
  // =======================================

  else if(

    has(

      // 🇮🇹 ITALIANO
      "roma",
      "milano",
      "napoli",
      "firenze",

      "benchmark",
      "occupazione",

      "mercato",

      // 🇬🇧 ENGLISH
      "rome",
      "milan",
      "naples",
      "florence",

      "market",
      "occupancy",

      "market analysis"

    )

  ){

    result.intent =
      "market_analysis";

    result.category =
      "market";

    result.confidence =
      0.75;

    result.requiresMarketData =
      true;

  }

  // =======================================
  // 💼 GENERIC INVESTMENT
  // =======================================

  else if(

    has(

      // 🇮🇹 ITALIANO
      "investimento",
      "investire",

      "conviene",
      "conveniente",

      "vale la pena",

      // 🇬🇧 ENGLISH
      "investment",
      "invest",

      "worth it",

      "good investment"

    )

  ){

    result.intent =
      "investment_strategy";

    result.category =
      "strategy";

    result.confidence =
      0.70;

  }

}

// ===========================================
// 🧠 ENTITY CONTEXT BOOST
// ===========================================

if(
  entities.propertyType &&
  entities.city &&
  result.intent === "generic"
){

  applyIntent({

    intent:
      "investment_strategy",

    category:
      "strategy",

    confidence:
      0.82,

    priority:
      55,

    requiresMarketData:
      true

  });

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
