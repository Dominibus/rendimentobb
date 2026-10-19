// Presentation only: reuses existing nodes, report handlers and account permissions.
export function mountInvestmentWorkspace(root = document, win = window) {
  const main = root.getElementById('pms-roi-section');
  const secondary = root.getElementById('investment-workspace-section');
  if (!main || !secondary || root.getElementById('rb-investment-workspace')) return;
  const el = (tag, cls, it, en) => {
    const node = root.createElement(tag);
    if (cls) node.className = cls;
    if (it) { node.dataset.it = it; node.dataset.en = en; node.textContent = win.currentLang === 'en' ? en : it; }
    return node;
  };
  const workspace = el('section', 'rb-investment-workspace');
  workspace.id = 'rb-investment-workspace';
  const hero = el('header', 'rb-investment-hero');
  const intro = el('div');
  intro.append(el('span', 'rb-workspace-eyebrow', 'INVESTIMENTI E GESTIONE', 'INVESTMENTS AND OPERATIONS'), el('h2', '', 'Dai tuoi scenari al report', 'From your scenarios to the report'), el('p', '', 'Controlla gli immobili nel portafoglio oppure scegli una simulazione. Il report collega le ipotesi ai dati PMS disponibili per il periodo scelto.', 'Review your portfolio properties or choose a simulation. The report connects assumptions with available PMS data for your selected period.'));
  const actions = el('div', 'rb-workspace-actions');
  const report = root.getElementById('download-report');
  if (report) {
    report.dataset.it = 'Apri report integrato · PDF Pro';
    report.dataset.en = 'Open integrated report · Pro PDF';
    report.textContent = win.currentLang === 'en' ? report.dataset.en : report.dataset.it;
    report.classList.add('rb-workspace-report');
    // Keep the original access wrapper: moving a button must not change entitlements.
    actions.append(report.closest('.pro-report-only') || report);
  }
  const performance = el('button', 'rb-workspace-secondary', 'Andamento immobili · Pro', 'Property performance · Pro');
  performance.type = 'button';
  performance.addEventListener('click', () => win.openPropertyPerformance?.());
  actions.append(performance, el('small', '', 'Scegli analisi, immobile e periodo prima di scaricare. I PDF sono riservati a Pro.', 'Choose the analysis, property and period before downloading. PDFs require Pro.'));
  const helper = root.getElementById('report-helper-text');
  if (helper) actions.append(helper);
  hero.append(intro, actions);
  const nav = el('div', 'rb-workspace-tabs');
  nav.setAttribute('role', 'tablist');
  nav.dataset.itAriaLabel='Scenari e portafoglio';
  nav.dataset.enAriaLabel='Scenarios and portfolio';
  nav.setAttribute('aria-label', win.currentLang === 'en' ? nav.dataset.enAriaLabel : nav.dataset.itAriaLabel);
  const portfolio = el('section', 'rb-workspace-panel'); portfolio.id = 'rb-workspace-portfolio';
  const scenarios = el('section', 'rb-workspace-panel'); scenarios.id = 'rb-workspace-scenarios';
  const panels = [portfolio, scenarios];
  const labels = [['Portafoglio confermato', 'Confirmed portfolio'], ['Simulazioni salvate', 'Saved simulations']];
  const tabs = panels.map((panel, index) => {
    panel.setAttribute('role', 'tabpanel');
    const button = el('button', '', ...labels[index]); button.type = 'button'; button.id = `${panel.id}-tab`;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id); panel.setAttribute('aria-labelledby', button.id);
    nav.append(button); return button;
  });
  function select(index, focus = false) {
    panels.forEach((panel, i) => { panel.hidden = i !== index; tabs[i].setAttribute('aria-selected', String(i === index)); tabs[i].tabIndex = i === index ? 0 : -1; });
    if (focus) tabs[index].focus();
    win.dispatchEvent(new Event('resize'));
  }
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); select(event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index, true);
    });
  });
  portfolio.append(el('p', 'rb-workspace-explainer', 'Qui trovi solo gli investimenti confermati che contribuiscono ai totali. Le simulazioni alternative restano nella vista accanto.', 'Only confirmed investments contribute to these totals. Alternative simulations stay in the adjacent view.'));
  for (const id of ['portfolio-performance', 'portfolio-manager']) { const node = root.getElementById(id); if (node) portfolio.append(node); }
  scenarios.append(el('h3', '', 'Scegli lo scenario da analizzare', 'Choose a scenario to review'), el('p', 'rb-workspace-explainer', 'Ogni scheda indica se lo scenario è nel portafoglio e se è collegato al PMS. Apri il report dalla scheda per usare proprio quella simulazione.', 'Each card shows whether the scenario belongs to the portfolio and is linked to PMS. Open its report to use that exact simulation.'));
  for (const id of ['pagination-info', 'analysis-list']) { const node = root.getElementById(id); if (node) scenarios.append(node); }
  const advanced = el('details', 'rb-workspace-advanced');
  advanced.append(el('summary', '', 'Approfondimenti, grafici e strumenti', 'Insights, charts and tools'));
  const grid = main.querySelector('.dashboard-grid'); if (grid) advanced.append(grid);
  const overview = portfolio.querySelector('#portfolio-performance');
  // The legacy overview also contained optimizers and rankings after its KPI block.
  if (overview) for (const node of Array.from(overview.children).slice(1)) advanced.append(node);
  const basis = overview?.querySelector('.portfolio-capital-basis-note');
  if (basis) {
    const method = el('details', 'rb-scenario-details');
    method.append(el('summary', '', 'Come leggere i totali del portafoglio', 'How to read portfolio totals'), basis);
    overview.append(method);
  }
  for (const node of Array.from(secondary.children)) {
    const heading = node.querySelector('h3');
    if (['Livello strategico', '📊 Archivio delle simulazioni'].includes(heading?.dataset.it)) node.remove();
  }
  // Secondary content keeps its original IDs and listeners, inside one disclosure.
  while (secondary.firstChild) advanced.append(secondary.firstChild);
  advanced.addEventListener('toggle', () => { if (advanced.open) win.dispatchEvent(new Event('resize')); });
  workspace.append(hero, nav, portfolio, scenarios, advanced);
  const note = main.querySelector('.rb-source-note'); if (note) note.remove();
  main.prepend(workspace);
  select(0);
}

if (typeof document !== 'undefined') {
  const mount = () => mountInvestmentWorkspace();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
}
