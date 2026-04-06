// send-lead-partner.js

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

export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    const { email, city, roi } = req.body;

    const roiRounded = Number(roi.toFixed(1));
    const priority = roiRounded > 15 ? "URGENT" : "HIGH";

    await resend.emails.send({
      from: "RendimentoBB Leads <lead@rendimentobb.it>",
      to: ["rendimentobb@gmail.com"],
      subject: `🔥 ${priority} Investment (${roiRounded}%)`,
      html: `
<div style="font-family:Inter;background:#0f172a;padding:40px">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:20px;padding:30px">
    <img src="https://rendimentobb.it/img/logo-main.png" width="120"/>
    <h2>🔥 Investment Lead</h2>
    <h1 style="color:#10b981">${roiRounded}%</h1>
    <p>Email: ${email}</p>
    <p>City: ${city}</p>

    <a href="mailto:${email}"
    style="background:#10b981;color:white;padding:12px 20px;border-radius:8px;text-decoration:none">
    Contatta subito
    </a>
  </div>
</div>`
    });

    return res.status(200).json({ success:true });

  }catch(err){
    console.error("Partner error:", err);
    return res.status(500).json({ error:"server error" });
  }
}
