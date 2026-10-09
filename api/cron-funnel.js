import {scanFunnelDocuments} from "../lib/funnel-scan.js";
import {hasFunnelConsent,funnelUnsubscribeURL} from "../lib/funnel-consent.js";
import {queueDailyReminders} from "../lib/pms-reminders.js";
// ===============================
// 🚀 EMAIL FUNNEL – ULTRA SAAS FINAL
// ===============================

import {drainTaskNotifications} from "../lib/pms-notification-queue.js";
import { Resend } from "resend";
import admin from "firebase-admin";
import crypto from "node:crypto";
import { buildBrandedEmail, sendCheckedEmail } from "../lib/email-templates.js";

// Initialize only after authorization, inside the handler's error boundary.
function cronServices() {
  if (!admin.apps.length) {
    const {FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY} = process.env;
    if (![FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY].every(value => typeof value === "string" && value.trim())) {
      const error = new Error("cron_configuration_missing");
      error.code = "cron_configuration_missing";
      throw error;
    }
    admin.initializeApp({credential:admin.credential.cert({
      projectId:FIREBASE_PROJECT_ID,
      clientEmail:FIREBASE_CLIENT_EMAIL,
      privateKey:FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })});
  }
  return {db:admin.firestore(),resend:new Resend(process.env.RESEND_API_KEY)};
}

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

// ================= TEMPLATE =================
function buildFunnelEmail({roi,roiAvailable=true,city,lang,stepType,unsubscribeURL}){
  const en=lang === "en";
  return buildBrandedEmail({lang,title:stepType === "reminder_1" ? (en?"Review your investment assumptions":"Rivedi le ipotesi del tuo investimento") : (en?"Continue your saved analysis":"Riprendi la tua analisi"),intro:en?"Review the scenario before moving forward: rental rates, occupancy, recurring costs and loan payments can change its results.":"Rivedi lo scenario prima di proseguire: tariffe, occupazione, costi ricorrenti e rate possono modificarne i risultati.",rows:[[en?"City":"Città",city||"—"],[en?"Recorded estimated ROI":"ROI stimato registrato",roiAvailable ? `${new Intl.NumberFormat(en?"en-GB":"it-IT",{maximumFractionDigits:1}).format(roi)}%` : "N/A"]],note:en?"This is a reminder about a simulation, not verified income or a current market appraisal. You can compare conservative assumptions in the simulator.":"Questo promemoria riguarda una simulazione, non incassi verificati o una perizia di mercato. Puoi confrontare ipotesi prudenti nel simulatore.",ctaLabel:en?"Open the simulator":"Apri il simulatore",ctaURL:"https://rendimentobb.it/tool/",secondaryLabel:en?"Stop analysis reminders":"Interrompi i promemoria",secondaryURL:unsubscribeURL,eyebrow:en?"Investment analysis · Reminder":"Analisi investimento · Promemoria"}).html;
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

  if(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return res.status(200).json({success:true,skipped:true,reason:"production_only"});

  const runId = crypto.randomUUID();
  const startedAt = Date.now();
  let phase = "initialization";
  console.info("RB_CRON_START", {runId});
  try{
    const {db,resend} = cronServices();
    const now = startedAt;
    phase = "pms";
    let pmsNotifications,pmsReminders,pmsError=false;
    try{
      try{
      pmsReminders=process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production' ? {skipped:true,reason:'production_only'} : await queueDailyReminders({db,getAuthUser:uid=>admin.auth().getUser(uid),timestamp:()=>admin.firestore.FieldValue.serverTimestamp(),now});
      }catch{pmsReminders={errors:1};console.error('PMS reminder generation failed');}
      pmsNotifications=process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production' ? {checked:0,sent:0,retry:0,manualReview:0,suppressed:0,errors:0,skipped:true,reason:'production_only'} : await drainTaskNotifications({db,resend,getAuthUser:uid=>admin.auth().getUser(uid),timestamp:()=>admin.firestore.FieldValue.serverTimestamp(),now});
      pmsError=pmsNotifications.errors>0 || (pmsReminders.errors || 0)>0;
      await db.collection('_pms_jobs').doc('task_notifications').set({lastRunAt:admin.firestore.FieldValue.serverTimestamp(),success:!pmsError,reminderScan:pmsReminders,...pmsNotifications,needsAttention:!!(pmsNotifications.needsAttention || pmsReminders.needsAttention)});
    }catch{
      pmsError=true;
      console.error('PMS notification recovery failed');
    }


    phase = "analysis_reminders";
    const funnelStats={checked:0,sent:0,suppressed:0,errors:0,manualReview:0,budgetExhausted:false};
    const scanRef=db.collection("_pms_jobs").doc("analysis_reminders");
    const previousScan=await scanRef.get();
    const savedCursor=previousScan.data()?.cursor;
    const scan={cursor:typeof savedCursor === "string" ? savedCursor : ""};
    for await(const doc of scanFunnelDocuments({db,state:scan,deadline:now+48000})){
      if(Date.now()-now >= 48000){funnelStats.budgetExhausted=true;break;}

      const data = doc.data();

      funnelStats.checked++;
      if(!hasFunnelConsent(data)){funnelStats.suppressed++;continue;}
      const unsubscribeURL=funnelUnsubscribeURL(doc.id,process.env.CRON_SECRET);
      const email = data.email;
      const roi   = safe(data.roi);
      const roiAvailable = data.roiAvailable !== false;
      const city  = data.city || "";
      const lang  = data.lang || "it";


      // ================= ANTI DOUBLE SEND =================
      if(data.sending === true && now - Number(data.sendingStartedAt || 0) < 10*60*1000) continue;

      const createdAt = data.confirmedAt?.toMillis?.() || data.createdAt?.toMillis?.() || now;

      const steps = data.steps || [];
      let sentSteps = data.sentSteps || [];

      for(let i=0;i<steps.length;i++){

        if(Date.now()-now >= 48000){funnelStats.budgetExhausted=true;break;}
        const step = steps[i];

        if(sentSteps.includes(i)) continue;
        if(step.type === "instant") continue;

        const sendAt = createdAt + step.delay;

        if(now < sendAt) continue;

        // ================= LOCK =================

        const funnelRef=db.collection("email_funnel").doc(doc.id);
        const acquired=await db.runTransaction(async tx=>{
          const fresh=await tx.get(funnelRef);const state=fresh.data()||{};
          if(!hasFunnelConsent(state) || (state.sentSteps||[]).includes(i) || (state.sending===true && now-Number(state.sendingStartedAt||0)<10*60*1000))return false;
          const attempts=state.deliveryAttempts || {};
          const firstAt=Number(attempts[i]?.firstAt || now);
          // An ambiguous old send cannot be replayed beyond provider idempotency.
          if(now-firstAt >= 23*60*60*1000){
            funnelStats.manualReview++;
            tx.update(funnelRef,{sending:false,manualReview:true,reviewReason:"delivery_window_expired"});return false;
          }
          tx.update(funnelRef,{sending:true,sendingStartedAt:now,deliveryAttempts:{...attempts,[i]:{firstAt}}});return true;
        });
        if(!acquired)continue;

        let subject = "";

        if(step.type==="reminder_1"){

          subject = lang==="en"

          ? `📈 Review your investment assumptions${roiAvailable && roi>0?` • ROI ${roi}%`:""}`

          : `📈 Rivedi le ipotesi del tuo investimento${roiAvailable && roi>0?` • ROI ${roi}%`:""}`;

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
            headers:{"List-Unsubscribe":`<${unsubscribeURL}>`},

            text:`

${lang==="en"
? "Your investment analysis is waiting for you."
: "La tua analisi investimento ti sta aspettando."}

ROI: ${roiAvailable ? `${roi}%` : "N/A"}

${city}

https://rendimentobb.it/dashboard

${lang==="en"?"Stop analysis reminders":"Interrompi i promemoria"}: ${unsubscribeURL}

            `,

            html:buildFunnelEmail({

              roi,
              roiAvailable,

              city,

              lang,

              stepType:step.type,
              unsubscribeURL

            })

          }, {idempotencyKey:`rb-funnel-${doc.id}-${i}`});

          funnelStats.sent++;
          sentSteps.push(i);

          await db.collection("email_funnel").doc(doc.id).update({

            sentSteps,

            sending:false,

            lastSentAt:
            admin.firestore.FieldValue.serverTimestamp()

          });

        }

        catch(e){
          funnelStats.errors++;

          await db.collection("email_funnel").doc(doc.id).update({

            sending:false,

            lastError:e.message,

            lastErrorAt:
            admin.firestore.FieldValue.serverTimestamp()

          });

        }

      }
      // An unfinished record must be revisited, rather than skipped by the cursor.
      if(funnelStats.budgetExhausted)break;
    }
    funnelStats.budgetExhausted ||= scan.budgetExhausted;
    funnelStats.hasMore=scan.hasMore;
    funnelStats.pages=scan.pages;
    await scanRef.set({cursor:scan.cursor,lastRunAt:admin.firestore.FieldValue.serverTimestamp(),...funnelStats,success:funnelStats.errors===0,needsAttention:funnelStats.errors>0 || funnelStats.manualReview>0 || funnelStats.budgetExhausted || scan.hasMore});
    console.info("RB_CRON_COMPLETE", {runId,durationMs:Date.now()-startedAt,success:!pmsError && funnelStats.errors===0,funnel:funnelStats,pms:{sent:pmsNotifications?.sent || 0,queued:pmsReminders?.queued || 0,error:pmsError}});
    return res.status(pmsError || funnelStats.errors>0?503:200).json({success:!pmsError && funnelStats.errors===0,funnel:funnelStats,pmsNotifications:pmsNotifications || null,pmsReminders:pmsReminders || null,...(pmsError?{error:"pms_recovery_failed"}:{})});

  }

  catch(err){
    // Do not log provider messages, recipients, tokens or Firebase private keys.
    const error = err?.code === "cron_configuration_missing" ? "cron_configuration_missing" : "cron_error";
    console.error("RB_CRON_FAILED", {runId,phase,error,durationMs:Date.now()-startedAt});
    return res.status(500).json({

      success:false,

      error,
      runId

    });

  }

}
