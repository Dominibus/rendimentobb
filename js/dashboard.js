// ===============================================
// RENDIMENTOBB – DASHBOARD ENGINE 4.0
// Safe Data Handling + Capital Stats + Date Display
// ===============================================
import { app } from "./firebase-init.js";

// 🔥 FIRESTORE
import {
getFirestore,
collection,
query,
where,
getDocs,
getDoc,
orderBy,
deleteDoc,
doc,
addDoc,
serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const cityImages = {
  napoli: "/img/napoli-dashboard.jpg",
  roma: "/img/roma-dashboard.jpg",
  milano: "/img/milano-dashboard.jpg",
  firenze: "/img/firenze-dashboard.jpg"
};

// 🔥 AUTH (CORRETTO)
import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ================= TRANSLATION HELPER =================

window.t = function(it,en){
  if(!window.RB_LANG) return it;
  return window.RB_LANG.current === "en" ? en : it;
};

const db = getFirestore(app);
const auth = getAuth(app);

function isPro(){

  if(window.isDemoDashboard){
    return true;
  }

  const plan =
    String(window.currentPlan || "")
    .toLowerCase();

  return (
    plan === "pro" ||
    plan === "pro_yearly"
  );
}

window.proOverlayShown = false;
function closeAllOverlays(){
  document.getElementById("guest-popup")?.remove();
  document.getElementById("pro-overlay")?.remove();
  document.getElementById("investor-banner")?.remove();
  document.getElementById("investor-overlay")?.remove(); // 🔥 FIX
}

// 🔥 POPUP PLAN CONTROL (NUOVO - PRECISO)
function triggerPlanPopup(plan){

  setTimeout(()=>{

    // 🔒 evita duplicazioni
    if(
      document.getElementById("investor-overlay")
    ){
      return;
    }

    const currentPlan = String(plan || "").toLowerCase();

    // 🔥 FREE + INVESTOR → STESSO OVERLAY (FORTE)
    if(currentPlan === "free" || currentPlan === "investor"){

      if(typeof showInvestorOverlay === "function"){
        showInvestorOverlay();
      }else{
        console.warn("⚠️ showInvestorOverlay non definita");
      }

    }

    // 🟢 PRO / ADMIN → niente popup
    else{
      console.log("PRO/ADMIN → no popup");
    }

  },1000);

}
// ================= CHART DATA =================

let roiValues = [];
let labels = [];
let roiChartInstance = null;

function safeCity(city){
  if(!city || city === "undefined") return "italy";
  return city;
}

// ================= LOCK FREE USER =================

function lockFreeUser(){

  console.log("PLAN:", window.currentPlan);

  if(!window.currentPlan){
  console.warn("Plan non pronto → skip lock");
  return;
}

  const plan = String(window.currentPlan || "").toLowerCase();
  const pro = isPro();
  const access = window.getUserAccess?.() || {};
  const isInvestor = access.isInvestor;

  // ================= PRO =================
  if(pro){
    console.log("PRO USER → unlock everything");

    document.querySelectorAll(".pro-blur").forEach(el=>{
      el.style.filter = "none";
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
    });

    return;
  }

  // ================= INVESTOR =================
  if(isInvestor){
    console.log("INVESTOR → no full lock (handled separately)");
    return; // 🔥 NON trattarlo come free
  }

  // ================= FREE =================
  console.log("FREE USER → limit UI");

  const elementsToLock = [
  "roi-target-calculator",
  "revenue-simulator"
];

  elementsToLock.forEach(id=>{
    const el = document.getElementById(id);

    if(el){
      el.style.filter = "none";
      el.classList.add("rb-locked");
      el.style.opacity = "1";
    }
  });

}

// ================= UTIL =================

function formatCurrency(value){

return new Intl.NumberFormat(
window.currentLang === "it" ? "it-IT" : "en-US",
{ style:"currency", currency:"EUR"}
).format(value || 0);

}

function formatDate(timestamp){

if(!timestamp) return "-";

// 🔥 SUPPORTA ENTRAMBI I CASI
const date = timestamp.seconds
? new Date(timestamp.seconds * 1000)
: new Date(timestamp);

return date.toLocaleDateString(
window.currentLang === "it" ? "it-IT" : "en-US"
);

}

// ================= INVESTMENT SCORE =================

function calculateInvestmentScore(avgROI,totalCapital,count){

if(count === 0) return 0;

let score = 50;

/* ROI influence */

if(avgROI > 15) score += 30;
else if(avgROI > 8) score += 20;
else if(avgROI > 3) score += 10;
else if(avgROI < 0) score -= 20;

/* capital diversification */

if(totalCapital > 500000) score += 10;

/* clamp */

if(score > 100) score = 100;
if(score < 0) score = 0;

return Math.round(score);

}

// ===============================
// ROI CHART
// ===============================

function renderChart(){

const container = document.getElementById("roi-chart-container");
if(!container) return;

container.innerHTML = '<canvas id="roiChart"></canvas>';

const canvas = document.getElementById("roiChart");
canvas.height = 300;  
const ctx = canvas.getContext("2d");

if(roiChartInstance){
roiChartInstance.destroy();
roiChartInstance = null;
}

const avgROI =
roiValues.reduce((a,b)=>a+b,0) / (roiValues.length || 1);

const avgLine =
new Array(roiValues.length).fill(avgROI);

const gradient = ctx.createLinearGradient(0,0,0,400);
gradient.addColorStop(0,"rgba(16,185,129,0.35)");
gradient.addColorStop(1,"rgba(16,185,129,0.05)");

roiChartInstance = new Chart(ctx,{

type:"line",

data:{
labels:labels,

datasets:[

{
label: t("ROI %","ROI %"),
data:roiValues,
borderColor:"#10b981",
borderWidth:4,  
backgroundColor:gradient,
pointBackgroundColor:"#10b981",
pointBorderColor:"#fff",
pointBorderWidth:2,  
pointRadius:7,
pointHoverRadius:10,
pointBorderWidth:3,
tension:0.45,
fill:true
},

{
label: t("ROI medio","Average ROI"),
data:avgLine,
borderColor:"#94a3b8",
borderDash:[6,6],
pointRadius:0
}

]

},

options:{

responsive:true,
maintainAspectRatio:false,

plugins:{
legend:{display:false},

tooltip:{
backgroundColor:"#0f172a",
padding:14,
cornerRadius:14,

titleFont:{
size:14,
weight:"700"
},

bodyFont:{
size:13
},

callbacks:{
label:(ctx)=> "ROI: " + ctx.raw.toFixed(1) + "%"
}
}

},

scales:{

y:{
ticks:{
callback:(v)=> v + " %"
}
},

x:{
grid:{
display:false
}
}

}

}

});

}

// ===============================
// CITY ROI CHART
// ===============================

function renderCityROIChart(analyses){

const container = document.getElementById("city-roi-chart");
if(!container) return;

if(!analyses || analyses.length === 0){
container.innerHTML="";
return;
}

/* conta investimenti per città */

const cityCount = {};

analyses.forEach(a=>{

const city = a.city || "italy";

if(!cityCount[city]){
cityCount[city] = 0;
}

cityCount[city]++;

});

const labels = Object.keys(cityCount);
const values = Object.values(cityCount);

/* ricrea canvas */

// renderCityDistribution
container.innerHTML = '<canvas id="cityDistributionChart"></canvas>';

const ctx = document.getElementById("cityDistributionChart").getContext("2d");

new Chart(ctx,{

type:"doughnut",

data:{
labels:labels,
datasets:[{
data:values,
backgroundColor:[
"#10b981",
"#3b82f6",
"#f59e0b",
"#6366f1",
"#ef4444"
],
borderWidth:0
}]
},

options:{
responsive:true,
plugins:{
legend:{position:"bottom"}
},
cutout:"65%"
}

});

}
// ================= LOAD DASHBOARD =================

async function loadDashboard(){

  if(
    window.__dashboardLoaded &&
    !window.__forceReload
  ){
    console.warn(
      "Dashboard già inizializzata → skip"
    );
    return;
  }

  window.__dashboardLoaded = true;
  window.__forceReload = false;

  closeAllOverlays();

  roiValues = [];
  labels = [];

  // =====================================
  // ⏳ WAIT PLAN
  // =====================================

  if(!window.currentPlan){

    console.warn(
      "⏳ Plan non pronto → retry"
    );

    setTimeout(
      loadDashboard,
      200
    );

    return;
  }

  // =====================================
  // 🧪 GUEST DEMO MODE
  // =====================================

  if(!window.currentUser){

    console.log(
      "👀 GUEST DEMO MODE"
    );

    window.currentUser = {

      uid:"demo-user",

      email:"demo@rendimentobb.com"

    };

    window.isDemoData = true;
    window.isDemoDashboard = true;

  }

  renderHeader();

  // =====================================
  // 🔥 FIRESTORE / DEMO
  // =====================================

  let querySnapshot = {

    docs: [],
    size: 0,
    empty: true

  };

  if(

    !window.isDemoDashboard &&

    window.currentUser?.uid &&

    window.currentUser.uid !==
    "demo-user"

  ){

    const q = query(

      collection(
        db,
        "analyses"
      ),

      where(
        "uid",
        "==",
        window.currentUser.uid
      ),

      orderBy(
        "createdAt",
        "desc"
      )

    );

    querySnapshot =
      await getDocs(q);

  }else{

    console.log(
      "🧪 DEMO DASHBOARD → skip firestore"
    );

  }

  if(querySnapshot.empty){

    console.warn(
      "Nessuna analisi trovata"
    );

  }

  console.log(
    "DOCUMENTI:",
    querySnapshot.docs.map(
      d => d.data()
    )
  );

  console.log(
    "UID:",
    window.currentUser?.uid
  );

  console.log(
    "Analisi trovate:",
    querySnapshot.size
  );

  const list =
    document.getElementById(
      "analysis-list"
    );

  if(!list){

    console.error(
      "analysis-list NON trovato"
    );

    return;
  }

 // ================= CREA ANALYSES =================

const analyses = querySnapshot.docs.map(doc => {

  const data = doc.data();

  const realCity =
    data.realCity ||
    data.userCity ||
    data.city ||
    "roma";

  const marketCity =
    data.marketCity ||
    data.city ||
    "napoli";

  console.log("🏙 ANALYSIS CITY:", {
    realCity,
    marketCity,
    original: data.city
  });

  return {

    id: doc.id,

    roi:
      data.roi || 0,

    visualROI:
      data.visualROI || 0,

    price:
      data.propertyPrice ||
      data.price ||
      0,

    equity:
      data.equity || 0,

    gross:
      data.gross || 0,

    expenses:
      data.expenses || 0,

    occupancy:
      data.occupancy || 0,

    net:
      data.net || 0,

    risk:
      data.risk || 0,

    // 🔥 città reale UI/PDF
    city:
      realCity,

    // 🔥 città benchmark
    marketCity,

    // 🔥 salva entrambe
    realCity,

    createdAt:

      data.createdAt ||

      data.createdAtClient ||

      new Date()

  };

});

const plan = String(window.currentPlan || "").toLowerCase();

window.isDemoData =
  window.isDemoDashboard || false;

const isFreeUser =
  (
    !window.currentUser?.uid ||
    plan === "free"
  )
  &&
  !window.isDemoDashboard;

if(isFreeUser){

  console.log(
    "🆓 FREE / GUEST → FAKE SMART DATA"
  );

  window.isDemoData = true;

  analyses.length = 0;

  analyses.push({

    roi:11.8,

    price:165000,

    equity:35000,

    gross:38900,

    expenses:9700,

    net:29200,

    occupancy:78,

    risk:42,

    city:"roma",

    createdAt:new Date()

  });

  analyses.push({

    roi:9.6,

    price:140000,

    equity:30000,

    gross:31200,

    expenses:8600,

    net:22600,

    occupancy:73,

    risk:55,

    city:"napoli",

    createdAt:new Date()

  });

  analyses.push({

    roi:13.2,

    price:210000,

    equity:50000,

    gross:45800,

    expenses:11200,

    net:34600,

    occupancy:81,

    risk:38,

    city:"milano",

    createdAt:new Date()

  });

}

// 🔥 FIX → rende disponibili al report
window.dashboardSimulations = analyses;
  // ================= URL PARAMS =================

  const urlParams = new URLSearchParams(window.location.search);

  const langFromURL = urlParams.get("lang");

  if(langFromURL && typeof setLang === "function"){
    setLang(langFromURL);
  }  

  // ================= CITY DYNAMIC =================

  const citySelect = document.getElementById("city-select");

  let selectedCity = citySelect?.value || "italy";

  if(selectedCity === "italy" && analyses.length > 0){

    analyses.sort((a,b)=> {
  const dateA = a.createdAt?.seconds
    ? a.createdAt.seconds * 1000
    : new Date(a.createdAt).getTime();

  const dateB = b.createdAt?.seconds
    ? b.createdAt.seconds * 1000
    : new Date(b.createdAt).getTime();

  return dateB - dateA;
});

    selectedCity = analyses[0]?.city || "napoli";
  }

  updateMarketHero(safeCity(selectedCity));

  console.log("Città iniziale:", selectedCity);

  if(citySelect && !citySelect.dataset.listener){
  citySelect.dataset.listener = "true";

  citySelect.addEventListener("change",(e)=>{
    const newCity = e.target.value;
    updateMarketHero(newCity);
    console.log("Città cambiata:", newCity);
  });
}

// ================= RESET =================

list.innerHTML = "";

// ================= PAGINATION INFO =================

window.rbPerPage =
  window.rbPerPage || 10;

window.rbPage =
  window.rbPage || 1;

const totalPages =
  Math.max(
    1,
    Math.ceil(
      analyses.length /
      window.rbPerPage
    )
  );

const paginationInfo =
document.getElementById(
  "pagination-info"
);

if(paginationInfo){

paginationInfo.innerHTML = `

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:20px;
gap:12px;
flex-wrap:wrap;
">

<div>
📊 ${t(
  "Totale simulazioni",
  "Total simulations"
)}
:
<strong>${analyses.length}</strong>
</div>

<div>
${t(
  "Pagina",
  "Page"
)}
 <strong>
${window.rbPage}
</strong>
 /
 <strong>
${totalPages}
</strong>
</div>

<div>

<select id="simulations-per-page">

<option value="10">10</option>
<option value="25">25</option>
<option value="50">50</option>
<option value="100">100</option>

<option value="9999">
${t(
  "Tutte",
  "All"
)}
</option>

</select>

</div>

</div>

`;

const selector =
document.getElementById(
"simulations-per-page"
);

if(selector){

selector.value =
String(
window.rbPerPage
);

selector.addEventListener(
"change",
(e)=>{

window.rbPerPage =
Number(
e.target.value
);

window.rbPage = 1;

window.__dashboardLoaded = false;
window.__forceReload = true;

loadDashboard();

});

}

}

roiValues = [];
labels = [];

let totalROI = 0;
let totalCapital = 0;
let count = 0;
let totalCashflow = 0;

// ================= SORT =================

analyses.sort((a,b)=>{

const dateA =
a.createdAt?.seconds
? a.createdAt.seconds
: 0;

const dateB =
b.createdAt?.seconds
? b.createdAt.seconds
: 0;

return dateB - dateA;

});

// ================= PAGINATION DATA =================

const start =
  (window.rbPage - 1) *
  window.rbPerPage;

const end =
  start +
  window.rbPerPage;

const visibleAnalyses =
  analyses.slice(
    start,
    end
  );

// ================= RENDER CARDS =================

  visibleAnalyses.forEach((data,index)=>{

    roiValues.push(data.roi);
    labels.push(formatDate(data.createdAt));  

    const roi = data.roi;
    const price = data.price;
    const equity = data.equity;

    const occupancy = 65;
    const adr = 120;

    const revenueNeeded = Math.round(
      adr * occupancy * 365 / 100
    );  

    const yearlyProfit =
  Number(data.net || 0);

    totalROI += roi;
    totalCapital += price;
    totalCashflow += yearlyProfit;   
    count++;

    const roiClass = roi >= 0 ? "roi-positive" : "roi-negative";

    const analysisDate =
  data.createdAt?.seconds
    ? data.createdAt.seconds * 1000
    : new Date(data.createdAt).getTime();

const isNew =
  Date.now() - analysisDate <
  24 * 60 * 60 * 1000;

let badge = "";

if(index === 0){
  badge += `
  <div style="
    font-size:12px;
    color:#10b981;
    margin-bottom:6px;
    font-weight:600;
  ">
    🏆 Best ROI
  </div>
  `;
}

if(isNew){
  badge += `
  <div style="
    font-size:12px;
    color:#2563eb;
    margin-bottom:6px;
    font-weight:700;
  ">
    🆕 New
  </div>
  `;
}

    const card = document.createElement("div");
    card.className = "analysis-card";

    card.innerHTML = `

      ${badge}

      <h3>${t("Analisi investimento","Investment analysis")}</h3>

      <div class="metric">
        <span>${t("Città","City")}</span>
        <strong>${data.city.charAt(0).toUpperCase() + data.city.slice(1)}</strong>
      </div>

      <div class="metric">
        <span>${t("Prezzo immobile","Property price")}</span>
        <strong>${formatCurrency(price)}</strong>
      </div>

      <div class="metric">
        <span>${t("Equity investita","Equity invested")}</span>
        <strong>${formatCurrency(equity)}</strong>
      </div>

      <div class="metric">
        <span>${t("ROI annuale","Annual ROI")}</span>
        <strong class="${roiClass}">
          ${roi.toFixed(1)}%
        </strong>
      </div>

      <div class="metric">
        <span>${t("Indice rischio","Risk score")}</span>
        <strong>${data.risk}/100</strong>
      </div>

      <div class="metric">
        <span>${t("Data analisi","Analysis date")}</span>
        <strong>${formatDate(data.createdAt)}</strong>
      </div>

      <div class="metric">
        <span>${t("Ricavo annuo necessario","Required yearly revenue")}</span>
        <strong>${formatCurrency(revenueNeeded)}</strong>
      </div>

      <div class="metric">
        <span>${t("Profitto annuo stimato","Estimated yearly profit")}</span>

        ${
        isPro()
        ? `<strong>${formatCurrency(yearlyProfit)}</strong>`
        : `
        <strong style="filter:blur(4px)">
          ${formatCurrency(yearlyProfit)}
        </strong>

        <div style="font-size:12px;color:#64748b;margin-top:4px;">
          🔒 ${t("Sblocca per vedere il profitto reale","Unlock to see real profit")}
        </div>
        `
        }
      </div>

      ${
      !isPro()
      ? `
      <div style="margin-top:12px">
        <button onclick="goToUpgrade()" style="
          background:#10b981;
          border:none;
          padding:10px;
          border-radius:8px;
          color:white;
          font-weight:600;
          cursor:pointer;
          width:100%;
        ">
          🚀 ${t("Sblocca guadagni reali","Unlock real earnings")}
        </button>
      </div>
      `
      : ""
      }

    ${
window.isDemoData
? ""
: `
<div style="margin-top:12px;text-align:right">
  <button
    class="delete-analysis"
    data-id="${data.id}"
    style="
      background:#ef4444;
      color:white;
      border:none;
      padding:6px 10px;
      border-radius:6px;
      font-size:12px;
      cursor:pointer;
    ">
    🗑 ${t("Elimina","Delete")}
  </button>
</div>
`
}

`;

list.appendChild(card);

}); 

// ================= RENDER ENGINE =================

renderStats(count,totalROI,totalCapital,totalCashflow);

// ================= CONTINUA RENDER =================

renderInsight(count,totalROI,totalCapital);
renderROIOptimizer(count,totalROI,totalCapital);
renderROITargetCalculator(analyses); 
renderROIMarketComparison(count,totalROI);
renderRevenueSimulator(); 
renderBestInvestment(analyses);

// 🔥 helper testo report (traduzione)
const helper = document.getElementById("report-helper-text");

if(helper){
  helper.innerHTML = t(
    "Perfetto per convincere banca o investitori",
    "Perfect to convince banks or investors"
  );
}

// 🔥 FIX CRITICO → serve per il report
const best = analyses[0] || null;
window.bestInvestmentData = best;

renderInvestmentVerdict(best);  
renderUpgradeTrigger(best);

renderInvestmentRanking(analyses);
renderCityDistribution(analyses); 
renderChart();
renderCashflowChart();


// 🔥 gestione accessi UI (DOPO tutto il render)
lockFreeUser();

  // ================= DEMO DATA BADGE =================
if(window.isDemoData){

  const badge = document.createElement("div");

  badge.innerHTML = `
  <div style="
    position:fixed;
    top:100px;
    right:30px;
    opacity:0.85;
    background:rgba(15,23,42,0.9);
    color:white;
    padding:8px 12px;
    border-radius:8px;
    font-size:12px;
    z-index:999999;
    backdrop-filter:blur(6px);
    box-shadow:0 10px 30px rgba(0,0,0,0.2);
  ">
    🧪 ${t("Dati demo","Demo data")}
  </div>
  `;

  document.body.appendChild(badge);
}

} // ✅ CHIUSURA loadDashboard  

// ================= BEST INVESTMENT =================

function renderBestInvestment(analyses){

if(!analyses || analyses.length === 0) return;

const best = analyses[0];

window.bestInvestmentData = best;

/* suggested property price */

const marketROI = 8.4;

let suggestedPrice = best.price;

if(best.roi < marketROI && best.roi !== 0){

const roiRatio = marketROI / best.roi;

suggestedPrice = best.price / roiRatio;

} 

/* break even calculation */

let breakEvenYears = "-";

if(best.roi > 0){
breakEvenYears = (100 / best.roi).toFixed(1);
} 

const container = document.getElementById("best-investment");

if(!container) return;

const roiColor = best.roi >= 0 ? "#10b981" : "#ef4444";

if(
  window.RB_USER?.isInvestor &&
  !isPro()
){

  container.innerHTML = `

  <div class="analysis-card">

    <h3>
    🏆 Best Investment
    </h3>

    <div style="
    margin-top:20px;
    text-align:center;
    ">

      <div style="
      font-size:42px;
      margin-bottom:10px;
      ">
      🔒
      </div>

      <div style="
      color:#64748b;
      margin-bottom:15px;
      ">
      Upgrade a PRO per vedere
      il miglior investimento
      del portafoglio.
      </div>

      <button
      class="btn-primary"
      onclick="goToUpgrade()">
      🚀 Passa a PRO
      </button>

    </div>

  </div>

  `;

  return;
}  

const pro = isPro();

const investor =
String(window.currentPlan || "")
.toLowerCase() === "investor";

container.innerHTML = `

<div class="analysis-card" style="position:relative;overflow:hidden">

<!-- BADGE -->
<div style="
position:absolute;
top:14px;
right:14px;
background:linear-gradient(135deg,#10b981,#34d399);
color:white;
padding:4px 10px;
border-radius:20px;
font-size:11px;
font-weight:600;
box-shadow:0 4px 12px rgba(16,185,129,0.4);
">
TOP ROI
</div>

<h3 style="margin-bottom:16px">
🏆 ${t("Miglior investimento","Best investment")}
</h3>

<!-- ROI -->
<div style="
font-size:34px;
font-weight:800;
color:${roiColor};
margin-bottom:12px;
">
${best.roi.toFixed(1)}%
</div>

<div style="font-size:13px;color:#64748b;margin-bottom:18px">
${t("ROI dell'investimento selezionato","Selected investment ROI")}
</div>

<!-- DATI BASE (SEMPRE VISIBILI) -->
<div class="metric">
<span>${t("Prezzo immobile","Property price")}</span>
<strong>${formatCurrency(best.price)}</strong>
</div>

<div class="metric">
<span>${t("Equity investita","Equity invested")}</span>
<strong>${formatCurrency(best.equity)}</strong>
</div>

<hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0">

<!-- 🔒 BLOCCO PRO -->
${
isPro()
? `
<!-- CONTENUTO PRO -->
<div class="metric">
<span>${t("Indice rischio","Risk score")}</span>
<strong>${best.risk}/100</strong>
</div>

<div class="metric">
<span>${t("Break-even investimento","Investment break-even")}</span>
<strong>${breakEvenYears} ${t("anni","years")}</strong>
</div>

<div style="
margin-top:14px;
padding:12px;
border-radius:12px;
background:rgba(16,185,129,0.08);
font-size:13px;
color:#065f46;
">
<strong>💡 Insight:</strong><br>
${t(
"Questo investimento supera la media di mercato.",
"This investment outperforms the market average."
)}
</div>
`
: `
<!-- LOCKED -->
<div style="
margin-top:14px;
padding:14px;
border-radius:12px;
background:rgba(0,0,0,0.03);
text-align:center;
">

<div style="font-size:22px;margin-bottom:6px">🔒</div>

<div style="font-size:13px;color:#64748b;margin-bottom:10px">
${t(
"Sblocca analisi completa e strategia investimento",
"Unlock full analysis and investment strategy"
)}
</div>

<button class="btn-primary btn-sm" onclick="goToUpgrade()">
${t("Sblocca PRO","Unlock PRO")}
</button>

</div>
`
}

</div>

`;

}

// ===============================
// INVESTMENT RANKING
// ===============================

function renderInvestmentRanking(analyses){

const container = document.getElementById("investment-ranking");
if(!container) return;

if(!analyses || analyses.length === 0){
container.innerHTML = "";
return;
}

/* top 3 ROI */

const top = [...analyses]
.sort((a,b)=> b.roi - a.roi)
.slice(0,3);

let html = `<h3>🏆 ${t("Migliori investimenti","Top investments")}</h3>`;

top.forEach((inv,index)=>{

const medal =
index === 0 ? "🥇" :
index === 1 ? "🥈" :
"🥉";

const roiColor =
inv.roi >= 0 ? "#10b981" : "#ef4444";

html += `

<div class="metric">
<span>${medal} ${t("Investimento","Investment")} ${index+1}</span>
<strong style="color:${roiColor}">
${inv.roi.toFixed(1)}%
</strong>
</div>

`;

});

container.innerHTML = html;

}


// ================= HEADER =================

function renderHeader(){

const header = document.querySelector(".dashboard-header");

if(!header) return;

header.innerHTML=`

<div class="dashboard-topbar">

<div class="left">

<h2>
${t("Benvenuto","Welcome")}
<strong class="account-email" title="${window.currentUser.email}">
${window.currentUser.email}
</strong>
</h2>

</div>

<div class="right">

${
window.isDemoDashboard
? `
<a
href="#pricing"
class="btn-home"
style="
background:#10b981;
color:white;
font-weight:700;
">
🚀 Upgrade PRO
</a>
`
: ""
}

<a href="/" class="btn-home">
${t("Home","Home")}
</a>

<a href="/tool/" class="btn-home">
Tool
</a>

</div>

</div>

`;

}


// ================= STATS =================

function renderStats(count,totalROI,totalCapital,totalCashflow){

// ================= SAFE CALC =================
const avgROI = count ? (totalROI / count) : 0;
const avgROIRounded = avgROI.toFixed(1);
const avgCashflow = count ? (totalCashflow / count) : 0;

  window.__lastAvgROI = avgROI;

// ================= MARKET =================
const selectedCity =
document.getElementById("city-select")?.value || "italy";

const cityMarket =
window.marketData?.[selectedCity] ||
window.marketData?.["italy"] ||
{ roi:8, occupancy:60, adr:120 };

const marketROI = cityMarket.roi;
const trend = avgROI >= marketROI ? "↑" : "↓";

// ================= CALCOLI =================
const monthlyProfit = avgCashflow;
const yearlyProfit = totalCashflow;

let breakEvenYears = "-";

if(totalCashflow > 0){
  breakEvenYears =
    (totalCapital / totalCashflow)
    .toFixed(1);
}

const breakEven = avgROI > 0 ? Math.round(100 / avgROI) : 0;

// ================= HERO =================
const dbRoi = document.getElementById("db-roi");
const dbProfit = document.getElementById("db-profit");
const dbStatus = document.getElementById("db-status");
const portfolioCount = document.getElementById("portfolio-count");  

const dbInvestments =
document.getElementById(
  "db-investments"
);  

if(dbRoi){
  dbRoi.innerText = avgROI > 0
    ? avgROIRounded + "%"
    : "--";
}
if(dbProfit) dbProfit.innerText = formatCurrency(monthlyProfit);

  if(portfolioCount){

  portfolioCount.innerText =
  count;

}

  if(dbInvestments){
  dbInvestments.innerText =
  count;
}

if(dbStatus){

  let status = t("Rischio","Risk");
let color = "#ef4444";

if(avgROI >= 10){
  status = t("Forte","Strong");
  color = "#10b981";
}
else if(avgROI >= 5){
  status = t("Moderato","Moderate");
  color = "#f59e0b";
}

  const h2 = dbStatus.querySelector("h2");
  if(h2) h2.innerText = status;

  dbStatus.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
  dbStatus.style.boxShadow = `0 10px 30px ${color}55`;
  dbStatus.style.color = "white";
}

const kpiRoi = document.getElementById("kpi-roi");
const kpiCash = document.getElementById("kpi-cash");
const kpiInvest = document.getElementById("kpi-invest");
const kpiBreak = document.getElementById("kpi-break");  

// ================= KPI GRID =================
const pro = isPro();
const investor = String(window.currentPlan || "").toLowerCase() === "investor";

if(kpiRoi){
  kpiRoi.innerText = avgROIRounded + "%";
}

if(kpiCash){
  kpiCash.innerText =
    pro
      ? formatCurrency(monthlyProfit)
      : "🔒";
}

if(kpiInvest){
  kpiInvest.innerText =
    pro
      ? formatCurrency(totalCapital)
      : "🔒";
}

if(kpiBreak){
  kpiBreak.innerText =
    pro
      ? breakEven + "y"
      : "🔒";
}
// ================= PORTFOLIO =================
const roiEl = document.getElementById("portfolio-roi");
if(roiEl) roiEl.textContent = avgROIRounded + "%";

const cashEl =
document.getElementById("portfolio-cashflow");

if(cashEl){
  cashEl.textContent =
    pro
      ? formatCurrency(avgCashflow)
      : "🔒";
}

const capEl =
document.getElementById("portfolio-capital");

if(capEl){
  capEl.textContent =
    pro
      ? formatCurrency(totalCapital)
      : "🔒";
}

const countEl = document.getElementById("portfolio-count");
if(countEl) countEl.textContent = count;

// ================= SCORE =================
const investmentScore = calculateInvestmentScore(avgROI,totalCapital,count);
  
// ================= ROI =================
updateDynamicTexts();

// ================= KPI CARDS =================
const kpiContainer = document.getElementById("dashboard-kpi");

if(kpiContainer){

kpiContainer.innerHTML = `

<div class="stats-card">
<h3 style="
font-size:13px;
color:#64748b;
font-weight:500;
margin-bottom:6px;
text-transform:uppercase;
letter-spacing:0.5px;
">
${t("Capitale portfolio","Portfolio capital")}
</h3>

<div style="
font-size:34px;
font-weight:900;
letter-spacing:-0.5px;
">
${formatCurrency(totalCapital)}
</div>
</div>


<div class="stats-card">
<h3 style="
font-size:13px;
color:#64748b;
font-weight:500;
margin-bottom:6px;
text-transform:uppercase;
letter-spacing:0.5px;
">
${t("ROI medio","Average ROI")}
</h3>

<div style="
font-size:34px;
font-weight:900;
letter-spacing:-0.5px;
color:${avgROI >= marketROI ? "#10b981" : "#ef4444"};
">
${avgROIRounded}% ${trend}
</div>
</div>


<div class="stats-card">
<h3 style="
font-size:13px;
color:#64748b;
font-weight:500;
margin-bottom:6px;
text-transform:uppercase;
letter-spacing:0.5px;
">
${t("Analisi salvate","Saved analyses")}
</h3>

<div style="
font-size:34px;
font-weight:900;
letter-spacing:-0.5px;
">
${count}
</div>
</div>


<div class="stats-card">
<h3 style="
font-size:13px;
color:#64748b;
font-weight:500;
margin-bottom:6px;
text-transform:uppercase;
letter-spacing:0.5px;
">
${t("Investment Score","Investment Score")}
</h3>

<div style="
font-size:34px;
font-weight:900;
letter-spacing:-0.5px;
color:#2563eb;
">
${
isPro()
? `${investmentScore}/100`
: "🔒"
}
</div>
</div>

`;
}

// ================= MARKET =================
const performanceEl = document.getElementById("market-performance");
const userRoiEl = document.getElementById("user-roi-benchmark");

if(userRoiEl){
  userRoiEl.textContent = avgROIRounded + "%";
  userRoiEl.style.color = avgROI >= marketROI ? "#10b981" : "#ef4444";
}

if(performanceEl){
  performanceEl.textContent = avgROI >= marketROI
    ? t("Sopra la media di mercato","Above market average")
    : t("Sotto la media di mercato","Below market average");

  performanceEl.style.color = avgROI >= marketROI ? "#10b981" : "#ef4444";
}

// ================= FINAL BLOCK =================
const statsContainer = document.getElementById("dashboard-stats");
if(!statsContainer) return;

statsContainer.innerHTML = `

<div class="analysis-card">
<h3>${t("Account","Account")}</h3>

<div class="metric">
<span>${t("Utente","User")}</span>
<strong>${window.currentUser.email}</strong>
</div>

<div class="metric">
<span>${t("Piano","Plan")}</span>
<strong style="color:${isPro() ? "#10b981" : "#64748b"};">
${isPro() ? "PRO" : window.currentPlan.toUpperCase()}
</strong>
</div>
</div>

<div class="analysis-card">

<h3>
${t("ROI medio","Average ROI")}
</h3>

<strong style="
font-size:22px;
color:${avgROI >= marketROI ? "#10b981" : "#ef4444"};
">
${avgROIRounded}%
</strong>

<div style="
margin-top:8px;
font-size:13px;
font-weight:600;
color:${avgROI >= marketROI ? "#10b981" : "#ef4444"};
">

🔥 ${
avgROI >= marketROI
? `+${(avgROI - marketROI).toFixed(1)}% ${t(
"rispetto alla media mercato",
"above market average"
)}`
: `-${(marketROI - avgROI).toFixed(1)}% ${t(
"sotto la media mercato",
"below market average"
)}`
}

</div>

</div>

<div class="analysis-card">

<h3>
${t("Profitto annuo","Yearly profit")}
</h3>

<strong>
${formatCurrency(yearlyProfit)}
</strong>

<div style="
margin-top:8px;
font-size:13px;
font-weight:600;
color:#10b981;
">

💰 ${t(
"profitto stimato nei prossimi 12 mesi",
"estimated profit over the next 12 months"
)}

</div>

</div>

<div class="analysis-card">
<h3>${t("Break-even","Break-even")}</h3>
<strong>${breakEvenYears} ${t("anni","years")}</strong>
</div>

`;

// ================= ANIMATION =================
setTimeout(()=>{
  document.querySelectorAll(".stats-card").forEach((card,i)=>{
    card.style.opacity=0;
    card.style.transform="translateY(10px)";

    setTimeout(()=>{
      card.style.transition="all 0.4s ease";
      card.style.opacity=1;
      card.style.transform="translateY(0)";
    }, i*120);

  });
},100);

  updateDynamicTexts();

}

function updateDynamicTexts(){

  const avgROI = window.__lastAvgROI || 0;
  const roiMsg = document.getElementById("roi-message");

  if(!roiMsg) return;

  if(avgROI >= 10){

    roiMsg.innerText = t(
      "🔥 ROI sopra mercato (ottimo investimento)",
      "🔥 Above market ROI (strong investment)"
    );

  }else if(avgROI >= 5){

    roiMsg.innerText = t(
      "📊 ROI nella media",
      "📊 Average ROI"
    );

  }else{

    roiMsg.innerText = t(
      "⚠️ ROI basso",
      "⚠️ Low ROI"
    );

  }

}

// ================= LANGUAGE REFRESH =================

function reloadDashboardLanguage(){

  if(!window.currentUser) return;

  loadDashboard();

}


// ================= LANGUAGE LIVE GLOBAL FIX =================

document.addEventListener("rb_language_changed", () => {

  console.log("🌍 Cambio lingua → RELOAD DASHBOARD");

  window.__forceReload = true;
  loadDashboard();

});


// ================= INIT =================
if(window.__dashboardAuthInit){
  console.warn("Dashboard auth già inizializzato → skip");
}else{
  window.__dashboardAuthInit = true;

window.addEventListener("DOMContentLoaded", () => {

  onAuthStateChanged(auth, async (user) => {

    // ================= USER NON LOGGATO =================
    if(!user){

  window.currentPlan = "demo";

  await loadDashboard();

  return;
}

    // ================= USER OK =================
    window.currentUser = user;
    console.log("USER OK:", user.uid);

    try{

      // ================= GET PLAN =================
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if(userDoc.exists()){
        const data = userDoc.data();
        window.currentPlan = data.plan || "free";
      }else{
        window.currentPlan = "free";
      }

      console.log("PLAN:", window.currentPlan);

      // 🔥 SYNC HEADER + UI
      document.dispatchEvent(new Event("rb_plan_ready"));

      const plan = String(window.currentPlan || "").toLowerCase();

      // ================= FREE ACCESS CONTROL =================
      if(plan === "free"){

  console.log(
    "🆓 FREE → DASHBOARD DEMO MODE"
  );

}

      // ================= FLAGS =================
      const pro =
        plan === "pro" ||
        plan === "pro_yearly";

      const isInvestor =
        plan === "investor";

      if(isInvestor){
        console.log("👀 INVESTOR MODE");
      }

      // ================= READY =================
      document.dispatchEvent(new Event("rb_auth_ready"));

      // ================= LOAD DASHBOARD =================
await loadDashboard();

// 🔥 POPUP DOPO RENDER (fix reale)
triggerPlanPopup(plan);

      // ================= PRO =================
      if(pro){

  console.log("🔥 PRO → FULL UNLOCK");

  window.isDemoData = false;
  window.isDemoDashboard = false;

  unlockProContent();

  document.body.classList.add("is-pro");

  window.__dashboardLoaded = false;
  window.__forceReload = true;

  await loadDashboard();

  return;
}

      // ================= INVESTOR =================
      if(isInvestor){

        console.log("👀 INVESTOR → PARTIAL ACCESS");

        lockInvestorPreview();
      }

          } catch(err){
      console.error("❌ DASHBOARD INIT ERROR:", err);
    }

  }); // chiude onAuthStateChanged

}); // chiude DOMContentLoaded

} // chiude __dashboardAuthInit
  
// ================= CITY DISTRIBUTION =================

function renderCityDistribution(analyses){

  const container = document.getElementById("city-distribution-chart");
  if(!container) return;

  if(!analyses || analyses.length === 0){
    container.innerHTML = "";
    return;
  }

  const cityCount = {};

  analyses.forEach(a=>{
    const city = safeCity(a.city);

    if(!cityCount[city]){
      cityCount[city] = 0;
    }

    cityCount[city]++;
  });

  const labels = Object.keys(cityCount);
  const values = Object.values(cityCount);

  // 🔥 RESET CANVAS
  container.innerHTML = '<canvas id="cityChart"></canvas>';

  const ctx = document.getElementById("cityChart").getContext("2d");

  new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:labels,
      datasets:[{
        data:values,
        backgroundColor:[
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#6366f1",
          "#ef4444"
        ],
        borderWidth:0
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{position:"bottom"}
      },
      cutout:"65%"
    }
  });

}
// ===============================
// CASHFLOW PROJECTION CHART
// ===============================

function renderCashflowChart(){

const container = document.getElementById("cashflow-chart-container");
if(!container) return;

/* ricrea canvas */

container.innerHTML = '<canvas id="cashflowChart"></canvas>';

const canvas = document.getElementById("cashflowChart");
canvas.height = 300;  
const ctx = canvas.getContext("2d");

/* dati demo */

const avgROI = roiValues.length
  ? roiValues.reduce((a,b)=>a+b,0) / roiValues.length
  : 0;

const avgInvestment = 120000;

// profitto medio realistico
const yearlyProfit = (avgInvestment * avgROI) / 100;

// simulazione realistica 5 anni
const yearlyCashflow = [
  -avgInvestment * 0.1,
  yearlyProfit * 0.3,
  yearlyProfit * 0.6,
  yearlyProfit,
  yearlyProfit * 1.2
];

/* colori positivo/negativo */

const colors = yearlyCashflow.map(v =>
v >= 0 ? "#10b981" : "#ef4444"
);

/* linea break even */

const breakEven = new Array(yearlyCashflow.length).fill(0);

new Chart(ctx,{

type:"bar",

data:{
labels:["Anno 1","Anno 2","Anno 3","Anno 4","Anno 5"],

datasets:[

{
label:t("Cashflow","Cashflow"),
data:yearlyCashflow,

backgroundColor:
yearlyCashflow.map(v =>
v >= 0
? "#10b981"
: "#ef4444"
),

borderRadius:14,
borderSkipped:false
},

{
label: t("Break-even","Break-even"),
data:breakEven,
borderColor:"#94a3b8",
borderDash:[6,6],
pointRadius:0
},

{
label: t("Benchmark mercato","Market benchmark"),
data:new Array(roiValues.length).fill(8.4),
borderColor:"#f59e0b",
borderDash:[4,4],
pointRadius:0
}  

]

},

options:{
responsive:true,
maintainAspectRatio:false,

plugins:{
legend:{display:true},

tooltip:{
callbacks:{
label:(ctx)=> ctx.raw + " €"
}
}

},

scales:{
y:{
ticks:{
callback:(v)=> v + " €"
}
},

x:{
grid:{
display:false
}
}

}

}

});

}



// ===============================
// INVESTMENT INSIGHT ENGINE
// ===============================

function renderInsight(count,totalROI,totalCapital){

const investor =
String(window.currentPlan || "")
.toLowerCase() === "investor";

const container = document.getElementById("investment-insight");

if(!container) return;
  

if(investor && !isPro()){

  container.innerHTML = `
  <div class="analysis-card">

    <h3>🤖 AI Insight</h3>

    <div style="
    text-align:center;
    padding:20px;
    ">

      <div style="
      font-size:40px;
      ">
      🔒
      </div>

      <p>
      Disponibile nel piano PRO
      </p>

      <button
      class="btn-primary"
      onclick="goToUpgrade()">
      🚀 Upgrade PRO
      </button>

    </div>

  </div>
  `;

  return;
}  

const avgROI = count ? (totalROI/count) : 0;

const marketROI = 8.4;

let title = "";
let text = "";

// ROI insight

if(avgROI >= marketROI){

title = t(
"📊 Ottima performance",
"📊 Strong performance"
);

text = t(
"Il tuo portafoglio B&B ha un ROI superiore alla media nazionale. Questo indica una buona selezione degli investimenti.",
"Your B&B portfolio ROI is above the national average, indicating strong investment choices."
);

}else if(avgROI > 0){

title = t(
"📊 Performance moderata",
"📊 Moderate performance"
);

text = t(
"Il tuo ROI è positivo ma sotto la media nazionale. Potresti migliorarlo ottimizzando occupazione o prezzo medio notte.",
"Your ROI is positive but below the national average. Consider improving occupancy or nightly rate."
);

}else{

title = t(
"⚠️ AI Analisi degli investimenti",
"⚠️ AI Investment Analysis"
);

text = t(
"Il ROI medio del tuo portafoglio è negativo. Valuta immobili con maggiore domanda turistica o costi più bassi.",
"Your portfolio ROI is negative. Consider properties with higher tourism demand or lower costs."
);

}

// capitale insight

let capitalText = "";

if(totalCapital > 500000){

capitalText = t(
"Hai analizzato un capitale significativo. Diversificare tra più proprietà può ridurre il rischio.",
"You analyzed significant capital. Diversifying across properties may reduce risk."
);

}else{

capitalText = t(
"Analizzare più investimenti può aiutarti a identificare opportunità migliori.",
"Analyzing more investments can help identify stronger opportunities."
);

}

container.innerHTML = `

<h3>${title}</h3>

<p style="margin-top:10px;color:#475569;font-size:14px">
${text}
</p>

<p style="margin-top:8px;color:#64748b;font-size:13px">
${capitalText}
</p>

`;

}

// ===============================
// ROI OPTIMIZER ENGINE
// ===============================

function renderROIOptimizer(count,totalROI,totalCapital){  

const container = document.getElementById("roi-optimizer");
if(!container) return;

const avgROI = count ? (totalROI/count) : 0;

const marketROI = 8.4;

/* simulazioni semplici */

let occupancyNeeded = 65;
let adrNeeded = 120;
let priceReduction = 0;

if(avgROI < marketROI){

const gap = marketROI - avgROI;

occupancyNeeded = Math.min(85, Math.round(65 + gap * 1.5));
adrNeeded = Math.round(120 + gap * 5);
priceReduction = Math.min(20, Math.round(gap * 2));

}

/* revenue needed */

const revenueNeeded = Math.round(
adrNeeded * occupancyNeeded * 365 / 100
);  

container.innerHTML = `

<h3>💡 ${t("Ottimizzazione investimento","Investment optimization")}</h3>

<p style="margin-top:10px;color:#475569;font-size:14px">
${t(
"Per raggiungere la redditività media del mercato B&B:",
"To reach average B&B market profitability:"
)}
</p>

<div class="metric">
<span>${t("Occupazione minima richiesta","Minimum occupancy")}</span>
<strong>${occupancyNeeded}%</strong>
</div>

<div class="metric">
<span>${t("Prezzo medio notte necessario","Required nightly rate")}</span>
<strong>€${adrNeeded}</strong>
</div>

<div class="metric">
<span>${t("Ricavo annuo target","Target yearly revenue")}</span>
<strong>${formatCurrency(revenueNeeded)}</strong>
</div>

<div style="margin-top:12px;color:#64748b;font-size:13px">

${t(
"Oppure ridurre il prezzo dell'immobile di circa",
"Or reduce property price by about"
)}

<strong>${priceReduction}%</strong>

</div>

`;

}

// ===============================
// ROI TARGET CALCULATOR
// ===============================

function renderROITargetCalculator(analyses){

const container = document.getElementById("roi-target-calculator");
if(!container) return;

if(!analyses || analyses.length === 0){
container.innerHTML="";
return;
}

const best = analyses[0];

/* ROI target */

const targetROI = 10;

/* calcolo prezzo massimo */

let maxPrice = best.price;

if(best.roi !== 0){

maxPrice = (best.price * best.roi) / targetROI;

}

container.innerHTML = `

<h3>🎯 ${t("Prezzo massimo immobile","Maximum property price")}</h3>

<div style="font-size:26px;font-weight:700;color:#2563eb">
${formatCurrency(maxPrice)}
</div>

<div style="font-size:13px;color:#64748b;margin-top:6px">
${t(
"per raggiungere ROI target",
"to reach target ROI"
)} ${targetROI}%
</div>

`;

}

// ===============================
// REVENUE SIMULATOR
// ===============================

function renderRevenueSimulator(){

const container = document.getElementById("revenue-simulator");
if(!container) return;

container.innerHTML = `

<h3>📈 ${t("Simulatore ricavi B&B","B&B Revenue Simulator")}</h3>

<div style="margin-top:12px">

<label style="font-size:13px">${t("Occupazione","Occupancy")}</label>
<input type="range" id="occ-slider" min="30" max="90" value="65" style="width:100%">
<div id="occ-value">65%</div>

</div>

<div style="margin-top:12px">

<label style="font-size:13px">${t("Prezzo medio notte","Average nightly rate")}</label>
<input type="range" id="adr-slider" min="50" max="300" value="120" style="width:100%">
<div id="adr-value">€120</div>

</div>

<div style="margin-top:16px;font-size:20px;font-weight:700;color:#2563eb">

<span id="revenue-result">€0</span>

</div>

<div style="font-size:12px;color:#64748b">
${t("Ricavo annuo stimato","Estimated yearly revenue")}
</div>

`;  

updateRevenue();

document.getElementById("occ-slider").addEventListener("input", updateRevenue);
document.getElementById("adr-slider").addEventListener("input", updateRevenue);

}

function updateRevenue(){

const occSlider = document.getElementById("occ-slider");
const adrSlider = document.getElementById("adr-slider");

if(!occSlider || !adrSlider) return;

const occ = occSlider.value;
const adr = adrSlider.value;

document.getElementById("occ-value").textContent = occ + "%";
document.getElementById("adr-value").textContent = "€" + adr;

const revenue = Math.round(adr * occ * 365 / 100);

document.getElementById("revenue-result").textContent =
formatCurrency(revenue);

}

async function deleteAnalysis(e){

const btn = e.target.closest(".delete-analysis");
if(!btn) return;

e.preventDefault();
e.stopPropagation();

const id = btn.dataset.id;

const confirmDelete = confirm(
window.currentLang === "en"
? "Delete this analysis?"
: "Eliminare questa analisi?"
);

if(!confirmDelete) return;

try{

if(!window.currentUser){
  alert("Sessione non valida. Ricarica la pagina.");
  return;
}

const ref = doc(db,"analyses",id);

const snap = await getDoc(ref);

console.log(
  "🔥 DOC DELETE TEST:",
  snap.data()
);

await deleteDoc(
  doc(db,"analyses",id)
);

console.log(
  "🗑 ANALISI ELIMINATA:",
  id
);

// 🔥 reset dashboard cache
window.__dashboardLoaded = false;
window.__forceReload = true;

await loadDashboard();

}catch(err){

  console.error(
    "Delete error:",
    err
  );

}

}

// ================= DOWNLOAD REPORT DASHBOARD =================

function downloadReport(){

  if(!window.bestInvestmentData){
    alert(window.currentLang === "en"
      ? "No analysis available"
      : "Nessuna analisi disponibile");
    return;
  }

  const data = window.bestInvestmentData;

  const params = new URLSearchParams({
    price: data.price || 0,
    roi: data.roi || 0,
    equity: data.equity || 0,
    risk: data.risk || 0,
    city:
        data.realCity ||
        data.city ||
        "roma",
    source: "dashboard" // 🔥 fondamentale
  });

  // 🚀 NUOVO FLOW → PDF DASHBOARD
  window.location.href =
    "/dashboard-report/?" + params.toString();
}

// ================= REPORT CLICK HANDLER (FIX FLOW) =================
function handleReportClick(){

  const user = window.RB_USER || {};

  const isPro =
    user.isAdmin ||
    user.isPro ||
    user.plan === "pro" ||
    user.plan === "pro_yearly";

  console.log("📊 REPORT CLICK:", user);

  // 🔒 NON PRO → upgrade
  if(!isPro){

    if(typeof startPlanPurchase === "function"){
      startPlanPurchase("pro", {
        source: "dashboard",
        trigger: "roi_block",
      });
    }else{
      window.location.href = "/#pricing";
    }

    return;
  }

  // ✅ PRO → DASHBOARD REPORT
  const data = window.bestInvestmentData || {};
  // 🔥 FIX CRITICO → salva simulazioni per report
localStorage.setItem(
  "rb_simulations",
  JSON.stringify(window.dashboardSimulations || [])
);

  const params = new URLSearchParams({
    price: data.price || 0,
    roi: data.roi || 0,
    equity: data.equity || 0,
    risk: data.risk || 0,
    city:
         data.realCity ||
         data.city ||
         "roma",
    source: "dashboard",
    ts: Date.now() // evita cache
  });

  window.location.href =
    "/dashboard-report/?" + params.toString();
}


// ================= GLOBAL CLICK HANDLER =================

document.addEventListener("click",(e)=>{

  if(e.target.closest(".delete-analysis")){
    deleteAnalysis(e);
  }

  if(e.target.id === "download-report"){
  handleReportClick();
}

});

// ================= UPGRADE =================
window.goToUpgrade = function(){

  const access = window.getUserAccess?.();

  if(!access){
    window.location.href = "/#pricing";
    return;
  }

  // 🔒 NON LOGGATO → INVESTOR
  if(!access.isLogged || access.isFree){
    if(typeof startPlanPurchase === "function"){
      startPlanPurchase("investor");
    }else{
      window.location.href = "/#pricing";
    }
    return;
  }

  // 🟡 INVESTOR → PRO (🔥 FIX PRINCIPALE)
  if(access.isInvestor){
    if(typeof startPlanPurchase === "function"){
      startPlanPurchase("pro", {
  source: "dashboard",
  trigger: "roi_block",
});
    }else{
      window.location.href = "/#pricing";
    }
    return;
  }

  // 🟢 PRO → niente
  if(access.isPro || access.isAdmin){
    return;
  }

};

// ================= HERO MARKET BACKGROUND =================

function updateMarketHero(city){

city = safeCity(city);

const hero = document.getElementById("market-hero-bg");
const title = document.getElementById("market-hero-title");

if(!hero) return;

const images = {
roma:"/img/roma-dashboard.jpg",
napoli:"/img/napoli-dashboard.jpg",
milano:"/img/milano-dashboard.jpg",
firenze:"/img/firenze-dashboard.jpg"
};

const names = {
roma:"Roma",
napoli:"Napoli",
milano:"Milano",
firenze:"Firenze"
};

/* ================= HERO CONTENT ================= */

const HERO_CONTENT = {
roma:[
"Domanda turistica costante e ROI stabile",
"Capitale del turismo internazionale",
"Mercato premium ad alta occupazione"
],
napoli:[
"ROI sopra la media nazionale",
"Forte crescita turistica",
"Ottimo rapporto prezzo / rendimento"
],
milano:[
"Business travel e alta occupazione",
"Mercato stabile e liquido",
"Alta domanda tutto l’anno"
],
firenze:[
"Turismo internazionale premium",
"Alta redditività stagionale",
"Domanda costante tutto l’anno"
]
};

/* ================= MARKET STATS ================= */

const market = window.marketData[city] || window.marketData["italy"];

const stats = document.querySelector(".market-hero-stats");

if(stats && market){

stats.innerHTML = `
<div>
<div style="font-size:13px;color:#64748b">
${t("ROI medio","Average ROI")}
</div>
<div style="font-size:22px;font-weight:600;color:#10b981">
${market.roi}%
</div>
</div>

<div>
<div style="font-size:13px;color:#64748b">
${t("Occupazione","Occupancy")}
</div>
<div style="font-size:22px;font-weight:600">
${market.occupancy}%
</div>
</div>

<div>
<div style="font-size:13px;color:#64748b">
${t("Prezzo medio notte","Average nightly rate")}
</div>
<div style="font-size:22px;font-weight:600">
€${market.adr}
</div>
</div>
`;
}

/* ================= RANDOM SMART ================= */

if(!images[city]){
const keys = Object.keys(images);
city = keys[Math.floor(Math.random()*keys.length)];
}

if(city === "italy"){
const keys = Object.keys(images);
city = keys[Math.floor(Math.random()*keys.length)];
}

/* ================= IMMAGINE SAFE ================= */

const image = images[city] || images["napoli"];
hero.style.backgroundImage = `url('${image}')`;

/* ================= TITOLO SAFE ================= */

const cityName = names[city] || "Italia";
title.innerText = t(
  "Investire in un B&B a " + cityName,
  "Investing in a B&B in " + cityName
);

/* ================= DESCRIZIONE RANDOM ================= */

const subtitle = hero.querySelector("div div:nth-child(2)");

if(subtitle && HERO_CONTENT[city]){

const randomText =
HERO_CONTENT[city][Math.floor(Math.random()*HERO_CONTENT[city].length)];

subtitle.innerText = randomText;

}
  
}

// ================= VERDICT ENGINE =================

function generateInvestmentVerdict(result){

if(!result) return null;

const roi = result.roi || 0;
const cashflow =
  result.net ||
  result.cashflow ||
  0;
const risk = result.risk || 50;

// ================= EXCELLENT =================
if(roi >= 10 && cashflow > 0 && risk < 70){
return {
type:"excellent",
color:"#10b981",

title: t("🔥 Ottimo investimento","🔥 Excellent investment"),

subtitle: t(
"ROI sopra la media e cashflow positivo",
"Above-average ROI and positive cashflow"
),

action: t("Procedere","Proceed"),

message: t(
"Investimento solido con ottimo equilibrio tra rendimento e rischio.",
"Solid investment with strong balance between return and risk."
)
};
}

// ================= GOOD =================
if(roi >= 7){
return {
type:"good",
color:"#f59e0b",

title: t("📊 Buon investimento","📊 Good investment"),

subtitle: t(
"Margine interessante ma migliorabile",
"Interesting margin but improvable"
),

action: t("Ottimizzare","Optimize"),

message: t(
"Buona opportunità ma migliorabile ottimizzando prezzo medio o occupazione.",
"Good opportunity but can be improved by optimizing pricing or occupancy."
)
};
}

// ================= RISK =================
return {
type:"risk",
color:"#ef4444",

title: t("⚠️ Investimento rischioso","⚠️ Risky investment"),

subtitle: t(
"ROI basso o cashflow negativo",
"Low ROI or negative cashflow"
),

action: t("Evitare","Avoid"),

message: t(
"Rendimento insufficiente o rischio elevato rispetto al mercato.",
"Insufficient return or high risk compared to the market."
)
};

}


// ================= VERDICT RENDER =================

function renderInvestmentVerdict(result){

const container = document.getElementById("investment-verdict");
if(!container) return;

const verdict = generateInvestmentVerdict(result);
if(!verdict) return;

container.innerHTML = `

<div style="display:flex;flex-direction:column;gap:10px;">

<h2 style="
font-size:30px;
font-weight:900;
color:${verdict.color};
letter-spacing:-0.5px;
">
${verdict.title}
</h2>

<div style="
font-size:20px;
font-weight:800;
color:${verdict.color};
margin-top:6px;
">
${
verdict.type === "excellent"
  ? `✅ ${t("COMPRA","BUY")}`
  : verdict.type === "good"
  ? `⚙️ ${t("OTTIMIZZA","OPTIMIZE")}`
  : `❌ ${t("EVITA","AVOID")}`
}
</div>

${
!isPro()
? `
<div style="
margin-top:16px;
padding:16px;
border-radius:12px;
background:linear-gradient(135deg,#f8fafc,#eef2f7);
text-align:center;
">

<div style="font-size:14px;font-weight:600;margin-bottom:8px">
💡 ${t(
  "Hai già il dato chiave",
  "You already have the key data"
)}
</div>

<div style="font-size:13px;color:#64748b;margin-bottom:12px">
${t(
  "Ti manca la strategia per trasformarlo in profitto reale",
  "You are missing the strategy to turn it into real profit"
)}
</div>

<button onclick="goToUpgrade()" style="
background:#10b981;
color:white;
border:none;
padding:12px 16px;
border-radius:10px;
font-weight:700;
cursor:pointer;
">
🚀 ${t(
"Sblocca strategia e ROI reale",
"Unlock strategy & real ROI"
)}
</button>

</div>
`
: ""
}

<div style="font-size:14px;color:#64748b;">
${verdict.subtitle}
</div>

<div style="font-size:15px;margin-top:6px;color:#0f172a;">
${verdict.message}
</div>

<div style="margin-top:12px;font-weight:600;">
👉 ${t("Consiglio","Advice")}: ${verdict.action}
</div>

${
!isPro()
? `
<div style="
margin-top:16px;
padding:14px;
border-radius:12px;
background:linear-gradient(135deg,#0f172a,#1e293b);
color:white;
text-align:center;
">

<div style="font-size:13px;margin-bottom:8px">
${t(
"Vuoi sapere come migliorare questo investimento?",
"Want to improve this investment?"
)}
</div>

<button onclick="goToUpgrade()" style="
background:#10b981;
border:none;
padding:10px 14px;
border-radius:8px;
color:white;
font-weight:600;
cursor:pointer;
">
${t("Sblocca strategia PRO","Unlock PRO strategy")}
</button>

</div>
`
: `
<div style="
margin-top:12px;
padding:12px;
border-radius:10px;
background:rgba(16,185,129,0.08);
font-size:13px;
color:#065f46;
">
💡 ${t(
"Strategia attiva: ottimizza prezzo e occupazione per aumentare ROI.",
"Strategy active: optimize pricing and occupancy to increase ROI."
)}
</div>
`
}

</div>
`;

}

function showGuestPopup(){

  closeAllOverlays(); // 🔥 FIX VERO

  const popup = document.createElement("div");
  popup.id = "guest-popup";

  popup.innerHTML = `

  <div style="
    position:fixed;
    inset:0;
    background:rgba(15,23,42,0.65);
    backdrop-filter:blur(6px);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:999999;
    animation:fadeIn 0.25s ease;
  ">

    <div style="
      background:white;
      padding:30px;
      border-radius:16px;
      max-width:420px;
      width:90%;
      text-align:center;
      box-shadow:0 30px 80px rgba(0,0,0,0.25);
      position:relative;
    ">

      <!-- ❌ CLOSE -->
      <button onclick="document.getElementById('guest-popup').remove()" style="
        position:absolute;
        top:12px;
        right:12px;
        background:none;
        border:none;
        font-size:18px;
        cursor:pointer;
        color:#64748b;
      ">✕</button>

      <!-- 🚀 TITLE -->
      <h2 style="margin-bottom:10px;font-size:22px;font-weight:700;">
        🚀 ${t("Scopri la tua redditività reale","Discover your real ROI")}
      </h2>

      <!-- 💬 SUB -->
      <p style="color:#64748b;font-size:14px;margin-bottom:20px;line-height:1.5">
        ${t(
        "Il 72% degli investitori B&B perde soldi. Scopri se il tuo investimento è davvero profittevole.",
        "72% of B&B investors lose money. Find out if your investment is actually profitable."
        )}
      </p>

      <!-- CTA -->
      <div style="
        display:flex;
        flex-direction:column;
        gap:12px;
      ">

        <!-- LOGIN -->
        <button onclick="window.location.href='/login/'" style="
          background:#10b981;
          color:white;
          border:none;
          padding:14px;
          border-radius:10px;
          font-weight:700;
          cursor:pointer;
          font-size:14px;
          box-shadow:0 10px 25px rgba(16,185,129,0.3);
          transition:0.2s;
        ">
          🔓 ${t("Accedi e analizza","Login & analyze")}
        </button>

        <!-- REGISTER -->
        <button onclick="window.location.href='/login/'" style="
          background:#0f172a;
          color:white;
          border:none;
          padding:14px;
          border-radius:10px;
          font-weight:700;
          cursor:pointer;
          font-size:14px;
        ">
          🚀 ${t("Registrati gratis","Create free account")}
        </button>

        <!-- GUEST -->
        <button onclick="document.getElementById('guest-popup').remove()" style="
          background:none;
          border:none;
          color:#64748b;
          margin-top:6px;
          cursor:pointer;
          font-size:12px;
        ">
          ${t("Continua senza account","Continue as guest")}
        </button>

      </div>

      <!-- TRUST -->
      <div style="
        margin-top:18px;
        font-size:11px;
        color:#94a3b8;
      ">
        ${t(
        "Nessuna carta richiesta • Accesso immediato",
        "No credit card required • Instant access"
        )}
      </div>

    </div>
  </div>

  <style>
  @keyframes fadeIn{
    from{opacity:0; transform:scale(0.98);}
    to{opacity:1; transform:scale(1);}
  }
  </style>

  `;

  document.body.appendChild(popup);
}

function showInvestorOverlay(){

  closeAllOverlays();

  const best = window.bestInvestmentData || {};
  const roi = best.roi || 0;
  const price = best.price || 0;

  const potentialProfit =
  Number(best.net || 0);

  // 🔥 SOURCE OF TRUTH
  const isInvestor = window.RB_USER?.isInvestor;

  const overlay = document.createElement("div");
  overlay.id = "investor-overlay";

  overlay.innerHTML = `
<div style="
  position:fixed;
  inset:0;
  background:radial-gradient(circle at center, rgba(15,23,42,0.78), rgba(15,23,42,0.95));
  backdrop-filter:blur(10px);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:999999;
">

  <div style="
    background:white;
    padding:36px;
    border-radius:20px;
    max-width:440px;
    width:92%;
    text-align:center;
    box-shadow:0 50px 120px rgba(0,0,0,0.4);
    position:relative;
    animation:fadeIn 0.35s ease;
  ">

    <!-- CLOSE -->
    <button onclick="document.getElementById('investor-overlay').remove()" style="
      position:absolute;
      top:14px;
      right:14px;
      border:none;
      background:none;
      font-size:18px;
      cursor:pointer;
      color:#94a3b8;
    ">✕</button>

    <!-- BADGE -->
    <div style="
      font-size:12px;
      color:#f59e0b;
      font-weight:700;
      margin-bottom:8px;
      letter-spacing:0.6px;
    ">
      ⚠️ ${t("ATTENZIONE","WARNING")}
    </div>

    <!-- TITLE DINAMICO -->
    <h2 style="
      font-size:26px;
      font-weight:900;
      line-height:1.25;
      margin-bottom:10px;
      letter-spacing:-0.5px;
    ">
      ${t(
        isInvestor
          ? "Stai perdendo dati critici"
          : "Stai prendendo una decisione alla cieca",
        isInvestor
          ? "You are missing critical data"
          : "You are making a blind investment decision"
      )}
    </h2>

    <!-- SUB -->
    <p style="
      font-size:14px;
      color:#64748b;
      margin-bottom:20px;
      line-height:1.5;
    ">
      ${t(
        "Il 72% degli investitori perde soldi proprio qui.",
        "72% of investors lose money at this exact step."
      )}
    </p>

    <!-- MONEY BLOCK -->
    <div style="
      background:linear-gradient(135deg,#ecfdf5,#f0fdf4);
      border-radius:16px;
      padding:22px;
      margin-bottom:16px;
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.6);
    ">

      <div id="rb-profit-number" style="
        font-size:42px;
        font-weight:900;
        color:#10b981;
        margin-bottom:6px;
        letter-spacing:-1px;
      ">
        ${formatCurrency(0)}
      </div>

      <div style="
        font-size:13px;
        color:#065f46;
        font-weight:600;
      ">
        ${t(
          "profitto reale che stai ignorando",
          "real profit you are ignoring"
        )}
      </div>

      <!-- 🔥 NUOVO TRIGGER PSICOLOGICO -->
      <div style="
        font-size:12px;
        color:#ef4444;
        margin-top:8px;
        font-weight:600;
      ">
        ${
          isInvestor
          ? t(
              "Stai vedendo solo una parte dei dati reali",
              "You are seeing only a fraction of real data"
            )
          : t(
              "Dato stimato senza analisi completa",
              "Estimated data without full analysis"
            )
        }
      </div>

    </div>

    <!-- URGENCY -->
    <div style="
      font-size:13px;
      color:#ef4444;
      margin-bottom:18px;
      font-weight:600;
    ">
      ⚠️ ${t(
        "Senza analisi avanzata potresti sovrastimare i guadagni",
        "Without advanced analysis you may overestimate profits"
      )}
    </div>

    <!-- EXPLANATION -->
    <div style="
      font-size:13px;
      color:#475569;
      margin-bottom:24px;
      line-height:1.5;
    ">
      ${t(
        "Stai decidendo senza dati su prezzo, occupazione e rischio reale.",
        "You are deciding without real data on pricing, occupancy and risk."
      )}
    </div>

    <!-- CTA -->
    <button onclick="goToUpgrade()" style="
      background:linear-gradient(135deg,#10b981,#34d399);
      color:white;
      border:none;
      padding:16px;
      border-radius:14px;
      font-weight:900;
      cursor:pointer;
      width:100%;
      font-size:16px;
      box-shadow:0 15px 35px rgba(16,185,129,0.45);
      transition:all 0.2s ease;
    ">
      🚀 ${
        isInvestor
        ? t("Passa a PRO e sblocca tutto","Upgrade to PRO and unlock everything")
        : t("Sblocca analisi reale","Unlock real analysis")
      }
    </button>

    <!-- TRUST -->
    <div style="
      margin-top:16px;
      font-size:11px;
      color:#94a3b8;
    ">
      ${t(
        "Accesso immediato • Nessuna carta richiesta",
        "Instant access • No credit card required"
      )}
    </div>

  </div>
</div>

<style>
@keyframes fadeIn{
  from{opacity:0; transform:scale(0.96);}
  to{opacity:1; transform:scale(1);}
}
</style>
`;

  document.body.appendChild(overlay);

  // 🔥 ANIMAZIONE NUMERO
  setTimeout(()=>{
    const el = document.getElementById("rb-profit-number");
    if(!el) return;

    let current = 0;
    const target = potentialProfit;
    const step = target / 25;

    const interval = setInterval(()=>{
      current += step;

      if(current >= target){
        current = target;
        clearInterval(interval);
      }

      el.innerText = formatCurrency(Math.round(current));
    }, 20);

  }, 300);

}
function unlockProContent(){

  console.log("🔥 UNLOCK PRO COMPLETO");

  // 🔥 rimuove blur SOLO dagli elementi giusti (non tutto il DOM)
  const ids = [
    "roi-chart-container",
    "cashflow-chart-container",
    "city-roi-chart",
    "city-distribution-chart",
    "roi-optimizer",
    "investment-ranking",
    "best-investment"
  ];

  ids.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;

    el.style.filter = "none";
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";

    el.classList.remove("pro-lock");
    el.classList.remove("pro-blur");
  });

  // 🔥 IMPORTANTISSIMO → rimuove blur dal MAIN (overlay effect)
  const main = document.querySelector("main");
  if(main){
    main.style.filter = "none";
    main.style.pointerEvents = "auto";
    main.style.opacity = "1";
  }

  // 🔥 chiude overlay se aperto
  const overlay = document.getElementById("pro-overlay");
  if(overlay){
    overlay.style.display = "none";
  }

}

function renderUpgradeTrigger(best){

  if(isPro()) return;

  const container = document.getElementById("upgrade-trigger");
  if(!container) return;

  if(!best) return;
  if(best.roi < 6) return;
  if(isPro()) return;

  const potentialProfit =
  Number(best.net || 0);

  container.style.display = "block";

  container.innerHTML = `
  <div style="
  background:linear-gradient(135deg,#0f172a,#1e293b);
  color:white;
  padding:22px;
  border-radius:18px;
  text-align:center;
  box-shadow:0 25px 60px rgba(0,0,0,0.25);
  ">

    <div style="font-size:20px;font-weight:700;margin-bottom:10px">
⚠️ ${t(
"Stai rischiando di perdere questo profitto",
"You are risking losing this profit"
)}
</div>

    <div style="
    font-size:44px;
    font-weight:900;
    background:linear-gradient(135deg,#10b981,#34d399);
    -webkit-background-clip:text;
    -webkit-text-fill-color:transparent;
    margin-bottom:10px;
    ">
      ${formatCurrency(potentialProfit)}
    </div>

    <div style="font-size:14px;opacity:0.85;margin-bottom:16px">
      ${t("profitto annuo stimato","estimated yearly profit")}
    </div>

    <div style="
    font-size:13px;
    color:#94a3b8;
    margin-bottom:18px;
    ">
      ⚠️ ${t(
        "Stai perdendo i dati più importanti per guadagnare davvero",
        "You are missing the most important data to actually profit"
      )}
    </div>

    <button onclick="goToUpgrade()" style="
    background:#10b981;
    border:none;
    padding:14px 20px;
    border-radius:12px;
    font-weight:700;
    cursor:pointer;
    font-size:15px;
    ">
      🚀 ${t("Sblocca guadagni reali","Unlock real earnings")}
    </button>

  </div>
  `;
}

// ================= ROI MARKET COMPARISON =================

function renderROIMarketComparison(count,totalROI){

  const container = document.getElementById("roi-market-comparison");
  if(!container) return;

  if(count === 0){
    container.innerHTML = "";
    return;
  }

  const avgROI = totalROI / count;
  const marketROI = 8.4;

  const diff = avgROI - marketROI;
  const isBetter = diff >= 0;

  const color = isBetter ? "#10b981" : "#ef4444";

  const message = isBetter
    ? t("Stai battendo il mercato","You are beating the market")
    : t("Sei sotto la media di mercato","You are below market average");

  const percentage = Math.abs(diff).toFixed(1);

  container.innerHTML = `
<h3>📊 ${t("Confronto con il mercato","Market comparison")}</h3>

<div style="
margin-top:14px;
font-size:28px;
font-weight:700;
color:${color};
">
${isBetter ? "+" : "-"}${percentage}%
</div>

<div style="margin-top:6px;color:#64748b;font-size:14px">
${message}
</div>

<div style="margin-top:16px">

${
isPro()
? `
<div style="
padding:12px;
border-radius:10px;
background:rgba(16,185,129,0.08);
font-size:13px;
color:#065f46;
">
💡 ${t(
"Il tuo investimento è sopra il benchmark nazionale.",
"Your investment outperforms the national benchmark."
)}
</div>
`
: `
<div style="
margin-top:16px;
padding:16px;
border-radius:12px;
background:linear-gradient(135deg,#f8fafc,#eef2f7);
text-align:center;
">

<div style="font-size:20px;margin-bottom:6px">🔒</div>

<div style="font-size:13px;color:#64748b;margin-bottom:10px">
${t(
"Sblocca confronto avanzato e analisi strategica",
"Unlock advanced comparison and strategy"
)}
</div>

<button onclick="goToUpgrade()" style="
background:#10b981;
border:none;
padding:10px 14px;
border-radius:8px;
color:white;
font-weight:600;
cursor:pointer;
">
🚀 ${t("Sblocca PRO","Unlock PRO")}
</button>

</div>
`
}

</div>
`;
}
function lockInvestorPreview(){

  const elementsToBlur = [

  "roi-target-calculator",

  "revenue-simulator",

  "roi-optimizer",

  "roi-market-comparison"

];

  elementsToBlur.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;

    el.style.filter = "blur(6px)";
    el.classList.add("rb-locked");
    el.style.opacity = "0.6";
  });

  // ❌ NON bloccare tutta la dashboard
// showProOverlay();

// ✅ SOLO teaser, niente overlay globale

  // 🔥 SOLO QUI CONTROLLO DUPLICAZIONE
  if(document.getElementById("investor-banner")) return;

  const banner = document.createElement("div");
  banner.id = "investor-banner";

  banner.innerHTML = `
  <div style="
  position:fixed;
  bottom:20px;
  left:50%;
  transform:translateX(-50%);
  background:#0f172a;
  color:white;
  padding:14px 20px;
  border-radius:12px;
  box-shadow:0 10px 30px rgba(0,0,0,0.3);
  z-index:10000;
  font-size:14px;
  ">

  👀 ${t(
  "Modalità preview attiva – stai vedendo solo il 30% dei dati",
  "Preview mode active – you are seeing only 30% of the data"
  )}

  </div>
  `;

  document.body.appendChild(banner);
}

// =====================================
// 🏠 PROPERTY MODAL
// =====================================

window.openPropertyModal = function(){

const modal =
document.getElementById(
"property-modal"
);

if(modal){

modal.style.display = "flex";

}

};

window.closePropertyModal = function(){

const modal =
document.getElementById(
"property-modal"
);

if(modal){

modal.style.display = "none";

}

};

// =====================================
// 🏠 PMS INIT
// =====================================

document.addEventListener(
  "DOMContentLoaded",
  ()=>{

    const openBtn =
    document.getElementById(
      "open-property-modal"
    );

    if(openBtn){

      openBtn.addEventListener(
        "click",
        openPropertyModal
      );

    }

    // 🌍 BILINGUA

    if(window.applyStaticTranslations){

      window.applyStaticTranslations();

    }

    setTimeout(()=>{

      loadProperties();

      loadPMSStats();

      // =====================================
      // ➕ BOOKING FORM OPEN
      // =====================================

      window.openBookingModal = function(){

        const form =
        document.getElementById(
          "booking-form-container"
        );

        if(!form) return;

        form.style.display =
        "flex";

        setTimeout(()=>{

        updateBookingTotal();

        },100);

      };

      // =====================================
      // ❌ BOOKING FORM CLOSE
      // =====================================

      window.closeBookingModal = function(){

        const form =
        document.getElementById(
          "booking-form-container"
        );

        if(!form) return;

        form.style.display =
        "none";

      };

      // =====================================
      // 🎯 TOGGLE BUTTON
      // =====================================

      const toggleBtn =
      document.getElementById(
        "toggle-booking-form"
      );

      if(toggleBtn){

        toggleBtn.onclick =
        window.openBookingModal;

      }

    },1500);

});

// =====================================
// 🌍 PMS LANGUAGE REFRESH
// =====================================

document.addEventListener(
  "rb_language_changed",
  ()=>{

    if(
      window.applyStaticTranslations
    ){
      window.applyStaticTranslations();
    }

    if(
      typeof loadProperties ===
      "function"
    ){
      loadProperties();
    }

    if(
      window.currentPropertyId
      &&
      typeof loadBookings ===
      "function"
    ){
      loadBookings(
        window.currentPropertyId
      );
    }

  }
);
// =====================================
// 🔒 PRO PMS ACCESS
// =====================================

document.addEventListener("rb_plan_ready", ()=>{

  const plan =
    String(window.currentPlan || "")
    .toLowerCase();

  if(
    plan === "demo"
  ){

    window.isDemoData = true;
    window.isDemoDashboard = true;

    console.log(
      "🧪 DEMO DASHBOARD ACTIVE"
    );

  }else{

    window.isDemoData = false;
    window.isDemoDashboard = false;

    console.log(
      "✅ REAL DASHBOARD ACTIVE"
    );

  }

  const access =
    window.getUserAccess?.() || {};

  const pmsIsPro =
    access.isPro ||
    access.isAdmin;

  document
    .querySelectorAll(".pro-pms-only")
    .forEach(el=>{

      el.style.display =
        pmsIsPro
        ? ""
        : "none";

    });

});

window.addEventListener(
  "analysisSaved",
  () => {

    console.log(
      "🔄 DASHBOARD REFRESH"
    );

    if(
      typeof loadUserAnalyses === "function"
    ){
      loadUserAnalyses();
    }

  }
);

document.addEventListener(
  "rb_language_changed",
  ()=>{

    loadProperties();

    if(
      window.currentPropertyId
    ){
      loadBookings(
        window.currentPropertyId
      );
    }

  }
);

// =====================================
// 🏠 SAVE PROPERTY
// =====================================

window.saveProperty = async function(){

  try{

    if(!window.currentUser){
      alert(
  t(
    "Accesso richiesto",
    "Login required"
  )
);
      return;
    }

    const name =
      document.getElementById("property-name")?.value?.trim();

    const city =
      document.getElementById("property-city")?.value?.trim();

    const address =
      document.getElementById("property-address")?.value?.trim();

    const priceNight =
      Number(
        document.getElementById("property-price")?.value || 0
      );

    if(!name){
      alert(
  t(
    "Nome proprietà obbligatorio",
    "Property name required"
  )
);
      return;
    }

    await addDoc(
      collection(db,"properties"),
      {

        uid:
          window.currentUser.uid,

        name,
        city,
        address,
        priceNight,

        createdAt:
          serverTimestamp()

      }
    );

    closePropertyModal();

    document.getElementById("property-name").value = "";
    document.getElementById("property-city").value = "";
    document.getElementById("property-address").value = "";
    document.getElementById("property-price").value = "";

    loadProperties();

  }catch(err){

    console.error(
      "PROPERTY SAVE ERROR:",
      err
    );

  }

};

await loadProperties();

if(
  !window.isDemoDashboard
){
  await loadPMSStats();
}

// =====================================
// 🏠 LOAD PROPERTIES
// =====================================

async function loadProperties(){

  const container =
    document.getElementById(
      "properties-list"
    );

  if(!container) return;

  if(window.isDemoDashboard){

container.innerHTML = `

<div class="property-card">

<h3>
🏠 Napoli Centro Storico
</h3>

<div class="metric">
<span>Città</span>
<strong>Napoli</strong>
</div>

<div class="metric">
<span>Prezzo notte</span>
<strong>€112</strong>
</div>

<div class="metric">
<span>Occupazione</span>
<strong>78%</strong>
</div>

<div class="metric">
<span>RevPAR</span>
<strong>€87</strong>
</div>

<div class="metric">
<span>Ricavi</span>
<strong>€2.980</strong>
</div>

<div style="
display:flex;
gap:10px;
margin-top:15px;
">

<button
class="btn-dashboard"
onclick="openBookings('demo-property')">

Prenotazioni

</button>

</div>

</div>

`;

return;

}

  if(!window.currentUser) return;

  const q =
    query(
      collection(db,"properties"),
      where(
        "uid",
        "==",
        window.currentUser.uid
      )
    );

  const snap =
    await getDocs(q);

  if(snap.empty){

    container.innerHTML = `
      <div
      class="analysis-card"
      style="
      border:1px dashed #cbd5e1;
      text-align:center;
      ">
      ${t(
  "Nessuna proprietà presente",
  "No properties found"
)}
      </div>
    `;

    return;
  }

  let html = "";

  for (const docItem of snap.docs){

  const data =
    docItem.data();

const bookingsSnap =
  await getDocs(
    query(
      collection(db,"bookings"),
      where(
        "uid",
        "==",
        window.currentUser.uid
      ),
      where(
        "propertyId",
        "==",
        docItem.id
      )
    )
  );

  const bookingsCount =
  bookingsSnap.size;

let totalNights = 0;
let realRevenue = 0;
let totalGuests = 0;  

bookingsSnap.forEach(b=>{

  const booking =
    b.data();

  realRevenue +=
  Number(
    booking.totalAmount || 0
  );

  totalGuests +=
Number(
  booking.guests || 0
);

  const nights =
    Math.max(
      1,
      Math.ceil(
        (
          new Date(
            booking.checkout
          ) -
          new Date(
            booking.checkin
          )
        ) /
        (1000*60*60*24)
      )
    );

  totalNights += nights;

});

const daysInMonth =
  new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

const occupancy =
  Math.min(
    100,
    Math.round(
      (
        totalNights /
        daysInMonth
      ) * 100
    )
  );

 let occupancyStatus =
  "🔴 Empty";

if(occupancy >= 80){

  occupancyStatus =
    "🟢 High";

}
else if(
  occupancy >= 40
){

  occupancyStatus =
    "🟡 Medium";

}   

  const revpar =
(
  data.priceNight || 0
)
*
(
  occupancy / 100
);  

    html += `

      <div class="property-card">

        <h3>
          ${data.name || "-"}
        </h3>

        <div class="metric">
          <span>${t("Città","City")}</span>
          <strong>
            ${data.city || "-"}
          </strong>
        </div>

        <div class="metric">
          <span>${t("Indirizzo","Address")}</span>
          <strong>
            ${data.address || "-"}
          </strong>
        </div>

        <div class="metric">
          <span>${t(
  "Prezzo notte",
  "Nightly rate"
)}</span>
          <strong>
            €${data.priceNight || 0}
          </strong>
        </div>

        <div class="metric">

  <span>

    ${t(
      "📈 ADR",
      "📈 ADR"
    )}

  </span>

  <strong>

    €${data.priceNight || 0}

  </strong>

</div>

<div class="metric">

  <span>

    ${t(
      "📅 Prenotazioni",
      "📅 Bookings"
    )}

  </span>

  <strong>

    ${bookingsCount}

  </strong>

</div>

<div class="metric">

  <span>

    ${t(
      "👥 Ospiti",
      "👥 Guests"
    )}

  </span>

  <strong>

    ${totalGuests}

  </strong>

</div>

<div class="metric">

  <span>

    ${t(
      "🌙 Notti",
      "🌙 Nights"
    )}

  </span>

  <strong>

    ${totalNights}

  </strong>

</div>

<div class="metric">

  <span>

    ${t(
      "🏠 Occupazione",
      "🏠 Occupancy"
    )}

  </span>

  <strong>

    ${occupancy}%

  </strong>

</div>

<div class="metric">

  <span>

    ${t(
      "📊 Stato",
      "📊 Status"
    )}

  </span>

  <strong>

    ${occupancyStatus}

  </strong>

</div>

<div class="metric">

  <span>

    📊 RevPAR

  </span>

  <strong>

    ${formatCurrency(revpar)}

  </strong>

</div>

<div class="metric">

  <span>

    ${t(
  "💰 Ricavi totali",
  "💰 Total Revenue"
)}

  </span>

  <strong>

    €${formatCurrency(
  realRevenue
)}
  </strong>

</div>
        <div
        style="
        display:flex;
        gap:10px;
        margin-top:15px;
        ">

          <button
          class="btn-dashboard"
          onclick="openBookings('${docItem.id}')">

          ${t(
  "Prenotazioni",
  "Bookings"
)}

          </button>

          <button
          class="btn-dashboard"
          onclick="deleteProperty('${docItem.id}')">

          ${t(
  "Elimina",
  "Delete"
)}

          </button>

        </div>

      </div>

    `;

  }

  container.innerHTML = html;

}

// =====================================
// 🏠 DELETE PROPERTY
// =====================================

window.deleteProperty =
async function(id){

  const ok =
  confirm(
    t(
      "Eliminare proprietà?",
      "Delete property?"
    )
  );

  if(!ok) return;

  await deleteDoc(
    doc(
      db,
      "properties",
      id
    )
  );

  await loadProperties();

  await loadPMSStats();

  loadProperties();

};

// =====================================
// 📅 CLOSE BOOKINGS MODAL
// =====================================

window.closeBookingsModal = function(){

  const modal =
    document.getElementById(
      "bookings-modal"
    );

  if(modal){
    modal.style.display = "none";
  }

};

// =====================================
// 📅 OPEN BOOKINGS
// =====================================

window.openBookings =
function(propertyId){

  console.log(
    "🔥 BOOKINGS CLICK",
    propertyId
  );

  window.currentPropertyId =
    propertyId;
setTimeout(()=>{

document
.getElementById(
"booking-checkin"
)
?.addEventListener(
"change",
updateBookingTotal
);

document
.getElementById(
"booking-checkout"
)
?.addEventListener(
"change",
updateBookingTotal
);

},200);

  const bookingForm =
document.getElementById(
"booking-form-container"
);

if(bookingForm){

  bookingForm.style.display =
  "none";

}
  
  loadBookings(propertyId);

  const modal =
    document.getElementById(
      "bookings-modal"
    );

  console.log(
    "🔥 MODAL FOUND:",
    modal
  );

  if(modal){

    modal.style.display =
      "flex";

    console.log(
      "🔥 MODAL OPENED"
    );

  }else{

    console.log(
      "❌ MODAL NOT FOUND"
    );

  }

};

// =====================================
// 📅 AUTO BOOKING CALCULATOR
// =====================================

function updateBookingTotal(){

  const checkin =
    document.getElementById(
      "booking-checkin"
    )?.value;

  const checkout =
    document.getElementById(
      "booking-checkout"
    )?.value;

  if(!checkin || !checkout){
    return;
  }

  const start =
    new Date(checkin);

  const end =
    new Date(checkout);

  const nights =
    Math.max(
      1,
      Math.ceil(
        (end - start) /
        (1000 * 60 * 60 * 24)
      )
    );

  const propertyCard =
    document.querySelector(
      ".property-card"
    );

  let adr = 120;

  if(propertyCard){

    const txt =
      propertyCard.innerText;

    const match =
      txt.match(/€(\d+)/);

    if(match){
      adr = Number(match[1]);
    }

  }

  const total =
    nights * adr;

  // =====================================
  // FORM TOTAL
  // =====================================

  const totalField =
    document.getElementById(
      "booking-total"
    );

  if(totalField){

    totalField.value =
      total;

  }

  // =====================================
  // LIVE KPI
  // =====================================

  const revenueEl =
    document.getElementById(
      "booking-live-revenue"
    );

  const nightsEl =
    document.getElementById(
      "booking-live-nights"
    );

  const adrEl =
    document.getElementById(
      "booking-live-adr"
    );

  if(revenueEl){

    revenueEl.innerText =
      formatCurrency(total);

  }

  if(nightsEl){

    nightsEl.innerText =
      nights;

  }

  if(adrEl){

    adrEl.innerText =
      formatCurrency(adr);

  }

}

// =====================================
// 📅 SAVE BOOKING
// =====================================

window.saveBooking = async function(){

  if(!window.currentUser){

  alert(
    "Utente non autenticato"
  );

  return;

}

if(!window.currentPropertyId){

  alert(
    "Nessuna proprietà selezionata"
  );

  return;

}

  const guest =
    document.getElementById(
      "booking-guest"
    )?.value?.trim();

  const checkin =
    document.getElementById(
      "booking-checkin"
    )?.value;

  const checkout =
    document.getElementById(
      "booking-checkout"
    )?.value;

  const guests =
    Number(
      document.getElementById(
        "booking-guests"
      )?.value || 0
    );

  const total =
    Number(
      document.getElementById(
        "booking-total"
      )?.value || 0
    );

  await addDoc(

    collection(
      db,
      "bookings"
    ),

    {

      uid:
        window.currentUser.uid,

      propertyId:
        window.currentPropertyId,

      guestName:
        guest,

      checkin,

      checkout,

      guests,

      totalAmount:
        total,

      status:
document.getElementById(
  "booking-status"
)?.value || "arrival",
      
source:
  document.getElementById(
    "booking-source"
  )?.value || "direct",

      createdAt:
        serverTimestamp()

    }

  );

  console.log(
    "✅ BOOKING SAVED"
  );

  await loadBookings(
  window.currentPropertyId
 );

 await loadPMSStats();

await loadProperties(); 

  alert(
  t(
    "Prenotazione salvata",
    "Booking saved"
  )
);

  closeBookingModal();

};

// =====================================
// 📅 LOAD BOOKINGS
// =====================================

async function loadBookings(propertyId){

  const list =
    document.getElementById(
      "bookings-list"
    );

  if(!list) return;

  if(window.isDemoDashboard){

  list.innerHTML = `

  <div class="analysis-card">

    <strong>
      Marco Rossi
    </strong>

    <br>

    12/06 → 15/06

    <br>

    🏠 Airbnb

    <br>

    €336

  </div>

  <div class="analysis-card">

    <strong>
      John Smith
    </strong>

    <br>

    18/06 → 22/06

    <br>

    🟦 Booking.com

    <br>

    €448

  </div>

  `;

  return;

}

  const q =
    query(
      collection(db,"bookings"),
      where(
        "uid",
        "==",
        window.currentUser.uid
      ),
      where(
        "propertyId",
        "==",
        propertyId
      )
    );

  const snap =
    await getDocs(q);

  console.log(
    "📅 BOOKINGS FOUND:",
    snap.size
  );

  const bookingsData = [];

  if(snap.empty){

    list.innerHTML = `
      <div style="
      padding:10px;
      color:#64748b;
      ">
      ${t(
  "Nessuna prenotazione",
  "No bookings found"
)}
      </div>
    `;

    return;
  }

    let html = "";

let totalGuests = 0;
let totalRevenue = 0;
let totalNights = 0;

// 🔥 STATISTICHE CANALI
let sourceStats = {};

  snap.forEach(docItem=>{

    const b =
      docItem.data();

    bookingsData.push({
  id: docItem.id,
  ...b
});

    window.currentBookingsData =
      bookingsData;

    const source =
  b.source || "Unknown";

if(!sourceStats[source]){

  sourceStats[source] = {
    bookings:0,
    revenue:0
  };

}

sourceStats[source].bookings++;

sourceStats[source].revenue +=
  Number(
    b.totalAmount || 0
  );

    totalGuests +=
      Number(b.guests || 0);

    totalRevenue +=
      Number(b.totalAmount || 0);

    const nights = Math.max(
      1,
      Math.ceil(
        (
          new Date(b.checkout) -
          new Date(b.checkin)
        ) /
        (1000 * 60 * 60 * 24)
      )
    );

    totalNights += nights;

html += `

<div
data-status="${b.status}"
style="
background:#ffffff;
border:1px solid #e2e8f0;
border-radius:20px;
padding:20px;
margin-bottom:14px;
box-shadow:0 8px 24px rgba(15,23,42,.05);
transition:.25s;
position:relative;
overflow:hidden;
">

<div
style="
position:absolute;
left:0;
top:0;
bottom:0;
width:5px;
background:${
b.status === "cancelled"
? "#ef4444"
: b.status === "arrival"
? "#3b82f6"
: b.status === "checkin"
? "#2563eb"
: b.status === "checkout"
? "#f97316"
: b.status === "completed"
? "#8b5cf6"
: "#10b981"
};
">
</div>

<div
style="
display:flex;
justify-content:space-between;
align-items:flex-start;
gap:12px;
">

<div>

<div
style="
font-size:22px;
font-weight:800;
color:#0f172a;
line-height:1.2;
">
${b.guestName}
</div>

<div
style="
font-size:13px;
color:#64748b;
margin-top:6px;
font-weight:600;
">

${window.t(
  "Canale",
  "Channel"
)}
:

${b.source || "Direct"}

•

${nights}

${window.t(
  "notti",
  "nights"
)}

•

€${Number(
  b.totalAmount || 0
).toFixed(0)}

</div>

</div>

${(() => {

let bg="#dcfce7";
let color="#166534";
let label="Confermata";

switch(b.status){

case "arrival":
bg="#dbeafe";
color="#1d4ed8";
label="In Arrivo";
break;

case "checkin":
bg="#bfdbfe";
color="#1e40af";
label="Check-In";
break;

case "checkout":
bg="#fed7aa";
color="#c2410c";
label="Check-Out";
break;

case "completed":
bg="#ede9fe";
color="#7c3aed";
label="Completata";
break;

case "cancelled":
bg="#fee2e2";
color="#b91c1c";
label="Cancellata";
break;

}

return `
<span
style="
background:${bg};
color:${color};
padding:8px 14px;
border-radius:999px;
font-size:12px;
font-weight:700;
white-space:nowrap;
">
${label}
</span>
`;

})()}

</div>

<div
style="
margin-top:18px;
display:flex;
align-items:center;
justify-content:space-between;
padding:14px;
background:#f8fafc;
border-radius:14px;
">

<div>
<div style="font-size:12px;color:#94a3b8;">
Check-In
</div>

<div style="
font-weight:700;
color:#0f172a;
">
${b.checkin}
</div>
</div>

<div style="
font-size:18px;
color:#94a3b8;
">
→
</div>

<div style="text-align:right;">
<div style="
font-size:12px;
color:#94a3b8;
">
Check-Out
</div>

<div style="
font-weight:700;
color:#0f172a;
">
${b.checkout}
</div>
</div>

</div>

<div
style="
display:grid;
grid-template-columns:repeat(3,1fr);
gap:10px;
margin-top:16px;
">

<div
style="
background:#f8fafc;
padding:12px;
border-radius:14px;
text-align:center;
">
<div style="font-size:11px;color:#94a3b8;">
Ospiti
</div>
<div style="
font-size:18px;
font-weight:800;
color:#0f172a;
">
${b.guests}
</div>
</div>

<div
style="
background:#f8fafc;
padding:12px;
border-radius:14px;
text-align:center;
">
<div style="
font-size:11px;
color:#94a3b8;
">
Notti
</div>
<div style="
font-size:18px;
font-weight:800;
color:#0f172a;
">
${nights}
</div>
</div>

<div
style="
background:#ecfdf5;
padding:12px;
border-radius:14px;
text-align:center;
">
<div style="
font-size:11px;
color:#10b981;
">
Ricavo
</div>
<div style="
font-size:18px;
font-weight:800;
color:#059669;
">
€${Number(
b.totalAmount || 0
).toFixed(0)}
</div>
</div>

</div>

<div
style="
display:flex;
justify-content:space-between;
align-items:center;
margin-top:18px;
">

<div
style="
font-size:13px;
font-weight:600;
color:#475569;
">

${b.source === "airbnb"
? "🏠 Airbnb"
: b.source === "booking"
? "🟦 Booking.com"
: b.source === "vrbo"
? "🏡 VRBO"
: b.source === "website"
? "🌐 Website"
: b.source === "phone"
? "☎️ Telefono"
: "📞 Direct"}

</div>

<button
onclick="deleteBooking('${docItem.id}')"
style="
width:38px;
height:38px;
border:none;
border-radius:12px;
background:#fee2e2;
color:#dc2626;
cursor:pointer;
font-size:16px;
">
🗑️
</button>

</div>

</div>

`;

    });

  const summary =
    document.getElementById(
      "booking-summary"
    );

  if(summary){

    summary.innerHTML = `

      <div class="analysis-card">
        📅 ${window.t(
          "Prenotazioni",
          "Bookings"
        )}
        <br>
        <strong>${snap.size}</strong>
      </div>

      <div class="analysis-card">
        👥 ${window.t(
          "Ospiti",
          "Guests"
        )}
        <br>
        <strong>${totalGuests}</strong>
      </div>

      <div class="analysis-card">
        💰 ${window.t(
          "Ricavi",
          "Revenue"
        )}
        <br>
        <strong>
        €${totalRevenue.toFixed(2)}
        </strong>
      </div>

      <div class="analysis-card">
        🌙 ${window.t(
          "Notti",
          "Nights"
        )}
        <br>
        <strong>${totalNights}</strong>
      </div>

    `;

  }

  const channelsEl =
  document.getElementById(
    "booking-channels"
  );

if(channelsEl){

  let channelsHtml = `

  <div class="analysis-card">

    <h4 style="
      margin-bottom:12px;
      font-size:14px;
      font-weight:700;
    ">
      📡 ${window.t(
        "Performance Canali",
        "Channel Performance"
      )}
    </h4>

  `;

  const channelNames = {

  airbnb:"🏠 Airbnb",

  booking:"🟦 Booking.com",

  vrbo:"🏡 VRBO",

  website:"🌐 Website",

  direct:"📞 Direct"

};

  Object.entries(sourceStats)
  .sort((a,b)=>
    b[1].revenue - a[1].revenue
  )
  .forEach(([name,data])=>{

    channelsHtml += `

<div style="
padding:10px 0;
border-bottom:1px solid #e2e8f0;
">

<div style="
font-size:13px;
font-weight:700;
color:#0f172a;
margin-bottom:4px;
">
${channelNames[name] || name}
</div>

<div style="
display:flex;
justify-content:space-between;
font-size:12px;
color:#64748b;
">

<div style="
display:flex;
justify-content:space-between;
align-items:center;
font-size:12px;
color:#64748b;
">

<span>
${data.bookings} pren.
</span>

<span>
€${data.revenue.toFixed(0)}
</span>

</div>

<span>
€${data.revenue.toFixed(0)}
</span>

</div>

</div>

`;

  });

  channelsHtml += `
  </div>
  `;

  channelsEl.innerHTML =
    channelsHtml;

}

  list.innerHTML = html;

  document
.querySelectorAll(
".booking-filter"
)
.forEach(btn=>{

btn.onclick = ()=>{

document
.querySelectorAll(
".booking-filter"
)
.forEach(b=>
b.classList.remove(
"active"
)
);

btn.classList.add(
"active"
);

filterBookings(
btn.dataset.filter
);

};

});

  renderPMSCalendar(bookingsData);

}

// =====================================
// 🗑 DELETE BOOKING
// =====================================

window.deleteBooking =
async function(id){

  if(
    !confirm(
      window.t(
        "Eliminare prenotazione?",
        "Delete booking?"
      )
    )
  ){
    return;
  }

  await deleteDoc(
    doc(
      db,
      "bookings",
      id
    )
  );

  await loadPMSStats();

await loadProperties();

await loadBookings(
  window.currentPropertyId
);

};

// =====================================
// 📊 PMS DASHBOARD KPI
// =====================================

async function loadPMSStats(){

  if(window.isDemoDashboard){

  console.log(
    "🧪 PMS DEMO MODE"
  );

  const setText = (id,value)=>{

    const el =
      document.getElementById(id);

    if(el){
      el.innerText = value;
    }

  };

  setText("pms-total-properties","1");
  setText("pms-total-bookings","11");
  setText("pms-total-revenue","€2.980");
  setText("pms-occupancy","78%");
  setText("pms-adr","€112");
  setText("pms-revpar","€87");
  setText("pms-avgstay","3.2");
  setText("pms-guests","27");
  setText("pms-arrivals-today","2");
  setText("pms-departures-today","1");
  setText("pms-guests-in-house","5");
  setText("pms-checkin-today","2");
  setText("pms-checkout-today","1");
  setText("pms-pending-bookings","2");

  return;

}

  if(!window.currentUser) return;

  const propertiesSnap =
    await getDocs(
      query(
        collection(db,"properties"),
        where(
          "uid",
          "==",
          window.currentUser.uid
        )
      )
    );

  const bookingsSnap =
    await getDocs(
      query(
        collection(db,"bookings"),
        where(
          "uid",
          "==",
          window.currentUser.uid
        )
      )
    );

  const properties =
    propertiesSnap.size;

  const bookings =
    bookingsSnap.size;

  let revenue = 0;
  let totalNights = 0;

  let arrivalsToday = 0;
  let departuresToday = 0;
  let guestsInHouse = 0;

  let checkinToday = 0;
  let checkoutToday = 0;
  let pendingBookings = 0;

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  bookingsSnap.forEach(docItem=>{

    const b =
      docItem.data();

    revenue +=
      Number(
        b.totalAmount || 0
      );

    const nights =
      Math.max(
        1,
        Math.ceil(
          (
            new Date(b.checkout) -
            new Date(b.checkin)
          ) /
          (1000 * 60 * 60 * 24)
        )
      );

    totalNights += nights;

    // ======================
    // STATUS KPI
    // ======================

    if(
      b.status === "checkin"
    ){
      checkinToday++;
    }

    if(
      b.status === "checkout"
    ){
      checkoutToday++;
    }

    if(
      b.status === "pending"
    ){
      pendingBookings++;
    }

    // ======================
    // ARRIVALS / DEPARTURES
    // ======================

    if(
      b.checkin === today
    ){
      arrivalsToday++;
    }

    if(
      b.checkout === today
    ){
      departuresToday++;
    }

    // ======================
    // GUESTS IN HOUSE
    // ======================

    if(
      b.checkin <= today &&
      b.checkout >= today
    ){

      guestsInHouse +=
        Number(
          b.guests || 0
        );

    }

  });

  const adr =
    totalNights > 0
    ? revenue / totalNights
    : 0;

  const avgStay =
    bookings > 0
    ? totalNights / bookings
    : 0;

  const daysInMonth =
    new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();

  const occupancy =
    properties > 0
    ? Math.min(
        100,
        Math.round(
          (
            totalNights /
            (properties * daysInMonth)
          ) * 100
        )
      )
    : 0;

  const revpar =
    adr *
    (occupancy / 100);

  // ======================
  // KPI UPDATE
  // ======================

  const setText = (id,value)=>{

  const el =
    document.getElementById(id);

  if(el){

    el.innerText = value;

  }

};

setText(
  "pms-total-properties",
  properties
);

setText(
  "pms-total-bookings",
  bookings
);

setText(
  "pms-total-revenue",
  formatCurrency(revenue)
);

setText(
  "pms-occupancy",
  occupancy + "%"
);

setText(
  "pms-adr",
  formatCurrency(adr)
);

setText(
  "pms-revpar",
  formatCurrency(revpar)
);

setText(
  "pms-avgstay",
  avgStay.toFixed(1)
);

setText(
  "pms-guests",
  bookingsSnap.docs.reduce(
    (sum,d)=>
      sum +
      Number(
        d.data().guests || 0
      ),
    0
  )
);

setText(
  "pms-arrivals-today",
  arrivalsToday
);

setText(
  "pms-departures-today",
  departuresToday
);

setText(
  "pms-guests-in-house",
  guestsInHouse
);

setText(
  "pms-checkin-today",
  checkinToday
);

setText(
  "pms-checkout-today",
  checkoutToday
);

setText(
  "pms-pending-bookings",
  pendingBookings
);

  // ======================
  // PERFORMANCE CHART
  // ======================

  renderPMSPerformanceChart(
    bookingsSnap.docs.map(
      d => d.data()
    )
  );

  // =====================================
// 🤖 CHATBOT PMS MEMORY
// =====================================

window.rbPMSData = {

  properties,
  bookings,
  revenue,
  occupancy,
  adr,
  revpar,
  avgStay,

  guests:
    bookingsSnap.docs.reduce(
      (sum,d)=>
        sum +
        Number(
          d.data().guests || 0
        ),
      0
    ),

  // 🔥 compatibilità chatbot
  arrivals:
    arrivalsToday,

  checkins:
    checkinToday,

  checkouts:
    checkoutToday,

  arrivalsToday,
  departuresToday,
  guestsInHouse,

  checkinToday,
  checkoutToday,
  pendingBookings

};

console.log(
  "🤖 PMS MEMORY:",
  window.rbPMSData
);

  console.log(
  "👥 PMS GUESTS:",
  window.rbPMSData.guests
);

  console.log(
    "🏨 PMS STATS",
    {
      properties,
      bookings,
      revenue,
      occupancy,
      adr,
      revpar,
      avgStay,
      arrivalsToday,
      departuresToday,
      guestsInHouse,
      checkinToday,
      checkoutToday,
      pendingBookings
    }
  );

}
// =====================================
// 📈 PMS PERFORMANCE CHART
// =====================================

function renderPMSPerformanceChart(
  bookings
){

  const canvas =
    document.getElementById(
      "pms-performance-chart"
    );

  if(!canvas) return;

  const monthlyRevenue =
    Array(12).fill(0);

  bookings.forEach(b=>{

    if(!b.checkin) return;

    const month =
      new Date(
        b.checkin
      ).getMonth();

    monthlyRevenue[month] +=
      Number(
        b.totalAmount || 0
      );

  });

  const existing =
    Chart.getChart(canvas);

  if(existing){

    existing.destroy();

  }

  new Chart(canvas,{

    type:"bar",

    data:{

      labels:[
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],

      datasets:[{

label:"Revenue",

data:monthlyRevenue,

backgroundColor:"#10b981",

borderRadius:12,

borderSkipped:false

}]

    },

    options:{

      responsive:true,

      plugins:{
        legend:{
          display:false
        }
      }

    }

  });

}
function renderPMSCalendar(bookings){

  const container =
    document.getElementById(
      "booking-calendar"
    );

  if(!container) return;

  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    today.getMonth();

  const firstDay =
    new Date(year,month,1);

  const lastDay =
    new Date(year,month + 1,0);

  const daysInMonth =
    lastDay.getDate();

  const startDay =
    firstDay.getDay();

  const monthNames = [
    "Gennaio","Febbraio","Marzo",
    "Aprile","Maggio","Giugno",
    "Luglio","Agosto","Settembre",
    "Ottobre","Novembre","Dicembre"
  ];

  let html = `

  <div style="
  font-weight:700;
  text-align:center;
  margin-bottom:10px;
  color:#0f172a;
  ">
    ${monthNames[month]} ${year}
  </div>

  <div style="
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:4px;
  font-size:11px;
  text-align:center;
  color:#64748b;
  margin-bottom:6px;
  ">
    <div>D</div>
    <div>L</div>
    <div>M</div>
    <div>M</div>
    <div>G</div>
    <div>V</div>
    <div>S</div>
  </div>

  <div style="
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:4px;
  ">
  `;

  for(let i=0;i<startDay;i++){

    html += `
    <div></div>
    `;

  }

  for(let day=1; day<=daysInMonth; day++){

    const currentDate =
      `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    let color = "";
    let tooltip = "";

    bookings.forEach(b=>{

      if(
        currentDate >= b.checkin &&
        currentDate < b.checkout
      ){

        color = "#10b981";
        tooltip = b.guestName;

      }

      if(
        currentDate === b.checkin
      ){

        color = "#3b82f6";
        tooltip = `Arrivo ${b.guestName}`;

      }

      if(
        currentDate === b.checkout
      ){

        color = "#f97316";
        tooltip = `Partenza ${b.guestName}`;

      }

      if(
        b.status === "cancelled" &&
        currentDate >= b.checkin &&
        currentDate <= b.checkout
      ){

        color = "#ef4444";
        tooltip = `Cancellata ${b.guestName}`;

      }

    });

    html += `

    <div
    title="${tooltip}"
    style="
    height:34px;
    border-radius:8px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:12px;
    font-weight:600;
    background:${color || "#f8fafc"};
    color:${color ? "#fff" : "#0f172a"};
    border:1px solid ${
      color
      ? color
      : "#e2e8f0"
    };
    ">
      ${day}
    </div>

    `;

  }

  html += `
  </div>
  `;

  container.innerHTML = html;

}
// =====================================
// 🔥 BOOKING FILTERS
// =====================================

window.filterBookings =
function(status){

const cards =
document.querySelectorAll(
"#bookings-list > div"
);

cards.forEach(card=>{

const cardStatus =
card.dataset.status;

if(
status === "all"
){

card.style.display =
"block";

return;

}

card.style.display =
cardStatus === status
? "block"
: "none";

});

};
