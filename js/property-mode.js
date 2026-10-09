// The form has two independent financing models. Switching never recalculates or saves.
export function initPropertyMode(window, document){
  const mode = document.getElementById('property-mode');
  if(!mode) return;
  const field = id => document.getElementById(id);
  const drafts = {};
  let active = mode.value === 'owned' ? 'owned' : 'purchase';
  const updateText = (id,it,en) => {
    const el=field(id); if(!el)return;
    el.dataset.it=it;el.dataset.en=en;el.textContent=window.currentLang==='en'?en:it;
  };
  const present = () => {
    const owned=active==='owned';
    const price=field('price'); const equity=field('equity');
    price.min=owned?'0':'0.01'; price.required=!owned;
    price.placeholder=owned?'0':'150000';
    equity.required=!owned; equity.placeholder=owned?'0':'30000';
    updateText('property-price-label',owned?'Valore attuale immobile (€) · facoltativo':'Prezzo immobile (€)',owned?'Current property value (€) · optional':'Property price (€)');
    updateText('property-equity-label',owned?'Capitale per avvio, arredo e lavori (€)':'Capitale proprio (€)',owned?'Capital for startup, furnishing and renovation (€)':'Equity (€)');
    for(const id of ['owned-property-help','owned-loan-group'])if(field(id))field(id).hidden=!owned;
    for(const id of ['purchase-equity-help','purchase-loan-help'])if(field(id))field(id).hidden=owned;
  };
  const change = next => {
    if(next!=='owned' && next!=='purchase')return;
    if(next!==active){
      drafts[active]={price:field('price').value,equity:field('equity').value};
      active=next;mode.value=next;
      const values=drafts[next] || {price:next==='owned'?'0':'',equity:next==='owned'?'0':''};
      field('price').value=values.price;field('equity').value=values.equity;
      if(next==='owned'){
        window.rbImportedMortgage=null;
        window.RBInvestmentJourney?.clear?.(window.sessionStorage);
        if(field('mortgage-transfer-summary'))field('mortgage-transfer-summary').hidden=true;
      }
    }
    field('price').setCustomValidity?.('');field('equity').setCustomValidity?.('');
    present();
    document.dispatchEvent?.(new Event('change',{bubbles:true}));
  };
  mode.addEventListener('change',()=>change(mode.value));
  document.addEventListener('rb_language_changed',present);
  window.rbSetPropertyMode=change;
  present();
}

// Add operational context after all legacy investment panels have rendered.
export function renderPropertyModeResults(data, {window,document,access}={}){
  const owned=data?.propertyMode==='owned' || data?.assumptions?.source==='owned_property';
  let note=document.getElementById('owned-property-result-note');
  if(!note && owned){
    const parent=document.getElementById('rb-simulation-summary');
    if(parent){note=document.createElement('p');note.id='owned-property-result-note';note.setAttribute('role','note');note.style.cssText='padding:12px;border-radius:12px;background:#f0fdfa;color:#123b32;font-size:13px;line-height:1.5';parent.prepend(note);}
  }
  if(note){
    note.hidden=!owned;
    note.textContent=window.currentLang==='en'
      ? 'Already owned property · no purchase or new loan assumed. Revenue and cashflow are estimates. Return on startup capital excludes the value of the house; it is not total return on your property.'
      : 'Immobile già di proprietà · nessun acquisto o nuovo mutuo presunto. Ricavi e cashflow sono stime. Il ROI sul capitale di avvio esclude il valore della casa: non è il rendimento complessivo del patrimonio.';
  }
  if(!owned)return;
  const en=window.currentLang==='en';
  const price=Number(data.price ?? data.propertyPrice ?? data.assumptions?.propertyPrice ?? 0);
  const equity=Number(data.equity ?? 0);
  const paid=access?.isInvestor || access?.isPro || access?.isAdmin;
  {
    const ranking=document.getElementById('investment-ranking');
    if(ranking)ranking.innerHTML='<p>'+(en?'Startup ROI excludes the house value and cannot be ranked against acquisition ROI. Assess revenue, costs and cashflow.':'Il ROI di avvio esclude il valore della casa e non è confrontabile con il ROI di acquisto. Valuta ricavi, costi e cashflow.')+'</p>';
  }
  if(paid){
    const label=document.getElementById('roi-main-basis');
    if(label){label.dataset.it='ROI sul capitale di avvio';label.dataset.en='Return on startup capital';label.textContent=en?label.dataset.en:label.dataset.it;}
  }
  if(paid && equity>0){const badge=document.getElementById('roi-badge');if(badge)badge.textContent=en?'Return on startup capital · house value excluded':'ROI sul capitale di avvio · valore della casa escluso';}
  if(price<=0){
    for(const id of ['roi-preview-live','roi-card-live']){const el=document.getElementById(id);if(el)el.textContent='N/A';}
  }
  const payback=document.getElementById('break-even');
  if(payback && equity===0)payback.textContent='N/A';
}
