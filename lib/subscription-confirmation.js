import {buildBrandedEmail, sendCheckedEmail} from './email-templates.js';

export function subscriptionConfirmation(contract) {
  const terms = [...(contract.terms?.terms || []), ...(contract.terms?.withdrawal || [])];
  const text = terms.map(row => `${row.it || ''}\n${row.en || ''}`).join('\n\n');
  return buildBrandedEmail({
    title: contract.liveMode ? 'Conferma abbonamento / Subscription confirmation' : 'TEST — conferma abbonamento / Subscription confirmation',
    intro: 'Conserva questa email e la copia delle condizioni accettate. / Keep this email and the accepted terms copy.',
    rows: [
      ['Piano / Plan', contract.plan],
      ['Importo checkout / Checkout amount', contract.amountTotal == null ? 'N/A' : `${(contract.amountTotal / 100).toFixed(2)} ${String(contract.currency || '').toUpperCase()}`],
      ['Condizioni / Terms', contract.termsVersion],
      ['Accettazione / Acceptance', contract.acceptedAt],
      ['Riferimento checkout / Checkout reference', contract.sessionId],
      ['Ambiente / Environment', contract.liveMode ? 'Produzione / Live' : 'TEST — nessun acquisto reale / No real purchase'],
      ['Copia delle condizioni accettate / Accepted terms copy', text]
    ],
    note: 'Il rinnovo automatico, la disattivazione e il recesso sono descritti nelle condizioni allegate. Questa conferma non è una fattura fiscale. / Automatic renewal, cancellation and withdrawal are described in the enclosed terms. This confirmation is not a tax invoice.',
    ctaLabel: 'Abbonamento e assistenza / Subscription and support', ctaURL: 'https://www.rendimentobb.it/dashboard/',
    secondaryLabel: 'Recedere dal contratto qui / Withdraw from the contract here', secondaryURL: 'https://www.rendimentobb.it/withdrawal.html#withdrawal-form',
    footer: 'RendimentoBB · support@rendimentobb.com'
  });
}

export async function deliverSubscriptionConfirmation({db, resend, id, now = Date.now()}) {
  const ref = db.collection('_subscription_contracts').doc(id);
  const claimed = await db.runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) return null;
    const record = snapshot.data();
    if (record.receiptPending !== true || !resend || Number(record.receiptLockUntil || 0) > now) return null;
    // Provider idempotency is bounded: never blindly resend after that window.
    if (record.receiptFirstAttemptAt != null && now - record.receiptFirstAttemptAt >= 23 * 3600000) {
      tx.update(ref, {receiptPending:false, receiptStatus:'manual_review', receiptLockUntil:0});
      return null;
    }
    tx.update(ref, {receiptLockUntil:now + 120000, receiptFirstAttemptAt:record.receiptFirstAttemptAt ?? now});
    return record;
  });
  if (!claimed) return;
  try {
    const mail = subscriptionConfirmation(claimed);
    const providerId = await sendCheckedEmail(resend, {
      from:'RendimentoBB <analisi@rendimentobb.it>', to:[claimed.receiptEmail], replyTo:'support@rendimentobb.com',
      subject:claimed.liveMode ? 'RendimentoBB — conferma abbonamento / subscription confirmation' : 'RendimentoBB TEST — conferma abbonamento / subscription confirmation',
      html:mail.html, text:mail.text
    }, {idempotencyKey:'rb-contract-' + id});
    await db.runTransaction(async tx => {
      await tx.get(ref);
      tx.update(ref, {receiptPending:false, receiptStatus:'accepted_by_provider', receiptProviderId:providerId, receiptLockUntil:0});
    });
  } catch {
    await db.runTransaction(async tx => {
      const snapshot = await tx.get(ref);
      tx.update(ref, {receiptPending:true, receiptStatus:'pending', receiptLockUntil:0,
        receiptAttempts:Number(snapshot.data()?.receiptAttempts || 0) + 1});
    });
  }
}

export async function drainSubscriptionConfirmations({db, resend, now = Date.now()}) {
  const rows = await db.collection('_subscription_contracts').where('receiptPending','==',true).limit(5).get();
  let pending = 0;
  for (const row of rows.docs) {
    await deliverSubscriptionConfirmation({db,resend,id:row.id,now});
    if ((await row.ref.get()).data()?.receiptPending) pending++;
  }
  const manual = await db.collection('_subscription_contracts').where('receiptStatus','==','manual_review').limit(5).get();
  return {checked:rows.docs.length, pending, manualReview:manual.docs.length, needsAttention:pending > 0 || manual.docs.length > 0};
}
