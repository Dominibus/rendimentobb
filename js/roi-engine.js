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

const nights = 365 * (occupancy / 100)

const gross = priceNight * nights

const fees = gross * (commission / 100)

const yearlyExpenses = expenses * 12

const mortgage = calculateMortgage(
loanAmount,
interestRate,
loanYears
)

const operatingProfit = gross - fees - yearlyExpenses

const taxCost =
operatingProfit > 0
? operatingProfit * (tax/100)
: 0

const net = operatingProfit - taxCost - mortgage

const roi =
equity > 0
? (net/equity)*100
: 0

return {
gross,
net,
roi,
mortgage
}

}
