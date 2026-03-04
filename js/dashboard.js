import {
getFirestore,
collection,
query,
where,
getDocs,
orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const db = getFirestore();

function formatCurrency(value){

return new Intl.NumberFormat(
window.currentLang === "it" ? "it-IT" : "en-US",
{ style:"currency", currency:"EUR"}
).format(value);

}

function t(it,en){
return window.currentLang === "en" ? en : it;
}


async function loadDashboard(){

if(!window.currentUser){

window.location.href="/login/";
return;

}

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
<strong style="color:#10b981">${data.roi.toFixed(1)}%</strong>
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


function renderStats(count,totalROI){

const container = document.querySelector(".dashboard-container");

const avgROI = count ? (totalROI/count).toFixed(1) : 0;

const stats = document.createElement("div");

stats.style.marginTop="40px";
stats.style.display="grid";
stats.style.gridTemplateColumns="repeat(auto-fit,minmax(200px,1fr))";
stats.style.gap="20px";

stats.innerHTML=`

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
<strong>${count}</strong>
</div>
</div>

<div class="analysis-card">
<h3>${t("ROI medio","Average ROI")}</h3>
<div class="metric">
<strong style="color:#10b981">${avgROI}%</strong>
</div>
</div>

`;

container.prepend(stats);

}


document.addEventListener("rb_plan_loaded",loadDashboard);
