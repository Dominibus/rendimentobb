// ===============================================
// 🧠 RENDIMENTOBB – INVESTMENT SCORE ENGINE 1.0
// Silicon Valley SaaS AI Scoring Layer
// Professional Investment Intelligence System
// ===============================================

// ===============================================
// 🚀 MAIN SCORE ENGINE
// ===============================================

window.rbGenerateInvestmentScore = function({

  roi = 0,

  risk = 50,

  occupancy = 0,

  mortgagePercent = 0,

  cashflow = 0,

  city = null

} = {}){

  try{

    // ===========================================
    // 🧠 NORMALIZATION
    // ===========================================

    roi =
      Number(roi || 0);

    risk =
      Number(risk || 0);

    occupancy =
      Number(occupancy || 0);

    mortgagePercent =
      Number(mortgagePercent || 0);

    cashflow =
      Number(cashflow || 0);

    // ===========================================
    // 🎯 BASE SCORE
    // ===========================================

    let score = 50;

    const signals = [];

    // ===========================================
    // 📈 ROI WEIGHT
    // ===========================================

    if(roi >= 30){

      score += 25;

      signals.push(
        "elite_roi"
      );

    }

    else if(roi >= 20){

      score += 18;

      signals.push(
        "strong_roi"
      );

    }

    else if(roi >= 10){

      score += 10;

      signals.push(
        "good_roi"
      );

    }

    else if(roi > 0){

      score += 2;

      signals.push(
        "weak_roi"
      );

    }

    else{

      score -= 15;

      signals.push(
        "negative_roi"
      );

    }

    // ===========================================
    // ⚠️ RISK WEIGHT
    // ===========================================

    if(risk >= 80){

      score -= 25;

      signals.push(
        "extreme_risk"
      );

    }

    else if(risk >= 60){

      score -= 15;

      signals.push(
        "high_risk"
      );

    }

    else if(risk >= 40){

      score -= 6;

      signals.push(
        "moderate_risk"
      );

    }

    else{

      score += 8;

      signals.push(
        "low_risk"
      );

    }

    // ===========================================
    // 🏨 OCCUPANCY WEIGHT
    // ===========================================

    if(occupancy >= 75){

      score += 18;

      signals.push(
        "elite_occupancy"
      );

    }

    else if(occupancy >= 60){

      score += 12;

      signals.push(
        "strong_occupancy"
      );

    }

    else if(occupancy >= 45){

      score += 4;

      signals.push(
        "stable_occupancy"
      );

    }

    else if(occupancy > 0){

      score -= 12;

      signals.push(
        "weak_occupancy"
      );

    }

    // ===========================================
    // 🏦 LEVERAGE WEIGHT
    // ===========================================

    if(mortgagePercent >= 90){

      score -= 20;

      signals.push(
        "extreme_leverage"
      );

    }

    else if(mortgagePercent >= 80){

      score -= 12;

      signals.push(
        "high_leverage"
      );

    }

    else if(mortgagePercent >= 60){

      score -= 5;

      signals.push(
        "moderate_leverage"
      );

    }

    else if(
      mortgagePercent > 0 &&
      mortgagePercent <= 40
    ){

      score += 4;

      signals.push(
        "safe_leverage"
      );

    }

    // ===========================================
    // 💰 CASHFLOW WEIGHT
    // ===========================================

    if(cashflow > 50000){

      score += 15;

      signals.push(
        "strong_cashflow"
      );

    }

    else if(cashflow > 15000){

      score += 8;

      signals.push(
        "positive_cashflow"
      );

    }

    else if(cashflow > 0){

      score += 3;

      signals.push(
        "stable_cashflow"
      );

    }

    else{

      score -= 18;

      signals.push(
        "negative_cashflow"
      );

    }

    // ===========================================
    // 🧠 SCORE LIMITS
    // ===========================================

    score = Math.max(
      0,
      Math.min(100, Math.round(score))
    );

    // ===========================================
    // 🏆 LABELS
    // ===========================================

    let label = "weak";

    let labelIT =
      "Investimento debole";

    let labelEN =
      "Weak investment";

    // ===========================================

    if(score >= 90){

      label = "elite";

      labelIT =
        "Investimento elite";

      labelEN =
        "Elite investment";

    }

    else if(score >= 75){

      label = "strong";

      labelIT =
        "Investimento molto forte";

      labelEN =
        "Very strong investment";

    }

    else if(score >= 60){

      label = "good";

      labelIT =
        "Investimento sostenibile";

      labelEN =
        "Sustainable investment";

    }

    else if(score >= 40){

      label = "moderate";

      labelIT =
        "Investimento moderato";

      labelEN =
        "Moderate investment";

    }

    else{

      label = "weak";

      labelIT =
        "Investimento ad alto rischio";

      labelEN =
        "High-risk investment";

    }

    // ===========================================
    // 🌍 SUSTAINABILITY
    // ===========================================

    let sustainability =
      "low";

    if(score >= 75){

      sustainability =
        "high";

    }

    else if(score >= 50){

      sustainability =
        "medium";

    }

    // ===========================================
    // 🧠 AI INSIGHTS
    // ===========================================

    const insightsIT = [];

    const insightsEN = [];

    // ===========================================

    if(
      roi >= 20 &&
      risk <= 35
    ){

      insightsIT.push(
        "🚀 Il rapporto rischio/rendimento appare molto competitivo."
      );

      insightsEN.push(
        "🚀 Risk/reward ratio appears highly competitive."
      );

    }

    // ===========================================

    if(
      occupancy < 45
    ){

      insightsIT.push(
        "⚠️ L'occupazione attuale potrebbe compromettere il cashflow reale."
      );

      insightsEN.push(
        "⚠️ Current occupancy may compromise real cashflow."
      );

    }

    // ===========================================

    if(
      mortgagePercent >= 80
    ){

      insightsIT.push(
        "🏦 La leva finanziaria elevata aumenta la vulnerabilità operativa."
      );

      insightsEN.push(
        "🏦 High leverage increases operational vulnerability."
      );

    }

    // ===========================================
    // 🧠 FINAL OBJECT
    // ===========================================

    const result = {

      score,

      label,

      labelIT,

      labelEN,

      sustainability,

      city,

      signals,

      insightsIT,

      insightsEN

    };

    // ===========================================
    // 🧠 DEBUG
    // ===========================================

    console.log(
      "🧠 INVESTMENT SCORE:",
      result
    );

    return result;

  }

  catch(error){

    console.error(
      "❌ SCORE ENGINE ERROR:",
      error
    );

    return {

      score: 0,

      label: "error",

      labelIT: "Errore analisi",

      labelEN: "Analysis error",

      sustainability: "unknown",

      signals: [],

      insightsIT: [],

      insightsEN: []

    };

  }

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 INVESTMENT SCORE ENGINE READY"
);
