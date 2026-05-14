// ===============================================
// ⚠️ RISK KNOWLEDGE
// ===============================================

Object.assign(window.rbKnowledgeBase, {

  // ===========================================
  // RISK SCORE
  // ===========================================

  riskScore: {

    keywords: [
      "rischio",
      "risk",
      "risk score",
      "investment risk",
      "rischio investimento",
      "rischio airbnb",
      "investment sustainability"
    ],

    answerIT:
      "Il Risk Score valuta la sostenibilità dell’investimento considerando cashflow, occupazione, mutuo, volatilità del mercato e margine operativo.",

    answerEN:
      "Risk Score evaluates investment sustainability by analyzing cashflow, occupancy, mortgage impact, market volatility and operating margins.",

    examples: [
      "rischio investimento",
      "risk score Airbnb",
      "alto rischio",
      "safe investment"
    ],

    related: [
      "cashflow",
      "mortgageImpact",
      "seasonality"
    ]

  },

  // ===========================================
  // SEASONALITY
  // ===========================================

  seasonality: {

    keywords: [
      "stagionalità",
      "seasonality",
      "bassa stagione",
      "alta stagione",
      "seasonal demand"
    ],

    answerIT:
      "La stagionalità influenza occupazione, prezzi medi e stabilità del cashflow. Le città troppo stagionali possono generare forti variazioni di profitto durante l’anno.",

    answerEN:
      "Seasonality impacts occupancy, average pricing and cashflow stability. Highly seasonal markets may experience strong profit fluctuations during the year.",

    examples: [
      "alta stagione",
      "bassa stagione",
      "seasonal Airbnb market",
      "turismo stagionale"
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

    keywords: [
      "volatilità",
      "market volatility",
      "mercato instabile",
      "unstable market",
      "market fluctuation"
    ],

    answerIT:
      "La volatilità del mercato può influenzare occupazione, prezzi medi e redditività futura dell’investimento immobiliare.",

    answerEN:
      "Market volatility can impact occupancy, pricing and future profitability of the real estate investment.",

    examples: [
      "mercato volatile",
      "airbnb volatility",
      "investment fluctuation"
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

    keywords: [
      "troppo debito",
      "over leverage",
      "leva eccessiva",
      "high debt",
      "mutuo troppo alto"
    ],

    answerIT:
      "Un eccesso di leva finanziaria può aumentare il ROI teorico ma rende l’investimento più fragile durante periodi di bassa occupazione.",

    answerEN:
      "Excessive leverage may increase theoretical ROI but makes the investment more fragile during low occupancy periods.",

    examples: [
      "mutuo troppo alto",
      "high leverage risk",
      "debito elevato"
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

    keywords: [
      "mercato saturo",
      "market saturation",
      "troppi airbnb",
      "high competition",
      "concorrenza"
    ],

    answerIT:
      "Un mercato troppo saturo può ridurre occupazione e prezzi medi a causa dell’elevata concorrenza tra immobili.",

    answerEN:
      "An oversaturated market may reduce occupancy and nightly pricing because of high competition between properties.",

    examples: [
      "troppi Airbnb",
      "competizione elevata",
      "saturated market"
    ],

    related: [
      "marketDemand",
      "occupancy",
      "riskScore"
    ]

  }

});

});
