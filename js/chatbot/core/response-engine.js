// ===============================================
// 🧠 RENDIMENTOBB – RESPONSE ENGINE 1.0
// Silicon Valley AI Orchestrator
// ===============================================

// ===============================================
// 🧠 MAIN RESPONSE ENGINE
// ===============================================

window.rbGenerateResponse = function({

  message = "",

  entities = {},

  intent = {},

  memory = {},

  analysisData = {}

} = {}){

  // ===========================================
  // 🧠 RESPONSE OBJECT
  // ===========================================

  const response = {

    type: "generic",

    confidence: 0.5,

    textIT: "",

    textEN: "",

    suggestionsIT: [],

    suggestionsEN: [],

    signals: [],

    metadata: {}

  };

  // ===========================================
  // 📊 SAFE DATA
  // ===========================================

  const roi =
    Number(
      analysisData.roi || 0
    );

  const risk =
    Number(
      analysisData.risk || 0
    );

  const occupancy =
    Number(
      analysisData.occupancy || 0
    );

  const city =
    entities.city ||

    memory.lastCity ||

    window.currentCity ||

    "roma";

  // ===========================================
  // 🌍 MARKET DATA
  // ===========================================

  const market =

    window.rbMarketData?.[city] ||

    null;

  // ===========================================
  // 📈 ROI RESPONSE
  // ===========================================

  if(
    intent.intent === "roi_analysis"
  ){

    response.type =
      "roi";

    response.confidence =
      0.95;

    if(roi >= 15){

      response.signals.push(
        "high_roi"
      );

      response.textIT =

`🚀 ROI molto elevato.

📈 ROI attuale:
${roi.toFixed(1)}%

🌍 Mercato:
${city}

💡 La simulazione appare superiore alla media short-rent.`;

      response.textEN =

`🚀 Very high ROI detected.

📈 Current ROI:
${roi.toFixed(1)}%

🌍 Market:
${city}

💡 The simulation appears above short-rent market averages.`;

    }

    else if(roi >= 8){

      response.signals.push(
        "medium_roi"
      );

      response.textIT =

`📈 ROI potenzialmente sostenibile.

📊 ROI simulato:
${roi.toFixed(1)}%

💡 L'investimento sembra equilibrato ma dipende da occupazione e costi.`;

      response.textEN =

`📈 ROI appears potentially sustainable.

📊 Simulated ROI:
${roi.toFixed(1)}%

💡 The investment appears balanced but depends on occupancy and costs.`;

    }

    else{

      response.signals.push(
        "low_roi"
      );

      response.textIT =

`⚠️ ROI relativamente basso.

📊 ROI simulato:
${roi.toFixed(1)}%

💡 Potrebbe essere necessario ottimizzare ADR o occupazione.`;

      response.textEN =

`⚠️ ROI appears relatively low.

📊 Simulated ROI:
${roi.toFixed(1)}%

💡 ADR or occupancy optimization may be required.`;

    }

  }

  // ===========================================
  // ⚠️ RISK RESPONSE
  // ===========================================

  else if(
    intent.intent === "risk_analysis"
  ){

    response.type =
      "risk";

    response.confidence =
      0.94;

    if(risk >= 70){

      response.signals.push(
        "high_risk"
      );

      response.textIT =

`🚨 Rischio operativo elevato.

📊 Risk score:
${risk}/100

⚠️ Cashflow e sostenibilità potrebbero diventare instabili nel lungo periodo.`;

      response.textEN =

`🚨 High operational risk detected.

📊 Risk score:
${risk}/100

⚠️ Cashflow and sustainability may become unstable long-term.`;

    }

    else if(risk >= 40){

      response.signals.push(
        "medium_risk"
      );

      response.textIT =

`⚠️ Rischio moderato.

📊 Risk score:
${risk}/100

💡 L'investimento sembra sostenibile ma richiede monitoraggio operativo.`;

      response.textEN =

`⚠️ Moderate risk detected.

📊 Risk score:
${risk}/100

💡 The investment appears sustainable but requires operational monitoring.`;

    }

    else{

      response.signals.push(
        "low_risk"
      );

      response.textIT =

`✅ Rischio relativamente basso.

📊 Risk score:
${risk}/100

💡 La struttura finanziaria sembra stabile.`;

      response.textEN =

`✅ Risk appears relatively low.

📊 Risk score:
${risk}/100

💡 Financial structure appears stable.`;

    }

  }

  // ===========================================
  // 🏦 MORTGAGE RESPONSE
  // ===========================================

  else if(
    intent.intent === "mortgage_analysis"
  ){

    response.type =
      "mortgage";

    response.confidence =
      0.93;

    const mortgagePercent =

      entities.mortgagePercent ||

      0;

    if(mortgagePercent >= 90){

      response.textIT =

`⚠️ Leva finanziaria molto aggressiva.

🏦 Mutuo:
${mortgagePercent}%

💡 Una leva elevata aumenta sensibilmente il rischio operativo.`;

      response.textEN =

`⚠️ Highly aggressive leverage detected.

🏦 Mortgage:
${mortgagePercent}%

💡 High leverage significantly increases operational risk.`;

    }

    else{

      response.textIT =

`🏦 Struttura mutuo analizzata.

📊 Leverage:
${mortgagePercent}%

💡 Il finanziamento sembra relativamente sostenibile.`;

      response.textEN =

`🏦 Mortgage structure analyzed.

📊 Leverage:
${mortgagePercent}%

💡 Financing appears relatively sustainable.`;

    }

  }

  // ===========================================
  // 🌍 MARKET RESPONSE
  // ===========================================

  else if(
    intent.intent === "market_analysis"
  ){

    response.type =
      "market";

    response.confidence =
      0.91;

    if(market){

      response.textIT =

`🌍 Analisi mercato ${city}

📈 ROI medio:
${market.avgROI}

🏨 Occupazione:
${market.occupancy}

⚠️ Rischio:
${market.risk}`;

      response.textEN =

`🌍 ${city} market analysis

📈 Average ROI:
${market.avgROI}

🏨 Occupancy:
${market.occupancy}

⚠️ Risk:
${market.risk}`;

    }

  }

  // ===========================================
  // 💡 STRATEGY RESPONSE
  // ===========================================

  else if(
    intent.intent ===
    "investment_strategy"
  ){

    response.type =
      "strategy";

    response.confidence =
      0.96;

    response.textIT =

`🧠 Analisi strategica AI completata.

📊 ROI:
${roi.toFixed(1)}%

🏨 Occupazione:
${occupancy}%

⚠️ Risk:
${risk}/100

💡 L'investimento ${
  roi >= 10 && risk <= 40

  ? "mostra metriche molto competitive."

  : "richiede ottimizzazione operativa."
}`;

    response.textEN =

`🧠 AI strategic analysis completed.

📊 ROI:
${roi.toFixed(1)}%

🏨 Occupancy:
${occupancy}%

⚠️ Risk:
${risk}/100

💡 The investment ${
  roi >= 10 && risk <= 40

  ? "shows highly competitive metrics."

  : "requires operational optimization."
}`;

  }

  // ===========================================
  // 🎓 EDUCATIONAL RESPONSE
  // ===========================================

  else if(
    intent.intent === "education"
  ){

    response.type =
      "education";

    response.confidence =
      0.88;

    response.textIT =

`🎓 Posso aiutarti a comprendere:

• ROI
• cashflow
• rischio
• mutui
• sostenibilità
• benchmark short-rent`;

    response.textEN =

`🎓 I can help explain:

• ROI
• cashflow
• risk
• mortgages
• sustainability
• short-rent benchmarks`;

  }

  // ===========================================
  // 🤖 DEFAULT RESPONSE
  // ===========================================

  else{

    response.textIT =

`🤖 Posso aiutarti ad analizzare:

• ROI
• cashflow
• rischio
• sostenibilità
• mutui
• benchmark short-rent`;

    response.textEN =

`🤖 I can help analyze:

• ROI
• cashflow
• risk
• sustainability
• mortgages
• short-rent benchmarks`;

  }

  // ===========================================
  // 💡 FOLLOWUP SUGGESTIONS
  // ===========================================

  if(response.type === "roi"){

    response.suggestionsIT.push(
      "Analizzare cashflow reale"
    );

    response.suggestionsEN.push(
      "Analyze real cashflow"
    );

  }

  if(response.type === "risk"){

    response.suggestionsIT.push(
      "Analizzare sostenibilità mutuo"
    );

    response.suggestionsEN.push(
      "Analyze mortgage sustainability"
    );

  }

  // ===========================================
  // 🧠 DEBUG
  // ===========================================

  console.log(
    "🧠 RESPONSE ENGINE:",
    response
  );

  return response;

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 RESPONSE ENGINE READY"
);
