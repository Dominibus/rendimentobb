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
    liveData.realROI ??
    liveData.roi ??
    0
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

  intent.intent !== "education" &&

  intent.intent !== "subscriptions" &&

  intent.intent !== "market_analysis" &&

  intent.intent !== "investment_strategy" &&

  intent.intent !== "investment_advisor"

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

  // =====================================
  // 🚨 NEGATIVE ROI
  // =====================================

  if(roi <= 0){

    response.signals.push(
      "negative_roi"
    );

    response.textIT =

`🚨 Investimento operativo in perdita.

📉 ROI simulato:
${roi.toFixed(1)}%

⚠️ La struttura attuale non sembra sostenibile.

💡 Costi operativi, occupazione o pricing potrebbero compromettere il cashflow reale.

🏦 Prima di investire è consigliabile rivedere:
• prezzo notte
• occupazione media
• costi fissi
• leva finanziaria`;

    response.textEN =

`🚨 Investment appears operationally unprofitable.

📉 Simulated ROI:
${roi.toFixed(1)}%

⚠️ The current structure may not be financially sustainable.

💡 Operating costs, occupancy or pricing may compromise real cashflow.

🏦 Before investing it is recommended to review:
• nightly pricing
• average occupancy
• fixed costs
• financial leverage`;

  }

  // =====================================
  // ⚠️ LOW ROI
  // =====================================

  else{

    response.textIT =

`⚠️ ROI relativamente basso.

📊 ROI simulato:
${roi.toFixed(1)}%

💡 Potrebbe essere necessario ottimizzare ADR, occupazione o costi operativi.`;

    response.textEN =

`⚠️ ROI appears relatively low.

📊 Simulated ROI:
${roi.toFixed(1)}%

💡 ADR, occupancy or operational cost optimization may be required.`;

  }

}

    }

  }

// ===========================================
// 💰 CASHFLOW RESPONSE
// ===========================================

else if(
  intent.intent === "cashflow_analysis"
){

  response.type =
    "cashflow";

  response.confidence =
    0.95;

  const rawNet =
  liveData.net;

const rawGross =
  liveData.gross;

const net =

  rawNet !== undefined &&
  rawNet !== null &&
  rawNet !== ""

    ? Number(rawNet)

    : Number(rawGross || 0);

// =====================================
// 🔒 FREE LOCK
// =====================================

const access =

  window.getUserAccess?.() ||

  window.RB_USER ||

  {};

if(

  !access.canSeeFullAnalysis &&

  !access.isInvestor &&

  !access.isPro &&

  !access.isAdmin

){

  response.signals.push(
    "cashflow_locked"
  );

  response.textIT =

`🔒 Il cashflow dettagliato è disponibile nei piani Investor e PRO.

💡 Passa a Investor o PRO per sbloccare:
• profitto netto reale
• sostenibilità operativa
• cashflow annuale
• analisi rischio avanzata`;

  response.textEN =

`🔒 Detailed cashflow analysis is available in Investor and PRO plans.

💡 Upgrade to Investor or PRO to unlock:
• real net profit
• operational sustainability
• annual cashflow
• advanced risk analysis`;

}

// =====================================
// 🚨 NEGATIVE CASHFLOW
// =====================================

else if(net <= 0){

  response.signals.push(
    "negative_cashflow"
  );

  response.textIT =

`🚨 Cashflow operativo negativo.

💸 Profitto netto stimato:
€${net.toLocaleString("it-IT")}

⚠️ L'investimento potrebbe generare perdite operative.

💡 È consigliabile ridurre costi o aumentare occupazione e ADR.`;

  response.textEN =

`🚨 Negative operational cashflow detected.

💸 Estimated net profit:
€${net.toLocaleString("en-US")}

⚠️ The investment may generate operational losses.

💡 Reducing costs or increasing occupancy and ADR is recommended.`;

}

else{

  response.signals.push(
    "positive_cashflow"
  );

  response.textIT =

`✅ Cashflow operativo positivo.

💰 Profitto netto stimato:
€${net.toLocaleString("it-IT")}

📈 La simulazione mostra una sostenibilità finanziaria potenzialmente stabile.`;

  response.textEN =

`✅ Positive operational cashflow detected.

💰 Estimated net profit:
€${net.toLocaleString("en-US")}

📈 The simulation shows potentially stable financial sustainability.`;

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

  Number(
    liveData.mortgagePercent ||

    entities.mortgagePercent ||

    0
  );

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

  intent.intent === "investment_strategy" ||

  intent.intent === "investment_advisor"

){

  response.type =
    "strategy";

  response.confidence =
    0.96;

  // =====================================
  // 🇮🇹 ITALIANO
  // =====================================

  const strategyIT = [

    "🧠 Analisi strategica AI completata."

  ];

  if(roi > 0){

    strategyIT.push(
      `📊 ROI: ${roi.toFixed(1)}%`
    );

  }

  if(occupancy > 0){

    strategyIT.push(
      `🏨 Occupazione: ${occupancy}%`
    );

  }

  if(risk > 0){

    strategyIT.push(
      `⚠️ Risk: ${risk}/100`
    );

  }

  strategyIT.push(

    roi >= 10 && risk <= 40

    ? "💡 L'investimento mostra metriche molto competitive."

    : "💡 L'investimento richiede ottimizzazione operativa."

  );

  response.textIT =
    strategyIT.join("\n\n");

  // =====================================
  // 🇬🇧 ENGLISH
  // =====================================

  const strategyEN = [

    "🧠 AI strategic analysis completed."

  ];

  if(roi > 0){

    strategyEN.push(
      `📊 ROI: ${roi.toFixed(1)}%`
    );

  }

  if(occupancy > 0){

    strategyEN.push(
      `🏨 Occupancy: ${occupancy}%`
    );

  }

  if(risk > 0){

    strategyEN.push(
      `⚠️ Risk: ${risk}/100`
    );

  }

  strategyEN.push(

    roi >= 10 && risk <= 40

    ? "💡 The investment shows highly competitive metrics."

    : "💡 The investment requires operational optimization."

  );

  response.textEN =
    strategyEN.join("\n\n");

}
// ===========================================
// 💳 SUBSCRIPTIONS RESPONSE
// ===========================================

else if(
  intent.intent === "subscriptions"
){

  response.type =
    "subscriptions";

  response.confidence =
    0.97;

const q =
  String(message || "")
  .toLowerCase();
  // =====================================
  // 💰 PREZZI
  // =====================================

  if(
    q.includes("costo") ||
    q.includes("prezzo") ||
    q.includes("quanto costa") ||
    q.includes("price")
  ){

    response.textIT =

`🔥 PIANI RENDIMENTOBB

🟢 INVESTOR — €19/mese
• benchmark città
• analisi avanzate
• simulazioni investimento
• metriche short-rent

🚀 PRO — €29/mese
• tutto Investor
• PDF bancario
• AI avanzata
• forecast
• analisi rischio
• mutui
• export completo`;

    response.textEN =

`🔥 RENDIMENTOBB PLANS

🟢 INVESTOR — €19/month
• city benchmarks
• advanced analysis
• investment simulations
• short-rent metrics

🚀 PRO — €29/month
• everything in Investor
• bank-level PDF
• advanced AI
• forecasts
• risk analysis
• mortgages
• full export`;

  }

  // =====================================
  // 🔥 DIFFERENZA PIANI
  // =====================================

  else if(
    q.includes("differenza") ||
    q.includes("investor") ||
    q.includes("pro")
  ){

    response.textIT =

`🚀 DIFFERENZA INVESTOR vs PRO

🟢 INVESTOR (€19)
Ideale per chi vuole:
• simulare investimenti
• confrontare città
• analizzare ROI e cashflow

🚀 PRO (€29)
Include tutto Investor +
• PDF professionale bancario
• AI avanzata
• forecast investimento
• analisi rischio completa
• simulazioni mutuo
• export avanzati

💡 PRO è pensato per investitori e professionisti short-rent.`;

    response.textEN =

`🚀 INVESTOR vs PRO

🟢 INVESTOR (€19)
Perfect for:
• investment simulations
• city comparisons
• ROI and cashflow analysis

🚀 PRO (€29)
Includes everything in Investor +
• professional bank-level PDF
• advanced AI
• investment forecasts
• full risk analysis
• mortgage simulations
• advanced exports

💡 PRO is designed for investors and short-rent professionals.`;

  }

  // =====================================
  // ❌ DISDETTA
  // =====================================

  else if(
    q.includes("disdire") ||
    q.includes("annullare") ||
    q.includes("cancellare") ||
    q.includes("cancel")
  ){

    response.textIT =

`❌ Puoi annullare il tuo abbonamento in qualsiasi momento.

L’accesso rimarrà attivo fino alla fine del periodo già pagato.

Per gestire il piano:
• accedi al tuo account
• apri area abbonamento
• seleziona gestione piano`;

    response.textEN =

`❌ You can cancel your subscription anytime.

Your access will remain active until the end of the paid period.

To manage your plan:
• log into your account
• open subscription area
• select manage plan`;

  }

  // =====================================
  // 📌 DEFAULT
  // =====================================

  else{

    response.textIT =

`💳 Posso aiutarti con:

• prezzi piani
• differenza Investor/PRO
• gestione abbonamento
• funzionalità disponibili`;

    response.textEN =

`💳 I can help you with:

• plan pricing
• Investor vs PRO
• subscription management
• available features`;

  }

}

  // ===========================================
// 🧠 EXECUTIVE AI RESPONSE
// ===========================================

else if(

  intent.intent === "investment_executive" ||

  intent.intent === "executive_analysis"

){

  response.type =
    "executive";

  response.confidence =
    0.99;

  const rawNet =
  liveData.net;

const rawGross =
  liveData.gross;

const net =

  rawNet !== undefined &&
  rawNet !== null &&
  rawNet !== ""

    ? Number(rawNet)

    : Number(rawGross || 0);

const gross =
  Number(rawGross || 0);

  const executiveIT = [];

  executiveIT.push(
    "🧠 Analisi executive completata."
  );

  executiveIT.push(
    `📈 ROI reale: ${roi.toFixed(1)}%`
  );

  executiveIT.push(
    `⚠️ Risk score: ${risk}/100`
  );

  if(net > 0){

    executiveIT.push(
      `💰 Profitto netto stimato: €${net.toLocaleString("it-IT")}`
    );

  }

  if(gross > 0){

    executiveIT.push(
      `🏨 Ricavi annuali: €${gross.toLocaleString("it-IT")}`
    );

  }

  executiveIT.push(
    `🌍 Mercato analizzato: ${cityLabel}`
  );

  // =====================================
  // 🔥 AI CONCLUSION
  // =====================================

  if(
    roi >= 25 &&
    risk <= 35
  ){

    executiveIT.push(
      "🚀 L'investimento appare altamente competitivo rispetto alla media short-rent."
    );

  }

  else if(
    roi >= 10
  ){

    executiveIT.push(
      "📊 L'investimento mostra una sostenibilità moderata con margini di ottimizzazione."
    );

  }

  else{

    executiveIT.push(
      "⚠️ L'investimento mostra criticità operative e marginalità limitata."
    );

  }

  executiveIT.push(
    "💡 Occupazione, pricing dinamico e gestione costi influenzano fortemente il ROI reale."
  );

  response.textIT =
    executiveIT.join("\n\n");

  // =====================================
  // 🇬🇧 ENGLISH
  // =====================================

  const executiveEN = [];

  executiveEN.push(
    "🧠 Executive analysis completed."
  );

  executiveEN.push(
    `📈 Real ROI: ${roi.toFixed(1)}%`
  );

  executiveEN.push(
    `⚠️ Risk score: ${risk}/100`
  );

  if(net > 0){

    executiveEN.push(
      `💰 Estimated net profit: €${net.toLocaleString("en-US")}`
    );

  }

  if(gross > 0){

    executiveEN.push(
      `🏨 Annual revenue: €${gross.toLocaleString("en-US")}`
    );

  }

  executiveEN.push(
    `🌍 Market analyzed: ${cityLabel}`
  );

  if(
    roi >= 25 &&
    risk <= 35
  ){

    executiveEN.push(
      "🚀 The investment appears highly competitive compared to short-rent averages."
    );

  }

  else if(
    roi >= 10
  ){

    executiveEN.push(
      "📊 The investment shows moderate sustainability with optimization potential."
    );

  }

  else{

    executiveEN.push(
      "⚠️ The investment shows operational weaknesses and limited profitability."
    );

  }

  executiveEN.push(
    "💡 Occupancy, dynamic pricing and operational costs strongly affect real ROI."
  );

  response.textEN =
    executiveEN.join("\n\n");

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
// 🎓 ENTITY KNOWLEDGE ROUTING
// ===========================================

const knowledge =

  entities.knowledgeData ||

  window.rbKnowledgeBase?.[
    entities.knowledge
  ] ||

  null;
// ===========================================
// 📚 KNOWLEDGE / EDUCATION ROUTING
// ===========================================

if(knowledge){

  response.textIT =

    knowledge?.text?.it ||

    knowledge?.textIT ||

    `${knowledge?.aiSummaryIT || ""}

${knowledge?.aiInsightIT || ""}` ||

    "⚠️ Nessuna spiegazione disponibile.";

  response.textEN =

    knowledge?.text?.en ||

    knowledge?.textEN ||

    `${knowledge?.aiSummaryEN || ""}

${knowledge?.aiInsightEN || ""}` ||

    "⚠️ No explanation available.";

}

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
