export function stripeFieldName(name, liveMode){
  return liveMode ? name : `sandbox${name[0].toUpperCase()}${name.slice(1)}`;
}
export function buildStripeEntitlementUpdate(data, event){
  if(typeof event?.livemode !== 'boolean') throw new Error('Stripe event mode is required');
  const values = {
    ...data,
    stripeLiveMode: event.livemode,
    lastStripeEventId: event.id || null,
    lastStripeEventCreated: Number(event.created || 0)
  };
  return Object.fromEntries(Object.entries(values).map(([name,value])=>[stripeFieldName(name,event.livemode),value]));
}
