await resend.emails.send({
  from: "RendimentoBB <analisi@rendimentobb.it>",
  to: [email],
  subject: `💰 Il tuo investimento può rendere ${roiRounded}%`,
  html: `
<div style="font-family:Inter,Arial;background:#f1f5f9;padding:40px">

  <div style="max-width:640px;margin:auto;background:white;border-radius:20px;padding:35px">

    <div style="text-align:center">
      <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
    </div>

    <h2 style="text-align:center;margin-top:20px">
      Analisi investimento
    </h2>

    <div style="text-align:center;margin:30px 0">
      <div style="font-size:50px;color:#10b981;font-weight:800">
        ${roiRounded}%
      </div>
      <div style="color:#64748b">ROI stimato</div>
    </div>

    <div style="background:#fff7ed;padding:16px;border-radius:12px">
      ⚠️ Il ROI da solo non basta: mutuo, rischio e occupazione cambiano tutto
    </div>

    <ul style="margin-top:20px">
      <li>Profitto reale</li>
      <li>Break-even</li>
      <li>Analisi rischio</li>
      <li>Scenario completo</li>
    </ul>

    <div style="text-align:center;margin:35px 0">
      <a href="https://rendimentobb.it/dashboard"
      style="background:#10b981;color:white;padding:16px 26px;border-radius:999px;text-decoration:none;font-weight:700">
      🔥 Sblocca analisi completa
      </a>
    </div>

  </div>
</div>
`
});
