import { Resend } from "resend";
import admin from "firebase-admin";

// ================= RESEND =================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= FIREBASE INIT =================
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
  } catch (e) {
    console.error("Firebase init error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    const {
      email,
      city,
      roi,
      score,
      type,
      partners
    } = req.body || {};

    const cleanEmail = String(email || "").trim();
    const cleanCity  = String(city || "N/A");
    const cleanType  = String(type || "simulatore");
    const roiRounded = Number(Number(roi || 0).toFixed(1));

    if(!cleanEmail){
      return res.status(400).json({ error:"Missing email" });
    }

    // ================= SOLO HOT =================
    if(score !== "hot"){
      return res.status(200).json({ skip:true });
    }

    // ================= ANTI DUPLICATE (🔥 FONDAMENTALE) =================
    if(db){
      const existing = await db.collection("partner_leads")
        .where("email","==",cleanEmail)
        .orderBy("createdAt","desc")
        .limit(1)
        .get();

      if(!existing.empty){
        const last = existing.docs[0].data();

        if(last?.createdAt?.toMillis){
          const diff = Date.now() - last.createdAt.toMillis();

          // blocco 30 min
          if(diff < 30 * 60 * 1000){
            console.log("⛔ Lead già inviato recentemente");
            return res.status(200).json({ skip:true });
          }
        }
      }
    }

    // ================= PRIORITY =================
    const priority = roiRounded > 15 ? "URGENT" : "HIGH";

    // ================= PARTNERS =================
    const recipients = Array.isArray(partners) && partners.length > 0
      ? partners
      : ["rendimentobb@gmail.com"];

    // ================= SUBJECT (OPEN RATE 🚀) =================
    const subject = `🔥 ${priority} Lead – ${cleanCity.toUpperCase()} (${roiRounded}% ROI)`;

    // ================= TEMPLATE PRO =================
    const html = `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:40px 20px">

  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:18px;padding:35px;box-shadow:0 20px 50px rgba(0,0,0,0.08)">

    <!-- LOGO -->
    <div style="text-align:center;margin-bottom:25px">
      <img src="https://www.rendimentobb.it/img/logo-main.png" style="width:120px">
    </div>

    <!-- HEADER -->
    <h2 style="text-align:center;color:#0f172a;font-size:22px">
      🔥 Investment Lead (${priority})
    </h2>

    <p style="text-align:center;color:#64748b;font-size:14px">
      Utente con forte intenzione di investimento
    </p>

    <!-- ROI -->
    <div style="text-align:center;margin:30px 0">
      <div style="font-size:46px;font-weight:800;color:#10b981">
        ${roiRounded}%
      </div>
      <div style="color:#64748b;font-size:14px">
        ROI stimato – ${cleanCity}
      </div>
    </div>

    <!-- INFO -->
    <div style="background:#f8fafc;padding:18px;border-radius:12px;margin:20px 0;font-size:14px">

      <p><strong>Email:</strong> ${cleanEmail}</p>
      <p><strong>Città:</strong> ${cleanCity}</p>
      <p><strong>Tipo:</strong> ${cleanType}</p>

    </div>

    <!-- BADGE -->
    <div style="background:#ecfdf5;padding:14px;border-radius:12px;margin:20px 0;font-size:14px;color:#065f46">
      💰 Lead ad alta conversione (ROI sopra media)
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:30px 0">

      <a href="mailto:${cleanEmail}"
      style="background:linear-gradient(135deg,#10b981,#059669);
      color:white;
      padding:14px 24px;
      border-radius:999px;
      text-decoration:none;
      font-weight:700;
      display:inline-block;
      margin-bottom:10px">
      ✉️ Contatta subito
      </a>

      <br>

      <a href="https://rendimentobb.it/tool/?city=${cleanCity}"
      style="color:#10b981;font-size:13px;text-decoration:none">
      🔎 Visualizza contesto investimento
      </a>

    </div>

    <!-- FOOTER -->
    <p style="font-size:12px;color:#94a3b8;text-align:center">
      Lead generato automaticamente – RendimentoBB SaaS
    </p>

  </div>

</div>
`;

    // ================= SEND =================
    await resend.emails.send({
      from: "RendimentoBB Leads <lead@rendimentobb.it>",
      to: recipients,
      subject,
      html
    });

    // ================= TRACK =================
    if(db){
      await db.collection("partner_leads").add({
        email: cleanEmail,
        city: cleanCity,
        roi: roiRounded,
        score: "hot",
        priority,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log("💰 Lead partner inviato:", cleanEmail, priority);

    return res.status(200).json({ success:true });

  }catch(err){

    console.error("💥 Partner API error:", err);

    return res.status(500).json({
      success:false,
      error: err.message
    });

  }
}
