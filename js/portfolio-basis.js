import {financialNumber} from './portfolio-kpi.js?v=20261009-rc76';
// A presentation breakdown; canonical portfolio totals and reports are untouched.
export function portfolioBasis(rows=[]){
  const groups={withCapital:[],zeroCapital:[],unknownCapital:[]};
  for(const row of rows){
    const equity=financialNumber(row.equity);
    groups[equity===null||equity<0?'unknownCapital':equity===0?'zeroCapital':'withCapital'].push(row);
  }
  const sum=(items,key)=>items.length&&items.every(row=>financialNumber(row[key])!==null)?items.reduce((n,row)=>n+financialNumber(row[key]),0):null;
  const cash=sum(groups.withCapital,'net'),capital=sum(groups.withCapital,'equity');
  return {
    withCapitalCount:groups.withCapital.length,zeroCapitalCount:groups.zeroCapital.length,unknownCapitalCount:groups.unknownCapital.length,
    capital,withCapitalAnnualCash:cash,withCapitalROI:capital>0&&cash!==null?cash/capital*100:null,
    zeroCapitalAnnualCash:sum(groups.zeroCapital,'net')
  };
}
