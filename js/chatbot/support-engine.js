// ===============================================
// 🤝 RENDIMENTOBB – SUPPORT ENGINE 1.0
// AI SaaS + Upgrade + Onboarding Assistant
// ===============================================

// ===============================================
// 🧠 SUPPORT KEYWORDS
// ===============================================

window.rbSupportIntents = {

  pricing: [
    "prezzo",
    "costo",
    "quanto costa",
    "abbonamento",
    "piano",
    "investor",
    "pro",
    "premium",
    "upgrade"
  ],

  login: [
    "login",
    "accesso",
    "accedere",
    "non riesco entrare",
    "registrazione",
    "account"
  ],

  pdf: [
    "pdf",
    "report",
    "report pdf",
    "scaricare pdf",
    "download pdf"
  ],

  chatbot: [
    "chatbot",
    "ai",
    "assistant",
    "assistente"
  ],

  dashboard: [
    "dashboard",
    "simulazioni salvate",
    "analisi salvate",
    "storico"
  ],

  plans: [
    "free",
    "investor",
    "pro"
  ]

};

// ===============================================
// 🧠 SUPPORT DETECTOR
// ===============================================

window.rbDetectSupportIntent = function(text){

  text = String(text || "")
    .toLowerCase();

  for(
    const intent in
    window.rbSupportIntents
  ){

    const keywords =
      window.rbSupportIntents[intent];

    const matched =
      keywords.some(keyword =>
        text.includes(keyword)
      );

    if(matched){

      return intent;

    }

  }

  return null;

};

// ===============================================
// 🤖 SUPPORT RESPONSE ENGINE
// ===============================================

window.rbGenerateSupportResponse =
function(text){

  const intent =
    window.rbDetectSupportIntent(text);

  if(!intent)
    return null;

  const access =
    window.getUserAccess?.() || {};

  // ===========================================
  // 💳 PRICING
  // ===========================================

  if(intent === "pricing"){

    return window.t(

`👑 RendimentoBB utilizza 3 livelli:

🔓 FREE
• simulazioni base
• accesso limitato AI

📈 INVESTOR
• analisi avanzata
• AI insights
• più utilizzo chatbot

👑 PRO
• PDF executive
• AI avanzata
• analisi complete
• accesso illimitato

💡 Più il piano è avanzato, più le simulazioni diventano realistiche e professionali.`,

`👑 RendimentoBB uses 3 access levels:

🔓 FREE
• basic simulations
• limited AI access

📈 INVESTOR
• advanced analysis
• AI insights
• more chatbot usage

👑 PRO
• executive PDF
• advanced AI
• full analysis
• unlimited access

💡 Advanced plans unlock more realistic and professional analysis.`

    );

  }

  // ===========================================
  // 🔐 LOGIN
  // ===========================================

  if(intent === "login"){

    return window.t(

`🔐 Per utilizzare tutte le funzioni:

1. crea un account
2. effettua il login
3. scegli un piano se vuoi sbloccare analisi avanzate

💡 Le simulazioni salvate vengono collegate al tuo account.`,

`🔐 To use all features:

1. create an account
2. log in
3. choose a plan to unlock advanced analysis

💡 Saved simulations are linked to your account.`

    );

  }

  // ===========================================
  // 📄 PDF
  // ===========================================

  if(intent === "pdf"){

    if(access.isFree){

      return window.t(

`📄 Il PDF executive è disponibile nel piano PRO.

Include:
• analisi bancaria
• rischio
• cashflow
• benchmark
• executive insights AI`,

`📄 Executive PDF is available in the PRO plan.

Includes:
• banking analysis
• risk
• cashflow
• benchmarks
• AI executive insights`

      );

    }

    return window.t(

`📄 Il PDF executive permette di esportare l'analisi completa dell'investimento.`,

`📄 Executive PDF allows exporting the full investment analysis.`

    );

  }

  // ===========================================
  // 🤖 CHATBOT
  // ===========================================

  if(intent === "chatbot"){

    return window.t(

`🤖 L'AI Assistant può aiutarti a:

• analizzare ROI
• capire il rischio
• spiegare termini immobiliari
• confrontare mercati
• migliorare la sostenibilità dell'investimento

💡 L'AI diventa più avanzata nei piani Investor e PRO.`,

`🤖 The AI Assistant can help you:

• analyze ROI
• understand risk
• explain real estate terms
• compare markets
• improve investment sustainability

💡 AI becomes more advanced in Investor and PRO plans.`

    );

  }

  // ===========================================
  // 📊 DASHBOARD
  // ===========================================

  if(intent === "dashboard"){

    return window.t(

`📊 La dashboard permette di:

• salvare simulazioni
• confrontare investimenti
• monitorare ROI
• rivedere analisi passate

💡 Alcune funzioni avanzate dipendono dal piano attivo.`,

`📊 The dashboard allows you to:

• save simulations
• compare investments
• monitor ROI
• review past analysis

💡 Some advanced features depend on the active plan.`

    );

  }

  // ===========================================
  // 👑 PLANS
  // ===========================================

  if(intent === "plans"){

    if(access.isFree){

      return window.t(

`🔓 Attualmente stai utilizzando il piano FREE.

💡 Investor e PRO sbloccano:
• AI avanzata
• analisi rischio
• PDF executive
• simulazioni più realistiche.`,

`🔓 You are currently using the FREE plan.

💡 Investor and PRO unlock:
• advanced AI
• risk analysis
• executive PDF
• more realistic simulations.`

      );

    }

    if(access.isInvestor){

      return window.t(

`📈 Stai utilizzando INVESTOR.

👑 PRO aggiunge:
• PDF executive
• AI completa
• accesso illimitato
• analisi professionali avanzate.`,

`📈 You are currently using INVESTOR.

👑 PRO adds:
• executive PDF
• full AI
• unlimited access
• advanced professional analysis.`

      );

    }

    return window.t(

`👑 Hai accesso completo PRO attivo.`,

`👑 You currently have full PRO access.`

    );

  }

  return null;

};

// Production: nessun log
