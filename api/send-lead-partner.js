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

    if(!email){
      console.error("❌ Missing email");
      return res.status(400).json({ error:"Missing email" });
    }

    // 🔥 SOLO LEAD CALDI
    if(score !== "hot"){
      return res.status(200).json({ skip:true });
    }

    // 🔥 FIX ROI (CREDIBILITÀ)
    const roiRounded = Number(roi.toFixed(1));

    // ================= PARTNER LIST =================
    const recipients = Array.isArray(partners) && partners.length > 0
      ? partners
      : ["rendimentobb@gmail.com"];

    // ================= SUBJECT MIGLIORATO =================
    const subject = `🔥 Investment Lead – ${city.toUpperCase()} | ROI ${roiRounded}%`;

    // ================= TEMPLATE PREMIUM B2B =================
    const html = `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:40px 20px">

  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:18px;padding:35px;box-shadow:0 20px 50px rgba(0,0,0,0.08)">

    <!-- LOGO GRANDE -->
    <div style="text-align:center;margin-bottom:30px">
      <img src="https://www.rendimentobb.it/img/logo-main.png" style="width:140px">
    </div>

    <!-- HEADER -->
    <h2 style="text-align:center;color:#0f172a;font-size:22px;margin-bottom:10px">
      🔥 High-value investment lead
    </h2>

    <p style="text-align:center;color:#64748b;font-size:14px;margin-bottom:25px">
      Utente con forte interesse e ROI elevato
    </p>

    <!-- ROI HERO -->
    <div style="text-align:center;margin:35px 0">
      <div style="font-size:48px;font-weight:800;color:#10b981;letter-spacing:-1px">
        ${roiRounded}%
      </div>
      <div style="color:#64748b;font-size:14px">
        ROI stimato – ${city}
      </div>
    </div>

    <!-- INFO BOX -->
    <div style="background:#f8fafc;padding:18px;border-radius:12px;margin:25px 0;font-size:14px">

      <p style="margin:6px 0"><strong>Email:</strong> ${email}</p>
      <p style="margin:6px 0"><strong>Città:</strong> ${city}</p>
      <p style="margin:6px 0"><strong>Tipo lead:</strong> ${type}</p>

    </div>

    <!-- BADGE -->
    <div style="background:#ecfdf5;padding:16px;border-radius:12px;margin:20px 0;font-size:14px;color:#065f46">
      💰 Alta probabilità di conversione
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:35px 0">
      <a href="mailto:${email}"
      style="background:linear-gradient(135deg,#10b981,#059669);
      color:white;
      padding:16px 30px;
      border-radius:999px;
      text-decoration:none;
      font-weight:700;
      font-size:15px;
      display:inline-block;
      box-shadow:0 10px 30px rgba(16,185,129,0.4)">
      Contatta il lead
      </a>
    </div>

    <!-- FOOTER -->
    <p style="font-size:12px;color:#94a3b8;text-align:center">
      Lead generato automaticamente da RendimentoBB
    </p>

  </div>

</div>
`;

    // ================= SEND =================
    const response = await resend.emails.send({
      from: "RendimentoBB <lead@rendimentobb.it>",
      to: recipients,
      subject,
      html
    });

    console.log("💰 Lead inviato:", response);

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
