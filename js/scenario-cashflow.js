// Missing or malformed cashflow is not a break-even result.
export function scenarioCashflow(item={}){
  const raw=item.net ?? item.cashflow ?? item.annualProfit;
  if(raw===null || raw===undefined || typeof raw==='boolean' || String(raw).trim()==='')return null;
  const amount=Number(raw);
  return Number.isFinite(amount)?amount:null;
}
