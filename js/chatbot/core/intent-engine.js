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
// 🧠 SMART HELPERS
// ===========================================

const startsWithQuestion =

  /^(come|quanto|perché|conviene|is|should|what|how|why)/i
    .test(text);

const isShortMessage =

  text.split(" ").length <= 5;

const hasNumbers =

  /\d/.test(text);

const containsCity =

  !!entities.city;

const containsROI =

  text.includes("roi") ||

  text.includes("rendimento");

const containsRisk =

  text.includes("rischio") ||

  text.includes("risk");

const containsMortgage =

  text.includes("mutuo") ||

  text.includes("mortgage");

const containsComparison =

  text.includes("vs") ||

  text.includes("confronto") ||

  text.includes("compare");

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
// 🏆 BEST SIMULATION
// ===========================================

if(

  has(

    "migliore simulazione",
    "best simulation",

    "miglior investimento",
    "best investment",

    "quale rende di più",
    "quale rende di piu",

    "highest roi",

    "simulazione migliore",

    "most profitable"

  )

){

  applyIntent({

    intent: "best_simulation",

    category: "comparison",

    confidence: 0.99,

    priority: 220,

    requiresCalculation: true

  });

}  

// ===========================================
// 📊 PORTFOLIO ANALYSIS
// Multi Property Advisor
// ===========================================

if(

  has(

    "roi medio",
    "average roi",

    "media simulazioni",

    "portfolio",

    "storico simulazioni",

    "historical analysis",

    "analisi storico",

    "come sto andando",

    "quanti immobili ho",

    "quanti appartamenti ho",

    "portafoglio immobiliare",

    "portfolio immobiliare",

    "real estate portfolio",

    "property portfolio",

    "gestisco immobili",

    "gestisco appartamenti",

    "gestisco b&b",

    "managed properties",

    "my portfolio",

    "my properties"

  )

  ||

  Number(
    entities.ownedProperties || 0
  ) > 0

){

  applyIntent({

    intent: "portfolio_analysis",

    category: "portfolio",

    confidence: 0.99,

    priority: 280,

    requiresCalculation: true

  });

}

// ===========================================
// 🌍 BEST CITY
// ===========================================

if(

  has(

    // 🇮🇹 CITTÀ MIGLIORE

    "migliore città",
    "miglior città",
    "quale città conviene",
    "quale città rende di più",
    "quale città ha roi migliore",
    "quale città è migliore",
    "in quale città investire",
    "dove investire",
    "dove conviene investire",
    "città più redditizia",
    "città più profittevole",
    "città più conveniente",
    "città migliore per b&b",
    "città migliore per affitti brevi",
    "città migliore per airbnb",
    "quale mercato è migliore",
    "quale mercato performa meglio",
    "mercato migliore",
    "classifica città",
    "ranking città",
    "confronto città",
    "confronta città",

    // 🇬🇧 BEST CITY

    "best city",
    "best performing city",
    "best investment city",
    "best market",
    "best city for airbnb",
    "best city for short term rentals",
    "which city performs best",
    "which city is better",
    "which city should i invest in",
    "where should i invest",
    "most profitable city",
    "highest roi city",
    "top performing city",
    "city ranking",
    "market ranking",
    "city comparison",
    "compare cities",
    "compare markets",
    "best location",
    "best destination"

  )

){

  applyIntent({

    intent: "best_city",

    category: "comparison",

    confidence: 0.99,

    priority: 220,

    requiresCalculation: true,

    requiresMarketData: true

  });

}
// ===========================================
// 📄 PDF ANALYSIS
// ===========================================

if(

  has(

    "pdf",

    "report pdf",

    "analizza pdf",

    "read pdf",

    "pdf report",

    "riassunto pdf",

    "executive pdf"

  )

){

  applyIntent({

    intent: "pdf_analysis",

    category: "documents",

    confidence: 0.99,

    priority: 230

  });

}  

// ===========================================
// 📊 REPORT INTERPRETATION
// Executive Report Advisor
// ===========================================

if(

  has(

    // 🇮🇹 REPORT

    "interpretami il report",
    "interpreta il report",

    "spiegami il report",

    "analizza il report",

    "leggi il report",

    "come farebbe un consulente",

    "spiegami il pdf",

    "interpretami il pdf",

    "analizza il mio report",

    "cosa significa il report",

    "spiegami i risultati",

    // 🇮🇹 SIMULAZIONE

    "analizza simulazione",

    "analizza la simulazione",

    "analizza investimento",

    "analizza l'investimento",

    "valuta investimento",

    "valuta la simulazione",

    "cosa ne pensi",

    "fammi una valutazione",

    "fammi un'analisi",

    "analisi completa",

    "executive review",

    // 🇬🇧 REPORT

    "interpret the report",

    "explain the report",

    "analyze the report",

    "read the report",

    "explain my report",

    "interpret my report",

    "analyze my report",

    "explain the pdf",

    "interpret the pdf",

    "consultant analysis",

    // 🇬🇧 SIMULATION

    "analyze simulation",

    "analyze investment",

    "investment review",

    "review my investment",

    "review my simulation",

    "evaluate my investment",

    "executive analysis"

  )

){

  applyIntent({

    intent: "report_interpretation",

    category: "executive",

    confidence: 0.99,

    priority: 270,

    requiresCalculation: true,

    requiresMarketData: true

  });

}
// ===========================================
// 🏨 PROPERTY PERFORMANCE
// ===========================================

if(

  has(

    "migliore proprietà",

    "migliore proprieta",

    "best property",

    "property performance",

    "quale immobile rende di più",

    "which property performs best"

  )

){

  applyIntent({

    intent: "property_performance",

    category: "portfolio",

    confidence: 0.99,

    priority: 225

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
  "piu conveniente",

  "più profittevole",
  "piu profittevole",

  "migliore",

  "confronta",

  // 🔥 NUOVI IT
  "fra le due",
  "tra le due",

  "quale conviene",

  "quale è migliore",
  "quale e migliore",

  "migliore simulazione",

  "miglior investimento",

  "quale rende di più",
  "quale rende di piu",

  "confronta simulazioni",

  "confronta investimenti",

  "quale è meglio",
  "quale e meglio",

  "fammi un confronto",

  // 🇬🇧 ENGLISH
  "compare",
  "comparison",

  "difference",

  "better",
  "worse",

  "versus",

  "more profitable",

  "best option",

  "compare investment",

  // 🔥 NEW EN
  "which is better",

  "which one is better",

  "which investment is better",

  "compare simulations",

  "compare investments",

  "which one performs better",

  "which one is more profitable",

  "between the two",

  "which one should i choose",

  "best simulation"

];

if(

  containsComparison ||

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
// Silicon Valley Executive Intelligence 2026
// ===========================================

const strategyWords = [

  // =========================================
  // 🇮🇹 STRATEGIA
  // =========================================

  "strategia",
  "strategia investimento",
  "strategia immobiliare",
  "strategia b&b",
  "strategia airbnb",

  "opportunità",
  "opportunita",

  "investimento strategico",

  "profittevole",
  "profittevole?",
  "redditività",
  "redditivita",

  "miglior città",
  "migliore città",
  "miglior mercato",

  "aprire b&b",
  "aprire airbnb",

  // =========================================
  // 🇮🇹 ANALISI
  // =========================================

  "analisi executive",
  "analisi investimento",
  "analisi immobiliare",
  "analisi immobile",
  "analisi appartamento",
  "analisi proprietà",
  "analisi proprieta",

  "report investimento",

  "analisi dettagliata",
  "analisi completa",

  "analisi completa ai",
  "analisi ai",

  "analisi avanzata",
  "analisi professionale",

  "analisi strategica",

  "analizza investimento",
  "analizza questo investimento",

  "analizza questo immobile",
  "analizza questo appartamento",

  "analizza questa casa",
  "analizza questa proprietà",
  "analizza questa proprieta",

  "analizza questa simulazione",

  "fammi un'analisi",
  "fammi una valutazione",

  "dammi un parere",

  // =========================================
  // 🇮🇹 CONVIENE
  // =========================================

  "conviene",

  "conviene comprare",

  "conviene acquistare",

  "conviene investire",

  "conviene questo immobile",

  "conviene questo appartamento",

  "conviene questa casa",

  "conviene questo investimento",

  "conviene ancora",

  "vale la pena",

  "vale la pena comprare",

  "vale la pena investire",

  "ha senso comprare",

  "ha senso investire",

  "lo compreresti",

  "tu lo compreresti",

  "compreresti questo immobile",

  "compreresti questo appartamento",

  "compreresti questa casa",

  "cosa ne pensi",

  "che ne pensi",

  "parere investimento",

  "opinione investimento",

  // =========================================
  // 🇮🇹 VALUTAZIONE
  // =========================================

  "valuta investimento",

  "valuta questo investimento",

  "valuta questo immobile",

  "valuta questo appartamento",

  "valuta questa casa",

  "valuta questo b&b",

  "giudica investimento",

  "consiglio investimento",

  // =========================================
  // 🇮🇹 FINANZA
  // =========================================

  "cashflow reale",

  "investimento sostenibile",

  "questo investimento",

  "simulazione investimento",

  "stress test",

  "scenario peggiore",

  "scenario migliore",

  "best case",

  "worst case",

  // =========================================
  // 🇬🇧 STRATEGY
  // =========================================

  "strategy",

  "investment strategy",

  "real estate strategy",

  "profitable",

  "profitability",

  "does it make sense",

  "should i invest",

  "good investment",

  "worth buying",

  "worth investing",

  "best city",

  "best market",

  "open airbnb",

  "open bnb",

  // =========================================
  // 🇬🇧 ANALYSIS
  // =========================================

  "executive",

  "executive report",

  "executive analysis",

  "investment report",

  "advanced analysis",

  "professional analysis",

  "investment advisor",

  "advisor",

  "analyze investment",

  "analyze this investment",

  "analyze this property",

  "analyze this apartment",

  "analyze this house",

  "review investment",

  "review property",

  "evaluate investment",

  "evaluate this investment",

  "evaluate this property",

  "evaluate this apartment",

  "evaluate this house",

  "executive ai",

  // =========================================
  // 🇬🇧 DECISION
  // =========================================

  "would you buy",

  "would you invest",

  "would you buy this",

  "would you buy this property",

  "would you buy this apartment",

  "is it worth it",

  "is this worth buying",

  "is this investment good",

  "is this investment worth it",

  "should i buy",

  "should i buy this property",

  "should i buy this apartment",

  "should i buy this investment",

  "what do you think",

  "your opinion",

  // =========================================
  // 🇬🇧 FINANCE
  // =========================================

  "real cashflow",

  "investment sustainability",

  "is it sustainable",

  "sustainable investment",

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
// Silicon Valley Executive Intelligence 2026
// =====================================

if(

  has(

    // =====================================
    // 🇮🇹 ANALISI EXECUTIVE
    // =====================================

    "analisi executive",
    "executive",

    "analisi completa",
    "analisi avanzata",

    "analisi professionale",

    "analisi ai",

    "analisi dettagliata",

    "analisi strategica",

    "analisi immobiliare",

    "analisi immobile",

    "analisi appartamento",

    "analisi proprietà",
    "analisi proprieta",

    "fammi un'analisi",

    "fammi una valutazione",

    "dammi un parere",

    "analizza investimento",

    "analizza questo investimento",

    "analizza questo immobile",

    "analizza questo appartamento",

    "analizza questa casa",

    "analizza questa proprietà",
    "analizza questa proprieta",

    "analizza questa simulazione",

    "analizza questo b&b",

    "analisi completa b&b",

    // =====================================
    // 🇮🇹 VALUTAZIONE
    // =====================================

    "valuta investimento",

    "valuta questo investimento",

    "valuta questo immobile",

    "valuta questo appartamento",

    "valuta questa casa",

    "valuta questo b&b",

    "giudica investimento",

    "consiglio investimento",

    "cosa ne pensi",

    "che ne pensi",

    "parere investimento",

    "opinione investimento",

    // =====================================
    // 🇮🇹 DECISIONE
    // =====================================

    "conviene",

    "conviene ancora",

    "conviene investire",

    "conviene comprare",

    "conviene acquistare",

    "conviene questo investimento",

    "conviene questo immobile",

    "conviene questo appartamento",

    "conviene questa casa",

    "vale la pena",

    "vale la pena investire",

    "vale la pena comprare",

    "conveniente",

    "ha senso investire",

    "ha senso comprare",

    "lo compreresti",

    "tu lo compreresti",

    "compreresti questo investimento",

    "compreresti questo immobile",

    "compreresti questo appartamento",

    "compreresti questa casa",

    // =====================================
    // 🇮🇹 FINANZA
    // =====================================

    "cashflow reale",

    "sostenibilità investimento",

    "sostenibilita investimento",

    "sostenibile",

    "è sostenibile",

    "investimento sostenibile",

    "questo investimento",

    "scenario peggiore",

    "scenario migliore",

    "stress test",

    "analisi rischio",

    "analisi cashflow",

    "simulazione avanzata",

    // =====================================
    // 🇬🇧 EXECUTIVE ANALYSIS
    // =====================================

    "executive analysis",

    "executive ai",

    "advanced analysis",

    "professional analysis",

    "analyze investment",

    "analyze this investment",

    "analyze this property",

    "analyze this apartment",

    "analyze this house",

    "review investment",

    "review property",

    "review this investment",

    "evaluate investment",

    "evaluate this investment",

    "evaluate this property",

    "evaluate this apartment",

    "evaluate this house",

    "what do you think",

    "your opinion",

    // =====================================
    // 🇬🇧 DECISION
    // =====================================

    "should i invest",

    "should i buy",

    "should i buy this investment",

    "should i buy this property",

    "should i buy this apartment",

    "would you buy",

    "would you buy this",

    "would you buy this investment",

    "would you buy this property",

    "would you buy this apartment",

    "would you invest",

    "does it make sense",

    "worth it",

    "worth buying",

    "worth investing",

    "good investment",

    "profitable investment",

    "is this investment good",

    "is this investment worth it",

    // =====================================
    // 🇬🇧 FINANCE
    // =====================================

    "sustainable",

    "sustainability",

    "is it sustainable",

    "investment sustainability",

    "sustainable investment",

    "cashflow analysis",

    "risk analysis",

    "advanced simulation",

    "stress test",

    "worst case scenario",

    "best case scenario"

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
// 📈 IMPROVEMENT ADVISOR
// Silicon Valley Portfolio Optimization 2026
// ===========================================

if(

  has(

    // =========================================
    // 🇮🇹 MIGLIORAMENTO GENERALE
    // =========================================

    "cosa devo migliorare",

    "come posso migliorare",

    "come migliorare",

    "cosa posso fare meglio",

    "come posso fare meglio",

    "come migliorare questa simulazione",

    "come migliorare questo investimento",

    "come migliorare questo immobile",

    "come migliorare questo appartamento",

    "come migliorare questa casa",

    "come migliorare il b&b",

    "come migliorare l'airbnb",

    "dammi consigli",

    "consigliami",

    "dammi suggerimenti",

    "dammi delle idee",

    "consigli per migliorare",

    "cosa mi consigli",

    "che cosa mi consigli",

    "quali sono i miglioramenti",

    "quali migliorie posso fare",

    "cosa cambieresti",

    "tu cosa faresti",

    // =========================================
    // 🇮🇹 ROI
    // =========================================

    "come aumento il roi",

    "come aumentare il roi",

    "migliorare il roi",

    "ottimizzare il roi",

    "incrementare il roi",

    "massimizzare il roi",

    "come aumentare il rendimento",

    "come migliorare il rendimento",

    "aumentare il rendimento",

    "ottimizzare il rendimento",

    "come aumentare la redditività",

    "come aumentare la redditivita",

    "aumentare la redditività",

    "aumentare la redditivita",

    "ottimizzare la redditività",

    "ottimizzare la redditivita",

    // =========================================
    // 🇮🇹 CASHFLOW / PROFITTO
    // =========================================

    "come aumentare il cashflow",

    "come migliorare il cashflow",

    "come aumentare il profitto",

    "come aumento il profitto",

    "come aumentare il profitto netto",

    "come aumentare gli utili",

    "come aumentare il guadagno",

    "come aumentare i ricavi",

    "come aumentare l'utile",

    "come migliorare i margini",

    "come aumentare il margine",

    // =========================================
    // 🇮🇹 RISCHIO
    // =========================================

    "come ridurre il rischio",

    "come abbassare il rischio",

    "come diminuire il rischio",

    "come rendere più sicuro",

    "come rendere piu sicuro",

    "come rendere sostenibile",

    "come rendere più profittevole",

    "come rendere piu profittevole",

    // =========================================
    // 🇮🇹 STRATEGIA
    // =========================================

    "come ottimizzare l'investimento",

    "come ottimizzare questo investimento",

    "come ottimizzare questo immobile",

    "come ottimizzare questa simulazione",

    "come far rendere di più",

    "come far rendere di piu",

    "come migliorare i risultati",

    "come migliorare le performance",

    "come crescere",

    "come scalare",

    "come fare il salto di qualità",

    "come fare il salto di qualita",

    "come diventare più competitivo",

    "come diventare piu competitivo",

    "come battere la concorrenza",

    // =========================================
    // 🇬🇧 GENERAL
    // =========================================

    "what should i improve",

    "what can i improve",

    "how can i improve",

    "how do i improve",

    "what can i do better",

    "give me advice",

    "give me suggestions",

    "improvement tips",

    "optimization advice",

    "what would you improve",

    "what would you change",

    // =========================================
    // 🇬🇧 ROI
    // =========================================

    "how can i increase roi",

    "how can i improve roi",

    "increase roi",

    "improve roi",

    "maximize roi",

    "optimize roi",

    "increase returns",

    "improve returns",

    "maximize returns",

    // =========================================
    // 🇬🇧 PROFITABILITY
    // =========================================

    "increase profitability",

    "improve profitability",

    "how to increase profitability",

    "how to improve profitability",

    "how to make more profit",

    "increase revenue",

    "increase cashflow",

    "improve cashflow",

    "increase income",

    "increase margin",

    // =========================================
    // 🇬🇧 RISK
    // =========================================

    "how can i reduce risk",

    "how can i lower risk",

    "reduce investment risk",

    "make this investment safer",

    "make it sustainable",

    // =========================================
    // 🇬🇧 STRATEGY
    // =========================================

    "how can i optimize this investment",

    "how to optimize this investment",

    "optimize this property",

    "optimize this apartment",

    "optimize this simulation",

    "improve performance",

    "how to improve performance",

    "grow faster",

    "scale faster",

    "be more competitive"

  )

){

  applyIntent({

    intent:
      "improvement_advisor",

    category:
      "executive",

    confidence:
      0.99,

    priority:
      290,

    requiresCalculation:
      true,

    requiresRiskAnalysis:
      true,

    requiresMarketData:
      true

  });

}
  
// ===========================================
// 🏨 PMS BOOKINGS
// ===========================================

if(

  text.includes("prenotazioni") ||
  text.includes("prenotazione") ||
  text.includes("booking") ||
  text.includes("bookings")

){

  applyIntent({

    intent: "pms_bookings",

    category: "pms",

    confidence: 0.99,

    priority: 250

  });

}

// ===========================================
// 🏨 PMS OCCUPANCY
// ===========================================

if(

  text.includes("occupazione") ||
  text.includes("occupancy")

){

  applyIntent({

    intent: "pms_occupancy",

    category: "pms",

    confidence: 0.99,

    priority: 250

  });

}

// ===========================================
// 🏨 PMS REVENUE
// ===========================================

if(

  text.includes("ricavi") ||
  text.includes("fatturato") ||
  text.includes("revenue")

){

  applyIntent({

    intent: "pms_revenue",

    category: "pms",

    confidence: 0.99,

    priority: 250

  });

}  

// ===========================================
// 🏨 PMS ANALYSIS
// Property Management Intelligence
// ===========================================

const pmsWords = [

  // 🇮🇹
  "prenotazioni",
  "prenotazione",

  "ospiti",
  "guest",

  "adr",

  "revpar",

  "occupazione",

  "occupancy",

  "ricavi",

  "fatturato",

  "proprietà",

  "proprieta",

  "immobili gestiti",

  "come stanno andando",

  "come va il mio b&b",

  "come vanno le prenotazioni",

  "quante prenotazioni",

  "quante proprietà",

  "quante proprieta",

  "quanti ospiti",

  // 🇬🇧

  "bookings",

  "booking",

  "guests",

  "occupancy",

  "revenue",

  "adr",

  "revpar",

  "properties",

  "managed properties",

  "how are my bookings",

  "how is my property",

  "how is my bnb",

  "how many bookings",

  "how many properties"

];

if(

  pmsWords.some(word =>
    text.includes(word)
  )

){

  applyIntent({

    intent:
      "pms_analysis",

    category:
      "pms",

    confidence:
      0.98,

    priority:
      200

  });

}  

// ===========================================
// 🏨 PMS GUESTS
// ===========================================

if(

  text.includes("ospiti") ||

  text.includes("guest") ||

  text.includes("guests") ||

  text.includes("quanti ospiti") ||

  text.includes("how many guests")

){

  applyIntent({

    intent: "pms_guests",

    category: "pms",

    confidence: 0.99,

    priority: 260

  });

}

// ===========================================
// 🏨 PMS ADR
// ===========================================

if(

  text.includes("adr") ||

  text.includes("average daily rate")

){

  applyIntent({

    intent: "pms_adr",

    category: "pms",

    confidence: 0.99,

    priority: 260

  });

}

// ===========================================
// 🏨 PMS REVPAR
// ===========================================

if(

  text.includes("revpar")

){

  applyIntent({

    intent: "pms_revpar",

    category: "pms",

    confidence: 0.99,

    priority: 260

  });

}

// ===========================================
// 🏨 PMS ARRIVALS
// ===========================================

if(

  text.includes("arrivi") ||

  text.includes("arrivals") ||

  text.includes("chi arriva") ||

  text.includes("chi arriva oggi") ||

  text.includes("arriva oggi") ||

  text.includes("arrivi oggi") ||

  text.includes("arrivo oggi") ||

  text.includes("ospiti in arrivo") ||

  text.includes("today arrivals") ||

  text.includes("arriving today") ||

  text.includes("who arrives today")

){

  applyIntent({

    intent: "pms_arrivals",

    category: "pms",

    confidence: 0.99,

    priority: 300

  });

}

// ===========================================
// 🏨 PMS CHECK-IN
// ===========================================

if(

  text.includes("check-in") ||

  text.includes("check in") ||

  text.includes("checkin") ||

  text.includes("quanti check in") ||

  text.includes("how many check ins") ||

  text.includes("checkins")

){

  applyIntent({

    intent: "pms_checkins",

    category: "pms",

    confidence: 0.99,

    priority: 300

  });

}

// ===========================================
// 🏨 PMS CHECK-OUT
// ===========================================

if(

  text.includes("check-out") ||

  text.includes("check out") ||

  text.includes("checkout") ||

  text.includes("checkouts")

){

  applyIntent({

    intent: "pms_checkouts",

    category: "pms",

    confidence: 0.99,

    priority: 260

  });

}

// ===========================================
// 🏨 PMS OVERVIEW
// ===========================================

if(

  text.includes("analizza il mio pms") ||

  text.includes("analizza pms") ||

  text.includes("come sta andando il pms") ||

  text.includes("come sta andando il mio pms") ||

  text.includes("come sta andando il mio b&b") ||

  text.includes("come va il mio b&b") ||

  text.includes("come va la mia struttura") ||

  text.includes("stato della struttura") ||

  text.includes("performance del b&b") ||

  text.includes("performance della struttura") ||

  text.includes("dashboard pms") ||

  text.includes("pms overview") ||

  text.includes("analyze my pms") ||

  text.includes("riepilogo pms") ||

  text.includes("riepilogo del pms") ||

  text.includes("situazione pms") ||

  text.includes("overview pms") ||

  text.includes("summary pms") ||

  text.includes("riassunto pms") ||

  text.includes("come va il pms")

){

  applyIntent({

    intent: "pms_overview",

    category: "pms",

    confidence: 0.99,

    priority: 270

  });

}

// ===========================================
// 🏢 PORTFOLIO GROWTH
// Real Estate Scaling Advisor
// ===========================================

if(

  has(

    // 🇮🇹

    "5 appartamenti",
    "10 appartamenti",
    "20 appartamenti",

    "più appartamenti",
    "piu appartamenti",

    "più immobili",
    "piu immobili",

    "10 immobili",
    "20 immobili",

    "arrivare a 5 appartamenti",
    "arrivare a 10 appartamenti",

    "arrivare a 10 immobili",
    "arrivare a 20 immobili",

    "costruire un portafoglio",

    "portafoglio immobiliare",

    "costruire un portafoglio immobiliare",

    "creare un portafoglio immobiliare",

    "creare un patrimonio immobiliare",

    "espandere il patrimonio immobiliare",

    "far crescere il patrimonio",

    "comprare altri immobili",

    "acquistare altri immobili",

    "acquistare più immobili",

    "acquistare piu immobili",

    "crescere",

    "espandere",

    "espandere il business",

    "scalare",

    "scalare il business",

    "scalare un portafoglio immobiliare",

    "vivere di affitti",

    "vivere di rendita",

    "impero immobiliare",

    "costruire un impero immobiliare",

    "entro 5 anni",
    "entro 10 anni",

    // 🔥 NUOVE KEYWORD IT

    "come espandere il portafoglio",

    "come far crescere il portafoglio",

    "come scalare il portafoglio",

    "come ampliare il portafoglio",

    "come aumentare il numero di immobili",

    "prossimo investimento",

    "prossimo immobile",

    "crescita del portafoglio",

    "piano di crescita",

    "roadmap immobiliare",

    "roadmap del portafoglio",

    "come costruire un patrimonio",

    "come arrivare alla libertà finanziaria",

    "come raggiungere la rendita",

    // 🇬🇧

    "portfolio growth",

    "real estate portfolio",

    "property portfolio",

    "build a portfolio",

    "build a real estate portfolio",

    "grow my portfolio",

    "grow a portfolio",

    "scale my portfolio",

    "scale my business",

    "expand my real estate business",

    "buy more properties",

    "multiple properties",

    "5 properties",

    "10 properties",

    "20 properties",

    "financial freedom",

    "passive income",

    // 🔥 NEW EN

    "how can i grow my portfolio",

    "how can i scale my portfolio",

    "how can i expand my portfolio",

    "next investment",

    "next property",

    "portfolio roadmap",

    "growth strategy",

    "real estate growth plan",

    "how to build wealth",

    "how to reach financial freedom"

  )

  ||

  (

    entities.availableCapital &&

    (

      text.includes("quanti immobili") ||

      text.includes("quanti appartamenti") ||

      text.includes("quante case") ||

      text.includes("posso acquistare") ||

      text.includes("posso comprare") ||

      text.includes("how many properties") ||

      text.includes("how many apartments") ||

      text.includes("how many houses")

    )

  )

){

  applyIntent({

    intent: "portfolio_growth",

    category: "strategy",

    confidence: 0.99,

    priority: 260,

    requiresCalculation: true,

    requiresMarketData: true

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
      "investment_executive",

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
// 🧠 FOLLOW-UP DETECTION
// ===========================================

if(

  result.intent === "generic" &&

  window.rbChatMemory?.lastIntent

){

  applyIntent({

    intent:

      window.rbChatMemory.lastIntent,

    category:
      "followup",

    confidence:
      0.65,

    priority:
      45

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
