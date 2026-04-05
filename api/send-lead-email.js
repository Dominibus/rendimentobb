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
    if (roi > 12) score = "hot";
    else if (roi > 8) score = "warm";

    // ================= EMAIL TEMPLATE PRO =================
    const templates = {

      it: {
        subject: `ROI ${roi}% – Stai davvero guadagnando?`,
        html: `
        <div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:40px 20px">

          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:16px;padding:30px;box-shadow:0 10px 30px rgba(0,0,0,0.08)">

            <!-- LOGO -->
            <div style="text-align:center;margin-bottom:20px">
              <img src="https://www.rendimentobb.it/img/logo.png" style="height:40px">
            </div>

            <!-- TITLE -->
            <h2 style="text-align:center;color:#0f172a;margin-bottom:10px">
              Il tuo investimento può cambiare tutto
            </h2>

            <!-- ROI -->
            <div style="text-align:center;margin:20px 0">
              <div style="font-size:36px;font-weight:bold;color:#10b981">
                ${roi}%
              </div>
              <div style="color:#64748b;font-size:14px">
                ROI stimato – ${city || "mercato attuale"}
              </div>
            </div>

            <!-- ALERT -->
            <div style="background:#fff7ed;padding:16px;border-radius:10px;margin:20px 0;font-size:14px">
              ⚠️ Il 72% degli investitori prende decisioni sbagliate senza dati reali
            </div>

            <!-- VALUE -->
            <ul style="color:#334155;font-size:15px;line-height:1.7;padding-left:20px">
              <li>ROI reale vs mercato</li>
              <li>Break-even e rischio</li>
              <li>Sostenibilità mutuo</li>
            </ul>

            <!-- CTA -->
            <div style="text-align:center;margin:30px 0">
              <a href="https://www.rendimentobb.it/dashboard/"
              style="background:#10b981;color:white;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">
              🔥 Sblocca analisi completa
              </a>
            </div>

            <!-- FOOTER -->
            <p style="font-size:12px;color:#94a3b8;text-align:center">
              RendimentoBB – Decision engine per investimenti B&B
            </p>

          </div>

        </div>
        `
      },

      en: {
        subject: `ROI ${roi}% – Is your investment really profitable?`,
        html: `
        <div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:40px 20px">

          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:16px;padding:30px;box-shadow:0 10px 30px rgba(0,0,0,0.08)">

            <div style="text-align:center;margin-bottom:20px">
              <img src="https://www.rendimentobb.it/img/logo.png" style="height:40px">
            </div>

            <h2 style="text-align:center;color:#0f172a;margin-bottom:10px">
              Your investment can change everything
            </h2>

            <div style="text-align:center;margin:20px 0">
              <div style="font-size:36px;font-weight:bold;color:#10b981">
                ${roi}%
              </div>
              <div style="color:#64748b;font-size:14px">
                Estimated ROI – ${city || "market"}
              </div>
            </div>

            <div style="background:#fff7ed;padding:16px;border-radius:10px;margin:20px 0;font-size:14px">
              ⚠️ 72% of investors make decisions without real data
            </div>

            <ul style="color:#334155;font-size:15px;line-height:1.7;padding-left:20px">
              <li>Real ROI vs market</li>
              <li>Break-even & risk</li>
              <li>Mortgage sustainability</li>
            </ul>

            <div style="text-align:center;margin:30px 0">
              <a href="https://www.rendimentobb.it/dashboard/"
              style="background:#10b981;color:white;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">
              🔥 Unlock full analysis
              </a>
            </div>

            <p style="font-size:12px;color:#94a3b8;text-align:center">
              RendimentoBB – B&B investment decision engine
            </p>

          </div>

        </div>
        `
      }

    };

    const selected = templates[lang] || templates.it;

    // ================= SEND EMAIL =================
    await resend.emails.send({
      from: "RendimentoBB <noreply@rendimentobb.it>",
      to: [email],
      subject: selected.subject,
      html: selected.html
    });

    // ================= TRACKING =================
    if (db) {

      await db.collection("email_logs").add({
        email,
        type: "retargeting",
        score,
        roi,
        city,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.collection("users").doc(email).set({
        email,
        lastSeen: admin.firestore.FieldValue.serverTimestamp(),
        lastROI: roi,
        lastCity: city,
        score
      }, { merge: true });

    }

    console.log("📨 Email PRO inviata:", email, score);

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
