/* ===================== */
/* RENDIMENTOBB HEADER FINAL */
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

      <!-- TOP -->
      <div class="rb-top">

        <div class="rb-left">
          <a href="/">
            <img src="/img/logo-main.png" class="rb-logo">
          </a>
        </div>

        <div id="user-area"></div>

      </div>

      <!-- BOTTOM -->
      <div class="rb-bottom">

        <div class="rb-actions">

          <a href="/dashboard/" class="rb-btn main-btn">
            Dashboard
          </a>

          <div class="rb-lang">
            <button data-lang="it">IT</button>
            <button data-lang="en">EN</button>
          </div>

          <button id="rb-burger">☰</button>

        </div>

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
      const mobileEl = document.getElementById("mobile-user-area");

      if(!el) return;

      const ADMIN_EMAILS = ["rendimentobb@gmail.com"];
      const isAdmin = ADMIN_EMAILS.includes(user?.email);

      const isPro =
        window.currentPlan === "pro" ||
        window.currentPlan === "investor" ||
        window.currentPlan === "pro_yearly";

      if(user){

        const email = user.email || "";
        const isMobile = window.innerWidth < 768;

        let html = `<div class="rb-user">`;

        if(!isMobile){
          html += `<span class="rb-email">${email}</span>`;
        }else{
          html += `<span>👤</span>`;
        }

        if(isPro || isAdmin){
          html += `<a href="/dashboard/" class="rb-btn">Dashboard</a>`;
        }

        html += `<button id="logout" class="rb-btn red">Logout</button>`;

        html += `</div>`;

        el.innerHTML = html;

        if(mobileEl){
          mobileEl.innerHTML = `
            <div class="rb-mobile-user">
              <div>${email}</div>
              <a href="/dashboard/">Dashboard</a>
              <button id="logout-mobile">Logout</button>
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

    });

  },100);

}
