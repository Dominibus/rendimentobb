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

    // ================= CONTENUTO =================
    const content = {

      it: {
        subject: "⚠️ Stai per perdere soldi (analisi reale)",
        html: `
        <div style="font-family:Arial;padding:20px;max-width:600px">
        <h2>Il tuo investimento è davvero profittevole?</h2>

        <p><strong>72% degli investitori</strong> sbaglia le previsioni.</p>

        <ul>
        <li>ROI sovrastimato</li>
        <li>Costi nascosti</li>
        <li>Mutuo non sostenibile</li>
        </ul>

        <a href="https://www.rendimentobb.it/tool/"
        style="display:inline-block;margin-top:20px;background:#10b981;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">
        🔥 Analizza ora
        </a>

        </div>
        `
      },

      en: {
        subject: "⚠️ Your investment may lose money",
        html: `
        <div style="font-family:Arial;padding:20px;max-width:600px">
        <h2>Is your investment really profitable?</h2>

        <p><strong>72% of investors</strong> miscalculate returns.</p>

        <ul>
        <li>Overestimated ROI</li>
        <li>Hidden costs</li>
        <li>Unsustainable mortgage</li>
        </ul>

        <a href="https://www.rendimentobb.it/tool/"
        style="display:inline-block;margin-top:20px;background:#10b981;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">
        🔥 Analyze now
        </a>

        </div>
        `
      }

    };

    const selected = content[lang] || content.it;

    // ================= INVIO EMAIL =================
    try {

      await resend.emails.send({
        from: "RendimentoBB <noreply@rendimentobb.it>",
        to: [email],
        subject: selected.subject,
        html: selected.html
      });

    } catch (e) {
      console.error("❌ Email send error:", e.message);
    }

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

    console.log("📨 Email inviata + tracking:", email, score);

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
