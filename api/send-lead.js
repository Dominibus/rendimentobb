import { Resend } from "resend";
import admin from "firebase-admin";

// ================= RESEND =================
const resend = new Resend(process.env.RESEND_API_KEY);

// ================= FIREBASE INIT =================
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID=rendimento-bb,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rendimento-bb.iam.gserviceaccount.com,
        privateKey: process.env.FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDg4SP+8V1MBdIi\n/6jyJHuGpp8HVY4vtvlq+4ByCLtqTeBtzmV1/J3Orsy8Pt/1b8TFQT0t4YYLq6kk\ngYiV/7aFQog4Ujud718W+jqHyYk9e5CG5fvH7kyFsnAS+iY5+UIjzrUfgH1SH/pG\nDAfrD5okDPmz4le6ktPsl82/QQuCi7WjXpQRzB5LNGlt0grHMG0fxwVDzBLhO+1K\nu5kAKoT3m6qmlZH7EVuUMlFFBpE+hWF8g/qHg3py27AS+y+ZZDLsO4rQthkvQWub\nF/g2RTn4ievTtl25+70QzTtHtVz5mY9SMUaj4DbiAFiT9y3lvcsysybV13X19n/u\nx7Q6zqYdAgMBAAECggEAB5AwPJH+lXYj/U8EQ3HsVk4tTrsBvLjBMRLDXP0j3IKW\nV+sXU31gYK6qrnFzk9bN/eULUIs4uGoYwWRlOnJEFRL0mjxTH/qIhAZ8yHYD78ru\nRJ3gjCFcy9RWsPSz1hhRhqXG8V0fbznUb4hWYyv+VFRmuODrGsMhwzUkfi21sY6+\n2ofUb6s1bQlqvSEQgYg2fZKz/74PbvLQXZzV3rgENP4Sioh9ErtcMsvhJsZOGS7f\nqMww2ud+bspA8tlVaCikr8/00vm+oinyBKyhHYYWSKOndZWuySo2vW1mKR1DIkJ1\nDL6qOlS7DcADFKSBjp4kDFLXM0z5UZhfC2BZJTozUQKBgQD7u/pU1T/ZF+JxFuBD\nU4xVStTMghjJotqheZ5c44Iat8FOyteieuja0TC7seDJF34lXUT9+KVEEdA5Lrlx\n6UiLZb5iEUHJS31ytTwcQcMSLaczSMS55DBIAUx6y7jnwoZYCdjx/QYyiShEzZtT\no5jTeHiK1V1OrrQGGG6WhXwHBQKBgQDksKqnPkrova9WQXsQiJlO94PgeXO8L6i/\nAE2hSUA5MnHTW6HMDRs2blQSWm+RMtHxdeMjTOCS1c46ntj4EgLlIBd1pJQVhM8U\n3+YkmsOREeBARIFw3aJuTs3wQavxBZFjtBUCXUx9bdbMywh/DUarNldkD/FXeE7t\nAPJTjSyeOQKBgDnZ0ESwoTSt1X8xx6YRTD3Jra+18iZcg6v6PBeSvTKQqh8GZJnV\nby/iRTXNQiBUgsvpbFKFUs2a3mRVxY5VEzPd1OvKlXjCHXlAByljP4Ys8bDKd1NV\nCndxvPa3XK3+OUuAL9gk0sjIVnXBXoHRJezrUaBuOjw7z+lasgdrc75VAoGALA/J\n4Y1D+5HIfZMCNg5Lk4Zm91IPNXvtRFe3nVKyuBJ7EeD+zITd8F/TfPHFuzESeDZh\nfASs5D2jjXHblfhKbIEBZB5AleDP0VLOUdErywCpt1g7pFZfnGc8kITmrvqGp7Ij\nth/pw+Ts1OptiaUyL3y528KimlrIwitDhUuXBCkCgYBIp2Sop4uwn6Hh/LnIGhGv\nZDYCJqdriU0+q8VmkQFqPs9Rhh5BGWjjTTtZGbO6M80Ee5qR+8EXfogLbXRUG/lk\nO9b+jHyK89flLLYl+jloL7BzMdSLDdCbDQEHriZ82Ll6BrWZW77VcRT0GzsmDbQk\nCdBgN09mTSTkYgeg9q9bFA==\n-----END PRIVATE KEY-----\n
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          : undefined
      })
    });
  } catch (e) {
    console.error("🔥 Firebase init error:", e);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ================= HANDLER =================
export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ error:"Method not allowed" });
  }

  try{

    let {
      type = "simulatore",
      email,
      phone,
      city,
      budget,
      amount,
      years,
      name,
      message,
      roi,
      plan
    } = req.body || {};

    // ================= SANITIZE =================
    email = String(email || "").trim();
    city = String(city || "").toLowerCase();
    type = String(type || "simulatore").toLowerCase();
    roi = Number(roi || 0);
    budget = Number(budget || 0);

    if(!email){
      return res.status(400).json({ error:"Email richiesta" });
    }

    const roiRounded = Number(roi.toFixed(1));

    // ================= SCORE =================
    let score = "cold";
    if(roiRounded > 12) score = "hot";
    else if(roiRounded > 8) score = "warm";

    // ================= VALUE =================
    let value = 15;

    if(type === "mutui") value = 40;
    if(type === "immobili") value = 80;

    if(type === "simulatore"){
      if(roiRounded > 20) value = 140;
      else if(roiRounded > 16) value = 110;
      else if(roiRounded > 12) value = 70;
      else value = 30;
    }

    if(type === "partner") value = 120;

    if(plan === "pro") value *= 1.5;

    value = Math.round(value);

    // ================= PRIORITY =================
    const priority = roiRounded > 15 ? "URGENT" : "HIGH";

    // ================= ANTI DUPLICATE =================
    if(db){
      const existing = await db.collection("leads")
        .where("email","==",email)
        .orderBy("createdAt","desc")
        .limit(1)
        .get();

      if(!existing.empty){
        const last = existing.docs[0].data();

        if(last?.createdAt?.toMillis){
          const diff = Date.now() - last.createdAt.toMillis();

          if(diff < 20 * 60 * 1000){
            console.log("⛔ Lead duplicato bloccato");
            return res.status(200).json({ skipped:true });
          }
        }
      }
    }

    // ================= SAVE FIRESTORE =================
    if(db){

      await db.collection("leads").add({
        type,
        email,
        phone: phone || null,
        city,
        budget,
        roi: roiRounded,
        value,
        score,
        priority,
        plan: plan || "free",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.collection("revenue").add({
        email,
        value,
        type,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    }

    // ================= EMAIL ADMIN (🔥 FIX CRITICO) =================
    try{

      const result = await resend.emails.send({
        from: "RendimentoBB <info@rendimentobb.it>",
        to: ["rendimentobb@gmail.com"],
        subject: `Lead investimento ${priority} - €${value}`,
        reply_to: email,
        html: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:30px">

  <div style="max-width:620px;margin:auto;background:white;padding:30px;border-radius:18px">

    <h2 style="text-align:center">💰 Nuovo lead</h2>

    <div style="text-align:center;font-size:34px;color:#10b981;font-weight:800;margin:20px 0">
      €${value}
    </div>

    <p><strong>Email:</strong> ${email}</p>
    <p><strong>ROI:</strong> ${roiRounded}%</p>
    <p><strong>Città:</strong> ${city}</p>
    <p><strong>Tipo:</strong> ${type}</p>
    <p><strong>Priority:</strong> ${priority}</p>

  </div>

</div>
`
      });

      console.log("📨 EMAIL ADMIN OK:", result);

    }catch(e){
      console.error("❌ RESEND ADMIN ERROR:", e);
    }

    // ================= PARTNER =================
    const partnerMap = {
      mutui: ["rendimentobb@gmail.com"],
      immobili: ["rendimentobb@gmail.com"],
      simulatore: roiRounded > 12 ? ["rendimentobb@gmail.com"] : []
    };

    const partners = partnerMap[type] || [];

    // ================= SEND PARTNERS =================
    await Promise.all(
      partners.map(async (p) => {

        try{

          const result = await resend.emails.send({
            from: "RendimentoBB Leads <info@rendimentobb.it>",
            to: [p],
            subject: `Lead ${priority} ${city.toUpperCase()} ${roiRounded}%`,
            html: `
<div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:30px">

  <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:18px">

    <h2>🔥 Investment Lead (${priority})</h2>

    <h1 style="color:#10b981">${roiRounded}%</h1>

    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Città:</strong> ${city}</p>

    <a href="mailto:${email}"
    style="display:inline-block;margin-top:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;text-decoration:none">
    Contatta lead
    </a>

  </div>

</div>
`
          });

          console.log("📨 PARTNER EMAIL OK:", result);

        }catch(e){
          console.error("❌ PARTNER EMAIL ERROR:", e);
        }

      })
    );

    console.log("💰 LEAD COMPLETATO:", value, priority);

    return res.status(200).json({
      success:true,
      value,
      score,
      priority
    });

  }catch(err){

    console.error("💥 LEAD ENGINE ERROR:", err);

    return res.status(500).json({
      error:"Errore server",
      details: err.message
    });

  }
}
