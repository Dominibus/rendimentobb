import {parseBookingCSV,buildBookingImport,IMPORT_FIELDS,IMPORT_LIMITS,BOOKING_IMPORT_TEMPLATE} from './booking-import.js?v=20261017-rc148';

const labels={reference:['Riferimento prenotazione','Booking reference'],guestName:['Nome ospite','Guest name'],checkin:['Check-in','Check-in'],checkout:['Check-out','Check-out'],guests:['Numero ospiti','Guest count'],totalAmount:['Totale soggiorno EUR','Stay total EUR'],status:['Stato','Status'],currency:['Valuta','Currency']};
const states={arrival:['Confermata · check-in da registrare','Confirmed · check-in not recorded'],pending:['Richiesta in attesa','Pending request'],checkin:['Check-in registrato','Check-in recorded'],checkout:['Check-out registrato','Check-out recorded'],completed:['Soggiorno completato','Completed stay'],cancelled:['Cancellata','Cancelled']};
const messages={
  file_too_large:['File troppo grande: massimo 500 KB.','File too large: maximum 500 KB.'],too_many_rows:['Massimo 50 prenotazioni per file. Suddividi il file e riprova.','Maximum 50 bookings per file. Split the file and retry.'],too_many_columns:['Troppe colonne: massimo 60.','Too many columns: maximum 60.'],invalid_csv:['CSV non valido. Usa il modello o controlla separatori e virgolette.','Invalid CSV. Use the template or check delimiters and quotes.'],invalid_headers:['Intestazioni vuote o ripetute. Correggi il file.','Empty or duplicate headers. Correct the file.'],property_required:['Scegli un immobile del tuo account.','Choose a property in your account.'],mapping_required:['Associa tutte le colonne obbligatorie.','Map all required columns.'],column_count:['Numero colonne diverso dall’intestazione','Column count differs from header'],invalid_reference:['Riferimento mancante o non valido','Missing or invalid reference'],invalid_guest:['Nome ospite mancante o troppo lungo','Missing or overlong guest name'],invalid_dates:['Date non valide o check-out non successivo al check-in','Invalid dates or check-out not after check-in'],invalid_guests:['Numero ospiti non valido','Invalid guest count'],invalid_amount:['Totale EUR mancante o non valido','Missing or invalid EUR total'],invalid_currency:['Valuta diversa da EUR o mancante','Currency missing or not EUR'],invalid_status:['Stato non riconosciuto','Unrecognized status'],reference_changed:['Stesso riferimento con dati diversi: verifica entrambe le righe','Same reference with different data: review both rows'],conflict:['Date sovrapposte: controlla la prenotazione esistente','Overlapping dates: review the existing booking'],invalid_existing_dates:['Date esistenti non valide: verifica il calendario','Existing dates invalid: review the calendar'],cancelled:['Cancellata: esclusa, non modifica prenotazioni già salvate','Cancelled: excluded; saved bookings are not modified'],duplicate_file:['Duplicato nel file: escluso','Duplicate in file: excluded'],import_changed:['Riferimento già importato con dati diversi. Apri la prenotazione esistente: non viene sovrascritta.','Reference already imported with different data. Open the existing booking; it is not overwritten.'],import_deleted:['Questa prenotazione importata è stata eliminata. Verifica lo storico prima di reinserirla manualmente.','This imported booking was deleted. Review history before adding it again manually.'],too_many_requests:['Limite temporaneo raggiunto. Attendi un minuto e riprova con le righe rimaste.','Temporary limit reached. Wait a minute and retry the remaining rows.'],plan_required:['Serve Investor o Pro attivo. I PDF restano riservati a Pro.','Active Investor or Pro is required. PDFs remain Pro only.'],unauthorized:['Sessione scaduta. Accedi nuovamente.','Session expired. Sign in again.'],session_changed:['Account o immobile cambiato: riapri l’importazione.','Account or property changed: reopen the import.'],not_found:['Immobile non più disponibile. Aggiorna la dashboard.','Property no longer available. Refresh the dashboard.'],write_uncertain:['Esito incerto per la connessione. Riprova gli stessi dati: il server evita i duplicati.','Uncertain connection outcome. Retry the same data: the server prevents duplicates.'],server_unavailable:['Servizio temporaneamente non disponibile. Riprova gli stessi dati.','Service temporarily unavailable. Retry the same data.']
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function installBookingImporter({getContext,getBookings,save,refresh,t}){
  const button=document.getElementById('booking-import-open');if(!button)return;
  let active=null;
  button.addEventListener('click',()=>{
    if(active)return;
    const ctx=getContext();
    if(!ctx.allowed){alert(t(...messages.plan_required));return;}
    if(!ctx.ready){alert(t('Attendi il caricamento delle proprietà PMS.','Wait for PMS properties to load.'));return;}
    const owner=ctx.ownerUid;let parsed=null,rows=[],busy=false,previewProperty='',fileVersion=0;
    const modal=document.createElement('dialog');modal.className='rb-booking-import';modal.setAttribute('aria-labelledby','booking-import-title');active=modal;
    modal.innerHTML=`<header><div><p class="rb-import-eyebrow">RENDIMENTOBB · PMS</p><h2 id="booking-import-title">${t('Importa prenotazioni','Import bookings')}</h2></div><button type="button" data-close>${t('Chiudi','Close')}</button></header>
      <p>${t('Carica un CSV, verifica le colonne e seleziona le righe da salvare. Un immobile per importazione, fino a 50 righe.','Upload a CSV, check its columns and select rows to save. One property per import, up to 50 rows.')}</p>
      <p class="rb-import-note">${t('Importazione manuale: non collega né aggiorna Airbnb, Booking.com o altri portali. File iCal/ICS non supportati: possono contenere semplici blocchi senza ricavi.','Manual import: it does not connect or update Airbnb, Booking.com or other channels. iCal/ICS files are not supported: they can contain availability blocks without revenue.')}</p>
      <div class="rb-import-grid"><label>${t('Immobile','Property')}<select data-property><option value="">${t('Scegli un immobile','Choose a property')}</option>${ctx.properties.map(p=>`<option value="${esc(p.id)}">${esc(p.name||p.id)}</option>`).join('')}</select></label>
      <label>${t('Provenienza del file','File source')}<select data-source><option value="direct">${t('Diretta / mio gestionale','Direct / my system')}</option><option value="airbnb">Airbnb</option><option value="booking">Booking.com</option><option value="vrbo">Vrbo</option><option value="other">${t('Altro','Other')}</option></select></label>
      <label>${t('Formato date nel file','File date format')}<select data-date><option value="iso">YYYY-MM-DD</option><option value="dmy">DD/MM/YYYY</option><option value="mdy">MM/DD/YYYY</option></select></label>
      <label>${t('Formato importi','Amount format')}<select data-number><option value="it">1.234,56</option><option value="en">1,234.56</option></select></label>
      <label>${t('Ospiti se la colonna è assente','Guests if column is absent')}<input data-guests type="number" min="1" max="1000" step="1" placeholder="${t('Inserisci se necessario','Enter if needed')}"></label>
      <label>${t('Stato se la colonna è assente','Status if column is absent')}<select data-status><option value="arrival">${t('Confermata · check-in da registrare','Confirmed · check-in not recorded')}</option><option value="pending">${t('Richiesta in attesa','Pending request')}</option><option value="completed">${t('Soggiorno completato','Completed stay')}</option></select></label></div>
      <div class="rb-import-file"><label>${t('File CSV UTF-8 · massimo 500 KB','UTF-8 CSV file · maximum 500 KB')}<input data-file type="file" accept=".csv,text/csv,text/plain"></label><button type="button" data-template>${t('Scarica modello CSV','Download CSV template')}</button></div>
      <p class="rb-import-note">${t('Usa un riferimento stabile del soggiorno, non il numero di riga. Il totale deve essere il ricavo dell’alloggio prima delle commissioni, esclusa la tassa di soggiorno: un accredito netto non è lo stesso dato. Non caricare documenti, carte o contatti degli ospiti.','Use a stable stay reference, not the row number. Total must be accommodation revenue before commissions, excluding tourist tax: a net payout is a different measure. Do not upload guest documents, cards or contact details.')}</p>
      <div data-mapping class="rb-import-grid"></div><button type="button" data-preview disabled>${t('Verifica e mostra anteprima','Validate and preview')}</button>
      <div data-preview-result></div><label class="rb-import-confirm"><input type="checkbox" data-confirm disabled><span>${t('Ho verificato immobile, provenienza, righe selezionate e significato degli importi in EUR. Le righe cancellate o con errori non saranno importate.','I checked the property, source, selected rows and the meaning of EUR amounts. Cancelled or invalid rows will not be imported.')}</span></label>
      <p class="rb-import-note">${t('Non vengono certificati incassi, documenti o adempimenti. Controlla stato dei soggiorni passati, pulizie e tassa nella prenotazione dopo l’importazione. I duplicati non vengono sovrascritti.','Receipts, documents and statutory filings are not certified. Review past-stay status, cleaning and tourist tax in each booking after import. Duplicates are not overwritten.')}</p>
      <p role="status" aria-live="polite" data-feedback></p><footer><button type="button" data-save disabled>${t('Importa righe selezionate','Import selected rows')}</button></footer>`;
    document.body.append(modal);
    const q=s=>modal.querySelector(s),say=message=>{q('[data-feedback]').textContent=message;},message=code=>messages[code]?t(...messages[code]):t('Operazione non riuscita. Verifica i dati e riprova.','Operation failed. Check the data and retry.');
    const checkOwner=()=>{const c=getContext();if(!c.allowed||c.ownerUid!==owner||!c.properties.some(p=>p.id===q('[data-property]').value))throw Object.assign(Error('session_changed'),{code:'session_changed'});return c;};
    const invalidate=()=>{fileVersion++;rows=[];previewProperty='';q('[data-preview-result]').replaceChildren();q('[data-confirm]').checked=false;q('[data-confirm]').disabled=true;q('[data-save]').disabled=true;say('');};
    const close=()=>{if(busy)return;modal.close();};
    const cleanup=()=>{parsed=null;rows=[];modal.remove();active=null;document.removeEventListener('rb_auth_ready',onAuth);document.removeEventListener('rb_language_changed',onLanguage);};
    const onAuth=()=>{if(getContext().ownerUid!==owner)modal.close();};
    const onLanguage=()=>{if(!busy)modal.close();};
    modal.addEventListener('close',cleanup,{once:true});modal.addEventListener('cancel',e=>{if(busy)e.preventDefault();});q('[data-close]').onclick=close;
    document.addEventListener('rb_auth_ready',onAuth);document.addEventListener('rb_language_changed',onLanguage);
    modal.showModal();
    q('[data-number]').value=window.currentLang==='en'?'en':'it';
    q('[data-date]').value=window.currentLang==='en'?'mdy':'dmy';
    for(const select of modal.querySelectorAll('[data-property],[data-source],[data-date],[data-number],[data-status],[data-guests]'))select.addEventListener('change',invalidate);
    q('[data-template]').onclick=()=>{const blob=new Blob(['\uFEFF'+BOOKING_IMPORT_TEMPLATE],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='RendimentoBB-Prenotazioni-Modello.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
    q('[data-file]').onchange=async()=>{
      invalidate();parsed=null;q('[data-mapping]').replaceChildren();q('[data-preview]').disabled=true;
      const file=q('[data-file]').files?.[0],version=fileVersion;if(!file)return;
      try{
        if(file.size>IMPORT_LIMITS.bytes)throw Object.assign(Error(),{code:'file_too_large'});
        if(!/\.csv$/i.test(file.name))throw Object.assign(Error(),{code:'invalid_csv'});
        const bytes=await file.arrayBuffer();const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);const result=parseBookingCSV(text);
        if(version!==fileVersion||!modal.isConnected)return;parsed=result;
        q('[data-mapping]').innerHTML=IMPORT_FIELDS.map(field=>`<label>${t(...labels[field])}${['reference','guestName','checkin','checkout','totalAmount'].includes(field)?' *':''}<select data-field="${field}"><option value="">${t('Assente / scegli','Absent / choose')}</option>${parsed.headers.map((h,i)=>`<option value="${i}" ${parsed.mapping[field]===i?'selected':''}>${esc(h)}</option>`).join('')}</select></label>`).join('');
        for(const node of q('[data-mapping]').querySelectorAll('select'))node.onchange=invalidate;
        q('[data-preview]').disabled=false;say(t('File letto. Associa le colonne e verifica l’anteprima.','File read. Map the columns and validate the preview.'));
      }catch(e){say(message(e.code||'invalid_csv'));}
    };
    q('[data-preview]').onclick=async()=>{
      if(!parsed||busy)return;invalidate();const version=fileVersion;
      try{
        checkOwner();const propertyId=q('[data-property]').value,mapping={};for(const node of modal.querySelectorAll('[data-field]'))mapping[node.dataset.field]=node.value===''?null:Number(node.value);
        q('[data-preview]').disabled=true;say(t('Verifico il calendario salvato…','Checking the saved calendar…'));
        const existing=await getBookings(owner,propertyId);if(version!==fileVersion||!modal.isConnected)return;checkOwner();
        rows=buildBookingImport(parsed,{mapping,propertyId,source:q('[data-source]').value,dateFormat:q('[data-date]').value,numberFormat:q('[data-number]').value,defaultGuests:q('[data-guests]').value,defaultStatus:q('[data-status]').value,existing});previewProperty=propertyId;
        renderRows();say(t('Anteprima pronta. Nessun dato è stato salvato.','Preview ready. No data has been saved.'));
      }catch(e){say(message(String(e.code||'server_unavailable').replace('booking/','')));}
      finally{if(modal.isConnected)q('[data-preview]').disabled=false;}
    };
    function updateSave(){const selected=rows.filter(r=>r.selected&&!r.done).length;q('[data-save]').disabled=busy||!q('[data-confirm]').checked||selected===0;}
    function renderRows(){
      const valid=rows.filter(r=>!r.errors.length&&!r.skip).length;
      q('[data-preview-result]').innerHTML=`<p><strong>${valid}/${rows.length} ${t('righe utilizzabili','usable rows')}</strong> · ${t('Solo le righe selezionate saranno inviate al tuo PMS.','Only selected rows will be sent to your PMS.')}</p><div class="rb-import-table"><table><thead><tr><th>${t('Salva','Save')}</th><th>${t('Riga / riferimento','Row / reference')}</th><th>${t('Ospite e soggiorno','Guest and stay')}</th><th>EUR</th><th>${t('Esito / stato','Result / status')}</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td><input type="checkbox" data-row="${i}" aria-label="${t('Importa riga','Import row')} ${r.line}" ${r.selected?'checked':''} ${r.errors.length||r.skip||r.done?'disabled':''}></td><td>${r.line}<br>${esc(r.reference)}</td><td>${esc(r.data.guestName)}<br>${esc(r.data.checkin)} → ${esc(r.data.checkout)}<br>${r.data.guests??'—'} ${t('ospiti','guests')}</td><td>${r.data.totalAmount==null?'—':new Intl.NumberFormat(window.currentLang==='en'?'en-GB':'it-IT',{minimumFractionDigits:2,maximumFractionDigits:2}).format(r.data.totalAmount)}</td><td>${r.done?esc(r.done):r.errors.length?esc(r.errors.map(message).join(' · ')):r.skip?esc(message(r.skip)):esc(states[r.data.status]?t(...states[r.data.status]):r.data.status)}</td></tr>`).join('')}</tbody></table></div>`;
      for(const box of modal.querySelectorAll('[data-row]'))box.onchange=()=>{rows[Number(box.dataset.row)].selected=box.checked;updateSave();};
      q('[data-confirm]').disabled=!valid;updateSave();
    }
    q('[data-confirm]').onchange=updateSave;
    q('[data-save]').onclick=async()=>{
      if(busy||!q('[data-confirm]').checked)return;
      try{checkOwner();}catch(e){say(message(e.code));return;}
      if(previewProperty!==q('[data-property]').value)return;
      const selected=rows.filter(r=>r.selected&&!r.done&&!r.errors.length&&!r.skip);if(!selected.length)return;
      busy=true;let created=0,duplicates=0,stopped=null;
      const controls=[...modal.querySelectorAll('input,select,button')];for(const c of controls)c.disabled=true;
      for(const row of selected){
        try{
          checkOwner();say(`${t('Importazione riga','Importing row')} ${row.line}…`);
          const result=await save({data:row.data,importReference:{source:row.data.source,reference:row.reference},bookingId:null,expectedVersion:0});
          if(result.duplicate||result.importDuplicate){duplicates++;row.done=t('Già presente · non sovrascritta','Already present · not overwritten');}else{created++;row.done=t('Importata','Imported');}
          row.selected=false;
        }catch(e){stopped={line:row.line,code:String(e.code||'write_uncertain').replace('booking/','')};break;}
      }
      // Each row is a separate atomic operation: never imply the whole file rolled back.
      busy=false;for(const c of controls)c.disabled=false;q('[data-confirm]').checked=false;renderRows();
      const summary=`${created} ${t('importate','imported')} · ${duplicates} ${t('già presenti','already present')}.`;
      say(summary+(stopped?` ${t('Interrotto alla riga','Stopped at row')} ${stopped.line}: ${message(stopped.code)} ${t('Le righe già salvate restano nel PMS. Puoi riprovare le righe rimaste.','Previously saved rows remain in the PMS. Retry the remaining rows.')}`:''));
      if(getContext().ownerUid===owner&&(created||duplicates||stopped?.code==='write_uncertain'))await refresh();
      if(getContext().ownerUid!==owner)modal.close();
    };
  });
}
