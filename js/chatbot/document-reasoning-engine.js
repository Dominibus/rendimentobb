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

        executiveInsights

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
