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
