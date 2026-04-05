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
/* INIT HEADER */
/* ===================== */

document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("global-header");
  if(!container) return;

  container.innerHTML = `
  <header class="portal-header">

    <div class="header-wrap">

      <!-- LOGO -->
      <div class="header-logo">
        <a href="/">
          <img src="/img/logo-main.png" class="logo-img">
        </a>
      </div>

      <!-- NAV DESKTOP -->
      <nav class="header-nav" id="main-nav">
        <a href="/tool/">Simulatore</a>
        <a href="/aprire-bnb-conviene/">Aprire un B&B</a>
        <a href="/mutui/">Mutui</a>
        <a href="/immobili/">Immobili</a>
        <a href="/academy/">Academy</a>
        <a href="/contact.html">Contatti</a>
      </nav>

      <!-- RIGHT -->
      <div class="header-actions">

        <div id="user-area"></div>

        <div class="lang-switch">
          <button class="lang-btn" data-lang="it">IT</button>
          <button class="lang-btn" data-lang="en">EN</button>
        </div>

        <button class="hamburger" id="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>

    </div>

    <!-- MOBILE MENU -->
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

  window.applyCityBackground();

  initHeader();
  highlightActiveLink();

});


/* ===================== */
/* HEADER CORE */
/* ===================== */

function initHeader(){

  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if(hamburger && mobileMenu){

    hamburger.onclick = (e)=>{
      e.stopPropagation();
      mobileMenu.classList.toggle("active");
      hamburger.classList.toggle("open");
    };

    document.addEventListener("click", (e)=>{
      if(!mobileMenu.contains(e.target) && !hamburger.contains(e.target)){
        mobileMenu.classList.remove("active");
        hamburger.classList.remove("open");
      }
    });
  }

  document.querySelectorAll(".lang-btn").forEach(btn=>{
    btn.onclick = ()=>{
      const lang = btn.dataset.lang;
      localStorage.setItem("rb_lang", lang);
      location.reload();
    };
  });

}


/* ===================== */
/* ACTIVE LINK */
/* ===================== */

function highlightActiveLink(){

  const path = window.location.pathname;

  document.querySelectorAll(".header-nav a, .mobile-menu a").forEach(link=>{
    const href = link.getAttribute("href");
    if(href !== "/" && path.startsWith(href)){
      link.classList.add("active");
    }
  });

}


/* ===================== */
/* USER AREA */
/* ===================== */

onAuthStateChanged(auth, (user)=>{

  const userArea = document.getElementById("user-area");
  if(!userArea) return;

  const isMobile = window.innerWidth < 768;

  if(user){

    userArea.innerHTML = `
      <div class="user-box">
        ${!isMobile ? `<span class="user-email">${user.email}</span>` : ""}
        <a href="/dashboard/" class="btn-mini">📊</a>
        <button id="logout-btn" class="btn-mini">🚪</button>
      </div>
    `;

    document.getElementById("logout-btn").onclick = async ()=>{
      const { signOut } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js");
      await signOut(auth);
      location.reload();
    };

  } else {

    userArea.innerHTML = `<a href="/login/" class="login-btn">Accedi</a>`;

  }

});
