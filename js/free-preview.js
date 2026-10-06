// Keep the main KPI label aligned with the metric allowed for this plan.
export function updateSimulationROILabel({access, document, lang='it'}={}){
  const label=document?.getElementById('roi-main-basis');
  if(!label)return;
  const paid=Boolean(access?.isInvestor || access?.isPro || access?.isAdmin);
  const it=paid?'ROI sul capitale proprio':'ROI immobile';
  const en=paid?'Return on equity':'Property ROI';
  label.dataset.it=it;label.dataset.en=en;label.textContent=lang==='en'?en:it;
}

// Free gets a useful result from the current calculation, without premium panels.
export function renderFreeSimulationPreview(data, {access, document, lang='it'}={}){
  updateSimulationROILabel({access,document,lang});
  if(!access?.isFree || access.isInvestor || access.isPro || access.isAdmin || !document) return;
  const number=value=>value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
  const roi=number(data?.realROI);
  const cashflow=number(data?.netAfterMortgage ?? data?.net ?? data?.cashflow);
  const locale=lang==='en'?'en-GB':'it-IT';
  const currency=value=>value===null?'—':new Intl.NumberFormat(locale,{style:'currency',currency:'EUR',useGrouping:true,maximumFractionDigits:2}).format(value);
  for(const id of ['roi-live','roi-preview-live','roi-card-live']){
    const el=document.getElementById(id);
    if(el) el.textContent=roi===null?'—':new Intl.NumberFormat(locale,{minimumFractionDigits:1,maximumFractionDigits:1}).format(roi)+'%';
  }
  const annual=document.getElementById('profit-live');
  if(annual) annual.textContent=currency(cashflow);
  const monthly=document.getElementById('cashflow-month-preview');
  if(monthly) monthly.textContent=currency(cashflow===null?null:cashflow/12);
  const risk=document.getElementById('risk-preview');
  if(risk) risk.textContent='Investor / Pro';
  // A property ROI must not be compared visually with an equity ROI benchmark.
  const badge=document.getElementById('roi-badge');
  if(badge){badge.textContent=lang==='en'?'Property ROI · simulated cashflow / purchase price':'ROI immobile · cashflow simulato / prezzo d’acquisto';badge.className='';}
  const verdict=document.getElementById('roi-verdict');
  if(verdict) verdict.textContent=cashflow===null
    ? (lang==='en'?'Complete the inputs to calculate your scenario.':'Completa i dati per calcolare il tuo scenario.')
    : cashflow<0
      ? (lang==='en'?'The scenario has a negative cashflow. Review revenue, costs and financing assumptions.':'Lo scenario ha cashflow negativo. Rivedi le ipotesi di ricavi, costi e finanziamento.')
      : cashflow===0
        ? (lang==='en'?'The scenario breaks even on cashflow; it leaves no buffer for unforeseen costs.':'Lo scenario è in pareggio sul cashflow; non lascia margine per imprevisti.')
        : (lang==='en'?'The scenario has a positive cashflow under your assumptions. Test more cautious assumptions before deciding.':'Lo scenario ha cashflow positivo nelle ipotesi inserite. Verifica anche ipotesi più prudenti prima di decidere.');
}
