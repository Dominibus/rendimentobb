document.addEventListener("DOMContentLoaded", () => {

const logos = document.querySelectorAll(".rb-logo");

logos.forEach(el => {

el.innerHTML = `
<img src="/img/logo-report.png"
alt="RendimentoBB"
style="height:32px;">
`;

});

});
