// RC126: operational pause for NEW live purchases only. Re-enable after review.
// This does not stop existing renewals or revoke existing access.
export const LIVE_SALES_PAUSED = true;
export const isLiveSalesPaused = liveMode => LIVE_SALES_PAUSED && liveMode === true;
export const SALES_NOTICE = Object.freeze({
 it: 'Partecipa ai test di RendimentoBB: prova Investor per 30 giorni, senza carta né addebiti, se il tuo account è idoneo. Puoi esplorare analisi, dashboard e PMS e condividere il tuo feedback. I PDF sono riservati a Pro. In questa fase i nuovi acquisti non sono disponibili: i prezzi mostrati sono il listino previsto. Lascia il tuo interesse per ricevere un avviso all’apertura degli abbonamenti, senza impegno o attivazioni automatiche.',
 en: 'Join RendimentoBB testing: try Investor for 30 days, without a card or charges, if your account is eligible. Explore analyses, dashboard and PMS and share your feedback. PDFs require Pro. New purchases are not available during this phase: prices shown are the planned price list. Register your interest to receive a notice when subscriptions open, with no commitment or automatic activation.'
});
