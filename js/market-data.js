// ============================================
// RENDIMENTOBB – MARKET DATA ENGINE
// ============================================

const RB_MARKET_DATA = {

  napoli: {
    city: "Napoli",
    price: 110,
    occupancy: 0.71
  },

  roma: {
    city: "Roma",
    price: 145,
    occupancy: 0.76
  },

  milano: {
    city: "Milano",
    price: 150,
    occupancy: 0.72
  },

  firenze: {
    city: "Firenze",
    price: 135,
    occupancy: 0.74
  }

};


// ================================
// APPLY MARKET DATA
// ================================

window.applyMarketData = function(city){

  const data = RB_MARKET_DATA[city];

  if(!data) return;

  const priceInput = document.getElementById("avg-night-price");
  const occInput = document.getElementById("occupancy-rate");

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
