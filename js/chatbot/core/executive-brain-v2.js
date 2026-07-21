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

    return result;

};

console.log(
    "🧠 EXECUTIVE BRAIN V2 READY"
);

})();
