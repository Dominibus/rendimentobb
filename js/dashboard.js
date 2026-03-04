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

async function loadAnalyses(){

if(!window.currentUser) return;

const q = query(
collection(db,"analyses"),
where("uid","==",window.currentUser.uid),
orderBy("createdAt","desc")
);

const querySnapshot = await getDocs(q);

const list = document.getElementById("analysis-list");

list.innerHTML="";

querySnapshot.forEach(doc=>{

const data = doc.data();

const card = document.createElement("div");

card.className="analysis-card";

card.innerHTML=`

<h3>Analisi investimento</h3>

<div class="metric">
Prezzo immobile: ${formatCurrency(data.propertyPrice)}
</div>

<div class="metric">
Equity investita: ${formatCurrency(data.equity)}
</div>

<div class="metric">
ROI: <strong>${data.roi.toFixed(1)}%</strong>
</div>

<div class="metric">
Indice rischio: ${data.risk}/100
</div>

`;

list.appendChild(card);

});

}

document.addEventListener("rb_plan_loaded",loadAnalyses);
