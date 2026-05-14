// ===============================================
// ⚠️ RISK KNOWLEDGE
// ===============================================

Object.assign(window.rbKnowledgeBase, {

  // ===========================================
  // RISK SCORE
  // ===========================================

  riskScore: {

    priority: 10,

    keywords: [
      "rischio",
      "risk",
      "risk score",
      "investment risk",
      "rischio investimento",
      "rischio airbnb",
      "investimento rischioso",
      "investment sustainability"
    ],

    aiTitleIT:
      "⚠️ Risk Score",

    aiTitleEN:
      "⚠️ Risk Score",

    aiSummaryIT:
      "Il Risk Score valuta la sostenibilità complessiva dell’investimento immobiliare.",

    aiSummaryEN:
      "Risk Score evaluates the overall sustainability of the real estate investment.",

    aiInsightIT:
      "Il punteggio considera cashflow, occupazione, leva finanziaria, costi operativi, volatilità del mercato e stabilità della domanda turistica.",

    aiInsightEN:
      "The score analyzes cashflow, occupancy, financial leverage, operating costs, market volatility and tourism demand stability.",

    warningIT:
      "⚠️ ROI elevato non significa automaticamente investimento sicuro.",

    warningEN:
      "⚠️ High ROI does not automatically mean a safe investment.",

    recommendationsIT: [
      "Analizza cashflow reale.",
      "Valuta sostenibilità del mutuo.",
      "Confronta benchmark mercato."
    ],

    recommendationsEN: [
      "Analyze real cashflow.",
      "Evaluate mortgage sustainability.",
      "Compare market benchmarks."
    ],

    examples: [
      "rischio Airbnb",
      "risk score B&B",
      "investimento rischioso",
      "alto rischio investimento"
    ],

    related: [
      "cashflow",
      "mortgageImpact",
      "seasonality",
      "marketSaturation"
    ]

  },

  // ===========================================
  // SEASONALITY
  // ===========================================

  seasonality: {

    priority: 9,

    keywords: [
      "stagionalità",
      "seasonality",
      "alta stagione",
      "bassa stagione",
      "seasonal demand",
      "turismo stagionale"
    ],

    aiTitleIT:
      "🌦️ Stagionalità",

    aiTitleEN:
      "🌦️ Seasonality",

    aiSummaryIT:
      "La stagionalità influenza occupazione, ADR e stabilità del cashflow.",

    aiSummaryEN:
      "Seasonality impacts occupancy, ADR and cashflow stability.",

    aiInsightIT:
      "Mercati troppo stagionali possono creare forti variazioni di redditività durante l’anno.",

    aiInsightEN:
      "Highly seasonal markets may generate strong profitability fluctuations throughout the year.",

    warningIT:
      "⚠️ Periodi di bassa stagione possono comprimere il cashflow.",

    warningEN:
      "⚠️ Low-season periods may compress cashflow.",

    recommendationsIT: [
      "Analizza dati annuali.",
      "Diversifica la domanda.",
      "Ottimizza pricing stagionale."
    ],

    recommendationsEN: [
      "Analyze yearly data.",
      "Diversify demand sources.",
      "Optimize seasonal pricing."
    ],

    examples: [
      "alta stagione",
      "bassa stagione",
      "mercato stagionale",
      "seasonal Airbnb"
    ],

    related: [
      "occupancy",
      "marketDemand",
      "cashflow"
    ]

  },

  // ===========================================
  // MARKET VOLATILITY
  // ===========================================

  marketVolatility: {

    priority: 8,

    keywords: [
      "volatilità",
      "market volatility",
      "mercato instabile",
      "mercato volatile",
      "instabilità mercato"
    ],

    aiTitleIT:
      "📉 Volatilità Mercato",

    aiTitleEN:
      "📉 Market Volatility",

    aiSummaryIT:
      "La volatilità del mercato può influenzare domanda e redditività futura.",

    aiSummaryEN:
      "Market volatility may affect future demand and profitability.",

    aiInsightIT:
      "Mercati instabili possono generare variazioni improvvise di occupazione e cashflow.",

    aiInsightEN:
      "Unstable markets may generate sudden occupancy and cashflow changes.",

    warningIT:
      "⚠️ Elevata volatilità aumenta l’incertezza operativa.",

    warningEN:
      "⚠️ High volatility increases operational uncertainty.",

    recommendationsIT: [
      "Confronta trend mercato.",
      "Mantieni margini solidi.",
      "Riduci esposizione finanziaria."
    ],

    recommendationsEN: [
      "Compare market trends.",
      "Maintain strong margins.",
      "Reduce financial exposure."
    ],

    examples: [
      "mercato volatile",
      "volatilità Airbnb",
      "investment volatility"
    ],

    related: [
      "riskScore",
      "marketDemand",
      "seasonality"
    ]

  },

  // ===========================================
  // OVERLEVERAGE
  // ===========================================

  overLeverage: {

    priority: 9,

    keywords: [
      "leva eccessiva",
      "over leverage",
      "troppo debito",
      "high leverage",
      "mutuo troppo alto",
      "leva finanziaria alta"
    ],

    aiTitleIT:
      "🏦 Leva Finanziaria Eccessiva",

    aiTitleEN:
      "🏦 Excessive Financial Leverage",

    aiSummaryIT:
      "Una leva finanziaria aggressiva aumenta il rischio operativo.",

    aiSummaryEN:
      "Aggressive leverage increases operational risk.",

    aiInsightIT:
      "Un mutuo troppo elevato può comprimere il cashflow durante periodi di bassa occupazione o aumento costi.",

    aiInsightEN:
      "An excessively high mortgage may compress cashflow during low occupancy periods or rising costs.",

    warningIT:
      "⚠️ ROI leveraged elevato può nascondere fragilità finanziarie.",

    warningEN:
      "⚠️ High leveraged ROI may hide financial fragility.",

    recommendationsIT: [
      "Mantieni margini di sicurezza.",
      "Controlla sostenibilità rata.",
      "Analizza DSCR."
    ],

    recommendationsEN: [
      "Maintain safety margins.",
      "Control payment sustainability.",
      "Analyze DSCR."
    ],

    examples: [
      "mutuo troppo alto",
      "high leverage risk",
      "troppo debito"
    ],

    related: [
      "mortgageImpact",
      "cashflow",
      "dscr"
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
      "concorrenza elevata"
    ],

    aiTitleIT:
      "🏨 Saturazione Mercato",

    aiTitleEN:
      "🏨 Market Saturation",

    aiSummaryIT:
      "Un mercato troppo saturo può ridurre occupazione e redditività.",

    aiSummaryEN:
      "An oversaturated market may reduce occupancy and profitability.",

    aiInsightIT:
      "L’eccessiva concorrenza short-rent può comprimere ADR e margini operativi.",

    aiInsightEN:
      "Excessive short-rent competition may compress ADR and operating margins.",

    warningIT:
      "⚠️ Mercati saturi aumentano il rischio operativo nel lungo periodo.",

    warningEN:
      "⚠️ Saturated markets increase long-term operational risk.",

    recommendationsIT: [
      "Analizza la concorrenza.",
      "Differenzia il listing.",
      "Studia nicchie di mercato."
    ],

    recommendationsEN: [
      "Analyze competition.",
      "Differentiate the listing.",
      "Study market niches."
    ],

    examples: [
      "troppi Airbnb",
      "mercato saturo",
      "alta competizione"
    ],

    related: [
      "marketDemand",
      "occupancy",
      "riskScore"
    ]

  },

  // ===========================================
  // REGULATIONS
  // ===========================================

  regulationsRisk: {

    priority: 7,

    keywords: [
      "regolamentazioni",
      "regulations",
      "normative airbnb",
      "licenze",
      "vincoli short rent",
      "leggi airbnb"
    ],

    aiTitleIT:
      "📜 Rischio Normativo",

    aiTitleEN:
      "📜 Regulatory Risk",

    aiSummaryIT:
      "Normative locali e restrizioni possono influenzare la redditività degli affitti brevi.",

    aiSummaryEN:
      "Local regulations and restrictions may impact short-rent profitability.",

    aiInsightIT:
      "Licenze, limiti operativi e nuove normative possono modificare sostenibilità e domanda di mercato.",

    aiInsightEN:
      "Licenses, operational limits and new regulations may change sustainability and market demand.",

    warningIT:
      "⚠️ Cambi normativi possono aumentare rapidamente il rischio investimento.",

    warningEN:
      "⚠️ Regulatory changes may quickly increase investment risk.",

    recommendationsIT: [
      "Controlla normative locali.",
      "Verifica licenze richieste.",
      "Monitora cambi legislativi."
    ],

    recommendationsEN: [
      "Check local regulations.",
      "Verify licensing requirements.",
      "Monitor legal changes."
    ],

    examples: [
      "licenza Airbnb",
      "regole affitti brevi",
      "short rent regulations"
    ],

    related: [
      "riskScore",
      "marketDemand",
      "marketVolatility"
    ]

  }

});
