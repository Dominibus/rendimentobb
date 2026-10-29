import registry from './source-registry-data.js?v=20261029-rc228';
import {sourceRegistrySummary} from './source-registry.js?v=20261029-rc228';
export function renderSourceRegistry(root, language='it', now=Date.now()){
  const en=language==='en',t=(it,eng)=>en?eng:it;
  const add=(parent,tag,text)=>{const e=root.ownerDocument.createElement(tag);if(text!==undefined)e.textContent=text;parent.append(e);return e;};
  const section=add(root,'section');section.className='ops-card ops-source-registry';
  add(section,'h3',t('Fonti e salute dei dati','Sources and data health'));
  add(section,'p',t('Inventario di repository, non monitoraggio live. Ultimo aggiornamento riuscito e disponibilità esterna: non verificati. Le impronte vengono controllate dalla CI, non da questa schermata.','Repository inventory, not live monitoring. Last successful update and external availability: not verified. Fingerprints are checked by CI, not this screen.'));
  add(section,'p',registry.registryVersion+' · '+t('Inventario: ','Inventory: ')+registry.inventoriedAt);
  add(section,'p',t('Aggiornamenti e pubblicazione automatici non attivati da questo registro. Revisione fiscale/normativa e condizioni dei provider richiedono approvazione. Avvisi email delle fonti non collegati.','This registry does not activate automatic acquisition or publication. Tax/legal review and provider terms require approval. Source email alerts are not connected.'));
  const labels={official:t('Fonte ufficiale','Official source'),private_provider:t('Provider privato','Private provider'),internal_assumption:t('Ipotesi di simulazione','Simulation assumption'),calculated:t('Calcolato','Calculated'),user_supplied:t('Dati dichiarati dall’utente','User supplied'),synthetic:t('Esempio fittizio','Synthetic example'),editorial:t('Contenuto editoriale','Editorial content')};
  const states={requires_review:t('Da revisionare','Review required'),review_due:t('Controllo periodico dovuto','Periodic review due'),inventoried:t('Censito; aggiornamento non certificato','Inventoried; freshness not certified')};
  const health=sourceRegistrySummary(registry,now);
  for(const d of registry.datasets){
    const details=add(section,'details'),summary=add(details,'summary',d.id+' · '+labels[d.classification]);
    summary.className='ops-source-summary';
    add(details,'p',states[health.find(h=>h.id===d.id).state]);
    if(health.find(h=>h.id===d.id).reviewDue)add(details,'p',t('Scadenza di revisione raggiunta.','Review deadline reached.'));
    add(details,'p',t('Periodo: ','Period: ')+(d.observationPeriod||t('Non disponibile / ipotesi','Unavailable / assumption')));
    add(details,'p',t('Acquisizione dichiarata: ','Recorded acquisition: ')+(d.acquiredAt||t('Non disponibile','Unavailable')));
    add(details,'p',t('Prossimo controllo (politica interna): ','Next review (internal policy): ')+d.nextReviewAt);
    add(details,'p',t('Versione: ','Version: ')+d.version+' · '+t('File censiti: ','Inventoried files: ')+d.assets.length);
    if(d.sourceURL){const link=add(details,'a',t('Apri il riferimento della fonte','Open source reference'));link.href=d.sourceURL;link.target='_blank';link.rel='noopener noreferrer';}
    add(details,'p',t('Scheda completa, limiti e condizioni nel registro e nel manuale.','Full record, limitations and terms are in the registry and manual.'));
  }
  return section;
}
