// ===============================================
// 🧠 DOCUMENT ENGINE 3.0
// AI Document Intelligence Engine
// RendimentoBB • Silicon Valley Architecture 2026
// ===============================================

"use strict";

// ===============================================
// 🌍 GLOBAL NAMESPACE
// ===============================================

window.RBDocuments = window.RBDocuments || {};

// ===============================================
// ⚙️ CONFIGURATION
// ===============================================

window.RBDocuments.config = {

    version: "3.0",

    maxDocuments: 100,

    enableEvents: true,

    enableMemory: true,

    enableReasoning: true,

    enableMetadata: true,

    enableLogging: true

};

// ===============================================
// 📄 ACTIVE DOCUMENT
// ===============================================

window.rbActiveDocument = null;

// Compatibilità retroattiva
window.lastDocumentInfo = null;

// ===============================================
// 📄 LAST EXECUTIVE REPORT
// ===============================================

window.lastExecutiveReport = null;

// ===============================================
// 📚 DOCUMENT LIBRARY
// ===============================================

window.rbDocumentLibrary = [];

// ===============================================
// 📑 DOCUMENT HISTORY
// ===============================================

window.rbDocumentHistory = [];

// ===============================================
// 📡 EVENT BUS
// ===============================================

window.rbDocumentEvents = {

    emit(event, payload = {}){

        if(
            !window.RBDocuments.config.enableEvents
        ){
            return;
        }

        document.dispatchEvent(

            new CustomEvent(

                `rb:${event}`,

                {

                    detail: payload

                }

            )

        );

        if(
            window.RBDocuments.config.enableLogging
        ){

            if(window.RB_DEBUG === true){
    console.debug("DOCUMENT EVENT", event);
}

        }

    },

    on(event, callback){

        document.addEventListener(

            `rb:${event}`,

            callback

        );

    }

};

// ===============================================
// 📄 CREATE DOCUMENT OBJECT
// ===============================================

window.rbCreateDocumentObject = function({

    file = null,

    type = "generic",

    classification = null,

    buffer = null

} = {}){

    return{

        id:

            crypto.randomUUID

                ? crypto.randomUUID()

                : `doc_${Date.now()}`,

        type,

        subtype:

            classification?.label ||

            "Generic Document",

        confidence:

            classification?.confidence ||

            0,

        source:

            "upload",

        uploadedAt:

            new Date().toISOString(),

        fileName:

            file?.name ||

            null,

        extension:

            file?.name?.split(".").pop()?.toLowerCase() ||

            null,

        mimeType:

            file?.type ||

            null,

        size:

            file?.size ||

            0,

        metadata:{},

        analysis:{},

        reasoning:{},

        executiveContext:{},

        aiSummary:null,

        aiSignals:[],

        extractedText:null,

        buffer

    };

};

// ===============================================
// 📚 DOCUMENT MANAGER
// ===============================================

window.rbDocumentManager = {

    add(documentObject){

        if(!documentObject){

            return null;

        }

        window.rbDocumentLibrary.unshift(

            documentObject

        );

        window.rbDocumentLibrary =

            window.rbDocumentLibrary.slice(

                0,

                window.RBDocuments.config.maxDocuments

            );

        window.rbDocumentHistory.unshift({

            id: documentObject.id,

            type: documentObject.type,

            fileName: documentObject.fileName,

            uploadedAt: documentObject.uploadedAt

        });

        window.rbActiveDocument =

            documentObject;

        window.lastDocumentInfo =

            {

                type:

                    documentObject.type,

                label:

                    documentObject.subtype,

                confidence:

                    documentObject.confidence

            };

        window.rbDocumentEvents.emit(

            "document_added",

            documentObject

        );

        return documentObject;

    },

    getLast(){

        return window.rbActiveDocument;

    },

    getAll(){

        return [

            ...window.rbDocumentLibrary

        ];

    },

    getHistory(){

        return [

            ...window.rbDocumentHistory

        ];

    },

    getByType(type){

        return window.rbDocumentLibrary.filter(

            doc => doc.type === type

        );

    },

    clear(){

        window.rbActiveDocument = null;

        window.lastExecutiveReport = null;

        window.lastDocumentInfo = null;

        window.rbDocumentLibrary = [];

        window.rbDocumentHistory = [];

        window.rbDocumentEvents.emit(

            "documents_cleared"

        );

    }

};

// ===============================================
// 🧠 BUILD EXECUTIVE REPORT
// ===============================================

window.buildExecutiveReport = function(data = {}){

    const report = {

        id:
            crypto.randomUUID
                ? crypto.randomUUID()
                : `report_${Date.now()}`,

        documentType:
            data.reportType === "executive_pdf"
                ? "executive_pdf"
                : "simulation",

        type:
            "executive_report",

        category:
            "investment_analysis",

        subtype:
    data.reportSource === "dashboard_report"
        ? "Dashboard Report"
        : data.reportType === "executive_pdf"
            ? "Executive PDF"
            : "Simulation",

source:
    data.reportSource === "dashboard_report"
        ? "dashboard_report"
        : data.reportType === "executive_pdf"
            ? "tool_report"
            : "simulator",

        generatedAt:
            new Date().toISOString(),

        version:
            "3.0",

        city:
            data.realCity ||
            data.marketCity ||
            null,

        roi:
            data.realROI ??
            data.visualROI ??
            data.roi ??
            0,

        risk:
            data.risk ?? 0,

        occupancy:
            data.occupancy ?? 0,

        revenue:
            data.revenueAnnual ??
            data.gross ??
            0,

        cashflow:
            data.net ??
            data.annualProfit ??
            0,

        propertyPrice:
            data.propertyPrice ??
            data.price ??
            0,

        equity:
            data.equity ?? 0,

        mortgage:
            data.mortgageAmount ??
            data.loanAmount ??
            0,

        analysis: {
    ...data,

    reportSource:
        data.reportSource ||
        (
            data.reportType === "executive_pdf"
                ? "tool_report"
                : "simulator"
        )
},

        metadata:{

            generatedBy:"simulator",

            language:
                window.currentLanguage || "it",

            createdAt:
                Date.now()

        },

        aiSummary:null,

        aiSignals:[],

        reasoning:{},

        executiveContext:{}

    };

    // ==========================================
    // ACTIVE REPORT
    // ==========================================

    window.lastExecutiveReport = report;

// =====================================
// ACTIVE EXECUTIVE DOCUMENT
// =====================================

window.rbActiveExecutiveDocument = {

    type: "executive_report",

    source: "rendimentobb",

    generatedAt: new Date().toISOString(),

    report: window.lastExecutiveReport

};

    // ==========================================
    // ACTIVE DOCUMENT
    // ==========================================

    window.rbActiveDocument = report;

    // ==========================================
    // DOCUMENT LIBRARY
    // ==========================================

    window.rbDocumentManager.add(report);

    // ==========================================
    // EVENT
    // ==========================================

    window.rbDocumentEvents.emit(

        "executive_report_created",

        report

    );

    return report;

};

// ===============================================
// 📄 ANALYZE UPLOADED DOCUMENT
// ===============================================

// Financial document answers use only the current PDF, never page defaults.
window.rbBuildPDFResponse = function(message, doc, live = {}){
    if(doc?.status !== "ready") return null;
    const query = String(message || "").toLowerCase();
    if(!/(pdf|document|file|brochure|riassumilo|interpretalo|leggilo|confrontalo|summarize it|read it)/i.test(query)) return null;
    if(/\b(free|investor|pro|piano|plan|abbonamento|subscription)\b/.test(query)) return null;
    if(/(manc|missing|complet|sufficient|non.*riconosci|not.*recogniz)/i.test(query)) return null;
    const a = doc.analysis || {};
    const has = key => a[key] !== null && a[key] !== undefined && a[key] !== "" && Number.isFinite(Number(a[key]));
    const evidence = String(doc.extractedText || "").replace(/\s+/g," ");
    const equityROI = a.roiBasis === "equity" || /ROI (?:SUL CAPITALE PROPRIO|ON EQUITY|EQUITY)|RETURN ON EQUITY/i.test(evidence);
    const propertyROI = a.roiBasis === "property";
    const afterMortgage = a.cashflowBasis === "after_mortgage" || /CASHFLOW NETTO DOPO MUTUO|NET CASH FLOW AFTER (?:LOAN|MORTGAGE)/i.test(evidence);
    const keys = {investmentScore:["Punteggio investimento del PDF","PDF investment score"],dscr:["DSCR del PDF","PDF DSCR"],benchmarkROI:["Benchmark ROI del PDF","PDF ROI benchmark"],propertyPrice:["Prezzo immobile","Property price"],roi:[equityROI ? "ROI sul capitale proprio" : propertyROI ? "ROI sul valore immobile" : "ROI riportato",equityROI ? "Return on equity" : propertyROI ? "ROI on property value" : "Reported ROI"],equity:["Capitale proprio","Equity"],mortgage:["Mutuo","Loan"],cashflow:[afterMortgage ? "Cashflow annuo dopo mutuo" : "Cashflow annuo riportato",afterMortgage ? "Annual cash flow after mortgage" : "Reported annual cash flow"],gross:["Ricavi annui","Annual revenue"],risk:["Indice rischio del report","Report risk index"],occupancy:["Occupazione riportata","Reported occupancy"]};
    const compare = /(confront|compar)/i.test(query);
    const summarize = /(riassum|sintesi|riepilog|summar)/i.test(query);
    const interpret = /(interpret|analizz|analyz|convien|worth|sostenib|sustainab)/i.test(query);
    const allIndicators = /(?:tutti|tutte).*(?:indicatori|metriche)|all.*(?:indicators|metrics)/i.test(query);
    const requested = [
      ["investmentScore",/punteggio|score/],
      ["dscr",/dscr/],
      ["benchmarkROI",/benchmark/],
      ["roi",/\broi\b|rendimento|return on equity/],
      ["cashflow",/cashflow|cash flow|flusso di cassa/],
      ["risk",/rischio|\brisk\b/],
      ["mortgage",/mutuo|finanziamento|mortgage|\bloan\b/],
      ["gross",/ricavi|revenue/],
      ["equity",/capitale proprio|\bequity\b/],
      ["propertyPrice",/prezzo|property price/],
      ["occupancy",/occupazion|occupancy/]
    ].filter(([key,pattern])=>(allIndicators && ["investmentScore","dscr","benchmarkROI","roi","cashflow","risk"].includes(key)) || pattern.test(key === "roi" ? query.replace(/benchmark\s+roi|roi\s+benchmark/g, "benchmark") : query)).map(([key])=>key);
    const mode = compare ? "compare" : summarize ? "summary" : interpret || !requested.length ? "interpretation" : requested.length > 1 ? "multiple" : requested[0];
    const render = lang => {
        const en = lang === "en", locale = en ? "en-GB" : "it-IT";
        const fixedPercent = (value,digits=1) => `${new Intl.NumberFormat(locale,{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(Number(value))}%`;
        const number = (value,digits=2) => new Intl.NumberFormat(locale,{maximumFractionDigits:digits,useGrouping:true}).format(Number(value));
        const money = value => new Intl.NumberFormat(locale,{style:"currency",currency:"EUR",minimumFractionDigits:0,maximumFractionDigits:2,useGrouping:true}).format(Number(value));
        const percent = value => `${number(value)}%`;
        const format = (key,value) => ["roi","occupancy","benchmarkROI"].includes(key) ? percent(value) : ["risk","investmentScore"].includes(key) ? `${number(value)}/100` : key === "dscr" ? number(value) : money(value);
        const source = en ? `Source: ${doc.fileName}` : `Fonte: ${doc.fileName}`;
        const missing = key => en ? `I did not recognize ${keys[key][1].toLowerCase()} in this PDF. I cannot replace it with a default.` : `Non ho riconosciuto ${keys[key][0].toLowerCase()} nel PDF. Non lo sostituisco con un valore predefinito.`;
        const lines=[];
        const metric = key => has(key) ? `${keys[key][en?1:0]}: ${format(key,a[key])}.` : missing(key);
        const loanRatio = has("mortgage") && has("propertyPrice") && Number(a.propertyPrice)>0 ? 100*Number(a.mortgage)/Number(a.propertyPrice) : null;
        if(mode === "summary"){
            lines.push(en ? "Recognized PDF data" : "Dati riconosciuti nel PDF");
            const known=Object.keys(keys).filter(has);
            if(!known.length) lines.push(en ? "Text extracted, but insufficient financial metrics recognized." : "Testo estratto, ma non ho riconosciuto indicatori finanziari sufficienti.");
            for(const key of known) lines.push(metric(key));
            lines.push(en ? "These are the document's figures and assumptions; missing values are not estimated." : "Sono dati e ipotesi del documento; i valori mancanti non vengono stimati.");
        }else if(mode === "multiple"){
            for(const key of requested) lines.push(metric(key));
            if(requested.includes("dscr") && has("dscr")) lines.push(en ? (Number(a.dscr)<1 ? "DSCR below 1: modeled operating income does not cover annual debt service." : "DSCR at least 1: modeled operating income covers annual debt service; coverage should be stress-tested.") : (Number(a.dscr)<1 ? "DSCR inferiore a 1: il reddito operativo simulato non copre le rate annue del debito." : "DSCR almeno pari a 1: il reddito operativo simulato copre le rate annue; verifica la tenuta in scenari prudenti."));
            if(requested.includes("benchmarkROI") && has("roi") && has("benchmarkROI")) lines.push(en ? `Reported ROI versus PDF benchmark: ${number(Number(a.roi)-Number(a.benchmarkROI))} percentage points. Compare their calculation bases before treating this as like-for-like.` : `ROI riportato rispetto al benchmark del PDF: ${number(Number(a.roi)-Number(a.benchmarkROI))} punti percentuali. Verifica che abbiano la stessa base di calcolo prima di considerarli omogenei.`);
        }else if(["investmentScore","dscr","benchmarkROI"].includes(mode)){
            lines.push(metric(mode));
            if(mode === "dscr" && has("dscr")) lines.push(en ? (Number(a.dscr)<1 ? "Below 1: modeled operating income does not cover annual debt service." : "At least 1: modeled operating income covers annual debt service; this is not a guarantee.") : (Number(a.dscr)<1 ? "Inferiore a 1: il reddito operativo simulato non copre le rate annue del debito." : "Almeno 1: il reddito operativo simulato copre le rate annue del debito; non è una garanzia."));
        }else if(mode === "roi"){
            lines.push(metric("roi"));
            if(has("roi") && equityROI){
                lines.push(en ? `Under the report assumptions, each €100 of equity produces about ${money(a.roi)} in annual net cash flow.` : `Nelle ipotesi del report, ogni 100 € di capitale proprio genera circa ${money(a.roi)} di cashflow netto annuo.`);
                if(has("cashflow") && has("equity") && Number(a.equity)>0){
                    const calculated=100*Number(a.cashflow)/Number(a.equity);
                    lines.push(en ? `Check: ${money(a.cashflow)} ÷ ${money(a.equity)} × 100 = ${percent(calculated)}.` : `Verifica: ${money(a.cashflow)} ÷ ${money(a.equity)} × 100 = ${percent(calculated)}.`);
                    lines.push(Math.abs(calculated-Number(a.roi))<=.15 ? (en ? "The calculation is consistent with the rounded ROI in the PDF." : "Il calcolo è coerente con il ROI arrotondato del PDF.") : (en ? "The calculation differs from the reported ROI: verify the report's calculation basis." : "Il calcolo differisce dal ROI riportato: verifica la base di calcolo del report."));
                }
                if(has("cashflow") && has("propertyPrice") && Number(a.propertyPrice)>0) lines.push(en ? `Cash flow/property price ratio: ${percent(100*Number(a.cashflow)/Number(a.propertyPrice))}. This uses a different denominator from return on equity.` : `Rapporto cashflow/prezzo immobile: ${percent(100*Number(a.cashflow)/Number(a.propertyPrice))}. Ha una base diversa dal ROI sul capitale proprio.`);
            }else if(has("roi") && propertyROI) lines.push(en ? "The report identifies ROI on property value. This must not be treated as return on equity." : "Il report identifica il ROI sul valore dell’immobile. Non va confuso con il rendimento sul capitale proprio.");
            else if(has("roi")) lines.push(en ? "The PDF does not identify the ROI calculation basis clearly enough; I cannot attribute it to equity or property value." : "Il PDF non identifica abbastanza chiaramente la base del ROI: non lo attribuisco al capitale proprio o al valore dell’immobile.");
        }else if(mode === "cashflow"){
            lines.push(metric("cashflow"));
            if(has("cashflow")){
                lines.push(en ? `Monthly average calculated as annual cash flow ÷ 12: ${money(Number(a.cashflow)/12)}. Actual monthly income may vary.` : `Media mensile calcolata come cashflow annuo ÷ 12: ${money(Number(a.cashflow)/12)}. I singoli mesi possono avere risultati diversi.`);
                lines.push(afterMortgage ? (en ? "The report explicitly labels this cash flow as after mortgage payments." : "Il report indica esplicitamente che questo cashflow è dopo il mutuo.") : (en ? "The extracted text does not establish whether mortgage payments are included." : "Dal testo estratto non è chiaro se le rate del mutuo siano incluse."));
            }
        }else if(mode === "mortgage"){
            lines.push(metric("mortgage"));
            if(loanRatio!==null) lines.push(en ? `Loan/property price ratio: ${percent(loanRatio)}.` : `Rapporto mutuo/prezzo immobile: ${percent(loanRatio)}.`);
            if(has("financingRate")) lines.push(en ? `Assumed interest rate: ${percent(a.financingRate)}.` : `Tasso ipotizzato: ${percent(a.financingRate)}.`);
            if(has("debtService")) lines.push(en ? `Estimated annual loan payments: ${money(a.debtService)}.` : `Rate annue stimate: ${money(a.debtService)}.`);
            lines.push(en ? "These are financing assumptions, not a bank offer or approval." : "Sono ipotesi di finanziamento, non un’offerta o un’approvazione bancaria.");
        }else if(mode === "risk"){
            lines.push(metric("risk"));
            if(loanRatio!==null) lines.push(en ? `The loan covers ${percent(loanRatio)} of the property price, so changes in revenue and costs also affect equity returns.` : `Il mutuo copre il ${percent(loanRatio)} del prezzo: variazioni di ricavi e costi incidono anche sul rendimento del capitale proprio.`);
            lines.push(en ? "This is the report's scenario index, not a probability of loss. Evaluate the underlying occupancy, cost and financing assumptions." : "È un indice dello scenario del report, non una probabilità di perdita. Va letto insieme alle ipotesi di occupazione, costi e finanziamento.");
        }else if(Object.hasOwn(keys,mode)){
            lines.push(metric(mode));
            if(mode === "gross") lines.push(en ? "Gross revenue is not net cash flow: operating costs, taxes and financing must be accounted for separately." : "I ricavi lordi non sono il cashflow netto: costi operativi, imposte e finanziamento vanno considerati separatamente.");
        }else if(mode === "compare"){
            for(const key of Object.keys(keys).filter(has)){
                let line=metric(key);
                if(key!=="roi" && live[key]!==null && live[key]!==undefined && live[key]!=="" && Number.isFinite(Number(live[key]))) line+=en ? ` Current simulation: ${format(key,live[key])}.` : ` Simulazione attuale: ${format(key,live[key])}.`;
                lines.push(line);
            }
            lines.push(en ? "Only matching recognized metrics are compared. ROI requires the same calculation basis; missing simulation values are not estimated." : "Confronto solo indicatori omogenei riconosciuti. Per il ROI serve la stessa base di calcolo; i dati mancanti della simulazione non vengono stimati.");
        }else{
            lines.push(en ? "Interpretation of the report" : "Interpretazione del report");
            if(has("roi")) lines.push(metric("roi"));
            if(has("cashflow")){
                lines.push(en ? `The scenario reports ${money(a.cashflow)} in annual cash flow (${money(Number(a.cashflow)/12)} per month on average).` : `Lo scenario riporta ${money(a.cashflow)} di cashflow annuo (${money(Number(a.cashflow)/12)} al mese in media).`);
                lines.push(Number(a.cashflow)>0 ? (en ? "The model has a positive surplus under the stated assumptions." : "Il modello produce un avanzo positivo nelle ipotesi indicate.") : (en ? "The model has no positive surplus under the stated assumptions." : "Il modello non produce un avanzo positivo nelle ipotesi indicate."));
                if(afterMortgage) lines.push(en ? "The PDF explicitly states that cash flow is after mortgage payments." : "Il PDF specifica che il cashflow è dopo il mutuo.");
            }
            if(loanRatio!==null) lines.push(en ? `Calculated loan/property price ratio: ${fixedPercent(loanRatio)}. Financing increases sensitivity of equity returns to revenue and cost changes.` : `Rapporto mutuo/prezzo calcolato dai valori del PDF: ${fixedPercent(loanRatio)}. Il finanziamento rende il rendimento del capitale proprio sensibile a variazioni di ricavi e costi.`);
            if(has("risk")) lines.push(metric("risk"));
            if(has("investmentScore")) lines.push(metric("investmentScore"));
            if(has("dscr")){
                lines.push(metric("dscr"));
                lines.push(en ? (Number(a.dscr)<1 ? "Debt coverage is insufficient in this scenario (DSCR below 1)." : "Debt service is covered in this scenario; test a reduction in revenue.") : (Number(a.dscr)<1 ? "La copertura del debito è insufficiente in questo scenario (DSCR inferiore a 1)." : "Il debito è coperto nello scenario: verifica anche una riduzione dei ricavi."));
            }
            if(has("benchmarkROI")) lines.push(metric("benchmarkROI"));
            if(!has("roi") && !has("cashflow")) lines.push(en ? "Insufficient recognized financial data to assess profitability." : "Non ho riconosciuto dati finanziari sufficienti per valutare la redditività.");
            lines.push(en ? "Before relying on this scenario, check occupancy assumptions, recurring costs, taxes and acquisition costs against the actual property data." : "Per valutare lo scenario, confronta occupazione, costi ricorrenti, imposte e spese di acquisto con i dati effettivi dell’immobile.");
        }
        if(mode!=="summary" && mode!=="compare") lines.push(en ? "This explains the PDF scenario; it does not verify actual operating results." : "Questa lettura spiega lo scenario del PDF; non verifica risultati operativi reali.");
        lines.push(source);
        return lines.join("\n");
    };
    return {type:"document_grounded",confidence:1,textIT:render("it"),textEN:render("en"),suggestionsIT:mode==="summary" ? ["Interpretami il PDF","E il ROI?","Quali dati mancano nel PDF?"] : ["Riassumi questo PDF","Quali dati mancano nel PDF?"],suggestionsEN:mode==="summary" ? ["Interpret this PDF","What about ROI?","Which data are missing in the PDF?"] : ["Summarize this PDF","Which data are missing in the PDF?"],signals:["current_pdf_only"],metadata:{source:"extracted_pdf_text",fileName:doc.fileName,documentId:doc.id,answerMode:mode}};
};

window.rbAnalyzeUploadedPDF = async function(file){
    const say = (it, en) => window.addMessage?.("assistant", window.currentLang === "en" ? en : it);
    if(!file || !/\.pdf$/i.test(file.name || "")) return {success:false,error:"unsupported"};
    if(file.size > 20 * 1024 * 1024){
        say("Il PDF supera 20 MB. Carica una versione più leggera.", "The PDF exceeds 20 MB. Upload a smaller version.");
        return {success:false,error:"too_large"};
    }
    const uploadKey = JSON.stringify([file.name, file.size, file.lastModified ?? null]);
    const pending = window.rbDocumentManager.getLast();
    if(pending?.status === "reading" && pending.uploadKey === uploadKey){
        say("Questo PDF è già in lettura. Attendi il risultato.", "This PDF is already being read. Please wait for the result.");
        return {success:false,error:"already_reading",document:pending};
    }
    const epoch = (window.rbDocumentEpoch || 0) + 1;
    window.rbDocumentEpoch = epoch;
    const isCurrent = () => epoch === window.rbDocumentEpoch;
    const classification = window.rbClassifyDocument?.(file) || {type:"generic_pdf",label:"PDF",confidence:0};
    const doc = window.rbCreateDocumentObject({file,type:classification.type,classification});
    doc.status = "reading";
    doc.uploadKey = uploadKey;
    window.rbDocumentManager.add(doc);
    window.lastExecutiveReport = null;
    window.addMessage?.("assistant", window.currentLang === "en" ? `PDF received: "${file.name}". Reading…` : `PDF ricevuto: "${file.name}". Lettura in corso…`, false);
    try {
        doc.buffer = typeof file.arrayBuffer === "function" ? await file.arrayBuffer() : await new Promise((resolve,reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("read_failed"));
            reader.readAsArrayBuffer(file);
        });
        if(!isCurrent()) return {success:false,error:"cancelled"};
        if(globalThis.crypto?.subtle){
            const digest = await globalThis.crypto.subtle.digest("SHA-256", doc.buffer);
            doc.contentHash = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2,"0")).join("");
        }
        if(!isCurrent()) return {success:false,error:"cancelled"};
        const existing = window.rbDocumentLibrary.find(other => other !== doc && other.status === "ready" && (doc.contentHash ? other.contentHash === doc.contentHash : other.uploadKey === uploadKey));
        if(existing){
            window.rbDocumentLibrary = window.rbDocumentLibrary.filter(other => other !== doc);
            window.rbDocumentHistory = window.rbDocumentHistory.filter(other => other.id !== doc.id);
            window.rbActiveDocument = existing;
            window.lastDocumentInfo = {type:existing.type,label:existing.subtype,confidence:existing.confidence};
            say(`Questo PDF è già stato letto. Uso i dati di "${existing.fileName}" senza ripetere l’analisi.`, `This PDF has already been read. Using "${existing.fileName}" without repeating the analysis.`);
            return {success:true,duplicate:true,document:existing};
        }
        if(typeof window.rbExtractPDFText === "function") await window.rbExtractPDFText(doc);
        if(!isCurrent()) return {success:false,error:"cancelled"};
        if(doc.extractionStatus !== "ready" || !doc.extractedText?.trim()){
            doc.status = "unreadable";
            doc.analysis = null;
            doc.executiveContext = null;
            const reason = doc.extractionStatus || "unavailable";
            const messages = {
                no_text:["Il PDF non contiene testo estraibile: potrebbe essere una scansione. Per ora carica un PDF con testo selezionabile.","The PDF has no extractable text and may be scanned. Please upload a PDF with selectable text."],
                password_required:["Il PDF è protetto da password. Carica una copia non protetta.","The PDF is password protected. Upload an unprotected copy."],
                too_many_pages:["Il PDF supera 100 pagine. Carica le pagine rilevanti.","The PDF exceeds 100 pages. Upload the relevant pages."],
                too_much_text:["Il PDF contiene troppo testo. Carica una sezione più breve.","The PDF contains too much text. Upload a shorter section."],
                unavailable:["Il lettore PDF non è disponibile. Riprova dopo aver aggiornato la pagina.","The PDF reader is unavailable. Refresh the page and try again."]
            };
            say(...(messages[reason] || ["Non riesco a leggere questo PDF. Verifica il file e riprova.","I could not read this PDF. Check the file and try again."]));
            return {success:false,error:reason,document:doc};
        }
        doc.status = "ready";
        if(typeof window.rbRunDocumentReasoning === "function") await window.rbRunDocumentReasoning(doc);
        if(!isCurrent()) return {success:false,error:"cancelled"};
        const analysis = doc.analysis || {};
        const known = ["propertyPrice","roi","equity","mortgage","cashflow","gross","risk","occupancy"].filter(key => analysis[key] !== null && analysis[key] !== undefined);
        window.rbPDFConversationDocumentId = doc.id;
        const response = window.rbBuildPDFResponse("Riassumi questo PDF", doc);
        window.addMessage?.("bot", `PDF letto: ${doc.pageCount || 0} ${window.currentLang === "en" ? "pages" : "pagine"}.\n${window.currentLang === "en" ? response.textEN : response.textIT}`);
        doc.dataQuality = {
            recognizedFields:known,
            missingFields:["propertyPrice","equity","gross","cashflow"].filter(key => analysis[key] === null || analysis[key] === undefined),
            source:"extracted_pdf_text",
            pageCount:doc.pageCount || 0
        };
        window.rbDocumentEvents.emit("document_ready", doc);
        return {success:true,document:doc,classification};
    } catch(error){
        if(!isCurrent()) return {success:false,error:"cancelled"};
        doc.status = "failed"; doc.analysis = null; doc.executiveContext = null;
        say("Non riesco a completare la lettura del PDF. Riprova con una copia valida.","I could not finish reading the PDF. Try a valid copy.");
        return {success:false,error:"read_failed",document:doc};
    } finally {
        // The extracted text is sufficient for follow-up questions; release binary data.
        doc.buffer = null;
    }
};
