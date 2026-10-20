import {mortgageSimulation} from './mortgage-engine.js?v=20261012-rc106';

// Only supplied values are used. Missing fees are never silently zero.
export function evaluateQuotes(raw,journey){
  const checked=journey.validate({amount:raw.amount,years:raw.years,rate:0,income:0});
  const errors={...checked.errors};
  const quotes=['a','b'].map(key=>{
    const values={};
    for(const [field,kind,maximum,required] of [['tan','rate',100,true],['apr','rate',100,false],['upfront','amount',100000000,false],['monthlyFee','amount',1000000,false]]){
      const supplied=String(raw[key]?.[field]??'').trim()!=='';
      const value=supplied?journey.parseNumber(raw[key][field],kind):null;
      if((required&&!supplied)||(supplied&&(value===null||value<0||value>maximum)))errors[`quote-${key}-${field}`]='invalid_quote_input';
      values[field]=value;
    }
    if(Object.keys(errors).length)return {key,...values};
    const model=mortgageSimulation(checked.values.amount,values.tan,checked.values.years);
    const months=checked.values.years*12;
    return {key,...values,...model,
      monthlyOutlay:values.monthlyFee===null?null:model.monthlyPayment+values.monthlyFee,
      totalWithRecordedFees:values.upfront===null||values.monthlyFee===null?null:model.totalPaid+values.upfront+values.monthlyFee*months};
  });
  return {valid:Object.keys(errors).length===0,errors,amount:checked.values.amount,years:checked.values.years,quotes};
}

export function initMortgageQuotes({document,window,journey}){
  const root=document.getElementById('quote-comparison');if(!root||!journey)return;
  const result=document.getElementById('quote-result'),status=document.getElementById('quote-status');
  const common=['amount','years'];
  const quoteIds=['a','b'].flatMap(k=>['tan','apr','upfront','monthlyFee'].map(f=>`quote-${k}-${f}`));
  const fields=[...common,...quoteIds];let current=null;
  const t=(it,en)=>window.currentLang==='en'?en:it;
  const money=n=>new Intl.NumberFormat(window.currentLang==='en'?'en-GB':'it-IT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
  const percent=n=>n===null?t('Non indicato','Not supplied'):new Intl.NumberFormat(window.currentLang==='en'?'en-GB':'it-IT',{maximumFractionDigits:3}).format(n)+'%';
  const add=(parent,tag,value)=>{const e=document.createElement(tag);e.textContent=value;parent.append(e);return e;};
  function invalidate(){
    const hadResult=!!current;current=null;result.replaceChildren();result.hidden=true;
    if(hadResult)status.textContent=t('Dati modificati: confronta di nuovo i preventivi.','Inputs changed: compare the quotes again.');
  }
  for(const id of fields){const e=document.getElementById(id);e.addEventListener('input',()=>{e.removeAttribute('aria-invalid');invalidate();});}
  function render(){
    if(!current)return;result.replaceChildren();result.hidden=false;
    add(result,'p',t('Stesso importo e durata: ','Same amount and term: ')+money(current.amount)+' · '+current.years+' '+t('anni','years')+'.');
    const scroll=add(result,'div','');scroll.className='rb165-table';
    const table=add(scroll,'table','');add(table,'caption',t('Confronto sulle condizioni inserite','Comparison of the entered terms'));
    const header=add(add(table,'thead',''),'tr','');
    for(const value of [t('Indicatore','Metric'),t('Preventivo A','Quote A'),t('Preventivo B','Quote B')])add(header,'th',value).scope='col';
    const body=add(table,'tbody','');
    const missing=t('Non calcolato: spese mancanti','Not calculated: fees missing');
    const rows=[
      [t('TAN inserito','Entered nominal rate (TAN)'),q=>percent(q.tan)],
      [t('TAEG dichiarato nel preventivo','APR (TAEG) stated in the quote'),q=>percent(q.apr)],
      [t('Rata mensile senza spese accessorie','Monthly payment excluding fees'),q=>money(q.monthlyPayment)],
      [t('Interessi totali, tasso costante','Total interest, constant rate'),q=>money(q.totalInterest)],
      [t('Uscita mensile con le spese periodiche inserite','Monthly outlay with the entered recurring fees'),q=>q.monthlyOutlay===null?missing:money(q.monthlyOutlay)],
      [t('Totale rate e spese inserite, intera durata','Total payments and entered fees, full term'),q=>q.totalWithRecordedFees===null?missing:money(q.totalWithRecordedFees)]
    ];
    for(const [label,format] of rows){const row=add(body,'tr','');add(row,'th',label).scope='row';for(const q of current.quotes)add(row,'td',format(q));}
    const buttons=add(result,'div','');buttons.className='rb165-actions';
    for(const quote of current.quotes){
      const b=add(buttons,'button',t('Usa TAN ','Use TAN ')+quote.key.toUpperCase()+t(' nel simulatore',' in the simulator'));b.type='button';
      b.addEventListener('click',()=>{
        if(!current)return;
        const rate=document.getElementById('rate');rate.value=String(quote.tan);
        rate.dispatchEvent(new window.Event('input',{bubbles:true}));
        status.textContent=t('TAN riportato nel simulatore. Premi Calcola impatto; TAEG e spese di questo confronto non vengono trasferiti in Analizza.','Nominal rate copied to the simulator. Select Calculate impact; APR and fees from this comparison are not transferred to Analyse.');
      });
    }
    status.textContent=t('Confronto calcolato sui dati inseriti. Spese mancanti e TAEG non vengono stimati.','Comparison calculated from the entered inputs. Missing fees and APR are not estimated.');
  }
  document.getElementById('compare-quotes').addEventListener('click',()=>{
    const raw=Object.fromEntries(common.map(id=>[id,document.getElementById(id).value]));
    for(const key of ['a','b'])raw[key]=Object.fromEntries(['tan','apr','upfront','monthlyFee'].map(f=>[f,document.getElementById(`quote-${key}-${f}`).value]));
    const checked=evaluateQuotes(raw,journey);
    for(const id of fields)document.getElementById(id).setAttribute('aria-invalid',checked.errors[id]?'true':'false');
    if(!checked.valid){
      invalidate();const id=Object.keys(checked.errors)[0];
      status.textContent=t('Controlla importo e durata del simulatore e i TAN dei due preventivi. Le spese facoltative devono essere numeri non negativi; lascia vuoto ciò che non conosci.','Check the simulator amount and term and both quote nominal rates. Optional fees must be non-negative numbers; leave unknown values blank.');
      document.getElementById(id)?.focus();return;
    }
    current=checked;render();
  });
  document.addEventListener('rb_language_changed',()=>{if(current)render();else status.textContent='';});
  return {invalidate};
}
if(typeof document!=='undefined')initMortgageQuotes({document,window,journey:window.RBInvestmentJourney});
