await resend.emails.send({
  from: "RendimentoBB Leads <lead@rendimentobb.it>",
  to: ["rendimentobb@gmail.com"],
  subject: `🔥 ${priority} Investment Opportunity (${roiRounded}%)`,
  html: `
<div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

  <div style="max-width:620px;margin:auto;background:#fff;border-radius:20px;padding:35px">

    <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">

    <h2 style="margin-top:20px">🔥 Investment Lead</h2>

    <div style="font-size:44px;color:#10b981;font-weight:800;margin:20px 0">
      ${roiRounded}%
    </div>

    <p><b>Email:</b> ${email}</p>
    <p><b>City:</b> ${city}</p>

    <a href="mailto:${email}"
    style="display:inline-block;margin-top:20px;background:#10b981;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
    Contatta subito
    </a>

  </div>
</div>
`
});
