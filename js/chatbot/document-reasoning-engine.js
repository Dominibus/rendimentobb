// ===============================================
// 🧠 DOCUMENT REASONING ENGINE 2.0
// Executive Document Intelligence
// Silicon Valley Architecture 2026
// ===============================================

// ===============================================
// 🧠 ANALYZE DOCUMENT LIBRARY
// ===============================================

window.rbAnalyzeDocuments = function(executiveContext = {}){

    const documents =
        executiveContext.documents?.library ||
        [];

    const simulations =
        documents.filter(
            doc => doc.documentType === "simulation"
        );

    const executivePDFReports =

  documents.filter(

    doc =>
      doc.documentType ===
      "executive_pdf"

  );

    const dashboardReports =
        documents.filter(
            doc => doc.documentType === "dashboard"
        );

    const uploadedReports =
        documents.filter(
            doc => doc.documentType === "uploaded"
        );

    const latestReport =
        documents[0] ||
        null;

    // ===========================================
    // 📊 AVERAGES
    // ===========================================

    const averageROI =
        simulations.length
            ? simulations.reduce(
                (sum, doc) =>
                    sum + Number(doc.roi || 0),
                0
              ) / simulations.length
            : 0;

    const averageRisk =
        simulations.length
            ? simulations.reduce(
                (sum, doc) =>
                    sum + Number(doc.risk || 0),
                0
              ) / simulations.length
            : 0;

    const averageCashflow =
        simulations.length
            ? simulations.reduce(
                (sum, doc) =>
                    sum + Number(doc.cashflow || 0),
                0
              ) / simulations.length
            : 0;

    // ===========================================
    // 🌍 CITIES
    // ===========================================

    const availableCities = [

        ...new Set(

            documents
                .map(doc => doc.city)
                .filter(Boolean)

        )

    ];

    // ===========================================
    // 🏆 BEST DOCUMENTS
    // ===========================================

    const highestROI =
        simulations.reduce(

            (best, current) =>

                Number(current.roi || 0) >

                Number(best?.roi || -Infinity)

                    ? current

                    : best,

            null

        );

    const highestRisk =
        simulations.reduce(

            (worst, current) =>

                Number(current.risk || 0) >

                Number(worst?.risk || -Infinity)

                    ? current

                    : worst,

            null

        );

    const bestCashflow =
        simulations.reduce(

            (best, current) =>

                Number(current.cashflow || 0) >

                Number(best?.cashflow || -Infinity)

                    ? current

                    : best,

            null

        );

    // ===========================================
    // ⚠️ EXECUTIVE WARNINGS
    // ===========================================

    const executiveWarnings = [];

    simulations.forEach(report => {

        if(Number(report.cashflow || 0) < 0){

            executiveWarnings.push({

                type: "negative_cashflow",

                city: report.city,

                value: report.cashflow

            });

        }

        if(Number(report.risk || 0) >= 70){

            executiveWarnings.push({

                type: "high_risk",

                city: report.city,

                value: report.risk

            });

        }

    });

    // ===========================================
    // 🚀 EXECUTIVE OPPORTUNITIES
    // ===========================================

    const executiveOpportunities = [];

    simulations.forEach(report => {

        if(

            Number(report.roi || 0) >= 25 &&

            Number(report.risk || 0) <= 35

        ){

            executiveOpportunities.push({

                city: report.city,

                roi: report.roi,

                risk: report.risk,

                cashflow: report.cashflow

            });

        }

    });

    // ===========================================
    // 🧠 EXECUTIVE INSIGHTS
    // ===========================================

    const executiveInsights = {

        portfolioStatus:

            simulations.length === 0

                ? "empty"

                : simulations.length === 1

                    ? "single"

                    : "portfolio",

        hasWarnings:

            executiveWarnings.length > 0,

        hasOpportunities:

            executiveOpportunities.length > 0,

        strongestInvestment:

            highestROI,

        riskiestInvestment:

            highestRisk,

        bestCashflowInvestment:

            bestCashflow

    };

// ===========================================
// 🧠 EXECUTIVE METRICS ENGINE
// ===========================================

const portfolioHealth = (() => {

    if(simulations.length === 0){

        return "empty";

    }

    if(

        averageROI >= 25 &&

        averageRisk <= 35 &&

        averageCashflow > 0

    ){

        return "excellent";

    }

    if(

        averageROI >= 18 &&

        averageRisk <= 45

    ){

        return "good";

    }

    if(

        averageROI >= 10

    ){

        return "balanced";

    }

    return "critical";

})();

const portfolioTrend = (() => {

    if(simulations.length < 2){

        return "unknown";

    }

    const firstROI =
        Number(
            simulations.at(-1)?.roi || 0
        );

    const lastROI =
        Number(
            simulations[0]?.roi || 0
        );

    if(lastROI > firstROI){

        return "growing";

    }

    if(lastROI < firstROI){

        return "declining";

    }

    return "stable";

})();

const confidenceScore = (() => {

    let score = 100;

    score -= executiveWarnings.length * 6;

    if(simulations.length < 2){

        score -= 5;

    }

    return Math.max(
        60,
        Math.min(
            score,
            100
        )
    );

})();

const aiSignals = [];

if(averageROI >= 25){

    aiSignals.push("high_roi");

}

if(averageCashflow > 0){

    aiSignals.push("positive_cashflow");

}

if(averageRisk <= 35){

    aiSignals.push("low_risk");

}

if(executiveWarnings.length){

    aiSignals.push("attention_required");

}

const contradictions = [];

simulations.forEach(report =>{

    if(

        Number(report.roi || 0) >= 25 &&

        Number(report.cashflow || 0) <= 0

    ){

        contradictions.push({

            city: report.city,

            type: "high_roi_negative_cashflow"

        });

    }

    if(

        Number(report.occupancy || 0) >= 75 &&

        Number(report.risk || 0) >= 70

    ){

        contradictions.push({

            city: report.city,

            type: "high_occupancy_high_risk"

        });

    }

});

const executiveDecision = (() =>{

    if(portfolioHealth === "excellent"){

        return{

            label:"BUY",

            confidence:confidenceScore

        };

    }

    if(portfolioHealth === "good"){

        return{

            label:"MONITOR",

            confidence:confidenceScore

        };

    }

    return{

        label:"REVIEW",

        confidence:confidenceScore

    };

})();

// ===========================================
// 🧠 EXECUTIVE SUMMARY ENGINE
// ===========================================

const executiveSummary = (() => {

    if(simulations.length === 0){

        return{

            status:"empty",

            title:"No analyses available",

            description:"No investment simulations are currently available."

        };

    }

    if(portfolioHealth === "excellent"){

        return{

            status:"excellent",

            title:"High-performing portfolio",

            description:
                "The portfolio shows strong profitability, controlled risk and positive cashflow."

        };

    }

    if(portfolioHealth === "good"){

        return{

            status:"good",

            title:"Solid portfolio",

            description:
                "Overall performance is positive with room for optimization."

        };

    }

    if(portfolioHealth === "balanced"){

        return{

            status:"balanced",

            title:"Balanced portfolio",

            description:
                "Performance is acceptable but several metrics can still improve."

        };

    }

    return{

        status:"critical",

        title:"Portfolio requires attention",

        description:
            "Risk or profitability indicators require strategic review."

    };

})();

// ===========================================
// 🎯 STRATEGIC PRIORITIES
// ===========================================

const strategicPriorities = [];

if(averageCashflow <= 0){

    strategicPriorities.push({

        priority:1,

        type:"cashflow",

        message:"Increase operating cashflow"

    });

}

if(averageRisk >= 60){

    strategicPriorities.push({

        priority:2,

        type:"risk",

        message:"Reduce investment risk"

    });

}

if(averageROI < 20){

    strategicPriorities.push({

        priority:3,

        type:"roi",

        message:"Improve return on investment"

    });

}

if(executiveOpportunities.length){

    strategicPriorities.push({

        priority:4,

        type:"growth",

        message:"Expand the strongest investments"

    });

}

// ===========================================
// 💡 AI RECOMMENDATIONS
// ===========================================

const aiRecommendations = [];

executiveWarnings.forEach(warning=>{

    switch(warning.type){

        case "negative_cashflow":

            aiRecommendations.push(

                "Review pricing strategy and operating costs."

            );

            break;

        case "high_risk":

            aiRecommendations.push(

                "Reduce leverage or improve operational stability."

            );

            break;

    }

});

executiveOpportunities.forEach(opportunity=>{

    aiRecommendations.push(

        `Consider expanding investments in ${opportunity.city}.`

    );

});

// ===========================================
// 🧠 AI PORTFOLIO INTELLIGENCE
// ===========================================

const portfolioRanking = [...simulations]

.sort((a,b)=>

    Number(b.roi||0)-

    Number(a.roi||0)

)

.map((simulation,index)=>({

    rank:index+1,

    city:simulation.city,

    roi:Number(simulation.roi||0),

    risk:Number(simulation.risk||0),

    cashflow:Number(simulation.cashflow||0),

    occupancy:Number(simulation.occupancy||0)

}));

const portfolioBenchmarks={

    bestROI:

        portfolioRanking[0]||null,

    secondBest:

        portfolioRanking[1]||null,

    weakest:

        portfolioRanking.at(-1)||null

};

const portfolioDistribution={

    excellent:

        simulations.filter(

            s=>

            Number(s.roi||0)>=25 &&

            Number(s.risk||0)<=35

        ).length,

    average:

        simulations.filter(

            s=>

            Number(s.roi||0)>=15 &&

            Number(s.roi||0)<25

        ).length,

    weak:

        simulations.filter(

            s=>

            Number(s.roi||0)<15

        ).length

};

// ===========================================
// 🧠 AI EXECUTIVE CONTEXT
// ===========================================

const executiveContextAI = {

    portfolio:{

        documents:documents.length,

        simulations:simulations.length,

        cities:availableCities,

        health:portfolioHealth,

        trend:portfolioTrend,

        confidence:confidenceScore

    },

    metrics:{

        roi:averageROI,

        risk:averageRisk,

        cashflow:averageCashflow

    },

    analysis:{

        warnings:executiveWarnings,

        opportunities:executiveOpportunities,

        contradictions,

        signals:aiSignals

    },

    strategy:{

        summary:executiveSummary,

        decision:executiveDecision,

        priorities:strategicPriorities,

        recommendations:aiRecommendations

    },

    bestInvestments:{

        roi:highestROI,

        cashflow:bestCashflow,

        lowestRisk:highestRisk

    },

    intelligence:{

    ranking:portfolioRanking,

    benchmarks:portfolioBenchmarks,

    distribution:portfolioDistribution

}

};
    

    // ===========================================
    // 📦 RETURN
    // ===========================================

    return {

        totalDocuments:

            documents.length,

        simulationReports:

            simulations.length,

        executivePDFReports:

  executivePDFReports.length,

        dashboardReports:

            dashboardReports.length,

        uploadedReports:

            uploadedReports.length,

        latestReport,

        availableCities,

        averageROI,

        averageRisk,

        averageCashflow,

        highestROI,

        highestRisk,

        bestCashflow,

        executiveWarnings,

        executiveOpportunities,

        executiveInsights,

        portfolioHealth,

        portfolioTrend,

        confidenceScore,

        aiSignals,

       contradictions,

       executiveDecision,

        executiveSummary,

        strategicPriorities,

        aiRecommendations,

        executiveContextAI

    };

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(

    "🧠 DOCUMENT REASONING ENGINE READY",

    {

        version: "2.0"

    }

);
