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

    "/js/chatbot/knowledge-base.js",
    "/js/chatbot/market-data.js",
    "/js/chatbot/support-data.js",

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
