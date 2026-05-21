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

        simulationsCount: 0

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

    if(profile.simulationsCount >= 20){

      profile.experienceLevel = "advanced";

    }

    else if(profile.simulationsCount >= 8){

      profile.experienceLevel = "intermediate";

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

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 INVESTOR PROFILE ENGINE READY"
);
