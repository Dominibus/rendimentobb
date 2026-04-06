import { Resend } from "resend";
import admin from "firebase-admin";

// ================= RESEND =================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= FIREBASE SAFE INIT =================
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
    console.log("🔥 Firebase init OK");
  } catch (e) {
    console.error("❌ Firebase init error:", e.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= HANDLER =================
export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    // ================= BODY SAFE =================
    const body = req.body || {};

    let { email, lang = "it", roi, city } = body;

    email = String(email || "").trim();
    lang = lang === "en" ? "en" : "it";
    roi = Number(roi || 0);
    city = String(city || "");

    if (!email) {
      return res.status(400).json({ error: "Email missing" });
    }

    // 🔥 FIX CREDIBILITÀ ROI
    const roiRounded = Number(roi.toFixed(1));

    // ================= ANTI-SPAM =================
    if (db) {
      const existing = await db.collection("email_logs")
        .where("email", "==", email)
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

    // ================= LEAD SCORE =================
    let score = "cold";
    if (roiRounded > 12) score = "hot";
    else if (roiRounded > 8) score = "warm";

    // ================= TEMPLATE =================
    const templates = {

      it: {
        subject: `ROI ${roiRounded}% – Analisi investimento`,
        html: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:40px 20px">

  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:18px;padding:35px;box-shadow:0 20px 50px rgba(0,0,0,0.08)">

    <!-- LOGO GRANDE -->
    <div style="text-align:center;margin-bottom:30px">
      <img src="https://www.rendimentobb.it/img/logo-main.png" style="width:140px">
    </div>

    <!-- HEADLINE -->
    <h2 style="text-align:center;color:#0f172a;font-size:22px;margin-bottom:10px">
      🔎 Analisi investimento B&B
    </h2>

    <p style="text-align:center;color:#64748b;font-size:14px;margin-bottom:25px">
      Valutazione basata sui dati inseriti
    </p>

    <!-- ROI HERO -->
    <div style="text-align:center;margin:35px 0">
      <div style="font-size:48px;font-weight:800;color:#10b981;letter-spacing:-1px">
        ${roiRounded}%
      </div>
      <div style="color:#64748b;font-size:14px">
        ROI stimato – ${city}
      </div>
    </div>

    <!-- ALERT -->
    <div style="background:#fff7ed;padding:18px;border-radius:12px;margin:25px 0;font-size:14px;color:#7c2d12">
      ⚠️ Il ROI da solo non basta: rischio, mutuo e occupazione determinano il risultato reale
    </div>

    <!-- VALUE -->
    <div style="margin:25px 0">
      <p style="font-weight:600;color:#0f172a;margin-bottom:10px">Analizza in modo completo:</p>
      <ul style="color:#334155;font-size:14px;line-height:1.7;padding-left:20px">
        <li>Profitto reale mensile e annuale</li>
        <li>Break-even occupancy</li>
        <li>Impatto mutuo e interessi</li>
        <li>Scenario rischio investimento</li>
      </ul>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:35px 0">
      <a href="https://www.rendimentobb.it/dashboard/"
      style="background:linear-gradient(135deg,#10b981,#059669);
      color:white;
      padding:16px 30px;
      border-radius:999px;
      text-decoration:none;
      font-weight:700;
      font-size:15px;
      display:inline-block;
      box-shadow:0 10px 30px rgba(16,185,129,0.4)">
      🔥 Vedi analisi completa
      </a>
    </div>

    <p style="text-align:center;font-size:12px;color:#94a3b8">
      RendimentoBB – motore decisionale per investimenti B&B
    </p>

  </div>

</div>
`
      },

      en: {
        subject: `ROI ${roiRounded}% – Investment analysis`,
        html: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:40px 20px">

  <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:18px;padding:35px;box-shadow:0 20px 50px rgba(0,0,0,0.08)">

    <div style="text-align:center;margin-bottom:30px">
      <img src="https://www.rendimentobb.it/img/logo-main.png" style="width:140px">
    </div>

    <h2 style="text-align:center;color:#0f172a;font-size:22px;margin-bottom:10px">
      🔎 B&B Investment Analysis
    </h2>

    <p style="text-align:center;color:#64748b;font-size:14px;margin-bottom:25px">
      Based on your input data
    </p>

    <div style="text-align:center;margin:35px 0">
      <div style="font-size:48px;font-weight:800;color:#10b981">
        ${roiRounded}%
      </div>
      <div style="color:#64748b;font-size:14px">
        Estimated ROI – ${city || "market"}
      </div>
    </div>

    <div style="background:#fff7ed;padding:18px;border-radius:12px;margin:25px 0;font-size:14px">
      ⚠️ ROI alone is not enough: risk, mortgage and occupancy define real performance
    </div>

    <ul style="color:#334155;font-size:14px;line-height:1.7;padding-left:20px">
      <li>Real monthly & yearly profit</li>
      <li>Break-even occupancy</li>
      <li>Mortgage impact</li>
      <li>Investment risk scenario</li>
    </ul>

    <div style="text-align:center;margin:35px 0">
      <a href="https://www.rendimentobb.it/dashboard/"
      style="background:linear-gradient(135deg,#10b981,#059669);
      color:white;
      padding:16px 30px;
      border-radius:999px;
      text-decoration:none;
      font-weight:700;
      display:inline-block">
      🔥 View full analysis
      </a>
    </div>

    <p style="text-align:center;font-size:12px;color:#94a3b8">
      RendimentoBB – B&B investment decision engine
    </p>

  </div>

</div>
`
      }

    };

    const selected = templates[lang] || templates.it;

    // ================= SEND =================
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [email],
      subject: selected.subject,
      html: selected.html
    });

    // ================= TRACK =================
    if (db) {

      await db.collection("email_logs").add({
        email,
        type: "retargeting",
        score,
        roi: roiRounded,
        city,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.collection("users").doc(email).set({
        email,
        lastSeen: admin.firestore.FieldValue.serverTimestamp(),
        lastROI: roiRounded,
        lastCity: city,
        score
      }, { merge: true });

    }

    console.log("📨 Email inviata:", email, score);

    return res.status(200).json({
      success: true,
      score
    });

  } catch (err) {

    console.error("💥 Email engine error:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }

}
