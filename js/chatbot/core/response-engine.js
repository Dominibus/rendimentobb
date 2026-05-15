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

const liveData = {

  ...(window.lastAnalysisData || {}),
  ...(window.rbInvestmentMemory || {}),
  ...(analysisData || {})

};

const roi =
  Number(
    liveData.roi || 0
  );

const risk =
  Number(
    liveData.risk || 0
  );

const occupancy =
  Number(
    liveData.occupancy || 0
  );

  const city =
    entities.city ||

    memory.city ||

    window.currentCity ||

    "roma";

  const cityLabel =

  window.rbCapitalize?.(city) ||

  city;

  // ===========================================
  // 🌍 MARKET DATA
  // ===========================================

  const market =

    window.rbMarketData?.[city] ||

    null;

// ===========================================
// 🚫 NO ANALYSIS SAFETY
// ===========================================

const hasAnalysis =

  roi > 0 ||

  risk > 0 ||

  occupancy > 0;

if(

  !hasAnalysis &&

  intent.intent !== "education"

){

  return {

    type: "empty",

    confidence: 1,

    textIT:
      "📊 Esegui prima una simulazione completa così posso analizzare ROI, rischio e sostenibilità.",

    textEN:
      "📊 Run a full simulation first so I can analyze ROI, risk and sustainability.",

    suggestionsIT: [
      "Simulare investimento"
    ],

    suggestionsEN: [
      "Run investment simulation"
    ],

    signals: [],

    metadata: {}

  };

}

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
${cityLabel}

💡 La simulazione appare superiore alla media short-rent.`;

      response.textEN =

`🚀 Very high ROI detected.

📈 Current ROI:
${roi.toFixed(1)}%

🌍 Market:
${cityLabel}

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

`🌍 Analisi mercato ${cityLabel}

📈 ROI medio:
${market.avgROI}

🏨 Occupazione:
${market.occupancy}

⚠️ Rischio:
${market.risk}`;

      response.textEN =

`🌍 ${cityLabel} market analysis

📈 Average ROI:
${market.avgROI}

🏨 Occupancy:
${market.occupancy}

⚠️ Risk:
${market.risk}`;

    }

    else{

  response.textIT =
    "⚠️ Nessun benchmark disponibile per questa città.";

  response.textEN =
    "⚠️ No benchmark available for this city.";

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

  response.type = "education";

  response.confidence = 0.95;

  const msg =
    String(message).toLowerCase();

  // ===========================================
  // 📈 ROI
  // ===========================================

  if(msg.includes("roi")){

    response.textIT =

`📈 ROI significa Return On Investment.

Misura quanto un investimento genera profitto rispetto al capitale investito.

Formula:

ROI = profitto netto / investimento totale × 100

Esempio:

• Investimento:
€200.000

• Profitto annuo:
€24.000

📊 ROI:
12%

💡 Un ROI più elevato può indicare maggiore redditività, ma anche maggiore rischio operativo.`;

    response.textEN =

`📈 ROI means Return On Investment.

It measures how profitable an investment is compared to the invested capital.

Formula:

ROI = net profit / total investment × 100

Example:

• Investment:
€200,000

• Annual profit:
€24,000

📊 ROI:
12%

💡 Higher ROI may indicate higher profitability but also higher operational risk.`;

  }

  // ===========================================
  // 💸 CASHFLOW
  // ===========================================

  else if(

    msg.includes("cashflow") ||

    msg.includes("cash flow")

  ){

    response.textIT =

`💸 Il cashflow rappresenta il flusso di denaro reale generato dall'investimento.

Formula semplificata:

Entrate - uscite = cashflow

Include:

• affitti
• mutuo
• tasse
• utenze
• manutenzione
• gestione

💡 Un ROI alto senza cashflow positivo può diventare pericoloso nel lungo periodo.`;

    response.textEN =

`💸 Cashflow represents the real money flow generated by the investment.

Simple formula:

Income - expenses = cashflow

Includes:

• rents
• mortgage
• taxes
• utilities
• maintenance
• management

💡 High ROI without positive cashflow may become dangerous long-term.`;

  }

  // ===========================================
  // ⚠️ RISK
  // ===========================================

  else if(

    msg.includes("risk") ||

    msg.includes("rischio")

  ){

    response.textIT =

`⚠️ Il risk score misura la sostenibilità operativa dell'investimento.

Tiene conto di:

• leva finanziaria
• occupazione
• cashflow
• costi
• mercato
• volatilità

📊 Più il punteggio è alto, maggiore è il rischio operativo.`;

    response.textEN =

`⚠️ The risk score measures operational sustainability.

It considers:

• leverage
• occupancy
• cashflow
• costs
• market
• volatility

📊 Higher scores indicate higher operational risk.`;

  }

  // ===========================================
  // 🏦 DSCR
  // ===========================================

  else if(

    msg.includes("dscr")

  ){

    response.textIT =

`🏦 DSCR significa Debt Service Coverage Ratio.

Misura la capacità dell'investimento di coprire il mutuo.

Formula:

DSCR = reddito operativo / rata debito

📊 Un DSCR sopra 1.2 è generalmente considerato sostenibile.`;

    response.textEN =

`🏦 DSCR means Debt Service Coverage Ratio.

It measures the investment ability to cover debt payments.

Formula:

DSCR = operating income / debt payment

📊 A DSCR above 1.2 is usually considered sustainable.`;

  }

  // ===========================================
  // 🌍 DEFAULT EDUCATION
  // ===========================================

  else{

    response.textIT =

`🎓 Posso spiegarti:

• ROI
• cashflow
• rischio
• DSCR
• occupazione
• sostenibilità
• mutui`;

    response.textEN =

`🎓 I can explain:

• ROI
• cashflow
• risk
• DSCR
• occupancy
• sustainability
• mortgages`;

  }

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
    "Analizzare cashflow reale",
    "Confrontare benchmark città",
    "Simulare mutuo"
  );

  response.suggestionsEN.push(
    "Analyze real cashflow",
    "Compare city benchmark",
    "Simulate mortgage"
  );

}

if(response.type === "risk"){

  response.suggestionsIT.push(
    "Analizzare sostenibilità mutuo",
    "Ridurre rischio operativo",
    "Confrontare scenario città"
  );

  response.suggestionsEN.push(
    "Analyze mortgage sustainability",
    "Reduce operational risk",
    "Compare city scenario"
  );

}

// ===========================================
// 🧠 AI SIGNALS
// ===========================================

response.signals = [

  ...response.signals,

  ...(window.rbGenerateAISignals?.({

    roi,
    risk,
    occupancy

  }) || [])

];

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
