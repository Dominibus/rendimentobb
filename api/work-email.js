import {sendTaskUpdates} from "../lib/pms-task-email.js";
import { Resend } from "resend";
import admin from "firebase-admin";
import {sendUrgentHostNotification} from "../lib/pms-urgent-email.js";

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

function getBearerToken(req){
  const authorization = String(req.headers.authorization || "");
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
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
      const result=await sendTaskUpdates({db,resend,decoded,body:req.body,getAuthUser:uid=>admin.auth().getUser(uid),timestamp:()=>admin.firestore.FieldValue.serverTimestamp()});
      const {httpStatus,...payload}=result;
      return res.status(httpStatus || 200).json(payload);
    }
    const result = await sendUrgentHostNotification({db,resend,decoded,body:req.body,getAuthUser:uid=>admin.auth().getUser(uid),timestamp:()=>admin.firestore.FieldValue.serverTimestamp()});
    const {httpStatus,...payload}=result;
    return res.status(httpStatus || 200).json(payload);
  }catch(error){
    console.error("PMS urgent notification failed", error?.message || error);
    return res.status(500).json({ success:false, error:"notification_failed" });
  }
}
