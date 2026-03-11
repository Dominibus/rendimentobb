document.addEventListener("DOMContentLoaded", () => {

const header = `

<header class="portal-header">

<div class="container portal-header-inner">

<div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">

<a href="/" style="text-decoration:none">
<div class="logo">Rendimento<span>BB</span></div>
</a>

<nav class="portal-nav">

<a href="/tool/"
data-it="Simulatore"
data-en="Simulator">
Simulatore
</a>

<a href="/aprire-bnb-conviene/"
data-it="Aprire un B&B"
data-en="Start a B&B">
Aprire un B&B
</a>

<a href="/mutui/"
data-it="Mutui"
data-en="Mortgages">
Mutui
</a>

<a href="/immobili/"
data-it="Immobili"
data-en="Properties">
Immobili
</a>

<a href="/academy/"
data-it="Academy"
data-en="Academy">
Academy
</a>

<a href="/dashboard/"
id="nav-dashboard"
style="display:none;"
data-it="Dashboard"
data-en="Dashboard">
Dashboard
</a>

<a href="/contact.html"
data-it="Contatti"
data-en="Contact">
Contatti
</a>

</nav>

</div>

<div class="right-controls">

<div class="lang-switch">

<button class="lang-btn" onclick="setLang('it')" id="btn-it">
IT
</button>

<button class="lang-btn" onclick="setLang('en')" id="btn-en">
EN
</button>

</div>

<div id="user-area"></div>

</div>

</div>

</header>

`;

document.body.insertAdjacentHTML("afterbegin", header);

});
