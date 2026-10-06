// Illustrations of annual revenue, shared by the simulator and PDF.
// These are not market forecasts or recalculated cashflow scenarios.
export function buildRevenueScenarios(baseRevenue, translate = (it) => it) {
  if (baseRevenue === null || baseRevenue === undefined || baseRevenue === '' || typeof baseRevenue === 'boolean') return [];
  const revenue = Number(baseRevenue);
  if (!Number.isFinite(revenue) || revenue < 0) return [];
  return [
    {label: translate('Basso (-20%)', 'Low (-20%)'), value: revenue * 0.8, color: [239,68,68]},
    {label: translate('Base', 'Base'), value: revenue, color: [59,130,246]},
    {label: translate('Alto (+20%)', 'High (+20%)'), value: revenue * 1.2, color: [16,185,129]}
  ];
}
