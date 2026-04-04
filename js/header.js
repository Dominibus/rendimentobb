/* ===================== */
/* INIT HEADER FINAL PRO */
/* ===================== */

document.addEventListener("DOMContentLoaded", () => {

const header = `
<header class="portal-header">

<div class="portal-header-inner">

<!-- LEFT -->
<div class="header-left">
  <a href="/" class="logo-link rb-logo">
    <img src="/img/logo-main.png" class="logo-img">
  </a>
</div>

<!-- NAV -->
<nav class="portal-nav">

<a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>

<a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">
Aprire un B&B
</a>

<a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>

<a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>

<a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>

<a href="/dashboard/" id="nav-dashboard"
data-it="Dashboard" data-en="Dashboard">
Dashboard
</a>

<a href="/contact.html" data-it="Contatti" data-en="Contact">
Contatti
</a>

</nav>

<!-- RIGHT -->
<div class="header-right">

<div id="user-area"></div>

<div class="lang-switch">
  <button class="lang-btn" onclick="setLang('it')" id="btn-it">IT</button>
  <button class="lang-btn" onclick="setLang('en')" id="btn-en">EN</button>
</div>

<button class="hamburger" id="hamburger">☰</button>

</div>

</div>
</header>
`;

const container = document.getElementById("global-header");
if(container){
  container.innerHTML = header;
}

/* HERO */
window.applyCityBackground();

/* MENU TOGGLE */
const hamburger = document.getElementById("hamburger");
const nav = document.querySelector(".portal-nav");

if(hamburger && nav){

  hamburger.addEventListener("click", ()=>{
    nav.classList.toggle("open");
    hamburger.classList.toggle("active");
  });

}

/* ACTIVE LINK */
const currentPath = window.location.pathname;

document.querySelectorAll(".portal-nav a").forEach(link=>{
  const href = link.getAttribute("href");
  if(currentPath.startsWith(href)){
    link.classList.add("active");
  }
});

/* TRADUZIONI */
setTimeout(()=>{
  if(typeof applyTranslations === "function"){
    applyTranslations();
  }
},50);

});
