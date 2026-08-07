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

  investorProfile = {},

  canonicalScore = null

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
    `Il ROI del ${roi.toFixed(1)}% supera ampiamente i benchmark medi del mercato short-rent.`
  );

  reasonsEN.push(
    `ROI of ${roi.toFixed(1)}% significantly exceeds typical short-rent benchmarks.`
  );

}

else if(roi >= 10){

  score += 10;

  reasonsIT.push(
    `Il ROI del ${roi.toFixed(1)}% rientra in una fascia sostenibile e potenzialmente scalabile.`
  );

  reasonsEN.push(
    `ROI of ${roi.toFixed(1)}% falls within a sustainable and potentially scalable range.`
  );

}

else{

  score -= 15;

  reasonsIT.push(
    `Il ROI del ${roi.toFixed(1)}% risulta inferiore agli standard normalmente ricercati dagli investitori.`
  );

  reasonsEN.push(
    `ROI of ${roi.toFixed(1)}% is below levels generally targeted by investors.`
  );

}
  // =====================================
  // RISK
  // =====================================

  if(risk >= 70){

  score -= 20;

  reasonsIT.push(
    `Il profilo di rischio (${risk}/100) richiede particolare attenzione nella gestione operativa e finanziaria.`
  );

  reasonsEN.push(
    `Risk profile (${risk}/100) requires careful operational and financial management.`
  );

}

else if(risk <= 35){

  score += 10;

  reasonsIT.push(
    `Il livello di rischio (${risk}/100) risulta contenuto rispetto alla media del settore.`
  );

  reasonsEN.push(
    `Risk level (${risk}/100) remains well controlled compared to sector averages.`
  );

}
  // =====================================
  // OCCUPANCY
  // =====================================

  if(occupancy >= 70){

  score += 15;

  reasonsIT.push(
    `L'occupazione prevista del ${occupancy}% supporta una buona continuità dei ricavi durante l'anno.`
  );

  reasonsEN.push(
    `Projected occupancy of ${occupancy}% supports strong revenue continuity throughout the year.`
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
    `Il cashflow stimato (€${Math.round(cashflow).toLocaleString("it-IT")}) contribuisce positivamente alla sostenibilità dell'investimento.`
  );

  reasonsEN.push(
    `Estimated cashflow (€${Math.round(cashflow).toLocaleString("en-US")}) positively supports investment sustainability.`
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
// 👤 INVESTOR PROFILE
// =====================================

const {

  availableCapital = 0,

  ownedProperties = 0,

  monthlyCashflowGoal = 0,

  targetROI = 0

} = investorProfile || {};

// ROI TARGET

if(
  targetROI > 0
){

  if(
    roi >= targetROI
  ){

    score += 10;

    reasonsIT.push(
      `Il ROI supera il tuo obiettivo personale del ${targetROI}%.`
    );

    reasonsEN.push(
      `ROI exceeds your personal target of ${targetROI}%.`
    );

  }

  else{

    score -= 10;

    reasonsIT.push(
      `Il ROI non raggiunge il tuo obiettivo personale del ${targetROI}%.`
    );

    reasonsEN.push(
      `ROI does not reach your personal target of ${targetROI}%.`
    );

  }

}

// CASHFLOW TARGET

if(
  monthlyCashflowGoal > 0
){

  if(
    cashflow >= monthlyCashflowGoal
  ){

    score += 10;

    reasonsIT.push(
      `Il cashflow supera il tuo obiettivo di €${monthlyCashflowGoal.toLocaleString("it-IT")} al mese.`
    );

    reasonsEN.push(
      `Cashflow exceeds your target of €${monthlyCashflowGoal.toLocaleString("en-US")} per month.`
    );

  }

  else{

    score -= 5;

    reasonsIT.push(
      `Il cashflow è inferiore al tuo obiettivo personale.`
    );

    reasonsEN.push(
      `Cashflow is below your personal target.`
    );

  }

}

// PORTFOLIO EXPERIENCE

if(
  ownedProperties >= 3
){

  score += 5;

  reasonsIT.push(
    "Il profilo mostra esperienza nella gestione di immobili a reddito."
  );

  reasonsEN.push(
    "Profile shows experience managing income-producing properties."
  );

}

// CAPITAL ADEQUACY

if(
  availableCapital > 0 &&
  availableCapital >= cashflow
){

  score += 3;

  reasonsIT.push(
    "La disponibilità di capitale aumenta la flessibilità operativa dell'investimento."
  );

  reasonsEN.push(
    "Available capital improves operational flexibility."
  );

}

  // =====================================
  // SCORE LIMITS
  // =====================================

  score = Math.max(
  0,
  Math.min(95, score)
);

  // =====================================
  // VERDICT
  // =====================================

  let verdict = "WAIT";

  if(

  score >= 75 &&

  cashflow > 0

){

  verdict = "BUY";

}

  else if(

  score <= 40 ||

  cashflow < 0

){

  verdict = "AVOID";

}

// =====================================
// 📊 CANONICAL INVESTMENT SCORE
// Reuse canonical score already produced by analysis
// =====================================

const advisorScore =
  score;

const existingCanonicalScore =
  Number(
    canonicalScore ??
    window.lastAnalysisData?.investmentScore ??
    window.lastInvestmentScore?.score
  );

const investmentScore =
  Number.isFinite(existingCanonicalScore)
    ? existingCanonicalScore
    : advisorScore;
// =====================================
// 🎯 CANONICAL CONFIDENCE
// Based on public Investment Score
// =====================================

const confidence =

  Math.min(
    99,
    60 +
    Math.round(investmentScore / 3)
  );  

// =====================================
// 🎯 CANONICAL VERDICT
// Verdict based on public Investment Score
// =====================================

if(
  investmentScore >= 75 &&
  cashflow > 0
){

  verdict = "BUY";

}
else if(
  investmentScore <= 40 ||
  cashflow < 0
){

  verdict = "AVOID";

}
else{

  verdict = "WAIT";

}

  // =====================================
  // RECOMMENDATIONS
  // =====================================

  const recommendationsIT = [];
  const recommendationsEN = [];

// =====================================
// 🎯 ACTION PLAN
// =====================================

const actionPlanIT = [];
const actionPlanEN = [];

if(verdict === "BUY"){

  actionPlanIT.push(
    "Acquisizione consigliata."
  );

  actionPlanEN.push(
    "Acquisition recommended."
  );

}
else if(verdict === "WAIT"){

  actionPlanIT.push(
    "Valutare ulteriori ottimizzazioni prima dell'acquisto."
  );

  actionPlanEN.push(
    "Consider further optimization before acquisition."
  );

}
else{

  actionPlanIT.push(
    "Operazione non consigliata nelle condizioni attuali."
  );

  actionPlanEN.push(
    "Investment not recommended under current conditions."
  );

}

// ROI VS MARKET

if(roi >= 20){

  actionPlanIT.push(
    "Performance superiore ai benchmark medi del mercato."
  );

  actionPlanEN.push(
    "Performance above average market benchmarks."
  );

}

// OCCUPANCY

if(occupancy >= 65){

  actionPlanIT.push(
    "Domanda potenziale compatibile con una gestione short-rent stabile."
  );

  actionPlanEN.push(
    "Demand level compatible with stable short-rent operations."
  );

}

// CASHFLOW

if(cashflow > 0){

  actionPlanIT.push(
    "Cashflow positivo e sostenibile."
  );

  actionPlanEN.push(
    "Positive and sustainable cashflow."
  );

}

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

  console.log(
  "🧠 FINAL ADVISOR SCORE",
  {
    score: investmentScore,
    advisorScore,
    verdict,
    confidence,
    roi,
    risk,
    occupancy,
    cashflow
  }
);

// =====================================
// SINGLE SOURCE OF TRUTH
// =====================================

window.lastInvestmentScore = {

    score: investmentScore,

    verdict,

    confidence,

    label: verdict

};

return {

  verdict,

  score: investmentScore,

  advisorScore,

  confidence,

  city,

  reasonsIT,

  reasonsEN,

  recommendationsIT,

  recommendationsEN,

  actionPlanIT,

  actionPlanEN

};

};

// Production: nessun log
