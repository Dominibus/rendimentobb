// ===============================================
// 🏦 MORTGAGE KNOWLEDGE
// ===============================================

Object.assign(window.rbKnowledgeBase, {

  // ===========================================
  // MORTGAGE IMPACT
  // ===========================================

  mortgageImpact: {

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

    answerIT:
      "Il mutuo può ridurre il cashflow mensile a causa della rata, ma può aumentare il ROI leveraged grazie alla leva finanziaria. Tuttavia una leva troppo aggressiva aumenta il rischio operativo e rende l’investimento più vulnerabile durante periodi di bassa occupazione.",

    answerEN:
      "A mortgage may reduce monthly cashflow because of loan payments, but it can increase leveraged ROI through financial leverage. However, excessive leverage increases operational risk and makes the investment more vulnerable during low occupancy periods.",

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

    keywords: [
      "tasso fisso",
      "fixed rate",
      "mutuo fisso",
      "rata fissa",
      "fixed mortgage"
    ],

    answerIT:
      "Il tasso fisso mantiene la rata costante nel tempo e protegge l’investimento da aumenti dei tassi di interesse. Offre maggiore stabilità finanziaria ma spesso parte da tassi iniziali leggermente più elevati.",

    answerEN:
      "A fixed-rate mortgage keeps payments stable over time and protects the investment from interest rate increases. It offers stronger financial stability but often starts with slightly higher rates.",

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

    keywords: [
      "tasso variabile",
      "variable rate",
      "mutuo variabile",
      "variable mortgage",
      "euribor"
    ],

    answerIT:
      "Il tasso variabile può offrire rate iniziali più basse ma aumenta il rischio finanziario in caso di rialzo dei tassi. Investimenti con cashflow debole sono più esposti a questo rischio.",

    answerEN:
      "A variable-rate mortgage may offer lower initial payments but increases financial risk if interest rates rise. Investments with weak cashflow are more exposed to this risk.",

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

    keywords: [
      "ltv",
      "loan to value",
      "percentuale mutuo",
      "leva mutuo",
      "loan ratio",
      "percentuale finanziata"
    ],

    answerIT:
      "LTV (Loan To Value) indica la percentuale dell’immobile finanziata dalla banca rispetto al valore totale dell’investimento. Un LTV elevato aumenta leva finanziaria e rischio operativo.",

    answerEN:
      "LTV (Loan To Value) indicates the percentage of the property financed by the bank compared to total investment value. A high LTV increases leverage and operational risk.",

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

    keywords: [
      "rata",
      "mortgage payment",
      "monthly payment",
      "rata mutuo",
      "rata sostenibile",
      "pagamento mutuo"
    ],

    answerIT:
      "La rata del mutuo impatta direttamente sul cashflow mensile e sulla sostenibilità dell’investimento immobiliare. Una rata troppo elevata può comprimere il margine operativo.",

    answerEN:
      "Mortgage payments directly impact monthly cashflow and overall investment sustainability. Excessive payments may compress operating margins.",

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

    keywords: [
      "mutuo 100%",
      "100 mortgage",
      "full financing",
      "finanziamento totale",
      "100 financing",
      "mutuo completo"
    ],

    answerIT:
      "Un mutuo al 100% aumenta la leva finanziaria ma può rendere l’investimento molto più rischioso a causa di rate elevate, margini ridotti e maggiore esposizione ai cambiamenti di mercato.",

    answerEN:
      "A 100% mortgage increases leverage but may make the investment significantly riskier because of high payments, reduced margins and greater exposure to market changes.",

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

    keywords: [
      "tassi",
      "interest rates",
      "tassi interesse",
      "interest rate",
      "rialzo tassi"
    ],

    answerIT:
      "L’aumento dei tassi di interesse può ridurre cashflow e sostenibilità del mutuo. Investimenti altamente levereggiati sono generalmente più vulnerabili ai rialzi dei tassi.",

    answerEN:
      "Rising interest rates may reduce cashflow and mortgage sustainability. Highly leveraged investments are generally more vulnerable to rate increases.",

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
