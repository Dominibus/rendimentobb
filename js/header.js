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
          <button class="lang-btn" data-lang="it">IT</button>
          <button class="lang-btn" data-lang="en">EN</button>
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

  window.applyCityBackground();

  initHeaderInteractions();
  highlightActiveLink();

});


/* ===================== */
/* INTERAZIONI HEADER */
/* ===================== */

function initHeaderInteractions(){

  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if(hamburger && mobileMenu){

    hamburger.onclick = (e)=>{
      e.preventDefault();
      e.stopPropagation();
      mobileMenu.classList.toggle("active");
    };

    document.addEventListener("click", (e)=>{
      if(!mobileMenu.contains(e.target) && !hamburger.contains(e.target)){
        mobileMenu.classList.remove("active");
      }
    });
  }

  // ===== LANGUAGE =====
  document.querySelectorAll(".lang-btn").forEach(btn=>{
    btn.onclick = ()=>{
      const lang = btn.dataset.lang;

      if(window.setLang){
        window.setLang(lang);
      }

      localStorage.setItem("rb_lang", lang);
      location.reload();
    };
  });

}


/* ===================== */
/* ACTIVE LINK */
/* ===================== */

function highlightActiveLink(){

  const currentPath = window.location.pathname;

  document.querySelectorAll(".portal-nav a, .mobile-menu a").forEach(link=>{
    const href = link.getAttribute("href");
    if(href !== "/" && currentPath.startsWith(href)){
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

  /* ===== ADMIN MENU LINK ===== */
  if(isAdmin && nav && !document.getElementById("admin-link")){

    const link = document.createElement("a");

    link.href = "/dashboard-leads/";
    link.id = "admin-link";
    link.innerText = "Leads";

    link.style.color = "#10b981";
    link.style.fontWeight = "600";

    nav.appendChild(link);
  }

  /* ===== USER ===== */
  if(user){

    let html = `<div style="display:flex;align-items:center;gap:8px;">`;

    if(!isMobile){
      html += `<span style="font-size:13px;color:#64748b;">${user.email}</span>`;
    }

    html += `
      <a href="/dashboard/" class="btn btn-secondary">
        ${isMobile ? "📊" : "Dashboard"}
      </a>
    `;

    html += `
      <button id="logout-btn" class="btn btn-danger">
        ${isMobile ? "🚪" : "Logout"}
      </button>
    `;

    html += `</div>`;

    userArea.innerHTML = html;

    const btn = document.getElementById("logout-btn");

    if(btn){
      btn.onclick = async ()=>{
        const { signOut } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js");
        await signOut(auth);
        location.reload();
      };
    }

  } else {

    userArea.innerHTML = `<a href="/login/" class="login-btn">Accedi</a>`;

  }

});
