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
    score,
    verdict,
    confidence,
    roi,
    risk,
    occupancy,
    cashflow
  }
);

return {

  verdict,

  score,

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

console.log(
  "🧠 ADVISOR ENGINE READY"
);
