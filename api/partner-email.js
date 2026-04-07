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
function clean(v){
  return String(v || "").trim();
}

function safe(n){
  const v = Number(n);
  return isNaN(v) ? 0 : v;
}

function isEN(req){
  return req.headers["accept-language"]?.includes("en");
}

// ================= ROUTING =================
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

// ================= TEMPLATE =================
function buildPartnerEmail({ email, city, roi, type, priority, lang }){

  const t = (it, en) => lang === "en" ? en : it;

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:20px;padding:40px">

      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <h2 style="text-align:center;color:#0f172a">
        ${t("Nuovo lead qualificato","New qualified lead")}
      </h2>

      <p style="text-align:center;color:#64748b">
        ${t("Utente con interesse reale","User with real intent")}
      </p>

      <div style="text-align:center;margin:30px 0">
        <div style="font-size:52px;font-weight:800;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">${city || "-"}</div>
      </div>

      <div style="background:#f8fafc;padding:18px;border-radius:12px;font-size:14px;color:#334155">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>${t("Tipo","Type")}:</strong> ${type}</p>
        <p><strong>Priority:</strong> ${priority}</p>
      </div>

      <div style="text-align:center;margin-top:30px">
        <a href="mailto:${email}"
        style="
        background:#10b981;
        color:white;
        padding:14px 26px;
        border-radius:999px;
        text-decoration:none;
        font-weight:700;
        display:inline-block;
        ">
        ${t("Contatta utente","Contact user")}
        </a>
      </div>

      <div style="text-align:center;margin-top:30px;color:#94a3b8;font-size:12px">
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

  try{

    let { email, city, roi, type, lang } = req.body || {};

    email = clean(email);
    city  = clean(city);
    type  = clean(type || "unknown");
    roi   = safe(roi);

    if(!email){
      return res.status(400).json({ error:"Missing email" });
    }

    const detectedLang = lang || (isEN(req) ? "en" : "it");

    const roiRounded = Number(roi.toFixed(1));

    const priority =
      roiRounded > 18 ? "EXTREME" :
      roiRounded > 15 ? "URGENT" :
      roiRounded > 10 ? "HIGH" : "NORMAL";

    const recipients = getPartners({
      type,
      roi: roiRounded
    });

    let sent = false;

    try{

      await resend.emails.send({
        from: "RendimentoBB Lead <lead@rendimentobb.it>",
        to: recipients,

        // ✅ SUBJECT ANTI-SPAM
        subject: detectedLang === "en"
          ? `New lead (${roiRounded}%)`
          : `Nuovo lead (${roiRounded}%)`,

        // ✅ TEXT VERSION
        text: `
Nuovo lead

Email: ${email}
City: ${city}
ROI: ${roiRounded}%
Type: ${type}
Priority: ${priority}
`,

        html: buildPartnerEmail({
          email,
          city,
          roi: roiRounded,
          type,
          priority,
          lang: detectedLang
        })
      });

      sent = true;

    }catch(e){
      console.error("Partner email error:", e.message);
    }

    // ================= SAVE =================
    if(db){
      try{
        await db.collection("partner_leads").add({
          email,
          city,
          roi: roiRounded,
          type,
          priority,
          recipients,
          sent,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){}
    }

    console.log("🤝 Partner lead:", email, recipients);

    return res.status(200).json({
      success:true,
      sent,
      recipients
    });

  }catch(err){

    console.error("💥 Partner API error:", err);

    return res.status(500).json({
      error:"server error"
    });

  }
}
