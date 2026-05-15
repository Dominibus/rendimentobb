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

console.log(
  "🧠 ADVISOR ENGINE READY"
);
