export function renderExecutiveKPI(roi,profit,revenue,equity){

const roiEl = document.getElementById("roi-live");
const profitEl = document.getElementById("profit-live");
const revenueEl = document.getElementById("revenue-live");

if(roiEl) roiEl.innerText = roi.toFixed(1)+"%";
if(profitEl) profitEl.innerText = profit.toLocaleString("it-IT",{style:"currency",currency:"EUR"});
if(revenueEl) revenueEl.innerText = revenue.toLocaleString("it-IT",{style:"currency",currency:"EUR"});

}
