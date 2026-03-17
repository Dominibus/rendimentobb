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

document.body.style.background =
"linear-gradient(rgba(15,23,42,0.45),rgba(15,23,42,0.45)), url('" +
images[city] +
"') center/cover fixed";

};

document.addEventListener("DOMContentLoaded", () => {

const header = `

<header class="portal-header">

<div class="container portal-header-inner">

<div class="header-left">

<a href="/" class="logo-link rb-logo">
<img src="/img/logo-main.png" alt="RendimentoBB" class="logo-img">
</a>

<button class="hamburger" aria-label="Menu">
☰
</button>

</div>

<nav class="portal-nav">

<a href="/tool/"
data-it="Simulatore"
data-en="Simulator">
Simulatore
</a>

<a href="/aprire-bnb-conviene/"
data-it="Aprire un B&B"
data-en="Start a B&B">
Aprire un B&B
</a>

<a href="/mutui/"
data-it="Mutui"
data-en="Mortgages">
Mutui
</a>

<a href="/immobili/"
data-it="Immobili"
data-en="Properties">
Immobili
</a>

<a href="/academy/"
data-it="Academy"
data-en="Academy">
Academy
</a>

<a href="/dashboard/"
id="nav-dashboard"
style="display:none;"
data-it="Dashboard"
data-en="Dashboard">
Dashboard
</a>

<a href="/contact.html"
data-it="Contatti"
data-en="Contact">
Contatti
</a>

</nav>

<div class="right-controls">

<div id="user-area"></div>

<div class="lang-switch">

<button class="lang-btn" onclick="setLang('it')" id="btn-it">
IT
</button>

<button class="lang-btn" onclick="setLang('en')" id="btn-en">
EN
</button>

</div>

</div>

</div>

</header>

`;

document.body.insertAdjacentHTML("afterbegin", header);

if(typeof applyStaticTranslations === "function"){
applyStaticTranslations();
}

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
/* ACTIVE PAGE */
/* ===================== */

const currentPath = window.location.pathname;

document.querySelectorAll(".portal-nav a").forEach(link => {

const href = link.getAttribute("href");

if(currentPath.startsWith(href)){
link.classList.add("active");
}

});

/* ===================== */
/* LANGUAGE UPDATE */
/* ===================== */

document.addEventListener("rb_language_changed", () => {

if(typeof applyStaticTranslations === "function"){
applyStaticTranslations();
}

});

});
