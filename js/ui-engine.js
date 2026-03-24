export function renderExecutiveKPI(result){

const roiEl = document.getElementById("roi-live");
const profitEl = document.getElementById("profit-live");
const revenueEl = document.getElementById("revenue-live");

// 🔥 SAFE FIX (anti crash)
const roi = Number(result?.roi) || 0;
const profit = Number(result?.netAfterMortgage || result?.profit) || 0;
const revenue = Number(result?.gross || result?.revenue) || 0;

if(roiEl) roiEl.innerText = roi.toFixed(1) + "%";
if(profitEl) profitEl.innerText = profit.toLocaleString("it-IT",{style:"currency",currency:"EUR"});
if(revenueEl) revenueEl.innerText = revenue.toLocaleString("it-IT",{style:"currency",currency:"EUR"});

}
