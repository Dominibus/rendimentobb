// ===============================================
// RENDIMENTOBB – DASHBOARD ENGINE 4.0
// Safe Data Handling + Capital Stats + Date Display
// ===============================================

import {
getFirestore,
collection,
query,
where,
getDocs,
orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const db = getFirestore();

// ================= CHART DATA =================

let roiValues = [];
let labels = [];
let roiChartInstance = null;

// ================= UTIL =================

function formatCurrency(value){

return new Intl.NumberFormat(
window.currentLang === "it" ? "it-IT" : "en-US",
{ style:"currency", currency:"EUR"}
).format(value || 0);

}

function formatDate(timestamp){

if(!timestamp) return "-";

const date = new Date(timestamp.seconds * 1000);

return date.toLocaleDateString(
window.currentLang === "it" ? "it-IT" : "en-US"
);

}

function t(it,en){
return window.currentLang === "en" ? en : it;
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


// ================= LOAD DASHBOARD =================

async function loadDashboard(){

if(!window.currentUser){

window.location.href="/login/";
return;

}

renderHeader();

const q = query(
collection(db,"analyses"),
where("uid","==",window.currentUser.uid),
orderBy("createdAt","desc")
);

const querySnapshot = await getDocs(q);

const list = document.getElementById("analysis-list");

list.innerHTML="";

roiValues = [];
labels = [];  

let totalROI = 0;
let totalCapital = 0;
let count = 0;

let analyses = [];  

querySnapshot.forEach(doc=>{

const data = doc.data();

analyses.push({
id:doc.id,
roi:data.roi || 0,
price:data.propertyPrice || 0,
equity:data.equity || 0,
risk:data.risk || 0,
createdAt:data.createdAt
});

});


// ================= SORT BY ROI =================

analyses.sort((a,b)=> b.roi - a.roi);


// ================= LIMIT RESULTS =================

const visibleAnalyses = analyses.slice(0,12);


// ================= RENDER CARDS =================

visibleAnalyses.forEach((data,index)=>{

roiValues.push(data.roi);
labels.push("Inv " + (index+1));  

const roi = data.roi;
const price = data.price;
const equity = data.equity;

totalROI += roi;
totalCapital += price;
count++;

const roiClass = roi >= 0 ? "roi-positive" : "roi-negative";

const badge = index === 0
? `<div style="font-size:12px;color:#10b981;margin-bottom:6px;font-weight:600;">🏆 Best ROI</div>`
: "";

const card = document.createElement("div");

card.className="analysis-card";

card.innerHTML=`

${badge}

<h3>${t("Analisi investimento","Investment analysis")}</h3>

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

`;

list.appendChild(card);

});

renderStats(count,totalROI,totalCapital);

renderChart();  

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
<strong class="account-email">
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

function renderStats(count,totalROI,totalCapital){

const avgROI = count ? (totalROI/count).toFixed(1) : 0;

const investmentScore = calculateInvestmentScore(avgROI,totalCapital,count);
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

const roiColor = avgROI >= 0 ? "#10b981" : "#ef4444";

const statsContainer = document.getElementById("dashboard-stats");

statsContainer.innerHTML=`

<div class="analysis-card">

<h3>${t("Account","Account")}</h3>

<div class="metric">
<span>${t("Utente","User")}</span>
<strong class="account-email" title="${window.currentUser.email}">
${window.currentUser.email}
</strong>
</div>

<div class="metric">
<span>${t("Piano","Plan")}</span>
<strong>
${window.currentPlan.toUpperCase()}
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


<div class="analysis-card" style="grid-column: span 2">

<h3>${t("Indice investimento","Investment Score")}</h3>

<div style="font-size:34px;font-weight:700;color:${scoreColor}">
${investmentScore}/100
</div>

<div style="font-size:14px;color:#64748b;margin-top:6px">
${investmentScore >= 80 ? "🟢" : investmentScore >= 60 ? "🟡" : "🔴"} ${scoreLabel}
</div>

<div style="margin-top:10px;height:8px;background:#e2e8f0;border-radius:6px;overflow:hidden">
<div style="width:${investmentScore}%;background:${scoreColor};height:100%"></div>
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

document.addEventListener("rb_plan_loaded", loadDashboard);

/* aggiorna automaticamente quando cambi lingua */

document.addEventListener("rb_language_changed", () => {

if(!window.currentUser) return;

loadDashboard();

});

function renderChart(){

const container = document.getElementById("roi-chart-container");

if(!container) return;

/* ricrea sempre il canvas */

container.innerHTML = '<canvas id="roiChart"></canvas>';

const canvas = document.getElementById("roiChart");

const ctx = canvas.getContext("2d");

/* distrugge eventuale grafico precedente */

if(roiChartInstance){
roiChartInstance.destroy();
roiChartInstance = null;
}

/* crea grafico */

roiChartInstance = new Chart(ctx,{

type:"line",

data:{
labels:labels,
datasets:[{
label:"ROI %",
data:roiValues,
borderColor:"#10b981",
backgroundColor:"rgba(16,185,129,0.15)",
tension:0.3,
fill:true
}]
},

options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false}
},
scales:{
y:{
ticks:{
callback:(v)=> v + "%"
}
}
}
}

});

}
