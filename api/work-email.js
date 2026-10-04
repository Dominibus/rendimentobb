import {sendTaskUpdates} from "../lib/pms-task-email.js";
import { Resend } from "resend";
import admin from "firebase-admin";
import crypto from "node:crypto";
import { buildBrandedEmail, sendCheckedEmail } from "../lib/email-templates.js";

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

const clean = (value, maxLength = 300) => String(value || "")
  .replace(/[\u0000-\u001F\u007F]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, maxLength);

const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, character => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;"
})[character]);

function getBearerToken(req){
  const authorization = String(req.headers.authorization || "");
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function formatDate(value, lang){
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match) return clean(value || "-", 20);
  return lang === "en"
    ? `${match[2]}/${match[3]}/${match[1]}`
    : `${match[3]}/${match[2]}/${match[1]}`;
}

function buildUrgentEmail({ lang, guestName, category, note, checkin, checkout, propertyName, bookingId }){
  const isEnglish = lang === "en";
  const categoryLabels = {
    maintenance:isEnglish ? "Maintenance" : "Manutenzione",
    cleaning:isEnglish ? "Cleaning" : "Pulizia",
    access:isEnglish ? "Property access" : "Accesso alla struttura",
    noise:isEnglish ? "Noise" : "Rumore",
    safety:isEnglish ? "Safety" : "Sicurezza",
    payment:isEnglish ? "Payment" : "Pagamento",
    other:isEnglish ? "Other" : "Altro"
  };
  const localizedCategory = categoryLabels[category] || category;
  const title = isEnglish ? "Urgent guest issue" : "Segnalazione ospite urgente";
  const intro = isEnglish
    ? "An urgent issue requires your attention in the RendimentoBB PMS."
    : "Una segnalazione urgente richiede la tua attenzione nel PMS RendimentoBB.";
  const periodLabel = isEnglish ? "Stay" : "Soggiorno";
  const categoryLabel = isEnglish ? "Category" : "Categoria";
  const noteLabel = isEnglish ? "Issue details" : "Dettagli segnalazione";
  const ctaLabel = isEnglish ? "Open PMS activities" : "Apri attività PMS";
  const rows=[[isEnglish?"Property":"Immobile",propertyName||"—"],[isEnglish?"Booking reference":"Riferimento prenotazione",bookingId],[isEnglish?"Guest":"Ospite",guestName],[periodLabel,`${checkin} → ${checkout}`],[categoryLabel,localizedCategory],[noteLabel,note||"—"]];
  const email=buildBrandedEmail({lang,title,intro,rows,ctaLabel,ctaURL:"https://rendimentobb.it/dashboard/",eyebrow:isEnglish?"PMS · Host operations":"PMS · Operatività gestore",note:isEnglish?"Priority: urgent. Review the issue, contact the guest and record the outcome in the booking. This alert does not confirm that the issue was resolved.":"Priorità: urgente. Verifica la segnalazione, contatta l’ospite e registra l’esito nella prenotazione. Questo avviso non conferma la risoluzione del problema."});
  return {title,...email};
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if(req.method !== "POST"){
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success:false, error:"method_not_allowed" });
  }

  try{
    const token = getBearerToken(req);
    if(!token) return res.status(401).json({ success:false, error:"unauthorized" });

    const decoded = await admin.auth().verifyIdToken(token, true);
    if(req.body?.action === "task_updates"){
      const result=await sendTaskUpdates({db,resend,decoded,body:req.body,timestamp:()=>admin.firestore.FieldValue.serverTimestamp()});
      const {httpStatus,...payload}=result;
      return res.status(httpStatus || 200).json(payload);
    }
    const bookingId = clean(req.body?.bookingId, 160);
    const lang = req.body?.lang === "en" ? "en" : "it";
    if(!bookingId) return res.status(400).json({ success:false, error:"booking_required" });

    const bookingSnapshot = await db.collection("bookings").doc(bookingId).get();
    if(!bookingSnapshot.exists) return res.status(404).json({ success:false, error:"booking_not_found" });

    const booking = bookingSnapshot.data() || {};
    if(booking.uid !== decoded.uid) return res.status(403).json({ success:false, error:"forbidden" });

    const userSnapshot = await db.collection("users").doc(decoded.uid).get();
    const preferences = userSnapshot.exists
      ? userSnapshot.data()?.notificationPreferences || {}
      : {};
    if(preferences.pmsUrgentEmail === false){
      return res.status(200).json({ success:true, skipped:true, reason:"preference_disabled" });
    }

    const issue = booking.guestIssue || {};
    const isUrgent = issue.active === true
      && String(issue.priority || "") === "urgent"
      && String(issue.status || "open") !== "resolved";
    if(!isUrgent) return res.status(200).json({ success:true, skipped:true, reason:"not_urgent" });

    const recipient = clean(decoded.email, 254).toLowerCase();
    if(!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(recipient)){
      return res.status(400).json({ success:false, error:"host_email_unavailable" });
    }

    const signature = crypto.createHash("sha256").update([
      bookingId, issue.category || "other", issue.priority || "urgent", issue.note || ""
    ].join("|")).digest("hex");
    const notificationRef = db.collection("_pms_notifications").doc(signature);
    const now = Date.now();
    let shouldSend = false;

    await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(notificationRef);
      const previous = snapshot.exists ? snapshot.data() : {};
      const isRecentLock = previous.status === "sending"
        && now - Number(previous.lockedAt || 0) < 5 * 60 * 1000;
      if(previous.status === "sent" || isRecentLock) return;
      shouldSend = true;
      transaction.set(notificationRef, {
        uid:decoded.uid,
        bookingId,
        type:"guest_issue_urgent",
        status:"sending",
        lockedAt:now,
        updatedAt:admin.firestore.FieldValue.serverTimestamp()
      }, { merge:true });
    });

    if(!shouldSend) return res.status(200).json({ success:true, duplicate:true });

    const propertySnapshot = booking.propertyId ? await db.collection("properties").doc(booking.propertyId).get() : null;
    const propertyName = propertySnapshot?.exists && propertySnapshot.data()?.uid === decoded.uid ? clean(propertySnapshot.data()?.name,120) : "";
    const guestName = clean(booking.guestName || (lang === "en" ? "Guest" : "Ospite"), 120);
    const email = buildUrgentEmail({
      lang,
      guestName,
      propertyName,
      bookingId,
      category:clean(issue.category || (lang === "en" ? "Other" : "Altro"), 80),
      note:clean(issue.note, 500),
      checkin:formatDate(booking.checkin, lang),
      checkout:formatDate(booking.checkout, lang)
    });

    try{
      const providerId = await sendCheckedEmail(resend,{
        from:"RendimentoBB PMS <analisi@rendimentobb.it>",
        to:[recipient],
        subject:`🚨 ${email.title} · ${guestName}`,
        text:email.text,
        html:email.html
      }, {idempotencyKey:`rb-pms-${signature}`});
      await notificationRef.set({
        status:"sent",
        providerId,
        sentAt:admin.firestore.FieldValue.serverTimestamp(),
        updatedAt:admin.firestore.FieldValue.serverTimestamp()
      }, { merge:true });
      return res.status(200).json({ success:true, sent:true });
    }catch(error){
      await notificationRef.set({
        status:"failed",
        error:clean(error?.message || "send_failed", 300),
        updatedAt:admin.firestore.FieldValue.serverTimestamp()
      }, { merge:true });
      throw error;
    }
  }catch(error){
    console.error("PMS urgent notification failed", error?.message || error);
    return res.status(500).json({ success:false, error:"notification_failed" });
  }
}
