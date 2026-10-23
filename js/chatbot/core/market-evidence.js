// Public provenance questions and market requests never use unsourced legacy market narratives.
(function(){
 'use strict';
 window.rbBuildMarketEvidenceResponse=function(message,{force=false}={}){
  const q=String(message||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(/\b(?:pdf|documento|document|file|brochure)\b/.test(q))return null;
  const source=/benchmark|riferiment[oi].*(?:mercato|citta|font)|market|mercato|quartier|neighbou?rhood|\b(?:fonte|fonti|source|sources)\b.*(?:adr|occup|dat|roi|period)|(?:adr|occup|roi|dat).*(?:fonte|fonti|source|periodo|zona|tipologia)/.test(q);
  if(!force&&!source)return null;
  if(!force && /(?:mio|mia|my|nostr|our|pms|prenotaz|booking)/.test(q) && !/mercato|market|benchmark|fonte|source|quartier/.test(q))return null;
  const references=[];
  const table=window.RB_MARKET_DATA||{};
  for(const [key,record]of Object.entries(table)){
   const aliases={roma:['rome'],napoli:['naples'],milano:['milan'],firenze:['florence'],venezia:['venice']}[key]||[];
   if([key,...aliases].some(name=>new RegExp('\\b'+name+'\\b').test(q))){const ref=window.rbDataProvenance?.reference(key);if(ref)references.push(ref);}
  }
  const introIT=window.rbDataProvenance?.notice('it')||'I riferimenti sono ipotesi interne statiche. Fonte esterna, periodo, zona e tipologia non documentati: non sono statistiche di mercato verificate.';
  const introEN=window.rbDataProvenance?.notice('en')||'References are static internal assumptions. External source, period, district and property type are undocumented: these are not verified market statistics.';
  const lines=lang=>references.slice(0,5).map(r=>{
   const n=v=>new Intl.NumberFormat(lang==='en'?'en-GB':'it-IT',{maximumFractionDigits:2}).format(v);
   return lang==='en'?`${r.city} — assumed nightly rate ${n(r.adr)} EUR; assumed occupancy ${n(r.occupancy)}%; calculated annual gross revenue ${n(r.annualRevenue)} EUR (rate × 365 × occupancy).`:`${r.city} — tariffa ipotizzata ${n(r.adr)} EUR; occupazione ipotizzata ${n(r.occupancy)}%; ricavi lordi annui calcolati ${n(r.annualRevenue)} EUR (tariffa × 365 × occupazione).`;
  }).join('\n');
  return {type:'market_provenance',confidence:1,actions:[],metadata:{source:'internal_static_assumptions',classification:'C',derivedClassification:'B',verifiedMarketData:false,cities:references.map(r=>r.key)},
   textIT:introIT+'\n\n'+lines('it')+'\n\nPer i prezzi pubblicati esiste ora una serie separata con fonte, zona, tipologia, capienza, campione e periodo: apri Mercato → Confronta alloggi simili (https://www.rendimentobb.it/market/#territorial-benchmarks). Non misura ADR incassato, occupazione reale o ROI territoriale. Non disponiamo di un benchmark territoriale verificato per stabilire quale zona o immobile renda di più. Il ROI interno ha costi e leva non documentati e non consente un confronto di performance con il tuo ROI. Le ipotesi di pricing PMS appartengono a una tabella interna distinta. I report precedenti non diventano dati verificati per la sola presenza dell’etichetta benchmark. Confronta scenari omogenei e documenta fonte, periodo, tipologia e unità prima di decidere.',
   textEN:introEN+'\n\n'+lines('en')+'\n\nAdvertised prices now have a separate series with source, area, property type, capacity, sample and period: open Market → Compare similar accommodation (https://www.rendimentobb.it/market/#territorial-benchmarks). It does not measure booked ADR, actual occupancy or territorial ROI. We do not have a verified local benchmark to establish which area or property yields more. The internal ROI has undocumented costs and leverage and cannot establish performance relative to your ROI. PMS pricing assumptions use a separate internal table. Earlier reports do not become verified data merely because they contain a benchmark label. Compare matching scenarios and document source, period, property type and unit before deciding.'};
 };
})();
