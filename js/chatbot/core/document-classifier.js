// ===============================================
// 🧠 RB DOCUMENT CLASSIFIER
// Version 1.0
// ===============================================

(function(){

"use strict";

function classifyDocument(file){

    if(!file){

        return{

            type:"unknown",

            label:"Documento sconosciuto",

            confidence:0

        };

    }

    const name=(file.name || "").toLowerCase();

    // ===================================
    // Executive Report
    // ===================================

if(

    name.includes("rendimentobb-report") ||

    name.includes("rendimentobb_report") ||

    name.includes("rendimentobb") ||

    name.includes("executive") ||

    (
        name.includes("roi") &&
        name.includes("rendimentobb")
    )

){

        return{

            type:"executive_report",

            label:"Executive Report",

            confidence:100

        };

    }

    // ===================================
    // Dashboard
    // ===================================

    if(

        name.includes("dashboard")

    ){

        return{

            type:"dashboard_report",

            label:"Dashboard Report",

            confidence:95

        };

    }

    // ===================================
    // Mortgage
    // ===================================

    if(

        name.includes("mutuo") ||

        name.includes("mortgage")

    ){

        return{

            type:"mortgage",

            label:"Documento Mutuo",

            confidence:90

        };

    }

    // ===================================
    // Land Registry
    // ===================================

    if(

        name.includes("visura") ||

        name.includes("catasto")

    ){

        return{

            type:"land_registry",

            label:"Visura Catastale",

            confidence:90

        };

    }

    // ===================================
    // Generic PDF
    // ===================================

    if(

        name.endsWith(".pdf")

    ){

        return{

            type:"generic_pdf",

            label:"Documento PDF",

            confidence:50

        };

    }

    return{

        type:"unknown",

        label:"Documento sconosciuto",

        confidence:0

    };

}

window.rbClassifyDocument=
classifyDocument;

// Production: nessun log

})();
