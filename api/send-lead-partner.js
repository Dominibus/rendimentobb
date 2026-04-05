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

    const {
      email,
      city,
      roi,
      score,
      type,
      partners
    } = body;

    // ================= VALIDAZIONE =================
    if(!email){
      console.error("❌ Missing email");
      return res.status(400).json({ error:"Missing email" });
    }

    // 🔥 manda solo HOT
    if(score !== "hot"){
      return res.status(200).json({ skip:true });
    }

    // ================= PARTNER LIST SAFE =================
    const recipients = Array.isArray(partners) && partners.length > 0
      ? partners
      : ["rendimentobb@gmail.com"];

    // ================= EMAIL =================
    const subject = "🔥 Lead qualificato investimento B&B";

    const html = `
    <div style="font-family:Arial;padding:20px">
      <h2>🔥 Nuovo lead qualificato</h2>

      <p><b>Email:</b> ${email}</p>
      <p><b>Città:</b> ${city || "N/A"}</p>
      <p><b>ROI:</b> ${roi || 0}%</p>
      <p><b>Tipo:</b> ${type || "simulatore"}</p>

      <hr>

      <p>
      Lead generato tramite <b>RendimentoBB</b><br>
      Alta probabilità di conversione 💰
      </p>
    </div>
    `;

    // ================= INVIO =================
    const response = await resend.emails.send({
      from: "RendimentoBB <noreply@rendimentobb.it>",
      to: recipients,
      subject,
      html
    });

    console.log("💰 Lead inviato partner:", response);

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
