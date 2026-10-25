import {mountCommercial} from './commercial-property-ui.js?v=20261025-rc197';
import {createCommercialModel,calculateCommercial} from './commercial-property-engine.js?v=20261025-rc196';
import {commercialWorkspaceSummary,applyCommercialOperation,newCommercialWorkspace,createCommercialWorkspaceDemo} from './commercial-workspace-model.js?v=20261025-rc196';
import {commercialPriorities,answerCommercialAutopilot} from './commercial-autopilot.js?v=20261025-rc196';

export function createCommercialDemoClient(){
 const spaces=new Map();const initial=createCommercialWorkspaceDemo();spaces.set(initial.id,initial);let serial=0;
 return async(operation,values={})=>{
  if(operation==='list')return {success:true,canWrite:true,workspaces:[...spaces.values()].map(w=>({id:w.id,name:w.name,year:w.scenario.year,version:w.version,confirmed:!!w.operating}))};
  if(operation==='create'){const w=newCommercialWorkspace(values.data,new Date().toISOString(),'demo-'+(++serial));spaces.set(w.id,w);return {success:true,workspace:structuredClone(w)};}
  const w=spaces.get(values.workspaceId);if(!w)throw Error('not_found');
  if(operation==='get')return {success:true,workspace:structuredClone(w),canWrite:true};
  if(w.version!==values.expectedVersion)throw Error('version_conflict');
  const next=applyCommercialOperation(w,operation,values.data,{now:'2027-01-10T12:00:00Z',id:'demo-record-'+(++serial)});spaces.set(w.id,next);return {success:true,workspace:structuredClone(next)};
 };
}

export function mountCommercialWorkspace(root,{client,english=false,demo=false,onLogin=()=>{},today=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Rome'}),confirm=message=>window.confirm(message),download=()=>{},onDirty=()=>{}}={}){
 const t=(it,en)=>english?en:it,locale=english?'en-GB':'it-IT';
 const money=n=>n===null?'N/A':new Intl.NumberFormat(locale,{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n);
 const category={maintenance:t('Manutenzione','Maintenance'),cleaning:t('Pulizia','Cleaning'),access:t('Accesso','Access'),user_report:t('Segnalazione utilizzatore','User report'),other:t('Altro','Other')};
 const views={overview:t('Oggi','Today'),scenario:t('Scenari','Scenarios'),calendar:t('Calendario','Calendar'),movements:t('Movimenti','Movements'),tasks:t('Attività','Tasks'),autopilot:'Autopilot'};
 const errors={room_has_tasks:t('La stanza ha attività registrate: mantienila nel modello operativo.','The room has recorded tasks: keep it in the operating model.'),future_movement:t('La data di un movimento effettivo non può essere futura.','An actual movement cannot have a future date.'),unauthorized:t('Accedi per aprire i tuoi spazi.','Sign in to open your spaces.'),plan_required:t('Lettura disponibile; per salvare serve Investor, Pro o una prova Investor attiva.','Reading is available; saving requires Investor, Pro or an active Investor trial.'),version_conflict:t('Lo spazio è cambiato in un’altra sessione. Ricarica prima di applicare altre modifiche. La bozza corrente non è stata salvata.','This space changed in another session. Reload before making changes. The current draft was not saved.'),collision:t('Due contratti occupano la stessa stanza e fascia. Correggi la sovrapposizione.','Two contracts reserve the same room and slot. Correct the overlap.'),recorded_contract_locked:t('Un contratto con movimenti è protetto: non puoi modificarne le condizioni o rimuoverlo. Puoi aggiungere contratti su fasce libere.','A contract with movements is protected: its terms cannot be changed or removed. You can add contracts on free slots.'),recorded_period_locked:t('Non puoi modificare chiusure nei periodi con movimenti registrati.','Closures in periods with recorded movements cannot be changed.'),operating_year_locked:t('L’anno della gestione è fisso: crea un nuovo spazio per un altro anno.','The operating year is fixed: create a new space for another year.'),refund_exceeds_receipts:t('Il rimborso supera gli incassi registrati o l’annullamento renderebbe i rimborsi maggiori degli incassi.','The refund exceeds recorded receipts, or voiding would make refunds exceed receipts.'),confirmation_required:t('Conferma prima i contratti dalla sezione Scenari.','Confirm contracts in Scenarios first.'),contracts_required:t('Aggiungi almeno un contratto prima di confermare.','Add at least one contract before confirming.'),write_uncertain:t('Esito non confermato. Riprova la stessa operazione senza cambiare i dati: il controllo duplicati evita una doppia registrazione.','Outcome unconfirmed. Retry the same operation without changing data: duplicate protection prevents double recording.'),account_changed:t('Account cambiato. I dati della sessione precedente sono stati rimossi.','Account changed. Previous session data was removed.'),operation_pending:t('Attendi l’operazione in corso.','Wait for the pending operation.'),server_unavailable:t('Servizio non disponibile. Nessun salvataggio confermato; riprova più tardi.','Service unavailable. No save was confirmed; retry later.')};
 let owner=null,generation=0,workspace=null,spaces=[],canWrite=false,busy=false,view='overview',month=demo?1:Number(today.slice(5,7)),calendarRoom='',planner=null,scenarioDraft=null,dirty=false;
 function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
 function button(label,fn,disabled=false){const b=el('button',label);b.type='button';b.disabled=disabled;b.addEventListener('click',fn);return b;}
 function note(parent,text){parent.append(el('p',text,'cm-note'));}
 function formField(parent,label,key,{value,type='text',options,required=true}={}){const wrap=el('label',label),input=el(options?'select':'input');input.dataset.field=key;input.name=key;input.required=required;if(options)for(const [v,label]of options){const o=el('option',label);o.value=v;input.append(o);}else input.type=type;input.value=String(value??options?.[0]?.[0]??'');if(type==='number'){input.min='0.01';input.max='100000000';input.step='0.01';}wrap.append(input);parent.append(wrap);return input;}
 function table(parent,headers,rows){const wrap=el('div',undefined,'cm-table-scroll'),tab=el('table'),head=el('thead'),hrow=el('tr');for(const h of headers){const th=el('th',h);th.scope='col';hrow.append(th);}head.append(hrow);tab.append(head);const body=el('tbody');for(const row of rows){const tr=el('tr');for(const value of row){const td=el('td');if(typeof value==='object'&&value!==null)td.append(value);else td.textContent=String(value);tr.append(td);}body.append(tr);}tab.append(body);wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',headers.join(' · '));wrap.append(tab);parent.append(wrap);}
 const status=el('p',undefined,'cw-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 function say(message,error=false){status.textContent=message;status.className='cw-status'+(error?' cm-error':'');}
 function setDirty(value){dirty=value;onDirty(value);}
 const header=el('section',undefined,'cm-card cw-identity'),nav=el('nav',undefined,'cw-tabs'),content=el('section',undefined,'cm-card cw-content');content.tabIndex=-1;nav.setAttribute('aria-label',t('Sezioni dello spazio','Workspace sections'));root.replaceChildren(status,header,nav,content);
 function rememberDraft(){if(view==='scenario'&&planner?.getResult())scenarioDraft=planner.getModel();}
 function guard(){return !dirty||confirm(t('Ci sono modifiche non salvate. Lasciarle e continuare?','There are unsaved changes. Discard them and continue?'));}
 async function call(operation,values={}){
  if(busy)return;const loading=t('Operazione in corso…','Operation in progress…');say(loading);busy=true;const epoch=generation;root.setAttribute('aria-busy','true');
  try{const result=await client(operation,values);if(epoch!==generation)return null;return result;}
  catch(e){if(epoch===generation)say(errors[e.message]||errors[e.code]||t('Controlla i dati: operazione non confermata.','Review the data: operation not confirmed.'),true);return null;}
  finally{if(epoch===generation){busy=false;root.setAttribute('aria-busy','false');if(status.textContent===loading)say('');}}
 }
 async function mutate(operation,data){if(!workspace||!canWrite||busy)return;const result=await call(operation,{workspaceId:workspace.id,expectedVersion:workspace.version,data});if(result){workspace=result.workspace;scenarioDraft=null;setDirty(false);render();say(demo?t('Demo aggiornata solo in memoria.','Demo updated in memory only.'):t('Operazione salvata nell’account.','Operation saved to your account.'));} }
 function renderHeader(){
  header.replaceChildren(el('p',demo?t('DEMO INTERATTIVA · DATI FITTIZI · nessun salvataggio account','INTERACTIVE DEMO · FICTIONAL DATA · no account saving'):t('IL TUO ARCHIVIO · dati inseriti nell’account','YOUR ARCHIVE · data entered in the account'),'cw-source'));
  function trialLink(){const a=el('a',t('Verifica la prova Investor di 30 giorni','Check the 30-day Investor trial'));a.href='/plans.html#tester-programme';header.append(a);}
  if(!owner){header.append(el('h2',t('Apri il tuo spazio di gestione','Open your management workspace')),button(t('Accedi e continua','Sign in and continue'),onLogin));note(header,t('Investor, Pro o prova attiva per salvare. Puoi esplorare la demo senza account.','Investor, Pro or active trial to save. Explore the demo without an account.'));trialLink();return;}
  const controls=el('div',undefined,'cw-controls');const choices=[['',t('Nuovo spazio…','New space…')],...spaces.map(s=>[s.id,s.name+' · '+s.year])];
  if(workspace&&!choices.some(x=>x[0]===workspace.id))choices.push([workspace.id,workspace.name+' · '+workspace.scenario.year]);
  const select=formField(controls,t('Spazio e anno','Space and year'),'workspace',{value:workspace?.id||'',options:choices});select.addEventListener('change',async()=>{if(busy){select.value=workspace?.id||'';return;}if(!guard()){select.value=workspace?.id||'';return;}if(select.value){const result=await call('get',{workspaceId:select.value});if(result){workspace=result.workspace;canWrite=result.canWrite??canWrite;scenarioDraft=null;setDirty(false);render();}}else{workspace=null;scenarioDraft=null;setDirty(false);view='scenario';render();}});
  if(workspace)controls.append(button(t('Esporta copia dei dati','Export data copy'),()=>download(JSON.stringify(workspace,null,2),'RendimentoBB-commercial-'+workspace.id+'.json')));
  controls.append(button(t('Ricarica archivio','Reload archive'),async()=>{if(guard())await refresh();},busy));header.append(controls);
  if(workspace)note(header,`${workspace.name} · ${t('anno','year')} ${workspace.scenario.year} · ${t('revisione','revision')} ${workspace.version} · ${workspace.operating?t('gestione confermata','confirmed operations'):t('solo simulazione','simulation only')}`);
  if(!canWrite){note(header,errors.plan_required);trialLink();}
 }
 function render(){
  planner=null;renderHeader();nav.replaceChildren();content.replaceChildren();
  if(!owner)return;
  for(const [key,label]of Object.entries(views)){const b=button(label,()=>{if(busy)return;if(view!==key&&!guard())return;scenarioDraft=null;setDirty(false);view=key;render();content.focus();});b.setAttribute('aria-current',view===key?'page':'false');nav.append(b);}
  if(!workspace&&view!=='scenario'){view='scenario';render();return;}
  if(view==='scenario'){renderScenario();return;}
  const summary=commercialWorkspaceSummary(workspace,month);
  content.append(el('h2',views[view]));
  const filters=el('div',undefined,'cw-controls');const select=formField(filters,t('Periodo di competenza','Accrual period'),'period',{value:String(month),options:Array.from({length:12},(_,i)=>[String(i+1),`${(workspace.operating||workspace.scenario).year}-${String(i+1).padStart(2,'0')}`])});select.addEventListener('change',()=>{if(dirty&&!guard()){select.value=String(month);return;}setDirty(false);month=Number(select.value);render();});content.append(filters);
  note(content,t('Fonte: dati dello spazio selezionato. I contratti sono previsioni; i movimenti sono registrazioni dell’utente, non verifiche bancarie.','Source: selected workspace data. Contracts are forecasts; movements are user records, not bank verification.'));
  if(view==='overview')renderOverview(summary);
  if(view==='calendar')renderCalendar(summary);
  if(view==='movements')renderMovements(summary);
  if(view==='tasks')renderTasks();
  if(view==='autopilot')renderAutopilot();
 }
 function renderOverview(s){
  const metrics=el('dl',undefined,'cm-metrics');for(const [label,value]of [[t('Canoni contrattuali · IVA compresa','Contractual fees · including VAT'),s.month.contractualGross],[t('Incassi registrati − rimborsi · competenza','Recorded receipts − refunds · accrual'),s.registeredReceipts],[t('Costi registrati · competenza','Recorded costs · accrual'),s.registeredCosts],[t('Saldo movimenti · per data, IVA compresa','Movement balance · by date, including VAT'),s.recordedCashBalance]]){const d=el('div');d.append(el('dt',label),el('dd',money(value)));metrics.append(d);}content.append(metrics);
  note(content,t('N/A = dati non registrati. Il saldo movimenti non è utile netto: non comprende automaticamente imposte, liquidazione IVA, costi mancanti o rate.','N/A = no records. The movement balance is not net profit: it does not automatically include income tax, VAT settlement, missing costs or debt payments.'));
  content.append(el('h3',t('Autopilot · cosa verificare adesso','Autopilot · what to review now')));for(const item of commercialPriorities(workspace,{today:demo?'2027-01-10':today,month,english})){const card=el('article',undefined,'cw-priority');card.append(el('p',item.text),button(t('Apri sezione','Open section'),()=>{view=item.target;render();}));content.append(card);}
 }
 function renderScenario(){
  content.append(el('h2',t('Simula, salva e conferma','Simulate, save and confirm')));
  note(content,t('1. Costruisci lo scenario. 2. Salvalo nell’account. 3. Conferma i contratti nella gestione. Le modifiche alla simulazione non cambiano i contratti operativi.','1. Build a scenario. 2. Save it to your account. 3. Confirm contracts for operations. Simulation changes do not change operating contracts.'));
  const form=el('form'),fields=el('div',undefined,'cw-controls');const name=formField(fields,t('Nome generico dello spazio','Generic space name'),'spaceName',{value:workspace?.name||t('Il mio spazio','My space')});name.maxLength=80;form.append(fields);
  const actions=el('div',undefined,'cm-actions'),save=el('button',workspace?t('Salva scenario applicato','Save applied scenario'):t('Crea spazio e salva scenario','Create space and save scenario'));save.type='submit';save.disabled=!canWrite;actions.append(save);
  if(workspace&&!workspace.operating)actions.append(button(t('Conferma contratti nella gestione','Confirm contracts for operations'),()=>{if(dirty){say(t('Salva prima lo scenario applicato.','Save the applied scenario first.'),true);return;}if(confirm(t('Confermare i contratti salvati? Non registra pagamenti e non accetta contratti legali.','Confirm saved contracts? This records no payments and accepts no legal contracts.')))mutate('confirm',{});},!canWrite));
  if(workspace?.operating)actions.append(button(t('Applica modello alla gestione','Apply model to operations'),()=>{if(!planner?.getResult()||planner.hasUnappliedChanges()){say(t('Applica prima le impostazioni del modello.','Apply model settings first.'),true);return;}if(confirm(t('Aggiornare i contratti operativi dal modello visualizzato? I contratti con movimenti sono protetti. La simulazione salvata resta separata.','Update operating contracts from the displayed model? Contracts with movements are protected. The saved simulation remains separate.')))mutate('update_operating',{model:planner.getModel()});},!canWrite),button(t('Carica contratti operativi nell’editor','Load operating contracts into editor'),()=>{if(guard()){planner.replaceModel(structuredClone(workspace.operating),'operating');setDirty(true);}},!canWrite));
  form.append(actions);content.append(form);
  const host=el('div');content.append(host);planner=mountCommercial(host,{english,embedded:true});
  planner.replaceModel(structuredClone(scenarioDraft||workspace?.scenario||createCommercialModel()),demo?'demo_account':'account');
  host.addEventListener('input',()=>setDirty(true));host.addEventListener('change',()=>setDirty(true));host.addEventListener('click',()=>{if(!planner.getResult()||JSON.stringify(planner.getModel())!==JSON.stringify(workspace?.scenario||createCommercialModel()))setDirty(true);});name.addEventListener('input',()=>setDirty(true));
  form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity()||!canWrite||busy)return;if(!planner.getResult()||planner.hasUnappliedChanges()){say(t('Applica le impostazioni e aggiungi i contratti prima di salvare.','Apply settings and add contracts before saving.'),true);return;}
   const data={name:name.value,model:planner.getModel()};if(workspace)await mutate('save_scenario',data);else{const result=await call('create',{data});if(result){workspace=result.workspace;spaces.push({id:workspace.id,name:workspace.name,year:workspace.scenario.year});setDirty(false);render();say(demo?t('Spazio demo creato solo in memoria.','Demo space created in memory only.'):t('Scenario salvato. Ora puoi confermare i contratti.','Scenario saved. You can now confirm contracts.'));}}
  });
 }
 function renderCalendar(s){
  const m=workspace.operating||workspace.scenario;note(content,workspace.operating?t('Calendario dei contratti operativi confermati. Modifica contratti e chiusure nella sezione Scenari, poi applica il modello alla gestione.','Confirmed operating contract calendar. Edit contracts and closures in Scenarios, then apply the model to operations.'):t('Anteprima della simulazione: conferma i contratti per avviare la gestione.','Simulation preview: confirm contracts to start operations.'));
  calendarRoom=m.rooms.some(r=>r.id===calendarRoom)?calendarRoom:m.rooms[0].id;
  const filter=formField(content,t('Stanza','Room'),'room',{value:calendarRoom,options:m.rooms.map(r=>[r.id,r.id])});const body=el('div');content.append(body);
  const rows=calculateCommercial(m).calendar.filter(r=>r.date.slice(5,7)===String(month).padStart(2,'0'));
  function paint(){body.replaceChildren();table(body,[t('Data','Date'),t('Fascia','Slot'),t('Stato','Status')],rows.filter(r=>r.roomId===filter.value).map(r=>{const slot=m.slots.find(s=>s.id===r.slotId);return [r.date,`${slot.start}–${slot.end}`,r.closed?t('Chiuso','Closed'):r.code?t('Riservato · ','Reserved · ')+r.code:t('Libero','Free')];}));}
  filter.addEventListener('change',()=>{calendarRoom=filter.value;paint();});paint();note(content,`${s.month.free} / ${s.month.capacity} · ${t('fasce libere nel periodo, tutte le stanze','free slots in the period, all rooms')}`);
 }
 function renderMovements(s){
  note(content,t('Registra soltanto movimenti effettivi. Indica data reale e mese di competenza. Usa riferimenti generici, senza nominativi, IBAN o documenti. Un canone previsto non è un pagamento registrato.','Record actual movements only. Enter actual date and accrual month. Use generic references, without names, IBANs or documents. An expected fee is not a recorded payment.'));
  table(content,[t('Contratto','Contract'),t('Canone IVA compresa','Fee including VAT'),t('Registrato − rimborsi','Recorded − refunds'),t('Da riconciliare','To reconcile')],s.contractBalances.map(a=>[a.id+' / '+a.code,money(a.contractualGross),money(a.registered),money(a.difference)]));
  note(content,t('Da riconciliare = contrattuale meno registrato per competenza. Non indica arretrati: le scadenze di pagamento non sono modellate.','To reconcile = contractual minus recorded by accrual period. It does not indicate arrears: payment due dates are not modelled.'));
  if(workspace.operating){const form=el('form');form.dataset.form='movement';const grid=el('div',undefined,'cm-fields');form.append(grid);
   const kind=formField(grid,t('Tipo movimento','Movement type'),'kind',{value:'receipt',options:[['receipt',t('Incasso','Receipt')],['refund',t('Rimborso incasso','Receipt refund')],['cost',t('Costo pagato','Paid cost')]]});
   const date=formField(grid,t('Data effettiva','Actual date'),'date',{type:'date',value:demo?'2027-01-10':today});
   const period=formField(grid,t('Competenza','Accrual period'),'movementPeriod',{value:s.period,options:Array.from({length:12},(_,i)=>{const p=`${workspace.operating.year}-${String(i+1).padStart(2,'0')}`;return[p,p];})});
   const contract=formField(grid,t('Contratto · non usato per costi','Contract · unused for costs'),'contractId',{options:workspace.operating.assignments.map(a=>[a.id,a.id+' / '+a.code+' / '+a.roomId])});
   const amount=formField(grid,t('Importo € · IVA compresa','Amount € · including VAT'),'movementAmount',{type:'number'});
   const reference=formField(grid,t('Riferimento generico','Generic reference'),'reference');reference.maxLength=64;
   kind.addEventListener('change',()=>{contract.disabled=kind.value==='cost';});
   const submit=el('button',t('Registra movimento','Record movement'));submit.type='submit';submit.disabled=!canWrite;form.append(submit);form.addEventListener('input',()=>setDirty(true));
   form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;mutate('add_movement',{kind:kind.value,date:date.value,period:period.value,contractId:kind.value==='cost'?null:contract.value,cents:Math.round(Number(amount.value)*100),reference:reference.value});});content.append(form);
  }else note(content,errors.confirmation_required);
  const entries=workspace.ledger.filter(e=>e.period===s.period);
  table(content,[t('Data / competenza','Date / accrual'),t('Tipo / riferimento','Type / reference'),t('Importo','Amount'),t('Stato','Status')],entries.map(e=>{const action=el('div');if(e.voided)action.textContent=t('Annullato · ','Voided · ')+e.voidReason;else action.append(button(t('Annulla registrazione','Void record'),()=>{const reason=t('Rettifica utente','User correction');if(confirm(t('Annullare questa registrazione mantenendo la traccia?','Void this record while retaining the audit trail?')))mutate('void_movement',{id:e.id,reason});},!canWrite));return [e.date+' / '+e.period,({receipt:t('Incasso','Receipt'),refund:t('Rimborso','Refund'),cost:t('Costo','Cost')}[e.kind])+' / '+e.reference,money(e.cents/100),action];}));
  content.append(button(t('Esporta registro del mese CSV','Export monthly register CSV'),()=>download(exportCommercialRegister(workspace,{period:s.period}),'RendimentoBB-commercial-'+s.period+'.csv')));
 }
 function renderTasks(){
  note(content,t('Manutenzioni, pulizie e segnalazioni degli utilizzatori. Inserimento manuale del gestore: nessun portale esterno o invio automatico. Non inserire dati sanitari.','Maintenance, cleaning and user reports. Manually entered by the manager: no external portal or automatic sending. Do not enter health data.'));
  for(const task of workspace.tasks){const card=el('article',undefined,'cw-priority');card.append(el('h3',task.roomId+' · '+category[task.category]),el('p',task.note),el('p',`${task.dueDate} · ${{low:t('Bassa','Low'),normal:t('Normale','Normal'),urgent:t('Urgente','Urgent')}[task.priority]} · ${task.status==='done'?t('Completata','Done'):t('Aperta','Open')}`),button(task.status==='done'?t('Riapri','Reopen'):t('Segna completata','Mark done'),()=>mutate('task_status',{id:task.id,status:task.status==='done'?'open':'done'}),!canWrite));content.append(card);}
  if(!workspace.tasks.length)note(content,t('Nessuna attività registrata.','No tasks recorded.'));
  if(!workspace.operating){note(content,errors.confirmation_required);return;}
  const form=el('form');form.dataset.form='task';const grid=el('div',undefined,'cm-fields');form.append(grid);
  const room=formField(grid,t('Stanza','Room'),'taskRoom',{options:workspace.operating.rooms.map(r=>[r.id,r.id])}),cat=formField(grid,t('Categoria','Category'),'category',{options:Object.entries(category)}),priority=formField(grid,t('Priorità','Priority'),'priority',{value:'normal',options:[['low',t('Bassa','Low')],['normal',t('Normale','Normal')],['urgent',t('Urgente','Urgent')]]}),due=formField(grid,t('Da gestire entro','Action by'),'dueDate',{type:'date',value:demo?'2027-01-10':today}),description=formField(grid,t('Nota generica','Generic note'),'taskNote');description.maxLength=200;
  const submit=el('button',t('Aggiungi attività','Add task'));submit.type='submit';submit.disabled=!canWrite;form.append(submit);form.addEventListener('input',()=>setDirty(true));form.addEventListener('submit',event=>{event.preventDefault();if(form.reportValidity())mutate('add_task',{roomId:room.value,category:cat.value,priority:priority.value,dueDate:due.value,note:description.value});});content.append(form);
 }
 function renderAutopilot(){
  note(content,t('Assistente sui dati di questo spazio: priorità, disponibilità, movimenti e ipotesi. Elabora localmente dati già autorizzati; non invia richieste a servizi AI esterni. Non esegue operazioni.','Assistant for this workspace: priorities, availability, movements and assumptions. Processes already authorised data locally; sends no requests to external AI services. Executes no operations.'));
  const output=el('div',undefined,'cw-answer');output.setAttribute('role','status');output.setAttribute('aria-live','polite');const quick=el('div',undefined,'cm-actions');
  function answer(question){const a=answerCommercialAutopilot(workspace,question,{month,today:demo?'2027-01-10':today,english});output.replaceChildren(el('p',a.text),el('p',a.source,'cm-note'),button(t('Apri sezione collegata','Open related section'),()=>{view=a.target;render();}));}
  for(const label of [t('Cosa devo fare oggi?','What should I do today?'),t('Come vanno gli incassi?','How are receipts?'),t('Quali fasce sono libere?','Which slots are free?'),t('Spiegami il cashflow','Explain cashflow')])quick.append(button(label,()=>answer(label)));content.append(quick);
  const form=el('form');form.dataset.form='autopilot';const q=formField(form,t('Chiedi ad Autopilot','Ask Autopilot'),'question');q.maxLength=500;const submit=el('button',t('Chiedi','Ask'));submit.type='submit';form.append(submit);form.addEventListener('submit',event=>{event.preventDefault();if(form.reportValidity())answer(q.value);});content.append(form,output);
 }
 async function refresh(){const selected=workspace?.id;const result=await call('list');if(!result)return;spaces=result.workspaces;canWrite=result.canWrite;const id=selected||spaces[0]?.id;if(id){const detail=await call('get',{workspaceId:id});if(!detail)return;workspace=detail.workspace;canWrite=detail.canWrite??canWrite;if(!selected)view='overview';}else workspace=null;scenarioDraft=null;setDirty(false);render();}
 async function setOwner(next){generation++;owner=next;calendarRoom='';busy=false;workspace=null;spaces=[];canWrite=false;scenarioDraft=null;setDirty(false);say('');render();if(owner)await refresh();}
 function importDraft(model){if(!owner)return false;if(!guard())return false;workspace=null;scenarioDraft=structuredClone(model);view='scenario';render();setDirty(true);say(t('Scenario importato come bozza: crea lo spazio per salvarlo.','Scenario imported as a draft: create a space to save it.'));return true;}
 render();return {setOwner,refresh,importDraft,getWorkspace:()=>structuredClone(workspace),getView:()=>view,isDirty:()=>dirty,destroy:()=>{generation++;owner=null;workspace=null;spaces=[];root.replaceChildren();}};
}
export function exportCommercialRegister(w,{period=null}={}){
 const cell=x=>'"'+String(x??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
 const rows=[['schema','workspace','year','date','period','kind','contract','amount_including_vat_eur','reference','voided','void_reason'],...w.ledger.filter(e=>!period||e.period===period).map(e=>['commercial-register-v1',w.name,w.scenario.year,e.date,e.period,e.kind,e.contractId,(e.cents/100).toFixed(2),e.reference,e.voided,e.voidReason||''])];
 return '\uFEFF'+rows.map(row=>row.map(cell).join(';')).join('\r\n');
}
