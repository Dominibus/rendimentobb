// send-lead.js

import { Resend } from "resend";
import admin from "firebase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

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

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    const { email, city, roi } = req.body;

    const roiRounded = Number(roi.toFixed(1));
    const value = roiRounded > 20 ? 140 :
                  roiRounded > 16 ? 110 :
                  roiRounded > 12 ? 70 : 30;

    const priority = roiRounded > 15 ? "URGENT" : "HIGH";

    await db.collection("leads").add({
      email, city, roi: roiRounded, value, priority,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await resend.emails.send({
      from: "RendimentoBB <info@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],
      subject: `🔥 ${priority} Lead – €${value}`,
      html: `
<div style="font-family:Inter;background:#0f172a;padding:40px">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:20px;padding:30px">
    <img src="https://rendimentobb.it/img/logo-main.png" width="120"/>
    <h2>💰 New Lead</h2>
    <h1 style="color:#10b981">€${value}</h1>
    <p>Email: ${email}</p>
    <p>City: ${city}</p>
    <p>ROI: ${roiRounded}%</p>
  </div>
</div>`
    });

    return res.status(200).json({ success:true });

  }catch(err){
    console.error(err);
    return res.status(500).json({ error:"server error" });
  }
}
