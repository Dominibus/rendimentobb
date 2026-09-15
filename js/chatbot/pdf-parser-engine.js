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

        function extractLastPercentage(regex){

            const matches =
                Array.from(text.matchAll(regex));

            if(!matches.length){
                return null;
            }

            return parsePercentage(
                matches[matches.length - 1][1]
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

                /(?:RETURN ON EQUITY|ROI ON EQUITY)[^0-9\-]{0,30}(?:EUR|€|\$)?\s*[\d.,]+\s+(-?[\d]+(?:[.,]\d+)?)\s*%/i

            ) ??

            extractLastPercentage(

                /(-?[\d]+(?:[.,]\d+)?)\s*%\s*(?:ROI SUL CAPITALE PROPRIO|ROI ON EQUITY|RETURN ON EQUITY)/gi

            ) ??

            extractLastPercentage(

                /(?:ROI SUL CAPITALE PROPRIO|ROI ON EQUITY|RETURN ON EQUITY)[^0-9\-]*(-?[\d]+(?:[.,]\d+)?)\s*%/gi

            ) ??

            extractPercentage(

                /ROI EQUITY(?!\s+(?:DI MERCATO|OF MARKET|MARKET))[^0-9\-]*(-?[\d]+(?:[.,]\d+)?)\s*%/i

            ) ??

            extractPercentage(

                /\bROI\b[^0-9\-]*(-?[\d]+(?:[.,]\d+)?)/i

            );

        const realROI =

            extractPercentage(

                /(?:REAL ROI|ROI REALE)[^0-9\-]*(-?[\d]+(?:[.,]\d+)?)/i

            );

        const riskOccupancyPair =
            text.match(
                /(?:RISK SCORE|INDICE RISCHIO)\s+(?:OCCUPANCY RATE|OCCUPAZIONE(?: MEDIA| PREVISTA)?)\s+(-?[\d]+(?:[.,]\d+)?)\s*\/\s*100\s+(-?[\d]+(?:[.,]\d+)?)\s*%/i
            );

        const loanRevenuePair =
            text.match(
                /(?:LOAN AMOUNT|IMPORTO RICHIESTO|MUTUO|FINANZIAMENTO)\s+(?:ANNUAL REVENUE|RICAVI ANNUI|FATTURATO LORDO)\s+(?:EUR|€|\$)?\s*(-?[\d.,]+)\s+(?:EUR|€|\$)?\s*(-?[\d.,]+)/i
            );

        const risk =

    parsePercentage(riskOccupancyPair?.[1]) ??

    extractPercentage(

        /(?:RISK|RISCHIO)(?:\s+SCORE)?[^0-9\-]{0,30}(-?[\d]+(?:[.,]\d+)?)\s*(?:\/\s*100|%)/i

    );

        const occupancy =

    parsePercentage(riskOccupancyPair?.[2]) ??

    extractPercentage(

        /(?:OCCUPANCY|OCCUPAZIONE)(?:\s+(?:RATE|MEDIA|PREVISTA))?[^0-9\-]{0,30}(-?[\d]+(?:[.,]\d+)?)\s*%/i

    );

        const investmentScore =

            extractPercentage(

                /(?:INVESTMENT SCORE|SCORE AI|PUNTEGGIO INVESTIMENTO|PUNTEGGIO AI)[^0-9\-]{0,30}(?:EUR|€|\$)?\s*[\d.,]+\s+(-?[\d]+(?:[.,]\d+)?)\s*\/\s*100/i

            ) ??

            extractPercentage(

                /(?:INVESTMENT SCORE|SCORE AI|PUNTEGGIO INVESTIMENTO|PUNTEGGIO AI)[^0-9\-]*(-?[\d]+(?:[.,]\d+)?)/i

            ) ??

            extractPercentage(

                /(?:SCORE|PUNTEGGIO)[^0-9\-]*(-?[\d]+(?:[.,]\d+)?)/i

            );

        const propertyPrice = (() => {

            const priceLabels =
                "PROPERTY PRICE|ASKING PRICE|PREZZO IMMOBILE|VALORE IMMOBILE|PREZZO";

            const labeledCandidates = [

                extractAmount(
                    new RegExp(
                        `(?:${priceLabels})[^0-9€$]{0,80}(?:EUR|€|\\$)\\s*(-?[\\d.,]+)`,
                        "i"
                    )
                ),

                extractAmount(
                    new RegExp(
                        `(?:${priceLabels})[^0-9]{0,80}(-?[\\d.,]+)\\s*(?:EUR|€|\\$)`,
                        "i"
                    )
                ),

                extractAmount(
                    new RegExp(
                        `(?:EUR|€|\\$)\\s*(-?[\\d.,]+)[^A-Z0-9]{0,30}(?:${priceLabels})`,
                        "i"
                    )
                ),

                extractAmount(
                    new RegExp(
                        `(-?[\\d.,]+)\\s*(?:EUR|€|\\$)[^A-Z0-9]{0,30}(?:${priceLabels})`,
                        "i"
                    )
                )

            ].find(
                value =>
                    Number.isFinite(value) &&
                    value > 0
            );

            if(labeledCandidates !== undefined){
                return labeledCandidates;
            }

            // Some brochures place the price on a separate PDF text item/page.
            // Use an unlabeled currency amount only for a generic document and
            // only when it has the scale of a plausible property price.
            if(documentObject.type !== "executive_report"){

                const currencyAmounts =
                    Array.from(
                        text.matchAll(
                            /(?:EUR|€|\$)\s*([0-9][\d.,]*)|([0-9][\d.,]*)\s*(?:EUR|€|\$)/gi
                        )
                    )
                    .map(match =>
                        parseAmount(
                            match[1] ?? match[2]
                        )
                    )
                    .filter(value =>
                        Number.isFinite(value) &&
                        value >= 10000
                    );

                if(currencyAmounts.length === 1){
                    return currencyAmounts[0];
                }

            }

            return null;

        })();

        let equity =

    extractAmount(

        /(?:CAPITALE INVESTITO|MEZZI PROPRI|INVESTIMENTO INIZIALE|INVESTED CAPITAL|INITIAL INVESTMENT|OWN FUNDS|(?<!ROI )EQUITY(?: INVESTED| CAPITAL)?)[^0-9€\-]{0,40}€?\s*(-?[\d.,]+)/i

    );

        const mortgage =

            parseAmount(loanRevenuePair?.[1]) ??

            extractAmount(

                /(?:IMPORTO RICHIESTO|REQUESTED LOAN|LOAN AMOUNT|LOAN|MORTGAGE|MUTUO|FINANZIAMENTO)[^0-9\-]*(-?[\d.,]+)/i

            );

        if(
    propertyPrice !== null &&
    mortgage !== null &&
    (
        equity === null ||
        equity >= propertyPrice
    )
){

    equity =
        propertyPrice -
        mortgage;

}

        const gross =

    parseAmount(loanRevenuePair?.[2]) ??

    extractAmount(

        /(?:RICAVI ANNUI|ANNUAL REVENUE|GROSS REVENUE|RICAVI LORDI|FATTURATO LORDO)[^0-9€\-]{0,30}€?\s*(-?[\d.,]+)/i

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

        const extractedVerdict =

    extractText(

        /(?:(?:EXECUTIVE RECOMMENDATION|RACCOMANDAZIONE FINALE|RECOMMENDATION|VERDETTO AI|VERDETTO|AI VERDICT|VERDICT|ESITO)\s*[:\-]?\s*)?(BUY|ACQUISTA|WAIT|ATTENDI|NO[\s_-]?BUY|AVOID|EVITA|Operazione istituzionale|Institutional-grade opportunity|Investimento consigliato|Investment recommended|Da valutare|To be reviewed|Non consigliato|Not recommended)/i

    );

        const normalizedVerdict =
            String(extractedVerdict || "")
                .toLowerCase()
                .trim();

        const verdict =
            /^(buy|acquista|operazione istituzionale|institutional-grade opportunity|investimento consigliato|investment recommended)$/.test(normalizedVerdict)
                ? "BUY"
                : /^(wait|attendi|da valutare|to be reviewed)$/.test(normalizedVerdict)
                    ? "WAIT"
                    : /^(no[\s_-]?buy|avoid|evita|non consigliato|not recommended)$/.test(normalizedVerdict)
                        ? "AVOID"
                        : null;

        // ===========================================
        // GROUNDED PROPERTY FACTS
        // Generic brochures are not financial reports.
        // Values below are extracted only when explicitly present in the PDF.
        // ===========================================

        const mainPropertyTable =
            text.match(
                /SUPERFICIE\s+LOCALI\s+CAMERE(?:\s+DA\s+LETTO)?\s+([\d.,]+)\s*(?:M[²2]|MQ|SQM)\s+([\d]+)\s+([\d]+)/i
            );

        const secondaryPropertyTable =
            text.match(
                /BAGNI\s+PIANO\s+CLASSE\s+ENERGETICA\s+([\d]+)\s+([\d]+)\s+(?:DI|OF)\s+([\d]+)(?:\s*,?\s*(?:CON|WITH)\s+(?:ASCENSORE|ELEVATOR|LIFT))?\s+([A-G](?:[1-4])?)(?:\s|$)/i
            );

        const propertyFacts = {

            surfaceSqm:
                parseAmount(
                    matchValue(
                        /(?:SUPERFICIE|SURFACE|AREA)[^0-9]{0,80}([\d.,]+)\s*(?:M[²2]|MQ|SQ\.?\s*FT|SQM)/i
                    )
                ) ??
                parseAmount(
                    matchValue(
                        /([\d.,]+)\s*(?:M[²2]|MQ|SQM)\b/i
                    )
                ),

            rooms:
                parseAmount(mainPropertyTable?.[2]) ??
                parseAmount(
                    matchValue(/(?:LOCALI|ROOMS)\s*[:\-]?\s*([\d]+)/i)
                ) ??
                parseAmount(
                    matchValue(/([\d]+)\s+(?:LOCALI|ROOMS)\b/i)
                ),

            bedrooms:
                parseAmount(mainPropertyTable?.[3]) ??
                parseAmount(
                    matchValue(/(?:CAMERE(?:\s+DA\s+LETTO)?|BEDROOMS?)\s*[:\-]?\s*([\d]+)/i)
                ) ??
                parseAmount(
                    matchValue(/([\d]+)\s+(?:CAMERE(?:\s+DA\s+LETTO)?|BEDROOMS?)\b/i)
                ),

            bathrooms:
                parseAmount(secondaryPropertyTable?.[1]) ??
                parseAmount(
                    matchValue(/(?:BAGNI|BATHROOMS?)\s*[:\-]?\s*([\d]+)/i)
                ) ??
                parseAmount(
                    matchValue(/([\d]+)\s+(?:BAGNI|BATHROOMS?)\b/i)
                ),

            floor:
                parseAmount(secondaryPropertyTable?.[2]) ??
                parseAmount(
                    matchValue(/(?:PIANO|FLOOR)\s*[:\-]?\s*([\d]+)/i)
                ),

            totalFloors:
                parseAmount(secondaryPropertyTable?.[3]) ??
                parseAmount(
                    matchValue(/(?:PIANO|FLOOR)\s*[:\-]?\s*[\d]+\s*(?:DI|OF)\s*([\d]+)/i)
                ),

            elevator:
                /\b(?:ASCENSORE|ELEVATOR|LIFT)\b/i.test(text)
                    ? true
                    : null,

            balcony:
                /\b(?:BALCONE|BALCONY)\b/i.test(text)
                    ? true
                    : null,

            terrace:
                /\b(?:TERRAZZ[AO]|TERRACE)\b/i.test(text)
                    ? true
                    : null,

            renovated:
                /\b(?:RISTRUTTURAT[OA]|RENOVATED|REFURBISHED)\b/i.test(text)
                    ? true
                    : null,

            energyClass:
                secondaryPropertyTable?.[4] ??
                extractText(
                    /(?:CLASSE\s+ENERGETICA|ENERGY\s+CLASS)\s*[:\-]?\s*([A-G](?:[1-4])?)/i
                ),

            availableAtDeed:
                /\bLIBER[OA]\s+AL\s+ROGITO\b/i.test(text)
                    ? true
                    : null

        };

        const financialEvidence = [
            roi,
            realROI,
            risk,
            occupancy,
            investmentScore,
            equity,
            mortgage,
            gross,
            annualProfit,
            cashflow,
            adr,
            verdict
        ].filter(
            value =>
                value !== null &&
                value !== undefined
        ).length;

        const isDeclaredExecutiveReport =
            documentObject.type === "executive_report";

        const isFinancialReport =
            isDeclaredExecutiveReport ||
            financialEvidence >= 2;

        // ===========================================
        // ANALYSIS
        // ===========================================

        documentObject.analysis = {

            reportType:
                isFinancialReport
                    ? "executive_pdf"
                    : "property_document",

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
                verdict,

            propertyFacts

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
                        key !== "propertyFacts" &&
                        value !== null

                ),

            isFinancialReport,

            financialEvidence,

            grounding:
                "document_only",

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

        if(window.RB_DEBUG === true){
            console.debug(
                "🧠 PDF PARSER RESULT",
                documentObject.analysis
            );
        }

        return documentObject;

    }

    catch(error){

        console.error("PDF Parser Error");

        if(window.RB_DEBUG === true){
            console.debug(error);
        }

        return documentObject;

    }

};

// Production: nessun log
