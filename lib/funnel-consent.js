import crypto from 'node:crypto';
export function hasFunnelConsent(data){
  return data?.marketingConsent === true && data?.consentConfirmed === true && data?.consentVersion === 'analysis-reminders-v1' && data?.unsubscribed !== true;
}
export function createUnsubscribeToken(id, secret, action="unsubscribe"){
  if(!secret || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new Error('Unsubscribe configuration unavailable');
  return id+'.'+crypto.createHmac('sha256',secret).update('rb-funnel-'+action+'-v1:'+id).digest('hex');
}
export function readUnsubscribeToken(token, secret, action="unsubscribe"){
  if(typeof token !== 'string' || !secret || token.length>200) return null;
  const match=token.match(/^([A-Za-z0-9_-]{1,128})\.([a-f0-9]{64})$/);
  if(!match) return null;
  const expected=createUnsubscribeToken(match[1],secret,action).split('.')[1];
  return crypto.timingSafeEqual(Buffer.from(match[2]),Buffer.from(expected)) ? match[1] : null;
}
export function funnelUnsubscribeURL(id,secret){
  return 'https://www.rendimentobb.it/api/send-followup?token='+encodeURIComponent(createUnsubscribeToken(id,secret));
}

export function funnelConfirmationURL(id,secret){
 return "https://www.rendimentobb.it/api/send-followup?action=confirm&token="+encodeURIComponent(createUnsubscribeToken(id,secret,"confirm"));
}
