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

    investmentScore = null

} = {}){

  const {

    liveData = {}

} = executiveContext;

const financials =

    getExecutiveFinancialData(
        liveData
    );

console.log(
    "🧠 EXECUTIVE BUILDER",
    financials
);

    return {

        type: "executive",

        confidence: 0.99,

        executiveNarrative,

        executiveContext,

        textIT: "",

        textEN: "",

        suggestionsIT: [],

        suggestionsEN: [],

        signals: [],

        metadata: {}

    };

};

console.log(
    "🧠 EXECUTIVE RESPONSE BUILDER READY"
);
