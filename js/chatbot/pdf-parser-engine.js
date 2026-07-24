// ===============================================
// 🧠 PDF PARSER ENGINE 1.0
// Silicon Valley Architecture 2026
// RendimentoBB AI
// ===============================================

"use strict";

window.rbParseExecutivePDF = async function(documentObject){

    try{

        if(
            !documentObject ||
            !documentObject.extractedText
        ){

            return documentObject;

        }

        const text =
            documentObject.extractedText;

        // ===========================================
        // HELPERS
        // ===========================================

        function extractNumber(regex){

            const match =
                text.match(regex);

            if(!match){

                return null;

            }

            const value =

                match[1]

                    .replace(/\./g,"")

                    .replace(",", ".");

            return Number(value);

        }

        function extractPercent(regex){

            const value =
                extractNumber(regex);

            return value;

        }

        // ===========================================
        // ANALYSIS
        // ===========================================

        documentObject.analysis = {

            roi:

                extractPercent(

                    /ROI[^0-9\-]*([\d.,]+)/i

                ),

            realROI:

                extractPercent(

                    /REAL ROI[^0-9\-]*([\d.,]+)/i

                ),

            risk:

                extractPercent(

                    /RISK[^0-9\-]*([\d.,]+)/i

                ),

            occupancy:

                extractPercent(

                    /OCCUPANCY[^0-9\-]*([\d.,]+)/i

                ),

            propertyPrice:

                extractNumber(

                    /PROPERTY PRICE[^0-9\-]*([\d.,]+)/i

                ),

            equity:

                extractNumber(

                    /EQUITY[^0-9\-]*([\d.,]+)/i

                ),

            mortgage:

                extractNumber(

                    /(LOAN|MORTGAGE)[^0-9\-]*([\d.,]+)/i

                ),

            gross:

                extractNumber(

                    /GROSS[^0-9\-]*([\d.,]+)/i

                ),

            cashflow:

                extractNumber(

                    /(NET CASHFLOW|CASHFLOW)[^0-9\-]*([\d.,]+)/i

                ),

            adr:

                extractNumber(

                    /(ADR|AVERAGE DAILY RATE)[^0-9\-]*([\d.,]+)/i

                )

        };

        // ===========================================
        // EXECUTIVE CONTEXT
        // ===========================================

        documentObject.executiveContext = {

            generatedBy:

                "pdf-parser-engine",

            parserVersion:

                "1.0",

            hasAnalysis:

                Object.values(
                    documentObject.analysis
                ).some(
                    value =>
                        value !== null
                ),

            extractedAt:

                new Date().toISOString()

        };

        // ===========================================
        // AI SUMMARY
        // ===========================================

        documentObject.aiSummary = {

            roi:
                documentObject.analysis.roi,

            risk:
                documentObject.analysis.risk,

            occupancy:
                documentObject.analysis.occupancy,

            cashflow:
                documentObject.analysis.cashflow

        };

        console.log(

            "🧠 PDF PARSER RESULT",

            documentObject.analysis

        );

        return documentObject;

    }

    catch(error){

        console.warn(

            "PDF Parser Error",

            error

        );

        return documentObject;

    }

};

console.log(

    "🧠 PDF PARSER ENGINE READY"

);
