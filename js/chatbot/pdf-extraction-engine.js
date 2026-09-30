// ===============================================
// 📄 PDF EXTRACTION ENGINE 1.2
// RendimentoBB AI
// ===============================================

"use strict";

const rbPDFDebug = (...args) => {
    if(window.RB_DEBUG === true) console.debug(...args);
};

const rbPDFDebugWarn = (...args) => {
    if(window.RB_DEBUG === true) console.warn(...args);
};

window.rbExtractPDFText = async function(documentObject){

    try{

        if(
            !documentObject ||
            !documentObject.buffer
        ){

            return documentObject;

        }

        // ===========================================
        // PDF.JS AVAILABILITY
        // ===========================================

        if(
            !window.pdfjsLib ||
            typeof window.pdfjsLib.getDocument !==
            "function"
        ){

            rbPDFDebugWarn(
                "⚠️ PDF.js NOT AVAILABLE"
            );

            documentObject.extractionStatus = "unavailable";
            return documentObject;

        }

        // ===========================================
        // PDF.JS WORKER
        // ===========================================

        window.pdfjsLib
            .GlobalWorkerOptions
            .workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        // ===========================================
        // SAFE PDF BUFFER
        // ===========================================

        const pdfData =

            documentObject.buffer instanceof
            Uint8Array

                ? new Uint8Array(
                    documentObject.buffer
                  )

                : new Uint8Array(
                    documentObject.buffer
                  );

        // ===========================================
        // REAL PDF TEXT EXTRACTION
        // ===========================================

        const pdfDocument =

            await window.pdfjsLib
                .getDocument({
                    data: pdfData
                })
                .promise;

        if(pdfDocument.numPages > 100){
            await pdfDocument.destroy?.();
            documentObject.extractionStatus = "too_many_pages";
            return documentObject;
        }
        const extractedPages = [];
        documentObject.textPages = [];
        let textLength = 0;

        for(
            let pageNumber = 1;
            pageNumber <= pdfDocument.numPages;
            pageNumber++
        ){

            const page =

                await pdfDocument.getPage(
                    pageNumber
                );

            const textContent =

                await page.getTextContent();

            const pageText =

                textContent
                    .items
                    .map(item =>
                        item.str
                    )
                    .join(" ")
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();

            documentObject.textPages.push({page:pageNumber, text:pageText});
            textLength += pageText.length;
            if(textLength > 250000){
                await pdfDocument.destroy?.();
                documentObject.extractionStatus = "too_much_text";
                documentObject.textPages = [];
                return documentObject;
            }
            if(pageText){

                extractedPages.push(
                    pageText
                );

            }

        }

        documentObject.extractedText =

            extractedPages
                .join("\n\n")
                .trim();

        documentObject.extractionStatus = documentObject.extractedText ? "ready" : "no_text";
        documentObject.pageCount = pdfDocument.numPages;
        await pdfDocument.destroy?.();
        if(!documentObject.extractedText) return documentObject;

        rbPDFDebug(
            "📄 PDF TEXT READY",
            {
                pages:
                    pdfDocument.numPages,

                characters:
                    documentObject
                        .extractedText
                        .length,

                preview:
                    documentObject
                        .extractedText
                        .slice(
                            0,
                            300
                        )
            }
        );

        // ===========================================
        // EXECUTIVE PARSER
        // ===========================================

        if(
            typeof window.rbParseExecutivePDF ===
            "function"
        ){

            rbPDFDebug(
                "🧠 START PDF PARSER"
            );

            await window.rbParseExecutivePDF(
                documentObject
            );

            rbPDFDebug(
                "🧠 PDF PARSER COMPLETED"
            );

        }

        else{

            rbPDFDebugWarn(
                "⚠️ rbParseExecutivePDF NOT FOUND"
            );

        }

        return documentObject;

    }

    catch(error){

        documentObject.extractionStatus = error?.name === "PasswordException" ? "password_required" : "failed";
        console.error("PDF Extraction Error");
        rbPDFDebugWarn(error);

        return documentObject;

    }

};

// Production: nessun log
