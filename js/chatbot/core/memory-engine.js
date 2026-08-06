// ===============================================
// 🧠 RENDIMENTOBB – MEMORY ENGINE 1.0
// Silicon Valley Conversational Memory Layer
// Persistent Context + Session Intelligence
// ===============================================

// ===============================================
// 🧠 MEMORY FACTORY
// Single source of truth for memory structure
// ===============================================

function createEmptyMemory(){

  return {

    messages: [],

    entitiesHistory: [],

    intentsHistory: [],

    lastCity: null,

    lastROI: null,

    lastPropertyPrice: null,

    lastOccupancy: null,

    lastMortgage: null,

    lastRisk: null,

    lastCashflow: null,

    lastIntent: null,

    lastBudget: null,

    lastStrategy: null,

    lastRiskTolerance: null,

    lastPropertyType: null,

    lastTargetROI: null,

    lastFinancingLevel: null,

    availableCapital: null,

    monthlyCashflowGoal: null,

    ownedProperties: 0,

    businessStage: "starter",

    mainGoal: null,

    portfolioCities: [],

    portfolioProperties: [],

    investmentHistory: [],

    context: {},

    executiveProfile: {

      investorType: null,

      preferredCities: [],

      preferredStrategy: null,

      preferredRisk: null,

      preferredBudget: null,

      preferredPropertyType: null,

      conversationStage: "discovery",

      confidence: 0

    }

  };

}


// ===============================================
// 🧠 GLOBAL MEMORY
// ===============================================

window.rbChatMemory =
  createEmptyMemory();

// ===============================================
// 💾 SAVE MESSAGE
// ===============================================

window.rbRememberMessage = function({

  role = "user",

  message = "",

  entities = {},

  intent = {}

} = {}){

  try{

    const memory =
      window.rbChatMemory;

    // ===========================================
    // 💬 STORE MESSAGE
    // ===========================================

    memory.messages.push({

      role,

      message,

      timestamp: Date.now()

    });

    // ===========================================
    // 🧠 STORE ENTITIES
    // ===========================================

    if(
      entities &&
      Object.keys(entities).length
    ){

      memory.entitiesHistory.push(
        entities
      );

      // =======================================
      // 🌍 LAST CITY
      // =======================================

      if(entities.city){

        memory.lastCity =
          entities.city;

      }

      // =======================================
      // 📈 LAST ROI
      // =======================================

      if(entities.roi){

        memory.lastROI =
          entities.roi;

      }

// =======================================
// 🏠 LAST PROPERTY PRICE
// =======================================

if(entities.propertyPrice){

  memory.lastPropertyPrice =
    entities.propertyPrice;

}

// =======================================
// 🎯 TARGET ROI
// =======================================

if(entities.targetROI){

  memory.lastTargetROI =
    entities.targetROI;

}

// =======================================
// 🏦 FINANCING LEVEL
// =======================================

if(entities.financingLevel){

  memory.lastFinancingLevel =
    entities.financingLevel;

}

// =======================================
// 🏨 PROPERTY TYPE
// =======================================

if(entities.propertyType){

  memory.lastPropertyType =
    entities.propertyType;

}

// =======================================
// ⚠️ RISK PROFILE
// =======================================

if(entities.riskTolerance){

  memory.lastRiskTolerance =
    entities.riskTolerance;

}

// =======================================
// 📈 STRATEGY
// =======================================

if(entities.strategy){

  memory.lastStrategy =
    entities.strategy;

}

// =======================================
// 💰 AVAILABLE CAPITAL
// =======================================

if(entities.availableCapital){

  memory.availableCapital =
    entities.availableCapital;

}

// =======================================
// 💸 CASHFLOW GOAL
// =======================================

if(entities.monthlyCashflowGoal){

  memory.monthlyCashflowGoal =
    entities.monthlyCashflowGoal;

}

// =======================================
// 🏠 OWNED PROPERTIES
// =======================================

if(
  entities.ownedProperties !== null &&
  entities.ownedProperties !== undefined
){

  memory.ownedProperties =
    entities.ownedProperties;

}

// =======================================
// 🎯 MAIN GOAL
// =======================================

if(entities.mainGoal){

  memory.mainGoal =
    entities.mainGoal;

}

// =======================================
// 🚀 BUSINESS STAGE
// =======================================

if(entities.businessStage){

  memory.businessStage =
    entities.businessStage;

}

      // =======================================
      // 🏨 LAST OCCUPANCY
      // =======================================

      if(entities.occupancy){

        memory.lastOccupancy =
          entities.occupancy;

      }

// =======================================
// 🏦 LAST MORTGAGE
// =======================================

if(
  entities.mortgage !== null &&
  entities.mortgage !== undefined
){

  memory.lastMortgage =
    entities.mortgage;

}

// ===========================================
// 📊 SAVE INVESTMENT SNAPSHOT
// SOLO ANALISI REALI
// ===========================================

if(

  entities.roi &&
  entities.net &&
  entities.propertyPrice

){

  const investmentSnapshot = {

    roi: entities.roi,

    city: entities.city || null,

    occupancy: entities.occupancy ?? null,

    mortgage: entities.mortgage ?? null,

    risk: entities.risk ?? null,

    net: entities.net,

    cashflow:
      entities.cashflow ??
      entities.net,

    propertyPrice: entities.propertyPrice,

    score: entities.score ?? null,

    timestamp: Date.now()

  };

  memory.investmentHistory.push(
    investmentSnapshot
  );

  // =======================================
  // 🔄 SYNC ACTIVE INVESTMENT CONTEXT
  // =======================================

  memory.lastROI =
    investmentSnapshot.roi;

  memory.lastCity =
    investmentSnapshot.city ||
    memory.lastCity;

  memory.lastOccupancy =
    investmentSnapshot.occupancy;

  memory.lastRisk =
    investmentSnapshot.risk;

  memory.lastCashflow =
    investmentSnapshot.cashflow;

  memory.lastPropertyPrice =
    investmentSnapshot.propertyPrice;

  memory.lastMortgage =
    investmentSnapshot.mortgage;

  // 🧹 CLEAN INVALID SNAPSHOTS

  memory.investmentHistory =
    memory.investmentHistory.filter(
      item =>
        item &&
        item.roi &&
        item.net &&
        item.propertyPrice
    );

}
}
    // ===========================================
    // 🧠 STORE INTENT
    // ===========================================

    if(intent?.intent){

      memory.intentsHistory.push(
        intent.intent
      );

      memory.lastIntent =
        intent.intent;

    }

    // ===========================================
    // 🧹 LIMIT MEMORY
    // ===========================================

    if(memory.messages.length > 50){

      memory.messages.shift();

    }

    if(memory.entitiesHistory.length > 30){

      memory.entitiesHistory.shift();

    }

    if(memory.intentsHistory.length > 30){

      memory.intentsHistory.shift();

    }

    // ===========================================
    // 💾 SAVE SESSION
    // ===========================================

    localStorage.setItem(
    "rbChatMemory",
    JSON.stringify(memory)
    );

    if(window.RB_DEBUG === true){

  console.log(
    "🧠 MEMORY UPDATED:",
    memory
  );

}

  }

  catch(error){

    console.error(
      "❌ MEMORY ERROR:",
      error
    );

  }

};

// ===============================================
// 📥 LOAD MEMORY
// ===============================================

window.rbLoadMemory = function(){

  try{

    const saved =
  localStorage.getItem(
    "rbChatMemory"
  ) ||
  sessionStorage.getItem(
    "rbChatMemory"
  );

    if(saved){

      window.rbChatMemory =
        JSON.parse(saved);

      localStorage.setItem(
  "rbChatMemory",
  saved
);

sessionStorage.removeItem(
  "rbChatMemory"
);

      console.log(
        "🧠 MEMORY LOADED"
      );

    }

  }

  catch(error){

    console.error(
      "❌ MEMORY LOAD ERROR:",
      error
    );

  }

};

// ===============================================
// 🧹 CLEAR MEMORY
// ===============================================

window.rbClearMemory = function(){

  window.rbChatMemory =
    createEmptyMemory();

  localStorage.removeItem(
  "rbChatMemory"
);

sessionStorage.removeItem(
  "rbChatMemory"
);

  console.log(
    "🧠 MEMORY CLEARED"
  );

};

// ===============================================
// 📊 GET CONTEXT
// ===============================================

window.rbGetConversationContext = function(){

  const messages =
    Array.isArray(window.rbChatMemory?.messages)
      ? window.rbChatMemory.messages.slice(-12)
      : [];

  const lastUserMessage =
    [...messages]
      .reverse()
      .find(item => item?.role === "user")
      ?.message || null;

  const lastAssistantMessage =
    [...messages]
      .reverse()
      .find(
        item =>
          item?.role === "bot" ||
          item?.role === "assistant"
      )
      ?.message || null;

  return {

    messages,

    lastUserMessage,

    lastAssistantMessage,

    city:
      window.rbChatMemory.lastCity,

    roi:
      window.rbChatMemory.lastROI,

    risk:
      window.rbChatMemory.lastRisk,

    cashflow:
      window.rbChatMemory.lastCashflow,

    propertyPrice:
      window.rbChatMemory.lastPropertyPrice,

    occupancy:
      window.rbChatMemory.lastOccupancy,

    mortgage:
      window.rbChatMemory.lastMortgage,

    lastIntent:
      window.rbChatMemory.lastIntent,

    // 🔥 NEW MEMORY

    budget:
      window.rbChatMemory.lastBudget,

    strategy:
      window.rbChatMemory.lastStrategy,

    riskTolerance:
      window.rbChatMemory.lastRiskTolerance,

    propertyType:
      window.rbChatMemory.lastPropertyType,

    targetROI:
      window.rbChatMemory.lastTargetROI,

    financingLevel:
  window.rbChatMemory.lastFinancingLevel,

availableCapital:
  window.rbChatMemory.availableCapital,

monthlyCashflowGoal:
  window.rbChatMemory.monthlyCashflowGoal,

ownedProperties:
  window.rbChatMemory.ownedProperties,

businessStage:
  window.rbChatMemory.businessStage,

mainGoal:
  window.rbChatMemory.mainGoal,

investmentHistory:
  window.rbChatMemory
  .investmentHistory || []

  };

};

// ===============================================
// 🚀 AUTO LOAD
// ===============================================

window.rbLoadMemory();

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 MEMORY ENGINE READY"
);
