(function(){
  'use strict';
  window.rbNormalizeAIQuery=function(input){
    const original=String(input || '').trim();
    let text=original;
    const corrections=[];
    const replace=(pattern,to)=>{
      text=text.replace(pattern,from=>{corrections.push({from,to});return to;});
    };
    // Restrict spelling corrections to domain words. Never change numbers or names.
    const financial=/\b(roi|rendimento|investiment\w*|return|equity|capitale|cash\s?flow|spieg\w*|signific\w*|quanto|calcol\w*|explain|what|percent\w*|qual|quale|mio|my)\b|%/i.test(original);
    const personal=/\b(ospite|guest|nome|name|chiamo|called|signor|mr|amico|friend)\b/i.test(original);
    if(financial && !personal) replace(/\broy\b/gi,'roi');
    replace(/\br[.]o[.]i[.]?/gi,'roi');
    replace(/\b(cashflw|cashfolw|cashflo|cashflou|cashflwo|cashfow|cash-flow|cashflusso)\b/gi,'cashflow');
    // RC206: observed mobile-style typo; keep personal names untouched.
    if(!personal) replace(/\bcasflow\b/gi,'cashflow');
    replace(/\bcapitale\s+propio\b/gi,'capitale proprio');
    replace(/\b(prenotazone|prenotazzone|prenottazione)\b/gi,'prenotazione');
    replace(/\bprenottazioni\b/gi,'prenotazioni');
    replace(/\b(calndario|calendrio|calenadrio)\b/gi,'calendario');
    replace(/\b(calender|calandar)\b/gi,'calendar');
    replace(/\b(occupazzione|ocupazione|occupazone|occupazzone)\b/gi,'occupazione');
    replace(/\b(ristruturazione|ristrutturazzione)\b/gi,'ristrutturazione');
    // Separate singular/plural forms to keep the question's grammar.
    text=text.replace(/\b(prenotazzione|prenotazzioni|prenotazoni)\b/gi,from=>{
      const to=from.toLowerCase()==='prenotazzione'?'prenotazione':'prenotazioni';
      corrections.push({from,to});return to;
    });
    replace(/\bmutou\b/gi,'mutuo');
    if(!personal){replace(/\boccupnacy\b/gi,'occupancy');replace(/\bmorgage\b/gi,'mortgage');replace(/\brev[ -]par\b/gi,'revpar');}
    replace(/\b(autopilott|autopilota)\b/gi,'autopilot');
    return {original,text,corrections};
  };
})();
