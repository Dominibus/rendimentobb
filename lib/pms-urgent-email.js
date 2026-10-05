import {dispatchTaskNotification,urgentNotificationId} from "./pms-notification-queue.js";
import {buildBrandedEmail} from "./email-templates.js";

const clean = (value, maxLength = 300) => String(value || "")
  .replace(/[\u0000-\u001F\u007F]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, maxLength);

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

export async function sendUrgentHostNotification({db,resend,decoded,body,timestamp,getAuthUser,now=Date.now()}){
    const bookingId = clean(body?.bookingId, 160);
    const lang = body?.lang === "en" ? "en" : "it";
    if(!bookingId) return {httpStatus:400, success:false, error:"booking_required"};

    const bookingSnapshot = await db.collection("bookings").doc(bookingId).get();
    if(!bookingSnapshot.exists) return {httpStatus:404, success:false, error:"booking_not_found"};

    const booking = bookingSnapshot.data() || {};
    if(booking.uid !== decoded.uid) return {httpStatus:403, success:false, error:"forbidden"};

    const userSnapshot = await db.collection("users").doc(decoded.uid).get();
    const preferences = userSnapshot.exists
      ? userSnapshot.data()?.notificationPreferences || {}
      : {};
    if(preferences.pmsUrgentEmail === false){
      return {httpStatus:200, success:true, skipped:true, reason:"preference_disabled"};
    }

    const issue = booking.guestIssue || {};
    const isUrgent = issue.active === true
      && String(issue.priority || "") === "urgent"
      && String(issue.status || "open") !== "resolved";
    if(!isUrgent) return {httpStatus:200, success:true, skipped:true, reason:"not_urgent"};

    const recipient = clean(decoded.email, 254).toLowerCase();
    if(!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(recipient)){
      return {httpStatus:400, success:false, error:"host_email_unavailable"};
    }

    const signature = urgentNotificationId(bookingId,issue);
    const notificationRef = db.collection("_pms_notifications").doc(signature);
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

    // Persist an immutable mail before crossing the provider boundary. Legacy
    // sent records retain their signature, so upgrading does not resend them.
    await db.runTransaction(async transaction=>{
      const snapshot=await transaction.get(notificationRef);
      const previous=snapshot.exists?snapshot.data():null;
      if(previous?.status === "sent" || previous?.queueVersion===1)return;
      if(previous){
        // Old code lacked immutable provider idempotency. Its uncertain deliveries
        // cannot safely be replayed automatically during this migration.
        if(previous.status === "sending" && now-Number(previous.lockedAt || 0)<5*60*1000)return;
        transaction.set(notificationRef,{...previous,status:"manual_review",readyAt:null,
          reason:"legacy_delivery_uncertain",updatedAt:timestamp()});
        return;
      }
      transaction.set(notificationRef,{
        queueVersion:1,type:"guest_issue_urgent",uid:decoded.uid,bookingId,
        propertyId:booking.propertyId || "",recipient,lang,sandbox:false,
        urgentIssue:{category:issue.category || "other",priority:"urgent",note:issue.note || ""},
        status:"pending",attempts:0,readyAt:now,createdAt:timestamp(),updatedAt:timestamp(),
        payload:{from:"RendimentoBB PMS <analisi@rendimentobb.it>",to:[recipient],
          subject:`🚨 ${email.title} · ${guestName}`,text:email.text,html:email.html}
      });
    });
    const queued=await notificationRef.get();
    if(queued.data()?.queueVersion!==1){
      return queued.data()?.status === "sent"
        ? {httpStatus:200,success:true,duplicate:true}
        : {httpStatus:200,success:false,reason:"legacy_delivery_uncertain"};
    }
    const result=await dispatchTaskNotification({db,resend,getAuthUser,id:signature,timestamp,now});
    return {httpStatus:200,success:!["manual_review","suppressed","missing"].includes(result.status),sent:result.status==="sent",duplicate:result.status==="duplicate",
      queued:["retry","busy","deferred"].includes(result.status),reason:result.reason || result.status};
}
