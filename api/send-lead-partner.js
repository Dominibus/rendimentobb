import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    const { email, city, roi, score, type, partners } = req.body;

    // 🔥 manda solo HOT
    if(score !== "hot"){
      return res.status(200).json({ skip:true });
    }

    // ================= EMAIL PARTNER =================

    const subject = "🔥 Lead qualificato investimento B&B";

    const html = `
    <div style="font-family:Arial;padding:20px">
      <h2>Nuovo lead qualificato</h2>

      <p><b>Email:</b> ${email}</p>
      <p><b>Città:</b> ${city}</p>
      <p><b>ROI:</b> ${roi}%</p>

      <hr>

      <p>
      Lead generato tramite RendimentoBB – alta probabilità conversione.
      </p>
    </div>
    `;

    await resend.emails.send({
      from: "RendimentoBB <noreply@rendimentobb.it>",

      // 🔥 QUI METTERAI I PARTNER
     to: partners || ["rendimentobb@gmail.com"],

      subject,
      html
    });

    console.log("💰 Lead inviato partner");

try {

  // tua logica email

  return res.status(200).json({
    success: true
  });

} catch (err) {

  console.error(err);

  return res.status(500).json({
    success: false,
    error: err.message
  });

}

}
