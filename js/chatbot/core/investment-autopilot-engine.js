(function(){
  'use strict';
  const questions={
    guide:['Autopilot investimento: da dove inizio?','Investment Autopilot: where do I start?'],
    inputs:['Autopilot investimento: controlla i dati','Investment Autopilot: check inputs'],
    assumptions:['Autopilot investimento: quali ipotesi verificare?','Investment Autopilot: which assumptions should I check?'],
    next:['Autopilot investimento: prossimo passo','Investment Autopilot: next step'],
    results:['Autopilot investimento: leggi la mia analisi','Investment Autopilot: read my analysis']
  };
  window.rbInvestmentAutopilotQuestions=questions;
  window.rbBuildInvestmentAutopilotResponse=function(message){
    const normalize=s=>String(s||'').trim().toLowerCase();
    const mode=Object.keys(questions).find(key=>questions[key].some(q=>normalize(q)===normalize(message)));
    if(!mode)return null;
    const isTool=Boolean(document.getElementById('price') && document.getElementById('analyze-btn'));
    let analysis={status:'missing'};
    if(isTool && typeof window.rbGetInvestmentAnalysisState==='function'){
      try{analysis=window.rbGetInvestmentAnalysisState();}catch(_){analysis={status:'unavailable'};}
    }
    const number=id=>{const raw=document.getElementById(id)?.value;return raw==null || String(raw).trim()===''?null:Number(raw);};
    const values={price:number('price'),equity:number('equity'),priceNight:number('priceNight'),expenses:number('expenses'),occupancy:number('occupancy')};
    const checks=[
      [values.price===null || !Number.isFinite(values.price) || values.price<=0,'Inserisci un prezzo immobile maggiore di zero.','Enter a property price greater than zero.','price'],
      [values.equity===null || !Number.isFinite(values.equity) || values.equity<0,'Controlla il capitale proprio: serve un importo non negativo.','Check equity: enter a non-negative amount.','equity'],
      [Number.isFinite(values.price) && Number.isFinite(values.equity) && values.equity>values.price,'Il capitale supera il prezzo immobile: verifica gli importi e quali costi includono.','Equity exceeds the property price: check the amounts and included costs.','equity'],
      [values.priceNight===null || !Number.isFinite(values.priceNight) || values.priceNight<=0,'Inserisci una tariffa notte maggiore di zero.','Enter a nightly rate greater than zero.','priceNight'],
      [values.expenses===null || !Number.isFinite(values.expenses) || values.expenses<0,'Inserisci i costi mensili in euro. Zero è un’ipotesi da verificare.','Enter monthly costs in euros. Zero is an assumption to verify.','expenses'],
      [values.expenses===0,'Costi mensili a zero: verifica pulizie, utenze, commissioni e manutenzione.','Monthly costs are zero: check cleaning, utilities, fees and maintenance.','expenses'],
      [values.occupancy===null || !Number.isFinite(values.occupancy) || values.occupancy<0 || values.occupancy>100,'Controlla l’occupazione: deve essere tra 0 e 100%.','Check occupancy: it must be between 0 and 100%.','occupancy']
    ].filter(c=>c[0]);
    const action=(target,it,en,field)=>({type:'open_investment_section',target,labelIT:it,labelEN:en,...(field?{field}:{})});
    const actions=isTool
      ? [action('inputs',checks.length?'Correggi i dati':'Rivedi i dati',checks.length?'Fix inputs':'Review inputs',checks[0]?.[3] || 'price'),action('analysis','Avvia / aggiorna analisi','Run / update analysis')]
      : [action('simulator','Apri simulatore','Open simulator')];
    if(isTool && analysis.status==='current')actions.push(action('results','Vai ai risultati','Go to results'));
    if(mode==='guide' || !isTool)actions.push(action('dashboard','Apri Dashboard','Open dashboard'));
    const text=en=>{
      const lines=[en?'Investment Autopilot · Next step':'Autopilot investimento · Prossimo passo'];
      if(isTool && (mode==='results' || mode==='next')){
        if(analysis.status==='current'){
          const metrics=analysis.metrics;
          const locale=en?'en-GB':'it-IT';
          const currency=value=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR',useGrouping:true,maximumFractionDigits:2}).format(value);
          const percent=value=>new Intl.NumberFormat(locale,{minimumFractionDigits:1,maximumFractionDigits:1}).format(value)+'%';
          const decimal=value=>new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(value);
          const time=new Date(analysis.calculatedAt).toLocaleString(locale);
          lines.push((en?'Current simulator analysis':'Analisi corrente del simulatore')+(analysis.city?' · '+analysis.city:'')+' · '+time);
          lines.push((metrics.roiBasis==='equity'?(en?'Return on equity: ':'ROI sul capitale proprio: '):(en?'Property ROI: ':'ROI immobile: '))+percent(metrics.roi));
          lines.push((en?'Simulated annual cashflow after debt: ':'Cashflow annuo simulato dopo mutuo: ')+currency(metrics.annualCashflow),
            (en?'Monthly average: ':'Media mensile: ')+currency(metrics.monthlyCashflow));
          if(analysis.tier==='paid'){
            if(metrics.equity!==null)lines.push((en?'Equity used by the calculation: ':'Capitale proprio usato dal calcolo: ')+currency(metrics.equity));
            if(metrics.annualRevenue!==null)lines.push((en?'Simulated annual revenue: ':'Ricavi annui simulati: ')+currency(metrics.annualRevenue));
            if(metrics.risk!==null)lines.push((en?'Model risk index: ':'Indice rischio del modello: ')+decimal(metrics.risk)+'/100');
            if(metrics.annualDebtService>0 && metrics.dscr!==null){
              lines.push('DSCR: '+decimal(metrics.dscr));
              if(metrics.dscr<1)lines.push(en?'Operating income does not cover the modelled debt payments. Review revenue, costs and financing.':'Il reddito operativo non copre le rate nello scenario. Rivedi ricavi, costi e finanziamento.');
            }
          }
          lines.push(metrics.annualCashflow<0
            ?(en?'The scenario has a cashflow deficit. Start by reviewing rate, occupancy, costs and debt.':'Lo scenario ha un disavanzo di cassa. Parti da tariffa, occupazione, costi e mutuo.')
            :metrics.annualCashflow===0
              ?(en?'The scenario breaks even; it leaves no buffer for unforeseen costs.':'Lo scenario è in pareggio: non lascia margine per imprevisti.')
              :(en?'Cashflow is positive under the entered assumptions. Run a separate analysis with lower revenue to test the buffer.':'Il cashflow è positivo nelle ipotesi inserite. Esegui un’analisi separata con ricavi inferiori per verificarne il margine.'));
          if(metrics.roiBasis==='property')lines.push(en?'This ROI uses the purchase price as its denominator; it is not return on equity.':'Questo ROI usa il prezzo d’acquisto come denominatore; non è il ROI sul capitale proprio.');
          lines.push(en?'Source: the completed simulator calculation with unchanged inputs. These are estimates, not verified operating results.':'Fonte: calcolo completato nel simulatore con dati invariati. Sono stime, non risultati operativi verificati.');
        }else{
          lines.push(analysis.status==='stale'
            ?(en?'Inputs, location or account have changed since the analysis. Recalculate before reading the results.':'Dati, località o account sono cambiati dopo l’analisi. Ricalcola prima di leggere i risultati.')
            :analysis.status==='pending'
              ?(en?'The analysis or account is still loading. Wait until it completes.':'L’analisi o l’account si sta ancora caricando. Attendi il completamento.')
              :(en?'Run an analysis with the current inputs first. A PDF or an earlier stored analysis is not used here.':'Avvia prima un’analisi con i dati attuali. Qui non viene usato un PDF o un precedente risultato salvato.'));
        }
      }else if(mode==='assumptions'){
        lines.push(en?'Check before deciding:':'Da verificare prima di decidere:',
          en?'1. Nightly rate and occupancy: use comparable properties and seasonality. Benchmarks are indicative.':'1. Tariffa e occupazione: confronta immobili simili e stagionalità. I benchmark di mercato sono indicativi.',
          en?'2. Included costs, financing and taxes: Avoid counting costs twice.':'2. Costi inclusi, finanziamento e imposte: evita di conteggiare due volte una spesa.',
          en?'3. Run a separate simulation with lower occupancy or rate, keeping costs unchanged. Verify the property and local requirements.':'3. Esegui una simulazione separata con occupazione o tariffa più bassa, a parità di costi. Verifica immobile e requisiti locali.');
      }else if(!isTool || mode==='guide'){
        lines.push(en?'1. Open the simulator and choose the location.':'1. Apri il simulatore e scegli la località.',
          en?'2. Enter price, equity, nightly rate, occupancy and monthly costs.':'2. Inserisci prezzo, capitale, tariffa, occupazione e costi mensili.',
          en?'3. Run the analysis; use the dashboard to manage properties and bookings after signing in.':'3. Avvia l’analisi; per gestire strutture e prenotazioni, accedi alla Dashboard.');
      }else if(mode==='inputs'){
        lines.push(...(checks.length?checks.map(c=>c[en?2:1]):[en?'No missing or out-of-range values found in these five fields. This does not validate the investment.':'Nessun valore mancante o fuori intervallo rilevato in questi cinque campi. Questo non convalida l’investimento.']),
          en?'After changes, run the analysis again to refresh the estimates.':'Dopo le modifiche, avvia nuovamente l’analisi per aggiornare le stime.');
      }else{
        lines.push(checks.length?(en?'Review the reported fields before running the analysis.':'Rivedi i campi segnalati prima di avviare l’analisi.'):(en?'Run or update the analysis with the current inputs, then review results and assumptions.':'Avvia o aggiorna l’analisi con i dati attuali, poi rivedi risultati e ipotesi.'));
      }
      lines.push(en?'Shortcuts open sections. You choose when to change inputs and run calculations; estimates are not guaranteed returns.':'Le scorciatoie aprono le sezioni. Decidi tu quando modificare i dati e avviare i calcoli; le stime non sono rendimenti garantiti.');
      return lines.join('\n\n');
    };
    return {type:'investment_autopilot',confidence:1,textIT:text(false),textEN:text(true),actions,
      suggestionsIT:mode==='assumptions'?[questions.inputs[0]]:[questions.assumptions[0],...(isTool && mode!=='results'?[questions.results[0]]:[])],
      suggestionsEN:mode==='assumptions'?[questions.inputs[1]]:[questions.assumptions[1],...(isTool && mode!=='results'?[questions.results[1]]:[])]};
  };
})();
