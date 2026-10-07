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
    (window.currentLang || window.RB_LANG?.current || "it") === "en"
      ? (en || it)
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
            ${t("Pronto", "Ready")}
        </div>

        <div class="rb-chat-title">

            RendimentoBB AI

        </div>

        <div class="rb-chat-subtitle">

            ${t("Assistente per analisi e gestione", "Analysis and management assistant")}
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

                ${t("Pronto", "Ready")}
            </div>

            <div class="rb-ai-home-title">

                🧠 RendimentoBB AI

            </div>

            <div class="rb-ai-home-subtitle">

                ${t("Assistente per analisi e gestione", "Analysis and management assistant")}
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
                                📍 ${t("Mercato","Market")}
                            </span>

                            <strong>
                                ${window.rbChatMemory.lastCity.toUpperCase()}
                            </strong>

                        </div>

                        <div class="rb-ai-metric">

                            <span class="rb-ai-metric-label">
                                📈 ${window.currentLang === "en" ? "Property ROI" : "ROI immobile"}
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
                                ⚠️ ${t("Rischio","Risk")}
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

                        ${t("Partiamo dai tuoi dati", "Start with your data")}

                    </div>

                    <div class="rb-empty-text">

                        ${t("Apri una simulazione o allega un PDF con testo. Ti aiuto a leggere i dati disponibili.", "Open a simulation or attach a text PDF. I can help interpret the available data.")}

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
        title="${t("Allega file", "Attach file")}" aria-label="${t("Allega file", "Attach file")}">

        ＋

    </button>

    <button
        id="rb-chat-voice"
        class="rb-chat-action-btn"
        title="${t("Parla", "Speak")}" aria-label="${t("Parla", "Speak")}">

        🎤

    </button>

    <input

        id="rb-chat-input"

        type="text" aria-label="${t("Messaggio", "Message")}"

        placeholder="${t(
            "Scrivi oppure parla...",
            "Write or speak..."
        )}"

    >

    <button
        id="rb-chat-send" aria-label="${t("Invia messaggio", "Send message")}">

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
// DESKTOP WINDOW DRAG
// ===========================================

function initChatWindowDrag(){

    const header =
        windowEl.querySelector(
            ".rb-chat-header"
        );

    if(!header){
        return;
    }

    let activePointerId = null;
    let offsetX = 0;
    let offsetY = 0;

    const moveWindow = event => {

        if(
            activePointerId === null ||
            event.pointerId !== activePointerId
        ){
            return;
        }

        const maxLeft =
            Math.max(
                0,
                window.innerWidth - windowEl.offsetWidth
            );

        const maxTop =
            Math.max(
                0,
                window.innerHeight - windowEl.offsetHeight
            );

        const left =
            Math.min(
                maxLeft,
                Math.max(0, event.clientX - offsetX)
            );

        const top =
            Math.min(
                maxTop,
                Math.max(0, event.clientY - offsetY)
            );

        windowEl.style.left = left + "px";
        windowEl.style.top = top + "px";

    };

    const stopDrag = event => {

        if(
            activePointerId === null ||
            event.pointerId !== activePointerId
        ){
            return;
        }

        if(header.hasPointerCapture(activePointerId)){
            header.releasePointerCapture(activePointerId);
        }

        activePointerId = null;
        windowEl.classList.remove("rb-chat-dragging");

    };

    header.addEventListener(
        "pointerdown",
        event => {

            if(
                window.innerWidth <= 768 ||
                event.button !== 0 ||
                event.target.closest("button, a, input")
            ){
                return;
            }

            const rect =
                windowEl.getBoundingClientRect();

            activePointerId = event.pointerId;
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;

            windowEl.style.left = rect.left + "px";
            windowEl.style.top = rect.top + "px";
            windowEl.style.right = "auto";
            windowEl.style.bottom = "auto";

            windowEl.classList.add("rb-chat-dragging");
            header.setPointerCapture(activePointerId);

            event.preventDefault();

        }
    );

    header.addEventListener(
        "pointermove",
        moveWindow
    );

    header.addEventListener(
        "pointerup",
        stopDrag
    );

    header.addEventListener(
        "pointercancel",
        stopDrag
    );

}

initChatWindowDrag();

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
                                📍 ${t("Mercato","Market")}
                            </span>

                            <strong>--</strong>

                        </div>

                        <div class="rb-ai-metric">

                            <span class="rb-ai-metric-label">
                                📈 ${window.currentLang === "en" ? "Property ROI" : "ROI immobile"}
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
                                ⚠️ ${t("Rischio","Risk")}
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
                window.currentLang === "en"
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
        window.currentLang === "en"
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

    window.rbClearMemory?.();

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

  function escapeMessageText(value){
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[char]));
  }

  function renderExecutiveMessage(text){
    if(!text) return "";
    // Shared safe formatting for document, live, support and PMS responses.
    const inline = line => escapeMessageText(line).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
    const paragraphs = String(text).replace(/\r\n/g,"\n").split(/\n\s*\n+/);
    return paragraphs.map(paragraph => {
      const lines=paragraph.split("\n").map(line=>line.trim()).filter(Boolean);
      return lines.map(line=>{
        if(/^(Fonte|Source):/.test(line)) return `<div class="rb-message-source">${inline(line)}</div>`;
        const plain=line.replace(/^#{1,3}\s*/,"").replace(/^\*\*|\*\*$/g,"");
        const heading=/^(?:[📊🧠🎯✅]\s*)?(?:Investment Score|Executive Summary|Strategic Priorities|AI Decision|Interpretazione del report|Interpretation of the report|Dati riconosciuti nel PDF|Recognized PDF data):?$/i.test(plain);
        if(heading || /^#{1,3}\s/.test(line)) return `<div class="rb-section-title">${inline(plain.replace(/^[📊🧠🎯✅]\s*/,""))}</div>`;
        return `<div class="rb-message-line">${inline(line)}</div>`;
      }).join("");
    }).map(html=>`<div class="rb-message-paragraph">${html}</div>`).join("");
  }

  function refreshQuickActions(){
    const active = window.rbDocumentManager?.getLast?.();
    const pdfFocus = active && window.rbPDFConversationDocumentId === active.id;
    const labels = pdfFocus
      ? [t("ROI del PDF","PDF ROI"),t("Cashflow del PDF","PDF cash flow"),t("Rischio del PDF","PDF risk"),t("Interpreta PDF","Interpret PDF")]
      : ["ROI","Cashflow",t("Rischio","Risk"),t("Conviene?","Worth it?")];
    document.querySelectorAll("#rb-quick-actions .rb-quick-btn").forEach((button,index)=>{
      button.textContent=labels[index] || "";
    });
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

// One renderer for every assistant response: no legacy executive card.
    if(role === "user"){
        div.innerHTML = escapeMessageText(text).replace(/\n/g,"<br>");
    }else{
        div.innerHTML = renderExecutiveMessage(text);
    }
    const home = document.getElementById("rb-chat-home");
    if(home) home.style.display = "none";
    messages.style.display = "block";
    const quick = document.getElementById("rb-quick-actions");
    if(quick) quick.style.display = "flex";

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

    div.textContent = t("Leggo la richiesta e i dati disponibili…", "Reading your request and available data…");

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;

    const steps = [
        t("Leggo la richiesta e i dati disponibili…", "Reading your request and available data…"),
        t("Preparo la risposta…", "Preparing the response…")
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

  window.addEventListener("rb_chat_context_changed", () => {
    messages.innerHTML = "";
    const history = window.rbChatMemory?.messages || [];
    history.forEach(item => { if(["user","bot","assistant"].includes(item.role)) addMessage(item.role, item.message, false); });
    const home = document.getElementById("rb-chat-home");
    if(home) home.style.display = history.length ? "none" : "block";
    messages.style.display = history.length ? "block" : "none";
    const quick = document.getElementById("rb-quick-actions");
    if(quick) quick.style.display = history.length ? "flex" : "none";
    refreshHomeSnapshot();
    refreshQuickActions();
  });

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
  // ⚡ COPILOT ACTIONS
  // ===========================================

  function addResponseActions(items = [], language = "it"){

    if(!Array.isArray(items) || !items.length){
      return;
    }

    const container =
      document.createElement("div");

    container.className =
      "rb-quick-actions rb-context-actions";

    items
      .slice(0, 5)
      .forEach(action => {

        if(
          ![
            "open_investment_section",
            "open_booking",
            "open_pms_task",
            "open_pms_checklist",
            "open_pms_arrival",
            "open_pms_all_tasks",
            "manage_arrival",
            "manage_departure"
          ].includes(action?.type) ||
          (!action.bookingId && !["open_pms_checklist","open_pms_all_tasks","open_investment_section"].includes(action.type))
        ){
          return;
        }

        const actionButton =
          document.createElement("button");

        actionButton.type = "button";
        actionButton.className = "rb-quick-btn";
        actionButton.textContent =
          language === "en"
            ? action.labelEN
            : action.labelIT;

        actionButton.onclick = async ()=>{
          if(action.type==='open_investment_section'){
            actionButton.disabled=true;
            try{
              if(await window.rbOpenInvestmentAction?.(action))windowEl.classList.remove('open');
              else {
                const state=action.target==='results' ? window.rbGetInvestmentAnalysisState?.().status : null;
                const message=state==='stale'
                  ? t('Hai modificato i dati dopo l’analisi. Premi “Avvia / aggiorna analisi”, poi “Analizza investimento”. Dopo il calcolo, chiedimi di leggere nuovamente l’analisi.','You changed the inputs after the analysis. Press “Run / update analysis”, then “Analyze investment”. After the calculation, ask me to read the analysis again.')
                  : state==='pending'
                    ? t('L’analisi o l’account si sta ancora caricando. Attendi il completamento e riprova.','The analysis or account is still loading. Wait until it completes and try again.')
                    : state==='missing'
                      ? t('Avvia prima l’analisi con i dati attuali: premi “Avvia / aggiorna analisi”, poi “Analizza investimento”.','Run an analysis with the current inputs first: press “Run / update analysis”, then “Analyze investment”.')
                      : t('Questa sezione non è disponibile qui. Apri il simulatore e riprova.','This section is not available here. Open the simulator and try again.');
                addMessage('bot',message,false);
              }
            }catch(error){
              reportRuntimeError('Investment shortcut unavailable',error);
              addMessage('bot',t('Non riesco ad aprire la sezione. Riprova.','I cannot open this section. Please try again.'),false);
            }finally{actionButton.disabled=false;}
            return;
          }
          const pmsHandler={open_pms_task:'openPMSAutopilotTask',open_pms_checklist:'openPMSDailyChecklist',
            open_pms_arrival:'openPMSUpcomingArrival',open_pms_all_tasks:'openPMSAllTasks'}[action.type];
          if(typeof window[pmsHandler || 'openBookingFromCopilot']!=='function'){
            return;
          }

          actionButton.disabled = true;

          try{

            const opened =
              pmsHandler?(await window[pmsHandler](action.bookingId,action.section)!==false):
              await window.openBookingFromCopilot(
                action.bookingId,
                action.attentionCodes,
                action.type
              );

            if(opened){
              windowEl.classList.remove("open");
            }

          }catch(error){

            reportRuntimeError(
              "Copilot booking action unavailable",
              error
            );

            addMessage(
              "bot",
              t(
                "Non riesco ad aprire questa prenotazione. Riprova tra poco.",
                "I cannot open this booking right now. Please try again shortly."
              )
            );

          }finally{

            actionButton.disabled = false;

          }

        };

        container.appendChild(actionButton);

      });

    if(!container.children.length){
      return;
    }

    messages.appendChild(container);
    messages.scrollTop = messages.scrollHeight;

  }

  // ===========================================
  // ⌨ SEND MESSAGE
  // ===========================================

  async function sendMessage(){

    const text =
      input.value.trim();
    if(!text) return;
    const requestEpoch = window.rbDocumentEpoch || 0;

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
    if(requestEpoch !== (window.rbDocumentEpoch || 0)) return;

    addMessage(
        "bot",
        finalText
    );

    refreshQuickActions();
    addSuggestions(
        finalSuggestions
    );

    addResponseActions(
        response.actions,
        currentLang
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

  let autopilotRequestPending=false;
  window.rbAskPMSAutopilot=async function(mode='daily'){
    windowEl.classList.add('open');
    if(autopilotRequestPending)return;
    if(input.value.trim()){
      input.focus();
      addMessage('bot',t('Hai una domanda in bozza: inviala o svuota il campo, poi premi di nuovo Autopilot.','You have a draft question: send it or clear the field, then press Autopilot again.'),false);
      return;
    }
    autopilotRequestPending=true;
    input.value=mode==='week'?t('Prossimi 7 giorni nel PMS','Next 7 days in the PMS'):mode==='tomorrow'?t('Prepara gli arrivi di domani','Prepare tomorrow’s arrivals'):t('Cosa devo fare oggi nel PMS?','What should I do today in the PMS?');
    try{await sendMessage();}finally{autopilotRequestPending=false;}
  };

  window.rbAskInvestmentAutopilot=async function(mode='guide'){
    windowEl.classList.add('open');
    if(autopilotRequestPending)return;
    if(input.value.trim()){
      input.focus();
      addMessage('bot',t('Hai una domanda in bozza: inviala o svuota il campo, poi premi di nuovo Autopilot.','You have a draft question: send it or clear the field, then press Autopilot again.'),false);
      return;
    }
    const questions=window.rbInvestmentAutopilotQuestions;
    if(!questions)return;
    autopilotRequestPending=true;
    const pair=questions[mode] || questions.guide;
    input.value=t(pair[0],pair[1]);
    try{await sendMessage();}finally{autopilotRequestPending=false;}
  };

  sendBtn.onclick =
    sendMessage;

  attachBtn.onclick = ()=>{

    debugLog("Chatbot attachment action");

    window.rbChatAttachments.open();

};

voiceBtn.onclick = ()=>{

    if(!recognition){

        alert(
            t("Il riconoscimento vocale non è supportato da questo browser.", "Speech recognition is not supported by this browser.")
        );

        return;

    }

    if(isListening){

        recognition.stop();

        return;

    }

    recognition.start();

};

if(recognition){
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

}

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

const getHomePrompts = ()=> [

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

        input.value = getHomePrompts()[index];

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

${file.fileName}

🧠 Sto analizzando il contenuto...`

        );

    }

);


// ===========================================
// 🧠 DOCUMENT READY
// ===========================================

document.addEventListener("rb:document_ready", event => {
    if(event.detail?.status !== "ready") return;
    refreshQuickActions();
    addSuggestions(window.currentLang === "en"
      ? ["Interpret this PDF", "What about ROI?", "Which data are missing in the PDF?"]
      : ["Interpretami il PDF", "E il ROI?", "Quali dati mancano nel PDF?"]);
});

  // ===========================================
  // 🚀 READY
  // ===========================================

  function refreshChatbotLanguage(){
    // Reformat the existing UI; never recreate messages, files or event handlers.
    refreshHomeSnapshot();
    refreshQuickActions();
    const texts = [
      [".rb-chat-subtitle", "Assistente per analisi e gestione", "Analysis and management assistant"],
      [".rb-ai-home-subtitle", "Assistente per analisi e gestione", "Analysis and management assistant"],
      [".rb-empty-title", "Partiamo dai tuoi dati", "Start with your data"],
      [".rb-empty-text", "Apri una simulazione o allega un PDF con testo. Ti aiuto a leggere i dati disponibili.", "Open a simulation or attach a text PDF. I can help interpret the available data."]
    ];
    texts.forEach(([selector,it,en])=>{
      wrapper.querySelectorAll(selector).forEach(el=>{el.textContent=t(it,en);});
    });
    wrapper.querySelectorAll(".rb-ai-status").forEach(el=>{
      el.childNodes.forEach(node=>{if(node.nodeType===3) node.textContent=" " + t("Pronto","Ready");});
    });
    const titles = [
      ["Analizza investimento","Analyze investment"], ["Analizza PDF","Analyze PDF"],
      ["Analizza ROI","Analyze ROI"], ["Mutuo","Mortgage"],
      ["Mercato","Market"], ["Dashboard","Dashboard"]
    ];
    const descriptions = [
      ["ROI • Cashflow • Rischio","ROI • Cash flow • Risk"], ["Executive Report","Executive Report"],
      ["Performance investimento","Investment performance"], ["Leva • DSCR • LTV","Leverage • DSCR • LTV"],
      ["Benchmark città","City benchmarks"], ["KPI e Report","KPIs and reports"]
    ];
    wrapper.querySelectorAll(".rb-home-title").forEach((el,i)=>{if(titles[i]) el.textContent=t(...titles[i]);});
    wrapper.querySelectorAll(".rb-home-desc").forEach((el,i)=>{if(descriptions[i]) el.textContent=t(...descriptions[i]);});
    const metricLabels = [["📍 Mercato","📍 Market"],["📈 ROI immobile","📈 Property ROI"],["💰 Cashflow","💰 Cash flow"],["⚠️ Rischio","⚠️ Risk"]];
    wrapper.querySelectorAll(".rb-ai-metric-label").forEach((el,i)=>{if(metricLabels[i]) el.textContent=t(...metricLabels[i]);});
    const city = window.lastAnalysisData?.realCity || window.lastAnalysisData?.marketCity || window.rbChatMemory?.lastCity;
    const actionTitle=wrapper.querySelector(".rb-home-actions-title");
    if(actionTitle) actionTitle.textContent=city?t("Continua l’analisi","Continue the analysis"):t("Come posso aiutarti?","How can I help?");
    const actionContext=wrapper.querySelector(".rb-home-actions-context");
    if(actionContext) actionContext.textContent=city?t("Contesto attivo: ","Active context: ")+String(city).toUpperCase():t("Scegli da dove iniziare","Choose where to start");
    for(const [id,it,en] of [["rb-chat-attach","Allega file","Attach file"],["rb-chat-voice","Parla","Speak"],["rb-chat-new","Nuova chat","New chat"],["rb-chat-close","Minimizza","Minimize"]]){
      const el=wrapper.querySelector("#"+id);
      if(el){el.setAttribute("title",t(it,en));el.setAttribute("aria-label",t(it,en));}
    }
    input.setAttribute("placeholder",t("Scrivi oppure parla...","Write or speak..."));
    input.setAttribute("aria-label",t("Messaggio","Message"));
    wrapper.querySelector("#rb-chat-send")?.setAttribute("aria-label",t("Invia messaggio","Send message"));
    if(recognition) recognition.lang=t("it-IT","en-US");
  }

  document.addEventListener("rb_language_changed", refreshChatbotLanguage);
  refreshChatbotLanguage();

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
