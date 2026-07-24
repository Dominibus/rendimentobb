// ===============================================
// 📄 PDF EXTRACTION ENGINE 1.1
// RendimentoBB AI
// ===============================================

"use strict";

window.rbExtractPDFText = async function(documentObject){

    try{

        if(
            !documentObject ||
            !documentObject.buffer
        ){

            return documentObject;

        }

        // ===========================================
        // TEMPORARY PLACEHOLDER
        // (PDF.js arriverà nello step successivo)
        // ===========================================

        documentObject.extractedText =
            "[PDF LOADED - EXTRACTION PENDING]";

        console.log(
            "📄 PDF TEXT READY",
            documentObject.extractedText
        );

        // ===========================================
        // EXECUTIVE PARSER
        // ===========================================

        if(
            typeof window.rbParseExecutivePDF ===
            "function"
        ){

            console.log(
                "🧠 START PDF PARSER"
            );

            await window.rbParseExecutivePDF(
                documentObject
            );

            console.log(
                "🧠 PDF PARSER COMPLETED"
            );

        }

        else{

            console.warn(
                "⚠️ rbParseExecutivePDF NOT FOUND"
            );

        }

        return documentObject;

    }

    catch(error){

        console.warn(
            "PDF Extraction Error",
            error
        );

        return documentObject;

    }

};

console.log(
    "📄 PDF EXTRACTION ENGINE READY"
);
