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

window.rbAnalyzeUploadedPDF = async function(file){
    const say = (it, en) => window.addMessage?.("assistant", window.currentLang === "en" ? en : it);
    if(!file || !/\.pdf$/i.test(file.name || "")) return {success:false,error:"unsupported"};
    if(file.size > 20 * 1024 * 1024){
        say("Il PDF supera 20 MB. Carica una versione più leggera.", "The PDF exceeds 20 MB. Upload a smaller version.");
        return {success:false,error:"too_large"};
    }
    const epoch = (window.rbDocumentEpoch || 0) + 1;
    window.rbDocumentEpoch = epoch;
    const isCurrent = () => epoch === window.rbDocumentEpoch;
    const classification = window.rbClassifyDocument?.(file) || {type:"generic_pdf",label:"PDF",confidence:0};
    const doc = window.rbCreateDocumentObject({file,type:classification.type,classification});
    doc.status = "reading";
    window.rbDocumentManager.add(doc);
    window.lastExecutiveReport = null;
    say(`Leggo il PDF "${file.name}"…`, `Reading PDF "${file.name}"…`);
    try {
        doc.buffer = typeof file.arrayBuffer === "function" ? await file.arrayBuffer() : await new Promise((resolve,reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("read_failed"));
            reader.readAsArrayBuffer(file);
        });
        if(!isCurrent()) return {success:false,error:"cancelled"};
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
        const labels = {propertyPrice:["prezzo immobile","property price"],roi:["ROI","ROI"],equity:["capitale proprio","equity"],mortgage:["mutuo","loan"],cashflow:["cashflow","cash flow"],gross:["ricavi","revenue"],risk:["rischio","risk"],occupancy:["occupazione","occupancy"]};
        const formatValue = key => {
            const value = Number(analysis[key]);
            if(!Number.isFinite(value)) return String(analysis[key]);
            if(["roi","occupancy"].includes(key)) return `${value}%`;
            if(key === "risk") return `${value}/100`;
            return new Intl.NumberFormat(window.currentLang === "en" ? "en-GB" : "it-IT", {style:"currency",currency:"EUR",maximumFractionDigits:2}).format(value);
        };
        const names = known.map(key => `${labels[key][window.currentLang === "en" ? 1 : 0]}: ${formatValue(key)}`).join("; ");
        say(`PDF letto: ${doc.pageCount || 0} pagine. ${names ? "Dati riconosciuti: " + names + "." : "Testo estratto; non ho riconosciuto indicatori finanziari sufficienti."}\nFonte: ${file.name}. I valori mancanti non vengono stimati.`,
            `PDF read: ${doc.pageCount || 0} pages. ${names ? "Recognized data: " + names + "." : "Text extracted; insufficient financial metrics recognized."}\nSource: ${file.name}. Missing values are not estimated.`);
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
