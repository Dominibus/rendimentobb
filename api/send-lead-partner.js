import { Resend } from "resend";
import admin from "firebase-admin";

// ================= RESEND =================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= FIREBASE =================
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      })
    });
  } catch (e) {
    console.error("Firebase init error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= HELPERS =================
function safe(val){
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function clean(val){
  return String(val || "").trim();
}

function t(lang, it, en){
  return lang === "en" ? en : it;
}

// ================= PARTNER ROUTING =================
function getPartners({ type, roi }){

  const partners = [];

  if(roi > 15){
    partners.push("investor@rendimentobb.it");
  }

  if(type === "mutui"){
    partners.push("broker@rendimentobb.it");
  }

  if(type === "immobili"){
    partners.push("agenzia@rendimentobb.it");
  }

  if(partners.length === 0){
    partners.push("rendimentobb@gmail.com");
  }

  return partners;
}

// ================= EMAIL TEMPLATE =================
function buildPartnerEmail({ email, city, roi, type, priority, lang }){

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:22px;padding:40px">

      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <h2 style="text-align:center;color:#0f172a">
        ${t(lang,"Nuovo lead qualificato","New qualified lead")}
      </h2>

      <p style="text-align:center;color:#64748b;margin-bottom:20px">
        ${t(lang,
          "Utente con simulazione completata",
          "User completed a full simulation"
        )}
      </p>

      <div style="text-align:center;margin:30px 0">
        <div style="font-size:56px;font-weight:800;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">${t(lang,"ROI stimato","Estimated ROI")}</div>
      </div>

      <div style="text-align:center;margin-bottom:20px">
        <strong>${priority}</strong>
      </div>

      <div style="background:#f8fafc;padding:20px;border-radius:14px;font-size:14px">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>${t(lang,"Città","City")}:</strong> ${city || "-"}</p>
        <p><strong>${t(lang,"Tipo","Type")}:</strong> ${type}</p>
      </div>

      <div style="text-align:center;margin:35px 0">
        <a href="mailto:${email}"
        style="background:#10b981;color:white;padding:16px 30px;border-radius:999px;text-decoration:none;font-weight:700">
        ${t(lang,"Contatta utente","Contact user")}
        </a>
      </div>

      <div style="text-align:center;color:#94a3b8;font-size:12px">
        RendimentoBB
      </div>

    </div>
  </div>
  `;
}

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  const startTime = Date.now();

  try{

    let { email, city, roi, type, score, lang } = req.body || {};

    email = clean(email);
    city  = clean(city);
    type  = clean(type || "simulatore");
    lang  = lang || "it";

    roi = safe(roi);
    const roiRounded = Number(roi.toFixed(1));

    if(!email){
      return res.status(400).json({ error:"Missing email" });
    }

    // ================= QUALITÀ =================
    if(score !== "hot" && roiRounded < 10){
      return res.status(200).json({ skipped:true });
    }

    // ================= PRIORITY =================
    const priority =
      roiRounded > 18 ? "EXTREME" :
      roiRounded > 15 ? "URGENT" :
      roiRounded > 10 ? "HIGH" : "NORMAL";

    // ================= ROUTING =================
    const recipients = getPartners({ type, roi: roiRounded });

    const sessionKey = `${email}_${Math.floor(Date.now() / (1000 * 60 * 20))}`;

    const html = buildPartnerEmail({
      email,
      city,
      roi: roiRounded,
      type,
      priority,
      lang
    });

    let sent = false;

    try{
      await resend.emails.send({
        from: "RendimentoBB Lead <lead@rendimentobb.it>",
        to: recipients,

        // ✅ SUBJECT ANTI-SPAM
        subject: `Nuovo lead (${roiRounded}%)`,

        // ✅ TEXT VERSION (FONDAMENTALE)
        text: `
Nuovo lead

Email: ${email}
City: ${city}
ROI: ${roiRounded}%
Tipo: ${type}
Priorità: ${priority}
`,

        html
      });

      sent = true;

    }catch(e){
      console.error("❌ Partner email error:", e.message);
    }

    // ================= TRACK =================
    if(db){
      try{
        await db.collection("partner_leads").add({
          email,
          city,
          roi: roiRounded,
          type,
          priority,
          recipients,
          sessionKey,
          sent,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){}
    }

    console.log("🤝 PARTNER LEAD:", {
      email,
      roi: roiRounded,
      recipients,
      sent,
      duration: Date.now() - startTime
    });

    return res.status(200).json({
      success:true,
      sent,
      recipients
    });

  }catch(err){

    console.error("💥 Partner API error:", err);

    return res.status(500).json({
      error:"server error",
      details: err.message
    });

  }
}
