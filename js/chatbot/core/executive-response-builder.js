// ===============================================
// 🧠 EXECUTIVE RESPONSE BUILDER
// Silicon Valley AI 2026
// ===============================================

function getExecutiveFinancialData(
    liveData = {}
){

  const rawNet =

    liveData.net ??
    liveData.netProfit ??
    liveData.profitNet ??
    liveData.cashflow ??
    null;

  const rawGross =

    liveData.gross ??
    liveData.grossProfit ??
    liveData.profit ??
    liveData.revenue ??
    0;

  const net =

    rawNet !== undefined &&
    rawNet !== null &&
    rawNet !== "" &&
    !isNaN(Number(rawNet))

      ? Number(rawNet)

      : Number(rawGross || 0);

  const gross =
    Number(rawGross || 0);

  return {

    rawNet,
    rawGross,
    net,
    gross

  };

}

// ===============================================
// 🧱 VERDICT BLOCK
// ===============================================

function buildVerdictBlock(advisor){

    if(!advisor){

        return{

            it:null,

            en:null

        };

    }

   const canonicalInvestment =
    window.lastInvestmentScore || {};

const verdict =
    canonicalInvestment.verdict ||
    advisor?.verdict ||
    "";

    let icon = "⚪";

    if(verdict === "BUY"){

        icon = "🟢";

    }

    else if(verdict === "WAIT"){

        icon = "🟡";

    }

    else if(verdict === "NO_BUY"){

        icon = "🔴";

    }

    return{

        it:

`${icon} VERDETTO AI: ${
    advisor?.verdictIT ||
     verdict ||
    "-"
}`,

        en:

`${icon} AI VERDICT: ${
    advisor?.verdictEN ||
      verdict ||
    "-"
}`

    };

}

window.rbBuildExecutiveResponse = function({

    executiveContext = {},

    advisor = null,

    documentKnowledge = {},

    executiveNarrative = null,

    investmentScore = null,

    brain = null,

    executiveBrain = null,

    reasoning = null,

    intent = {},

    message = "",

    aiSignals = [],

    financials = {}

} = {}){

  const {

    liveData = {}

} = executiveContext;

const executiveFinancials =

    Object.keys(financials || {}).length

        ? financials

        : getExecutiveFinancialData(
              liveData
          );

const executiveModel = {

    financials: executiveFinancials,

    advisor,

    executiveNarrative,

    investmentScore,

    documentKnowledge,

    brain,

    executiveBrain,

    reasoning

};

console.log(
    "🧠 EXECUTIVE MODEL",
    executiveModel
);   

    console.log(
    "🧠 EXECUTIVE BRAIN IN BUILDER",
    executiveBrain
);

console.log(
    "🧠 EXECUTIVE BUILDER",
    executiveFinancials
);
    
// ===============================================
// 🧠 EXECUTIVE RESPONSE BLOCKS
// ===============================================

const blocksIT = [];

const blocksEN = []; 

let textIT = "";

let textEN = "";

// ===============================================
// 🧠 CONTEXT ROUTER
// ===============================================

const currentIntent =

    intent?.intent ||

    "generic";

const context = {

    isExecutive:

        [
            "investment_executive",
            "executive_analysis"
        ].includes(currentIntent),

    isRisk:

        currentIntent ===
        "risk_analysis",

    isROI:

        currentIntent ===
        "roi_analysis",

    isStrategy:

        [
            "investment_strategy",
            "investment_advisor"
        ].includes(currentIntent),

    isReport:

        currentIntent ===
        "report_interpretation"

};       

// ===============================================
// 🔴 VERDICT BLOCK
// ===============================================

const verdictBlock =

    buildVerdictBlock(
        advisor
    );

if(verdictBlock.it){

    blocksIT.push(
        verdictBlock.it
    );

}

if(verdictBlock.en){

    blocksEN.push(
        verdictBlock.en
    );

}

// ===============================================
// 💡 EXECUTIVE RECOMMENDATION BLOCK
// ===============================================

if(executiveNarrative?.recommendationIT){

    const scoreBlockIT =
        investmentScore?.score != null
            ? `Investment Score: ${investmentScore.score}/100\n${investmentScore.labelIT || ""}\n\n`
            : "";

    const scoreBlockEN =
        investmentScore?.score != null
            ? `Investment Score: ${investmentScore.score}/100\n${investmentScore.labelEN || ""}\n\n`
            : "";

    blocksIT.push(

        "Ho analizzato la simulazione dell'investimento.\n\n" +

        scoreBlockIT

    );

    blocksEN.push(

        "I analyzed the investment simulation.\n\n" +

        scoreBlockEN

    );

}
// ===============================================
// 🧠 EXECUTIVE SUMMARY
// ===============================================

if(executiveBrain?.summaryIT){

    blocksIT.push(

        executiveBrain.summaryIT

    );

}

if(executiveBrain?.summaryEN){

    blocksEN.push(

        "🧠 AI Analysis\n\n" +

        executiveBrain.summaryEN

    );

}

// ===============================================
// 📌 EXECUTIVE EXPLANATION
// ===============================================

if(executiveBrain?.explanationIT){

    blocksIT.push(

        executiveBrain.explanationIT

    );

}

if(executiveBrain?.explanationEN){

    blocksEN.push(

       executiveBrain.explanationEN

    );

}

// ===============================================
// 💪 STRONGEST POINT
// ===============================================

if(executiveBrain?.strongestPointIT){

    blocksIT.push(

        "💪 Punto di forza\n\n" +

        executiveBrain.strongestPointIT

    );

}

if(executiveBrain?.strongestPointEN){

    blocksEN.push(

        "💪 Strongest Point\n\n" +

        executiveBrain.strongestPointEN

    );

}
    
// ===============================================
// 🧠 EXECUTIVE SUMMARY BLOCK
// ===============================================

if(

    !executiveNarrative?.recommendationIT &&

    brain?.executiveSummary?.it

){

    blocksIT.push(

        brain.executiveSummary.it

    );

}

if(

    !executiveNarrative?.recommendationEN &&

    brain?.executiveSummary?.en

){

    blocksEN.push(

        brain.executiveSummary.en

    );

}

// ===============================================
// 🧠 CONTEXT FILTER
// ===============================================

if(context.isROI){

    blocksIT.length = 0;

    blocksEN.length = 0;

    if(verdictBlock.it)
        blocksIT.push(verdictBlock.it);

    if(verdictBlock.en)
        blocksEN.push(verdictBlock.en);

    if(executiveBrain?.summaryIT)
        blocksIT.push(executiveBrain.summaryIT);

    if(executiveBrain?.summaryEN)
        blocksEN.push(executiveBrain.summaryEN);

}

else if(context.isRisk){

    blocksIT.length = 0;

    blocksEN.length = 0;

    if(verdictBlock.it)
        blocksIT.push(verdictBlock.it);

    if(verdictBlock.en)
        blocksEN.push(verdictBlock.en);

    if(executiveBrain?.explanationIT)
        blocksIT.push(executiveBrain.explanationIT);

    if(executiveBrain?.explanationEN)
        blocksEN.push(executiveBrain.explanationEN);

}

else if(context.isReport){

    blocksIT.length = 0;

    blocksEN.length = 0;

    if(brain?.executiveSummary?.it)
        blocksIT.push(brain.executiveSummary.it);

    if(brain?.executiveSummary?.en)
        blocksEN.push(brain.executiveSummary.en);

}

// ===============================================
// 🧠 BUILD FINAL RESPONSE
// ===============================================

textIT =
    blocksIT
        .filter(Boolean)
        .join("\n\n");

textEN =
    blocksEN
        .filter(Boolean)
        .join("\n\n");

return {

    type: "executive",

    confidence: 0.99,

    executiveNarrative,

    executiveContext,

    textIT,

    textEN,

    suggestionsIT: [],

    suggestionsEN: [],

    signals: [],

    metadata: {}

};

};

console.log(
    "🧠 EXECUTIVE RESPONSE BUILDER READY"
);
