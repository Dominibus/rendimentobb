document.addEventListener("DOMContentLoaded", () => {

const footer = `

<footer class="global-footer">

<div class="footer-container">

<!-- 🔥 TOP CTA -->
<div class="footer-cta">

<h3
data-it="Scopri se il tuo investimento è profittevole"
data-en="Find out if your investment is profitable">
Scopri se il tuo investimento è profittevole
</h3>

<p
data-it="Simula ROI, rischio e rendimento in meno di 30 secondi"
data-en="Simulate ROI, risk and profit in under 30 seconds">
Simula ROI, rischio e rendimento in meno di 30 secondi
</p>

<a href="/tool/" class="btn btn-primary"
data-it="Avvia simulazione"
data-en="Start simulation">
Avvia simulazione
</a>

</div>

<!-- 🔥 GRID -->
<div class="footer-grid">

<!-- BRAND -->
<div class="footer-col">
<strong>RendimentoBB</strong>

<p
data-it="Motore decisionale per investimenti B&B basato su dati reali."
data-en="Decision engine for B&B investments based on real data.">
Motore decisionale per investimenti B&B basato su dati reali.
</p>

</div>

<!-- GUIDE -->
<div class="footer-col">

<strong
data-it="Guide"
data-en="Guides">
Guide
</strong>

<a href="/aprire-bnb-conviene/"
data-it="Aprire un B&B"
data-en="Start a B&B">
Aprire un B&B
</a>

<a href="/quanto-guadagna-bnb/"
data-it="Guadagni B&B"
data-en="B&B earnings">
Guadagni B&B
</a>

<a href="/costi-aprire-bnb/"
data-it="Costi B&B"
data-en="B&B costs">
Costi B&B
</a>

<a href="/roi-bnb/"
data-it="ROI B&B"
data-en="B&B ROI">
ROI B&B
</a>

</div>

<!-- PRODUCT -->
<div class="footer-col">

<strong
data-it="Strumenti"
data-en="Tools">
Strumenti
</strong>

<a href="/tool/"
data-it="Simulatore ROI"
data-en="ROI Simulator">
Simulatore ROI
</a>

<a href="/dashboard/"
data-it="Dashboard"
data-en="Dashboard">
Dashboard
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

</div>

<!-- BUSINESS (🔥 NUOVO MONETIZATION) -->
<div class="footer-col">

<strong
data-it="Business"
data-en="Business">
Business
</strong>

<a href="/partner/"
data-it="Diventa Partner"
data-en="Become a Partner">
Diventa Partner
</a>

<a href="/lavora-con-noi/"
data-it="Lavora con noi"
data-en="Work with us">
Lavora con noi
</a>

</div>

<!-- LEGAL -->
<div class="footer-col">

<strong
data-it="Legale"
data-en="Legal">
Legale
</strong>

<a href="/privacy.html"
data-it="Privacy"
data-en="Privacy">
Privacy
</a>

<a href="/terms.html"
data-it="Termini"
data-en="Terms">
Termini
</a>

<a href="/contact.html"
data-it="Contatti"
data-en="Contact">
Contatti
</a>

</div>

</div>

<!-- 🔥 TRUST BAR -->
<div class="footer-trust">

<span
data-it="🔥 +1.200 investitori attivi"
data-en="🔥 1,200+ active investors">
🔥 +1.200 investitori attivi
</span>

<span
data-it="✔ Analisi basate su dati reali"
data-en="✔ Data-driven analysis">
✔ Analisi basate su dati reali
</span>

<span
data-it="✔ ROI fino al 18%"
data-en="✔ ROI up to 18%">
✔ ROI fino al 18%
</span>

</div>

<!-- 🔥 EXTRA CTA (MONETIZATION BOOST) -->
<div style="text-align:center; margin-top:20px;">

<p
data-it="Sei una banca o agenzia? Ricevi clienti pronti a investire."
data-en="Are you a bank or agency? Get clients ready to invest.">
Sei una banca o agenzia? Ricevi clienti pronti a investire.
</p>

<a href="/partner/" class="btn btn-secondary"
data-it="Diventa partner"
data-en="Become partner">
Diventa partner
</a>

</div>

<!-- 🔥 COPYRIGHT -->
<div class="footer-bottom">

<p
data-it="© 2026 RendimentoBB – Tutti i diritti riservati"
data-en="© 2026 RendimentoBB – All rights reserved">
© 2026 RendimentoBB – Tutti i diritti riservati
</p>

</div>

</div>

</footer>

`;

document.body.insertAdjacentHTML("beforeend", footer);

/* 🔥 TRADUZIONE IMMEDIATA */
if(typeof applyStaticTranslations === "function"){
applyStaticTranslations();
}

/* 🔥 SYNC LINGUA DINAMICA */
document.addEventListener("rb_language_changed", () => {
if(typeof applyStaticTranslations === "function"){
applyStaticTranslations();
}
});

});
