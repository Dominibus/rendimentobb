import {createHash} from 'node:crypto';
import {getBillingPlanForScope} from '../js/account-plan.js';
import {stripeFieldName} from './stripe-entitlements.js';
import {TERMS_VERSION,TRIAL_DAYS} from '../js/subscription-offer.js';
export class SubscriptionError extends Error {
 constructor(code,status=409){super(code);this.code=code;this.status=status;}
}
export async function startAccountTrial({db,uid,email,emailVerified,liveMode,termsVersion,acceptedTerms,timestamp,now=Date.now()}){
 if(!emailVerified||!email) throw new SubscriptionError('EMAIL_VERIFICATION_REQUIRED',403);
 if(acceptedTerms!==true||termsVersion!==TERMS_VERSION) throw new SubscriptionError('TERMS_REQUIRED',400);
 const scope=liveMode?'live':'test';
 const emailKey=createHash('sha256').update(`${scope}:${email.trim().toLowerCase()}`).digest('hex');
 const userRef=db.collection('users').doc(uid);
 const trialRef=db.collection('_account_trials').doc(emailKey);
 const prefix=liveMode?'trial':'sandboxTrial';
 return db.runTransaction(async tx=>{
  const user=await tx.get(userRef),previous=await tx.get(trialRef);
  if(!user.exists)throw new SubscriptionError('PROFILE_REQUIRED');
  const data=user.data();
  if(['investor','pro','pro_yearly'].includes(getBillingPlanForScope(data,!liveMode))) throw new SubscriptionError('ACTIVE_SUBSCRIPTION');
  if(previous.exists||data[`${prefix}StartedAt`])throw new SubscriptionError('TRIAL_ALREADY_USED');
  const ends=now+TRIAL_DAYS*86400000;
  tx.set(trialRef,{uid,startedAt:timestamp(now),endsAt:timestamp(ends),termsVersion});
  tx.update(userRef,{[`${prefix}StartedAt`]:timestamp(now),[`${prefix}EndsAt`]:timestamp(ends),[`${prefix}TermsVersion`]:termsVersion});
  return {trialEndsAt:new Date(ends).toISOString()};
 });
}
export async function createAccountPortal({db,stripe,uid,liveMode,baseUrl,locale='it'}){
 const user=await db.collection('users').doc(uid).get();
 const customer=user.data()?.[stripeFieldName('stripeCustomerId',liveMode)];
 if(!user.exists||typeof customer!=='string'||!customer.startsWith('cus_'))throw new SubscriptionError('BILLING_ACCOUNT_NOT_FOUND',404);
 // Customer IDs always come from protected server fields, never the request.
 const session=await stripe.billingPortal.sessions.create({customer,return_url:`${baseUrl}/#pricing`,locale:locale==='en'?'en':'it'});
 if(!session.url?.startsWith('https://billing.stripe.com/')) throw Error('Invalid portal URL');
 return {url:session.url};
}

export async function saveCheckoutContract({db,session,subscription,liveMode,now=Date.now()}){
 if(!session.metadata?.termsVersion)return null; // Legacy purchases have no invented acceptance.
 const uid=session.client_reference_id;
 if(!uid||session.livemode!==liveMode||session.mode!=='subscription'||!['paid','no_payment_required'].includes(session.payment_status))throw Error('Contract identity mismatch');
 const key=createHash('sha256').update(`${liveMode?'live':'test'}:${uid}`).digest('hex');
 const ref=db.collection('_subscription_contracts').doc(`${liveMode?'live':'test'}_${session.id}`);
 return db.runTransaction(async tx=>{
  const prior=await tx.get(ref);
  if(prior.exists){if(prior.data().uid!==uid||prior.data().liveMode!==liveMode)throw Error('Contract identity mismatch');return prior.data();}
  const lock=await tx.get(db.collection('_stripe_checkouts').doc(key));
  const accepted=lock.data();
  if(!lock.exists||accepted.sessionId!==session.id||accepted.termsVersion!==session.metadata.termsVersion||!accepted.termsSnapshot)throw Error('Accepted contract unavailable');
  const value={uid,liveMode,sessionId:session.id,subscriptionId:typeof session.subscription==='string'?session.subscription:session.subscription?.id,
   plan:accepted.plan,acceptedAt:accepted.acceptedAt,termsVersion:accepted.termsVersion,terms:accepted.termsSnapshot,
   amountTotal:session.amount_total??null,currency:session.currency??null,purchasedAt:new Date((session.created||Math.floor(now/1000))*1000).toISOString(),
   periodEndsAt:subscription.current_period_end?new Date(subscription.current_period_end*1000).toISOString():null,
   paymentStatus:session.payment_status,recordedAt:new Date(now).toISOString()};
  tx.set(ref,value);return value;
 });
}
export async function getAccountContract({db,uid,liveMode}){
 const user=await db.collection('users').doc(uid).get();
 const sessionId=user.data()?.[stripeFieldName('stripeSessionId',liveMode)];
 if(typeof sessionId!=='string'||!/^cs_[A-Za-z0-9_]+$/.test(sessionId))throw new SubscriptionError('CONTRACT_NOT_AVAILABLE',404);
 const contract=await db.collection('_subscription_contracts').doc(`${liveMode?'live':'test'}_${sessionId}`).get();
 if(!contract.exists||contract.data()?.uid!==uid||contract.data()?.liveMode!==liveMode)throw new SubscriptionError('CONTRACT_NOT_AVAILABLE',404);
 return {contract:contract.data()};
}
