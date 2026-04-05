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

    <div class="portal-header-inner">

      <!-- LEFT -->
      <div class="header-left">
        <a href="/">
          <img src="/img/logo-main.png" class="logo-img">
        </a>
      </div>

      <!-- CENTER NAV (DESKTOP) -->
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

  /* ===== MOBILE MENU ===== */
  if(hamburger && mobileMenu){

    hamburger.addEventListener("click", (e)=>{
      e.stopPropagation();
      hamburger.classList.toggle("open");
      mobileMenu.classList.toggle("active");
    });

    document.addEventListener("click", (e)=>{
      if(!mobileMenu.contains(e.target) && !hamburger.contains(e.target)){
        mobileMenu.classList.remove("active");
        hamburger.classList.remove("open");
      }
    });
  }

  /* ===== LANGUAGE ===== */
  document.querySelectorAll(".lang-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const lang = btn.dataset.lang;

      localStorage.setItem("rb_lang", lang);

      if(window.setLang){
        window.setLang(lang);
      }

      location.reload();
    });
  });

}


/* ===================== */
/* ACTIVE LINK */
/* ===================== */

function highlightActiveLink(){

  const path = window.location.pathname;

  document.querySelectorAll(".portal-nav a, .mobile-menu a").forEach(link=>{
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
  const nav = document.getElementById("main-nav");

  if(!userArea) return;

  const isMobile = window.innerWidth < 768;

  const ADMIN_EMAILS = ["rendimentobb@gmail.com"];

  const isAdmin =
    ADMIN_EMAILS.includes(user?.email) ||
    window.isAdmin?.();

  /* ADMIN LINK */
  if(isAdmin && nav && !document.getElementById("admin-link")){
    const link = document.createElement("a");
    link.href = "/dashboard-leads/";
    link.id = "admin-link";
    link.innerText = "Leads";
    link.style.color = "#10b981";
    link.style.fontWeight = "600";
    nav.appendChild(link);
  }

  if(user){

    userArea.innerHTML = `
      <div class="user-box">
        ${!isMobile ? `<span class="user-email">${user.email}</span>` : ""}
        <a href="/dashboard/" class="btn btn-secondary">📊</a>
        <button id="logout-btn" class="btn btn-danger">🚪</button>
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
