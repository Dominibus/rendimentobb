import { Resend } from "resend";
import admin from "firebase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔥 INIT FIREBASE (SAFE)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    const {
      type,
      email,
      phone,
      city,
      budget,
      amount,
      years,
      name,
      message,
      roi
    } = req.body;

    // ================= VALIDAZIONE =================
    if(!email){
      return res.status(400).json({ error:"Email richiesta" });
    }

    // ================= LEAD VALUE ENGINE 💰 =================
    let value = 10;

    if(type === "mutui") value = 30;
    if(type === "immobili") value = 50;
    if(type === "simulatore") value = roi > 12 ? 40 : 20;
    if(type === "partner") value = 100;

    // ================= LEAD SCORE =================
    let score = "cold";

    if(roi > 12) score = "hot";
    else if(roi > 8) score = "warm";

    // ================= CONTENUTO =================
    let subject = "Nuovo lead RendimentoBB";
    let content = "";

    if(type === "mutui"){
      subject = "🏦 Lead MUTUO (ALTO VALORE)";
      content = `
Email: ${email}
Telefono: ${phone || "-"}
Importo: €${amount}
Durata: ${years} anni
Valore lead: €${value}
Score: ${score}
      `;
    }

    if(type === "immobili"){
      subject = "🏠 Lead IMMOBILE (INVESTITORE)";
      content = `
Email: ${email}
Città: ${city}
Budget: €${budget}
Valore lead: €${value}
Score: ${score}
      `;
    }

    if(type === "simulatore"){
      subject = "🔥 Lead INVESTIMENTO (CALDO)";
      content = `
Email: ${email}
ROI: ${roi}%
Città: ${city}
Budget: €${budget}
Valore lead: €${value}
Score: ${score}
      `;
    }

    if(type === "partner"){
      subject = "🤝 Richiesta PARTNER";
      content = `
Nome: ${name}
Email: ${email}
Messaggio: ${message}
Valore: €${value}
      `;
    }

    // ================= SALVATAGGIO DB =================
    await db.collection("leads").add({
      type,
      email,
      phone: phone || null,
      city: city || null,
      budget: budget || null,
      amount: amount || null,
      years: years || null,
      name: name || null,
      message: message || null,
      roi: roi || null,
      value,
      score,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // ================= EMAIL ADMIN =================
    await resend.emails.send({
      from: "RendimentoBB <info@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],
      subject,
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>${subject}</h2>
          <pre>${content}</pre>
        </div>
      `
    });

    // ================= PARTNER ROUTING 💸 =================

    const partners = {
      mutui: ["broker1@email.com"],
      immobili: ["agenzia@email.com"],
      simulatore: ["investor@email.com"]
    };

    const targetPartners = partners[type] || [];

    for(const partnerEmail of targetPartners){

      await resend.emails.send({
        from: "RendimentoBB <lead@rendimentobb.it>",
        to: [partnerEmail],
        subject: "🔥 Nuovo cliente pronto",
        html: `
          <div style="font-family:Arial;padding:20px">
            <h2>Nuovo lead qualificato</h2>

            <p><strong>Email:</strong> ${email}</p>
            <p><strong>ROI:</strong> ${roi || "-"}</p>
            <p><strong>Città:</strong> ${city || "-"}</p>
            <p><strong>Budget:</strong> €${budget || "-"}</p>

            <hr>

            <p style="color:#64748b;font-size:12px">
            Lead generato da RendimentoBB
            </p>
          </div>
        `
      });

    }

    console.log("🔥 Lead salvato + monetizzato:", type, value);

    return res.status(200).json({ 
      success:true,
      value,
      score
    });

  }catch(err){

    console.error("❌ ERRORE LEAD ENGINE:", err);

    return res.status(500).json({ 
      error:"Errore server",
      details: err.message 
    });

  }
}
