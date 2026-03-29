export function renderExecutiveKPI(result){

const roiEl = document.getElementById("roi-live");
const profitEl = document.getElementById("profit-live");
const revenueEl = document.getElementById("revenue-live");

// ================= SAFE DATA =================
const roi = Number(result?.roi) || 0;
const profit = Number(result?.netAfterMortgage || result?.profit) || 0;
const revenue = Number(result?.gross || result?.revenue) || 0;

// ================= PLAN CHECK =================
const isPro =
  window.currentPlan === "pro" ||
  window.currentPlan === "investor" ||
  window.currentPlan === "pro_yearly";

// ================= ROI COLOR =================
function getROIColor(value){
  if(value < 5) return "#ef4444";
  if(value < 10) return "#f59e0b";
  return "#10b981";
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

  let textIT = "";
  let textEN = "";
  let color = "#10b981";

  if(roi < 5){
    textIT = "❌ Investimento rischioso";
    textEN = "❌ Risky investment";
    color = "#ef4444";
  }
  else if(roi < 10){
    textIT = "⚠️ Da ottimizzare";
    textEN = "⚠️ Needs optimization";
    color = "#f59e0b";
  }
  else{
    textIT = "🔥 Investimento interessante";
    textEN = "🔥 Strong investment";
    color = "#10b981";
  }

  badgeEl.innerHTML = `
    <span data-it="${textIT}" data-en="${textEN}">
      ${window.RB_LANG?.current === "en" ? textEN : textIT}
    </span>
  `;
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
      <div style="font-size:12px;margin-bottom:6px;opacity:0.7"
      data-it="Livello rischio investimento"
      data-en="Investment risk level">
      ${t("Livello rischio investimento","Investment risk level")}
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

// ================= ROI =================

if(roiEl){
  roiEl.style.color = getROIColor(roi);
  animateValue(roiEl, 0, roi, 800);
}

// ================= STATUS =================

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
    <div data-it="${textIT}" data-en="${textEN}"
    style="font-weight:600;margin-top:8px;color:${color};font-size:14px;">
      ${window.RB_LANG?.current === "en" ? textEN : textIT}
    </div>
  `;
}

// ================= PROFIT / REVENUE =================

if(profitEl){
  profitEl.innerText = profit.toLocaleString(
    window.RB_LANG?.current === "en" ? "en-US" : "it-IT",
    {style:"currency",currency:"EUR"}
  );
}

if(revenueEl){
  revenueEl.innerText = revenue.toLocaleString(
    window.RB_LANG?.current === "en" ? "en-US" : "it-IT",
    {style:"currency",currency:"EUR"}
  );
}

// ================= 🚀 PRO BADGE (WOW EFFECT) =================

const container = document.getElementById("executive-kpi");

if(isPro && container && !container.querySelector(".pro-badge")){

  const proBadge = document.createElement("div");
  proBadge.classList.add("pro-badge");

  proBadge.innerHTML = `
  <div style="
  margin-bottom:12px;
  padding:12px;
  border-radius:12px;
  background:linear-gradient(135deg,#10b981,#059669);
  color:white;
  font-size:13px;
  font-weight:600;
  text-align:center;
  ">
  ${t(
  "🚀 Analisi PRO attiva – Intelligenza investimento sbloccata",
  "🚀 PRO Analysis Active – Investment intelligence unlocked"
  )}
  </div>
  `;

  container.prepend(proBadge);
}

// ================= 🔥 FREE → PSYCHO TRIGGER =================

if(!isPro){

  const upsell = document.getElementById("smart-upsell");

  if(upsell){

    upsell.innerHTML = `
    <div style="
    margin-top:15px;
    padding:16px;
    border-radius:14px;
    background:linear-gradient(135deg,#0f172a,#1e293b);
    color:white;
    text-align:center;
    ">

    <div style="font-weight:600;font-size:15px;">
    ${t(
    "🚨 Stai prendendo una decisione al buio",
    "🚨 You are making a decision blindly"
    )}
    </div>

    <div style="font-size:13px;margin-top:6px;opacity:0.8;">
    ${t(
    "Questo investimento potrebbe farti perdere migliaia di euro",
    "This investment could cost you thousands"
    )}
    </div>

    <button onclick="openUpgradeModal()" style="
    margin-top:12px;
    padding:10px 20px;
    border-radius:10px;
    background:#10b981;
    border:none;
    color:white;
    font-weight:600;
    cursor:pointer;
    ">
    ${t("🔥 Sblocca analisi completa","🔥 Unlock full analysis")}
    </button>

    </div>
    `;
  }
}

// ================= 🔥 PLAN UI CONTROL =================

// FREE
if(!isPro){
  document.querySelectorAll(".pro-only").forEach(el=>{
    el.classList.add("pro-blur");
  });
}

// PRO
if(isPro){
  document.querySelectorAll(".pro-blur").forEach(el=>{
    el.classList.remove("pro-blur");
  });

  document.querySelectorAll("[data-paywall]").forEach(el=>{
    el.remove();
  });
}

}
