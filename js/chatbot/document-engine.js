// ===============================================
// 🧠 DOCUMENT ENGINE 1.0
// Executive Report Memory
// ===============================================

// ===============================================
// 📄 LAST EXECUTIVE REPORT
// ===============================================

window.lastExecutiveReport = null;

// ===============================================
// 🧠 BUILD EXECUTIVE REPORT
// ===============================================

window.buildExecutiveReport = function(data = {}){

    return {

        generatedAt:
            new Date().toISOString(),

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

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
    "📄 DOCUMENT ENGINE READY"
);
