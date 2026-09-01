(function(){
  "use strict";

  const stopWords = new Set([
    "a", "ad", "al", "alla", "alle", "anche", "che", "con", "da",
    "dal", "dalla", "dei", "del", "della", "di", "e", "gli", "ha",
    "ho", "i", "il", "in", "io", "la", "le", "lo", "ma", "mi",
    "nel", "nella", "non", "o", "per", "piu", "se", "sono", "su",
    "the", "a", "an", "and", "are", "can", "do", "for", "from",
    "how", "i", "in", "is", "it", "my", "of", "on", "or", "the",
    "to", "what", "with"
  ]);

  const conceptTerms = {
    roi: [
      "roi", "rendimento", "redditivita", "ritorno investimento",
      "quanto rende", "far rendere", "guadagno percentuale", "return investment"
    ],
    cashflow: [
      "cashflow", "cash flow", "flusso cassa", "utile", "profitto netto",
      "guadagno mensile", "resta in tasca", "rimane in tasca", "dopo le spese",
      "entrate uscite", "net income", "monthly profit"
    ],
    costs: [
      "costi", "spese", "uscite", "commissioni", "tasse", "manutenzione",
      "pulizie", "operating costs", "expenses"
    ],
    risk: [
      "rischio", "rischioso", "sicurezza", "sicuro", "perdere", "perdita",
      "sostenibile", "sostenibilita", "peggio del previsto", "risk", "safe"
    ],
    mortgage: [
      "mutuo", "banca", "rata", "finanziamento", "prestito", "anticipo",
      "soldi miei", "capitale proprio", "leva", "ltv", "dscr", "mortgage", "loan"
    ],
    occupancy: [
      "occupazione", "notti vendute", "notti devo vendere", "riempire",
      "prenotazioni", "camere occupate", "occupancy", "booked nights"
    ],
    breakEven: [
      "break even", "break-even", "pareggio", "punto pareggio", "non perderci",
      "rientrare investimento", "recuperare investimento", "coprire i costi"
    ],
    market: [
      "mercato", "citta", "zona", "quartiere", "localita", "dove comprare",
      "dove investire", "roma", "milano", "napoli", "firenze", "torino",
      "bologna", "venezia", "palermo", "market", "city", "area", "location"
    ],
    comparison: [
      "confronta", "confronto", "paragona", "differenza", "meglio tra",
      "rispetto a", "versus", "compare", "comparison", "better between"
    ],
    improvement: [
      "migliorare", "aumentare", "ottimizzare", "far rendere di piu",
      "guadagnare di piu", "ridurre i costi", "improve", "optimize", "increase"
    ],
    investmentDecision: [
      "conviene", "vale la pena", "comprare", "acquistare", "investire",
      "sensato", "sta in piedi", "buon affare", "worth it", "should i buy"
    ],
    supportLogin: [
      "non riesco ad entrare", "non riesco ad accedere", "entrare profilo",
      "accedere account", "password dimenticata", "credenziali", "login",
      "sign in", "cannot access", "forgot password"
    ],
    subscription: [
      "abbonamento", "piano pro", "piano investor", "premium", "upgrade",
      "disdire", "subscription", "pricing plan"
    ],
    best: [
      "migliore", "miglior", "piu conveniente", "piu redditizio", "rende di piu",
      "best", "most profitable"
    ],
    originalSimulation: [
      "simulazione originale", "simulazione iniziale", "scenario originale",
      "scenario iniziale", "dati originali", "dati iniziali", "scenario di partenza",
      "simulazione di partenza", "baseline", "original simulation",
      "initial simulation", "base simulation", "original scenario",
      "initial scenario", "baseline data", "original data", "starting scenario"
    ]
  };

  const typoLexicon = [
    "quanto", "rendimento", "rischio", "cashflow", "occupazione", "mutuo",
    "mercato", "investimento", "profitto", "spese", "accedere", "password",
    "confronta", "migliorare", "conviene", "prenotazioni"
  ];

  function stripAccents(value){
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function editDistanceAtMostOne(a, b){
    if(a === b){
      return true;
    }

    if(Math.abs(a.length - b.length) > 1){
      return false;
    }

    // Common mobile typo: two adjacent letters are swapped (e.g. qunato).
    if(a.length === b.length){
      for(let index = 0; index < a.length - 1; index++){
        if(
          a[index] === b[index + 1] &&
          a[index + 1] === b[index] &&
          a.slice(0, index) === b.slice(0, index) &&
          a.slice(index + 2) === b.slice(index + 2)
        ){
          return true;
        }
      }
    }

    let i = 0;
    let j = 0;
    let edits = 0;

    while(i < a.length && j < b.length){
      if(a[i] === b[j]){
        i++;
        j++;
        continue;
      }

      edits++;
      if(edits > 1){
        return false;
      }

      if(a.length > b.length){
        i++;
      }else if(b.length > a.length){
        j++;
      }else{
        i++;
        j++;
      }
    }

    return edits + (i < a.length || j < b.length ? 1 : 0) <= 1;
  }

  function correctCommonTypos(value){
    return value
      .split(" ")
      .map(token => {
        if(token.length < 5 || typoLexicon.includes(token)){
          return token;
        }

        const replacement = typoLexicon.find(term =>
          editDistanceAtMostOne(token, term)
        );

        return replacement || token;
      })
      .join(" ");
  }

  function normalizeText(value){
    const normalized = stripAccents(value)
      .toLowerCase()
      .replace(/[’'`´]/g, " ")
      .replace(/[^a-z0-9%€]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return correctCommonTypos(normalized);
  }

  function meaningfulTokens(value){
    return normalizeText(value)
      .split(" ")
      .filter(token => token.length > 2 && !stopWords.has(token));
  }

  function phraseMatches(text, phrase){
    const normalizedPhrase = normalizeText(phrase);
    if(!normalizedPhrase){
      return false;
    }

    if(text.includes(normalizedPhrase)){
      return true;
    }

    const phraseTokens = meaningfulTokens(normalizedPhrase);
    const textTokens = new Set(meaningfulTokens(text));

    return phraseTokens.length > 0 &&
      phraseTokens.every(token => textTokens.has(token));
  }

  function detectConcepts(message){
    const text = normalizeText(message);
    const concepts = [];
    const scores = {};

    Object.entries(conceptTerms).forEach(([concept, terms]) => {
      let score = 0;

      terms.forEach(term => {
        if(phraseMatches(text, term)){
          score += normalizeText(term).includes(" ") ? 2 : 1;
        }
      });

      if(score > 0){
        concepts.push(concept);
        scores[concept] = score;
      }
    });

    return {text, concepts, scores};
  }

  function analyzeMessage(message, entities = {}){
    const analysis = detectConcepts(message);
    const found = concept => analysis.concepts.includes(concept);
    const candidates = [];

    const add = (intent, score, priority, category) => {
      candidates.push({intent, score, priority, category});
    };

    if(found("supportLogin")){
      // The response engine already knows how to render knowledge entries
      // through the education route. Keep account support separate from plans.
      add("education", 10, 99, "support");
    }

    if(found("originalSimulation")){
      add("simulation_summary", 10, 101, "analysis");
    }

    if(found("market") && found("best")){
      add("best_city", 9, 94, "market");
    }

    if(found("market") && found("comparison")){
      add("market_comparison", 9, 93, "market");
    }

    if(found("improvement")){
      add("improvement_advisor", 8, 92, "advisor");
    }

    if(found("mortgage")){
      add("mortgage_analysis", 7, 86, "mortgage");
    }

    if(found("breakEven")){
      add("roi_analysis", 7, 84, "finance");
    }

    if(found("cashflow") || (found("costs") && /mese|mensil|monthly/.test(analysis.text))){
      add("cashflow_analysis", 7, 83, "finance");
    }

    if(found("risk")){
      add("risk_analysis", 6, 82, "risk");
    }

    if(found("roi")){
      add("roi_analysis", 6, 81, "finance");
    }

    if(found("market") || entities.city){
      add("market_analysis", 5, 76, "market");
    }

    if(found("investmentDecision")){
      add("investment_advisor", 7, 88, "advisor");
    }

    if(found("subscription")){
      add("subscriptions", 6, 80, "business");
    }

    candidates.sort((a, b) =>
      b.priority - a.priority || b.score - a.score
    );

    const best = candidates[0];
    if(!best){
      return {
        intent: null,
        confidence: 0,
        priority: 0,
        category: "semantic",
        concepts: analysis.concepts,
        normalizedText: analysis.text
      };
    }

    const forcedIntents = new Set([
      "education",
      "simulation_summary",
      "best_city",
      "market_comparison",
      "improvement_advisor",
      "mortgage_analysis",
      "cashflow_analysis"
    ]);

    return {
      intent: best.intent,
      confidence: Math.min(0.96, 0.72 + best.score * 0.025),
      priority: best.priority,
      category: best.category,
      concepts: analysis.concepts,
      normalizedText: analysis.text,
      force:
        forcedIntents.has(best.intent) ||
        (best.intent === "risk_analysis" && found("occupancy")) ||
        (best.intent === "roi_analysis" && found("breakEven")),
      alternatives: candidates.slice(1, 3)
    };
  }

  function matchKnowledge(message, knowledgeBase = {}, intent = {}){
    const semantic = analyzeMessage(message);
    const messageTokens = new Set(meaningfulTokens(message));
    const results = [];

    Object.entries(knowledgeBase).forEach(([key, item]) => {
      if(!Array.isArray(item?.keywords) || !item.keywords.length){
        return;
      }

      let exactPhraseScore = 0;
      let tokenScore = 0;

      item.keywords.forEach(keyword => {
        const normalizedKeyword = normalizeText(keyword);
        if(!normalizedKeyword){
          return;
        }

        if(normalizeText(message).includes(normalizedKeyword)){
          exactPhraseScore = Math.max(
            exactPhraseScore,
            normalizedKeyword.includes(" ") ? 8 : 5
          );
        }

        const keywordTokens = meaningfulTokens(normalizedKeyword);
        if(keywordTokens.length){
          const overlap = keywordTokens.filter(token =>
            messageTokens.has(token)
          ).length;
          tokenScore = Math.max(
            tokenScore,
            overlap / keywordTokens.length * 4
          );
        }
      });

      const keyTokens = meaningfulTokens(key.replace(/_/g, " "));
      const keyOverlap = keyTokens.filter(token =>
        messageTokens.has(token)
      ).length;

      const semanticWeight = Number(item.semanticWeight || 1);
      const priority = Number(item.priority || 1);
      const normalizedKey = normalizeText(
        key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ")
      );
      const itemType = normalizeText(item.type || item.category || "");
      let conceptBoost = 0;

      if(
        semantic.concepts.includes("supportLogin") &&
        (
          itemType === "support" ||
          /login|password|account|profilo|access/.test(normalizedKey)
        )
      ){
        conceptBoost += 7;
      }

      const conceptKeyGroups = {
        cashflow: /cashflow|cash flow|profitto netto/,
        breakEven: /break even|pareggio/,
        mortgage: /mutuo|mortgage|dscr|ltv|leva/,
        occupancy: /occupazione|occupancy|notti/,
        risk: /rischio|risk/,
        roi: /roi|rendimento/,
        market: /mercato|market|citta|city|zona/
      };

      Object.entries(conceptKeyGroups).forEach(([concept, matcher]) => {
        if(
          semantic.concepts.includes(concept) &&
          matcher.test(`${normalizedKey} ${itemType}`)
        ){
          conceptBoost += 3.5;
        }
      });

      // Prefer the canonical knowledge card when its key directly names the
      // detected concept, while still allowing synonyms to retrieve it.
      if(
        semantic.concepts.includes("cashflow") &&
        /^cashflow$/.test(normalizedKey.replace(/ /g, ""))
      ){
        conceptBoost += 5;
      }

      if(
        semantic.concepts.includes("breakEven") &&
        /break ?even|pareggio/.test(normalizedKey)
      ){
        conceptBoost += 6;
      }

      const relevance =
        exactPhraseScore +
        tokenScore +
        keyOverlap * 1.5 +
        conceptBoost +
        semanticWeight +
        Math.min(priority, 20) * 0.08;

      if(relevance >= 4.25){
        results.push({
          key,
          item,
          priority: relevance,
          sourcePriority: priority,
          relevance,
          semanticConcepts: semantic.concepts,
          intent: intent?.intent || semantic.intent || null
        });
      }
    });

    return results.sort((a, b) =>
      b.relevance - a.relevance || b.priority - a.priority
    );
  }

  window.rbNormalizeSemanticText = normalizeText;
  window.rbAnalyzeSemanticMessage = analyzeMessage;
  window.rbMatchKnowledge = matchKnowledge;
})();
