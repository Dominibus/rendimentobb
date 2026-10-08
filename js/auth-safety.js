// Shared, testable controls. Server/provider authorization remains mandatory.
export function safeAuthDestination(redirect, city, origin) {
  if (['roma', 'milano', 'napoli', 'firenze'].includes(String(city || '').toLowerCase())) {
    return `/immobili/${String(city).toLowerCase()}/`;
  }
  if (typeof redirect !== 'string' || redirect.length > 2048 || /[\\\u0000-\u001f]/.test(redirect)) return '/dashboard/';
  try {
    const url = new URL(redirect, origin);
    if (url.origin !== origin || url.username || url.password || !['http:', 'https:'].includes(url.protocol)) return '/dashboard/';
    if (!/^\/(?:$|(?:dashboard|tool|immobili|market|academy|roi-bnb|mutui)(?:\/|$))/.test(url.pathname)) return '/dashboard/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return '/dashboard/'; }
}
export function createAuthActionGuard() {
  let busy = false;
  return { get busy() { return busy; }, async run(action) {
    if (busy) return false;
    busy = true;
    try { await action(); return true; } finally { busy = false; }
  }};
}
