// Presentation only: reveal disclosures for deep links and resize charts on opening.
export function revealFlowTarget(target, win = window) {
  if (!target) return;
  let ancestor = target.parentElement;
  while (ancestor) {
    if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    ancestor = ancestor.parentElement;
  }
  if (target.tagName === 'DETAILS') target.open = true;
  win.dispatchEvent(new Event('resize'));
}
export function installPageFlow(doc = document, win = window) {
  function targetFor(hash) {
    if (!hash || hash === '#') return null;
    try { return doc.getElementById(decodeURIComponent(hash.slice(1))); } catch { return null; }
  }
  function revealHash() { revealFlowTarget(targetFor(win.location.hash), win); }
  doc.addEventListener('click', event => {
    const link = event.target.closest?.('a[href^="#"]');
    if (!link) return;
    const target = targetFor(link.getAttribute('href'));
    if (!target) return;
    revealFlowTarget(target, win);
    if (link.closest('.rb-flow-nav')) {
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
    }
  });
  doc.addEventListener('toggle', event => {
    if (event.target.tagName === 'DETAILS' && event.target.open) win.dispatchEvent(new Event('resize'));
  }, true);
  win.addEventListener('hashchange', revealHash);
  revealHash();
}
if (typeof document !== 'undefined') installPageFlow();
