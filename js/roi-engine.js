export function calculateROI(data){

const nights = 365 * (data.occupancy / 100)

const gross = data.priceNight * nights

const yearlyExpenses = data.expenses * 12

const operatingProfit = gross - yearlyExpenses

const roi =
data.equity > 0
? (operatingProfit/data.equity)*100
: 0

return {
gross,
net:operatingProfit,
roi
}

}

