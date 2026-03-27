export function renderExecutiveKPI(result){

const roiEl = document.getElementById("roi-live");
const profitEl = document.getElementById("profit-live");
const revenueEl = document.getElementById("revenue-live");

// ================= SAFE DATA =================
const roi = Number(result?.roi) || 0;
const profit = Number(result?.netAfterMortgage || result?.profit) || 0;
const revenue = Number(result?.gross || result?.revenue) || 0;

// ================= ROI COLOR =================
function getROIColor(value){
  if(value < 5) return "#ef4444"; // rosso
  if(value < 10) return "#f59e0b"; // arancione
  return "#10b981"; // verde
}

// ================= ANIMATION =================
function animateValue(el, start, end, duration){

  let startTime = null;

  function animation(currentTime){
    if(!startTime) startTime = currentTime;

    const progress = Math.min((currentTime - startTime)/duration,1);
    const current = start + (end-start)*progress;

    el.innerText = current.toFixed(1) + "%";

    if(progress < 1){
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

// ================= ROI BADGE =================

const badgeEl = document.getElementById("roi-badge");

if(badgeEl){

  let text = "";
  let color = "#10b981";

  if(roi < 5){
    text = "❌ Investimento rischioso";
    color = "#ef4444";
  }
  else if(roi < 10){
    text = "⚠️ Da ottimizzare";
    color = "#f59e0b";
  }
  else{
    text = "🔥 Investimento interessante";
    color = "#10b981";
  }

  badgeEl.innerText = text;
  badgeEl.style.color = color;
}

// ================= RISK BAR =================

const riskEl = document.getElementById("risk-bar");

if(riskEl){

  let risk = 100 - roi;

  if(risk < 20) risk = 20;
  if(risk > 90) risk = 90;

  let color = "#10b981";

  if(risk > 70) color = "#ef4444";
  else if(risk > 40) color = "#f59e0b";

  riskEl.innerHTML = `
    <div style="margin-top:10px">

      <div style="font-size:12px;margin-bottom:6px;opacity:0.7">
        Livello rischio investimento
      </div>

      <div style="background:#e5e7eb;height:8px;border-radius:6px;overflow:hidden">
        <div style="
          width:${risk}%;
          height:100%;
          background:${color};
          transition:width 0.6s ease;
        "></div>
      </div>

    </div>
  `;
}  

// ================= APPLY =================

// ROI
if(roiEl){
  roiEl.style.color = getROIColor(roi);
  animateValue(roiEl, 0, roi, 800);
}

// ================= INVESTMENT STATUS =================

const statusEl = document.getElementById("investment-status");

if(statusEl){

  let textIT = "";
  let textEN = "";
  let color = "#10b981";

  if(roi < 5){
    textIT = "❌ Investimento rischioso";
    textEN = "❌ Risky investment";
    color = "#ef4444";
  }
  else if(roi < 10){
    textIT = "⚠️ Investimento da ottimizzare";
    textEN = "⚠️ Needs optimization";
    color = "#f59e0b";
  }
  else{
    textIT = "🔥 Investimento interessante";
    textEN = "🔥 Strong investment";
    color = "#10b981";
  }

  statusEl.innerHTML = `
    <div 
      data-it="${textIT}" 
      data-en="${textEN}"
      style="
        font-weight:600;
        margin-top:8px;
        color:${color};
        font-size:14px;
      ">
      ${textIT}
    </div>
  `;
}  

// PROFITTO
if(profitEl){
  profitEl.innerText = profit.toLocaleString("it-IT",{
    style:"currency",
    currency:"EUR"
  });
}

// RICAVI
if(revenueEl){
  revenueEl.innerText = revenue.toLocaleString("it-IT",{
    style:"currency",
    currency:"EUR"
  });
}

}
