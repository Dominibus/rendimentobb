(function(){
  'use strict';
  const questions={
    guide:['Autopilot investimento: da dove inizio?','Investment Autopilot: where do I start?'],
    inputs:['Autopilot investimento: controlla i dati','Investment Autopilot: check inputs'],
    assumptions:['Autopilot investimento: quali ipotesi verificare?','Investment Autopilot: which assumptions should I check?'],
    next:['Autopilot investimento: prossimo passo','Investment Autopilot: next step']
  };
  window.rbInvestmentAutopilotQuestions=questions;
  window.rbBuildInvestmentAutopilotResponse=function(message){
    const normalize=s=>String(s||'').trim().toLowerCase();
    const mode=Object.keys(questions).find(key=>questions[key].some(q=>normalize(q)===normalize(message)));
    if(!mode)return null;
    const isTool=Boolean(document.getElementById('price') && document.getElementById('analyze-btn'));
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
    if(isTool && window.simulationExecuted===true)actions.push(action('results','Vai ai risultati','Go to results'));
    if(mode==='guide' || !isTool)actions.push(action('dashboard','Apri Dashboard','Open dashboard'));
    const text=en=>{
      const lines=[en?'Investment Autopilot · Next step':'Autopilot investimento · Prossimo passo'];
      if(mode==='assumptions'){
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
      suggestionsIT:mode==='assumptions'?[questions.inputs[0]]:[questions.assumptions[0]],
      suggestionsEN:mode==='assumptions'?[questions.inputs[1]]:[questions.assumptions[1]]};
  };
})();
