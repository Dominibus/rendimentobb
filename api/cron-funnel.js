import {queueDailyReminders} from "../lib/pms-reminders.js";
// ===============================
// 🚀 EMAIL FUNNEL – ULTRA SAAS FINAL
// ===============================

import {drainTaskNotifications} from "../lib/pms-notification-queue.js";
import { Resend } from "resend";
import admin from "firebase-admin";
import crypto from "node:crypto";
import { buildBrandedEmail, sendCheckedEmail } from "../lib/email-templates.js";

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
function buildFunnelEmail({roi,city,lang,stepType}){
  const en=lang === "en";
  return buildBrandedEmail({lang,title:stepType === "reminder_1" ? (en?"Review your investment assumptions":"Rivedi le ipotesi del tuo investimento") : (en?"Continue your saved analysis":"Riprendi la tua analisi"),intro:en?"Review the scenario before moving forward: rental rates, occupancy, recurring costs and loan payments can change its results.":"Rivedi lo scenario prima di proseguire: tariffe, occupazione, costi ricorrenti e rate possono modificarne i risultati.",rows:[[en?"City":"Città",city||"—"],[en?"Recorded estimated ROI":"ROI stimato registrato",`${new Intl.NumberFormat(en?"en-GB":"it-IT",{maximumFractionDigits:1}).format(roi)}%`]],note:en?"This is a reminder about a simulation, not verified income or a current market appraisal. You can compare conservative assumptions in the simulator.":"Questo promemoria riguarda una simulazione, non incassi verificati o una perizia di mercato. Puoi confrontare ipotesi prudenti nel simulatore.",ctaLabel:en?"Open the simulator":"Apri il simulatore",ctaURL:"https://rendimentobb.it/tool/",secondaryLabel:en?"Contact us about these emails":"Contattaci per queste email",secondaryURL:"https://rendimentobb.it/contact.html",eyebrow:en?"Investment analysis · Reminder":"Analisi investimento · Promemoria"}).html;
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
    let pmsNotifications,pmsReminders,pmsError=false;
    try{
      try{
      pmsReminders=process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production' ? {skipped:true,reason:'production_only'} : await queueDailyReminders({db,getAuthUser:uid=>admin.auth().getUser(uid),timestamp:()=>admin.firestore.FieldValue.serverTimestamp(),now});
      }catch{pmsReminders={errors:1};console.error('PMS reminder generation failed');}
      pmsNotifications=process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production' ? {checked:0,sent:0,retry:0,manualReview:0,suppressed:0,errors:0,skipped:true,reason:'production_only'} : await drainTaskNotifications({db,resend,getAuthUser:uid=>admin.auth().getUser(uid),timestamp:()=>admin.firestore.FieldValue.serverTimestamp(),now});
      pmsError=pmsNotifications.errors>0 || (pmsReminders.errors || 0)>0;
      await db.collection('_pms_jobs').doc('task_notifications').set({lastRunAt:admin.firestore.FieldValue.serverTimestamp(),success:!pmsError,...pmsNotifications});
    }catch{
      pmsError=true;
      console.error('PMS notification recovery failed');
    }


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
      if(data.sending === true && now - Number(data.sendingStartedAt || 0) < 10*60*1000) continue;

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

        const funnelRef=db.collection("email_funnel").doc(doc.id);
        const acquired=await db.runTransaction(async tx=>{
          const fresh=await tx.get(funnelRef);const state=fresh.data()||{};
          if((state.sentSteps||[]).includes(i) || (state.sending===true && now-Number(state.sendingStartedAt||0)<10*60*1000))return false;
          tx.update(funnelRef,{sending:true,sendingStartedAt:now});return true;
        });
        if(!acquired)continue;

        let subject = "";

        if(step.type==="reminder_1"){

          subject = lang==="en"

          ? `📈 Review your investment assumptions${roi>0?` • ROI ${roi}%`:""}`

          : `📈 Rivedi le ipotesi del tuo investimento${roi>0?` • ROI ${roi}%`:""}`;

        }

        if(step.type==="reminder_2"){

          subject = lang==="en"

          ? "🚀 Complete your Executive Investment Analysis"

          : "🚀 Completa la tua Analisi Executive";

        }

        try{

          await sendCheckedEmail(resend,{

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

          }, {idempotencyKey:`rb-funnel-${doc.id}-${i}`});

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

    return res.status(pmsError?503:200).json({success:!pmsError,pmsNotifications:pmsNotifications || null,pmsReminders:pmsReminders || null,...(pmsError?{error:"pms_recovery_failed"}:{})});

  }

  catch(err){

    return res.status(500).json({

      success:false,

      error:"cron_error"

    });

  }

}
