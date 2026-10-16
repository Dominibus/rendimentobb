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

        let text =

            documentObject
                .extractedText
                .replace(/\s+/g, " ")
                .trim();

        const pmsHeader=/REPORT OPERATIVO PMS|PMS OPERATIONS REPORT|ANDAMENTO IMMOBILI E PORTFOLIO|PROPERTY AND PORTFOLIO PERFORMANCE/i;
        const pmsStart=text.search(pmsHeader);
        const mixed=pmsStart>=0&&/REPORT INVESTIMENTO E GESTIONE|INVESTMENT\s*&\s*OPERATIONS REPORT/i.test(text.slice(0,pmsStart));
        if(pmsStart>=0&&!mixed){
            const operational=window.rbReadPMSDocument?.(documentObject)||null;
            const reportType=/REPORT OPERATIVO PMS|PMS OPERATIONS REPORT/i.test(text)?'pms_operational':'property_performance';
            documentObject.type=reportType;
            documentObject.analysis=Object.fromEntries(['roi','realROI','risk','occupancy','investmentScore','dscr','benchmarkROI','propertyPrice','equity','mortgage','gross','annualProfit','cashflow','adr','verdict','financingRate','debtService'].map(key=>[key,null]));
            Object.assign(documentObject.analysis,{reportType,operational,roiBasis:'unavailable',cashflowBasis:'unavailable',propertyFacts:{}});
            documentObject.executiveContext={generatedBy:'pdf-parser-engine',parserVersion:'1.2',isFinancialReport:false,hasAnalysis:!!operational,financialEvidence:0,grounding:'document_only'};
            documentObject.aiSummary={reportType,operational};
            return documentObject;
        }
        // Annual financial regexes must never consume property-specific PMS forecasts.
        if(mixed){
            const appendix=[...text.matchAll(/Ipotesi effettive del report|Actual report assumptions|Ipotesi salvate della simulazione|Saved simulation assumptions/gi)].at(-1);
            text=(text.slice(0,pmsStart)+(appendix&&appendix.index>pmsStart?' '+text.slice(appendix.index):'')).trim();
        }

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
                    .replace(/\s/g, "")
                    // PDF text often leaves sentence punctuation next to amounts.
                    .replace(/[.,]+$/, "");

            if(!/\d/.test(normalized)){
                return null;
            }

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
                /^-?\d{1,3}(\.\d{3})+$/.test(
                    normalized
                )
            ){

                normalized =
                    normalized.replace(/\./g, "");

            }

            else if(
                /^-?\d{1,3}(,\d{3})+$/.test(
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

        let roi =

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

        let propertyPrice = (() => {

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

        let mortgage =

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

        // In exported four-column KPI tables, labels precede all four values.
        // Match the entire schema instead of taking the first amount after each label.
        const feasibilityKPI = text.match(/PREZZO IMMOBILE\s+RICAVI ANNUI\s+CASHFLOW NETTO\s+ROI EQUITY\s+([\d.,]+)\s*€\s+([\d.,]+)\s*€\s+(-?[\d.,]+)\s*€\s+([\d.,]+)\s*%/i);

        let gross =

    parseAmount(feasibilityKPI?.[2]) ??

    parseAmount(loanRevenuePair?.[2]) ??

    extractAmount(

        /(?:RICAVI ANNUI|ANNUAL REVENUE|GROSS REVENUE|RICAVI LORDI|FATTURATO LORDO)\s*[:=]?\s*(?:EUR|€|\$)?\s*(-?[\d.,]+)/i

    );

        let annualProfit =

            extractAmount(

                /(?:ANNUAL PROFIT|PROFITTO ANNUO|UTILE ANNUO|CASHFLOW ANNUO|CASH FLOW ANNUO)[^0-9\-]*(-?[\d.,]+)/i

            );

        let cashflow =

            extractAmount(/(?:CASHFLOW NETTO DOPO MUTUO|NET CASH FLOW AFTER (?:LOAN|MORTGAGE))[^0-9\-]{0,30}(-?[\d.,]+)/i) ??
            parseAmount(feasibilityKPI?.[3]) ??
            annualProfit ??

            extractAmount(

                /(?:NET CASHFLOW|NET CASH FLOW|CASHFLOW|CASH FLOW)[^0-9\-]*(-?[\d.,]+)/i

            );

        // ADR must be an adjacent, explicitly labelled amount. Do not scan
        // narrative text for the next number: it can be a footer date.
        function extractADR(){
            const label = "\\b(?:AVERAGE DAILY RATE|ADR|TARIFFA MEDIA)\\b";
            const amount = "([0-9]+(?:[.,][0-9]+)*)(?![0-9.,])";
            const patterns = [
                // Exported PMS table: ADR RevPAR 155 € 28 €.
                new RegExp(label + "\\s+RevPAR\\s+" + amount + "\\s*€", "ig"),
                new RegExp(label + "\\s*(?:[:=]\\s*)?€\\s*" + amount + "(?!\\s*[/:%–—-])", "ig"),
                new RegExp(label + "\\s*(?:[:=]\\s*)?" + amount + "\\s*€", "ig"),
                new RegExp(label + "\\s*\\(€\\)\\s*[:=]?\\s*" + amount + "(?!\\s*[/:%–—-])", "ig"),
                // A colon/equal sign also makes a unitless value explicit.
                new RegExp(label + "\\s*[:=]\\s*" + amount + "(?=\\s|$)(?!\\s*[/:%–—-])", "ig")
            ];
            for(const pattern of patterns){
                for(const match of text.matchAll(pattern)){
                    const value = parseAmount(match[1]);
                    if(value !== null && value >= 0){ return value; }
                }
            }
            return null;
        }

        const adr = extractADR();

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

        // Keep the unit in the evidence; convert square feet to square metres.
        const surfaceEvidence = text.match(/(?:SUPERFICIE|SURFACE|AREA)[^0-9]{0,80}([\d.,]+)\s*(M[²2]|MQ|SQ\.?\s*FT|SQM)/i);
        if(surfaceEvidence && /sq\.?\s*ft/i.test(surfaceEvidence[2])){
            const sqft = parseAmount(surfaceEvidence[1]);
            propertyFacts.surfaceSqm = sqft === null ? null : Math.round(sqft * 0.09290304 * 100) / 100;
        }

        // RC123: our own report appendix is explicit evidence, unlike broad
        // regex matches that can cross an N/A field and pick up another KPI.
        const appendixHeadings = [...text.matchAll(/(?:Ipotesi effettive del report|Actual report assumptions|Ipotesi salvate della simulazione|Saved simulation assumptions)/gi)];
        const appendix = /RendimentoBB/i.test(text) && appendixHeadings.length
            ? text.slice(appendixHeadings.at(-1).index) : null;
        if(appendix){
            const amountAt = labels => {
                const match = appendix.match(new RegExp(`(?:${labels})\\s*(?:(Non indicato|Not provided|Non disponibile|Unavailable|N/A)|(?:EUR|€|\\$)\\s*(-?[\\d.,]+)|(-?[\\d.,]+)\\s*(?:EUR|€|\\$))`, 'i'));
                return match ? {found:true,value:match[1] ? null : parseAmount(match[2] ?? match[3])} : {found:false};
            };
            const priceEvidence=amountAt('Valore immobile|Property value|Prezzo immobile|Purchase price');
            const equityEvidence=amountAt('Capitale proprio / avvio|Equity / startup capital|Capitale proprio|Capitale di avvio|Startup capital|Equity');
            const loanEvidence=amountAt('Importo mutuo|Loan amount');
            const cashflowEvidence=amountAt('Cashflow netto annuo|Annual net cashflow|Cashflow netto|Net cashflow');
            const revenueEvidence=amountAt('Ricavi annui|Annual revenue');
            if(priceEvidence.found) propertyPrice=priceEvidence.value;
            if(equityEvidence.found) equity=equityEvidence.value;
            if(loanEvidence.found) mortgage=loanEvidence.value;
            if(cashflowEvidence.found){cashflow=cashflowEvidence.value;annualProfit=cashflowEvidence.value;}
            if(revenueEvidence.found) gross=revenueEvidence.value;
            const roiEvidence=text.match(/(?:FORECAST EQUITY ROI|FORECAST STARTUP ROI|ROI EQUITY PREVISIONALE|ROI DI AVVIO PREVISIONALE)\s*(N\/A|-?\d+(?:[.,]\d+)?\s*%)/i)
                || text.match(/(N\/A|-?\d+(?:[.,]\d+)?\s*%)\s*(?:Estimated equity ROI|Estimated startup ROI|ROI stimato sul capitale proprio|ROI stimato sul capitale di avvio)/i);
            if(roiEvidence) roi=/N\/A/i.test(roiEvidence[1]) ? null : parsePercentage(roiEvidence[1].replace('%',''));
            if(equityEvidence.found && equity === 0) roi=null;
        }

        // RC141: read labelled monetary cells, never a percentage from "FORECAST EQUITY ROI".
        // The financial section was bounded above before reading an integrated report.
        if(mixed){
            const moneyCell = labels => {
                const re = new RegExp(`(?:^|\\s)(?:${labels})\\s*:?\\s*(?:(N/A|N/D|Non indicato|Not provided)|(?:EUR|€)\\s*(-?\\d[\\d.,]*)|(-?\\d[\\d.,]*)\\s*(?:EUR|€))(?=\\s|$)`, 'i');
                const m=text.match(re);
                return m ? {found:true,value:m[1]?null:parseAmount(m[2]??m[3])} : {found:false,value:null};
            };
            const priceCell=moneyCell('PURCHASE PRICE|PROPERTY VALUE|VALORE IMMOBILE|PREZZO IMMOBILE|PREZZO DI ACQUISTO|PREZZO');
            const equityCell=moneyCell('EQUITY|STARTUP CAPITAL|CAPITALE PROPRIO|CAPITALE DI AVVIO|CAPITALE AVVIO');
            // An unrecognized cell stays unavailable: broad legacy matches are unsafe here.
            propertyPrice=priceCell.value;
            equity=equityCell.value;
        }

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
            dscr: extractPercentage(/DSCR\s*[:]?\s*(\d+(?:[.,]\d+)?)/i) ?? parsePercentage(text.match(/MUTUO\s+LTV\s+DSCR\s+[\d.,]+\s*€\s+[\d.,]+\s*%\s*(\d+(?:[.,]\d+)?)/i)?.[1]),
            benchmarkROI: extractPercentage(/(?:ROI EQUITY DI MERCATO|MARKET EQUITY ROI|BENCHMARK LOCALE|LOCAL BENCHMARK)\s*[:]?\s*([\d.,]+)\s*%/i),

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

            roiBasis: /ROI (?:SUL CAPITALE PROPRIO|ON EQUITY|EQUITY)|RETURN ON EQUITY|FORECAST EQUITY ROI/i.test(text) ? "equity" : /ROI (?:IMMOBILE|SUL VALORE|ON PROPERTY)/i.test(text) ? "property" : "unknown",
            cashflowBasis: /CASHFLOW NETTO DOPO MUTUO|NET CASH FLOW AFTER (?:LOAN|MORTGAGE)/i.test(text) ? "after_mortgage" : "unknown",
            financingRate: extractPercentage(/(?:TASSO IPOTIZZATO|ASSUMED INTEREST RATE)[^0-9]{0,30}([\d.,]+)\s*%/i),
            debtService: extractAmount(/(?:RATA MUTUO ANNUA STIMATA|ESTIMATED ANNUAL LOAN PAYMENTS)[^0-9]{0,30}([\d.,]+)/i),
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
                        key !== "roiBasis" &&
                        key !== "cashflowBasis" &&
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
            (void 0)


;
        }

        return documentObject;

    }

    catch(error){

        (void 0);

        if(window.RB_DEBUG === true){
            (void 0);
        }

        return documentObject;

    }

};

// Production: nessun log
