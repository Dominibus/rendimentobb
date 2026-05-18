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
// 🏨 OCCUPANCY DETECTION
// ===========================================

const occupancyPatterns = [

  /occupazione\s?(?:del|di|al)?\s?(\d+)(?:\%)?/,

  /occupancy\s?(?:of)?\s?(\d+)(?:\%)?/,

  /occupato\s?(?:al)?\s?(\d+)(?:\%)?/,

  /booking\s?(\d+)(?:\%)?/,

  /riempimento\s?(\d+)(?:\%)?/,

  /(\d+)(?:\%)?\s?occupazione/,

  /(\d+)(?:\%)?\s?occupancy/

];

for(const pattern of occupancyPatterns){

  const match = text.match(pattern);

  if(match){

    const value =
      Number(match[1]);

    if(
      value >= 1 &&
      value <= 100
    ){

      entities.occupancy =
        value;

      entities.detectedTopics.push(
        "performance"
      );

      break;

    }

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
// 📚 KNOWLEDGE DETECTION
// ===========================================

entities.knowledge = null;

const knowledgeBase =
  window.rbKnowledgeBase || {};

const normalizedText =

  String(text || "")
    .toLowerCase()
    .trim();

for(const key in knowledgeBase){

  const item =
    knowledgeBase[key];

  if(
    !item ||
    !Array.isArray(item.keywords)
  ){

    continue;

  }

  const matched =

    item.keywords.some(keyword =>

      normalizedText.includes(

        String(keyword)
          .toLowerCase()
          .trim()

      )

    );

  if(matched){

    entities.knowledge = key;

    entities.knowledgeData = item;

    entities.detectedTopics.push(
      "education"
    );

    console.log(
      "📚 KNOWLEDGE MATCH:",
      key
    );

    break;

  }

}

  // ===========================================
// 📊 LIVE SIMULATOR KPI EXTRACTION
// ===========================================

try{

  // ROI
  if(entities.roi === null){

    const roiEl =

      document.querySelector(
        "#profitabilityScore, .roi-value, [data-kpi='roi']"
      );

    if(roiEl){

      const roiValue = parseFloat(

        roiEl.textContent
          .replace(/[^\d.,-]/g,"")
          .replace(",", ".")

      );

      if(!isNaN(roiValue)){

        entities.roi = roiValue;

      }

    }

  }

  // OCCUPANCY
  if(entities.occupancy === null){

    const occEl =

      document.querySelector(
        "#occupancyRate, .occupancy-value, [data-kpi='occupancy']"
      );

    if(occEl){

      const occValue = parseFloat(

        occEl.textContent
          .replace(/[^\d.,-]/g,"")
          .replace(",", ".")

      );

      if(!isNaN(occValue)){

        entities.occupancy = occValue;

      }

    }

  }

  // RISK
  if(entities.risk === null){

    const riskEl =

      document.querySelector(
        "#riskScore, .risk-value, [data-kpi='risk']"
      );

    if(riskEl){

      const riskValue = parseFloat(

        riskEl.textContent
          .replace(/[^\d.,-]/g,"")
          .replace(",", ".")

      );

      if(!isNaN(riskValue)){

        entities.risk = riskValue;

      }

    }

  }

  // NIGHTLY RATE
  if(entities.nightly === null){

    const nightlyEl =

      document.querySelector(
        "#nightlyRate, .nightly-value, [data-kpi='nightly']"
      );

    if(nightlyEl){

      const nightlyValue = parseFloat(

        nightlyEl.textContent
          .replace(/[^\d.,-]/g,"")
          .replace(",", ".")

      );

      if(!isNaN(nightlyValue)){

        entities.nightly = nightlyValue;

        entities.adr = nightlyValue;

      }

    }

  }

}catch(err){

  console.warn(
    "⚠️ KPI extraction failed:",
    err
  );

}

  // ===========================================
// 📊 LIVE ANALYSIS DATA
// ===========================================

if(window.lastAnalysisData){

  const liveData =

    window.lastAnalysisData;

  if(
    entities.roi === null &&
    liveData.roi
  ){

    entities.roi =
      Number(liveData.roi);

  }

  if(
    entities.occupancy === null &&
    liveData.occupancy
  ){

    entities.occupancy =
      Number(liveData.occupancy);

  }

  if(
    entities.risk === null &&
    liveData.risk
  ){

    entities.risk =
      Number(liveData.risk);

  }

  if(
    entities.nightly === null &&
    liveData.nightly
  ){

    entities.nightly =
      Number(liveData.nightly);

    entities.adr =
      Number(liveData.nightly);

  }

  if(
    entities.city === null &&
    liveData.city
  ){

    entities.city =
      String(liveData.city);

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
