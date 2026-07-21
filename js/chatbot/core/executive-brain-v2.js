// ===============================================
// 🧠 RENDIMENTOBB - EXECUTIVE BRAIN V2
// Silicon Valley Decision Engine
// ===============================================

(function(){

"use strict";

// ===============================================
// 🧠 EXECUTIVE BRAIN
// ===============================================

window.rbExecutiveBrain = function({

    intent = {},

    advisor = {},

    executiveContext = {},

    conversationContext = {},

    reasoning = {},

    narrative = {},

    documentKnowledge = {},

    financials = {}

} = {}){

    const result = {

        titleIT: "",

        titleEN: "",

        summaryIT: "",

        summaryEN: "",

        explanationIT: "",

        explanationEN: "",

        recommendationsIT: [],

        recommendationsEN: [],

        followUpIT: "",

        followUpEN: "",

        confidence: 0.90

    };

// ===============================================
// 📊 EXECUTIVE SCORE ANALYSIS
// ===============================================

const roi =
    Number(financials.roi || 0);

const risk =
    Number(financials.risk || 0);

const occupancy =
    Number(financials.occupancy || 0);

const cashflow =
    Number(financials.net || 0);

let strongestPoint = "";

let weakestPoint = "";

let executiveDecision = "WAIT";

// ===============================================
// 🟢 STRENGTH
// ===============================================

if(
    roi >= 20 &&
    risk <= 35 &&
    cashflow > 0
){

    strongestPoint =
        "overall";

    executiveDecision =
        "BUY";

}

else if(
    roi >= 20
){

    strongestPoint =
        "roi";

}

else if(
    cashflow > 0
){

    strongestPoint =
        "cashflow";

}

else if(
    occupancy >= 70
){

    strongestPoint =
        "occupancy";

}

// ===============================================
// 🔴 WEAKNESS
// ===============================================

if(
    risk >= 70
){

    weakestPoint =
        "risk";

}

else if(
    cashflow <= 0
){

    weakestPoint =
        "cashflow";

}

else if(
    occupancy < 55
){

    weakestPoint =
        "occupancy";

}

result.analysis = {

    strongestPoint,

    weakestPoint,

    executiveDecision,

    roi,

    risk,

    occupancy,

    cashflow

};

// ===============================================
// 🧠 EXECUTIVE REASONING
// ===============================================

switch(strongestPoint){

    case "overall":

        result.summaryIT =
            "La simulazione presenta un equilibrio molto competitivo tra rendimento, rischio e sostenibilità.";

        result.summaryEN =
            "The simulation shows a highly competitive balance between return, risk and sustainability.";

        break;

    case "roi":

        result.summaryIT =
            "Il principale punto di forza dell'investimento è il ROI.";

        result.summaryEN =
            "The main strength of the investment is its ROI.";

        break;

    case "cashflow":

        result.summaryIT =
            "Il cashflow positivo rappresenta l'elemento più solido della simulazione.";

        result.summaryEN =
            "Positive cashflow is the strongest element of the simulation.";

        break;

    case "occupancy":

        result.summaryIT =
            "L'elevata occupazione sostiene la redditività dell'investimento.";

        result.summaryEN =
            "High occupancy supports the investment profitability.";

        break;

}  

    switch(weakestPoint){

    case "risk":

        result.explanationIT =
            "L'elemento che richiede maggiore attenzione è il livello di rischio operativo.";

        result.explanationEN =
            "The main point requiring attention is the operational risk.";

        break;

    case "cashflow":

        result.explanationIT =
            "Il cashflow attuale limita la sostenibilità dell'investimento.";

        result.explanationEN =
            "Current cashflow limits the investment sustainability.";

        break;

    case "occupancy":

        result.explanationIT =
            "L'occupazione rappresenta il principale margine di miglioramento.";

        result.explanationEN =
            "Occupancy represents the biggest improvement opportunity.";

        break;

    default:

        result.explanationIT =
            "La simulazione non evidenzia criticità rilevanti.";

        result.explanationEN =
            "The simulation does not highlight significant weaknesses.";

}

// ===============================================
// 💡 EXECUTIVE INSIGHT
// ===============================================

result.insight = {

    decision: executiveDecision,

    strongestPoint,

    weakestPoint,

    confidence: result.confidence,

    hasCriticalIssue:
        weakestPoint === "risk" ||
        weakestPoint === "cashflow",

    hasStrongInvestment:
        executiveDecision === "BUY" &&
        strongestPoint === "overall"

};

    return result;

};

console.log(
    "🧠 EXECUTIVE BRAIN V2 READY"
);

})();
