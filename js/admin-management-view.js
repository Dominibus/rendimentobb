import registry from './source-registry-data.js?v=20261029-rc228';
import {managementPlan,sourceSteps,sourceNames,jobNames} from './admin-management-model.js?v=20261029-rc229';
export function renderManagement(root,data,lang='it',now=Date.now()){
 const en=lang==='en',t=(it,eng)=>en?eng:it,idx=en?1:0;
 const add=(parent,tag,text,cls)=>{const e=root.ownerDocument.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;parent.append(e);return e;};
 const link=(parent,label,href)=>{const e=add(parent,'a',label);e.href=href;if(href.startsWith('https:')){e.target='_blank';e.rel='noopener noreferrer';}return e;};
 const date=v=>Number.isFinite(v)&&v>0&&v<=now+300000?new Date(v).toLocaleString(en?'en-GB':'it-IT',{timeZone:'Europe/Rome'}):t('Non disponibile','Unavailable');
 const name=id=>jobNames[id]?.[idx]||({manual:t('Email da esaminare','Emails needing review'),due:t('Email in ritardo','Delayed emails'),interests:t('Richieste di interesse ai piani','Plan interest requests')}[id])||t('Controllo operativo','Operational check');
 const plan=managementPlan(data,registry,now),area=add(root,'section',undefined,'ops-management');area.id='ops-management';
 const hero=add(area,'div',undefined,'ops-overview');
 add(hero,'h3',t('La tua gestione oggi','Your management today'));
 add(hero,'p',plan.actionCount?t('Ci sono cose da verificare: trovi i passi da seguire qui sotto.','There are items to review: follow the steps below.'):t('Nessun intervento segnalato dai controlli disponibili.','No action flagged by the available checks.'),'ops-headline');
 const totals=add(hero,'div',undefined,'ops-summary-grid');
 for(const [n,label] of [[plan.issues.length,t('Anomalie operative','Operational flags')],[plan.gaps.length+(plan.stale?1:0),t('Controlli da rifare o verificare','Checks to repeat or verify')],[plan.reviews.length,t('Revisioni delle fonti','Source reviews')]]){const c=add(totals,'div',undefined,'ops-summary-item');add(c,'strong',String(n));add(c,'span',label);}
 add(hero,'p',t('Lettura dei servizi: ','Service snapshot: ')+date(data.observedAt)+' · Europe/Rome. '+t('Le revisioni delle fonti provengono dal registro pubblicato: non sono nuovi aggiornamenti rilevati online.','Source reviews come from the published registry: they are not newly detected online releases.'));
 const nav=add(hero,'nav',undefined,'ops-quick-links');
 link(nav,t('Devi intervenire tu','Your action list'),'#ops-your-actions');link(nav,t('Cosa ha fatto il sistema','What the system did'),'#ops-system-work');link(nav,t('Dove ricevi gli avvisi','Where alerts appear'),'#ops-alert-guide');
 const actions=add(area,'section');actions.id='ops-your-actions';add(actions,'h3',t('Devi intervenire tu','Your action list'));
 if(plan.stale){const c=add(actions,'article',undefined,'ops-priority');add(c,'h4',t('Prima aggiorna questa lettura','Refresh this snapshot first'));add(c,'p',t('La lettura è scaduta o la sua data non è utilizzabile. Premi “Aggiorna controlli” prima di decidere; non viene eseguita alcuna riparazione.','The snapshot expired or its date is unusable. Select “Refresh checks” before deciding; this does not perform repairs.'));link(c,t('Vai ad Aggiorna controlli','Go to Refresh checks'),'#operations-refresh');}
 for(const item of [...plan.issues,...plan.gaps]){
  const c=add(actions,'article',undefined,'ops-priority');add(c,'h4',name(item.id));
  add(c,'p',item.reason==='stale'?t('Non risulta un’esecuzione recente nei dati disponibili.','No recent run is recorded in the available evidence.'):item.reason==='unverified'||item.reason==='unavailable'||item.reason==='unknown_environment'?t('Il controllo è incompleto: non possiamo dire se tutto funziona.','The check is incomplete: normal operation cannot be confirmed.'):t('È presente una segnalazione nel controllo registrato.','A flag is present in the recorded check.'));
  const list=add(c,'ol');
  for(const step of [t('Premi “Aggiorna controlli” e verifica se la segnalazione rimane.','Select “Refresh checks” and check whether the flag remains.'),
   t('Apri i log Vercel del servizio; annota nome dell’attività, ora ed esito. Non reinviare email e non eliminare record alla cieca.','Open the Vercel service logs; note activity name, time and outcome. Do not blindly resend emails or delete records.'),
   t('Se resta da chiarire, passa queste informazioni a Codex per una verifica mirata.','If still unclear, give these details to Codex for a targeted investigation.')])add(list,'li',step);
  link(c,t('Apri il progetto su Vercel','Open the Vercel project'),'https://vercel.com/dominibus-projects/rendimentobb');
 }
 for(const review of plan.reviews){
  const d=review.dataset,c=add(actions,'article',undefined,'ops-review-card');
  add(c,'h4',sourceNames[d.id]?.[idx]||d.name);
  add(c,'p',review.reviewDue?t('È arrivata la data prevista per il controllo.','The scheduled review date has arrived.'):t('Revisione già prevista nel registro; non è una nuova anomalia rilevata oggi.','Review already required by the registry; not a newly detected fault today.'),'ops-note');
  add(c,'p',t('Prossimo controllo: ','Next review: ')+d.nextReviewAt+(d.observationPeriod?' · '+t('Riferimento attuale: ','Current reference: ')+d.observationPeriod:''));
  const details=add(c,'details');details.id='ops-source-action-'+d.id;add(details,'summary',t('Cosa devi fare, passo per passo','What to do, step by step'));
  const list=add(details,'ol');for(const s of sourceSteps(d,lang))add(list,'li',s);
  if(d.sourceURL)link(details,t('Apri la fonte da controllare','Open the source to check'),d.sourceURL);
  link(details,t('Apri inventario e manuale operativo','Open inventory and operating manual'),'https://github.com/Dominibus/rendimentobb/tree/main/docs/reliability');
  add(details,'p',t('Quando hai finito: chiedi a Codex di registrare evidenza, esito e prossima revisione in una PR. Il promemoria resta finché la revisione non viene documentata; non c’è un pulsante che certifichi il dato.','When finished, ask Codex to record evidence, outcome and next review in a PR. The reminder remains until documented; no button certifies the data.'));
 }
 if(!plan.actionCount)add(actions,'p',t('Non risultano attività aperte nei dati di questa lettura.','No open tasks are recorded in this snapshot.'));
 const system=add(area,'section');system.id='ops-system-work';add(system,'h3',t('Cosa ha fatto il sistema','What the system did'));
 add(system,'p',t('Ultima esecuzione registrata per attività, non cronologia completa. I contatori non sono il totale degli utenti o delle email del sito.','Latest recorded run per activity, not a full history. Counters are not site-wide user or email totals.'));
 const grid=add(system,'div',undefined,'ops-grid');
 for(const j of data.jobs||[]){
  const card=add(grid,'article',undefined,'ops-card');add(card,'h4',name(j.id));
  const c=j.check,valid=j.available&&c&&Number.isFinite(c.lastRunAt)&&c.lastRunAt>0&&c.lastRunAt<=now+300000;
  const state=!valid?t('Esito non verificabile','Outcome unverified'):now-c.lastRunAt>36*3600000?t('Ultima esecuzione da verificare','Last run needs review'):c.state==='attention'?t('Richiede attenzione','Needs attention'):c.state==='recorded_success'?t('Il servizio ha registrato un esito positivo','Service recorded a successful outcome'):t('Esecuzione registrata; risultato non certificato','Run recorded; outcome not certified');
  add(card,'p',state,'ops-state');add(card,'p',t('Quando: ','When: ')+date(c?.lastRunAt));
  const labels={checked:t('Elementi controllati','Items checked'),sent:t('Email accettate dal provider (consegna non verificata)','Emails accepted by provider (delivery unverified)'),suppressed:t('Invii non effettuati per i controlli previsti','Sends withheld by existing controls'),deleted:t('Record eliminati dal servizio','Records deleted by service'),errors:t('Errori registrati','Recorded errors'),retry:t('Nuovi tentativi registrati','Recorded retries'),manualReview:t('Elementi da esaminare','Items needing review'),pending:t('Elementi in attesa','Pending items'),expiredReminders:t('Promemoria scaduti','Expired reminders')};
  if(j.available&&c)for(const [k,label]of Object.entries(labels)){const n=c.metrics?.[k];if(Number.isSafeInteger(n)&&n>=0)add(card,'p',label+': '+n);}
 }
 const source=add(system,'article',undefined,'ops-card');add(source,'h4',t('Controlli automatici sulle fonti','Automatic source checks'));
 add(source,'p',t('Gli esiti GitHub non sono ancora collegati a questa schermata. Controllo mensile: archivio ISTAT, integrità OMI e collegamenti; acquisizione Inside Airbnb sospesa. Nessuna pubblicazione automatica dei dati.','GitHub outcomes are not connected to this screen yet. Monthly check: ISTAT archive, OMI integrity and reference links; Inside Airbnb acquisition paused. No automatic data publication.'));
 link(source,t('Vedi quando è partito e cosa ha trovato','See when it ran and what it found'),'https://github.com/Dominibus/rendimentobb/actions/workflows/territorial-sources.yml');
 link(source,t('Vedi i test automatici del portale','See automated portal tests'),'https://github.com/Dominibus/rendimentobb/actions/workflows/regression-tests.yml');
 const alerts=add(area,'section',undefined,'ops-card');alerts.id='ops-alert-guide';add(alerts,'h3',t('Dove ricevi gli avvisi','Where alerts appear'));
 add(alerts,'p',data.notifications?.enabled?t('Email Admin abilitate: il riepilogo operativo esistente prevede al massimo un tentativo al giorno dopo il cron. Qui non verifichiamo la consegna.','Admin emails enabled: the existing operational digest allows at most one attempt daily after cron. Delivery is not verified here.'):t('Email Admin non abilitate nella lettura corrente: usa questa pagina per il controllo.','Admin email alerts are not enabled in this snapshot: use this page to check.'));
 add(alerts,'p',t('Le revisioni delle fonti sono elencate in “Devi intervenire tu”; non sono ancora incluse nelle email. Il riepilogo operativo non viene eseguito da questa pagina.','Source reviews appear in “Your action list”; they are not included in email alerts yet. This page does not run the operational digest.'));
 add(alerts,'p',t('Questa vista non controlla continuamente il portale. Premi “Aggiorna controlli” per una nuova lettura. Se il cron si ferma, non può avvisarti da solo del proprio fermo: verifica anche le esecuzioni.','This view does not monitor the portal continuously. Select “Refresh checks” for a new snapshot. A stopped cron cannot report its own failure: also check the run records.'));
 return area;
}
