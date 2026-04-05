import { Resend } from "resend";
import admin from "firebase-admin";

// ================= RESEND =================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= FIREBASE INIT SAFE =================
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          : undefined
      })
    });
    console.log("🔥 Firebase Admin initialized");
  } catch (e) {
    console.error("❌ Firebase init error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    // ================= BODY SAFE =================
    const body = req.body || {};

    let {
      type = "simulatore",
      email,
      phone,
      city,
      budget,
      amount,
      years,
      name,
      message,
      roi
    } = body;

    // ================= SANITIZE =================
    email = String(email || "").trim();
    city = String(city || "").toLowerCase();
    type = String(type || "simulatore").toLowerCase();
    roi = Number(roi || 0);
    budget = Number(budget || 0);

    // ================= VALIDAZIONE =================
    if(!email){
      return res.status(400).json({ error:"Email richiesta" });
    }

    // ================= LEAD VALUE ENGINE 💰 =================
    let value = 10;

    if(type === "mutui") value = 30;
    if(type === "immobili") value = 50;
    if(type === "simulatore") value = roi > 15 ? 80 : roi > 12 ? 50 : 20;
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
Importo: €${amount || "-"}
Durata: ${years || "-"} anni
Valore lead: €${value}
Score: ${score}
      `;
    }

    if(type === "immobili"){
      subject = "🏠 Lead IMMOBILE (INVESTITORE)";
      content = `
Email: ${email}
Città: ${city || "-"}
Budget: €${budget || "-"}
Valore lead: €${value}
Score: ${score}
      `;
    }

    if(type === "simulatore"){
      subject = "🔥 Lead INVESTIMENTO (CALDO)";
      content = `
Email: ${email}
ROI: ${roi}%
Città: ${city || "-"}
Budget: €${budget || "-"}
Valore lead: €${value}
Score: ${score}
      `;
    }

    if(type === "partner"){
      subject = "🤝 Richiesta PARTNER";
      content = `
Nome: ${name || "-"}
Email: ${email}
Messaggio: ${message || "-"}
Valore: €${value}
      `;
    }

    // ================= SAVE FIRESTORE =================
    if(db){
      await db.collection("leads").add({
        type,
        email,
        phone: phone || null,
        city,
        budget,
        amount: amount || null,
        years: years || null,
        name: name || null,
        message: message || null,
        roi,
        value,
        score,
        plan: body.plan || "unknown", // 🔥 IMPORTANTISSIMO
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      console.warn("⚠️ Firestore non disponibile → skip salvataggio");
    }

    // ================= EMAIL ADMIN =================
    try{
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
    }catch(e){
      console.error("❌ Email admin error:", e.message);
    }

    // ================= PARTNER ROUTING 💸 =================
    const partnersMap = {
      mutui: ["broker1@email.com"],
      immobili: ["agenzia@email.com"],
      simulatore: roi > 12 
        ? ["investor@email.com"] 
        : []
    };

    const targetPartners = partnersMap[type] || [];

    // 🔥 INVIO PARALLELO (VELOCE)
    await Promise.all(
      targetPartners.map(partnerEmail => {

        return resend.emails.send({
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
        }).catch(err=>{
          console.error("❌ Partner send error:", err.message);
        });

      })
    );

    console.log("🔥 Lead salvato + monetizzato:", type, value);

    return res.status(200).json({
      success:true,
      value,
      score
    });

  }catch(err){

    console.error("💥 ERRORE LEAD ENGINE:", err);

    return res.status(500).json({
      error:"Errore server",
      details: err.message
    });

  }
}
