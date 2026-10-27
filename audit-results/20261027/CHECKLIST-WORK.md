# Checklist di revisione indipendente

Solo account e dati sintetici in ambiente di test autorizzato. Nessun pagamento o invio a persone reali.

Fonte: ux-seo-architecture.md

## Checklist Work: verifiche manuali ancora necessarie

Usare account e nominativi sintetici; nessuna modifica alle vendite, nessun dato reale.

1. Desktop IT/EN e device mobile320/390/768: Home→tool→calcolo→registrazione→verifica email→trial idoneo30gg. Screenshot prima/dopo, errori console/rete, titolo e URL.
2. Account Free/Investor/trial/Pro sintetici: CTA/limiti coerenti, expiry/relogin/nuova tab, PDF solo livello previsto, nessuna schermata con vendite riattivate.
3. Tab/ShiftTab/Enter/Escape: menu mobile, cookie preferences, modali, form error focus, select, dialog import/export, chatbot; focus visibile e restituito all'origine. Test screen reader su label, heading, messaggi live e KPI canvas alternativi.
4. Zoom200% e font grande; contrasto testo/pulsanti/stati disabled/error, calendario e numeri lunghi; viewport mobile con tastiera aperta.
5. Modifica analisi→salva→ricarica→collega proprietà→PMS→prenotazione→PDF/CSV/chatbot; stesso periodo/assunzioni, raccolta risultati numerici e provenienza. Perdita rete durante salvataggio e conflitto tra due finestre.
6. Cold load mobile throttled e almeno3 run per LCP/INP/CLS, peso transfer/compressed, cache dopo aggiornamento asset; verificare servizio serverless realmente Vercel anziché assumere equivalenza dal server statico.
7. Planner commerciale IT/EN: dati sintetici stanza/slot, modifica lingua con dati unsaved, layout tabella/mobile e valori IVA, URL/lingua dopo switch.
8. Recupero account e revoca/session expiry con ambiente test; nessun invio arbitrario a indirizzi reali. Eseguire separatamente test ripristino su backup di ambiente test e registrare RPO/RTO osservati.

Fonte: pms-assistant.md

## Checklist Work riproducibile

1. Account sintetici A/B; caricare analisi acquisto identica in IT/EN e salvare; annotare ID e KPI.
2. Confermare analisi come proprietà; verificare link bidirezionale e snapshot, uscire/rientrare e confrontare stessa analisi in Dashboard/PDF/chatbot.
3. Inserire soggiorno 30/01→03/02 EUR400; report gennaio/febbraio attesi 200/200 e 2/2 notti; confrontare CSV e PDF.
4. Creare pending e cancelled: esclusi dai ricavi. Due confirmed sovrapposte: conflitto. Checkout e nuovo checkin stesso giorno: consentiti.
5. Simulare risposta persa con server che ha committato: retry immediato e retry dopo altra operazione; verificare ID e numero documenti.
6. Due schede modificano stessa revisione: la seconda riceve stale_version senza sovrascrivere la prima.
7. Filtro singola proprietà poi «oggi/prossimi sette giorni»: verificare che assistente espliciti ambito «tutte le strutture» e non riusi il solo filtro.
8. Cambio account e downgrade: nessun dato A mostrato a B; cache/report e task svuotati; errori rete non diventano messaggi «nessuna attività».
9. Mobile 320/390px e desktop: calendario, dialog import/export, tastiera/focus, IT/EN e messaggi di errore; distinguere N/D da zero e campi critici prima di salvare.
