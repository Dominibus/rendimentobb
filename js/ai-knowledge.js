// ===============================================
// RENDIMENTOBB – AI KNOWLEDGE BASE 2.0
// ===============================================

window.rbKnowledgeBase = {

  cities: {

    roma: {
      aliases: ["roma","rome"],
      roi: "6-9%",
      occupancy: "72%",
      adr: "€140",
      risk: {
        it: "medio",
        en: "medium"
      }
    },

    milano: {
      aliases: ["milano","milan"],
      roi: "5-8%",
      occupancy: "69%",
      adr: "€160",
      risk: {
        it: "medio-basso",
        en: "medium-low"
      }
    },

    napoli: {
      aliases: ["napoli","naples"],
      roi: "7-11%",
      occupancy: "68%",
      adr: "€120",
      risk: {
        it: "medio-alto",
        en: "medium-high"
      }
    },

    firenze: {
      aliases: ["firenze","florence"],
      roi: "6-10%",
      occupancy: "74%",
      adr: "€170",
      risk: {
        it: "medio",
        en: "medium"
      }
    },

    torino: {
      aliases: ["torino","turin"],
      roi: "5-7%",
      occupancy: "61%",
      adr: "€105",
      risk: {
        it: "medio-basso",
        en: "medium-low"
      }
    },

    bologna: {
      aliases: ["bologna"],
      roi: "6-8%",
      occupancy: "66%",
      adr: "€125",
      risk: {
        it: "medio",
        en: "medium"
      }
    },

    venezia: {
      aliases: ["venezia","venice"],
      roi: "7-10%",
      occupancy: "79%",
      adr: "€210",
      risk: {
        it: "medio-alto",
        en: "medium-high"
      }
    },

    bari: {
      aliases: ["bari"],
      roi: "6-9%",
      occupancy: "63%",
      adr: "€95",
      risk: {
        it: "medio",
        en: "medium"
      }
    },

    palermo: {
      aliases: ["palermo"],
      roi: "7-10%",
      occupancy: "65%",
      adr: "€100",
      risk: {
        it: "medio-alto",
        en: "medium-high"
      }
    },

    genova: {
      aliases: ["genova","genoa"],
      roi: "5-7%",
      occupancy: "59%",
      adr: "€110",
      risk: {
        it: "medio-basso",
        en: "medium-low"
      }
    }

  }

  ,

roi: {

  keywords: [
    "roi",
    "rendimento",
    "return on investment"
  ],

  it: `
📈 ROI (Return On Investment)

Il ROI misura quanto rende il tuo investimento rispetto al capitale investito.

Esempio pratico:

• investimento → €100.000
• profitto netto annuo → €10.000

ROI:
10%

💡 Nel settore B&B:

• 4-6% → conservativo
• 7-10% → molto buono
• 10%+ → aggressivo / alto rischio

⚠️ Attenzione:
un ROI elevato non garantisce automaticamente sostenibilità o cashflow positivo.
`,

  en: `
📈 ROI (Return On Investment)

ROI measures how much your investment generates compared to invested capital.

Practical example:

• investment → €100,000
• annual net profit → €10,000

ROI:
10%

💡 In the B&B sector:

• 4-6% → conservative
• 7-10% → very good
• 10%+ → aggressive / higher risk

⚠️ Warning:
a high ROI does not automatically guarantee sustainability or positive cashflow.
`
},

cashflow: {

  keywords: [
    "cashflow",
    "cash flow",
    "flusso di cassa"
  ],

  it: `
💸 Cashflow

Il cashflow rappresenta il denaro reale che rimane dopo tutte le spese operative.

Include:

• utenze
• cleaning
• tasse
• manutenzione
• mutuo eventuale

💡 Un cashflow positivo significa che l'immobile genera liquidità reale ogni mese.

⚠️ Molti investimenti mostrano ROI elevati ma cashflow molto bassi.
`,

  en: `
💸 Cashflow

Cashflow represents the real money remaining after all operating expenses.

Includes:

• utilities
• cleaning
• taxes
• maintenance
• mortgage payments

💡 Positive cashflow means the property generates real liquidity every month.

⚠️ Many investments show high ROI but weak cashflow.
`
},

occupancy: {

  keywords: [
    "occupazione",
    "occupancy"
  ],

  it: `
🏨 Occupazione

L'occupazione indica la percentuale di notti prenotate durante l'anno.

💡 Nel settore short rent:

• 50% → basso
• 65-70% → ottimo
• 80%+ → molto aggressivo

⚠️ Occupazioni troppo elevate possono essere irrealistiche in alcune città.
`,

  en: `
🏨 Occupancy

Occupancy represents the percentage of booked nights during the year.

💡 In the short rental sector:

• 50% → low
• 65-70% → excellent
• 80%+ → very aggressive

⚠️ Extremely high occupancy may be unrealistic in some cities.
`
},

dscr: {

  keywords: [
    "dscr"
  ],

  it: `
🏦 DSCR

Il DSCR misura la capacità dell'investimento di sostenere il mutuo.

Serve a capire se l'immobile genera abbastanza reddito per coprire le rate.

💡 In genere:

• sotto 1 → rischio elevato
• sopra 1.2 → sostenibile
• sopra 1.5 → molto forte
`,

  en: `
🏦 DSCR

DSCR measures the investment's ability to sustain mortgage payments.

It helps determine whether the property generates enough income to cover installments.

💡 Generally:

• below 1 → high risk
• above 1.2 → sustainable
• above 1.5 → very strong
`
},

breakEven: {

  keywords: [
    "break even",
    "pareggio"
  ],

  it: `
⚖️ Break-even

Il break-even rappresenta il punto in cui ricavi e costi si equivalgono.

💡 Più rapidamente raggiungi il break-even:

• minore sarà il rischio
• maggiore sarà la stabilità operativa

⚠️ Un break-even troppo lento aumenta l'esposizione finanziaria.
`,

  en: `
⚖️ Break-even

Break-even represents the point where revenues equal costs.

💡 The faster you reach break-even:

• the lower the risk
• the higher the operational stability

⚠️ Slow break-even increases financial exposure.
`
}

};
