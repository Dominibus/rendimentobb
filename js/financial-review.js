import {calculateROI} from './roi-engine.js?v=20261027-rc211';
import {readInvestmentAssumptions,requiredAnnualRevenue} from './investment-assumptions.js?v=20261009-rc91';

// Read-only review of a complete versioned snapshot; never migrates saved data.
export function financialReview(value){
 const a=readInvestmentAssumptions(value);if(!a)return null;
 const inputs={propertyMode:a.source==='owned_property'?'owned':'purchase',price:a.propertyPrice,equity:a.equity,loanAmount:a.loanAmount,priceNight:a.priceNight,occupancy:a.occupancy,expenses:a.expenses,expensesUnit:a.expensesUnit,commission:a.commission,tax:a.tax,interestRate:a.interestRate,loanYears:a.loanYears};
 const result=calculateROI(inputs),required=requiredAnnualRevenue(a),full=a.priceNight*365;
 const breakEvenOccupancy=required===null?null:full>0?required/full*100:required===0?0:null;
 return {inputs,result,breakEvenOccupancy,cashflowBeforeModelTax:result.noi-result.annualDebtService,cashAfterModelTaxBeforeDebt:result.noi-result.taxCost};
}
export function financialScenarios(value){
 if(!financialReview(value))return [];
 return [['prudent',-10,.9],['base',0,1],['favourable',10,1.1]].map(([key,points,rate])=>{
  const a=readInvestmentAssumptions(value);a.occupancy=Math.max(0,Math.min(100,a.occupancy+points));a.priceNight*=rate;
  return {key,...financialReview(a)};
 });
}
const formats=lang=>{const en=lang==='en',locale=en?'en-GB':'it-IT';return {en,t:(it,eng)=>en?eng:it,n:v=>new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(v),eur:v=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(v)};};
const dl=rows=>'<dl>'+rows.map(([label,value])=>'<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;padding:6px 0"><dt>'+label+'</dt><dd style="margin:0;font-weight:700">'+value+'</dd></div>').join('')+'</dl>';
export function financialReviewHTML(value,lang='it'){
 const x=financialReview(value),{t,n,eur}=formats(lang);
 if(!x)return '<p>'+t('Ipotesi complete non disponibili: nessun ricalcolo da valori predefiniti.','Complete assumptions unavailable: no recalculation from defaults.')+'</p>';
 const r=x.result;
 const rows=[
  [t('Ricavi lordi ipotizzati','Assumed gross revenue'),eur(r.gross)],
  [t('Commissioni','Commissions'),eur(r.fees)],
  [t('Costi operativi','Operating costs'),eur(r.expensesYearly)],
  [t('NOI · prima di mutuo e imposte del modello','NOI · before financing and model tax'),eur(r.noi)],
  [t('Rendimento operativo sul valore · NOI / valore','Operating yield on value · NOI / value'),r.price>0?n(r.capRate)+'%':'N/A'],
  [t('Rate annue · capitale e interessi','Annual payments · principal and interest'),eur(r.annualDebtService)],
  [t('Cashflow prima delle imposte del modello','Cashflow before model tax'),eur(x.cashflowBeforeModelTax)],
  [t('Imposte simulate sul NOI positivo','Simulated tax on positive NOI'),eur(r.taxCost)],
  [t('Cashflow dopo rate e fiscalità simulata','Cashflow after payments and simulated tax'),eur(r.netAfterMortgage)],
  [t('Cashflow / prezzo o valore','Cashflow / price or value'),r.price>0?n(r.realROI)+'%':'N/A'],
  [t('Cashflow / capitale proprio','Cashflow / equity'),r.roiAvailable?n(r.roi)+'%':'N/A']
 ];
 const labels={base:t('Base prudenziale','Prudential floor'),roi:t('ROI sul capitale','Equity ROI'),occupancy:t('Occupazione ipotizzata','Assumed occupancy'),leverage:t('Leva LTV','LTV leverage'),debtCoverage:t('Copertura DSCR','DSCR coverage'),cashflow:'Cashflow'};
 const risk='<ul>'+Object.entries(r.riskBreakdown).map(([k,v])=>'<li>'+labels[k]+': +'+v+' '+t('punti','points')+'</li>').join('')+'</ul>';
 return '<details><summary>'+t('Come si forma il risultato · formule e limiti','How the result is calculated · formulas and limits')+'</summary>'+dl(rows)+'<p>'+t('Fiscalità da verificare: aliquota ipotizzata sul margine operativo positivo, non netto fiscale definitivo né cedolare sui ricavi. Le rate includono il rimborso del capitale: il cashflow non è utile contabile. Il rendimento operativo esclude mutuo e imposte del modello, ma include soltanto i costi dichiarati.','Tax treatment needs verification: an assumed rate on positive operating margin, not a definitive after-tax result or rental tax on gross receipts. Payments include principal repayment: cashflow is not accounting profit. Operating yield excludes financing and model tax, but includes only declared costs.')+'</p><p>'+t('Costi iniziali di acquisto, lavori, spese straordinarie, chiusure e stagionalità non sono automaticamente inclusi nel modello B&B. Verifica pulizie, utenze, assicurazione e manutenzione nel totale mensile; non duplicare commissioni, imposte o rate.','Acquisition costs, works, extraordinary expenses, closures and seasonality are not automatically included in the B&B model. Check cleaning, utilities, insurance and maintenance in monthly costs; do not duplicate commissions, tax or payments.')+'</p><p>'+t('Indice di rischio: somma di soglie interne su ROI equity, occupazione, LTV, DSCR e cashflow, con base prudenziale. Non è una probabilità di perdita; non valuta conformità, liquidità di rivendita, qualità dei comparabili o rischi fiscali.','Risk index: a sum of internal thresholds for equity ROI, occupancy, LTV, DSCR and cashflow, with a prudential floor. It is not a loss probability; compliance, resale liquidity, comparable quality and tax risk are not assessed.')+'</p>'+risk+'</details>';
}
export function financialScenariosHTML(value,lang='it'){
 const {t,n,eur}=formats(lang);
 return financialScenarios(value).map(s=>{
  const r=s.result,b=s.breakEvenOccupancy;
  const rows=[['NOI',eur(r.noi)],[t('Costi + commissioni','Costs + commissions'),eur(r.expensesYearly+r.fees)],[t('Imposte del modello','Model tax'),eur(r.taxCost)],['Cashflow',eur(r.netAfterMortgage)],['ROI equity',r.roiAvailable?n(r.roi)+'%':'N/A'],['DSCR',r.annualDebtService>0?n(r.dscr):'N/A'],[t('Pareggio occupazione','Break-even occupancy'),b===null||b>100?t('Non raggiungibile','Not reachable'):n(b)+'%'],[t('Indice rischio','Risk index'),n(r.risk)+'/100']];
  return '<div class="kpi-box"><h4>'+({prudent:t('Prudente','Conservative'),base:'Base',favourable:t('Favorevole','Favourable')})[s.key]+'</h4><p>'+n(r.occupancy)+'% · '+eur(r.priceNight)+t(' / notte',' / night')+'</p>'+dl(rows)+'</div>';
 }).join('');
}
