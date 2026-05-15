// ===============================================
// ⚠️ RENDIMENTOBB – RISK AI KNOWLEDGE
// ===============================================

window.rbKnowledgeBase =
  window.rbKnowledgeBase || {};

// ===============================================
// ⚠️ RISK MODULE
// ===============================================

window.rbKnowledgeBase.risk = {

  module: "risk",

  version: "2.0",

  aiRoleIT:
    "Esperto AI di rischio immobiliare e sostenibilità short-rent",

  aiRoleEN:
    "AI expert in real estate risk and short-rent sustainability",

  descriptionIT:
    "Modulo AI dedicato ad analisi rischio, volatilità, leva finanziaria, stagionalità, saturazione e sostenibilità operativa.",

  descriptionEN:
    "AI module focused on investment risk, volatility, leverage, seasonality, saturation and operational sustainability.",

  // =============================================
  // ⚠️ RISK SCORE
  // =============================================

  riskScore: {

    priority: 10,

    category: "core-risk",

    scoreWeight: 1.8,

    keywords: [
      "rischio",
      "risk",
      "risk score",
      "investment risk",
      "rischio investimento",
      "rischio airbnb",
      "investimento rischioso",
      "investment sustainability",
      "stabilità investimento"
    ],

    aiTitleIT:
      "⚠️ Risk Score – Sostenibilità Investimento",

    aiTitleEN:
      "⚠️ Risk Score – Investment Sustainability",

    aiSummaryIT:
      "Il Risk Score misura la stabilità operativa e finanziaria dell’investimento immobiliare.",

    aiSummaryEN:
      "Risk Score measures the operational and financial stability of the investment.",

    aiInsightIT:
      "Il motore AI analizza cashflow, leva finanziaria, occupazione, costi operativi, volatilità mercato, saturazione e domanda turistica.",

    aiInsightEN:
      "The AI engine analyzes cashflow, leverage, occupancy, operating costs, market volatility, saturation and tourism demand.",

    warningIT:
      "⚠️ ROI elevato senza stabilità operativa può diventare molto rischioso.",

    warningEN:
      "⚠️ High ROI without operational stability may become highly risky.",

    benchmarks: {

      low: "0-35",
      moderate: "36-65",
      high: "66-100"

    },

    recommendationsIT: [
      "Analizza cashflow reale.",
      "Confronta benchmark mercato.",
      "Riduci esposizione finanziaria."
    ],

    recommendationsEN: [
      "Analyze real cashflow.",
      "Compare market benchmarks.",
      "Reduce financial exposure."
    ],

    related: [
      "cashflow",
      "mortgageImpact",
      "seasonality",
      "marketSaturation"
    ]

  },

  // =============================================
  // 🌦️ SEASONALITY
  // =============================================

  seasonality: {

    priority: 9,

    category: "market-risk",

    scoreWeight: 1.3,

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
      "La stagionalità influenza direttamente occupazione, cashflow e stabilità operativa.",

    aiSummaryEN:
      "Seasonality directly impacts occupancy, cashflow and operational stability.",

    aiInsightIT:
      "Mercati troppo stagionali possono creare forti oscillazioni di redditività durante l’anno.",

    aiInsightEN:
      "Highly seasonal markets may generate strong profitability fluctuations throughout the year.",

    warningIT:
      "⚠️ Periodi di bassa stagione possono comprimere il cashflow reale.",

    warningEN:
      "⚠️ Low-season periods may compress real cashflow.",

    recommendationsIT: [
      "Analizza dati annuali completi.",
      "Diversifica la domanda turistica.",
      "Utilizza pricing dinamico stagionale."
    ],

    recommendationsEN: [
      "Analyze full-year data.",
      "Diversify tourism demand.",
      "Use dynamic seasonal pricing."
    ],

    related: [
      "occupancy",
      "cashflow",
      "marketDemand"
    ]

  },

  // =============================================
  // 📉 MARKET VOLATILITY
  // =============================================

  marketVolatility: {

    priority: 8,

    category: "market-risk",

    scoreWeight: 1.2,

    keywords: [
      "volatilità",
      "market volatility",
      "mercato instabile",
      "mercato volatile",
      "instabilità mercato",
      "market instability"
    ],

    aiTitleIT:
      "📉 Volatilità Mercato",

    aiTitleEN:
      "📉 Market Volatility",

    aiSummaryIT:
      "Mercati instabili possono alterare rapidamente domanda, occupazione e redditività.",

    aiSummaryEN:
      "Unstable markets may rapidly impact demand, occupancy and profitability.",

    aiInsightIT:
      "Elevata volatilità aumenta l’incertezza operativa e rende il cashflow meno prevedibile.",

    aiInsightEN:
      "High volatility increases operational uncertainty and makes cashflow less predictable.",

    warningIT:
      "⚠️ Volatilità elevata aumenta il rischio investimento.",

    warningEN:
      "⚠️ High volatility increases investment risk.",

    recommendationsIT: [
      "Mantieni margini operativi forti.",
      "Riduci leverage aggressivo.",
      "Analizza trend pluriennali."
    ],

    recommendationsEN: [
      "Maintain strong operating margins.",
      "Reduce aggressive leverage.",
      "Analyze multi-year trends."
    ],

    related: [
      "riskScore",
      "seasonality",
      "marketDemand"
    ]

  },

  // =============================================
  // 🏦 OVER LEVERAGE
  // =============================================

  overLeverage: {

    priority: 10,

    category: "financial-risk",

    scoreWeight: 1.7,

    keywords: [
      "leva eccessiva",
      "over leverage",
      "troppo debito",
      "high leverage",
      "mutuo troppo alto",
      "leva finanziaria alta",
      "too much debt"
    ],

    aiTitleIT:
      "🏦 Leverage Aggressivo",

    aiTitleEN:
      "🏦 Aggressive Leverage",

    aiSummaryIT:
      "Una leva finanziaria troppo elevata aumenta sensibilmente il rischio operativo.",

    aiSummaryEN:
      "Excessive leverage significantly increases operational risk.",

    aiInsightIT:
      "Mutui elevati riducono il margine di sicurezza e rendono l’investimento più vulnerabile a cali occupazione o aumento costi.",

    aiInsightEN:
      "High mortgages reduce the safety margin and make investments more vulnerable to occupancy drops or rising costs.",

    warningIT:
      "⚠️ ROI leveraged elevato può nascondere fragilità finanziarie.",

    warningEN:
      "⚠️ High leveraged ROI may hide financial fragility.",

    recommendationsIT: [
      "Mantieni riserve liquide.",
      "Controlla DSCR.",
      "Evita LTV troppo elevati."
    ],

    recommendationsEN: [
      "Maintain liquidity reserves.",
      "Monitor DSCR.",
      "Avoid excessive LTV levels."
    ],

    related: [
      "mortgageImpact",
      "cashflow",
      "ltv",
      "dscr"
    ]

  },

  // =============================================
  // 🏨 MARKET SATURATION
  // =============================================

  marketSaturation: {

    priority: 8,

    category: "competition-risk",

    scoreWeight: 1.2,

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
      "Mercati troppo saturi possono comprimere occupazione, ADR e margini operativi.",

    aiSummaryEN:
      "Oversaturated markets may compress occupancy, ADR and operating margins.",

    aiInsightIT:
      "Competizione elevata aumenta la pressione su pricing e redditività.",

    aiInsightEN:
      "High competition increases pressure on pricing and profitability.",

    warningIT:
      "⚠️ Saturazione elevata aumenta il rischio operativo nel lungo periodo.",

    warningEN:
      "⚠️ High saturation increases long-term operational risk.",

    recommendationsIT: [
      "Differenzia il listing.",
      "Analizza nicchie di mercato.",
      "Ottimizza branding e recensioni."
    ],

    recommendationsEN: [
      "Differentiate the listing.",
      "Analyze niche markets.",
      "Optimize branding and reviews."
    ],

    related: [
      "marketDemand",
      "occupancy",
      "averageNightPrice"
    ]

  },

  // =============================================
  // 📜 REGULATORY RISK
  // =============================================

  regulationsRisk: {

    priority: 7,

    category: "legal-risk",

    scoreWeight: 1.1,

    keywords: [
      "regolamentazioni",
      "regulations",
      "normative airbnb",
      "licenze",
      "vincoli short rent",
      "leggi airbnb",
      "licenza b&b"
    ],

    aiTitleIT:
      "📜 Rischio Normativo",

    aiTitleEN:
      "📜 Regulatory Risk",

    aiSummaryIT:
      "Normative locali e restrizioni possono influenzare la redditività degli affitti brevi.",

    aiSummaryEN:
      "Local regulations and restrictions may affect short-rent profitability.",

    aiInsightIT:
      "Nuove leggi, licenze o limiti operativi possono modificare rapidamente domanda e sostenibilità finanziaria.",

    aiInsightEN:
      "New laws, licenses or operational restrictions may rapidly impact demand and financial sustainability.",

    warningIT:
      "⚠️ Cambi normativi possono aumentare rapidamente il rischio investimento.",

    warningEN:
      "⚠️ Regulatory changes may rapidly increase investment risk.",

    recommendationsIT: [
      "Controlla normative locali.",
      "Verifica licenze richieste.",
      "Monitora aggiornamenti legislativi."
    ],

    recommendationsEN: [
      "Check local regulations.",
      "Verify licensing requirements.",
      "Monitor legal updates."
    ],

    related: [
      "riskScore",
      "marketVolatility",
      "marketDemand"
    ]

  },

  // =============================================
  // 💸 COST PRESSURE
  // =============================================

  costPressure: {

    priority: 8,

    category: "operational-risk",

    scoreWeight: 1.4,

    keywords: [
      "costi elevati",
      "high costs",
      "pressione costi",
      "operating costs",
      "spese alte",
      "utilities cost"
    ],

    aiTitleIT:
      "💸 Pressione Costi Operativi",

    aiTitleEN:
      "💸 Operating Cost Pressure",

    aiSummaryIT:
      "Costi operativi troppo elevati possono comprimere rapidamente il cashflow.",

    aiSummaryEN:
      "High operating costs may rapidly compress cashflow.",

    aiInsightIT:
      "Cleaning, utenze, manutenzione e OTA fees incidono fortemente sulla sostenibilità dell’investimento.",

    aiInsightEN:
      "Cleaning, utilities, maintenance and OTA fees strongly affect investment sustainability.",

    warningIT:
      "⚠️ Costi fuori controllo aumentano il rischio operativo.",

    warningEN:
      "⚠️ Uncontrolled costs increase operational risk.",

    recommendationsIT: [
      "Automatizza la gestione.",
      "Riduci costi fissi.",
      "Ottimizza processi operativi."
    ],

    recommendationsEN: [
      "Automate management.",
      "Reduce fixed costs.",
      "Optimize operational processes."
    ],

    related: [
      "cashflow",
      "operatingMargin",
      "hiddenCosts"
    ]

  }

};

console.log(
  "⚠️ RISK AI MODULE READY",
  window.rbKnowledgeBase.risk
);
