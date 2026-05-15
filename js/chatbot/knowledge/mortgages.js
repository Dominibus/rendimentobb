// ===============================================
// 🏦 RENDIMENTOBB – MORTGAGE AI KNOWLEDGE
// ===============================================

window.rbKnowledgeBase =
  window.rbKnowledgeBase || {};

// ===============================================
// 🏦 MORTGAGE MODULE
// ===============================================

window.rbKnowledgeBase.mortgages = {

  module: "mortgages",

  version: "2.0",

  aiRoleIT:
    "Esperto mutui e leva finanziaria immobiliare",

  aiRoleEN:
    "Mortgage and real estate leverage expert",

  descriptionIT:
    "Modulo AI dedicato a mutui, leva finanziaria, sostenibilità rata, LTV e rischio finanziario.",

  descriptionEN:
    "AI module dedicated to mortgages, leverage, payment sustainability, LTV and financial risk.",

  // =============================================
  // 🏦 MORTGAGE IMPACT
  // =============================================

  mortgageImpact: {

    priority: 10,

    category: "leverage",

    scoreWeight: 1.5,

    keywords: [
      "mutuo",
      "mortgage",
      "loan",
      "financing",
      "leva finanziaria",
      "finanziamento immobile",
      "mutuo b&b",
      "mutuo airbnb"
    ],

    aiTitleIT:
      "🏦 Impatto del Mutuo",

    aiTitleEN:
      "🏦 Mortgage Impact",

    aiSummaryIT:
      "La leva finanziaria può aumentare il ROI ma comprimere cashflow e sostenibilità.",

    aiSummaryEN:
      "Financial leverage may increase ROI while compressing cashflow and sustainability.",

    aiInsightIT:
      "Mutui aggressivi aumentano sensibilità a occupazione, tassi e costi operativi.",

    aiInsightEN:
      "Aggressive leverage increases sensitivity to occupancy, rates and operating costs.",

    warningIT:
      "⚠️ Leverage elevata aumenta il rischio operativo.",

    warningEN:
      "⚠️ High leverage increases operational risk.",

    benchmarks: {

      conservative: 50,
      balanced: 70,
      aggressive: 85

    },

    recommendationsIT: [
      "Mantieni cashflow positivo.",
      "Controlla DSCR.",
      "Evita leva eccessiva."
    ],

    recommendationsEN: [
      "Maintain positive cashflow.",
      "Monitor DSCR.",
      "Avoid excessive leverage."
    ],

    related: [
      "cashflow",
      "ltv",
      "riskScore",
      "mortgagePayment"
    ]

  },

  // =============================================
  // 📌 FIXED RATE
  // =============================================

  fixedRate: {

    priority: 8,

    category: "rate",

    scoreWeight: 1.1,

    keywords: [
      "tasso fisso",
      "fixed rate",
      "mutuo fisso",
      "fixed mortgage"
    ],

    aiTitleIT:
      "📌 Tasso Fisso",

    aiTitleEN:
      "📌 Fixed Rate",

    aiSummaryIT:
      "Il tasso fisso offre stabilità e prevedibilità finanziaria.",

    aiSummaryEN:
      "Fixed rates provide financial stability and predictability.",

    aiInsightIT:
      "Riduce esposizione ai rialzi dei tassi ma può partire con costi iniziali superiori.",

    aiInsightEN:
      "It reduces exposure to rising rates but may start with higher initial costs.",

    warningIT:
      "⚠️ Rate iniziali elevate possono comprimere il cashflow.",

    warningEN:
      "⚠️ High initial payments may compress cashflow.",

    related: [
      "mortgageImpact",
      "interestRates"
    ]

  },

  // =============================================
  // 📈 VARIABLE RATE
  // =============================================

  variableRate: {

    priority: 8,

    category: "rate",

    scoreWeight: 1.3,

    keywords: [
      "tasso variabile",
      "variable rate",
      "euribor",
      "variable mortgage"
    ],

    aiTitleIT:
      "📈 Tasso Variabile",

    aiTitleEN:
      "📈 Variable Rate",

    aiSummaryIT:
      "Il tasso variabile può migliorare il cashflow iniziale ma aumenta volatilità e rischio.",

    aiSummaryEN:
      "Variable rates may improve initial cashflow but increase volatility and risk.",

    aiInsightIT:
      "Investimenti con margini bassi risultano più vulnerabili ai rialzi dei tassi.",

    aiInsightEN:
      "Low-margin investments become more vulnerable to rising rates.",

    warningIT:
      "⚠️ Rialzi dei tassi possono ridurre sostenibilità finanziaria.",

    warningEN:
      "⚠️ Rate increases may reduce financial sustainability.",

    related: [
      "interestRates",
      "mortgageImpact",
      "cashflow"
    ]

  },

  // =============================================
  // 📊 LTV
  // =============================================

  ltv: {

    priority: 9,

    category: "leverage",

    scoreWeight: 1.4,

    keywords: [
      "ltv",
      "loan to value",
      "percentuale mutuo",
      "loan ratio"
    ],

    aiTitleIT:
      "📊 Loan To Value",

    aiTitleEN:
      "📊 Loan To Value",

    aiSummaryIT:
      "LTV misura quanto dell’investimento è finanziato dalla banca.",

    aiSummaryEN:
      "LTV measures how much of the investment is financed by the bank.",

    aiInsightIT:
      "LTV elevati aumentano leverage, rischio operativo e vulnerabilità finanziaria.",

    aiInsightEN:
      "High LTV increases leverage, operational risk and financial vulnerability.",

    warningIT:
      "⚠️ LTV troppo elevati riducono il margine di sicurezza.",

    warningEN:
      "⚠️ Excessive LTV reduces safety margins.",

    benchmarks: {

      safe: 50,
      balanced: 70,
      aggressive: 85,
      extreme: 100

    },

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

    related: [
      "mortgageImpact",
      "riskScore",
      "fullMortgage"
    ]

  },

  // =============================================
  // 💳 PAYMENT
  // =============================================

  mortgagePayment: {

    priority: 8,

    category: "cashflow",

    scoreWeight: 1.3,

    keywords: [
      "rata",
      "mortgage payment",
      "monthly payment",
      "rata mutuo"
    ],

    aiTitleIT:
      "💳 Rata Mutuo",

    aiTitleEN:
      "💳 Mortgage Payment",

    aiSummaryIT:
      "La rata influenza direttamente cashflow e margine operativo.",

    aiSummaryEN:
      "Mortgage payments directly impact cashflow and operating margins.",

    aiInsightIT:
      "Rate elevate aumentano pressione finanziaria e rischio operativo.",

    aiInsightEN:
      "High payments increase financial pressure and operational risk.",

    warningIT:
      "⚠️ Rate aggressive possono compromettere sostenibilità.",

    warningEN:
      "⚠️ Aggressive payments may compromise sustainability.",

    related: [
      "cashflow",
      "dscr",
      "mortgageImpact"
    ]

  },

  // =============================================
  // 🚨 FULL MORTGAGE
  // =============================================

  fullMortgage: {

    priority: 10,

    category: "extremeRisk",

    scoreWeight: 1.7,

    keywords: [
      "mutuo 100%",
      "100 mortgage",
      "full financing",
      "finanziamento totale"
    ],

    aiTitleIT:
      "🚨 Mutuo 100%",

    aiTitleEN:
      "🚨 100% Mortgage",

    aiSummaryIT:
      "Un finanziamento totale aumenta drasticamente leverage e rischio operativo.",

    aiSummaryEN:
      "Full financing drastically increases leverage and operational risk.",

    aiInsightIT:
      "Cashflow, tassi e occupazione diventano estremamente sensibili ai cambiamenti di mercato.",

    aiInsightEN:
      "Cashflow, rates and occupancy become extremely sensitive to market changes.",

    warningIT:
      "⚠️ Elevata esposizione finanziaria.",

    warningEN:
      "⚠️ High financial exposure.",

    recommendationsIT: [
      "Mantieni liquidità elevata.",
      "Stress testa scenari negativi.",
      "Evita sovraesposizione."
    ],

    recommendationsEN: [
      "Maintain high liquidity.",
      "Stress-test negative scenarios.",
      "Avoid overexposure."
    ],

    related: [
      "ltv",
      "riskScore",
      "cashflow"
    ]

  },

  // =============================================
  // 📈 INTEREST RATES
  // =============================================

  interestRates: {

    priority: 7,

    category: "macro",

    scoreWeight: 1.2,

    keywords: [
      "interest rates",
      "tassi",
      "euribor",
      "rialzo tassi"
    ],

    aiTitleIT:
      "📈 Tassi di Interesse",

    aiTitleEN:
      "📈 Interest Rates",

    aiSummaryIT:
      "I tassi influenzano sostenibilità mutuo e cashflow.",

    aiSummaryEN:
      "Interest rates impact mortgage sustainability and cashflow.",

    aiInsightIT:
      "Leverage elevata aumenta sensibilità ai rialzi dei tassi.",

    aiInsightEN:
      "High leverage increases sensitivity to rate hikes.",

    warningIT:
      "⚠️ Rialzi tassi aumentano rischio operativo.",

    warningEN:
      "⚠️ Rising rates increase operational risk.",

    related: [
      "variableRate",
      "mortgageImpact",
      "riskScore"
    ]

  }

};

console.log(
  "🏦 MORTGAGE AI MODULE READY",
  window.rbKnowledgeBase.mortgages
);
