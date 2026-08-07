// ===============================================
// 🧠 RENDIMENTOBB – INVESTOR PROFILE ENGINE 1.0
// Silicon Valley Behavioral AI Layer
// ===============================================

// ===============================================
// 🚀 MAIN PROFILE ENGINE
// ===============================================

window.rbUpdateInvestorProfile = function({

  entities = {},

  analysisData = {},

  memory = {}

} = {}){

  try{

    // ===========================================
    // 🧠 PROFILE BASE
    // ===========================================

    const profile =

      window.rbInvestorProfile ||

      {

        riskTolerance: "medium",

        investmentStyle: null,

        preferredMarkets: [],

        preferredPropertyTypes: [],

        targetROI: null,

        averageBudget: 0,

        leverageBehavior: "moderate",

        experienceLevel: "beginner",

        cashflowFocused: false,

        luxuryFocused: false,

        aggressiveInvestor: false,

        conservativeInvestor: false,

simulationsCount: 0,

// =====================================
// 🏠 INVESTOR DATA
// =====================================

availableCapital: 0,

monthlyCashflowGoal: 0,

ownedProperties: 0,

businessStage: "starter",

mainGoal: null,

investorType: "beginner",

portfolioSize: "small"

      };

    // ===========================================
    // 📈 SIMULATION COUNTER
    // ===========================================

    profile.simulationsCount++;

    // ===========================================
    // ⚠️ RISK PROFILE
    // ===========================================

    if(

      entities.riskTolerance

    ){

      profile.riskTolerance =

        entities.riskTolerance;

    }

    // ===========================================
    // 🎯 TARGET ROI
    // ===========================================

    if(

      entities.targetROI

    ){

      profile.targetROI =

        entities.targetROI;

    }

// ===========================================
// 💰 AVAILABLE CAPITAL
// ===========================================

if(entities.availableCapital){

  profile.availableCapital =
    entities.availableCapital;

}

// ===========================================
// 💸 CASHFLOW GOAL
// ===========================================

if(entities.monthlyCashflowGoal){

  profile.monthlyCashflowGoal =
    entities.monthlyCashflowGoal;

}

// ===========================================
// 🏠 OWNED PROPERTIES
// ===========================================

if(

  entities.ownedProperties !== null &&

  entities.ownedProperties !== undefined

){

  profile.ownedProperties =
    entities.ownedProperties;

}

    // ===========================================
    // 💰 BUDGET TRACKING
    // ===========================================

    const budget =

      Number(

        entities.price ||

        entities.amount ||

        0

      );

    if(budget > 0){

      if(profile.averageBudget <= 0){

        profile.averageBudget = budget;

      }

      else{

        profile.averageBudget = Math.round(

          (
            profile.averageBudget +
            budget
          ) / 2

        );

      }

    }

    // ===========================================
    // 🌍 PREFERRED MARKETS
    // ===========================================

    if(entities.city){

      if(

        !profile.preferredMarkets.includes(
          entities.city
        )

      ){

        profile.preferredMarkets.push(
          entities.city
        );

      }

    }

    // ===========================================
    // 🏠 PROPERTY TYPES
    // ===========================================

    if(entities.propertyType){

      if(

        !profile.preferredPropertyTypes.includes(
          entities.propertyType
        )

      ){

        profile.preferredPropertyTypes.push(
          entities.propertyType
        );

      }

    }

    // ===========================================
    // 🏦 LEVERAGE PROFILE
    // ===========================================

    const leverage =

      Number(

        entities.mortgagePercent ||

        analysisData.mortgagePercent ||

        0

      );

    if(leverage >= 80){

      profile.leverageBehavior =
        "aggressive";

    }

    else if(leverage >= 50){

      profile.leverageBehavior =
        "moderate";

    }

    else if(leverage > 0){

      profile.leverageBehavior =
        "conservative";

    }

    // ===========================================
    // 💸 CASHFLOW INVESTOR
    // ===========================================

    if(

      entities.investmentGoal ===
      "cashflow"

    ){

      profile.cashflowFocused = true;

    }

    // ===========================================
    // 💎 LUXURY PROFILE
    // ===========================================

    if(

      entities.strategy ===
      "luxury"

    ){

      profile.luxuryFocused = true;

    }

    // ===========================================
    // 🚀 AGGRESSIVE INVESTOR
    // ===========================================

    if(

      profile.targetROI >= 20 ||

      profile.leverageBehavior ===
      "aggressive"

    ){

      profile.aggressiveInvestor = true;

    }

    // ===========================================
    // 🛡️ CONSERVATIVE INVESTOR
    // ===========================================

    if(

      profile.riskTolerance === "low" ||

      profile.targetROI <= 10

    ){

      profile.conservativeInvestor = true;

    }

// ===========================================
// 🎓 EXPERIENCE LEVEL
// ===========================================

if(

  profile.ownedProperties >= 10 ||

  profile.availableCapital >= 500000

){

  profile.experienceLevel =
    "advanced";

}

else if(

  profile.ownedProperties >= 3 ||

  profile.availableCapital >= 100000 ||

  profile.monthlyCashflowGoal >= 5000 ||

  profile.simulationsCount >= 8

){

  profile.experienceLevel =
    "experienced";

}

else if(

  profile.ownedProperties >= 1 ||

  profile.simulationsCount >= 3

){

  profile.experienceLevel =
    "intermediate";

}

else{

  profile.experienceLevel =
    "beginner";

}

// ===========================================
// 🏢 INVESTOR TYPE
// ===========================================

if(profile.ownedProperties >= 10){

  profile.investorType =
    "professional";

}

else if(profile.ownedProperties >= 3){

  profile.investorType =
    "investor";

}

else if(profile.ownedProperties >= 1){

  profile.investorType =
    "host";

}

else{

  profile.investorType =
    "beginner";

}

// ===========================================
// 📊 PORTFOLIO SIZE
// ===========================================

if(profile.ownedProperties >= 10){

  profile.portfolioSize =
    "large";

}

else if(profile.ownedProperties >= 3){

  profile.portfolioSize =
    "medium";

}

else{

  profile.portfolioSize =
    "small";

}

// ===========================================
// 🚀 BUSINESS STAGE
// ===========================================

if(profile.ownedProperties >= 10){

  profile.businessStage =
    "enterprise";

}

else if(profile.ownedProperties >= 3){

  profile.businessStage =
    "growth";

}

else if(profile.ownedProperties >= 1){

  profile.businessStage =
    "operator";

}

else{

  profile.businessStage =
    "starter";

}

// ===========================================
// 🎯 MAIN GOAL
// ===========================================

if(

  profile.monthlyCashflowGoal >= 5000

){

  profile.mainGoal =
    "financial_freedom";

}

else if(

  profile.monthlyCashflowGoal > 0

){

  profile.mainGoal =
    "supplement_income";

}   

// ===========================================
// 🧠 INVESTOR SEGMENT
// ===========================================

if(

  profile.availableCapital >= 100000 &&

  profile.ownedProperties >= 3

){

  profile.investorSegment =
    "portfolio_builder";

}

if(

  profile.monthlyCashflowGoal >= 5000

){

  profile.investorSegment =
    "cashflow_investor";

}

if(

  profile.availableCapital >= 500000

){

  profile.investorSegment =
    "professional_investor";

}

// ===========================================
// 🧠 MEMORY SYNC
// ===========================================

const memoryData =
  window.rbGetConversationContext?.() || {};

if(

  memoryData.availableCapital &&

  !profile.availableCapital

){

  profile.availableCapital =
    memoryData.availableCapital;

}

if(

  memoryData.monthlyCashflowGoal &&

  !profile.monthlyCashflowGoal

){

  profile.monthlyCashflowGoal =
    memoryData.monthlyCashflowGoal;

}

if(

  memoryData.ownedProperties !== undefined &&

  profile.ownedProperties === 0

){

  profile.ownedProperties =
    memoryData.ownedProperties;

}

    // ===========================================
    // 💾 SAVE GLOBAL
    // ===========================================

    window.rbInvestorProfile =
      profile;

    // ===========================================
    // 💾 SAVE SESSION
    // ===========================================

    sessionStorage.setItem(

      "rbInvestorProfile",

      JSON.stringify(profile)

    );

    // ===========================================
    // 🧠 DEBUG
    // ===========================================

    console.log(
      "🧠 INVESTOR PROFILE UPDATED:",
      profile
    );

    return profile;

  }

  catch(error){

    console.error(
      "❌ INVESTOR PROFILE ERROR:",
      error
    );

    return null;

  }

};

// ===============================================
// 📥 LOAD PROFILE
// ===============================================

window.rbLoadInvestorProfile = function(){

  try{

    const saved =

      sessionStorage.getItem(
        "rbInvestorProfile"
      );

    if(saved){

      window.rbInvestorProfile =

        JSON.parse(saved);

      console.log(
        "🧠 INVESTOR PROFILE LOADED"
      );

    }

  }

  catch(error){

    console.error(
      "❌ PROFILE LOAD ERROR:",
      error
    );

  }

};

// ===============================================
// 🚀 AUTO LOAD
// ===============================================

window.rbLoadInvestorProfile();

// Production: nessun log
