// ===============================================
// 🤖 RENDIMENTOBB – CHATBOT UI ENGINE 2.0
// Silicon Valley Conversational Interface
// Modular + AI Orchestrator Ready
// ===============================================

window.initRBChatbotUI = function(){

  if(
    document.getElementById(
      "rb-chatbot-wrapper"
    )
  ){

    console.log(
      "🔥 WRAPPER ALREADY EXISTS"
    );

    return;

  }

  console.log(
    "🔥 INIT CHATBOT UI"
  );

  // ===========================================
  // 🌍 LANGUAGE
  // ===========================================

  const t = (it,en)=>

    window.t
      ? window.t(it,en)
      : it;

  // ===========================================
  // 🧱 WRAPPER
  // ===========================================

  const wrapper =
    document.createElement("div");

  wrapper.id =
    "rb-chatbot-wrapper";

  // ===========================================
  // 💬 TEMPLATE
  // ===========================================

  wrapper.innerHTML = `

  <div id="rb-chatbot-button">

    ✨

  </div>

  <div id="rb-chatbot-window">

    <!-- ===================================
    HEADER
    ==================================== -->

    <div class="rb-chat-header">

      <div>

        <div class="rb-chat-title">

          ${t(
            "AI Investment Assistant",
            "AI Investment Assistant"
          )}

        </div>

        <div class="rb-chat-subtitle">

          ${t(
            "Powered by RendimentoBB AI",
            "Powered by RendimentoBB AI"
          )}

        </div>

      </div>

      <div
        class="rb-chat-close"
        id="rb-chat-close"
      >

        ✕

      </div>

    </div>

    <!-- ===================================
    MESSAGES
    ==================================== -->

    <div id="rb-chat-messages">

      <div class="rb-bot-message">

        ${t(

`👋 Ciao.

Posso aiutarti ad analizzare:

• ROI
• cashflow
• rischio
• mutui
• sostenibilità
• benchmark short-rent`,

`👋 Hi.

I can help analyze:

• ROI
• cashflow
• risk
• mortgages
• sustainability
• short-rent benchmarks`

        )}

      </div>

    </div>

    <!-- ===================================
    QUICK ACTIONS
    ==================================== -->

    <div class="rb-quick-actions">

      <button class="rb-quick-btn">
        ROI
      </button>

      <button class="rb-quick-btn">
        Cashflow
      </button>

      <button class="rb-quick-btn">
        ${t("Rischio","Risk")}
      </button>

      <button class="rb-quick-btn">
        ${t("Conviene?","Worth it?")}
      </button>

    </div>

    <!-- ===================================
    INPUT
    ==================================== -->

    <div class="rb-chat-input-area">

      <input

        id="rb-chat-input"

        type="text"

        placeholder="${t(
          "Scrivi un messaggio...",
          "Write a message..."
        )}"

      >

      <button id="rb-chat-send">

        ➜

      </button>

    </div>

  </div>

  `;

  // ===========================================
  // 🚀 APPEND
  // ===========================================

  document.body.appendChild(
    wrapper
  );

  // ===========================================
  // 🎯 ELEMENTS
  // ===========================================

  const button =
    document.getElementById(
      "rb-chatbot-button"
    );

  const windowEl =
    document.getElementById(
      "rb-chatbot-window"
    );

  const closeBtn =
    document.getElementById(
      "rb-chat-close"
    );

  const sendBtn =
    document.getElementById(
      "rb-chat-send"
    );

  const input =
    document.getElementById(
      "rb-chat-input"
    );

  const messages =
    document.getElementById(
      "rb-chat-messages"
    );

  // ===========================================
  // 🔥 AUTO OPEN TOOL PAGE
  // ===========================================

  const isToolPage =

    window.location.pathname
      .includes("/tool");

  const isMobile =

    window.innerWidth <= 768;

  if(
    isToolPage &&
    !isMobile
  ){

    windowEl.classList.add(
      "open"
    );

  }

  // ===========================================
  // 🔄 TOGGLE
  // ===========================================

  window.toggleRBChatbot =
    function(){

      windowEl
        .classList
        .toggle("open");

    };

  button.onclick =
    window.toggleRBChatbot;

  closeBtn.onclick = ()=>{

    windowEl.classList.remove(
      "open"
    );

  };

  // ===========================================
  // 💬 ADD MESSAGE
  // ===========================================

  function addMessage(
    role,
    text
  ){

    const div =
      document.createElement("div");

    div.className =

      role === "user"

      ? "rb-user-message"

      : "rb-bot-message";

    div.innerHTML =

      String(text || "")
        .replace(/\n/g,"<br>");

    messages.appendChild(div);

    messages.scrollTop =
      messages.scrollHeight;

  }

  // ===========================================
  // 💡 CONTEXTUAL SUGGESTIONS
  // ===========================================

  function addSuggestions(items = []){

    if(
      !Array.isArray(items) ||
      !items.length
    ){

      return;

    }

    const container =
      document.createElement("div");

    container.className =
      "rb-quick-actions rb-context-actions";

    items
      .slice(0, 3)
      .forEach(label => {

        const suggestionButton =
          document.createElement("button");

        suggestionButton.type =
          "button";

        suggestionButton.className =
          "rb-quick-btn";

        suggestionButton.textContent =
          label;

        suggestionButton.onclick = ()=>{

          input.value =
            label;

          sendMessage();

        };

        container.appendChild(
          suggestionButton
        );

      });

    messages.appendChild(
      container
    );

    messages.scrollTop =
      messages.scrollHeight;

  }

  // ===========================================
  // ⌨ SEND MESSAGE
  // ===========================================

  async function sendMessage(){

    const text =
      input.value.trim();

    // ========================================
    // 🔒 FREE MESSAGE LIMIT
    // ========================================

    window.rbMessageCount =
      window.rbMessageCount || 0;

    const isPro =
      window.RB_USER?.isPro;

    const isAdmin =
      window.RB_USER?.isAdmin;

    const isInvestor =
      window.RB_USER?.isInvestor;

    const isPaid =
      isPro || isAdmin || isInvestor;

    if(!isPaid){

      window.rbMessageCount++;

      console.log(
        "💬 FREE MESSAGE:",
        window.rbMessageCount
      );

      if(window.rbMessageCount > 10){

        addMessage(

          "bot",

          t(
            "🔒 Hai raggiunto il limite gratuito. Passa a Investor o PRO per continuare.",
            "🔒 You reached the free limit. Upgrade to Investor or PRO to continue."
          )

        );

        return;

      }

    }

    if(!text){

      return;

    }

    // =======================================
    // 💬 USER MESSAGE
    // =======================================

    addMessage(
      "user",
      text
    );

    // =======================================
    // 🧹 RESET INPUT
    // =======================================

    input.value = "";

    // =======================================
    // 🧠 FALLBACK CHECK
    // =======================================

    if(
      !window.rbProcessAIMessage
    ){

      addMessage(

        "bot",

        t(
          "⚠️ AI Engine non disponibile.",
          "⚠️ AI Engine unavailable."
        )

      );

      return;

    }

    try{

      // =====================================
      // 🧠 PROCESS AI MESSAGE
      // =====================================

      console.log(
  "🚀 SEND MESSAGE:",
  text
);

console.log(
  "🚀 CALL ORCHESTRATOR"
);

const result =

  await window.rbProcessAIMessage(
    text
  );

console.log(
  "🚀 ORCHESTRATOR RESULT:",
  result
);

console.log(
  "🧠 RAW AI RESULT:",
  result
);

// =====================================
// 🧠 SAFE DATA
// =====================================

const rawResponse =

  Array.isArray(result?.response)

    ? result.response[0]

    : result?.response || {};

const response = rawResponse;

const entities =
  result?.entities || {};

const intent =
  result?.intent || {};

console.log(
  "🧠 RAW RESPONSE:",
  rawResponse
);

console.log(
  "🧠 RESPONSE OBJECT:",
  response
);

console.log(
  "🧠 TEXT IT:",
  response?.textIT
);

console.log(
  "🧠 TEXT EN:",
  response?.textEN
);
      
      // =====================================
      // 🌍 LANGUAGE
      // =====================================

      const currentLang =

        window.currentLang ||

        window.RB_LANG ||

        document.documentElement.lang ||

        "it";

      const finalText =

        currentLang === "en"

        ? (

            response.textEN ||

            response.textIT ||

            response.text ||

            response.message ||

            "AI response unavailable."

          )

        : (

            response.textIT ||

            response.textEN ||

            response.text ||

            response.message ||

            "Risposta AI non disponibile."

          );

            const finalSuggestions =

        currentLang === "en"

        ? (
            response.suggestionsEN ||
            []
          )

        : (
            response.suggestionsIT ||
            []
          );

      console.log(
  "🔥 FINAL TEXT TO UI:",
  finalText
);

console.log(
  "🔥 RESPONSE TYPE:",
  response?.type
);

console.log(
  "🔥 RESPONSE OBJECT FULL:",
  response
);

      // =====================================
      // 💬 BOT MESSAGE
      // =====================================

            setTimeout(()=>{

        addMessage(
          "bot",
          finalText
        );

        addSuggestions(
          finalSuggestions
        );

      }, 400);

      // =====================================
      // 💾 MEMORY SAVE
      // =====================================

      if(window.rbSaveMemory){

        window.rbSaveMemory({

          lastMessage: text,

          lastIntent:
            intent.intent || null,

          lastCity:
            entities.city || null,

          timestamp:
            Date.now()

        });

      }

      // =====================================
      // 🧠 DEBUG
      // =====================================

      console.log(
        "🧠 CHATBOT RESULT:",
        result
      );

    }

    catch(error){

      console.error(
        "❌ CHATBOT UI ERROR:",
        error
      );

      addMessage(

        "bot",

        t(

          "⚠️ Errore AI temporaneo.",

          "⚠️ Temporary AI error."

        )

      );

    }

  }

  // ===========================================
  // 🚀 EVENTS
  // ===========================================

  sendBtn.onclick =
    sendMessage;

  console.log(
  "🔥 SEND BUTTON BOUND"
);

  input.addEventListener(
    "keypress",
    e=>{

      console.log(
  "🔥 ENTER PRESSED"
);

      if(e.key === "Enter"){

        sendMessage();

      }

    }
  );

  // ===========================================
  // ⚡ QUICK ACTIONS
  // ===========================================

  document
    .querySelectorAll(
      ".rb-quick-btn"
    )
    .forEach(btn=>{

      btn.onclick = ()=>{

        input.value =
          btn.innerText;

        sendMessage();

      };

    });

  // ===========================================
  // 🚀 READY
  // ===========================================

  console.log(
    "🤖 CHATBOT UI READY"
  );

};

// ===============================================
// 🚀 AUTO INIT
// ===============================================

document.addEventListener(
  "DOMContentLoaded",
  ()=>{

    window.initRBChatbotUI?.();

  }
);
