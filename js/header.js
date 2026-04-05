/* ===================== */
/* HEADER ULTRA PRO FINAL */
/* ===================== */

import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("global-header");
  if(!container) return;

  container.innerHTML = `

  <header class="rb-header">

    <div class="rb-header-inner">

      <!-- LEFT -->
      <div class="rb-left">
        <a href="/" class="rb-logo">
          <img src="/img/logo-main.png" alt="RendimentoBB">
        </a>
      </div>

      <!-- CENTER DESKTOP -->
      <nav class="rb-nav">
        <a href="/tool/">Simulatore</a>
        <a href="/aprire-bnb-conviene/">Aprire un B&B</a>
        <a href="/mutui/">Mutui</a>
        <a href="/immobili/">Immobili</a>
        <a href="/academy/">Academy</a>
        <a href="/contact.html">Contatti</a>
      </nav>

      <!-- RIGHT -->
      <div class="rb-right">

        <div id="user-area"></div>

        <div class="rb-lang">
          <button data-lang="it">IT</button>
          <button data-lang="en">EN</button>
        </div>

        <button class="rb-burger" id="rb-burger">
          ☰
        </button>

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

  initHeader();
  initUser();

});


/* ===================== */
/* HEADER LOGIC */
/* ===================== */

function initHeader(){

  const burger = document.getElementById("rb-burger");
  const mobile = document.getElementById("rb-mobile");

  burger.onclick = () => {
    mobile.classList.toggle("open");
  };

  document.addEventListener("click", (e)=>{
    if(!mobile.contains(e.target) && !burger.contains(e.target)){
      mobile.classList.remove("open");
    }
  });

  document.querySelectorAll(".rb-lang button").forEach(btn=>{
    btn.onclick = ()=>{
      localStorage.setItem("rb_lang", btn.dataset.lang);
      location.reload();
    };
  });

}


/* ===================== */
/* USER */
/* ===================== */

function initUser(){

  onAuthStateChanged(auth, (user)=>{

    const el = document.getElementById("user-area");

    if(!el) return;

    if(user){

      el.innerHTML = `
        <div class="rb-user">
          <span>${user.email.split("@")[0]}</span>
          <a href="/dashboard/">📊</a>
          <button id="logout">🚪</button>
        </div>
      `;

      document.getElementById("logout").onclick = async ()=>{
        await signOut(auth);
        location.reload();
      };

    } else {

      el.innerHTML = `<a href="/login/" class="rb-login">Accedi</a>`;

    }

  });

}
