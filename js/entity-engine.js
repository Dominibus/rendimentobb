// ===============================================
// 🧠 RENDIMENTOBB – ENTITY ENGINE
// Silicon Valley AI Extraction System
// Multi-language + Multi-city + Financial Context
// ===============================================

window.rbExtractEntities = function(message){

  // ===========================================
  // 🛡️ SAFE GUARD
  // ===========================================

  if(!message){

    return {

      city: null,
      cities: [],
      roi: null,
      occupancy: null,
      price: null,
      mortgage: false,
      risk: null,
      percentages: [],
      amounts: [],
      comparison: false

    };

  }

  // ===========================================
  // 🧹 NORMALIZATION
  // ===========================================

  const text = String(message).toLowerCase().trim();

  const entities = {

    // 🌍 Location
    city: null,
    cities: [],

    // 📈 Metrics
    roi: null,
    occupancy: null,
    risk: null,

    // 💰 Financial
    price: null,
    mortgage: false,

    // 📊 Raw extraction
    percentages: [],
    amounts: [],

    // ⚔️ Comparison mode
    comparison: false

  };

  // ===========================================
  // 🌍 CITY DATABASE
  // ===========================================

  const CITY_LIST = [

    "roma",
    "milano",
    "napoli",
    "firenze",
    "torino",
    "bologna",
    "venezia",
    "palermo",
    "bari",
    "verona"

  ];

  // ===========================================
  // 🏙️ MULTI CITY EXTRACTION
  // ===========================================

  const detectedCities = CITY_LIST.filter(city =>
    text.includes(city)
  );

  entities.cities = detectedCities;

  // 🔥 Backward compatibility
  entities.city = detectedCities[0] || null;

  // ===========================================
  // ⚔️ COMPARISON DETECTION
  // ===========================================

  const comparisonWords = [

    "vs",
    "contro",
    "oppure",
    "o",
    "meglio",
    "compare",
    "comparison"

  ];

  entities.comparison =
    detectedCities.length >= 2 ||
    comparisonWords.some(word =>
      text.includes(word)
    );

  // ===========================================
  // 📈 PERCENTAGE EXTRACTION
  // ===========================================

  const percentageMatches =
    text.match(/\d+(?:[\.,]\d+)?\s?%/g);

  if(percentageMatches){

    entities.percentages =
      percentageMatches.map(v =>

        parseFloat(
          v
            .replace("%","")
            .replace(",",".")
        )

      ).filter(v => !isNaN(v));

  }

  // ===========================================
  // 🏨 OCCUPANCY DETECTION
  // ===========================================

  if(

    text.includes("occupazione") ||
    text.includes("occupancy") ||
    text.includes("booking") ||
    text.includes("prenotazioni")

  ){

    const occ =
      entities.percentages.find(
        p => p >= 20 && p <= 100
      );

    if(occ){

      entities.occupancy = occ;

    }

  }

  // ===========================================
  // 📈 ROI DETECTION
  // ===========================================

  if(

    text.includes("roi") ||
    text.includes("return") ||
    text.includes("rendimento")

  ){

    const roi =
      entities.percentages.find(
        p => p >= 1 && p <= 200
      );

    if(roi){

      entities.roi = roi;

    }

  }

  // ===========================================
  // 💰 MONEY EXTRACTION
  // ===========================================

  const moneyMatches =
    text.match(/\d{2,9}/g);

  if(moneyMatches){

    entities.amounts =
      moneyMatches
        .map(v => parseInt(v))
        .filter(v => !isNaN(v));

  }

  // ===========================================
  // 🏠 PROPERTY PRICE DETECTION
  // ===========================================

  const likelyPrice =
    entities.amounts.find(
      n => n >= 30000
    );

  if(likelyPrice){

    entities.price = likelyPrice;

  }

  // ===========================================
  // 🏦 MORTGAGE DETECTION
  // ===========================================

  const mortgageWords = [

    "mutuo",
    "mortgage",
    "loan",
    "finanziamento",
    "leva",
    "ltv",
    "rata",
    "bank"

  ];

  entities.mortgage =
    mortgageWords.some(word =>
      text.includes(word)
    );

  // ===========================================
  // ⚠️ RISK DETECTION
  // ===========================================

  const riskWords = [

    "rischio",
    "risk",
    "pericolo",
    "instabile",
    "volatile"

  ];

  entities.risk =
    riskWords.some(word =>
      text.includes(word)
    );

  // ===========================================
  // 🧠 DEBUG MODE
  // ===========================================

  if(window.DEBUG_AI){

    console.log(
      "🧠 ENTITY ENGINE:",
      entities
    );

  }

  return entities;

};

// ===============================================
// 🚀 ENGINE READY
// ===============================================

console.log(
  "🧠 ENTITY ENGINE READY"
);
