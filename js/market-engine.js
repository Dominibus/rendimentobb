import "./market-data.js";

/* ================= FORMATTERS ================= */

function formatCurrency(value){
  const lang = window.RB_LANG?.current || "it";

  return value.toLocaleString(
    lang === "en" ? "en-US" : "it-IT",
    {
      style: "currency",
      currency: "EUR"
    }
  );
}

function formatPercent(value){
  return Math.round(value * 100) + "%";
}

/* ================= TEXT ENGINE ================= */

function getText(){
  const lang = window.RB_LANG?.current || "it";

  return {
    revenue: lang === "en" ? "Estimated revenue" : "Ricavi stimati",
    average: lang === "en" ? "Market average" : "Media mercato",
    comparison: lang === "en" ? "Comparison" : "Confronto",
    above: lang === "en" ? "Above average" : "Sopra media",
    below: lang === "en" ? "Below average" : "Sotto media"
  };
}

/* ================= MAIN FUNCTION ================= */

export function renderMarketBenchmark(city){

  console.log("📊 Render Market:", city);

  // 🔥 sicurezza dati
  if(!window.RB_MARKET_DATA){
    console.warn("RB_MARKET_DATA non pronto → retry");
    setTimeout(() => renderMarketBenchmark(city), 200);
    return;
  }

  const data = window.RB_MARKET_DATA[city];

  if(!data){
    console.warn("❌ Dati mercato mancanti per:", city);
    return;
  }

  /* ================= STATIC KPI ================= */

  const priceEl = document.getElementById("benchmark-price");
  const occEl = document.getElementById("benchmark-occupancy");
  const revenueEl = document.getElementById("benchmark-revenue");

  if(priceEl){
    priceEl.innerText = formatCurrency(data.price);
  }

  if(occEl){
    occEl.innerText = formatPercent(data.occupancy);
  }

  if(revenueEl){
    revenueEl.innerText = formatCurrency(data.annualRevenue);
  }

  /* ================= MARKET COMPARISON ================= */

  const container = document.getElementById("market-comparison");
  if(!container) return;

  const text = getText();

  // 🔥 prende il valore simulato dal tuo ROI engine
  const userRevenue = window.currentRevenue || data.annualRevenue;

  const isAbove = userRevenue >= data.annualRevenue;

  const color = isAbove ? "#10b981" : "#ef4444";
  const badge = isAbove ? text.above : text.below;

  container.innerHTML = `
  
  <div style="
    padding:18px;
    border-radius:14px;
    background:linear-gradient(180deg,#ffffff,#f8fafc);
    box-shadow:0 10px 30px rgba(0,0,0,0.05);
  ">

    <div style="
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:15px;
    ">

      <div style="text-align:center">
        <div style="font-size:12px;color:#64748b;">
          ${text.revenue}
        </div>
        <div style="font-size:16px;font-weight:600;">
          ${formatCurrency(userRevenue)}
        </div>
      </div>

      <div style="text-align:center">
        <div style="font-size:12px;color:#64748b;">
          ${text.average}
        </div>
        <div style="font-size:16px;font-weight:600;">
          ${formatCurrency(data.annualRevenue)}
        </div>
      </div>

      <div style="text-align:center">
        <div style="font-size:12px;color:#64748b;">
          ${text.comparison}
        </div>
        <div style="
          font-size:15px;
          font-weight:700;
          color:${color};
        ">
          ${badge}
        </div>
      </div>

    </div>

  </div>
  `;
}

/* ================= AUTO RE-RENDER ================= */

// 🔥 cambia lingua live
document.addEventListener("rb_language_changed", () => {
  if(window.currentCity){
    renderMarketBenchmark(window.currentCity);
  }
});

// 🔥 aggiorna quando cambia simulazione
document.addEventListener("rb_simulation_updated", () => {
  if(window.currentCity){
    renderMarketBenchmark(window.currentCity);
  }
});
