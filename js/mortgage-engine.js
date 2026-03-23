// ===============================================
// RENDIMENTOBB – MORTGAGE ENGINE
// Calcolo rata mutuo + costo annuale
// ===============================================


// ================================
// CALCOLO RATA MUTUO
// ================================

export function calculateMortgage(amount, rate, years){

if(!amount || !rate || !years) return 0;

const monthlyRate = rate / 100 / 12;
const months = years * 12;

const monthlyPayment =
amount *
(monthlyRate * Math.pow(1 + monthlyRate, months)) /
(Math.pow(1 + monthlyRate, months) - 1);

const yearlyCost = monthlyPayment * 12;

return yearlyCost;

}


// ================================
// DETTAGLIO MUTUO
// ================================

export function mortgageSimulation(amount, rate, years){

if(!amount || !rate || !years) return null;

const monthlyRate = rate / 100 / 12;
const months = years * 12;

const monthlyPayment =
amount *
(monthlyRate * Math.pow(1 + monthlyRate, months)) /
(Math.pow(1 + monthlyRate, months) - 1);

const totalPaid = monthlyPayment * months;

const totalInterest = totalPaid - amount;

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

if(!r) return;

const yearlyCost = calculateMortgage(amount, r, years);

results.push({
name: rate.name || "Bank",
rate: r,
yearlyCost
});

});

return results;

}


