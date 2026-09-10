// ===============================================
// RENDIMENTOBB – MORTGAGE ENGINE
// Calcolo rata mutuo + costo annuale
// ===============================================


// ================================
// CALCOLO RATA MUTUO
// ================================

export function calculateMortgage(amount, rate, years){

const principal = Number(amount);
const annualRate = Number(rate);
const durationYears = Number(years);

if(
  !Number.isFinite(principal) ||
  !Number.isFinite(annualRate) ||
  !Number.isFinite(durationYears) ||
  principal <= 0 ||
  annualRate < 0 ||
  durationYears <= 0
) return 0;

const monthlyRate = annualRate / 100 / 12;
const months = durationYears * 12;

if(monthlyRate === 0){
  return principal / durationYears;
}

const monthlyPayment =
principal *
(monthlyRate * Math.pow(1 + monthlyRate, months)) /
(Math.pow(1 + monthlyRate, months) - 1);

const yearlyCost = monthlyPayment * 12;

return yearlyCost;

}


// ================================
// DETTAGLIO MUTUO
// ================================

export function mortgageSimulation(amount, rate, years){

const principal = Number(amount);
const annualRate = Number(rate);
const durationYears = Number(years);

if(
  !Number.isFinite(principal) ||
  !Number.isFinite(annualRate) ||
  !Number.isFinite(durationYears) ||
  principal <= 0 ||
  annualRate < 0 ||
  durationYears <= 0
) return null;

const monthlyRate = annualRate / 100 / 12;
const months = durationYears * 12;

if(monthlyRate === 0){
  return {
    monthlyPayment: principal / months,
    totalPaid: principal,
    totalInterest: 0
  };
}

const monthlyPayment =
principal *
(monthlyRate * Math.pow(1 + monthlyRate, months)) /
(Math.pow(1 + monthlyRate, months) - 1);

const totalPaid = monthlyPayment * months;

const totalInterest = totalPaid - principal;

return {

monthlyPayment,
totalPaid,
totalInterest

};

}


// ================================
// CONFRONTO MUTUI
// ================================

export function compareMortgages(amount, years, rates){

if(!amount || !years) return [];

if(!Array.isArray(rates) || rates.length === 0){
console.warn("Mortgage rates non disponibili");
return [];
}

const results = [];

rates.forEach(rate => {

const r = typeof rate === "object" ? rate.rate : rate;

const numericRate = Number(r);

if(!Number.isFinite(numericRate) || numericRate < 0) return;

const yearlyCost = calculateMortgage(amount, numericRate, years);

results.push({
name: rate.name || "Bank",
rate: numericRate,
yearlyCost
});

});

return results;

}

