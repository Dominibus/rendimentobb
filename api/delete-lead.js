import admin from "firebase-admin";

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

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const email = String(decoded.email || "").toLowerCase();
    const isAdmin = decoded.admin === true || email === "rendimentobb@gmail.com";

    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const leadId = String(req.body?.leadId || "").trim();

    if (!/^[A-Za-z0-9_-]{10,128}$/.test(leadId)) {
      return res.status(400).json({ error: "Invalid lead identifier" });
    }

    const leadRef = db.collection("leads").doc(leadId);
    const lead = await leadRef.get();

    if (!lead.exists) {
      return res.status(404).json({ error: "Lead not found" });
    }

    await leadRef.delete();

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Unable to delete lead" });
  }
}
