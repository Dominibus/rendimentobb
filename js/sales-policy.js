// RC126: operational pause for NEW live purchases only. Re-enable after review.
// This does not stop existing renewals or revoke existing access.
export const LIVE_SALES_PAUSED = true;
export const isLiveSalesPaused = liveMode => LIVE_SALES_PAUSED && liveMode === true;
export const SALES_NOTICE = Object.freeze({
 it: 'I nuovi abbonamenti a pagamento sono temporaneamente non acquistabili. I prezzi mostrati sono il listino previsto. La prova Investor di 7 giorni resta disponibile per gli account idonei, senza carta né addebiti. Gli abbonamenti esistenti continuano secondo le condizioni già accettate. Per informazioni usa la pagina Contatti.',
 en: 'New paid subscriptions are temporarily unavailable for purchase. The prices shown are the planned price list. The 7-day Investor trial remains available to eligible accounts, with no card or charges. Existing subscriptions continue under their previously accepted terms. For information, use the Contact page.'
});
