// Public, local-only comparison. No listing fetch, scoring, or inferred market data.
export function safeListingURL(raw){
  const text=String(raw??'').trim();
  if(!text)return '';
  if(text.length>2048 || /[\x00-\x20\x7f]/.test(text))return null;
  try{
    const u=new URL(text);
    return u.protocol==='https:' && u.hostname.includes('.') && !u.username && !u.password ? u.href : null;
  }catch{return null;}
}

export function compareProperties(raw,parseNumber){
  const errors={};
  const budgetRaw=String(raw.budget??'').trim();
  const budget=budgetRaw?parseNumber(budgetRaw):null;
  if(budgetRaw && (budget===null || budget<=0 || budget>1e8))errors.budget=true;
  const properties=['a','b'].map(key=>{
    const input=raw[key]||{},city=String(input.city??'').trim();
    if(!city || city.length>80 || /[<>\x00-\x1f\x7f]/.test(city))errors[`${key}-city`]=true;
    const values={};
    for(const [field,max,required] of [['price',1e8,true],['sqm',10000,true],['works',1e8,false],['other',1e8,false]]){
      const supplied=String(input[field]??'').trim()!=='';
      const value=supplied?parseNumber(input[field]):null;
      if((required&&!supplied)||(supplied&&(value===null || value<0 || (required&&value===0) || value>max)))errors[`${key}-${field}`]=true;
      values[field]=value;
    }
    const url=safeListingURL(input.url);
    if(url===null)errors[`${key}-url`]=true;
    const date=String(input.date??'').trim();
    if(date){
      const d=new Date(date+'T00:00:00Z');
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date)errors[`${key}-date`]=true;
    }
    const total=values.price===null||values.works===null||values.other===null?null:values.price+values.works+values.other;
    return {key,city,url,date,...values,
      pricePerSqm:values.price!==null&&values.sqm>0?values.price/values.sqm:null,
      total,
      budgetAfterPrice:budget!==null&&values.price!==null?budget-values.price:null,
      budgetAfterCosts:budget!==null&&total!==null?budget-total:null};
  });
  return {valid:Object.keys(errors).length===0,errors,budget,properties};
}

export function initPropertyComparison({document,window,parseNumber}){
  const form=document.getElementById('rb167-comparison');
  if(!form||!parseNumber)return;
  const result=document.getElementById('rb167-result'),status=document.getElementById('rb167-status');
  const fields=['budget',...['a','b'].flatMap(k=>['city','price','sqm','url','date','works','other'].map(f=>`${k}-${f}`))];
  let current=null;
  const t=(it,en)=>window.currentLang==='en'?en:it;
  const add=(parent,tag,value)=>{const el=document.createElement(tag);el.textContent=value;parent.append(el);return el;};
  const number=n=>new Intl.NumberFormat(window.currentLang==='en'?'en-GB':'it-IT',{maximumFractionDigits:2}).format(n);
  const money=n=>new Intl.NumberFormat(window.currentLang==='en'?'en-GB':'it-IT',{style:'currency',currency:'EUR'}).format(n);
  const unknown=()=>t('Non indicato','Not supplied');
  function invalidate(){
    const had=!!current;current=null;result.replaceChildren();result.hidden=true;
    if(had)status.textContent=t('Dati modificati: confronta di nuovo prima di usare i risultati.','Inputs changed: compare again before using the results.');
  }
  function prepare(p){
    if(!current)return;
    document.getElementById('property-link').value=p.url;
    window.analyzeProperty(true);
    for(const [field,value] of [['price',p.price],['sqm',p.sqm],['city',p.city]]){
      const el=document.getElementById('detected-'+field);if(el)el.value=String(value);
    }
    const preview=document.getElementById('property-preview');
    const note=add(preview,'p',t('Dati copiati dal confronto: verifica la scheda. Lavori, altre spese e budget non vengono trasferiti; completali separatamente in Analizza.','Details copied from your comparison: review the worksheet. Works, other costs and budget are not transferred; complete them separately in Analyse.'));
    note.setAttribute('data-it','Dati copiati dal confronto: verifica la scheda. Lavori, altre spese e budget non vengono trasferiti; completali separatamente in Analizza.');
    note.setAttribute('data-en','Details copied from your comparison: review the worksheet. Works, other costs and budget are not transferred; complete them separately in Analyse.');
    preview.scrollIntoView({block:'center',behavior:'smooth'});
    document.getElementById('detected-price')?.focus({preventScroll:true});
  }
  function render(){
    if(!current)return;
    result.replaceChildren();result.hidden=false;
    const wrap=add(result,'div','');wrap.className='rb167-table-wrap';
    const table=add(wrap,'table','');add(table,'caption',t('Confronto sui dati inseriti · nessuna valutazione automatica dell’immobile','Comparison of entered details · no automatic property valuation'));
    const hr=add(add(table,'thead',''),'tr','');
    for(const title of [t('Indicatore','Metric'),t('Immobile A','Property A'),t('Immobile B','Property B')])add(hr,'th',title).scope='col';
    const body=add(table,'tbody','');
    const missing=t('Non calcolato: spese mancanti','Not calculated: costs missing');
    const rows=[
      [t('Comune dichiarato','Entered town'),p=>p.city],
      [t('Prezzo richiesto','Asking price'),p=>money(p.price)],
      [t('Superficie dichiarata','Stated floor area'),p=>number(p.sqm)+' m²'],
      [t('Prezzo richiesto al m²','Asking price per m²'),p=>money(p.pricePerSqm)+'/m²'],
      [t('Lavori e allestimento inseriti','Entered works and setup'),p=>p.works===null?unknown():money(p.works)],
      [t('Altre spese iniziali inserite','Entered other upfront costs'),p=>p.other===null?unknown():money(p.other)],
      [t('Prezzo + sole spese iniziali inserite, prima del finanziamento','Price + recorded upfront costs only, before financing'),p=>p.total===null?missing:money(p.total)],
      [t('Budget − solo prezzo (esclude le spese)','Budget − price only (excludes costs)'),p=>current.budget===null?t('Budget non indicato','Budget not supplied'):money(p.budgetAfterPrice)],
      [t('Budget − prezzo e spese iniziali inserite','Budget − price and recorded upfront costs'),p=>current.budget===null?t('Budget non indicato','Budget not supplied'):p.total===null?missing:money(p.budgetAfterCosts)],
      [t('Data di verifica dichiarata','Entered date checked'),p=>p.date?new Intl.DateTimeFormat(window.currentLang==='en'?'en-GB':'it-IT',{timeZone:'UTC'}).format(new Date(p.date+'T00:00:00Z')):unknown()]
    ];
    for(const [label,format] of rows){const tr=add(body,'tr','');add(tr,'th',label).scope='row';for(const p of current.properties)add(tr,'td',format(p));}
    const tr=add(body,'tr','');add(tr,'th',t('Fonte indicata dall’utente','Source supplied by the user')).scope='row';
    for(const p of current.properties){const td=add(tr,'td','');if(p.url){const a=add(td,'a',t('Apri annuncio','Open listing')+' ↗');a.href=p.url;a.target='_blank';a.rel='noopener noreferrer';}else td.textContent=unknown();}
    const actions=add(result,'div','');actions.className='rb167-transfer';
    add(actions,'p',t('Un margine negativo segnala un superamento del budget inserito. I totali non attestano che tutti i costi siano inclusi. Prepara una scheda con comune, prezzo, superficie e link: lavori, altre spese, mutuo e capitale proprio vanno completati e verificati separatamente in Analizza.','A negative balance means the entered budget is exceeded. Totals do not establish that all costs are included. Prepare a worksheet with town, price, area and link: works, other costs, financing and equity must be completed and checked separately in Analyse.'));
    for(const p of current.properties){const button=add(actions,'button',t('Prepara scheda ','Prepare worksheet ')+p.key.toUpperCase());button.type='button';button.className='btn btn-primary';button.addEventListener('click',()=>prepare(p));}
    status.textContent=t('Confronto pronto. Dati inseriti dall’utente, non verificati con i portali. Nessuna classifica di rendimento.','Comparison ready. User-entered data, not checked against portals. No return ranking.');
  }
  for(const field of fields){const el=document.getElementById('rb167-'+field);el.addEventListener('input',()=>{el.removeAttribute('aria-invalid');invalidate();});}
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const raw={budget:document.getElementById('rb167-budget').value};
    for(const k of ['a','b'])raw[k]=Object.fromEntries(['city','price','sqm','url','date','works','other'].map(f=>[f,document.getElementById(`rb167-${k}-${f}`).value]));
    const checked=compareProperties(raw,parseNumber);
    for(const field of fields)document.getElementById('rb167-'+field).setAttribute('aria-invalid',checked.errors[field]?'true':'false');
    if(!checked.valid){
      invalidate();status.textContent=t('Controlla i campi evidenziati: per entrambi servono comune, prezzo e superficie positivi. Budget positivo se indicato, spese non negative, link HTTPS e date valide.','Check highlighted fields: both properties need a town, positive price and floor area. Supply a positive budget if used, non-negative costs, HTTPS links and valid dates.');
      const first=document.getElementById('rb167-'+Object.keys(checked.errors)[0]);
      const details=first?.closest('details');if(details)details.open=true;
      first?.focus();return;
    }
    current=checked;render();
  });
  form.addEventListener('reset',()=>{
    invalidate();status.textContent=t('Confronto svuotato. Una scheda già preparata sotto resta separata.','Comparison cleared. A worksheet already prepared below remains separate.');
    for(const field of fields)document.getElementById('rb167-'+field).removeAttribute('aria-invalid');
  });
  document.addEventListener('rb_language_changed',()=>{if(current)render();else status.textContent='';});
  document.getElementById('rb167-submit').disabled=false;
  return {invalidate};
}
if(typeof document!=='undefined')initPropertyComparison({document,window,parseNumber:window.RBInvestmentJourney?.parseNumber});
