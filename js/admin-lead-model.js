export const leadType = lead => String(lead.lastType || lead.type || lead.typesVisited?.at(-1) || 'analysis').toLowerCase().replace(/^career$/,'work');
export const operationalLead = lead => ['immobili','mutui','partner','work','auth'].includes(leadType(lead));
export const leadTime = lead => {const value=lead.lastActivity||lead.updatedAt||lead.createdAt;return Number(value?.seconds!=null?value.seconds*1000:new Date(value||0).getTime())||0;};
export function selectLeads(leads,{category='all',search='',status='all',sort='recent'}={}){
 const normalize=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const term=normalize(search).trim();
 const matches=leads.filter(lead=>{
  const type=leadType(lead),score=String(lead.score||'cold').toLowerCase();
  const categoryMatch=category==='all'||(category==='priority'&&!operationalLead(lead)&&['extreme','hot'].includes(score))||(operationalLead(lead)?category===type:category===score);
  return categoryMatch && (status==='all'||(lead.status||'new')===status) && (!term||normalize([lead.email,lead.name,lead.city,lead.phone,lead.role,lead.lastSource,lead.lastFunnel,lead.message].join(' ')).includes(term));
 });
 return matches.sort((a,b)=>sort==='oldest'?leadTime(a)-leadTime(b):sort==='value'?(Number(b.value)||0)-(Number(a.value)||0):leadTime(b)-leadTime(a));
}
export function leadCSV(leads){
 const cell=value=>{let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
 return '\uFEFF'+[['Email','Nome','Città','Tipo','Stato','Fonte','Priorità','Valore convenzionale','Ultima attività','Note admin'],...leads.map(l=>[l.email,l.name,l.city,leadType(l),l.status||'new',l.lastSource||l.source,l.score,l.value,leadTime(l)?new Date(leadTime(l)).toISOString():'',l.adminNotes])].map(row=>row.map(cell).join(';')).join('\r\n');
}
