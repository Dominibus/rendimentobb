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
    // 🧠 INTENT DETECTION
    // =========================================

    const intent =

      window.rbDetectIntent

      ? window.rbDetectIntent(text)

      : {

          intent: "generic"

        };

    // =========================================
    // 🧠 MEMORY
    // =========================================

    const memory =

      window.rbGetMemory

      ? window.rbGetMemory()

      : {};

    // =========================================
    // 📊 ANALYSIS DATA
    // =========================================

    const analysisData =

      window.lastAnalysisData ||

      {};

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

if(
  matchedKnowledge.length
){

  entities.knowledge =

    matchedKnowledge[0].key;

}

    // =========================================
    // 🧠 RESPONSE ENGINE
    // =========================================

    const response =

      window.rbGenerateResponse({

        message: text,

        entities,

        intent,

        memory,

        analysisData

      });

    // =========================================
    // 🧠 KNOWLEDGE ENHANCEMENT
    // =========================================

    if(
      matchedKnowledge.length
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
