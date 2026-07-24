// =====================================
// 🧠 RENDIMENTOBB AI BRAIN v1.2
// Central Intelligence Layer
// =====================================

(function(){

    console.log(
        "🧠 AI Brain READY"
    );

    window.rbProcessBrain = function(context = {}){

        const {

            intent = null,

            entities =
               window.rbCanonicalAnalysis ||

       {},

            memory = {},

            investorProfile = {},

            score = {},

            advisor = null,

            reasoning = {},

            documentKnowledge = {},

            executiveContext = {}

        } = context;

        const roi =
            Number(
                entities?.roi ?? 0
            );

        const risk =
            Number(
                entities?.risk ?? 0
            );

        const occupancy =
            Number(
                entities?.occupancy ?? 0
            );

        const cashflow =
            Number(
                entities?.cashflow ?? 0
            );

        // =====================================
        // 🧠 CENTRAL CONTEXT
        // =====================================

        const brainContext = {

            intent,

            entities,

            memory,

            investorProfile,

            score,

            advisor,

            reasoning,

            documentKnowledge,

            executiveContext,

            metadata:{

                version:"1.2",

                generatedAt:
                    new Date().toISOString()

            }

        };

        console.log(
            "🧠 BRAIN CONTEXT",
            brainContext
        );

        // =====================================
        // 🧠 EXECUTIVE DIAGNOSIS
        // =====================================

        const diagnosis = {

            hasAnalysis:

                roi !== 0 ||

                occupancy > 0 ||

                risk > 0,

            executiveDecision:

                advisor?.verdict ||

                "UNKNOWN",

            investmentState:

                roi >= 20

                    ? "excellent"

                : roi >= 10

                    ? "good"

                : roi > 0

                    ? "acceptable"

                    : "negative",

            urgency:

                risk >= 70

                    ? "high"

                : risk >= 40

                    ? "medium"

                    : "low"

        };

        // =====================================
        // 🟢 STRENGTHS
        // =====================================

        const strengths = [];

        if(roi >= 20)
            strengths.push(
                "high_roi"
            );

        if(occupancy >= 70)
            strengths.push(
                "strong_occupancy"
            );

        if(cashflow > 0)
            strengths.push(
                "positive_cashflow"
            );

        if(risk <= 30)
            strengths.push(
                "controlled_risk"
            );

        // =====================================
        // 🔴 WEAKNESSES
        // =====================================

        const weaknesses = [];

        if(roi <= 0)
            weaknesses.push(
                "negative_roi"
            );

        if(cashflow < 0)
            weaknesses.push(
                "negative_cashflow"
            );

        if(risk >= 70)
            weaknesses.push(
                "high_risk"
            );

        if(occupancy < 60 && occupancy > 0)
            weaknesses.push(
                "low_occupancy"
            );

        // =====================================
        // ⚠️ RISKS
        // =====================================

        const risks = [];

        if(risk >= 70)
            risks.push(
                "operational_risk"
            );

        if(cashflow < 0)
            risks.push(
                "financial_risk"
            );

        if(roi <= 0)
            risks.push(
                "investment_unsustainable"
            );

        // =====================================
        // 🎯 ACTION PLAN
        // =====================================

        const actionPlan = [];

        if(cashflow < 0){

            actionPlan.push(
                "reduce_operating_costs"
            );

        }

        if(risk >= 70){

            actionPlan.push(
                "reduce_financial_risk"
            );

        }

        if(roi < 10){

            actionPlan.push(
                "increase_revenue"
            );

        }

        if(occupancy < 65){

            actionPlan.push(
                "increase_occupancy"
            );

        }

        // =====================================
        // 🧠 BRAIN OBJECT
        // =====================================

        brainContext.diagnosis =
            diagnosis;

        brainContext.strengths =
            strengths;

        brainContext.weaknesses =
            weaknesses;

        brainContext.risks =
            risks;

        brainContext.actionPlan =
            actionPlan;

const strengthLabelsIT = {

    high_roi:
        "ROI molto superiore alla media",

    strong_occupancy:
        "Ottimo livello di occupazione",

    positive_cashflow:
        "Cashflow positivo",

    controlled_risk:
        "Profilo di rischio contenuto"

};

const weaknessLabelsIT = {

    negative_roi:
        "ROI insufficiente",

    negative_cashflow:
        "Cashflow negativo",

    high_risk:
        "Livello di rischio elevato",

    low_occupancy:
        "Occupazione inferiore alla media"

};

const actionLabelsIT = {

    reduce_operating_costs:
        "Ridurre i costi operativi",

    reduce_financial_risk:
        "Ridurre l'esposizione finanziaria",

    increase_revenue:
        "Incrementare i ricavi",

    increase_occupancy:
        "Migliorare il tasso di occupazione"

};        

// =====================================
// 🧠 EXECUTIVE SUMMARY
// =====================================

let executiveSummaryIT = "";

if(!diagnosis.hasAnalysis){

    executiveSummaryIT =
        "Nessuna analisi disponibile.";

}
else{

    if(diagnosis.executiveDecision === "BUY"){

    executiveSummaryIT =
        "L'investimento presenta caratteristiche favorevoli per una possibile acquisizione. ";

}
else if(diagnosis.executiveDecision === "WAIT"){

    executiveSummaryIT =
        "L'investimento richiede ulteriori verifiche prima di una decisione definitiva. ";

}
else if(diagnosis.executiveDecision === "NO_BUY"){

    executiveSummaryIT =
        "L'investimento presenta criticità che ne sconsigliano l'acquisto nelle condizioni attuali. ";

}
else{

    switch(diagnosis.investmentState){

        case "excellent":

            executiveSummaryIT =
                "L'investimento mostra caratteristiche molto solide. ";

            break;

        case "good":

            executiveSummaryIT =
                "L'investimento appare complessivamente positivo. ";

            break;

        case "acceptable":

            executiveSummaryIT =
                "L'investimento risulta sostenibile ma presenta margini di miglioramento. ";

            break;

        default:

            executiveSummaryIT =
                "L'investimento presenta criticità che richiedono un'attenta valutazione. ";

    }

}

     if(strengths.length){

          executiveSummaryIT +=
             `Punti di forza: ${strengths
  .map(x => strengthLabelsIT[x] || x)
  .join(", ")}. `;

    }

    if(weaknesses.length){

        executiveSummaryIT +=
            `Criticità: ${weaknesses
.map(x => weaknessLabelsIT[x] || x)
.join(", ")}. `;

    }

    if(actionPlan.length){

        executiveSummaryIT +=
            `Priorità: ${actionPlan
.map(x => actionLabelsIT[x] || x)
.join(", ")}.`;

    }

}

brainContext.executiveSummary = {

    it: executiveSummaryIT,

    generated: false,

    source: "ai-brain",

    advisoryOnly: true

};
        console.log(
    "🧠 EXECUTIVE SUMMARY",
    brainContext.executiveSummary
);
        

        console.log(
            "🧠 AI DIAGNOSIS",
            diagnosis
        );

        console.log(
            "🟢 STRENGTHS",
            strengths
        );

        console.log(
            "🔴 WEAKNESSES",
            weaknesses
        );

        console.log(
            "⚠️ RISKS",
            risks
        );

        console.log(
            "🎯 ACTION PLAN",
            actionPlan
        );

        return brainContext;

    };

})();
