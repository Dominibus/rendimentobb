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

    analysisData,

    aiSignals

  });

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

  textIT: finalTextIT.trim(),

  textEN: finalTextEN.trim()

};

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
