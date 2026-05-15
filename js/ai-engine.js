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

console.log("🧠 AI HELPERS READY");
