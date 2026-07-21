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

window.rbBuildExecutiveResponse = function({

    executiveContext = {},

    advisor = null,

    documentKnowledge = {},

    executiveNarrative = null,

    investmentScore = null,

    brain = null,

    reasoning = null

} = {}){

  const {

    liveData = {}

} = executiveContext;

const financials =

    getExecutiveFinancialData(
        liveData
    );

 const executiveModel = {

    financials,

    advisor,

    executiveNarrative,

    investmentScore,

    documentKnowledge,

    brain,

    reasoning

};

console.log(
    "🧠 EXECUTIVE MODEL",
    executiveModel
);   

console.log(
    "🧠 EXECUTIVE BUILDER",
    financials
);

// ===============================================
// 🧠 EXECUTIVE RESPONSE BLOCKS
// ===============================================

const blocksIT = [];

const blocksEN = [];

let textIT = "";

let textEN = "";

// ===============================================
// 🔴 VERDICT BLOCK
// ===============================================

if(advisor){

    blocksIT.push(

`🔴 VERDETTO AI: ${
    advisor.verdictIT ||
    advisor.verdict ||
    "-"
}`

    );

    blocksEN.push(

`🔴 AI VERDICT: ${
    advisor.verdictEN ||
    advisor.verdict ||
    "-"
}`

    );

}

// ===============================================
// 💡 EXECUTIVE RECOMMENDATION BLOCK
// ===============================================

if(executiveNarrative?.recommendationIT){

    blocksIT.push(
        executiveNarrative.recommendationIT
    );

}

if(executiveNarrative?.recommendationEN){

    blocksEN.push(
        executiveNarrative.recommendationEN
    );

}

// ===============================================
// 🧠 EXECUTIVE SUMMARY BLOCK
// ===============================================

if(brain?.executiveSummary?.it){

    blocksIT.push(
        brain.executiveSummary.it
    );

}

if(brain?.executiveSummary?.en){

    blocksEN.push(
        brain.executiveSummary.en
    );

}

// ===============================================
// 🧠 BUILD FINAL RESPONSE
// ===============================================

textIT = blocksIT.join("\n\n");

textEN = blocksEN.join("\n\n");

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
