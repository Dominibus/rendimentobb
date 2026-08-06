// ===============================================
// 🤖 RENDIMENTOBB – CHATBOT UI ENGINE 2.0
// Silicon Valley Conversational Interface
// Modular + AI Orchestrator Ready
// ===============================================

window.initRBChatbotUI = function(){

    const IS_DEVELOPMENT =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const debugLog = (...args) => {
    if (IS_DEVELOPMENT) {
      console.debug(...args);
    }
  };

  const reportRuntimeError = (context, error) => {
    console.error(context);

    if (IS_DEVELOPMENT && error) {
      console.error(error);
    }
  };

  if(
    document.getElementById(
      "rb-chatbot-wrapper"
    )
  ){

    debugLog("Chatbot wrapper already initialized");

    return;

  }

  debugLog("Chatbot UI initialization started");

  // ===========================================
  // 🌍 LANGUAGE
  // ===========================================

  const t = (it,en)=>

    window.t
      ? window.t(it,en)
      : it;

// ===========================================
// 🔐 EXECUTIVE SNAPSHOT ACCESS
// ===========================================

const canSeeFullSnapshot = ()=>{

  const access =

    window.getUserAccess?.() ||
    window.RB_USER ||
    {};

  return Boolean(

    access.canSeeFullAnalysis ||
    access.isInvestor ||
    access.isPro ||
    access.isAdmin

  );

};

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

    <div class="rb-chat-header-left">

        <div class="rb-ai-status">
            <span class="rb-status-dot"></span>
            Online
        </div>

        <div class="rb-chat-title">

            RendimentoBB AI

        </div>

        <div class="rb-chat-subtitle">

            Executive Investment Advisor

        </div>

    </div>

        <div
        class="rb-chat-header-actions"
        style="
            display:flex;
            align-items:center;
            gap:8px;
        "
    >

        <button
            type="button"
            class="rb-chat-close"
            id="rb-chat-new"
            title="${t(
                "Nuova chat",
                "New chat"
            )}"
            aria-label="${t(
                "Nuova chat",
                "New chat"
            )}"
        >
            ↻
        </button>

        <button
            type="button"
            class="rb-chat-close"
            id="rb-chat-close"
            title="${t(
                "Minimizza",
                "Minimize"
            )}"
            aria-label="${t(
                "Minimizza",
                "Minimize"
            )}"
        >
            ✕
        </button>

    </div>

</div>

<!-- ===================================
HOME
==================================== -->

<div id="rb-chat-home">

    <div class="rb-ai-home">

        <div class="rb-ai-home-header">

            <div class="rb-ai-status">

                <span class="rb-status-dot"></span>

                Online

            </div>

            <div class="rb-ai-home-title">

                🧠 RendimentoBB AI

            </div>

            <div class="rb-ai-home-subtitle">

                Executive Investment Advisor

            </div>

            ${
                window.rbChatMemory?.lastCity
                ?

                `

                <div class="rb-ai-snapshot">

                    <div class="rb-ai-snapshot-title">

                        📊 Executive Snapshot

                    </div>

                    <div class="rb-ai-snapshot-grid">

                        <div class="rb-ai-metric">

                            <span class="rb-ai-metric-label">
                                📍 Mercato
                            </span>

                            <strong>
                                ${window.rbChatMemory.lastCity.toUpperCase()}
                            </strong>

                        </div>

                        <div class="rb-ai-metric">

                            <span class="rb-ai-metric-label">
                                📈 ROI
                            </span>

                            <strong>

                                ${
    canSeeFullSnapshot() &&
    Number.isFinite(
        Number(window.rbChatMemory.lastROI)
    )
        ? Number(window.rbChatMemory.lastROI).toFixed(1) + "%"
        : "--"
}

                            </strong>

                        </div>

                        <div class="rb-ai-metric">

                            <span class="rb-ai-metric-label">
                                💰 Cashflow
                            </span>

                            <strong>

                                ${
    canSeeFullSnapshot() &&
    Number.isFinite(
        Number(window.rbChatMemory.lastCashflow)
    )
        ? "€" +
          Math.round(
              Number(window.rbChatMemory.lastCashflow)
          ).toLocaleString()
        : "--"
}

                            </strong>

                        </div>

                        <div class="rb-ai-metric">

                            <span class="rb-ai-metric-label">
                                ⚠️ Rischio
                            </span>

                            <strong>

                                ${
    canSeeFullSnapshot() &&
    Number.isFinite(
        Number(window.rbChatMemory.lastRisk)
    )
        ? Number(window.rbChatMemory.lastRisk)
        : "--"
}

                            </strong>

                        </div>

                    </div>

                </div>

                `

                :

                `

                <div class="rb-ai-empty-state">

                    <div class="rb-empty-icon">

                        🚀

                    </div>

                    <div class="rb-empty-title">

                        Nessuna simulazione disponibile

                    </div>

                    <div class="rb-empty-text">

                        Avvia una simulazione oppure carica un PDF per ottenere un'analisi AI completa.

                    </div>

                </div>

                `

            }

        </div>

<div class="rb-home-actions-header">

    <div class="rb-home-actions-title">

        ${
            window.rbChatMemory?.lastCity
                ? t(
                    "Continua l’analisi",
                    "Continue the analysis"
                  )
                : t(
                    "Come posso aiutarti?",
                    "How can I help?"
                  )
        }

    </div>

    <div class="rb-home-actions-context">

        ${
            window.rbChatMemory?.lastCity
                ? t(
                    "Contesto attivo: ",
                    "Active context: "
                  ) +
                  window.rbChatMemory.lastCity.toUpperCase()
                : t(
                    "Scegli da dove iniziare",
                    "Choose where to start"
                  )
        }

    </div>

</div>
        

        <div class="rb-ai-home-grid">

            <button class="rb-home-card">

                <div class="rb-home-icon">🏠</div>

                <div class="rb-home-title">

                    Analizza investimento

                </div>

                <div class="rb-home-desc">

                    ROI • Cashflow • Rischio

                </div>

            </button>

            <button class="rb-home-card">

                <div class="rb-home-icon">📄</div>

                <div class="rb-home-title">

                    Analizza PDF

                </div>

                <div class="rb-home-desc">

                    Executive Report

                </div>

            </button>

            <button class="rb-home-card">

                <div class="rb-home-icon">📊</div>

                <div class="rb-home-title">

                    Analizza ROI

                </div>

                <div class="rb-home-desc">

                    Performance investimento

                </div>

            </button>

            <button class="rb-home-card">

                <div class="rb-home-icon">🏦</div>

                <div class="rb-home-title">

                    Mutuo

                </div>

                <div class="rb-home-desc">

                    Leva • DSCR • LTV

                </div>

            </button>

            <button class="rb-home-card">

                <div class="rb-home-icon">🌍</div>

                <div class="rb-home-title">

                    Mercato

                </div>

                <div class="rb-home-desc">

                    Benchmark città

                </div>

            </button>

            <button class="rb-home-card">

                <div class="rb-home-icon">📈</div>

                <div class="rb-home-title">

                    Dashboard

                </div>

                <div class="rb-home-desc">

                    KPI e Report

                </div>

            </button>

        </div>

    </div>

</div>
<!-- ===================================
MESSAGES
==================================== -->

<div id="rb-chat-messages"></div>

    <!-- ===================================
    QUICK ACTIONS
    ==================================== -->

    <div
    class="rb-quick-actions"
    id="rb-quick-actions"
    style="display:none">

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

    <button
        id="rb-chat-attach"
        class="rb-chat-action-btn"
        title="Allega file">

        ＋

    </button>

    <button
        id="rb-chat-voice"
        class="rb-chat-action-btn"
        title="Parla">

        🎤

    </button>

    <input

        id="rb-chat-input"

        type="text"

        placeholder="${t(
            "Scrivi oppure parla...",
            "Write or speak..."
        )}"

    >

    <button
        id="rb-chat-send">

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

    const newChatBtn =
    document.getElementById(
      "rb-chat-new"
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

  const attachBtn =
    document.getElementById(
        "rb-chat-attach"
    );

const voiceBtn =
    document.getElementById(
        "rb-chat-voice"
    );

// ===========================================
// 🔄 REFRESH EXECUTIVE SNAPSHOT
// ===========================================

function refreshHomeSnapshot(){

        const context =
        typeof window.rbGetConversationContext === "function"
            ? window.rbGetConversationContext()
            : {};

    const memory =
        window.rbChatMemory || {};

    const analysis =
        window.lastAnalysisData || {};

    const city =
    analysis.realCity ??
    analysis.marketCity ??
    analysis.city ??
    context.city ??
    context.lastCity ??
    memory.lastCity;

const roi =
    analysis.realROI ??
    analysis.safeROI ??
    context.roi ??
    context.lastROI ??
    memory.lastROI;

const cashflow =
    analysis.cashflow ??
    analysis.net ??
    analysis.annualProfit ??
    context.cashflow ??
    context.lastCashflow ??
    memory.lastCashflow;

const risk =
    analysis.risk ??
    analysis.riskScore ??
    context.risk ??
    context.lastRisk ??
    memory.lastRisk;
  
        const hasSnapshot =
        Boolean(city) &&
        (
            Number.isFinite(Number(roi)) ||
            Number.isFinite(Number(cashflow)) ||
            Number.isFinite(Number(risk))
        );

    const homeHeader =
        document.querySelector(
            ".rb-ai-home .rb-ai-home-header"
        );

    if(
        hasSnapshot &&
        homeHeader
    ){

        const emptyState =
            homeHeader.querySelector(
                ".rb-ai-empty-state"
            );

        if(emptyState){

            emptyState.outerHTML = `

                <div class="rb-ai-snapshot">

                    <div class="rb-ai-snapshot-title">
                        📊 Executive Snapshot
                    </div>

                    <div class="rb-ai-snapshot-grid">

                        <div class="rb-ai-metric">

                            <span class="rb-ai-metric-label">
                                📍 Mercato
                            </span>

                            <strong>--</strong>

                        </div>

                        <div class="rb-ai-metric">

                            <span class="rb-ai-metric-label">
                                📈 ROI
                            </span>

                            <strong>--</strong>

                        </div>

                        <div class="rb-ai-metric">

                            <span class="rb-ai-metric-label">
                                💰 Cashflow
                            </span>

                            <strong>--</strong>

                        </div>

                        <div class="rb-ai-metric">

                            <span class="rb-ai-metric-label">
                                ⚠️ Rischio
                            </span>

                            <strong>--</strong>

                        </div>

                    </div>

                </div>

            `;

        }

    }

    const metrics =
        document.querySelectorAll(
            ".rb-ai-home .rb-ai-metric strong"
        );

    if(metrics.length < 4){

        return;

    }

    metrics[0].textContent =
        city
            ? String(city).toUpperCase()
            : "--";

const fullSnapshotAllowed =
    canSeeFullSnapshot();

metrics[1].textContent =
    fullSnapshotAllowed &&
    Number.isFinite(Number(roi))
        ? Number(roi).toFixed(1) + "%"
        : "--";

metrics[2].textContent =
    fullSnapshotAllowed &&
    Number.isFinite(Number(cashflow))
        ? "€" +
          Math.round(Number(cashflow))
            .toLocaleString(
                window.currentLanguage === "en"
                    ? "en-US"
                    : "it-IT"
            )
        : "--";

metrics[3].textContent =
    fullSnapshotAllowed &&
    Number.isFinite(Number(risk))
        ? String(Number(risk))
        : "--";

    const contextLabel =
      document.querySelector(
        ".rb-ai-home .rb-home-actions-context"
    );

    if(contextLabel){

        contextLabel.textContent =
            city
                ? t(
                    "Contesto attivo: ",
                    "Active context: "
                  ) + String(city).toUpperCase()
                : t(
                    "Scegli da dove iniziare",
                    "Choose where to start"
                  );

    }

}  

// ===========================================
// 📊 AUTO REFRESH AFTER NEW ANALYSIS
// ===========================================

document.addEventListener(
    "rb:executive_report_created",
    () => {

        refreshHomeSnapshot();

    }
);  

// ===========================================
// 🎤 SPEECH RECOGNITION
// ===========================================

const SpeechRecognition =

    window.SpeechRecognition ||

    window.webkitSpeechRecognition;

let recognition = null;

let isListening = false;

if(SpeechRecognition){

    recognition = new SpeechRecognition();

    recognition.lang =
        window.currentLanguage === "en"
            ? "en-US"
            : "it-IT";

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;

    recognition.continuous = false;

}

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

      refreshHomeSnapshot();

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

newChatBtn.onclick = ()=>{

    // =======================================
    // 🧹 CLEAR SAVED CONVERSATION
    // =======================================

    if(window.rbChatMemory){

        window.rbChatMemory.messages = [];

        localStorage.setItem(
  "rbChatMemory",
  JSON.stringify(
    window.rbChatMemory
  )
);

    }

    refreshHomeSnapshot();

    const home =
        document.getElementById(
            "rb-chat-home"
        );

    const quick =
        document.getElementById(
            "rb-quick-actions"
        );

    messages.innerHTML = "";

    input.value = "";

    messages.style.display = "none";

    if(home){

        home.style.display = "block";

    }

    if(quick){

        quick.style.display = "none";

    }

    input.focus();

};

  function renderExecutiveMessage(text){

    if(!text){

        return "";

    }

    let html = String(text);

    html = html.replace(

        /Investment Score:?/gi,

        `<div class="rb-section-title">
            📊 Investment Score
        </div>`

    );

    html = html.replace(

        /Executive Summary:?/gi,

        `<div class="rb-section-title">
            🧠 Executive Summary
        </div>`

    );

    html = html.replace(

        /Strategic Priorities:?/gi,

        `<div class="rb-section-title">
            🎯 Strategic Priorities
        </div>`

    );

    html = html.replace(

        /AI Decision:?/gi,

        `<div class="rb-section-title">
            ✅ AI Decision
        </div>`

    );

    return html.replace(/\n/g,"<br>");

}

  // ===========================================
  // 💬 ADD MESSAGE
  // ===========================================

    function addMessage(
    role,
    text,
    persist = true
  ){

    const div =
      document.createElement("div");

    div.className =

    role === "user"

    ? "rb-user-message"

    : "rb-bot-message";

if(role === "bot"){

    div.innerHTML = `

        <div class="rb-ai-card-header">

            <div class="rb-ai-card-avatar">

                🧠

            </div>

            <div class="rb-ai-card-info">

                <div class="rb-ai-card-title">

                    RendimentoBB AI Executive

                </div>

                <div class="rb-ai-card-status">

                    <span class="rb-status-dot"></span>

                    Online

                </div>

            </div>

        </div>

        <div class="rb-ai-card-content">

            ${
                renderExecutiveMessage(text)
            }

        </div>

    `;

}else{

    div.innerHTML =

        String(text || "")
            .replace(/\n/g,"<br>");

}

    messages.appendChild(div);

    messages.scrollTop =
      messages.scrollHeight;

    // =======================================
    // 💾 SAVE BOT MESSAGE
    // =======================================

    if(
      persist &&
      role === "bot" &&
      typeof window.rbRememberMessage === "function"
    ){

      window.rbRememberMessage({

        role: "bot",

        message:
          String(text || "")

      });

    }

  }

// ===========================================
// 🧠 AI THINKING
// ===========================================

function showThinking(){

    const div =
        document.createElement("div");

    div.className =
        "rb-bot-message rb-thinking";

    div.id =
        "rb-thinking";

    div.innerHTML = "🧠 Analizzo la richiesta...";

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;

    const steps = [

        "🧠 Analizzo la richiesta...",

        "📊 Elaboro i dati...",

        "⚖️ Valuto l'investimento...",

        "🎯 Genero la risposta..."

    ];

    let i = 0;

    const interval = setInterval(()=>{

        i++;

        if(
            i < steps.length &&
            div
        ){

            div.innerHTML =
                steps[i];

        }

    },350);

    return{

        element: div,

        interval

    };

}

  window.addMessage =
    addMessage;

  // ===========================================
  // 💬 RESTORE SAVED CONVERSATION
  // ===========================================

  const savedMessages =
    Array.isArray(window.rbChatMemory?.messages)
      ? window.rbChatMemory.messages
      : [];

  if(savedMessages.length){

    const home =
      document.getElementById(
        "rb-chat-home"
      );

    const quick =
      document.getElementById(
        "rb-quick-actions"
      );

    messages.innerHTML = "";

    savedMessages.forEach(item => {

      const role =
        item?.role === "bot"
          ? "bot"
          : item?.role === "user"
            ? "user"
            : null;

      const text =
        item?.message ??
        item?.text ??
        "";

      if(
        role &&
        String(text).trim()
      ){

        addMessage(
          role,
          text,
          false
        );

      }

    });

    if(messages.children.length){

      if(home){

        home.style.display = "none";

      }

      messages.style.display = "block";

      if(quick){

        quick.style.display = "flex";

      }

      messages.scrollTop =
        messages.scrollHeight;

    }

  }

  // ===========================================
  // 🔄 SYNC CONVERSATION BETWEEN TABS
  // ===========================================

  window.addEventListener(
    "storage",
    event => {

      if(
        event.key !== "rbChatMemory" ||
        !event.newValue
      ){

        return;

      }

      try{

        const updatedMemory =
          JSON.parse(event.newValue);

        const updatedMessages =
          Array.isArray(updatedMemory?.messages)
            ? updatedMemory.messages
            : [];

        window.rbChatMemory =
          updatedMemory;

        const home =
          document.getElementById(
            "rb-chat-home"
          );

        const quick =
          document.getElementById(
            "rb-quick-actions"
          );

        messages.innerHTML = "";

        updatedMessages.forEach(item => {

          const role =
            item?.role === "bot"
              ? "bot"
              : item?.role === "user"
                ? "user"
                : null;

          const text =
            item?.message ??
            item?.text ??
            "";

          if(
            role &&
            String(text).trim()
          ){

            addMessage(
              role,
              text,
              false
            );

          }

        });

        if(updatedMessages.length){

          if(home){

            home.style.display = "none";

          }

          messages.style.display = "block";

          if(quick){

            quick.style.display = "flex";

          }

          messages.scrollTop =
            messages.scrollHeight;

        }else{

          messages.style.display = "none";

          if(home){

            home.style.display = "block";

          }

          if(quick){

            quick.style.display = "none";

          }

        }

      }catch(error){

        reportRuntimeError(
  "Chat synchronization unavailable",
  error
);

      }

    }
  );
  

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

      debugLog(
  "Free message count",
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


    const home =
    document.getElementById(
        "rb-chat-home"
    );

if(home){

    home.style.display = "none";

}

messages.style.display = "block";    

    const quick =
    document.getElementById(
        "rb-quick-actions"
    );

if(quick){

    quick.style.display = "flex";

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

      const thinking =
    showThinking();

// =====================================
// PROCESS MESSAGE
// =====================================

debugLog("Chatbot request started");

const result =
  await window.rbProcessAIMessage(
    text
  );

// =====================================
// SAFE DATA
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

debugLog("Chatbot response processed");
      
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

debugLog(
  "Chatbot UI response ready",
  response?.type || "unknown"
);

      // =====================================
      // 💬 BOT MESSAGE
      // =====================================

 setTimeout(()=>{

    clearInterval(
        thinking.interval
    );

    thinking.element.remove();

    addMessage(
        "bot",
        finalText
    );

    addSuggestions(
        finalSuggestions
    );

},400);

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

      debugLog("Chatbot request completed");

    }

    catch(error){

      reportRuntimeError(
  "Chatbot temporarily unavailable",
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

  attachBtn.onclick = ()=>{

    debugLog("Chatbot attachment action");

    window.rbChatAttachments.open();

};

voiceBtn.onclick = ()=>{

    if(!recognition){

        alert(
            "Speech Recognition non supportato da questo browser."
        );

        return;

    }

    if(isListening){

        recognition.stop();

        return;

    }

    recognition.start();

};

recognition.onstart = ()=>{

    isListening = true;

    voiceBtn.textContent = "🔴";

};

recognition.onend = ()=>{

    isListening = false;

    voiceBtn.textContent = "🎤";

};

recognition.onresult = (event)=>{

    const transcript =

        Array.from(event.results)

            .map(r=>r[0].transcript)

            .join("");

    input.value = transcript;

    if(event.results[0].isFinal){

        sendMessage();

    }

};

recognition.onerror = ()=>{

    isListening = false;

    voiceBtn.textContent = "🎤";

};  

  debugLog("Chatbot send action initialized");

  input.addEventListener(
    "keypress",
    e=>{

      debugLog("Chatbot keyboard submission");

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
// 🏠 HOME ACTIONS
// ===========================================

const homeCards = document.querySelectorAll(".rb-home-card");

const homePrompts = [

    t(
        "Analizza questo investimento",
        "Analyze this investment"
    ),

    t(
        "Analizza il PDF",
        "Analyze the PDF"
    ),

    t(
        "Analizza il ROI della simulazione",
        "Analyze the simulation ROI"
    ),

    t(
        "Analizza la sostenibilità del mutuo",
        "Analyze the mortgage sustainability"
    ),

    t(
        "Analizza il mercato della città corrente",
        "Analyze the current city market"
    ),

    t(
        "Analizza la dashboard",
        "Analyze the dashboard"
    )

];

homeCards.forEach((card,index)=>{

    card.onclick = ()=>{

        input.value = homePrompts[index];

        sendMessage();

    };

});
  
// ===========================================
// 📄 DOCUMENT UPLOADED EVENT
// ===========================================

window.addEventListener(

    "rb-document-uploaded",

    (event)=>{

        const file = event.detail;

        const home =
            document.getElementById(
                "rb-chat-home"
            );

        if(home){

            home.style.display = "none";

        }

        messages.style.display = "block";

        const quick =
            document.getElementById(
                "rb-quick-actions"
            );

        if(quick){

            quick.style.display = "flex";

        }

        addMessage(

            "bot",

`📄 Documento ricevuto

<b>${file.fileName}</b>

🧠 Sto analizzando il contenuto...`

        );

    }

);


// ===========================================
// 🧠 DOCUMENT READY
// ===========================================

document.addEventListener(

    "rb:document_ready",

    async(event)=>{

        const doc = event.detail;

        if(!doc){

            return;

        }

        debugLog("Document ready for analysis");

        addMessage(

            "bot",

`🧠 Documento classificato

📄 ${doc.subtype}

🎯 Confidence: ${doc.confidence}%`

        );

        if(

            typeof window.rbProcessAIMessage ===
            "function"

        ){

            const prompt =

`Analizza automaticamente il documento appena caricato.

Tipo documento:
${doc.subtype}

Nome file:
${doc.fileName}

Fornisci un Executive Summary.`;

            const result =
                await window.rbProcessAIMessage(
                    prompt
                );

            const response =

                Array.isArray(result?.response)

                    ? result.response[0]

                    : result?.response;

            addMessage(

                "bot",

                response?.textIT ||

                response?.text ||

                "Analisi completata."

            );

        }

    }

);
  
  
  // ===========================================
  // 🚀 READY
  // ===========================================

  debugLog("Chatbot UI ready");

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
