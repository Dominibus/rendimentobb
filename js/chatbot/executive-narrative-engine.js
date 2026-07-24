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
// 📈 EXECUTIVE PERFORMANCE LABEL
// ===============================================

window.rbGetExecutivePerformance = function({

    roi = 0,

    cashflow = 0,

    risk = 0

} = {}){

    if(

        roi >= 20 &&

        cashflow > 0 &&

        risk <= 35

    ){

        return{

            level:"excellent",

            it:"Eccellente",

            en:"Excellent"

        };

    }

    if(

        roi >= 15 &&

        cashflow > 0

    ){

        return{

            level:"good",

            it:"Buono",

            en:"Good"

        };

    }

    if(

        roi >= 10

    ){

        return{

            level:"fair",

            it:"Discreto",

            en:"Fair"

        };

    }

    return{

        level:"weak",

        it:"Debole",

        en:"Weak"

    };

};

// ===============================================
// 💡 EXECUTIVE RECOMMENDATION
// ===============================================

window.rbGetExecutiveRecommendation = function({

    verdict = "WAIT",

    grade = "C",

    performance = {},

    language = "it"

} = {}){

    const isIT = language === "it";

    switch(verdict){

        case "BUY":

            return isIT

                ? `L'investimento presenta caratteristiche solide, con una buona combinazione di redditività, rischio e sostenibilità operativa.`

                : `The investment shows solid fundamentals, with a good balance between profitability, risk and operational sustainability.`;

        case "WAIT":

            return isIT

                ? "L'investimento è interessante ma richiede ulteriori verifiche prima della decisione finale."

                : "The investment deserves further evaluation before making a final decision.";

        case "NO_BUY":

            return isIT

                ? "I parametri attuali suggeriscono di evitare l'investimento nelle condizioni attuali."

                : "Current metrics suggest avoiding this investment under the current conditions.";

        case "AVOID":

    return isIT

        ? "L'analisi AI evidenzia un investimento non sostenibile nelle condizioni attuali. Prima di procedere è consigliabile intervenire su redditività, cashflow e struttura finanziaria."

        : "The AI analysis indicates that the investment is not sustainable under the current conditions. Profitability, cashflow and financing structure should be improved before proceeding.";    

        default:

            return isIT

                ? "L'AI non dispone ancora di elementi sufficienti per formulare una raccomandazione."

                : "The AI does not yet have enough information to generate a recommendation.";

    }

};

// ===============================================
// 🧠 BUILD EXECUTIVE INTELLIGENCE
// ===============================================

window.rbBuildExecutiveIntelligence = function({

    report = {},

    advisor = {},

    investmentScore = {},

    documentKnowledge = {}

} = {}){

    const roi =
        Number(report.roi || 0);

    const risk =
        Number(report.risk || 0);

    const occupancy =
        Number(report.occupancy || 0);

    const cashflow =
        Number(report.cashflow || 0);

const grade =

    investmentScore?.labelIT ||

    advisor?.labelIT ||

    advisor?.label ||

    "Investimento";

    const performance =

        window.rbGetExecutivePerformance({

            roi,

            cashflow,

            risk

        });

    const recommendationIT =

        window.rbGetExecutiveRecommendation({

            verdict:
                advisor.verdict,

            grade,

            performance,

            language:"it"

        });

    const recommendationEN =

        window.rbGetExecutiveRecommendation({

            verdict:
                advisor.verdict,

            grade,

            performance,

            language:"en"

        });

    return{

        roi,

        risk,

        occupancy,

        cashflow,

        grade,

        performance,

        recommendationIT,

        recommendationEN,

        riskLabelIT:

            window.rbGetExecutiveRiskLabel(

                risk,

                "it"

            ),

        riskLabelEN:

            window.rbGetExecutiveRiskLabel(

                risk,

                "en"

            ),

        confidence:

            advisor.confidence || 0,

        verdict:

            advisor.verdict || "WAIT",

        documentCount:

            documentKnowledge.totalDocuments || 0

    };

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

            grade: "N/A",

            performance: null,

            recommendationIT:
                "Non è presente alcuna analisi.",

            recommendationEN:
                "No analysis available.",

            riskLabelIT:
                "N/D",

            riskLabelEN:
                "N/A",

            intelligence: null,

            textIT:

                "Non è presente alcuna analisi da interpretare.",

            textEN:

                "No investment analysis is currently available."

        };

    }

    // ===========================================
    // 🧠 EXECUTIVE INTELLIGENCE
    // ===========================================

    const intelligence =

window.rbBuildExecutiveIntelligence({

    report,

    advisor,

    investmentScore:
        window.lastInvestmentScore || {},

    documentKnowledge

});

    const{

        roi,

        risk,

        occupancy,

        cashflow,

        grade,

        performance,

        recommendationIT,

        recommendationEN,

        riskLabelIT,

        riskLabelEN,

        confidence,

        verdict,

        documentCount

    } = intelligence;

    const city =
        report.city || "N/A";

    // ===========================================
    // 🇮🇹 EXECUTIVE REPORT
    // ===========================================

    const textIT =

`📊 Executive Investment Report

🏙️ Mercato: ${city}

🏆 Investment Grade: ${grade}

📊 Performance: ${performance.it}

📈 ROI previsto: ${roi.toFixed(1)}%

⚠️ Livello di rischio: ${riskLabelIT} (${risk}/100)

👥 Occupazione: ${occupancy.toFixed(1)}%

💰 Cash Flow annuo: €${cashflow.toLocaleString("it-IT")}

🤖 AI Advisor: ${verdict}

🎯 Affidabilità analisi: ${confidence}%

📚 Documenti disponibili: ${documentCount}

${recommendationIT}`;

    // ===========================================
    // 🇬🇧 EXECUTIVE REPORT
    // ===========================================

    const textEN =

`📊 Executive Investment Report

🏙️ Market: ${city}

🏆 Investment Grade: ${grade}

📊 Performance: ${performance.en}

📈 Expected ROI: ${roi.toFixed(1)}%

⚠️ Risk Level: ${riskLabelEN} (${risk}/100)

👥 Occupancy: ${occupancy.toFixed(1)}%

💰 Annual Cash Flow: €${cashflow.toLocaleString("en-US")}

🤖 AI Advisor: ${verdict}

🎯 Confidence: ${confidence}%

📚 Available Documents: ${documentCount}

${recommendationEN}`;

    return{

        intelligence,

        grade,

        performance,

        recommendationIT,

        recommendationEN,

        riskLabelIT,

        riskLabelEN,

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
