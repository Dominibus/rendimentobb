// ===============================================
// 🧠 EXECUTIVE NARRATIVE ENGINE 2.0
// Executive AI Brain
// Silicon Valley Architecture 2026
// ===============================================

// ===============================================
// 🏆 EXECUTIVE INVESTMENT GRADE
// ===============================================

window.rbGetExecutiveInvestmentGrade = function({

    roi = 0,

    risk = 100,

    occupancy = 0

} = {}){

    if(
        roi >= 20 &&
        risk <= 35 &&
        occupancy >= 65
    ){
        return "A+";
    }

    if(
        roi >= 15 &&
        risk <= 45
    ){
        return "A";
    }

    if(
        roi >= 10
    ){
        return "B";
    }

    return "C";

};

// ===============================================
// ⚠️ EXECUTIVE RISK LABEL
// ===============================================

window.rbGetExecutiveRiskLabel = function(

    risk = 0,

    language = "it"

){

    if(risk <= 30){

        return language === "it"

            ? "Basso"

            : "Low";

    }

    if(risk <= 60){

        return language === "it"

            ? "Medio"

            : "Medium";

    }

    return language === "it"

        ? "Alto"

        : "High";

};

// ===============================================
// 🧠 EXECUTIVE NARRATIVE
// ===============================================

window.rbGenerateExecutiveNarrative = function({

    executiveContext = {},

    advisor = {},

    documentKnowledge = {},

    language = "it"

} = {}){

    const report =

        executiveContext.documents?.activeReport ||

        null;

    if(!report){

        return{

            textIT:

                "Non è presente alcuna analisi da interpretare.",

            textEN:

                "No investment analysis is currently available."

        };

    }

    const roi =
        Number(report.roi || 0);

    const risk =
        Number(report.risk || 0);

    const occupancy =
        Number(report.occupancy || 0);

    const cashflow =
        Number(report.cashflow || 0);

    const city =
        report.city || "N/A";

    const verdict =
        advisor.verdict || "WAIT";

    const confidence =
        Number(advisor.confidence || 0);

    const grade =

        window.rbGetExecutiveInvestmentGrade({

            roi,

            risk,

            occupancy

        });

    const riskIT =

        window.rbGetExecutiveRiskLabel(

            risk,

            "it"

        );

    const riskEN =

        window.rbGetExecutiveRiskLabel(

            risk,

            "en"

        );

    // ===========================================
    // 🇮🇹
    // ===========================================

    const textIT =

`📊 Executive Investment Report

🏙️ Mercato: ${city}

🏆 Investment Grade: ${grade}

📈 ROI previsto: ${roi.toFixed(1)}%

⚠️ Livello di rischio: ${riskIT} (${risk}/100)

💰 Cash Flow annuo: €${cashflow.toLocaleString("it-IT")}

🤖 AI Advisor: ${verdict}

🎯 Affidabilità analisi: ${confidence}%

📚 Documenti disponibili: ${documentKnowledge.totalDocuments || 0}

L'analisi evidenzia un investimento con rating ${grade}. Il sistema AI ha valutato simultaneamente ROI, rischio, cash flow e documentazione disponibile prima di formulare il giudizio finale.`;

    // ===========================================
    // 🇬🇧
    // ===========================================

    const textEN =

`📊 Executive Investment Report

🏙️ Market: ${city}

🏆 Investment Grade: ${grade}

📈 Expected ROI: ${roi.toFixed(1)}%

⚠️ Risk Level: ${riskEN} (${risk}/100)

💰 Annual Cash Flow: €${cashflow.toLocaleString("en-US")}

🤖 AI Advisor: ${verdict}

🎯 Confidence: ${confidence}%

📚 Available Documents: ${documentKnowledge.totalDocuments || 0}

The AI evaluated ROI, investment risk, cash flow and all available executive documents before generating the final recommendation.`;

    return{

        grade,

        riskLabelIT: riskIT,

        riskLabelEN: riskEN,

        textIT,

        textEN

    };

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(

    "🧠 EXECUTIVE NARRATIVE ENGINE READY",

    {

        version: "2.0"

    }

);
