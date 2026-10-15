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

  if(intent === "pricing")return window.t('Listino previsto: Investor 19 €/mese, Pro 29 €/mese, Pro annuale 199 €/anno. Investor include analisi salvate, dashboard e gestione PMS. Pro mensile e annuale aggiungono report integrati, PDF operativo PMS, PDF andamento, PDF IT/EN e guida alla lettura. I nuovi acquisti sono sospesi. La prova Investor di 30 giorni è per account idonei e non include PDF; non è una prova Pro. Puoi lasciare interesse senza impegno su /plan-interest.html?plan=pro. Le simulazioni dipendono dagli input: un piano diverso non rende i dati più reali o garantiti.','Planned prices: Investor €19/month, Pro €29/month, yearly Pro €199/year. Investor includes saved analyses, dashboard and PMS management. Monthly and yearly Pro add integrated reports, PMS operations PDFs, performance PDFs, IT/EN PDFs and guided reading. New purchases are paused. The 30-day Investor trial is for eligible accounts and excludes PDFs; it is not a Pro trial. Express non-binding interest at /plan-interest.html?plan=pro. Simulations depend on inputs: another plan does not make the figures more real or guaranteed.');

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

  if(intent === "pdf")return window.t('Pro include PDF Executive, operativo PMS, andamento e report integrato investimento/gestione. Il PDF operativo contiene prenotazioni registrate, non ROI o cashflow effettivi. Investor include il PMS ma non questi report. I nuovi acquisti sono sospesi; /plan-interest.html?plan=pro raccoglie interesse senza impegno.','Pro includes Executive, PMS operations, performance and integrated investment/operations PDFs. Operations PDFs contain recorded bookings, not actual ROI or cash flow. Investor includes PMS but not these reports. New purchases are paused; express non-binding interest at /plan-interest.html?plan=pro.');

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
    if(window.currentUser&&(access.isPro||access.isAdmin))return window.t('Hai già accesso alle funzioni Pro, inclusi report integrati e PDF. Controlla piano e scadenza in Abbonamento.','You already have access to Pro features, including integrated reports and PDFs. Check your plan and expiry in Subscription.');
    return window.t('Listino previsto: Investor 19 €/mese, Pro 29 €/mese, Pro annuale 199 €/anno. Investor include analisi salvate, dashboard e gestione PMS. Pro mensile e annuale aggiungono report integrati, PDF operativo PMS, PDF andamento, PDF IT/EN e guida alla lettura. I nuovi acquisti sono sospesi. La prova Investor di 30 giorni è per account idonei e non include PDF; non è una prova Pro. Puoi lasciare interesse senza impegno su /plan-interest.html?plan=pro. Le simulazioni dipendono dagli input: un piano diverso non rende i dati più reali o garantiti.','Planned prices: Investor €19/month, Pro €29/month, yearly Pro €199/year. Investor includes saved analyses, dashboard and PMS management. Monthly and yearly Pro add integrated reports, PMS operations PDFs, performance PDFs, IT/EN PDFs and guided reading. New purchases are paused. The 30-day Investor trial is for eligible accounts and excludes PDFs; it is not a Pro trial. Express non-binding interest at /plan-interest.html?plan=pro. Simulations depend on inputs: another plan does not make the figures more real or guaranteed.');
  }

};

// Production: nessun log
