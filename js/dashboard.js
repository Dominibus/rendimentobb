// ===============================================
// RENDIMENTOBB – DASHBOARD ENGINE 3.0
// Full Translation Support + Live Language Refresh
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


// ================= UTIL =================

function formatCurrency(value){

return new Intl.NumberFormat(
window.currentLang === "it" ? "it-IT" : "en-US",
{ style:"currency", currency:"EUR"}
).format(value);

}

function t(it,en){
return window.currentLang === "en" ? en : it;
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

let totalROI = 0;
let count = 0;

querySnapshot.forEach(doc=>{

const data = doc.data();

totalROI += data.roi;
count++;

const roiColor = data.roi >= 0 ? "#10b981" : "#ef4444";

const card = document.createElement("div");

card.className="analysis-card";

card.innerHTML=`

<h3>${t("Analisi investimento","Investment analysis")}</h3>

<div class="metric">
${t("Prezzo immobile","Property price")}:
<strong>${formatCurrency(data.propertyPrice)}</strong>
</div>

<div class="metric">
${t("Equity investita","Equity invested")}:
<strong>${formatCurrency(data.equity)}</strong>
</div>

<div class="metric">
ROI:
<strong style="color:${roiColor}">
${data.roi.toFixed(1)}%
</strong>
</div>

<div class="metric">
${t("Indice rischio","Risk score")}:
<strong>${data.risk}/100</strong>
</div>

`;

list.appendChild(card);

});

renderStats(count,totalROI);

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
<strong>${window.currentUser.email}</strong>
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

function renderStats(count,totalROI){

const avgROI = count ? (totalROI/count).toFixed(1) : 0;

const roiColor = avgROI >= 0 ? "#10b981" : "#ef4444";

const statsContainer = document.getElementById("dashboard-stats");

statsContainer.innerHTML=`

<div class="analysis-card">

<h3>${t("Account","Account")}</h3>

<div class="metric">
${t("Utente","User")}:
<strong>${window.currentUser.email}</strong>
</div>

<div class="metric">
${t("Piano","Plan")}:
<strong>${window.currentPlan.toUpperCase()}</strong>
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
