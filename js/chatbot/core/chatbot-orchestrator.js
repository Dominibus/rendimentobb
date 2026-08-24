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

if(window.RB_DEBUG === true){

  console.log(
    "🧠 DETECTED INTENT",
    detectedIntent
  );

}
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

  if(window.RB_DEBUG === true){

  console.log(
    "🔥 FINAL INTENTS:",
    uniqueIntents
  );

}
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

const investmentHistory =

  Array.isArray(
    window.rbChatMemory?.investmentHistory
  )

    ? window.rbChatMemory.investmentHistory

    : [];

const latestRememberedInvestment =

  investmentHistory.length > 0

    ? (
        investmentHistory[
          investmentHistory.length - 1
        ] || {}
      )

    : {};

const rememberedGrossRevenue =

  Number(
    latestRememberedInvestment.gross ??
    latestRememberedInvestment.revenueAnnual ??
    0
  );

const rememberedOccupancy =

  Number(
    latestRememberedInvestment.occupancy ??
    window.rbChatMemory?.lastOccupancy ??
    0
  );

const storedRememberedPriceNight =

  Number(
    latestRememberedInvestment.priceNight ??
    latestRememberedInvestment.adr ??
    latestRememberedInvestment.nightlyRate ??
    0
  );

const derivedRememberedPriceNight =

  storedRememberedPriceNight > 0

    ? storedRememberedPriceNight

    : (
        rememberedGrossRevenue > 0 &&
        rememberedOccupancy > 0 &&
        rememberedOccupancy <= 100

          ? (
              rememberedGrossRevenue /
              (
                365 *
                (
                  rememberedOccupancy / 100
                )
              )
            )

          : null
      );    

const rememberedAnalysis = {

  realROI:

    latestRememberedInvestment.realROI ??

    window.rbChatMemory?.lastROI,

  roi:

    latestRememberedInvestment.roi ??

    window.rbChatMemory?.lastROI,

  risk:

    latestRememberedInvestment.risk ??

    window.rbChatMemory?.lastRisk,

  occupancy:

    latestRememberedInvestment.occupancy ??

    window.rbChatMemory?.lastOccupancy,

  net:

    latestRememberedInvestment.net ??

    latestRememberedInvestment.cashflow ??

    window.rbChatMemory?.lastCashflow,

  annualProfit:

    latestRememberedInvestment.annualProfit ??

    latestRememberedInvestment.net ??

    latestRememberedInvestment.cashflow ??

    window.rbChatMemory?.lastCashflow,

  cashflow:

    latestRememberedInvestment.cashflow ??

    latestRememberedInvestment.net ??

    window.rbChatMemory?.lastCashflow,

  gross:

    latestRememberedInvestment.gross ??

    latestRememberedInvestment.revenueAnnual ??

    window.rbChatMemory?.lastRevenue,

    priceNight:

    derivedRememberedPriceNight,

  expenses:

    latestRememberedInvestment.expenses ??

    window.rbChatMemory?.lastExpenses,

  propertyPrice:

    latestRememberedInvestment.propertyPrice ??

    latestRememberedInvestment.price ??

    window.rbChatMemory?.lastPropertyPrice,

  equity:

    latestRememberedInvestment.equity ??

    window.rbChatMemory?.lastEquity,

  loanAmount:

    latestRememberedInvestment.loanAmount ??

    latestRememberedInvestment.mortgage ??

    window.rbChatMemory?.lastLoanAmount,

  mortgage:

    latestRememberedInvestment.mortgage ??

    latestRememberedInvestment.loanAmount ??

    window.rbChatMemory?.lastLoanAmount,

  mortgagePercent:

    latestRememberedInvestment.mortgagePercent ??

    window.rbChatMemory?.lastMortgagePercent,

  city:

    latestRememberedInvestment.city ??

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
      rememberedAnalysis.priceNight ??
      document.getElementById("priceNight")?.value ??
      100
    ),

  expenses:

    Number(
      window.lastAnalysisData?.expenses ??
      window.rbChatbotData?.expenses ??
      rememberedAnalysis.expenses ??
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
// 🧠 COMBINED WHAT-IF DETECTOR
// Detects 2+ requested scenario changes.
// Detection only — no calculation yet.
// =====================================

const combinedWhatIfChanges = {

  mortgagePercent:
    entities?.mortgagePercent !== null &&
    entities?.mortgagePercent !== undefined
      ? Number(entities.mortgagePercent)
      : null,

  propertyPrice:
    entities?.price !== null &&
    entities?.price !== undefined
      ? Number(entities.price)
      : null,

  occupancy:
    entities?.occupancy !== null &&
    entities?.occupancy !== undefined &&
    Number(entities.occupancy) !==
      Number(
        window.lastAnalysisData?.occupancy ??
        analysisData.occupancy ??
        0
      )
      ? Number(entities.occupancy)
      : null,

  adr:
    (entities?.adr ?? entities?.nightly) !== null &&
    (entities?.adr ?? entities?.nightly) !== undefined
      ? Number(
          entities?.adr ??
          entities?.nightly
        )
      : null,

  monthlyCosts:
    entities?.monthlyCosts !== null &&
    entities?.monthlyCosts !== undefined &&
    entities?.monthlyCosts !== ""
      ? Number(entities.monthlyCosts)
      : null

};

const combinedWhatIfKeys =
  Object.entries(combinedWhatIfChanges)
    .filter(
      ([, value]) =>
        value !== null &&
        Number.isFinite(value)
    )
    .map(
      ([key]) => key
    );

const isCombinedWhatIf =
  combinedWhatIfKeys.length >= 2;

if(window.RB_DEBUG === true){

  console.log(
    "🧠 COMBINED WHAT-IF DETECTOR",
    {
      isCombinedWhatIf,
      keys:
        combinedWhatIfKeys,
      changes:
        combinedWhatIfChanges
    }
  );

}   

// =====================================
// 🧠 COMBINED WHAT-IF SCENARIO
// Applies 2+ changes in ONE ROI calculation.
// Temporary only — does NOT mutate lastAnalysisData.
// =====================================

if(isCombinedWhatIf){

  const originalPropertyPrice =
    Number(
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      analysisData.propertyPrice ??
      0
    );

  const originalLoanAmount =
    Number(
      window.lastAnalysisData?.loanAmount ??
      window.lastAnalysisData?.mortgage ??
      analysisData.loanAmount ??
      0
    );

  const originalEquity =
    Number(
      window.lastAnalysisData?.equity ??
      window.lastAnalysisData?.initialCapital ??
      analysisData.equity ??
      0
    );

  const originalMortgagePercent =
    Number(
      window.lastAnalysisData?.mortgagePercent ??
      (
        originalPropertyPrice > 0
          ? (originalLoanAmount / originalPropertyPrice) * 100
          : 0
      )
    );

  const originalOccupancy =
    Number(
      window.lastAnalysisData?.occupancy ??
      analysisData.occupancy ??
      0
    );

  const originalADR =
    Number(
      window.lastAnalysisData?.priceNight ??
      analysisData.priceNight ??
      0
    );

  const originalMonthlyCosts =
    Number(
      window.lastAnalysisData?.expenses ??
      window.lastAnalysisData?.monthlyCosts ??
      analysisData.expenses ??
      0
    );

  // =====================================
  // 🧠 BUILD COMBINED SCENARIO INPUTS
  // Each missing parameter keeps baseline value.
  // =====================================

  const scenarioPropertyPrice =
    combinedWhatIfChanges.propertyPrice !== null
      ? combinedWhatIfChanges.propertyPrice
      : originalPropertyPrice;

  const scenarioMortgagePercent =
    combinedWhatIfChanges.mortgagePercent !== null
      ? combinedWhatIfChanges.mortgagePercent
      : originalMortgagePercent;

  const scenarioLoanAmount =
    scenarioPropertyPrice *
    (scenarioMortgagePercent / 100);

  const scenarioEquity =
    scenarioPropertyPrice -
    scenarioLoanAmount;

  const scenarioOccupancy =
    combinedWhatIfChanges.occupancy !== null
      ? combinedWhatIfChanges.occupancy
      : originalOccupancy;

  const scenarioADR =
    combinedWhatIfChanges.adr !== null
      ? combinedWhatIfChanges.adr
      : originalADR;

  const scenarioMonthlyCosts =
    combinedWhatIfChanges.monthlyCosts !== null
      ? combinedWhatIfChanges.monthlyCosts
      : originalMonthlyCosts;

  // =====================================
  // 🧮 ONE CANONICAL ROI CALCULATION
  // =====================================

  if(
    scenarioPropertyPrice > 0 &&
    typeof window.calculateROI === "function"
  ){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          scenarioADR,

        occupancy:
          scenarioOccupancy,

        expenses:
          scenarioMonthlyCosts,

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

      // =====================================
      // 🧠 APPLY TEMPORARY SCENARIO
      // =====================================

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

      analysisData.occupancy =
        scenarioOccupancy;

      analysisData.priceNight =
  scenarioADR;

// SSOT scenario:
// keep nightly-rate aliases aligned with the Combined What-if.
analysisData.pricePerNight =
  scenarioADR;

analysisData.expenses =
  scenarioMonthlyCosts;

      analysisData.monthlyCosts =
        scenarioMonthlyCosts;

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

      analysisData.gross =
  scenarioResult.gross;

analysisData.revenueAnnual =
  scenarioResult.revenue ??
  scenarioResult.gross;

      analysisData.risk =
        scenarioResult.risk;

if(window.RB_DEBUG === true){

  console.log(
    "🧮 COMBINED WHAT-IF ROI RECALCULATED",
    scenarioResult
  );

}

      // =====================================
      // 🧠 ONE SCORE CALCULATION
      // =====================================

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
              scenarioOccupancy,

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

if(window.RB_DEBUG === true){

  console.log(
    "🧠 COMBINED WHAT-IF SCORE RECALCULATED",
    scenarioScore
  );

}

        }

      }

      // =====================================
      // 🧠 COMBINED SCENARIO METADATA
      // =====================================

      analysisData.whatIfScenario = {

        type:
          "combined",

        changes:
          [...combinedWhatIfKeys],

        originalPropertyPrice,

        originalMortgagePercent,

        originalLoanAmount,

        originalEquity,

        originalOccupancy,

        originalADR,

        originalMonthlyCosts,

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

        originalRisk:
          Number(
            window.lastAnalysisData?.risk ??
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

        scenarioOccupancy,

        scenarioADR,

        scenarioMonthlyCosts,

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

        scenarioRisk:
          Number(
            analysisData.risk ?? 0
          ),

        scenarioInvestmentScore:
          Number(
            analysisData.investmentScore ?? 0
          )

      };

if(window.RB_DEBUG === true){

  console.log(
    "🧠 COMBINED WHAT-IF SCENARIO",
    analysisData.whatIfScenario
  );

}

    }

  }

}

// =====================================
// 💰 EQUITY / OWN CAPITAL WHAT-IF SCENARIO
// Changes equity only and recalculates financing.
// Temporary only — does NOT mutate lastAnalysisData.
// =====================================

const requestedEquity =
  entities?.downPayment !== null &&
  entities?.downPayment !== undefined
    ? Number(entities.downPayment)
    : null;

const baselineEquity =
  Number(
    window.lastAnalysisData?.equity ??
    window.lastAnalysisData?.initialCapital ??
    rememberedAnalysis.equity ??
    analysisData.equity ??
    0
  );

const isEquityWhatIf =
  !isCombinedWhatIf &&
  Number.isFinite(requestedEquity) &&
  requestedEquity > 0 &&
  Number(analysisData.propertyPrice) > 0 &&
  requestedEquity < Number(analysisData.propertyPrice) &&
  requestedEquity !== baselineEquity;

if(isEquityWhatIf){

  const scenarioPropertyPrice =
    Number(
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      analysisData.propertyPrice ??
      0
    );

  const scenarioEquity =
    requestedEquity;

  const scenarioLoanAmount =
    scenarioPropertyPrice -
    scenarioEquity;

  const scenarioMortgagePercent =
    scenarioPropertyPrice > 0
      ? (
          scenarioLoanAmount /
          scenarioPropertyPrice
        ) * 100
      : 0;

  const scenarioOccupancy =
    Number(
      window.lastAnalysisData?.occupancy ??
      analysisData.occupancy ??
      0
    );

  const scenarioADR =
    Number(
      window.lastAnalysisData?.priceNight ??
      analysisData.priceNight ??
      0
    );

  const scenarioMonthlyCosts =
    Number(
      window.lastAnalysisData?.expenses ??
      window.lastAnalysisData?.monthlyCosts ??
      analysisData.expenses ??
      0
    );

  if(
    scenarioPropertyPrice > 0 &&
    typeof window.calculateROI === "function"
  ){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          scenarioADR,

        occupancy:
          scenarioOccupancy,

        expenses:
          scenarioMonthlyCosts,

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

      analysisData.propertyPrice =
        scenarioPropertyPrice;

      analysisData.price =
        scenarioPropertyPrice;

      analysisData.equity =
        scenarioEquity;

      analysisData.loanAmount =
        scenarioLoanAmount;

      analysisData.mortgage =
        scenarioLoanAmount;

      analysisData.mortgagePercent =
        scenarioMortgagePercent;

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

      analysisData.gross =
        scenarioResult.gross;

      analysisData.revenueAnnual =
        scenarioResult.revenue ??
        scenarioResult.gross;

      analysisData.risk =
        scenarioResult.risk;

      console.log(
        "🧮 EQUITY WHAT-IF ROI RECALCULATED",
        scenarioResult
      );

      // =====================================
      // 🧠 RECALCULATE EQUITY WHAT-IF SCORE
      // =====================================

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
              scenarioOccupancy,

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
            "🧠 EQUITY WHAT-IF SCORE RECALCULATED",
            scenarioScore
          );

        }

      }

      // =====================================
      // 💰 EQUITY SCENARIO METADATA
      // =====================================

      analysisData.whatIfScenario = {

        type:
          "equity",

        requestedEquity,

        originalPropertyPrice:
          scenarioPropertyPrice,

        originalEquity:
          baselineEquity,

        originalLoanAmount:
          Number(
            window.lastAnalysisData?.loanAmount ??
            window.lastAnalysisData?.mortgage ??
            0
          ),

        originalMortgagePercent:
          Number(
            window.lastAnalysisData?.mortgagePercent ??
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

        originalRisk:
          Number(
            window.lastAnalysisData?.risk ??
            0
          ),

        originalInvestmentScore:
          Number(
            window.lastAnalysisData?.investmentScore ??
            window.lastInvestmentScore?.score ??
            0
          ),

        scenarioPropertyPrice,

        scenarioEquity,

        scenarioLoanAmount,

        scenarioMortgagePercent,

        scenarioOccupancy,

        scenarioADR,

        scenarioMonthlyCosts,

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

        scenarioRisk:
          Number(
            analysisData.risk ?? 0
          ),

        scenarioInvestmentScore:
          Number(
            analysisData.investmentScore ?? 0
          )

      };

      console.log(
        "💰 EQUITY WHAT-IF SCENARIO",
        analysisData.whatIfScenario
      );

    }

  }

}    

// =====================================
// 💰 EQUITY WHAT-IF INTENT OVERRIDE
// A valid calculated equity scenario
// must use the Executive What-if renderer.
// =====================================

if(
  analysisData?.whatIfScenario?.type ===
  "equity"
){

  intent.intent =
    "investment_executive";

  intent.intents = [
    "investment_executive"
  ];

  console.log(
    "💰 EQUITY WHAT-IF → EXECUTIVE INTENT"
  );

}    

// =====================================
// 🏦 MORTGAGE WHAT-IF SCENARIO
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const requestedMortgagePercent =
  Number(
    entities?.mortgagePercent
  );

const requestedMortgageAmount =
  entities?.mortgageAmount !== null &&
  entities?.mortgageAmount !== undefined
    ? Number(entities.mortgageAmount)
    : null;    

const isMortgageWhatIf =
  !isCombinedWhatIf &&
  (
    intent?.intents?.includes("mortgage_analysis") ||
    (
      entities?.mortgage === true &&
      Number.isFinite(requestedMortgageAmount) &&
      requestedMortgageAmount > 0
    )
  ) &&
  (
    (
      Number.isFinite(requestedMortgagePercent) &&
      requestedMortgagePercent > 0 &&
      requestedMortgagePercent <= 100
    )
    ||
    (
      Number.isFinite(requestedMortgageAmount) &&
      requestedMortgageAmount > 0 &&
      requestedMortgageAmount <
        Number(
          analysisData.propertyPrice ??
          window.lastAnalysisData?.propertyPrice ??
          window.lastAnalysisData?.price ??
          0
        )
    )
  );

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
  Number.isFinite(requestedMortgageAmount) &&
  requestedMortgageAmount > 0
    ? requestedMortgageAmount
    : (
        scenarioPropertyPrice *
        (requestedMortgagePercent / 100)
      );

const scenarioMortgagePercent =
  scenarioPropertyPrice > 0
    ? (
        scenarioLoanAmount /
        scenarioPropertyPrice
      ) * 100
    : 0;

const scenarioEquity =
  scenarioPropertyPrice -
  scenarioLoanAmount;

    analysisData.mortgagePercent =
  scenarioMortgagePercent;

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
  scenarioMortgagePercent,

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

requestedMortgagePercent:
  Number.isFinite(requestedMortgagePercent) &&
  requestedMortgagePercent > 0
    ? requestedMortgagePercent
    : null,

requestedMortgageAmount:
  Number.isFinite(requestedMortgageAmount)
    ? requestedMortgageAmount
    : null,

scenarioMortgagePercent,

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

const isCapitalConversation =

  Number.isFinite(
    Number(entities?.availableCapital)
  ) &&

  (
    message.toLowerCase().includes("ho ") ||
    message.toLowerCase().includes("budget") ||
    message.toLowerCase().includes("capitale") ||
    message.toLowerCase().includes("da investire") ||
    message.toLowerCase().includes("i have") ||
    message.toLowerCase().includes("to invest")
  );

const isPropertyPriceWhatIf =

  !isCapitalConversation &&

  !isCombinedWhatIf &&

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

// =====================================
// 🧠 PROPERTY PRICE WHAT-IF INTENT OVERRIDE
// A valid calculated scenario must use Executive response
// =====================================

if(
  analysisData?.whatIfScenario?.type ===
  "property_price"
){

  intent.intent =
    "investment_executive";

  intent.intents = [
    "investment_executive"
  ];

  console.log(
    "🏠 PROPERTY PRICE WHAT-IF → EXECUTIVE INTENT"
  );

}
    
// =====================================
// 🏨 OCCUPANCY WHAT-IF SCENARIO
// Changes occupancy only
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const rawRequestedOccupancy =
  entities?.occupancy;

const hasExplicitRequestedOccupancy =
  rawRequestedOccupancy !== null &&
  rawRequestedOccupancy !== undefined &&
  rawRequestedOccupancy !== "";

const requestedOccupancy =
  hasExplicitRequestedOccupancy
    ? Number(rawRequestedOccupancy)
    : null;

const baselineOccupancy =
  Number(
    window.lastAnalysisData?.occupancy ??
    rememberedAnalysis.occupancy ??
    analysisData.occupancy ??
    0
  );

const isOccupancyWhatIf =
  !isCombinedWhatIf &&
  !isMortgageWhatIf &&
  !isPropertyPriceWhatIf &&
  intent?.intents?.includes("investment_executive") &&
  hasExplicitRequestedOccupancy &&
  Number.isFinite(requestedOccupancy) &&
  requestedOccupancy >= 0 &&
  requestedOccupancy <= 100 &&
  baselineOccupancy > 0 &&
  requestedOccupancy !== baselineOccupancy;

if(isOccupancyWhatIf){

  const scenarioPropertyPrice =
    Number(
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      analysisData.propertyPrice ??
      0
    );

  const scenarioEquity =
    Number(
      window.lastAnalysisData?.equity ??
      window.lastAnalysisData?.initialCapital ??
      window.rbChatMemory?.lastEquity ??
      analysisData.equity ??
      0
    );

  const scenarioLoanAmount =
    Number(
      window.lastAnalysisData?.loanAmount ??
      window.lastAnalysisData?.mortgage ??
      window.rbChatMemory?.lastLoanAmount ??
      analysisData.loanAmount ??
      0
    );

  const scenarioMortgagePercent =
    Number(
      window.lastAnalysisData?.mortgagePercent ??
      analysisData.mortgagePercent ??
      (
        scenarioPropertyPrice > 0
          ? (scenarioLoanAmount / scenarioPropertyPrice) * 100
          : 0
      )
    );

    const originalROI =
    Number(
      window.lastAnalysisData?.visualROI ??
      window.lastAnalysisData?.roi ??
      rememberedAnalysis.roi ??
      analysisData.roi ??
      0
    );

  const originalRealROI =
    Number(
      window.lastAnalysisData?.realROI ??
      window.lastAnalysisData?.safeROI ??
      rememberedAnalysis.realROI ??
      analysisData.realROI ??
      0
    );

  const originalCashflow =
    Number(
      window.lastAnalysisData?.net ??
      window.lastAnalysisData?.cashflow ??
      window.lastAnalysisData?.annualProfit ??
      rememberedAnalysis.net ??
      rememberedAnalysis.cashflow ??
      analysisData.net ??
      analysisData.cashflow ??
      analysisData.annualProfit ??
      0
    );

  const originalRisk =
    Number(
      window.lastAnalysisData?.risk ??
      rememberedAnalysis.risk ??
      analysisData.risk ??
      0
    );

  const originalInvestmentScore =
    Number(
      window.lastAnalysisData?.investmentScore ??
      window.lastInvestmentScore?.score ??
      analysisData.investmentScore ??
      0
    );

  analysisData.occupancy =
    requestedOccupancy;

  if(
    scenarioPropertyPrice > 0 &&
    typeof window.calculateROI === "function"
  ){

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
          requestedOccupancy,

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

// =====================================
// 💰 OCCUPANCY WHAT-IF REVENUE SSOT
// Revenue must come from the same
// canonical ROI scenario calculation
// =====================================

analysisData.gross =
  scenarioResult.gross;

analysisData.revenueAnnual =
  scenarioResult.revenue ??
  scenarioResult.gross;

analysisData.risk =
  scenarioResult.risk;

console.log(
  "🧮 OCCUPANCY WHAT-IF ROI RECALCULATED",
  scenarioResult
);

      // =====================================
      // 🧠 RECALCULATE OCCUPANCY WHAT-IF SCORE
      // Temporary only
      // =====================================

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
              requestedOccupancy,

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
            "🧠 OCCUPANCY WHAT-IF SCORE RECALCULATED",
            scenarioScore
          );

        }

      }

    }

  }

  analysisData.whatIfScenario = {

    type:
      "occupancy",

    requestedOccupancy,

    originalOccupancy:
      baselineOccupancy,

        originalPropertyPrice:
      scenarioPropertyPrice,

    originalMortgagePercent:
      scenarioMortgagePercent,

    originalLoanAmount:
      scenarioLoanAmount,

    originalEquity:
      scenarioEquity,

    originalROI,

    originalRealROI,

    originalCashflow,

    originalRisk,

    originalInvestmentScore,

    scenarioOccupancy:
      requestedOccupancy,

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

    scenarioRisk:
      Number(
        analysisData.risk ?? 0
      ),

    scenarioInvestmentScore:
      Number(
        analysisData.investmentScore ?? 0
      )

  };

  console.log(
    "🏨 OCCUPANCY WHAT-IF SCENARIO",
    analysisData.whatIfScenario
  );

}    

// =====================================
// 💶 ADR / NIGHTLY RATE WHAT-IF SCENARIO
// Changes nightly rate only
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const requestedADR =
  Number(
    entities?.adr ??
    entities?.nightly
  );

const baselineADR =
  Number(
    window.lastAnalysisData?.priceNight ??
    analysisData.priceNight ??
    0
  );

const isADRWhatIf =
  !isCombinedWhatIf &&
  !isMortgageWhatIf &&
  !isPropertyPriceWhatIf &&
  !isOccupancyWhatIf &&
  intent?.intents?.includes("investment_executive") &&
  Number.isFinite(requestedADR) &&
  requestedADR > 0 &&
  baselineADR > 0 &&
  requestedADR !== baselineADR;

if(isADRWhatIf){

  const scenarioPropertyPrice =
    Number(
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      analysisData.propertyPrice ??
      0
    );

  const scenarioEquity =
    Number(
      window.lastAnalysisData?.equity ??
      window.lastAnalysisData?.initialCapital ??
      analysisData.equity ??
      0
    );

  const scenarioLoanAmount =
    Number(
      window.lastAnalysisData?.loanAmount ??
      window.lastAnalysisData?.mortgage ??
      analysisData.loanAmount ??
      0
    );

  const scenarioMortgagePercent =
    Number(
      window.lastAnalysisData?.mortgagePercent ??
      analysisData.mortgagePercent ??
      (
        scenarioPropertyPrice > 0
          ? (scenarioLoanAmount / scenarioPropertyPrice) * 100
          : 0
      )
    );

  const scenarioOccupancy =
    Number(
      window.lastAnalysisData?.occupancy ??
      analysisData.occupancy ??
      0
    );

  analysisData.priceNight =
    requestedADR;

  // =====================================
  // 💶 ADR WHAT-IF SSOT
  // Keep nightly-rate aliases aligned
  // inside the temporary scenario only
  // =====================================

  analysisData.pricePerNight =
    requestedADR;

  if(
    scenarioPropertyPrice > 0 &&
    typeof window.calculateROI === "function"
  ){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          requestedADR,

        occupancy:
          scenarioOccupancy,

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

      // =====================================
      // 💰 ADR WHAT-IF REVENUE SSOT
      // Revenue must come from the same
      // canonical ROI scenario calculation
      // =====================================

      analysisData.gross =
        scenarioResult.gross;

      analysisData.revenueAnnual =
        scenarioResult.revenue ??
        scenarioResult.gross;

      analysisData.risk =
        scenarioResult.risk;

      console.log(
        "🧮 ADR WHAT-IF ROI RECALCULATED",
        scenarioResult
      );
      
      // =====================================
      // 🧠 RECALCULATE ADR WHAT-IF SCORE
      // Temporary only
      // =====================================

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
              scenarioOccupancy,

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
            "🧠 ADR WHAT-IF SCORE RECALCULATED",
            scenarioScore
          );

        }

      }

    }

  }

  analysisData.whatIfScenario = {

    type:
      "adr",

    requestedADR,

    originalADR:
      baselineADR,

    originalOccupancy:
      Number(
        window.lastAnalysisData?.occupancy ??
        0
      ),

    originalPropertyPrice:
      Number(
        window.lastAnalysisData?.propertyPrice ??
        window.lastAnalysisData?.price ??
        0
      ),

    originalMortgagePercent:
      Number(
        window.lastAnalysisData?.mortgagePercent ??
        0
      ),

    originalLoanAmount:
      Number(
        window.lastAnalysisData?.loanAmount ??
        window.lastAnalysisData?.mortgage ??
        0
      ),

    originalEquity:
      Number(
        window.lastAnalysisData?.equity ??
        window.lastAnalysisData?.initialCapital ??
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

    originalRisk:
      Number(
        window.lastAnalysisData?.risk ??
        0
      ),

    originalInvestmentScore:
      Number(
        window.lastAnalysisData?.investmentScore ??
        window.lastInvestmentScore?.score ??
        0
      ),

    scenarioADR:
      requestedADR,

    scenarioOccupancy,

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

    scenarioRisk:
      Number(
        analysisData.risk ?? 0
      ),

    scenarioInvestmentScore:
      Number(
        analysisData.investmentScore ?? 0
      )

  };

  console.log(
    "💶 ADR WHAT-IF SCENARIO",
    analysisData.whatIfScenario
  );

}    

// =====================================
// 💸 MONTHLY COSTS WHAT-IF SCENARIO
// Changes operating costs only
// Temporary scenario — does NOT mutate lastAnalysisData
// =====================================

const requestedMonthlyCosts =
  entities?.monthlyCosts !== null &&
  entities?.monthlyCosts !== undefined &&
  entities?.monthlyCosts !== ""
    ? Number(entities.monthlyCosts)
    : null;

const baselineMonthlyCosts =
  Number(
    window.lastAnalysisData?.expenses ??
    window.lastAnalysisData?.monthlyCosts ??
    analysisData.expenses ??
    0
  );

const isMonthlyCostsWhatIf =
  !isCombinedWhatIf &&
  !isMortgageWhatIf &&
  !isPropertyPriceWhatIf &&
  !isOccupancyWhatIf &&
  !isADRWhatIf &&
  intent?.intents?.includes("investment_executive") &&
  Number.isFinite(requestedMonthlyCosts) &&
  requestedMonthlyCosts >= 0 &&
  baselineMonthlyCosts >= 0 &&
  requestedMonthlyCosts !== baselineMonthlyCosts;

if(isMonthlyCostsWhatIf){

  const scenarioPropertyPrice =
    Number(
      window.lastAnalysisData?.propertyPrice ??
      window.lastAnalysisData?.price ??
      analysisData.propertyPrice ??
      0
    );

  const scenarioEquity =
    Number(
      window.lastAnalysisData?.equity ??
      window.lastAnalysisData?.initialCapital ??
      analysisData.equity ??
      0
    );

  const scenarioLoanAmount =
    Number(
      window.lastAnalysisData?.loanAmount ??
      window.lastAnalysisData?.mortgage ??
      analysisData.loanAmount ??
      0
    );

  const scenarioMortgagePercent =
    Number(
      window.lastAnalysisData?.mortgagePercent ??
      analysisData.mortgagePercent ??
      (
        scenarioPropertyPrice > 0
          ? (scenarioLoanAmount / scenarioPropertyPrice) * 100
          : 0
      )
    );

  const scenarioOccupancy =
    Number(
      window.lastAnalysisData?.occupancy ??
      analysisData.occupancy ??
      0
    );

  const scenarioADR =
    Number(
      window.lastAnalysisData?.priceNight ??
      analysisData.priceNight ??
      0
    );

  analysisData.expenses =
    requestedMonthlyCosts;

  analysisData.monthlyCosts =
    requestedMonthlyCosts;

  if(
    scenarioPropertyPrice > 0 &&
    typeof window.calculateROI === "function"
  ){

    const scenarioResult =
      window.calculateROI({

        price:
          scenarioPropertyPrice,

        equity:
          scenarioEquity,

        loanAmount:
          scenarioLoanAmount,

        priceNight:
          scenarioADR,

        occupancy:
          scenarioOccupancy,

        expenses:
          requestedMonthlyCosts,

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
        "🧮 COSTS WHAT-IF ROI RECALCULATED",
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
              scenarioOccupancy,

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
            "🧠 COSTS WHAT-IF SCORE RECALCULATED",
            scenarioScore
          );

        }

      }

    }

  }

  analysisData.whatIfScenario = {

    type:
      "monthly_costs",

    requestedMonthlyCosts,

    originalMonthlyCosts:
      baselineMonthlyCosts,

    originalPropertyPrice:
      Number(
        window.lastAnalysisData?.propertyPrice ??
        window.lastAnalysisData?.price ??
        0
      ),

    originalMortgagePercent:
      Number(
        window.lastAnalysisData?.mortgagePercent ??
        0
      ),

    originalLoanAmount:
      Number(
        window.lastAnalysisData?.loanAmount ??
        window.lastAnalysisData?.mortgage ??
        0
      ),

    originalEquity:
      Number(
        window.lastAnalysisData?.equity ??
        window.lastAnalysisData?.initialCapital ??
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

    originalRisk:
      Number(
        window.lastAnalysisData?.risk ??
        0
      ),

    originalInvestmentScore:
      Number(
        window.lastAnalysisData?.investmentScore ??
        window.lastInvestmentScore?.score ??
        0
      ),

    scenarioMonthlyCosts:
      requestedMonthlyCosts,

    scenarioPropertyPrice,

    scenarioMortgagePercent,

    scenarioLoanAmount,

    scenarioEquity,

    scenarioOccupancy,

    scenarioADR,

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

    scenarioRisk:
      Number(
        analysisData.risk ?? 0
      ),

    scenarioInvestmentScore:
      Number(
        analysisData.investmentScore ?? 0
      )

  };

  console.log(
    "💸 MONTHLY COSTS WHAT-IF SCENARIO",
    analysisData.whatIfScenario
  );

}

// =====================================
// 🧠 WHAT-IF VERDICT SSOT
// Keep scenario Score + Verdict aligned
// before building the canonical AI context.
// Temporary only — lastAnalysisData untouched.
// =====================================

if(
  analysisData?.whatIfScenario &&
  Number.isFinite(
    Number(analysisData.investmentScore)
  ) &&
  typeof window.rbGenerateAdvisorVerdict === "function"
){

  const scenarioDecision =
    window.rbGenerateAdvisorVerdict({

      roi:
        Number(
          analysisData.realROI ??
          analysisData.roi ??
          0
        ),

      risk:
        Number(
          analysisData.risk ?? 0
        ),

      occupancy:
        Number(
          analysisData.occupancy ?? 0
        ),

      mortgagePercent:
        Number(
          analysisData.mortgagePercent ?? 0
        ),

      cashflow:
        Number(
          analysisData.net ??
          analysisData.cashflow ??
          0
        ),

      city:
        analysisData.city || "roma",

      canonicalScore:
        Number(
          analysisData.investmentScore
        ),

      investorProfile

    });

  if(scenarioDecision?.verdict){

    analysisData.verdict =
      scenarioDecision.verdict;

    analysisData.whatIfScenario.scenarioVerdict =
      scenarioDecision.verdict;

  }

  console.log(
    "🧠 WHAT-IF VERDICT SSOT",
    {
      score:
        analysisData.investmentScore,

      verdict:
        analysisData.verdict
    }
  );

}
    
if(window.RB_DEBUG === true){

  console.log(
    "🔥 ANALYSIS DATA FINAL JSON",
    JSON.stringify(
      analysisData,
      null,
      2
    )
  );

}

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

if(window.RB_DEBUG === true){

    console.log(
        "🧠 CANONICAL AI CONTEXT",
        canonicalAnalysis
    );

}
    
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

if(window.RB_DEBUG === true){

  console.log(
    "🧠 ADVISOR ENGINE RESULT",
    {
      enabled:
        !!advisor,

      shouldRunAdvisor,

      intent:
        intent.intent,

      roi:
        analysisData.realROI ??
        analysisData.roi ??
        0,

      risk:
        analysisData.risk ?? 0,

      occupancy:
        analysisData.occupancy ?? 0,

      cashflow:
        analysisData.net ??
        analysisData.cashflow ??
        0,

      advisor
    }
  );

}

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

if(window.RB_DEBUG === true){

  console.log(
    "📄 DOCUMENT KNOWLEDGE",
    {
      activeDocument:
        !!documentKnowledge.activeDocument,

      activeReport:
        !!documentKnowledge.activeReport,

      uploadedReports:
        Array.isArray(
          documentKnowledge.uploadedReports
        )
        ? documentKnowledge.uploadedReports.length
        : 0
    }
  );

}

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

if(window.RB_DEBUG === true){

  console.log(
    "🧠 AI BRAIN",
    brain
  );

}

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
  analysisData?.whatIfScenario
    ? (
        advisor.verdict ??
        window.lastInvestmentScore?.verdict ??
        "WAIT"
      )
    : (
        canonicalAnalysis.verdict ??
        window.lastAnalysisData?.verdict ??
        window.lastInvestmentScore?.verdict ??
        advisor.verdict ??
        "WAIT"
      );

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

  if(window.RB_DEBUG === true){

  console.log(
    "🧠 CANONICAL INVESTMENT DECISION",
    window.lastInvestmentScore
  );

}

}

if(advisor){

  if(window.RB_DEBUG === true){

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

if(window.RB_DEBUG === true){

  console.log(
    "🧠 CONVERSATION CONTEXT",
    conversationContext
  );

}

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

if(window.RB_DEBUG === true){

  console.log(
    "🧠 EXECUTIVE BRAIN",
    executiveBrain
  );

}
  
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

  if(window.RB_DEBUG === true){

  console.log(
    "🧠 RESPONSE ENGINE OUTPUT",
    {
      intent: currentIntent,
      response: partialResponse
    }
  );

}

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

  if(window.RB_DEBUG === true){

  console.log(
    "🔥 FINAL ORCHESTRATOR RESPONSE:",
    response
  );

}

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

if(window.RB_DEBUG === true){

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

}

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

// Production: nessun log
