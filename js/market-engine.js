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

/* ================= CITY ENGINE ================= */

function getSafeCity(inputCity){

  const path = window.location.pathname.toLowerCase();

  if(path.includes("/milano")) return "milan";
  if(path.includes("/roma")) return "rome";
  if(path.includes("/napoli")) return "naples";
  if(path.includes("/firenze")) return "florence";

  if(inputCity) return inputCity;

  if(window.currentCity) return window.currentCity;

  const stored = localStorage.getItem("selected_city");
  if(stored) return stored;

  return "rome";
}

/* ================= CORE RENDER ================= */

export function renderMarketBenchmark(inputCity){

  // 🔒 ANTI LOOP HARD LOCK
  if(window.__marketRendering) return;
  window.__marketRendering = true;

  setTimeout(() => {
    window.__marketRendering = false;
  }, 200);

  const city = getSafeCity(inputCity);

  console.log("📊 Render Market:", city);

  window.currentCity = city;

  // 🔥 sync background
  if(window.applyCityBackground){
    applyCityBackground(city);
  }

  /* ================= DATA CHECK ================= */

  if(!window.RB_MARKET_DATA){
    console.warn("⏳ MARKET DATA non pronto");
    return;
  }

  const data = window.RB_MARKET_DATA[city];

  if(!data){
    console.warn("❌ Dati mancanti:", city);
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

  if(!userRevenue || userRevenue <= 0){
    userRevenue = data.annualRevenue;
  }

  /* ================= CALCOLO ================= */

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

      <div>
        <div style="font-size:12px;color:#64748b;">
          ${text.revenue}
        </div>
        <div style="font-size:18px;font-weight:700;">
          ${formatCurrency(userRevenue)}
        </div>
      </div>

      <div>
        <div style="font-size:12px;color:#64748b;">
          ${text.average}
        </div>
        <div style="font-size:18px;font-weight:700;">
          ${formatCurrency(marketRevenue)}
        </div>
      </div>

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

/* ================= EVENTS (SAFE) ================= */

// 🔥 lingua
if(!window.__marketLangListener){
  window.__marketLangListener = true;

  document.addEventListener("rb_language_changed", () => {
    renderMarketBenchmark();
  });
}

// 🔥 simulazione
if(!window.__marketSimulationListener){
  window.__marketSimulationListener = true;

  document.addEventListener("rb_simulation_updated", (e) => {

    if(e?.detail?.revenue){
      window.currentRevenue = e.detail.revenue;
    }

    renderMarketBenchmark();

  });
}
