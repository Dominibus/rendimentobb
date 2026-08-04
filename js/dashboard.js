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
updateDoc,
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

// =====================================
// 🔐 DASHBOARD ACCESS MANAGER
// =====================================

function getDashboardAccess(){

  const access =
    window.getUserAccess?.() || {};

  const plan =
    String(window.currentPlan || "")
    .toLowerCase();

  return{

    plan,

    isDemo:
      !!window.isDemoDashboard,

    isGuest:
      !window.currentUser,

    isFree:
      access.isFree ||
      plan === "free",

    isInvestor:
      access.isInvestor ||
      plan === "investor",

isPro:

  access.isPro ||

  access.isAdmin ||

  plan === "pro" ||

  plan === "pro_yearly",

    isAdmin:
      access.isAdmin || false,

    canViewProfit:
  window.isDemoDashboard ||
  access.isInvestor ||
  access.isPro ||
  access.isAdmin,

    canUsePMS:
      window.isDemoDashboard ||
      access.isInvestor ||
      access.isPro ||
      access.isAdmin,

    canExportPDF:
      window.isDemoDashboard ||
      access.isPro ||
      access.isAdmin,

    canDelete:
  window.isDemoDashboard ||
  access.isInvestor ||
  access.isPro ||
  access.isAdmin,

    canUseAI:
  window.isDemoDashboard ||
  access.isInvestor ||
  access.isPro ||
  access.isAdmin,

  canViewDashboard:
  window.isDemoDashboard ||
  access.isInvestor ||
  access.isPro ||
  access.isAdmin,

canViewHistory:
  window.isDemoDashboard ||
  access.isInvestor ||
  access.isPro ||
  access.isAdmin,  

  };

}

function isPro(){

  return getDashboardAccess().isPro;

}

function isDemo(){

  return getDashboardAccess().isDemo;

}

function isInvestor(){

  return getDashboardAccess().isInvestor;

}

function isFree(){

  return getDashboardAccess().isFree;

}

function canUsePMS(){

  return getDashboardAccess().canUsePMS;

}

function canExportPDF(){

  return getDashboardAccess().canExportPDF;

}

function canDelete(){

  return getDashboardAccess().canDelete;

}

function canUseAI(){

  return getDashboardAccess().canUseAI;

}

function canViewProfit(){

  return getDashboardAccess().canViewProfit;

}

function canViewDashboard(){

  return getDashboardAccess().canViewDashboard;

}

function canViewHistory(){

  return getDashboardAccess().canViewHistory;

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
    if(currentPlan === "free"){

    if(typeof showInvestorOverlay === "function"){
        showInvestorOverlay();
    }

}

// 🟢 INVESTOR

else if(currentPlan === "investor"){

    console.log("INVESTOR → no upgrade overlay");

}

// 🟢 PRO / ADMIN
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

  const dashboardAccess =
getDashboardAccess();

console.log(
  "PLAN:",
  dashboardAccess.plan
);

if(!dashboardAccess.plan){
  console.warn(
    "Plan non pronto → skip lock"
  );
  return;
}

const pro =
dashboardAccess.isPro;

const isInvestor =
dashboardAccess.isInvestor;

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
// 🎯 DEMO DASHBOARD MODE
// =====================================

function useDemoDashboard(){

  return (
    isDemo() ||
    isFree()
  );

}

  // =====================================
  // 🔥 FIRESTORE / DEMO
  // =====================================

  let querySnapshot = {

    docs: [],
    size: 0,
    empty: true

  };

if(

    canUseFirestorePMS() &&

    window.currentUser?.uid &&

    window.currentUser.uid !== "demo-user"

){

    console.log("🔥 FIRESTORE DASHBOARD");

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
      "🧪 DEMO DASHBOARD"
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

investmentScore:
  data.investmentScore ?? 0,

verdict:
  data.verdict ?? null,

city:
  realCity,

    marketCity,

    realCity,

    createdAt:
      data.createdAt ||
      data.createdAtClient ||
      new Date()

  };

});

// ================= ACCESS =================

window.isDemoData =
  useDemoDashboard();

window.isDemoDashboard =
  useDemoDashboard();

if(useDemoDashboard()){

  analyses.length = 0;

  analyses.push(
    ...window.demoAnalyses
  );

}

// 🔥 FIX → rende disponibili al report
window.dashboardSimulations = analyses;

// =====================================
// 🤖 CHATBOT INVESTMENT MEMORY
// =====================================

window.investmentHistory =
  analyses.map(a => ({

    city:
      a.city,

    marketCity:
      a.marketCity,

    roi:
      Number(a.roi || 0),

    risk:
      Number(a.risk || 0),

    occupancy:
      Number(a.occupancy || 0),

    net:
      Number(a.net || 0),

    annualProfit:
      Number(a.net || 0),

    propertyPrice:
      Number(a.price || 0),

    equity:
      Number(a.equity || 0),

    createdAt:
      a.createdAt

  }));

console.log(
  "🤖 INVESTMENT HISTORY:",
  window.investmentHistory.length
);
  
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

<div style="
display:flex;
align-items:center;
gap:10px;
">

<button
id="prev-page"
style="
padding:6px 10px;
border:1px solid #cbd5e1;
border-radius:8px;
background:white;
cursor:pointer;
">
←
</button>

<div>
${t("Pagina","Page")}
<strong>${window.rbPage}</strong>
/
<strong>${totalPages}</strong>
</div>

<button
id="next-page"
style="
padding:6px 10px;
border:1px solid #cbd5e1;
border-radius:8px;
background:white;
cursor:pointer;
">
→
</button>

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

const prevBtn =
document.getElementById(
"prev-page"
);

const nextBtn =
document.getElementById(
"next-page"
);

if(prevBtn){

prevBtn.onclick = ()=>{

if(window.rbPage > 1){

window.rbPage--;

window.__dashboardLoaded = false;
window.__forceReload = true;

loadDashboard();

}

};

}

if(nextBtn){

nextBtn.onclick = ()=>{

if(window.rbPage < totalPages){

window.rbPage++;

window.__dashboardLoaded = false;
window.__forceReload = true;

loadDashboard();

}

};

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
  canViewProfit()
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
!canViewProfit()
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
window.isDemoData || !canDelete()
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

// =====================================
// 🤖 CHATBOT DASHBOARD MEMORY
// =====================================

window.lastAnalysisData = {

  roi:
    Number(best?.roi || 0),

  realROI:
    Number(best?.roi || 0),

  visualROI:
    Number(best?.roi || 0),

  risk:
    Number(best?.risk || 0),

  occupancy:
    Number(best?.occupancy || 0),

  net:
    Number(best?.net || 0),

  annualProfit:
    Number(best?.net || 0),

  cashflow:
    Number(best?.net || 0),

  propertyPrice:
    Number(best?.price || 0),

  equity:
    Number(best?.equity || 0),

  city:
    best?.city || "roma",

  marketCity:
    best?.marketCity ||
    best?.city ||
    "roma"

};

console.log(
  "🤖 DASHBOARD MEMORY:",
  window.lastAnalysisData
);  

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

const canViewDashboardData =
  canViewDashboard();

if(kpiRoi){
  kpiRoi.innerText = avgROIRounded + "%";
}

if(kpiCash){
  kpiCash.innerText =
    canViewDashboardData
      ? formatCurrency(monthlyProfit)
      : "🔒";
}

if(kpiInvest){
  kpiInvest.innerText =
    canViewDashboardData
      ? formatCurrency(totalCapital)
      : "🔒";
}
  
if(kpiBreak){
  kpiBreak.innerText =
    canViewDashboardData
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
    canViewDashboardData
      ? formatCurrency(avgCashflow)
      : "🔒";
}

const capEl =
document.getElementById("portfolio-capital");

if(capEl){
  capEl.textContent =
    canViewDashboardData
      ? formatCurrency(totalCapital)
      : "🔒";
}

const countEl = document.getElementById("portfolio-count");
if(countEl) countEl.textContent = count;

const investmentScore =
calculateInvestmentScore(
    avgROI,
    totalCapital,
    count
);

updateDynamicTexts();


// =====================================
// 🤖 AI EXECUTIVE INSIGHT
// =====================================

const aiInsight =
document.getElementById("dashboard-ai-insight");

if(aiInsight){

let insight = "";
let color = "#10b981";
let icon = "🟢";

if(avgROI >= marketROI + 5){

insight = t(
"Il tuo portafoglio sta performando significativamente sopra la media del mercato. Le attuali condizioni suggeriscono una buona opportunità di espansione.",
"Your portfolio is performing significantly above the market average. Current conditions suggest a strong opportunity for expansion."
);

}
else if(avgROI >= marketROI){

color = "#3b82f6";
icon = "🔵";

insight = t(
"Le performance sono superiori alla media del mercato. Mantieni la strategia attuale monitorando nuove opportunità.",
"Performance is above market average. Maintain the current strategy while monitoring new investment opportunities."
);

}
else{

color = "#f59e0b";
icon = "🟠";

insight = t(
"Il rendimento è inferiore al benchmark di mercato. Valuta immobili con ROI più elevato o riduci i costi operativi.",
"Performance is below the market benchmark. Consider higher ROI properties or optimize operating costs."
);

}

aiInsight.innerHTML = `

<div class="analysis-card">

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:18px;
">

<div>

<div style="
font-size:12px;
font-weight:700;
color:#64748b;
text-transform:uppercase;
letter-spacing:.8px;
">

🤖 AI Executive Insight

</div>

<h3 style="
margin:6px 0 0;
font-size:26px;
font-weight:800;
color:${color};
">

${icon} ${investmentScore}/100

</h3>

</div>

<div style="
font-size:14px;
font-weight:700;
color:${color};
">

${avgROIRounded}% ROI

</div>

</div>

<p style="
margin:0;
font-size:15px;
line-height:1.7;
color:#475569;
">

${insight}

</p>

</div>

`;

}


const kpiContainer =
document.getElementById("dashboard-kpi");

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

  window.isDemoData = true;
  window.isDemoDashboard = true;

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

  console.log("👀 INVESTOR → FULL ACCESS");

  window.isDemoData = false;
  window.isDemoDashboard = false;

  document.body.classList.add("is-investor");

  return;
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

<div style="
font-size:14px;
color:#64748b;
line-height:1.6;
font-weight:500;
">

${
verdict.type === "excellent"

? t(
"Questo investimento supera gli standard di redditività utilizzati nelle valutazioni istituzionali.",
"This investment exceeds the profitability standards commonly used in institutional evaluations."
)

: verdict.type === "good"

? t(
"Il potenziale è elevato, ma alcuni parametri possono essere ottimizzati per incrementare rendimento e sostenibilità.",
"The investment shows strong potential, but several parameters can be optimized to improve returns and sustainability."
)

: t(
"L'investimento non raggiunge attualmente i requisiti minimi consigliati per un'operazione sostenibile.",
"The investment currently does not meet the minimum requirements recommended for a sustainable operation."
)

}

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
canViewDashboard()
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
  "cashflow-chart-container",
  "investment-insight",
  "city-distribution-chart",
  "executive-summary",
  "pms-performance-chart",
  "properties-list"

];

  elementsToBlur.forEach(id=>{

  const el = document.getElementById(id);

  if(!el) return;

  el.style.filter = "blur(6px)";
  el.style.pointerEvents = "none";
  el.style.userSelect = "none";
  el.classList.add("rb-locked");
  el.style.opacity = "0.65";

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


    window.pmsEditingBooking =
        false;


    setTimeout(()=>{

        updateBookingTotal();

    },100);

};

// =====================================
// ❌ CLOSE BOOKING FORM ONLY
// =====================================

window.closeBookingForm = function(){

    const form =
        document.getElementById(
            "booking-form-container"
        );

    if(form){

        form.style.display = "none";

    }

    window.pmsEditingBooking = false;

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

const showPMS =
  canUsePMS();

const showReports =
  canExportPDF();


// =====================================
// 🏨 PMS
// =====================================

document
.querySelectorAll(".pro-pms-only")
.forEach(el=>{

  el.style.display =
    showPMS
      ? ""
      : "none";

});

// =====================================
// 📄 REPORT PRO
// =====================================

document
.querySelectorAll(".pro-report-only")
.forEach(el=>{

  el.style.display =
    showReports
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
// 🔒 FIRESTORE PMS ACCESS
// =====================================

function canUseFirestorePMS(){

  const access =
    window.getUserAccess?.() || {};

  return (
    access.isPro ||
    access.isInvestor ||
    access.isAdmin
  );

}

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

    if(canUseFirestorePMS()){

  await addDoc(
    collection(db,"properties"),
    {

      uid: window.currentUser.uid,

      name,
      city,
      address,
      priceNight,

      createdAt:
        serverTimestamp()

    }
  );

}else{

  console.log(
    "🧪 FREE PMS PROPERTY"
  );

}

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

if(canUseFirestorePMS()){

  console.log(
    "🔥 LOAD FIRESTORE PROPERTIES"
  );

}else{

  console.log(
    "🧪 LOAD DEMO PROPERTIES"
  );

}

await loadProperties();

if(
  canUseFirestorePMS()
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

  if(!canUseFirestorePMS()){

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

<div style="
display:flex;
justify-content:space-between;
align-items:flex-start;
gap:18px;
margin-bottom:22px;
">

<div style="flex:1;">

<div style="
display:flex;
align-items:center;
gap:10px;
margin-bottom:8px;
">

<div style="
width:52px;
height:52px;
border-radius:14px;
background:linear-gradient(135deg,#10b981,#059669);
display:flex;
align-items:center;
justify-content:center;
font-size:24px;
color:white;
box-shadow:0 8px 20px rgba(16,185,129,.25);
">

🏠

</div>

<div>

<h3 style="
margin:0;
font-size:22px;
font-weight:800;
color:#0f172a;
line-height:1.2;
">

${data.name || "-"}

</h3>

<div style="
margin-top:4px;
font-size:14px;
color:#64748b;
display:flex;
align-items:center;
gap:6px;
">

📍 ${data.city || "-"}

</div>

</div>

</div>

</div>

<div style="
display:flex;
flex-direction:column;
align-items:flex-end;
gap:8px;
">

<div style="
padding:8px 14px;
border-radius:999px;
background:
${
occupancy>=80
? "#dcfce7"
: occupancy>=40
? "#fef3c7"
: "#fee2e2"
};

font-weight:700;
font-size:13px;

color:
${
occupancy>=80
? "#166534"
: occupancy>=40
? "#92400e"
: "#991b1b"
};
">

${occupancyStatus}

</div>

<div style="
font-size:12px;
color:#64748b;
font-weight:600;
">

${bookingsCount}
${t(
"prenotazioni",
"bookings"
)}

</div>

</div>

</div>

        <div style="
margin-top:18px;
padding:18px;
background:linear-gradient(180deg,#f8fafc,#ffffff);
border:1px solid #e2e8f0;
border-radius:18px;
">

<div style="
display:flex;
align-items:center;
gap:8px;
font-size:14px;
font-weight:600;
color:#64748b;
margin-bottom:18px;
">

📍

<span>

${data.address || "-"}

</span>

</div>

<div class="property-kpi-grid">

<div class="property-kpi-card">

<div class="property-kpi-label">
ADR
</div>

<div class="property-kpi-value">
€${data.priceNight || 0}
</div>

</div>

<div class="property-kpi-card">

<div class="property-kpi-label">
Occupancy
</div>

<div class="property-kpi-value">
${occupancy}%
</div>

</div>

<div class="property-kpi-card">

<div class="property-kpi-label">
RevPAR
</div>

<div class="property-kpi-value">
${formatCurrency(revpar)}
</div>

</div>

<div class="property-kpi-card">

<div class="property-kpi-label">
${t("Prenotazioni","Bookings")}
</div>

<div class="property-kpi-value">
${bookingsCount}
</div>

</div>

<div class="property-kpi-card">

<div class="property-kpi-label">
${t("Ospiti","Guests")}
</div>

<div class="property-kpi-value">
${totalGuests}
</div>

</div>

<div class="property-kpi-card">

<div class="property-kpi-label">
${t("Notti","Nights")}
</div>

<div class="property-kpi-value">
${totalNights}
</div>

</div>

</div>

<div style="
margin-top:22px;
padding:24px;
border-radius:22px;
background:linear-gradient(135deg,#10b981,#059669);
color:white;
position:relative;
overflow:hidden;
box-shadow:0 18px 45px rgba(16,185,129,.28);
">

<div style="
position:absolute;
right:24px;
top:50%;

transform:translateY(-50%);

width:86px;
height:86px;

border-radius:50%;

background:
radial-gradient(
circle at 30% 30%,
rgba(255,255,255,.28),
rgba(255,255,255,.05)
);

border:1px solid rgba(255,255,255,.18);

backdrop-filter:blur(8px);

display:flex;
align-items:center;
justify-content:center;

pointer-events:none;
">

<svg
width="36"
height="36"
viewBox="0 0 24 24"
fill="none"
stroke="rgba(255,255,255,.92)"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round">

<path d="M12 1v22"/>

<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>

</svg>

</div>

<div style="
font-size:13px;
font-weight:600;
opacity:.9;
text-transform:uppercase;
letter-spacing:.8px;
">

${t(
"Ricavi Totali",
"Total Revenue"
)}

</div>

<div style="
margin-top:8px;
font-size:38px;
font-weight:900;
letter-spacing:-1px;
line-height:1;
">

${formatCurrency(realRevenue)}

</div>

<div style="
margin-top:18px;
display:flex;
justify-content:space-between;
align-items:center;
font-size:13px;
opacity:.92;
">

<div>

${bookingsCount}
${t(
"prenotazioni",
"bookings"
)}

</div>

<div>

${occupancy}% Occupancy

</div>

<div>

ADR €${data.priceNight || 0}

</div>

</div>

</div>

</div>

        <div
style="
display:flex;
gap:12px;
margin-top:22px;
">

<button
class="btn-dashboard"
style="
flex:1;
height:48px;
font-weight:700;
border-radius:12px;
"
onclick="openBookings('${docItem.id}')">

📅 ${t(
"Prenotazioni",
"Bookings"
)}

</button>

<button
class="btn-dashboard"
style="
width:48px;
height:48px;
padding:0;
border-radius:12px;
background:#fee2e2;
color:#dc2626;
"

onclick="deleteProperty('${docItem.id}')">

🗑️

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
// 📌 SHOW BOOKING DETAILS
// =====================================

window.showBookingDetails = function(booking){

    console.log(
        "📌 OPEN BOOKING DETAILS",
        booking
    );


    const modal =
        document.getElementById(
            "booking-form-container"
        );


    if(!modal){

        console.error(
            "❌ Booking modal not found"
        );

        return;

    }


    const title =
        modal.querySelector("h3");


    if(title){

        title.textContent =
            "📌 Dettaglio Prenotazione";

    }


    modal.style.display = "flex";


    window.pmsEditingBooking = true;

window.currentSelectedBooking = booking;

    const guest =
        document.getElementById(
            "booking-guest"
        );


    const checkin =
        document.getElementById(
            "booking-checkin"
        );


    const checkout =
        document.getElementById(
            "booking-checkout"
        );



    if(guest){

        guest.value =
            booking.guestName || "";

    }



    if(checkin){

        checkin.value =
            booking.checkin || "";

    }



    if(checkout){

        checkout.value =
            booking.checkout || "";

    }



    const nightsField =
        document.getElementById(
            "booking-live-nights"
        );


    const amountField =
        document.getElementById(
            "booking-live-revenue"
        );


    const adrField =
        document.getElementById(
            "booking-live-adr"
        );



    if(amountField){

        amountField.textContent =
            "€" + (booking.totalAmount || 0);

    }



    if(nightsField){

        nightsField.textContent =
            booking.nights || 0;

    }



    if(adrField){

        const adr =
            booking.nights
            ? booking.totalAmount / booking.nights
            : 0;


        adrField.textContent =
            "€" + adr.toFixed(0);

    }

  const ai =
window.getBookingExecutiveAnalysis
    ? window.getBookingExecutiveAnalysis(booking)
    : null;

let executive =
document.getElementById(
    "booking-executive-summary"
);

if(!executive){

    executive =
    document.createElement("div");

    executive.id =
    "booking-executive-summary";

    executive.style.marginTop = "20px";

    modal.appendChild(executive);

}

executive.innerHTML = ai ? `

<div style="
background:linear-gradient(135deg,#0f172a,#1e293b);
border-radius:18px;
padding:22px;
color:#fff;
box-shadow:0 10px 30px rgba(15,23,42,.25);
">

<div style="
display:flex;
justify-content:space-between;
align-items:flex-start;
gap:20px;
margin-bottom:22px;
flex-wrap:wrap;
">

<div>

<div style="
font-size:12px;
opacity:.70;
text-transform:uppercase;
letter-spacing:1.2px;
font-weight:700;
">

🤖 EXECUTIVE AI ANALYSIS

</div>

<div style="
font-size:30px;
font-weight:800;
margin-top:6px;
line-height:1.2;
">

${ai.verdict}

</div>

<div style="
margin-top:10px;
font-size:14px;
opacity:.80;
">

${window.t(
"Analisi strategica della prenotazione",
"Strategic booking analysis"
)}

</div>

</div>

<div style="
display:flex;
flex-direction:column;
align-items:center;
background:rgba(16,185,129,.12);
border:1px solid rgba(16,185,129,.35);
padding:14px 18px;
border-radius:14px;
min-width:110px;
">

<div style="
font-size:11px;
text-transform:uppercase;
opacity:.70;
">

${window.t("Score","Score")}

</div>

<div style="
font-size:34px;
font-weight:800;
color:#34d399;
margin-top:4px;
">

${ai.bookingScore}

</div>

</div>

</div>

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
gap:14px;
">

<div style="
background:rgba(255,255,255,.06);
padding:16px;
border-radius:12px;
">

<div style="font-size:11px;opacity:.65;text-transform:uppercase;">
💰 ${window.t("Ricavi","Revenue")}
</div>

<div style="margin-top:8px;font-size:18px;font-weight:700;">
${ai.revenueQuality}
</div>

</div>

<div style="
background:rgba(255,255,255,.06);
padding:16px;
border-radius:12px;
">

<div style="font-size:11px;opacity:.65;text-transform:uppercase;">
📈 ${window.t("Occupazione","Occupancy")}
</div>

<div style="margin-top:8px;font-size:18px;font-weight:700;">
${ai.occupancyImpact}
</div>

</div>

<div style="
background:rgba(255,255,255,.06);
padding:16px;
border-radius:12px;
">

<div style="font-size:11px;opacity:.65;text-transform:uppercase;">
⭐ ${window.t("Recensioni","Reviews")}
</div>

<div style="margin-top:8px;font-size:18px;font-weight:700;">
${ai.reviewPotential}
</div>

</div>

<div style="
background:rgba(255,255,255,.06);
padding:16px;
border-radius:12px;
">

<div style="font-size:11px;opacity:.65;text-transform:uppercase;">
🚀 ${window.t("Upsell","Upsell")}
</div>

<div style="margin-top:8px;font-size:18px;font-weight:700;">
${ai.upsellOpportunity}
</div>

</div>

</div>

<div style="
margin-top:22px;
padding:18px;
background:rgba(255,255,255,.08);
border-radius:14px;
border-left:4px solid #10b981;
">

<div style="
font-size:13px;
font-weight:700;
margin-bottom:10px;
">

🧠 ${window.t("Executive Summary","Executive Summary")}

</div>

<div style="
font-size:15px;
line-height:1.7;
opacity:.96;
">

${ai.executiveSummary}

</div>

</div>

<div style="
margin-top:18px;
padding:18px;
background:rgba(255,255,255,.06);
border-radius:14px;
">

<div style="
font-size:13px;
font-weight:700;
margin-bottom:8px;
">

💡 ${window.t("Insight AI","AI Insight")}

</div>

<div style="
font-size:14px;
line-height:1.7;
opacity:.95;
">

${ai.suggestion}

</div>

</div>

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:14px;
margin-top:22px;
">

<div style="
background:rgba(255,255,255,.06);
padding:16px;
border-radius:12px;
">

<div style="
font-size:11px;
opacity:.65;
text-transform:uppercase;
">

🔥 ${window.t("Priorità","Priority")}

</div>

<div style="
margin-top:8px;
font-size:18px;
font-weight:700;
color:#fbbf24;
">

${ai.priority}

</div>

</div>

<div style="
background:rgba(255,255,255,.06);
padding:16px;
border-radius:12px;
">

<div style="
font-size:11px;
opacity:.65;
text-transform:uppercase;
">

🎯 ${window.t(
"Azione consigliata",
"Recommended Action"
)}

</div>

<div style="
margin-top:8px;
font-size:14px;
line-height:1.6;
font-weight:700;
">

${ai.recommendedAction}

</div>

</div>

<div style="
background:rgba(255,255,255,.06);
padding:16px;
border-radius:12px;
">

<div style="
font-size:11px;
opacity:.65;
text-transform:uppercase;
">

📊 ${window.t(
"Livello decisionale",
"Decision Level"
)}

</div>

<div style="
margin-top:8px;
font-size:16px;
font-weight:700;
color:#34d399;
">

${ai.bookingScore>=90
? window.t("Premium","Premium")
: ai.bookingScore>=75
? window.t("Ottimo","Excellent")
: ai.bookingScore>=60
? window.t("Buono","Good")
: ai.bookingScore>=40
? window.t("Da monitorare","Monitor")
: window.t("Critico","Critical")
}

</div>

</div>

</div>

</div>

` : "";
  
// =====================================
// 🎯 BOOKING ACTIONS
// =====================================

let actions =
document.getElementById(
    "booking-smart-actions"
);


if(!actions){

    actions =
    document.createElement("div");

    actions.id =
    "booking-smart-actions";

    actions.style.display =
    "flex";

    actions.style.gap =
    "10px";

    actions.style.marginTop =
    "20px";

    actions.style.paddingTop =
    "15px";

    actions.style.borderTop =
    "1px solid #e2e8f0";


    modal.appendChild(actions);

}


actions.innerHTML = `

<button
style="
flex:1;
padding:12px;
border-radius:12px;
border:none;
background:#10b981;
color:white;
font-weight:700;
cursor:pointer;
"
onclick="editBooking('${booking.id || ""}')">

✏️ Modifica

</button>


<button
style="
flex:1;
padding:12px;
border-radius:12px;
border:none;
background:#0f172a;
color:white;
font-weight:700;
cursor:pointer;
"
onclick="analyzeBookingAI('${booking.id || ""}')">

🤖 AI Insight

</button>


<button
style="
width:50px;
border-radius:12px;
border:none;
background:#fee2e2;
color:#dc2626;
font-weight:700;
cursor:pointer;
"
onclick="deleteBooking('${booking.id || ""}')">

🗑️

</button>

`;
  
    // 🔄 ricalcolo dopo caricamento date

    setTimeout(()=>{

        updateBookingTotal();

    },100);


};

// =====================================
// ✏️ EDIT BOOKING
// =====================================

window.editBooking = function(){

    console.log("✏️ EDIT BOOKING");

    window.pmsEditingBooking = true;

    const guest =
        document.getElementById("booking-guest");

    const checkin =
        document.getElementById("booking-checkin");

    const checkout =
        document.getElementById("booking-checkout");

    guest?.removeAttribute("readonly");
    checkin?.removeAttribute("readonly");
    checkout?.removeAttribute("readonly");

    guest?.focus();

};

// =====================================
// 🧠 AI BOOKING DECISION ENGINE
// =====================================

window.getBookingExecutiveAnalysis = function(booking){

    if(!booking) return null;

    const nights =
        booking.nights || 0;

    const revenue =
        Number(booking.totalAmount || 0);

    const adr =
        nights > 0
        ? revenue / nights
        : 0;

    const status =
        booking.status || "arrival";

    let analysis = {

        bookingScore : "★★★★☆",

        revenueQuality : "Good",

        occupancyImpact : "+2%",

        reviewPotential : "High",

        upsellOpportunity : "Medium",

        verdict : "🟢 Executive Booking",

        suggestion :
        "Maintain pricing strategy."

    };


    if(adr >= 120){

        analysis.bookingScore = "★★★★★";

        analysis.revenueQuality = "Excellent";

        analysis.occupancyImpact = "+7%";

        analysis.reviewPotential = "Very High";

        analysis.verdict =
        "🟢 Premium Booking";

        analysis.suggestion =
        "Excellent ADR. Maintain pricing strategy.";

    }


    if(adr < 80){

        analysis.bookingScore = "★★★☆☆";

        analysis.revenueQuality = "Low";

        analysis.occupancyImpact = "-4%";

        analysis.upsellOpportunity = "High";

        analysis.verdict =
        "🟡 Revenue Opportunity";

        analysis.suggestion =
        "Increase ADR through pricing optimisation.";

    }


    if(nights >= 7){

        analysis.bookingScore = "★★★★★";

        analysis.reviewPotential = "Excellent";

        analysis.occupancyImpact = "+9%";

        analysis.verdict =
        "🔵 Strategic Stay";

    }


    if(status === "cancelled"){

        analysis.bookingScore = "★☆☆☆☆";

        analysis.revenueQuality = "Critical";

        analysis.verdict =
        "🔴 Cancelled Booking";

        analysis.suggestion =
        "Investigate cancellation reason.";

    }


    return analysis;

};

// =====================================
// 🧠 AI BOOKING DECISION ENGINE
// =====================================

window.getBookingExecutiveAnalysis = function (booking) {

    if (!booking) return null;

    const lang =
        window.currentLanguage || "it";

    const nights =
        Number(booking.nights || 0);

    const revenue =
        Number(booking.totalAmount || 0);

    const adr =
        nights > 0
            ? revenue / nights
            : 0;

    const status =
        booking.status || "arrival";

    let analysis = {

        bookingScore: 70,

        revenueQuality:
            lang === "it"
                ? "Buoni"
                : "Good",

        occupancyImpact: "+2%",

        reviewPotential:
            lang === "it"
                ? "Alta"
                : "High",

        upsellOpportunity:
            lang === "it"
                ? "Media"
                : "Medium",

        verdict:
            lang === "it"
                ? "Buona Prenotazione"
                : "Good Booking",

        suggestion:
            lang === "it"
                ? "Prenotazione sana. Valuta upsell o early check-in."
                : "Healthy booking. Consider an upsell or early check-in.",

        executiveSummary:
            lang === "it"
                ? "Prenotazione regolare."
                : "Healthy booking.",

        priority:
            lang === "it"
                ? "Normale"
                : "Normal",

        recommendedAction:
            lang === "it"
                ? "Nessuna azione immediata."
                : "No immediate action required."

    };

    // =====================================
    // PREMIUM BOOKING
    // =====================================

    if (adr >= 120) {

        analysis.bookingScore = 95;

        analysis.revenueQuality =
            lang === "it"
                ? "Eccellenti"
                : "Excellent";

        analysis.occupancyImpact = "+7%";

        analysis.reviewPotential =
            lang === "it"
                ? "Molto Alta"
                : "Very High";

        analysis.upsellOpportunity =
            lang === "it"
                ? "Media"
                : "Medium";

        analysis.verdict =
            lang === "it"
                ? "Prenotazione Premium"
                : "Premium Booking";

        analysis.suggestion =
            lang === "it"
                ? "ADR eccellente. Mantieni questa strategia tariffaria."
                : "Excellent ADR. Maintain pricing strategy.";

        analysis.executiveSummary =
            lang === "it"
                ? "Prenotazione premium con ricavi sopra la media."
                : "Premium booking with above-average revenue.";

        analysis.priority =
            lang === "it"
                ? "Alta"
                : "High";

        analysis.recommendedAction =
            lang === "it"
                ? "Proponi Early Check-in, Late Check-out o upgrade."
                : "Offer Early Check-in, Late Check-out or an upgrade.";

    }
    // =====================================
    // LOW ADR
    // =====================================

    if (adr < 80) {

        analysis.bookingScore = 55;

        analysis.revenueQuality =
            lang === "it"
                ? "Bassi"
                : "Low";

        analysis.occupancyImpact = "-4%";

        analysis.reviewPotential =
            lang === "it"
                ? "Media"
                : "Medium";

        analysis.upsellOpportunity =
            lang === "it"
                ? "Alta"
                : "High";

        analysis.verdict =
            lang === "it"
                ? "Opportunità di Ricavo"
                : "Revenue Opportunity";

        analysis.suggestion =
            lang === "it"
                ? "Valuta un aumento dell'ADR attraverso una migliore strategia tariffaria."
                : "Increase ADR through pricing optimisation.";

    }



    // =====================================
    // LONG STAY
    // =====================================

    if (nights >= 7) {

        analysis.bookingScore = 98;

        analysis.revenueQuality =
            lang === "it"
                ? "Ottimi"
                : "Excellent";

        analysis.occupancyImpact = "+9%";

        analysis.reviewPotential =
            lang === "it"
                ? "Eccellente"
                : "Excellent";

        analysis.upsellOpportunity =
            lang === "it"
                ? "Molto Alta"
                : "Very High";

        analysis.verdict =
            lang === "it"
                ? "Soggiorno Strategico"
                : "Strategic Stay";

        analysis.suggestion =
            lang === "it"
                ? "Soggiorno lungo rilevato. Proponi servizi premium e programmi fedeltà."
                : "Long stay detected. Offer premium services or loyalty benefits.";

    }



    // =====================================
    // CANCELLED
    // =====================================

    if (status === "cancelled") {

        analysis.bookingScore = 15;

        analysis.revenueQuality =
            lang === "it"
                ? "Critici"
                : "Critical";

        analysis.occupancyImpact = "-100%";

        analysis.reviewPotential =
            lang === "it"
                ? "Nessuna"
                : "None";

        analysis.upsellOpportunity =
            lang === "it"
                ? "Nessuna"
                : "None";

        analysis.verdict =
            lang === "it"
                ? "Prenotazione Cancellata"
                : "Cancelled Booking";

        analysis.suggestion =
            lang === "it"
                ? "Analizza la causa della cancellazione e migliora la conversione."
                : "Investigate cancellation reason.";

    }

    return analysis;

};
// =====================================
// 🤖 ANALYZE BOOKING AI 2.0
// =====================================

window.analyzeBookingAI = function(id){

    console.log(
        "🤖 AI BOOKING ANALYSIS",
        id
    );


    const box =
        document.getElementById(
            "booking-smart-actions"
        );


    if(!box) return;



    const booking =
        window.currentSelectedBooking;



    if(!booking){

        console.warn(
            "⚠️ Booking data missing"
        );

        return;

    }



    const existing =
        document.getElementById(
            "booking-ai-result"
        );


    if(existing){

        existing.remove();

    }



    // ===============================
    // 📊 CALCOLO KPI
    // ===============================


    const nights =
    booking.nights ||
    (
        booking.checkin &&
        booking.checkout
        ?
        Math.ceil(
            (
                new Date(booking.checkout)
                -
                new Date(booking.checkin)
            )
            /
            (1000 * 60 * 60 * 24)
        )
        :
        0
    );



    const revenue =
        Number(
            booking.totalAmount || 0
        );



    const adr =
        nights > 0
        ?
        revenue / nights
        :
        0;



    const channel =
        booking.source ||
        booking.channel ||
        "Direct";



    const status =
        booking.status ||
        "arrival";



// ===============================
// 🧠 EXECUTIVE AI DECISION ENGINE
// ===============================

const analysis =
    window.getBookingExecutiveAnalysis(
        booking
    );

const bookingScore =
    analysis.bookingScore;

const revenueQuality =
    analysis.revenueQuality;

const occupancyImpact =
    analysis.occupancyImpact;

const reviewPotential =
    analysis.reviewPotential;

const upsellOpportunity =
    analysis.upsellOpportunity;

const verdict =
    analysis.verdict;

const suggestion =
    analysis.suggestion;

    // ===============================
    // 🤖 BUILD AI CARD
    // ===============================


    const result =
    document.createElement("div");


    result.id =
    "booking-ai-result";



    result.style.marginTop =
        "15px";


    result.style.padding =
        "16px";


    result.style.borderRadius =
        "16px";


    result.style.background =
        "#f0fdf4";


    result.style.border =
        "1px solid #bbf7d0";



result.innerHTML = `

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:18px;
">

    <div style="
    font-size:20px;
    font-weight:800;
    color:#0f172a;
    ">
        🤖 AI PMS Copilot
    </div>

    <div style="
    background:#dcfce7;
    color:#166534;
    padding:6px 12px;
    border-radius:999px;
    font-size:12px;
    font-weight:700;
    ">
        Executive AI
    </div>

</div>


<div style="
display:grid;
grid-template-columns:repeat(4,minmax(0,1fr));
gap:10px;
margin-bottom:16px;
">

<div style="
background:white;
padding:10px;
border-radius:10px;
">

    <div style="
    font-size:10px;
    color:#64748b;
    ">
        Score
    </div>

    <div style="
    font-size:18px;
    font-weight:700;
    color:#0f172a;
    ">
        ${bookingScore}
    </div>

</div>

<div style="
background:white;
padding:10px;
border-radius:10px;
">

    <div style="
    font-size:10px;
    color:#64748b;
    ">
        Revenue
    </div>

    <div style="
    font-size:15px;
    font-weight:700;
    color:#0f172a;
    ">
        ${revenueQuality}
    </div>

</div>


<div style="
background:white;
padding:10px;
border-radius:10px;
">

    <div style="
    font-size:10px;
    color:#64748b;
    ">
        Impact
    </div>

    <div style="
    font-size:15px;
    font-weight:700;
    color:#16a34a;
    ">
        ${occupancyImpact}
    </div>

</div>


<div style="
background:white;
padding:10px;
border-radius:10px;
">

    <div style="
    font-size:10px;
    color:#64748b;
    ">
        Reviews
    </div>

    <div style="
    font-size:15px;
    font-weight:700;
    color:#0f172a;
    ">
        ${reviewPotential}
    </div>

</div>

</div>


<hr style="
border:none;
border-top:1px solid #dbeafe;
margin:18px 0;
">


<div style="line-height:1.9;">

👤 <b>Guest</b><br>
${booking.guestName || "-"}

<br><br>

🌙 <b>Nights</b><br>
${nights}

<br><br>

💰 <b>Revenue</b><br>
€${revenue.toFixed(0)}

<br><br>

📈 <b>ADR</b><br>
€${adr.toFixed(0)}

<br><br>

🏠 <b>Channel</b><br>
${channel}

<br><br>

📌 <b>Status</b><br>
${status}

</div>


<div style="
margin-top:20px;
padding:16px;
background:#f8fafc;
border-left:5px solid #10b981;
border-radius:14px;
">

<div style="
font-size:18px;
font-weight:700;
margin-bottom:10px;
">

${verdict}

</div>

<div style="
font-size:14px;
line-height:1.6;
">

💡 ${suggestion}

</div>

</div>


<div style="
margin-top:18px;
padding:14px;
background:#ecfeff;
border-radius:14px;
">

<div style="
font-size:13px;
color:#64748b;
margin-bottom:6px;
">

Upsell Opportunity

</div>

<div style="
font-size:17px;
font-weight:700;
">

${upsellOpportunity}

</div>

</div>

`;



    box.appendChild(result);



console.log(
    "🤖 AI PMS RESULT",
    {
        nights,
        revenue,
        adr,
        channel,
        status,
        bookingScore,
        revenueQuality,
        occupancyImpact,
        reviewPotential,
        upsellOpportunity,
        verdict
    }
);


};
// =====================================
// 📅 OPEN BOOKINGS
// =====================================

window.openBookings = function(propertyId){

  console.log(
    "🔥 BOOKINGS CLICK",
    propertyId
  );

  // Salva la proprietà corrente
  if(propertyId){
    window.currentPropertyId = propertyId;
  }

  // Evidenzia la tab Prenotazioni
  document
    .querySelectorAll(".pms-tab")
    .forEach(tab=>tab.classList.remove("active"));

  document
    .getElementById("pms-tab-bookings")
    ?.classList.add("active");

  // Nasconde il form inizialmente
  const bookingForm =
    document.getElementById(
      "booking-form-container"
    );

  if(bookingForm){
    bookingForm.style.display = "none";
  }

  // Apre il modal
  const modal =
    document.getElementById(
      "bookings-modal"
    );

  if(modal){
    modal.style.display = "flex";

  }else{
    console.error("❌ bookings-modal non trovato");
    return;
  }

  // Se esiste una proprietà caricata,
  // carica le prenotazioni
  if(window.currentPropertyId){
    loadBookings(window.currentPropertyId);
  }

  // Ricollega gli eventi del form
  setTimeout(()=>{

    document
      .getElementById("booking-checkin")
      ?.addEventListener(
        "change",
        updateBookingTotal
      );

    document
      .getElementById("booking-checkout")
      ?.addEventListener(
        "change",
        updateBookingTotal
      );

  },100);

  console.log("✅ BOOKINGS READY");

};

// =====================================
// 📅 OPEN CURRENT BOOKINGS
// =====================================

window.openCurrentBookings = async function(){

  if(window.currentPropertyId){

    openBookings(window.currentPropertyId);
    return;

  }

  if(!window.currentUser){

    console.log("❌ Nessun utente");
    return;

  }

  const snap = await getDocs(
    query(
      collection(db,"properties"),
      where(
        "uid",
        "==",
        window.currentUser.uid
      )
    )
  );

  if(snap.empty){

    alert("Nessuna proprietà trovata.");
    return;

  }

  const propertyId = snap.docs[0].id;

  window.currentPropertyId = propertyId;

  openBookings(propertyId);

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

  if(
    window.pmsEditingBooking &&
    window.currentSelectedBooking?.id
){

    await updateDoc(

        doc(
            db,
            "bookings",
            window.currentSelectedBooking.id
        ),

        {

            guestName: guest,
            checkin,
            checkout,
            guests,
            totalAmount: total,

            status:
                document.getElementById(
                    "booking-status"
                )?.value || "arrival",

            source:
                document.getElementById(
                    "booking-source"
                )?.value || "direct"

        }

    );

    console.log("✅ BOOKING UPDATED");

}else{

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
}
  
  console.log(
    "✅ BOOKING SAVED"
  );

  await loadBookings(
  window.currentPropertyId
 );

 await loadPMSStats();

await loadProperties(); 

// =====================================
// 🤖 PMS AI REAL-TIME SYNC
// =====================================

window.dispatchEvent(
  new CustomEvent(
    "rb_booking_created",
    {
      detail:{
        propertyId:
          window.currentPropertyId,

        guestName:
          guest,

        checkin,

        checkout,

        guests,

        totalAmount:
          total
      }
    }
  )
);

console.log(
  "🤖 AI PMS EVENT SENT"
);

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

  if(isDemo()){

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

  // =====================================
// 🤖 AI HOSPITALITY COPILOT MEMORY
// Real bookings bridge PMS → Chatbot
// =====================================

window.currentBookingsData =
  bookingsData;

const copilotToday =
  new Date()
    .toISOString()
    .split("T")[0];

const normalizedBookings =
  bookingsData.map(booking => {

    const checkin =
      String(
        booking.checkin || ""
      );

    const checkout =
      String(
        booking.checkout || ""
      );

    const checkinDate =
      new Date(checkin);

    const checkoutDate =
      new Date(checkout);

    const hasValidDates =
      checkin &&
      checkout &&
      !Number.isNaN(
        checkinDate.getTime()
      ) &&
      !Number.isNaN(
        checkoutDate.getTime()
      ) &&
      checkoutDate >
      checkinDate;

    const calculatedNights =
      hasValidDates
        ? Math.ceil(
            (
              checkoutDate -
              checkinDate
            ) /
            (
              1000 *
              60 *
              60 *
              24
            )
          )
        : 0;

    const totalAmount =
      Number(
        booking.totalAmount || 0
      );

    const attentionCodes = [];

    if(!hasValidDates){

      attentionCodes.push(
        "invalid_date_range"
      );

    }

    if(
      String(
        booking.status || ""
      ).toLowerCase() ===
      "pending"
    ){

      attentionCodes.push(
        "pending_booking"
      );

    }

    if(
      checkin === copilotToday
    ){

      attentionCodes.push(
        "arrival_today"
      );

    }

    if(
      checkout === copilotToday
    ){

      attentionCodes.push(
        "departure_today"
      );

    }

    if(
      !booking.guestName
    ){

      attentionCodes.push(
        "missing_guest_name"
      );

    }

    if(totalAmount <= 0){

      attentionCodes.push(
        "missing_or_invalid_amount"
      );

    }

    return {

      id:
        booking.id,

      propertyId:
        booking.propertyId ||
        propertyId,

      guestName:
        booking.guestName ||
        "",

      checkin,

      checkout,

      nights:
        calculatedNights,

      guests:
        Number(
          booking.guests || 0
        ),

      totalAmount,

      nightlyRate:
        calculatedNights > 0
          ? totalAmount /
            calculatedNights
          : 0,

      source:
        String(
          booking.source ||
          "direct"
        ).toLowerCase(),

      status:
        String(
          booking.status ||
          "confirmed"
        ).toLowerCase(),

      validDateRange:
        Boolean(
          hasValidDates
        ),

      requiresAttention:
        attentionCodes.length > 0,

      attentionCodes

    };

  });

const attentionBookings =
  normalizedBookings.filter(
    booking =>
      booking.requiresAttention
  );

window.rbPMSData = {

  ...(
    window.rbPMSData || {}
  ),

  bookings:
    normalizedBookings.length,

  bookingList:
    normalizedBookings,

  attentionBookings,

  attentionCount:
    attentionBookings.length,

  lastBookingsSync:
    new Date()
      .toISOString()

};

window.dispatchEvent(
  new CustomEvent(
    "rb_pms_data_updated",
    {
      detail:
        window.rbPMSData
    }
  )
);

console.log(
  "🤖 PMS COPILOT MEMORY:",
  {
    bookings:
      window.rbPMSData.bookings,

    attentionCount:
      window.rbPMSData
        .attentionCount,

    bookingList:
      window.rbPMSData
        .bookingList
  }
);

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
// Complete bridge available on dashboard load
// =====================================

const normalizedPMSBookings =
  bookingsSnap.docs.map(
    docItem => {

      const booking = {
        id:
          docItem.id,

        ...docItem.data()
      };

      const checkin =
        String(
          booking.checkin || ""
        );

      const checkout =
        String(
          booking.checkout || ""
        );

      const checkinDate =
        new Date(checkin);

      const checkoutDate =
        new Date(checkout);

      const hasValidDates =
        checkin &&
        checkout &&
        !Number.isNaN(
          checkinDate.getTime()
        ) &&
        !Number.isNaN(
          checkoutDate.getTime()
        ) &&
        checkoutDate >
          checkinDate;

      const calculatedNights =
        hasValidDates
          ? Math.ceil(
              (
                checkoutDate -
                checkinDate
              ) /
              (
                1000 *
                60 *
                60 *
                24
              )
            )
          : 0;

      const totalAmount =
        Number(
          booking.totalAmount || 0
        );

      const attentionCodes = [];

      if(!hasValidDates){

        attentionCodes.push(
          "invalid_date_range"
        );

      }

      if(
        String(
          booking.status || ""
        ).toLowerCase() ===
        "pending"
      ){

        attentionCodes.push(
          "pending_booking"
        );

      }

      if(checkin === today){

        attentionCodes.push(
          "arrival_today"
        );

      }

      if(checkout === today){

        attentionCodes.push(
          "departure_today"
        );

      }

      if(!booking.guestName){

        attentionCodes.push(
          "missing_guest_name"
        );

      }

      if(totalAmount <= 0){

        attentionCodes.push(
          "missing_or_invalid_amount"
        );

      }

      return {

        id:
          booking.id,

        propertyId:
          booking.propertyId || "",

        guestName:
          booking.guestName || "",

        checkin,

        checkout,

        nights:
          calculatedNights,

        guests:
          Number(
            booking.guests || 0
          ),

        totalAmount,

        nightlyRate:
          calculatedNights > 0
            ? totalAmount /
              calculatedNights
            : 0,

        source:
          String(
            booking.source ||
            "direct"
          ).toLowerCase(),

        status:
          String(
            booking.status ||
            "confirmed"
          ).toLowerCase(),

        validDateRange:
          Boolean(
            hasValidDates
          ),

        requiresAttention:
          attentionCodes.length > 0,

        attentionCodes

      };

    }
  );

const pmsAttentionBookings =
  normalizedPMSBookings.filter(
    booking =>
      booking.requiresAttention
  );

window.rbPMSData = {

  ...(
    window.rbPMSData || {}
  ),

  properties,

  bookings:
    normalizedPMSBookings.length,

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

  // Complete booking memory for Copilot
  bookingList:
    normalizedPMSBookings,

  attentionBookings:
    pmsAttentionBookings,

  attentionCount:
    pmsAttentionBookings.length,

  lastBookingsSync:
    new Date()
      .toISOString(),

  // Chatbot KPI compatibility
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

// =====================================
// 🤖 PMS AI INSIGHT
// =====================================

window.rbPMSInsight = {

  occupancy:
    occupancy || 0,

  bookings:
    bookings || 0,

  attention:
    pendingBookings || 0,

  message:

    (occupancy || 0) >= 80

    ? window.t(
        "Ottima occupazione. Valuta aumento ADR.",
        "Strong occupancy. Consider increasing ADR."
      )

    :

    (occupancy || 0) >= 50

    ? window.t(
        "Performance stabile. Ottimizzare prezzi.",
        "Stable performance. Optimize pricing."
      )

    :

    window.t(
      "Occupazione bassa. Analizzare strategie.",
      "Low occupancy. Review strategy."
    )

};


console.log(
  "🤖 PMS AI INSIGHT READY",
  window.rbPMSInsight
);


window.dispatchEvent(
  new CustomEvent(
    "rb_pms_data_updated",
    {
      detail:
        window.rbPMSData
    }
  )
);


console.log(
  "🤖 PMS MEMORY:",
  window.rbPMSData
);


renderExecutiveSummary({
  properties,
  bookings,
  revenue,
  occupancy,
  adr,
  revpar,
  arrivalsToday,
  departuresToday,
  guestsInHouse
});

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

function getDayBookingState(currentDate, bookingList, isEnglish){

    let color = "";
    let tooltip = "";
    let bookingInfo = null;

    let isCheckin = false;
    let isCheckout = false;
    let isStay = false;

    bookingList.forEach(booking=>{

        const checkin = String(booking.checkin || "");
        const checkout = String(booking.checkout || "");

        const guestName =
            booking.guestName ||
            (isEnglish ? "Guest" : "Ospite");

        const status =
            String(
                booking.status || ""
            ).toLowerCase();

        if(
            currentDate >= checkin &&
            currentDate < checkout
        ){

            color = "#10b981";
            tooltip = guestName;
            bookingInfo = booking;
            isStay = true;

        }

        if(
            currentDate === checkin
        ){

            isCheckin = true;

            color = "#3b82f6";

            tooltip =
                isEnglish
                    ? `Arrival: ${guestName}`
                    : `Arrivo: ${guestName}`;

            bookingInfo = booking;

        }

        if(
            currentDate === checkout
        ){

            isCheckout = true;

            color = "#f97316";

            tooltip =
                isEnglish
                    ? `Departure: ${guestName}`
                    : `Partenza: ${guestName}`;

            bookingInfo = booking;

        }

        if(
            status === "cancelled" &&
            currentDate >= checkin &&
            currentDate <= checkout
        ){

            color = "#ef4444";

            tooltip =
                isEnglish
                    ? `Cancelled: ${guestName}`
                    : `Cancellata: ${guestName}`;

            bookingInfo = booking;

        }

    });

    return {

        color,
        tooltip,
        bookingInfo,

        isCheckin,
        isCheckout,
        isStay

    };

}

function renderPMSCalendar(bookings){

  const container =
    document.getElementById(
      "booking-calendar"
    );

  if(!container) return;

  const bookingList =
    Array.isArray(bookings)
      ? bookings
      : (
          window.currentBookingsData ||
          []
        );

  const today =
    new Date();

  if(
    !(
      window.pmsCalendarViewDate
      instanceof Date
    ) ||
    Number.isNaN(
      window.pmsCalendarViewDate
        .getTime()
    )
  ){

    window.pmsCalendarViewDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

  }

  const viewDate =
    window.pmsCalendarViewDate;

  const year =
    viewDate.getFullYear();

  const month =
    viewDate.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const lastDay =
    new Date(
      year,
      month + 1,
      0
    );

  const daysInMonth =
    lastDay.getDate();

  const startDay =
    firstDay.getDay();

  const isEnglish =
    window.currentLang === "en";

  const monthNamesIT = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre"
  ];

  const monthNamesEN = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const weekdayNames =
    isEnglish
      ? [
          "S",
          "M",
          "T",
          "W",
          "T",
          "F",
          "S"
        ]
      : [
          "D",
          "L",
          "M",
          "M",
          "G",
          "V",
          "S"
        ];

  const selectedMonthName =
    isEnglish
      ? monthNamesEN[month]
      : monthNamesIT[month];

  const todayISO =
    [
      today.getFullYear(),
      String(
        today.getMonth() + 1
      ).padStart(2,"0"),
      String(
        today.getDate()
      ).padStart(2,"0")
    ].join("-");

  let html = `

  <div style="
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:16px;
  ">

    <button
    id="pms-calendar-prev"
    type="button"
    aria-label="${
      isEnglish
        ? "Previous month"
        : "Mese precedente"
    }"
    style="
    width:42px;
    height:42px;
    border:1px solid #dbe4ee;
    border-radius:12px;
    background:#ffffff;
    color:#0f172a;
    font-size:24px;
    font-weight:700;
    cursor:pointer;
    box-shadow:
    0 4px 12px rgba(15,23,42,.06);
    ">
      ‹
    </button>

    <div style="
    display:flex;
    align-items:center;
    justify-content:center;
    gap:12px;
    flex-wrap:wrap;
    ">

      <div style="
      font-weight:800;
      text-align:center;
      color:#0f172a;
      font-size:16px;
      min-width:150px;
      ">
        ${selectedMonthName} ${year}
      </div>

      <button
      id="pms-calendar-today"
      type="button"
      style="
      border:1px solid #a7f3d0;
      border-radius:999px;
      padding:7px 13px;
      background:#ecfdf5;
      color:#047857;
      font-size:12px;
      font-weight:800;
      cursor:pointer;
      ">
        ${
          isEnglish
            ? "Today"
            : "Oggi"
        }
      </button>

    </div>

    <button
    id="pms-calendar-next"
    type="button"
    aria-label="${
      isEnglish
        ? "Next month"
        : "Mese successivo"
    }"
    style="
    width:42px;
    height:42px;
    border:1px solid #dbe4ee;
    border-radius:12px;
    background:#ffffff;
    color:#0f172a;
    font-size:24px;
    font-weight:700;
    cursor:pointer;
    box-shadow:
    0 4px 12px rgba(15,23,42,.06);
    ">
      ›
    </button>

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

    ${weekdayNames
      .map(
        dayName =>
          `<div>${dayName}</div>`
      )
      .join("")}

  </div>

  <div style="
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:4px;
  ">
  `;

  for(
    let i = 0;
    i < startDay;
    i++
  ){

    html += `
      <div></div>
    `;

  }

  for(
    let day = 1;
    day <= daysInMonth;
    day++
  ){

    const currentDate =
      `${year}-${String(
        month + 1
      ).padStart(
        2,
        "0"
      )}-${String(
        day
      ).padStart(
        2,
        "0"
      )}`;

const dayState = getDayBookingState(
    currentDate,
    bookingList,
    isEnglish
);

const color = dayState.color;
const tooltip = dayState.tooltip;
const bookingInfo = dayState.bookingInfo;

const isCheckin = dayState.isCheckin;
const isCheckout = dayState.isCheckout;
const isStay = dayState.isStay;
    const isToday =
      currentDate === todayISO;

    html += `

<div
class="pms-calendar-day"
data-date="${currentDate}"
data-occupied="${color ? "true" : "false"}"
data-booking='${
  bookingInfo
    ? JSON.stringify(bookingInfo).replace(/'/g,"&#39;")
    : ""
}'
title="${
  tooltip ||
  (
    isEnglish
      ? "Create booking"
      : "Crea prenotazione"
  )
}"
style="
      height:42px;
      border-radius:10px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:12px;
      font-weight:700;
      cursor:${
  color
    ? "default"
    : "pointer"
};
transition:
  transform .18s ease,
  box-shadow .18s ease;
      background:${
        color || "#f8fafc"
      };
      color:${
        color
          ? "#ffffff"
          : "#0f172a"
      };
      border:${
        isToday
          ? "2px solid #0f172a"
          : `1px solid ${
              color ||
              "#e2e8f0"
            }`
      };
      box-shadow:${
        isToday
          ? "0 0 0 3px rgba(15,23,42,.08)"
          : "none"
      };
      ">

<div style="
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
gap:2px;
width:100%;
height:100%;
">

<div>
${day}
</div>

${
bookingInfo
?
`
<div style="
font-size:9px;
font-weight:700;
white-space:nowrap;
overflow:hidden;
max-width:90%;
text-overflow:ellipsis;
">
${bookingInfo.guestName || ""}
</div>
`
:
""
}

</div>

</div>

    `;

  }

  html += `
    </div>
  `;

  container.innerHTML =
    html;

  const previousButton =
    document.getElementById(
      "pms-calendar-prev"
    );

  const nextButton =
    document.getElementById(
      "pms-calendar-next"
    );

  const todayButton =
    document.getElementById(
      "pms-calendar-today"
    );

  if(previousButton){

    previousButton.onclick =
      () => {

        window.pmsCalendarViewDate =
          new Date(
            year,
            month - 1,
            1
          );

        renderPMSCalendar(
          bookingList
        );

      };

  }

  if(nextButton){

    nextButton.onclick =
      () => {

        window.pmsCalendarViewDate =
          new Date(
            year,
            month + 1,
            1
          );

        renderPMSCalendar(
          bookingList
        );

      };

  }

  if(todayButton){

    todayButton.onclick =
      () => {

        window.pmsCalendarViewDate =
          new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );

        renderPMSCalendar(
          bookingList
        );

      };

  }

// =====================================
// 📅 RANGE SELECTION
// =====================================

window.pmsBookingSelection =
window.pmsBookingSelection || {

  selectingCheckout:false,

  checkin:null

};  

// =====================================
// ➕ PMS CALENDAR INTERACTION
// =====================================

container
  .querySelectorAll(
    ".pms-calendar-day"
  )
  .forEach(
    dayCell => {


      const isOccupied =
        dayCell.dataset.occupied === "true";


      // ===============================
      // HOVER EFFECT
      // ===============================

      dayCell.onmouseenter = () => {

          dayCell.style.transform =
              "translateY(-2px)";

          dayCell.style.boxShadow =
              "0 8px 18px rgba(16,185,129,.15)";

      };

      dayCell.onmouseleave = () => {

          dayCell.style.transform = "";

          dayCell.style.boxShadow = "none";

      };


      // ===============================
      // OCCUPIED BOOKING CLICK
      // ===============================

      if(isOccupied){

        dayCell.onclick =
          () => {

            const bookingRaw =
              dayCell.dataset.booking;


            if(!bookingRaw){

              console.log(
                "No booking data"
              );

              return;

            }


            try{

              const bookingData =
                JSON.parse(
                  bookingRaw
                );


              console.log(
                "📌 PMS BOOKING SELECTED",
                bookingData
              );


              if(
                typeof window.showBookingDetails === "function"
              ){

                window.showBookingDetails(
                  bookingData
                );

              }


            }catch(error){

              console.error(
                "Booking JSON ERROR",
                error
              );

            }


          };


        return;

      }



      // ===============================
      // FREE DAY → NEW BOOKING
      // ===============================

      dayCell.onclick =
        () => {


          const selectedDate =
            dayCell.dataset.date;



          const checkinField =
            document.getElementById(
              "booking-checkin"
            );


          const checkoutField =
            document.getElementById(
              "booking-checkout"
            );



          window.pmsBookingSelection =
          window.pmsBookingSelection ||
          {

            selectingCheckout:false,

            checkin:null,

            checkout:null

          };



          // ===============================
          // FIRST CLICK CHECK-IN
          // ===============================

          if(
            !window.pmsBookingSelection.selectingCheckout
          ){


            window.pmsBookingSelection.checkin =
              selectedDate;


            window.pmsBookingSelection.selectingCheckout =
              true;



            if(checkinField){

              checkinField.value =
                selectedDate;

            }


            if(checkoutField){

              checkoutField.value =
                "";

            }



            console.log(
              "📅 CHECK-IN SELECTED",
              selectedDate
            );



            renderPMSCalendar(
              bookingList
            );



            setTimeout(
              () => {

                const newCell =
                  container.querySelector(
                    `.pms-calendar-day[data-date="${selectedDate}"]`
                  );


                if(newCell){

                  newCell.style.outline =
                    "3px solid #10b981";

                  newCell.style.outlineOffset =
                    "-2px";

                }


              },
              0
            );



            return;

          }



          // ===============================
          // SECOND CLICK CHECK-OUT
          // ===============================


          window.pmsBookingSelection.checkout =
            selectedDate;



          if(checkoutField){

            checkoutField.value =
              selectedDate;

          }



          window.pmsBookingSelection.selectingCheckout =
            false;



          console.log(
            "📅 CHECK-OUT SELECTED",
            selectedDate
          );



          if(
            typeof window.openBookingModal === "function"
          ){

            window.openBookingModal();

          }



          checkinField?.dispatchEvent(
            new Event(
              "change",
              {
                bubbles:true
              }
            )
          );



          console.log(
            "📅 NEW BOOKING RANGE:",
            window.pmsBookingSelection
          );


        };


      }
  );

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

// =====================================
// 🧠 EXECUTIVE SUMMARY
// Silicon Valley 2026
// =====================================

function renderExecutiveSummary(data){

const box =
document.getElementById(
"executive-summary"
);

if(!box) return;

box.style.display = "block";

// =====================================
// KPI
// =====================================

const revenue =
Number(data.revenue || 0);

const occupancy =
Number(data.occupancy || 0);

const revpar =
Number(data.revpar || 0);

const adr =
Number(data.adr || 0);

const properties =
Number(data.properties || 0);

const bookings =
Number(data.bookings || 0);

// =====================================
// AI SCORE
// =====================================

let aiScore = 50;

if(occupancy >= 85){

aiScore += 20;

}
else if(occupancy >= 70){

aiScore += 15;

}
else if(occupancy >= 60){

aiScore += 10;

}
else{

aiScore -= 10;

}

if(revpar >= 100){

aiScore += 15;

}
else if(revpar >= 70){

aiScore += 10;

}

if(revenue >= 5000){

aiScore += 15;

}
else if(revenue >= 2500){

aiScore += 8;

}

if(bookings >= 20){

aiScore += 10;

}
else if(bookings >= 10){

aiScore += 5;

}

aiScore =
Math.max(
0,
Math.min(
100,
Math.round(aiScore)
)
);

// =====================================
// GRADE
// =====================================

let grade = "C";

if(aiScore >= 95){

grade = "A+";

}
else if(aiScore >= 90){

grade = "A";

}
else if(aiScore >= 80){

grade = "B";

}
else if(aiScore >= 70){

grade = "C+";

}
else if(aiScore >= 60){

grade = "C";

}
else{

grade = "D";

}

// =====================================
// VERDICT
// =====================================

let verdict =
t(
"Monitorare",
"Monitor"
);

let verdictColor =
"#f59e0b";

if(aiScore >= 90){

verdict =
t(
"Prestazioni eccellenti",
"Excellent Performance"
);

verdictColor =
"#10b981";

}
else if(aiScore >= 75){

verdict =
t(
"Buone prestazioni",
"Good Performance"
);

verdictColor =
"#3b82f6";

}
else if(aiScore < 60){

verdict =
t(
"Richiede attenzione",
"Needs Attention"
);

verdictColor =
"#ef4444";

}

// =====================================
// STRENGTHS
// =====================================

const strengths = [];

if(occupancy >= 75){

strengths.push(
t(
"Occupazione superiore al target.",
"Occupancy is above target."
)
);

}

if(revpar >= 80){

strengths.push(
t(
"RevPAR competitivo.",
"Competitive RevPAR."
)
);

}

if(revenue >= 3000){

strengths.push(
t(
"Ricavi mensili solidi.",
"Strong monthly revenue."
)
);

}

if(bookings >= 15){

strengths.push(
t(
"Buon volume di prenotazioni.",
"Healthy booking volume."
)
);

}

// =====================================
// WARNINGS
// =====================================

const warnings = [];

if(occupancy < 60){

warnings.push(
t(
"Occupazione inferiore al livello consigliato.",
"Occupancy is below the recommended level."
)
);

}

if(revpar < 60){

warnings.push(
t(
"RevPAR migliorabile.",
"RevPAR can be improved."
)
);

}

if(bookings < 8){

warnings.push(
t(
"Poche prenotazioni registrate.",
"Low booking volume."
)
);

}

// =====================================
// RECOMMENDATION
// =====================================

let recommendation =
t(
"Continua a monitorare le performance e mantieni una strategia di pricing dinamica.",
"Continue monitoring performance and maintain a dynamic pricing strategy."
);

if(occupancy < 60){

recommendation =
t(
"Aumenta la visibilità sulle OTA e valuta offerte nei giorni con bassa occupazione.",
"Increase OTA visibility and consider promotions on low occupancy days."
);

}
else if(occupancy >= 80){

recommendation =
t(
"Valuta un incremento delle tariffe del 5-8% nei weekend e nei periodi di alta domanda.",
"Consider increasing weekend rates by 5-8% during high demand."
);

}

// =====================================
// 🤖 EXECUTIVE COPILOT
// =====================================

let executiveBrief = "";

if(aiScore >= 90){

executiveBrief = t(

"Il portafoglio sta performando sopra il target. L'occupazione è elevata e puoi valutare un incremento dell'ADR nelle giornate di maggiore domanda.",

"Portfolio performance is above target. Occupancy is high and you can consider increasing ADR during high-demand dates."

);

}
else if(aiScore >= 75){

executiveBrief = t(

"Le performance sono solide. Concentrati sull'ottimizzazione del pricing e sull'aumento della permanenza media.",

"Performance is solid. Focus on pricing optimisation and increasing average stay."

);

}
else{

executiveBrief = t(

"L'AI suggerisce di intervenire su occupazione e visibilità dell'annuncio prima di aumentare le tariffe.",

"The AI recommends improving occupancy and listing visibility before increasing rates."

);

}  

box.innerHTML = `
<div style="
background:#ffffff;
border:1px solid #e2e8f0;
border-radius:22px;
padding:28px;
box-shadow:0 12px 40px rgba(15,23,42,.08);
overflow:hidden;
">

<!-- =====================================
HEADER
===================================== -->

<div style="
display:flex;
justify-content:space-between;
align-items:center;
flex-wrap:wrap;
gap:18px;
margin-bottom:28px;
">

<div>

<div style="
font-size:13px;
font-weight:700;
letter-spacing:.08em;
text-transform:uppercase;
color:#64748b;
margin-bottom:6px;
">

${t(
"Executive AI Report",
"Executive AI Report"
)}

</div>

<h2 style="
margin:0;
font-size:30px;
font-weight:900;
color:#0f172a;
">

🧠 ${t(
"Analisi Intelligente",
"AI Executive Analysis"
)}

</h2>

<div style="
margin-top:8px;
font-size:15px;
color:#64748b;
">

${t(
"L'intelligenza artificiale sta monitorando le performance della tua attività.",
"Artificial intelligence is monitoring your property's performance."
)}

</div>

</div>

<div style="
padding:18px 22px;
border-radius:18px;
background:${verdictColor}15;
border:1px solid ${verdictColor}40;
text-align:center;
min-width:170px;
">

<div style="
font-size:13px;
font-weight:700;
color:${verdictColor};
text-transform:uppercase;
letter-spacing:.08em;
">

AI SCORE

</div>

<div style="
font-size:42px;
font-weight:900;
color:${verdictColor};
line-height:1.1;
">

${aiScore}

</div>

<div style="
font-size:14px;
font-weight:700;
color:${verdictColor};
">

${grade}

</div>

</div>

</div>

<!-- =====================================
EXECUTIVE VERDICT
===================================== -->

<div style="
padding:22px;
border-radius:18px;
background:linear-gradient(135deg,#f8fafc,#ffffff);
border:1px solid #e2e8f0;
margin-bottom:24px;
">

<div style="
font-size:13px;
font-weight:700;
text-transform:uppercase;
letter-spacing:.08em;
color:#64748b;
margin-bottom:8px;
">

${t(
"Verdetto AI",
"AI Verdict"
)}

</div>

<div style="
font-size:26px;
font-weight:900;
color:${verdictColor};
margin-bottom:10px;
">

${verdict}

</div>

<div style="
font-size:15px;
line-height:1.7;
color:#475569;
">

${recommendation}

</div>

</div>

<!-- =====================================
KPI GRID
===================================== -->

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
gap:18px;
margin-bottom:28px;
">
<!-- =====================================
KPI CARD
===================================== -->

<div style="
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:18px;
padding:20px;
">

<div style="
font-size:13px;
color:#64748b;
font-weight:700;
margin-bottom:8px;
">

💰 ${t(
"Ricavi Totali",
"Total Revenue"
)}

</div>

<div style="
font-size:34px;
font-weight:900;
color:#10b981;
">

${formatCurrency(revenue)}

</div>

<div style="
margin-top:8px;
font-size:13px;
color:#64748b;
">

${t(
"Ricavi registrati",
"Recorded revenue"
)}

</div>

</div>

<div style="
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:18px;
padding:20px;
">

<div style="
font-size:13px;
color:#64748b;
font-weight:700;
margin-bottom:8px;
">

🏠 ${t(
"Occupazione",
"Occupancy"
)}

</div>

<div style="
font-size:34px;
font-weight:900;
color:#0f172a;
">

${occupancy}%

</div>

<div style="
margin-top:8px;
font-size:13px;
color:#64748b;
">

${t(
"Tasso di occupazione",
"Occupancy Rate"
)}

</div>

</div>

<div style="
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:18px;
padding:20px;
">

<div style="
font-size:13px;
color:#64748b;
font-weight:700;
margin-bottom:8px;
">

📈 ADR

</div>

<div style="
font-size:34px;
font-weight:900;
color:#2563eb;
">

${formatCurrency(adr)}

</div>

<div style="
margin-top:8px;
font-size:13px;
color:#64748b;
">

${t(
"Tariffa media",
"Average Daily Rate"
)}

</div>

</div>

<div style="
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:18px;
padding:20px;
">

<div style="
font-size:13px;
color:#64748b;
font-weight:700;
margin-bottom:8px;
">

📊 RevPAR

</div>

<div style="
font-size:34px;
font-weight:900;
color:#7c3aed;
">

${formatCurrency(revpar)}

</div>

<div style="
margin-top:8px;
font-size:13px;
color:#64748b;
">

${t(
"Ricavo per camera disponibile",
"Revenue per Available Room"
)}

</div>

</div>

</div>

<!-- =====================================
STRENGTHS & WARNINGS
===================================== -->

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
gap:22px;
margin-top:10px;
">
<!-- =====================================
STRENGTHS
===================================== -->

<div style="
background:#f8fafc;
border:1px solid #e2e8f0;
border-radius:18px;
padding:24px;
">

<div style="
display:flex;
align-items:center;
gap:10px;
margin-bottom:18px;
">

<div style="
width:42px;
height:42px;
border-radius:12px;
background:#dcfce7;
display:flex;
align-items:center;
justify-content:center;
font-size:22px;
">

✅

</div>

<div>

<div style="
font-size:12px;
font-weight:700;
letter-spacing:.08em;
text-transform:uppercase;
color:#64748b;
">

${t(
"Punti di forza",
"Strengths"
)}

</div>

<div style="
font-size:22px;
font-weight:800;
color:#0f172a;
">

${t(
"Performance Positive",
"Positive Performance"
)}

</div>

</div>

</div>

<div style="
display:flex;
flex-direction:column;
gap:14px;
">

${
strengths.length
?
strengths.map(item=>`

<div style="
display:flex;
align-items:flex-start;
gap:12px;
">

<div style="
width:10px;
height:10px;
margin-top:8px;
border-radius:50%;
background:#10b981;
flex:none;
">

</div>

<div style="
font-size:15px;
line-height:1.7;
color:#334155;
">

${item}

</div>

</div>

`).join("")
:

`<div style="
font-size:15px;
color:#64748b;
">

${t(
"Nessun punto di forza rilevato al momento.",
"No strengths detected yet."
)}

</div>`

}

</div>

</div>

<!-- =====================================
WARNINGS
===================================== -->

<div style="
background:#fff7ed;
border:1px solid #fed7aa;
border-radius:18px;
padding:24px;
">

<div style="
display:flex;
align-items:center;
gap:10px;
margin-bottom:18px;
">

<div style="
width:42px;
height:42px;
border-radius:12px;
background:#ffedd5;
display:flex;
align-items:center;
justify-content:center;
font-size:22px;
">

⚠️

</div>

<div>

<div style="
font-size:12px;
font-weight:700;
letter-spacing:.08em;
text-transform:uppercase;
color:#9a3412;
">

${t(
"Da monitorare",
"Needs Attention"
)}

</div>

<div style="
font-size:22px;
font-weight:800;
color:#7c2d12;
">

${t(
"Opportunità di crescita",
"Growth Opportunities"
)}

</div>

</div>

</div>

<div style="
display:flex;
flex-direction:column;
gap:14px;
">

${
warnings.length
?
warnings.map(item=>`

<div style="
display:flex;
align-items:flex-start;
gap:12px;
">

<div style="
width:10px;
height:10px;
margin-top:8px;
border-radius:50%;
background:#f97316;
flex:none;
">

</div>

<div style="
font-size:15px;
line-height:1.7;
color:#7c2d12;
">

${item}

</div>

</div>

`).join("")
:

`<div style="
font-size:15px;
color:#7c2d12;
">

${t(
"Nessuna criticità rilevata.",
"No critical issues detected."
)}

</div>`

}

</div>

</div>

</div>

<!-- =====================================
AI ACTIONS
===================================== -->

<div style="
margin-top:28px;
margin-bottom:28px;
">

<div style="
font-size:13px;
font-weight:800;
letter-spacing:.08em;
text-transform:uppercase;
color:#64748b;
margin-bottom:14px;
">

🤖 ${t(
"Azioni consigliate dall'AI",
"AI Recommended Actions"
)}

</div>


<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:14px;
">


<button
onclick="window.openWhatIf && window.openWhatIf('adr')"
style="
padding:18px;
border-radius:16px;
border:1px solid #dbe4ee;
background:#ffffff;
cursor:pointer;
text-align:left;
">

<div style="
font-size:24px;
margin-bottom:8px;
">
📈
</div>

<div style="
font-weight:800;
color:#0f172a;
">

${t(
"Aumenta ADR",
"Increase ADR"
)}

</div>

<div style="
font-size:13px;
color:#64748b;
margin-top:6px;
">

+5% pricing simulation

</div>

</button>



<button
onclick="window.openWhatIf && window.openWhatIf('mortgage')"
style="
padding:18px;
border-radius:16px;
border:1px solid #dbe4ee;
background:#ffffff;
cursor:pointer;
text-align:left;
">

<div style="
font-size:24px;
margin-bottom:8px;
">
🏦
</div>

<div style="
font-weight:800;
color:#0f172a;
">

${t(
"Ottimizza mutuo",
"Optimize mortgage"
)}

</div>

<div style="
font-size:13px;
color:#64748b;
margin-top:6px;
">

LTV / equity analysis

</div>

</button>



<button
onclick="window.openMarketComparison && window.openMarketComparison()"
style="
padding:18px;
border-radius:16px;
border:1px solid #dbe4ee;
background:#ffffff;
cursor:pointer;
text-align:left;
">

<div style="
font-size:24px;
margin-bottom:8px;
">
🏙️
</div>

<div style="
font-weight:800;
color:#0f172a;
">

${t(
"Confronta mercato",
"Compare market"
)}

</div>

<div style="
font-size:13px;
color:#64748b;
margin-top:6px;
">

Rome vs Milan vs Naples

</div>

</button>



<button
onclick="handleReportClick && handleReportClick()"
style="
padding:18px;
border-radius:16px;
border:1px solid #dbe4ee;
background:#ffffff;
cursor:pointer;
text-align:left;
">

<div style="
font-size:24px;
margin-bottom:8px;
">
📄
</div>

<div style="
font-weight:800;
color:#0f172a;
">

${t(
"Genera Report",
"Generate Report"
)}

</div>

<div style="
font-size:13px;
color:#64748b;
margin-top:6px;
">

Executive PDF

</div>

</button>


</div>

</div>

<!-- =====================================
AI RECOMMENDATION
===================================== -->

<div style="
margin-top:28px;
padding:26px;
border-radius:20px;
background:linear-gradient(135deg,#0f172a,#1e293b);
color:white;
">
<div style="
font-size:13px;
font-weight:700;
letter-spacing:.08em;
text-transform:uppercase;
color:#cbd5e1;
margin-bottom:10px;
">

🤖 ${t(
"Raccomandazione AI",
"AI Recommendation"
)}

</div>

<div style="
font-size:26px;
font-weight:800;
line-height:1.4;
margin-bottom:18px;
">

${recommendation}

</div>

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:18px;
margin-top:10px;
">

<div style="
background:rgba(255,255,255,.08);
padding:18px;
border-radius:14px;
">

<div style="
font-size:12px;
text-transform:uppercase;
letter-spacing:.08em;
color:#cbd5e1;
margin-bottom:8px;
">

${t(
"Proprietà",
"Properties"
)}

</div>

<div style="
font-size:28px;
font-weight:900;
">

${properties}

</div>

</div>

<div style="
background:rgba(255,255,255,.08);
padding:18px;
border-radius:14px;
">

<div style="
font-size:12px;
text-transform:uppercase;
letter-spacing:.08em;
color:#cbd5e1;
margin-bottom:8px;
">

${t(
"Prenotazioni",
"Bookings"
)}

</div>

<div style="
font-size:28px;
font-weight:900;
">

${bookings}

</div>

</div>

<div style="
background:rgba(255,255,255,.08);
padding:18px;
border-radius:14px;
">

<div style="
font-size:12px;
text-transform:uppercase;
letter-spacing:.08em;
color:#cbd5e1;
margin-bottom:8px;
">

${t(
"Livello AI",
"AI Rating"
)}

</div>

<div style="
font-size:28px;
font-weight:900;
color:#22c55e;
">

${grade}

</div>

</div>

</div>

<div style="
margin-top:24px;
padding-top:20px;
border-top:1px solid rgba(255,255,255,.15);
font-size:14px;
line-height:1.8;
color:#e2e8f0;
">

<strong>

${t(
"Executive Insight",
"Executive Insight"
)}

</strong>

<br><br>

${executiveBrief}

</div>

</div>

</div>

`;

}

// =====================================
// 🏨 PMS TABS
// =====================================

window.showPMSTab = function(tab){

  // ===============================
  // RESET TAB
  // ===============================

  document
  .querySelectorAll(".pms-tab")
  .forEach(btn=>btn.classList.remove("active"));

  const active =
    document.getElementById(
      "pms-tab-"+tab
    );

  if(active){
    active.classList.add("active");
  }

  // ===============================
  // SEZIONI
  // ===============================

  const executive =
    document.getElementById("executive-summary");

  const kpi =
    document.querySelector(".rb-kpi-grid")
    ?.closest(".analysis-card");

  const performance =
    document.getElementById("pms-performance-chart")
    ?.closest(".analysis-card");

  const properties =
    document.getElementById("properties-list")
    ?.closest(".analysis-card");

  const dashboardGrid =
    document.querySelector(".dashboard-grid");

  // reset

  [
    executive,
    kpi,
    performance,
    properties,
    dashboardGrid
  ].forEach(el=>{

    if(el){

      el.style.display="none";

    }

  });

  // ===============================
  // DASHBOARD
  // ===============================

  if(tab==="dashboard"){

    if(executive)
      executive.style.display="block";

    if(kpi)
      kpi.style.display="block";

    if(performance)
      performance.style.display="block";

  }

  // ===============================
  // PROPERTIES
  // ===============================

  if(tab==="properties"){

    if(properties)
      properties.style.display="block";

  }

  // ===============================
  // ROI
  // ===============================

  if(tab==="roi"){

    if(dashboardGrid)
      dashboardGrid.style.display="grid";

  }

};

document.addEventListener("DOMContentLoaded",()=>{

    showPMSTab("dashboard");

});
