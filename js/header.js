/* ===================== */
/* RENDIMENTOBB HEADER ULTRA SAAS – FINAL */
/* ===================== */

import { auth } from "/js/firebase-init.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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

      <div class="rb-left">
        <a href="/">
          <img src="/img/logo-main.png" class="rb-logo">
        </a>
      </div>

      <nav class="rb-center">
        <a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>
        <a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">Aprire un B&B</a>
        <a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>
        <a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>
        <a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>
      </nav>

      <div class="rb-right">

        <div class="rb-lang">
          <button data-lang="it">IT</button>
          <button data-lang="en">EN</button>
        </div>

        <div id="user-area"></div>

        <button id="rb-burger">☰</button>

      </div>

    </div>

    <div class="rb-mobile" id="rb-mobile">
      <div id="mobile-user-area"></div>

      <a href="/tool/" data-it="Simulatore" data-en="Simulator">Simulatore</a>
      <a href="/aprire-bnb-conviene/" data-it="Aprire un B&B" data-en="Start a B&B">Aprire un B&B</a>
      <a href="/mutui/" data-it="Mutui" data-en="Mortgages">Mutui</a>
      <a href="/immobili/" data-it="Immobili" data-en="Properties">Immobili</a>
      <a href="/academy/" data-it="Academy" data-en="Academy">Academy</a>
    </div>

  </header>
  `;

  window.applyCityBackground();
  initHeaderInteractions();

  // prima render (utente non pronto)
  renderUser(null);

  // 🔥 quando auth pronta
  document.addEventListener("rb_auth_ready", () => {
    renderUser(window.currentUser);
  });

  // 🔥 quando piano pronto (QUESTO È IL FIX)
  document.addEventListener("rb_plan_ready", () => {
    renderUser(window.currentUser);
  });

  if(window.setLang){
    window.setLang(localStorage.getItem("rb_lang") || "it");
  }

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
    role === "admin" ||
    user?.email === "rendimentobb@gmail.com";

  const isPro =
    isAdmin ||
    plan === "pro" ||
    plan === "investor" ||
    plan === "pro_yearly";

  console.log("HEADER FINAL →", {
    email:user?.email,
    plan,
    role,
    isAdmin,
    isPro
  });

  // ===============================
  // LOGGATO
  // ===============================

  if(user){

    const email = user.email;

    let html = `<div class="rb-user">`;
    html += `<span class="rb-email">${email}</span>`;

    if(isPro){
      html += `<a href="/dashboard/" class="rb-btn">Dashboard</a>`;
    }

    if(isAdmin){
      html += `<a href="/dashboard-leads/" class="rb-btn">Leads</a>`;
    }

    html += `<button id="logout" class="rb-btn red">Logout</button>`;
    html += `</div>`;

    el.innerHTML = html;

    // MOBILE
    if(mobileEl){

      let m = `<div class="rb-mobile-user">
        <div class="rb-email">${email}</div>`;

      if(isPro){
        m += `<a href="/dashboard/" class="rb-btn">Dashboard</a>`;
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

  } else {

    el.innerHTML = `
      <a href="/login/" class="rb-login"
      data-it="Accedi"
      data-en="Login">Accedi</a>
    `;

  }

  if(window.setLang){
    window.setLang(localStorage.getItem("rb_lang") || "it");
  }

}
