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

            entities = {},

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
