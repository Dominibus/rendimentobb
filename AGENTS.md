# RendimentoBB — standard di affidabilità

Prima di intervenire su dati, fonti o calcoli leggere docs/reliability/README.md, INVENTARIO.md e ARCHITETTURA.md. Repository e hosting: GitHub/Vercel; Netlify non è il percorso di rilascio.

- Non inventare dati, periodi, fonti, normative o conclusioni. Distinguere ufficiale, privato, input utente, ipotesi interna, calcolato, editoriale e demo sintetica. Per assenze usare null e presentare Non disponibile/Da verificare/Ipotesi secondo contesto; preservare gli zeri espliciti.
- Ogni aggiornamento dati documenta editore, documento/URL, condizioni, versione, territorio, periodo, acquisizione, trasformazioni e limiti. Non attribuire fonti di contesto alle formule finanziarie.
- Il registro è data/source-registry.json; verificarlo con node scripts/audit-source-registry.mjs. Un checksum non certifica il dato o la sua attualità. Non aggiornare impronte solo per aggirare un test.
- Consultare fonti primarie pertinenti; non derivare benchmark locali da aggregati nazionali senza metodo revisionato. Rispettare condizioni di acquisizione e rate limit. Nessuna API a pagamento senza autorizzazione.
- Per normativa/fiscalità rilevare e proporre, mai applicare automaticamente aliquote, basi imponibili o interpretazioni. Documentare competenza territoriale, decorrenza e revisore. Il prodotto non certifica conformità.
- Nessuna riscrittura silenziosa di simulazioni storiche. Un eventuale ricalcolo è esplicito, non distruttivo e versionato. Provenienza PDF/CSV/Chatbot coerente con il record, non con la sola versione corrente del sito.
- Lavorare su branch dedicato; PR e verifiche riproducibili. Fiscalità, persistenza, autorizzazioni, motori finanziari e cambiamenti architetturali sensibili richiedono revisione separata e approvazione del fondatore prima del merge. Non modificare direttamente produzione o record reali.
- Mantenere vendite sospese, Investor30giorni e condizioni commerciali esistenti salvo istruzioni esplicite. Nessun dato sanitario dei pazienti o dato personale superfluo nei registri/artifact/log.
- Acquisizioni fallite conservano l'ultima versione valida; nessuna promozione automatica finché non autorizzata. Gli avvisi devono essere deduplicati e limitati sull'infrastruttura esistente, dopo revisione separata.
- Documentare cosa è implementato, proposto, verificato localmente, verificato online e non verificato. CI verde non equivale a certificazione completa. Usare la checklist indipendente e aggiornare il manuale per i cambiamenti pertinenti.
