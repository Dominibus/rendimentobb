(function(){
  'use strict';
  window.rbBuildRenovationRecoveryResponse=function(message){
    const q=(window.rbNormalizeAIQuery?.(message)?.text ?? String(message||'')).toLowerCase();
    if(!/ristruttur|renovat|lavori|building works/.test(q) || !/spes|cost|recuper|rientr|recover|payback|saldo|balance/.test(q) || /\b(pdf|elimina|delete|modifica|edit)\b/.test(q))return null;
    const snapshot=window.rbRenovationRecoveryData;
    const access=window.getUserAccess?.() || {};
    const available=window.currentUser?.uid && (access.isPaid || access.isInvestor || access.isPro || access.isAdmin) && snapshot?.ownerUid===window.currentUser.uid && Array.isArray(snapshot.rows);
    const build=en=>{
      const t=(it,eng)=>en?eng:it;
      if(!available)return t('Apri la Dashboard e attendi il caricamento delle strutture. Non ho un riepilogo verificato delle tue spese di ristrutturazione in questa schermata.','Open the Dashboard and wait for properties to load. I do not have a verified summary of your renovation costs on this screen.');
      const money=v=>v===null?t('dato non disponibile','unavailable'):new Intl.NumberFormat(en?'en-GB':'it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(v);
      const lines=[t('Ristrutturazioni · spese inserite e recupero stimato','Renovations · recorded costs and estimated recovery'),t('Spese effettive totali inserite: ','Total recorded actual costs: ')+money(snapshot.totalSpent)];
      for(const row of snapshot.rows.slice(0,20)){
        const years=row.paybackYears===null?t('non calcolabile','cannot be calculated'):new Intl.NumberFormat(en?'en-GB':'it-IT',{maximumFractionDigits:2}).format(row.paybackYears)+t(' anni',' years');
        lines.push(`${row.name || t('Struttura','Property')} · ${t('spese','costs')} ${money(row.actualSpent)} · ${t('cashflow annuo stimato','estimated annual cash flow')} ${money(row.annualCashflow)} · ${t('recupero semplice','simple recovery')} ${years}.`);
        lines.push(t('Saldo stimato a 1 / 3 / 5 anni: ','Estimated balance after 1 / 3 / 5 years: ')+row.projections.map(p=>money(p.balance)).join(' / '));
      }
      if(snapshot.rows.length>20)lines.push(t('Altre strutture nella tabella della Dashboard.','More properties are shown in the Dashboard table.'));
      lines.push(t('È un confronto con il cashflow della simulazione salvata mantenuto costante, non con incassi reali o con un guadagno causato dai lavori. Le spese non sono aggiunte ai costi mensili.','This compares costs against saved simulated cash flow held constant, not actual receipts or profit caused by the works. Costs are not added to monthly expenses.'));
      lines.push(t('Ultimo caricamento: ','Last loaded: ')+snapshot.loadedAt);
      return lines.join('\n\n');
    };
    return {type:'renovation_recovery_grounded',confidence:available?1:0,textIT:build(false),textEN:build(true),actions:[],metadata:{source:'account_renovation_costs_and_saved_simulation',loadedAt:available?snapshot.loadedAt:null}};
  };
})();
