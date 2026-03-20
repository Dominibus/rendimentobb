/* ===================== */
/* FIREBASE INIT */
/* ===================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

/* ===================== */
/* GLOBAL CITY BACKGROUND */
/* ===================== */

window.applyCityBackground = function(city){

const images = {
rome: "/img/rome-bg.jpg",
naples: "/img/naples-bg.jpg",
florence: "/img/florence-bg.jpg",
milan: "/img/milan-bg.jpg"
};

if(!images[city]) return;

const hero = document.querySelector(".hero");
if(hero){
hero.style.background =
"linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.75)), url('" + images[city] + "') center/cover";
}

};  

/* ===================== */
/* INIT HEADER */
/* ===================== */

document.addEventListener("DOMContentLoaded", () => {

const header = `
<header class="portal-header">

<div class="container portal-header-inner">

<div class="header-left">

<a href="/" class="logo-link rb-logo">
<img src="/img/logo-main.png" alt="RendimentoBB" class="logo-img">
</a>

<button class="hamburger" aria-label="Menu">☰</button>

</div>

<nav class="portal-nav">

<a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>
<a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">Aprire un B&B</a>
<a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>
<a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>
<a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>

<a href="/dashboard/" id="nav-dashboard"
data-it="Dashboard" data-en="Dashboard">Dashboard</a>

<a href="/contact.html" data-it="Contatti" data-en="Contact">Contatti</a>

</nav>

<div class="right-controls">

<div id="user-area"></div>

<div class="lang-switch">
<button class="lang-btn" onclick="setLang('it')" id="btn-it">IT</button>
<button class="lang-btn" onclick="setLang('en')" id="btn-en">EN</button>
</div>

</div>

</div>
</header>
`;

document.getElementById("global-header").innerHTML = header;

/* ===================== */
/* USER AREA */
/* ===================== */

onAuthStateChanged(auth, (user) => {

const userArea = document.getElementById("user-area");
if(!userArea) return;

if(user){

userArea.innerHTML = `
<div style="text-align:right">

<div style="font-size:12px;color:#64748b;"
data-it="Account"
data-en="Account">
Account
</div>

<div style="font-weight:600;font-size:14px;">
${user.email}
</div>

<div style="margin-top:6px;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">

<a href="/dashboard/" class="btn btn-secondary"
data-it="Dashboard"
data-en="Dashboard">
Dashboard
</a>

<button onclick="logout()" class="btn btn-secondary"
data-it="Esci"
data-en="Logout">
Esci
</button>

</div>

</div>
`;

}else{

userArea.innerHTML = `
<div style="text-align:right">

<div style="font-size:12px;color:#64748b;"
data-it="Area riservata"
data-en="Private area">
Private area
</div>

<a href="/login/" class="btn btn-secondary" style="margin-top:5px;"
data-it="Accedi"
data-en="Login">
Accedi
</a>

</div>
`;

}

// 🔥 FORZA TRADUZIONE DOPO RENDER USER AREA
if(typeof applyStaticTranslations === "function"){
applyStaticTranslations();
}

});

/* ===================== */
/* TRADUZIONE HEADER BASE */
/* ===================== */

setTimeout(()=>{
if(typeof applyStaticTranslations === "function"){
applyStaticTranslations();
}
},100);

/* ===================== */
/* HAMBURGER MENU */
/* ===================== */

const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".portal-nav");

if(hamburger && nav){
hamburger.addEventListener("click", () => {
nav.classList.toggle("open");
});
}

/* ===================== */
/* ACTIVE LINK */
/* ===================== */

const currentPath = window.location.pathname;

document.querySelectorAll(".portal-nav a").forEach(link => {
const href = link.getAttribute("href");
if(currentPath.startsWith(href)){
link.classList.add("active");
}
});

});
