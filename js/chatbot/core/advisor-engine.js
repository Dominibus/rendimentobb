// ===============================================
// 🧠 RENDIMENTOBB – ADVISOR ENGINE 1.0
// Silicon Valley Investment Advisor Layer
// ===============================================

window.rbGenerateAdvisorVerdict = function({

  roi = 0,

  risk = 0,

  occupancy = 0,

  mortgagePercent = 0,

  cashflow = 0,

  city = "",

  investorProfile = {}

} = {}){

  const reasonsIT = [];
  const reasonsEN = [];

  let score = 50;

  // =====================================
  // ROI
  // =====================================

  if(roi >= 20){

    score += 20;

    reasonsIT.push(
      "ROI molto competitivo."
    );

    reasonsEN.push(
      "Highly competitive ROI."
    );

  }

  else if(roi >= 10){

    score += 10;

    reasonsIT.push(
      "ROI sostenibile."
    );

    reasonsEN.push(
      "Sustainable ROI."
    );

  }

  else{

    score -= 15;

    reasonsIT.push(
      "ROI inferiore alle aspettative."
    );

    reasonsEN.push(
      "ROI below expectations."
    );

  }

  // =====================================
  // RISK
  // =====================================

  if(risk >= 70){

    score -= 20;

    reasonsIT.push(
      "Rischio elevato."
    );

    reasonsEN.push(
      "High risk."
    );

  }

  else if(risk <= 35){

    score += 10;

    reasonsIT.push(
      "Rischio contenuto."
    );

    reasonsEN.push(
      "Controlled risk."
    );

  }

  // =====================================
  // OCCUPANCY
  // =====================================

  if(occupancy >= 70){

    score += 15;

    reasonsIT.push(
      "Occupazione molto forte."
    );

    reasonsEN.push(
      "Strong occupancy."
    );

  }

  else if(occupancy < 45){

    score -= 15;

    reasonsIT.push(
      "Occupazione debole."
    );

    reasonsEN.push(
      "Weak occupancy."
    );

  }

  // =====================================
  // CASHFLOW
  // =====================================

  if(cashflow > 0){

    score += 10;

    reasonsIT.push(
      "Cashflow positivo."
    );

    reasonsEN.push(
      "Positive cashflow."
    );

  }

  else{

    score -= 20;

    reasonsIT.push(
      "Cashflow negativo."
    );

    reasonsEN.push(
      "Negative cashflow."
    );

  }

  // =====================================
  // LEVERAGE
  // =====================================

  if(mortgagePercent >= 85){

    score -= 10;

    reasonsIT.push(
      "Leva finanziaria aggressiva."
    );

    reasonsEN.push(
      "Aggressive leverage."
    );

  }

  // =====================================
  // SCORE LIMITS
  // =====================================

  score = Math.max(
    0,
    Math.min(100, score)
  );

  // =====================================
  // VERDICT
  // =====================================

  let verdict = "WAIT";

  if(score >= 75){

    verdict = "BUY";

  }

  else if(score <= 40){

    verdict = "AVOID";

  }

  // =====================================
  // CONFIDENCE
  // =====================================

  const confidence =

    Math.min(
      99,
      60 +
      Math.round(score / 3)
    );

  // =====================================
  // RECOMMENDATIONS
  // =====================================

  const recommendationsIT = [];
  const recommendationsEN = [];

  if(occupancy < 60){

    recommendationsIT.push(
      "Aumentare occupazione."
    );

    recommendationsEN.push(
      "Increase occupancy."
    );

  }

  if(risk > 60){

    recommendationsIT.push(
      "Ridurre esposizione al rischio."
    );

    recommendationsEN.push(
      "Reduce risk exposure."
    );

  }

  if(mortgagePercent > 80){

    recommendationsIT.push(
      "Valutare minore leva finanziaria."
    );

    recommendationsEN.push(
      "Consider lower leverage."
    );

  }

  return {

    verdict,

    score,

    confidence,

    city,

    reasonsIT,

    reasonsEN,

    recommendationsIT,

    recommendationsEN

  };

};

console.log(
  "🧠 ADVISOR ENGINE READY"
);
