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
function t(lang, it, en){
  return lang === "en" ? en : it;
}

function buildFunnelEmail({ roi, city, type, lang, stepType }){

  let title = "";
  let subtitle = "";
  let warning = "";
  let cta = t(lang,"Sblocca analisi completa","Unlock full analysis");

  if(stepType === "reminder_1"){
    title = t(lang,
      "Stai sottovalutando il rischio",
      "You may be underestimating risk"
    );

    subtitle = t(lang,
      "Molti investitori pensano di avere ROI alto… ma non è così",
      "Many investors think they have high ROI… but they don’t"
    );

    warning = t(lang,
      "Il 72% degli investimenti B&B performa sotto il 5% reale.",
      "72% of B&B investments perform below 5% real ROI."
    );
  }

  if(stepType === "reminder_2"){
    title = t(lang,
      "Ultima occasione per evitare un errore",
      "Last chance to avoid a costly mistake"
    );

    subtitle = t(lang,
      "Stai per prendere una decisione senza dati reali",
      "You are about to make a decision without real data"
    );

    warning = t(lang,
      "Un errore qui può costarti migliaia di euro ogni anno.",
      "A mistake here could cost you thousands every year."
    );
  }

  return `
  <div style="font-family:Inter,Arial;background:#0f172a;padding:40px">

    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:20px;padding:40px">

      <!-- LOGO -->
      <div style="text-align:center;margin-bottom:25px">
        <img src="https://rendimentobb.it/img/logo-main.png" style="width:120px">
      </div>

      <!-- TITLE -->
      <h2 style="text-align:center;color:#0f172a">
        ${title}
      </h2>

      <p style="text-align:center;color:#64748b;margin-bottom:25px">
        ${subtitle}
      </p>

      <!-- ROI -->
      <div style="text-align:center;margin:30px 0">
        <div style="font-size:52px;font-weight:800;color:#10b981">
          ${roi}%
        </div>
        <div style="color:#64748b">${city}</div>
      </div>

      <!-- WARNING -->
      <div style="background:#fee2e2;padding:16px;border-radius:12px;color:#991b1b;font-weight:600">
        ⚠️ ${warning}
      </div>

      <!-- VALUE -->
      <div style="margin-top:25px;background:#f8fafc;padding:18px;border-radius:12px">
        <ul style="padding-left:18px;margin:0;color:#334155">
          <li>${t(lang,"Profitto reale mensile","Real monthly profit")}</li>
          <li>${t(lang,"Break-even occupancy","Break-even occupancy")}</li>
          <li>${t(lang,"Scenario rischio","Risk scenario")}</li>
          <li>${t(lang,"Impatto mutuo","Mortgage impact")}</li>
        </ul>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin:35px 0">
        <a href="https://rendimentobb.it/dashboard"
        style="background:#10b981;color:white;padding:16px 28px;border-radius:999px;text-decoration:none;font-weight:700">
        🔥 ${cta}
        </a>
      </div>

      <!-- FOOTER -->
      <div style="text-align:center;color:#94a3b8;font-size:13px">
        RendimentoBB – ${t(lang,
          "Motore decisionale per investimenti B&B",
          "Decision engine for B&B investments")}
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

      const createdAt = data.createdAt?.toMillis?.() || now;

      const email = data.email;
      const roi   = data.roi;
      const city  = data.city;
      const type  = data.type || "tool";
      const lang  = data.lang || "it";

      const steps = data.steps || [];
      const sentSteps = data.sentSteps || [];

      for(let i=0; i<steps.length; i++){

        const step = steps[i];

        // skip già inviati
        if(sentSteps.includes(i)) continue;

        // skip instant
        if(step.type === "instant") continue;

        const shouldSend = now >= (createdAt + step.delay);

        if(!shouldSend) continue;

        let subject = "";

        if(step.type === "reminder_1"){
          subject = t(lang,
            "⏳ Hai davvero analizzato questo investimento?",
            "⏳ Did you really analyze this investment?"
          );
        }

        if(step.type === "reminder_2"){
          subject = t(lang,
            "⚠️ Ultima occasione prima di sbagliare investimento",
            "⚠️ Last chance before making a bad investment"
          );
        }

        const html = buildFunnelEmail({
          roi,
          city,
          type,
          lang,
          stepType: step.type
        });

        try{

          await resend.emails.send({
            from: "RendimentoBB <analisi@rendimentobb.it>",
            to: [email],
            subject,
            html
          });

          console.log("📩 FUNNEL SENT:", email, step.type);

          await db.collection("email_funnel").doc(doc.id).update({
            sentSteps: [...sentSteps, i]
          });

        }catch(e){
          console.error("Email error:", e.message);
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
