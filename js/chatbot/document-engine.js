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
    if(/(manc|missing|complet|sufficient)/i.test(query)) return null;
    const a = doc.analysis || {};
    const has = key => a[key] !== null && a[key] !== undefined && a[key] !== "" && Number.isFinite(Number(a[key]));
    const labels = {propertyPrice:["Prezzo immobile","Property price"],roi:["ROI riportato","Reported ROI"],equity:["Capitale proprio","Equity"],mortgage:["Mutuo","Loan"],cashflow:["Cashflow annuo riportato","Reported annual cash flow"],gross:["Ricavi annui riportati","Reported annual revenue"],risk:["Rischio riportato","Reported risk"],occupancy:["Occupazione riportata","Reported occupancy"]};
    const format = (key,value,lang) => ["roi","occupancy"].includes(key) ? `${Number(value)}%` : key === "risk" ? `${Number(value)}/100` : new Intl.NumberFormat(lang === "en" ? "en-GB" : "it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(Number(value));
    const compare = /(confront|compar)/i.test(query);
    const render = lang => {
        const en = lang === "en";
        const lines = [en ? `Source: ${doc.fileName}` : `Fonte: ${doc.fileName}`];
        const keys = Object.keys(labels).filter(has);
        if(!keys.length) lines.push(en ? "Text extracted, but insufficient financial data recognized for an investment analysis." : "Testo estratto, ma non ho riconosciuto dati finanziari sufficienti per analizzare l’investimento.");
        for(const key of keys){
            let line = `${labels[key][en ? 1 : 0]}: ${format(key,a[key],lang)}`;
            // Compare only identically named metrics; do not substitute ROI on property for ROI on equity.
            if(compare && key !== "roi" && live[key] !== null && live[key] !== undefined && live[key] !== "" && Number.isFinite(Number(live[key]))) line += en ? ` | current simulation: ${format(key,live[key],lang)}` : ` | simulazione attuale: ${format(key,live[key],lang)}`;
            lines.push(line);
        }
        if(compare) lines.push(en ? "Only matching recognized metrics are compared. ROI requires the same calculation basis; missing simulation values are not estimated." : "Confronto solo indicatori omogenei riconosciuti. Per il ROI serve la stessa base di calcolo; i dati mancanti della simulazione non vengono stimati.");
        else {
            if(has("cashflow")) lines.push(Number(a.cashflow) > 0 ? (en ? "The reported annual cash flow is positive. Check which operating costs, taxes and loan payments the report includes." : "Il cashflow annuo riportato è positivo. Verifica quali costi operativi, imposte e rate del mutuo include il report.") : (en ? "The reported annual cash flow is zero or negative; check costs and financing." : "Il cashflow annuo riportato è nullo o negativo: verifica costi e finanziamento."));
            if(has("mortgage") && has("propertyPrice") && Number(a.propertyPrice)>0) lines.push(en ? `Loan/property price ratio calculated from the PDF: ${(100*Number(a.mortgage)/Number(a.propertyPrice)).toFixed(1)}%.` : `Rapporto mutuo/prezzo calcolato dai valori del PDF: ${(100*Number(a.mortgage)/Number(a.propertyPrice)).toFixed(1)}%.`);
        }
        lines.push(en ? "These are reported figures and assumptions, not verified operating results. Missing metrics are not replaced with simulation defaults." : "Sono valori e ipotesi riportati nel documento, non risultati operativi verificati. Gli indicatori mancanti non vengono sostituiti con valori della simulazione.");
        return lines.join("\n");
    };
    return {type:"document_grounded",confidence:1,textIT:render("it"),textEN:render("en"),suggestionsIT:["Quali dati mancano nel PDF?","Confrontalo con la simulazione"],suggestionsEN:["Which data are missing in the PDF?","Compare it with the simulation"],signals:["current_pdf_only"],metadata:{source:"extracted_pdf_text",fileName:doc.fileName,documentId:doc.id}};
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
