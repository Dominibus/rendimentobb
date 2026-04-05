/* ===================== */
/* RENDIMENTOBB HEADER PRO */
/* ===================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

/* ===================== */
/* HERO BG */
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
  <header class="rb-header">

    <div class="rb-inner">

      <!-- LOGO -->
      <div class="rb-left">
        <a href="/">
          <img src="/img/logo-main.png" class="rb-logo">
        </a>
      </div>

      <!-- NAV -->
      <nav class="rb-nav" id="rb-nav">
        <a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>
        <a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">Aprire un B&B</a>
        <a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>
        <a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>
        <a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>
        <a href="/contact.html" data-it="Contatti" data-en="Contacts">Contatti</a>
      </nav>

      <!-- RIGHT -->
      <div class="rb-right">

        <div id="user-area"></div>

        <div class="rb-lang">
          <button data-lang="it">IT</button>
          <button data-lang="en">EN</button>
        </div>

        <button id="rb-burger">☰</button>

      </div>

    </div>

    <!-- MOBILE MENU -->
    <div class="rb-mobile" id="rb-mobile">
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
  initUser();

});


/* ===================== */
/* INTERACTIONS */
/* ===================== */

function initHeaderInteractions(){

  const burger = document.getElementById("rb-burger");
  const mobile = document.getElementById("rb-mobile");

  if(burger && mobile){

    burger.onclick = (e)=>{
      e.stopPropagation();
      mobile.classList.toggle("open");
    };

    document.addEventListener("click",(e)=>{
      if(!mobile.contains(e.target) && !burger.contains(e.target)){
        mobile.classList.remove("open");
      }
    });
  }

  // lingua
  document.querySelectorAll(".rb-lang button").forEach(btn=>{
    btn.onclick = ()=>{
      const lang = btn.dataset.lang;
      localStorage.setItem("rb_lang", lang);

      if(window.setLang){
        window.setLang(lang);
      }else{
        location.reload();
      }
    };
  });

}


/* ===================== */
/* USER AREA */
/* ===================== */

function initUser(){

  const waitFirebase = setInterval(()=>{

    if(!window.firebaseReady) return;

    clearInterval(waitFirebase);

    onAuthStateChanged(auth, (user)=>{

      const el = document.getElementById("user-area");
      const nav = document.getElementById("rb-nav");

      if(!el) return;

      const ADMIN_EMAILS = ["rendimentobb@gmail.com"];
      const isAdmin = ADMIN_EMAILS.includes(user?.email);

      const isPro =
        window.currentPlan === "pro" ||
        window.currentPlan === "investor" ||
        window.currentPlan === "pro_yearly";

      /* ===== ADMIN LINK ===== */
      if(isAdmin && nav && !document.getElementById("admin-link")){
        const link = document.createElement("a");
        link.href = "/dashboard-leads/";
        link.id = "admin-link";
        link.innerText = "Leads";
       link.style.color = "#10b981";
      link.style.fontWeight = "600";
        nav.appendChild(link);
      }

      /* ===== ADMIN MOBILE LINK ===== */
if(isAdmin){
  const mobile = document.getElementById("rb-mobile");

  if(mobile && !document.getElementById("mobile-leads")){
    const link = document.createElement("a");
    link.href = "/dashboard-leads/";
    link.id = "mobile-leads";
    link.innerText = "Leads";
    mobile.appendChild(link);
  }
}

      /* ===== USER ===== */
      if(user){

        const email = user.email || "";

        let html = `<div class="rb-user">`;

        html += `<span class="rb-email">${email}</span>`;

        // 🔥 FIX: dashboard appare SOLO dopo plan corretto
        if(isPro || isAdmin){
          html += `<a href="/dashboard/" class="rb-btn">Dashboard</a>`;
        }

        html += `<button id="logout" class="rb-btn red">Logout</button>`;

        html += `</div>`;

        el.innerHTML = html;

        document.getElementById("logout").onclick = async ()=>{
          const { signOut } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js");
          await signOut(auth);
          location.reload();
        };

      } else {

        el.innerHTML = `<a href="/login/" class="rb-login">Accedi</a>`;

      }

    });

  },100);

}
