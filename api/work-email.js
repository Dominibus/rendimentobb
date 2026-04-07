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

function isEN(req){
  return req.headers["accept-language"]?.includes("en");
}

// ================= TEMPLATE =================
function buildWorkEmail({ name, role, lang }){

  const t = (it, en) => lang === "en" ? en : it;

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:20px;padding:40px">

      <!-- LOGO -->
      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <!-- TITLE -->
      <h2 style="text-align:center;color:#0f172a">
        ${t("👋 Candidatura ricevuta","👋 Application received")}
      </h2>

      <!-- INTRO -->
      <p style="text-align:center;color:#64748b;margin-top:10px">
        ${t(
          `Grazie ${name || ""}, abbiamo ricevuto la tua candidatura.`,
          `Thanks ${name || ""}, we have received your application.`
        )}
      </p>

      <!-- ROLE -->
      <div style="margin:30px 0;background:#f8fafc;padding:18px;border-radius:12px">
        <p style="margin:0;color:#334155;font-size:14px">
          <strong>${t("Ruolo / esperienza","Role / experience")}:</strong><br>
          ${role || "-"}
        </p>
      </div>

      <!-- MESSAGE -->
      <p style="color:#334155;font-size:14px;line-height:1.6">
        ${t(
          "Stiamo selezionando persone ambiziose per costruire una piattaforma SaaS che sta cambiando il modo in cui si analizzano gli investimenti B&B.",
          "We are selecting ambitious people to build a SaaS platform changing how B&B investments are analyzed."
        )}
      </p>

      <p style="color:#334155;font-size:14px;line-height:1.6;margin-top:15px">
        ${t(
          "Il nostro team analizzerà il tuo profilo. Se sarà in linea con la nostra visione, verrai contattato direttamente.",
          "Our team will review your profile. If aligned with our vision, you will be contacted directly."
        )}
      </p>

      <!-- EXTRA TRUST -->
      <div style="margin-top:20px;font-size:13px;color:#64748b">
        ${t(
          "Riceviamo molte candidature, quindi contattiamo solo i profili più in linea.",
          "We receive many applications, so we contact only the most relevant profiles."
        )}
      </div>

      <!-- CTA SOFT -->
      <div style="text-align:center;margin-top:30px">
        <a href="https://rendimentobb.it"
        style="background:#10b981;color:white;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">
        ${t("Scopri la piattaforma","Explore the platform")}
        </a>
      </div>

      <!-- FOOTER -->
      <div style="text-align:center;margin-top:35px;color:#94a3b8;font-size:12px">
        RendimentoBB – ${t("Team","Team")}
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

    let { name, email, role, lang } = req.body || {};

    name  = clean(name);
    email = clean(email);
    role  = clean(role);

    if(!email){
      return res.status(400).json({ error:"Missing email" });
    }

    const detectedLang = lang || (isEN(req) ? "en" : "it");

    // ================= USER EMAIL =================
    try{
      await resend.emails.send({
        from: "RendimentoBB Careers <careers@rendimentobb.it>",
        to: [email],
        subject: detectedLang === "en"
          ? "Your application has been received"
          : "La tua candidatura è stata ricevuta",
        html: buildWorkEmail({
          name,
          role,
          lang: detectedLang
        })
      });
    }catch(e){
      console.error("User email error:", e.message);
    }

    // ================= ADMIN EMAIL =================
    try{
      await resend.emails.send({
        from: "RendimentoBB Careers <careers@rendimentobb.it>",
        to: ["rendimentobb@gmail.com"],
        subject: "💼 Nuova candidatura ricevuta",
        html: `
          <h2>Nuova candidatura</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Ruolo:</strong> ${role}</p>
        `
      });
    }catch(e){
      console.error("Admin email error:", e.message);
    }

    // ================= SAVE =================
    if(db){
      try{
        await db.collection("work_applications").add({
          name,
          email,
          role,
          lang: detectedLang,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){}
    }

    console.log("💼 Work application:", email);

    return res.status(200).json({ success:true });

  }catch(err){

    console.error("💥 Work API error:", err);

    return res.status(500).json({
      error:"server error"
    });

  }
}
