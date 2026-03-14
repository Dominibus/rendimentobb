document.addEventListener("DOMContentLoaded", () => {

const logos = document.querySelectorAll(".rb-logo");

logos.forEach(el => {

el.innerHTML = `
<a href="/" class="logo-link">
<img src="/img/logo-main.png"
alt="RendimentoBB"
style="height:34px;">
</a>
`;

});

});
