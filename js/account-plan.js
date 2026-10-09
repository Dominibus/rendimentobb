import {activeTrial} from './subscription-offer.js?v=20261009-rc85';
/* Separate billing entitlements even when preview and production share Firebase. */
export function getBillingPlanForScope(data = {}, sandbox = false){
  const legacyTest = data.stripeLiveMode !== true && String(data.stripeSessionId || '').startsWith('cs_test_');
  if(sandbox){
    return String(data.sandboxPlan ?? (legacyTest ? data.plan : 'free') ?? 'free').trim().toLowerCase();
  }
  if(data.stripeLiveMode === false || legacyTest) return 'free';
  return String(data.plan || 'free').trim().toLowerCase();
}
export function isSandboxHost(hostname = ''){
  return ['localhost', '127.0.0.1', 'rendimentobb-git-stripe-sandbox-test-dominibus-projects.vercel.app']
    .includes(String(hostname).toLowerCase());
}
export function resolveAccountPlan(data, hostname){
  return getPlanForScope(data, isSandboxHost(hostname));
}

export function getPlanForScope(data={},sandbox=false,now=Date.now()){
 const billing=getBillingPlanForScope(data,sandbox);
 if(['investor','pro','pro_yearly'].includes(billing)) return billing;
 return activeTrial(data,sandbox,now)?'investor':billing;
}
