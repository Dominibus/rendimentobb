// ===============================================
// RENDIMENTOBB – CHATBOT MODULE LOADER
// Production bootstrap
// ===============================================

(function () {
  "use strict";

  const IS_DEVELOPMENT =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const debugLog = (...args) => {
    if (IS_DEVELOPMENT) {
      console.log(...args);
    }
  };

  const reportLoadError = (resourceType) => {
    if (IS_DEVELOPMENT) {
      console.error(`Unable to load chatbot ${resourceType}`);
    }
  };

  // Previene inizializzazioni multiple.
  if (window.__rbChatbotLoaded) {
    return;
  }

  window.__rbChatbotLoaded = true;

  // =============================================
  // LANGUAGE HELPER
  // =============================================

  window.rbT = function (it, en) {
    return window.currentLang === "en"
      ? (en || it)
      : it;
  };

  // =============================================
  // CSS LOADER
  // =============================================

  function loadCSS(href) {
    return new Promise((resolve) => {
      const existing = document.querySelector(
        `link[href="${href}"]`
      );

      if (existing) {
        resolve();
        return;
      }

      const css = document.createElement("link");

      css.rel = "stylesheet";
      css.href = href;

      css.onload = () => {
        debugLog("Chatbot stylesheet loaded");
        resolve();
      };

      css.onerror = () => {
        reportLoadError("stylesheet");
        resolve();
      };

      document.head.appendChild(css);
    });
  }

  // =============================================
  // SCRIPT LOADER
  // =============================================

  function loadScript(src) {
    return new Promise((resolve) => {
      const existing = document.querySelector(
        `script[src="${src}"]`
      );

      // Lo script è già dichiarato nella pagina:
      // non viene caricato una seconda volta.
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement("script");

      script.src = src;
      script.async = false;

      script.onload = () => {
        debugLog("Chatbot module loaded");
        resolve();
      };

      script.onerror = () => {
        reportLoadError("module");
        resolve();
      };

      document.body.appendChild(script);
    });
  }

  // =============================================
  // RESOURCES
  // =============================================

  const cssFiles = [
    "/css/chatbot.css"
  ];

  const scripts = [
    "/js/chatbot/knowledge-base.js",

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

    "/js/chatbot/market-data.js",
    "/js/chatbot/support-data.js",

    "/js/chatbot/core/semantic-router.js",
    "/js/chatbot/core/entity-engine.js",
    "/js/chatbot/core/intent-engine.js",
    "/js/chatbot/core/memory-engine.js",
    "/js/chatbot/core/conversation-engine.js",
    "/js/chatbot/core/investor-profile-engine.js",
    "/js/chatbot/core/score-engine.js",

    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",

    "/js/chatbot/document-engine.js",
    "/js/chatbot/pdf-extraction-engine.js",
    "/js/chatbot/pdf-parser-engine.js",
    "/js/chatbot/core/document-classifier.js",
    "/js/chatbot/document-reasoning-engine.js",
    "/js/chatbot/executive-narrative-engine.js",
    "/js/chatbot/reasoning-engine.js",
    "/js/chatbot/core/ai-brain.js",
    "/js/chatbot/core/executive-brain-v2.js",
    "/js/chatbot/core/executive-response-builder.js",
    "/js/chatbot/core/response-engine.js?v=20260906-copilot-operations-v17-4",
    "/js/chatbot/core/chatbot-file-dispatcher.js",
    "/js/chatbot/core/chatbot-orchestrator.js",

    "/js/chatbot/support-engine.js",
    "/js/chatbot/core/advisor-engine.js",

    "/js/chatbot/ui/chatbot-attachments.js",
    "/js/chatbot/ui/chatbot-ui.js",

    "/js/ai-engine.js"
  ];

  // =============================================
  // BOOTSTRAP
  // =============================================

  async function init() {
    for (const href of cssFiles) {
      await loadCSS(href);
    }

    for (const src of scripts) {
      await loadScript(src);
    }

    if (typeof window.initRBChatbotUI === "function") {
      window.initRBChatbotUI();
    }

    window.rbChatbotReady = true;

    document.dispatchEvent(
      new CustomEvent("rb_chatbot_ready", {
        detail: {
          ready: true
        }
      })
    );

    debugLog("RendimentoBB chatbot ready");
  }

  // =============================================
  // START
  // =============================================

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
