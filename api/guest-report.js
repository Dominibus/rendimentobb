import crypto from "node:crypto";
import admin from "firebase-admin";

const ALLOWED_CATEGORIES = new Set(["maintenance", "cleaning", "access", "noise", "comfort", "other"]);
const ALLOWED_PRIORITIES = new Set(["low", "medium", "high", "urgent"]);

function getFirestore(){
  if(!admin.apps.length){
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
    if(!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY){
      throw new Error("Firebase Admin configuration missing");
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      })
    });
  }
  return admin.firestore();
}

function safeEqual(first, second){
  const firstBuffer = Buffer.from(String(first || ""));
  const secondBuffer = Buffer.from(String(second || ""));
  return firstBuffer.length === secondBuffer.length && crypto.timingSafeEqual(firstBuffer, secondBuffer);
}

function cleanText(value, maxLength){
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, maxLength);
}

function validateAccess(booking, token){
  const suppliedHash = crypto.createHash("sha256").update(String(token || "")).digest("hex");
  const portal = booking?.guestPortal || {};
  const expiresAt = Date.parse(portal.expiresAt || "");
  const status = String(booking?.status || "").toLowerCase();
  return portal.enabled === true &&
    safeEqual(suppliedHash, portal.tokenHash) &&
    Number.isFinite(expiresAt) &&
    expiresAt > Date.now() &&
    !["cancelled", "completed", "pending"].includes(status);
}

export default async function handler(req, res){
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if(req.method !== "POST"){
    return res.status(405).json({ success: false, error: "method_not_allowed" });
  }

  const body = req.body || {};
  const bookingId = cleanText(body.bookingId, 128);
  const token = cleanText(body.token, 256);
  const action = cleanText(body.action, 24);
  if(!/^[A-Za-z0-9_-]{8,128}$/.test(bookingId) || token.length < 32){
    return res.status(400).json({ success: false, error: "invalid_request" });
  }

  try{
    const db = getFirestore();
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingSnapshot = await bookingRef.get();
    if(!bookingSnapshot.exists || !validateAccess(bookingSnapshot.data(), token)){
      return res.status(404).json({ success: false, error: "link_invalid_or_expired" });
    }
    const booking = bookingSnapshot.data();

    if(action === "context"){
      const firstName = cleanText(booking.guestName, 80).split(/\s+/)[0] || "Guest";
      return res.status(200).json({
        success: true,
        booking: {
          guestFirstName: firstName,
          checkin: cleanText(booking.checkin, 10),
          checkout: cleanText(booking.checkout, 10)
        }
      });
    }

    if(action !== "submit"){
      return res.status(400).json({ success: false, error: "invalid_action" });
    }

    if(body.website){
      return res.status(200).json({ success: true });
    }

    const category = cleanText(body.category, 24);
    const priority = cleanText(body.priority, 16);
    const note = cleanText(body.note, 500);
    if(!ALLOWED_CATEGORIES.has(category) || !ALLOWED_PRIORITIES.has(priority) || note.length < 10){
      return res.status(400).json({ success: false, error: "invalid_report" });
    }

    await db.runTransaction(async transaction => {
      const freshSnapshot = await transaction.get(bookingRef);
      const freshBooking = freshSnapshot.data();
      if(!freshSnapshot.exists || !validateAccess(freshBooking, token)){
        throw new Error("LINK_INVALID");
      }
      const lastReportAt = Date.parse(freshBooking.lastGuestReportAt || "");
      if(Number.isFinite(lastReportAt) && Date.now() - lastReportAt < 60_000){
        throw new Error("RATE_LIMITED");
      }

      const now = new Date().toISOString();
      const reportRef = db.collection("guest_reports").doc();
      const guestIssue = {
        active: true,
        category,
        priority,
        status: "open",
        note,
        source: "guest_portal",
        reportedAt: now,
        resolved: false
      };
      transaction.update(bookingRef, { guestIssue, lastGuestReportAt: now });
      transaction.set(reportRef, {
        bookingId,
        propertyId: freshBooking.propertyId || "",
        uid: freshBooking.uid || "",
        category,
        priority,
        note,
        status: "open",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    return res.status(201).json({ success: true });
  }catch(error){
    if(error?.message === "LINK_INVALID"){
      return res.status(404).json({ success: false, error: "link_invalid_or_expired" });
    }
    if(error?.message === "RATE_LIMITED"){
      return res.status(429).json({ success: false, error: "too_many_requests" });
    }
    console.error("Guest report API error", error);
    return res.status(500).json({ success: false, error: "internal_error" });
  }
}
