// ===============================================
// 📄 PDF EXTRACTION ENGINE 1.2
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
        // PDF.JS AVAILABILITY
        // ===========================================

        if(
            !window.pdfjsLib ||
            typeof window.pdfjsLib.getDocument !==
            "function"
        ){

            console.warn(
                "⚠️ PDF.js NOT AVAILABLE"
            );

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

        const extractedPages = [];

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

        console.log(
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
