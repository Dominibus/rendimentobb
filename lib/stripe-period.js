// Stripe moved billing periods to subscription items in newer API versions.
export function subscriptionPeriodEnd(subscription){
  const valid=value=>Number.isSafeInteger(value)&&value>0;
  if(valid(subscription?.current_period_end))return subscription.current_period_end;
  const periods=(subscription?.items?.data || []).map(item=>item.current_period_end).filter(valid);
  return periods.length?Math.min(...periods):0;
}
export function invoiceSubscriptionId(invoice){
  const value=invoice?.subscription ?? invoice?.parent?.subscription_details?.subscription;
  return typeof value==='string'?value:(typeof value?.id==='string'?value.id:null);
}
