// =====================================
// 🏠 DEMO INVESTMENTS
// Silicon Valley 2026
// =====================================

window.demoAnalyses = [

{

id:"demo1",

isPortfolio:true,

roi:18.7,

visualROI:18.7,

price:245000,

equity:60000,

gross:52300,

expenses:12100,

net:40200,

occupancy:82,

risk:28,

city:"roma",

marketCity:"roma",

realCity:"roma",

createdAt:new Date(2026,0,12)

},

{

id:"demo2",

isPortfolio:true,

roi:16.9,

visualROI:16.9,

price:198000,

equity:50000,

gross:45100,

expenses:9800,

net:35300,

occupancy:79,

risk:31,

city:"napoli",

marketCity:"napoli",

realCity:"napoli",

createdAt:new Date(2026,1,8)

},

{

id:"demo3",

isPortfolio:true,

roi:21.3,

visualROI:21.3,

price:318000,

equity:85000,

gross:68700,

expenses:15900,

net:52800,

occupancy:84,

risk:22,

city:"milano",

marketCity:"milano",

realCity:"milano",

createdAt:new Date(2026,2,18)

},

{

id:"demo4",

isPortfolio:true,

roi:15.4,

visualROI:15.4,

price:184000,

equity:42000,

gross:39900,

expenses:9400,

net:30500,

occupancy:74,

risk:37,

city:"firenze",

marketCity:"firenze",

realCity:"firenze",

createdAt:new Date(2026,3,11)

},

{

id:"demo5",

isPortfolio:true,

roi:19.8,

visualROI:19.8,

price:271000,

equity:70000,

gross:61200,

expenses:13700,

net:47500,

occupancy:83,

risk:24,

city:"bologna",

marketCity:"bologna",

realCity:"bologna",

createdAt:new Date(2026,4,15)

}

];

// Demo fixtures are illustrative assumptions, not market observations.
window.demoAnalyses = window.demoAnalyses.map(item => {
  const net = Math.round(item.equity * item.roi / 100);
  return { ...item, net, annualProfit: net, cashflow: net,
    realROI: net / item.price * 100,
    expenses: item.gross - net, isDemo: true, source: "illustrative" };
});

// A single readonly booking fixture feeds demo PMS metrics and its revenue chart.
window.rbBuildDemoPMS = function(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const rates = [90,92,98,103,108,115,128,132,112,105,98,110];
  const lengths = [3,2,2,2,3,2,2,2,2,2,2];
  const date = (month, day) => `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const bookings = rates.flatMap((rate, month) => {
    let day = 1;
    return lengths.map((nights, index) => {
      const arrival = day; day += nights;
      return {id:`demo-${month}-${index}`, propertyId:"demo-property",
        guestName:`${index + 1}`, checkin:date(month,arrival), checkout:date(month,day),
        nights, totalAmount:nights*rate, guests:2, source:"direct", status:"confirmed", isDemo:true};
    });
  });
  return {year, bookings, currentBookings:bookings.filter(item => Number(item.checkin.slice(5,7))-1 === referenceDate.getMonth())};
};
