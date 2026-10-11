const amount = value => {
  if(value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= 1e12 ? n : null;
};

export function renovationRecovery(properties = []){
  const rows = properties.filter(p => p.renovationPlan).map(p => {
    const plan = p.renovationPlan;
    // Line items are authoritative; cached metrics may be stale.
    const items = Array.isArray(plan.items) ? plan.items : null;
    const values = items?.map(item => item.actualCost === undefined || item.actualCost === '' ? 0 : amount(item.actualCost));
    const spent = values ? values.every(n => n !== null && n >= 0) ? values.reduce((s,n)=>s+n,0) : null : amount(plan.metrics?.actualSpent);
    const annualCashflow = amount(p.investmentSnapshot?.annualCashflow);
    const actualSpent = spent !== null && spent >= 0 ? spent : null;
    const paybackYears = actualSpent > 0 && annualCashflow > 0 ? actualSpent / annualCashflow : null;
    const projections = [1,3,5].map(years => ({years,
      balance: actualSpent !== null && annualCashflow !== null ? annualCashflow * years - actualSpent : null}));
    return {id:p.id,name:String(p.name || ''),actualSpent,annualCashflow,paybackYears,projections};
  });
  const spentKnown = rows.every(r=>r.actualSpent !== null);
  return {rows,totalSpent:rows.length && spentKnown ? rows.reduce((s,r)=>s+r.actualSpent,0) : null};
}

export function renovationRecoveryHTML(properties = [], lang = 'it'){
  const en = lang === 'en';
  const t = (it,eng)=>en?eng:it;
  const esc = v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = v=>v === null ? t('Non disponibile','Unavailable') : new Intl.NumberFormat(en?'en-GB':'it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(v);
  const data = renovationRecovery(properties);
  const intro = `<h3>${t('Spese di ristrutturazione e recupero stimato','Renovation costs and estimated recovery')}</h3><p>${t('Spese effettive inserite:','Recorded actual costs:')} <strong>${money(data.totalSpent)}</strong></p>`;
  if(!data.rows.length) return intro+`<p>${t('Nessun piano salvato. Inserisci le voci Effettivo nella ristrutturazione di una struttura.','No saved plans. Enter Actual amounts in a property’s renovation plan.')}</p>`;
  const table = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;min-width:660px;text-align:left"><thead><tr>${[t('Struttura','Property'),t('Spese effettive','Actual costs'),t('Cashflow annuo stimato','Estimated annual cash flow'),t('Recupero semplice','Simple recovery'),t('Saldo a 1 / 3 / 5 anni','Balance after 1 / 3 / 5 years')].map(x=>`<th style="padding:10px;border-bottom:1px solid #cbd5e1">${x}</th>`).join('')}</tr></thead><tbody>${data.rows.map(row=>{
    const recovery = row.actualSpent === 0 ? t('Nessuna spesa inserita','No costs entered') : row.paybackYears !== null ? `${new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:2}).format(row.paybackYears)} ${t('anni','years')}` : row.annualCashflow !== null && row.annualCashflow <= 0 ? t('Non recuperabile con questo cashflow','Not recoverable with this cash flow') : t('Dati da completare','Complete the data');
    return `<tr>${[esc(row.name || t('Struttura senza nome','Unnamed property')),money(row.actualSpent),money(row.annualCashflow),recovery,row.projections.map(p=>money(p.balance)).join(' / ')].map(x=>`<td style="padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top">${x}</td>`).join('')}</tr>`;
  }).join('')}</tbody></table></div>`;
  return intro+table+`<p style="font-size:12px;line-height:1.6;color:#64748b">${t('Confronto delle spese cumulative inserite con il cashflow annuo della simulazione salvata, mantenuto costante. Saldo = cashflow × anni − spese. Non indica incassi reali, spese di uno specifico anno né il guadagno aggiuntivo causato dai lavori. Le spese non vengono sommate ai costi mensili: evita di inserirle anche lì. Imposte, finanziamento dei lavori, inflazione e nuove spese non vengono ricalcolati.','Comparison of cumulative recorded costs against annual cash flow from the saved simulation, held constant. Balance = cash flow × years − costs. This does not show actual receipts, costs for a specific calendar year or additional profit caused by the works. Costs are not added to monthly expenses: avoid entering them there too. Taxes, renovation financing, inflation and future costs are not recalculated.')}</p>`;
}
