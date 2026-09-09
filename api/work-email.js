import { Resend } from "resend";
import admin from "firebase-admin";
import crypto from "node:crypto";

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

function buildUrgentEmail({ lang, guestName, category, note, checkin, checkout }){
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
  const text = [
    title, intro,
    `${isEnglish ? "Guest" : "Ospite"}: ${guestName}`,
    `${periodLabel}: ${checkin} - ${checkout}`,
    `${categoryLabel}: ${localizedCategory}`,
    note ? `${noteLabel}: ${note}` : "",
    "https://rendimentobb.it/dashboard/"
  ].filter(Boolean).join("\n\n");

  const html = `
  <div style="margin:0;padding:32px 16px;background:#f1f5f9;font-family:Inter,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="padding:24px 28px;background:#0f172a;border-bottom:5px solid #10b981;">
        <div style="font-size:22px;font-weight:900;color:#ffffff;">Rendimento<span style="color:#10b981;">BB</span></div>
        <div style="margin-top:5px;font-size:12px;color:#94a3b8;">PMS · Host Operations</div>
      </div>
      <div style="padding:30px 28px;">
        <div style="display:inline-block;padding:7px 11px;border-radius:999px;background:#fee2e2;color:#b91c1c;font-size:12px;font-weight:900;">🚨 ${escapeHTML(title)}</div>
        <h1 style="margin:18px 0 8px;font-size:26px;line-height:1.25;">${escapeHTML(guestName)}</h1>
        <p style="margin:0 0 22px;color:#475569;line-height:1.6;">${escapeHTML(intro)}</p>
        <div style="padding:18px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;line-height:1.8;font-size:14px;">
          <div><strong>${escapeHTML(periodLabel)}:</strong> ${escapeHTML(checkin)} → ${escapeHTML(checkout)}</div>
          <div><strong>${escapeHTML(categoryLabel)}:</strong> ${escapeHTML(localizedCategory)}</div>
          ${note ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #e2e8f0;"><strong>${escapeHTML(noteLabel)}:</strong><br>${escapeHTML(note)}</div>` : ""}
        </div>
        <div style="margin-top:26px;text-align:center;">
          <a href="https://rendimentobb.it/dashboard/" style="display:inline-block;padding:14px 22px;border-radius:12px;background:#10b981;color:#ffffff;text-decoration:none;font-weight:800;">${escapeHTML(ctaLabel)} →</a>
        </div>
        <p style="margin:24px 0 0;color:#94a3b8;font-size:11px;line-height:1.5;">${isEnglish ? "This operational email was generated from an urgent issue saved in your PMS." : "Questa email operativa è stata generata da una segnalazione urgente salvata nel tuo PMS."}</p>
      </div>
    </div>
  </div>`;

  return { title, text, html };
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

    const decoded = await admin.auth().verifyIdToken(token);
    const bookingId = clean(req.body?.bookingId, 160);
    const lang = req.body?.lang === "en" ? "en" : "it";
    if(!bookingId) return res.status(400).json({ success:false, error:"booking_required" });

    const bookingSnapshot = await db.collection("bookings").doc(bookingId).get();
    if(!bookingSnapshot.exists) return res.status(404).json({ success:false, error:"booking_not_found" });

    const booking = bookingSnapshot.data() || {};
    if(booking.uid !== decoded.uid) return res.status(403).json({ success:false, error:"forbidden" });

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

    const guestName = clean(booking.guestName || (lang === "en" ? "Guest" : "Ospite"), 120);
    const email = buildUrgentEmail({
      lang,
      guestName,
      category:clean(issue.category || (lang === "en" ? "Other" : "Altro"), 80),
      note:clean(issue.note, 500),
      checkin:clean(booking.checkin || "-", 20),
      checkout:clean(booking.checkout || "-", 20)
    });

    try{
      const result = await resend.emails.send({
        from:"RendimentoBB PMS <analisi@rendimentobb.it>",
        to:[recipient],
        subject:`🚨 ${email.title} · ${guestName}`,
        text:email.text,
        html:email.html
      });
      if(result?.error){
        throw new Error(result.error.message || "email_provider_error");
      }
      await notificationRef.set({
        status:"sent",
        providerId:result?.data?.id || "",
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
