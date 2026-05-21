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

    locationType: null,

    // =======================================
    // 💰 FINANCIAL
    // =======================================

    price: null,

    amount: null,

    budget: null,

    roi: null,

    targetROI: null,

    nightly: null,

    adr: null,

    monthlyCosts: null,

    yearlyCosts: null,

    downPayment: null,

    cashflow: null,

    investmentGoal: null,

    // =======================================
    // 🏦 MORTGAGE
    // =======================================

    mortgage: false,

    mortgagePercent: null,

    mortgageAmount: null,

    percentage: null,

    rate: null,

    years: null,

    financingLevel: null,

    // =======================================
    // 🏨 PERFORMANCE
    // =======================================

    occupancy: null,

    revpar: null,

    risk: null,

    riskTolerance: null,

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
// 🎯 TARGET ROI
// ===========================================

const targetPatterns = [

  /target\s?(\d+(?:[\.,]\d+)?)%?/,

  /almeno\s?(\d+(?:[\.,]\d+)?)%?/,

  /minimum\s?(\d+(?:[\.,]\d+)?)%?/,

  /voglio\s?(\d+(?:[\.,]\d+)?)%?/

];

for(const pattern of targetPatterns){

  const match = text.match(pattern);

  if(match){

    entities.targetROI =

      Number(
        match[1]
          .replace(",", ".")
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

    bilocale: [
  "bilocale"
],

trilocale: [
  "trilocale"
],

monolocale: [
  "monolocale",
  "studio"
],

loft: [
  "loft"
],

vacationHome: [
  "casa vacanza",
  "holiday home"
],

room: [
  "stanza",
  "room"
],

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
// 🎯 INVESTMENT GOAL
// ===========================================

if(

  text.includes("cashflow") ||

  text.includes("rendita")

){

  entities.investmentGoal =
    "cashflow";

}

else if(

  text.includes("rivendere") ||

  text.includes("flip")

){

  entities.investmentGoal =
    "flip";

}

else if(

  text.includes("lungo termine") ||

  text.includes("long term")

){

  entities.investmentGoal =
    "long_term";

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
// 🧠 RISK TOLERANCE
// ===========================================

if(

  text.includes("basso rischio") ||

  text.includes("safe investment") ||

  text.includes("sicuro")

){

  entities.riskTolerance =
    "low";

}

else if(

  text.includes("alto rischio") ||

  text.includes("high risk") ||

  text.includes("aggressivo")

){

  entities.riskTolerance =
    "high";

}

else if(

  text.includes("rischio medio") ||

  text.includes("balanced")

){

  entities.riskTolerance =
    "medium";

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
// 📚 KNOWLEDGE DETECTION 5.0
// ===========================================

entities.knowledge = null;

const knowledgeBase =
  window.rbKnowledgeBase || {};

const normalizedText =

  String(text || "")
    .toLowerCase()
    .trim();

// ===========================================
// 🧠 RECURSIVE SCAN
// ===========================================

function scanKnowledge(obj){

  if(!obj || typeof obj !== "object"){

    return null;

  }

  for(const key in obj){

    const item = obj[key];

    // =======================================
    // ✅ VALID KNOWLEDGE ENTRY
    // =======================================

    if(
      item &&
      Array.isArray(item.keywords)
    ){

      const matched =

        item.keywords.some(keyword =>

          normalizedText.includes(

            String(keyword)
              .toLowerCase()
              .trim()

          )

        );

      if(matched){

        return {
          key,
          data: item
        };

      }

    }

    // =======================================
    // 🔁 NESTED OBJECT SCAN
    // =======================================

    if(
      item &&
      typeof item === "object"
    ){

      const nested =
        scanKnowledge(item);

      if(nested){

        return nested;

      }

    }

  }

  return null;

}

// ===========================================
// 🚀 EXECUTE
// ===========================================

const matchedKnowledge =
  scanKnowledge(knowledgeBase);

if(matchedKnowledge){

  entities.knowledge =
    matchedKnowledge.key;

  entities.knowledgeData =
    matchedKnowledge.data;

  entities.detectedTopics.push(
    "education"
  );

  console.log(
    "📚 KNOWLEDGE MATCH:",
    matchedKnowledge.key
  );

}

// ===========================================
// 📊 LIVE SIMULATOR KPI EXTRACTION
// ===========================================

try{

  // =======================================
  // 📈 ROI
  // =======================================

  if(entities.roi === null){

    const roiEl =

      document.querySelector(
        "#profitabilityScore, .roi-value, [data-kpi='roi']"
      );

    if(roiEl){

      const rawROI =

        String(
          roiEl.textContent || ""
        ).trim();

      // 🚫 KPI LOCKED / HIDDEN
      if(

        rawROI === "—" ||

        rawROI === "-" ||

        rawROI === "" ||

        rawROI.includes("blur") ||

        rawROI.includes("locked")

      ){

        entities.roi = null;

      }

      else{

        const roiValue = parseFloat(

          rawROI
            .replace(/[^\d.,-]/g,"")
            .replace(",", ".")

        );

        if(!isNaN(roiValue)){

          entities.roi = roiValue;

        }

      }

    }

  }

  // =======================================
  // 🏨 OCCUPANCY
  // =======================================

  if(entities.occupancy === null){

    const occEl =

      document.querySelector(
        "#occupancyRate, .occupancy-value, [data-kpi='occupancy']"
      );

    if(occEl){

      const rawOcc =

        String(
          occEl.textContent || ""
        ).trim();

      if(

        rawOcc !== "—" &&
        rawOcc !== "-" &&
        rawOcc !== ""

      ){

        const occValue = parseFloat(

          rawOcc
            .replace(/[^\d.,-]/g,"")
            .replace(",", ".")

        );

        if(!isNaN(occValue)){

          entities.occupancy = occValue;

        }

      }

    }

  }

  // =======================================
  // ⚠️ RISK
  // =======================================

  if(entities.risk === null){

    const riskEl =

      document.querySelector(
        "#riskScore, .risk-value, [data-kpi='risk']"
      );

    if(riskEl){

      const rawRisk =

        String(
          riskEl.textContent || ""
        ).trim();

      if(

        rawRisk !== "—" &&
        rawRisk !== "-" &&
        rawRisk !== ""

      ){

        const riskValue = parseFloat(

          rawRisk
            .replace(/[^\d.,-]/g,"")
            .replace(",", ".")
        );

        if(!isNaN(riskValue)){

          entities.risk = riskValue;

        }

      }

    }

  }

  // =======================================
  // 🌙 NIGHTLY RATE
  // =======================================

  if(entities.nightly === null){

    const nightlyEl =

      document.querySelector(
        "#nightlyRate, .nightly-value, [data-kpi='nightly']"
      );

    if(nightlyEl){

      const rawNightly =

        String(
          nightlyEl.textContent || ""
        ).trim();

      if(

        rawNightly !== "—" &&
        rawNightly !== "-" &&
        rawNightly !== ""

      ){

        const nightlyValue = parseFloat(

          rawNightly
            .replace(/[^\d.,-]/g,"")
            .replace(",", ".")

        );

        if(!isNaN(nightlyValue)){

          entities.nightly = nightlyValue;

          entities.adr = nightlyValue;

        }

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
