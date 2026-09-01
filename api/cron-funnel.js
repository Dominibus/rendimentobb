// ===============================
// 🚀 EMAIL FUNNEL – ULTRA SAAS FINAL
// ===============================

import { Resend } from "resend";
import admin from "firebase-admin";
import crypto from "node:crypto";

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

function hasValidCronAuthorization(req) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = req.headers.authorization;

  if (!cronSecret || typeof authorization !== "string") {
    return false;
  }

  const expected = Buffer.from(`Bearer ${cronSecret}`);
  const received = Buffer.from(authorization);

  return expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);
}

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
      "Il tuo investimento potrebbe rendere molto di più",
      "Your investment could perform much better"
    );

    subtitle = tLocal(
      "La nostra AI ha individuato dati che la maggior parte degli investitori non vede.",
      "Our AI detected insights that most investors completely miss."
    );

    urgency =
      "📊 " +
      tLocal(
        "Confronta il tuo investimento con il mercato reale",
        "Compare your investment with the real market"
      );

    warning = tLocal(
      "Il ROI apparente spesso è molto diverso dal ROI reale dopo costi, tasse e mutuo.",
      "Expected ROI is often very different from the real ROI after costs, taxes and financing."
    );

  }

  if(stepType === "reminder_2"){

    title = tLocal(
      "Hai visto solo una parte dell'analisi",
      "You have only seen part of the analysis"
    );

    subtitle = tLocal(
      "La dashboard completa mostra dati che cambiano completamente la valutazione di un investimento.",
      "The complete dashboard reveals insights that completely change investment decisions."
    );

    urgency =
      "🚀 " +
      tLocal(
        "Oltre 1.200 investitori utilizzano già questi dati",
        "Over 1,200 investors already use these insights"
      );

    warning = tLocal(
      "Investire senza vedere cashflow, rischio e benchmark aumenta la probabilità di errore.",
      "Investing without cashflow, risk and benchmark analysis increases the probability of mistakes."
    );

  }

  const roiBlock = hasROI
  ? `
  <div style="text-align:center;margin:36px 0;">

    <div style="
    font-size:14px;
    color:#64748b;
    letter-spacing:.5px;
    text-transform:uppercase;
    margin-bottom:8px;
    ">

      ${tLocal("ROI Stimato","Estimated ROI")}

    </div>

    <div style="
    font-size:64px;
    font-weight:900;
    color:#10b981;
    line-height:1;
    ">

      ${roi}%

    </div>

    <div style="
    margin-top:10px;
    color:#64748b;
    font-size:16px;
    ">

      📍 ${city || "-"}

    </div>

    <div style="
    margin-top:18px;
    display:inline-block;
    background:#ecfdf5;
    color:#059669;
    padding:8px 18px;
    border-radius:999px;
    font-size:13px;
    font-weight:700;
    ">

      🧠 ${tLocal(
        "AI Executive Analysis Ready",
        "AI Executive Analysis Ready"
      )}

    </div>

  </div>
  `
  : "";

  return `
  <div style="
  font-family:Inter,Arial,sans-serif;
  background:#0f172a;
  padding:40px;
  ">

    <div style="
    max-width:680px;
    margin:auto;
    background:#ffffff;
    border-radius:24px;
    overflow:hidden;
    ">

      <div style="
      padding:40px;
      text-align:center;
      ">

        <img
        src="https://rendimentobb.it/img/logo-main.png"
        style="
        width:130px;
        margin-bottom:30px;
        ">

        <h2 style="
        margin:0;
        font-size:32px;
        color:#0f172a;
        line-height:1.2;
        ">

          ${title}

        </h2>

        <p style="
        color:#64748b;
        font-size:17px;
        line-height:1.7;
        margin:20px 0 10px;
        ">

          ${subtitle}

        </p>

        <div style="
        display:inline-block;
        margin-top:18px;
        padding:10px 18px;
        border-radius:999px;
        background:#eff6ff;
        color:#2563eb;
        font-weight:700;
        font-size:14px;
        ">

          ${urgency}

        </div>

        ${roiBlock}

        <div style="
        background:#fff7ed;
        border:1px solid #fdba74;
        color:#9a3412;
        padding:18px;
        border-radius:16px;
        font-size:15px;
        line-height:1.7;
        margin-top:30px;
        ">

          ⚠️ ${warning}

        </div>

        <div style="
        margin-top:28px;
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:16px;
        padding:24px;
        text-align:left;
        ">

          <div style="
          font-size:15px;
          font-weight:700;
          margin-bottom:16px;
          color:#0f172a;
          ">

            ${tLocal(
              "Dashboard Executive include:",
              "Executive Dashboard includes:"
            )}

          </div>

          <ul style="
          margin:0;
          padding-left:20px;
          color:#334155;
          line-height:2;
          ">

            <li>✔ ${tLocal("ROI reale","Real ROI")}</li>
            <li>✔ ${tLocal("Cashflow","Cashflow")}</li>
            <li>✔ ${tLocal("AI Executive Score","AI Executive Score")}</li>
            <li>✔ ${tLocal("Benchmark città","City benchmark")}</li>
            <li>✔ ${tLocal("Break-even","Break-even")}</li>
            <li>✔ ${tLocal("Simulazione mutuo","Mortgage simulation")}</li>
            <li>✔ ${tLocal("Dashboard investimenti","Investment dashboard")}</li>
            <li>✔ ${tLocal("Executive Report PDF","Executive PDF Report")}</li>

          </ul>

        </div>

        <div style="
        text-align:center;
        margin:36px 0;
        ">

          <a
          href="https://rendimentobb.it/dashboard"
          style="
          display:inline-block;
          background:#10b981;
          color:white;
          padding:18px 34px;
          border-radius:999px;
          text-decoration:none;
          font-weight:800;
          font-size:16px;
          ">

            🚀 ${tLocal(
              "Continua la tua analisi",
              "Continue your analysis"
            )}

          </a>

        </div>

        <div style="
        text-align:center;
        color:#94a3b8;
        font-size:13px;
        line-height:1.7;
        ">

          <strong>Powered by RendimentoBB AI</strong><br>

          ${tLocal(
            "Investment Intelligence Platform",
            "Investment Intelligence Platform"
          )}

        </div>

      </div>

    </div>

  </div>
  `;
}

// ================= HANDLER =================
export default async function handler(req, res){

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success:false, error:"method_not_allowed" });
  }

  if (!hasValidCronAuthorization(req)) {
    return res.status(401).json({ success:false, error:"unauthorized" });
  }

  try{

    const now = Date.now();

    const snapshot = await db.collection("email_funnel").get();

    for(const doc of snapshot.docs){

      const data = doc.data();

      const email = data.email;
      const roi   = safe(data.roi);
      const city  = data.city || "";
      const lang  = data.lang || "it";

      // ================= QUALITY FILTER =================
      if(!isLeadWorth(roi)) continue;

      // ================= ANTI DOUBLE SEND =================
      if(data.sending === true) continue;

      const createdAt = data.createdAt?.toMillis?.() || now;

      const steps = data.steps || [];
      let sentSteps = data.sentSteps || [];

      for(let i=0;i<steps.length;i++){

        const step = steps[i];

        if(sentSteps.includes(i)) continue;
        if(step.type === "instant") continue;

        const sendAt = createdAt + step.delay;

        if(now < sendAt) continue;

        // ================= LOCK =================

        await db.collection("email_funnel").doc(doc.id).update({
          sending:true
        });

        let subject = "";

        if(step.type==="reminder_1"){

          subject = lang==="en"

          ? `📈 Your investment could perform better${roi>0?` • ROI ${roi}%`:""}`

          : `📈 Il tuo investimento potrebbe rendere di più${roi>0?` • ROI ${roi}%`:""}`;

        }

        if(step.type==="reminder_2"){

          subject = lang==="en"

          ? "🚀 Complete your Executive Investment Analysis"

          : "🚀 Completa la tua Analisi Executive";

        }

        try{

          await resend.emails.send({

            from:"RendimentoBB <analisi@rendimentobb.it>",

            to:[email],

            subject,

            text:`

${lang==="en"
? "Your investment analysis is waiting for you."
: "La tua analisi investimento ti sta aspettando."}

ROI: ${roi}%

${city}

https://rendimentobb.it/dashboard

            `,

            html:buildFunnelEmail({

              roi,

              city,

              lang,

              stepType:step.type

            })

          });

          sentSteps.push(i);

          await db.collection("email_funnel").doc(doc.id).update({

            sentSteps,

            sending:false,

            lastSentAt:
            admin.firestore.FieldValue.serverTimestamp()

          });

        }

        catch(e){

          await db.collection("email_funnel").doc(doc.id).update({

            sending:false,

            lastError:e.message,

            lastErrorAt:
            admin.firestore.FieldValue.serverTimestamp()

          });

        }

      }

    }

    return res.status(200).json({

      success:true

    });

  }

  catch(err){

    return res.status(500).json({

      success:false,

      error:"cron_error"

    });

  }

}
