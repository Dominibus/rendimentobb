/* =====================================
🔥 RENDIMENTOBB – UI ENGINE PRO
Silicon Valley SaaS / Conversion Focus
===================================== */


/* =====================
🧠 STATE
===================== */

window.UI_STATE = {
  rendered: false,
  lastData: null
};


/* =====================
🧹 RESET UI (CRITICO)
===================== */

export function clearUI(){

  const sections = [
    "results",
    "roi-dashboard",
    "investment-metrics",
    "advanced-analysis"
  ];

  sections.forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.innerHTML = "";
  });

  window.UI_STATE.rendered = false;

}


/* =====================
🎯 MAIN RENDER
===================== */

export function renderAll(data){

  if(!data) return;

  clearUI();

  window.UI_STATE.lastData = data;

  renderHeroResult(data);
  renderMainMetrics(data);
  renderCharts(data);
  renderRiskSection(data);
  renderUpgradeBlock(data);

  window.UI_STATE.rendered = true;

}


/* =====================
🔥 HERO RESULT (IMPATTO)
===================== */

function renderHeroResult(data){

  const container = document.getElementById("roi-dashboard");
  if(!container) return;

  const roi = Number(data.roi || 0).toFixed(1);
  const profit = Number(data.netAfterMortgage || 0).toLocaleString();

  container.innerHTML = `
    <div class="rb-hero-result">

      <h2>🔥 Investimento ${roi > 12 ? "eccellente" : roi > 7 ? "valido" : "rischioso"}</h2>

      <div class="rb-roi-big">${roi}%</div>

      <p>Profitto annuo stimato</p>
      <strong>${profit} €</strong>

      ${!isProUser() ? renderInlineUpgrade() : ""}

    </div>
  `;

}


/* =====================
📊 METRICHE PRINCIPALI
===================== */

function renderMainMetrics(data){

  const container = document.getElementById("investment-metrics");
  if(!container) return;

  const monthly = Math.round((data.netAfterMortgage || 0) / 12);
  const yearly = Math.round(data.netAfterMortgage || 0);
  const breakEven = data.breakEven || "—";

  container.innerHTML = `
    <div class="rb-metrics-grid">

      ${metricCard("Profitto mensile", monthly + " €")}
      ${metricCard("Profitto annuo", yearly + " €")}
      ${metricCard("Break-even", breakEven)}
      ${metricCard("ROI stimato", data.roi.toFixed(1) + "%")}

    </div>
  `;

}


function metricCard(title, value){
  return `
    <div class="rb-card">
      <div class="rb-card-title">${title}</div>
      <div class="rb-card-value">${value}</div>
    </div>
  `;
}


/* =====================
📈 CHARTS
===================== */

function renderCharts(data){

  const container = document.getElementById("results");
  if(!container) return;

  container.innerHTML = `
    <div class="rb-chart-box">

      <h3>Previsione ricavi</h3>

      <canvas id="roiChart"></canvas>

      ${!isProUser() ? renderBlurOverlay() : ""}

    </div>
  `;

}


/* =====================
⚠️ RISCHIO
===================== */

function renderRiskSection(data){

  const container = document.getElementById("advanced-analysis");
  if(!container) return;

  const risk = data.riskScore || 50;

  container.innerHTML = `
    <div class="rb-risk-box">

      <h3>⚠️ Analisi rischio</h3>

      <div class="rb-risk-value">${risk}/100</div>

      <p>${risk < 40 ? "Basso rischio" : risk < 70 ? "Rischio medio" : "Alto rischio"}</p>

      ${!isProUser() ? renderUpgradeCTA() : ""}

    </div>
  `;

}


/* =====================
💰 BLOCCO UPGRADE (CORE)
===================== */

function renderUpgradeBlock(){

  const container = document.getElementById("results");
  if(!container) return;

  if(isProUser()) return;

  container.innerHTML += renderUpgradeCTA();

}


/* =====================
🔥 CTA PRINCIPALE
===================== */

export function renderUpgradeCTA(){

  return `
    <div class="rb-upgrade">

      <h2>🚫 Stai prendendo una decisione al buio</h2>

      <p>
      Senza questi dati potresti perdere migliaia di euro:
      </p>

      <ul>
        <li>✔ ROI reale</li>
        <li>✔ Mutuo e cashflow</li>
        <li>✔ Scenario rischio</li>
        <li>✔ Report professionale</li>
      </ul>

      <button onclick="startPlanPurchase('pro')" class="btn-primary">
        🔥 Sblocca ora – 29€
      </button>

      <p class="rb-note">✔ Accesso immediato • Nessun vincolo</p>

    </div>
  `;

}


/* =====================
🟢 CTA INLINE (soft)
===================== */

function renderInlineUpgrade(){

  return `
    <div class="rb-inline-upgrade">
      🔒 Dati parziali – sblocca analisi completa
    </div>
  `;

}


/* =====================
🔒 OVERLAY BLUR
===================== */

function renderBlurOverlay(){

  return `
    <div class="rb-overlay">

      <div class="rb-overlay-content">

        <h3>🔒 Analisi completa bloccata</h3>

        <button onclick="startPlanPurchase('pro')" class="btn-primary">
          Sblocca ora
        </button>

      </div>

    </div>
  `;

}


/* =====================
👤 USER CHECK
===================== */

function isProUser(){

  return [
    "pro",
    "investor",
    "pro_yearly"
  ].includes(window.currentPlan);

}
