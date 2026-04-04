import { Resend } from "resend";
import admin from "firebase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔥 INIT FIREBASE
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

export default async function handler(req, res) {

  if(req.method !== "POST"){
    return res.status(405).json({ error: "Method not allowed" });
  }

  try{

    const { email, lang = "it", roi, city } = req.body;

    if(!email){
      return res.status(400).json({ error: "Email missing" });
    }

    // =========================
    // 🔒 ANTI SPAM (1 EMAIL / 10 MIN)
    // =========================

    const existing = await db.collection("email_logs")
      .where("email","==",email)
      .orderBy("createdAt","desc")
      .limit(1)
      .get();

    if(!existing.empty){
      const last = existing.docs[0].data();
      const now = Date.now();

      if(last.createdAt?.toMillis){
        const diff = now - last.createdAt.toMillis();

        if(diff < 10 * 60 * 1000){
          console.log("⛔ Email già inviata recentemente");
          return res.status(200).json({ skipped:true });
        }
      }
    }

    // =========================
    // 💰 LEAD SCORING
    // =========================

    let score = "cold";
    if(roi > 12) score = "hot";
    else if(roi > 8) score = "warm";

    // =========================
    // ✉️ CONTENUTO (CONVERSION OPTIMIZED)
    // =========================

    const content = {

      it: {
        subject: "⚠️ Stai per perdere soldi (analisi reale)",
        html: `
        <div style="font-family:Arial;padding:20px;max-width:600px">

        <h2>Il tuo investimento è davvero profittevole?</h2>

        <p style="font-size:15px">
        Il <strong>72% degli investitori</strong> sbaglia le previsioni.
        </p>

        <ul>
        <li>ROI sovrastimato</li>
        <li>Costi nascosti</li>
        <li>Mutuo non sostenibile</li>
        </ul>

        <div style="margin:20px 0">
        <a href="https://www.rendimentobb.it/tool/" 
        style="background:#10b981;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">
        🔥 Analizza il tuo investimento ora
        </a>
        </div>

        <p style="font-size:13px;color:#64748b">
        Bastano 30 secondi per evitare errori da migliaia di euro.
        </p>

        </div>
        `
      },

      en: {
        subject: "⚠️ Your investment may lose money",
        html: `
        <div style="font-family:Arial;padding:20px;max-width:600px">

        <h2>Is your investment really profitable?</h2>

        <p>
        <strong>72% of investors</strong> miscalculate returns.
        </p>

        <ul>
        <li>Overestimated ROI</li>
        <li>Hidden costs</li>
        <li>Unsustainable mortgage</li>
        </ul>

        <div style="margin:20px 0">
        <a href="https://www.rendimentobb.it/tool/" 
        style="background:#10b981;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">
        🔥 Analyze your investment now
        </a>
        </div>

        <p style="font-size:13px;color:#64748b">
        It takes 30 seconds to avoid costly mistakes.
        </p>

        </div>
        `
      }

    };

    const selected = content[lang] || content.it;

    // =========================
    // 🚀 INVIO EMAIL
    // =========================

    const response = await resend.emails.send({
      from: "RendimentoBB <noreply@rendimentobb.it>",
      to: [email],
      subject: selected.subject,
      html: selected.html
    });

    // =========================
    // 📊 TRACKING (CRM)
    // =========================

    await db.collection("email_logs").add({
      email,
      type: "retargeting",
      score,
      roi: roi || null,
      city: city || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // =========================
    // 👤 USER DB (BASE CRM)
    // =========================

    await db.collection("users").doc(email).set({
      email,
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      lastROI: roi || null,
      lastCity: city || null,
      score
    }, { merge:true });

    console.log("📨 Email inviata + tracking:", email, score);

    return res.status(200).json({ 
      success: true,
      score
    });

  }catch(err){

    console.error("❌ EMAIL ENGINE ERROR:", err);

    return res.status(500).json({ error: "Email failed" });

  }

}
