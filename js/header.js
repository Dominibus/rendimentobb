/* ===================== */
/* INIT HEADER ULTRA PRO */
/* ===================== */

document.addEventListener("DOMContentLoaded", () => {

const header = `
<header class="portal-header">

<div class="container portal-header-inner">

<!-- LOGO -->
<div class="header-left">
<a href="/" class="logo-link rb-logo">
<img src="/img/logo-main.png" class="logo-img">
</a>
</div>

<!-- NAV DESKTOP -->
<nav class="portal-nav">

<a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>
<a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">Aprire un B&B</a>
<a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>
<a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>
<a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>
<a href="/dashboard/" data-it="Dashboard" data-en="Dashboard">Dashboard</a>
<a href="/contact.html" data-it="Contatti" data-en="Contact">Contatti</a>

</nav>

<!-- RIGHT -->
<div class="right-controls">

<div id="user-area" class="user-area"></div>

<div class="lang-switch">
<button class="lang-btn" onclick="setLang('it')" id="btn-it">IT</button>
<button class="lang-btn" onclick="setLang('en')" id="btn-en">EN</button>
</div>

<button class="hamburger" id="hamburger-btn">
<span></span>
<span></span>
<span></span>
</button>

</div>

</div>

<!-- MOBILE MENU -->
<div class="mobile-menu" id="mobile-menu">

<div class="mobile-menu-inner">

<div id="mobile-user-area"></div>

<nav class="mobile-nav">
<a href="/tool/">Simulatore</a>
<a href="/aprire-bnb-conviene/">Aprire un B&B</a>
<a href="/mutui/">Mutui</a>
<a href="/immobili/">Immobili</a>
<a href="/academy/">Academy</a>
<a href="/dashboard/">Dashboard</a>
<a href="/contact.html">Contatti</a>
</nav>

</div>

</div>

<div class="mobile-overlay" id="mobile-overlay"></div>

</header>
`;

document.getElementById("global-header").innerHTML = header;

/* HERO */
window.applyCityBackground();

/* ===================== */
/* MOBILE MENU */
/* ===================== */

const hamburger = document.getElementById("hamburger-btn");
const menu = document.getElementById("mobile-menu");
const overlay = document.getElementById("mobile-overlay");

hamburger.onclick = () => {
  menu.classList.toggle("open");
  overlay.classList.toggle("open");
};

overlay.onclick = () => {
  menu.classList.remove("open");
  overlay.classList.remove("open");
};

/* ===================== */
/* ACTIVE LINK */
/* ===================== */

const path = window.location.pathname;

document.querySelectorAll(".portal-nav a, .mobile-nav a").forEach(a=>{
  if(path.startsWith(a.getAttribute("href"))){
    a.classList.add("active");
  }
});

/* ===================== */
/* TRANSLATIONS */
/* ===================== */

setTimeout(()=>{
  window.applyTranslations?.();
},50);

});
