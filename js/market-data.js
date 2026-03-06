// ============================================
// RENDIMENTOBB – MARKET DATA ENGINE v2
// Expanded Italian Cities + Benchmark Ready
// ============================================

window.RB_MARKET_DATA = {

  napoli: {
    city: "Napoli",
    price: 110,
    occupancy: 0.71,
    annualRevenue: 28500
  },

  roma: {
    city: "Roma",
    price: 145,
    occupancy: 0.76,
    annualRevenue: 40200
  },

  milano: {
    city: "Milano",
    price: 150,
    occupancy: 0.72,
    annualRevenue: 39400
  },

  firenze: {
    city: "Firenze",
    price: 135,
    occupancy: 0.74,
    annualRevenue: 36500
  },

  venezia: {
    city: "Venezia",
    price: 165,
    occupancy: 0.75,
    annualRevenue: 45200
  },

  bologna: {
    city: "Bologna",
    price: 125,
    occupancy: 0.70,
    annualRevenue: 31900
  },

  torino: {
    city: "Torino",
    price: 105,
    occupancy: 0.66,
    annualRevenue: 25300
  },

  verona: {
    city: "Verona",
    price: 128,
    occupancy: 0.72,
    annualRevenue: 33700
  },

  bari: {
    city: "Bari",
    price: 95,
    occupancy: 0.68,
    annualRevenue: 23600
  },

  palermo: {
    city: "Palermo",
    price: 98,
    occupancy: 0.70,
    annualRevenue: 25000
  },

  catania: {
    city: "Catania",
    price: 92,
    occupancy: 0.69,
    annualRevenue: 23100
  },

  genova: {
    city: "Genova",
    price: 105,
    occupancy: 0.67,
    annualRevenue: 25700
  },

  pisa: {
    city: "Pisa",
    price: 115,
    occupancy: 0.72,
    annualRevenue: 30100
  },

  sorrento: {
    city: "Sorrento",
    price: 170,
    occupancy: 0.74,
    annualRevenue: 45900
  },

  como: {
    city: "Como",
    price: 180,
    occupancy: 0.71,
    annualRevenue: 46600
  },

  taormina: {
    city: "Taormina",
    price: 185,
    occupancy: 0.73,
    annualRevenue: 49200
  },

  matera: {
    city: "Matera",
    price: 120,
    occupancy: 0.70,
    annualRevenue: 30600
  },

  lecce: {
    city: "Lecce",
    price: 110,
    occupancy: 0.69,
    annualRevenue: 27700
  },

  trento: {
    city: "Trento",
    price: 115,
    occupancy: 0.68,
    annualRevenue: 28500
  },

  trieste: {
    city: "Trieste",
    price: 118,
    occupancy: 0.69,
    annualRevenue: 29700
  }

};


// ================================
// APPLY MARKET DATA
// ================================

window.applyMarketData = function(city){

  const data = RB_MARKET_DATA[city];

  if(!data) return;

  const priceInput = document.getElementById("priceNight");
  const occInput = document.getElementById("occupancy");

  if(priceInput){
    priceInput.value = data.price;
  }

  if(occInput){
    occInput.value = Math.round(data.occupancy * 100);
  }

  if(typeof calculate === "function"){
    calculate();
  }

};

// ===============================
// B&B MARKET DATA
// ===============================

export const marketData = {

italy:{
roi:8.4,
occupancy:62,
adr:118
},

rome:{
roi:9.8,
occupancy:69,
adr:142
},

naples:{
roi:10.2,
occupancy:66,
adr:134
},

milan:{
roi:8.9,
occupancy:71,
adr:156
},

florence:{
roi:11.1,
occupancy:73,
adr:168
}

};


// ================================
// GET MARKET BENCHMARK
// (STEP 2 READY)
// ================================

window.getMarketBenchmark = function(city){

  const data = RB_MARKET_DATA[city];

  if(!data) return null;

  return {
    city: data.city,
    avgNightPrice: data.price,
    occupancyRate: data.occupancy,
    estimatedRevenue: data.annualRevenue
  };

};
