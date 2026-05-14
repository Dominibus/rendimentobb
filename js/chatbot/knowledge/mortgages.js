// ===============================================
// 🏦 MORTGAGE KNOWLEDGE
// ===============================================

Object.assign(window.rbKnowledgeBase, {

  // ===========================================
  // MORTGAGE IMPACT
  // ===========================================

  mortgageImpact: {

    priority: 10,

    keywords: [
      "mutuo",
      "mortgage",
      "financing",
      "leva finanziaria",
      "loan",
      "finanziamento immobile",
      "mutuo b&b",
      "mutuo airbnb",
      "debito immobile",
      "finanziamento investimento"
    ],

    aiTitleIT:
      "🏦 Impatto del Mutuo",

    aiTitleEN:
      "🏦 Mortgage Impact",

    aiSummaryIT:
      "Il mutuo può aumentare il ROI leveraged ma ridurre il cashflow mensile.",

    aiSummaryEN:
      "A mortgage may increase leveraged ROI while reducing monthly cashflow.",

    aiInsightIT:
      "Una leva finanziaria aggressiva aumenta il rischio operativo e rende l’investimento più vulnerabile durante periodi di bassa occupazione o aumento costi.",

    aiInsightEN:
      "Aggressive leverage increases operational risk and makes investments more vulnerable during low occupancy periods or rising costs.",

    warningIT:
      "⚠️ Un mutuo troppo elevato può comprimere il cashflow reale.",

    warningEN:
      "⚠️ Excessive leverage may compress real cashflow.",

    recommendationsIT: [
      "Mantieni margini operativi sostenibili.",
      "Controlla DSCR e cashflow.",
      "Evita leva troppo aggressiva."
    ],

    recommendationsEN: [
      "Maintain sustainable operating margins.",
      "Monitor DSCR and cashflow.",
      "Avoid excessive leverage."
    ],

    examples: [
      "mutuo Airbnb",
      "ROI con mutuo",
      "mortgage investment",
      "leva finanziaria immobiliare",
      "mutuo investimento"
    ],

    related: [
      "cashflow",
      "roi",
      "dscr",
      "riskScore",
      "ltv"
    ]

  },

  // ===========================================
  // FIXED RATE
  // ===========================================

  fixedRate: {

    priority: 8,

    keywords: [
      "tasso fisso",
      "fixed rate",
      "mutuo fisso",
      "rata fissa",
      "fixed mortgage"
    ],

    aiTitleIT:
      "📌 Tasso Fisso",

    aiTitleEN:
      "📌 Fixed Rate Mortgage",

    aiSummaryIT:
      "Il tasso fisso mantiene la rata stabile nel tempo.",

    aiSummaryEN:
      "A fixed-rate mortgage keeps payments stable over time.",

    aiInsightIT:
      "Offre maggiore stabilità finanziaria e protezione contro aumenti dei tassi di interesse, ma spesso parte da tassi iniziali leggermente più elevati.",

    aiInsightEN:
      "It offers stronger financial stability and protection against interest rate increases, but often starts with slightly higher initial rates.",

    warningIT:
      "⚠️ Un tasso fisso troppo alto può ridurre il cashflow.",

    warningEN:
      "⚠️ An excessively high fixed rate may reduce cashflow.",

    recommendationsIT: [
      "Valuta stabilità a lungo termine.",
      "Confronta TAN e TAEG.",
      "Analizza sostenibilità rata."
    ],

    recommendationsEN: [
      "Evaluate long-term stability.",
      "Compare APR and total loan cost.",
      "Analyze payment sustainability."
    ],

    examples: [
      "mutuo tasso fisso",
      "fixed mortgage",
      "rata costante",
      "protezione tassi"
    ],

    related: [
      "mortgageImpact",
      "riskScore",
      "mortgagePayment"
    ]

  },

  // ===========================================
  // VARIABLE RATE
  // ===========================================

  variableRate: {

    priority: 8,

    keywords: [
      "tasso variabile",
      "variable rate",
      "mutuo variabile",
      "variable mortgage",
      "euribor"
    ],

    aiTitleIT:
      "📈 Tasso Variabile",

    aiTitleEN:
      "📈 Variable Rate Mortgage",

    aiSummaryIT:
      "Il tasso variabile può ridurre inizialmente la rata ma aumenta il rischio finanziario.",

    aiSummaryEN:
      "Variable-rate mortgages may initially reduce payments but increase financial risk.",

    aiInsightIT:
      "Investimenti con cashflow debole sono più vulnerabili ai rialzi dei tassi di interesse.",

    aiInsightEN:
      "Investments with weak cashflow are more vulnerable to rising interest rates.",

    warningIT:
      "⚠️ Rialzi dei tassi possono compromettere la sostenibilità del mutuo.",

    warningEN:
      "⚠️ Rising rates may compromise mortgage sustainability.",

    recommendationsIT: [
      "Mantieni cashflow solido.",
      "Valuta scenari con tassi più alti.",
      "Controlla esposizione finanziaria."
    ],

    recommendationsEN: [
      "Maintain strong cashflow.",
      "Evaluate higher-rate scenarios.",
      "Monitor financial exposure."
    ],

    examples: [
      "mutuo variabile",
      "variable mortgage",
      "rischio tassi",
      "euribor alto"
    ],

    related: [
      "riskScore",
      "mortgageImpact",
      "cashflow"
    ]

  },

  // ===========================================
  // LOAN TO VALUE
  // ===========================================

  ltv: {

    priority: 8,

    keywords: [
      "ltv",
      "loan to value",
      "percentuale mutuo",
      "leva mutuo",
      "loan ratio",
      "percentuale finanziata"
    ],

    aiTitleIT:
      "📊 Loan To Value (LTV)",

    aiTitleEN:
      "📊 Loan To Value (LTV)",

    aiSummaryIT:
      "LTV indica la percentuale dell’immobile finanziata dalla banca.",

    aiSummaryEN:
      "LTV indicates the percentage of the property financed by the bank.",

    aiInsightIT:
      "Un LTV elevato aumenta leva finanziaria e rischio operativo, riducendo il margine di sicurezza dell’investimento.",

    aiInsightEN:
      "A high LTV increases leverage and operational risk while reducing the investment safety margin.",

    warningIT:
      "⚠️ LTV molto elevati aumentano l’esposizione finanziaria.",

    warningEN:
      "⚠️ Very high LTV levels increase financial exposure.",

    recommendationsIT: [
      "Mantieni equity sufficiente.",
      "Evita leverage eccessivo.",
      "Analizza sostenibilità rata."
    ],

    recommendationsEN: [
      "Maintain sufficient equity.",
      "Avoid excessive leverage.",
      "Analyze payment sustainability."
    ],

    examples: [
      "LTV 80%",
      "mutuo 100%",
      "loan to value ratio",
      "percentuale mutuo"
    ],

    related: [
      "mortgageImpact",
      "riskScore",
      "fullMortgage"
    ]

  },

  // ===========================================
  // MORTGAGE PAYMENT
  // ===========================================

  mortgagePayment: {

    priority: 7,

    keywords: [
      "rata",
      "mortgage payment",
      "monthly payment",
      "rata mutuo",
      "rata sostenibile",
      "pagamento mutuo"
    ],

    aiTitleIT:
      "💳 Rata Mutuo",

    aiTitleEN:
      "💳 Mortgage Payment",

    aiSummaryIT:
      "La rata del mutuo influisce direttamente sul cashflow mensile.",

    aiSummaryEN:
      "Mortgage payments directly impact monthly cashflow.",

    aiInsightIT:
      "Una rata troppo elevata può comprimere margini operativi e sostenibilità finanziaria.",

    aiInsightEN:
      "Excessive mortgage payments may compress operating margins and financial sustainability.",

    warningIT:
      "⚠️ Rate elevate aumentano il rischio operativo.",

    warningEN:
      "⚠️ High loan payments increase operational risk.",

    recommendationsIT: [
      "Mantieni cashflow positivo.",
      "Evita rate troppo aggressive.",
      "Controlla sostenibilità finanziaria."
    ],

    recommendationsEN: [
      "Maintain positive cashflow.",
      "Avoid overly aggressive payments.",
      "Monitor financial sustainability."
    ],

    examples: [
      "rata sostenibile",
      "monthly mortgage payment",
      "cashflow mutuo",
      "peso rata"
    ],

    related: [
      "cashflow",
      "dscr",
      "mortgageImpact",
      "operatingMargin"
    ]

  },

  // ===========================================
  // 100% MORTGAGE
  // ===========================================

  fullMortgage: {

    priority: 9,

    keywords: [
      "mutuo 100%",
      "100 mortgage",
      "full financing",
      "finanziamento totale",
      "100 financing",
      "mutuo completo"
    ],

    aiTitleIT:
      "🚨 Mutuo 100%",

    aiTitleEN:
      "🚨 100% Mortgage",

    aiSummaryIT:
      "Un mutuo al 100% aumenta fortemente la leva finanziaria.",

    aiSummaryEN:
      "A 100% mortgage significantly increases leverage.",

    aiInsightIT:
      "Rate elevate, margini ridotti e maggiore esposizione ai cambiamenti di mercato rendono l’investimento più fragile.",

    aiInsightEN:
      "High payments, lower margins and stronger exposure to market changes make the investment more fragile.",

    warningIT:
      "⚠️ Elevata leva finanziaria aumenta il rischio operativo.",

    warningEN:
      "⚠️ High leverage increases operational risk.",

    recommendationsIT: [
      "Mantieni riserve liquide.",
      "Analizza cashflow realistico.",
      "Evita sovraesposizione finanziaria."
    ],

    recommendationsEN: [
      "Maintain liquidity reserves.",
      "Analyze realistic cashflow.",
      "Avoid financial overexposure."
    ],

    examples: [
      "finanziamento totale",
      "100% financing",
      "high leverage investment",
      "mutuo totale"
    ],

    related: [
      "riskScore",
      "mortgageImpact",
      "cashflow",
      "ltv",
      "dscr"
    ]

  },

  // ===========================================
  // INTEREST RATES
  // ===========================================

  interestRates: {

    priority: 7,

    keywords: [
      "tassi",
      "interest rates",
      "tassi interesse",
      "interest rate",
      "rialzo tassi"
    ],

    aiTitleIT:
      "📈 Tassi di Interesse",

    aiTitleEN:
      "📈 Interest Rates",

    aiSummaryIT:
      "L’aumento dei tassi può ridurre cashflow e sostenibilità finanziaria.",

    aiSummaryEN:
      "Rising rates may reduce cashflow and financial sustainability.",

    aiInsightIT:
      "Investimenti altamente levereggiati risultano generalmente più vulnerabili ai rialzi dei tassi.",

    aiInsightEN:
      "Highly leveraged investments are generally more vulnerable to rising interest rates.",

    warningIT:
      "⚠️ Rialzi dei tassi possono aumentare il rischio operativo.",

    warningEN:
      "⚠️ Rate increases may raise operational risk.",

    recommendationsIT: [
      "Valuta scenari stress test.",
      "Mantieni margini di sicurezza.",
      "Controlla sostenibilità del mutuo."
    ],

    recommendationsEN: [
      "Evaluate stress-test scenarios.",
      "Maintain safety margins.",
      "Monitor mortgage sustainability."
    ],

    examples: [
      "rialzo tassi",
      "interest rates",
      "euribor",
      "tassi mutuo"
    ],

    related: [
      "variableRate",
      "mortgageImpact",
      "riskScore"
    ]

  }

});
