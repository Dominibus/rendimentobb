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

    documentReasoning = {},

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

executiveNarrativeIT: "",

executiveNarrativeEN: "",    

analysisIT: "",

analysisEN: "",        

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

const mortgagePercent =
    Number(financials.mortgagePercent || 0);    

let strongestPoint = "";

let weakestPoint = "";

const executiveDecision =
    advisor?.verdict ||
    "WAIT";

// ===============================================
// 🧠 DOCUMENT AI CONTEXT
// ===============================================

const aiContext =

    documentReasoning.executiveContextAI ||

    {};

const aiPortfolio =

    aiContext.portfolio ||

    {};

const aiStrategy =

    aiContext.strategy ||

    {};

const aiAnalysis =

    aiContext.analysis ||

    {};

const aiInsights =

    aiAnalysis.insights ||

    [];

const aiRecommendations =

    aiStrategy.recommendations ||

    [];

const portfolioHealth =

    aiPortfolio.health ||

    "unknown";

const portfolioTrend =

    aiPortfolio.trend ||

    "unknown";    

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
// 🧠 EXECUTIVE STRATEGIC LAYER
// ===============================================

result.executiveAI = {

    portfolioHealth,

    portfolioTrend,

    insights: aiInsights,

    recommendations: aiRecommendations,

    summary:

        aiStrategy.summary ||

        null,

    decision:

        aiStrategy.decision ||

        null

};

result.actionPlan = [

    ...aiRecommendations

];

if(

    portfolioHealth === "excellent"

){

    result.executiveLevel =

        "elite";

}

else if(

    portfolioHealth === "good"

){

    result.executiveLevel =

        "professional";

}

else if(

    portfolioHealth === "balanced"

){

    result.executiveLevel =

        "standard";

}

else{

    result.executiveLevel =

        "attention";

}    


// ===============================================
// 🧠 EXECUTIVE EXPLAINABILITY
// ===============================================

result.explainability = {

    health: portfolioHealth,

    trend: portfolioTrend,

    decision: executiveDecision,

    strongestPoint,

    weakestPoint,

    confidence:

        result.confidence,

    insights:

        aiInsights,

    recommendations:

        aiRecommendations

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

    if(

        roi >= 10 &&

        risk <= 35

    ){

        result.summaryIT =
            "Il cashflow positivo rappresenta un elemento favorevole, ma il rendimento complessivo dell'operazione può ancora essere migliorato per rendere l'investimento più competitivo.";

    }

    else{

        result.summaryIT =
            "Il cashflow positivo dimostra che l'immobile è in grado di generare liquidità, contribuendo alla sostenibilità economica dell'investimento.";

    }

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
// ⚠️ EXECUTIVE WEAK POINT
// ===============================================

switch(weakestPoint){

    case "risk":

        result.weakestPointIT =
            "Il livello di rischio rappresenta la principale criticità dell'operazione.";

        result.weakestPointEN =
            "Risk level represents the main weakness of the investment.";

        break;

    case "cashflow":

        result.weakestPointIT =
            "Il cashflow rappresenta la principale criticità dell'operazione.";

        result.weakestPointEN =
            "Cashflow represents the main weakness of the investment.";

        break;

    case "occupancy":

        result.weakestPointIT =
            "L'occupazione rappresenta il principale margine di miglioramento dell'operazione.";

        result.weakestPointEN =
            "Occupancy represents the main improvement opportunity for the investment.";

        break;

}    

// ===============================================
// 🧠 AI EXECUTIVE OVERRIDE
// ===============================================

if(aiStrategy.summary){

    const summary = aiStrategy.summary;

    if(summary.title){

        result.summaryIT =

            summary.title;

        result.summaryEN =

            summary.title;

    }

    if(summary.description){

        result.explanationIT =

            summary.description;

        result.explanationEN =

            summary.description;

    }

}

if(aiRecommendations.length){

    result.actionIT =

        aiRecommendations.join(" ");

    result.actionEN =

        aiRecommendations.join(" ");

}    

// ===============================================
// 🧠 EXECUTIVE NARRATIVE
// ===============================================

const narrativeIT = [];

const narrativeEN = [];

let analysisIT = "";

let analysisEN = "";    

// Introduzione

const roiValue = roi;

const riskValue = risk;

const cashflowValue = cashflow;

const occupancyValue = occupancy;

let introIT = "";

if(aiInsights.length){

    introIT =
        "Ho analizzato la simulazione integrando gli indicatori economici con le valutazioni strategiche dell'AI.";

}else{

    introIT =
        "Ho analizzato la simulazione considerando i principali indicatori economici e finanziari.";

}

if(roiValue >= 20){

    introIT +=
        ` Il ROI del ${roiValue.toFixed(1)}% evidenzia un rendimento molto elevato.`;

}
else if(roiValue >= 10){

    introIT +=
        ` Il ROI del ${roiValue.toFixed(1)}% risulta interessante.`;

}
else{

    introIT +=
        ` Il ROI del ${roiValue.toFixed(1)}% suggerisce prudenza.`;

}

if(riskValue <= 35){

    introIT +=
        ` Il rischio (${riskValue}/100) è contenuto.`;

}
else if(riskValue <= 60){

    introIT +=
        ` Il rischio (${riskValue}/100) è nella media.`;

}
else{

    introIT +=
        ` Il rischio (${riskValue}/100) è elevato.`;

}

if(cashflowValue > 0){

    introIT +=
        ` Il cashflow annuo stimato di €${Math.round(cashflowValue).toLocaleString("it-IT")} sostiene la sostenibilità dell'investimento.`;

}
else{

    introIT +=
        ` Il cashflow negativo rappresenta un elemento di attenzione.`;

}

if(mortgagePercent >= 80){

    introIT +=
        " La leva finanziaria è elevata e riduce il margine di sicurezza dell'operazione.";

}
else if(mortgagePercent >= 60){

    introIT +=
        " La leva finanziaria è significativa ma ancora gestibile.";

}
else if(mortgagePercent > 0){

    introIT +=
        " La leva finanziaria risulta equilibrata.";

}
    
narrativeIT.push(introIT);


// ===============================================
// 🧠 AI STRATEGIC INSIGHTS
// ===============================================

if(aiInsights.length){

    narrativeIT.push(

        aiInsights

            .map(

                insight =>

                    `💡 ${insight.title}: ${insight.message}`

            )

            .join("\n")

    );

}

// ===============================================
// 🧠 ANALYSIS IT
// ===============================================

analysisIT += introIT;

if(aiInsights.length){

    analysisIT +=

        "\n\n" +

        aiInsights

            .map(

                insight =>

                    `💡 ${insight.title}: ${insight.message}`

            )

            .join("\n");

}

if(result.summaryIT){

    analysisIT +=
        "\n\n" +
        result.summaryIT;

}

if(result.explanationIT){

    analysisIT +=
        "\n\n" +
        result.explanationIT;

}

if(result.strongestPointIT){

    analysisIT +=

        "\n\nPunto di forza: " +

        result.strongestPointIT;

}

result.analysisIT = analysisIT;


// ===============================================
// 🧠 ENGLISH NARRATIVE
// ===============================================

narrativeEN.push(

`I analyzed the simulation considering ROI, risk, cashflow and occupancy.

The investment shows a ${roiValue.toFixed(1)}% ROI, a risk level of ${riskValue}/100, an estimated annual cashflow of €${Math.round(cashflowValue).toLocaleString("en-US")} and an expected occupancy of ${occupancyValue}%.`

);

if(aiInsights.length){

    narrativeEN.push(

        aiInsights

            .map(

                insight =>

                    `💡 ${insight.title}: ${insight.message}`

            )

            .join("\n")

    );

}


// ===============================================
// 🧠 SUMMARY
// ===============================================

if(result.summaryIT){

    narrativeIT.push(result.summaryIT);

}

if(result.summaryEN){

    narrativeEN.push(result.summaryEN);

}


// ===============================================
// 🧠 EXPLANATION
// ===============================================

if(result.explanationIT){

    narrativeIT.push(result.explanationIT);

}

if(result.explanationEN){

    narrativeEN.push(result.explanationEN);

}


// ===============================================
// 🧠 STRENGTH
// ===============================================

if(result.strongestPointIT){

    narrativeIT.push(

        "Punto di forza: " +

        result.strongestPointIT

    );

}

if(result.strongestPointEN){

    narrativeEN.push(

        "Strength: " +

        result.strongestPointEN

    );

}


// ===============================================
// 🧠 ANALYSIS EN
// ===============================================

analysisEN += narrativeEN.join("\n\n");

result.analysisEN = analysisEN;


// ===============================================
// 🧠 FINAL NARRATIVES
// ===============================================

result.executiveNarrativeIT =
    narrativeIT.join("\n\n");

result.executiveNarrativeEN =
    narrativeEN.join("\n\n");

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

    const RB_DEBUG = false;

if(RB_DEBUG){
    console.log(
        "🧠 EXECUTIVE BRAIN V2 READY"
    );
}

})();
