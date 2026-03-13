document.addEventListener("DOMContentLoaded", () => {

const footer = `

<footer class="global-footer">

<p
data-it="© 2026 RendimentoBB – Motore decisionale per investimenti B&B"
data-en="© 2026 RendimentoBB – B&B investment decision engine">
© 2026 RendimentoBB – Motore decisionale per investimenti B&B
</p>

<div class="footer-links">

<a href="/aprire-bnb-conviene/"
data-it="Aprire un B&B conviene?"
data-en="Is opening a B&B profitable?">
Aprire un B&B conviene?
</a>

<a href="/quanto-guadagna-bnb/"
data-it="Quanto guadagna un B&B?"
data-en="How much does a B&B earn?">
Quanto guadagna un B&B?
</a>

<a href="/costi-aprire-bnb/"
data-it="Costi per aprire un B&B"
data-en="Costs to open a B&B">
Costi per aprire un B&B
</a>

<a href="/roi-bnb/"
data-it="ROI di un B&B"
data-en="B&B ROI">
ROI di un B&B
</a>

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

</footer>

`;

document.body.insertAdjacentHTML("beforeend", footer);


/* 🔥 RIAPPLICA TRADUZIONI */

if(typeof applyStaticTranslations === "function"){
applyStaticTranslations();
}

});
