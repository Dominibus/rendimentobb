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
      "investimento rischioso",
      "investment sustainability"
    ],

    answerIT:
      "Il Risk Score valuta la sostenibilità dell’investimento considerando cashflow, occupazione, leva finanziaria, costi operativi, volatilità mercato e stabilità della domanda turistica.",

    answerEN:
      "Risk Score evaluates investment sustainability by analyzing cashflow, occupancy, financial leverage, operating costs, market volatility and tourism demand stability.",

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

    keywords: [
      "stagionalità",
      "seasonality",
      "alta stagione",
      "bassa stagione",
      "seasonal demand",
      "turismo stagionale"
    ],

    answerIT:
      "La stagionalità influenza occupazione, prezzo medio notte e stabilità del cashflow. Mercati troppo stagionali possono generare forti variazioni di redditività durante l’anno.",

    answerEN:
      "Seasonality impacts occupancy, nightly pricing and cashflow stability. Highly seasonal markets may create strong profitability fluctuations during the year.",

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

    keywords: [
      "volatilità",
      "market volatility",
      "mercato instabile",
      "mercato volatile",
      "instabilità mercato"
    ],

    answerIT:
      "La volatilità del mercato può influenzare domanda, occupazione e redditività futura dell’investimento immobiliare.",

    answerEN:
      "Market volatility may affect demand, occupancy and future profitability of the real estate investment.",

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

    keywords: [
      "leva eccessiva",
      "over leverage",
      "troppo debito",
      "high leverage",
      "mutuo troppo alto",
      "leva finanziaria alta"
    ],

    answerIT:
      "Una leva finanziaria troppo aggressiva può aumentare il ROI teorico ma rende l’investimento più fragile durante periodi di bassa occupazione o aumento costi.",

    answerEN:
      "Excessive financial leverage may increase theoretical ROI but makes the investment more fragile during low occupancy periods or rising costs.",

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

    keywords: [
      "mercato saturo",
      "market saturation",
      "troppi airbnb",
      "alta concorrenza",
      "competition",
      "concorrenza elevata"
    ],

    answerIT:
      "Un mercato troppo saturo può ridurre occupazione e prezzo medio notte a causa dell’elevata concorrenza tra immobili short-rent.",

    answerEN:
      "An oversaturated market may reduce occupancy and nightly pricing because of high short-rent competition.",

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

    keywords: [
      "regolamentazioni",
      "regulations",
      "normative airbnb",
      "licenze",
      "vincoli short rent",
      "leggi airbnb"
    ],

    answerIT:
      "Normative locali, licenze e restrizioni sugli affitti brevi possono influenzare redditività e sostenibilità dell’investimento.",

    answerEN:
      "Local regulations, licenses and short-rent restrictions may impact investment profitability and sustainability.",

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
