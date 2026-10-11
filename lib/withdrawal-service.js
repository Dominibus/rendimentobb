import {createHash} from 'node:crypto';
import {buildBrandedEmail,sendCheckedEmail} from './email-templates.js';

export class WithdrawalError extends Error {
  constructor(code,status=400){super(code);this.code=code;this.status=status;}
}
const text=(v,max)=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max):'';
export function normalizeWithdrawal(body){
  const name=text(body.name,120),email=text(body.email,254).toLowerCase(),contract=text(body.contract,500);
  const requestId=text(body.requestId,36),lang=body.lang==='en'?'en':'it';
  if(body.confirmed!==true || name.length<2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || contract.length<5 ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestId) || body.website)throw new WithdrawalError('INVALID_WITHDRAWAL');
  return {name,email,contract,requestId,lang};
}
export function withdrawalReceipt(record){
  const en=record.lang==='en';
  const declaration=en?'I hereby give notice of withdrawal from the RendimentoBB service contract identified below.':'Con la presente comunico il recesso dal contratto relativo al servizio RendimentoBB identificato qui sotto.';
  const rows=[[en?'Reference':'Riferimento',record.id],[en?'Received at (UTC)':'Ricevuta il (UTC)',record.receivedAt],
    [en?'Full name':'Nome e cognome',record.name],[en?'Receipt email':'Email per la ricevuta',record.email],
    [en?'Contract':'Contratto',record.contract],[en?'Declaration':'Dichiarazione',declaration]];
  const note=en?'This receipt records your declaration and its receipt time. Contract identification, any refund and subscription adjustments will be handled separately. No password or card details are required.':'Questa ricevuta documenta la dichiarazione e il momento della sua ricezione. L’identificazione del contratto, l’eventuale rimborso e le modifiche all’abbonamento saranno gestiti separatamente. Non sono richieste password o dati della carta.';
  return buildBrandedEmail({lang:record.lang,title:en?'Withdrawal declaration received':'Dichiarazione di recesso ricevuta',intro:en?'Keep this receipt. Your declaration has been recorded.':'Conserva questa ricevuta. La tua dichiarazione è stata registrata.',rows,note,eyebrow:en?'Contract notice':'Comunicazione contrattuale',footer:'RendimentoBB · support@rendimentobb.com'});
}

// A durable record is saved before email is attempted. Repeated submissions
// use the original timestamp; no public request mutates a Stripe subscription.
export async function submitWithdrawal({db,resend,body,now=Date.now(),operatorEmail='rendimentobb@gmail.com'}){
  const value=normalizeWithdrawal(body);
  const id='wr_'+createHash('sha256').update(value.requestId).digest('hex');
  const fingerprint=createHash('sha256').update(JSON.stringify(value)).digest('hex');
  const ref=db.collection('_withdrawal_requests').doc(id);
  const record=await db.runTransaction(async tx=>{
    const prior=await tx.get(ref);
    if(prior.exists){if(prior.data().fingerprint!==fingerprint)throw new WithdrawalError('WITHDRAWAL_CONFLICT',409);return prior.data();}
    const record={...value,id,fingerprint,receivedAt:new Date(now).toISOString(),status:'received',emailPending:true,
      receiptStatus:'pending',operatorStatus:'pending',operatorEmail,attempts:0};
    tx.set(ref,record);return record;
  });
  await deliverWithdrawal({db,resend,id,now});
  const saved=(await ref.get()).data();
  return {success:true,id,receivedAt:record.receivedAt,receiptText:withdrawalReceipt(record).text,
    receiptEmail:saved.receiptStatus==='sent'?'accepted_by_provider':'pending',operatorNotification:saved.operatorStatus==='sent'?'accepted_by_provider':'pending'};
}

export async function deliverWithdrawal({db,resend,id,now=Date.now()}){
  const ref=db.collection('_withdrawal_requests').doc(id);
  for(const kind of ['receipt','operator']){
    const claim=await db.runTransaction(async tx=>{
      const snap=await tx.get(ref);if(!snap.exists)return null;
      const record=snap.data();if(record[kind+'Status']==='sent' || Number(record[kind+'LockUntil']||0)>now)return null;
      tx.update(ref,{[kind+'LockUntil']:now+120000});return record;
    });
    if(!claim)continue;
    try{
      const mail=withdrawalReceipt(kind==='operator'?{...claim,lang:'it'}:claim);
      const sent=await sendCheckedEmail(resend,{from:'RendimentoBB <analisi@rendimentobb.it>',to:[kind==='receipt'?claim.email:claim.operatorEmail],
        replyTo:kind==='receipt'?'support@rendimentobb.com':claim.email,
        subject:kind==='receipt'?(claim.lang==='en'?'RendimentoBB — withdrawal receipt':'RendimentoBB — ricevuta di recesso'):'RendimentoBB — recesso da gestire',html:mail.html,text:mail.text},
        {idempotencyKey:id+'-'+kind});
      await db.runTransaction(async tx=>{const current=await tx.get(ref);const data=current.data();tx.update(ref,{[kind+'Status']:'sent',[kind+'ProviderId']:sent,[kind+'LockUntil']:0,emailPending:kind==='receipt'?data.operatorStatus!=='sent':data.receiptStatus!=='sent'});});
    }catch{
      await db.runTransaction(async tx=>{const snap=await tx.get(ref);tx.update(ref,{[kind+'Status']:'pending',[kind+'LockUntil']:0,emailPending:true,attempts:Number(snap.data().attempts||0)+1,lastEmailAttemptAt:new Date(now).toISOString()});});
    }
  }
}
export async function drainWithdrawalReceipts({db,resend,now=Date.now()}){
  const rows=await db.collection('_withdrawal_requests').where('emailPending','==',true).limit(5).get();
  let pending=0;
  for(const row of rows.docs){await deliverWithdrawal({db,resend,id:row.id,now});if((await db.collection('_withdrawal_requests').doc(row.id).get()).data()?.emailPending)pending++;}
  return {checked:rows.docs.length,pending};
}
