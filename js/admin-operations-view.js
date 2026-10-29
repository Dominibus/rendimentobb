import {controlSummary} from './admin-control-model.js?v=20261022-rc178';
import {renderSourceRegistry} from './admin-source-registry-view.js?v=20261029-rc228';
const copy={
 task_notifications:['Email PMS','PMS emails'],analysis_reminders:['Promemoria analisi','Analysis reminders'],
 withdrawal_receipts:['Ricevute recesso','Withdrawal receipts'],subscription_confirmations:['Conferme abbonamento','Subscription confirmations'],
 plan_interest_cleanup:['Pulizia interessi piani','Plan interest cleanup'],solution_request_cleanup:['Pulizia richieste archiviate','Archived request cleanup'],
 unverified:['Non verificato','Not verified'],attention:['Attenzione','Attention'],stale:['Controllo scaduto','Stale check'],
 recorded_success:['Successo registrato del job','Recorded job success'],recorded:['Esecuzione registrata, esito non certificato','Run recorded, outcome not certified'],
 checked:['Controllati','Checked'],sent:['Accettati dal provider','Accepted by provider'],errors:['Errori','Errors'],
 retry:['Nuovi tentativi','Retries'],manualReview:['Revisione manuale','Manual review'],pending:['In attesa','Pending'],
 queued:['In coda','Queued'],suppressed:['Non inviati per controllo','Suppressed'],deleted:['Eliminati dal job','Deleted by job'],
 expiredReminders:['Promemoria scaduti','Expired reminders'],oldestDueAgeMs:['Ritardo più vecchio registrato (min)','Recorded oldest delay (min)']
};
export function renderOperations(root,data,language='it',now=Date.now()){
 const en=language==='en',t=(it,eng)=>en?eng:it;
 const label=key=>copy[key]?.[en?1:0]||key;
 const doc=root.ownerDocument;
 const add=(parent,tag,text,className)=>{const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;parent.append(el);return el;};
 const date=n=>Number.isFinite(n)&&n>0?new Date(n).toLocaleString(en?'en-GB':'it-IT',{timeZone:'Europe/Rome'}):t('Non disponibile','Unavailable');
 const note=text=>add(root,'p',text,'ops-note');
 const summary=controlSummary(data,now);
 const overview=add(root,'section',undefined,'ops-overview');
 add(overview,'h3',t('La situazione a colpo d’occhio','Your operations at a glance'));
 add(overview,'p',summary.issues.length?t('Ci sono elementi da verificare','Some items need review'):t('Nessuna segnalazione nei controlli disponibili','No issues flagged by available checks'),'ops-headline');
 add(overview,'p',t('Non è una certificazione di funzionamento dell’intera piattaforma.','This does not certify that the whole platform is working.'));
 const totals=add(overview,'div',undefined,'ops-summary-grid');
 for(const [value,title] of [[summary.issues.length,t('Segnalazioni operative','Operational flags')],[summary.gaps.length,t('Controlli da verificare','Checks needing verification')],[summary.interests,t('Interessi piani live nel campione','Live plan interests in sample')]]){
 const card=add(totals,'div',undefined,'ops-summary-item');add(card,'strong',String(value));add(card,'span',title);
 }
 if(summary.snapshotStale)add(overview,'p',t('Lettura scaduta: aggiorna i controlli prima di decidere.','Snapshot expired: refresh checks before deciding.'),'ops-warning');
 const nav=add(overview,'nav',undefined,'ops-quick-links');
 for(const [href,title] of [['#operations-refresh',t('Vai ad Aggiorna controlli','Go to Refresh checks')],['#lead-search',t('Cerca e gestisci lead','Search and manage leads')],['#ops-coverage',t('Cosa manca al controllo completo','Monitoring coverage gaps')]]){const a=add(nav,'a',title);a.href=href;}
 add(root,'h3',t('Da verificare prima','Review first'));
 if(!summary.issues.length)add(root,'p',t('Nessun intervento segnalato dai dati disponibili. Verifica anche le lacune sotto.','No intervention flagged by available records. Check the coverage gaps below too.'));
 for(const item of summary.issues){
 const card=add(root,'article',undefined,'ops-priority');
 const name=copy[item.id]?label(item.id):item.id==='manual'?t('Coda email: revisione manuale','Email queue: manual review'):t('Coda email: ritardo superiore a 24 ore','Email queue: delay over 24 hours');
 add(card,'h4',name);
 const reason=item.reason==='stale'?t('Ultima esecuzione oltre 36 ore. Verifica pianificazione e log del cron.','Last run over 36 hours ago. Check cron scheduling and logs.'):item.reason==='attention'?t('Il job ha registrato anomalie o lavoro residuo. Controlla contatori e log prima di intervenire.','The job recorded flags or remaining work. Check counters and logs before acting.'):t('Elementi live nel campione: ','Live items in sample: ')+item.count+t('. Verifica il caso nei log; non reinviare alla cieca.','. Investigate in logs; do not resend blindly.');
 add(card,'p',reason);
 }
 if(summary.gaps.length)add(root,'p',t('Controlli incompleti: ','Incomplete checks: ')+summary.gaps.map(g=>copy[g.id]?label(g.id):g.id==='interests'?t('Interessi piani','Plan interests'):t('Coda email','Email queue')).join(' · '),'ops-warning');
 add(root,'p',t('Azioni automatiche: restano attivi soltanto i recuperi già previsti dai job. Questa schermata non reinvia email, non modifica piani e non elimina record.','Automatic actions: only the existing job recovery mechanisms remain active. This screen does not resend emails, change plans or delete records.'),'ops-note');
 add(root,'p',data.notifications?.enabled?t('Avvisi email Admin: abilitati, massimo un tentativo al giorno dopo il cron. Accettazione e consegna non sono certificate qui.','Admin email alerts: enabled, at most one attempt daily after cron. Acceptance and delivery are not certified here.'):t('Avvisi email Admin: non abilitati. Richiedono ADMIN_OPS_ALERTS_ENABLED=true in produzione.','Admin email alerts: not enabled. Require ADMIN_OPS_ALERTS_ENABLED=true in production.'),'ops-note');
 note(t('Lettura: ','Read: ')+date(data.observedAt)+' · Europe/Rome · '+t('Ambiente: ','Environment: ')+data.environment);
 if(now-data.observedAt>300000)note(t('Questa lettura ha più di 5 minuti. Aggiorna prima di intervenire.','This snapshot is over 5 minutes old. Refresh before taking action.'));
 note(t('Nuovi acquisti live: ','New live purchases: ')+(data.policy.newLiveSalesPaused?t('sospesi','paused'):t('non sospesi nel codice','not paused in code'))+
 ' · '+t('Prova Investor: ','Investor trial: ')+data.policy.trialDays+t(' giorni. Rinnovi esistenti: non verificati qui.',' days. Existing renewals are not verified here.'));
 add(root,'h3',t('Esiti delle automazioni','Automation records'));
 note(t('Questi sono esiti salvati dal cron, non verifiche indipendenti di Firebase, Stripe o consegna email. Soglia di aggiornamento: 36 ore.','These are stored cron results, not independent checks of Firebase, Stripe or email delivery. Freshness threshold: 36 hours.'));
 const grid=add(root,'div',undefined,'ops-grid');
 for(const job of data.jobs){
 const card=add(grid,'article',undefined,'ops-card');
 add(card,'h4',label(job.id));
 const check=job.check;
 let state=job.available?check.state:'unverified';
 if(check?.lastRunAt&&now-check.lastRunAt>36*3600000&&['recorded','recorded_success'].includes(state))state='stale';
 add(card,'p',job.available?label(state):t('Lettura non disponibile','Read unavailable'),'ops-state ops-'+state);
 add(card,'p',t('Ultima esecuzione: ','Last run: ')+date(check?.lastRunAt));
 if(check?.stale&&state==='attention')add(card,'p',label('stale'));
 if(check)for(const [key,value] of Object.entries(check.metrics))add(card,'p',label(key)+': '+(key==='oldestDueAgeMs'?Math.round(value/60000):value));
 }
 add(root,'h3',t('Code email PMS: campione limitato','PMS email queues: limited sample'));
 note(t('Massimo 20 record per gruppo; non sono totali dell’account. Ambienti live, test e non identificati sono separati. “Accettata” non significa consegnata.','Up to 20 records per group; these are not account totals. Live, test and unidentified environments are separated. “Accepted” does not mean delivered.'));
 const queues=add(root,'div',undefined,'ops-grid');
 for(const [key,text] of [['due',t('Elementi con tentativo previsto entro ora','Items with an attempt due by now')],['manual',t('Elementi da rivedere manualmente','Items requiring manual review')]]){
 const q=data.queues[key],card=add(queues,'article',undefined,'ops-card');add(card,'h4',text);
 if(!q.available){add(card,'p',t('Lettura non disponibile; nessuna assenza di problemi dimostrata.','Read unavailable; absence of problems has not been established.'));continue;}
 add(card,'p',t('Record nel campione: ','Records in sample: ')+q.sampleSize+(q.more?t(' · altri record presenti',' · more records exist'):''));
 add(card,'p','Live: '+q.counts.live+' · Test: '+q.counts.test+' · '+t('Ambiente sconosciuto: ','Unknown environment: ')+q.counts.unknown);
 const attempts=q.entries.map(e=>e.attempts).filter(Number.isFinite);
 if(attempts.length)add(card,'p',t('Massimo tentativi nel campione: ','Highest attempt count in sample: ')+Math.max(...attempts));
 if(key==='due'&&q.entries.length)add(card,'p',t('Ritardo massimo nel campione (min): ','Longest delay in sample (min): ')+Math.round(Math.max(...q.entries.map(e=>e.ageMs||0))/60000));
 }
 add(root,'h3',t('Richieste recenti di interesse ai piani','Recent plan interest requests'));
 note(t('Ultimi 20 record con data di creazione, includendo test ed eventuali record scaduti non ancora rimossi. Sono richieste dichiarate, non utenti verificati o abbonati. Per ora questa vista non espone email né consente contatti.','Latest 20 records with a creation date, including tests and expired records awaiting removal. These are submitted requests, not verified users or subscribers. This view does not expose email addresses or offer contact actions.'));
 if(!data.interests.available)note(t('Richieste non leggibili. Nessun conteggio disponibile.','Requests cannot be read. No count is available.'));
 else{
 if(data.interests.more)note(t('Altri record presenti: questa lista è parziale.','More records exist: this list is partial.'));
 if(!data.interests.entries.length)note(t('Nessun record con data di creazione trovato.','No records with a creation date found.'));
 const wrap=add(root,'div',undefined,'ops-table-wrap'),table=add(wrap,'table'),head=add(table,'thead'),hr=add(head,'tr');
 for(const name of [t('Piano','Plan'),t('Ambiente','Environment'),t('Lingua','Language'),t('Registrata','Recorded'),t('Scadenza','Expiry'),t('Stato','State')]){const th=add(hr,'th',name);th.scope='col';}
 const body=add(table,'tbody');
 for(const row of data.interests.entries){const tr=add(body,'tr');for(const value of [row.plan,row.environment,row.language.toUpperCase(),date(row.createdAt),date(row.expiresAt),row.state==='expired'?t('Scaduta','Expired'):row.state==='recorded'?t('Registrata','Recorded'):label('unverified')])add(tr,'td',value);}
 }
 const coverage=add(root,'h3',t('Servizi e verifiche ancora da collegare','Services and checks not yet connected'));coverage.id='ops-coverage';
 note(t('Disponibilità esterna, login, correttezza PDF/CSV e calcoli, backup e prova ripristino, costi, ricavi e salute Stripe: non verificati da questa schermata. Il riepilogo email facoltativo dipende dal cron: non rileva il fermo del cron stesso. Nessun ticket automatico è attivo.','External availability, login, PDF/CSV and calculation accuracy, backups and restore drills, costs, revenue and Stripe health are not verified by this screen. The optional email digest depends on cron: it cannot detect cron itself stopping. No automatic tickets are active.'));
 renderSourceRegistry(root,language,now);
}

