/* ===================== */
/* FIREBASE */
/* ===================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* ===================== */
/* HERO */
/* ===================== */

window.applyCityBackground = function(){

const hero =
  document.querySelector(".hero-bg") ||
  document.querySelector(".hero");

if(!hero) return;

hero.classList.remove("rome","naples","milan","florence");

const path = window.location.pathname.toLowerCase();

let city = "rome";

if(path.includes("milano")) city = "milan";
else if(path.includes("napoli")) city = "naples";
else if(path.includes("firenze")) city = "florence";

hero.classList.add(city);

};


/* ===================== */
/* HEADER INIT */
/* ===================== */

document.addEventListener("DOMContentLoaded", () => {

const header = `
<header class="portal-header">

<div class="portal-header-inner">

<!-- LOGO -->
<div class="header-left">
  <a href="/">
    <img src="/img/logo-main.png" class="logo-img">
  </a>
</div>

<!-- NAV -->
<nav class="portal-nav desktop-nav" id="main-nav">

<a href="/tool/">Simulatore</a>
<a href="/aprire-bnb-conviene/">Aprire un B&B</a>
<a href="/mutui/">Mutui</a>
<a href="/immobili/">Immobili</a>
<a href="/academy/">Academy</a>
<a href="/contact.html">Contatti</a>

</nav>

<!-- RIGHT -->
<div class="header-right">

<div id="user-area"></div>

<div class="lang-switch">
<button class="lang-btn" onclick="setLang('it')">IT</button>
<button class="lang-btn" onclick="setLang('en')">EN</button>
</div>

<button class="hamburger" id="hamburger">☰</button>

</div>

</div>

<!-- MOBILE -->
<div class="mobile-menu" id="mobileMenu">

<a href="/tool/">Simulatore</a>
<a href="/aprire-bnb-conviene/">Aprire un B&B</a>
<a href="/mutui/">Mutui</a>
<a href="/immobili/">Immobili</a>
<a href="/academy/">Academy</a>
<a href="/contact.html">Contatti</a>

</div>

</header>
`;

document.getElementById("global-header").innerHTML = header;

window.applyCityBackground();


/* ===================== */
/* MOBILE MENU */
/* ===================== */

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

hamburger.addEventListener("click", (e)=>{
  e.stopPropagation();
  mobileMenu.classList.toggle("active");
});

document.addEventListener("click", (e)=>{
  if(!mobileMenu.contains(e.target) && !hamburger.contains(e.target)){
    mobileMenu.classList.remove("active");
  }
});


/* ===================== */
/* ACTIVE LINK */
/* ===================== */

const currentPath = window.location.pathname;

document.querySelectorAll(".portal-nav a").forEach(link=>{
  const href = link.getAttribute("href");
  if(currentPath.startsWith(href)){
    link.classList.add("active");
  }
});

});
