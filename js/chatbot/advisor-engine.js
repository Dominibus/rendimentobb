// ===============================================
// 🧠 RENDIMENTOBB – ADVISOR ENGINE 1.0
// Predictive Investment Coaching Layer
// ===============================================

// ===============================================
// 🧠 ADVISOR ENGINE
// ===============================================

window.rbGenerateAdvisorInsights =
function(data = {}){

  const insights = [];

  const roi =
    Number(data.roi || 0);

  const risk =
    Number(
      data.risk ||
      data.riskScore ||
      0
    );

  const occupancy =
    Number(
      data.occupancy ||
      data.occupancyRate ||
      0
    );

  const nightly =
    Number(
      data.pricePerNight ||
      data.nightPrice ||
      0
    );

  const monthlyCosts =
    Number(
      data.monthlyCosts ||
      data.monthlyExpenses ||
      0
    );

  const mortgage =
    Number(
      data.mortgagePercent ||
      0
    );

  // ===========================================
  // 🚀 HIGH ROI
  // ===========================================

  if(roi >= 12){

    insights.push({

      type: "high_roi",

      it:
`🚀 Il ROI appare molto competitivo rispetto al mercato short-rent italiano.`,

      en:
`🚀 ROI appears highly competitive compared to the Italian short-rent market.`

    });

  }

  // ===========================================
  // ⚠️ LOW ROI
  // ===========================================

  if(roi <= 5){

    insights.push({

      type: "low_roi",

      it:
`⚠️ Il ROI sembra troppo basso per compensare rischio e costi operativi.`,

      en:
`⚠️ ROI appears too low to compensate operational risks and costs.`

    });

  }

  // ===========================================
  // 🏨 OCCUPANCY
  // ===========================================

  if(occupancy <= 55){

    insights.push({

      type: "low_occupancy",

      it:
`🏨 L'occupazione sembra debole. Potrebbe essere necessario migliorare visibilità e pricing.`,

      en:
`🏨 Occupancy appears weak. Visibility and pricing optimization may be required.`

    });

  }

  if(occupancy >= 75){

    insights.push({

      type: "high_occupancy",

      it:
`🔥 Occupazione molto forte rispetto ai benchmark standard.`,

      en:
`🔥 Occupancy is very strong compared to standard benchmarks.`

    });

  }

  // ===========================================
  // 💸 HIGH COSTS
  // ===========================================

  if(monthlyCosts >= 1500){

    insights.push({

      type: "high_costs",

      it:
`💸 I costi operativi potrebbero comprimere il cashflow reale.`,

      en:
`💸 Operating costs may compress real cashflow.`

    });

  }

  // ===========================================
  // 🏦 MORTGAGE
  // ===========================================

  if(mortgage >= 80){

    insights.push({

      type: "high_mortgage",

      it:
`🏦 Una leva finanziaria elevata aumenta l'esposizione al rischio.`,

      en:
`🏦 High leverage increases investment exposure to risk.`

    });

  }

  // ===========================================
  // 💎 PREMIUM PRICING
  // ===========================================

  if(nightly >= 180){

    insights.push({

      type: "premium_pricing",

      it:
`💎 Il prezzo notte è in fascia premium.`,

      en:
`💎 Nightly pricing is in premium range.`

    });

  }

  return insights;

};

// ===============================================
// 🧠 ADVISOR RECOMMENDATIONS
// ===============================================

window.rbGenerateAdvisorRecommendations =
function(data = {}){

  const recommendations = [];

  const roi =
    Number(data.roi || 0);

  const risk =
    Number(
      data.risk ||
      data.riskScore ||
      0
    );

  const occupancy =
    Number(
      data.occupancy ||
      data.occupancyRate ||
      0
    );

  const monthlyCosts =
    Number(
      data.monthlyCosts ||
      data.monthlyExpenses ||
      0
    );

  // ===========================================
  // ROI
  // ===========================================

  if(roi <= 7){

    recommendations.push({

      it:
`📈 Valuta aumento ADR o ottimizzazione occupazione.`,

      en:
`📈 Consider improving ADR or occupancy optimization.`

    });

  }

  // ===========================================
  // OCCUPANCY
  // ===========================================

  if(occupancy <= 60){

    recommendations.push({

      it:
`🏨 Migliora listing Airbnb, recensioni e pricing dinamico.`,

      en:
`🏨 Improve Airbnb listing, reviews and dynamic pricing.`

    });

  }

  // ===========================================
  // COSTS
  // ===========================================

  if(monthlyCosts >= 1500){

    recommendations.push({

      it:
`💸 Riduci cleaning, utenze e automatizza il check-in.`,

      en:
`💸 Reduce cleaning, utilities and automate check-in.`

    });

  }

  // ===========================================
  // RISK
  // ===========================================

  if(risk >= 70){

    recommendations.push({

      it:
`⚠️ Valuta una struttura finanziaria più conservativa.`,

      en:
`⚠️ Consider a more conservative financial structure.`

    });

  }

  return recommendations;

};

// ===============================================
// 🧠 FINAL ADVISOR RESPONSE
// ===============================================

window.rbGenerateAdvisorResponse =
function(data = {}){

  const insights =
    window.rbGenerateAdvisorInsights(data);

  const recommendations =
    window.rbGenerateAdvisorRecommendations(data);

  if(
    !insights.length &&
    !recommendations.length
  ){

    return null;

  }

  const lang =
    window.currentLang || "it";

  const final = [];

  // ===========================================
  // INSIGHTS
  // ===========================================

  insights.forEach(item=>{

    final.push(
      lang === "en"
      ? item.en
      : item.it
    );

  });

  // ===========================================
  // RECOMMENDATIONS
  // ===========================================

  if(recommendations.length){

    final.push(

      lang === "en"

      ? "💡 AI Recommendations:"

      : "💡 Suggerimenti AI:"
    );

    recommendations.forEach(item=>{

      final.push(

        "• " +

        (
          lang === "en"
          ? item.en
          : item.it
        )

      );

    });

  }

  return final.join("\n\n");

};

// ===============================================
// 🧠 DECISION ENGINE
// Single Source of Truth
// Silicon Valley Architecture 2026
// ===============================================

window.rbEvaluateInvestment = function(data = {}){

  const roi =
    Number(data.roi || 0);

  const risk =
    Number(
      data.risk ||
      data.riskScore ||
      0
    );

  const occupancy =
    Number(
      data.occupancy ||
      data.occupancyRate ||
      0
    );

  const cashflow =
    Number(
      data.cashflow ??
      data.net ??
      data.annualProfit ??
      0
    );

  const mortgage =
    Number(
      data.mortgagePercent ||
      0
    );

  const revenue =
    Number(
      data.revenueAnnual ??
      data.gross ??
      0
    );

  const expenses =
    Number(
      data.expenses ??
      data.monthlyCosts ??
      0
    );

  const decision = {

    verdict: "WAIT",

    grade: "C",

    confidence: 50,

    profitability: 0,

    sustainability: 0,

    operationalRisk: 0,

    strengths: [],

    weaknesses: [],

    recommendations: []

  };

    // ===========================================
  // 📈 PROFITABILITY SCORE
  // ===========================================

  if(roi >= 25){

    decision.profitability = 100;

    decision.strengths.push(
      window.t(
        "ROI eccezionale.",
        "Outstanding ROI."
      )
    );

  }
  else if(roi >= 20){

    decision.profitability = 90;

    decision.strengths.push(
      window.t(
        "ROI molto competitivo.",
        "Highly competitive ROI."
      )
    );

  }
  else if(roi >= 15){

    decision.profitability = 75;

    decision.strengths.push(
      window.t(
        "ROI superiore alla media.",
        "Above-average ROI."
      )
    );

  }
  else if(roi >= 10){

    decision.profitability = 60;

  }
  else if(roi > 0){

    decision.profitability = 40;

    decision.weaknesses.push(
      window.t(
        "ROI migliorabile.",
        "ROI should be improved."
      )
    );

  }
  else{

    decision.profitability = 0;

    decision.weaknesses.push(
      window.t(
        "ROI negativo.",
        "Negative ROI."
      )
    );

  }

  // ===========================================
  // ⚠️ OPERATIONAL RISK SCORE
  // ===========================================

  if(risk <= 20){

    decision.operationalRisk = 100;

    decision.strengths.push(
      window.t(
        "Profilo di rischio molto basso.",
        "Very low risk profile."
      )
    );

  }
  else if(risk <= 35){

    decision.operationalRisk = 85;

  }
  else if(risk <= 50){

    decision.operationalRisk = 70;

  }
  else if(risk <= 70){

    decision.operationalRisk = 45;

    decision.weaknesses.push(
      window.t(
        "Rischio operativo da monitorare.",
        "Operational risk should be monitored."
      )
    );

  }
  else{

    decision.operationalRisk = 20;

    decision.weaknesses.push(
      window.t(
        "Rischio operativo elevato.",
        "High operational risk."
      )
    );

  }

  // ===========================================
  // 💰 SUSTAINABILITY SCORE
  // ===========================================

  if(cashflow > 0){

    decision.sustainability += 40;

    decision.strengths.push(
      window.t(
        "Cashflow positivo.",
        "Positive cashflow."
      )
    );

  }
  else{

    decision.weaknesses.push(
      window.t(
        "Cashflow negativo.",
        "Negative cashflow."
      )
    );

  }

  if(occupancy >= 70){

    decision.sustainability += 30;

  }
  else if(occupancy < 50){

    decision.weaknesses.push(
      window.t(
        "Occupazione insufficiente.",
        "Low occupancy."
      )
    );

  }

  if(
    revenue > 0 &&
    expenses < revenue * 0.50
  ){

    decision.sustainability += 30;

  }
  else if(revenue > 0){

    decision.weaknesses.push(
      window.t(
        "Costi operativi elevati.",
        "High operating costs."
      )
    );

  }

    // ===========================================
  // 🧮 GLOBAL EXECUTIVE SCORE
  // ===========================================

  const globalScore = Math.round(

    (
      decision.profitability +
      decision.operationalRisk +
      decision.sustainability

    ) / 3

  );

  decision.confidence = globalScore;

  // ===========================================
  // 🏆 INVESTMENT GRADE
  // ===========================================

  if(globalScore >= 95){

    decision.grade = "A+";

  }
  else if(globalScore >= 90){

    decision.grade = "A";

  }
  else if(globalScore >= 80){

    decision.grade = "B+";

  }
  else if(globalScore >= 70){

    decision.grade = "B";

  }
  else if(globalScore >= 60){

    decision.grade = "C+";

  }
  else if(globalScore >= 50){

    decision.grade = "C";

  }
  else if(globalScore >= 40){

    decision.grade = "D";

  }
  else{

    decision.grade = "E";

  }

  // ===========================================
  // 🎯 EXECUTIVE VERDICT
  // ===========================================

  if(

    roi >= 18 &&

    risk <= 35 &&

    cashflow > 0 &&

    occupancy >= 65

  ){

    decision.verdict = "BUY";

  }

  else if(

    roi >= 12 &&

    cashflow > 0

  ){

    decision.verdict = "OPTIMIZE";

  }

  else{

    decision.verdict = "WAIT";

  }

  // ===========================================
  // 🔥 EXECUTIVE PRIORITY
  // ===========================================

  if(cashflow <= 0){

    decision.recommendations.push(

      window.t(

        "Priorità assoluta: riportare il cashflow in positivo.",

        "Top priority: restore positive cashflow."

      )

    );

  }

  if(mortgage >= 80){

    decision.recommendations.push(

      window.t(

        "Ridurre la leva finanziaria migliorerà la resilienza.",

        "Reducing leverage will improve resilience."

      )

    );

  }

  if(occupancy < 60){

    decision.recommendations.push(

      window.t(

        "Incrementare il tasso di occupazione.",

        "Increase occupancy rate."

      )

    );

  }

  if(

    revenue > 0 &&

    expenses >= revenue * 0.50

  ){

    decision.recommendations.push(

      window.t(

        "Ridurre i costi operativi.",

        "Reduce operating costs."

      )

    );

  }

    // ===========================================
  // 📊 EXECUTIVE METADATA
  // ===========================================

  decision.summary = {

    score: globalScore,

    roi,

    risk,

    occupancy,

    cashflow,

    mortgage,

    revenue,

    expenses

  };

  // ===========================================
  // 🧠 DEBUG
  // ===========================================

  console.log(
    "🧠 DECISION ENGINE:",
    decision
  );

  // ===========================================
  // ✅ RETURN
  // ===========================================

  return decision;

};

console.log(
  "🧠 ADVISOR ENGINE READY"
);
