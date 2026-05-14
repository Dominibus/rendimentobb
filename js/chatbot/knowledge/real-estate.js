// ===============================================
// 🏠 REAL ESTATE KNOWLEDGE
// ===============================================

Object.assign(window.rbKnowledgeBase, {

  // ===========================================
  // OCCUPANCY
  // ===========================================

  occupancy: {

    priority: 10,

    keywords: [
      "occupazione",
      "occupancy",
      "tasso occupazione",
      "occupancy rate",
      "prenotazioni",
      "booking rate",
      "riempimento",
      "notti prenotate",
      "booking percentage"
    ],

    aiTitleIT:
      "🏨 Occupazione Media",

    aiTitleEN:
      "🏨 Average Occupancy",

    aiSummaryIT:
      "L’occupazione media è uno dei fattori più importanti per la redditività di un B&B o Airbnb.",

    aiSummaryEN:
      "Average occupancy is one of the most important factors for B&B or Airbnb profitability.",

    aiInsightIT:
      "Anche piccole variazioni dell’occupazione possono modificare drasticamente cashflow, sostenibilità e ROI dell’investimento.",

    aiInsightEN:
      "Even small occupancy variations can dramatically impact cashflow, sustainability and ROI.",

    warningIT:
      "⚠️ Occupazioni troppo ottimistiche possono falsare le simulazioni.",

    warningEN:
      "⚠️ Overly optimistic occupancy assumptions may distort projections.",

    recommendationsIT: [
      "Utilizza benchmark realistici.",
      "Confronta dati della città.",
      "Valuta stagionalità e concorrenza."
    ],

    recommendationsEN: [
      "Use realistic benchmarks.",
      "Compare city market data.",
      "Evaluate seasonality and competition."
    ],

    examples: [
      "occupazione Airbnb Roma",
      "occupancy rate",
      "booking percentage",
      "tasso riempimento",
      "occupazione media Airbnb"
    ],

    related: [
      "cashflow",
      "seasonality",
      "roi",
      "marketDemand"
    ]

  },

  // ===========================================
  // MARKET DEMAND
  // ===========================================

  marketDemand: {

    priority: 9,

    keywords: [
      "domanda",
      "market demand",
      "richiesta turistica",
      "domanda airbnb",
      "tourism demand",
      "mercato turistico",
      "domanda b&b"
    ],

    aiTitleIT:
      "🌍 Domanda di Mercato",

    aiTitleEN:
      "🌍 Market Demand",

    aiSummaryIT:
      "La domanda di mercato determina il reale potenziale dell’investimento.",

    aiSummaryEN:
      "Market demand determines the real investment potential.",

    aiInsightIT:
      "Città con forte domanda turistica tendono ad avere occupazione, ADR e redditività più elevate.",

    aiInsightEN:
      "Cities with strong tourism demand usually achieve higher occupancy, ADR and profitability.",

    warningIT:
      "⚠️ Domanda debole può ridurre rapidamente cashflow e sostenibilità.",

    warningEN:
      "⚠️ Weak demand may quickly reduce cashflow and sustainability.",

    recommendationsIT: [
      "Analizza benchmark turistici.",
      "Studia domanda reale.",
      "Confronta performance città."
    ],

    recommendationsEN: [
      "Analyze tourism benchmarks.",
      "Study real demand.",
      "Compare city performance."
    ],

    examples: [
      "domanda turistica roma",
      "airbnb demand",
      "mercato turistico",
      "richiesta Airbnb"
    ],

    related: [
      "occupancy",
      "seasonality",
      "riskScore",
      "averageNightPrice"
    ]

  },

  // ===========================================
  // PROPERTY LOCATION
  // ===========================================

  locationImpact: {

    priority: 8,

    keywords: [
      "location",
      "zona",
      "quartiere",
      "posizione immobile",
      "property location",
      "zona turistica",
      "miglior zona"
    ],

    aiTitleIT:
      "📍 Posizione Immobile",

    aiTitleEN:
      "📍 Property Location",

    aiSummaryIT:
      "La posizione dell’immobile influisce direttamente sulla performance dell’investimento.",

    aiSummaryEN:
      "Property location directly impacts investment performance.",

    aiInsightIT:
      "Zone centrali o turistiche tendono ad avere maggiore occupazione, ADR più elevato e domanda più stabile.",

    aiInsightEN:
      "Central or tourist areas usually achieve stronger occupancy, higher ADR and more stable demand.",

    warningIT:
      "⚠️ Una posizione debole può limitare occupazione e cashflow.",

    warningEN:
      "⚠️ Weak locations may limit occupancy and cashflow.",

    recommendationsIT: [
      "Analizza domanda della zona.",
      "Confronta immobili simili.",
      "Valuta accessibilità e turismo."
    ],

    recommendationsEN: [
      "Analyze local demand.",
      "Compare similar properties.",
      "Evaluate accessibility and tourism."
    ],

    examples: [
      "miglior zona airbnb",
      "quartiere turistico",
      "property location",
      "zona migliore"
    ],

    related: [
      "occupancy",
      "marketDemand",
      "riskScore",
      "averageNightPrice"
    ]

  },

  // ===========================================
  // AVERAGE NIGHT PRICE
  // ===========================================

  averageNightPrice: {

    priority: 8,

    keywords: [
      "prezzo notte",
      "nightly rate",
      "average daily rate",
      "adr",
      "prezzo medio",
      "tariffa notte",
      "average price"
    ],

    aiTitleIT:
      "💎 Prezzo Medio Notte (ADR)",

    aiTitleEN:
      "💎 Average Nightly Rate (ADR)",

    aiSummaryIT:
      "Il prezzo medio per notte influenza direttamente ricavi, cashflow e ROI.",

    aiSummaryEN:
      "Average nightly pricing directly impacts revenue, cashflow and ROI.",

    aiInsightIT:
      "Prezzi troppo elevati possono ridurre occupazione e competitività rispetto al mercato.",

    aiInsightEN:
      "Excessively high pricing may reduce occupancy and market competitiveness.",

    warningIT:
      "⚠️ ADR non realistici possono alterare le proiezioni finanziarie.",

    warningEN:
      "⚠️ Unrealistic ADR assumptions may distort financial projections.",

    recommendationsIT: [
      "Confronta ADR della città.",
      "Utilizza pricing dinamico.",
      "Bilancia prezzo e occupazione."
    ],

    recommendationsEN: [
      "Compare city ADR benchmarks.",
      "Use dynamic pricing.",
      "Balance pricing and occupancy."
    ],

    examples: [
      "ADR Airbnb",
      "prezzo medio roma",
      "nightly revenue",
      "average daily rate"
    ],

    related: [
      "occupancy",
      "cashflow",
      "marketDemand",
      "roi"
    ]

  },

  // ===========================================
  // PROPERTY MANAGEMENT
  // ===========================================

  propertyManagement: {

    priority: 7,

    keywords: [
      "gestione",
      "property management",
      "gestione airbnb",
      "host management",
      "management fees",
      "gestione b&b",
      "property manager"
    ],

    aiTitleIT:
      "🧠 Gestione Operativa",

    aiTitleEN:
      "🧠 Property Management",

    aiSummaryIT:
      "La gestione professionale può migliorare performance e qualità operativa.",

    aiSummaryEN:
      "Professional management may improve performance and operational quality.",

    aiInsightIT:
      "Migliori recensioni e occupazione possono aumentare redditività, ma le commissioni riducono il margine operativo.",

    aiInsightEN:
      "Better reviews and occupancy may increase profitability, but management fees reduce operating margins.",

    warningIT:
      "⚠️ Costi di gestione elevati possono comprimere il cashflow.",

    warningEN:
      "⚠️ High management fees may compress cashflow.",

    recommendationsIT: [
      "Automatizza processi operativi.",
      "Controlla costi di gestione.",
      "Migliora esperienza ospiti."
    ],

    recommendationsEN: [
      "Automate operations.",
      "Control management costs.",
      "Improve guest experience."
    ],

    examples: [
      "gestione Airbnb",
      "property manager",
      "management cost",
      "commissioni gestione"
    ],

    related: [
      "cashflow",
      "occupancy",
      "hiddenCosts",
      "operatingMargin"
    ]

  },

  // ===========================================
  // MARKET SATURATION
  // ===========================================

  marketSaturation: {

    priority: 8,

    keywords: [
      "mercato saturo",
      "market saturation",
      "troppi airbnb",
      "alta concorrenza",
      "competition",
      "competizione"
    ],

    aiTitleIT:
      "⚠️ Saturazione Mercato",

    aiTitleEN:
      "⚠️ Market Saturation",

    aiSummaryIT:
      "Un mercato troppo saturo può ridurre occupazione e redditività.",

    aiSummaryEN:
      "An oversaturated market may reduce occupancy and profitability.",

    aiInsightIT:
      "L’eccessiva concorrenza short-rent può abbassare ADR e margini operativi.",

    aiInsightEN:
      "Excessive short-rent competition may reduce ADR and operating margins.",

    warningIT:
      "⚠️ Mercati saturi aumentano il rischio operativo.",

    warningEN:
      "⚠️ Saturated markets increase operational risk.",

    recommendationsIT: [
      "Analizza concorrenza locale.",
      "Differenzia il listing.",
      "Valuta nicchie turistiche."
    ],

    recommendationsEN: [
      "Analyze local competition.",
      "Differentiate your listing.",
      "Evaluate tourism niches."
    ],

    examples: [
      "troppi Airbnb",
      "mercato saturo Roma",
      "alta concorrenza"
    ],

    related: [
      "riskScore",
      "marketDemand",
      "occupancy"
    ]

  },

  // ===========================================
  // TOURISM TREND
  // ===========================================

  tourismTrend: {

    priority: 7,

    keywords: [
      "trend turismo",
      "tourism trend",
      "trend turistico",
      "crescita turismo",
      "tourism growth"
    ],

    aiTitleIT:
      "📈 Trend Turistico",

    aiTitleEN:
      "📈 Tourism Trend",

    aiSummaryIT:
      "I trend turistici influenzano direttamente domanda e occupazione.",

    aiSummaryEN:
      "Tourism trends directly impact demand and occupancy.",

    aiInsightIT:
      "La crescita del turismo può aumentare redditività e sostenibilità degli investimenti short-rent.",

    aiInsightEN:
      "Tourism growth may improve profitability and sustainability of short-rent investments.",

    warningIT:
      "⚠️ Cambiamenti nei flussi turistici possono alterare rapidamente il mercato.",

    warningEN:
      "⚠️ Changes in tourism flows may quickly alter market conditions.",

    recommendationsIT: [
      "Monitora trend turistici.",
      "Analizza eventi e stagionalità.",
      "Confronta crescita della città."
    ],

    recommendationsEN: [
      "Monitor tourism trends.",
      "Analyze events and seasonality.",
      "Compare city growth data."
    ],

    examples: [
      "trend Airbnb",
      "turismo Roma",
      "crescita turistica"
    ],

    related: [
      "marketDemand",
      "occupancy",
      "seasonality"
    ]

  }

});
