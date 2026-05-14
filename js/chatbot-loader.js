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
    // CORE
    // ===================================

    "/js/chatbot/knowledge/knowledge-base.js",

    // ===================================
    // KNOWLEDGE MODULES
    // ===================================

    "/js/chatbot/knowledge/real-estate.js",
    "/js/chatbot/knowledge/mortgages.js",
    "/js/chatbot/knowledge/shortrent.js",
    "/js/chatbot/knowledge/finance.js",
    "/js/chatbot/knowledge/risk.js",
    "/js/chatbot/knowledge/mistakes.js",

    // ===================================
    // DATA
    // ===================================

    "/js/chatbot/market-data.js",
    "/js/chatbot/support-data.js",

    // ===================================
    // AI ENGINE
    // ===================================

    "/js/ai-engine.js",
    "/js/chatbot.js"

  ];

  scripts.forEach(src=>{

    const s = document.createElement("script");

    s.src = src;
    s.defer = true;

    document.body.appendChild(s);

  });

})();
