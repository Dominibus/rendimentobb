import admin from 'firebase-admin';
import {readUnsubscribeToken} from '../lib/funnel-consent.js';
function database(){
  if(!admin.apps.length) admin.initializeApp({credential:admin.credential.cert({projectId:process.env.FIREBASE_PROJECT_ID,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,'\n')})});
  return admin.firestore();
}
export function createUnsubscribeHandler({getDatabase=database,getSecret=()=>process.env.CRON_SECRET,timestamp=()=>admin.firestore.FieldValue.serverTimestamp()}={}){
  return async function handler(req,res){
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
    if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({success:false,error:'method_not_allowed'});}
    const confirming=req.query?.action === "confirm";
    const id=readUnsubscribeToken(req.query?.token,getSecret(),confirming?"confirm":"unsubscribe");
    if(!id)return res.status(400).send('Link non valido / Invalid link. Contatti: support@rendimentobb.com');
    if(req.method==='GET'){
      res.setHeader('Content-Type','text/html; charset=utf-8');
      // GET is read-only: mail scanners must not unsubscribe the recipient.
      const title=confirming?'Conferma i promemoria / Confirm reminders':'Interrompi i promemoria / Stop reminders';
      const description=confirming?'Confermi fino a due promemoria sulle analisi. Puoi interromperli dalle email. / Confirm up to two analysis reminders. You can stop them from the emails.':'Le notifiche operative PMS e le email richieste restano separate. / PMS notifications and requested emails remain separate.';
      return res.status(200).send(`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Preferenze email - RendimentoBB</title></head><body style="font:16px system-ui;max-width:600px;margin:60px auto;padding:24px;color:#0b1730"><h1>${title}</h1><p>${description}</p><form method="post"><button style="background:#087f5b;color:white;border:0;border-radius:10px;padding:15px">${title}</button></form></body></html>`);
    }
    if(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production")return res.status(503).send("Preferenze non modificabili in anteprima / Preferences cannot be changed in preview.");
    try{
      const db=getDatabase(),ref=db.collection('email_funnel').doc(id);
      await db.runTransaction(async tx=>{const row=await tx.get(ref);if(row.exists)tx.update(ref,confirming?{marketingConsent:true,consentConfirmed:true,consentVersion:"analysis-reminders-v1",unsubscribed:false,confirmedAt:timestamp()}:{unsubscribed:true,marketingConsent:false,unsubscribedAt:timestamp()});});
      return res.status(200).send(confirming?'Promemoria confermati. Analysis reminders confirmed.':'Promemoria interrotti. Analysis reminders stopped.');
    }catch{return res.status(503).send('Operazione non completata. Riprova / Please retry.');}
  };
}
export default createUnsubscribeHandler();
