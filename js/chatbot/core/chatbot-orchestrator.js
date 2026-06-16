// ===============================================
// 🧠 RENDIMENTOBB – CHATBOT ORCHESTRATOR
// Silicon Valley AI Core System
// ===============================================

// ===============================================
// 🚀 MAIN AI PIPELINE
// ===============================================

window.rbProcessAIMessage =
async function(message){

  try{

    // =========================================
    // 🧹 NORMALIZE
    // =========================================

    const text =

      String(message || "")
        .trim();

    // =========================================
    // 🧠 ENTITY EXTRACTION
    // =========================================

    const entities =

      window.rbExtractEntities

      ? window.rbExtractEntities(text)

      : {};

// =========================================
// 🧠 MULTI INTENT DETECTION
// =========================================

const detectedIntent =

  window.rbDetectIntent

  ? window.rbDetectIntent(text)

  : {
      intent: "generic"
    };

// =========================================
// 🧠 MULTI INTENT SYSTEM 2.0
// =========================================

const intents = [];

// =========================================
// 🎓 EDUCATION
// =========================================

if(
  detectedIntent.intent ===
  "education"
){

  intents.push(
    "education"
  );

}

// =========================================
// 📈 ROI
// =========================================

if(

  text.includes("roi") ||

  text.includes("rendimento")

){

  intents.push(
    "roi_analysis"
  );

}

// =========================================
// ⚠️ RISK
// =========================================

if(

  text.includes("rischio") ||

  text.includes("risk")

){

  intents.push(
    "risk_analysis"
  );

}

// =========================================
// 💸 CASHFLOW
// =========================================

if(

  text.includes("cashflow") ||

  text.includes("profitto")

){

  intents.push(
    "cashflow_analysis"
  );

}

// =========================================
// 🏨 PMS
// =========================================

if(

  detectedIntent.intent === "pms_analysis" ||

  detectedIntent.intent === "pms_bookings"

){

  intents.push(
    detectedIntent.intent
  );

}    

// =========================================
// 🏦 MORTGAGE
// =========================================

if(

  text.includes("mutuo") ||

  text.includes("mortgage")

){

  intents.push(
    "mortgage_analysis"
  );

}

// =========================================
// 🌍 MARKET
// =========================================

if(

  text.includes("mercato") ||

  text.includes("market") ||

  entities.city

){

  intents.push(
    "market_analysis"
  );

}

// =========================================
// 🧠 EXECUTIVE
// =========================================

if(

  text.includes("analisi") ||

  text.includes("executive") ||

  text.includes("sostenibile") ||

  text.includes("worth it") ||

  text.includes("good investment") ||

  text.includes("vale la pena")

){

  intents.push(
    "investment_executive"
  );

}

// =========================================
// 🔥 REMOVE DUPLICATES
// =========================================

const uniqueIntents = [

  ...new Set(intents)

];

// =========================================
// 🧠 FALLBACK
// =========================================

if(!uniqueIntents.length){

  uniqueIntents.push(

    detectedIntent.intent ||

    "generic"

  );

}

    const intent = {

  ...detectedIntent,

  intents:
    uniqueIntents

};

    console.log(
  "🔥 FINAL INTENTS:",
  uniqueIntents
);
    // =========================================
    // 🧠 MEMORY
    // =========================================

    const memory =

      window.rbGetMemory

      ? window.rbGetMemory()

      : {};

// =========================================
// 🧠 INVESTOR PROFILE
// =========================================

const investorProfile =

  window.rbUpdateInvestorProfile

  ? window.rbUpdateInvestorProfile({

      entities,

      analysisData:
        window.lastAnalysisData || {},

      memory:
        memory || {}

    })

  : {};

    // =========================================
    // 📊 ANALYSIS DATA
    // =========================================

const analysisData = {

  ...(window.lastAnalysisData || {}),

  roi:

    Number(
      document.getElementById("roi-value")
      ?.textContent
      ?.replace("%","")
      ?.trim()
    ) || 0,

  risk:

    Number(
      document.getElementById("risk-score")
      ?.textContent
      ?.replace("/100","")
      ?.trim()
    ) || 0,

  occupancy:

    Number(
      document.getElementById("occupancy-rate")
      ?.textContent
      ?.replace("%","")
      ?.trim()
    ) || 0,

  city:

    window.currentCity ||

    "roma"

};

// =========================================
// 🧠 AI SIGNALS
// =========================================

const aiSignals =

  window.generateAISignals

  ? window.generateAISignals(
      analysisData
    )

  : [];

    // =========================================
// 🧠 ADVISOR ENGINE
// =========================================

const advisor =

  window.rbGenerateAdvisorVerdict

  ? window.rbGenerateAdvisorVerdict({

      roi:
        analysisData.roi ||

        window.lastAnalysisData?.roi ||

        0,

      risk:
        analysisData.risk ||

        window.lastAnalysisData?.risk ||

        0,

      occupancy:
        analysisData.occupancy ||

        window.lastAnalysisData?.occupancy ||

        0,

      mortgagePercent:

        window.lastAnalysisData
          ?.mortgagePercent ||

        entities.mortgagePercent ||

        0,

      cashflow:

  Number(

    analysisData.net ??

    analysisData.cashflow ??

    analysisData.annualProfit ??

    window.lastAnalysisData?.net ??

    window.lastAnalysisData?.annualProfit ??

    window.lastAnalysisData?.cashflow ??

    0

  ),

      city:
        analysisData.city ||

        entities.city ||

        "roma",

      investorProfile

    })

  : null;

console.log(
  "🧠 ADVISOR:",
  advisor
);

    console.log(
  "🧪 ADVISOR INPUTS",
  {
    roi:
      analysisData.roi,

    risk:
      analysisData.risk,

    occupancy:
      analysisData.occupancy,

    net:
      analysisData.net,

    annualProfit:
      analysisData.annualProfit,

    cashflow:
      analysisData.cashflow,

    lastAnalysis:
      window.lastAnalysisData
  }
);
    // =========================================
    // 🧠 KNOWLEDGE MATCHING
    // =========================================

    let matchedKnowledge = [];

    for(
      const key in
      (window.rbKnowledgeBase || {})
    ){

      const item =

        window.rbKnowledgeBase[key];

      if(
        !item?.keywords
      ){

        continue;

      }

      const matched =

        item.keywords.some(keyword =>

          text
            .toLowerCase()
            .includes(
              keyword.toLowerCase()
            )

        );

      if(matched){

        matchedKnowledge.push({

          key,

          item,

          priority:
            item.priority || 1

        });

      }

    }

    // =========================================
    // 🧠 SORT KNOWLEDGE
    // =========================================

    matchedKnowledge.sort(
      (a,b)=>

        b.priority -
        a.priority
    );

// =========================================
// 🧠 MAIN KNOWLEDGE ENTITY
// =========================================

const bestKnowledge =

  matchedKnowledge.length

  ? matchedKnowledge[0]

  : null;

if(bestKnowledge){

  entities.knowledge =

    bestKnowledge.key;

  entities.knowledgeData =

    bestKnowledge.item;

}

// =========================================
// 🧠 MULTI RESPONSE ENGINE
// =========================================

let finalTextIT = "";
let finalTextEN = "";

for(const currentIntent of intent.intents){

  // =========================================
// 🧠 CURRENT INTENT DATA
// =========================================

const currentIntentData = {

  ...intent,

  intent: currentIntent,

  requiresMarketData:

    [
      "market_analysis",
      "investment_advisor",
      "investment_executive",
      "roi_analysis",
      "risk_analysis",
      "cashflow_analysis",
      "comparison"
    ].includes(currentIntent),

  requiresMortgageAnalysis:

    currentIntent ===
    "mortgage_analysis"

};

// =========================================
// 🌍 FILTER MEMORY
// =========================================

const filteredMemory = {

  ...memory

};

// 🔥 NO MARKET MEMORY
if(

  !currentIntentData
    .requiresMarketData

){

  delete filteredMemory.city;

  delete filteredMemory.lastCity;

}

// =========================================
// 🧠 RESPONSE
// =========================================

const partialResponse =

  window.rbGenerateResponse({

    message: text,

    entities,

    intent: currentIntentData,

    memory: filteredMemory,

    investorProfile,

    advisor,

    analysisData,

    aiSignals

  });

  console.log(
  "🏨 PMS RESPONSE DEBUG",
  currentIntent,
  partialResponse
);

  // 🔥 IGNORA RISPOSTE VUOTE/FALLBACK
  const isFallback =

  partialResponse?.textIT?.includes(
    "Posso aiutarti ad analizzare"
  );

if(

  !partialResponse ||

  (
    isFallback &&
    currentIntent !== "greeting"
  )

){

  continue;

}

  if(partialResponse?.textIT){

    finalTextIT +=
      partialResponse.textIT + "\n\n";

  }

  if(partialResponse?.textEN){

    finalTextEN +=
      partialResponse.textEN + "\n\n";

  }

}

// =========================================
// 🧠 FINAL RESPONSE
// =========================================

const response = {

  type:
    intent.intent ||
    "generic",

  confidence:
    0.99,

  textIT:
    finalTextIT.trim(),

  textEN:
    finalTextEN.trim(),

  suggestionsIT: [],

  suggestionsEN: []

};

    console.log(
  "🔥 FINAL ORCHESTRATOR RESPONSE:",
  response
);

// =========================================
// 🧠 KNOWLEDGE ENHANCEMENT
// =========================================

if(

  matchedKnowledge.length &&

  response.type === "education"

){

  const best =

    matchedKnowledge[0]
      .item;

  if(
    window.currentLang === "en"
  ){

    response.textEN +=

`\n\n${best.aiInsightEN || ""}`;

  }

  else{

    response.textIT +=

`\n\n${best.aiInsightIT || ""}`;

  }

}

    // =========================================
    // 💾 MEMORY SAVE
    // =========================================

    if(window.rbSaveMemory){

      window.rbSaveMemory({

        lastMessage: text,

        lastIntent:
          intent.intent || null,

        lastCity:
          entities.city || null,

        lastROI:
          entities.roi || null

      });

    }

    // =========================================
    // 🧠 DEBUG
    // =========================================

    console.log(
      "🧠 AI PIPELINE:",
      {

        entities,

        intent,

        memory,

        matchedKnowledge,

        response

      }
    );

    // =========================================
    // ✅ FINAL RESPONSE
    // =========================================

    return {

  success: true,

  entities,

  intent,

  memory,

  advisor,

  matchedKnowledge,

  response

};

  }

  catch(error){

    console.error(
      "❌ AI ORCHESTRATOR ERROR:",
      error
    );

    return {

      success: false,

      response: {

        textIT:
`⚠️ Si è verificato un errore AI.`,

        textEN:
`⚠️ An AI error occurred.`

      }

    };

  }

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 CHATBOT ORCHESTRATOR READY"
);
