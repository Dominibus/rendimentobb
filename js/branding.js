document.addEventListener("DOMContentLoaded", () => {

document.querySelectorAll(".rb-logo").forEach(el=>{
el.innerHTML = `
<a href="/" class="logo-link">
<img src="/img/logo-main.png" alt="RendimentoBB" class="logo-img">
</a>`;
});

});
