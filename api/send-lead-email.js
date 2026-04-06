import { Resend } from "resend";
import admin from "firebase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

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

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { email, roi, city } = req.body || {};

    const cleanEmail = String(email || "").trim();
    const roiRounded = Number(Number(roi || 0).toFixed(1));
    const cleanCity = String(city || "");

    if (!cleanEmail) {
      return res.status(400).json({ error: "Email missing" });
    }

    // ================= EMAIL =================
    await resend.emails.send({
      from: "RendimentoBB <analisi@rendimentobb.it>",
      to: [cleanEmail],
      subject: `💰 Il tuo investimento (${roiRounded}%)`,
      html: `
        <h2>Analisi investimento</h2>
        <p>ROI: ${roiRounded}%</p>
        <p>Città: ${cleanCity}</p>
      `
    });

    // ================= LOG (SAFE) =================
    if (db) {
      try{
        await db.collection("email_logs").add({
          email: cleanEmail,
          roi: roiRounded,
          city: cleanCity,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){
        console.warn("⚠️ log skip");
      }
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("💥 Email error:", err);
    return res.status(500).json({ success: false });
  }
}
