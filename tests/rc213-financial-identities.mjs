import assert from 'node:assert/strict';
import {calculateROI} from '../js/roi-engine.js';
import {calculateMortgage,mortgageSimulation} from '../js/mortgage-engine.js';
import {createCommercialModel,calculateCommercial} from '../js/commercial-property-engine.js';
import {createCommercialActivityPlan} from '../js/commercial-activity-plan.js';
let checks=0;
const near=(a,b,tol=1e-5)=>{assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
for(const amount of [10000,120000,450000])for(const rate of [0,1e-12,3.5,12,100])for(const years of [1,20,40]){
 const r=rate/1200,n=years*12;
 const p=calculateMortgage(amount,rate,years)/12;
 let balance=amount; for(let i=0;i<n;i++)balance=balance*(1+r)-p;
 // High rate / long term balance recurrence suffers cancellation; verify discounted annuity by independent sum instead.
 let pv=0;for(let t=1;t<=n;t++)pv+=p/((1+r)**t);
 near(pv,amount,1e-8);if(rate<=12)near(balance,0,.01);
 const detail=mortgageSimulation(amount,rate,years);near(detail.totalInterest,p*n-amount);
}
for(const price of [0,100000,300000])for(const equity of [0,20000])for(const occ of [0,10,65,100])for(const monthly of [0,500,3000]){
 const v={price,equity,loanAmount:100000,priceNight:120,occupancy:occ,expenses:monthly,commission:15,tax:21,interestRate:0,loanYears:20};
 const o=calculateROI(v),gross=120*365*occ/100,noi=gross*.85-monthly*12,debt=5000,cash=noi-Math.max(0,noi)*.21-debt;
 near(o.gross,gross);near(o.noi,noi);near(o.annualDebtService,debt);near(o.netAfterMortgage,cash);near(o.monthlyProfit,cash/12);near(o.dscr,noi/debt);near(o.roi,equity>0?cash/equity*100:0);
}
function fixture(){const m=createCommercialModel(2027);m.property.value=180000;m.property.works=10000;m.costs.fixedAnnual=2400;m.assignments=[{id:'A1',roomId:'R1',code:'P01',mode:'weekly_monthly',weekdays:[1],slotIds:['AM'],start:'2027-01-01',end:'2027-12-31',amount:305,vat:{status:'taxable',rate:22},expectedPct:100}];return m;}
let m=fixture(),r=calculateCommercial(m);near(r.contractualGross,3660);near(r.expectedNet,3000);near(r.expectedVAT,660);near(r.cashflow,600);near(r.newEquityReturnPct,6);
const p=createCommercialActivityPlan(m);near(p.months.reduce((s,x)=>s+x.expectedNet,0),r.expectedNet);
m.assignments[0].mode='per_use';r=calculateCommercial(m);near(r.contractualGross,305*52);near(r.expectedNet,250*52);
console.log('CHECKS_PASSED',checks);
