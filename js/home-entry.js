// Presentation state only. Trial entitlement is still verified by the server.
import {getPlanForScope,isSandboxHost} from './account-plan.js?v=20261015-rc128';
import {hasUsedTrial} from './subscription-offer.js?v=20261016-rc140';
export function homeEntryState({user,owner,data={},hostname='',role,now}={}){
  if(!user?.uid || user.uid==='demo-user')return 'guest';
  if(owner!==user.uid)return 'loading';
  const sandbox=isSandboxHost(hostname);
  if(role==='admin'||['investor','pro','pro_yearly'].includes(getPlanForScope(data,sandbox,now)))return 'paid';
  return hasUsedTrial(data,sandbox)?'used':'eligible';
}
