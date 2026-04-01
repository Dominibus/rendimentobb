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

<!-- SEO LINKS -->
<div class="footer-col">

<strong
data-it="Guide"
data-en="Guides">
Guide
</strong>

<a href="/aprire-bnb-conviene/">Aprire un B&B</a>
<a href="/quanto-guadagna-bnb/">Guadagni B&B</a>
<a href="/costi-aprire-bnb/">Costi B&B</a>
<a href="/roi-bnb/">ROI B&B</a>

</div>

<!-- PRODUCT -->
<div class="footer-col">

<strong
data-it="Strumenti"
data-en="Tools">
Strumenti
</strong>

<a href="/tool/">Simulatore ROI</a>
<a href="/dashboard/">Dashboard</a>
<a href="/mutui/">Mutui</a>
<a href="/immobili/">Immobili</a>

</div>

<!-- LEGAL -->
<div class="footer-col">

<strong>Legal</strong>

<a href="/privacy.html">Privacy</a>
<a href="/terms.html">Termini</a>
<a href="/contact.html">Contatti</a>

</div>

</div>

<!-- 🔥 TRUST BAR -->
<div class="footer-trust">

<span>🔥 +1.200 investitori attivi</span>
<span>✔ Analisi basate su dati reali</span>
<span>✔ ROI fino al 18%</span>

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

/* 🔥 TRADUZIONI */
if(typeof applyStaticTranslations === "function"){
applyStaticTranslations();
}

});
