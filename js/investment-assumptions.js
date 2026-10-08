import { calculateMortgage } from "./mortgage-engine.js";
// Saved assumptions are a versioned snapshot, never a reconstruction from defaults.
const fields = ['propertyPrice','equity','loanAmount','priceNight','occupancy','expenses','commission','tax','interestRate','loanYears'];
const keys = ['schemaVersion','calculationVersion','source','expensesUnit',...fields];
export function readInvestmentAssumptions(value){
  if(!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if(Object.keys(value).length !== keys.length || keys.some(key=>!Object.hasOwn(value,key))) return null;
  if(value.schemaVersion !== 1 || value.calculationVersion !== 'roi-monthly-v1') return null;
  if(!['simulator','home_preview'].includes(value.source) || !['monthly_eur','percentage'].includes(value.expensesUnit)) return null;
  for(const key of fields){
    const limit = ['occupancy','commission','tax'].includes(key) || (key==='expenses' && value.expensesUnit==='percentage') ? 100 : key==='loanYears' ? 100 : key==='interestRate' ? 100 : 1e12;
    if(typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key]<0 || value[key]>limit) return null;
  }
  if(value.loanYears<=0) return null;
  return Object.fromEntries(keys.map(key=>[key,value[key]]));
}
export function buildInvestmentAssumptions(result, inputs, source){
  // These normalized values come from the completed engine, not the live form.
  const nonNegative=(v,fallback)=>Number.isFinite(Number(v)) && Number(v)>=0 ? Number(v) : fallback;
  return readInvestmentAssumptions({schemaVersion:1,calculationVersion:'roi-monthly-v1',source,
    propertyPrice:result.price,equity:result.equity,loanAmount:result.loan,
    priceNight:result.priceNight,occupancy:result.occupancy,
    expenses:result.expenses,expensesUnit:result.expensesUnit,
    commission:nonNegative(inputs.commission,15),tax:nonNegative(inputs.tax,21),
    interestRate:nonNegative(inputs.interestRate,3.5),loanYears:nonNegative(inputs.loanYears,20)});
}
export function investmentAssumptionsHTML(value, lang='it'){
  const a=readInvestmentAssumptions(value);const en=lang==='en';
  if(!a) return `<p style="font-size:12px;color:#64748b">${en?'Complete assumptions unavailable for this saved analysis.':'Ipotesi complete non disponibili per questa analisi salvata.'}</p>`;
  const n=v=>new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:2}).format(v);
  const eur=v=>new Intl.NumberFormat(en?'en-GB':'it-IT',{style:'currency',currency:'EUR'}).format(v);
  const rows=[
    [en?'Nightly rate':'Tariffa notte',eur(a.priceNight)],
    [en?'Occupancy':'Occupazione',n(a.occupancy)+'%'],
    [a.expensesUnit==='percentage'?(en?'Costs (% of revenue)':'Costi (% dei ricavi)'):(en?'Monthly costs':'Costi mensili'),a.expensesUnit==='percentage'?n(a.expenses)+'%':eur(a.expenses)],
    [en?'Commissions':'Commissioni',n(a.commission)+'%'],
    [en?'Model tax rate':'Aliquota del modello',n(a.tax)+'%'],
    [en?'Loan amount':'Importo mutuo',eur(a.loanAmount)],
    [en?'Annual interest rate':'Tasso annuo',n(a.interestRate)+'%'],
    [en?'Loan term':'Durata mutuo',n(a.loanYears)+(en?' years':' anni')]
  ];
  return `<details style="font-size:13px;margin:12px 0"><summary style="cursor:pointer;padding:10px 0;font-weight:600">${en?'Saved analysis assumptions':'Ipotesi dell’analisi salvata'}</summary><p style="font-size:12px;color:#64748b">${en?'Simulated inputs · ':'Dati simulati · '}${a.source==='home_preview'?(en?'Home preview':'Anteprima home'):(en?'Simulator':'Simulatore')}</p><dl style="margin:0">${rows.map(([label,value])=>`<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;padding:6px 0;border-bottom:1px solid #e2e8f0"><dt>${label}</dt><dd style="margin:0;font-weight:600">${value}</dd></div>`).join('')}</dl></details>`;
}

// Minimum annual gross revenue for non-negative cash flow under the saved model.
// Null means missing inputs or a model with no finite positive-revenue solution.
export function requiredAnnualRevenue(value){
  const a=readInvestmentAssumptions(value);
  if(!a) return null;
  const debt=calculateMortgage(a.loanAmount,a.interestRate,a.loanYears);
  const margin=1-a.commission/100-(a.expensesUnit==='percentage'?a.expenses/100:0);
  const fixed=a.expensesUnit==='monthly_eur'?a.expenses*12:0;
  if(a.tax===100 && debt>0) return null;
  const neededNOI=debt>0?debt/(1-a.tax/100):0;
  if(margin<=0) return fixed===0 && debt===0?0:null;
  const result=(fixed+neededNOI)/margin;
  return Number.isFinite(result)?result:null;
}
