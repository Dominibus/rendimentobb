// ===============================================
// 🧠 RENDIMENTOBB – AI HELPERS CORE
// ===============================================

// ===============================================
// 🌍 CAPITALIZE
// ===============================================

window.rbCapitalize = function(str){

  if(!str) return "";

  return str.charAt(0).toUpperCase() + str.slice(1);

};

// ===============================================
// 📊 SCORE BAR
// ===============================================

window.rbGenerateScoreBar = function(score){

  const blocks =
    Math.round(score / 10);

  return (
    "█".repeat(blocks) +
    "░".repeat(10 - blocks)
  );

};

// ===============================================
// 🧠 SAFE NUMBER
// ===============================================

window.rbSafeNumber = function(v){

  const n = Number(v);

  return isNaN(n)
    ? 0
    : n;

};

// ===============================================
// 💬 UNIQUE ARRAY
// ===============================================

window.rbUniqueArray = function(arr){

  return [...new Set(arr)];

};

// ===============================================
// 📈 ROI CLASSIFIER
// ===============================================

window.rbClassifyROI = function(roi){

  roi = Number(roi || 0);

  if(roi >= 15){

    return {
      level: "high",
      emoji: "🚀",
      it: "ROI molto elevato",
      en: "Very high ROI"
    };

  }

  if(roi >= 8){

    return {
      level: "medium",
      emoji: "📈",
      it: "ROI sostenibile",
      en: "Sustainable ROI"
    };

  }

  return {

    level: "low",
    emoji: "⚠️",
    it: "ROI debole",
    en: "Weak ROI"

  };

};

// ===============================================
// ⚠️ RISK CLASSIFIER
// ===============================================

window.rbClassifyRisk = function(risk){

  risk = Number(risk || 0);

  if(risk <= 35){

    return {
      level: "low",
      emoji: "🟢",
      it: "Rischio basso",
      en: "Low risk"
    };

  }

  if(risk <= 65){

    return {
      level: "medium",
      emoji: "🟡",
      it: "Rischio moderato",
      en: "Moderate risk"
    };

  }

  return {

    level: "high",
    emoji: "🔴",
    it: "Rischio elevato",
    en: "High risk"

  };

};

// ===============================================
// 🏨 OCCUPANCY CLASSIFIER
// ===============================================

window.rbClassifyOccupancy = function(occ){

  occ = Number(occ || 0);

  if(occ >= 75){

    return {
      level: "high",
      emoji: "🔥",
      it: "Occupazione molto forte",
      en: "Very strong occupancy"
    };

  }

  if(occ >= 60){

    return {
      level: "medium",
      emoji: "📊",
      it: "Occupazione stabile",
      en: "Stable occupancy"
    };

  }

  return {

    level: "low",
    emoji: "⚠️",
    it: "Occupazione debole",
    en: "Weak occupancy"

  };

};

// ===============================================
// 🧠 INVESTMENT MEMORY ENGINE
// ===============================================

window.rbInvestmentMemory =
  window.rbInvestmentMemory || null;

// ===============================================
// 💾 SAVE INVESTMENT CONTEXT
// ===============================================

window.saveInvestmentContext = function(data = {}){

  window.rbInvestmentMemory = {

    city:
      data.city ||
      data.market ||
      window.currentCity ||
      null,

    price:
      Number(
        data.price ||
        data.propertyPrice ||
        0
      ),

    mortgage:
      Boolean(
        data.mortgage ||
        data.hasMortgage
      ),

    mortgagePercent:
      Number(
        data.mortgagePercent ||
        data.ltv ||
        0
      ),

    occupancy:
      Number(
        data.occupancy ||
        data.occupancyRate ||
        0
      ),

    roi:
      Number(data.roi || 0),

    risk:
      Number(
        data.risk ||
        data.riskScore ||
        0
      ),

    nightly:
      Number(
        data.nightly ||
        data.pricePerNight ||
        0
      ),

    monthlyCosts:
      Number(
        data.monthlyCosts ||
        data.monthlyExpenses ||
        0
      ),

    updatedAt: Date.now()

  };

  console.log(
    "🧠 Investment Memory Saved",
    window.rbInvestmentMemory
  );

};

// ===============================================
// 🧠 GLOBAL ENTITY EXTRACTION ENGINE
// ===============================================

window.rbExtractEntities = function(text = ""){

  text = String(text).toLowerCase();

  const entities = {

    city: null,

    price: null,

    amount: null,

    mortgage: false,

    mortgagePercent: null,

    occupancy: null,

    percentage: null

  };

  // ===========================================
  // 🌍 CITY DETECTION
  // ===========================================

  const cities = Object.keys(
    window.rbKnowledgeBase?.cities || {}
  );

  for(const city of cities){

    const aliases =
      window.rbKnowledgeBase
      ?.cities?.[city]
      ?.aliases || [];

    if(
      aliases.some(alias =>
        text.includes(alias)
      )
    ){

      entities.city = city;
      break;

    }

  }

// ===========================================
// 💰 PRICE DETECTION
// ===========================================

const priceMatch = text.match(
  /(\d+)\s?(k|mila|milioni|m)?(?=\s?(€|euro|di|appartamento|immobile))/i
);

if(priceMatch){

  let value =
    Number(priceMatch[1]);

  const unit =
    (priceMatch[2] || "").toLowerCase();

  if(
    unit === "k" ||
    unit === "mila"
  ){
    value *= 1000;
  }

  if(
    unit === "m" ||
    unit === "milioni"
  ){
    value *= 1000000;
  }

  entities.price = value;

}

  // ===========================================
  // 🏦 MORTGAGE %
  // ===========================================

  const mortgageMatch = text.match(
    /(mutuo|mortgage|ltv)[^\d]{0,10}(\d+)\s?%/i
  );

  if(mortgageMatch){

    entities.mortgage = true;

    entities.mortgagePercent =
      Number(mortgageMatch[2]);

  }

  // ===========================================
  // 🏨 OCCUPANCY %
  // ===========================================

  const occupancyMatch = text.match(
    /(occupazione|occupancy)[^\d]{0,10}(\d+)\s?%/i
  );

  if(occupancyMatch){

    entities.occupancy =
      Number(occupancyMatch[2]);

  }

  // ===========================================
  // 📊 GENERIC %
  // ===========================================

  const genericPercent =
    text.match(/(\d+)\s?%/);

  if(genericPercent){

    entities.percentage =
      Number(genericPercent[1]);

  }

  console.log(
    "🧠 ENTITY ENGINE:",
    entities
  );

  return entities;

};

console.log("🧠 AI HELPERS READY");
