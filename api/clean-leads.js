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

export default async function handler(req, res){

  if(req.query.key !== process.env.ADMIN_KEY){
  return res.status(401).json({ error:"unauthorized" });
}

  try{

    const snapshot = await db.collection("leads").get();

    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    res.status(200).json({ success:true, deleted: snapshot.size });

  }catch(e){
    console.error(e);
    res.status(500).json({ error:"fail" });
  }

}
