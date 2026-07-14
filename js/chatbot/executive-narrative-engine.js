// ===============================================
// 🧠 EXECUTIVE NARRATIVE ENGINE 1.0
// Silicon Valley Architecture 2026
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

    const cashflow =
        Number(report.cashflow || 0);

    const city =
        report.city || "N/A";

    const verdict =
        advisor.verdict || "WAIT";

    const confidence =
        advisor.confidence || 0;

    const textIT =

`📊 Executive Summary

L'investimento analizzato riguarda ${city}.

Il ROI stimato è ${roi.toFixed(1)}%.

Il rischio è ${risk}/100.

Il cash flow annuo è di €${cashflow.toLocaleString("it-IT")}.

L'Advisor AI esprime una raccomandazione:

${verdict}

con un livello di confidenza del ${confidence}%.

La libreria documentale contiene ${documentKnowledge.totalDocuments || 0} documento/i disponibili per l'analisi.`;

    const textEN =

`📊 Executive Summary

The analysed investment is located in ${city}.

Estimated ROI is ${roi.toFixed(1)}%.

Risk score is ${risk}/100.

Annual cash flow is €${cashflow.toLocaleString("en-US")}.

The AI Advisor recommendation is

${verdict}

with ${confidence}% confidence.

The Executive Document Library currently contains ${documentKnowledge.totalDocuments || 0} document(s).`;

    return{

        textIT,

        textEN

    };

};

console.log(

    "🧠 EXECUTIVE NARRATIVE ENGINE READY"

);
