(function(){
  'use strict';
  const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const reply = (mode,it,en,questionsIT=[],questionsEN=[]) => ({type:'practical_guide',confidence:0.9,textIT:it,textEN:en,actions:[],suggestionsIT:questionsIT,suggestionsEN:questionsEN,metadata:{mode,source:'local_product_guidance',liveExternalData:false,automaticActions:false}});

  // Explicit capability questions precede statistical intents. No account records,
  // PDF content, external services or mutable caches are read here.
  window.rbBuildPracticalGuide = function(message){
    const q=normalize(message);
    if (/\b(pdf|brochure|documento|document|file allegato|uploaded file)\b/.test(q)) return null;
    const pms=/\bpms\b|prenot|booking|reservation|calendario|calendar|camere|rooms?|alloggio|property/.test(q);
    const shared=/condivis|shared|collegat.*disponibil|linked.*availab|casa intera|intero appartamento|whole (?:home|house)|entire (?:home|house)|multi.?room/.test(q);
    if(pms && shared && /disponibil|availab|blocc|blocch|overbooking|dopp|double|camere|rooms?/.test(q)){
      return reply('shared_inventory',
        'Casa intera e singole camere: serve una disponibilità condivisa.\n\nIl PMS attuale controlla le sovrapposizioni sullo stesso immobile; non gestisce un inventario collegato tra la casa intera e camere registrate come immobili diversi. Creare una scheda per stanza non blocca automaticamente la casa intera. I KPI assumono una unità disponibile per immobile.\n\nPrima di usare questa configurazione, definisci quali offerte impegnano la stessa capacità e verifica il calendario su tutte le unità interessate. Per vendere contemporaneamente casa intera e camere serve un sistema che supporti esplicitamente inventario condiviso; questa funzione resta da progettare qui. Non è presente una sincronizzazione automatica con i portali.\n\nVuoi gestire una sola unità per immobile oppure più camere collegate?',
        'A whole home and individual rooms require shared availability.\n\nThe current PMS checks overlaps within the same property; it does not manage linked inventory between a whole home and rooms registered as separate properties. A property record for each room does not automatically block the whole home. KPIs assume one available unit per property.\n\nBefore using this setup, define which offers consume the same capacity and check every affected calendar. Selling both a whole home and its rooms requires a system with explicit shared inventory support; this feature still needs to be designed here. Automatic channel synchronisation is unavailable.\n\nWill you manage one unit per property or several linked rooms?');
    }
    if(/(?:import|ripristin|reimport|restore).*(?:export|esport|archivio|archive)|(?:export|esport).*(?:import|ripristin|restore|backup)/.test(q) && /csv|prenot|booking|reservation/.test(q)){
      return reply('csv_portability',
        'Importazione ed esportazione hanno due scopi distinti.\n\n“Esporta prenotazioni CSV” scarica un archivio dei soggiorni visibili, con ID stabili e importi registrati. Non è un backup completo del PMS: non include documenti, contatti riservati, token ospite o tutte le attività operative.\n\nL’importazione usa il proprio modello CSV e un riferimento esterno stabile. Il CSV di archivio esportato non è accettato direttamente per il reimport: non posso promettere un ripristino completo. Usa l’anteprima del modello di importazione, verifica immobile, date, valuta e importi; i duplicati non vengono sovrascritti. Prima di una migrazione conserva anche una copia dei dati e verifica su un account di test.\n\nStai importando da un altro gestionale oppure vuoi poter ripristinare un tuo archivio?',
        'Import and export serve different purposes.\n\n“Export bookings CSV” downloads the visible stays with stable IDs and recorded amounts. It is not a full PMS backup: private contacts, documents, guest tokens and all operational tasks are not included.\n\nImport uses its own CSV template and a stable external reference. The exported archive CSV is not directly accepted for reimport, so I cannot promise a full restore. Use the import preview to check property, dates, currency and amounts; duplicates are not overwritten. Keep a copy of the original data and test any migration on a test account first.\n\nAre you importing from another management tool or looking to restore your own archive?');
    }
    const external=/meteo|weather|previsioni del tempo|tassi (?:di oggi|aggiornati)|current (?:mortgage )?rates|latest (?:mortgage )?rates|prezzi (?:di mercato )?aggiornati|live (?:market )?prices|dati.*tempo reale|real.?time (?:market|weather)|normativa aggiornata|latest regulations/.test(q);
    if(external){
      return reply('external_data',
        'Questa richiesta richiede dati esterni aggiornati che qui non posso verificare.\n\nL’assistente attuale usa regole locali e i dati disponibili nel portale; non consulta il web né un modello generativo remoto. I riferimenti per città sono esempi interni, non quotazioni aggiornate. Non invento meteo, tassi, disponibilità o norme attuali.\n\nPuoi riportare un dato verificato con fonte e data: ti aiuto a capire quali ipotesi cambiare e quali scenari confrontare nel simulatore. Per una tariffa, ad esempio, confronta uno scenario base con uno prudente mantenendo separati costi e occupazione.\n\nQuale dato vuoi confrontare e qual è la sua fonte?',
        'This question needs current external data that I cannot verify here.\n\nThe current assistant uses local rules and the data available in the portal; it does not browse the web or consult a remote generative model. City references are internal examples, not live market quotations. I will not invent weather, rates, availability or current regulations.\n\nProvide a verified input with its source and date, and I can help identify which assumptions to change and which scenarios to compare. For pricing, compare a base and a conservative case, keeping costs and occupancy distinct.\n\nWhich input do you want to compare, and what is its source?');
    }
    if(/(?:come|how|che tipo|what kind).*(?:ragion|reason|intelligenza|artificial intelligence)|(?:sei|are you).*(?:chatgpt|generativ|llm)|(?:api|modello|model).*(?:pagament|paid|generativ|usi|use)/.test(q)){
      return reply('assistant_scope',
        'L’assistente di RendimentoBB usa regole, motori di calcolo e risposte contestuali locali. Può riconoscere diverse formulazioni, collegare dati disponibili e proporre verifiche; non equivale a un modello generativo generale come ChatGPT.\n\nUna domanda nuova può essere scomposta in obiettivo, dati, vincoli e prossimo passo. Se mancano informazioni o capacità, devo dirlo e chiedere il dettaglio utile. Non sono attive consultazioni web o nuove API generative a pagamento in questa guida.',
        'RendimentoBB’s assistant uses local rules, calculation engines and contextual responses. It can recognise different phrasings, connect available facts and propose checks; it is not a general generative model such as ChatGPT.\n\nA new question can be broken down into goal, facts, constraints and next step. Missing information or unsupported capabilities must be stated explicitly. This guide does not add web browsing or paid generative APIs.');
    }
    // Compose practical advice from several recognised constraints, rather than
    // selecting a single unrelated city/ROI response. Never compute new figures.
    const asksPlan=/come (?:organizz|impost|affront|miglior)|come mi (?:organizz|regol)|da dove (?:part|iniz)|piano (?:pratico|operativo)|how (?:should|can|do) i|what should i|practical plan|help me plan/.test(q);
    const topics=[
      {match:/poco tempo|tempo limitato|da solo|da sola|little time|limited time|on my own|working alone/,it:'Tempo limitato: parti dalle attività con scadenza e dai dati mancanti; usa checklist e priorità di oggi prima delle ottimizzazioni.',en:'Limited time: start with due tasks and missing facts; use today’s checklist and priorities before optimisation.'},
      {match:/bassa stagione|poche prenot|notti vuote|low season|few bookings|empty nights/,it:'Domanda debole: controlla prima completezza del calendario e giorni disponibili. Confronta tariffa e occupazione in scenari distinti; una riduzione di prezzo non garantisce più prenotazioni.',en:'Weak demand: first check calendar completeness and available days. Compare rate and occupancy in separate scenarios; a price reduction does not guarantee more bookings.'},
      {match:/pulizi|cleaning|turnover/,it:'Pulizie e turnover: verifica date, incarichi e stato delle attività. Distingui i costi ricorrenti da eventuali importi già inclusi, evitando il doppio conteggio.',en:'Cleaning and turnover: check dates, assignees and task status. Distinguish recurring costs from amounts already included, avoiding double counting.'},
      {match:/costi (?:alti|elevati|in aumento)|spese (?:alte|elevate)|high costs|rising costs/,it:'Costi elevati: separa costi fissi, costi legati ai soggiorni, commissioni e debito. Ricalcola con ipotesi prudenti e controlla cashflow, senza confondere ricavi prenotati e utile.',en:'High costs: separate fixed costs, stay-related costs, fees and debt. Recalculate conservative assumptions and check cashflow; booked revenue is not profit.'},
      {match:/recension|reviews?|reputazion/,it:'Esperienza ospite: raccogli problemi ricorrenti e interventi verificabili. Il portale non legge automaticamente le recensioni dei canali: riporta esempi senza dati personali.',en:'Guest experience: collect recurring issues and concrete improvements. The portal does not automatically read channel reviews; provide examples without personal data.'}
    ].filter(t=>t.match.test(q));
    const explicitDomain=/b&b|pms|immobil|prenot|soggiorn|ospit|affitt|hospitality|property|bookings?|guests?|rental/.test(q);
    if(asksPlan && topics.length && explicitDomain){
      if(window.rbPDFConversationDocumentId && !/\bpms\b/.test(q))return null;
      const compose=en=>[
        en?'A practical plan based on the constraints in your question:':'Un piano pratico basato sui vincoli che hai descritto:',
        ...topics.slice(0,3).map((t,i)=>`${i+1}. ${en?t.en:t.it}`),
        en?'Source: local operating guidance, not verified account performance or live market data. No changes have been made.':'Fonte: guida operativa locale, non una verifica dei risultati del tuo account o del mercato attuale. Non è stata eseguita alcuna modifica.',
        en?'Choose one measurable goal first. Are you trying to save time, reduce costs or improve booking coverage?':'Scegli prima un obiettivo misurabile. Vuoi risparmiare tempo, ridurre i costi o migliorare la copertura delle prenotazioni?'
      ].join('\n\n');
      return reply('constraint_plan',compose(false),compose(true),['Cosa devo fare oggi nel PMS?','Autopilot investimento: quali ipotesi verificare?'],['What should I do today in the PMS?','Investment Autopilot: which assumptions should I check?']);
    }
    return null;
  };
  window.rbBuildGuidedClarification=function(){
    return reply('clarification',
      'Non ho una risposta verificata per questa richiesta così formulata. Per costruire un percorso utile, dimmi: quale risultato vuoi ottenere, se stai valutando un immobile o gestendo soggiorni e quale dato o vincolo ti manca.\n\nPosso guidarti usando i calcoli e le funzioni disponibili; non recupero informazioni esterne aggiornate e non eseguo operazioni al posto tuo.',
      'I do not have a verified answer to the request as phrased. To build a useful path, tell me your intended outcome, whether you are evaluating a property or managing stays, and the missing fact or constraint.\n\nI can guide you using available calculations and features; I do not retrieve live external information or perform operations for you.',
      ['Autopilot investimento: da dove inizio?','Cosa devo fare oggi nel PMS?'],['Investment Autopilot: where do I start?','What should I do today in the PMS?']);
  };
})();
