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
export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { email, lang = "it", roi, city } = req.body || {};

    const cleanEmail = String(email || "").trim();
    const cleanLang = lang === "en" ? "en" : "it";
    const roiRounded = Number(Number(roi || 0).toFixed(1));
    const cleanCity = String(city || "");

    if (!cleanEmail) {
      return res.status(400).json({ error: "Email missing" });
    }

    // ================= ANTI-SPAM (10 MIN) =================
    if (db) {
      const existing = await db.collection("email_logs")
        .where("email", "==", cleanEmail)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (!existing.empty) {
        const last = existing.docs[0].data();

        if (last?.createdAt?.toMillis) {
          const diff = Date.now() - last.createdAt.toMillis();

          if (diff < 10 * 60 * 1000) {
            console.log("⛔ Email già inviata recentemente");
            return res.status(200).json({ skipped: true });
          }
        }
      }
    }

    // ================= SCORE =================
    let score = "cold";
    if (roiRounded > 12) score = "hot";
    else if (roiRounded > 8) score = "warm";

    // ================= FUNNEL LINK =================
    const funnelUrl = `https://www.rendimentobb.it/unlock-analysis?roi=${roiRounded}&city=${cleanCity}`;

    // ================= SUBJECT (ANTI-SPAM + CONVERSION) =================
    const subjects = {
      it: `💰 Il tuo investimento può rendere di più (${roiRounded}%)`,
      en: `💰 Your investment potential (${roiRounded}%)`
    };

    // ================= TEMPLATE =================
    const templates = {

      it: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:40px 20px">

  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:18px;padding:35px;box-shadow:0 20px 50px rgba(0,0,0,0.08)">

    <div style="text-align:center;margin-bottom:25px">
      <img src="https://www.rendimentobb.it/img/logo-main.png" style="width:120px">
    </div>

    <h2 style="text-align:center;color:#0f172a;font-size:22px;margin-bottom:5px">
      Analisi investimento B&B
    </h2>

    <p style="text-align:center;color:#64748b;font-size:14px">
      Dati basati sulla tua simulazione
    </p>

    <div style="text-align:center;margin:30px 0">
      <div style="font-size:46px;font-weight:800;color:#10b981">
        ${roiRounded}%
      </div>
      <div style="color:#64748b;font-size:14px">
        ROI stimato – ${cleanCity}
      </div>
    </div>

    <div style="background:#fff7ed;padding:16px;border-radius:12px;margin:20px 0;font-size:14px;color:#7c2d12">
      ⚠️ Il ROI da solo non basta: rischio, mutuo e occupazione cambiano il risultato reale
    </div>

    <ul style="color:#334155;font-size:14px;line-height:1.7;padding-left:20px">
      <li>Profitto reale mensile e annuale</li>
      <li>Break-even occupancy</li>
      <li>Impatto mutuo</li>
      <li>Scenario rischio investimento</li>
    </ul>

    <div style="text-align:center;margin:35px 0">
      <a href="${funnelUrl}"
      style="background:linear-gradient(135deg,#10b981,#059669);
      color:white;
      padding:16px 28px;
      border-radius:999px;
      text-decoration:none;
      font-weight:700;
      display:inline-block;
      box-shadow:0 10px 30px rgba(16,185,129,0.4)">
      🔥 Vedi analisi completa
      </a>
    </div>

    <p style="text-align:center;font-size:12px;color:#94a3b8">
      RendimentoBB – motore decisionale investimenti
    </p>

  </div>

</div>
`,

      en: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:40px 20px">

  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:18px;padding:35px;box-shadow:0 20px 50px rgba(0,0,0,0.08)">

    <div style="text-align:center;margin-bottom:25px">
      <img src="https://www.rendimentobb.it/img/logo-main.png" style="width:120px">
    </div>

    <h2 style="text-align:center;color:#0f172a;font-size:22px">
      B&B Investment Analysis
    </h2>

    <div style="text-align:center;margin:30px 0">
      <div style="font-size:46px;font-weight:800;color:#10b981">
        ${roiRounded}%
      </div>
      <div style="color:#64748b;font-size:14px">
        Estimated ROI – ${cleanCity || "market"}
      </div>
    </div>

    <ul style="color:#334155;font-size:14px;line-height:1.7;padding-left:20px">
      <li>Real monthly & yearly profit</li>
      <li>Break-even occupancy</li>
      <li>Mortgage impact</li>
      <li>Risk analysis</li>
    </ul>

    <div style="text-align:center;margin:35px 0">
      <a href="${funnelUrl}"
      style="background:linear-gradient(135deg,#10b981,#059669);
      color:white;
      padding:16px 28px;
      border-radius:999px;
      text-decoration:none;
      font-weight:700;
      display:inline-block">
      🔥 View full analysis
      </a>
    </div>

  </div>

</div>
`
    };

    // ================= SEND =================
    await resend.emails.send({
      from: "RendimentoBB <analisi@rendimentobb.it>",
      to: [cleanEmail],
      subject: subjects[cleanLang],
      html: templates[cleanLang]
    });

    // ================= TRACK =================
    if (db) {
      await db.collection("email_logs").add({
        email: cleanEmail,
        roi: roiRounded,
        city: cleanCity,
        score,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log("📨 Email inviata:", cleanEmail, score);

    return res.status(200).json({ success: true });

  } catch (err) {

    console.error("💥 Email error:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }
}
