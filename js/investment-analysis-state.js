// A dedicated snapshot of a completed simulator calculation. Never reads PDF data
// or the shared lastAnalysisData cache, which other portal flows can overwrite.
export function createInvestmentAnalysisState(window, document) {
  const fields = ['price','equity','priceNight','occupancy','expenses','commission','tax','loanAmount','interestRate','loanYears','market-city','custom-location'];
  let snapshot = null;
  const tier = () => {
    const access = window.getUserAccess?.() || {};
    if (access.isLoading) return 'loading';
    return access.isAdmin || access.isPro || access.isInvestor ? 'paid' : 'free';
  };
  const signature = () => JSON.stringify({
    fields: fields.map(id => [id, String(document.getElementById(id)?.value ?? '').trim()]),
    city: String(window.currentCity || ''), uid: String(window.currentUser?.uid || ''), tier: tier()
  });
  const number = value => value !== null && value !== undefined && value !== '' && typeof value !== 'boolean' && Number.isFinite(Number(value)) ? Number(value) : null;
  const getState = () => {
    if (!document.getElementById('price') || !document.getElementById('analyze-btn')) return {status:'unavailable'};
    if (window.isCalculating || tier() === 'loading') return {status:'pending'};
    if (!snapshot) return {status:'missing'};
    if (snapshot.signature !== signature()) return {status:'stale'};
    if (window.simulationExecuted !== true) return {status:'missing'};
    return {status:'current', ...snapshot.publicData};
  };
  const publish = (result, inputs, capturedSignature) => {
    if (!document.getElementById('price') || !result || capturedSignature !== signature() || tier() === 'loading') { snapshot = null; return false; }
    const paid = tier() === 'paid';
    const annualCashflow = number(result.netAfterMortgage);
    const roi = number(paid ? result.roi : result.realROI);
    if (annualCashflow === null || roi === null) { snapshot = null; return false; }
    const metrics = {roi, roiBasis: paid ? 'equity' : 'property', annualCashflow, monthlyCashflow: annualCashflow / 12};
    if (paid) Object.assign(metrics, {
      annualRevenue: number(result.gross), risk: number(result.risk), dscr: number(result.dscr),
      annualDebtService: number(result.mortgageYearly), equity: number(inputs.equity)
    });
    snapshot = {signature: capturedSignature, publicData: Object.freeze({
      tier: tier(), city: String(document.getElementById('custom-location')?.value || window.currentCity || '').trim(),
      calculatedAt: Date.now(), metrics: Object.freeze(metrics)
    })};
    return true;
  };
  const updateStatus = event => {
    if (!fields.includes(event.target?.id) || !snapshot) return;
    const element = document.getElementById('tool-result-state');
    if (!element) return;
    const state = getState().status;
    if(state !== 'stale' && state !== 'current') return;
    element.dataset.it = state === 'stale' ? 'Dati modificati · ricalcola' : 'Analisi aggiornata';
    element.dataset.en = state === 'stale' ? 'Inputs changed · recalculate' : 'Analysis updated';
    element.textContent = window.currentLang === 'en' ? element.dataset.en : element.dataset.it;
  };
  document.addEventListener?.('input', updateStatus);
  document.addEventListener?.('change', updateStatus);
  window.rbGetInvestmentAnalysisState = getState;
  return {capture: signature, publish, invalidate: () => {snapshot = null;}, getState};
}
