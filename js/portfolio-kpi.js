// Missing data is distinct from a measured zero. No estimates are invented here.
export function financialNumber(value){
  if(value === null || value === undefined || typeof value === 'boolean' ||
     (typeof value !== 'number' && typeof value !== 'string') ||
     (typeof value === 'string' && !value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
export function summarizeInvestments(rows = []){
  const count = rows.length;
  const values = key => rows.map(row => financialNumber(row[key])).filter(value => value !== null);
  const mean = list => list.length ? list.reduce((sum,value)=>sum+value,0)/list.length : null;
  const total = list => count && list.length === count ? list.reduce((sum,value)=>sum+value,0) : null;
  const rois = rows.filter(row => row.roiAvailable !== false && financialNumber(row.equity) !== 0).map(row => financialNumber(row.roi)).filter(value => value !== null);
  const cashflows = values('net');
  const equities = rows.map(row => financialNumber(row.equity)).filter(value => value !== null && value >= 0);
  const prices = rows.map(row => financialNumber(row.price)).filter(value => value !== null && value >= 0);
  const scores = values('investmentScore').filter(value => value >= 0 && value <= 100);
  const equity = total(equities);
  const cashflow = total(cashflows);
  // Include every confirmed property's cashflow, including fully financed ones.
  const weightedROI = count && cashflow !== null && equity > 0
    ? cashflow / equity * 100 : null;
  return {count, averageROI:mean(rois), averageCashflow:mean(cashflows), price:total(prices),
    equity, cashflow, weightedROI, score:scores.length ? Math.round(mean(scores)) : null,
    coverage:{roi:rois.length,cashflow:cashflows.length,equity:equities.length,score:scores.length}};
}

export function interpretPortfolio(rows = []){
  const metrics = summarizeInvestments(rows);
  const risks = rows.map(row=>financialNumber(row.risk)).filter(value=>value !== null && value >= 0 && value <= 100);
  const averageRisk = risks.length ? risks.reduce((sum,value)=>sum+value,0)/risks.length : null;
  const negativeCashflows = rows.filter(row=>{const cash=financialNumber(row.net);return cash !== null && cash < 0;}).length;
  let status = 'incomplete';
  if(!metrics.count) status = 'empty';
  else if(metrics.equity === 0 && metrics.cashflow !== null) status = 'financed';
  else if(metrics.weightedROI !== null && metrics.cashflow !== null){
    if(metrics.weightedROI < 0 || metrics.cashflow < 0) status = 'loss';
    else if(metrics.weightedROI === 0 || metrics.cashflow === 0) status = 'balanced';
    else if(negativeCashflows || risks.some(risk=>risk >= 70)) status = 'attention';
    else status = 'positive';
  }
  return {metrics,status,averageRisk,riskCount:risks.length,negativeCashflows};
}

export function highestScenarioROI(rows = []){
  const values = rows.filter(row => row.roiAvailable !== false && financialNumber(row.equity) !== 0).map(row=>financialNumber(row.roi)).filter(value=>value !== null);
  return values.length ? Math.max(...values) : null;
}

export function targetEquity(row, targetROI = 10){
  const equity = financialNumber(row?.equity);
  const cashflow = financialNumber(row?.net ?? row?.cashflow);
  const target = financialNumber(targetROI);
  if(equity === null || equity <= 0 || cashflow === null || target === null || target <= 0){
    return {status:'missing',equity:null};
  }
  if(cashflow <= 0) return {status:'nonpositive',equity:null};
  const value = cashflow / (target / 100);
  return Number.isFinite(value) ? {status:'ready',equity:value} : {status:'missing',equity:null};
}

export function scenarioCreatedTime(value){
  if(value === null || value === undefined || value === '') return 0;
  if(typeof value === 'object' && value.seconds !== undefined){
    const seconds = financialNumber(value.seconds);
    return seconds === null ? 0 : seconds * 1000;
  }
  if(typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}
