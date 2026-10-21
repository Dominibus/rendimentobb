import {journeyState} from './journey-state.js?v=20261020-rc160';

const host = document.getElementById('rb-journey-guide');
if (host) {
  const page = host.dataset.journey;
  const english = () => window.currentLang === 'en';
  const messages = {
    analysis: {
      missing:['Parti dalle ipotesi, un dato alla volta.','Start with your assumptions, one input at a time.','Scegli acquisto o immobile già posseduto. Completa tariffa, occupazione e costi; poi avvia il calcolo.','Choose purchase or an already owned property. Enter rate, occupancy and costs; then run the calculation.'],
      current:['La tua analisi è pronta da interpretare.','Your analysis is ready to interpret.','Autopilot può spiegare il calcolo completato con questi dati. Verifica le ipotesi prima di decidere.','Autopilot can explain the completed calculation with these inputs. Check the assumptions before deciding.'],
      stale:['Hai cambiato i dati: aggiorna l’analisi.','Your inputs changed: update the analysis.','I risultati precedenti non descrivono più lo scenario attuale. Ricalcola prima di chiedere la lettura ad Autopilot.','Previous results no longer describe the current scenario. Recalculate before asking Autopilot to interpret it.'],
      pending:['Attendi il completamento.','Wait for completion.','L’analisi o il profilo si sta caricando. La lettura sarà disponibile al termine.','The analysis or account is loading. Interpretation will be available when it finishes.']
    },
    pms: {
      loading:['Stiamo preparando il tuo pannello.','Preparing your dashboard.','Attendi il caricamento del profilo e dei dati prima di leggere le priorità.','Wait for your profile and data to load before reading priorities.'],
      demo:['Esplora la gestione con dati dimostrativi.','Explore management with demonstration data.','Questa vista usa esempi. Le priorità di Autopilot non rappresentano la tua attività reale.','This view uses examples. Autopilot priorities do not represent your real business.'],
      unavailable:['Prima verifica l’accesso al tuo PMS.','First check access to your PMS.','Non è disponibile una fotografia verificata del tuo account. Usa le sezioni del pannello per verificare accesso e caricamento.','A verified account snapshot is unavailable. Use the dashboard sections to check access and loading.'],
      'needs-refresh':['Aggiorna il riepilogo delle priorità.','Refresh the priorities summary.','La vista prenotazioni può essere filtrata o in aggiornamento. Premi una priorità Autopilot per rileggere i dati completi; questo stato non segnala una perdita di accesso.','The booking view may be filtered or updating. Choose an Autopilot priority to reload complete data; this state does not indicate loss of access.'],
      empty:['Il primo passo è aggiungere una struttura.','Start by adding a property.','Apri la sezione immobili del pannello. Dopo aver creato la struttura potrai organizzare le prenotazioni.','Open the properties section of the dashboard. After creating a property you can organise bookings.'],
      'no-bookings':['La struttura c’è. Ora organizza le prenotazioni.','Your property is ready. Now organise bookings.','Apri prenotazioni e calendario. Autopilot potrà riassumere le priorità sui dati disponibili.','Open bookings and calendar. Autopilot can summarise priorities using the available data.'],
      ready:['Concentrati sulle prossime attività.','Focus on your next tasks.','Chiedi ad Autopilot le priorità di oggi o dei prossimi 7 giorni: aggiornerà i dati prima di rispondere.','Ask Autopilot for today’s or the next 7 days’ priorities: it will refresh the data before answering.']
    }
  };
  const sources = {
    inputs:['Dati del modulo · nessun risultato corrente','Form inputs · no current result'],
    simulation:['Fonte: simulazione corrente · stime','Source: current simulation · estimates'],
    demo:['Fonte: dati dimostrativi','Source: demonstration data'],
    account:['Fonte: fotografia PMS del tuo account','Source: your account’s PMS snapshot'],
    none:['Dati account non ancora verificati','Account data not yet verified']
  };
  let state, busy = false, notice = '';
  function button(label, action, secondary = false) {
    const el = document.createElement('button');
    el.type = 'button'; el.textContent = label; el.dataset.journeyAction = action;
    if (secondary) el.className = 'rbj-secondary';
    el.disabled = busy || state.action === 'wait';
    return el;
  }
  function render() {
    const en = english(), t = (it,eng) => en ? eng : it;
    let analysis;
    try {analysis = window.rbGetInvestmentAnalysisState?.();} catch {analysis = null;}
    state = journeyState({page,analysis,pms:window.rbPMSData,uid:window.currentUser?.uid,access:window.getUserAccess?.() || {isLoading:page === 'pms'}});
    const access = window.getUserAccess?.() || {};
    const needsTrial = page === 'analysis' && !access.isLoading && !(access.isAdmin || access.isPro || access.isInvestor);
    const copy = messages[state.area][state.status];
    host.dataset.state = state.status;
    const intro = document.createElement('div'); intro.className = 'rbj-copy';
    const kicker = document.createElement('p'); kicker.className = 'rbj-kicker'; kicker.textContent = t('Autopilot · Il tuo prossimo passo','Autopilot · Your next step');
    const title = document.createElement('h2'); title.textContent = copy[en ? 1 : 0];
    const body = document.createElement('p'); body.textContent = copy[en ? 3 : 2];
    if(needsTrial) body.textContent = t('Il simulatore Free mostra i risultati di base. La lettura con Autopilot richiede Investor o Pro; puoi verificare l’idoneità alla prova Investor di 30 giorni, senza carta e con PDF esclusi.','The Free simulator shows basic results. Autopilot interpretation requires Investor or Pro; check eligibility for the 30-day Investor trial, with no card and PDFs excluded.');
    const source = document.createElement('small'); source.textContent = sources[state.source][en ? 1 : 0];
    intro.append(kicker,title,body,source);
    const actions = document.createElement('div'); actions.className = 'rbj-actions';
    if (page === 'analysis') {
      actions.append(button(needsTrial ? t('Scopri la prova per usare Autopilot','See the trial to use Autopilot') : state.action === 'results' ? t('Spiegami i risultati','Explain the results') : state.action === 'recalculate' ? t('Vai al ricalcolo','Go to recalculate') : t('Controlla i dati con Autopilot','Check inputs with Autopilot'),state.action === 'results' ? 'results' : state.action === 'recalculate' ? 'recalculate' : 'inputs'));
      actions.append(button(needsTrial ? t('Autopilot: accesso richiesto','Autopilot: access required') : t('Quali ipotesi verificare?','Which assumptions should I check?'),'assumptions',true));
    } else {
      actions.append(button(t('Priorità di oggi','Today’s priorities'),'daily'),button(t('Prossimi 7 giorni','Next 7 days'),'week',true));
    }
    const status = document.createElement('p'); status.className = 'rbj-notice'; status.setAttribute('role','status'); status.textContent = notice;
    const note = document.createElement('small'); note.className = 'rbj-note'; note.textContent = t('L’assistente ti guida. Modifiche e calcoli restano una tua scelta.','The assistant guides you. You choose when to change data and run calculations.');
    actions.append(status,note); host.replaceChildren(intro,actions);
  }
  host.addEventListener('click',async event => {
    const target = event.target.closest('[data-journey-action]');
    if (!target || busy) return;
    // Recheck account and freshness at click time; never reuse a previous result.
    const action = target.dataset.journeyAction;
    render();
    if (state.action === 'wait') return;
    if (action === 'recalculate' || (action === 'results' && state.status !== 'current')) {
      window.rbOpenInvestmentAction?.({type:'open_investment_section',target:'analysis'}); return;
    }
    const fn = page === 'analysis' ? window.rbAskInvestmentAutopilot : window.rbAskPMSAutopilot;
    notice = ''; busy = true; render();
    try {
      if (typeof fn !== 'function') throw new Error('loading');
      await fn(action);
    } catch {
      notice = english() ? 'The assistant is unavailable. Try again shortly; you can continue using the page.' : 'L’assistente non è disponibile. Riprova tra poco; puoi continuare a usare la pagina.';
    } finally {busy = false; render();}
  });
  for (const type of ['input','change','rb_language_changed','rb_auth_ready','rb_plan_ready']) document.addEventListener(type,render);
  for (const type of ['rb_pms_data_updated','rb_investment_state_updated','rb_auth_ready','rb_plan_ready']) window.addEventListener(type,render);
  render();
}
