// ===============================================
// 🧠 RENDIMENTOBB – INTENT ENGINE 1.0
// Silicon Valley AI Intent Detection Layer
// Bilingual + Modular + Scale Ready
// ===============================================

window.rbDetectIntent = function(message = ""){

const text = String(message)
  .toLowerCase()
  .trim();

// ===========================================
// 🧠 ENTITY EXTRACTION
// ===========================================

const entities =

  window.rbExtractEntities

    ? window.rbExtractEntities(text)

    : {};
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

 // ===========================================
// 📈 ROI ANALYSIS
// Silicon Valley Finance Intent
// ===========================================

const roiWords = [

  // 🇮🇹 ITALIANO
  "roi",
  "rendimento",

  "profitto",
  "guadagno",

  "redditività",

  "ritorno investimento",

  "ritorno economico",

  "margine",

  "quanto rende",

  "resa investimento",

  // 🇬🇧 ENGLISH
  "returns",
  "yield",

  "profit",
  "profitability",

  "return on investment",

  "investment return",

  "financial return",

  "investment yield"

];

if(
  roiWords.some(word =>
    text.includes(word)
  )
){

  applyIntent({

    intent:
      "roi_analysis",

    category:
      "finance",

    confidence:
      0.95,

    priority:
      70,

    requiresCalculation:
      true

  });

}

// ===========================================
// 💸 CASHFLOW ANALYSIS
// Silicon Valley Liquidity Engine
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

  "liquidità",

  "cassa",

  "profitto operativo",

  "margine operativo",

  // 🇬🇧 ENGLISH
  "cashflow",
  "cash flow",

  "income",
  "expenses",

  "net profit",

  "monthly income",

  "monthly profit",

  "liquidity",

  "operating profit",

  "operational margin",

  "monthly cashflow"

];

if(
  cashflowWords.some(word =>
    text.includes(word)
  )
){

  applyIntent({

    intent:
      "cashflow_analysis",

    category:
      "finance",

    confidence:
      0.95,

    priority:
      75,

    requiresCalculation:
      true

  });

}

// ===========================================
// ⚠️ RISK ANALYSIS
// Silicon Valley Risk Intelligence
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

  "saturazione",

  "crollo mercato",

  "instabilità",

  "rischio operativo",

  "rischio finanziario",

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
  "risky market",

  "market crash",

  "market saturation",

  "operational risk",

  "financial risk"

];

if(
  riskWords.some(word =>
    text.includes(word)
  )
){

  applyIntent({

    intent:
      "risk_analysis",

    category:
      "risk",

    confidence:
      0.92,

    priority:
      80,

    requiresRiskAnalysis:
      true

  });

}

// ===========================================
// 🏦 MORTGAGE ANALYSIS
// Silicon Valley Mortgage Intelligence
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

  "interessi",

  "spread",

  "banca",

  "dscr",

  "sostenibilità rata",

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

  "financed property",

  "bank financing",

  "mortgage sustainability",

  "loan sustainability",

  "interest payment",

  "mortgage interest"

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
// Silicon Valley Market Intelligence
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

    "mercato turistico",

    "domanda turistica",

    "trend turistico",

    "mercato airbnb",

    "mercato b&b",

    "saturazione",

    "competizione",

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
    "short rent market",

    "tourism market",

    "tourism demand",

    "tourism trend",

    "market saturation",

    "competition"

  )

){

  applyIntent({

    intent:
      "market_analysis",

    category:
      "market",

    confidence:
      0.94,

    priority:
      60,

    requiresMarketData:
      true

  });

}

// ===========================================
// 💼 INVESTMENT ADVISOR
// Silicon Valley Investment Advisor
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

    "miglior investimento",

    "migliore zona",

    "quale città scegliere",

    "quale mercato scegliere",

    "che città conviene",

    "investimento migliore",

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
    "best market to invest",

    "best investment",

    "best area",

    "best location",

    "where should i invest",

    "which market is better"

  )

){

  applyIntent({

    intent:
      "investment_advisor",

    category:
      "strategy",

    confidence:
      0.96,

    priority:
      85,

    requiresMarketData:
      true,

    requiresCalculation:
      true

  });

}

// ===========================================
// ⚖️ COMPARISON ENGINE
// Silicon Valley Comparison Layer
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

  "più conveniente",

  "più profittevole",

  "migliore",

  "confronta",

  // 🇬🇧 ENGLISH
  "compare",
  "comparison",

  "difference",

  "better",
  "worse",

  "versus",

  "more profitable",

  "best option",

  "compare investment"

];

if(
  comparisonWords.some(word =>
    text.includes(word)
  )
){

  applyIntent({

    intent:
      "comparison",

    category:
      "comparison",

    confidence:
      0.93,

    priority:
      65,

    requiresComparison:
      true,

    requiresCalculation:
      true

  });

}

// ===========================================
// 🧠 EXECUTIVE STRATEGY ENGINE
// Silicon Valley Executive Intelligence
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

  "simulazione investimento",

  "stress test",

  "scenario peggiore",

  "scenario migliore",

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
  "is this investment worth it",

  "stress test",

  "worst case scenario",

  "best case scenario"

];

if(
  strategyWords.some(word =>
    text.includes(word)
  )
){

  applyIntent({

    intent:
      "investment_executive",

    category:
      "executive",

    confidence:
      0.99,

    priority:
      95,

    requiresCalculation:
      true,

    requiresRiskAnalysis:
      true,

    requiresMarketData:
      true

  });

}
  // =====================================
// 🧠 EXECUTIVE AI ENGINE
// Silicon Valley Executive Intelligence
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

    "scenario peggiore",
    "scenario migliore",

    "stress test",

    "analisi rischio",

    "analisi cashflow",

    "simulazione avanzata",

    "analisi completa b&b",

    "analizza questo b&b",

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

    "profitable investment",

    "worst case scenario",
    "best case scenario",

    "stress test",

    "cashflow analysis",

    "risk analysis",

    "advanced simulation",

    "executive ai"

  )

){

  applyIntent({

    intent:
      "investment_executive",

    category:
      "executive",

    confidence:
      0.99,

    priority:
      95,

    requiresCalculation:
      true,

    requiresRiskAnalysis:
      true,

    requiresMarketData:
      true

  });

}

// ===========================================
// 💳 SUBSCRIPTIONS / PRICING
// Silicon Valley SaaS Monetization Layer
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

  "funzioni premium",

  "accesso premium",

  "vantaggi pro",

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
  "investor features",

  "premium features",

  "premium access",

  "upgrade plan"

];

if(
  subscriptionWords.some(word =>
    text.includes(word)
  )
){

  applyIntent({

    intent:
      "subscriptions",

    category:
      "business",

    confidence:
      0.97,

    priority:
      40

  });

}

// ===========================================
// 👋 GREETING
// Silicon Valley Conversational Layer
// ===========================================

const greetingWords = [

  // 🇮🇹 ITALIANO
  "ciao",
  "salve",
  "hey",

  "buongiorno",
  "buonasera",

  "buonanotte",

  // 🇬🇧 ENGLISH
  "hello",
  "hi",
  "hey",

  "good morning",
  "good evening",

  "good night"

];

if(
  greetingWords.some(word =>
    text === word
  )
){

  applyIntent({

    intent:
      "greeting",

    category:
      "social",

    confidence:
      1,

    priority:
      1000

  });

}

// ===========================================
// 🧠 FALLBACK SMART
// Silicon Valley AI Safety Layer
// ===========================================

if(

  result.intent === "generic"

){
// =======================================
// 📚 EDUCATION / FINANCE
// Silicon Valley Knowledge Intelligence
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

    "rogito",
    "notaio",

    "catasto",

    "imu",
    "irpef",

    "plusvalenza",

    "leva finanziaria",

    "ltv",

    "occupazione media",

    "benchmark",

    "mercato short rent",

    "affitti brevi",

    "airbnb",

    // 🇬🇧 ENGLISH
    "cash flow",

    "profit",
    "yield",

    "returns",

    "tax",
    "taxes",

    "mortgage",

    "sustainability",

    "closing costs",

    "notary",

    "property tax",

    "capital gain",

    "financial leverage",

    "ltv",

    "occupancy",

    "short rent",

    "airbnb"

  )

){

  applyIntent({

    intent:
      "education",

    category:
      "education",

    confidence:
      0.92,

    priority:
      90

  });

}

// =======================================
// 🌍 MARKET ANALYSIS
// Silicon Valley Market Intelligence
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

    "mercato turistico",

    "domanda turistica",

    "stagionalità",

    "trend mercato",

    // 🇬🇧 ENGLISH
    "rome",
    "milan",
    "naples",
    "florence",

    "market",
    "occupancy",

    "market analysis",

    "tourism market",

    "tourism demand",

    "seasonality",

    "market trend"

  )

){

  applyIntent({

    intent:
      "market_analysis",

    category:
      "market",

    confidence:
      0.75,

    priority:
      60,

    requiresMarketData:
      true

  });

}

// =======================================
// 💼 GENERIC INVESTMENT
// Silicon Valley Strategy Layer
// =======================================

else if(

  has(

    // 🇮🇹 ITALIANO
    "investimento",
    "investire",

    "conviene",
    "conveniente",

    "vale la pena",

    "aprire b&b",

    "aprire airbnb",

    "business b&b",

    "business airbnb",

    // 🇬🇧 ENGLISH
    "investment",
    "invest",

    "worth it",

    "good investment",

    "open airbnb",

    "open bnb",

    "airbnb business"

  )

){

  applyIntent({

    intent:
      "investment_strategy",

    category:
      "strategy",

    confidence:
      0.70,

    priority:
      50

  });

}

}  

// ===========================================
// 🧠 ENTITY CONTEXT BOOST
// Silicon Valley Contextual AI Layer
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
