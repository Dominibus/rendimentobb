import {createHash} from 'node:crypto';

export const INTEREST_CONSENT_VERSION='plan-opening-notice-v1';
export const INTEREST_PRIVACY_VERSION='2026-10-15-rc127';
export const INTEREST_RETENTION_MS=90*86400000;
const allowedOrigins=new Set(['https://rendimentobb.it','https://www.rendimentobb.it','https://rendimentobb.com','https://www.rendimentobb.com','https://rendimentobb-git-stripe-sandbox-test-dominibus-projects.vercel.app']);
export class InterestError extends Error {
 constructor(code,status=400){super(code);this.code=code;this.status=status;}
}
export function normalizePlanInterest(body,origin){
 if(!allowedOrigins.has(origin))throw new InterestError('ORIGIN_NOT_ALLOWED',403);
 if(!body || typeof body!=='object' || Array.isArray(body))throw new InterestError('INVALID_REQUEST');
 if(body.website)throw new InterestError('INVALID_REQUEST');
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 if(email.length>254 || !/^[^\s@<>"\u0000-\u001f\u007f]+@[^\s@<>"\u0000-\u001f\u007f]+\.[^\s@<>"\u0000-\u001f\u007f]{2,}$/.test(email))throw new InterestError('INVALID_EMAIL');
 if(!['investor','pro','pro_yearly'].includes(body.plan))throw new InterestError('INVALID_PLAN');
 if(body.notificationConsent!==true || body.consentVersion!==INTEREST_CONSENT_VERSION || body.privacyVersion!==INTEREST_PRIVACY_VERSION)throw new InterestError('CONSENT_REQUIRED');
 return {email,plan:body.plan,lang:body.lang==='en'?'en':'it',scope:origin.includes('stripe-sandbox-test')?'test':'live'};
}
export async function savePlanInterest({db,value,now=Date.now()}){
 // One record per declared address, plan and environment. Never grant access.
 const id=createHash('sha256').update(`plan-interest-v1:${value.scope}:${value.email}:${value.plan}`).digest('hex');
 const ref=db.collection('_plan_interest').doc(id);
 await db.runTransaction(async tx=>{
  const snap=await tx.get(ref),previous=snap.exists?snap.data():null;
  // Retrying a request does not inflate demand or extend retention indefinitely.
  if(previous && previous.expiresAt>now)return;
  tx.set(ref,{...value,status:'requested',emailVerified:false,notificationConsent:true,
   consentVersion:INTEREST_CONSENT_VERSION,privacyVersion:INTEREST_PRIVACY_VERSION,
   createdAt:now,expiresAt:now+INTEREST_RETENTION_MS,marketingConsent:false});
 });
 // Deliberately identical for a first request and a duplicate; no address lookup API.
 return {success:true,saved:true};
}
export async function purgeExpiredPlanInterests({db,now=Date.now(),limit=200}){
 const rows=await db.collection('_plan_interest').where('expiresAt','<=',now).limit(Math.min(200,Math.max(1,limit))).get();
 let deleted=0;
 for(const doc of rows.docs){
  const removed=await db.runTransaction(async tx=>{
   const current=await tx.get(doc.ref);
   if(current.exists && Number.isFinite(current.data().expiresAt) && current.data().expiresAt<=now){tx.delete(doc.ref);return true;}
   return false;
  });
  if(removed)deleted++;
 }
 return {deleted,limitReached:rows.docs.length===Math.min(200,Math.max(1,limit))};
}
