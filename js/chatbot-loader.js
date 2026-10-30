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
      (void 0);
    }
  };

  const reportLoadError = (resourceType) => {
    if (IS_DEVELOPMENT) {
      (void 0);
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
    if(src.startsWith('/js/source-registry-data.js?')){
      return import(src).then(module=>{window.rbSourceRegistry=module.default;})
        .catch(()=>{window.rbSourceRegistry=null;reportLoadError('Source metadata');});
    }
    // PDF.js is an ES module. Await its export before loading document tools.
    if(src === "/js/vendor/pdfjs/pdf.min.mjs"){
      return import(src)
        .then(pdfjs => {
          window.pdfjsLib = pdfjs;
        })
        .catch(() => {
          window.pdfjsLib = null;
          reportLoadError("PDF reader");
        });
    }

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
    "/css/chatbot.css?v=20261027-rc210"
  ];

  const scripts = [
    "/js/market-data.js?v=20261023-rc191",
    "/js/data-provenance.js?v=20261023-rc191",
    "/js/source-registry-data.js?v=20261029-rc228",
    "/js/chatbot/core/evidence-response-engine.js?v=20261030-a1-a4",
    "/js/chatbot/core/market-evidence.js?v=20261023-rc192",
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
    "/js/chatbot/knowledge/subscriptions.js?v=20261015-rc137",
    "/js/chatbot/knowledge/support.js?v=20261015-rc137",
    "/js/chatbot/knowledge/airbnb.js",
    "/js/chatbot/knowledge/roi.js",
    "/js/chatbot/knowledge/property-analysis.js",

    "/js/chatbot/market-data.js",
    "/js/chatbot/support-data.js?v=20261015-rc137",

    "/js/chatbot/core/query-normalizer.js?v=20261026-rc200",
    "/js/chatbot/core/semantic-router.js?v=20261009-rc76",
    "/js/chatbot/core/entity-engine.js?v=20261011-rc99",
    "/js/chatbot/core/intent-engine.js?v=20261011-rc99",
    "/js/chatbot/core/memory-engine.js?v=20261030-a1-a4",
    "/js/chatbot/core/conversation-engine.js?v=20261001-22",
    "/js/chatbot/core/investor-profile-engine.js?v=20261011-rc99",
    "/js/chatbot/core/score-engine.js?v=20261011-rc99",

    "/js/vendor/pdfjs/pdf.min.mjs",

    "/js/chatbot/document-engine.js?v=20261023-rc194",
    "/js/chatbot/pdf-extraction-engine.js?v=20261011-rc99",
    "/js/chatbot/core/pms-document-evidence.js?v=20261016-rc141",
    "/js/chatbot/pdf-parser-engine.js?v=20261026-rc200",
    "/js/chatbot/core/document-classifier.js?v=20261015-rc137",
    "/js/chatbot/document-reasoning-engine.js",
    "/js/chatbot/executive-narrative-engine.js",
    "/js/chatbot/reasoning-engine.js?v=20261011-rc99",
    "/js/chatbot/core/ai-brain.js?v=20261011-rc99",
    "/js/chatbot/core/executive-brain-v2.js?v=20261012-rc108",
    "/js/chatbot/core/executive-response-builder.js?v=20261027-rc211",
    "/js/chatbot/core/response-engine.js?v=20261030-a1-a4",
    "/js/chatbot/core/chatbot-file-dispatcher.js?v=20261001-22",
    "/js/chatbot/core/confirmed-portfolio-engine.js?v=20261008-rc59",
    "/js/chatbot/core/portal-facts-engine.js?v=20261030-a1-a4",
    "/js/chatbot/core/pms-autopilot-engine.js?v=20261030-a1-a4",
    "/js/chatbot/core/investment-autopilot-engine.js?v=20261027-rc211",
    "/js/chatbot/core/renovation-recovery-engine.js?v=20261009-rc76",
    "/js/chatbot/core/pro-report-guide.js?v=20261023-rc185",
    "/js/chatbot/core/practical-guide.js?v=20261023-rc185",
    "/js/chatbot/core/chatbot-orchestrator.js?v=20261030-a1-a4",

    "/js/chatbot/support-engine.js?v=20261015-rc137",
    "/js/chatbot/core/advisor-engine.js?v=20261011-rc99",

    "/js/chatbot/ui/chatbot-attachments.js?v=20261011-rc99",
    "/js/chatbot/ui/free-home-snapshot.js?v=20261027-rc211",
    "/js/chatbot/ui/chatbot-ui.js?v=20261030-a1-a4",

    "/js/ai-engine.js?v=20261011-rc99"
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

    // A missing evidence module must not reactivate the legacy zero/default answers.
    if(typeof window.rbBuildPMSAvailabilityResponse!=='function'){
      window.rbProcessAIMessage=async()=>({success:true,response:{type:'assistant_unavailable',confidence:0,actions:[],
        textIT:'L’assistente non è disponibile in questa sessione. Ricarica la pagina e riprova; non posso confermare dati o attività.',
        textEN:'The assistant is unavailable in this session. Reload the page and retry; I cannot confirm data or tasks.'}});
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
