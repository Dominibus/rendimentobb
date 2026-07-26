// ===============================================
// 🧠 PDF PARSER ENGINE 1.1
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

            documentObject
                .extractedText
                .replace(/\s+/g, " ")
                .trim();

        // ===========================================
        // HELPERS
        // ===========================================

        function matchValue(regex){

            const match =
                text.match(regex);

            return match
                ? match[1]
                : null;

        }

        function parsePercentage(rawValue){

            if(
                rawValue === null ||
                rawValue === undefined
            ){

                return null;

            }

            const normalized =

                String(rawValue)
                    .trim()
                    .replace(",", ".");

            const value =
                Number(normalized);

            return Number.isFinite(value)
                ? value
                : null;

        }

        function parseAmount(rawValue){

            if(
                rawValue === null ||
                rawValue === undefined
            ){

                return null;

            }

            let normalized =

                String(rawValue)
                    .trim()
                    .replace(/\s/g, "");

            if(
                normalized.includes(".") &&
                normalized.includes(",")
            ){

                if(
                    normalized.lastIndexOf(",") >
                    normalized.lastIndexOf(".")
                ){

                    normalized =
                        normalized
                            .replace(/\./g, "")
                            .replace(",", ".");

                }

                else{

                    normalized =
                        normalized
                            .replace(/,/g, "");

                }

            }

            else if(
                /^\d{1,3}(\.\d{3})+$/.test(
                    normalized
                )
            ){

                normalized =
                    normalized.replace(/\./g, "");

            }

            else if(
                /^\d{1,3}(,\d{3})+$/.test(
                    normalized
                )
            ){

                normalized =
                    normalized.replace(/,/g, "");

            }

            else{

                normalized =
                    normalized.replace(",", ".");

            }

            const value =
                Number(normalized);

            return Number.isFinite(value)
                ? value
                : null;

        }

        function extractPercentage(regex){

            return parsePercentage(
                matchValue(regex)
            );

        }

        function extractAmount(regex){

            return parseAmount(
                matchValue(regex)
            );

        }

        function extractText(regex){

            const value =
                matchValue(regex);

            return value
                ? value.trim()
                : null;

        }

        // ===========================================
        // EXECUTIVE PDF VALUES
        // ===========================================

        const roi =

            extractPercentage(

                /\bROI\b[^0-9\-]*(-?[\d]+(?:[.,]\d+)?)/i

            );

        const realROI =

            extractPercentage(

                /(?:REAL ROI|ROI REALE)[^0-9\-]*(-?[\d]+(?:[.,]\d+)?)/i

            );

        const risk =

    extractPercentage(

        /(?:RISK|RISCHIO)(?:\s+SCORE)?[^0-9\-]{0,30}(-?[\d]+(?:[.,]\d+)?)\s*(?:\/\s*100|%)/i

    );

        const occupancy =

    extractPercentage(

        /(?:OCCUPANCY|OCCUPAZIONE)(?:\s+(?:RATE|MEDIA|PREVISTA))?[^0-9\-]{0,30}(-?[\d]+(?:[.,]\d+)?)\s*%/i

    );

        const investmentScore =

            extractPercentage(

                /(?:INVESTMENT SCORE|SCORE AI|SCORE|PUNTEGGIO)[^0-9\-]*(-?[\d]+(?:[.,]\d+)?)/i

            );

        const propertyPrice =

            extractAmount(

                /(?:PROPERTY PRICE|PREZZO IMMOBILE|VALORE IMMOBILE|PREZZO)[^0-9\-]*(-?[\d.,]+)/i

            );

        let equity =

    extractAmount(

        /(?:EQUITY|CAPITALE INVESTITO|CAPITALE PROPRIO|MEZZI PROPRI|INVESTIMENTO INIZIALE)[^0-9€\-]{0,40}€?\s*(-?[\d.,]+)/i

    );

        const mortgage =

            extractAmount(

                /(?:LOAN|MORTGAGE|MUTUO|FINANZIAMENTO)[^0-9\-]*(-?[\d.,]+)/i

            );

        if(
    equity === null &&
    propertyPrice !== null &&
    mortgage !== null
){

    equity =
        propertyPrice -
        mortgage;

}

        const gross =

            extractAmount(

                /(?:GROSS REVENUE|GROSS|RICAVI LORDI|FATTURATO LORDO)[^0-9\-]*(-?[\d.,]+)/i

            );

        const annualProfit =

            extractAmount(

                /(?:ANNUAL PROFIT|PROFITTO ANNUO|UTILE ANNUO|CASHFLOW ANNUO|CASH FLOW ANNUO)[^0-9\-]*(-?[\d.,]+)/i

            );

        const cashflow =

            annualProfit ??

            extractAmount(

                /(?:NET CASHFLOW|NET CASH FLOW|CASHFLOW|CASH FLOW)[^0-9\-]*(-?[\d.,]+)/i

            );

        const adr =

            extractAmount(

                /(?:AVERAGE DAILY RATE|ADR|TARIFFA MEDIA)[^0-9\-]*(-?[\d.,]+)/i

            );

        const verdict =

    extractText(

        /(?:VERDETTO AI|VERDETTO|AI VERDICT|VERDICT)?\s*[:\-]?\s*(Operazione istituzionale|Institutional-grade opportunity|Da valutare|To be reviewed|Non consigliato|Not recommended)/i

    );

        // ===========================================
        // ANALYSIS
        // ===========================================

        documentObject.analysis = {

            reportType:
                "executive_pdf",

            roi:
                roi,

            realROI:
                realROI,

            risk:
                risk,

            occupancy:
                occupancy,

            investmentScore:
                investmentScore,

            propertyPrice:
                propertyPrice,

            equity:
                equity,

            mortgage:
                mortgage,

            gross:
                gross,

            annualProfit:
                annualProfit,

            cashflow:
                cashflow,

            adr:
                adr,

            verdict:
                verdict

        };

        // ===========================================
        // EXECUTIVE CONTEXT
        // ===========================================

        documentObject.executiveContext = {

            generatedBy:
                "pdf-parser-engine",

            parserVersion:
                "1.1",

            hasAnalysis:

                Object.entries(
                    documentObject.analysis
                ).some(
                    ([key, value]) =>

                        key !== "reportType" &&
                        value !== null

                ),

            extractedAt:
                new Date().toISOString()

        };

        // ===========================================
        // AI SUMMARY
        // ===========================================

        documentObject.aiSummary = {

            reportType:
                documentObject.analysis.reportType,

            roi:
                documentObject.analysis.roi,

            risk:
                documentObject.analysis.risk,

            occupancy:
                documentObject.analysis.occupancy,

            cashflow:
                documentObject.analysis.cashflow,

            investmentScore:
                documentObject.analysis.investmentScore,

            verdict:
                documentObject.analysis.verdict

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
