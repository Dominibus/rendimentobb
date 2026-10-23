// C = internal assumption; B = arithmetic derived from assumptions. No survey provenance exists.
(function(){
 'use strict';
 const metadata=Object.freeze({category:'C',derivedCategory:'B',source:'internal-static',externalSource:null,observationPeriod:null,neighbourhood:null,propertyType:null,capacity:null,intendedUse:'short_stay_scenario',seasonality:'not_modelled',verifiedMarketData:false});
 window.rbDataProvenance=Object.freeze({
  metadata,
  notice(lang='it'){return lang==='en'
   ? 'Internal assumptions, not a market survey. City label only: district, property type, capacity, external source, sample and observation period are undocumented. No local seasonality is modelled. Use your own checked inputs.'
   : 'Ipotesi interne, non una rilevazione di mercato. La città è solo un’etichetta: zona, tipologia, capienza, fonte esterna, campione e periodo non sono documentati. Stagionalità locale non modellata. Usa ipotesi verificate per il tuo immobile.';},
  annualRevenue(record){
   if(!record||typeof record.price!=='number'||!Number.isFinite(record.price)||record.price<0||typeof record.occupancy!=='number'||!Number.isFinite(record.occupancy)||record.occupancy<0||record.occupancy>1)return null;
   return record.price*365*record.occupancy;
  },
  reference(city){
   const aliases={rome:'roma',naples:'napoli',milan:'milano',florence:'firenze',venice:'venezia'};
   let key=String(city||'').trim().toLowerCase().replace(/\s*\([a-z]{2}\)$/,'').trim();key=aliases[key]||key;
   const table=window.RB_MARKET_DATA;
   if(!table||!Object.hasOwn(table,key))return null;
   const record=table[key];return {key,city:record.city,adr:record.price,occupancy:record.occupancy*100,annualRevenue:this.annualRevenue(record),illustrativeROI:record.roi,metadata};
  }
 });
})();
