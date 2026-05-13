// ===============================================
// RENDIMENTOBB – AI ENGINE 1.0
// ===============================================

window.generateAIResponse = function(message){

  const msg = message.toLowerCase();

  const lang = window.currentLang || "it";

  const kb = window.RB_AI_KNOWLEDGE;

  // ============================================
  // ROMA
  // ============================================

  if(msg.includes("roma") || msg.includes("rome")){

    const city = kb.cities.roma;

    return window.t(

`📍 Roma

ROI medio:
${city.roi}

Occupazione media:
${city.occupancy}

ADR medio:
${city.adr}

Rischio:
${city.risk.it}`,

`📍 Rome

Average ROI:
${city.roi}

Average occupancy:
${city.occupancy}

Average ADR:
${city.adr}

Risk:
${city.risk.en}`

    );

  }

  // ============================================
  // MILANO
  // ============================================

  if(msg.includes("milano") || msg.includes("milan")){

    const city = kb.cities.milano;

    return window.t(

`📍 Milano

ROI medio:
${city.roi}

Occupazione:
${city.occupancy}

ADR:
${city.adr}`,

`📍 Milan

Average ROI:
${city.roi}

Occupancy:
${city.occupancy}

ADR:
${city.adr}`

    );

  }

  // ============================================
  // NAPOLI
  // ============================================

  if(msg.includes("napoli") || msg.includes("naples")){

    const city = kb.cities.napoli;

    return window.t(

`📍 Napoli

ROI medio:
${city.roi}

Occupazione:
${city.occupancy}

ADR:
${city.adr}

Mercato ad alto potenziale ma più volatile.`,

`📍 Naples

Average ROI:
${city.roi}

Occupancy:
${city.occupancy}

ADR:
${city.adr}

High potential market with higher volatility.`

    );

  }

  // ============================================
  // MUTUI
  // ============================================

  if(
    msg.includes("mutuo") ||
    msg.includes("mortgage") ||
    msg.includes("rata")
  ){

    const tips = kb.mortgage.tips[lang];

    return `
🏦 ${window.t("Consigli mutuo", "Mortgage tips")}

• ${tips.join("\n• ")}
`;
  }

  // ============================================
  // DEFAULT
  // ============================================

  return window.t(

`Posso aiutarti con:

• ROI città
• mutui
• rischio investimento
• cashflow
• occupazione media
• strategie B&B

Esempi:

"Conviene investire a Napoli?"
"ROI medio Roma"
"Come scegliere un mutuo B&B?"`,

`I can help you with:

• city ROI
• mortgages
• investment risk
• cashflow
• occupancy
• B&B strategies

Examples:

"Is Naples a good investment?"
"Average ROI Rome"
"How to choose a B&B mortgage?"`

  );

};
