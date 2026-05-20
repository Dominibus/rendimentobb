// ===============================================
// 💰 RENDIMENTOBB – FINANCE AI KNOWLEDGE
// ===============================================

window.rbKnowledgeBase =
  window.rbKnowledgeBase || {};

// ===============================================
// 💰 FINANCE MODULE
// ===============================================

window.rbKnowledgeBase.finance = {

  module: "finance",

  version: "2.0",

  aiRoleIT:
    "Esperto AI di finanza immobiliare e redditività short-rent",

  aiRoleEN:
    "AI expert in real estate finance and short-rent profitability",

  descriptionIT:
    "Modulo AI dedicato a ROI, cashflow, sostenibilità finanziaria, break-even, margini operativi e rischio economico.",

  descriptionEN:
    "AI module focused on ROI, cashflow, financial sustainability, break-even, operating margins and economic risk.",

  // =============================================
  // 📈 ROI
  // =============================================

  roi: {

  priority: 10,

  category: "profitability",

  scoreWeight: 1.6,

  semanticWeight: 1.8,

  decisionWeight: 1.7,

  riskWeight: 1.3,

  executiveWeight: 1.9,

  importance: "core",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: true,

    compareRequired: true,

    sustainabilityCheck: true,

    benchmarkRequired: true

  },

  responseStyle: {

    tone: "executive",

    useWarnings: true,

    useBenchmarks: true,

    concise: false

  },

    keywords: [
      "roi",
      "return on investment",
      "rendimento",
      "investment return",
      "yield",
      "redditività",
      "quanto rende",
      "profitto percentuale"
    ],

    aiTitleIT:
      "📈 ROI – Return On Investment",

    aiTitleEN:
      "📈 ROI – Return On Investment",

    aiSummaryIT:
      "Il ROI misura la redditività percentuale dell’investimento rispetto al capitale investito.",

    aiSummaryEN:
      "ROI measures the percentage profitability generated compared to invested capital.",

    aiInsightIT:
      "Nel settore B&B e Airbnb un ROI elevato può sembrare molto interessante, ma deve sempre essere analizzato insieme a cashflow, rischio operativo, occupazione reale e sostenibilità del mutuo.",

    aiInsightEN:
      "In the B&B and Airbnb sector, a high ROI may appear attractive, but it should always be analyzed together with cashflow, operational risk, occupancy and mortgage sustainability.",

    warningIT:
      "⚠️ ROI elevato non significa automaticamente investimento sicuro.",

    warningEN:
      "⚠️ High ROI does not automatically mean a safe investment.",

    benchmarks: {

      weak: "0-4%",
      average: "5-7%",
      strong: "8-12%",
      aggressive: "13%+"

    },

    recommendationsIT: [
      "Analizza cashflow reale.",
      "Verifica rischio operativo.",
      "Controlla sostenibilità finanziaria."
    ],

    recommendationsEN: [
      "Analyze real cashflow.",
      "Verify operational risk.",
      "Check financial sustainability."
    ],

    related: [
      "cashflow",
      "riskScore",
      "mortgageImpact",
      "breakEven"
    ]

  },

  // =============================================
  // 💸 CASHFLOW
  // =============================================

  cashflow: {

  priority: 10,

  category: "liquidity",

  scoreWeight: 1.7,

  semanticWeight: 2.0,

  decisionWeight: 2.0,

  riskWeight: 1.8,

  executiveWeight: 2.0,

  importance: "core",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: true,

    compareRequired: true,

    sustainabilityCheck: true,

    benchmarkRequired: false

  },

  responseStyle: {

    tone: "executive",

    useWarnings: true,

    useBenchmarks: false,

    concise: false

  },

  keywords: [
      "cashflow",
      "cash flow",
      "flusso di cassa",
      "profitto mensile",
      "utile netto",
      "liquidità",
      "monthly profit"
    ],

    aiTitleIT:
      "💸 Cashflow Immobiliare",

    aiTitleEN:
      "💸 Real Estate Cashflow",

    aiSummaryIT:
      "Il cashflow rappresenta il profitto reale generato ogni mese dopo tutte le spese operative.",

    aiSummaryEN:
      "Cashflow represents the real monthly profit generated after all operational expenses.",

    aiInsightIT:
      "Molti investimenti mostrano ROI elevati ma cashflow debole a causa di mutuo, cleaning, OTA fees, tasse e costi nascosti.",

    aiInsightEN:
      "Many investments show high ROI but weak cashflow due to mortgages, cleaning, OTA fees, taxes and hidden costs.",

    warningIT:
      "⚠️ Cashflow negativo aumenta il rischio operativo.",

    warningEN:
      "⚠️ Negative cashflow increases operational risk.",

    benchmarks: {

      negative: "< 0€",
      weak: "0€ - 500€",
      stable: "500€ - 1500€",
      strong: "1500€+"

    },

    recommendationsIT: [
      "Riduci costi operativi.",
      "Ottimizza occupazione.",
      "Controlla il peso della rata mutuo."
    ],

    recommendationsEN: [
      "Reduce operating costs.",
      "Optimize occupancy.",
      "Monitor mortgage pressure."
    ],

    related: [
      "roi",
      "mortgageImpact",
      "hiddenCosts",
      "operatingMargin"
    ]

  },

  // =============================================
  // ⚖️ BREAK EVEN
  // =============================================

  breakEven: {

  priority: 8,

  category: "recovery",

  scoreWeight: 1.2,

  semanticWeight: 1.4,

  decisionWeight: 1.6,

  riskWeight: 1.5,

  executiveWeight: 1.5,

  importance: "secondary",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: true,

    compareRequired: false,

    sustainabilityCheck: true,

    benchmarkRequired: false

  },

  responseStyle: {

    tone: "analytical",

    useWarnings: true,

    useBenchmarks: false,

    concise: false

  },

  keywords: [
      "break even",
      "pareggio",
      "punto di pareggio",
      "rientro investimento",
      "tempo recupero"
    ],

    aiTitleIT:
      "⚖️ Break-Even",

    aiTitleEN:
      "⚖️ Break-Even",

    aiSummaryIT:
      "Il break-even misura quanto tempo serve per recuperare il capitale investito.",

    aiSummaryEN:
      "Break-even measures how long it takes to recover invested capital.",

    aiInsightIT:
      "Break-even troppo lenti aumentano esposizione finanziaria e vulnerabilità operativa.",

    aiInsightEN:
      "Slow break-even periods increase financial exposure and operational vulnerability.",

    warningIT:
      "⚠️ Tempi lunghi riducono la resilienza dell’investimento.",

    warningEN:
      "⚠️ Long recovery periods reduce investment resilience.",

    recommendationsIT: [
      "Ottimizza pricing.",
      "Riduci costi.",
      "Aumenta occupazione reale."
    ],

    recommendationsEN: [
      "Optimize pricing.",
      "Reduce costs.",
      "Increase real occupancy."
    ],

    related: [
      "roi",
      "cashflow",
      "riskScore"
    ]

  },

  // =============================================
  // 🏦 DSCR
  // =============================================

  dscr: {

  priority: 9,

  category: "mortgage",

  scoreWeight: 1.5,

  semanticWeight: 1.5,

  decisionWeight: 1.8,

  riskWeight: 2.0,

  executiveWeight: 1.7,

  importance: "core",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: true,

    compareRequired: false,

    sustainabilityCheck: true,

    benchmarkRequired: false

  },

  responseStyle: {

    tone: "executive",

    useWarnings: true,

    useBenchmarks: false,

    concise: false

  },

  keywords: [
      "dscr",
      "debt service coverage ratio",
      "copertura debito",
      "sostenibilità mutuo",
      "copertura rata"
    ],

    aiTitleIT:
      "🏦 DSCR – Copertura Mutuo",

    aiTitleEN:
      "🏦 DSCR – Mortgage Coverage",

    aiSummaryIT:
      "Il DSCR misura la capacità dell’investimento di sostenere la rata del mutuo tramite il cashflow generato.",

    aiSummaryEN:
      "DSCR measures the ability of the investment to sustain mortgage payments through generated cashflow.",

    aiInsightIT:
      "Le banche utilizzano il DSCR per valutare rischio e sostenibilità finanziaria dell’operazione.",

    aiInsightEN:
      "Banks use DSCR to evaluate financial sustainability and operational risk.",

    warningIT:
      "⚠️ DSCR basso aumenta pressione finanziaria e rischio default.",

    warningEN:
      "⚠️ Low DSCR increases financial pressure and default risk.",

    benchmarks: {

      dangerous: "< 1",
      weak: "1 - 1.2",
      stable: "1.2 - 1.5",
      strong: "1.5+"

    },

    recommendationsIT: [
      "Mantieni cashflow stabile.",
      "Evita rate aggressive.",
      "Riduci leverage eccessivo."
    ],

    recommendationsEN: [
      "Maintain stable cashflow.",
      "Avoid aggressive payments.",
      "Reduce excessive leverage."
    ],

    related: [
      "mortgageImpact",
      "cashflow",
      "ltv",
      "riskScore"
    ]

  },

  // =============================================
  // 📊 OPERATING MARGIN
  // =============================================

  operatingMargin: {

  priority: 7,

  category: "efficiency",

  scoreWeight: 1.2,

  semanticWeight: 1.4,

  decisionWeight: 1.5,

  riskWeight: 1.6,

  executiveWeight: 1.4,

  importance: "secondary",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: true,

    compareRequired: false,

    sustainabilityCheck: true,

    benchmarkRequired: false

  },

  responseStyle: {

    tone: "analytical",

    useWarnings: true,

    useBenchmarks: false,

    concise: true

  },

  keywords: [
      "operating margin",
      "margine operativo",
      "profit margin",
      "margine profitto"
    ],

    aiTitleIT:
      "📊 Margine Operativo",

    aiTitleEN:
      "📊 Operating Margin",

    aiSummaryIT:
      "Il margine operativo rappresenta il profitto disponibile dopo i costi operativi.",

    aiSummaryEN:
      "Operating margin represents remaining profit after operational expenses.",

    aiInsightIT:
      "Margini troppo bassi rendono l’investimento vulnerabile a cali occupazione, aumento costi e stagionalità.",

    aiInsightEN:
      "Low margins make investments vulnerable to occupancy drops, rising costs and seasonality.",

    warningIT:
      "⚠️ Margini ridotti aumentano il rischio operativo.",

    warningEN:
      "⚠️ Thin margins increase operational risk.",

    recommendationsIT: [
      "Ottimizza pricing.",
      "Riduci cleaning e utenze.",
      "Automatizza processi operativi."
    ],

    recommendationsEN: [
      "Optimize pricing.",
      "Reduce cleaning and utilities.",
      "Automate operations."
    ],

    related: [
      "cashflow",
      "roi",
      "hiddenCosts"
    ]

  },

  // =============================================
  // 🧾 HIDDEN COSTS
  // =============================================

  hiddenCosts: {

  priority: 8,

  category: "expenses",

  scoreWeight: 1.3,

  semanticWeight: 1.4,

  decisionWeight: 1.7,

  riskWeight: 1.8,

  executiveWeight: 1.5,

  importance: "secondary",

  aiBehavior: {

    investorFocus: true,

    riskAnalysis: true,

    compareRequired: false,

    sustainabilityCheck: true,

    benchmarkRequired: false

  },

  responseStyle: {

    tone: "warning",

    useWarnings: true,

    useBenchmarks: false,

    concise: false

  },

  keywords: [
      "costi nascosti",
      "hidden costs",
      "spese impreviste",
      "unexpected expenses",
      "extra costs"
    ],

    aiTitleIT:
      "🧾 Costi Nascosti",

    aiTitleEN:
      "🧾 Hidden Costs",

    aiSummaryIT:
      "I costi nascosti possono ridurre drasticamente il profitto reale dell’investimento.",

    aiSummaryEN:
      "Hidden costs may drastically reduce real investment profitability.",

    aiInsightIT:
      "Cleaning, manutenzione, OTA fees, tasse e vuoti operativi spesso vengono sottovalutati nelle simulazioni.",

    aiInsightEN:
      "Cleaning, maintenance, OTA fees, taxes and vacancy periods are often underestimated in projections.",

    warningIT:
      "⚠️ Costi non previsti possono trasformare ROI positivi in cashflow negativi.",

    warningEN:
      "⚠️ Unexpected costs may turn positive ROI into negative cashflow.",

    recommendationsIT: [
      "Mantieni margini di sicurezza.",
      "Prevedi riserve liquide.",
      "Analizza costi operativi reali."
    ],

    recommendationsEN: [
      "Maintain safety margins.",
      "Keep liquidity reserves.",
      "Analyze real operating expenses."
    ],

    related: [
      "cashflow",
      "operatingMargin",
      "riskScore"
    ]

  }

};

console.log(
  "💰 FINANCE AI MODULE READY",
  window.rbKnowledgeBase.finance
);
