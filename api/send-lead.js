import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res){

  const lang = "it";

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    const { type, email, phone, city, budget, amount, years, name, message } = req.body;

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
Nome: ${name}
Email: ${email}
Messaggio: ${message}
      `;
    }

    // ================= INVIO EMAIL =================
    await resend.emails.send({
      from: "RendimentoBB <onboarding@resend.dev>", // ⚠️ cambieremo dopo
      to: ["rendimentobb@gmail.com"],
      subject,
      html: `<div style="font-family:Arial;padding:20px">
              <h2>${subject}</h2>
              <pre>${content}</pre>
            </div>`
    });

    console.log("📩 Email inviata:", type);

    return res.status(200).json({ success:true });

  }catch(err){
    console.error("❌ ERRORE SEND LEAD:", err);
    return res.status(500).json({ error:"Errore invio email" });
  }

}
