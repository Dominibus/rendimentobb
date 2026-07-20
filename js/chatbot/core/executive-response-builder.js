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

    let textIT = "";

let textEN = "";

if(advisor){

    textIT +=
`🔴 VERDETTO AI: ${
    advisor.verdictIT ||
    advisor.verdict ||
    "-"
}

`;

    textEN +=
`🔴 AI VERDICT: ${
    advisor.verdictEN ||
    advisor.verdict ||
    "-"
}

`;

}

if(executiveNarrative?.recommendationIT){

    textIT +=
        executiveNarrative.recommendationIT +
        "\n\n";

}

if(executiveNarrative?.recommendationEN){

    textEN +=
        executiveNarrative.recommendationEN +
        "\n\n";

}

if(brain?.executiveSummary?.it){

    textIT +=
        brain.executiveSummary.it +
        "\n\n";

}

if(brain?.executiveSummary?.en){

    textEN +=
        brain.executiveSummary.en +
        "\n\n";

}

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
