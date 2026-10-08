// Read-only answers from confirmed investment rows; no simulation/PDF fallback.
(function(){
  'use strict';
  const number=v=>typeof v==='number' && Number.isFinite(v)?v:null;
  window.rbBuildConfirmedPortfolioResponse=function(message){
    const q=String(message||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(!/patrimonio|portafoglio|portfolio/.test(q) || !/analiz|analys|cash\s?flow|roi|negativ|perdit|loss|confermat|confirmed/.test(q) || /\bpdf\b|document|brochure|cancell|elimin|delete|modific|edit|pagament|payment|fattur|bill/.test(q))return null;
    const respond=(it,en,mode,metadata={})=>({type:'confirmed_portfolio_grounded',confidence:1,textIT:it,textEN:en,signals:['confirmed_investments_only'],suggestionsIT:['Analizza il patrimonio confermato'],suggestionsEN:['Analyze my confirmed portfolio'],metadata:{source:'account_confirmed_investments',answerMode:mode,...metadata}});
    const access=window.getUserAccess?.()||{};
    if(!window.currentUser || !(access.isInvestor||access.isPro||access.isAdmin))return respond('La lettura del patrimonio confermato richiede accesso Investor o Pro.','Confirmed portfolio answers require Investor or Pro access.','access');
    const data=window.rbConfirmedPortfolio;
    if(!data || data.ownerUid!==window.currentUser.uid || !Array.isArray(data.rows))return respond('Apri Dashboard → Patrimonio e attendi il caricamento, poi ripeti la domanda. Il patrimonio confermato non è disponibile in questa schermata.','Open Dashboard → Portfolio and wait for loading, then ask again. The confirmed portfolio is unavailable on this screen.','unavailable');
    const rows=data.rows;
    const render=en=>{
      const t=(it,eng)=>en?eng:it;
      const money=v=>new Intl.NumberFormat(en?'en-GB':'it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(v);
      const valid=rows.filter(r=>number(r.net)!==null), negative=valid.filter(r=>r.net<0);
      const lines=[t('Patrimonio confermato · ipotesi finanziarie salvate','Confirmed portfolio · saved financial assumptions'),t(`${rows.length} immobili; cashflow disponibile per ${valid.length}/${rows.length}.`,`${rows.length} properties; cash flow available for ${valid.length}/${rows.length}.`)];
      if(!rows.length)lines.push(t('Nessun immobile confermato. Conferma gli scenari che appartengono al patrimonio.','No confirmed properties. Confirm the scenarios belonging to your portfolio.'));
      else {
        if(valid.length===rows.length)lines.push(t(`Cashflow totale stimato: ${money(valid.reduce((s,r)=>s+r.net,0))}/anno.`,`Estimated total cash flow: ${money(valid.reduce((s,r)=>s+r.net,0))}/year.`));
        for(const row of negative){const index=rows.indexOf(row)+1;lines.push(t(`Immobile ${index} · ${String(row.city||'città non indicata')}: ${money(row.net/12)}/mese (${money(row.net)}/anno).`,`Property ${index} · ${String(row.city||'city not specified')}: ${money(row.net/12)}/month (${money(row.net)}/year).`));}
        if(!negative.length)lines.push(t(valid.length===rows.length?'Nessun cashflow negativo nelle ipotesi disponibili.':'Nessun cashflow negativo nei record disponibili; non posso concludere sui record mancanti.',valid.length===rows.length?'No negative cash flow under the available assumptions.':'No negative cash flow in available records; missing records cannot be assessed.'));
        lines.push(t('Prossimo passo: apri ciascun immobile in perdita e verifica costi, rata e occupazione nelle ipotesi salvate; confronta uno scenario prudente prima di decidere.','Next step: open each loss-making property and verify costs, debt service and occupancy in its saved assumptions; compare a conservative scenario before deciding.'));
      }
      lines.push(t('Stime del patrimonio, non incassi certificati o risultati operativi PMS.','Portfolio estimates, not certified receipts or PMS operating results.'));
      lines.push(t(`Fonte: snapshot caricato ${data.loadedAt||'—'}.`,`Source: snapshot loaded ${data.loadedAt||'—'}.`));
      return lines.join('\n');
    };
    return respond(render(false),render(true),'portfolio',{ownerUid:data.ownerUid,loadedAt:data.loadedAt});
  };
})();
