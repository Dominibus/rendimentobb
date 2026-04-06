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

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    let { email, city, roi, plan } = req.body || {};

    email = String(email || "").trim();
    city = String(city || "").toLowerCase();
    roi = Number(roi || 0);

    if(!email){
      return res.status(400).json({ error:"Email richiesta" });
    }

    const roiRounded = Number(roi.toFixed(1));

    let value = roiRounded > 20 ? 140 :
                roiRounded > 16 ? 110 :
                roiRounded > 12 ? 70 : 30;

    if(plan === "pro") value *= 1.5;

    const priority = roiRounded > 15 ? "URGENT" : "HIGH";

    // SAVE SAFE
    if(db){
      try{
        await db.collection("leads").add({
          email, city, roi: roiRounded, value, priority,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }catch(e){}
    }

    // EMAIL DESIGN PRO
    await resend.emails.send({
      from: "RendimentoBB <info@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],
      reply_to: email,
      subject: `🔥 ${priority} Lead – €${value}`,
      html: `
<div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

  <div style="max-width:620px;margin:auto;background:#ffffff;border-radius:20px;padding:35px">

    <div style="text-align:center;margin-bottom:25px">
      <img src="https://rendimentobb.it/img/logo-main.png" style="width:130px">
    </div>

    <h2 style="text-align:center;color:#0f172a;margin-bottom:10px">
      💰 New Investment Lead
    </h2>

    <p style="text-align:center;color:#64748b;font-size:14px">
      High intent user detected
    </p>

    <div style="text-align:center;margin:30px 0">
      <div style="font-size:48px;font-weight:800;color:#10b981">
        €${value}
      </div>
      <div style="color:#64748b;font-size:14px">
        Lead Value
      </div>
    </div>

    <div style="background:#f8fafc;padding:18px;border-radius:12px">

      <p><strong>Email:</strong> ${email}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>ROI:</strong> ${roiRounded}%</p>
      <p><strong>Priority:</strong> ${priority}</p>

    </div>

    <div style="text-align:center;margin-top:30px">
      <a href="mailto:${email}" 
      style="background:#10b981;color:white;padding:14px 24px;border-radius:999px;text-decoration:none;font-weight:600">
      Contatta lead
      </a>
    </div>

  </div>
</div>
`
    });

    return res.status(200).json({ success:true });

  }catch(err){
    console.error(err);
    return res.status(500).json({ error:"server error" });
  }
}
