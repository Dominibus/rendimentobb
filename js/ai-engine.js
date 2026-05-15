// ===============================================
// 🧠 RENDIMENTOBB – AI HELPERS CORE 4.0
// Silicon Valley Investment Intelligence Layer
// ===============================================

// ===============================================
// 🌍 CAPITALIZE
// ===============================================

window.rbCapitalize = function(str){

  if(!str) return "";

  str = String(str);

  return (
    str.charAt(0).toUpperCase() +
    str.slice(1)
  );

};

// ===============================================
// 💶 FORMAT CURRENCY
// ===============================================

window.rbFormatCurrency = function(value){

  const n = Number(value || 0);

  return new Intl.NumberFormat(

    "it-IT",

    {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }

  ).format(n);

};

// ===============================================
// 📊 SCORE BAR
// ===============================================

window.rbGenerateScoreBar = function(score){

  score =
    Number(score || 0);

  const blocks =
    Math.max(
      0,
      Math.min(
        10,
        Math.round(score / 10)
      )
    );

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

  // ===========================================
  // 🚀 HIGH ROI
  // ===========================================

  if(roi >= 15){

    return {

      level: "high",

      emoji: "🚀",

      color: "#10b981",

      score: "A+",

      it: "ROI molto elevato",

      en: "Very high ROI"

    };

  }

  // ===========================================
  // 📈 MEDIUM ROI
  // ===========================================

  if(roi >= 8){

    return {

      level: "medium",

      emoji: "📈",

      color: "#3b82f6",

      score: "B",

      it: "ROI sostenibile",

      en: "Sustainable ROI"

    };

  }

  // ===========================================
  // ⚠️ LOW ROI
  // ===========================================

  return {

    level: "low",

    emoji: "⚠️",

    color: "#ef4444",

    score: "C",

    it: "ROI debole",

    en: "Weak ROI"

  };

};

// ===============================================
// ⚠️ RISK CLASSIFIER
// ===============================================

window.rbClassifyRisk = function(risk){

  risk =
    Number(risk || 0);

  // ===========================================
  // 🟢 LOW RISK
  // ===========================================

  if(risk <= 35){

    return {

      level: "low",

      emoji: "🟢",

      color: "#10b981",

      score: "SAFE",

      it: "Rischio basso",

      en: "Low risk"

    };

  }

  // ===========================================
  // 🟡 MEDIUM RISK
  // ===========================================

  if(risk <= 65){

    return {

      level: "medium",

      emoji: "🟡",

      color: "#f59e0b",

      score: "MEDIUM",

      it: "Rischio moderato",

      en: "Moderate risk"

    };

  }

  // ===========================================
  // 🔴 HIGH RISK
  // ===========================================

  return {

    level: "high",

    emoji: "🔴",

    color: "#ef4444",

    score: "HIGH",

    it: "Rischio elevato",

    en: "High risk"

  };

};

// ===============================================
// 🏨 OCCUPANCY CLASSIFIER
// ===============================================

window.rbClassifyOccupancy = function(occ){

  occ =
    Number(occ || 0);

  // ===========================================
  // 🔥 HIGH OCCUPANCY
  // ===========================================

  if(occ >= 75){

    return {

      level: "high",

      emoji: "🔥",

      color: "#10b981",

      score: "STRONG",

      it: "Occupazione molto forte",

      en: "Very strong occupancy"

    };

  }

  // ===========================================
  // 📊 MEDIUM OCCUPANCY
  // ===========================================

  if(occ >= 60){

    return {

      level: "medium",

      emoji: "📊",

      color: "#3b82f6",

      score: "STABLE",

      it: "Occupazione stabile",

      en: "Stable occupancy"

    };

  }

  // ===========================================
  // ⚠️ LOW OCCUPANCY
  // ===========================================

  return {

    level: "low",

    emoji: "⚠️",

    color: "#ef4444",

    score: "WEAK",

    it: "Occupazione debole",

    en: "Weak occupancy"

  };

};

// ===============================================
// 🧠 MARKET BENCHMARK ENGINE
// ===============================================

window.rbGetMarketBenchmark = function(city){

  city = String(
    city || ""
  ).toLowerCase();

  const market =
    window.rbMarketData?.[city];

  if(!market){

    return null;

  }

  return {

    city,

    avgROI:
      market.avgROI ||

      "N/A",

    occupancy:
      market.occupancy ||

      "N/A",

    risk:
      market.risk ||

      "medium",

    demand:
      market.demand ||

      "stable",

    investmentScore:
      market.investmentScore ||

      "B",

    cashflowStrength:
      market.cashflowStrength ||

      "medium"

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

  const safe = v =>

    Number(v || 0);

  const city =

    data.city ||

    data.market ||

    window.currentCity ||

    null;

  // ===========================================
  // 🌍 MARKET DATA
  // ===========================================

  const benchmark =
    window.rbGetMarketBenchmark(
      city
    );

  // ===========================================
  // 📊 CORE VALUES
  // ===========================================

  const roi = safe(
    data.roi
  );

  const risk = safe(

    data.risk ||

    data.riskScore

  );

  const occupancy = safe(

    data.occupancy ||

    data.occupancyRate

  );

  const price = safe(

    data.price ||

    data.propertyPrice

  );

  const nightly = safe(

    data.nightly ||

    data.pricePerNight

  );

  const monthlyCosts = safe(

    data.monthlyCosts ||

    data.monthlyExpenses

  );

  const mortgagePercent = safe(

    data.mortgagePercent ||

    data.ltv

  );

  // ===========================================
  // 🧠 CLASSIFIERS
  // ===========================================

  const roiData =
    window.rbClassifyROI(roi);

  const riskData =
    window.rbClassifyRisk(risk);

  const occupancyData =
    window.rbClassifyOccupancy(
      occupancy
    );

  // ===========================================
  // 🧠 AI SCORE
  // ===========================================

  let investmentScore = 0;

  if(roi >= 10)
    investmentScore += 30;

  if(occupancy >= 65)
    investmentScore += 25;

  if(risk <= 40)
    investmentScore += 25;

  if(monthlyCosts <= 1200)
    investmentScore += 20;

  investmentScore =
    Math.min(
      100,
      investmentScore
    );

  // ===========================================
  // 💾 MEMORY OBJECT
  // ===========================================

  window.rbInvestmentMemory = {

    // =======================================
    // 🌍 LOCATION
    // =======================================

    city,

    benchmark,

    // =======================================
    // 💰 FINANCIAL
    // =======================================

    price,

    roi,

    risk,

    occupancy,

    nightly,

    monthlyCosts,

    // =======================================
    // 🏦 MORTGAGE
    // =======================================

    mortgage: Boolean(

      data.mortgage ||

      data.hasMortgage

    ),

    mortgagePercent,

    // =======================================
    // 🧠 CLASSIFIERS
    // =======================================

    roiData,

    riskData,

    occupancyData,

    // =======================================
    // 📊 AI SCORE
    // =======================================

    investmentScore,

    investmentBar:
      window.rbGenerateScoreBar(
        investmentScore
      ),

    // =======================================
    // 🧠 META
    // =======================================

    updatedAt:
      Date.now(),

    source:
      "RendimentoBB AI Core"

  };

  // ===========================================
  // 🧠 DEBUG
  // ===========================================

  console.log(

    "🧠 Investment Memory Saved",

    window.rbInvestmentMemory

  );

  return window.rbInvestmentMemory;

};

// ===============================================
// 🧠 GET MEMORY
// ===============================================

window.rbGetInvestmentMemory =
function(){

  return (
    window.rbInvestmentMemory ||
    null
  );

};

// ===============================================
// 🧠 CLEAR MEMORY
// ===============================================

window.rbClearInvestmentMemory =
function(){

  window.rbInvestmentMemory =
    null;

  console.log(
    "🧠 Investment Memory Cleared"
  );

};

// ===============================================
// 🧠 AI SIGNAL ENGINE
// ===============================================

window.rbGenerateAISignals =
function(data = {}){

  const signals = [];

  const roi =
    Number(data.roi || 0);

  const risk =
    Number(data.risk || 0);

  const occupancy =
    Number(data.occupancy || 0);

  // ===========================================
  // 🚀 HIGH ROI
  // ===========================================

  if(roi >= 12){

    signals.push({

      type: "high_roi",

      emoji: "🚀",

      it: "ROI sopra benchmark",

      en: "ROI above benchmark"

    });

  }

  // ===========================================
  // ⚠️ HIGH RISK
  // ===========================================

  if(risk >= 70){

    signals.push({

      type: "high_risk",

      emoji: "⚠️",

      it: "Rischio operativo elevato",

      en: "High operational risk"

    });

  }

  // ===========================================
  // 🔥 STRONG OCCUPANCY
  // ===========================================

  if(occupancy >= 70){

    signals.push({

      type: "high_occupancy",

      emoji: "🔥",

      it: "Occupazione molto forte",

      en: "Very strong occupancy"

    });

  }

  return signals;

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 AI HELPERS READY"
);
