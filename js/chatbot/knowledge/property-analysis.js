// ===============================================
// 🏠 PROPERTY ANALYSIS AI MODULE
// ===============================================

window.rbKnowledgeBase =
  window.rbKnowledgeBase || {};

Object.assign(window.rbKnowledgeBase,{

// =============================================
// 🏠 PROPERTY TYPE
// =============================================

propertyType: {

  priority: 10,

  category: "property",

  scoreWeight: 1.5,

  semanticWeight: 1.8,

  decisionWeight: 1.7,

  executiveWeight: 1.6,

  importance: "core",

  aiBehavior: {

    investorFocus: true,

    compareRequired: true,

    benchmarkRequired: false

  },

  responseStyle: {

    tone: "executive",

    useWarnings: false,

    concise: false

  },

  keywords: [

    "monolocale",
    "bilocale",
    "trilocale",

    "villa",
    "attico",
    "loft",

    "appartamento",
    "penthouse",

    "studio apartment",
    "apartment"

  ],

  aiTitleIT:
    "🏠 Tipologia Immobile",

  aiTitleEN:
    "🏠 Property Type",

  aiSummaryIT:
    "La tipologia dell’immobile influenza occupazione, ADR, target clienti e sostenibilità.",

  aiSummaryEN:
    "Property type impacts occupancy, ADR, customer target and sustainability.",

  aiInsightIT:
    "Ville, attici e immobili premium tendono ad avere ADR superiori ma maggiore volatilità.",

  aiInsightEN:
    "Villas, penthouses and premium properties usually achieve higher ADR but higher volatility.",

  warningIT:
    "⚠️ Alcune tipologie risultano più sensibili alla stagionalità.",

  warningEN:
    "⚠️ Some property types are more sensitive to seasonality.",

  related: [
    "luxuryFeatures",
    "guestCapacity",
    "locationQuality"
  ]

},

// =============================================
// 💎 LUXURY FEATURES
// =============================================

luxuryFeatures: {

  priority: 9,

  category: "premium",

  scoreWeight: 1.7,

  semanticWeight: 2.0,

  decisionWeight: 1.8,

  executiveWeight: 1.9,

  importance: "core",

  aiBehavior: {

    investorFocus: true,

    compareRequired: true,

    benchmarkRequired: true

  },

  responseStyle: {

    tone: "premium",

    useWarnings: false,

    concise: false

  },

  keywords: [

    "jacuzzi",
    "spa",
    "piscina",

    "vista mare",
    "sea view",

    "terrazza",
    "balcone",

    "lusso",
    "luxury",

    "design",
    "premium"

  ],

  aiTitleIT:
    "💎 Premium Features",

  aiTitleEN:
    "💎 Premium Features",

  aiSummaryIT:
    "Feature premium possono aumentare ADR, recensioni e posizionamento del listing.",

  aiSummaryEN:
    "Premium features may improve ADR, reviews and listing positioning.",

  aiInsightIT:
    "Jacuzzi, terrazze e vista mare aumentano fortemente il valore percepito.",

  aiInsightEN:
    "Jacuzzis, terraces and sea views strongly increase perceived value.",

  warningIT:
    "⚠️ Immobili premium richiedono gestione e manutenzione superiori.",

  warningEN:
    "⚠️ Premium properties require higher maintenance and management.",

  related: [
    "averageNightPrice",
    "guestExperience",
    "marketDemand"
  ]

},

// =============================================
// 📍 LOCATION QUALITY
// =============================================

locationQuality: {

  priority: 10,

  category: "location",

  scoreWeight: 1.8,

  semanticWeight: 2.0,

  decisionWeight: 2.0,

  executiveWeight: 1.8,

  importance: "core",

  aiBehavior: {

    investorFocus: true,

    compareRequired: true,

    benchmarkRequired: true

  },

  responseStyle: {

    tone: "executive",

    useWarnings: true,

    concise: false

  },

  keywords: [

    "metro",
    "stazione",

    "centro storico",
    "centro città",

    "mare",
    "spiaggia",

    "quartiere premium",
    "zona turistica",

    "vicino aeroporto",
    "vicino centro"

  ],

  aiTitleIT:
    "📍 Qualità della Location",

  aiTitleEN:
    "📍 Location Quality",

  aiSummaryIT:
    "La posizione dell’immobile è uno dei fattori più importanti nella redditività short-rent.",

  aiSummaryEN:
    "Property location is one of the most important factors in short-rent profitability.",

  aiInsightIT:
    "Location premium tendono ad avere maggiore resilienza e occupazione media.",

  aiInsightEN:
    "Premium locations usually achieve stronger resilience and occupancy.",

  warningIT:
    "⚠️ Zone deboli possono limitare crescita ADR e occupazione.",

  warningEN:
    "⚠️ Weak areas may limit ADR and occupancy growth.",

  related: [
    "marketDemand",
    "occupancy",
    "averageNightPrice"
  ]

},

// =============================================
// 🔨 RENOVATION IMPACT
// =============================================

renovationImpact: {

  priority: 8,

  category: "property-condition",

  scoreWeight: 1.4,

  semanticWeight: 1.7,

  decisionWeight: 1.8,

  executiveWeight: 1.5,

  importance: "secondary",

  aiBehavior: {

    investorFocus: true,

    compareRequired: false,

    benchmarkRequired: false

  },

  responseStyle: {

    tone: "analytical",

    useWarnings: true,

    concise: false

  },

  keywords: [

    "ristrutturato",
    "nuovo",

    "da ristrutturare",
    "modernizzato",

    "renovated",
    "old property"

  ],

  aiTitleIT:
    "🔨 Stato Immobile",

  aiTitleEN:
    "🔨 Property Condition",

  aiSummaryIT:
    "Lo stato dell’immobile influenza recensioni, pricing e costi operativi.",

  aiSummaryEN:
    "Property condition impacts reviews, pricing and operational costs.",

  aiInsightIT:
    "Immobili moderni tendono ad avere migliori recensioni e minori costi manutentivi.",

  aiInsightEN:
    "Modern properties usually achieve stronger reviews and lower maintenance costs.",

  warningIT:
    "⚠️ Immobili datati possono aumentare costi nascosti e recensioni negative.",

  warningEN:
    "⚠️ Older properties may increase hidden costs and negative reviews.",

  related: [
    "guestExperience",
    "hiddenCosts",
    "operatingMargin"
  ]

},

// =============================================
// 👥 GUEST CAPACITY
// =============================================

guestCapacity: {

  priority: 8,

  category: "capacity",

  scoreWeight: 1.3,

  semanticWeight: 1.5,

  decisionWeight: 1.6,

  executiveWeight: 1.4,

  importance: "secondary",

  aiBehavior: {

    investorFocus: true,

    compareRequired: true,

    benchmarkRequired: false

  },

  responseStyle: {

    tone: "analytical",

    useWarnings: false,

    concise: true

  },

  keywords: [

    "2 ospiti",
    "4 ospiti",
    "6 ospiti",

    "posti letto",
    "family friendly",

    "gruppi",
    "famiglie"

  ],

  aiTitleIT:
    "👥 Capacità Ospiti",

  aiTitleEN:
    "👥 Guest Capacity",

  aiSummaryIT:
    "La capacità dell’immobile influenza target clienti e redditività.",

  aiSummaryEN:
    "Guest capacity impacts customer targeting and profitability.",

  aiInsightIT:
    "Immobili adatti a famiglie o gruppi possono ottenere ADR più elevati.",

  aiInsightEN:
    "Properties suitable for families or groups may achieve higher ADR.",

  related: [
    "occupancy",
    "averageNightPrice",
    "propertyType"
  ]

},

// =============================================
// ⚡ ENERGY CLASS
// =============================================

energyClass: {

  priority: 7,

  category: "efficiency",

  scoreWeight: 1.2,

  semanticWeight: 1.4,

  decisionWeight: 1.5,

  executiveWeight: 1.3,

  importance: "secondary",

  aiBehavior: {

    investorFocus: true,

    sustainabilityCheck: true,

    benchmarkRequired: false

  },

  responseStyle: {

    tone: "analytical",

    useWarnings: true,

    concise: true

  },

  keywords: [

    "classe energetica",
    "classe a",
    "classe b",

    "efficientamento",
    "consumi",

    "energy class"

  ],

  aiTitleIT:
    "⚡ Classe Energetica",

  aiTitleEN:
    "⚡ Energy Class",

  aiSummaryIT:
    "La classe energetica influenza costi operativi e sostenibilità futura.",

  aiSummaryEN:
    "Energy class impacts operating costs and long-term sustainability.",

  aiInsightIT:
    "Immobili efficienti riducono consumi e migliorano sostenibilità economica.",

  aiInsightEN:
    "Efficient properties reduce consumption and improve financial sustainability.",

  warningIT:
    "⚠️ Immobili inefficienti possono aumentare costi nel lungo periodo.",

  warningEN:
    "⚠️ Inefficient properties may increase long-term costs.",

  related: [
    "hiddenCosts",
    "operatingMargin",
    "cashflow"
  ]

}

});

// Production: nessun log
