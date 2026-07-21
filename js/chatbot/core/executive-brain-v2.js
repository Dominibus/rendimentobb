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

followUpIT: "",

followUpEN: "",

strongestPointIT: "",

strongestPointEN: "",

weakestPointIT: "",

weakestPointEN: "",

actionIT: "",

actionEN: "",

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
            "L'investimento mostra un equilibrio convincente tra redditività, rischio e sostenibilità operativa.";

        result.summaryEN =
            "The investment shows a convincing balance between profitability, risk and operational sustainability.";

        break;

    case "roi":

        result.summaryIT =
            "Il rendimento dell'investimento rappresenta il principale elemento competitivo dell'operazione.";

        result.summaryEN =
            "The investment return represents the main competitive strength of the operation.";

        break;

    case "cashflow":

        result.summaryIT =
            "La simulazione evidenzia una buona capacità di generare liquidità grazie a un cashflow positivo.";

        result.summaryEN =
            "The simulation highlights a good ability to generate liquidity thanks to positive cashflow.";

        break;

    case "occupancy":

        result.summaryIT =
            "L'elevato tasso di occupazione contribuisce a sostenere la redditività prevista.";

        result.summaryEN =
            "High occupancy contributes to sustaining the expected profitability.";

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
        "Non emergono elementi critici tali da compromettere l'equilibrio dell'investimento, anche se alcuni aspetti meritano comunque monitoraggio nel tempo.";

    result.explanationEN =
        "No critical issues emerge that would compromise the investment balance, although some aspects should continue to be monitored over time.";

}

// ===============================================
// 💪 EXECUTIVE POINTS
// ===============================================

switch(strongestPoint){

    case "overall":

        result.strongestPointIT =
            "L'investimento risulta ben bilanciato tra rendimento, rischio e sostenibilità.";

        result.strongestPointEN =
            "The investment is well balanced between return, risk and sustainability.";

        break;

    case "roi":

        result.strongestPointIT =
            "Il ROI rappresenta il principale punto di forza dell'operazione.";

        result.strongestPointEN =
            "ROI is the main strength of this investment.";

        break;

    case "cashflow":

        result.strongestPointIT =
            "Il cashflow positivo garantisce una buona sostenibilità economica.";

        result.strongestPointEN =
            "Positive cashflow provides strong financial sustainability.";

        break;

    case "occupancy":

        result.strongestPointIT =
            "L'elevata occupazione sostiene la redditività dell'immobile.";

        result.strongestPointEN =
            "High occupancy supports the property's profitability.";

        break;

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
