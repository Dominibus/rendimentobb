// ===============================================
// 🤖 RENDIMENTOBB – CHATBOT UI ENGINE 2.0
// Silicon Valley Conversational Interface
// Modular + AI Orchestrator Ready
// ===============================================

window.initRBChatbotUI = function(){

  // ===========================================
  // 🛡 PREVENT DUPLICATE
  // ===========================================

  if(
    document.getElementById(
      "rb-chatbot-wrapper"
    )
  ){

    return;

  }

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
  // ⌨ SEND MESSAGE
  // ===========================================

  async function sendMessage(){

    const text =
      input.value.trim();

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

      const result =

        await window.rbProcessAIMessage(
          text
        );

      console.log(
      "🧠 RAW AI RESULT:",
      result
      );

      // =====================================
      // 🧠 SAFE DATA
      // =====================================

      const response =
        result?.response || {};

      const entities =
        result?.entities || {};

      const intent =
        result?.intent || {};

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

      const finalText =

        window.currentLang === "en"

        ? (
            response.textEN ||

            "AI response unavailable."
          )

        : (
            response.textIT ||

            "Risposta AI non disponibile."
          );

      // =====================================
      // 💬 BOT MESSAGE
      // =====================================

      setTimeout(()=>{

        addMessage(
          "bot",
          finalText
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

  input.addEventListener(
    "keypress",
    e=>{

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
