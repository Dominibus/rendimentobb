import {isProductionAnalyticsHost,publicCampaignContext,publicEventPayload} from './public-measurement.js?v=20261020-rc163';
// Consent applies to optional analytics only, never authentication or billing.
export const ANALYTICS_CONSENT_KEY = 'rb_analytics_consent_v2';
export const ANALYTICS_CONSENT_VERSION = '2026-10-14-rc122';
export const ANALYTICS_ID = 'G-749B8PW4ST';

export function consentExpiry(now) {
  const date = new Date(now);
  date.setUTCMonth(date.getUTCMonth() + 6);
  return date.getTime();
}

export function readAnalyticsChoice(storage, now = Date.now()) {
  try {
    const record = JSON.parse(storage?.getItem(ANALYTICS_CONSENT_KEY) || 'null');
    if (!record || record.version !== ANALYTICS_CONSENT_VERSION ||
        !['granted', 'denied'].includes(record.choice) ||
        !Number.isFinite(record.at) || !Number.isFinite(record.expiresAt) ||
        record.at > now || record.expiresAt <= now || record.expiresAt <= record.at ||
        record.expiresAt > consentExpiry(record.at)) return null;
    return record.choice;
  } catch { return null; }
}

export function isPrivateAnalyticsPath(path = '/') {
  return /^\/(?:dashboard(?:-report|-leads)?|guest-report|account-action|login|pro-success)(?:\/|$)/.test(path) ||
    /^\/withdrawal\.html(?:$|\/)/.test(path);
}

export function clearAnalyticsCookies(document, hostname = '') {
  const names = String(document.cookie || '').split(';').map(row => row.trim().split('=')[0])
    .filter(name => /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name));
  const labels = hostname.split('.');
  const domains = [''];
  for (let index = 0; index < labels.length - 1; index++) {
    const domain = labels.slice(index).join('.');
    domains.push(domain, '.' + domain);
  }
  for (const name of names) for (const domain of domains) {
    document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ''} SameSite=Lax`;
  }
}

export function createAnalyticsConsent({window, document, storage, clock = Date.now}) {
  let memoryChoice = null;
  let memoryExpiry = 0;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };
  window['ga-disable-' + ANALYTICS_ID] = true;
  window.gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
  });
  const getChoice = () => memoryExpiry > clock() ? memoryChoice : readAnalyticsChoice(storage, clock());
  function apply(choice, persist = true) {
    if (!['granted', 'denied'].includes(choice)) choice = 'denied';
    if (persist) {
      const now = clock();
      memoryChoice = choice; memoryExpiry = consentExpiry(now);
      try {
        storage?.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({version: ANALYTICS_CONSENT_VERSION,
          choice, at: now, expiresAt: memoryExpiry}));
        storage?.removeItem('rb_analytics_consent_v1');
      } catch { /* A failed local write does not override the current choice. */ }
    }
    const enabled = choice === 'granted' && isProductionAnalyticsHost(window.location?.hostname) && !isPrivateAnalyticsPath(window.location?.pathname);
    window['ga-disable-' + ANALYTICS_ID] = !enabled;
    window.gtag('consent', 'update', {
      analytics_storage: enabled ? 'granted' : 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    if (!enabled) { clearAnalyticsCookies(document, window.location?.hostname); return; }
    if (window.__rbGA4Initialized) return;
    window.__rbGA4Initialized = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
    document.head.appendChild(script);
    window.gtag('js', new Date(clock()));
    let referrer = '';
    try { const url = new URL(document.referrer); referrer = url.origin + url.pathname; } catch {}
    window.gtag('config', ANALYTICS_ID, {
      allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_expires: 180 * 86400, cookie_update: false,
      page_location: (window.location?.origin || '') + (window.location?.pathname || '/'),
      page_referrer: referrer,
      ...publicCampaignContext(window.location?.search || '')
    });
  }
  apply(getChoice() || 'denied', false);
  // Re-evaluate when an existing tab is revisited after the consent expires.
  window.addEventListener?.('focus', () => apply(getChoice() || 'denied', false));
  window.addEventListener?.('storage', event => {
    if (event.key !== ANALYTICS_CONSENT_KEY) return;
    memoryChoice = null; memoryExpiry = 0;
    apply(getChoice() || 'denied', false);
  });
  function track(name,params){
    if(getChoice()!=='granted'||!isProductionAnalyticsHost(window.location?.hostname)||isPrivateAnalyticsPath(window.location?.pathname)||window['ga-disable-'+ANALYTICS_ID]!==false||window.__rbGA4Initialized!==true)return false;
    const payload=publicEventPayload(name,params);if(!payload)return false;
    try{window.gtag('event',name,payload);return true;}catch{return false;}
  }
  return {getChoice, setChoice: choice => apply(choice),track};
}
