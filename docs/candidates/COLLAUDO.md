# Collaudo — prima selezione candidati

Base main `476f21d25045346a42ff0c1d2f7e5e05ae69cde4`, branch `feat/candidate-screening`. L'inventario iniziale è in un commit distinto prima dell'implementazione. SHA finale e CI nella PR.

## Comandi riproducibili

```sh
node tests/candidate-screening.test.js
node tests/candidate-workspace.test.js
npm test
node scripts/audit-source-registry.mjs
node tests/rc213-financial-identities.mjs
python3 -m unittest discover -s tests -p '*.py'
git diff --check
```

Il test calendario richiede avvio di sottoprocessi. Se il sandbox produce EPERM, ripetere in runner compatibile: non attribuire il blocco al calcolo. I test UI usano un DOM simulato ed eseguono gli handler reali, non sono un browser. Le prove candidate non effettuano scritture di account o richieste a provider.

Copertura nuova: completi/incompleti/fuori vincoli, zero/null, IT/EN numerico, intestazioni inattese e HTML/formule, file grandi e CSV malformati, duplicati, identità durante ordinamento/filtro, incompleti dopo completi, selezione anteprima conservata al cambio lingua, applicazione ipotesi esplicita per ID, apertura Analizza in nuova scheda, copia dei soli input compatibili, precedenza mutuo, campi economici mancanti bloccati prima dei default, occupazione frazionaria, motivazioni dell'assistente identiche alla schermata, conto diverso/logout/importazione tardiva e nessuna persistenza del workspace.

## Esiti locali

- 53 regressioni nuove passate (47 modello/trasferimento/assistente, 6 handler UI con DOM simulato).
- Suite completa nell'ambiente con sottoprocessi consentiti: 2.269 test Node passati, zero fallimenti, incluso calendario.
- 638 identità finanziarie e 37 test Python passati.
- Integrità registro fonti e `git diff --check` passati. Dataset e impronte dei motori invariati; aggiornata solo l'impronta editoriale della pagina Immobili per il link aggiunto.
- Esempio CSV nel repository equivalente al modello scaricabile, con fine riga LF nel file e CRLF nel download; nessun dato personale.
- Browser reale e produzione autenticata non eseguiti. Esiti CI e SHA esatto nella PR; nessun merge/deploy manuale.

## Checklist browser Work (da eseguire)

Usare la preview del commit della PR, dati sintetici e un account di test autorizzato se necessario. Annotare URL/SHA, piano, lingua e screenshot. Nessuna modifica ai dati reali. Non confondere stato Vercel success con collaudo.

- [ ] `/immobili/` → candidati → ritorno a confronto A/B; header/footer e mobile shell coerenti.
- [ ] IT/EN a 390 e 1440 px, tastiera, focus, stato aria-live, tabella scorrevole, dettagli leggibili.
- [ ] Manuale: 0 e campi vuoti, comune non fra le città esemplificative, ref automatico, duplicato e URL non valido.
- [ ] CSV sintetico: anteprima senza aggiunte; selezione parziale; cambio lingua; conferma; CSV malformed/extra colonna/file >500 KiB.
- [ ] Circa 30 candidati, identità invariata con filtri/ordinamento; incompleti non in testa agli ordinamenti numerici.
- [ ] Budget totale, capitale dichiarato, comune/zona esatti e preferenza: motivi comprensibili, nessuna garanzia di rendimento.
- [ ] Ipotesi comuni: selezione visibile, campi vuoti non sovrascrivono, solo ID selezionati aggiornati, origine visibile.
- [ ] «Spiega» A poi B: assistente usa la stessa scheda e le stesse ragioni; nessun valore del precedente candidato, PDF o PMS.
- [ ] Analizza in nuova scheda: originale ancora disponibile, riferimento e valori corretti, prezzo non maggiorato delle spese, comune non inventato, nessun salvataggio.
- [ ] Occupazione mancante resta «Da indicare» e blocca il calcolo fino a intervento esplicito; 60,55% trasferito esatto; 0 preservato.
- [ ] Mancano commissione/aliquota/tasso/durata/costi: nessun rendimento dai default legacy per il candidato; inserimento esplicito consente il motore ordinario.
- [ ] Scenario mutuo esistente preservato; link candidato manomesso rifiutato; altri link immobili continuano a funzionare.
- [ ] Free/Investor/Pro: risultati e PDF mantengono i gate precedenti; Investor 30 giorni, vendite sospese.
- [ ] Logout/cambio account: lista, anteprima e contesto eliminati; lettura file pendente scartata.
- [ ] Ricarica/chiusura elimina lista; nessuna scrittura Firestore o nuovo archivio di sessione, nessun fetch agli URL annunci.

Browser reale, produzione autenticata, fonti/annunci esterni e revisione professionale non sono certificati dai test locali. Nessun merge o deploy manuale autorizzato da questo documento.
