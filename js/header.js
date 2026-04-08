/* ===================== */
/* RENDIMENTOBB HEADER – FINAL STABLE */
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

      <!-- LEFT -->
      <div class="rb-left">
        <a href="/"><img src="/img/logo-main.png" class="rb-logo"></a>
      </div>

      <!-- CENTER -->
      <nav class="rb-center">
        <a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>
        <a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">Aprire un B&B</a>
        <a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>
        <a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>
        <a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>
      </nav>

      <!-- RIGHT -->
      <div class="rb-right">

        <div class="rb-lang">
          <button data-lang="it">IT</button>
          <button data-lang="en">EN</button>
        </div>

        <div id="user-area"></div>

        <button id="rb-burger">☰</button>

      </div>

    </div>

    <!-- MOBILE MENU -->
    <div class="rb-mobile" id="rb-mobile">

      <div id="mobile-user-area"></div>

      <a href="/tool/">Simulatore</a>
      <a href="/aprire-bnb-conviene/">Aprire un B&B</a>
      <a href="/mutui/">Mutui</a>
      <a href="/immobili/">Immobili</a>
      <a href="/academy/">Academy</a>

    </div>

  </header>
  `;

  window.applyCityBackground();
  initHeaderInteractions();

  onAuthStateChanged(auth, (user) => {
    waitPlanAndRender(user);
  });

});


/* ===================== */
/* WAIT PLAN */
/* ===================== */

function waitPlanAndRender(user){

  let attempts = 0;

  const interval = setInterval(()=>{

    attempts++;

    const plan = window.currentPlan;
    const role = window.userRole;

    const ready =
      (typeof plan === "string" && plan.length > 0) ||
      (typeof role === "string" && role.length > 0);

    if(ready || attempts > 20){
      clearInterval(interval);
      renderUser(user);
    }

  },120);

}


/* ===================== */
/* INTERACTIONS */
/* ===================== */

function initHeaderInteractions(){

  const burger = document.getElementById("rb-burger");
  const mobile = document.getElementById("rb-mobile");

  if(burger && mobile){

    // ===== TOGGLE MENU =====
    burger.onclick = (e)=>{
      e.stopPropagation();
      mobile.classList.toggle("open");
    };

    // ===== CLICK LINK → CHIUDE MENU =====
    mobile.querySelectorAll("a").forEach(link=>{
      link.onclick = ()=>{
        mobile.classList.remove("open");
      };
    });

    // ===== CLICK FUORI → CHIUDE =====
    document.addEventListener("click",(e)=>{

      // se clicchi dentro menu o burger → non chiudere
      if(mobile.contains(e.target) || burger.contains(e.target)){
        return;
      }

      mobile.classList.remove("open");

    });

  }

  // ===== LANGUAGE =====
  document.querySelectorAll(".rb-lang button").forEach(btn=>{
    btn.onclick = ()=>{
      const lang = btn.dataset.lang;
      localStorage.setItem("rb_lang", lang);
      if(window.setLang) window.setLang(lang);
      updateLangButtons(lang);
    };
  });

  updateLangButtons(localStorage.getItem("rb_lang") || "it");
}


function updateLangButtons(lang){
  document.querySelectorAll(".rb-lang button").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}


/* ===================== */
/* RENDER USER */
/* ===================== */

function renderUser(user){

  const el = document.getElementById("user-area");
  const mobileEl = document.getElementById("mobile-user-area");

  if(!el) return;

  const clean = (v)=>String(v || "").toLowerCase().trim();

  const plan = clean(window.currentPlan);
  const role = clean(window.userRole);

  const isAdmin =
    user?.email === "rendimentobb@gmail.com" ||
    role === "admin";

  const isPro =
    isAdmin ||
    plan === "pro" ||
    plan === "investor" ||
    plan === "pro_yearly";

  // ===== LOGGED =====
  if(user){

    let html = `<div class="rb-user">`;

    if(isPro){
      html += `<a href="/dashboard/" class="rb-btn primary">Dashboard</a>`;
    }

    if(isAdmin){
      html += `<a href="/dashboard-leads/" class="rb-btn leads">Leads</a>`;
    }

    html += `<button id="logout" class="rb-btn red">Logout</button>`;
    html += `</div>`;

    el.innerHTML = html;

    if(mobileEl){

      let m = `<div class="rb-mobile-user">`;

      if(isPro){
        m += `<a href="/dashboard/" class="rb-btn primary">Dashboard</a>`;
      }

      if(isAdmin){
        m += `<a href="/dashboard-leads/" class="rb-btn">Leads</a>`;
      }

      m += `<button id="logout-mobile" class="rb-btn red">Logout</button></div>`;

      mobileEl.innerHTML = m;
    }

    document.querySelectorAll("#logout, #logout-mobile").forEach(btn=>{
      btn.onclick = async ()=>{
        await signOut(auth);
        location.reload();
      };
    });

  }

  // ===== NOT LOGGED =====
  else{

    el.innerHTML = `
      <a href="/login/" class="rb-login">Accedi</a>
    `;
  }

}
