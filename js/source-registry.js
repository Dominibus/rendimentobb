// RC228: public metadata only. No network, account access or financial recalculation.
const classifications = new Set(['official','private_provider','internal_assumption','calculated','user_supplied','synthetic','editorial']);
const states = new Set(['inventoried','requires_review']);
const dateOnly = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
const safePath = value => typeof value === 'string' && /^[\w./-]+$/.test(value) &&
  !value.startsWith('/') && !value.split('/').some(p => !p || p === '.' || p === '..');
export function validateSourceRegistry(registry){
  if(registry?.schemaVersion !== 1 || !dateOnly(registry.inventoriedAt) ||
    !/^[a-f0-9]{40}$/.test(registry.baselineCommit || '') || !registry.registryVersion ||
    !Array.isArray(registry.datasets) || !registry.datasets.length) throw Error('INVALID_SOURCE_REGISTRY');
  const ids = new Set();
  const nullable = ['sourceURL','dataset','license','licenseURL','publisher','granularity','observationPeriod',
    'publishedAt','sourceUpdatedAt','acquiredAt','declaredFrequency','previousVersion'];
  for(const d of registry.datasets){
    if(!d || !/^[a-z][a-z0-9-]+$/.test(d.id || '') || ids.has(d.id) || !classifications.has(d.classification) ||
      !states.has(d.validationState) || d.automaticPublication !== false || d.automaticAcquisition !== 'disabled' ||
      !dateOnly(d.nextReviewAt) || !d.name || !d.definition || !d.version || !d.coverage || !d.methodology ||
      !d.reviewFrequency || !d.licenseStatus || !Array.isArray(d.assets) || !d.assets.length ||
      !Array.isArray(d.consumers) || !d.consumers.length || !Array.isArray(d.limitations) ||
      !Array.isArray(d.transformations) || nullable.some(k => !Object.hasOwn(d,k)) ||
      d.lastUpdate?.status !== 'not_observed' || d.lastUpdate.at !== null || d.lastUpdate.error !== null)
      throw Error('INVALID_SOURCE_ENTRY');
    ids.add(d.id);
    for(const key of ['sourceURL','licenseURL']) if(d[key] !== null){
      let url;try{url = new URL(d[key]);}catch{throw Error('INVALID_SOURCE_URL');}
      if(url.protocol !== 'https:' || url.username || url.password) throw Error('INVALID_SOURCE_URL');
    }
    if(d.classification === 'official' && (!d.publisher || !d.sourceURL || !d.dataset)) throw Error('MISSING_OFFICIAL_PROVENANCE');
    for(const key of ['publishedAt','sourceUpdatedAt','acquiredAt'])
      if(d[key] !== null && !dateOnly(d[key])) throw Error('INVALID_SOURCE_DATE');
    const paths = new Set();
    for(const a of d.assets){
      if(!safePath(a.path) || !/^[a-f0-9]{64}$/.test(a.sha256 || '') || paths.has(a.path)) throw Error('INVALID_SOURCE_ASSET');
      paths.add(a.path);
    }
  }
  return registry;
}
export function sourceRegistrySummary(registry, now = Date.now()){
  validateSourceRegistry(registry);
  if(!Number.isFinite(now)) throw Error('INVALID_REVIEW_TIME');
  const today = new Date(now).toISOString().slice(0,10);
  return registry.datasets.map(d => ({id:d.id,classification:d.classification,
    // This is a review deadline, never a claim that the provider has newer data.
    reviewDue:today >= d.nextReviewAt,
    state:d.validationState === 'requires_review' || d.licenseStatus === 'requires_review' ? 'requires_review' : today >= d.nextReviewAt ? 'review_due' : 'inventoried',
    lastSuccessfulUpdate:null,liveAvailability:'not_checked',localIntegrity:'not_checked_in_browser'}));
}
