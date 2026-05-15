// ===============================================
// 🤖 RENDIMENTOBB – CHATBOT UI ENGINE 1.0
// Silicon Valley Conversational Interface
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

  function sendMessage(){

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
    // 🧠 ENTITY EXTRACTION
    // =======================================

    const entities =

      window.rbExtractEntities
        ? window.rbExtractEntities(text)
        : {};

    // =======================================
    // 🧠 INTENT DETECTION
    // =======================================

    const intent =

      window.rbDetectIntent
        ? window.rbDetectIntent(text)
        : {};

    // =======================================
    // 🧠 MEMORY
    // =======================================

    const memory =

      window.rbGetMemory
        ? window.rbGetMemory()
        : {};

    // =======================================
    // 🧠 RESPONSE
    // =======================================

    const response =

      window.rbGenerateResponse({

        message: text,

        entities,

        intent,

        memory,

        analysisData:
          window.lastAnalysisData || {}

      });

    // =======================================
    // 🌍 LANGUAGE
    // =======================================

    const finalText =

      window.currentLang === "en"

      ? response.textEN

      : response.textIT;

    // =======================================
    // 💬 BOT MESSAGE
    // =======================================

    setTimeout(()=>{

      addMessage(
        "bot",
        finalText
      );

    }, 500);

    // =======================================
    // 💾 MEMORY SAVE
    // =======================================

    if(window.rbSaveMemory){

      window.rbSaveMemory({

        lastMessage: text,

        lastIntent:
          intent.intent || null,

        lastCity:
          entities.city || null

      });

    }

    // =======================================
    // 🧹 RESET
    // =======================================

    input.value = "";

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
