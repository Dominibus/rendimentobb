import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    const { type, email, phone, city, budget, amount, years } = req.body;

    let subject = "Nuovo lead RendimentoBB";
    let content = "";

    // ================= MUTUI =================
    if(type === "mutui"){
      subject = "🏦 Nuovo lead MUTUO";
      content = `
      Email: ${email}
      Telefono: ${phone || "-"}
      Importo: €${amount}
      Durata: ${years} anni
      `;
    }

    // ================= IMMOBILI =================
    if(type === "immobili"){
      subject = "🏠 Nuovo lead IMMOBILE";
      content = `
      Email: ${email}
      Città: ${city}
      Budget: €${budget}
      `;
    }

    // ================= PARTNER =================
    if(type === "partner"){
      subject = "🤝 Nuovo partner";
      content = `
      Nome: ${req.body.name}
      Email: ${email}
      Messaggio: ${req.body.message}
      `;
    }

    // ================= INVIO EMAIL =================
    await resend.emails.send({
      from: "RendimentoBB <onboarding@resend.dev>",
      to: ["rendimentobb@gmail.com"], // 👉 tua email
      subject,
      html: `<pre>${content}</pre>`
    });

    return res.status(200).json({ success:true });

  }catch(err){
    console.error(err);
    return res.status(500).json({ error:"Errore invio email" });
  }

}
