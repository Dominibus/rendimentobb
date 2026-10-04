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

    let loadingTask = null;
    let timeoutId = null;
    let pdfDocument = null;

    try{

        if(
            !documentObject ||
            !documentObject.buffer
        ){

            return documentObject;

        }

        documentObject.extractedText = "";
        documentObject.textPages = [];
        documentObject.pageCount = 0;
        documentObject.analysis = null;
        documentObject.executiveContext = null;

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
            "/js/vendor/pdfjs/pdf.worker.min.mjs";

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

        loadingTask = window.pdfjsLib.getDocument({
            data: pdfData,
            isEvalSupported: false,
            disableFontFace: true,
            useWasm: false,
            standardFontDataUrl: "/js/vendor/pdfjs/standard_fonts/"
        });

        // One deadline covers loading and every page, not a new deadline per page.
        const timeout = new Promise((resolve, reject) => {
            timeoutId = setTimeout(() => {
                const error = new Error("PDF reading deadline exceeded");
                error.name = "PDFReadTimeoutError";
                reject(error);
            }, 60000);
        });
        pdfDocument = await Promise.race([loadingTask.promise, timeout]);

        if(pdfDocument.numPages > 100){
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

                await Promise.race([pdfDocument.getPage(
                    pageNumber
                ), timeout]);

            const textContent =

                await Promise.race([page.getTextContent(), timeout]);

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
        clearTimeout(timeoutId);
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

        documentObject.extractedText = "";
        documentObject.textPages = [];
        documentObject.pageCount = 0;
        documentObject.analysis = null;
        documentObject.executiveContext = null;
        documentObject.extractionStatus = error?.name === "PasswordException"
            ? "password_required"
            : error?.name === "PDFReadTimeoutError" ? "timeout" : "failed";
        console.error("PDF Extraction Error");
        rbPDFDebugWarn(error);

        return documentObject;

    }

    finally{
        if(timeoutId !== null) clearTimeout(timeoutId);
        if(loadingTask){
            try{
                if(typeof loadingTask.destroy === "function") await loadingTask.destroy();
                else await pdfDocument?.destroy?.();
            }catch(error){
                rbPDFDebugWarn("PDF worker cleanup failed", error);
            }
        }
    }

};

// Production: nessun log
