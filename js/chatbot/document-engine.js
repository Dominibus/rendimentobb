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
    console.log("DOCUMENT EVENT", event);
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

    console.log(
        "📄 ANALYZE UPLOADED DOCUMENT",
        file
    );

    if(!file){

        return{

            success:false,

            error:"No file supplied."

        };

    }

    // ===========================================
    // 🧠 DOCUMENT CLASSIFICATION
    // ===========================================

    const classification =

        window.rbClassifyDocument

            ? window.rbClassifyDocument(file)

            : {

                type:"generic",

                label:"Generic Document",

                confidence:0

            };

    console.log(
        "🧠 DOCUMENT TYPE",
        classification
    );

    // Compatibilità
    window.lastDocumentInfo = classification;

    // ===========================================
    // 👤 UI FEEDBACK
    // ===========================================

    if(typeof window.addMessage === "function"){

        window.addMessage(

            "assistant",

            "📄 Sto analizzando il documento..."

        );

    }

    // ===========================================
    // 📖 READ FILE
    // ===========================================

    return new Promise((resolve)=>{

        const reader = new FileReader();

        reader.onload = async function(){

            const buffer = reader.result;

            console.log(

                "📄 DOCUMENT LOADED",

                buffer

            );

            // ===================================
            // CREATE DOCUMENT OBJECT
            // ===================================

            const documentObject =

                window.rbCreateDocumentObject({

                    file,

                    type:

                        classification.type ||

                        "generic",

                    classification,

                    buffer

                });

            // ===================================
            // METADATA
            // ===================================

            documentObject.metadata = {

                uploadedAt:

                    new Date().toISOString(),

                fileName:

                    file.name,

                extension:

                    file.name.split(".").pop(),

                mimeType:

                    file.type,

                size:

                    file.size

            };

            // ===================================
            // AI SIGNALS
            // ===================================

            documentObject.aiSignals.push(

                {

                    type:"classification",

                    confidence:

                        classification.confidence,

                    label:

                        classification.label

                }

            );

            // ===================================
            // STORE DOCUMENT
            // ===================================

            window.rbDocumentManager.add(

                documentObject

            );

            // ===================================
            // EXECUTIVE REPORT
            // ===================================

            if(

                classification.type ===

                "executive_report"

            ){

                window.lastExecutiveReport =

                    documentObject;

            }

            // ===================================
// EXTRACTION
// ===================================

if(
    typeof window.rbExtractPDFText ===
    "function"
){

    await window.rbExtractPDFText(
        documentObject
    );

}

// ===================================
// DOCUMENT REASONING
// ===================================

if(
    typeof window.rbRunDocumentReasoning ===
    "function"
){

    await window.rbRunDocumentReasoning(
        documentObject
    );

}

// ===================================
// EVENTS
// ===================================

window.rbDocumentEvents.emit(
    "document_uploaded",
    documentObject
);

window.rbDocumentEvents.emit(
    "document_ready",
    documentObject
);

            // ===================================
            // UI
            // ===================================

            if(typeof window.addMessage === "function"){

                window.addMessage(

                    "assistant",

                    `✅ Documento "${file.name}" caricato correttamente.\n\nPosso analizzarlo, confrontarlo o rispondere alle tue domande.`

                );

            }

            resolve({

                success:true,

                document:documentObject,

                classification

            });

        };

        reader.onerror = function(){

            resolve({

                success:false,

                error:"File reading failed."

            });

        };

        reader.readAsArrayBuffer(file);

    });

};

// Production: nessun log
