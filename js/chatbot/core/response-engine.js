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

  analysisData = {},

  aiSignals = []

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

  ...(analysisData || {}),

  ...(window.rbInvestmentMemory || {}),

  ...(window.lastAnalysisData || {}),

  ...(window.rbChatbotLive || {}),

  ...(window.rbChatbotData || {})

};

  const uiNetProfit =

  Number(

    document.getElementById("profit-annual")
      ?.textContent

      ?.replace(/[^\d,-]/g, "")
      ?.replace(/\./g, "")
      ?.replace(",", ".")

  ) || 0;

const roi =
  Number(

    liveData.realROI ??

    liveData.roi ??

    window.rbChatbotLive?.roi ??

    window.rbChatbotData?.roi ??

    0

  );

const risk =
  Number(

    liveData.risk ??

    window.rbChatbotLive?.risk ??

    window.rbChatbotData?.risk ??

    0

  );

const occupancy =
  Number(

    liveData.occupancy ??

    window.rbChatbotLive?.occupancy ??

    window.rbChatbotData?.occupancy ??

    0

  );

console.log(
  "🧠 LIVE RESPONSE DATA:",
  {
    roi,
    risk,
    occupancy,
    liveData,
    chatbotLive: window.rbChatbotLive,
    chatbotData: window.rbChatbotData
  }
);

  // ===========================================
// 🌍 SAFE MARKET CONTEXT
// ===========================================

const allowMarketContext =

[
  "market_analysis",
  "investment_executive",
  "investment_advisor",
  "investment_strategy",
  "comparison",
  "roi_analysis",
  "risk_analysis",
  "cashflow_analysis",
  "mortgage_analysis"
].includes(intent.intent);

const city =

allowMarketContext

? (

    entities.city ||

    memory.city ||

    window.currentCity ||

    "roma"

  )

: null;

const cityLabel =

city

? (
    window.rbCapitalize?.(city) ||
    city
  )

: "";


// ===========================================
// 🧠 MEMORY CONTEXT
// ===========================================

const rememberedBudget =

  entities.amount ||

  entities.price ||

  memory.lastBudget ||

  memory.lastPropertyPrice ||

  0;

const rememberedCity =

  entities.city ||

  memory.lastCity ||

  city ||

  null;

const rememberedMortgage =

  entities.mortgagePercent ||

  memory.lastMortgagePercent ||

  mortgagePercent ||

  0;

console.log(
  "🧠 MEMORY CONTEXT:",
  {
    rememberedBudget,
    rememberedCity,
    rememberedMortgage
  }
);  
// ===========================================
// 🧠 AI INSIGHTS
// ===========================================

const executiveInsightsIT = [];

const executiveInsightsEN = [];

// ===========================================
// 🧠 EXECUTIVE REASONING ENGINE
// ===========================================

const reasoningIT = [];

const reasoningEN = [];

// =====================================
// 🚀 HIGH PERFORMANCE
// =====================================

if(
  roi >= 20 &&
  occupancy >= 65 &&
  risk <= 40
){

  reasoningIT.push(
    "🚀 Il motore AI considera la simulazione altamente competitiva rispetto ai benchmark short-rent."
  );

  reasoningEN.push(
    "🚀 The AI engine considers this simulation highly competitive compared to short-rent benchmarks."
  );

}

// =====================================
// ⚠️ HIGH ROI + HIGH RISK
// =====================================

if(
  roi >= 20 &&
  risk >= 70
){

  reasoningIT.push(
    "⚠️ Il ROI elevato è accompagnato da una struttura operativa aggressiva."
  );

  reasoningEN.push(
    "⚠️ High ROI is combined with an aggressive operational structure."
  );

}

// =====================================
// ⚠️ LOW OCCUPANCY
// =====================================

if(
  occupancy > 0 &&
  occupancy < 45
){

  reasoningIT.push(
    "⚠️ L'occupazione attuale potrebbe compromettere cashflow e sostenibilità."
  );

  reasoningEN.push(
    "⚠️ Current occupancy may compromise cashflow and sustainability."
  );

}

// =====================================
// 💸 NEGATIVE CASHFLOW SIGNAL
// =====================================

if(aiSignals.includes("negative_cashflow")){

  reasoningIT.push(
    "💸 Il cashflow operativo mostra segnali di instabilità."
  );

  reasoningEN.push(
    "💸 Operational cashflow shows instability signals."
  );

}

// =====================================
// 🏦 HIGH LEVERAGE
// =====================================

const mortgagePercent = Number(
  liveData.mortgagePercent ||
  entities.mortgagePercent ||
  0
);

if(mortgagePercent >= 80){

  reasoningIT.push(
    "🏦 La leva finanziaria elevata aumenta la vulnerabilità ai cambiamenti di mercato."
  );

  reasoningEN.push(
    "🏦 High financial leverage increases vulnerability to market fluctuations."
  );

}

// 🚀 HIGH ROI
if(aiSignals.includes("very_high_roi")){

  executiveInsightsIT.push(
    "🚀 ROI molto elevato rispetto ai benchmark short-rent."
  );

  executiveInsightsEN.push(
    "🚀 ROI significantly above short-rent benchmarks."
  );

}

// ⚠️ HIGH RISK
if(aiSignals.includes("high_risk")){

  executiveInsightsIT.push(
    "⚠️ La simulazione mostra una struttura operativa aggressiva."
  );

  executiveInsightsEN.push(
    "⚠️ The simulation shows an aggressive operational structure."
  );

}

// 🏨 HIGH OCCUPANCY
if(aiSignals.includes("high_occupancy")){

  executiveInsightsIT.push(
    "🏨 L'occupazione supporta positivamente il cashflow."
  );

  executiveInsightsEN.push(
    "🏨 Occupancy positively supports cashflow."
  );

}

// 💸 NEGATIVE CASHFLOW
if(aiSignals.includes("negative_cashflow")){

  executiveInsightsIT.push(
    "💸 Il cashflow operativo potrebbe diventare instabile."
  );

  executiveInsightsEN.push(
    "💸 Operational cashflow may become unstable."
  );

}
  
  // ===========================================
  // 🌍 MARKET DATA
  // ===========================================

  const market =

allowMarketContext && city

? (
    window.rbMarketData?.[city] ||
    null
  )

: null;

// =====================================
// 🌍 MARKET + ROI CROSS ANALYSIS
// =====================================

if(
  market &&
  roi > 0
){

  const marketROI =
    parseFloat(
      String(market.avgROI || "")
        .replace(/[^\d.,-]/g,"")
        .replace(",", ".")
    ) || 0;

  if(
    marketROI > 0 &&
    roi >= marketROI * 1.8
  ){

    reasoningIT.push(
      "📈 Il ROI simulato è molto superiore al benchmark medio della città."
    );

    reasoningEN.push(
      "📈 Simulated ROI is significantly above the city's average benchmark."
    );

  }

}  

// ===========================================
// 🚫 NO ANALYSIS SAFETY
// ===========================================

const hasAnalysis =

  (!isNaN(roi) && roi !== 0) ||

  (!isNaN(risk) && risk !== 0) ||

  (!isNaN(occupancy) && occupancy !== 0);

// ===========================================
// 🏠 HOME QUICK SIMULATION
// ===========================================

const isHomeSimulation =

  !window.location.pathname.includes(
    "/tool"
  );

// ===========================================
// 🚫 BLOCK PARTIAL ANALYSIS
// ===========================================

if(

  (
    !hasAnalysis ||

    isHomeSimulation

  ) &&

  intent.intent !== "education" &&

  intent.intent !== "subscriptions" &&

  intent.intent !== "market_analysis" &&

  intent.intent !== "investment_strategy" &&

  intent.intent !== "investment_advisor" &&
  intent.intent !== "greeting"

){

  return {

    type: "empty",

    confidence: 1,

    textIT:

      `📊 Sto leggendo dati parziali dalla simulazione rapida.

Per ottenere:
• ROI reale
• cashflow avanzato
• rischio operativo
• analisi AI completa

esegui una simulazione nel simulatore principale.`,

    textEN:

      `📊 I am currently reading partial quick-simulation data.

To unlock:
• real ROI
• advanced cashflow
• operational risk
• full AI analysis

run a simulation inside the main simulator.`,

    suggestionsIT: [
      "Apri simulatore completo"
    ],

    suggestionsEN: [
      "Open full simulator"
    ],

    signals: [],

    metadata: {}

  };

}

// ===========================================
// 🧠 RESPONSE PRIORITY SYSTEM
// ===========================================

const responseBlocksIT = [];

const responseBlocksEN = [];

function pushResponseBlock({

  priority = 1,

  textIT = "",

  textEN = ""

}){

  responseBlocksIT.push({
    priority,
    text: textIT
  });

  responseBlocksEN.push({
    priority,
    text: textEN
  });

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

  // =======================================
  // 🚀 HIGH ROI
  // =======================================

  if(roi >= 15){

    response.signals.push(
      "high_roi"
    );

    const marketROI =
      market?.avgROI || "8-10%";

    pushResponseBlock({

      priority: 10,

      textIT:

`🚀 ROI estremamente elevato.

📈 ROI reale simulato:
${roi.toFixed(1)}%

🌍 Mercato:
${cityLabel}

📊 Benchmark medio:
${marketROI}

💡 La simulazione appare molto superiore alla media short-rent locale.

${roi >= 40
? "⚠️ Un ROI oltre il 40% richiede verifica realistica di occupazione, costi e sostenibilità operativa."
: "✅ Il rendimento appare competitivo rispetto al benchmark."
}

🏨 Occupazione:
${occupancy}% 

⚠️ Risk score:
${risk}/100`,

      textEN:

`🚀 Extremely high ROI detected.

📈 Simulated real ROI:
${roi.toFixed(1)}%

🌍 Market:
${cityLabel}

📊 Average benchmark:
${marketROI}

💡 The simulation appears significantly above local short-rent averages.

${roi >= 40
? "⚠️ ROI above 40% requires realistic validation of occupancy, costs and sustainability."
: "✅ Returns appear competitive versus benchmark."
}

🏨 Occupancy:
${occupancy}%

⚠️ Risk score:
${risk}/100`

    });

  }

  // =======================================
  // 📈 MEDIUM ROI
  // =======================================

  else if(roi >= 8){

    response.signals.push(
      "medium_roi"
    );

    pushResponseBlock({

      priority: 8,

      textIT:

`📈 ROI potenzialmente sostenibile.

📊 ROI simulato:
${roi.toFixed(1)}%

💡 L'investimento sembra equilibrato ma dipende da occupazione e costi.`,

      textEN:

`📈 ROI appears potentially sustainable.

📊 Simulated ROI:
${roi.toFixed(1)}%

💡 The investment appears balanced but depends on occupancy and costs.`

    });

  }

  // =======================================
  // 📉 LOW ROI
  // =======================================

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

      pushResponseBlock({

        priority: 9,

        textIT:

`🚨 Investimento operativo in perdita.

📉 ROI simulato:
${roi.toFixed(1)}%

⚠️ La struttura attuale non sembra sostenibile.

💡 Costi operativi, occupazione o pricing potrebbero compromettere il cashflow reale.

🏦 Prima di investire è consigliabile rivedere:
• prezzo notte
• occupazione media
• costi fissi
• leva finanziaria`,

        textEN:

`🚨 Investment appears operationally unprofitable.

📉 Simulated ROI:
${roi.toFixed(1)}%

⚠️ The current structure may not be financially sustainable.

💡 Operating costs, occupancy or pricing may compromise real cashflow.

🏦 Before investing it is recommended to review:
• nightly pricing
• average occupancy
• fixed costs
• financial leverage`

      });

    }

    // =====================================
    // ⚠️ LOW ROI
    // =====================================

    else{

      pushResponseBlock({

        priority: 6,

        textIT:

`⚠️ ROI relativamente basso.

📊 ROI simulato:
${roi.toFixed(1)}%

💡 Potrebbe essere necessario ottimizzare ADR, occupazione o costi operativi.`,

        textEN:

`⚠️ ROI appears relatively low.

📊 Simulated ROI:
${roi.toFixed(1)}%

💡 ADR, occupancy or operational cost optimization may be required.`

      });

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

  // =====================================
  // 💰 SAFE DATA
  // =====================================

  const rawNet =

    liveData.net ??
    liveData.netProfit ??
    liveData.profitNet ??
    uiNetProfit ??
    null;

  const rawGross =

    liveData.gross ??
    liveData.grossProfit ??
    liveData.profit ??
    0;

  const net =

    rawNet !== undefined &&
    rawNet !== null &&
    rawNet !== "" &&
    !isNaN(Number(rawNet))

      ? Number(rawNet)

      : 0;

  console.log(
    "💰 CASHFLOW FINAL DEBUG:",
    {
      rawNet,
      rawGross,
      uiNetProfit,
      finalNet: net,
      liveData
    }
  );

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

  pushResponseBlock({

    priority: 10,

    textIT:

`🔒 Il cashflow dettagliato è disponibile nei piani Investor e PRO.

💡 Passa a Investor o PRO per sbloccare:
• profitto netto reale
• sostenibilità operativa
• cashflow annuale
• analisi rischio avanzata`,

    textEN:

`🔒 Detailed cashflow analysis is available in Investor and PRO plans.

💡 Upgrade to Investor or PRO to unlock:
• real net profit
• operational sustainability
• annual cashflow
• advanced risk analysis`

  });

}

// =====================================
// 🚨 NEGATIVE CASHFLOW
// =====================================

else if(net <= 0){

  response.signals.push(
    "negative_cashflow"
  );

  pushResponseBlock({

    priority: 9,

    textIT:

`🚨 Cashflow operativo negativo.

💸 Profitto netto stimato:
€${net.toLocaleString("it-IT")}

⚠️ L'investimento potrebbe generare perdite operative.

💡 È consigliabile ridurre costi o aumentare occupazione e ADR.`,

    textEN:

`🚨 Negative operational cashflow detected.

💸 Estimated net profit:
€${net.toLocaleString("en-US")}

⚠️ The investment may generate operational losses.

💡 Reducing costs or increasing occupancy and ADR is recommended.`

  });

}

// =====================================
// ✅ POSITIVE CASHFLOW
// =====================================

else{

  response.signals.push(
    "positive_cashflow"
  );

  pushResponseBlock({

    priority: 7,

    textIT:

`✅ Cashflow operativo positivo.

💰 Profitto netto stimato:
€${net.toLocaleString("it-IT")}

📈 La simulazione mostra una sostenibilità finanziaria potenzialmente stabile.`,

    textEN:

`✅ Positive operational cashflow detected.

💰 Estimated net profit:
€${net.toLocaleString("en-US")}

📈 The simulation shows potentially stable financial sustainability.`

  });

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

  // =======================================
  // 🚨 HIGH RISK
  // =======================================

  if(risk >= 70){

    response.signals.push(
      "high_risk"
    );

    pushResponseBlock({

      priority: 9,

      textIT:

`🚨 Rischio operativo elevato.

📊 Risk score:
${risk}/100

⚠️ Cashflow e sostenibilità potrebbero diventare instabili nel lungo periodo.

🏨 Occupazione:
${occupancy}%

📈 ROI reale:
${roi.toFixed(1)}%

💡 L'investimento richiede forte controllo di costi, pricing e domanda turistica.`,

      textEN:

`🚨 High operational risk detected.

📊 Risk score:
${risk}/100

⚠️ Cashflow and sustainability may become unstable long-term.

🏨 Occupancy:
${occupancy}%

📈 Real ROI:
${roi.toFixed(1)}%

💡 The investment requires strong control over costs, pricing and tourism demand.`

    });

  }

  // =======================================
  // ⚠️ MEDIUM RISK
  // =======================================

  else if(risk >= 40){

    response.signals.push(
      "medium_risk"
    );

    pushResponseBlock({

      priority: 7,

      textIT:

`⚠️ Rischio moderato.

📊 Risk score:
${risk}/100

🏨 Occupazione:
${occupancy}%

📈 ROI reale:
${roi.toFixed(1)}%

💡 L'investimento sembra sostenibile ma richiede monitoraggio operativo.`,

      textEN:

`⚠️ Moderate risk detected.

📊 Risk score:
${risk}/100

🏨 Occupancy:
${occupancy}%

📈 Real ROI:
${roi.toFixed(1)}%

💡 The investment appears sustainable but requires operational monitoring.`

    });

  }

  // =======================================
  // ✅ LOW RISK
  // =======================================

  else{

    response.signals.push(
      "low_risk"
    );

    const riskInsightIT =

      occupancy < 45

      ? "⚠️ L'occupazione attuale sta riducendo la stabilità operativa."

      : occupancy >= 65

      ? "✅ L'occupazione supporta bene il cashflow."

      : "📊 L'occupazione appare moderata.";

    const riskInsightEN =

      occupancy < 45

      ? "⚠️ Current occupancy is reducing operational stability."

      : occupancy >= 65

      ? "✅ Occupancy strongly supports cashflow."

      : "📊 Occupancy appears moderate.";

    pushResponseBlock({

      priority: 6,

      textIT:

`✅ Rischio relativamente basso.

📊 Risk score:
${risk}/100

🏨 Occupazione:
${occupancy}%

${riskInsightIT}

📈 ROI reale:
${roi.toFixed(1)}%`,

      textEN:

`✅ Risk appears relatively low.

📊 Risk score:
${risk}/100

🏨 Occupancy:
${occupancy}%

${riskInsightEN}

📈 Real ROI:
${roi.toFixed(1)}%`

    });

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

  // =======================================
  // 🚨 HIGH LEVERAGE
  // =======================================

  if(mortgagePercent >= 90){

    response.signals.push(
      "high_leverage"
    );

    pushResponseBlock({

      priority: 8,

      textIT:

`⚠️ Leva finanziaria molto aggressiva.

🏦 Mutuo:
${mortgagePercent}%

📈 ROI reale:
${roi.toFixed(1)}%

⚠️ Una leva elevata aumenta sensibilmente il rischio operativo e la vulnerabilità del cashflow.`,

      textEN:

`⚠️ Highly aggressive leverage detected.

🏦 Mortgage:
${mortgagePercent}%

📈 Real ROI:
${roi.toFixed(1)}%

⚠️ High leverage significantly increases operational risk and cashflow vulnerability.`

    });

  }

  // =======================================
  // ✅ STANDARD LEVERAGE
  // =======================================

  else{

    response.signals.push(
      "sustainable_leverage"
    );

    pushResponseBlock({

      priority: 6,

      textIT:

`🏦 Struttura mutuo analizzata.

📊 Leverage:
${mortgagePercent}%

📈 ROI reale:
${roi.toFixed(1)}%

💡 Il finanziamento sembra relativamente sostenibile rispetto ai dati operativi attuali.`,

      textEN:

`🏦 Mortgage structure analyzed.

📊 Leverage:
${mortgagePercent}%

📈 Real ROI:
${roi.toFixed(1)}%

💡 Financing appears relatively sustainable compared to current operational data.`

    });

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

    const marketROI =
      market.avgROI || "N/A";

    const marketOccupancy =
      market.occupancy || "N/A";

    const marketRisk =
      market.risk || "N/A";

    const benchmarkInsightIT =

      roi > 0 && roi > parseFloat(marketROI)

      ? "✅ La simulazione supera il benchmark medio del mercato."

      : roi > 0

      ? "⚠️ Il ROI simulato è vicino o sotto la media di mercato."

      : "📊 Benchmark disponibile per confronto operativo.";

    const benchmarkInsightEN =

      roi > 0 && roi > parseFloat(marketROI)

      ? "✅ The simulation is outperforming the average market benchmark."

      : roi > 0

      ? "⚠️ Simulated ROI is near or below market averages."

      : "📊 Benchmark available for operational comparison.";

    pushResponseBlock({

      priority: 7,

      textIT:

`🌍 Analisi mercato ${cityLabel}

📈 ROI medio:
${marketROI}

🏨 Occupazione media:
${marketOccupancy}

⚠️ Rischio mercato:
${marketRisk}

📊 ROI simulato:
${roi.toFixed(1)}%

${benchmarkInsightIT}`,

      textEN:

`🌍 ${cityLabel} market analysis

📈 Average ROI:
${marketROI}

🏨 Average occupancy:
${marketOccupancy}

⚠️ Market risk:
${marketRisk}

📊 Simulated ROI:
${roi.toFixed(1)}%

${benchmarkInsightEN}`

    });

  }

  else{

    pushResponseBlock({

      priority: 5,

      textIT:

`⚠️ Nessun benchmark disponibile per questa città.

💡 Prova con mercati principali come:
• Roma
• Milano
• Firenze
• Napoli

📊 Oppure esegui una simulazione completa per ottenere analisi AI più avanzate.`,

      textEN:

`⚠️ No benchmark available for this city.

💡 Try major markets such as:
• Rome
• Milan
• Florence
• Naples

📊 Or run a complete simulation to unlock deeper AI analysis.`

    });

  }

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
  // 💰 PLAN PRICING
  // =====================================

  if(
    q.includes("costo") ||
    q.includes("prezzo") ||
    q.includes("quanto costa") ||
    q.includes("price")
  ){

    pushResponseBlock({

      priority: 4,

      textIT:

`🔥 PIANI RENDIMENTOBB

🟢 INVESTOR — €19/mese
• benchmark città
• analisi avanzate
• simulazioni investimento
• metriche short-rent
• analisi ROI e cashflow

🚀 PRO — €29/mese
• tutto Investor
• PDF bancario professionale
• AI avanzata
• forecast investimento
• analisi rischio
• mutui e leva finanziaria
• export completo

💡 Pensato per investitori Airbnb, B&B e short-rent.`,

      textEN:

`🔥 RENDIMENTOBB PLANS

🟢 INVESTOR — €19/month
• city benchmarks
• advanced analysis
• investment simulations
• short-rent metrics
• ROI and cashflow analysis

🚀 PRO — €29/month
• everything in Investor
• professional bank-level PDF
• advanced AI
• investment forecasting
• risk analysis
• mortgages and leverage
• full export

💡 Designed for Airbnb, B&B and short-rent investors.`

    });

  }

  // =====================================
  // 🚀 PLAN DIFFERENCE
  // =====================================

  else if(
    q.includes("differenza") ||
    q.includes("investor") ||
    q.includes("pro")
  ){

    pushResponseBlock({

      priority: 5,

      textIT:

`🚀 DIFFERENZA INVESTOR vs PRO

🟢 INVESTOR (€19)
Ideale per:
• simulare investimenti
• confrontare città
• analizzare ROI e cashflow
• studiare benchmark short-rent

🚀 PRO (€29)
Include tutto Investor +
• PDF professionale bancario
• AI avanzata multi-analisi
• forecast investimento
• analisi rischio completa
• simulazioni mutuo
• export avanzati
• insight strategici executive

💡 PRO è progettato per investitori e professionisti short-rent.`,

      textEN:

`🚀 INVESTOR vs PRO

🟢 INVESTOR (€19)
Perfect for:
• investment simulations
• city comparisons
• ROI and cashflow analysis
• short-rent benchmark analysis

🚀 PRO (€29)
Includes everything in Investor +
• professional bank-level PDF
• advanced multi-analysis AI
• investment forecasting
• complete risk analysis
• mortgage simulations
• advanced exports
• executive strategic insights

💡 PRO is designed for investors and short-rent professionals.`

    });

  }

}

  // =====================================
// ❌ SUBSCRIPTION CANCELLATION
// =====================================

else if(
  q.includes("disdire") ||
  q.includes("annullare") ||
  q.includes("cancellare") ||
  q.includes("cancel")
){

  pushResponseBlock({

    priority: 4,

    textIT:

`❌ Puoi annullare il tuo abbonamento in qualsiasi momento.

✅ L’accesso resterà attivo fino alla fine del periodo già pagato.

⚙️ Per gestire il piano:
• accedi al tuo account
• apri area abbonamento
• seleziona gestione piano

💡 Nessun vincolo a lungo termine.`,

    textEN:

`❌ You can cancel your subscription anytime.

✅ Your access will remain active until the end of the paid billing period.

⚙️ To manage your plan:
• log into your account
• open subscription area
• select manage plan

💡 No long-term commitment required.`

  });

}

// =====================================
// 📌 DEFAULT SUBSCRIPTION RESPONSE
// =====================================

else{

  pushResponseBlock({

    priority: 3,

    textIT:

`💳 Posso aiutarti con:

• prezzi piani
• differenza Investor/PRO
• gestione abbonamento
• funzionalità disponibili
• upgrade account

🚀 RendimentoBB AI è progettato per investitori short-rent e Airbnb.`,

    textEN:

`💳 I can help you with:

• plan pricing
• Investor vs PRO
• subscription management
• available features
• account upgrades

🚀 RendimentoBB AI is designed for Airbnb and short-rent investors.`

  });

}

}

// ===========================================
// 🧠 EXECUTIVE AI RESPONSE
// ===========================================

else if(

  intent.intent === "investment_executive" ||

  intent.intent === "executive_analysis" ||

  intent.intent === "analysis" ||

  intent.intent === "sustainability" ||

  intent.intents?.includes("sustainability") ||

  intent.intents?.includes("analysis")

){

  console.log(
    "🚀 EXECUTIVE BLOCK ENTERED",
    intent
  );

  response.type =
    "executive";

  response.confidence =
    0.99;

  response.signals.push(
    "executive_analysis"
  );

  // =====================================
  // 🧠 EXECUTIVE SUMMARY
  // =====================================

  const executiveIT = [];
  const executiveEN = [];

  // =====================================
  // 📈 ROI ANALYSIS
  // =====================================

  executiveIT.push(

    roi >= 20

    ? `📈 Il ROI reale del ${roi.toFixed(1)}% è molto superiore alla media short-rent.`

    : roi >= 10

    ? `📈 Il ROI reale del ${roi.toFixed(1)}% appare sostenibile ma con margini di ottimizzazione.`

    : `📉 Il ROI reale del ${roi.toFixed(1)}% potrebbe non compensare rischio e costi operativi.`

  );

  executiveEN.push(

    roi >= 20

    ? `📈 The real ROI of ${roi.toFixed(1)}% is significantly above short-rent averages.`

    : roi >= 10

    ? `📈 The real ROI of ${roi.toFixed(1)}% appears sustainable but still has optimization potential.`

    : `📉 The real ROI of ${roi.toFixed(1)}% may not compensate operational costs and risk.`

  );

  // =====================================
  // 🏨 OCCUPANCY ANALYSIS
  // =====================================

  executiveIT.push(

    occupancy >= 70

    ? `🏨 L'occupazione del ${occupancy}% supporta fortemente il cashflow.`

    : occupancy >= 50

    ? `🏨 L'occupazione del ${occupancy}% appare moderatamente stabile.`

    : `⚠️ L'occupazione del ${occupancy}% potrebbe limitare sostenibilità e margini.`

  );

  executiveEN.push(

    occupancy >= 70

    ? `🏨 Occupancy at ${occupancy}% strongly supports cashflow.`

    : occupancy >= 50

    ? `🏨 Occupancy at ${occupancy}% appears moderately stable.`

    : `⚠️ Occupancy at ${occupancy}% may limit sustainability and margins.`

  );

  // =====================================
  // ⚠️ RISK ANALYSIS
  // =====================================

  executiveIT.push(

    risk >= 70

    ? `🚨 Il risk score di ${risk}/100 evidenzia elevata instabilità operativa.`

    : risk >= 40

    ? `⚠️ Il risk score di ${risk}/100 richiede monitoraggio strategico.`

    : `✅ Il risk score di ${risk}/100 appare relativamente sostenibile.`

  );

  executiveEN.push(

    risk >= 70

    ? `🚨 A risk score of ${risk}/100 highlights high operational instability.`

    : risk >= 40

    ? `⚠️ A risk score of ${risk}/100 requires strategic monitoring.`

    : `✅ A risk score of ${risk}/100 appears relatively sustainable.`

  );

  // =====================================
  // 🌍 MARKET INSIGHT
  // =====================================

  if(market){

    executiveIT.push(
      `🌍 Il benchmark di ${cityLabel} mostra un ROI medio di ${market.avgROI}.`
    );

    executiveEN.push(
      `🌍 ${cityLabel} benchmark shows an average ROI of ${market.avgROI}.`
    );

  }

  // =====================================
  // 🚀 FINAL EXECUTIVE RESPONSE
  // =====================================

  pushResponseBlock({

    priority: 10,

    textIT:

`🧠 ANALISI EXECUTIVE AI

${executiveIT.join("\n\n")}

💡 La sostenibilità reale dipende da:
• occupazione stabile
• controllo costi
• gestione operativa
• domanda turistica

🚀 L'AI suggerisce monitoraggio continuo del cashflow e del rischio operativo.`,

    textEN:

`🧠 EXECUTIVE AI ANALYSIS

${executiveEN.join("\n\n")}

💡 Real sustainability depends on:
• stable occupancy
• cost control
• operational management
• tourism demand

🚀 The AI recommends continuous monitoring of cashflow and operational risk.`

  });

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

  // =====================================
  // 🚀 FINAL STRATEGY RESPONSE
  // =====================================

  pushResponseBlock({

    priority: 8,

    textIT:
      strategyIT.join("\n\n"),

    textEN:
      strategyEN.join("\n\n")

  });

}

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

// =====================================
// 🚀 FINAL STRATEGY RESPONSE
// =====================================

pushResponseBlock({

  priority: 8,

  textIT:
    strategyIT.join("\n\n"),

  textEN:
    strategyEN.join("\n\n")

});

}

// ===========================================
// 👋 GREETING RESPONSE
// ===========================================

else if(
  intent.intent === "greeting"
){

  response.type =
    "greeting";

  response.confidence =
    1;

  pushResponseBlock({

    priority: 1000,

    textIT:

`👋 Ciao!

Posso aiutarti ad analizzare:

• ROI
• cashflow
• rischio
• mutui
• benchmark città
• sostenibilità B&B
• simulazioni investimento

🚀 Powered by RendimentoBB AI.`,

    textEN:

`👋 Hi!

I can help you analyze:

• ROI
• cashflow
• risk
• mortgages
• city benchmarks
• B&B sustainability
• investment simulations

🚀 Powered by RendimentoBB AI.`

  });

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
    0.95;

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

    const knowledgeIT =

      knowledge?.text?.it ||

      knowledge?.textIT ||

      `${knowledge?.aiSummaryIT || ""}

${knowledge?.aiInsightIT || ""}` ||

      "⚠️ Nessuna spiegazione disponibile.";

    const knowledgeEN =

      knowledge?.text?.en ||

      knowledge?.textEN ||

      `${knowledge?.aiSummaryEN || ""}

${knowledge?.aiInsightEN || ""}` ||

      "⚠️ No explanation available.";

    pushResponseBlock({

      priority: 9,

      textIT:
        knowledgeIT,

      textEN:
        knowledgeEN

    });

  }

  // ===========================================
  // 📚 GENERIC EDUCATION
  // ===========================================

  else{

    pushResponseBlock({

      priority: 6,

      textIT:

`🎓 Posso spiegarti:

• ROI
• cashflow
• rischio
• DSCR
• occupazione
• sostenibilità
• mutui
• benchmark mercato
• leva finanziaria

💡 Scrivi ad esempio:
"Spiegami il ROI"
oppure
"Cos'è il cashflow?"`,

      textEN:

`🎓 I can explain:

• ROI
• cashflow
• risk
• DSCR
• occupancy
• sustainability
• mortgages
• market benchmarks
• financial leverage

💡 Try asking:
"Explain ROI"
or
"What is cashflow?"`

    });

  }

}
// ===========================================
// 📚 KNOWLEDGE FALLBACK RESPONSE
// ===========================================

else if(

  entities.knowledgeData ||

  entities.knowledge

){

  response.type =
    "knowledge";

  response.confidence =
    0.92;

  const knowledge =

    entities.knowledgeData ||

    window.rbKnowledgeBase?.[
      entities.knowledge
    ] ||

    null;

  if(knowledge){

    const knowledgeIT =

      knowledge?.text?.it ||

      knowledge?.textIT ||

      `

${knowledge?.aiTitleIT || ""}

${knowledge?.aiSummaryIT || ""}

${knowledge?.aiInsightIT || ""}

${knowledge?.warningIT || ""}

      `.trim();

    const knowledgeEN =

      knowledge?.text?.en ||

      knowledge?.textEN ||

      `

${knowledge?.aiTitleEN || ""}

${knowledge?.aiSummaryEN || ""}

${knowledge?.aiInsightEN || ""}

${knowledge?.warningEN || ""}

      `.trim();

    pushResponseBlock({

      priority: 7,

      textIT:
        knowledgeIT,

      textEN:
        knowledgeEN

    });

  }

}  

// ===========================================
// 🧠 HUMAN CONTEXT RESPONSE
// ===========================================

else if(

  entities.amount ||

  entities.price ||

  entities.mortgage ||

  entities.mortgagePercent ||

  (

    allowMarketContext &&

    entities.city

  )

){

  response.type =
    "human_context";

  response.confidence =
    0.90;

  const humanIT = [];

  const humanEN = [];

  // =====================================
  // 💰 CAPITAL / PRICE
  // =====================================

  if(entities.amount || entities.price){

    const amount =

      Number(
        entities.amount ||
        entities.price ||
        0
      );

    if(amount > 0){

      humanIT.push(

`💰 Perfetto.

Terrò conto di un budget iniziale di €${amount.toLocaleString("it-IT")} per le prossime analisi.`

      );

      humanEN.push(

`💰 Perfect.

I will consider an initial budget of €${amount.toLocaleString("en-US")} for future analyses.`

      );

    }

  }

  // =====================================
  // 🌍 CITY
  // =====================================

  if(
    allowMarketContext &&
    entities.city
  ){

    const cityName =

      window.rbCapitalize?.(
        entities.city
      ) ||

      entities.city;

    humanIT.push(

`🌍 Mercato salvato:
${cityName}.`

    );

    humanEN.push(

`🌍 Market saved:
${cityName}.`

    );

  }

  // =====================================
  // 🏦 MORTGAGE
  // =====================================

  if(
    entities.mortgage ||
    entities.mortgagePercent
  ){

    humanIT.push(

`🏦 Configurazione mutuo rilevata.

Le prossime analisi terranno conto della leva finanziaria.`

    );

    humanEN.push(

`🏦 Mortgage configuration detected.

Future analyses will consider financial leverage.`

    );

  }

  // =====================================
  // 🚀 FINAL HUMAN CONTEXT
  // =====================================

  pushResponseBlock({

    priority: 5,

    textIT:
      humanIT.join("\n\n"),

    textEN:
      humanEN.join("\n\n")

  });

}

  // =====================================
// 🏦 MORTGAGE
// =====================================

if(entities.mortgage){

  humanIT.push(

    entities.mortgagePercent

    ? `🏦 Considererò un mutuo al ${entities.mortgagePercent}%.`

    : "🏦 Considererò anche la leva finanziaria nelle prossime simulazioni."

  );

  humanEN.push(

    entities.mortgagePercent

    ? `🏦 I will consider a ${entities.mortgagePercent}% mortgage.`

    : "🏦 Financial leverage will also be considered in future simulations."

  );

}

// =====================================
// 💬 FINAL
// =====================================

pushResponseBlock({

  priority: 5,

  textIT:
    humanIT.join("\n\n"),

  textEN:
    humanEN.join("\n\n")

});

}

// ===========================================
// 🤖 DEFAULT RESPONSE
// ===========================================

else{

  pushResponseBlock({

    priority: 1,

    textIT:

`🤖 Posso aiutarti ad analizzare:

• ROI
• cashflow
• rischio
• sostenibilità
• mutui
• benchmark short-rent`,

    textEN:

`🤖 I can help analyze:

• ROI
• cashflow
• risk
• sustainability
• mortgages
• short-rent benchmarks`

  });

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
// 🧠 FINAL RESPONSE MERGE
// ===========================================

if(responseBlocksIT.length){

  response.textIT =

    responseBlocksIT

      .sort((a,b)=>
        b.priority - a.priority
      )

      .map(block => block.text)

      .filter(Boolean)

      .filter((v,i,self)=>
        self.indexOf(v) === i
      )

      .join("\n\n");

}

if(responseBlocksEN.length){

  response.textEN =

    responseBlocksEN

      .sort((a,b)=>
        b.priority - a.priority
      )

      .map(block => block.text)

      .filter(Boolean)

      .filter((v,i,self)=>
        self.indexOf(v) === i
      )

      .join("\n\n");

}
  
// ===========================================
// 🧠 EXECUTIVE SUMMARY ENGINE
// ===========================================
  

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
