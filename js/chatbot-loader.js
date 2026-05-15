// ===============================
// 🤖 RENDIMENTOBB CHATBOT LOADER
// ===============================

(function(){

  // evita doppio caricamento
  if(window.__rbChatbotLoaded){
    return;
  }

  window.__rbChatbotLoaded = true;

  console.log("🤖 Loading RB Chatbot...");

  // ===============================
  // 🎨 CSS
  // ===============================

  const css = document.createElement("link");

  css.rel = "stylesheet";
  css.href = "/css/chatbot.css";

  document.head.appendChild(css);

  // ===============================
  // 📦 JS FILES
  // ===============================

  const scripts = [

    // ===================================
    // 🧠 KNOWLEDGE BASE
    // ===================================

    "/js/chatbot/knowledge-base.js",

    // ===================================
    // 📚 KNOWLEDGE MODULES
    // ===================================

    "/js/chatbot/knowledge/real-estate.js",
    "/js/chatbot/knowledge/mortgages.js",
    "/js/chatbot/knowledge/shortrent.js",
    "/js/chatbot/knowledge/finance.js",
    "/js/chatbot/knowledge/risk.js",
    "/js/chatbot/knowledge/mistakes.js",
    "/js/chatbot/knowledge/beginner.js",
    "/js/chatbot/knowledge/markets.js",
    "/js/chatbot/knowledge/roi.js",

    // ===================================
    // 🌍 DATA LAYERS
    // ===================================

    "/js/chatbot/market-data.js",
    "/js/chatbot/support-data.js",

    // ===================================
    // 🧠 CORE AI ARCHITECTURE
    // ===================================

    "/js/chatbot/core/entity-engine.js",
    "/js/chatbot/core/intent-engine.js",
    "/js/chatbot/core/memory-engine.js",
    "/js/chatbot/core/response-engine.js",
    "/js/chatbot/core/chatbot-orchestrator.js",

    // ===================================
    // 🧠 ADVANCED AI LAYERS
    // ===================================

    "/js/chatbot/support-engine.js",
    "/js/chatbot/advisor-engine.js",

    // ===================================
    // 🎨 UI
    // ===================================

    "/js/chatbot/ui/chatbot-ui.js"

  ];


scripts.forEach(src=>{

  const s = document.createElement("script");

  s.src = src;

  // 🔥 ordine caricamento garantito
  s.async = false;

  document.body.appendChild(s);

});

})();
