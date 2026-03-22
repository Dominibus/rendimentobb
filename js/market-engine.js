export function renderMarketBenchmark(city){

  // 🔥 sicurezza globale
  if(!window.RB_MARKET_DATA){
    console.warn("RB_MARKET_DATA non disponibile");
    return;
  }

  const data = window.RB_MARKET_DATA[city];

  if(!data){
    console.warn("Dati mercato mancanti per:", city);
    return;
  }

  const priceEl = document.getElementById("benchmark-price");
  const occEl = document.getElementById("benchmark-occupancy");
  const revenueEl = document.getElementById("benchmark-revenue");

  if(priceEl){
    priceEl.innerText =
    data.price.toLocaleString("it-IT",{style:"currency",currency:"EUR"});
  }

  if(occEl){
    occEl.innerText =
    Math.round(data.occupancy*100)+"%";
  }

  if(revenueEl){
    revenueEl.innerText =
    data.annualRevenue.toLocaleString("it-IT",{style:"currency",currency:"EUR"});
  }

}
