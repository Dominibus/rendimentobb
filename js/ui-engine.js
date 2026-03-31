export function renderExecutiveKPI(result){

// ================= 🔥 BLOCCO CRITICO =================
if(!window.firebaseReady){
  console.log("⏳ Firebase non pronto → skip KPI render");
  return;
}

// ================= SAFE DATA =================
const roi = Number(result?.roi) || 0;
const profit = Number(result?.netAfterMortgage || result?.profit) || 0;
const revenue = Number(result?.gross || result?.revenue) || 0;

// ================= ELEMENTS =================
const roiEl = document.getElementById("roi-live");
const profitEl = document.getElementById("profit-live");
const revenueEl = document.getElementById("revenue-live");
const badgeEl = document.getElementById("roi-badge");
const verdictEl = document.getElementById("roi-verdict");
const statusEl = document.getElementById("investment-status");
const riskEl = document.getElementById("risk-bar");

// ================= PLAN =================
const isPro = window.isPro?.() || false;

// ================= HELPERS =================
function getROIColor(v){
  if(v < 5) return "#ef4444";
  if(v < 10) return "#f59e0b";
  return "#10b981";
}

function animateValue(el, start, end, duration){
  if(!el) return;

  let startTime = null;

  function animation(t){
    if(!startTime) startTime = t;

    const progress = Math.min((t - startTime)/duration,1);
    const value = start + (end-start)*progress;

    el.innerText = value.toFixed(1) + "%";

    if(progress < 1) requestAnimationFrame(animation);
  }

  requestAnimationFrame(animation);
}

// ================= ROI =================
if(roiEl){
  roiEl.style.color = getROIColor(roi);
  animateValue(roiEl, 0, roi, 800);
}

// ================= PROFIT =================
if(profitEl){
  profitEl.innerText = profit.toLocaleString(
    window.RB_LANG?.current === "en" ? "en-US" : "it-IT",
    {style:"currency",currency:"EUR"}
  );
}

// ================= REVENUE =================
if(revenueEl){
  revenueEl.innerText = revenue.toLocaleString(
    window.RB_LANG?.current === "en" ? "en-US" : "it-IT",
    {style:"currency",currency:"EUR"}
  );
}

// ================= BADGE =================
if(badgeEl){

  let text = "";
  let color = "#10b981";

  if(roi < 5){
    text = "❌ " + t("Investimento rischioso","Risky investment");
    color = "#ef4444";
  }
  else if(roi < 10){
    text = "⚠️ " + t("Da ottimizzare","Needs optimization");
    color = "#f59e0b";
  }
  else{
    text = "🔥 " + t("Investimento interessante","Strong investment");
  }

  badgeEl.innerText = text;
  badgeEl.style.color = color;
}

// ================= VERDICT =================
if(verdictEl){

  let text = "";

  if(roi < 5){
    text = t(
      "❌ Alto rischio: investimento non sostenibile",
      "❌ High risk investment"
    );
  }
  else if(roi < 10){
    text = t(
      "⚠️ Margine basso: ottimizzazione necessaria",
      "⚠️ Needs optimization"
    );
  }
  else{
    text = t(
      "🔥 Ottimo potenziale sopra media mercato",
      "🔥 Strong investment"
    );
  }

  verdictEl.innerText = text;
}

// ================= STATUS =================
if(statusEl){

  let text = "";
  let color = "#10b981";

  if(roi < 5){
    text = "❌ " + t("Investimento rischioso","Risky investment");
    color = "#ef4444";
  }
  else if(roi < 10){
    text = "⚠️ " + t("Da ottimizzare","Needs optimization");
    color = "#f59e0b";
  }
  else{
    text = "🔥 " + t("Ottima opportunità","Strong opportunity");
  }

  statusEl.innerHTML = `<div style="color:${color};font-weight:600">${text}</div>`;
}

// ================= RISK =================
if(riskEl){

  let risk = Math.max(20, Math.min(90, 100 - roi));

  let color = "#10b981";
  if(risk > 70) color = "#ef4444";
  else if(risk > 40) color = "#f59e0b";

  riskEl.innerHTML = `
  <div style="margin-top:10px">
    <div style="font-size:12px;margin-bottom:6px;opacity:0.7">
      ${t("Livello rischio investimento","Investment risk level")}
    </div>

    <div style="background:#e5e7eb;height:8px;border-radius:6px;overflow:hidden">
      <div style="width:${risk}%;height:100%;background:${color}"></div>
    </div>
  </div>
  `;
}

// ================= 🔓 PRO UNLOCK =================
if(isPro){

  document.querySelectorAll(`
    .pro-blur,
    .locked,
    .premium-lock
  `).forEach(el=>{
    el.classList.remove("pro-blur","locked","premium-lock");
    el.style.filter = "none";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";
  });

  document.querySelectorAll("[data-paywall]").forEach(el=>el.remove());
}

// ================= 🔒 FREE LOCK =================
else{

  document.querySelectorAll(".pro-only").forEach(el=>{
    el.classList.add("pro-blur");
  });
}

// ================= SAVE LAST =================
window.lastAnalysisData = result;

}

document.addEventListener("rb_plan_loaded", () => {

  console.log("🔄 Re-run KPI after plan ready");

  if(window.lastAnalysisData){
    renderExecutiveKPI(window.lastAnalysisData);
  }

});
