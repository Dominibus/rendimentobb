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
// 🧠 EDUCATIONAL DETECTION
// =====================================

const educationalTriggers = [

  "cos'è",
  "cosa è",
  "cosa vuol dire",
  "significa",
  "spiegami",
  "definizione",
  "what is",
  "meaning",
  "explain"

];

const wantsEducation =
  educationalTriggers.some(trigger =>
    text.includes(trigger)
  );

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

if(
  text.includes("roi") ||
  text.includes("rendimento") ||
  text.includes("profit")
){

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

  if(
    text.includes("rischio") ||
    text.includes("risk")
  ){

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

  if(
    text.includes("cashflow") ||
    text.includes("profitto") ||
    text.includes("guadagno")
  ){

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
