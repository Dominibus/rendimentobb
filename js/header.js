/* ===================== */
/* FIREBASE */
/* ===================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* ===================== */
/* HERO BACKGROUND */
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

<!-- LEFT -->
<div class="header-left">
  <a href="/">
    <img src="/img/logo-main.png" class="logo-img">
  </a>
</div>

<!-- NAV DESKTOP -->
<nav class="portal-nav desktop-nav">
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

window.applyCityBackground();


/* ===================== */
/* MOBILE MENU */
/* ===================== */

const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

if(hamburger && mobileMenu){

  hamburger.addEventListener("click", (e)=>{
    e.stopPropagation();
    mobileMenu.classList.toggle("active");
  });

  document.addEventListener("click", (e)=>{
    if(!mobileMenu.contains(e.target) && !hamburger.contains(e.target)){
      mobileMenu.classList.remove("active");
    }
  });

}


/* ===================== */
/* ACTIVE LINK */
/* ===================== */

const currentPath = window.location.pathname;

document.querySelectorAll(".portal-nav a, .mobile-menu a").forEach(link=>{
  const href = link.getAttribute("href");
  if(href !== "/" && currentPath.startsWith(href)){
    link.classList.add("active");
  }
});


/* ===================== */
/* TRANSLATION */
/* ===================== */

setTimeout(()=>{
  if(typeof applyTranslations === "function"){
    applyTranslations();
  }
},50);

});


/* ===================== */
/* USER AREA (FINAL FIX) */
/* ===================== */

onAuthStateChanged(auth, (user)=>{

const userArea = document.getElementById("user-area");
if(!userArea) return;

const isMobile = window.innerWidth < 768;

const render = () => {

  const isAdmin = window.isAdmin?.();

  if(user){

    let html = `<div style="display:flex;align-items:center;gap:8px;">`;

    // 👤 Nome (solo desktop)
    if(!isMobile){
      html += `<span style="font-size:13px;color:#64748b;">${user.email}</span>`;
    }

    // 📊 Dashboard
    html += `
      <a href="/dashboard/" class="btn btn-secondary">
        ${isMobile ? "📊" : "Dashboard"}
      </a>
    `;

    // 💰 Admin
    if(isAdmin){
      html += `
        <a href="/dashboard-leads/" class="btn btn-primary">
          ${isMobile ? "💰" : "Leads"}
        </a>
      `;
    }

    // 🚪 Logout
    html += `
      <button id="logout-btn" class="btn btn-danger">
        ${isMobile ? "🚪" : "Logout"}
      </button>
    `;

    html += `</div>`;

    userArea.innerHTML = html;

    // logout event
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

  } else {

    userArea.innerHTML = `
      <a href="/login/" class="login-btn">Accedi</a>
    `;

  }

};


// WAIT FIREBASE
let tries = 0;

const interval = setInterval(()=>{

  if(window.firebaseReady || tries > 10){
    clearInterval(interval);
    render();
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
