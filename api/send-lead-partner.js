import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res){

  // ================= METHOD =================
  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    // ================= BODY SAFE =================
    const body = req.body || {};

    let {
      email,
      city,
      roi,
      score,
      type,
      partners
    } = body;

    email = String(email || "").trim();
    city = String(city || "N/A");
    roi = Number(roi || 0);
    type = String(type || "simulatore");

    // ================= VALIDAZIONE =================
    if(!email){
      console.error("❌ Missing email");
      return res.status(400).json({ error:"Missing email" });
    }

    // 🔥 SOLO LEAD CALDI
    if(score !== "hot"){
      return res.status(200).json({ skip:true });
    }

    // ================= PARTNER LIST =================
    const recipients = Array.isArray(partners) && partners.length > 0
      ? partners
      : ["rendimentobb@gmail.com"];

    // ================= SUBJECT DINAMICO =================
    const subject = `🔥 Lead HOT ${city.toUpperCase()} – ROI ${roi}%`;

    // ================= TEMPLATE PRO (B2B) =================
    const html: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:40px 20px">

  <div style="max-width:620px;margin:auto;background:#ffffff;border-radius:18px;padding:30px;box-shadow:0 15px 40px rgba(0,0,0,0.08)">

    <!-- LOGO -->
    <div style="text-align:center;margin-bottom:25px">
      <img src="https://www.rendimentobb.it/img/logo-main.png" style="height:50px">
    </div>

    <!-- TITLE -->
    <h2 style="text-align:center;color:#0f172a">
      🔥 Lead ad altissimo valore
    </h2>

    <!-- ROI -->
    <div style="text-align:center;margin:25px 0">
      <div style="font-size:44px;font-weight:800;color:#10b981">
        ${roi}%
      </div>
      <div style="color:#64748b;font-size:14px">
        ROI stimato – ${city}
      </div>
    </div>

    <!-- INFO -->
    <div style="background:#f8fafc;padding:16px;border-radius:12px;margin:20px 0">

      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Città:</strong> ${city}</p>
      <p><strong>Tipo:</strong> ${type}</p>

    </div>

    <!-- ALERT -->
    <div style="background:#ecfdf5;padding:16px;border-radius:12px;margin:20px 0;font-size:14px;color:#065f46">
      💰 Alta probabilità di conversione
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:30px 0">
      <a href="mailto:${email}"
      style="background:linear-gradient(135deg,#10b981,#059669);
      color:white;
      padding:14px 24px;
      border-radius:999px;
      text-decoration:none;
      font-weight:700;
      display:inline-block">
      Contatta subito
      </a>
    </div>

    <!-- FOOTER -->
    <p style="font-size:12px;color:#94a3b8;text-align:center">
      Lead generato da RendimentoBB
    </p>

  </div>

</div>
`

    // ================= SEND =================
    const response = await resend.emails.send({
      from: "RendimentoBB <lead@rendimentobb.it>",
      to: recipients,
      subject,
      html
    });

    console.log("💰 Lead monetizzato inviato:", response);

    return res.status(200).json({
      success: true
    });

  }catch(err){

    console.error("💥 API ERROR send-lead-partner:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
}
