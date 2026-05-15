// ===============================================
// 🧠 RENDIMENTOBB – ENTITY EXTRACTION ENGINE 3.0
// Silicon Valley AI Parsing Layer
// ===============================================

window.rbExtractEntities = function(text){

  // ===========================================
  // 🧹 NORMALIZE
  // ===========================================

  text = String(text || "")
    .toLowerCase()
    .trim();

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

    monthlyCosts: null,

    downPayment: null,

    cashflow: null,

    // =======================================
    // 🏦 MORTGAGE
    // =======================================

    mortgage: false,

    mortgagePercent: null,

    percentage: null,

    rate: null,

    years: null,

    // =======================================
    // 🏨 PERFORMANCE
    // =======================================

    occupancy: null,

    risk: null,

    // =======================================
    // 🏠 PROPERTY
    // =======================================

    propertyType: null,

    strategy: null,

    // =======================================
    // 🧠 META
    // =======================================

    intentHints: []

  };

  // ===========================================
  // 🌍 CITY DETECTION
  // ===========================================

  const cities = {

    ...(window.rbKnowledgeBase?.cities || {}),

    ...(window.rbMarketData || {})

  };

  for(const cityKey in cities){

    const city = cities[cityKey];

    // =======================================
    // 🧠 ALIASES
    // =======================================

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

      break;

    }

  }

  // ===========================================
  // 💰 PROPERTY PRICE
  // ===========================================

  const euroPricePatterns = [

    /(\d+(?:[\.,]\d+)?)\s?k\b/,

    /(\d+(?:[\.,]\d+)?)\s?mila\b/,

    /€\s?(\d+(?:[\.,]\d+)?)/,

    /(\d+(?:[\.,]\d+)?)\s?euro/,

    /prezzo\s?(\d+(?:[\.,]\d+)?)/

  ];

  for(const pattern of euroPricePatterns){

    const match = text.match(pattern);

    if(match){

      let value =

        Number(
          match[1]
            .replace(",", ".")
        );

      // =====================================
      // K / MILA
      // =====================================

      if(
        text.includes("k") ||
        text.includes("mila")
      ){

        value *= 1000;

      }

      entities.price =
        Math.round(value);

      entities.amount =
        Math.round(value);

      break;

    }

  }

  // ===========================================
  // 📈 ROI
  // ===========================================

  const roiMatch = text.match(

    /roi\s?(\d+(?:[\.,]\d+)?)%?/

  );

  if(roiMatch){

    entities.roi =

      Number(
        roiMatch[1]
          .replace(",", ".")
      );

  }

  // ===========================================
  // 🏨 OCCUPANCY
  // ===========================================

  const occupancyPatterns = [

    /occupazione\s?(\d+)/,

    /occupancy\s?(\d+)/,

    /occupato\s?al\s?(\d+)/,

    /booking\s?(\d+)/

  ];

  for(const pattern of occupancyPatterns){

    const match = text.match(pattern);

    if(match){

      entities.occupancy =
        Number(match[1]);

      break;

    }

  }

  // ===========================================
  // 🏦 MORTGAGE DETECTION
  // ===========================================

  if(

    text.includes("mutuo") ||

    text.includes("mortgage") ||

    text.includes("ltv") ||

    text.includes("finanziamento")

  ){

    entities.mortgage = true;

  }

  // ===========================================
  // 🏦 MORTGAGE %
  // ===========================================

  const mortgagePatterns = [

    /mutuo\s?(\d+)%/,

    /mortgage\s?(\d+)%/,

    /ltv\s?(\d+)%/,

    /(\d+)%\s?mutuo/

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

  const rateMatch = text.match(

    /tasso\s?(\d+(?:[\.,]\d+)?)|rate\s?(\d+(?:[\.,]\d+)?)/

  );

  if(rateMatch){

    entities.rate = Number(

      (
        rateMatch[1] ||
        rateMatch[2]
      ).replace(",", ".")

    );

  }

  // ===========================================
  // ⏳ YEARS
  // ===========================================

  const yearsMatch = text.match(

    /(\d+)\s?anni/

  );

  if(yearsMatch){

    entities.years =
      Number(yearsMatch[1]);

  }

  // ===========================================
  // 💸 NIGHTLY PRICE
  // ===========================================

  const nightlyMatch = text.match(

    /(?:notte|night|adr)\s?(\d+)/

  );

  if(nightlyMatch){

    entities.nightly =
      Number(nightlyMatch[1]);

  }

  // ===========================================
  // 💸 MONTHLY COSTS
  // ===========================================

  const costsMatch = text.match(

    /(?:costi|spese)\s?(\d+)/

  );

  if(costsMatch){

    entities.monthlyCosts =
      Number(costsMatch[1]);

  }

  // ===========================================
  // 🏠 PROPERTY TYPE
  // ===========================================

  if(
    text.includes("villa")
  ){

    entities.propertyType =
      "villa";

  }

  else if(
    text.includes("attico")
  ){

    entities.propertyType =
      "attico";

  }

  else if(
    text.includes("b&b") ||
    text.includes("bnb")
  ){

    entities.propertyType =
      "bnb";

  }

  else if(
    text.includes("appartamento")
  ){

    entities.propertyType =
      "appartamento";

  }

  // ===========================================
  // 🧠 STRATEGY DETECTION
  // ===========================================

  if(
    text.includes("luxury") ||
    text.includes("lusso")
  ){

    entities.strategy =
      "luxury";

  }

  else if(
    text.includes("business")
  ){

    entities.strategy =
      "business";

  }

  else if(
    text.includes("turismo")
  ){

    entities.strategy =
      "tourism";

  }

  // ===========================================
  // ⚠️ RISK DETECTION
  // ===========================================

  if(
    text.includes("alto rischio")
  ){

    entities.risk = "high";

  }

  else if(
    text.includes("basso rischio")
  ){

    entities.risk = "low";

  }

  // ===========================================
  // 🧠 INTENT HINTS
  // ===========================================

  if(
    text.includes("conviene")
  ){

    entities.intentHints.push(
      "strategy"
    );

  }

  if(
    text.includes("rischio")
  ){

    entities.intentHints.push(
      "risk"
    );

  }

  if(
    text.includes("roi")
  ){

    entities.intentHints.push(
      "roi"
    );

  }

  if(
    text.includes("cashflow") ||
    text.includes("cash flow")
  ){

    entities.intentHints.push(
      "cashflow"
    );

  }

  // ===========================================
  // 🧠 CLEAN NULLS
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
    "🧠 ENTITY ENGINE:",
    entities
  );

  return entities;

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 ENTITY ENGINE READY"
);
