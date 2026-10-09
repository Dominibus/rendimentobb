export const TERMS_VERSION = '2026-10-09-rc85';
export const TRIAL_DAYS = 7;
export const OFFERS = Object.freeze({
  investor: {name:'Investor', amount:19, interval:'month', pdf:false},
  pro: {name:'Pro', amount:29, interval:'month', pdf:true},
  pro_yearly: {name:'Pro Annuale', amount:199, interval:'year', pdf:true}
});
export function timestampMillis(value){
  if(typeof value?.toMillis === 'function') return value.toMillis();
  if(typeof value?.seconds === 'number') return value.seconds*1000;
  if(value instanceof Date) return value.getTime();
  return Number.NaN;
}
export function activeTrial(data={}, sandbox=false, now=Date.now()){
  const prefix=sandbox?'sandboxTrial':'trial';
  const start=timestampMillis(data[`${prefix}StartedAt`]);
  const end=timestampMillis(data[`${prefix}EndsAt`]);
  return Number.isFinite(start)&&Number.isFinite(end)&&start<=now&&end>now&&end>start&&end-start<=TRIAL_DAYS*86400000;
}
