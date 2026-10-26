// RC201: repair the existing city-card -> simulator input handoff.
// No calculation, persistence, market inference or entitlement changes.
export function readPropertyScenario(search='') {
  const query=new URLSearchParams(search);
  const keys=['price','night','occ'];
  if(!keys.some(key=>query.has(key)))return {status:'absent'};
  const values={};
  for(const [key,min,max] of [['price',0.01,100000000],['night',0,1000000],['occ',0,100]]){
    const entries=query.getAll(key),raw=entries[0]||'';
    if(entries.length!==1||!/^\d+(?:\.\d+)?$/.test(raw))return {status:'invalid'};
    const value=Number(raw);
    if(!Number.isFinite(value)||value<min||value>max)return {status:'invalid'};
    values[key]=value;
  }
  const cities=query.getAll('city');
  if(cities.length!==1||!['roma','napoli','milano','firenze'].includes(cities[0]))return {status:'invalid'};
  if(query.get('propertyMode')==='owned')return {status:'invalid'};
  return {status:'valid',city:cities[0],...values};
}

export function installPropertyScenarioInputs(window,document){
  const scenario=readPropertyScenario(window.location.search);
  if(scenario.status==='absent')return;
  const apply=()=>{
    const field=id=>document.getElementById(id);
    const notice=field('property-scenario-status');
    const show=(it,en)=>{
      if(!notice)return;
      notice.hidden=false;notice.dataset.it=it;notice.dataset.en=en;
      notice.textContent=window.currentLang==='en'?en:it;
    };
    if(scenario.status==='invalid'){
      show('I dati nel link sono incompleti o non validi: non sono stati importati. Compila e verifica lo scenario.',
        'The link contains incomplete or invalid inputs: nothing was imported. Enter and review your scenario.');
      return;
    }
    // The explicit mortgage workflow retains priority, including pending login.
    let pendingMortgage=false;
    try{pendingMortgage=Boolean(window.sessionStorage?.getItem(window.RBInvestmentJourney?.key||'rb_mortgage_scenario_v1'));}catch{}
    if(window.rbImportedMortgage||pendingMortgage){
      show('È presente uno scenario mutuo: i valori del link immobiliare non lo hanno sostituito. Verifica il riepilogo del mutuo.',
        'A mortgage scenario is present: property-link inputs have not replaced it. Review the mortgage summary.');
      return;
    }
    if(!field('price')||!field('priceNight')||!field('occupancy'))return;
    // A new illustrative card must not inherit another property's financing.
    for(const id of ['equity','expenses','loanAmount'])if(field(id))field(id).value='';
    for(const [id,value] of [['price',scenario.price],['priceNight',scenario.night],['occupancy',scenario.occ]]){
      field(id).value=String(value);
      field(id).dispatchEvent(new window.Event('input',{bubbles:true}));
    }
    if(!field('custom-location')?.dataset.municipality){
      window.currentCity=scenario.city;
      if(field('market-city'))field('market-city').value=scenario.city;
      if(field('custom-location')){
        field('custom-location').value=scenario.city[0].toUpperCase()+scenario.city.slice(1);
        field('custom-location').dispatchEvent(new window.Event('input',{bubbles:true}));
      }
    }
    if(field('property-banner'))field('property-banner').style.display='none';
    show('Prezzo, tariffa e occupazione copiati dal link: sono ipotesi da verificare. Completa capitale proprio, costi, finanziamento, commissioni e imposte prima di calcolare. Nessuna analisi salvata.',
      'Price, nightly rate and occupancy copied from the link: these are assumptions to verify. Complete equity, costs, financing, fees and tax before calculating. No analysis has been saved.');
  };
  // Last module on the tool: run after legacy city defaults/property restoration.
  if(document.readyState==='complete')apply();
  else document.addEventListener('DOMContentLoaded',apply,{once:true});
}
if(typeof window!=='undefined'&&typeof document!=='undefined')installPropertyScenarioInputs(window,document);
