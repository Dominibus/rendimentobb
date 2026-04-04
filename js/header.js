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
/* INIT HEADER FINAL */
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

/* MENU */
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


/* ===================== */
/* USER AREA */
/* ===================== */

onAuthStateChanged(auth, (user)=>{

const userArea = document.getElementById("user-area");
if(!userArea) return;

const isMobile = window.innerWidth < 768;

if(user){

if(isMobile){

  userArea.innerHTML = `
  <div style="display:flex;align-items:center;gap:6px">

    <a href="/dashboard/" class="btn btn-secondary">
      📊
    </a>

    <button onclick="logout()" class="btn btn-secondary">
      ⎋
    </button>

  </div>
  `;

}else{

  userArea.innerHTML = `
  <div style="display:flex;align-items:center;gap:10px">

    <span class="user-email">${user.email}</span>

    <a href="/dashboard/" class="btn btn-secondary">Dashboard</a>

    <button onclick="logout()" class="btn btn-secondary">Esci</button>

  </div>
  `;

}

}else{

if(isMobile){

  userArea.innerHTML = `
    <a href="/login/" class="login-btn">
      Accedi
    </a>
  `;

}else{

  userArea.innerHTML = `
    <a href="/login/" class="btn btn-secondary">Accedi</a>
  `;

}

}

/* TRADUZIONE */
setTimeout(()=>{
  if(typeof applyTranslations === "function"){
    applyTranslations();
  }
},50);

});


/* ===================== */
/* LANG SYNC */
/* ===================== */

document.addEventListener("rb_language_changed", ()=>{
  if(typeof applyTranslations === "function"){
    applyTranslations();
  }
});
