// ===============================================
// 🚨 RENDIMENTOBB – INVESTOR MISTAKES AI MODULE
// ===============================================

window.rbKnowledgeBase =
  window.rbKnowledgeBase || {};

// ===============================================
// 🚨 MISTAKES MODULE
// ===============================================

window.rbKnowledgeBase.mistakes = {

  module: "mistakes",

  version: "2.0",

  aiRoleIT:
    "Esperto AI di errori investimento short-rent e B&B",

  aiRoleEN:
    "AI expert in short-rent and B&B investment mistakes",

  descriptionIT:
    "Modulo AI dedicato agli errori più comuni negli investimenti Airbnb, B&B e short-rent.",

  descriptionEN:
    "AI module focused on the most common Airbnb, B&B and short-rent investment mistakes.",

  // =============================================
  // 🚨 COMMON INVESTOR MISTAKES
  // =============================================

  commonMistakes: {

    priority: 10,

    category: "investment-errors",

    scoreWeight: 1.7,

    keywords: [
      "errori",
      "mistakes",
      "errori investitori",
      "investment mistakes",
      "errori airbnb",
      "errore investimento",
      "bad investment",
      "investimento sbagliato",
      "comprare male"
    ],

    aiTitleIT:
      "🚨 Errori Comuni Investitori",

    aiTitleEN:
      "🚨 Common Investor Mistakes",

    aiSummaryIT:
      "Molti investitori short-rent perdono soldi perché analizzano solo il prezzo dell’immobile o il ROI teorico.",

    aiSummaryEN:
      "Many short-rent investors lose money because they only analyze property price or theoretical ROI.",

    aiInsightIT:
      "I problemi più comuni derivano da cashflow debole, mutui aggressivi, costi nascosti, occupazione irreale e mancanza di analisi mercato.",

    aiInsightEN:
      "The most common problems come from weak cashflow, aggressive leverage, hidden costs, unrealistic occupancy and poor market analysis.",

    warningIT:
      "⚠️ ROI elevato senza sostenibilità reale può diventare molto rischioso.",

    warningEN:
      "⚠️ High ROI without real sustainability may become highly risky.",

    recommendationsIT: [
      "Analizza cashflow reale.",
      "Confronta ROI e rischio.",
      "Valuta sostenibilità a lungo termine."
    ],

    recommendationsEN: [
      "Analyze real cashflow.",
      "Compare ROI with risk.",
      "Evaluate long-term sustainability."
    ],

    related: [
      "riskScore",
      "cashflow",
      "roi",
      "seasonality",
      "hiddenCosts"
    ]

  },

  // =============================================
  // 💸 HIDDEN COSTS
  // =============================================

  hiddenCosts: {

    priority: 9,

    category: "cost-errors",

    scoreWeight: 1.5,

    keywords: [
      "costi nascosti",
      "hidden costs",
      "spese impreviste",
      "extra costs",
      "spese airbnb",
      "commissioni booking",
      "ota fees",
      "spese operative"
    ],

    aiTitleIT:
      "💸 Costi Nascosti",

    aiTitleEN:
      "💸 Hidden Costs",

    aiSummaryIT:
      "Molti investitori sottostimano i costi operativi reali degli affitti brevi.",

    aiSummaryEN:
      "Many investors underestimate real short-rent operating costs.",

    aiInsightIT:
      "Cleaning, manutenzione, tasse, utenze, OTA fees e periodi vuoti possono ridurre drasticamente il profitto reale.",

    aiInsightEN:
      "Cleaning, maintenance, taxes, utilities, OTA fees and vacancy periods may drastically reduce real profitability.",

    warningIT:
      "⚠️ Costi nascosti elevati possono trasformare un ROI forte in cashflow negativo.",

    warningEN:
      "⚠️ High hidden costs may turn strong ROI into negative cashflow.",

    recommendationsIT: [
      "Mantieni margini di sicurezza.",
      "Calcola costi realistici.",
      "Prevedi riserve liquide."
    ],

    recommendationsEN: [
      "Maintain safety margins.",
      "Estimate realistic costs.",
      "Keep liquidity reserves."
    ],

    related: [
      "cashflow",
      "operatingMargin",
      "riskScore"
    ]

  },

  // =============================================
  // 📈 FAKE ROI
  // =============================================

  fakeROI: {

    priority: 9,

    category: "projection-errors",

    scoreWeight: 1.6,

    keywords: [
      "roi falso",
      "fake roi",
      "roi troppo alto",
      "unrealistic roi",
      "roi finto",
      "roi irrealistico",
      "high roi risk"
    ],

    aiTitleIT:
      "📈 ROI Irrealistico",

    aiTitleEN:
      "📈 Unrealistic ROI",

    aiSummaryIT:
      "ROI molto elevati possono essere fuorvianti se non considerano rischio e sostenibilità reale.",

    aiSummaryEN:
      "Very high ROI projections may be misleading if they ignore real sustainability and risk.",

    aiInsightIT:
      "Molti ROI teorici ignorano tasse, mutuo, occupazione media reale, costi operativi e volatilità del mercato.",

    aiInsightEN:
      "Many theoretical ROI projections ignore taxes, mortgages, real occupancy, operating costs and market volatility.",

    warningIT:
      "⚠️ ROI aggressivi senza cashflow stabile possono diventare molto fragili.",

    warningEN:
      "⚠️ Aggressive ROI without stable cashflow may become extremely fragile.",

    recommendationsIT: [
      "Confronta ROI e cashflow.",
      "Utilizza benchmark realistici.",
      "Analizza il rischio operativo."
    ],

    recommendationsEN: [
      "Compare ROI with cashflow.",
      "Use realistic benchmarks.",
      "Analyze operational risk."
    ],

    related: [
      "roi",
      "cashflow",
      "riskScore",
      "mortgageImpact"
    ]

  },

  // =============================================
  // 🌍 MARKET ANALYSIS ERROR
  // =============================================

  marketAnalysisMistake: {

    priority: 8,

    category: "market-errors",

    scoreWeight: 1.4,

    keywords: [
      "analisi mercato",
      "market analysis",
      "mercato saturo",
      "competition",
      "domanda turistica",
      "errore mercato",
      "troppi airbnb"
    ],

    aiTitleIT:
      "🌍 Analisi Mercato Errata",

    aiTitleEN:
      "🌍 Poor Market Analysis",

    aiSummaryIT:
      "Comprare in una città turistica non garantisce automaticamente un investimento profittevole.",

    aiSummaryEN:
      "Buying in a tourist city does not automatically guarantee a profitable investment.",

    aiInsightIT:
      "Domanda reale, concorrenza, saturazione mercato, regolamentazioni e stagionalità sono fattori decisivi.",

    aiInsightEN:
      "Real demand, competition, market saturation, regulations and seasonality are critical factors.",

    warningIT:
      "⚠️ Mercati saturi possono comprimere occupazione e margini operativi.",

    warningEN:
      "⚠️ Saturated markets may compress occupancy and operating margins.",

    recommendationsIT: [
      "Analizza benchmark città.",
      "Studia occupazione reale.",
      "Valuta domanda e concorrenza."
    ],

    recommendationsEN: [
      "Analyze city benchmarks.",
      "Study real occupancy.",
      "Evaluate demand and competition."
    ],

    related: [
      "marketDemand",
      "marketSaturation",
      "seasonality",
      "occupancy"
    ]

  },

  // =============================================
  // 🏦 OVER LEVERAGE
  // =============================================

  overLeverageMistake: {

    priority: 9,

    category: "financial-errors",

    scoreWeight: 1.7,

    keywords: [
      "troppo mutuo",
      "over leverage",
      "leva troppo alta",
      "troppo debito",
      "mutuo elevato",
      "high leverage"
    ],

    aiTitleIT:
      "🏦 Leverage Aggressivo",

    aiTitleEN:
      "🏦 Aggressive Leverage",

    aiSummaryIT:
      "Una leva finanziaria troppo aggressiva aumenta fortemente il rischio operativo.",

    aiSummaryEN:
      "Excessive leverage strongly increases operational risk.",

    aiInsightIT:
      "Un mutuo troppo elevato può migliorare il ROI teorico ma rendere fragile il cashflow reale.",

    aiInsightEN:
      "Excessive leverage may improve theoretical ROI while weakening real cashflow.",

    warningIT:
      "⚠️ Leverage aggressivo aumenta vulnerabilità finanziaria.",

    warningEN:
      "⚠️ Aggressive leverage increases financial vulnerability.",

    recommendationsIT: [
      "Mantieni DSCR sostenibile.",
      "Evita rate troppo elevate.",
      "Mantieni liquidità disponibile."
    ],

    recommendationsEN: [
      "Maintain sustainable DSCR.",
      "Avoid excessive payments.",
      "Maintain liquidity reserves."
    ],

    related: [
      "mortgageImpact",
      "cashflow",
      "dscr",
      "riskScore"
    ]

  },

  // =============================================
  // 🏨 BAD OCCUPANCY ESTIMATE
  // =============================================

  badOccupancyEstimate: {

    priority: 8,

    category: "projection-errors",

    scoreWeight: 1.4,

    keywords: [
      "occupazione troppo alta",
      "occupancy irrealistica",
      "stima occupazione",
      "occupancy estimate",
      "occupancy fake",
      "occupazione falsa"
    ],

    aiTitleIT:
      "🏨 Occupazione Irrealistica",

    aiTitleEN:
      "🏨 Unrealistic Occupancy",

    aiSummaryIT:
      "Molti investitori utilizzano stime di occupazione troppo ottimistiche.",

    aiSummaryEN:
      "Many investors use overly optimistic occupancy assumptions.",

    aiInsightIT:
      "Occupazioni irreali possono falsare ROI, cashflow e sostenibilità finanziaria.",

    aiInsightEN:
      "Unrealistic occupancy assumptions may distort ROI, cashflow and financial sustainability.",

    warningIT:
      "⚠️ Occupazioni troppo elevate generano simulazioni poco realistiche.",

    warningEN:
      "⚠️ Excessively high occupancy creates unrealistic projections.",

    recommendationsIT: [
      "Usa benchmark reali.",
      "Confronta dati città.",
      "Mantieni stime conservative."
    ],

    recommendationsEN: [
      "Use real benchmarks.",
      "Compare city data.",
      "Keep projections conservative."
    ],

    related: [
      "occupancy",
      "cashflow",
      "roi",
      "seasonality"
    ]

  },

  // =============================================
  // 💎 OVERPRICING
  // =============================================

  overPricing: {

    priority: 7,

    category: "pricing-errors",

    scoreWeight: 1.2,

    keywords: [
      "prezzo troppo alto",
      "overpricing",
      "adr troppo alto",
      "pricing sbagliato",
      "night price too high"
    ],

    aiTitleIT:
      "💎 Prezzo Notte Eccessivo",

    aiTitleEN:
      "💎 Excessive Night Pricing",

    aiSummaryIT:
      "Prezzi troppo elevati possono ridurre occupazione e competitività.",

    aiSummaryEN:
      "Excessive pricing may reduce occupancy and competitiveness.",

    aiInsightIT:
      "ADR troppo aggressivi possono comprimere prenotazioni e cashflow nel lungo periodo.",

    aiInsightEN:
      "Aggressive ADR pricing may reduce bookings and long-term cashflow.",

    warningIT:
      "⚠️ Prezzi non realistici aumentano il rischio operativo.",

    warningEN:
      "⚠️ Unrealistic pricing increases operational risk.",

    recommendationsIT: [
      "Confronta ADR mercato.",
      "Usa pricing dinamico.",
      "Ottimizza occupazione."
    ],

    recommendationsEN: [
      "Compare market ADR.",
      "Use dynamic pricing.",
      "Optimize occupancy."
    ],

    related: [
      "averageNightPrice",
      "occupancy",
      "cashflow"
    ]

  },

  // =============================================
  // 📉 UNDERPRICING
  // =============================================

  underPricing: {

    priority: 6,

    category: "pricing-errors",

    scoreWeight: 1.1,

    keywords: [
      "prezzo troppo basso",
      "underpricing",
      "adr basso",
      "night price too low",
      "prezzo basso airbnb"
    ],

    aiTitleIT:
      "📉 Prezzo Notte Troppo Basso",

    aiTitleEN:
      "📉 Night Price Too Low",

    aiSummaryIT:
      "Prezzi troppo bassi possono aumentare occupazione ma ridurre drasticamente i margini.",

    aiSummaryEN:
      "Very low pricing may increase occupancy while drastically reducing margins.",

    aiInsightIT:
      "Molti host cercano occupazione elevata sacrificando cashflow e redditività reale.",

    aiInsightEN:
      "Many hosts pursue high occupancy while sacrificing real profitability.",

    warningIT:
      "⚠️ Occupazione elevata con margini bassi può diventare insostenibile.",

    warningEN:
      "⚠️ High occupancy with low margins may become unsustainable.",

    recommendationsIT: [
      "Ottimizza ADR.",
      "Bilancia prezzo e occupazione.",
      "Analizza margini operativi."
    ],

    recommendationsEN: [
      "Optimize ADR.",
      "Balance pricing and occupancy.",
      "Analyze operating margins."
    ],

    related: [
      "cashflow",
      "operatingMargin",
      "occupancy"
    ]

  }

};

console.log(
  "🚨 INVESTOR MISTAKES AI MODULE READY",
  window.rbKnowledgeBase.mistakes
);
