export function renderMarketBenchmark(city){

const data = window.RB_MARKET_DATA[city];

if(!data) return;

document.getElementById("benchmark-price").innerText =
data.price.toLocaleString("it-IT",{style:"currency",currency:"EUR"});

document.getElementById("benchmark-occupancy").innerText =
Math.round(data.occupancy*100)+"%";

document.getElementById("benchmark-revenue").innerText =
data.annualRevenue.toLocaleString("it-IT",{style:"currency",currency:"EUR"});

}
