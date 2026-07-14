// ===============================================
// 🧠 DOCUMENT ENGINE 1.0
// RendimentoBB AI Document Intelligence
// ===============================================

// ===============================================
// 📄 DOCUMENT MEMORY
// ===============================================

window.rbUploadedDocuments = [];

window.lastExecutiveReport = null;

// ===============================================
// 📄 REGISTER EXECUTIVE REPORT
// ===============================================

window.rbRegisterExecutiveReport = function(report){

    if(!report) return;

    window.lastExecutiveReport = report;

    console.log(
        "📄 Executive Report Registered",
        report
    );

};

// ===============================================
// 📄 REGISTER USER DOCUMENT
// ===============================================

window.rbRegisterUploadedDocument = function(document){

    if(!document) return;

    window.rbUploadedDocuments.push(document);

    console.log(
        "📄 User Document Registered",
        document
    );

};

// ===============================================
// 📄 GET DOCUMENT CONTEXT
// ===============================================

window.rbGetDocumentContext = function(){

    return {

        executiveReport:
            window.lastExecutiveReport,

        uploadedDocuments:
            window.rbUploadedDocuments

    };

};

// ===============================================
// 🚀 READY
// ===============================================

console.log(
    "📄 DOCUMENT ENGINE READY"
);
