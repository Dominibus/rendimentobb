import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.window={};
const {calculateROI}=await import('../js/roi-engine.js');
const {mortgageSimulation}=await import('../js/mortgage-engine.js');
const near=(a,b,tol=.00001)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
// Independent amortization: simulate outstanding balance month by month.
function debtService(principal,rate,years){if(!principal)return 0;const n=years*12,r=rate/1200;let low=0,high=principal*(1+r);for(let step=0;step<80;step++){let balance=principal,payment=(low+high)/2;for(let month=0;month<n;month++)balance=balance*(1+r)-payment;if(balance>0)low=payment;else high=payment;}return (low+high)*6;}
for(const mode of ['purchase','owned'])for(const capital of [0,9900,30000])for(const loan of [0,60000])for(const occ of [0,40,71])test(`independent financial model ${mode} capital=${capital} loan=${loan} occupancy=${occ}`,()=>{
 const input={propertyMode:mode,price:mode==='owned'?0:150000,equity:capital,loanAmount:loan,priceNight:120,occupancy:occ,expenses:400,commission:15,tax:21,interestRate:3.5,loanYears:20};
 const result=calculateROI(input),gross=120*365*occ/100,noi=gross*.85-4800,tax=Math.max(0,noi)*.21,debt=debtService(loan,3.5,20),cash=noi-tax-debt;
 near(result.gross,gross);near(result.noi,noi);near(result.annualDebtService,debt);near(result.netAfterMortgage,cash);near(result.monthlyProfit,cash/12);assert.equal(result.roiAvailable,capital>0);if(capital)near(result.roi,cash/capital*100);assert.equal(result.propertyROIAvailable,input.price>0);
});
test('independent amortization zero and positive rates reaches zero balance',()=>{for(const rate of [0,3.5,12]){const principal=120000,years=20,monthly=debtService(principal,rate,years)/12,result=mortgageSimulation(principal,rate,years);near(result.monthlyPayment,monthly);let balance=principal;for(let n=0;n<240;n++)balance=balance*(1+rate/1200)-result.monthlyPayment;near(balance,0,.001);near(result.totalInterest,result.monthlyPayment*240-principal);}});

test('rates close to zero preserve the principal payment and cannot become free debt or Infinity',async()=>{
 const {calculateMortgage}=await import('../js/mortgage-engine.js');
 for(const rate of [1e-20,1e-16,1e-12,1e-8]){const annual=calculateMortgage(120000,rate,20),detail=mortgageSimulation(120000,rate,20);assert.ok(Number.isFinite(annual));near(annual,6000,.001);near(detail.monthlyPayment,500,.001);assert.ok(detail.totalInterest>=-.00001);}
});
