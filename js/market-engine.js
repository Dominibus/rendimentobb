import "./market-data.js";

/* ================= FORMATTERS ================= */

function formatCurrency(value){
  const lang = window.RB_LANG?.current || "it";

  return (Number(value) || 0).toLocaleString(
    lang === "en" ? "en-US" : "it-IT",
    {
      style: "currency",
      currency: "EUR"
    }
  );
}

function formatPercent(value){
  return Math.round((Number(value) || 0) * 100) + "%";
}

/* ================= TEXT ENGINE ================= */

function getText(){
  const lang = window.RB_LANG?.current || "it";

  return {
    revenue: lang === "en" ? "Your revenue" : "Ricavi stimati",
    average: lang === "en" ? "Market average" : "Media mercato",
    comparison: lang === "en" ? "Performance" : "Performance",
    above: lang === "en" ? "Above market" : "Sopra media",
    below: lang === "en" ? "Below market" : "Sotto media",
    vs: lang === "en" ? "vs market" : "vs mercato"
  };
}

/* ================= SAFE CITY ================= */

function getSafeCity(city){

  if(city) return city;

  if(window.currentCity) return window.currentCity;

  const stored = localStorage.getItem("selected_city");
  if(stored) return stored;

  return "napoli"; // fallback sicuro
}

/* ================= MAIN FUNCTION ================= */

export function renderMarketBenchmark(inputCity){

  const city = getSafeCity(inputCity);

  console.log("📊 Render Market:", city);

  // 🔥 WAIT DATA
  if(!window.RB_MARKET_DATA){
    console.warn("⏳ RB_MARKET_DATA non pronto → retry");
    setTimeout(() => renderMarketBenchmark(city), 300);
    return;
  }

  const data = window.RB_MARKET_DATA[city];

  if(!data){
    console.warn("❌ Dati mercato mancanti per:", city);
    return;
  }

  const text = getText();

  /* ================= KPI STATIC ================= */

  const priceEl = document.getElementById("benchmark-price");
  const occEl = document.getElementById("benchmark-occupancy");
  const revenueEl = document.getElementById("benchmark-revenue");

  if(priceEl) priceEl.innerText = formatCurrency(data.price);
  if(occEl) occEl.innerText = formatPercent(data.occupancy);
  if(revenueEl) revenueEl.innerText = formatCurrency(data.annualRevenue);

  /* ================= USER DATA ================= */

  let userRevenue = Number(window.currentRevenue);

  // 🔥 fallback intelligente
  if(!userRevenue || userRevenue <= 0){
    userRevenue = data.annualRevenue;
  }

  /* ================= CALCOLI ================= */

  const marketRevenue = Number(data.annualRevenue);

  const diff = userRevenue - marketRevenue;
  const diffPerc = marketRevenue > 0
    ? ((diff / marketRevenue) * 100).toFixed(1)
    : 0;

  const isAbove = diff >= 0;

  const color = isAbove ? "#10b981" : "#ef4444";
  const badge = isAbove ? text.above : text.below;

  /* ================= UI ================= */

  const container = document.getElementById("market-comparison");
  if(!container) return;

  container.innerHTML = `

  <div style="
    padding:22px;
    border-radius:18px;
    background:linear-gradient(180deg,#ffffff,#f8fafc);
    box-shadow:0 20px 50px rgba(0,0,0,0.06);
    transition:all 0.3s ease;
  ">

    <div style="
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:18px;
      text-align:center;
    ">

      <!-- USER -->
      <div>
        <div style="font-size:12px;color:#64748b;">
          ${text.revenue}
        </div>
        <div style="font-size:18px;font-weight:700;">
          ${formatCurrency(userRevenue)}
        </div>
      </div>

      <!-- MARKET -->
      <div>
        <div style="font-size:12px;color:#64748b;">
          ${text.average}
        </div>
        <div style="font-size:18px;font-weight:700;">
          ${formatCurrency(marketRevenue)}
        </div>
      </div>

      <!-- PERFORMANCE -->
      <div>
        <div style="font-size:12px;color:#64748b;">
          ${text.comparison}
        </div>

        <div style="
          font-size:16px;
          font-weight:700;
          color:${color};
        ">
          ${isAbove ? "▲ +" : "▼ "}${diffPerc}%
        </div>

        <div style="
          font-size:12px;
          margin-top:4px;
          color:#64748b;
        ">
          ${badge}
        </div>
      </div>

    </div>

    <!-- 🔥 MICRO INSIGHT -->
    <div style="
      margin-top:14px;
      font-size:12px;
      text-align:center;
      color:#64748b;
    ">
      ${formatCurrency(userRevenue)} ${text.vs} ${formatCurrency(marketRevenue)}
    </div>

  </div>
  `;
}

/* ================= AUTO UPDATE ================= */

// 🔥 lingua
document.addEventListener("rb_language_changed", () => {
  renderMarketBenchmark();
});

// 🔥 simulazione
document.addEventListener("rb_simulation_updated", (e) => {

  if(e?.detail?.revenue){
    window.currentRevenue = e.detail.revenue;
  }

  renderMarketBenchmark();
});
