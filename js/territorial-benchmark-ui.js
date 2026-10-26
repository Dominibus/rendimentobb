import {REGIONAL_CAPITALS} from './regional-capitals.js?v=20261026-rc199';
import {loadMunicipalities,municipalityCoverage,municipalityToolURL,municipalityLabel} from './municipalities.js?v=20261025-rc198';
import {mountMunicipalityPicker} from './municipality-picker.js?v=20261026-rc199';
import {applyMunicipalityToTool,setMunicipalityURL} from './municipality-tool.js?v=20261025-rc198';
import {loadTerritorialCity,SEGMENT_FIELDS,exactTerritorialSegment,territorialSummary,territorialCity,territorialCSV} from './territorial-benchmarks.js?v=20261023-rc192';
const roots=document.querySelectorAll('[data-territorial-benchmarks]');
for(const root of roots)install(root);
function install(root){
 const mainCity=document.getElementById?.('market-city');
 let data=null,city=mainCity?null:territorialCity(root.dataset.city),selection={},generation=0,municipality=null;
 const search=document.createElement('section');search.className='rb-municipality-search';root.before(search);
 const picker=mountMunicipalityPicker(search,{onSelect:selectMunicipality,onEdit:()=>{municipality=null;city=null;generation++;data=null;setMunicipalityURL(null);renderUnavailable();}});
 function selectMunicipality(row){if(/^\/market\/[^/]+\/?$/.test(window.location?.pathname||'')&&municipalityCoverage(row)!==territorialCity(root.dataset.city)){window.location.assign('/market/?municipality='+encodeURIComponent(row.istat));return;}municipality=row;city=municipalityCoverage(row);picker.setSelection(row);if(mainCity){applyMunicipalityToTool(row);return;}setMunicipalityURL(row);load();}
 const t=(it,en)=>window.currentLang==='en'?en:it;
 const add=(parent,tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;parent.append(node);return node;};
 const money=n=>new Intl.NumberFormat(window.currentLang==='en'?'en-GB':'it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n);
 const date=v=>v?new Intl.DateTimeFormat(window.currentLang==='en'?'en-GB':'it-IT',{timeZone:'UTC'}).format(new Date(v+'T00:00:00Z')):t('non disponibile','unavailable');
 const roomLabel=v=>({'Entire home/apt':t('Intero alloggio','Entire home/apt'),'Private room':t('Camera privata','Private room'),'Shared room':t('Camera condivisa','Shared room'),'Hotel room':t('Camera hotel','Hotel room')})[v]||v;
 const typeLabel=v=>({'Entire rental unit':t('Appartamento intero','Entire rental unit'),'Entire condo':t('Condominio intero','Entire condo'),'Private room in bed and breakfast':t('Camera privata in B&B','Private room in bed and breakfast'),'Private room in rental unit':t('Camera privata in appartamento','Private room in rental unit')})[v]||v;
 function input(parent,labelText,values,value,change){
  const label=add(parent,'label',labelText),select=add(label,'select');
  for(const [key,text]of values){const opt=add(select,'option',text);opt.value=key;}
  select.value=value;select.addEventListener('change',()=>change(select.value));return select;
 }
 async function load(){
  const run=++generation;data=null;selection={};if(!city){root.setAttribute('aria-busy','false');renderUnavailable();return;}root.setAttribute('aria-busy','true');root.replaceChildren();add(root,'p',t('Carico il confronto documentato…','Loading the documented comparison…'));
  try{const result=await loadTerritorialCity(city);if(run!==generation)return;data=result;const best=data.rows.filter(r=>r[6]!==null).sort((a,b)=>b[6]-a[6])[0]||data.rows[0];selection=Object.fromEntries(SEGMENT_FIELDS.map((field,i)=>[field,String(best[i])]));render();}
  catch{if(run!==generation)return;root.replaceChildren();add(root,'h2',t('Confronto temporaneamente non disponibile','Comparison temporarily unavailable'));add(root,'p',t('Nessun numero viene sostituito con un’ipotesi interna. Riprova il caricamento.','No figures are substituted with an internal assumption. Retry loading.'));const retry=add(root,'button',t('Riprova','Retry'));retry.type='button';retry.onclick=load;}
  finally{if(run===generation)root.setAttribute('aria-busy','false');}
 }
 function renderUnavailable(){
  root.replaceChildren();const box=add(root,'div',undefined,'rb-municipality-empty');if(!municipality){add(box,'h2',t('Scegli il comune da confrontare','Choose the municipality to compare'));add(box,'p',t('Cerca il nome e seleziona un risultato. Mostriamo soltanto dati riferiti al comune scelto, quando disponibili.','Search by name and select a result. We only show data for the selected municipality, when available.'));return;}add(box,'h2',t('Dati territoriali non disponibili','Territorial data unavailable'));add(box,'p',(municipality?municipalityLabel(municipality)+'. ':'')+t('Non abbiamo una fonte documentata per questo comune. Non usiamo i dati di un’altra città: puoi simulare con le tue ipotesi.','We have no documented source for this municipality. We do not use another city’s data: you can simulate with your own assumptions.'));if(municipality){const a=add(box,'a',t('Crea uno scenario per questo comune','Build a scenario for this municipality'));a.href=municipalityToolURL(municipality);}
 }
 function render(focusField=null){
  if(!city){renderUnavailable();return;}if(!data)return;root.replaceChildren();root.classList.add('rb-territorial');root.setAttribute('aria-label',t('Confronto prezzi pubblicati','Advertised price comparison'));
  add(root,'div',t('PREZZI PUBBLICATI · FONTE DOCUMENTATA','PUBLISHED PRICES · DOCUMENTED SOURCE'),'rb-territorial-kicker');
  add(root,'h2',t('Confronta alloggi simili, zona per zona','Compare similar accommodation, area by area'));
  add(root,'p',t('Scegli zona, alloggio, capienza e periodo quotato. Il confronto usa prezzi base pubblicati negli annunci, non ricavi incassati o ADR dei soggiorni venduti.','Choose the area, accommodation, capacity and quoted period. This compares advertised base prices, not receipts or ADR from sold nights.'));
  const filters=add(root,'div',undefined,'rb-territorial-filters');
  add(root,'p',t('Comune selezionato: ','Selected municipality: ')+(municipality?municipalityLabel(municipality):({roma:'Roma (RM)',napoli:'Napoli (NA)',milano:'Milano (MI)',firenze:'Firenze (FI)'})[city])+'.','rb-territorial-note');
  const fields=[['zone',t('Zona della fonte','Source area')],['propertyType',t('Tipologia dichiarata','Reported property type')],['roomType',t('Uso dell’alloggio','Accommodation use')],['capacity',t('Capienza massima dichiarata','Reported maximum capacity')],['stayMonth',t('Mese di arrivo quotato','Quoted check-in month')],['stayLength',t('Durata del soggiorno quotato','Quoted stay length')]];
  let candidates=data.rows;
  for(const [field,label]of fields){
   const index=SEGMENT_FIELDS.indexOf(field),values=[...new Set(candidates.map(r=>String(r[index])))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
   if(!values.includes(selection[field]))selection[field]=values[0];
   const labels=values.map(v=>[v,field==='propertyType'?typeLabel(v):field==='roomType'?roomLabel(v):field==='capacity'?v+t(' ospiti',' guests'):field==='stayLength'?v+t(' notti',' nights'):v]);
   const control=input(filters,label,labels,selection[field],value=>{selection[field]=value;render(field);});control.dataset.field=field;
   candidates=candidates.filter(row=>String(row[index])===selection[field]);
  }
  const row=exactTerritorialSegment(data.rows,selection),result=territorialSummary(data,row);
  const box=add(root,'div',undefined,'rb-territorial-result');box.setAttribute('aria-live','polite');box.setAttribute('aria-atomic','true');
  if(result.status==='available'){
   add(box,'span',t('Mediana del prezzo base pubblicato per notte','Median advertised base price per night'));
   add(box,'strong',money(result.median));
   add(box,'p',t('Metà centrale delle osservazioni: ','Middle half of observations: ')+money(result.p25)+' – '+money(result.p75)+'. '+result.n+t(' annunci nel segmento.',' listings in this segment.'));
   add(box,'p',t('Osservazioni: ','Observed: ')+date(result.observationStart)+' → '+date(result.observationEnd)+'. '+t('Date dei soggiorni quotati: ','Quoted stay dates: ')+date(result.stayStart)+' → '+date(result.stayEnd)+'.','rb-territorial-note');
   const download=add(box,'button',t('Scarica il confronto CSV con le fonti','Download comparison CSV with sources'));download.type='button';download.onclick=()=>{
    const csv=territorialCSV(data,row,window.currentLang);if(!csv)return;
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='RendimentoBB-territorial-'+city+'-'+row[4]+'.csv';root.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   };
   if(result.stale)add(box,'p',t('Snapshot storico: oltre 180 giorni dall’ultima osservazione. Non descrive i prezzi attuali.','Historical snapshot: over 180 days since the last observation. It does not describe current prices.'));
  }else{
   add(box,'strong',t('Campione insufficiente','Insufficient sample'));
   add(box,'p',t('Meno di 10 osservazioni confrontabili: non mostriamo un prezzo. Puoi cambiare i filtri; non allarghiamo automaticamente zona o tipologia.','Fewer than 10 comparable observations: no price is shown. You may change the filters; the area or property type is never expanded automatically.'));
  }
  const note=add(root,'p',undefined,'rb-territorial-note');
  note.append(document.createTextNode(t('Fonte: ','Source: ')));const source=add(note,'a','Inside Airbnb');source.href='https://insideairbnb.com/get-the-data/';source.target='_blank';source.rel='noopener noreferrer';
  note.append(document.createTextNode(' · '+t('Snapshot ','Snapshot ')+date(data.city.snapshot)+' · '+t('elaborazione RendimentoBB','processed by RendimentoBB')+' · '));
  const license=add(note,'a','CC BY 4.0');license.href='https://creativecommons.org/licenses/by/4.0/';license.target='_blank';license.rel='noopener noreferrer';
  const details=add(root,'details');add(details,'summary',t('Metodo, copertura e limiti','Method, coverage and limitations'));
  add(details,'p',t('Prezzo base = subtotale delle notti del preventivo pubblico ÷ notti quotate. Sono esclusi dal metodo gli sconti e gli importi separati per pulizie, commissioni e imposte: il totale pagabile può essere diverso. Solo preventivi disponibili in EUR di 1–27 notti, con date e subtotale riconoscibili. Un’osservazione per annuncio: annunci diversi dello stesso immobile non sono deduplicati. Mediana e quartili con interpolazione lineare.','Base price = the public quote’s nightly subtotal ÷ quoted nights. The method excludes discounts and separately itemised cleaning, fees and taxes; the payable total may differ. Only available EUR quotes of 1–27 nights with identifiable dates and nightly subtotal. One observation per listing: different listings of the same property are not deduplicated. Median and quartiles with linear interpolation.'));
  add(details,'p',data.city.sourceRows+t(' righe nella fonte; ',' source rows; ')+data.city.eligibleRows+t(' osservazioni ammesse prima della soglia per segmento. La soglia di 10 è una regola interna di pubblicazione, non garantisce rappresentatività.',' eligible observations before applying the segment threshold. Ten is an internal publication threshold, not a guarantee of representativeness.'));
  add(details,'p',t('La zona deriva dalla geocodifica della fonte, con coordinate approssimate. Tipologia e capienza sono dichiarate dagli host; servizi, qualità, superficie e numero di camere non sono equiparati. Il mese raggruppa date diverse: non è un preventivo per le tue date né una curva stagionale. È un campione di una sola piattaforma, non l’intero mercato.','Areas derive from source geocoding with approximate coordinates. Hosts report type and capacity; amenities, quality, floor area and room count are not matched. The month groups different dates: this is not a quote for your dates or a seasonal curve. It samples one platform, not the whole market.'));
  add(details,'p',t('Occupazione reale, ADR venduto e ROI territoriale non sono disponibili in questa serie. Le notti non disponibili possono essere bloccate dagli host. Nessuna certificazione o affiliazione Airbnb/Inside Airbnb. I dati mostrati si riferiscono allo snapshot indicato. Gli aggiornamenti disponibili vengono controllati separatamente e pubblicati dopo revisione; non sono prezzi in tempo reale. Nessuna chiamata a provider esterni dal tuo browser.','Actual occupancy, sold ADR and territorial ROI are not available in this series. Unavailable nights may be host-blocked. No certification or affiliation with Airbnb/Inside Airbnb. The displayed data refers to the stated snapshot. Available updates are checked separately and published after review; these are not real-time prices. Your browser makes no calls to external data providers.'));
  const file=add(details,'a',t('Scarica questi aggregati e la provenienza','Download these aggregates and provenance'));file.href='/data/territorial/'+city+'.json';file.download='rendimentobb-'+city+'-aggregates.json';
  add(root,'p',t('Usa questo confronto per scegliere le tue ipotesi, poi verifica occupazione, costi e finanziamento nel simulatore. Non modifica automaticamente le tue analisi.','Use this comparison to choose your assumptions, then review occupancy, costs and financing in the simulator. It never modifies your analyses automatically.'),'rb-territorial-note');
  if(focusField)root.querySelector('[data-field="'+focusField+'"]')?.focus({preventScroll:true});
 }
 mainCity?.addEventListener('change',()=>{municipality=null;picker.setSelection(null);city=territorialCity(mainCity.value);load();});
 const customInput=document.getElementById?.('custom-location');
 function updateCustom(){if(!customInput)return;if(customInput.dataset.municipality)return;municipality=null;picker.setSelection(null);const name=customInput.value.trim().replace(/\s*\([a-z]{2}\)$/i,'');city=name?territorialCity(name):territorialCity(mainCity?.value);load();}
 customInput?.addEventListener('input',updateCustom);
 document.addEventListener('rb_municipality_edit',updateCustom);
 document.addEventListener('rb_municipality_changed',event=>{municipality=event.detail;city=municipalityCoverage(municipality);picker.setSelection(municipality);load();});
 document.addEventListener('rb_language_changed',()=>render());
 const requested=new URLSearchParams(window.location?.search||'').get('municipality');
 if(!mainCity&&/^\d{6}$/.test(requested||'')){
  city=null;renderUnavailable();loadMunicipalities().then(rows=>{const row=rows.find(r=>r.istat===requested);if(row)selectMunicipality(row);}).catch(()=>{});
 }else if(mainCity&&requested){city=null;renderUnavailable();}
 else if(customInput?.value?.trim()){city=territorialCity(customInput.value.trim().replace(/\s*\([a-z]{2}\)$/i,''));load();}
 else {const row=city?REGIONAL_CAPITALS.find(r=>municipalityCoverage(r)===city):null;if(row){municipality=row;picker.setSelection(row);}load();}
}
