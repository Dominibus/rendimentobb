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
/* INIT HEADER */
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

<!-- NAV DESKTOP -->
<nav class="portal-nav desktop-nav">

<a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>
<a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">Aprire un B&B</a>
<a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>
<a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>
<a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>
<a href="/dashboard/" data-it="Dashboard" data-en="Dashboard">Dashboard</a>
<a href="/contact.html" data-it="Contatti" data-en="Contact">Contatti</a>

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

<!-- MOBILE MENU -->
<div class="mobile-menu" id="mobileMenu">

<a href="/tool/">Simulatore</a>
<a href="/aprire-bnb-conviene/">Aprire un B&B</a>
<a href="/mutui/">Mutui</a>
<a href="/immobili/">Immobili</a>
<a href="/academy/">Academy</a>
<a href="/dashboard/">Dashboard</a>
<a href="/contact.html">Contatti</a>

</div>

</header>
`;

const container = document.getElementById("global-header");
if(container){
  container.innerHTML = header;
}

/* HERO */
window.applyCityBackground();

/* ===================== */
/* MENU MOBILE FIX VERO */
/* ===================== */

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

if(hamburger && mobileMenu){

  hamburger.addEventListener("click", (e)=>{
    e.preventDefault();
    e.stopPropagation();

    mobileMenu.classList.toggle("active");

    console.log("MENU TOGGLE:", mobileMenu.classList.contains("active"));
  });

  // chiusura click fuori
  document.addEventListener("click", (e)=>{
    if(!mobileMenu.contains(e.target) && !hamburger.contains(e.target)){
      mobileMenu.classList.remove("active");
    }
  });

}

/* ACTIVE LINK */
const currentPath = window.location.pathname;

document.querySelectorAll(".portal-nav a, .mobile-menu a").forEach(link=>{
  const href = link.getAttribute("href");
  if(href !== "/" && currentPath.startsWith(href)){
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
/* USER AREA FIX DEFINITIVO */
/* ===================== */

onAuthStateChanged(auth, (user)=>{

const userArea = document.getElementById("user-area");
if(!userArea) return;

const isMobile = window.innerWidth < 768;

// 🔥 aspetta Firebase + piano
const renderUser = () => {

  const isAdmin = window.isAdmin?.();

  // ================= LOGGATO =================
  if(user){

    const userName = user.email || "User";

    let html = `
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
    `;

    // 👤 Nome (solo desktop)
    if(!isMobile){
      html += `
        <span style="font-size:12px;color:#64748b;">
          ${userName}
        </span>
      `;
    }

    // 📊 Dashboard
    html += `
      <a href="/dashboard/" class="btn btn-secondary" style="padding:6px 10px;font-size:12px;">
        ${isMobile ? "📊" : "Dashboard"}
      </a>
    `;

    // 💰 ADMIN ONLY → LEADS
    if(isAdmin){
      html += `
        <a href="/dashboard-leads/" class="btn btn-primary" style="padding:6px 10px;font-size:12px;">
          ${isMobile ? "💰" : "Leads"}
        </a>
      `;
    }

    // 🚪 LOGOUT
    html += `
      <button id="logout-btn" class="btn btn-danger" style="padding:6px 10px;font-size:12px;">
        ${isMobile ? "🚪" : "Logout"}
      </button>
    `;

    html += `</div>`;

    userArea.innerHTML = html;

    // 🔥 LOGOUT EVENT
    setTimeout(()=>{
      const btn = document.getElementById("logout-btn");
      if(btn){
        btn.addEventListener("click", ()=>{
          import("https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js")
          .then(({ signOut })=>{
            signOut(auth).then(()=>{
              window.location.href = "/";
            });
          });
        });
      }
    },50);

  }

  // ================= NON LOGGATO =================
  else{

    userArea.innerHTML = `
      <a href="/login/" class="login-btn">Accedi</a>
    `;

  }

};


// 🔥 WAIT FIREBASE READY
let tries = 0;

const interval = setInterval(()=>{

  if(window.firebaseReady || tries > 10){
    clearInterval(interval);
    renderUser();
  }

  tries++;

},100);

});

/* ===================== */
/* LANG SYNC */
/* ===================== */

document.addEventListener("rb_language_changed", ()=>{
  if(typeof applyTranslations === "function"){
    applyTranslations();
  }
});
