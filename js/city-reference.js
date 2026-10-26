// Explicit internal examples only: never substitute the national row for a missing city.
export function referenceCity(value){
 const text=String(value||'').toLowerCase().trim().replace(/\s*\([a-z]{2}\).*$/,'').trim();
 return ({rome:'roma',naples:'napoli',milan:'milano',florence:'firenze'})[text]||text;
}
export function illustrativeCityReference(table,value){
 const key=referenceCity(value),aliases={roma:'rome',napoli:'naples',milano:'milan',firenze:'florence'};
 if(!['italy','roma','napoli','milano','firenze'].includes(key))return null;
 const row=Object.hasOwn(table||{},key)?table[key]:Object.hasOwn(table||{},aliases[key])?table[aliases[key]]:null;
 return row&&['roi','occupancy','adr'].every(k=>typeof row[k]==='number'&&Number.isFinite(row[k]))?row:null;
}
