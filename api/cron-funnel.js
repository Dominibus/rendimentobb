// ===============================
// 🚀 EMAIL FUNNEL – ULTRA SAAS FINAL
// ===============================

import { Resend } from "resend";
import admin from "firebase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

// ================= FIREBASE =================
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

// ================= HELPERS =================
const safe = n => isNaN(Number(n)) ? 0 : Number(n);

function t(lang, it, en){
  return lang === "en" ? en : it;
}

// ================= SCORE FILTER =================
function isLeadWorth(roi){
  return roi >= 8; // 🔥 filtro base (taglia spam)
}

// ================= TEMPLATE =================
function buildFunnelEmail({ roi, city, lang, stepType }){

  const hasROI = roi > 0;

  const tLocal = (it,en)=> lang==="en"?en:it;

  let title = "";
  let subtitle = "";
  let urgency = "";
  let warning = "";

  if(stepType === "reminder_1"){
    title = tLocal(
      "Stai sottovalutando il rischio",
      "You may be underestimating risk"
    );

    subtitle = tLocal(
      "Molti investimenti sembrano profittevoli… ma non lo sono",
      "Many investments look profitable… but they are not"
    );

    urgency = "⚡ " + tLocal(
      "I dati reali cambiano tutto",
      "Real data changes everything"
    );

    warning = tLocal(
      "Il 72% degli investimenti scende sotto il 5% reale.",
      "72% of investments drop below 5% real return."
    );
  }

  if(stepType === "reminder_2"){
    title = tLocal(
      "Stai per fare un errore costoso",
      "You are about to make a costly mistake"
    );

    subtitle = tLocal(
      "Ultima verifica prima di investire",
      "Final check before investing"
    );

    urgency = "⏳ " + tLocal(
      "Le migliori opportunità spariscono in ore",
      "Best opportunities disappear in hours"
    );

    warning = tLocal(
      "Questo errore può costarti migliaia di euro l’anno.",
      "This mistake can cost you thousands per year."
    );
  }

  const roiBlock = hasROI
    ? `
      <div style="text-align:center;margin:30px 0">
        <div style="font-size:60px;font-weight:900;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">${city || "-"}</div>
      </div>
    `
    : "";

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:22px;padding:40px">

      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <h2 style="text-align:center;color:#0f172a">${title}</h2>

      <p style="text-align:center;color:#64748b;margin-bottom:15px">
        ${subtitle}
      </p>

      <p style="text-align:center;color:#dc2626;font-weight:600">
        ${urgency}
      </p>

      ${roiBlock}

      <div style="background:#fee2e2;padding:16px;border-radius:12px;color:#991b1b;font-weight:600">
        ⚠️ ${warning}
      </div>

      <div style="margin-top:25px;background:#f8fafc;padding:18px;border-radius:12px">
        <ul style="padding-left:18px;margin:0;color:#334155">
          <li>${tLocal("Profitto reale","Real profit")}</li>
          <li>${tLocal("Break-even","Break-even")}</li>
          <li>${tLocal("Rischio","Risk")}</li>
          <li>${tLocal("Mutuo","Mortgage impact")}</li>
        </ul>
      </div>

      <div style="text-align:center;margin:35px 0">
        <a href="https://rendimentobb.it/dashboard"
        style="background:#10b981;color:white;padding:16px 28px;border-radius:999px;text-decoration:none;font-weight:800">
        🔥 ${tLocal("Sblocca analisi completa","Unlock full analysis")}
        </a>
      </div>

      <div style="text-align:center;color:#94a3b8;font-size:12px">
        RendimentoBB Funnel Engine
      </div>

    </div>

  </div>
  `;
}

// ================= HANDLER =================
export default async function handler(req, res){

  try{

    const now = Date.now();

    const snapshot = await db.collection("email_funnel").get();

    for(const doc of snapshot.docs){

      const data = doc.data();

      const email = data.email;
      const roi   = safe(data.roi);
      const city  = data.city || "";
      const lang  = data.lang || "it";

      // 🔥 filtro qualità
      if(!isLeadWorth(roi)) continue;

      const createdAt = data.createdAt?.toMillis?.() || now;

      const steps = data.steps || [];
      let sentSteps = data.sentSteps || [];

      for(let i=0; i<steps.length; i++){

        const step = steps[i];

        if(sentSteps.includes(i)) continue;
        if(step.type === "instant") continue;

        const sendAt = createdAt + step.delay;

        if(now < sendAt) continue;

        // 🔥 LOCK ANTI DUPLICATO (prima di inviare)
        await db.collection("email_funnel").doc(doc.id).update({
          sending: true
        });

        let subject = "";

        if(step.type === "reminder_1"){
          subject = lang === "en"
            ? "⚠️ Your ROI might be wrong"
            : "⚠️ Il tuo ROI potrebbe essere sbagliato";
        }

        if(step.type === "reminder_2"){
          subject = lang === "en"
            ? "⏳ Final check before investing"
            : "⏳ Ultimo controllo prima di investire";
        }

        try{

          await resend.emails.send({
            from: "RendimentoBB <analisi@rendimentobb.it>",
            to: [email],
            subject,

            text: `
Reminder investimento

ROI: ${roi}%
City: ${city}

https://rendimentobb.it/dashboard
            `,

            html: buildFunnelEmail({
              roi,
              city,
              lang,
              stepType: step.type
            })
          });

          console.log("📩 FUNNEL SENT:", email, step.type);

          sentSteps.push(i);

          await db.collection("email_funnel").doc(doc.id).update({
            sentSteps,
            lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
            sending: false
          });

        }catch(e){

          console.error("❌ Funnel error:", e.message);

          await db.collection("email_funnel").doc(doc.id).update({
            sending: false
          });
        }
      }
    }

    return res.status(200).json({ success:true });

  }catch(err){

    console.error("💥 FUNNEL ERROR:", err);

    return res.status(500).json({
      error:"cron error"
    });

  }
}
