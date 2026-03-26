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
orderBy,
deleteDoc,
doc
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
  return window.RB_LANG?.current === "en" ? en : it;
};

const db = getFirestore(app);
const auth = getAuth(app);

// ================= CHART DATA =================

let roiValues = [];
let labels = [];
let roiChartInstance = null;

function safeCity(city){
  if(!city || city === "undefined") return "italy";
  return city;
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
label:"ROI %",
data:roiValues,
borderColor:"#10b981",
backgroundColor:gradient,
pointBackgroundColor:"#10b981",
pointBorderColor:"#fff",
pointBorderWidth:2,  
pointRadius:5,
pointHoverRadius:7,
tension:0.45,
fill:true
},

{
label:"Average ROI",
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
callbacks:{
label:(ctx)=> ctx.raw.toFixed(1) + " %"
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
// ================= LOAD DASHBOARD =================

async function loadDashboard(){

if(!window.currentUser){

showGuestPopup();

return;

}

renderHeader();

const q = query(
  collection(db,"analyses"),
  where("uid","==", window.currentUser.uid)
);

const querySnapshot = await getDocs(q);
 if(querySnapshot.empty){
  console.warn("Nessuna analisi trovata");
}
console.log("DOCUMENTI:", querySnapshot.docs.map(d => d.data())); 
console.log("UID:", window.currentUser?.uid);
console.log("Analisi trovate:", querySnapshot.size); 

const list = document.getElementById("analysis-list");

if(!list){
console.error("analysis-list NON trovato");
return;
}

// ================= CREA ANALYSES =================

const analyses = querySnapshot.docs.map(doc => ({
  id: doc.id,
  roi: doc.data().roi || 0,
  price: doc.data().propertyPrice || doc.data().price || 0,
  equity: doc.data().equity || 0,
  risk: doc.data().risk || 0,
  city: doc.data().city || "italy",
  createdAt: doc.data().createdAt
}));

// ================= URL PARAMS =================

const urlParams = new URLSearchParams(window.location.search);

// 🔥 lingua da URL
const langFromURL = urlParams.get("lang");

if(langFromURL && typeof setLang === "function"){
  setLang(langFromURL);
}  

// ================= CITY DYNAMIC =================

const citySelect = document.getElementById("city-select");

// città iniziale
let selectedCity = citySelect?.value || "italy";

// fallback solo se "italy"
if(selectedCity === "italy" && analyses.length > 0){

  analyses.sort((a,b)=> 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  selectedCity = analyses[0]?.city || "napoli";
}

// 🔥 aggiorna SOLO il riquadro (NON background)
updateMarketHero(safeCity(selectedCity));

console.log("Città iniziale:", selectedCity);

// 🔥 CAMBIO CITTÀ LIVE (QUESTO TI MANCAVA)
citySelect?.addEventListener("change",(e)=>{

  const newCity = e.target.value;

  updateMarketHero(newCity);

  console.log("Città cambiata:", newCity);

});

// ================= RESET =================

list.innerHTML="";

roiValues = [];
labels = [];

let totalROI = 0;
let totalCapital = 0;
let count = 0;
let totalCashflow = 0;
// ================= SORT BY ROI =================

analyses.sort((a,b)=> b.roi - a.roi);


// ================= LIMIT RESULTS =================

const visibleAnalyses = analyses.slice(0,12);


// ================= RENDER CARDS =================

visibleAnalyses.forEach((data,index)=>{

roiValues.push(data.roi);
labels.push(formatDate(data.createdAt));  

const roi = data.roi;
const price = data.price;
const equity = data.equity;

/* revenue estimate */

const occupancy = 65;
const adr = 120;

const revenueNeeded = Math.round(
adr * occupancy * 365 / 100
);  

const yearlyProfit = (price * roi) / 100;  

totalROI += roi;
totalCapital += price;
totalCashflow += yearlyProfit;   
count++;

const roiClass = roi >= 0 ? "roi-positive" : "roi-negative";

const badge = index === 0
? `<div style="font-size:12px;color:#10b981;margin-bottom:6px;font-weight:600;">🏆 Best ROI</div>`
: "";

const card = document.createElement("div");

card.className="analysis-card";

card.innerHTML=`

${badge}

<h3>
${t("Analisi investimento","Investment analysis")}
</h3>

<div class="metric">
<span>${t("Città","City")}</span>
<strong>${data.city}</strong>
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
<span>ROI</span>
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
<strong>${formatCurrency(yearlyProfit)}</strong>
</div>

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

`;

list.appendChild(card);

});

renderStats(count,totalROI,totalCapital,totalCashflow);
renderInsight(count,totalROI,totalCapital);
renderROIOptimizer(count,totalROI,totalCapital);
renderROITargetCalculator(analyses); 
renderRevenueSimulator(); 
renderBestInvestment(analyses);
  
const best = analyses[0];
renderInvestmentVerdict(best);  
  
renderInvestmentRanking(analyses);
renderCityDistribution(analyses); 
renderChart();
renderCashflowChart();
renderCityROIChart(analyses);

}

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

const isPro = window.currentPlan === "pro";

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
isPro
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

// ================= KPI HEADER =================

const avgROI = count ? (totalROI/count).toFixed(1) : 0;

const selectedCity =
document.getElementById("city-select")?.value || "italy";

const cityMarket = window.marketData[selectedCity] || window.marketData["italy"] || { roi: 8 };

const marketROI = cityMarket.roi;
const occupancy = cityMarket.occupancy || 60;
const adr = cityMarket.adr || 120;  

const trend = avgROI >= marketROI ? "↑" : "↓";  

 // ================= PORTFOLIO PERFORMANCE =================

const avgCashflow = count ? (totalCashflow / count) : 0;

const roiEl = document.getElementById("portfolio-roi"); 
const cashEl = document.getElementById("portfolio-cashflow");
const capEl = document.getElementById("portfolio-capital");
const countEl = document.getElementById("portfolio-count");

if(roiEl){
roiEl.textContent = avgROI + "%";
}

if(cashEl){
cashEl.textContent = formatCurrency(avgCashflow);
}

if(capEl){
capEl.textContent = formatCurrency(totalCapital);
}

if(countEl){
countEl.textContent = count;
}
 
const investmentScore = calculateInvestmentScore(avgROI,totalCapital,count);

const kpiContainer = document.getElementById("dashboard-kpi");

if(kpiContainer){

kpiContainer.innerHTML = `

<div class="stats-card">

<h3>${t("Capitale portfolio","Portfolio capital")}</h3>

<div style="font-size:28px;font-weight:700">
${formatCurrency(totalCapital)}
</div>

</div>


<div class="stats-card">

<h3>${t("ROI medio","Average ROI")}</h3>

<div style="
font-size:28px;
font-weight:700;
color:${avgROI >= marketROI ? '#10b981' : '#ef4444'};
">
${avgROI}% ${trend}
</div>

</div>


<div class="stats-card">

<h3>${t("Analisi salvate","Saved analyses")}</h3>

<div style="font-size:28px;font-weight:700">
${count}
</div>

</div>


<div class="stats-card">

<h3>${t("Investment Score","Investment Score")}</h3>

<div style="font-size:28px;font-weight:700;color:#2563eb">
${investmentScore}/100
</div>

</div>

`;

} 

// ================= MARKET BENCHMARK =================

console.log("City:", selectedCity, "Market:", cityMarket);  

const performanceEl = document.getElementById("market-performance");
const userRoiEl = document.getElementById("user-roi-benchmark");

if(userRoiEl){

userRoiEl.textContent = avgROI + "%";

if(avgROI >= marketROI){
userRoiEl.style.color = "#10b981";
}else{
userRoiEl.style.color = "#ef4444";
}

}

if(performanceEl){

if(avgROI >= marketROI){

performanceEl.textContent =
window.currentLang === "it"
? "Sopra la media di mercato"
: "Above market average";

performanceEl.style.color = "#10b981";

}else{

performanceEl.textContent =
window.currentLang === "it"
? "Sotto la media di mercato"
: "Below market average";

performanceEl.style.color = "#ef4444";

}

} 
/* MARKET GAP */

const marketGap = (avgROI - marketROI).toFixed(1);

let marketLabel = "";
let marketColor = "#ef4444";

if(marketGap >= 0){
marketLabel = t("Sopra il mercato","Above market");
marketColor = "#10b981";
}else{
marketLabel = t("Sotto il mercato","Below market");
marketColor = "#ef4444";
 
}

/* MARKET OPPORTUNITY SCORE */

let opportunityScore = 50;

/* ROI influence */

if(marketROI > 10) opportunityScore += 20;
else if(marketROI > 7) opportunityScore += 10;

/* occupancy */

if(occupancy > 70) opportunityScore += 20;
else if(occupancy > 60) opportunityScore += 10;

/* ADR */

if(adr > 150) opportunityScore += 10;

if(opportunityScore > 100) opportunityScore = 100;
 
let scoreColor = "#ef4444";
let scoreLabel = t("Alto rischio","High risk");

if(investmentScore >= 80){
scoreColor = "#10b981";
scoreLabel = t("Investimento sicuro","Safe investment");
}
else if(investmentScore >= 60){
scoreColor = "#f59e0b";
scoreLabel = t("Rischio medio","Medium risk");
}

let decisionText = "";
let decisionDesc = "";

if(investmentScore >= 80){

decisionText = t(
"Ottima opportunità di investimento",
"Strong investment opportunity"
);

decisionDesc = t(
"Questo investimento mostra un buon potenziale di redditività.",
"This investment shows solid profitability potential."
);

}
else if(investmentScore >= 60){

decisionText = t(
"Investimento moderato",
"Moderate investment"
);

decisionDesc = t(
"Potrebbe essere interessante ma richiede ulteriori valutazioni.",
"This investment could work but requires deeper analysis."
);

}
else{

decisionText = t(
"Investimento sconsigliato",
"Avoid this investment"
);

decisionDesc = t(
"La redditività prevista è bassa o negativa rispetto al rischio.",
"The projected profitability is too low compared to the risk."
);

}

const roiColor = avgROI >= 0 ? "#10b981" : "#ef4444";

// ================= PROFIT ESTIMATION =================

const yearlyProfit = (totalCapital * avgROI) / 100;
const monthlyProfit = yearlyProfit / 12;  

// ================= BREAK EVEN =================

let breakEvenYears = "-";

if(yearlyProfit > 0){
breakEvenYears = (totalCapital / yearlyProfit).toFixed(1);
}  

const statsContainer = document.getElementById("dashboard-stats");

statsContainer.innerHTML=`

<div class="stats-card">

<h3>${t("Account","Account")}</h3>

<div class="metric">
<span>${t("Utente","User")}</span>
<strong class="account-email" title="${window.currentUser.email}">
${window.currentUser.email}
</strong>
</div>

<div class="metric">
<span>${t("Piano","Plan")}</span>
<strong style="
color:${window.currentPlan === 'pro' ? '#10b981' : '#64748b'};
font-weight:700;
">
${window.currentPlan === "pro" ? "PRO" : "FREE"}
</strong>
</div>

</div>

<div class="analysis-card">

<h3>${t("Analisi salvate","Saved analyses")}</h3>

<div class="metric">
<strong style="font-size:22px">
${count}
</strong>
</div>

</div>


<div class="analysis-card">

<h3>${t("ROI medio","Average ROI")}</h3>

<div class="metric">

<strong style="font-size:22px;color:${roiColor}">
${avgROI}%
</strong>

</div>

</div>

<div class="analysis-card">

<h3>${t("Capitale analizzato","Analyzed capital")}</h3>

<div class="metric">

<strong style="font-size:22px">
${formatCurrency(totalCapital)}
</strong>

</div>

</div>

<div class="analysis-card">

<h3>${t("Opportunità mercato","Market opportunity")}</h3>

<div style="font-size:26px;font-weight:700;color:#2563eb">
${opportunityScore}/100
</div>

<div style="font-size:13px;color:#64748b;margin-top:6px">
${t("Basato su ROI mercato, occupazione e ADR",
"Based on market ROI, occupancy and ADR")}
</div>

</div>


<div class="analysis-card" style="grid-column: span 2">

<h3>${t("Indice investimento","Investment Score")}</h3>

<div style="font-size:34px;font-weight:700;color:${scoreColor}">
${investmentScore}/100
</div>

<div style="margin-top:14px;font-weight:700;font-size:16px;color:${scoreColor}">
${decisionText}
</div>

<div style="font-size:14px;color:#475569;margin-top:6px">
${decisionDesc}
</div>

<div style="font-size:14px;color:#64748b;margin-top:6px">
${investmentScore >= 80 ? "🟢" : investmentScore >= 60 ? "🟡" : "🔴"} ${scoreLabel}
</div>

<div class="metric">
<span>${t("Differenza dal mercato","Market difference")}</span>
<strong style="color:${marketColor}">
${marketGap}% (${marketLabel})
</strong>
</div>

<div style="margin-top:10px;height:8px;background:#e2e8f0;border-radius:6px;overflow:hidden">
<div style="width:${investmentScore}%;background:${scoreColor};height:100%"></div>
</div>

<div style="margin-top:18px;border-top:1px solid #e2e8f0;padding-top:12px">

<div class="metric">
<span>${t("Profitto annuo stimato","Estimated yearly profit")}</span>
<strong style="color:${roiColor}">
${formatCurrency(yearlyProfit)}
</strong>
</div>

<div class="metric">
<span>${t("Profitto mensile stimato","Estimated monthly profit")}</span>
<strong style="color:${roiColor}">
${formatCurrency(monthlyProfit)}
</strong>
</div>

<div class="metric">
<span>${t("Break-even stimato","Estimated break-even")}</span>
<strong>
${breakEvenYears} ${t("anni","years")}
</strong>
</div>

</div>

</div>
`;

}


// ================= LANGUAGE REFRESH =================

function reloadDashboardLanguage(){

if(!window.currentUser) return;

loadDashboard();

}


// ================= INIT =================

onAuthStateChanged(auth, async (user)=>{

if(!window.firebaseReady){
  console.log("Firebase non pronto, attendo...");
  setTimeout(()=>loadDashboard(),300);
  return;
}

if(user){

window.currentUser = user;

console.log("USER OK:", user.uid);

document.dispatchEvent(new Event("rb_auth_ready")); 

await loadDashboard();

}else{

  console.log("NON LOGGATO → pricing");

  window.location.href="/#pricing";

}

});

/* aggiorna automaticamente quando cambi lingua */

document.addEventListener("rb_language_changed", () => {

if(!window.currentUser) return;

loadDashboard();
console.log("Query UID:", window.currentUser?.uid);

});

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

container.innerHTML = '<canvas id="cityChart"></canvas>';

const ctx = document.getElementById("cityChart").getContext("2d");

new Chart(ctx,{

type:"doughnut",

data:{
labels:labels,
datasets:[{
data:values
}]
},

options:{
responsive:true,
plugins:{
legend:{position:"bottom"}
}
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
const ctx = canvas.getContext("2d");

/* dati demo */

const yearlyCashflow = [
-13860,
-8200,
-2500,
3200,
8200
];

/* colori positivo/negativo */

const colors = yearlyCashflow.map(v =>
v >= 0 ? "#10b981" : "#ef4444"
);

/* linea break even */

const breakEven = new Array(yearlyCashflow.length).fill(0);

new Chart(ctx,{

type:"line",

data:{
labels:["Anno 1","Anno 2","Anno 3","Anno 4","Anno 5"],

datasets:[

{
label:"Cashflow €",
data:yearlyCashflow,
borderColor:"#2563eb",
backgroundColor:"rgba(37,99,235,0.15)",
pointBackgroundColor:colors,
pointRadius:6,
pointHoverRadius:8,
tension:0.35,
fill:true
},

{
label:"Break even",
data:breakEven,
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

const container = document.getElementById("investment-insight");

if(!container) return;

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
// CITY MARKET CHANGE
// ===============================

document.getElementById("city-select")?.addEventListener("change",(e)=>{

  const selectedCity = e.target.value;

  updateMarketHero(selectedCity);

  console.log("Città cambiata:", selectedCity);

});

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

const auth = getAuth();

if(!auth.currentUser){
alert("Sessione non valida. Ricarica la pagina.");
return;
}

await deleteDoc(doc(db,"analyses",id));

btn.closest(".analysis-card")?.remove();

}catch(err){

console.error("Delete error:",err);

}

}

function downloadReport(){

if(!window.bestInvestmentData){
alert("Nessuna analisi disponibile");
return;
}

const data = window.bestInvestmentData;

const params = new URLSearchParams({

price:data.price,
roi:data.roi,
equity:data.equity,
risk:data.risk

});

window.location.href =
"/tool/?report=1&" + params.toString();

}

document.addEventListener("click",(e)=>{

if(e.target.closest(".delete-analysis")){
deleteAnalysis(e);
}

if(e.target.id === "download-report"){
downloadReport();
}

});

// ================= UPGRADE =================
window.goToUpgrade = function(){
  window.location.href = "/pricing/";
}

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
<div style="font-size:13px;color:#64748b">ROI medio</div>
<div style="font-size:22px;font-weight:600;color:#10b981">
${market.roi}%
</div>
</div>

<div>
<div style="font-size:13px;color:#64748b">Occupazione</div>
<div style="font-size:22px;font-weight:600">
${market.occupancy}%
</div>
</div>

<div>
<div style="font-size:13px;color:#64748b">ADR</div>
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
title.innerText = "Investire in un B&B a " + cityName;

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
const cashflow = result.cashflow || 0;
const risk = result.risk || 50;

if(roi >= 10 && cashflow > 0 && risk < 70){
return {
type:"excellent",
title:"🔥 Ottimo investimento",
subtitle:"ROI sopra la media e cashflow positivo",
color:"#10b981",
action:"Procedere",
message:"Investimento solido con ottimo equilibrio tra rendimento e rischio."
};
}

if(roi >= 7){
return {
type:"good",
title:"📊 Buon investimento",
subtitle:"Margine interessante ma migliorabile",
color:"#f59e0b",
action:"Ottimizzare",
message:"Buona opportunità ma ottimizzabile su pricing o occupazione."
};
}

return {
type:"risk",
title:"⚠️ Investimento rischioso",
subtitle:"ROI basso o cashflow negativo",
color:"#ef4444",
action:"Evitare",
message:"Rendimento insufficiente o rischio elevato rispetto al mercato."
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

<h2 style="font-size:22px;font-weight:700;color:${verdict.color};">
${verdict.title}
</h2>

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
window.currentPlan !== "pro"
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

const existing = document.getElementById("guest-popup");
if(existing) return;

const popup = document.createElement("div");

popup.id = "guest-popup";

popup.innerHTML = `

<div style="
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.6);
display:flex;
align-items:center;
justify-content:center;
z-index:9999;
">

<div style="
background:white;
padding:28px;
border-radius:14px;
max-width:420px;
width:90%;
text-align:center;
box-shadow:0 20px 60px rgba(0,0,0,0.3);
">

<h2 style="margin-bottom:10px">
🚀 ${t("Scopri la tua redditività","Discover your ROI")}
</h2>

<p style="color:#64748b;font-size:14px;margin-bottom:20px">
${t(
"Analizza investimenti B&B, calcola ROI e scopri se conviene davvero.",
"Analyze B&B investments, calculate ROI and see if it's worth it."
)}
</p>

<div style="
display:flex;
flex-direction:column;
gap:10px;
">

<button onclick="window.location.href='/login/'" style="
background:#10b981;
color:white;
border:none;
padding:12px;
border-radius:8px;
font-weight:600;
cursor:pointer;
">
${t("Accedi","Login")}
</button>

<button onclick="window.location.href='/login/'" style="
background:#0f172a;
color:white;
border:none;
padding:12px;
border-radius:8px;
font-weight:600;
cursor:pointer;
">
${t("Registrati gratis","Register free")}
</button>

<button onclick="document.getElementById('guest-popup').remove()" style="
background:none;
border:none;
color:#64748b;
margin-top:6px;
cursor:pointer;
font-size:12px;
">
${t("Continua come ospite","Continue as guest")}
</button>

</div>

</div>
</div>

`;

document.body.appendChild(popup);

}
