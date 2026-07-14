// ===============================================
// 🧠 DOCUMENT ENGINE 2.0
// Executive Document Memory
// Silicon Valley Architecture 2026
// ===============================================

// ===============================================
// 📄 LAST EXECUTIVE REPORT
// ===============================================

window.lastExecutiveReport = null;

// ===============================================
// 📚 EXECUTIVE DOCUMENT LIBRARY
// ===============================================

window.rbDocumentLibrary = [];

// ===============================================
// 🧠 BUILD EXECUTIVE REPORT
// ===============================================

window.buildExecutiveReport = function(data = {}){

    const report = {

        id:
            crypto.randomUUID
                ? crypto.randomUUID()
                : `report_${Date.now()}`,

        documentType:
            "simulation",

        source:
            "simulator",

        generatedAt:
            new Date().toISOString(),

        version:
            "2.0",

        city:
            data.realCity ||
            data.marketCity ||
            null,

        roi:
            data.realROI ??
            data.visualROI ??
            data.roi ??
            0,

        risk:
            data.risk ??
            0,

        occupancy:
            data.occupancy ??
            0,

        revenue:
            data.revenueAnnual ??
            data.gross ??
            0,

        cashflow:
            data.net ??
            data.annualProfit ??
            0,

        propertyPrice:
            data.propertyPrice ??
            data.price ??
            0,

        equity:
            data.equity ??
            0,

        mortgage:
            data.mortgageAmount ??
            data.loanAmount ??
            0,

        analysis:
            data

    };

    // ===========================================
    // 📄 ACTIVE EXECUTIVE REPORT
    // ===========================================

    window.lastExecutiveReport = report;

    // ===========================================
    // 📚 DOCUMENT LIBRARY
    // ===========================================

    window.rbDocumentLibrary.unshift(report);

    // Mantiene gli ultimi 50 documenti in memoria

    window.rbDocumentLibrary =
        window.rbDocumentLibrary.slice(0, 50);

    return report;

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
    "📄 DOCUMENT ENGINE READY",
    {
        version: "2.0"
    }
);
