// ===============================================
// 🧠 EXECUTIVE RESPONSE BUILDER
// Silicon Valley AI 2026
// ===============================================

function getExecutiveFinancialData(
    liveData = {}
){

  const rawNet =

    liveData.net ??
    liveData.netProfit ??
    liveData.profitNet ??
    liveData.cashflow ??
    null;

  const rawGross =

    liveData.gross ??
    liveData.grossProfit ??
    liveData.profit ??
    liveData.revenue ??
    0;

  const net =

    rawNet !== undefined &&
    rawNet !== null &&
    rawNet !== "" &&
    !isNaN(Number(rawNet))

      ? Number(rawNet)

      : Number(rawGross || 0);

  const gross =
    Number(rawGross || 0);

  return {

    rawNet,
    rawGross,
    net,
    gross

  };

}

// ===============================================
// 🧱 VERDICT BLOCK
// ===============================================

function buildVerdictBlock(advisor){

    if(!advisor){

        return{

            it:null,

            en:null

        };

    }

   const canonicalInvestment =
    window.lastInvestmentScore || {};

const verdict =
    canonicalInvestment.verdict ||
    advisor?.verdict ||
    "";

    let icon = "⚪";

    if(verdict === "BUY"){

        icon = "🟢";

    }

    else if(verdict === "WAIT"){

        icon = "🟡";

    }

    else if(verdict === "NO_BUY"){

        icon = "🔴";

    }

    return{

        it:

`${icon} VERDETTO AI: ${
    advisor?.verdictIT ||
     verdict ||
    "-"
}`,

        en:

`${icon} AI VERDICT: ${
    advisor?.verdictEN ||
      verdict ||
    "-"
}`

    };

}

window.rbBuildExecutiveResponse = function({

    executiveContext = {},

    advisor = null,

    documentKnowledge = {},

    executiveNarrative = null,

    investmentScore = null,

    brain = null,

    executiveBrain = null,

    reasoning = null,

    intent = {},

    message = "",

    aiSignals = [],

    financials = {}

} = {}){

  const {

    liveData = {}

} = executiveContext;

const executiveFinancials =

    Object.keys(financials || {}).length

        ? financials

        : getExecutiveFinancialData(
              liveData
          );

const executiveModel = {

    financials: executiveFinancials,

    advisor,

    executiveNarrative,

    investmentScore,

    documentKnowledge,

    brain,

    executiveBrain,

    reasoning

};

console.log(
    "🧠 EXECUTIVE MODEL",
    executiveModel
);   

    console.log(
    "🧠 EXECUTIVE BRAIN IN BUILDER",
    executiveBrain
);

console.log(
    "🧠 EXECUTIVE BUILDER",
    executiveFinancials
);
    
// ===============================================
// 🧠 EXECUTIVE RESPONSE BLOCKS
// ===============================================

const blocksIT = [];

const blocksEN = []; 

let textIT = "";

let textEN = "";

// ===============================================
// 🧠 CONTEXT ROUTER
// ===============================================

const currentIntent =

    intent?.intent ||

    "generic";

const context = {

    isExecutive:

        [
            "investment_executive",
            "executive_analysis"
        ].includes(currentIntent),

    isRisk:

        currentIntent ===
        "risk_analysis",

    isROI:

        currentIntent ===
        "roi_analysis",

    isStrategy:

        [
            "investment_strategy",
            "investment_advisor"
        ].includes(currentIntent),

    isReport:

        currentIntent ===
        "report_interpretation"

};       

// ===============================================
// 🔴 VERDICT BLOCK
// ===============================================

const verdictBlock =

    buildVerdictBlock(
        advisor
    );

if(verdictBlock.it){

    blocksIT.push(
        verdictBlock.it
    );

}

if(verdictBlock.en){

    blocksEN.push(
        verdictBlock.en
    );

}

// ===============================================
// 💡 EXECUTIVE RECOMMENDATION BLOCK
// ===============================================

if(executiveNarrative?.recommendationIT){

    const scoreBlockIT =
    investmentScore?.score != null
        ? `📊 Investment Score\n${investmentScore.score}/100\n${investmentScore.labelIT || ""}\n`
        : "";

    const scoreBlockEN =
    investmentScore?.score != null
        ? `📊 Investment Score\n${investmentScore.score}/100\n${investmentScore.labelEN || ""}\n`
        : "";

    blocksIT.push(

        "Ho analizzato la simulazione dell'investimento.\n\n" +

        scoreBlockIT

    );

    blocksEN.push(

        "I analyzed the investment simulation.\n\n" +

        scoreBlockEN

    );

}
// ===============================================
// 🧠 EXECUTIVE SUMMARY
// ===============================================

if(executiveBrain?.summaryIT){

    blocksIT.push(

        executiveBrain.summaryIT

    );

}

if(executiveBrain?.summaryEN){

    blocksEN.push(

        "🧠 AI Analysis\n\n" +

        executiveBrain.summaryEN

    );

}

// ===============================================
// 📌 EXECUTIVE EXPLANATION
// ===============================================

if(executiveBrain?.explanationIT){

    blocksIT.push(

        executiveBrain.explanationIT

    );

}

if(executiveBrain?.explanationEN){

    blocksEN.push(

       executiveBrain.explanationEN

    );

}

// ===============================================
// 💪 STRONGEST POINT
// ===============================================

if(executiveBrain?.strongestPointIT){

    blocksIT.push(

        "💪 Punto di forza\n\n" +

        executiveBrain.strongestPointIT

    );

}

if(executiveBrain?.strongestPointEN){

    blocksEN.push(

        "💪 Strongest Point\n\n" +

        executiveBrain.strongestPointEN

    );

}
    
// ===============================================
// 🧠 EXECUTIVE SUMMARY BLOCK
// ===============================================

if(

    !executiveNarrative?.recommendationIT &&

    brain?.executiveSummary?.it

){

    blocksIT.push(

        brain.executiveSummary.it

    );

}

if(

    !executiveNarrative?.recommendationEN &&

    brain?.executiveSummary?.en

){

    blocksEN.push(

        brain.executiveSummary.en

    );

}

// ===============================================
// 🧠 CONTEXT FILTER
// ===============================================

if(context.isROI){

    blocksIT.length = 0;

    blocksEN.length = 0;

    if(verdictBlock.it)
        blocksIT.push(verdictBlock.it);

    if(verdictBlock.en)
        blocksEN.push(verdictBlock.en);

    if(executiveBrain?.summaryIT)
        blocksIT.push(executiveBrain.summaryIT);

    if(executiveBrain?.summaryEN)
        blocksEN.push(executiveBrain.summaryEN);

}

else if(context.isRisk){

    blocksIT.length = 0;

    blocksEN.length = 0;

    if(verdictBlock.it)
        blocksIT.push(verdictBlock.it);

    if(verdictBlock.en)
        blocksEN.push(verdictBlock.en);

    if(executiveBrain?.explanationIT)
        blocksIT.push(executiveBrain.explanationIT);

    if(executiveBrain?.explanationEN)
        blocksEN.push(executiveBrain.explanationEN);

}

else if(context.isReport){

    blocksIT.length = 0;

    blocksEN.length = 0;

    if(brain?.executiveSummary?.it)
        blocksIT.push(brain.executiveSummary.it);

    if(brain?.executiveSummary?.en)
        blocksEN.push(brain.executiveSummary.en);

}

// ===============================================
// 🎯 "CONVIENE?" EXECUTIVE ADVISORY
// ===============================================

const normalizedMessage =
    String(message || "")
        .toLowerCase()
        .trim()
        .replace(/[?!.,;:]+$/g, "");

const isConvenienceQuestion =
    context.isExecutive &&
    [
        "conviene",
        "conviene investire",
        "conviene questo investimento",
        "ne vale la pena",
        "is it worth it",
        "is this investment worth it"
    ].includes(normalizedMessage);

if(isConvenienceQuestion){

    const canonicalInvestment =
        window.lastInvestmentScore || {};

    const score =
        Number(
            canonicalInvestment.score ??
            investmentScore?.score ??
            advisor?.score ??
            0
        );

    const verdict =
        canonicalInvestment.verdict ??
        investmentScore?.verdict ??
        advisor?.verdict ??
        "WAIT";

    const roi =
        Number(
            liveData.roi ??
            executiveContext?.analysisData?.roi ??
            0
        );

    const realROI =
        Number(
            liveData.realROI ??
            executiveContext?.analysisData?.realROI ??
            0
        );

    const risk =
        Number(
            liveData.risk ??
            executiveContext?.analysisData?.risk ??
            0
        );

    const occupancy =
        Number(
            liveData.occupancy ??
            executiveContext?.analysisData?.occupancy ??
            0
        );

    const cashflow =
        Number(
            executiveFinancials?.net ??
            liveData.net ??
            liveData.cashflow ??
            0
        );

    const mortgagePercent =
        Number(
            liveData.mortgagePercent ??
            executiveContext?.analysisData?.mortgagePercent ??
            0
        );

    const formatEUR = value =>
        new Intl.NumberFormat(
            "it-IT",
            {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0
            }
        ).format(value || 0);

    const formatPct = value =>
        Number(value || 0)
            .toLocaleString(
                "it-IT",
                {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                }
            ) + "%";

    const formatPctEN = value =>
        Number(value || 0)
            .toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                }
            ) + "%";

    let openingIT = "";
    let openingEN = "";

    if(verdict === "BUY"){

        openingIT =
            "Sì. Sulla base della simulazione, l'investimento presenta condizioni favorevoli per procedere.";

        openingEN =
            "Yes. Based on the simulation, the investment shows favorable conditions to proceed.";

    }
    else if(verdict === "NO_BUY"){

        openingIT =
            "No. Nelle condizioni attuali non considererei l'investimento sufficientemente solido per procedere.";

        openingEN =
            "No. Under the current assumptions, I would not consider the investment strong enough to proceed.";

    }
    else{

        openingIT =
            "Non ancora. L'investimento presenta elementi interessanti, ma prima di procedere ottimizzerei alcuni parametri.";

        openingEN =
            "Not yet. The investment shows potential, but I would optimize some parameters before proceeding.";

    }

    let attentionIT = "";
    let attentionEN = "";

    if(mortgagePercent >= 75){

        attentionIT =
            `Il principale punto da monitorare è la leva finanziaria del ${formatPct(mortgagePercent)}: aumenta il rendimento sull'equity, ma riduce il margine di sicurezza se ricavi o occupazione scendono.`;

        attentionEN =
            `The main point to monitor is the ${formatPctEN(mortgagePercent)} leverage: it increases the return on equity, but reduces the safety margin if revenue or occupancy declines.`;

    }
    else if(risk >= 50){

        attentionIT =
            `Il principale punto di attenzione è il rischio, attualmente pari a ${Math.round(risk)}/100.`;

        attentionEN =
            `The main point of attention is risk, currently ${Math.round(risk)}/100.`;

    }
    else if(occupancy < 65){

        attentionIT =
            `Il principale punto da migliorare è l'occupazione prevista del ${formatPct(occupancy)}.`;

        attentionEN =
            `The main area to improve is the projected ${formatPctEN(occupancy)} occupancy rate.`;

    }
    else{

        attentionIT =
            "Non emergono criticità immediate, ma manterrei sotto controllo occupazione, costi operativi e sostenibilità del finanziamento.";

        attentionEN =
            "No immediate critical issues emerge, but I would continue monitoring occupancy, operating costs and financing sustainability.";

    }

    blocksIT.length = 0;
    blocksEN.length = 0;

    blocksIT.push(
`${verdict === "BUY" ? "🟢" : verdict === "NO_BUY" ? "🔴" : "🟡"} VERDETTO AI: ${verdict}

${openingIT}

📊 Investment Score
${Math.round(score)}/100

📈 Perché
• ROI sul capitale: ${formatPct(roi)}
• ROI sull'immobile: ${formatPct(realROI)}
• Cashflow annuo: ${formatEUR(cashflow)}
• Rischio: ${Math.round(risk)}/100
• Occupazione prevista: ${formatPct(occupancy)}

⚠️ Punto da monitorare

${attentionIT}

🎯 Valutazione

${executiveBrain?.strongestPointIT || "La combinazione tra rendimento, rischio e cashflow determina la sostenibilità complessiva dell'operazione."}`
    );

    blocksEN.push(
`${verdict === "BUY" ? "🟢" : verdict === "NO_BUY" ? "🔴" : "🟡"} AI VERDICT: ${verdict}

${openingEN}

📊 Investment Score
${Math.round(score)}/100

📈 Why
• Return on equity: ${formatPctEN(roi)}
• Property ROI: ${formatPctEN(realROI)}
• Annual cashflow: ${formatEUR(cashflow)}
• Risk: ${Math.round(risk)}/100
• Projected occupancy: ${formatPctEN(occupancy)}

⚠️ Key Point to Monitor

${attentionEN}

🎯 Assessment

${executiveBrain?.strongestPointEN || "The combination of return, risk and cashflow determines the overall sustainability of the investment."}`
    );

}    

// ===============================================
// 🏠 PROPERTY PRICE WHAT-IF RESPONSE
// Executive Investment Assistant 2026
// IT / EN — temporary scenario comparison
// ===============================================

const whatIfScenario =
    executiveContext?.analysisData?.whatIfScenario ||
    liveData?.whatIfScenario ||
    null;

const isPropertyPriceWhatIf =
    context.isExecutive &&
    whatIfScenario?.type === "property_price";

if(isPropertyPriceWhatIf){

    const originalPrice =
        Number(
            whatIfScenario.originalPropertyPrice || 0
        );

    const scenarioPrice =
        Number(
            whatIfScenario.scenarioPropertyPrice || 0
        );

    const originalLoan =
        Number(
            whatIfScenario.originalLoanAmount || 0
        );

    const scenarioLoan =
        Number(
            whatIfScenario.scenarioLoanAmount || 0
        );

    const originalEquity =
        Number(
            whatIfScenario.originalEquity || 0
        );

    const scenarioEquity =
        Number(
            whatIfScenario.scenarioEquity || 0
        );

    const mortgagePercent =
        Number(
            whatIfScenario.scenarioMortgagePercent || 0
        );

    const originalROI =
        Number(
            whatIfScenario.originalROI || 0
        );

    const scenarioROI =
        Number(
            whatIfScenario.scenarioROI || 0
        );

    const originalRealROI =
        Number(
            whatIfScenario.originalRealROI || 0
        );

    const scenarioRealROI =
        Number(
            whatIfScenario.scenarioRealROI || 0
        );

    const originalCashflow =
        Number(
            whatIfScenario.originalCashflow || 0
        );

    const scenarioCashflow =
        Number(
            whatIfScenario.scenarioCashflow || 0
        );

    const originalScore =
        Number(
            whatIfScenario.originalInvestmentScore || 0
        );

    const scenarioScore =
        Number(
            whatIfScenario.scenarioInvestmentScore || 0
        );

    const scenarioVerdict =
        advisor?.verdict ||
        investmentScore?.verdict ||
        "WAIT";

    const formatEURIT = value =>
        new Intl.NumberFormat(
            "it-IT",
            {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(value || 0);

    const formatEUREN = value =>
        new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(value || 0);

    const formatPctIT = value =>
        Number(value || 0)
            .toLocaleString(
                "it-IT",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ) + "%";

    const formatPctEN = value =>
        Number(value || 0)
            .toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ) + "%";

    const priceDelta =
        scenarioPrice - originalPrice;

    const roiDelta =
        scenarioROI - originalROI;

    const cashflowDelta =
        scenarioCashflow - originalCashflow;

    const scoreDelta =
        scenarioScore - originalScore;

    const improvesScenario =
        roiDelta > 0 &&
        cashflowDelta > 0;

    const openingIT =
        improvesScenario
            ? `Sì. A ${formatEURIT(scenarioPrice)} lo scenario migliora rispetto al prezzo iniziale di ${formatEURIT(originalPrice)}.`
            : `A ${formatEURIT(scenarioPrice)} lo scenario cambia rispetto al prezzo iniziale di ${formatEURIT(originalPrice)}.`;

    const openingEN =
        improvesScenario
            ? `Yes. At ${formatEUREN(scenarioPrice)}, the scenario improves compared with the original ${formatEUREN(originalPrice)} purchase price.`
            : `At ${formatEUREN(scenarioPrice)}, the scenario changes compared with the original ${formatEUREN(originalPrice)} purchase price.`;

    blocksIT.length = 0;
    blocksEN.length = 0;

    blocksIT.push(
`${scenarioVerdict === "BUY" ? "🟢" : scenarioVerdict === "NO_BUY" ? "🔴" : "🟡"} SCENARIO PREZZO: ${scenarioVerdict}

${openingIT}

Mantengo invariato l'LTV al ${mortgagePercent.toLocaleString("it-IT", {maximumFractionDigits: 1})}% per confrontare il solo effetto del prezzo.

💰 Struttura finanziaria
• Prezzo: ${formatEURIT(originalPrice)} → ${formatEURIT(scenarioPrice)}
• Mutuo: ${formatEURIT(originalLoan)} → ${formatEURIT(scenarioLoan)}
• Equity: ${formatEURIT(originalEquity)} → ${formatEURIT(scenarioEquity)}

📈 Impatto
• ROI sul capitale: ${formatPctIT(originalROI)} → ${formatPctIT(scenarioROI)}
• ROI sull'immobile: ${formatPctIT(originalRealROI)} → ${formatPctIT(scenarioRealROI)}
• Cashflow annuo: ${formatEURIT(originalCashflow)} → ${formatEURIT(scenarioCashflow)}
• Investment Score: ${Math.round(originalScore)}/100 → ${Math.round(scenarioScore)}/100

🎯 Valutazione

${priceDelta < 0
    ? `La riduzione del prezzo di ${formatEURIT(Math.abs(priceDelta))} aumenta il rendimento sull'equity di ${formatPctIT(Math.abs(roiDelta))} e migliora il cashflow annuo di ${formatEURIT(Math.abs(cashflowDelta))}${scoreDelta === 0 ? ", senza modificare l'Investment Score." : "."}`
    : `Il nuovo prezzo modifica la struttura economica dell'operazione. Il confronto mostra l'effetto diretto su rendimento, cashflow e sostenibilità finanziaria.`}`
    );

    blocksEN.push(
`${scenarioVerdict === "BUY" ? "🟢" : scenarioVerdict === "NO_BUY" ? "🔴" : "🟡"} PRICE SCENARIO: ${scenarioVerdict}

${openingEN}

I keep the LTV unchanged at ${mortgagePercent.toLocaleString("en-US", {maximumFractionDigits: 1})}% to isolate the impact of the purchase price.

💰 Financial structure
• Price: ${formatEUREN(originalPrice)} → ${formatEUREN(scenarioPrice)}
• Mortgage: ${formatEUREN(originalLoan)} → ${formatEUREN(scenarioLoan)}
• Equity: ${formatEUREN(originalEquity)} → ${formatEUREN(scenarioEquity)}

📈 Impact
• Return on equity: ${formatPctEN(originalROI)} → ${formatPctEN(scenarioROI)}
• Property ROI: ${formatPctEN(originalRealROI)} → ${formatPctEN(scenarioRealROI)}
• Annual cashflow: ${formatEUREN(originalCashflow)} → ${formatEUREN(scenarioCashflow)}
• Investment Score: ${Math.round(originalScore)}/100 → ${Math.round(scenarioScore)}/100

🎯 Assessment

${priceDelta < 0
    ? `The ${formatEUREN(Math.abs(priceDelta))} lower purchase price increases return on equity by ${formatPctEN(Math.abs(roiDelta))} and improves annual cashflow by ${formatEUREN(Math.abs(cashflowDelta))}${scoreDelta === 0 ? ", without changing the Investment Score." : "."}`
    : `The new purchase price changes the economics of the investment. The comparison shows its direct impact on returns, cashflow and financial sustainability.`}`
    );

} 

// ===============================================
// 🏨 OCCUPANCY WHAT-IF RESPONSE
// Executive Investment Assistant 2026
// IT / EN — operational scenario comparison
// ===============================================

const isOccupancyWhatIf =
    context.isExecutive &&
    whatIfScenario?.type === "occupancy";

if(isOccupancyWhatIf){

    const originalOccupancy =
        Number(
            whatIfScenario.originalOccupancy || 0
        );

    const scenarioOccupancy =
        Number(
            whatIfScenario.scenarioOccupancy || 0
        );

    const originalROI =
        Number(
            whatIfScenario.originalROI || 0
        );

    const scenarioROI =
        Number(
            whatIfScenario.scenarioROI || 0
        );

    const originalRealROI =
        Number(
            whatIfScenario.originalRealROI || 0
        );

    const scenarioRealROI =
        Number(
            whatIfScenario.scenarioRealROI || 0
        );

    const originalCashflow =
        Number(
            whatIfScenario.originalCashflow || 0
        );

    const scenarioCashflow =
        Number(
            whatIfScenario.scenarioCashflow || 0
        );

    const originalRisk =
        Number(
            whatIfScenario.originalRisk || 0
        );

    const scenarioRisk =
        Number(
            whatIfScenario.scenarioRisk || 0
        );

    const originalScore =
        Number(
            whatIfScenario.originalInvestmentScore || 0
        );

    const scenarioScore =
        Number(
            whatIfScenario.scenarioInvestmentScore || 0
        );

    const scenarioVerdict =
        advisor?.verdict ||
        investmentScore?.verdict ||
        "WAIT";

    const originalVerdict =
        originalScore >= 75
            ? "BUY"
            : originalScore <= 40
                ? "AVOID"
                : "WAIT";

    const formatEURIT = value =>
        new Intl.NumberFormat(
            "it-IT",
            {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(value || 0);

    const formatEUREN = value =>
        new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(value || 0);

    const formatPctIT = value =>
        Number(value || 0)
            .toLocaleString(
                "it-IT",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ) + "%";

    const formatPctEN = value =>
        Number(value || 0)
            .toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ) + "%";

    const occupancyDelta =
        scenarioOccupancy - originalOccupancy;

    const roiDelta =
        scenarioROI - originalROI;

    const cashflowDelta =
        scenarioCashflow - originalCashflow;

    const riskDelta =
        scenarioRisk - originalRisk;

    const scoreDelta =
        scenarioScore - originalScore;

    const worsensScenario =
        occupancyDelta < 0 &&
        (
            roiDelta < 0 ||
            cashflowDelta < 0 ||
            scoreDelta < 0
        );

    const improvesScenario =
        occupancyDelta > 0 &&
        (
            roiDelta > 0 ||
            cashflowDelta > 0 ||
            scoreDelta > 0
        );

    let openingIT = "";
    let openingEN = "";

    if(worsensScenario){

        openingIT =
            `Con un'occupazione del ${formatPctIT(scenarioOccupancy)}, lo scenario peggiora sensibilmente rispetto al ${formatPctIT(originalOccupancy)} della simulazione originale.`;

        openingEN =
            `At ${formatPctEN(scenarioOccupancy)} occupancy, the scenario deteriorates materially compared with the original ${formatPctEN(originalOccupancy)} assumption.`;

    }
    else if(improvesScenario){

        openingIT =
            `Con un'occupazione del ${formatPctIT(scenarioOccupancy)}, lo scenario migliora rispetto al ${formatPctIT(originalOccupancy)} della simulazione originale.`;

        openingEN =
            `At ${formatPctEN(scenarioOccupancy)} occupancy, the scenario improves compared with the original ${formatPctEN(originalOccupancy)} assumption.`;

    }
    else{

        openingIT =
            `Con un'occupazione del ${formatPctIT(scenarioOccupancy)}, cambia il profilo economico dell'investimento rispetto al ${formatPctIT(originalOccupancy)} iniziale.`;

        openingEN =
            `At ${formatPctEN(scenarioOccupancy)} occupancy, the investment economics change compared with the original ${formatPctEN(originalOccupancy)} assumption.`;

    }

        const weakestPointIT =
        executiveBrain?.weakestPointIT ||
        "";

    const weakestPointEN =
        executiveBrain?.weakestPointEN ||
        "";

    const weakestPointBlockIT =
        weakestPointIT
            ? `

⚠️ Area principale da migliorare

${weakestPointIT}`
            : "";

    const weakestPointBlockEN =
        weakestPointEN
            ? `

⚠️ Main Area to Improve

${weakestPointEN}`
            : "";

    blocksIT.length = 0;
    blocksEN.length = 0;

    blocksIT.push(
`${scenarioVerdict === "BUY" ? "🟢" : scenarioVerdict === "NO_BUY" || scenarioVerdict === "AVOID" ? "🔴" : "🟡"} SCENARIO OCCUPAZIONE: ${scenarioVerdict}

${openingIT}

Mantengo invariati prezzo, struttura finanziaria, ADR e costi per isolare l'effetto del tasso di occupazione.

🏨 Occupazione
• ${formatPctIT(originalOccupancy)} → ${formatPctIT(scenarioOccupancy)}

📈 Impatto economico
• ROI sul capitale: ${formatPctIT(originalROI)} → ${formatPctIT(scenarioROI)}
• ROI sull'immobile: ${formatPctIT(originalRealROI)} → ${formatPctIT(scenarioRealROI)}
• Cashflow annuo: ${formatEURIT(originalCashflow)} → ${formatEURIT(scenarioCashflow)}
• Rischio: ${Math.round(originalRisk)}/100 → ${Math.round(scenarioRisk)}/100
• Investment Score: ${Math.round(originalScore)}/100 → ${Math.round(scenarioScore)}/100

🎯 Decisione
• ${originalVerdict} → ${scenarioVerdict}

🧠 Valutazione AI

${worsensScenario
    ? `La riduzione dell'occupazione di ${formatPctIT(Math.abs(occupancyDelta))} riduce il ROI sull'equity di ${formatPctIT(Math.abs(roiDelta))} e il cashflow annuo di ${formatEURIT(Math.abs(cashflowDelta))}. Il rischio aumenta di ${Math.abs(Math.round(riskDelta))} punti e l'Investment Score perde ${Math.abs(Math.round(scoreDelta))} punti.`
    : improvesScenario
        ? `L'aumento dell'occupazione di ${formatPctIT(Math.abs(occupancyDelta))} migliora ROI, cashflow e sostenibilità economica dello scenario.`
        : `Il nuovo livello di occupazione modifica rendimento, cashflow e profilo di rischio dell'operazione.`}

${weakestPointBlockIT}`
    );

    blocksEN.push(
`${scenarioVerdict === "BUY" ? "🟢" : scenarioVerdict === "NO_BUY" || scenarioVerdict === "AVOID" ? "🔴" : "🟡"} OCCUPANCY SCENARIO: ${scenarioVerdict}

${openingEN}

I keep purchase price, financing structure, ADR and costs unchanged to isolate the impact of occupancy.

🏨 Occupancy
• ${formatPctEN(originalOccupancy)} → ${formatPctEN(scenarioOccupancy)}

📈 Economic impact
• Return on equity: ${formatPctEN(originalROI)} → ${formatPctEN(scenarioROI)}
• Property ROI: ${formatPctEN(originalRealROI)} → ${formatPctEN(scenarioRealROI)}
• Annual cashflow: ${formatEUREN(originalCashflow)} → ${formatEUREN(scenarioCashflow)}
• Risk: ${Math.round(originalRisk)}/100 → ${Math.round(scenarioRisk)}/100
• Investment Score: ${Math.round(originalScore)}/100 → ${Math.round(scenarioScore)}/100

🎯 Decision
• ${originalVerdict} → ${scenarioVerdict}

🧠 AI Assessment

${worsensScenario
    ? `The ${formatPctEN(Math.abs(occupancyDelta))} occupancy decline reduces return on equity by ${formatPctEN(Math.abs(roiDelta))} and annual cashflow by ${formatEUREN(Math.abs(cashflowDelta))}. Risk increases by ${Math.abs(Math.round(riskDelta))} points and the Investment Score loses ${Math.abs(Math.round(scoreDelta))} points.`
    : improvesScenario
        ? `The ${formatPctEN(Math.abs(occupancyDelta))} occupancy increase improves returns, cashflow and the economic sustainability of the scenario.`
        : `The new occupancy level changes the investment's return, cashflow and risk profile.`}`

${weakestPointBlockEN}`
    );

}    

// ===============================================
// 💶 ADR / NIGHTLY RATE WHAT-IF RESPONSE
// Executive Investment Assistant 2026
// IT / EN — operational pricing scenario
// ===============================================

const isADRWhatIf =
    context.isExecutive &&
    whatIfScenario?.type === "adr";

if(isADRWhatIf){

    const originalADR =
        Number(
            whatIfScenario.originalADR || 0
        );

    const scenarioADR =
        Number(
            whatIfScenario.scenarioADR || 0
        );

    const occupancy =
        Number(
            whatIfScenario.scenarioOccupancy ||
            whatIfScenario.originalOccupancy ||
            0
        );

    const originalROI =
        Number(
            whatIfScenario.originalROI || 0
        );

    const scenarioROI =
        Number(
            whatIfScenario.scenarioROI || 0
        );

    const originalRealROI =
        Number(
            whatIfScenario.originalRealROI || 0
        );

    const scenarioRealROI =
        Number(
            whatIfScenario.scenarioRealROI || 0
        );

    const originalCashflow =
        Number(
            whatIfScenario.originalCashflow || 0
        );

    const scenarioCashflow =
        Number(
            whatIfScenario.scenarioCashflow || 0
        );

    const originalRisk =
        Number(
            whatIfScenario.originalRisk || 0
        );

    const scenarioRisk =
        Number(
            whatIfScenario.scenarioRisk || 0
        );

    const originalScore =
        Number(
            whatIfScenario.originalInvestmentScore || 0
        );

    const scenarioScore =
        Number(
            whatIfScenario.scenarioInvestmentScore || 0
        );

    const scenarioVerdict =
        advisor?.verdict ||
        investmentScore?.verdict ||
        "WAIT";

    const originalVerdict =
        originalScore >= 75
            ? "BUY"
            : originalScore <= 40
                ? "AVOID"
                : "WAIT";

    const formatEURIT = value =>
        new Intl.NumberFormat(
            "it-IT",
            {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(value || 0);

    const formatEUREN = value =>
        new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(value || 0);

    const formatPctIT = value =>
        Number(value || 0)
            .toLocaleString(
                "it-IT",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ) + "%";

    const formatPctEN = value =>
        Number(value || 0)
            .toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ) + "%";

    const adrDelta =
        scenarioADR - originalADR;

    const roiDelta =
        scenarioROI - originalROI;

    const realROIDelta =
        scenarioRealROI - originalRealROI;

    const cashflowDelta =
        scenarioCashflow - originalCashflow;

    const riskDelta =
        scenarioRisk - originalRisk;

    const scoreDelta =
        scenarioScore - originalScore;

    const improvesScenario =
        adrDelta > 0 &&
        (
            roiDelta > 0 ||
            cashflowDelta > 0 ||
            scoreDelta > 0
        );

    const worsensScenario =
        adrDelta < 0 &&
        (
            roiDelta < 0 ||
            cashflowDelta < 0 ||
            scoreDelta < 0
        );

    let openingIT = "";
    let openingEN = "";

    if(improvesScenario){

        openingIT =
            `Portando il prezzo notte da ${formatEURIT(originalADR)} a ${formatEURIT(scenarioADR)}, lo scenario economico migliora mantenendo l'occupazione al ${formatPctIT(occupancy)}.`;

        openingEN =
            `Increasing the nightly rate from ${formatEUREN(originalADR)} to ${formatEUREN(scenarioADR)} improves the economics of the scenario while keeping occupancy at ${formatPctEN(occupancy)}.`;

    }
    else if(worsensScenario){

        openingIT =
            `Riducendo il prezzo notte da ${formatEURIT(originalADR)} a ${formatEURIT(scenarioADR)}, lo scenario economico peggiora mantenendo l'occupazione al ${formatPctIT(occupancy)}.`;

        openingEN =
            `Reducing the nightly rate from ${formatEUREN(originalADR)} to ${formatEUREN(scenarioADR)} weakens the economics of the scenario while keeping occupancy at ${formatPctEN(occupancy)}.`;

    }
    else{

        openingIT =
            `Con un prezzo notte di ${formatEURIT(scenarioADR)}, cambia il profilo economico dell'investimento rispetto ai ${formatEURIT(originalADR)} della simulazione originale.`;

        openingEN =
            `At a nightly rate of ${formatEUREN(scenarioADR)}, the investment economics change compared with the original ${formatEUREN(originalADR)} assumption.`;

    }

    blocksIT.length = 0;
    blocksEN.length = 0;

    blocksIT.push(
`${scenarioVerdict === "BUY" ? "🟢" : scenarioVerdict === "NO_BUY" || scenarioVerdict === "AVOID" ? "🔴" : "🟡"} SCENARIO ADR: ${scenarioVerdict}

${openingIT}

Mantengo invariati prezzo dell'immobile, struttura finanziaria, occupazione e costi per isolare l'effetto del prezzo notte.

💶 ADR
• ${formatEURIT(originalADR)} → ${formatEURIT(scenarioADR)}

📈 Impatto economico
• ROI sul capitale: ${formatPctIT(originalROI)} → ${formatPctIT(scenarioROI)}
• ROI sull'immobile: ${formatPctIT(originalRealROI)} → ${formatPctIT(scenarioRealROI)}
• Cashflow annuo: ${formatEURIT(originalCashflow)} → ${formatEURIT(scenarioCashflow)}
• Rischio: ${Math.round(originalRisk)}/100 → ${Math.round(scenarioRisk)}/100
• Investment Score: ${Math.round(originalScore)}/100 → ${Math.round(scenarioScore)}/100

🎯 Decisione
• ${originalVerdict} → ${scenarioVerdict}

🧠 Valutazione AI

${improvesScenario
    ? `L'aumento dell'ADR di ${formatEURIT(Math.abs(adrDelta))} incrementa il ROI sull'equity di ${formatPctIT(Math.abs(roiDelta))}, il ROI sull'immobile di ${formatPctIT(Math.abs(realROIDelta))} e il cashflow annuo di ${formatEURIT(Math.abs(cashflowDelta))}.${scoreDelta === 0 ? ` L'Investment Score resta stabile a ${Math.round(scenarioScore)}/100.` : ` L'Investment Score ${scoreDelta > 0 ? "sale" : "scende"} di ${Math.abs(Math.round(scoreDelta))} punti.`}${riskDelta === 0 ? " Il profilo di rischio resta invariato." : ""}`
    : worsensScenario
        ? `La riduzione dell'ADR di ${formatEURIT(Math.abs(adrDelta))} riduce il ROI sull'equity di ${formatPctIT(Math.abs(roiDelta))} e il cashflow annuo di ${formatEURIT(Math.abs(cashflowDelta))}.`
        : `Il nuovo ADR modifica rendimento e cashflow dell'operazione mantenendo invariati gli altri parametri dello scenario.`}`
    );

    blocksEN.push(
`${scenarioVerdict === "BUY" ? "🟢" : scenarioVerdict === "NO_BUY" || scenarioVerdict === "AVOID" ? "🔴" : "🟡"} ADR SCENARIO: ${scenarioVerdict}

${openingEN}

I keep purchase price, financing structure, occupancy and costs unchanged to isolate the impact of the nightly rate.

💶 ADR
• ${formatEUREN(originalADR)} → ${formatEUREN(scenarioADR)}

📈 Economic impact
• Return on equity: ${formatPctEN(originalROI)} → ${formatPctEN(scenarioROI)}
• Property ROI: ${formatPctEN(originalRealROI)} → ${formatPctEN(scenarioRealROI)}
• Annual cashflow: ${formatEUREN(originalCashflow)} → ${formatEUREN(scenarioCashflow)}
• Risk: ${Math.round(originalRisk)}/100 → ${Math.round(scenarioRisk)}/100
• Investment Score: ${Math.round(originalScore)}/100 → ${Math.round(scenarioScore)}/100

🎯 Decision
• ${originalVerdict} → ${scenarioVerdict}

🧠 AI Assessment

${improvesScenario
    ? `The ${formatEUREN(Math.abs(adrDelta))} ADR increase raises return on equity by ${formatPctEN(Math.abs(roiDelta))}, property ROI by ${formatPctEN(Math.abs(realROIDelta))} and annual cashflow by ${formatEUREN(Math.abs(cashflowDelta))}.${scoreDelta === 0 ? ` The Investment Score remains stable at ${Math.round(scenarioScore)}/100.` : ` The Investment Score ${scoreDelta > 0 ? "increases" : "decreases"} by ${Math.abs(Math.round(scoreDelta))} points.`}${riskDelta === 0 ? " The risk profile remains unchanged." : ""}`
    : worsensScenario
        ? `The ${formatEUREN(Math.abs(adrDelta))} ADR reduction lowers return on equity by ${formatPctEN(Math.abs(roiDelta))} and annual cashflow by ${formatEUREN(Math.abs(cashflowDelta))}.`
        : `The new ADR changes the investment's returns and cashflow while keeping the other scenario assumptions unchanged.`}`
    );

}    

// ===============================================
// 🧠 BUILD FINAL RESPONSE
// ===============================================

textIT =
    blocksIT
        .filter(Boolean)
        .join("\n\n");

textEN =
    blocksEN
        .filter(Boolean)
        .join("\n\n");

return {

    type: "executive",

    confidence: 0.99,

    executiveNarrative,

    executiveContext,

    textIT,

    textEN,

    suggestionsIT: [],

    suggestionsEN: [],

    signals: [],

    metadata: {}

};

};

console.log(
    "🧠 EXECUTIVE RESPONSE BUILDER READY"
);
