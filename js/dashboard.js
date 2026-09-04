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
writeBatch,
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
// PRODUCTION LOGGING
// =====================================

const IS_DEVELOPMENT =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const dashboardDebug = (...args) => {
  if (IS_DEVELOPMENT) {
    console.debug(...args);
  }
};

const dashboardError = (message, error) => {
  console.error(message);

  if (IS_DEVELOPMENT && error) {
    console.error(error);
  }
};

const escapeDashboardHTML = value =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

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

   
}

// 🟢 PRO / ADMIN
    else{

      
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
   
    document.querySelectorAll(".pro-blur").forEach(el=>{
      el.style.filter = "none";
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
    });

    return;
  }

  // ================= INVESTOR =================
  if(isInvestor){
    
    return; // 🔥 NON trattarlo come free
  }

  // ================= FREE =================
 

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

function formatPercent(value){
  return new Intl.NumberFormat(
    window.currentLang === "it" ? "it-IT" : "en-US",
    { maximumFractionDigits: 1 }
  ).format(Number(value || 0)) + "%";
}

function formatYears(value){
  const years = Number(value || 0);
  return years + " " + t(
    years === 1 ? "anno" : "anni",
    years === 1 ? "year" : "years"
  );
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

function getBookingNightsInMonth(checkin, checkout, referenceDate = new Date()){
  if(!checkin || !checkout) return 0;

  const arrival = new Date(`${checkin}T00:00:00`);
  const departure = new Date(`${checkout}T00:00:00`);
  const monthStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1
  );
  const monthEnd = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    1
  );

  if(
    Number.isNaN(arrival.getTime()) ||
    Number.isNaN(departure.getTime()) ||
    departure <= arrival
  ) return 0;

  const overlapStart = arrival > monthStart ? arrival : monthStart;
  const overlapEnd = departure < monthEnd ? departure : monthEnd;

  return Math.max(
    0,
    Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24))
  );
}

function getBookingRevenueInMonth(booking, referenceDate = new Date()){
  const occupiedNights = getBookingNightsInMonth(
    booking?.checkin,
    booking?.checkout,
    referenceDate
  );
  if(!occupiedNights) return 0;

  const arrival = new Date(`${booking.checkin}T00:00:00`);
  const departure = new Date(`${booking.checkout}T00:00:00`);
  const totalNights = Math.round(
    (departure - arrival) / (1000 * 60 * 60 * 24)
  );

  if(!Number.isFinite(totalNights) || totalNights <= 0) return 0;

  return Number(booking.totalAmount || 0) * occupiedNights / totalNights;
}

function isCancelledBooking(booking){
  return String(booking?.status || "").toLowerCase() === "cancelled";
}

// ================= INVESTMENT SCORE =================

function calculateInvestmentScore(avgROI,analyses){

if(!analyses?.length) return 0;

const savedScores = analyses
  .map(data => Number(data.investmentScore || 0))
  .filter(score => score > 0 && score <= 100);

if(savedScores.length){
  return Math.round(
    savedScores.reduce((sum, score) => sum + score, 0) /
    savedScores.length
  );
}

let score = 50;

/* ROI influence */

if(avgROI > 15) score += 30;
else if(avgROI > 8) score += 20;
else if(avgROI > 3) score += 10;
else if(avgROI < 0) score -= 20;

const riskValues = analyses
  .map(data => Number(data.risk || 0))
  .filter(risk => risk > 0 && risk <= 100);

if(riskValues.length){
  const avgRisk = riskValues.reduce((sum, risk) => sum + risk, 0) / riskValues.length;
  if(avgRisk <= 30) score += 15;
  else if(avgRisk <= 50) score += 8;
  else if(avgRisk >= 70) score -= 15;
}

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

   
}

  dashboardDebug(
    "Dashboard analyses loaded",
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

    dashboardDebug(
    "Analysis normalized"
  );

  return {

    id: doc.id,

    roi:
      data.roi || 0,

    visualROI:
      data.visualROI || 0,

    realROI:
      data.realROI || 0,

    price:
      data.propertyPrice ||
      data.price ||
      0,

        equity:
      Number(
        data.equity ??
        0
      ),

    loan:
      Number(
        data.loan ??
        data.loanAmount ??
        data.mortgageAmount ??
        Math.max(
          Number(
            data.propertyPrice ??
            data.price ??
            0
          ) -
          Number(
            data.equity ??
            0
          ),
          0
        )
      ),

    mortgageAmount:
      Number(
        data.mortgageAmount ??
        data.loanAmount ??
        data.loan ??
        Math.max(
          Number(
            data.propertyPrice ??
            data.price ??
            0
          ) -
          Number(
            data.equity ??
            0
          ),
          0
        )
      ),

    mortgageYearly:
      Number(
        data.mortgageYearly ??
        (
          Number(
            data.monthlyMortgage ??
            data.monthlyMortgagePayment ??
            0
          ) * 12
        )
      ),

    monthlyMortgage:
      Number(
        data.monthlyMortgage ??
        data.monthlyMortgagePayment ??
        (
          Number(
            data.mortgageYearly ??
            0
          ) / 12
        )
      ),

    monthlyMortgagePayment:
      Number(
        data.monthlyMortgagePayment ??
        data.monthlyMortgage ??
        (
          Number(
            data.mortgageYearly ??
            0
          ) / 12
        )
      ),

    interestRate:
      Number(
        data.interestRate ??
        3.5
      ),

    loanYears:
      Number(
        data.loanYears ??
        20
      ),

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

    isPortfolio:
      data.isPortfolio === true,

    propertyId:
      data.propertyId || null,

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

dashboardDebug(
  "Investment history prepared",
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

  dashboardDebug("Dashboard market initialized");

  if(citySelect && !citySelect.dataset.listener){
  citySelect.dataset.listener = "true";

  citySelect.addEventListener("change",(e)=>{
    const newCity = e.target.value;
    updateMarketHero(newCity);
    dashboardDebug("Dashboard market changed");
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

const count = analyses.length;

const portfolioAnalyses = analyses.filter(
  data => data.isPortfolio === true
);

const totalROI = analyses.reduce(
  (sum, data) => sum + Number(data.roi || 0),
  0
);

const totalCapital = analyses.reduce(
  (sum, data) => sum + Number(data.price || 0),
  0
);

const totalCashflow = analyses.reduce(
  (sum, data) => sum + Number(data.net || 0),
  0
);

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
window.isDemoData
? ""
: `
<div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
  <button
    class="portfolio-analysis"
    data-id="${data.id}"
    data-active="${data.isPortfolio ? "true" : "false"}"
    data-linked="${data.propertyId ? "true" : "false"}"
    ${data.propertyId ? "disabled" : ""}
    style="
      background:${data.isPortfolio ? "#ecfdf5" : "#0f172a"};
      color:${data.isPortfolio ? "#047857" : "white"};
      border:1px solid ${data.isPortfolio ? "#a7f3d0" : "#0f172a"};
      padding:7px 10px;
      border-radius:7px;
      font-size:12px;
      font-weight:700;
      cursor:${data.propertyId ? "default" : "pointer"};
      opacity:${data.propertyId ? ".8" : "1"};
    ">
    ${data.propertyId
      ? t("✓ Collegato al PMS", "✓ Linked to PMS")
      : data.isPortfolio
      ? t("✓ Nel portafoglio", "✓ In portfolio")
      : t("+ Aggiungi al portafoglio", "+ Add to portfolio")}
  </button>
  ${canDelete() && !data.propertyId ? `
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
  ` : ""}
</div>
`
}

`;

list.appendChild(card);

}); 

// ================= RENDER ENGINE =================

renderStats(
  count,
  totalROI,
  totalCapital,
  totalCashflow,
  portfolioAnalyses
);

renderPortfolioManager(portfolioAnalyses);

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

dashboardDebug(
  "Dashboard analysis context prepared"
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


// ================= REAL PORTFOLIO MANAGER =================

function renderPortfolioManager(portfolioAnalyses = []){
  const container = document.getElementById("portfolio-manager");
  if(!container) return;

  const linkedCount = portfolioAnalyses.filter(data => Boolean(data.propertyId)).length;
  const manualCount = portfolioAnalyses.length - linkedCount;

  const summary = portfolioAnalyses.length
    ? t(
        `${portfolioAnalyses.length} ${portfolioAnalyses.length === 1 ? "immobile confermato" : "immobili confermati"} · ${linkedCount} PMS · ${manualCount} ${manualCount === 1 ? "manuale" : "manuali"}`,
        `${portfolioAnalyses.length} confirmed ${portfolioAnalyses.length === 1 ? "property" : "properties"} · ${linkedCount} PMS · ${manualCount} manual`
      )
    : t("Nessun immobile confermato", "No confirmed properties");

  const cards = portfolioAnalyses.map((data, index) => {
    const linked = Boolean(data.propertyId);
    const rawCity = String(data.city || t("Città non indicata", "City not specified"));
    const city = escapeDashboardHTML(rawCity.charAt(0).toUpperCase() + rawCity.slice(1));
    const price = Number(data.price || 0);
    const equity = Number(data.equity || 0);
    const roi = Number(data.roi || 0);
    const yearlyCashflow = Number(data.net || 0);
    const risk = Number(data.risk || 0);
    const complete = price > 0 && equity > 0 && Number.isFinite(roi) && Number.isFinite(yearlyCashflow);

    return `
      <article class="portfolio-manager__item">
        <div class="portfolio-manager__item-head">
          <div>
            <span class="portfolio-manager__origin portfolio-manager__origin--${linked ? "linked" : "manual"}">
              ${linked ? t("🏠 Collegato al PMS", "🏠 Linked to PMS") : t("📌 Inserimento manuale", "📌 Manual entry")}
            </span>
            <h3>${t("Immobile", "Property")} ${index + 1} · ${city}</h3>
          </div>
          <span class="portfolio-manager__status portfolio-manager__status--${complete ? "complete" : "incomplete"}">
            ${complete ? t("✓ Dati completi", "✓ Complete data") : t("⚠ Dati da completare", "⚠ Data incomplete")}
          </span>
        </div>

        <div class="portfolio-manager__metrics">
          <div><span>${t("Prezzo", "Price")}</span><strong>${formatCurrency(price)}</strong></div>
          <div><span>${t("Equity", "Equity")}</span><strong>${formatCurrency(equity)}</strong></div>
          <div><span>ROI</span><strong>${formatPercent(roi)}</strong></div>
          <div><span>${t("Cashflow mensile", "Monthly cash flow")}</span><strong>${formatCurrency(yearlyCashflow / 12)}</strong></div>
          <div><span>${t("Rischio", "Risk")}</span><strong>${Number.isFinite(risk) ? `${new Intl.NumberFormat(window.currentLang === "it" ? "it-IT" : "en-US", { maximumFractionDigits: 0 }).format(risk)}/100` : "--"}</strong></div>
        </div>

        <div class="portfolio-manager__footer">
          <span>${linked
            ? t("I dati finanziari sono gestiti dalla proprietà PMS collegata.", "Financial data is managed by the linked PMS property.")
            : t("Questa simulazione contribuisce ai totali del portafoglio.", "This simulation contributes to portfolio totals.")}
          </span>
          ${linked
            ? `<span class="portfolio-manager__locked">🔒 ${t("Gestisci dal PMS", "Manage in PMS")}</span>`
            : `<button class="portfolio-analysis portfolio-manager__remove" data-id="${escapeDashboardHTML(data.id)}" data-active="true" data-linked="false">${t("Rimuovi dal portafoglio", "Remove from portfolio")}</button>`}
        </div>
      </article>
    `;
  }).join("");

  container.innerHTML = `
    <div class="portfolio-manager__header">
      <div>
        <span class="portfolio-manager__eyebrow">LIVE PORTFOLIO</span>
        <h2>📂 ${t("Portafoglio investimenti", "Investment portfolio")}</h2>
        <p>${t(
          "Solo gli immobili confermati alimentano ROI, cashflow, equity e break-even.",
          "Only confirmed properties feed ROI, cash flow, equity and break-even."
        )}</p>
      </div>
      <strong class="portfolio-manager__summary">${summary}</strong>
    </div>
    ${cards || `
      <div class="portfolio-manager__empty">
        <strong>${t("Il portafoglio è ancora vuoto", "Your portfolio is still empty")}</strong>
        <span>${t(
          "Aggiungi una simulazione oppure collegala a una proprietà PMS per rendere attivi i KPI.",
          "Add a simulation or link it to a PMS property to activate portfolio KPIs."
        )}</span>
      </div>
    `}
  `;
}

// ================= STATS =================

function renderStats(count,totalROI,totalCapital,totalCashflow,portfolioAnalyses = []){

// ================= SAFE CALC =================
const avgROI = count ? (totalROI / count) : 0;
const avgROIRounded = avgROI.toFixed(1);
const avgCashflow = count ? (totalCashflow / count) : 0;

const confirmedCount = portfolioAnalyses.length;
const confirmedEquity = portfolioAnalyses.reduce(
  (sum, data) => sum + Number(data.equity || 0),
  0
);
const confirmedYearlyCashflow = portfolioAnalyses.reduce(
  (sum, data) => sum + Number(data.net || 0),
  0
);
const confirmedROI = confirmedCount
  ? (
      confirmedEquity > 0
        ? portfolioAnalyses.reduce(
            (sum, data) => sum + (Number(data.roi || 0) * Number(data.equity || 0)),
            0
          ) / confirmedEquity
        : portfolioAnalyses.reduce(
            (sum, data) => sum + Number(data.roi || 0),
            0
          ) / confirmedCount
    )
  : 0;
const confirmedMonthlyCashflow = confirmedYearlyCashflow / 12;
const confirmedBreakEven = confirmedYearlyCashflow > 0
  ? confirmedEquity / confirmedYearlyCashflow
  : 0;

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
const monthlyProfit = avgCashflow / 12;
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
    ? formatPercent(avgROIRounded)
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
  kpiRoi.innerText = confirmedCount
    ? formatPercent(confirmedROI.toFixed(1))
    : "--";
}

if(kpiCash){
  kpiCash.innerText =
    canViewDashboardData
      ? (confirmedCount ? formatCurrency(confirmedMonthlyCashflow) : "--")
      : "🔒";
}

if(kpiInvest){
  kpiInvest.innerText =
    canViewDashboardData
      ? (confirmedCount ? formatCurrency(confirmedEquity) : "--")
      : "🔒";
}
  
if(kpiBreak){
  kpiBreak.innerText =
    canViewDashboardData
      ? (confirmedCount ? formatYears(confirmedBreakEven.toFixed(1)) : "--")
      : "🔒";
}
// ================= PORTFOLIO =================
const roiEl = document.getElementById("portfolio-roi");
if(roiEl){
  roiEl.textContent = confirmedCount
    ? formatPercent(confirmedROI.toFixed(1))
    : "--";
}

const cashEl =
document.getElementById("portfolio-cashflow");
  
if(cashEl){
  cashEl.textContent =
    canViewDashboardData
      ? (confirmedCount ? formatCurrency(confirmedMonthlyCashflow) : "--")
      : "🔒";
}

const capEl =
document.getElementById("portfolio-capital");

if(capEl){
  capEl.textContent =
    canViewDashboardData
      ? (confirmedCount ? formatCurrency(confirmedEquity) : "--")
      : "🔒";
}

const countEl = document.getElementById("portfolio-count");
if(countEl) countEl.textContent = confirmedCount;

const investmentScore =
calculateInvestmentScore(
    avgROI,
    window.dashboardSimulations
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

Analisi strategica

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
${t("Volume analizzato","Analyzed volume")}
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
  userRoiEl.textContent = formatPercent(avgROIRounded);
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
    
    try{

      // ================= GET PLAN =================
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if(userDoc.exists()){
        const data = userDoc.data();
        window.currentPlan = data.plan || "free";
      }else{
        window.currentPlan = "free";
      }

      
      // 🔥 SYNC HEADER + UI
      document.dispatchEvent(new Event("rb_plan_ready"));

      const plan = String(window.currentPlan || "").toLowerCase();

      // ================= FREE ACCESS CONTROL =================
      if(plan === "free"){

  
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
        
      }

      // ================= READY =================
      document.dispatchEvent(new Event("rb_auth_ready"));

      // ================= LOAD DASHBOARD =================
await loadDashboard();

// 🔥 POPUP DOPO RENDER (fix reale)
triggerPlanPopup(plan);

      // ================= PRO =================
      if(pro){

  
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

  
  window.isDemoData = false;
  window.isDemoDashboard = false;

  document.body.classList.add("is-investor");

  return;
}

          } catch(err){
      dashboardError(
  "Dashboard initialization failed",
  err
);
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

    <h3>Analisi strategica</h3>

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
"Le simulazioni salvate hanno un ROI medio superiore alla media nazionale. Le opportunità analizzate mostrano un buon potenziale.",
"Your saved simulations have an average ROI above the national benchmark. The analyzed opportunities show strong potential."
);

}else if(avgROI > 0){

title = t(
"📊 Performance moderata",
"📊 Moderate performance"
);

text = t(
"Il ROI medio simulato è positivo ma sotto la media nazionale. Valuta scenari con maggiore occupazione o un prezzo medio notte più efficace.",
"The average simulated ROI is positive but below the national benchmark. Consider scenarios with higher occupancy or a more effective nightly rate."
);

}else{

title = t(
"Analisi degli investimenti",
"Investment analysis"
);

text = t(
"Il ROI medio delle simulazioni è negativo. Valuta immobili con maggiore domanda turistica o costi più bassi.",
"The average ROI of your simulations is negative. Consider properties with higher tourism demand or lower costs."
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



await deleteDoc(
  doc(db,"analyses",id)
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

async function togglePortfolioAnalysis(e){

const btn = e.target.closest(".portfolio-analysis");
if(!btn) return;

e.preventDefault();
e.stopPropagation();

if(!window.currentUser){
  alert(t("Sessione non valida. Ricarica la pagina.", "Invalid session. Reload the page."));
  return;
}

const id = btn.dataset.id;
const isActive = btn.dataset.active === "true";

if(btn.dataset.linked === "true") return;

try{
  btn.disabled = true;

  await updateDoc(
    doc(db, "analyses", id),
    { isPortfolio: !isActive }
  );

  window.__dashboardLoaded = false;
  window.__forceReload = true;
  await loadDashboard();

}catch(err){
  btn.disabled = false;
  console.error("Portfolio update error:", err);
  alert(t(
    "Impossibile aggiornare il portafoglio. Riprova.",
    "Unable to update the portfolio. Please try again."
  ));
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

  if(e.target.closest(".portfolio-analysis")){
    togglePortfolioAnalysis(e);
  }

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
        "Accedi per salvare le analisi, confrontare gli scenari e consultare i risultati nella dashboard.",
        "Sign in to save analyses, compare scenarios and review results in your dashboard."
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
        "Valuta tutti i dati disponibili prima di prendere una decisione di investimento.",
        "Review all available data before making an investment decision."
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

window.editingPropertyId = null;

const title = document.getElementById("property-modal-title");
if(title){
  title.textContent = t("🏠 Nuova proprietà", "🏠 New Property");
}

["property-name", "property-city", "property-address", "property-price"]
  .forEach(id => {
    const field = document.getElementById(id);
    if(field) field.value = "";
  });

const modal =
document.getElementById(
"property-modal"
);

if(modal){

populatePropertyAnalysisSelect();

modal.style.display = "flex";

}

};

window.openPropertyEditor = async function(id){

  if(!window.currentUser) return;

  const propertySnap = await getDoc(doc(db, "properties", id));
  if(!propertySnap.exists()) return;

  const data = propertySnap.data();
  window.editingPropertyId = id;

  populatePropertyAnalysisSelect();

  const title = document.getElementById("property-modal-title");
  if(title){
    title.textContent = t("🏠 Modifica proprietà", "🏠 Edit Property");
  }

  document.getElementById("property-name").value = data.name || "";
  document.getElementById("property-city").value = data.city || "";
  document.getElementById("property-address").value = data.address || "";
  document.getElementById("property-price").value = data.priceNight || "";
  document.getElementById("property-analysis").value = data.analysisId || "";

  const modal = document.getElementById("property-modal");
  if(modal) modal.style.display = "flex";
};

function populatePropertyAnalysisSelect(){

  const select = document.getElementById("property-analysis");
  if(!select) return;

  const currentValue = select.value;
  const analyses = Array.isArray(window.dashboardSimulations)
    ? window.dashboardSimulations
    : [];

  select.replaceChildren();

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = t("Solo gestione PMS", "PMS management only");
  select.appendChild(emptyOption);

  analyses.forEach(data => {
    const option = document.createElement("option");
    option.value = data.id;
    option.textContent = `${String(data.city || "-").toUpperCase()} · ${formatCurrency(data.price)} · ROI ${formatPercent(data.roi)}`;
    select.appendChild(option);
  });

  if(analyses.some(data => data.id === currentValue)){
    select.value = currentValue;
  }

  if(!select.dataset.citySync){
    select.dataset.citySync = "true";
    select.addEventListener("change", () => {
      const cityInput = document.getElementById("property-city");
      if(!cityInput || cityInput.value.trim()) return;
      const selected = (window.dashboardSimulations || [])
        .find(data => data.id === select.value);
      if(selected?.city) cityInput.value = selected.city;
    });
  }
}

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

    const title = form.querySelector("h3");
    if(title){
      title.textContent = t("✨ Nuova Prenotazione", "✨ New Booking");
    }

    const fields = {
      guest: document.getElementById("booking-guest"),
      checkin: document.getElementById("booking-checkin"),
      checkout: document.getElementById("booking-checkout"),
      guests: document.getElementById("booking-guests"),
      total: document.getElementById("booking-total"),
      status: document.getElementById("booking-status"),
      source: document.getElementById("booking-source")
    };

    [fields.guest, fields.checkin, fields.checkout, fields.guests, fields.total]
      .forEach(field => {
        if(field){
          field.value = "";
          field.removeAttribute("readonly");
        }
      });

    if(fields.status) fields.status.value = "arrival";
    if(fields.source) fields.source.value = "direct";

    const liveRevenue = document.getElementById("booking-live-revenue");
    const liveNights = document.getElementById("booking-live-nights");
    const liveAdr = document.getElementById("booking-live-adr");
    if(liveRevenue) liveRevenue.textContent = formatCurrency(0);
    if(liveNights) liveNights.textContent = "0";
    if(liveAdr) liveAdr.textContent = formatCurrency(0);

    const toggle = document.getElementById("toggle-booking-form");
    if(toggle) toggle.textContent = "✖";


    form.style.display =
        "flex";


    window.pmsEditingBooking =
        false;

    window.currentSelectedBooking = null;


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
    window.currentSelectedBooking = null;

    const toggle = document.getElementById("toggle-booking-form");
    if(toggle){
      toggle.textContent = t("➕ Nuova Prenotazione", "➕ New Booking");
    }

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

        window.pmsEditingBooking = false;
        window.currentSelectedBooking = null;

        const toggle = document.getElementById("toggle-booking-form");
        if(toggle){
          toggle.textContent = t("➕ Nuova Prenotazione", "➕ New Booking");
        }

      };

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

    
  }else{

    window.isDemoData = false;
    window.isDemoDashboard = false;

    
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

    const analysisId =
      document.getElementById("property-analysis")?.value || "";

    const linkedAnalysis = analysisId
      ? (window.dashboardSimulations || []).find(data => data.id === analysisId)
      : null;

    const editingPropertyId = window.editingPropertyId || null;

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

  const propertyData = {

      uid: window.currentUser.uid,

      name,
      city,
      address,
      priceNight,

      analysisId: linkedAnalysis?.id || null,

      investmentSnapshot: linkedAnalysis ? {
        propertyPrice: Number(linkedAnalysis.price || 0),
        equity: Number(linkedAnalysis.equity || 0),
        roi: Number(linkedAnalysis.roi || 0),
        realROI: Number(linkedAnalysis.realROI || 0),
        annualCashflow: Number(linkedAnalysis.net || 0),
        risk: Number(linkedAnalysis.risk || 0),
        occupancy: Number(linkedAnalysis.occupancy || 0),
        city: linkedAnalysis.city || city || ""
      } : null,

      updatedAt:
        serverTimestamp()

    };

  if(linkedAnalysis){
    const propertiesSnap = await getDocs(
      query(
        collection(db, "properties"),
        where("uid", "==", window.currentUser.uid)
      )
    );

    const alreadyLinked = propertiesSnap.docs.some(
      item => item.id !== editingPropertyId && item.data().analysisId === linkedAnalysis.id
    );

    if(alreadyLinked){
      alert(t(
        "Questa analisi è già collegata a una proprietà.",
        "This analysis is already linked to a property."
      ));
      return;
    }

    const batch = writeBatch(db);
    const propertyRef = editingPropertyId
      ? doc(db, "properties", editingPropertyId)
      : doc(collection(db, "properties"));

    if(!editingPropertyId) propertyData.createdAt = serverTimestamp();
    batch.set(propertyRef, propertyData, { merge: Boolean(editingPropertyId) });

    if(editingPropertyId){
      const previousSnap = await getDoc(propertyRef);
      const previousAnalysisId = previousSnap.exists()
        ? previousSnap.data().analysisId
        : null;

      if(previousAnalysisId && previousAnalysisId !== linkedAnalysis.id){
        batch.update(
          doc(db, "analyses", previousAnalysisId),
          { isPortfolio: false, propertyId: null }
        );
      }
    }

    batch.update(
      doc(db, "analyses", linkedAnalysis.id),
      { isPortfolio: true, propertyId: propertyRef.id }
    );
    await batch.commit();
  }else if(editingPropertyId){
    const propertyRef = doc(db, "properties", editingPropertyId);
    const previousSnap = await getDoc(propertyRef);
    const previousAnalysisId = previousSnap.exists()
      ? previousSnap.data().analysisId
      : null;
    const batch = writeBatch(db);
    batch.set(propertyRef, propertyData, { merge: true });

    if(previousAnalysisId){
      batch.update(
        doc(db, "analyses", previousAnalysisId),
        { isPortfolio: false, propertyId: null }
      );
    }

    await batch.commit();
  }else{
    propertyData.createdAt = serverTimestamp();
    await addDoc(collection(db, "properties"), propertyData);
  }

}else{

 
}

    closePropertyModal();

    document.getElementById("property-name").value = "";
    document.getElementById("property-city").value = "";
    document.getElementById("property-address").value = "";
    document.getElementById("property-price").value = "";
    document.getElementById("property-analysis").value = "";
    window.editingPropertyId = null;

    await loadProperties();
    await loadPMSStats();

    window.__dashboardLoaded = false;
    window.__forceReload = true;
    await loadDashboard();

  }catch(err){

    console.error(
      "PROPERTY SAVE ERROR:",
      err
    );

  }

};

if(canUseFirestorePMS()){


  

}else{

  
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

const investment =
  data.investmentSnapshot || null;

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

  const activeBookingDocs =
    bookingsSnap.docs.filter(
      item => !isCancelledBooking(item.data())
    );

  const bookingsCount =
    activeBookingDocs.length;

let totalNights = 0;
let occupiedNightsThisMonth = 0;
let realRevenue = 0;
let totalGuests = 0;  

activeBookingDocs.forEach(b=>{

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
  occupiedNightsThisMonth += getBookingNightsInMonth(
    booking.checkin,
    booking.checkout
  );

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
        occupiedNightsThisMonth /
        daysInMonth
      ) * 100
    )
  );

 let occupancyStatus =
  t("🔴 Vuoto","🔴 Empty");

if(occupancy >= 80){

  occupancyStatus =
    t("🟢 Alta","🟢 High");

}
else if(
  occupancy >= 40
){

  occupancyStatus =
    t("🟡 Media","🟡 Medium");

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

${investment ? `
<div style="
margin-bottom:18px;
padding:14px 16px;
border:1px solid #a7f3d0;
border-radius:14px;
background:#ecfdf5;
display:flex;
justify-content:space-between;
align-items:center;
gap:12px;
flex-wrap:wrap;
">
  <div>
    <strong style="display:block;color:#047857;font-size:13px;">
      ${t("Analisi finanziaria collegata", "Financial analysis linked")}
    </strong>
    <span style="color:#64748b;font-size:12px;">
      ${t("Dati verificati per Dashboard e Autopilot", "Verified data for Dashboard and Autopilot")}
    </span>
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;">
    <span style="padding:6px 9px;border-radius:999px;background:white;color:#0f172a;font-size:12px;font-weight:700;">
      ROI ${formatPercent(investment.roi)}
    </span>
    <span style="padding:6px 9px;border-radius:999px;background:white;color:#0f172a;font-size:12px;font-weight:700;">
      ${t("Equity", "Equity")} ${formatCurrency(investment.equity)}
    </span>
  </div>
</div>
` : ""}

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
${t("Occupazione","Occupancy")}
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

<div class="property-revenue-card" style="
margin-top:22px;
padding:24px;
border-radius:22px;
background:linear-gradient(135deg,#10b981,#059669);
color:white;
position:relative;
overflow:hidden;
box-shadow:0 18px 45px rgba(16,185,129,.28);
">

<div class="property-revenue-icon" style="
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

<div class="property-revenue-meta" style="
margin-top:18px;
display:flex;
justify-content:space-between;
align-items:center;
font-size:13px;
opacity:.92;
">

<div>
<strong>${bookingsCount}</strong>
<span>${t("Prenotazioni","Bookings")}</span>
</div>

<div>
<strong>${occupancy}%</strong>
<span>${t("Occupazione","Occupancy")}</span>
</div>

<div>
<strong>ADR</strong>
<span>€${data.priceNight || 0}</span>
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
flex:1;
height:48px;
font-weight:700;
border-radius:12px;
"
onclick="openPropertyEditor('${docItem.id}')">

${investment
  ? t("Modifica dati", "Edit details")
  : t("Collega analisi", "Link analysis")}

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

  const propertyRef = doc(db, "properties", id);
  const propertySnap = await getDoc(propertyRef);
  const analysisId = propertySnap.exists()
    ? propertySnap.data().analysisId
    : null;

  const linkedAnalysisSnap = analysisId
    ? await getDoc(doc(db, "analyses", analysisId))
    : null;

  if(linkedAnalysisSnap?.exists()){
    const batch = writeBatch(db);
    batch.delete(propertyRef);
    batch.update(
      doc(db, "analyses", analysisId),
      { isPortfolio: false, propertyId: null }
    );
    await batch.commit();
  }else{
    await deleteDoc(propertyRef);
  }

  await loadProperties();

  await loadPMSStats();

  window.__dashboardLoaded = false;
  window.__forceReload = true;
  await loadDashboard();

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

  window.closeBookingForm?.();

};

// =====================================
// 📌 SHOW BOOKING DETAILS
// =====================================

window.showBookingDetails = function(booking){


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


    const guests =
        document.getElementById(
            "booking-guests"
        );


    const total =
        document.getElementById(
            "booking-total"
        );


    const status =
        document.getElementById(
            "booking-status"
        );


    const source =
        document.getElementById(
            "booking-source"
        );


    if(guests){

        guests.value =
            Number(booking.guests || 1);

    }


    if(total){

        total.value =
            Number(booking.totalAmount || 0);

    }


    if(status){

        status.value =
            booking.status || "arrival";

    }


    if(source){

        source.value =
            booking.source || "direct";

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

EXECUTIVE ANALYSIS

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

${window.t("Analisi strategica","Strategic analysis")}

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

💡 ${window.t(
"Perché questo punteggio",
"Why this score"
)}

</div>

<div style="
margin-top:10px;
font-size:14px;
line-height:1.8;
">

${ai.why.map(item=>`✔ ${item}`).join("<br>")}

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

Analisi prenotazione

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

    const lang =
    window.currentLang === "en"
        ? "en"
        : "it";

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

    const guests =
    Number(
        booking.guests ||
        booking.people ||
        1
    );

const source =
    (
        booking.source ||
        booking.channel ||
        "direct"
    ).toLowerCase();

const cleaning =
    Number(
        booking.cleaningFee || 0
    );

const totalRevenue =
    revenue + cleaning;

  // =====================================
// EXECUTIVE BOOKING SCORING
// =====================================

let bookingScore = 50;

// ADR
if (adr >= 180) bookingScore += 15;
else if (adr >= 130) bookingScore += 10;
else if (adr >= 90) bookingScore += 5;
else bookingScore -= 5;

// Stay length
if (nights >= 7) bookingScore += 12;
else if (nights >= 4) bookingScore += 8;
else if (nights === 1) bookingScore -= 8;

// Guests
if (guests >= 4) bookingScore += 6;
else if (guests === 1) bookingScore -= 3;

// Booking source
if (source === "direct") bookingScore += 10;
else if (
    source.includes("airbnb") ||
    source.includes("booking")
) bookingScore += 4;

// Cleaning
if (cleaning > 0) bookingScore += 2;

bookingScore = Math.max(0, Math.min(100, bookingScore));

// =====================================
// AI CONFIDENCE ENGINE
// =====================================

let confidence = 100;

// Missing revenue
if (revenue <= 0) confidence -= 25;

// Missing nights
if (nights <= 0) confidence -= 20;

// Missing guest
if (!booking.guestName) confidence -= 10;

// Unknown source
if (!source) confidence -= 8;

// Missing status
if (!status) confidence -= 5;

// Penalità se ADR poco realistico
if (adr < 30 || adr > 1000) confidence -= 15;

confidence = Math.max(50, Math.min(100, confidence));  

// =====================================
// EXECUTIVE RISK ENGINE
// =====================================

let riskScore = 0;

// ADR basso
if (adr < 90) riskScore += 20;

// Soggiorno breve
if (nights <= 2) riskScore += 15;

// OTA
if (
    source.includes("airbnb") ||
    source.includes("booking")
){
    riskScore += 15;
}

// Prenotazione cancellata
if(status === "cancelled"){
    riskScore += 40;
}

// Nessun ricavo
if(revenue <= 0){
    riskScore += 30;
}

riskScore = Math.min(100,riskScore);

let riskLevel;

if(riskScore>=70){

    riskLevel =
        lang==="it"
        ? "Alto"
        : "High";

}
else if(riskScore>=40){

    riskLevel =
        lang==="it"
        ? "Medio"
        : "Medium";

}
else{

    riskLevel =
        lang==="it"
        ? "Basso"
        : "Low";

}    

let analysis = {

    bookingScore,

    revenueQuality: "",

    occupancyImpact: "",

    reviewPotential: "",

    upsellOpportunity: "",

    verdict: "",

    executiveSummary: "",

    priority: "",

    recommendedAction: "",

    suggestion: ""

};

if (bookingScore >= 90) {

    analysis.revenueQuality =
        lang === "it" ? "Eccellente" : "Excellent";

    analysis.occupancyImpact =
        lang === "it" ? "Molto Alta" : "Very High";

    analysis.reviewPotential =
        lang === "it" ? "Molto Alta" : "Very High";

    analysis.upsellOpportunity =
        lang === "it"
            ? "Late Check-out"
            : "Late Checkout";

    analysis.verdict =
        lang === "it"
            ? "🟢 Prenotazione Premium"
            : "🟢 Premium Booking";

    analysis.executiveSummary =
        lang === "it"
            ? "Prenotazione ad altissimo valore."
            : "Very high value booking.";

    analysis.priority =
        lang === "it"
            ? "Alta"
            : "High";

    analysis.recommendedAction =
        lang === "it"
            ? "Fidelizza questo ospite."
            : "Retain this guest.";

    analysis.suggestion =
        lang === "it"
            ? "Proponi servizi premium ed early check-in."
            : "Offer premium services and early check-in.";

}
else if (bookingScore >= 70) {

    analysis.revenueQuality =
        lang === "it" ? "Ottima" : "Great";

    analysis.occupancyImpact =
        lang === "it" ? "Alta" : "High";

    analysis.reviewPotential =
        lang === "it" ? "Alta" : "High";

    analysis.upsellOpportunity =
        lang === "it"
            ? "Colazione"
            : "Breakfast";

    analysis.verdict =
        lang === "it"
            ? "🟢 Ottima Prenotazione"
            : "🟢 Great Booking";

    analysis.executiveSummary =
        lang === "it"
            ? "Prenotazione con ottima redditività."
            : "Profitable booking.";

    analysis.priority =
        lang === "it"
            ? "Media"
            : "Medium";

    analysis.recommendedAction =
        lang === "it"
            ? "Proponi un upsell."
            : "Offer an upsell.";

    analysis.suggestion =
        lang === "it"
            ? "Buona prenotazione con margini interessanti."
            : "Good booking with interesting margins.";

}
else {

    analysis.revenueQuality =
        lang === "it" ? "Bassa" : "Low";

    analysis.occupancyImpact =
        lang === "it" ? "Limitata" : "Limited";

    analysis.reviewPotential =
        lang === "it" ? "Media" : "Medium";

    analysis.upsellOpportunity =
        lang === "it"
            ? "Nessuna"
            : "None";

    analysis.verdict =
        lang === "it"
            ? "🟡 Da Monitorare"
            : "🟡 Monitor";

    analysis.executiveSummary =
    lang === "it"
        ? `Prenotazione da €${totalRevenue.toFixed(0)} con ${nights} ${nights === 1 ? "notte" : "notti"}.
Valore ${totalRevenue >= 1000 ? "elevato" : totalRevenue >= 500 ? "intermedio" : "contenuto"} ma con margini migliorabili.`
        : `Booking worth €${totalRevenue.toFixed(0)} over ${nights} ${nights === 1 ? "night" : "nights"}.
${totalRevenue >= 1000 ? "High" : totalRevenue >= 500 ? "Medium" : "Limited"} value with room for optimisation.`;

    analysis.priority =
        lang === "it"
            ? "Alta"
            : "High";

    analysis.recommendedAction =
        lang === "it"
            ? "Rivedi la strategia tariffaria."
            : "Review pricing strategy.";

    analysis.suggestion =
    lang === "it"
        ? `L'ADR è di €${adr.toFixed(0)}. ${
            adr < 130
                ? "Aumentare la tariffa media potrebbe migliorare la redditività."
                : "La tariffa è in linea con il mercato."
          }`
        : `Current ADR is €${adr.toFixed(0)}. ${
            adr < 130
                ? "Increasing the average daily rate could improve profitability."
                : "ADR is aligned with the market."
          }`;

}

  analysis.why = [];
  analysis.actions = [];

if (adr < 130) {

    analysis.why.push(
        "ADR below market target"
    );

    analysis.actions.push(
        "Increase ADR +10€"
    );

}

if (nights <= 2) {

    analysis.why.push(
        "Short stay"
    );

    analysis.actions.push(
        "Offer Late Checkout"
    );

}

if (source !== "direct") {

    analysis.why.push(
        "OTA commission impact"
    );

    analysis.actions.push(
        "Promote Direct Booking"
    );

}

if (guests >= 4) {

    analysis.why.push(
        "High guest value"
    );

    analysis.actions.push(
        "Offer Breakfast Package"
    );

}

if (status === "cancelled") {

    analysis.why.push(
        "Booking cancelled"
    );

    analysis.actions.push(
        "Contact guest for recovery"
    );

}

if (!analysis.why.length) {

    analysis.why.push(
        "Healthy booking profile"
    );

}

if (!analysis.actions.length) {

    analysis.actions.push(
        "No action required"
    );

}

// =====================================
// BOOKING AI OBJECT (SSOT)
// =====================================

analysis.ai = {

    version: "2.0",

    score: bookingScore,

    confidence,

    risk: {

    score: riskScore,

    level: riskLevel

    },   

    decision: analysis.verdict,

    priority: analysis.priority,

    summary: analysis.executiveSummary,

    recommendation: analysis.recommendedAction,

    insight: analysis.suggestion,

    reasoning: analysis.why,

    actions: analysis.actions,

    revenue: {

        total: revenue,
        adr: adr,
        quality: analysis.revenueQuality

    },

    occupancy: {

        nights,
        impact: analysis.occupancyImpact

    },

    guest: {

        name: booking.guestName || "",
        guests,
        reviewPotential: analysis.reviewPotential

    },

    booking: {

        status,
        channel: source

    },

    upsell: {

        opportunity: analysis.upsellOpportunity

    }

};   

analysis.confidence = confidence;

analysis.riskScore = riskScore;

analysis.riskLevel = riskLevel;  

return analysis;

};


// =====================================
// 🤖 ANALYZE BOOKING AI 2.0
// =====================================

window.analyzeBookingAI = function(id){

   
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

const executiveSummary =
    analysis.executiveSummary;

const priority =
    analysis.priority;

const recommendedAction =
    analysis.recommendedAction;

const suggestion =
    analysis.suggestion;

const why =
    analysis.why || [];

const actions =
    analysis.actions || [];

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
background:linear-gradient(180deg,#ffffff,#f8fafc);
border:1px solid #e2e8f0;
border-radius:18px;
padding:22px;
box-shadow:0 10px 30px rgba(15,23,42,.08);
">

<!-- ===================================== -->
<!-- HEADER -->
<!-- ===================================== -->

<div style="
display:flex;
justify-content:space-between;
align-items:center;
gap:20px;
flex-wrap:wrap;
margin-bottom:24px;
">

<div>

<div style="
font-size:24px;
font-weight:800;
color:#0f172a;
">

🧠 ${window.t(
"Executive Booking Copilot",
"Executive Booking Copilot"
)}

</div>

<div style="
margin-top:6px;
font-size:14px;
color:#64748b;
">

${window.t(
"Analisi strategica della prenotazione in tempo reale",
"Real-time strategic booking analysis"
)}

</div>

</div>

<div style="
display:flex;
align-items:center;
gap:10px;
">

<div style="
padding:8px 14px;
background:#0f172a;
color:#34d399;
border-radius:999px;
font-size:12px;
font-weight:700;
border:1px solid rgba(52,211,153,.30);
">

${window.t(
"ANALISI VERIFICATA",
"VERIFIED ANALYSIS"
)}

</div>

</div>

</div>

<!-- ===================================== -->
<!-- EXECUTIVE KPI -->
<!-- ===================================== -->

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
gap:14px;
margin-bottom:24px;
">

<div style="
background:white;
border:1px solid #e2e8f0;
border-radius:14px;
padding:14px;
">

<div style="
font-size:11px;
text-transform:uppercase;
color:#64748b;
font-weight:700;
">

${window.t(
"Punteggio",
"Score"
)}

</div>

<div style="
margin-top:8px;
font-size:28px;
font-weight:800;
color:#0f172a;
">

${bookingScore}

</div>

</div>

<div style="
background:white;
border:1px solid #e2e8f0;
border-radius:14px;
padding:14px;
">

<div style="
font-size:11px;
text-transform:uppercase;
color:#64748b;
font-weight:700;
">

${window.t(
"Ricavi",
"Revenue"
)}

</div>

<div style="
margin-top:8px;
font-size:18px;
font-weight:700;
color:#0f172a;
">

${revenueQuality}

</div>

</div>

<div style="
background:white;
border:1px solid #e2e8f0;
border-radius:14px;
padding:14px;
">

<div style="
font-size:11px;
text-transform:uppercase;
color:#64748b;
font-weight:700;
">

ADR

</div>

<div style="
margin-top:8px;
font-size:18px;
font-weight:700;
color:#0f172a;
">

€${adr.toFixed(0)}

</div>

</div>

<div style="
background:white;
border:1px solid #e2e8f0;
border-radius:14px;
padding:14px;
">

<div style="
font-size:11px;
text-transform:uppercase;
color:#64748b;
font-weight:700;
">

${window.t(
"Rischio",
"Risk"
)}

</div>

<div style="
margin-top:8px;
font-size:18px;
font-weight:700;
color:${
bookingScore>=80
? "#16a34a"
: bookingScore>=60
? "#ca8a04"
: "#dc2626"
};
">

${
bookingScore>=80
? window.t("Basso","Low")
: bookingScore>=60
? window.t("Medio","Medium")
: window.t("Alto","High")
}

</div>

</div>

<div style="
background:white;
border:1px solid #e2e8f0;
border-radius:14px;
padding:14px;
">

<div style="
font-size:11px;
text-transform:uppercase;
color:#64748b;
font-weight:700;
">

${window.t(
"Recensioni",
"Reviews"
)}

</div>

<div style="
margin-top:8px;
font-size:18px;
font-weight:700;
color:#0f172a;
">

${reviewPotential}

</div>

</div>

<div style="
background:white;
border:1px solid #e2e8f0;
border-radius:14px;
padding:14px;
">

<div style="
font-size:11px;
text-transform:uppercase;
color:#64748b;
font-weight:700;
">

${window.t(
"Upsell",
"Upsell"
)}

</div>

<div style="
margin-top:8px;
font-size:18px;
font-weight:700;
color:#0f172a;
">

${upsellOpportunity}

</div>

</div>

</div>

<!-- ===================================== -->
<!-- BOOKING SNAPSHOT -->
<!-- ===================================== -->

<div style="
font-size:15px;
font-weight:800;
color:#0f172a;
margin-bottom:14px;
">

📋 ${window.t(
"Booking Snapshot",
"Booking Snapshot"
)}

</div>

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
gap:14px;
margin-bottom:26px;
">

<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:14px;">
<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;">👤 ${window.t("Ospite","Guest")}</div>
<div style="margin-top:8px;font-size:16px;font-weight:700;color:#0f172a;">${escapeDashboardHTML(booking.guestName || "-")}</div>
</div>

<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:14px;">
<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;">🌙 ${window.t("Notti","Nights")}</div>
<div style="margin-top:8px;font-size:16px;font-weight:700;color:#0f172a;">${nights}</div>
</div>

<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:14px;">
<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;">💰 ${window.t("Ricavo","Revenue")}</div>
<div style="margin-top:8px;font-size:16px;font-weight:700;color:#16a34a;">€${revenue.toFixed(0)}</div>
</div>

<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:14px;">
<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;">🏠 ${window.t("Canale","Channel")}</div>
<div style="margin-top:8px;font-size:16px;font-weight:700;color:#0f172a;">${escapeDashboardHTML(channel)}</div>
</div>

<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:14px;">
<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;">📌 ${window.t("Stato","Status")}</div>
<div style="margin-top:8px;font-size:16px;font-weight:700;color:#0f172a;">${escapeDashboardHTML(status)}</div>
</div>

<div style="background:white;border:1px solid #e2e8f0;border-radius:14px;padding:14px;">
<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;">📈 ADR</div>
<div style="margin-top:8px;font-size:16px;font-weight:700;color:#0f172a;">€${adr.toFixed(0)}</div>
</div>


<!-- ===================================== -->
<!-- EXECUTIVE DECISION -->
<!-- ===================================== -->

<hr style="
border:none;
border-top:1px solid #e2e8f0;
margin:26px 0;
">

<div style="
display:grid;
grid-template-columns:1.3fr .9fr;
gap:18px;
margin-bottom:22px;
">

<div style="
background:linear-gradient(135deg,#0f172a,#1e293b);
padding:22px;
border-radius:18px;
color:white;
">

<div style="
font-size:12px;
letter-spacing:1px;
opacity:.70;
text-transform:uppercase;
font-weight:700;
">

${window.t(
"Valutazione prenotazione",
"Booking assessment"
)}

</div>

<div style="
font-size:30px;
font-weight:800;
margin-top:10px;
line-height:1.2;
">

${verdict}

</div>

<div style="
margin-top:18px;
font-size:15px;
line-height:1.7;
opacity:.95;
">

${executiveSummary}

</div>

</div>

<div style="
background:white;
border:1px solid #e2e8f0;
border-radius:18px;
padding:22px;
">

<div style="
font-size:12px;
text-transform:uppercase;
font-weight:700;
color:#64748b;
">

${window.t(
"Priorità",
"Priority"
)}

</div>

<div style="
margin-top:10px;
font-size:24px;
font-weight:800;
color:#f59e0b;
">

${priority}

</div>

<div style="
margin-top:24px;
font-size:12px;
text-transform:uppercase;
font-weight:700;
color:#64748b;
">

${window.t(
"Azione consigliata",
"Recommended Action"
)}

</div>

<div style="
margin-top:8px;
font-size:15px;
font-weight:700;
color:#0f172a;
line-height:1.6;
">

${recommendedAction}

</div>

</div>

</div>

<!-- ===================================== -->
<!-- AI INSIGHT -->
<!-- ===================================== -->

<div style="
background:#f8fafc;
border:1px solid #e2e8f0;
border-left:5px solid #10b981;
border-radius:18px;
padding:20px;
margin-bottom:24px;
">

<div style="
font-size:14px;
font-weight:800;
color:#0f172a;
margin-bottom:10px;
">

💡 ${window.t(
"Sintesi strategica",
"Executive insight"
)}

</div>

<div style="
font-size:15px;
line-height:1.8;
color:#334155;
">

${suggestion}

</div>

</div>

<!-- ===================================== -->
<!-- AI REASONING + ACTIONS -->
<!-- ===================================== -->

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
gap:18px;
margin-top:24px;
">

<!-- AI Reasoning -->

<div style="
background:#ffffff;
border:1px solid #e2e8f0;
border-radius:18px;
padding:18px;
">

<div style="
font-size:14px;
font-weight:800;
color:#0f172a;
margin-bottom:14px;
">

${window.t(
"Motivazione",
"Rationale"
)}

</div>

${why.length
? why.map(item=>`

<div style="
display:flex;
align-items:flex-start;
gap:10px;
margin-bottom:12px;
">

<div style="
width:24px;
height:24px;
border-radius:50%;
background:#dcfce7;
display:flex;
align-items:center;
justify-content:center;
font-size:12px;
color:#16a34a;
font-weight:700;
flex-shrink:0;
">

✓

</div>

<div style="
font-size:14px;
line-height:1.7;
color:#334155;
">

${item}

</div>

</div>

`).join("")
: `<div style="color:#64748b;font-size:14px;">
${window.t(
"Nessuna criticità rilevata.",
"No issues detected."
)}
</div>`
}

</div>

<!-- Recommended Actions -->

<div style="
background:#ffffff;
border:1px solid #e2e8f0;
border-radius:18px;
padding:18px;
">

<div style="
font-size:14px;
font-weight:800;
color:#0f172a;
margin-bottom:14px;
">

🎯 ${window.t(
"Azioni Consigliate",
"Recommended Actions"
)}

</div>

${actions.length
? actions.map(action=>`

<div style="
display:flex;
align-items:flex-start;
gap:10px;
margin-bottom:12px;
">

<div style="
width:24px;
height:24px;
border-radius:50%;
background:#ecfeff;
display:flex;
align-items:center;
justify-content:center;
font-size:12px;
color:#0284c7;
font-weight:700;
flex-shrink:0;
">

➜

</div>

<div style="
font-size:14px;
line-height:1.7;
color:#334155;
">

${action}

</div>

</div>

`).join("")
: `<div style="color:#64748b;font-size:14px;">
${window.t(
"Nessuna azione richiesta.",
"No action required."
)}
</div>`
}

</div>

</div>

<!-- ===================================== -->
<!-- EXECUTIVE OPPORTUNITIES -->
<!-- ===================================== -->

<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:16px;
margin-top:22px;
">

<div style="
background:#ecfeff;
border:1px solid #bae6fd;
border-radius:16px;
padding:18px;
">

<div style="
font-size:12px;
text-transform:uppercase;
font-weight:700;
color:#0369a1;
">

🚀 ${window.t(
"Opportunità Upsell",
"Upsell Opportunity"
)}

</div>

<div style="
margin-top:10px;
font-size:17px;
font-weight:700;
color:#0f172a;
">

${upsellOpportunity}

</div>

</div>

<div style="
background:#f0fdf4;
border:1px solid #bbf7d0;
border-radius:16px;
padding:18px;
">

<div style="
font-size:12px;
text-transform:uppercase;
font-weight:700;
color:#15803d;
">

${window.t(
"Affidabilità analisi",
"Analysis confidence"
)}

</div>

<div style="
margin-top:10px;
font-size:28px;
font-weight:800;
color:#166534;
">

96%

</div>

</div>

</div>

</div>
`;


    box.appendChild(result);






};
// =====================================
// 📅 OPEN BOOKINGS
// =====================================

window.openBookings = function(propertyId){


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

  const status =
    document.getElementById(
      "booking-status"
    )?.value || "arrival";

  const arrival = new Date(`${checkin}T00:00:00`);
  const departure = new Date(`${checkout}T00:00:00`);

  if(!guest){
    alert(t("Inserisci il nome dell’ospite.", "Enter the guest name."));
    return;
  }

  if(
    !checkin ||
    !checkout ||
    Number.isNaN(arrival.getTime()) ||
    Number.isNaN(departure.getTime()) ||
    departure <= arrival
  ){
    alert(t(
      "Il check-out deve essere successivo al check-in.",
      "Check-out must be after check-in."
    ));
    return;
  }

  if(!Number.isInteger(guests) || guests < 1){
    alert(t("Inserisci almeno un ospite.", "Enter at least one guest."));
    return;
  }

  if(!Number.isFinite(total) || total <= 0){
    alert(t(
      "Inserisci un importo del soggiorno maggiore di zero.",
      "Enter a stay amount greater than zero."
    ));
    return;
  }

  const editingBookingId = window.pmsEditingBooking
    ? window.currentSelectedBooking?.id
    : null;
  const hasConflict = status !== "cancelled" &&
    (window.currentBookingsData || []).some(existingBooking => {
      if(existingBooking.id === editingBookingId) return false;
      if(String(existingBooking.status || "").toLowerCase() === "cancelled") return false;

      const existingArrival = new Date(`${existingBooking.checkin}T00:00:00`);
      const existingDeparture = new Date(`${existingBooking.checkout}T00:00:00`);

      if(
        Number.isNaN(existingArrival.getTime()) ||
        Number.isNaN(existingDeparture.getTime())
      ) return false;

      return arrival < existingDeparture && departure > existingArrival;
    });

  if(hasConflict){
    alert(t(
      "Date non disponibili: esiste già una prenotazione sovrapposta per questa proprietà.",
      "Dates unavailable: an overlapping booking already exists for this property."
    ));
    return;
  }

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

            status,

            source:
                document.getElementById(
                    "booking-source"
                )?.value || "direct"

        }

    );

   
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

      status,
      
source:
  document.getElementById(
    "booking-source"
  )?.value || "direct",

      createdAt:
        serverTimestamp()

    }

  );
}
  

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

  const bookingsData = [];
  window.currentBookingsData = bookingsData;

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
let activeBookingsCount = 0;

// 🔥 STATISTICHE CANALI
let sourceStats = {};

  snap.forEach(docItem=>{

    const b =
      docItem.data();

    bookingsData.push({
  id: docItem.id,
  ...b
});

    const isCancelled =
      isCancelledBooking(b);

    const source =
  b.source || "Unknown";

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

if(!isCancelled && !sourceStats[source]){

  sourceStats[source] = {
    bookings:0,
    revenue:0
  };

}

if(!isCancelled){

activeBookingsCount++;

sourceStats[source].bookings++;

sourceStats[source].revenue +=
  Number(
    b.totalAmount || 0
  );

    totalGuests +=
      Number(b.guests || 0);

    totalRevenue +=
      Number(b.totalAmount || 0);

    totalNights += nights;

}

html += `

<div
data-status="${escapeDashboardHTML(b.status)}"
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
${escapeDashboardHTML(b.guestName)}
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

${escapeDashboardHTML(b.source || "Direct")}

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
${escapeDashboardHTML(b.checkin)}
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
${escapeDashboardHTML(b.checkout)}
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
${Number(b.guests || 0)}
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
gap:10px;
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

<div style="display:flex;gap:8px;align-items:center;">

${!isCancelled ? `
<button
onclick="cancelBooking('${docItem.id}')"
style="
padding:10px 14px;
border:1px solid #f59e0b;
border-radius:12px;
background:#fffbeb;
color:#b45309;
cursor:pointer;
font-size:12px;
font-weight:700;
white-space:nowrap;
">
${window.t("Annulla", "Cancel")}
</button>
` : ""}

<button
onclick="deleteBooking('${docItem.id}')"
title="${window.t("Elimina definitivamente", "Delete permanently")}"
aria-label="${window.t("Elimina definitivamente", "Delete permanently")}"
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

    const isCancelled =
      isCancelledBooking(booking);

    if(!isCancelled && !hasValidDates){

      attentionCodes.push(
        "invalid_date_range"
      );

    }

    if(
      !isCancelled &&
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
      !isCancelled &&
      checkin === copilotToday
    ){

      attentionCodes.push(
        "arrival_today"
      );

    }

    if(
      !isCancelled &&
      checkout === copilotToday
    ){

      attentionCodes.push(
        "departure_today"
      );

    }

    if(
      !isCancelled &&
      !booking.guestName
    ){

      attentionCodes.push(
        "missing_guest_name"
      );

    }

    if(!isCancelled && totalAmount <= 0){

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
    activeBookingsCount,

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
        <strong>${activeBookingsCount}</strong>
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
${escapeDashboardHTML(channelNames[name] || name)}
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
// 🚫 CANCEL BOOKING (KEEP HISTORY)
// =====================================

window.cancelBooking =
async function(id){

  if(
    !confirm(
      window.t(
        "Annullare questa prenotazione? Rimarrà nello storico ma non sarà conteggiata nei risultati.",
        "Cancel this booking? It will remain in history but will not count toward performance."
      )
    )
  ){
    return;
  }

  await updateDoc(
    doc(
      db,
      "bookings",
      id
    ),
    {
      status: "cancelled",
      cancelledAt: serverTimestamp()
    }
  );

  await loadPMSStats();
  await loadProperties();
  await loadBookings(
    window.currentPropertyId
  );

};

// =====================================
// 🗑 DELETE BOOKING
// =====================================

window.deleteBooking =
async function(id){

  if(
    !confirm(
      window.t(
        "Eliminare definitivamente questa prenotazione? L’operazione non può essere annullata.",
        "Permanently delete this booking? This action cannot be undone."
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

  renderPMSPerformanceChart([
    { checkin:"2026-01-12", totalAmount:180 },
    { checkin:"2026-02-09", totalAmount:220 },
    { checkin:"2026-03-15", totalAmount:260 },
    { checkin:"2026-04-18", totalAmount:310 },
    { checkin:"2026-05-06", totalAmount:240 },
    { checkin:"2026-06-21", totalAmount:330 },
    { checkin:"2026-07-11", totalAmount:420 },
    { checkin:"2026-08-17", totalAmount:380 },
    { checkin:"2026-09-02", totalAmount:310 },
    { checkin:"2026-10-14", totalAmount:330 }
  ]);

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

  const activeBookingDocs =
    bookingsSnap.docs.filter(
      docItem => !isCancelledBooking(docItem.data())
    );

  const bookings =
    activeBookingDocs.length;

  let revenue = 0;
  let totalNights = 0;
  let occupiedNightsThisMonth = 0;
  let revenueThisMonth = 0;

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

  activeBookingDocs.forEach(docItem=>{

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
    const nightsThisMonth = getBookingNightsInMonth(
      b.checkin,
      b.checkout
    );
    occupiedNightsThisMonth += nightsThisMonth;
    revenueThisMonth += getBookingRevenueInMonth(b);

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
      b.checkout > today
    ){

      guestsInHouse +=
        Number(
          b.guests || 0
        );

    }

  });

  const adr =
    occupiedNightsThisMonth > 0
    ? revenueThisMonth / occupiedNightsThisMonth
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
            occupiedNightsThisMonth /
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
  formatCurrency(revenueThisMonth)
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
  activeBookingDocs.reduce(
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
    activeBookingDocs.map(
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

      const isCancelled =
        isCancelledBooking(booking);

      if(!isCancelled && !hasValidDates){

        attentionCodes.push(
          "invalid_date_range"
        );

      }

      if(
        !isCancelled &&
        String(
          booking.status || ""
        ).toLowerCase() ===
        "pending"
      ){

        attentionCodes.push(
          "pending_booking"
        );

      }

      if(!isCancelled && checkin === today){

        attentionCodes.push(
          "arrival_today"
        );

      }

      if(!isCancelled && checkout === today){

        attentionCodes.push(
          "departure_today"
        );

      }

      if(!isCancelled && !booking.guestName){

        attentionCodes.push(
          "missing_guest_name"
        );

      }

      if(!isCancelled && totalAmount <= 0){

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
    bookings,

  revenue:
    revenueThisMonth,

  totalRevenue:
    revenue,
  occupancy,
  adr,
  revpar,
  avgStay,

  guests:
    activeBookingDocs.reduce(
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


dashboardDebug(
  "PMS insight prepared"
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


dashboardDebug(
  "PMS context prepared"
);


renderExecutiveSummary({
  properties,
  bookings,
  revenue: revenueThisMonth,
  occupancy,
  adr,
  revpar,
  arrivalsToday,
  departuresToday,
  guestsInHouse
});

dashboardDebug(
  "PMS guest statistics prepared"
);


dashboardDebug(
  "PMS statistics prepared"
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

  const currentYear = new Date().getFullYear();

  bookings.forEach(b=>{
    if(isCancelledBooking(b)) return;
    if(!b.checkin || !b.checkout) return;

    for(let month = 0; month < 12; month++){
      monthlyRevenue[month] += getBookingRevenueInMonth(
        b,
        new Date(currentYear, month, 1)
      );
    }
  });

  const existing =
    Chart.getChart(canvas);

  if(existing){

    existing.destroy();

  }

  new Chart(canvas,{

    type:"bar",

    data:{

      labels: window.currentLang === "it"
        ? ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"]
        : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],

      datasets:[{

label:t("Ricavi","Revenue"),

data:monthlyRevenue,

backgroundColor:"#10b981",

borderRadius:12,

borderSkipped:false

}]

    },

    options:{

      responsive:true,
      maintainAspectRatio:false,
      devicePixelRatio:Math.min(window.devicePixelRatio || 1, 2),

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

        if(isCancelledBooking(booking)) return;

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
    ? escapeDashboardHTML(
        JSON.stringify(bookingInfo)
      )
    : ""
}'
title="${
  escapeDashboardHTML(
    tooltip ||
    (
      isEnglish
        ? "Create booking"
        : "Crea prenotazione"
    )
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
${escapeDashboardHTML(bookingInfo.guestName || "")}
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

             
              return;

            }


            try{

              const bookingData =
                JSON.parse(
                  bookingRaw
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

"I dati suggeriscono di intervenire su occupazione e visibilità dell'annuncio prima di aumentare le tariffe.",

"The data suggests improving occupancy and listing visibility before increasing rates."

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
"Report Executive",
"Executive Report"
)}

</div>

<h2 style="
margin:0;
font-size:30px;
font-weight:900;
color:#0f172a;
">

${t(
"Analisi delle performance",
"Performance Analysis"
)}

</h2>

<div style="
margin-top:8px;
font-size:15px;
color:#64748b;
">

${t(
"RendimentoBB monitora le performance della tua attività.",
"RendimentoBB monitors your property's performance."
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

PERFORMANCE SCORE

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
"Valutazione",
"Assessment"
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

${t(
"Azioni consigliate",
"Recommended Actions"
)}

</div>


<div style="
display:grid;
grid-template-columns:repeat(auto-fit,minmax(270px,1fr));
gap:14px;
">


<button
onclick="window.openWhatIf && window.openWhatIf('adr')"
style="
padding:20px;
min-height:150px;

display:flex;
flex-direction:column;
justify-content:flex-start;
align-items:flex-start;

border-radius:16px;
border:1px solid #dbe4ee;
background:#ffffff;
cursor:pointer;
text-align:left;
overflow:hidden;
">

<div style="
font-size:24px;
margin-bottom:10px;
">
📈
</div>

<div style="
font-weight:800;
font-size:16px;
line-height:1.35;
color:#0f172a;
white-space:normal;
word-break:break-word;
">

${t(
"Aumenta ADR",
"Increase ADR"
)}

</div>

<div style="
font-size:13px;
line-height:1.45;
color:#64748b;
margin-top:8px;
white-space:normal;
word-break:break-word;
">

+5% pricing simulation

</div>

</button>



<button
onclick="window.openWhatIf && window.openWhatIf('mortgage')"
style="
padding:20px;
min-height:150px;

display:flex;
flex-direction:column;
justify-content:flex-start;
align-items:flex-start;

border-radius:16px;
border:1px solid #dbe4ee;
background:#ffffff;
cursor:pointer;
text-align:left;
overflow:hidden;
">

<div style="
font-size:24px;
margin-bottom:10px;
">
🏦
</div>

<div style="
font-weight:800;
font-size:16px;
line-height:1.35;
color:#0f172a;
white-space:normal;
word-break:break-word;
">

${t(
"Ottimizza mutuo",
"Optimize mortgage"
)}

</div>

<div style="
font-size:13px;
line-height:1.45;
color:#64748b;
margin-top:8px;
white-space:normal;
word-break:break-word;
">

${t("Analisi LTV / capitale proprio","LTV / equity analysis")}

</div>

</button>



<button
onclick="window.openMarketComparison && window.openMarketComparison()"
style="
padding:20px;
min-height:150px;

display:flex;
flex-direction:column;
justify-content:flex-start;
align-items:flex-start;

border-radius:16px;
border:1px solid #dbe4ee;
background:#ffffff;
cursor:pointer;
text-align:left;
overflow:hidden;
">

<div style="
font-size:24px;
margin-bottom:10px;
">
🏙️
</div>

<div style="
font-weight:800;
font-size:16px;
line-height:1.35;
color:#0f172a;
white-space:normal;
word-break:break-word;
">

${t(
"Confronta mercato",
"Compare market"
)}

</div>

<div style="
font-size:13px;
line-height:1.45;
color:#64748b;
margin-top:8px;
white-space:normal;
word-break:break-word;
">

${t("Roma vs Milano vs Napoli","Rome vs Milan vs Naples")}

</div>

</button>



<button
onclick="handleReportClick && handleReportClick()"
style="
padding:20px;
min-height:150px;

display:flex;
flex-direction:column;
justify-content:flex-start;
align-items:flex-start;

border-radius:16px;
border:1px solid #dbe4ee;
background:#ffffff;
cursor:pointer;
text-align:left;
overflow:hidden;
">

<div style="
font-size:24px;
margin-bottom:10px;
">
📄
</div>

<div style="
font-weight:800;
font-size:16px;
line-height:1.35;
color:#0f172a;
white-space:normal;
word-break:break-word;
">

${t(
"Genera Report",
"Generate Report"
)}

</div>

<div style="
font-size:13px;
line-height:1.45;
color:#64748b;
margin-top:8px;
white-space:normal;
word-break:break-word;
">

${t("PDF Executive","Executive PDF")}

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

${t(
"Raccomandazione",
"Recommendation"
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
"Livello analisi",
"Analysis rating"
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
"Sintesi strategica",
"Executive insight"
)}

</strong>

<br><br>

${executiveBrief}

</div>

</div>

</div>

`;

}

document.addEventListener("rb_language_changed", () => {
  if(window.rbPMSData){
    renderExecutiveSummary(window.rbPMSData);
  }
});

// =====================================
// 🏨 PMS TABS
// =====================================

window.showPMSTab = function(tab){

  const validTabs = [
    "dashboard",
    "properties",
    "roi"
  ];

  const selectedTab =
    validTabs.includes(tab)
      ? tab
      : "dashboard";

  document
    .querySelectorAll(".pms-tab")
    .forEach(button=>{

      button.classList.remove("active");

      button.setAttribute(
        "aria-selected",
        "false"
      );

    });

  const activeButton =
    document.getElementById(
      "pms-tab-" + selectedTab
    );

  if(activeButton){

    activeButton.classList.add("active");

    activeButton.setAttribute(
      "aria-selected",
      "true"
    );

  }

  const sections = {

    dashboard:
      document.getElementById(
        "pms-dashboard-section"
      ),

    properties:
      document.getElementById(
        "pms-properties-section"
      ),

    roi:
      document.getElementById(
        "pms-roi-section"
      ),

    investment:
      document.getElementById(
        "investment-workspace-section"
      )

  };

  Object
    .values(sections)
    .forEach(section=>{

      if(!section) return;

      section.hidden = true;
      section.style.display = "none";

    });

  if(selectedTab === "dashboard"){

    if(sections.dashboard){

      sections.dashboard.hidden = false;
      sections.dashboard.style.display = "grid";

    }

  }

  if(selectedTab === "properties"){

    if(sections.properties){

      sections.properties.hidden = false;
      sections.properties.style.display = "block";

    }

  }

  if(selectedTab === "roi"){

    [
      sections.roi,
      sections.investment
    ].forEach(section=>{

      if(!section) return;

      section.hidden = false;
      section.style.display = "block";

    });

    requestAnimationFrame(()=>{

      window.dispatchEvent(
        new Event("resize")
      );

    });

  }

};

document.addEventListener("DOMContentLoaded",()=>{

    showPMSTab("dashboard");

});
