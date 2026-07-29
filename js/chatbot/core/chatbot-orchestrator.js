// ===============================================
// 🧠 RENDIMENTOBB – CHATBOT ORCHESTRATOR
// Silicon Valley AI Core System
// ===============================================

// ===============================================
// 🚀 MAIN AI PIPELINE
// ===============================================

window.rbProcessAIMessage =
async function(message){

  try{

    // =========================================
    // 🧹 NORMALIZE
    // =========================================

    const text =

      String(message || "")
        .trim();

    // =========================================
    // 🧠 ENTITY EXTRACTION
    // =========================================

    const entities =

      window.rbExtractEntities

      ? window.rbExtractEntities(text)

      : {};

// =========================================
// 🧠 MULTI INTENT DETECTION
// =========================================

const detectedIntent =

  window.rbDetectIntent

    ? window.rbDetectIntent(text)

    : {

        intent: "generic"

      };

console.log(
  "🧠 DETECTED INTENT",
  detectedIntent
);

 // =========================================
// 🧠 INTENT PRIORITY ENGINE
// =========================================

const intentPriority = {

    investment_strategy:96,

    investment_advisor:97,

    investment_executive:100,

    improvement_advisor:95,

    portfolio_growth:90,

    portfolio_analysis:85,

    comparison:84,

    report_interpretation:83,

    mortgage_analysis:82,

    roi_analysis:80,

    cashflow_analysis:79,

    risk_analysis:78,

    market_analysis:75,

    education:40,

    greeting:10,

    generic:0

};   

// =========================================
// 🧠 MULTI INTENT SYSTEM 2.0
// =========================================

const intents = [];

// =========================================
// 🎓 EDUCATION
// =========================================

if(
  detectedIntent.intent ===
  "education"
){

  intents.push(
    "education"
  );

}

// =========================================
// 📈 ROI
// =========================================

if(

  text.includes("roi") ||

  text.includes("rendimento")

){

  intents.push(
    "roi_analysis"
  );

}

// =========================================
// ⚠️ RISK
// =========================================

if(

  text.includes("rischio") ||

  text.includes("risk")

){

  intents.push(
    "risk_analysis"
  );

}

// =========================================
// 💸 CASHFLOW
// =========================================

if(

  (
    text.includes("cashflow") ||

    text.includes("profitto")
  )

  &&

  detectedIntent.intent !==
  "portfolio_growth"

){

  intents.push(
    "cashflow_analysis"
  );

}

// =========================================
// 🏨 PMS
// =========================================

if(

  [

    "pms_overview",
    "pms_analysis",
    "pms_bookings",
    "pms_arrivals",
    "pms_checkins",
    "pms_checkouts",
    "pms_revenue",
    "pms_occupancy",
    "pms_adr",
    "pms_guests"

  ].includes(
    detectedIntent.intent
  )

){

  intents.push(
    detectedIntent.intent
  );

}

// =========================================
// 🏆 PORTFOLIO / HISTORY
// =========================================

if(

  [
    "best_simulation",
    "best_city",
    "portfolio_analysis",
    "property_performance",
    "comparison"
  ].includes(
    detectedIntent.intent
  )

){

  intents.push(
    detectedIntent.intent
  );

}    

// =========================================
// 🏦 MORTGAGE
// =========================================

if(

  text.includes("mutuo") ||

  text.includes("mortgage")

){

  intents.push(
    "mortgage_analysis"
  );

}

// 🌍 MARKET

if(

  (
    text.includes("mercato") ||
    text.includes("market")
  )

  &&

  ![
    "best_simulation",
    "best_city",
    "portfolio_analysis",
    "property_performance",
    "comparison"
  ].includes(
    detectedIntent.intent
  )

){

  intents.push(
    "market_analysis"
  );

}

// =========================================
// 🧠 EXECUTIVE
// =========================================

if(

  detectedIntent.intent === "investment_executive"

){

  intents.push(
    "investment_executive"
  );

}

// =========================================
// 💼 INVESTMENT ADVISOR
// =========================================

if(

  detectedIntent.intent === "investment_advisor"

){

  intents.push(
    "investment_advisor"
  );

}

// =========================================
// 🧠 INVESTMENT STRATEGY
// =========================================

if(

  detectedIntent.intent === "investment_strategy"

){

  intents.push(
    "investment_strategy"
  );

}

// =========================================
// 📈 IMPROVEMENT ADVISOR
// =========================================

if(

  detectedIntent.intent ===
  "improvement_advisor"

){

  intents.push(
    "improvement_advisor"
  );

}    

// =========================================
// 🔥 REMOVE DUPLICATES
// =========================================

const uniqueIntents = [

  ...new Set(intents)

];

uniqueIntents.sort(

    (a,b)=>

        (intentPriority[b] || 0)

        -

        (intentPriority[a] || 0)

);    

// =========================================
// 🔥 EXECUTIVE OVERRIDE
// =========================================

if(

  uniqueIntents.includes(
    "investment_executive"
  )

){

  uniqueIntents.length = 0;

  uniqueIntents.push(
    "investment_executive"
  );

}    

if(

  uniqueIntents.includes(
    "improvement_advisor"
  )

){

  uniqueIntents.length = 0;

  uniqueIntents.push(
    "improvement_advisor"
  );

}    

// =========================================
// 🏢 PORTFOLIO OVERRIDE
// =========================================

if(

  uniqueIntents.includes(
    "portfolio_growth"
  )

){

  uniqueIntents.length = 0;

  uniqueIntents.push(
    "portfolio_growth"
  );

}    

// =========================================
// 🧠 FALLBACK
// =========================================

if(!uniqueIntents.length){

  uniqueIntents.push(

    detectedIntent.intent ||

    "generic"

  );

}

    const intent = {

  ...detectedIntent,

  intents:
    uniqueIntents

};

    console.log(
  "🔥 FINAL INTENTS:",
  uniqueIntents
);
    // =========================================
    // 🧠 MEMORY
    // =========================================

    const memory =

  window.rbGetConversationContext

  ? window.rbGetConversationContext()

  : {};

// =========================================
// 🧠 INVESTOR PROFILE
// =========================================

const investorProfile =

  window.rbUpdateInvestorProfile

  ? window.rbUpdateInvestorProfile({

      entities,

      analysisData:
        window.lastAnalysisData || {},

      memory:
        memory || {}

    })

  : {};

// =========================================
// 📊 ANALYSIS DATA
// =========================================

const rememberedAnalysis = {

  realROI:
    window.rbChatMemory?.lastROI,

  roi:
    window.rbChatMemory?.lastROI,

  risk:
    window.rbChatMemory?.lastRisk,

  occupancy:
    window.rbChatMemory?.lastOccupancy,

  net:
    window.rbChatMemory?.lastCashflow,

  annualProfit:
    window.rbChatMemory?.lastCashflow,

  cashflow:
    window.rbChatMemory?.lastCashflow,

  gross:
    window.rbChatMemory?.lastRevenue,

  propertyPrice:
    window.rbChatMemory?.lastPropertyPrice,

  equity:
    window.rbChatMemory?.lastEquity,

  loanAmount:
    window.rbChatMemory?.lastLoanAmount,

  mortgage:
    window.rbChatMemory?.lastLoanAmount,

  mortgagePercent:
    window.rbChatMemory?.lastMortgagePercent,

  city:
    window.rbChatMemory?.lastCity

};

const analysisData = {

  ...rememberedAnalysis,
  ...(window.lastAnalysisData || {}),

  // =====================================
  // 📊 ROI DETERMINISTICO
  // =====================================

  // Usa il ROI reale dell’investimento.
  // visualROI rimane disponibile separatamente.
roi:

  window.lastAnalysisData?.visualROI ??

  window.lastAnalysisData?.roi ??

  window.lastAnalysisData?.safeROI ??

  rememberedAnalysis.roi ??

  window.lastAnalysisData?.realROI ??

  rememberedAnalysis.realROI ??

  (
    Number(
      document.getElementById("roi-value")
        ?.textContent
        ?.replace("%", "")
        ?.trim()
    ) || 0
  ),

  // =====================================
  // ⚠️ RISK & OCCUPANCY
  // =====================================

  risk:

    Number(
      document.getElementById("risk-score")
        ?.textContent
        ?.replace("/100", "")
        ?.trim()
    ) ||

    window.lastAnalysisData?.risk ||

    rememberedAnalysis.risk ||

    0,

  occupancy:

    Number(
      document.getElementById("occupancy-rate")
        ?.textContent
        ?.replace("%", "")
        ?.trim()
    ) ||

    window.lastAnalysisData?.occupancy ||

    rememberedAnalysis.occupancy ||

    0,

  // =====================================
  // 💰 NORMALIZED PROFIT DATA
  // =====================================

  net:

    window.lastAnalysisData?.net ??

    window.lastAnalysisData?.profit ??

    window.lastAnalysisData?.netAfterMortgage ??

    rememberedAnalysis.net ??

    0,

  annualProfit:

    window.lastAnalysisData?.annualProfit ??

    window.lastAnalysisData?.profit ??

    window.lastAnalysisData?.netAfterMortgage ??

    rememberedAnalysis.annualProfit ??

    0,

  cashflow:

    window.lastAnalysisData?.cashflow ??

    window.lastAnalysisData?.net ??

    window.lastAnalysisData?.profit ??

    window.lastAnalysisData?.netAfterMortgage ??

    window.lastAnalysisData?.annualProfit ??

    rememberedAnalysis.cashflow ??

    0,

  gross:

    window.lastAnalysisData?.gross ??

    window.lastAnalysisData?.revenueAnnual ??

    rememberedAnalysis.gross ??

    0,

    // =====================================
  // 🧮 ROI ENGINE INPUTS
  // Same inputs used by the canonical simulator
  // =====================================

  priceNight:

    Number(
      window.lastAnalysisData?.priceNight ??
      window.rbChatbotData?.priceNight ??
      document.getElementById("priceNight")?.value ??
      100
    ),

  expenses:

    Number(
      window.lastAnalysisData?.expenses ??
      window.rbChatbotData?.expenses ??
      document.getElementById("expenses")?.value ??
      30
    ),

  commission:

    Number(
      window.lastAnalysisData?.commission ??
      document.getElementById("commission")?.value ??
      15
    ),

  tax:

    Number(
      window.lastAnalysisData?.tax ??
      document.getElementById("tax")?.value ??
      21
    ),

  interestRate:

    Number(
      window.lastAnalysisData?.interestRate ??
      document.getElementById("interestRate")?.value ??
      3.5
    ),

  loanYears:

    Number(
      window.lastAnalysisData?.loanYears ??
      document.getElementById("loanYears")?.value ??
      20
    ),

  // =====================================
  // 🏦 MORTGAGE DATA
  // =====================================

  propertyPrice:

    window.lastAnalysisData?.propertyPrice ??

    window.lastAnalysisData?.price ??

    rememberedAnalysis.propertyPrice ??

    0,

  equity:

    window.lastAnalysisData?.equity ??

    window.lastAnalysisData?.initialCapital ??

    rememberedAnalysis.equity ??

    0,

  loanAmount:

    window.lastAnalysisData?.loanAmount ??

    window.lastAnalysisData?.mortgage ??

    rememberedAnalysis.loanAmount ??

    rememberedAnalysis.mortgage ??

    0,

  mortgage:

    window.lastAnalysisData?.mortgage ??

    window.lastAnalysisData?.loanAmount ??

    rememberedAnalysis.mortgage ??

    rememberedAnalysis.loanAmount ??

    0,

  mortgagePercent:

    window.lastAnalysisData?.mortgagePercent ??

    rememberedAnalysis.mortgagePercent ??

    (
      (
        window.lastAnalysisData?.loanAmount ??

        window.lastAnalysisData?.mortgage ??

        rememberedAnalysis.loanAmount ??

        rememberedAnalysis.mortgage ??

        0
      )

      &&

      (
        window.lastAnalysisData?.propertyPrice ??

        window.lastAnalysisData?.price ??

        rememberedAnalysis.propertyPrice ??

        0
      )
    )

      ? Math.round(

          (
            (
              window.lastAnalysisData?.loanAmount ??

              window.lastAnalysisData?.mortgage ??

              rememberedAnalysis.loanAmount ??

              rememberedAnalysis.mortgage ??

              0
            )

            /

            (
              window.lastAnalysisData?.propertyPrice ??

              window.lastAnalysisData?.price ??

              rememberedAnalysis.propertyPrice ??

              1
            )

          ) * 100

        )

      : 0,

  // =====================================
  // 📍 MARKET DATA
  // =====================================

  city:

    window.currentCity ||

    window.lastAnalysisData?.city ||

    window.lastAnalysisData?.marketCity ||

    window.lastAnalysisData?.realCity ||

    rememberedAnalysis.city ||

    "roma"

};

// =====================================
// 🏦 MORTGAGE WHAT-IF SCENARIO
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const requestedMortgagePercent =
  Number(
    entities?.mortgagePercent
  );

const isMortgageWhatIf =
  intent?.intents?.includes("mortgage_analysis") &&
  Number.isFinite(requestedMortgagePercent) &&
  requestedMortgagePercent > 0 &&
  requestedMortgagePercent <= 100;

if(isMortgageWhatIf){

  const scenarioPropertyPrice =
    Number(
      analysisData.propertyPrice ??
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      0
    );

  if(scenarioPropertyPrice > 0){

    const scenarioLoanAmount =
      scenarioPropertyPrice *
      (requestedMortgagePercent / 100);

    const scenarioEquity =
      scenarioPropertyPrice -
      scenarioLoanAmount;

    analysisData.mortgagePercent =
      requestedMortgagePercent;

    analysisData.loanAmount =
      scenarioLoanAmount;

    analysisData.mortgage =
      scenarioLoanAmount;

    analysisData.equity =
      scenarioEquity;

    // =====================================
    // 🧮 RECALCULATE WHAT-IF WITH ROI ENGINE
    // Temporary only — lastAnalysisData stays untouched
    // =====================================

    if(typeof window.calculateROI === "function"){

      const scenarioResult =
        window.calculateROI({

          price:
            scenarioPropertyPrice,

          equity:
            scenarioEquity,

          loanAmount:
            scenarioLoanAmount,

          priceNight:
            Number(
              analysisData.priceNight ??
              window.lastAnalysisData?.priceNight ??
              100
            ),

          occupancy:
            Number(
              analysisData.occupancy ??
              window.lastAnalysisData?.occupancy ??
              65
            ),

          expenses:
            Number(
              analysisData.expenses ??
              window.lastAnalysisData?.expenses ??
              30
            ),

          commission:
            Number(
              analysisData.commission ??
              window.lastAnalysisData?.commission ??
              15
            ),

          tax:
            Number(
              analysisData.tax ??
              window.lastAnalysisData?.tax ??
              21
            ),

          interestRate:
            Number(
              analysisData.interestRate ??
              window.lastAnalysisData?.interestRate ??
              3.5
            ),

          loanYears:
            Number(
              analysisData.loanYears ??
              window.lastAnalysisData?.loanYears ??
              20
            )

        });

      if(
        scenarioResult &&
        typeof scenarioResult === "object"
      ){

        analysisData.roi =
          scenarioResult.roi;

        analysisData.realROI =
          scenarioResult.realROI;

        analysisData.net =
          scenarioResult.netAfterMortgage;

        analysisData.cashflow =
          scenarioResult.netAfterMortgage;

        analysisData.annualProfit =
          scenarioResult.netAfterMortgage;

        analysisData.profit =
          scenarioResult.netAfterMortgage;

        analysisData.netAfterMortgage =
          scenarioResult.netAfterMortgage;

        analysisData.risk =
          scenarioResult.risk;

        console.log(
  "🧮 WHAT-IF ROI RECALCULATED",
  scenarioResult
);

// =====================================
// 🧠 RECALCULATE WHAT-IF INVESTMENT SCORE
// Temporary only — does not mutate base simulation
// =====================================

if(typeof window.rbGenerateInvestmentScore === "function"){

  const scenarioScore =
    window.rbGenerateInvestmentScore({

      roi:
        Number(analysisData.roi || 0),

      risk:
        Number(analysisData.risk || 0),

      occupancy:
        Number(analysisData.occupancy || 0),

      mortgagePercent:
        requestedMortgagePercent,

      cashflow:
        Number(analysisData.cashflow || 0),

      city:
        analysisData.city || "roma"

    });

  if(
    scenarioScore &&
    Number.isFinite(
      Number(scenarioScore.score)
    )
  ){

    analysisData.investmentScore =
      Number(scenarioScore.score);

    console.log(
      "🧠 WHAT-IF SCORE RECALCULATED",
      scenarioScore
    );

  }

}

}

}

    // Scenario metadata.
    // Manteniamo separati i valori originali per il confronto successivo.
    analysisData.whatIfScenario = {

      type:
        "mortgage",

      requestedMortgagePercent,

      originalMortgagePercent:
        Number(
          window.lastAnalysisData?.mortgagePercent ??
          rememberedAnalysis.mortgagePercent ??
          0
        ),

      originalLoanAmount:
        Number(
          window.lastAnalysisData?.loanAmount ??
          window.lastAnalysisData?.mortgage ??
          rememberedAnalysis.loanAmount ??
          0
        ),

      originalEquity:
        Number(
          window.lastAnalysisData?.equity ??
          window.lastAnalysisData?.initialCapital ??
          rememberedAnalysis.equity ??
          0
        ),

      originalROI:
  Number(
    window.lastAnalysisData?.visualROI ??
    window.lastAnalysisData?.roi ??
    0
  ),

originalRealROI:
  Number(
    window.lastAnalysisData?.realROI ??
    window.lastAnalysisData?.safeROI ??
    0
  ),

originalCashflow:
  Number(
    window.lastAnalysisData?.net ??
    window.lastAnalysisData?.cashflow ??
    window.lastAnalysisData?.annualProfit ??
    0
  ),

originalInvestmentScore:
  Number(
    window.lastAnalysisData?.investmentScore ??
    window.lastInvestmentScore?.score ??
    0
  ),

scenarioROI:
  Number(
    analysisData.roi ?? 0
  ),

scenarioRealROI:
  Number(
    analysisData.realROI ?? 0
  ),

scenarioCashflow:
  Number(
    analysisData.cashflow ??
    analysisData.net ??
    0
  ),

scenarioInvestmentScore:
  Number(
    analysisData.investmentScore ?? 0
  ),

propertyPrice:
  scenarioPropertyPrice,

      loanAmount:
        scenarioLoanAmount,

      equity:
        scenarioEquity

    };

    console.log(
      "🏦 MORTGAGE WHAT-IF SCENARIO",
      analysisData.whatIfScenario
    );

  }

}    

// =====================================
// 🏠 PROPERTY PRICE WHAT-IF SCENARIO
// Keeps baseline LTV unchanged
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const requestedPropertyPrice =
  Number(
    entities?.price
  );

const baselinePropertyPrice =
  Number(
    window.lastAnalysisData?.propertyPrice ??
    window.lastAnalysisData?.price ??
    rememberedAnalysis.propertyPrice ??
    0
  );

const baselineMortgagePercent =
  Number(
    window.lastAnalysisData?.mortgagePercent ??
    rememberedAnalysis.mortgagePercent ??
    (
      baselinePropertyPrice > 0
        ? (
            Number(
              window.lastAnalysisData?.loanAmount ??
              window.lastAnalysisData?.mortgage ??
              rememberedAnalysis.loanAmount ??
              0
            )
            /
            baselinePropertyPrice
          ) * 100
        : 0
    )
  );

const isPropertyPriceWhatIf =
  !isMortgageWhatIf &&
  Number.isFinite(requestedPropertyPrice) &&
  requestedPropertyPrice > 0 &&
  baselinePropertyPrice > 0 &&
  requestedPropertyPrice !== baselinePropertyPrice;

if(isPropertyPriceWhatIf){

  const scenarioPropertyPrice =
    requestedPropertyPrice;

  const scenarioMortgagePercent =
    baselineMortgagePercent;

  const scenarioLoanAmount =
    scenarioPropertyPrice *
    (scenarioMortgagePercent / 100);

  const scenarioEquity =
    scenarioPropertyPrice -
    scenarioLoanAmount;

  analysisData.propertyPrice =
    scenarioPropertyPrice;

  analysisData.price =
    scenarioPropertyPrice;

  analysisData.mortgagePercent =
    scenarioMortgagePercent;

  analysisData.loanAmount =
    scenarioLoanAmount;

  analysisData.mortgage =
    scenarioLoanAmount;

  analysisData.equity =
    scenarioEquity;

  if(typeof window.calculateROI === "function"){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          Number(
            analysisData.priceNight ??
            window.lastAnalysisData?.priceNight ??
            100
          ),

        occupancy:
          Number(
            analysisData.occupancy ??
            window.lastAnalysisData?.occupancy ??
            65
          ),

        expenses:
          Number(
            analysisData.expenses ??
            window.lastAnalysisData?.expenses ??
            30
          ),

        commission:
          Number(
            analysisData.commission ??
            window.lastAnalysisData?.commission ??
            15
          ),

        tax:
          Number(
            analysisData.tax ??
            window.lastAnalysisData?.tax ??
            21
          ),

        interestRate:
          Number(
            analysisData.interestRate ??
            window.lastAnalysisData?.interestRate ??
            3.5
          ),

        loanYears:
          Number(
            analysisData.loanYears ??
            window.lastAnalysisData?.loanYears ??
            20
          )

      });

    if(
      scenarioResult &&
      typeof scenarioResult === "object"
    ){

      analysisData.roi =
        scenarioResult.roi;

      analysisData.visualROI =
        scenarioResult.roi;

      analysisData.realROI =
        scenarioResult.realROI;

      analysisData.net =
        scenarioResult.netAfterMortgage;

      analysisData.cashflow =
        scenarioResult.netAfterMortgage;

      analysisData.annualProfit =
        scenarioResult.netAfterMortgage;

      analysisData.profit =
        scenarioResult.netAfterMortgage;

      analysisData.netAfterMortgage =
        scenarioResult.netAfterMortgage;

      analysisData.risk =
        scenarioResult.risk;

      console.log(
        "🧮 PRICE WHAT-IF ROI RECALCULATED",
        scenarioResult
      );

      if(
        typeof window.rbGenerateInvestmentScore ===
        "function"
      ){

        const scenarioScore =
          window.rbGenerateInvestmentScore({

            roi:
              Number(
                analysisData.roi || 0
              ),

            risk:
              Number(
                analysisData.risk || 0
              ),

            occupancy:
              Number(
                analysisData.occupancy || 0
              ),

            mortgagePercent:
              scenarioMortgagePercent,

            cashflow:
              Number(
                analysisData.cashflow || 0
              ),

            city:
              analysisData.city || "roma"

          });

        if(
          scenarioScore &&
          Number.isFinite(
            Number(scenarioScore.score)
          )
        ){

          analysisData.investmentScore =
            Number(
              scenarioScore.score
            );

          console.log(
            "🧠 PRICE WHAT-IF SCORE RECALCULATED",
            scenarioScore
          );

        }

      }

    }

  }

  analysisData.whatIfScenario = {

    type:
      "property_price",

    requestedPropertyPrice,

    originalPropertyPrice:
      baselinePropertyPrice,

    originalMortgagePercent:
      baselineMortgagePercent,

    originalLoanAmount:
      Number(
        window.lastAnalysisData?.loanAmount ??
        window.lastAnalysisData?.mortgage ??
        rememberedAnalysis.loanAmount ??
        0
      ),

    originalEquity:
      Number(
        window.lastAnalysisData?.equity ??
        window.lastAnalysisData?.initialCapital ??
        rememberedAnalysis.equity ??
        0
      ),

    originalROI:
      Number(
        window.lastAnalysisData?.visualROI ??
        window.lastAnalysisData?.roi ??
        0
      ),

    originalRealROI:
      Number(
        window.lastAnalysisData?.realROI ??
        window.lastAnalysisData?.safeROI ??
        0
      ),

    originalCashflow:
      Number(
        window.lastAnalysisData?.net ??
        window.lastAnalysisData?.cashflow ??
        window.lastAnalysisData?.annualProfit ??
        0
      ),

    originalInvestmentScore:
      Number(
        window.lastAnalysisData?.investmentScore ??
        window.lastInvestmentScore?.score ??
        0
      ),

    scenarioPropertyPrice,

    scenarioMortgagePercent,

    scenarioLoanAmount,

    scenarioEquity,

    scenarioROI:
      Number(
        analysisData.roi ?? 0
      ),

    scenarioRealROI:
      Number(
        analysisData.realROI ?? 0
      ),

    scenarioCashflow:
      Number(
        analysisData.cashflow ??
        analysisData.net ??
        0
      ),

    scenarioInvestmentScore:
      Number(
        analysisData.investmentScore ?? 0
      )

  };

  console.log(
    "🏠 PROPERTY PRICE WHAT-IF SCENARIO",
    analysisData.whatIfScenario
  );

}    

console.log(
  "🔥 ANALYSIS DATA FINAL JSON",
  JSON.stringify(
    analysisData,
    null,
    2
  )
);

// =====================================
// 🧠 CANONICAL AI CONTEXT
// Single Source of Truth
// =====================================

const canonicalAnalysis = {

    ...analysisData,

    roi: Number(
    analysisData.roi ??
    analysisData.visualROI ??
    analysisData.realROI ??
    0
),

    realROI: Number(
        analysisData.realROI ??
        analysisData.roi ??
        0
    ),

    visualROI: Number(
        analysisData.visualROI ??
        analysisData.roi ??
        0
    ),

    cashflow: Number(
        analysisData.net ??
        analysisData.cashflow ??
        analysisData.profit ??
        0
    ),

    net: Number(
        analysisData.net ??
        analysisData.cashflow ??
        0
    )

};

window.rbCanonicalAnalysis = canonicalAnalysis;

console.log(
    "🧠 CANONICAL AI CONTEXT",
    canonicalAnalysis
);
    
// =========================================
// 🧠 AI SIGNALS
// =========================================

const aiSignals =

  window.generateAISignals

  ? window.generateAISignals(
      analysisData
    )

  : [];

// =========================================
// 🧠 ADVISOR ELIGIBILITY
// =========================================

const shouldRunAdvisor =

  [
    "investment_executive",
    "investment_advisor",
    "investment_strategy",

    "improvement_advisor",

    "comparison",
    "roi_analysis",
    "risk_analysis",
    "cashflow_analysis",
    "mortgage_analysis",
    "report_interpretation"
  ].includes(
    intent.intent
  )

  &&

  (
    Number(
      analysisData.roi
    ) > 0 ||

    Number(
      analysisData.occupancy
    ) > 0 ||

    Number(
      analysisData.risk
    ) > 0
  );

// =========================================
// 🧠 ADVISOR ENGINE
// =========================================

const advisor =

  shouldRunAdvisor &&

  window.rbGenerateAdvisorVerdict

  ? window.rbGenerateAdvisorVerdict({

      roi:

        analysisData.realROI ??

        window.lastAnalysisData?.realROI ??

        analysisData.roi ??

        window.lastAnalysisData?.safeROI ??

        window.lastAnalysisData?.roi ??

        0,

      risk:

        analysisData.risk ||

        window.lastAnalysisData?.risk ||

        0,

      occupancy:

        analysisData.occupancy ||

        window.lastAnalysisData?.occupancy ||

        0,

      mortgagePercent:

        analysisData.mortgagePercent ??

        entities.mortgagePercent ??

        window.lastAnalysisData?.mortgagePercent ??

      0,

      cashflow:

        Number(

          analysisData.net ??

          analysisData.profit ??

          analysisData.netAfterMortgage ??

          analysisData.cashflow ??

          analysisData.annualProfit ??

          window.lastAnalysisData?.net ??

          window.lastAnalysisData?.profit ??

          window.lastAnalysisData?.netAfterMortgage ??

          window.lastAnalysisData?.annualProfit ??

          window.lastAnalysisData?.cashflow ??

          0

        ),

      city:

        analysisData.city ||

        entities.city ||

        "roma",

    canonicalScore:
  Number.isFinite(Number(canonicalAnalysis?.investmentScore))
    ? Number(canonicalAnalysis.investmentScore)
    : null,

      investorProfile

    })

  : null;

console.log(
  "🧠 ADVISOR:",
  advisor
);

// =========================================
// 📄 DOCUMENT KNOWLEDGE
// =========================================

const documentKnowledge = {

    activeDocument:

        window.rbDocumentManager?.getLast?.() ||

        window.rbActiveDocument ||

        null,

    activeReport:

        window.lastExecutiveReport ||

        window.rbActiveDocument ||

        null,

    uploadedReports:

        window.rbDocumentLibrary ||

        []

};

console.log(
    "📄 FIRST UPLOADED",
    JSON.stringify(
        documentKnowledge?.uploadedReports?.[0],
        null,
        2
    )
);

// =========================================
// 🧠 AI BRAIN
// =========================================

const brain =

    window.rbProcessBrain

    ? window.rbProcessBrain({

        intent,

        entities,

        memory,

        investorProfile,

        score:
            window.lastInvestmentScore || {},

        advisor,

        reasoning:
            {},

        documentKnowledge,

        executiveContext:
            window.executiveContext || {}

    })

    : null;

console.log(
    "🧠 AI BRAIN",
    brain
);   

// =========================================
// 🧠 CANONICAL ADVISOR RESULT
// Shared with Executive PDF
// =========================================

if(advisor){

  const canonicalScore =
    Number(
      canonicalAnalysis.investmentScore ??
      window.lastAnalysisData?.investmentScore ??
      window.lastInvestmentScore?.score ??
      advisor.score ??
      0
    );

  const canonicalVerdict =
    canonicalAnalysis.verdict ??
    window.lastAnalysisData?.verdict ??
    window.lastInvestmentScore?.verdict ??
    advisor.verdict ??
    "WAIT";

  window.lastInvestmentScore = {

    score:
      canonicalScore,

    verdict:
      canonicalVerdict,

    label:
      canonicalVerdict,

    confidence:
      Number(
        window.lastInvestmentScore?.confidence ??
        advisor.confidence ??
        0
      )

  };

  // =========================================
  // 🧠 SYNC ADVISOR WITH CANONICAL DECISION
  // Preserve advisorScore, confidence, insights, etc.
  // =========================================

  advisor.score =
    canonicalScore;

  advisor.verdict =
    canonicalVerdict;

  console.log(
    "🧠 CANONICAL INVESTMENT DECISION",
    window.lastInvestmentScore
  );

}

if(advisor){

  console.log(
    "🧪 ADVISOR INPUTS",
    {
      roi:
        analysisData.roi,

      risk:
        analysisData.risk,

      occupancy:
        analysisData.occupancy,

      net:
        analysisData.net,

      annualProfit:
        analysisData.annualProfit,

      cashflow:
        analysisData.cashflow,

      lastAnalysis:
        window.lastAnalysisData
    }
  );

}

    // =========================================
    // 🧠 KNOWLEDGE MATCHING
    // =========================================

    let matchedKnowledge = [];

    for(
      const key in
      (window.rbKnowledgeBase || {})
    ){

      const item =

        window.rbKnowledgeBase[key];

      if(
        !item?.keywords
      ){

        continue;

      }

      const matched =

        item.keywords.some(keyword =>

          text
            .toLowerCase()
            .includes(
              keyword.toLowerCase()
            )

        );

      if(matched){

        matchedKnowledge.push({

          key,

          item,

          priority:
            item.priority || 1

        });

      }

    }

    // =========================================
    // 🧠 SORT KNOWLEDGE
    // =========================================

    matchedKnowledge.sort(
      (a,b)=>

        b.priority -
        a.priority
    );

// =========================================
// 🧠 MAIN KNOWLEDGE ENTITY
// =========================================

const bestKnowledge =

  matchedKnowledge.length

  ? matchedKnowledge[0]

  : null;

if(bestKnowledge){

  entities.knowledge =

    bestKnowledge.key;

  entities.knowledgeData =

    bestKnowledge.item;

}

// =========================================
// 🧠 MULTI RESPONSE ENGINE
// =========================================

let finalTextIT = "";
let finalTextEN = "";

const finalSuggestionsIT = [];
const finalSuggestionsEN = [];
const finalSignals = [];
const partialMetadata = [];

let primaryResponseType = null;

for(const currentIntent of intent.intents){

  // =========================================
// 🧠 CURRENT INTENT DATA
// =========================================

const currentIntentData = {

  ...intent,

  intent: currentIntent,

  priority:

intentPriority[currentIntent] || 0,

  requiresMarketData:

  [
    "market_analysis",
    "investment_advisor",
    "investment_executive",
    "roi_analysis",
    "risk_analysis",
    "cashflow_analysis",
    "comparison",

    "best_city",
    "best_simulation",
    "portfolio_analysis",
    "property_performance"

  ].includes(currentIntent),

  requiresMortgageAnalysis:

    currentIntent ===
    "mortgage_analysis",

  requiresPortfolioData:

  [
    "best_city",
    "best_simulation",
    "portfolio_analysis",
    "property_performance"
  ].includes(currentIntent),

  requiresPdfData:

    currentIntent ===
    "pdf_analysis"

};
  
// =========================================
// 🌍 FILTER MEMORY
// =========================================

const filteredMemory = {

  ...memory

};

// 🔥 NO MARKET MEMORY
if(

  !currentIntentData
    .requiresMarketData

){

  delete filteredMemory.city;

  delete filteredMemory.lastCity;

}

// ===============================================
// 🧠 CONVERSATION CONTEXT
// ===============================================

const conversationContext =

    window.rbBuildConversationContext({

        message: text,

        intent: currentIntentData,

        entities,

        memory: filteredMemory,

        executiveContext:
            window.executiveContext || {},

        investorProfile,

        aiBrain: brain,

        advisor

    });

console.log(
    "🧠 CONVERSATION CONTEXT",
    conversationContext
);

// ===============================================
// 🧠 EXECUTIVE BRAIN V2
// ===============================================

const executiveBrain =

    window.rbExecutiveBrain

    ? window.rbExecutiveBrain({

        intent: currentIntentData,

        advisor,

        executiveContext:
            window.executiveContext || {},

        conversationContext,

        reasoning: {},

        narrative: {},

        documentKnowledge,

        financials: analysisData

    })

    : null;

console.log(
    "🧠 EXECUTIVE BRAIN",
    executiveBrain
);
  
// =========================================
// 🧠 RESPONSE
// =========================================

const partialResponse =

window.rbGenerateResponse({

    message: text,

    entities,

    intent: currentIntentData,

    memory: filteredMemory,

    investorProfile,

    advisor,

    analysisData,

    aiSignals,

    brain,

    conversationContext,

    executiveBrain,

    documentKnowledge

});

  console.log(
  "🏨 PMS RESPONSE DEBUG",
  currentIntent,
  partialResponse
);

  // 🔥 IGNORA RISPOSTE VUOTE/FALLBACK
  const isFallback =

  partialResponse?.textIT?.includes(
    "Posso aiutarti ad analizzare"
  );

if(

  !partialResponse ||

  (
    isFallback &&
    currentIntent !== "greeting"
  )

){

  continue;

}

  if(partialResponse?.textIT){

    finalTextIT +=
      partialResponse.textIT + "\n\n";

  }

  if(partialResponse?.textEN){

    finalTextEN +=
      partialResponse.textEN + "\n\n";

  }

  if(
  !primaryResponseType &&
  partialResponse?.type &&
  partialResponse.type !== "generic"
){

  primaryResponseType =
    partialResponse.type;

}

if(
  Array.isArray(
    partialResponse?.suggestionsIT
  )
){

  finalSuggestionsIT.push(
    ...partialResponse.suggestionsIT
  );

}

if(
  Array.isArray(
    partialResponse?.suggestionsEN
  )
){

  finalSuggestionsEN.push(
    ...partialResponse.suggestionsEN
  );

}

if(
  Array.isArray(
    partialResponse?.signals
  )
){

  finalSignals.push(
    ...partialResponse.signals
  );

}

if(
  partialResponse?.metadata &&
  Object.keys(
    partialResponse.metadata
  ).length
){

  partialMetadata.push(
    partialResponse.metadata
  );

}

}

// =========================================
// 📈 ROI FOLLOW-UP SAFETY
// Preserve follow-ups after early returns
// =========================================

if(
  primaryResponseType === "roi" &&
  !finalSuggestionsIT.length &&
  !finalSuggestionsEN.length
){

  const currentROI = Number(

    window.lastAnalysisData?.realROI ??

    analysisData?.realROI ??

    analysisData?.roi ??

    0

  );

    const currentCity =

    analysisData?.city ||

    entities?.city ||

    "roma";

  const currentCityLabel =

    window.rbCapitalize?.(
      currentCity
    ) ||

    (
      currentCity
        .charAt(0)
        .toUpperCase() +
      currentCity.slice(1)
    );

  if(currentROI >= 20){

        finalSuggestionsIT.push(
      `Analizzare mercato ${currentCityLabel}`,
      "Analizzare sostenibilità",
      "Simulare scenario prudente"
    );

    finalSuggestionsEN.push(
      `Analyze ${currentCityLabel} market`,
      "Analyze sustainability",
      "Simulate conservative scenario"
    );

  }

  else if(currentROI >= 10){

    finalSuggestionsIT.push(
      "Analizzare il cashflow",
      "Valutare il rischio",
      "Confrontare il mercato"
    );

    finalSuggestionsEN.push(
      "Analyze cashflow",
      "Evaluate risk",
      "Compare the market"
    );

  }

  else{

    finalSuggestionsIT.push(
      "Ottimizzare il rendimento",
      "Ridurre i costi",
      "Valutare un'altra città"
    );

    finalSuggestionsEN.push(
      "Optimize returns",
      "Reduce costs",
      "Evaluate another city"
    );

  }

}

// =========================================
// 🌍 MARKET FOLLOW-UP SAFETY
// Contextual follow-ups based on real data
// =========================================

if(
  primaryResponseType === "market" &&
  !finalSuggestionsIT.length &&
  !finalSuggestionsEN.length
){

  const marketCityRaw = String(

    analysisData?.city ??

    entities?.city ??

    window.lastAnalysisData?.city ??

    ""

  )
  .trim()
  .toLowerCase();

  const marketCityIT = {

    roma: "Roma",
    milano: "Milano",
    napoli: "Napoli",
    firenze: "Firenze",
    venezia: "Venezia"

  }[marketCityRaw] || "";

  const marketCityEN = {

    roma: "Rome",
    milano: "Milan",
    napoli: "Naples",
    firenze: "Florence",
    venezia: "Venice"

  }[marketCityRaw] || "";

  const marketRealROIRaw =

    window.lastAnalysisData?.realROI ??

    analysisData?.realROI;

  const marketPropertyPrice = Number(

    window.lastAnalysisData?.propertyPrice ??

    analysisData?.propertyPrice ??

    0

  );

  const hasCompleteMarketAnalysis =

    marketPropertyPrice > 0 &&

    marketRealROIRaw !== null &&

    marketRealROIRaw !== undefined &&

    marketRealROIRaw !== "" &&

    Number.isFinite(
      Number(marketRealROIRaw)
    );

  if(hasCompleteMarketAnalysis){

    const riskSuggestionIT = marketCityIT
      ? `Valutare il rischio a ${marketCityIT}`
      : "Valutare il rischio dell'investimento";

    const riskSuggestionEN = marketCityEN
      ? `Evaluate risk in ${marketCityEN}`
      : "Evaluate investment risk";

    finalSuggestionsIT.push(
      riskSuggestionIT,
      "Analizzare il cashflow",
      "Verificare la sostenibilità"
    );

    finalSuggestionsEN.push(
      riskSuggestionEN,
      "Analyze cashflow",
      "Check sustainability"
    );

  }

  else{

    finalSuggestionsIT.push(
      "Completa la simulazione"
    );

    finalSuggestionsEN.push(
      "Complete the simulation"
    );

  }

}

// =========================================
// 🧠 FINAL RESPONSE
// =========================================

const response = {

  type:
    primaryResponseType ||
    intent.intent ||
    "generic",

  confidence:
    0.99,

  textIT:
    finalTextIT.trim(),

  textEN:
    finalTextEN.trim(),

  suggestionsIT: [
    ...new Set(finalSuggestionsIT)
  ],

  suggestionsEN: [
    ...new Set(finalSuggestionsEN)
  ],

  signals: finalSignals,

  metadata: {}

};
    
// =========================================
// 🧠 RESPONSE METADATA
// =========================================

response.metadata = {

  processedIntents:
    intent.intents,

  matchedKnowledge:
    matchedKnowledge.length,

  advisorEnabled:
    !!advisor,

  aiSignals:
    aiSignals.length,

  partialResponses:
    partialMetadata,

  generatedAt:
    Date.now()

};

    console.log(
  "🔥 FINAL ORCHESTRATOR RESPONSE:",
  response
);

if(window.rbRememberMessage){

  // =========================================
  // 🧠 MEMORY SOURCE
  // What-if scenarios must NOT replace
  // the canonical simulator analysis
  // =========================================

  const memoryAnalysis =
    analysisData?.whatIfScenario
      ? (window.lastAnalysisData || {})
      : analysisData;

  window.rbRememberMessage({

    role: "user",

    message: text,

    entities:{

      ...entities,

      roi:
        memoryAnalysis.realROI ??
        memoryAnalysis.roi ??
        null,

      risk:
        memoryAnalysis.risk ??
        null,

      occupancy:
        memoryAnalysis.occupancy ??
        null,

      city:
        memoryAnalysis.city ??
        analysisData.city ??
        null,

      cashflow:
        memoryAnalysis.net ??
        memoryAnalysis.cashflow ??
        memoryAnalysis.annualProfit ??
        0,

      propertyPrice:
        memoryAnalysis.propertyPrice ??
        memoryAnalysis.price ??
        0,

      equity:
        memoryAnalysis.equity ??
        null,

      loanAmount:
        memoryAnalysis.loanAmount ??
        memoryAnalysis.mortgage ??
        null,

      mortgagePercent:
        memoryAnalysis.mortgagePercent ??
        null

    },

    intent

  });

}

    // =========================================
    // 💾 MEMORY SAVE
    // =========================================

    if(window.rbSaveMemory){

      window.rbSaveMemory({

        lastMessage: text,

        lastIntent:
          intent.intent || null,

        lastCity:
          entities.city || null,

                lastROI:

          analysisData.realROI ??

          analysisData.roi ??

          null

      });

    }

    // =========================================
    // 🧠 DEBUG
    // =========================================

    console.log(
  "🧠 AI PIPELINE:",
  {
    entities,
    intent,

    memory:
      window.rbGetConversationContext
        ? window.rbGetConversationContext()
        : memory,

    matchedKnowledge,

    response
  }
);

    // =========================================
    // ✅ FINAL RESPONSE
    // =========================================

    return {

  success: true,

  entities,

  intent,

  memory:
    window.rbGetConversationContext
      ? window.rbGetConversationContext()
      : memory,

  advisor,

  matchedKnowledge,

  response

};

  }

  catch(error){

    console.error(
      "❌ AI ORCHESTRATOR ERROR:",
      error
    );

    console.error(error?.stack);

    return {

      success: false,

      response: {

        textIT:
`⚠️ Si è verificato un errore AI.`,

        textEN:
`⚠️ An AI error occurred.`

      }

    };

  }

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
  "🧠 CHATBOT ORCHESTRATOR READY"
);
