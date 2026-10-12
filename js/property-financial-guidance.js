// Guidance only: creating an analysis never changes or duplicates a property.
export function propertyFinancialGuidanceHTML(propertyId, lang = 'it') {
  const en = lang === 'en';
  const t = (it, eng) => en ? eng : it;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'}[c]));
  return `<div class="property-financial-guidance" style="margin-bottom:18px;padding:16px;border:1px solid #cbd5e1;border-radius:14px;background:#f8fafc;color:#0f172a">
    <strong>${t('Solo gestione PMS · analisi finanziaria non collegata', 'PMS management only · no financial analysis linked')}</strong>
    <p style="margin:8px 0;line-height:1.6;font-size:13px">${t('Prenotazioni, ricavi registrati e lavori sono disponibili. Per cashflow stimato, ROI e recupero delle spese serve una simulazione collegata: il sito non li ricava automaticamente dalle prenotazioni.', 'Bookings, recorded revenue and renovations are available. Estimated cash flow, ROI and cost recovery require a linked simulation: the site does not calculate them automatically from bookings.')}</p>
    <p style="margin:8px 0;line-height:1.6;font-size:13px">${t('Casa già tua? Inserisci le ipotesi nel simulatore, calcola e salva l’analisi. Torna a questa proprietà, premi “Collega analisi salvata”, selezionala e salva. Usa la proprietà esistente, senza crearne una seconda. Con capitale di avvio zero il ROI resta non applicabile.', 'Already own the house? Enter your assumptions in the simulator, calculate and save the analysis. Return to this property, choose “Link saved analysis”, select it and save. Use the existing property without creating a second one. With zero startup capital, ROI remains not applicable.')}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
      <a class="btn-dashboard" style="white-space:normal;text-align:center;text-decoration:none" href="/tool/?propertyMode=owned">${t('Analizza casa già posseduta', 'Analyze an already owned house')}</a>
      <button type="button" class="btn-dashboard" style="white-space:normal" data-property-id="${esc(propertyId)}" onclick="openPropertyEditor(this.dataset.propertyId)">${t('Collega analisi salvata', 'Link saved analysis')}</button>
    </div>
  </div>`;
}
