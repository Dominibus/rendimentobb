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

window.rbDocumentManager.add(report);

    return report;

};

// ===============================================
// 📚 DOCUMENT LIBRARY MANAGER
// ===============================================

window.rbDocumentManager = {

    add(document){

        if(!document) return;

        window.rbDocumentLibrary.unshift(document);

        window.rbDocumentLibrary =
            window.rbDocumentLibrary.slice(0,50);

    },

    getAll(){

        return [...window.rbDocumentLibrary];

    },

    getLast(){

        return window.rbDocumentLibrary[0] || null;

    },

    getByType(type){

        return window.rbDocumentLibrary.filter(

            doc => doc.documentType === type

        );

    },

    clear(){

        window.rbDocumentLibrary = [];

        window.lastExecutiveReport = null;

    }

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
