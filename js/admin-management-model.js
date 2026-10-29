// Read-only management plan: observed operations and declared source reviews stay separate.
import {controlSummary} from './admin-control-model.js?v=20261022-rc178';
import {sourceRegistrySummary} from './source-registry.js?v=20261029-rc228';
export const sourceNames={
 'istat-municipalities':['Elenco dei comuni italiani','Italian municipality directory'],
 'istat-tourism':['Dati turistici ISTAT','ISTAT tourism data'],
 'omi-values':['Quotazioni immobiliari OMI','OMI property values'],
 'inside-airbnb':['Prezzi degli annunci · Inside Airbnb','Listing prices · Inside Airbnb'],
 'market-assumptions':['Ipotesi di mercato','Market assumptions'],
 'mortgage-assumptions':['Ipotesi sui mutui','Mortgage assumptions'],
 'property-examples':['Esempi di immobili','Property examples'],
 'roi-model':['Calcoli di rendimento e rischio','Return and risk calculations'],
 'commercial-model':['Calcoli per locali e studi','Commercial property calculations'],
 'pms-user-data':['Dati inseriti nel PMS','User-entered PMS data'],
 'pms-demo':['Esempi del calendario demo','Demo calendar examples'],
 'exports-documents':['Report PDF e CSV','PDF and CSV reports'],
 'editorial-knowledge':['Guide e informazioni normative','Guides and regulatory information'],
 'platform-providers':['Condizioni dei fornitori tecnici','Technical provider terms']
};
export const jobNames={
 task_notifications:['Email sulle attività PMS','PMS activity emails'],
 analysis_reminders:['Promemoria delle analisi','Analysis reminders'],
 withdrawal_receipts:['Ricevute delle richieste di recesso','Withdrawal request receipts'],
 subscription_confirmations:['Conferme degli abbonamenti','Subscription confirmations'],
 plan_interest_cleanup:['Pulizia delle richieste sui piani','Plan interest request cleanup'],
 solution_request_cleanup:['Pulizia delle richieste archiviate','Archived request cleanup']
};
export function managementPlan(data,registry,now=Date.now()){
 const summary=controlSummary(data,now);
 const age=now-data.observedAt;
 const stale=!Number.isFinite(data.observedAt)||age>300000||age < -300000;
 const issues=new Map();
 for(const i of summary.issues){
  const previous=issues.get(i.id);
  if(!previous||i.reason==='attention')issues.set(i.id,i);
 }
 const gaps=summary.gaps.filter((g,i,a)=>a.findIndex(x=>x.id===g.id)===i&&!issues.has(g.id));
 const health=sourceRegistrySummary(registry,now);
 const reviews=registry.datasets.filter(d=>{const h=health.find(x=>x.id===d.id);return h.state==='requires_review'||h.reviewDue;})
  .map(d=>({id:d.id,dataset:d,reviewDue:health.find(x=>x.id===d.id).reviewDue}));
 return {issues:[...issues.values()],gaps,reviews,stale,interests:summary.interests,
  actionCount:issues.size+gaps.length+reviews.length+(stale?1:0)};
}
export function sourceSteps(d,lang='it'){
 const en=lang==='en',t=(it,eng)=>en?eng:it;
 if(d.id==='omi-values')return [
  t('Apri la pagina delle forniture OMI dell’Agenzia delle Entrate e verifica il semestre disponibile rispetto a quello riportato qui. Non abbiamo rilevato automaticamente un nuovo semestre.','Open the Revenue Agency OMI supply page and compare the available semester with the one recorded here. No new semester has been detected automatically.'),
  t('Se trovi una nuova fornitura utilizzabile, scarica l’archivio originale senza sostituire i file del sito. Conserva periodo, data di acquisizione e condizioni d’uso. Documenta anche le condizioni della fornitura già presente.','If a usable new release exists, download the original archive without replacing site files. Keep its period, acquisition date and reuse terms. Also document the terms of the existing release.'),
  t('Passa archivio e condizioni a Codex: chiedi un candidato separato, controlli su comuni e unità, confronto con la versione attuale e una PR. Pubblica solo dopo revisione.','Give the archive and terms to Codex: request a separate candidate, checks on municipality identities and units, comparison with the current version and a PR. Publish only after review.')];
 if(d.id==='inside-airbnb')return [
  t('L’acquisizione automatica è sospesa per revisione delle condizioni del provider. Non occorre ripetere il download per sbloccarla.','Automatic acquisition is paused pending provider-terms review. Repeating the download will not unblock it.'),
  t('Leggi le condizioni di acquisizione e riuso e chiarisci il canale consentito per il tuo utilizzo. Conserva l’evidenza della risposta o delle condizioni applicabili.','Read acquisition and reuse terms and clarify the permitted channel for your use. Keep evidence of the response or applicable terms.'),
  t('Fai revisionare il metodo prima di riattivare l’acquisizione con una PR separata. I dati attuali restano invariati.','Have the method reviewed before reactivating acquisition in a separate PR. Current data remain unchanged.')];
 if(d.id==='editorial-knowledge')return [
  t('Elenca le informazioni fiscali o normative che usi nelle guide e nelle risposte del chatbot.','List tax and regulatory statements used in guides and chatbot answers.'),
  t('Con il professionista verifica fonte, articolo, territorio e decorrenza. Registra cosa è stato confermato e cosa va corretto.','With the professional, verify source, provision, jurisdiction and effective date. Record confirmations and required corrections.'),
  t('Chiedi a Codex una modifica documentata e testata. Non cambiare automaticamente aliquote o formule.','Ask Codex for a documented, tested change. Do not change tax rates or formulas automatically.')];
 if(d.id==='platform-providers')return [
  t('Raccogli le condizioni applicabili ai servizi tecnici usati dal portale: Firebase, Stripe e Resend.','Collect applicable terms for the portal’s technical services: Firebase, Stripe and Resend.'),
  t('Verifica che utilizzo e documentazione del servizio siano coerenti con le condizioni applicabili; registra la revisione.','Check that service use and documentation match applicable terms; record the review.'),
  t('Questa segnalazione indica documentazione da completare, non un guasto rilevato nei servizi.','This flag means documentation needs completion, not that a service fault was detected.')];
 const external=d.classification==='official'||d.classification==='private_provider';
 return external?[
  t('Apri il riferimento della fonte e confronta periodo, copertura e condizioni con la scheda attuale.','Open the source reference and compare period, coverage and terms with the current record.'),
  t('Se cambia qualcosa, conserva l’originale e chiedi a Codex una versione candidata con test e PR. Altrimenti documenta il controllo e la prossima revisione.','If something changes, retain the original and ask Codex for a tested candidate and PR. Otherwise document the check and next review.')]:[
  t('Controlla che ipotesi, spiegazioni ed esempi siano ancora corretti per il prodotto. Non sono dati di mercato da scaricare.','Check that assumptions, explanations and examples remain appropriate. These are not market datasets to download.'),
  t('Documenta l’esito con Codex. Modifiche a calcoli, regole fiscali o dati salvati richiedono revisione separata.','Document the outcome with Codex. Calculation, tax-rule and saved-data changes require separate review.')];
}
