// ===============================================
// 🤖 RENDIMENTOBB – CHATBOT LOADER 2.0
// Silicon Valley Modular AI Bootstrap
// Bilingual + Scale Ready
// ===============================================

(function(){

  // =============================================
  // 🛡 GLOBAL LOCK
  // =============================================

  if(window.__rbChatbotLoaded){

    console.warn(
      "⚠️ RB Chatbot already loaded"
    );

    return;

  }

  window.__rbChatbotLoaded = true;

  console.log(
    "🤖 Loading RB Chatbot..."
  );

  // =============================================
  // 🌍 LANGUAGE HELPER
  // =============================================

  window.rbT = function(it,en){

    return window.currentLang === "en"
      ? (en || it)
      : it;

  };

  // =============================================
  // 🎨 CSS LOADER
  // =============================================

  function loadCSS(href){

    return new Promise(resolve=>{

      const existing =
        document.querySelector(
          `link[href="${href}"]`
        );

      if(existing){

        resolve();
        return;

      }

      const css =
        document.createElement("link");

      css.rel = "stylesheet";

      css.href = href;

      css.onload = ()=>{

        console.log(
          "🎨 CSS Loaded:",
          href
        );

        resolve();

      };

      css.onerror = ()=>{

        console.error(
          "❌ CSS LOAD ERROR:",
          href
        );

        resolve();

      };

      document.head.appendChild(css);

    });

  }

  // =============================================
  // 📦 SCRIPT LOADER
  // =============================================

  function loadScript(src){

    return new Promise(resolve=>{

      // =========================================
      // 🛡 DUPLICATE PREVENTION
      // =========================================

      const existing =
        document.querySelector(
          `script[src="${src}"]`
        );

      if(existing){

        console.warn(
          "⚠️ Script already loaded:",
          src
        );

        resolve();

        return;

      }

      // =========================================
      // 🚀 SCRIPT
      // =========================================

      const script =
        document.createElement("script");

      script.src = src;

      script.async = false;

      script.onload = ()=>{

        console.log(
          "✅ Loaded:",
          src
        );

        resolve();

      };

      script.onerror = ()=>{

        console.error(
          "❌ SCRIPT LOAD ERROR:",
          src
        );

        resolve();

      };

      document.body.appendChild(
        script
      );

    });

  }

  // =============================================
  // 🎨 CSS FILES
  // =============================================

  const cssFiles = [

    "/css/chatbot.css"

  ];

  // =============================================
  // 📦 JS ARCHITECTURE
  // =============================================

  const scripts = [

    // =========================================
    // 🧠 KNOWLEDGE BASE
    // =========================================

    "/js/chatbot/knowledge-base.js",

// =========================================
// 📚 KNOWLEDGE MODULES
// =========================================

"/js/chatbot/knowledge/glossary.js",
"/js/chatbot/knowledge/finance.js",
"/js/chatbot/knowledge/risk.js",
"/js/chatbot/knowledge/mortgages.js",
"/js/chatbot/knowledge/shortrent.js",
"/js/chatbot/knowledge/real-estate.js",
"/js/chatbot/knowledge/legal.js",
"/js/chatbot/knowledge/taxes.js",
"/js/chatbot/knowledge/mistakes.js",
"/js/chatbot/knowledge/beginner.js",
"/js/chatbot/knowledge/markets.js",
"/js/chatbot/knowledge/subscriptions.js",
"/js/chatbot/knowledge/support.js",
"/js/chatbot/knowledge/airbnb.js",
"/js/chatbot/knowledge/roi.js",
"/js/chatbot/knowledge/property-analysis.js",    

    // =========================================
    // 🌍 DATA
    // =========================================

    "/js/chatbot/market-data.js",
    "/js/chatbot/support-data.js",

    // =========================================
    // 🧠 CORE AI
    // =========================================

    "/js/chatbot/core/entity-engine.js",
    "/js/chatbot/core/intent-engine.js",
    "/js/chatbot/core/memory-engine.js",
    "/js/chatbot/core/investor-profile-engine.js",
    "/js/chatbot/core/score-engine.js",
    "/js/chatbot/core/response-engine.js",
    "/js/chatbot/core/chatbot-orchestrator.js",

    // =========================================
    // 🤝 SUPPORT LAYERS
    // =========================================

    "/js/chatbot/support-engine.js",
    "/js/chatbot/core/advisor-engine.js",

    // =========================================
    // 🎨 UI
    // =========================================

"/js/chatbot/ui/chatbot-ui.js",

// =========================================
// 🧠 GLOBAL AI HELPERS
// =========================================

"/js/ai-engine.js"

];


// =============================================
// 🚀 BOOTSTRAP
// =============================================

  async function init(){

    console.log(
      "🚀 Initializing RB AI Architecture..."
    );

    // =========================================
    // 🎨 LOAD CSS
    // =========================================

    for(const href of cssFiles){

      await loadCSS(href);

    }

    // =========================================
    // 📦 LOAD SCRIPTS
    // =========================================

    for(const src of scripts){

      await loadScript(src);

    }

    // =========================================
    // 🤖 INIT UI
    // =========================================

    if(window.initRBChatbotUI){

      window.initRBChatbotUI();

    }

    // =========================================
    // ✅ READY
    // =========================================

    console.log(
      "🤖 RENDIMENTOBB AI READY"
    );

    console.log({

      entityEngine:
        !!window.rbExtractEntities,

      intentEngine:
        !!window.rbDetectIntent,

      memoryEngine:
        !!window.rbGetConversationContext,

      responseEngine:
        !!window.rbGenerateResponse,

      orchestrator:
        !!window.rbProcessAIMessage,

      chatbotUI:
        !!window.initRBChatbotUI

    });

  }

  // =============================================
  // 🚀 START
  // =============================================

  if(document.readyState === "loading"){

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  }

  else{

    init();

  }

})();
