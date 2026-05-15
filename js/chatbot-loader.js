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

    "/js/chatbot/knowledge-base.js",

    // ===================================
    // KNOWLEDGE MODULES
    // ===================================

    "/js/chatbot/knowledge/real-estate.js",
    "/js/chatbot/knowledge/mortgages.js",
    "/js/chatbot/knowledge/shortrent.js",
    "/js/chatbot/knowledge/finance.js",
    "/js/chatbot/knowledge/risk.js",
    "/js/chatbot/knowledge/mistakes.js",
    "/js/chatbot/knowledge/beginner.js",

    // ===================================
    // DATA
    // ===================================

    "/js/chatbot/market-data.js",
    "/js/chatbot/support-data.js",

// ===================================
// AI ENGINE
// ===================================

"/js/chatbot/entity-engine.js",
"/js/chatbot/reasoning-engine.js",
"/js/chatbot/support-engine.js",    
"/js/ai-engine.js",
"/js/chatbot.js"

  ];

scripts.forEach(src=>{

  const s = document.createElement("script");

  s.src = src;

  // 🔥 ordine caricamento garantito
  s.async = false;

  document.body.appendChild(s);

});

})();
