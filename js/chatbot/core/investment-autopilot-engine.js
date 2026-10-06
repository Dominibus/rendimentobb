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
      [values.price===null || !Number.isFinite(values.price) || values.price<=0,'Inserisci un prezzo immobile maggiore di zero.','Enter a property price greater than zero.'],
      [values.equity===null || !Number.isFinite(values.equity) || values.equity<0,'Controlla il capitale proprio: serve un importo non negativo.','Check equity: enter a non-negative amount.'],
      [Number.isFinite(values.price) && Number.isFinite(values.equity) && values.equity>values.price,'Il capitale supera il prezzo immobile: verifica gli importi e quali costi includono.','Equity exceeds the property price: check the amounts and included costs.'],
      [values.priceNight===null || !Number.isFinite(values.priceNight) || values.priceNight<=0,'Inserisci una tariffa notte maggiore di zero.','Enter a nightly rate greater than zero.'],
      [values.expenses===null || !Number.isFinite(values.expenses) || values.expenses<0,'Inserisci i costi mensili in euro. Zero è un’ipotesi da verificare.','Enter monthly costs in euros. Zero is an assumption to verify.'],
      [values.expenses===0,'Costi mensili a zero: verifica pulizie, utenze, commissioni e manutenzione.','Monthly costs are zero: check cleaning, utilities, fees and maintenance.'],
      [values.occupancy===null || !Number.isFinite(values.occupancy) || values.occupancy<0 || values.occupancy>100,'Controlla l’occupazione: deve essere tra 0 e 100%.','Check occupancy: it must be between 0 and 100%.']
    ].filter(c=>c[0]);
    const text=en=>{
      const lines=[en?'Investment Autopilot · Your next step':'Autopilot investimento · Il tuo prossimo passo'];
      if(mode==='guide' || (!isTool && mode!=='assumptions')){
        lines.push(en?'1. Open the simulator and choose your location.':'1. Apri il simulatore e scegli la località.',en?'2. Enter purchase price, equity, nightly rate, occupancy and monthly costs.':'2. Inserisci prezzo, capitale, tariffa notte, occupazione e costi mensili.',en?'3. Run the analysis and read the results available with your plan.':'3. Avvia l’analisi e leggi i risultati disponibili per il tuo piano.',en?'4. Open the dashboard to organize your properties and bookings.':'4. Apri la Dashboard per organizzare strutture e prenotazioni.');
      }else if(mode==='inputs'){
        lines.push(en?'Checks on the values currently entered in the form:':'Controlli sui valori attualmente inseriti nel modulo:',...(checks.length?checks.map(c=>c[en?2:1]):[en?'No missing or out-of-range values found in these five fields. This does not validate the investment.':'Nessun valore mancante o fuori intervallo rilevato in questi cinque campi. Questo non convalida l’investimento.']),en?'After changing inputs, run the analysis again: previous results may refer to different assumptions.':'Dopo aver modificato i dati, avvia nuovamente l’analisi: i risultati precedenti possono riferirsi a ipotesi diverse.');
      }else if(mode==='assumptions'){
        lines.push(en?'Before interpreting ROI and cash flow:':'Prima di interpretare ROI e cashflow:',en?'1. Check nightly rates and occupancy against comparable properties and seasonality. Market benchmarks are indicative.':'1. Verifica tariffa e occupazione rispetto a immobili comparabili e stagionalità. I benchmark di mercato sono indicativi.',en?'2. Check which costs the model includes: operations, commissions, financing, taxes, works and initial expenses. Avoid counting costs twice.':'2. Verifica quali costi include il modello: gestione, commissioni, finanziamento, imposte, lavori e spese iniziali. Evita di conteggiare due volte una spesa.',en?'3. Run a separate simulation with lower occupancy or a lower nightly rate and compare results using the same cost assumptions.':'3. Esegui una simulazione separata con occupazione o tariffa più bassa e confronta i risultati a parità di costi.',en?'4. Verify local requirements and the actual property before committing.':'4. Verifica i requisiti locali e l’immobile effettivo prima di impegnarti.');
      }else{
        lines.push(checks.length?(en?'Start with “Check inputs” and review the reported fields.':'Parti da “Controlla i dati” e rivedi i campi segnalati.'):(en?'Run or refresh the analysis using the current inputs.':'Avvia o aggiorna l’analisi con i dati attuali.'),en?'Read the results available with your plan, then verify the assumptions. Saving and PMS management remain explicit actions in the portal.':'Leggi i risultati disponibili per il tuo piano, poi verifica le ipotesi. Il salvataggio e la gestione PMS restano azioni esplicite nel portale.');
      }
      lines.push(en?'This guide does not change inputs, run calculations or certify profitability. It does not read a previous analysis as if it were current.':'Questa guida non modifica i dati, non esegue calcoli e non certifica la redditività. Non interpreta una vecchia analisi come se fosse attuale.');
      return lines.join('\n\n');
    };
    return {type:'investment_autopilot',confidence:1,textIT:text(false),textEN:text(true),suggestionsIT:[questions.inputs[0],questions.assumptions[0],questions.next[0]],suggestionsEN:[questions.inputs[1],questions.assumptions[1],questions.next[1]]};
  };
})();
