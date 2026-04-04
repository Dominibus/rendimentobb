/* ===================== */
/* FIREBASE INIT */
/* ===================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* ===================== */
/* HERO BACKGROUND */
/* ===================== */

window.applyCityBackground = function(city){

const hero =
  document.querySelector(".hero-bg") ||
  document.querySelector(".hero");

if(!hero) return;

hero.classList.remove("rome","naples","milan","florence");

let finalCity = city;

if(!finalCity){

  const path = window.location.pathname.toLowerCase();

  if(path.includes("napoli")) finalCity = "naples";
  else if(path.includes("milano")) finalCity = "milan";
  else if(path.includes("firenze")) finalCity = "florence";
  else finalCity = "rome";
}

hero.classList.add(finalCity);

};


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

<a href="/dashboard-leads/" id="nav-leads" style="display:none">Leads</a>

<a href="/dashboard/" data-it="Dashboard" data-en="Dashboard">Dashboard</a>
<a href="/contact.html" data-it="Contatti" data-en="Contact">Contatti</a>

</nav>

<!-- RIGHT -->
<div class="right-controls">

<div id="user-area"></div>

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


/* ===================== */
/* USER AREA FINAL FIX */
/* ===================== */

onAuthStateChanged(auth, (user)=>{

const desktop = document.getElementById("user-area");
const mobile = document.getElementById("mobile-user-area");

if(!desktop || !mobile) return;

if(user){

const html = `
<div class="user-box">
<div class="user-email">${user.email}</div>
<div class="user-actions">
<a href="/dashboard/" class="btn btn-secondary">Dashboard</a>
<button onclick="logout()" class="btn btn-secondary">Esci</button>
</div>
</div>
`;

desktop.innerHTML = html;
mobile.innerHTML = html;

}else{

const html = `
<a href="/login/" class="btn btn-primary login-btn">
Accedi
</a>
`;

desktop.innerHTML = html;
mobile.innerHTML = html;

}

const leadsLink = document.getElementById("nav-leads");

if(leadsLink && user && user.email === "rendimentobb@gmail.com"){
  leadsLink.style.display = "inline-block";
}

setTimeout(()=> window.applyTranslations?.(), 50);

});


/* ===================== */
/* LANG SYNC */
/* ===================== */

document.addEventListener("rb_language_changed", ()=>{
  window.applyTranslations?.();
});
