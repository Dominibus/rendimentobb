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
// 👤 INVESTOR PROFILE
// =======================================

availableCapital: null,

monthlyCashflowGoal: null,

ownedProperties: null,

businessStage: null,

mainGoal: null,

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

// =======================================
// 🌍 MULTI CITY SUPPORT
// =======================================

const detectedCities = [];

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

    detectedCities.push(cityKey);

  }

}

// =======================================
// 🌍 APPLY RESULTS
// =======================================

if(detectedCities.length >= 2){

  entities.cities =
    detectedCities;

  entities.city = null;

  entities.detectedTopics.push(
    "market"
  );

  console.log(
    "🌍 MULTI CITY:",
    detectedCities
  );

  if(
  Array.isArray(detectedCities) &&
  detectedCities.length >= 2
){

  entities.cities = detectedCities;

}

}

else if(detectedCities.length === 1){

  entities.city =
    detectedCities[0];

  entities.cities =
  detectedCities;

  entities.detectedTopics.push(
    "market"
  );

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

  /target roi\s?(\d+(?:[\.,]\d+)?)%?/,

  /roi target\s?(\d+(?:[\.,]\d+)?)%?/,

  /target\s?roi\s?(\d+(?:[\.,]\d+)?)%?/,

  /almeno(?:\s+il)?\s+(\d+(?:[\.,]\d+)?)\s?%?/,

  /minimum(?:\s+of)?\s+(\d+(?:[\.,]\d+)?)\s?%?/,

  /roi of\s?(\d+(?:[\.,]\d+)?)\s?%/,

  /roi del\s?(\d+(?:[\.,]\d+)?)\s?%/

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
// 💰 AVAILABLE CAPITAL
// ===========================================

const capitalMatch = text.match(

/(?:ho|possiedo|i have|i own)\s+(\d+(?:[\.,]\d+)?)\s?(k|mila|thousand|euro|euros|€)?\s+(?:da investire|da investire nel b&b|da investire in immobili|to invest|to invest in real estate|to invest in bnb)/

);

if(capitalMatch){

  let capital =
    Number(
      capitalMatch[1]
        .replace(",", ".")
    );

  if(
    capitalMatch[2] === "k" ||
    capitalMatch[2] === "mila"
  ){
    capital *= 1000;
  }

  entities.availableCapital =
    Math.round(capital);

}

// ===========================================
// 💸 MONTHLY CASHFLOW GOAL
// ===========================================

const cashflowGoalMatch = text.match(

/(?:voglio|obiettivo|target|i want|my goal is|cashflow target)\s+(\d+(?:[\.,]\d+)?)\s?(?:€|euro|euros|\$)?(?:\s+al mese|\s+mensili|\s+per month|\s+monthly)?/i

);

if(cashflowGoalMatch){

  entities.monthlyCashflowGoal =

    Math.round(

      Number(
        cashflowGoalMatch[1]
          .replace(",", ".")
      )

    );

}

// ===========================================
// 🏠 OWNED PROPERTIES
// ===========================================

const propertiesMatch = text.match(

/(?:ho|possiedo|i own|i have)\s+(\d+)\s+(?:appartamenti|immobili|case|bnb|apartments|properties|houses)/

);

if(propertiesMatch){

  entities.ownedProperties =

    Number(
      propertiesMatch[1]
    );

}

// ===========================================
// 🚀 BUSINESS STAGE
// ===========================================

if(

  text.includes("beginner") ||
  text.includes("principiante")

){

  entities.businessStage =
    "starter";

}

else if(

  text.includes("host") ||
  text.includes("gestisco un b&b") ||
  text.includes("i manage a bnb")

){

  entities.businessStage =
    "operator";

}

else if(

  text.includes("imprenditore") ||
  text.includes("entrepreneur")

){

  entities.businessStage =
    "entrepreneur";

}

// ===========================================
// 🎯 MAIN GOAL
// ===========================================

  if(

  text.includes("cashflow") ||
  text.includes("rendita")

){

  entities.mainGoal =
    "cashflow";

}

else if(

  text.includes("passive income") ||
  text.includes("reddito passivo")

){

  entities.mainGoal =
    "passive_income";

}

else if(

  text.includes("crescita patrimonio") ||
  text.includes("wealth growth")

){

  entities.mainGoal =
    "wealth";

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
// 🚫 SKIP KNOWLEDGE MATCH FOR MULTI CITY
// ===========================================

const skipKnowledgeDetection =

  Array.isArray(entities.cities) &&
  entities.cities.length >= 2;

// ===========================================
// 🏨 PMS PROTECTION
// ===========================================

const isPMSQuestion =

  text.includes("prenotazioni") ||
  text.includes("booking") ||
  text.includes("ospiti") ||
  text.includes("check-in") ||
  text.includes("check out") ||
  text.includes("check-out") ||
  text.includes("adr") ||
  text.includes("revpar") ||
  text.includes("occupazione") ||
  text.includes("ricavi") ||
  text.includes("performance");  

// ===========================================
// 🚀 EXECUTE
// ===========================================

const isExecutiveQuestion =

  text.includes("conviene") ||
  text.includes("investimento") ||
  text.includes("comprare") ||
  text.includes("acquistare") ||
  text.includes("buy") ||
  text.includes("worth");

const matchedKnowledge =

  skipKnowledgeDetection ||

  isPMSQuestion ||

  isExecutiveQuestion

    ? null

    : scanKnowledge(knowledgeBase);

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

  (!Array.isArray(entities.cities) ||
   entities.cities.length < 2) &&

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

// =====================================
// 🔥 SIMULATOR DATA FALLBACK
// =====================================

if(window.lastAnalysisData){

  entities.roi ??=
    window.lastAnalysisData.roi;

  entities.risk ??=
    window.lastAnalysisData.risk;

  entities.occupancy ??=
    window.lastAnalysisData.occupancy;

  entities.propertyPrice ??=
    window.lastAnalysisData.propertyPrice;

  entities.cashflow ??=
    window.lastAnalysisData.profit ??
    window.lastAnalysisData.netAfterMortgage ??
    0;

  entities.city ??=
    window.lastAnalysisData.city;

}

  // ===========================================
  // 🧠 DEBUG
  // ===========================================

  console.log(
  "🧠 ENTITY ENGINE FULL:",
  JSON.stringify(
    entities,
    null,
    2
  )
);

  return entities;

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 ENTITY ENGINE 4.0 READY"
);
