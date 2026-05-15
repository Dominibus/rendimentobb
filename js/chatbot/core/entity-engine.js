// ===============================================
// 🧠 RENDIMENTOBB AI — ENTITY EXTRACTION ENGINE 4.0
// Silicon Valley SaaS AI Parsing Layer
// Bilingual + Modular + Scale Ready
// ===============================================

window.rbExtractEntities = function(input = ""){

  // ===========================================
  // 🧹 NORMALIZATION
  // ===========================================

  const text = String(input)
    .toLowerCase()
    .trim();

  // ===========================================
  // 🚫 EMPTY SAFETY
  // ===========================================

  if(!text){

    return {

      city: null,

      price: null,
      amount: null,
      roi: null,
      nightly: null,
      monthlyCosts: null,
      yearlyCosts: null,
      downPayment: null,
      cashflow: null,

      mortgage: false,
      mortgagePercent: null,
      mortgageAmount: null,
      percentage: null,
      rate: null,
      years: null,

      occupancy: null,
      adr: null,
      revpar: null,

      risk: null,

      propertyType: null,
      strategy: null,

      currency: "EUR",

      intentHints: [],
      detectedTopics: [],

      rawText: text

    };

  }

  // ===========================================
  // 🧠 ENTITY OBJECT
  // ===========================================

  const entities = {

    // =======================================
    // 🌍 LOCATION
    // =======================================

    city: null,

    // =======================================
    // 💰 FINANCIAL
    // =======================================

    price: null,
    amount: null,

    roi: null,

    nightly: null,
    adr: null,

    monthlyCosts: null,
    yearlyCosts: null,

    downPayment: null,

    cashflow: null,

    // =======================================
    // 🏦 MORTGAGE
    // =======================================

    mortgage: false,

    mortgagePercent: null,
    mortgageAmount: null,

    percentage: null,

    rate: null,

    years: null,

    // =======================================
    // 🏨 PERFORMANCE
    // =======================================

    occupancy: null,

    revpar: null,

    risk: null,

    // =======================================
    // 🏠 PROPERTY
    // =======================================

    propertyType: null,

    strategy: null,

    // =======================================
    // 🌐 SYSTEM
    // =======================================

    currency: "EUR",

    intentHints: [],

    detectedTopics: [],

    rawText: text

  };

  // ===========================================
  // 🌍 CITY DETECTION
  // ===========================================

  const cities = {

    ...(window.rbKnowledgeBase?.cities || {}),

    ...(window.rbMarketData || {})

  };

  for(const cityKey in cities){

    const city = cities[cityKey] || {};

    const aliases = [

      cityKey,

      ...(city.aliases || [])

    ];

    const matched = aliases.some(alias =>

      text.includes(
        String(alias).toLowerCase()
      )

    );

    if(matched){

      entities.city = cityKey;

      entities.detectedTopics.push(
        "market"
      );

      break;

    }

  }

  // ===========================================
  // 💰 PROPERTY PRICE / AMOUNT
  // ===========================================

  const pricePatterns = [

    /(\d+(?:[\.,]\d+)?)\s?k\b/,
    /(\d+(?:[\.,]\d+)?)\s?mila\b/,
    /€\s?(\d+(?:[\.,]\d+)?)/,
    /(\d+(?:[\.,]\d+)?)\s?euro/,
    /prezzo\s?(\d+(?:[\.,]\d+)?)/,
    /budget\s?(\d+(?:[\.,]\d+)?)/

  ];

  for(const pattern of pricePatterns){

    const match = text.match(pattern);

    if(match){

      let value = Number(

        match[1]
          .replace(",", ".")

      );

      if(
        text.includes("k") ||
        text.includes("mila")
      ){

        value *= 1000;

      }

      value = Math.round(value);

      entities.price = value;

      entities.amount = value;

      entities.detectedTopics.push(
        "investment"
      );

      break;

    }

  }

  // ===========================================
  // 📈 ROI DETECTION
  // ===========================================

  const roiPatterns = [

    /roi\s?(\d+(?:[\.,]\d+)?)%?/,
    /rendimento\s?(\d+(?:[\.,]\d+)?)%?/,
    /return\s?(\d+(?:[\.,]\d+)?)%?/

  ];

  for(const pattern of roiPatterns){

    const match = text.match(pattern);

    if(match){

      entities.roi = Number(

        match[1]
          .replace(",", ".")

      );

      entities.intentHints.push(
        "roi"
      );

      entities.detectedTopics.push(
        "finance"
      );

      break;

    }

  }

  // ===========================================
  // 🏨 OCCUPANCY
  // ===========================================

  const occupancyPatterns = [

    /occupazione\s?(\d+)/,
    /occupancy\s?(\d+)/,
    /occupato\s?al\s?(\d+)/,
    /booking\s?(\d+)/,
    /riempimento\s?(\d+)/

  ];

  for(const pattern of occupancyPatterns){

    const match = text.match(pattern);

    if(match){

      entities.occupancy =
        Number(match[1]);

      entities.detectedTopics.push(
        "performance"
      );

      break;

    }

  }

  // ===========================================
  // 💸 NIGHTLY / ADR
  // ===========================================

  const nightlyPatterns = [

    /(?:notte|night|adr)\s?(\d+)/,
    /prezzo\s?notte\s?(\d+)/,
    /daily\s?rate\s?(\d+)/

  ];

  for(const pattern of nightlyPatterns){

    const match = text.match(pattern);

    if(match){

      const value =
        Number(match[1]);

      entities.nightly = value;

      entities.adr = value;

      break;

    }

  }

  // ===========================================
  // 💸 MONTHLY COSTS
  // ===========================================

  const costsPatterns = [

    /(?:costi|spese)\s?(\d+)/,
    /monthly\s?costs\s?(\d+)/,
    /costi\s?mensili\s?(\d+)/

  ];

  for(const pattern of costsPatterns){

    const match = text.match(pattern);

    if(match){

      entities.monthlyCosts =
        Number(match[1]);

      break;

    }

  }

  // ===========================================
  // 🏦 MORTGAGE DETECTION
  // ===========================================

  const mortgageWords = [

    "mutuo",
    "mortgage",
    "loan",
    "finanziamento",
    "ltv",
    "leva"

  ];

  entities.mortgage =
    mortgageWords.some(word =>
      text.includes(word)
    );

  // ===========================================
  // 🏦 MORTGAGE %
  // ===========================================

  const mortgagePatterns = [

    /mutuo\s?(\d+)%/,
    /mortgage\s?(\d+)%/,
    /ltv\s?(\d+)%/,
    /(\d+)%\s?mutuo/,
    /loan\s?(\d+)%/

  ];

  for(const pattern of mortgagePatterns){

    const match = text.match(pattern);

    if(match){

      const value =
        Number(match[1]);

      entities.mortgagePercent =
        value;

      entities.percentage =
        value;

      break;

    }

  }

  // ===========================================
  // 📉 INTEREST RATE
  // ===========================================

  const ratePatterns = [

    /tasso\s?(\d+(?:[\.,]\d+)?)/,
    /rate\s?(\d+(?:[\.,]\d+)?)/,
    /interest\s?(\d+(?:[\.,]\d+)?)/

  ];

  for(const pattern of ratePatterns){

    const match = text.match(pattern);

    if(match){

      entities.rate = Number(

        match[1]
          .replace(",", ".")

      );

      break;

    }

  }

  // ===========================================
  // ⏳ YEARS
  // ===========================================

  const yearsPatterns = [

    /(\d+)\s?anni/,
    /(\d+)\s?years/

  ];

  for(const pattern of yearsPatterns){

    const match = text.match(pattern);

    if(match){

      entities.years =
        Number(match[1]);

      break;

    }

  }

  // ===========================================
  // 🏠 PROPERTY TYPE
  // ===========================================

  const propertyMap = {

    villa: [
      "villa"
    ],

    attico: [
      "attico",
      "penthouse"
    ],

    bnb: [
      "b&b",
      "bnb",
      "bed and breakfast"
    ],

    appartamento: [
      "appartamento",
      "apartment"
    ],

    hotel: [
      "hotel",
      "albergo"
    ]

  };

  for(const type in propertyMap){

    const found = propertyMap[type]
      .some(word =>
        text.includes(word)
      );

    if(found){

      entities.propertyType = type;

      break;

    }

  }

  // ===========================================
  // 🧠 STRATEGY DETECTION
  // ===========================================

  const strategyMap = {

    luxury: [
      "luxury",
      "lusso"
    ],

    business: [
      "business",
      "corporate"
    ],

    tourism: [
      "turismo",
      "tourism"
    ],

    lowcost: [
      "economico",
      "budget"
    ]

  };

  for(const strategy in strategyMap){

    const found = strategyMap[strategy]
      .some(word =>
        text.includes(word)
      );

    if(found){

      entities.strategy = strategy;

      break;

    }

  }

  // ===========================================
  // ⚠️ RISK DETECTION
  // ===========================================

  if(
    text.includes("alto rischio") ||
    text.includes("high risk")
  ){

    entities.risk = "high";

  }

  else if(
    text.includes("basso rischio") ||
    text.includes("low risk")
  ){

    entities.risk = "low";

  }

  else if(
    text.includes("medium risk") ||
    text.includes("rischio medio")
  ){

    entities.risk = "medium";

  }

  // ===========================================
  // 🧠 INTENT HINTS
  // ===========================================

  const intentMap = {

    strategy: [
      "conviene",
      "worth",
      "investire"
    ],

    risk: [
      "rischio",
      "risk"
    ],

    roi: [
      "roi",
      "rendimento"
    ],

    cashflow: [
      "cashflow",
      "cash flow"
    ],

    mortgage: [
      "mutuo",
      "mortgage"
    ],

    market: [
      "mercato",
      "market"
    ]

  };

  for(const intent in intentMap){

    const found = intentMap[intent]
      .some(word =>
        text.includes(word)
      );

    if(found){

      entities.intentHints.push(
        intent
      );

    }

  }

  // ===========================================
  // 🧠 CLEAN DUPLICATES
  // ===========================================

  entities.intentHints = [
    ...new Set(
      entities.intentHints
    )
  ];

  entities.detectedTopics = [
    ...new Set(
      entities.detectedTopics
    )
  ];

  // ===========================================
  // 🧠 CLEAN UNDEFINED
  // ===========================================

  Object.keys(entities).forEach(key=>{

    if(
      entities[key] === undefined
    ){

      entities[key] = null;

    }

  });

  // ===========================================
  // 🧠 DEBUG
  // ===========================================

  console.log(
    "🧠 ENTITY ENGINE 4.0:",
    entities
  );

  return entities;

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 ENTITY ENGINE 4.0 READY"
);
