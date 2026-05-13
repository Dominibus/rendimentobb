// ===============================================
// RENDIMENTOBB – AI CHATBOT UI 1.0
// ===============================================

document.addEventListener("DOMContentLoaded", initRBChatbot);

document.addEventListener(
  "rb_language_changed",
  ()=>{
    document.getElementById("rb-chatbot-wrapper")?.remove();
    initRBChatbot();
  }
);

// ===============================================
// 🧠 AI RESPONSE ENGINE 1.0
// ===============================================

window.generateAIResponse = function(message){

  const text = message.toLowerCase().trim();

// =====================================
// 🧠 KNOWLEDGE BASE ENGINE
// =====================================

for(const key in window.rbKnowledgeBase){

  const item = window.rbKnowledgeBase[key];

  const matched =
    item.keywords.some(keyword =>
      text.includes(keyword)
    );

if(matched){

  const lang = window.currentLang || "it";

  const response = lang === "en"

  ? `

${item.aiTitleEN || ""}

${item.aiSummaryEN || ""}

${item.aiInsightEN || ""}

${item.warningEN || ""}

${item.recommendationsEN?.length

? `
💡 Recommendations:
• ${item.recommendationsEN.join("\n• ")}
`

: ""
}

`

  : `

${item.aiTitleIT || ""}

${item.aiSummaryIT || ""}

${item.aiInsightIT || ""}

${item.warningIT || ""}

${item.recommendationsIT?.length

? `
💡 Suggerimenti:
• ${item.recommendationsIT.join("\n• ")}
`

: ""
}

`;

  return response;

}

}  

// =====================================
// 🧠 EDUCATIONAL DETECTION
// =====================================

  const data = window.lastAnalysisData || {};

  const access = window.getUserAccess?.() || {};

  const roi =
    Number(data.roi || 0);

  const risk =
    Math.round(
      Number(data.risk || data.riskScore || 0)
    );

  const city =
    window.currentCity || "roma";

  const profit =
    Number(
      data.netAfterMortgage ||
      data.net ||
      0
    );

  const occupancy =
  Number(
    data.occupancy ||
    data.occupancyRate ||
    0
  );

const nightly =
  Number(
    data.pricePerNight ||
    data.nightPrice ||
    0
  );

const monthlyCosts =
  Number(
    data.monthlyCosts ||
    data.monthlyExpenses ||
    0
  );

  // =====================================
// 🧠 INTENT ENGINE
// =====================================

const intents = {

  roi: [
    "roi",
    "rendimento",
    "return",
    "profitto",
    "guadagno",
    "quanto rende",
    "quant'è il roi",
    "quanto rende investimento"
  ],

  risk: [
    "rischio",
    "risk",
    "sicuro",
    "pericoloso",
    "stabile",
    "rischioso",
    "rischi ci sono"
  ],

  cashflow: [
    "cashflow",
    "cash flow",
    "flusso di cassa",
    "liquidità",
    "guadagno reale"
  ],

  strategy: [
    "strategia",
    "consigli",
    "conviene",
    "che ne pensi",
    "cosa pensi",
    "investimento buono",
    "buon investimento",
    "cosa leggi",
    "analizza simulazione",
    "migliorare",
    "ottimizzare"
  ],

  education: [
    "cos'è",
    "cosa è",
    "cosa vuol dire",
    "significa",
    "spiegami",
    "definizione",
    "what is",
    "meaning",
    "explain"
  ]

};

  function detectIntent(intentList){

  return intentList.some(keyword =>
    text.includes(keyword)
  );

}

const wantsROI =
  detectIntent(intents.roi);

const wantsRisk =
  detectIntent(intents.risk);

const wantsCashflow =
  detectIntent(intents.cashflow);

const wantsStrategy =
  detectIntent(intents.strategy);

const wantsEducation =
  detectIntent(intents.education);
// =====================================
// 📚 ROI EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  (
    text.includes("roi") ||
    text.includes("rendimento")
  )
){

  return window.t(

`📈 ROI (Return On Investment)

Il ROI misura quanto rende il tuo investimento rispetto al capitale investito.

Esempio:

• investimento → €100.000
• profitto annuo → €10.000

ROI:
10%

💡 Nel settore B&B:

• 4-6% → conservativo
• 7-10% → molto buono
• 10%+ → aggressivo

⚠️ Un ROI alto non garantisce automaticamente un investimento sicuro.`,

`📈 ROI (Return On Investment)

ROI measures how profitable an investment is compared to invested capital.

Example:

• investment → €100,000
• annual profit → €10,000

ROI:
10%

💡 In the B&B sector:

• 4-6% → conservative
• 7-10% → very strong
• 10%+ → aggressive

⚠️ High ROI does not automatically guarantee a safe investment.`

  );

}

  // =====================================
// 📚 CASHFLOW EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  (
    text.includes("cashflow") ||
    text.includes("cash flow") ||
    text.includes("flusso di cassa")
  )
){

  return window.t(

`💸 Cashflow

Il cashflow rappresenta il denaro reale che rimane dopo tutte le spese operative.

Include:

• utenze
• cleaning
• tasse
• manutenzione
• eventuale mutuo

💡 Un cashflow positivo significa che il B&B genera liquidità reale ogni mese.

⚠️ Molti investimenti mostrano ROI elevati ma cashflow molto bassi.`,

`💸 Cashflow

Cashflow represents the real money remaining after all operating expenses.

Includes:

• utilities
• cleaning
• taxes
• maintenance
• mortgage payments

💡 Positive cashflow means the property generates real liquidity every month.

⚠️ Many investments show high ROI but weak cashflow.`

  );

}

  // =====================================
// 📚 RISK EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  (
    text.includes("rischio") ||
    text.includes("risk")
  )
){

  return window.t(

`⚠️ Rischio investimento

Il rischio misura quanto un investimento può diventare instabile nel tempo.

Nel settore B&B il rischio dipende da:

• occupazione
• costi operativi
• mutuo
• stagionalità
• regolamentazioni locali

💡 Un ROI alto con rischio elevato può diventare poco sostenibile.`,

`⚠️ Investment Risk

Risk measures how unstable an investment may become over time.

In the B&B sector risk depends on:

• occupancy
• operating costs
• mortgage
• seasonality
• local regulations

💡 A high ROI with high risk may become unsustainable.`

  );

}

  // =====================================
// 📚 OCCUPANCY EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  (
    text.includes("occupazione") ||
    text.includes("occupancy")
  )
){

  return window.t(

`🏨 Occupazione

L'occupazione indica la percentuale di notti prenotate durante l'anno.

💡 Nel settore short rent:

• 50% → basso
• 65-70% → ottimo
• 80%+ → molto aggressivo

⚠️ Occupazioni troppo elevate possono essere irrealistiche in alcune città.`,

`🏨 Occupancy

Occupancy represents the percentage of booked nights during the year.

💡 In the short rental sector:

• 50% → low
• 65-70% → excellent
• 80%+ → very aggressive

⚠️ Extremely high occupancy may be unrealistic in some cities.`

  );

}

  // =====================================
// 📚 DSCR EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  text.includes("dscr")
){

  return window.t(

`🏦 DSCR

Il DSCR misura la capacità dell'investimento di sostenere il mutuo.

💡 Generalmente:

• sotto 1 → rischio elevato
• sopra 1.2 → sostenibile
• sopra 1.5 → molto forte

Le banche utilizzano spesso questo parametro per valutare finanziamenti immobiliari.`,

`🏦 DSCR

DSCR measures the investment's ability to sustain mortgage payments.

💡 Generally:

• below 1 → high risk
• above 1.2 → sustainable
• above 1.5 → very strong

Banks often use this metric to evaluate real estate financing.`

  );

}

  // =====================================
// 📚 BREAK EVEN EDUCATIONAL
// =====================================

if(
  wantsEducation &&
  (
    text.includes("break even") ||
    text.includes("pareggio")
  )
){

  return window.t(

`⚖️ Break-even

Il break-even rappresenta il punto in cui ricavi e costi si equivalgono.

💡 Più rapidamente raggiungi il break-even:

• minore sarà il rischio
• maggiore sarà la stabilità operativa

⚠️ Un break-even troppo lento aumenta l'esposizione finanziaria.`,

`⚖️ Break-even

Break-even represents the point where revenues equal costs.

💡 The faster you reach break-even:

• the lower the risk
• the higher the operational stability

⚠️ Slow break-even increases financial exposure.`

  );

}

  // =====================================
  // ❌ NO ANALYSIS YET
  // =====================================

  if(!window.lastAnalysisData){

    return window.t(
      "Prima esegui una simulazione così posso analizzare ROI, rischio e rendimento reale.",
      "Run a simulation first so I can analyze ROI, risk and real profitability."
    );

  }  

// =====================================
// 📊 ROI SIMULATION
// =====================================

if(wantsROI){

    if(access.isFree){

      return window.t(
        `Il ROI stimato sembra interessante, ma senza analisi completa non puoi vedere rischio reale e sostenibilità finanziaria.`,
        `The estimated ROI looks promising, but without full analysis you cannot see real risk and financial sustainability.`
      );

    }

    if(roi >= 15){

      return window.t(
        `Ottimo segnale: il ROI attuale è ${roi.toFixed(1)}%. L'investimento risulta sopra la media del mercato di ${city}.`,
        `Strong signal: current ROI is ${roi.toFixed(1)}%. The investment is above the ${city} market average.`
      );

    }

    if(roi >= 8){

      return window.t(
        `Il ROI attuale è ${roi.toFixed(1)}%. L'investimento sembra sostenibile ma dipende molto dall'occupazione.`,
        `Current ROI is ${roi.toFixed(1)}%. The investment appears sustainable but depends heavily on occupancy.`
      );

    }

    return window.t(
      `Il ROI attuale è piuttosto basso (${roi.toFixed(1)}%). Potrebbe essere necessario ottimizzare prezzo notte o costi.`,
      `Current ROI is relatively low (${roi.toFixed(1)}%). You may need to optimize pricing or costs.`
    );

  }

  // =====================================
  // ⚠️ RISK
  // =====================================

  if(wantsRisk){

    if(access.isFree){

      return window.t(
        "L'analisi rischio completa è disponibile nei piani avanzati.",
        "Full risk analysis is available in advanced plans."
      );

    }

    if(risk <= 35){

      return window.t(
        `Il rischio stimato è basso (${risk}/100). La struttura finanziaria sembra solida.`,
        `Estimated risk is low (${risk}/100). Financial structure appears solid.`
      );

    }

    if(risk <= 65){

      return window.t(
        `Il rischio stimato è moderato (${risk}/100). Controlla bene occupazione e costi operativi.`,
        `Estimated risk is moderate (${risk}/100). Carefully monitor occupancy and operating costs.`
      );

    }

    return window.t(
      `Il rischio stimato è elevato (${risk}/100). L'investimento potrebbe non essere stabile nel lungo periodo.`,
      `Estimated risk is high (${risk}/100). The investment may not be stable long-term.`
    );

  }

  // =====================================
  // 💰 CASHFLOW
  // =====================================

  if(wantsCashflow){

    return window.t(
      `Il profitto netto stimato è di ${window.formatCurrency(profit)} annui.`,
      `Estimated annual net profit is ${window.formatCurrency(profit)}.`
    );

  }

  // =====================================
  // 🏙 CITY
  // =====================================

  if(
    text.includes("città") ||
    text.includes("city") ||
    text.includes(city)
  ){

    return window.t(
      `Stai analizzando il mercato di ${city}. I benchmark locali influenzano ROI e rischio.`,
      `You are analyzing the ${city} market. Local benchmarks affect ROI and risk.`
    );

  }

  // =====================================
  // 👑 PLAN UPSELL
  // =====================================

  if(access.isFree){

    return window.t(
      "Posso aiutarti a stimare il potenziale dell'investimento. Per analisi complete e rischio reale serve il piano Investor o PRO.",
      "I can help estimate the investment potential. Full analysis and real risk require Investor or PRO plans."
    );

  }

  if(access.isInvestor){

    return window.t(
      "Hai accesso all'analisi avanzata base. Il piano PRO sblocca AI insights completi, PDF executive e simulazioni avanzate.",
      "You have access to advanced analysis. PRO unlocks full AI insights, executive PDF and advanced simulations."
    );

  }

  // =====================================
// 🧠 STRATEGY INSIGHTS
// =====================================

if(wantsStrategy){

  let insightsIT = [];
  let insightsEN = [];

  // =================================
  // ROI
  // =================================

  if(roi >= 15){

    insightsIT.push(
      "📈 ROI molto elevato rispetto alla media mercato."
    );

    insightsEN.push(
      "📈 ROI significantly above market average."
    );

  }else if(roi >= 8){

    insightsIT.push(
      "📊 ROI potenzialmente sostenibile."
    );

    insightsEN.push(
      "📊 ROI appears potentially sustainable."
    );

  }else{

    insightsIT.push(
      "⚠️ ROI piuttosto basso."
    );

    insightsEN.push(
      "⚠️ ROI appears relatively low."
    );

  }

  // =================================
  // OCCUPANCY
  // =================================

  if(occupancy < 55){

    insightsIT.push(
      "🏨 Occupazione stimata piuttosto bassa."
    );

    insightsEN.push(
      "🏨 Estimated occupancy appears low."
    );

  }else if(occupancy >= 70){

    insightsIT.push(
      "🔥 Occupazione molto forte."
    );

    insightsEN.push(
      "🔥 Occupancy is very strong."
    );

  }

  // =================================
  // NIGHT PRICE
  // =================================

  if(nightly < 80){

    insightsIT.push(
      "🏷️ Prezzo notte relativamente basso."
    );

    insightsEN.push(
      "🏷️ Night price appears relatively low."
    );

  }else if(nightly > 180){

    insightsIT.push(
      "💎 Prezzo notte premium."
    );

    insightsEN.push(
      "💎 Premium nightly pricing detected."
    );

  }

  // =================================
  // COSTS
  // =================================

  if(monthlyCosts > 1500){

    insightsIT.push(
      "💸 Costi operativi elevati."
    );

    insightsEN.push(
      "💸 Operating costs appear high."
    );

  }

  // =================================
  // RISK
  // =================================

  if(risk >= 70){

    insightsIT.push(
      "⚠️ Il rischio operativo sembra elevato."
    );

    insightsEN.push(
      "⚠️ Operational risk appears high."
    );

  }

  // =================================
  // FINAL STRATEGY
  // =================================

  insightsIT.push(
    "💡 Analizza sempre cashflow reale e sostenibilità prima di investire."
  );

  insightsEN.push(
    "💡 Always analyze real cashflow and sustainability before investing."
  );

  return window.t(

    insightsIT.join("\n\n"),

    insightsEN.join("\n\n")

  );

}

  // =====================================
  // ✅ DEFAULT
  // =====================================

  return window.t(
    "Posso aiutarti ad analizzare ROI, rischio, cashflow e sostenibilità dell'investimento.",
    "I can help analyze ROI, risk, cashflow and investment sustainability."
  );

};
function initRBChatbot(){

  if(document.getElementById("rb-chatbot-wrapper")) return;

  const wrapper = document.createElement("div");

  wrapper.id = "rb-chatbot-wrapper";

  wrapper.innerHTML = `

  <div id="rb-chatbot-button">
    ✨
  </div>

  <div id="rb-chatbot-window">

    <div class="rb-chat-header">

      <div class="rb-chat-title">
        ${window.t(
          "AI Investment Assistant",
          "AI Investment Assistant"
        )}
      </div>

      <div class="rb-chat-subtitle">
        ${window.t(
          "Powered by RendimentoBB",
          "Powered by RendimentoBB"
        )}
      </div>

    </div>

    <div id="rb-chat-messages">

      <div class="rb-bot-message">

        ${window.t(
          "Ciao 👋 Posso aiutarti ad analizzare investimenti B&B.",
          "Hi 👋 I can help you analyze B&B investments."
        )}

      </div>

    </div>

    <div class="rb-chat-input-area">

      <input
        type="text"
        id="rb-chat-input"

        placeholder="${window.t(
          'Scrivi un messaggio...',
          'Write a message...'
        )}"
      >

      <button id="rb-chat-send">
        ➜
      </button>

    </div>

  </div>
  `;

  document.body.appendChild(wrapper);

  const button = document.getElementById("rb-chatbot-button");
  const chatWindow = document.getElementById("rb-chatbot-window");

  button.onclick = ()=>{
    chatWindow.classList.toggle("open");
  };

  const sendBtn = document.getElementById("rb-chat-send");
  const input = document.getElementById("rb-chat-input");

  function sendMessage(){

    const text = input.value.trim();

    if(!text) return;

    const messages = document.getElementById("rb-chat-messages");

    messages.innerHTML += `
      <div class="rb-user-message">
        ${text}
      </div>
    `;

    const response = window.generateAIResponse(text);

    messages.innerHTML += `
      <div class="rb-bot-message">
        ${response}
      </div>
    `;

    input.value = "";

    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn.onclick = sendMessage;

  input.addEventListener("keypress", e=>{
    if(e.key === "Enter"){
      sendMessage();
    }
  });

}
