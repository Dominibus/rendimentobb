/* ===================== */
/* FIREBASE INIT */
/* ===================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

window.applyCityBackground = function(city){

const hero =
  document.querySelector(".hero-bg") ||
  document.querySelector(".hero");

if(!hero) return;

// reset classi
hero.classList.remove("rome","naples","milan","florence");

let finalCity = city;

// AUTO-DETECT URL
if(!finalCity){

  const path = window.location.pathname.toLowerCase().replace(/\/$/, "");

  if(path.includes("/napoli")) finalCity = "naples";
    else if(path.includes("/milano")) finalCity = "milan";
    else if(path.includes("/firenze")) finalCity = "florence";
    else if(path.includes("/roma")) finalCity = "rome";
}

// fallback sicurezza
if(!finalCity) finalCity = "rome";

// applica classe
hero.classList.add(finalCity);

console.log("🎯 Hero city:", finalCity);

};


/* ===================== */
/* INIT HEADER */
/* ===================== */

document.addEventListener("DOMContentLoaded", () => {

const isAdmin = window.isAdmin?.();

const header = `
<header class="portal-header">

<div class="container portal-header-inner">

<!-- LEFT -->
<div class="header-left">

<a href="/" class="logo-link rb-logo">
<img src="/img/logo-main.png" alt="RendimentoBB" class="logo-img">
</a>

<button class="hamburger" aria-label="Menu">☰</button>

</div>

<!-- CENTER NAV -->
<nav class="portal-nav">

<a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>

<a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">
Aprire un B&B
</a>

<a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>

<a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>

<a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>

${isAdmin ? `
<a href="/dashboard-leads/" class="admin-link"
data-it="Leads" data-en="Leads">
Leads
</a>
` : ""}

<a href="/dashboard/" id="nav-dashboard"
data-it="Dashboard" data-en="Dashboard">
Dashboard
</a>

<a href="/contact.html"
data-it="Contatti" data-en="Contact">
Contatti
</a>

</nav>

<!-- RIGHT -->
<div class="header-right">

<div id="user-area"></div>

<div class="lang-switch">
<button class="lang-btn" onclick="setLang('it')">IT</button>
<button class="lang-btn" onclick="setLang('en')">EN</button>
</div>

</div>

</div>

</header>
`;

document.getElementById("global-header").innerHTML = header;


/* ===================== */
/* HAMBURGER MOBILE */
/* ===================== */

const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".portal-nav");

if(hamburger && nav){
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

});

<!-- RIGHT -->
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

const container = document.getElementById("global-header");

if(container){
  container.innerHTML = header;
}

// 🔥 APPLY HERO BACKGROUND
window.applyCityBackground();

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

/* ===================== */
/* TRADUZIONE HEADER */
/* ===================== */

setTimeout(() => {
  if(typeof applyTranslations === "function"){
    applyTranslations();
  }
}, 50);

});


/* ===================== */
/* USER AREA */
/* ===================== */

onAuthStateChanged(auth, (user) => {

const userArea = document.getElementById("user-area");
if(!userArea) return;

const isMobile = window.innerWidth < 768;

if(user){

  if(isMobile){

    userArea.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end">

    <a href="/dashboard/" class="btn btn-secondary"
    data-it="Dashboard" data-en="Dashboard">📊</a>

    <button onclick="logout()" class="btn btn-secondary"
    data-it="Esci" data-en="Logout">⎋</button>

    </div>
    `;

  }else{

    userArea.innerHTML = `
    <div style="text-align:right">

    <div style="font-size:12px;color:#64748b;"
    data-it="Account" data-en="Account">
    Account
    </div>

    <div style="font-weight:600;font-size:14px;">
    ${user.email}
    </div>

    <div style="margin-top:6px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">

    <a href="/dashboard/" class="btn btn-secondary"
    data-it="Dashboard" data-en="Dashboard">
    Dashboard
    </a>

    <button onclick="logout()" class="btn btn-secondary"
    data-it="Esci" data-en="Logout">
    Esci
    </button>

    </div>

    </div>
    `;

  }

}else{

  userArea.innerHTML = `
  <div style="text-align:right">

  <div style="font-size:12px;color:#64748b;"
  data-it="Area riservata"
  data-en="Private area">
  Area riservata
  </div>

  <a href="/login/" class="btn btn-secondary" style="margin-top:5px;"
  data-it="Accedi"
  data-en="Login">
  Accedi
  </a>

  </div>
  `;

}

/* ===================== */
/* TRADUZIONE USER AREA */
/* ===================== */

setTimeout(() => {
  if(typeof applyTranslations === "function"){
    applyTranslations();
  }
}, 50);

});


/* ===================== */
/* SYNC LINGUA DINAMICA */
/* ===================== */

document.addEventListener("rb_language_changed", () => {
  if(typeof applyTranslations === "function"){
    applyTranslations();
  }
});
