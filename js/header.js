/* ===================== */
/* RENDIMENTOBB HEADER FINAL CLEAN */
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
        <a href="/">
          <img src="/img/logo-main.png" class="rb-logo" alt="RendimentoBB">
        </a>
      </div>

      <!-- CENTER -->
      <div class="rb-center">
        <a href="/dashboard/">Dashboard</a>
        <a href="/tool/">Simulatore</a>
        <a href="/immobili/">Immobili</a>
        <a href="/academy/">Academy</a>
      </div>

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

      <a href="/dashboard/">Dashboard</a>
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
/* USER AREA SAFE (ANTI-CRASH) */
/* ===================== */

function initUser(){

  let attempts = 0;

  const waitFirebase = setInterval(()=>{

    attempts++;

    // dopo 2 secondi procede comunque
    if(!window.firebaseReady && attempts < 20) return;

    clearInterval(waitFirebase);

    try{

      onAuthStateChanged(auth, (user)=>{
        renderUser(user);
      });

    }catch(e){
      console.warn("Firebase fallback");
      renderUser(null);
    }

  },100);

}


/* ===================== */
/* RENDER USER */
/* ===================== */

function renderUser(user){

  const el = document.getElementById("user-area");
  const mobileEl = document.getElementById("mobile-user-area");

  if(!el) return;

  if(user){

    const email = user.email || "";

    el.innerHTML = `
      <div class="rb-user">
        <span class="rb-email">${email}</span>
        <a href="/dashboard/" class="rb-btn">Dashboard</a>
        <button id="logout" class="rb-btn red">Logout</button>
      </div>
    `;

    if(mobileEl){
      mobileEl.innerHTML = `
        <div class="rb-mobile-user">
          <div class="rb-email">${email}</div>
          <a href="/dashboard/" class="rb-btn">Dashboard</a>
          <button id="logout-mobile" class="rb-btn red">Logout</button>
        </div>
      `;
    }

    document.querySelectorAll("#logout, #logout-mobile").forEach(btn=>{
      btn.onclick = async ()=>{
        await signOut(auth);
        location.reload();
      };
    });

  } else {

    el.innerHTML = `<a href="/login/" class="rb-login">Accedi</a>`;

  }

}
