import {municipalityCoverage,municipalityLocation} from './municipalities.js?v=20261025-rc198';
export function setMunicipalityURL(row){
 try{const url=new URL(window.location.href);if(row)url.searchParams.set('municipality',row.istat);else url.searchParams.delete('municipality');window.history.replaceState(null,'',url.pathname+url.search+url.hash);}catch{}
}
export function applyMunicipalityToTool(row){
 const input=document.getElementById('custom-location');if(!input)return;
 input.value=municipalityLocation(row);input.dataset.municipality=row.istat;
 const city=municipalityCoverage(row)||row.name.toLowerCase();window.currentCity=city;
 try{window.sessionStorage?.setItem('tool_city',city);window.localStorage?.setItem('selected_city',city);}catch{}
 const select=document.getElementById('market-city');if(select)select.value=municipalityCoverage(row)||'';
 input.dispatchEvent(new Event('input',{bubbles:true}));
 window.renderMarketBenchmark?.(city);
 document.dispatchEvent(new CustomEvent('rb_municipality_changed',{detail:row}));
 setMunicipalityURL(row);
}
