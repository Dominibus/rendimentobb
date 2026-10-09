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
    average: lang === "en" ? "Internal illustrative reference" : "Riferimento interno illustrativo",
    comparison: lang === "en" ? "Arithmetic difference" : "Differenza aritmetica",
    above: lang === "en" ? "Higher than illustrative input" : "Maggiore del dato illustrativo",
    below: lang === "en" ? "Lower than illustrative input" : "Minore del dato illustrativo",
    vs: lang === "en" ? "vs illustrative reference" : "vs riferimento illustrativo"
  };
}

/* ================= CITY ENGINE (FIX REALE) ================= */

function getSafeCity(inputCity){

  const custom = document.getElementById("custom-location")?.value?.trim();
  if(custom) return custom.toLowerCase().replace(/\s*\([a-z]{2}\)$/, "").trim();
  // 🔒 PRIORITÀ 1 → app.js (LA TUA VERA SOURCE)
  if(window.currentCity){
    return window.currentCity;
  }

  // 👉 fallback SOLO se chiamato manualmente
  if(inputCity){
    return inputCity;
  }

  // 👉 fallback estremo
  return "roma";
}

/* ================= CORE RENDER ================= */

export function renderMarketBenchmark(inputCity){

  const access = window.getUserAccess?.() || {};
  if(access.isFree && !access.isInvestor && !access.isPro && !access.isAdmin){
    for(const id of ["benchmark-price", "benchmark-occupancy", "benchmark-revenue"]){
      const el = document.getElementById(id);
      if(el) el.textContent = "Investor / Pro";
    }
    const comparison = document.getElementById("market-comparison");
    if(comparison) comparison.textContent = window.currentLang === "en"
      ? "Indicative benchmark comparison available with Investor or Pro"
      : "Confronto con benchmark indicativi disponibile con Investor o Pro";
    return;
  }

  const city = getSafeCity(inputCity);

  

  /* ================= DATA CHECK ================= */

  if(!window.RB_MARKET_DATA){
    console.warn("⏳ MARKET DATA non pronto");
    return;
  }

  const data = Object.hasOwn(window.RB_MARKET_DATA, city) ? window.RB_MARKET_DATA[city] : null;
  if(!data){
    for(const id of ["benchmark-price", "benchmark-occupancy", "benchmark-revenue"]){
      const node = document.getElementById(id); if(node) node.textContent = "—";
    }
    const comparison = document.getElementById("market-comparison");
    if(comparison) comparison.textContent = window.currentLang === "en"
      ? "No local benchmark is available for this location. Use your own data for the simulation."
      : "Nessun benchmark locale disponibile per questa località. Simula con i tuoi dati.";
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

  if(window.currentRevenue === undefined || window.currentRevenue === null || !Number.isFinite(userRevenue) || userRevenue < 0){
    const node = document.getElementById("market-comparison");
    if(node) node.textContent = window.currentLang === "en" ? "Run a simulation to compare your revenue." : "Completa una simulazione per confrontare i ricavi.";
    return;
  }

  /* ================= CALCOLO ================= */

  const marketRevenue = Number(data.annualRevenue);

  const diff = userRevenue - marketRevenue;

  const diffPerc = marketRevenue > 0
    ? ((diff / marketRevenue) * 100).toFixed(1)
    : 0;

  const isAbove = diff >= 0;

  const color = "#64748b";
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

/* ================= EVENTS ================= */

// lingua
if(!window.__marketLangListener){
  window.__marketLangListener = true;

  document.addEventListener("rb_language_changed", () => {
    renderMarketBenchmark(window.currentCity);
  });
}

// simulazione
if(!window.__marketSimulationListener){
  window.__marketSimulationListener = true;

  document.addEventListener("rb_simulation_updated", (e) => {

    if(e?.detail?.revenue){
      window.currentRevenue = e.detail.revenue;
    }

    renderMarketBenchmark(window.currentCity);

  });
}
