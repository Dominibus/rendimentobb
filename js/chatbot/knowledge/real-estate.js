// ===============================================
// 🏠 RENDIMENTOBB – REAL ESTATE AI KNOWLEDGE
// ===============================================

window.rbKnowledgeBase =
  window.rbKnowledgeBase || {};

// ===============================================
// 🏠 REAL ESTATE MODULE
// ===============================================

window.rbKnowledgeBase.realEstate = {

  module: "real-estate",

  version: "2.0",

  aiRoleIT:
    "Esperto investimenti immobiliari short-rent",

  aiRoleEN:
    "Short-rent real estate investment expert",

  descriptionIT:
    "Modulo AI dedicato a occupazione, domanda turistica, location, ADR e sostenibilità immobiliare.",

  descriptionEN:
    "AI module dedicated to occupancy, tourism demand, location, ADR and property sustainability.",

  // =============================================
  // 🏨 OCCUPANCY
  // =============================================

  occupancy: {

  priority: 10,

  category: "performance",

  scoreWeight: 1.4,

  semanticWeight: 2.0,

  decisionWeight: 1.9,

  riskWeight: 1.7,

  executiveWeight: 1.9,

  importance: "core",

  severity: "high",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: true,

    compareRequired: true,

    sustainabilityCheck: true,

    benchmarkRequired: true,

    warningPriority: true

  },

  responseStyle: {

    tone: "executive",

    useWarnings: true,

    useBenchmarks: true,

    concise: false

  },

  keywords: [
      "occupazione",
      "occupancy",
      "tasso occupazione",
      "occupancy rate",
      "booking rate",
      "prenotazioni",
      "riempimento",
      "notti prenotate"
    ],

    aiTitleIT:
      "🏨 Occupazione Media",

    aiTitleEN:
      "🏨 Average Occupancy",

    aiSummaryIT:
      "L’occupazione è uno dei fattori principali che determinano redditività e sostenibilità del cashflow.",

    aiSummaryEN:
      "Occupancy is one of the main factors driving profitability and cashflow sustainability.",

    aiInsightIT:
      "Piccole variazioni dell’occupazione possono modificare drasticamente ROI, cashflow e rischio operativo.",

    aiInsightEN:
      "Small occupancy variations may dramatically impact ROI, cashflow and operational risk.",

    warningIT:
      "⚠️ Occupazioni troppo ottimistiche possono rendere le simulazioni irrealistiche.",

    warningEN:
      "⚠️ Unrealistic occupancy assumptions may distort projections.",

    benchmarks: {

      low: 50,
      medium: 65,
      high: 75

    },

    recommendationsIT: [
      "Confronta benchmark reali della città.",
      "Analizza stagionalità.",
      "Ottimizza pricing dinamico."
    ],

    recommendationsEN: [
      "Compare real city benchmarks.",
      "Analyze seasonality.",
      "Optimize dynamic pricing."
    ],

    related: [
      "cashflow",
      "roi",
      "seasonality",
      "marketDemand"
    ]

  },

  // =============================================
  // 🌍 MARKET DEMAND
  // =============================================

  marketDemand: {

  priority: 9,

  category: "market",

  scoreWeight: 1.3,

  semanticWeight: 1.8,

  decisionWeight: 1.8,

  riskWeight: 1.6,

  executiveWeight: 1.7,

  importance: "core",

  severity: "medium",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: true,

    compareRequired: true,

    sustainabilityCheck: true,

    benchmarkRequired: true,

    warningPriority: false

  },

  responseStyle: {

    tone: "executive",

    useWarnings: true,

    useBenchmarks: true,

    concise: false

  },

  keywords: [
      "domanda",
      "market demand",
      "tourism demand",
      "domanda turistica",
      "mercato turistico",
      "richiesta airbnb"
    ],

    aiTitleIT:
      "🌍 Domanda di Mercato",

    aiTitleEN:
      "🌍 Market Demand",

    aiSummaryIT:
      "La domanda reale del mercato determina il potenziale operativo dell’investimento.",

    aiSummaryEN:
      "Real market demand determines the operational potential of the investment.",

    aiInsightIT:
      "Mercati con forte domanda turistica tendono ad avere ADR, occupazione e stabilità superiori.",

    aiInsightEN:
      "Markets with strong tourism demand usually achieve higher ADR, occupancy and stability.",

    warningIT:
      "⚠️ Domanda debole aumenta il rischio di cashflow negativo.",

    warningEN:
      "⚠️ Weak demand increases negative cashflow risk.",

    recommendationsIT: [
      "Analizza turismo annuale.",
      "Confronta trend città.",
      "Studia domanda internazionale."
    ],

    recommendationsEN: [
      "Analyze annual tourism.",
      "Compare city trends.",
      "Study international demand."
    ],

    related: [
      "occupancy",
      "riskScore",
      "tourismTrend"
    ]

  },

  // =============================================
  // 📍 LOCATION IMPACT
  // =============================================

  locationImpact: {

  priority: 8,

  category: "location",

  scoreWeight: 1.2,

  semanticWeight: 1.7,

  decisionWeight: 1.8,

  riskWeight: 1.5,

  executiveWeight: 1.7,

  importance: "core",

  severity: "medium",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: false,

    compareRequired: true,

    sustainabilityCheck: true,

    benchmarkRequired: true,

    warningPriority: false

  },

  responseStyle: {

    tone: "analytical",

    useWarnings: false,

    useBenchmarks: true,

    concise: false

  },

  keywords: [
      "zona",
      "location",
      "quartiere",
      "property location",
      "zona turistica"
    ],

    aiTitleIT:
      "📍 Posizione Immobile",

    aiTitleEN:
      "📍 Property Location",

    aiSummaryIT:
      "La posizione dell’immobile influenza occupazione, ADR e sostenibilità.",

    aiSummaryEN:
      "Property location directly impacts occupancy, ADR and sustainability.",

    aiInsightIT:
      "Zone centrali o turistiche tendono ad avere maggiore resilienza di mercato.",

    aiInsightEN:
      "Central or tourist areas usually achieve stronger market resilience.",

    warningIT:
      "⚠️ Location deboli possono limitare la crescita del cashflow.",

    warningEN:
      "⚠️ Weak locations may limit cashflow growth.",

    related: [
      "occupancy",
      "marketDemand",
      "averageNightPrice"
    ]

  },

  // =============================================
  // 💎 ADR
  // =============================================

  averageNightPrice: {

  priority: 8,

  category: "pricing",

  scoreWeight: 1.2,

  semanticWeight: 1.8,

  decisionWeight: 1.8,

  riskWeight: 1.6,

  executiveWeight: 1.7,

  importance: "core",

  severity: "medium",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: true,

    compareRequired: true,

    sustainabilityCheck: true,

    benchmarkRequired: true,

    warningPriority: false

  },

  responseStyle: {

    tone: "executive",

    useWarnings: true,

    useBenchmarks: true,

    concise: false

  },

  keywords: [
      "adr",
      "average daily rate",
      "nightly rate",
      "prezzo notte",
      "tariffa media"
    ],

    aiTitleIT:
      "💎 ADR / Prezzo Medio Notte",

    aiTitleEN:
      "💎 ADR / Average Nightly Rate",

    aiSummaryIT:
      "L’ADR determina la capacità dell’immobile di generare ricavi sostenibili.",

    aiSummaryEN:
      "ADR determines the property’s ability to generate sustainable revenue.",

    aiInsightIT:
      "ADR elevati aumentano ricavi ma possono ridurre occupazione se fuori mercato.",

    aiInsightEN:
      "Higher ADR increases revenue but may reduce occupancy if overpriced.",

    warningIT:
      "⚠️ Pricing aggressivo aumenta volatilità e rischio operativo.",

    warningEN:
      "⚠️ Aggressive pricing increases volatility and operational risk.",

    related: [
      "occupancy",
      "cashflow",
      "marketDemand"
    ]

  },

  // =============================================
  // 🧠 PROPERTY MANAGEMENT
  // =============================================

  propertyManagement: {

  priority: 7,

  category: "operations",

  scoreWeight: 1.1,

  semanticWeight: 1.5,

  decisionWeight: 1.6,

  riskWeight: 1.5,

  executiveWeight: 1.4,

  importance: "secondary",

  severity: "medium",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: false,

    compareRequired: false,

    sustainabilityCheck: true,

    benchmarkRequired: false,

    warningPriority: false

  },

  responseStyle: {

    tone: "analytical",

    useWarnings: false,

    useBenchmarks: false,

    concise: true

  },

  keywords: [
      "gestione",
      "property management",
      "host management",
      "gestione airbnb"
    ],

    aiTitleIT:
      "🧠 Gestione Operativa",

    aiTitleEN:
      "🧠 Property Management",

    aiSummaryIT:
      "La gestione operativa influenza recensioni, occupazione e marginalità.",

    aiSummaryEN:
      "Operational management impacts reviews, occupancy and margins.",

    aiInsightIT:
      "Automazione e qualità operativa migliorano sostenibilità e competitività.",

    aiInsightEN:
      "Automation and operational quality improve sustainability and competitiveness.",

    warningIT:
      "⚠️ Commissioni elevate possono comprimere il margine operativo.",

    warningEN:
      "⚠️ High fees may compress operating margins.",

    related: [
      "cashflow",
      "occupancy",
      "operatingMargin"
    ]

  },

  // =============================================
  // ⚠️ MARKET SATURATION
  // =============================================

  marketSaturation: {

  priority: 8,

  category: "risk",

  scoreWeight: 1.3,

  semanticWeight: 1.7,

  decisionWeight: 1.7,

  riskWeight: 1.8,

  executiveWeight: 1.6,

  importance: "secondary",

  severity: "high",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: true,

    compareRequired: true,

    sustainabilityCheck: false,

    benchmarkRequired: true,

    warningPriority: true

  },

  responseStyle: {

    tone: "warning",

    useWarnings: true,

    useBenchmarks: true,

    concise: false

  },

  keywords: [
      "mercato saturo",
      "competition",
      "alta concorrenza",
      "troppi airbnb"
    ],

    aiTitleIT:
      "⚠️ Saturazione Mercato",

    aiTitleEN:
      "⚠️ Market Saturation",

    aiSummaryIT:
      "Mercati saturi possono ridurre ADR e occupazione media.",

    aiSummaryEN:
      "Saturated markets may reduce ADR and occupancy.",

    aiInsightIT:
      "Competizione eccessiva aumenta il rischio operativo.",

    aiInsightEN:
      "Excessive competition increases operational risk.",

    warningIT:
      "⚠️ Saturazione elevata riduce resilienza del cashflow.",

    warningEN:
      "⚠️ High saturation reduces cashflow resilience.",

    related: [
      "occupancy",
      "riskScore",
      "marketDemand"
    ]

  },

  // =============================================
  // 📈 TOURISM TREND
  // =============================================

  tourismTrend: {

  priority: 7,

  category: "trend",

  scoreWeight: 1.1,

  semanticWeight: 1.5,

  decisionWeight: 1.5,

  riskWeight: 1.4,

  executiveWeight: 1.4,

  importance: "secondary",

  severity: "medium",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: false,

    compareRequired: true,

    sustainabilityCheck: true,

    benchmarkRequired: true,

    warningPriority: false

  },

  responseStyle: {

    tone: "analytical",

    useWarnings: false,

    useBenchmarks: true,

    concise: true

  },

  keywords: [
      "trend turismo",
      "tourism trend",
      "crescita turismo"
    ],

    aiTitleIT:
      "📈 Trend Turistico",

    aiTitleEN:
      "📈 Tourism Trend",

    aiSummaryIT:
      "I trend turistici influenzano direttamente domanda e crescita del mercato.",

    aiSummaryEN:
      "Tourism trends directly impact market demand and growth.",

    aiInsightIT:
      "Città in crescita turistica tendono a mantenere maggiore stabilità operativa.",

    aiInsightEN:
      "Growing tourism cities usually maintain stronger operational stability.",

    warningIT:
      "⚠️ Cambiamenti nei flussi turistici possono alterare rapidamente il mercato.",

    warningEN:
      "⚠️ Tourism flow changes may rapidly alter market conditions.",

    related: [
      "marketDemand",
      "occupancy",
      "seasonality"
    ]

  }

};

console.log(
  "🏠 REAL ESTATE AI MODULE READY",
  window.rbKnowledgeBase.realEstate
);
