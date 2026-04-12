/* =====================================
🔥 RENDIMENTOBB – UI ENGINE PRO BILINGUE
===================================== */


/* =====================
🧠 STATE
===================== */

window.UI_STATE = {
  rendered: false,
  lastData: null
};


/* =====================
🌐 TRIGGER LANGUAGE
===================== */

document.addEventListener("rb_language_changed", () => {
  if(window.UI_STATE.lastData){
    renderAll(window.UI_STATE.lastData);
  }
});


/* =====================
🧹 RESET UI
===================== */

export function clearUI(){

  ["results","roi-dashboard","investment-metrics","advanced-analysis"]
  .forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.innerHTML = "";
  });

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
  renderCharts();
  renderRiskSection(data);
  renderUpgradeBlock();

}


/* =====================
🔥 HERO RESULT
===================== */

function renderHeroResult(data){

  const container = document.getElementById("roi-dashboard");
  if(!container) return;

  const roi = Number(data.roi || 0).toFixed(1);
  const profit = Number(data.netAfterMortgage || 0).toLocaleString();

  const label =
    roi > 12 ? {
      it:"🔥 Investimento eccellente",
      en:"🔥 Excellent investment"
    } :
    roi > 7 ? {
      it:"👍 Investimento valido",
      en:"👍 Good investment"
    } : {
      it:"⚠️ Investimento rischioso",
      en:"⚠️ Risky investment"
    };

  container.innerHTML = `
    <div class="rb-hero-result">

      <h2 data-it="${label.it}" data-en="${label.en}"></h2>

      <div class="rb-roi-big">${roi}%</div>

      <p data-it="Profitto annuo stimato"
         data-en="Estimated yearly profit"></p>

      <strong>${profit} €</strong>

      ${!isProUser() ? renderInlineUpgrade() : ""}

    </div>
  `;

}


/* =====================
📊 METRICHE
===================== */

function renderMainMetrics(data){

  const container = document.getElementById("investment-metrics");
  if(!container) return;

  const monthly = Math.round((data.netAfterMortgage || 0) / 12);
  const yearly = Math.round(data.netAfterMortgage || 0);

  container.innerHTML = `
    <div class="rb-metrics-grid">

      ${metricCard("Profitto mensile","Monthly profit", monthly+" €")}
      ${metricCard("Profitto annuo","Yearly profit", yearly+" €")}
      ${metricCard("Break-even","Break-even", data.breakEven || "—")}
      ${metricCard("ROI stimato","Estimated ROI", data.roi.toFixed(1)+"%")}

    </div>
  `;

}


function metricCard(it,en,value){
  return `
    <div class="rb-card">
      <div class="rb-card-title" data-it="${it}" data-en="${en}"></div>
      <div class="rb-card-value">${value}</div>
    </div>
  `;
}


/* =====================
📈 CHART
===================== */

function renderCharts(){

  const container = document.getElementById("results");
  if(!container) return;

  container.innerHTML = `
    <div class="rb-chart-box">

      <h3 data-it="Previsione ricavi"
          data-en="Revenue forecast"></h3>

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

  const label =
    risk < 40 ? {
      it:"Basso rischio",
      en:"Low risk"
    } :
    risk < 70 ? {
      it:"Rischio medio",
      en:"Medium risk"
    } : {
      it:"Alto rischio",
      en:"High risk"
    };

  container.innerHTML = `
    <div class="rb-risk-box">

      <h3 data-it="⚠️ Analisi rischio"
          data-en="⚠️ Risk analysis"></h3>

      <div class="rb-risk-value">${risk}/100</div>

      <p data-it="${label.it}" data-en="${label.en}"></p>

      ${!isProUser() ? renderUpgradeCTA() : ""}

    </div>
  `;

}


/* =====================
💰 CTA UPGRADE
===================== */

export function renderUpgradeCTA(){

  return `
    <div class="rb-upgrade">

      <h2 data-it="🚫 Stai prendendo una decisione al buio"
          data-en="🚫 You are making a decision blindly"></h2>

      <p data-it="Senza questi dati potresti perdere migliaia di euro"
         data-en="Without this data you could lose thousands"></p>

      <ul>
        <li data-it="✔ ROI reale" data-en="✔ Real ROI"></li>
        <li data-it="✔ Mutuo e cashflow" data-en="✔ Mortgage & cashflow"></li>
        <li data-it="✔ Scenario rischio" data-en="✔ Risk scenarios"></li>
        <li data-it="✔ Report professionale" data-en="✔ Professional report"></li>
      </ul>

      <button onclick="startPlanPurchase('pro')" class="btn-primary"
        data-it="🔥 Sblocca ora – 29€"
        data-en="🔥 Unlock now – €29"></button>

      <p class="rb-note"
        data-it="✔ Accesso immediato • Nessun vincolo"
        data-en="✔ Instant access • No commitment"></p>

    </div>
  `;

}


/* =====================
🟢 INLINE UPGRADE
===================== */

function renderInlineUpgrade(){

  return `
    <div class="rb-inline-upgrade"
      data-it="🔒 Dati parziali – sblocca analisi completa"
      data-en="🔒 Partial data – unlock full analysis">
    </div>
  `;

}


/* =====================
🔒 OVERLAY
===================== */

function renderBlurOverlay(){

  return `
    <div class="rb-overlay">

      <div class="rb-overlay-content">

        <h3 data-it="🔒 Analisi completa bloccata"
            data-en="🔒 Full analysis locked"></h3>

        <button onclick="startPlanPurchase('pro')" class="btn-primary"
          data-it="Sblocca ora"
          data-en="Unlock now"></button>

      </div>

    </div>
  `;

}


/* =====================
👤 USER CHECK
===================== */

function isProUser(){
  return ["pro","investor","pro_yearly"].includes(window.currentPlan);
}
