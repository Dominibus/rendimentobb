export function calculateROI({
priceNight,
occupancy,
expenses,
commission,
tax,
equity,
loanAmount,
interestRate,
loanYears,
calculateMortgage
}){

const mortgageYearly =
calculateMortgage(loanAmount, interestRate, loanYears);

const nights = 365 * (occupancy / 100);

const gross = priceNight * nights;

const fees = gross * (commission / 100);

const yearlyExpenses = expenses * 12;

const operatingProfit = gross - fees - yearlyExpenses;

const taxCost =
operatingProfit > 0
? operatingProfit * (tax / 100)
: 0;

const netAfterMortgage =
operatingProfit - taxCost - mortgageYearly;

const roi =
equity > 0
? (netAfterMortgage / equity) * 100
: 0;

return {
gross,
fees,
operatingProfit,
taxCost,
mortgageYearly,
netAfterMortgage,
roi
};

}
