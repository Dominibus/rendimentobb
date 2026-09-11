// ==========================================
// 📂 CHATBOT FILE DISPATCHER
// ==========================================

window.rbFileDispatcher = (function(){

    const debug = (...args) => {
        if(window.RB_DEBUG === true) console.debug(...args);
    };

    const debugWarn = (...args) => {
        if(window.RB_DEBUG === true) console.warn(...args);
    };

    function dispatch(file){

        if(!file){

            return;

        }

        const extension =
            file.name
            .split(".")
            .pop()
            .toLowerCase();

        debug(
            "📂 FILE DISPATCHER",
            extension,
            file
        );

        switch(extension){

            case "pdf":

                return dispatchPDF(file);

            case "png":
            case "jpg":
            case "jpeg":
            case "webp":

                return dispatchImage(file);

            case "xls":
            case "xlsx":
            case "csv":

                return dispatchSpreadsheet(file);

            case "doc":
            case "docx":

                return dispatchDocument(file);

            default:

                debugWarn(
                    "Unsupported file",
                    extension
                );

        }

    }

function dispatchPDF(file){

    debug(
        "📄 PDF DETECTED",
        file.name
    );

    if(
        typeof window.rbAnalyzeUploadedPDF ===
        "function"
    ){

        return window.rbAnalyzeUploadedPDF(
            file
        );

    }

    debugWarn(
        "Document Engine non disponibile."
    );

}
    function dispatchImage(file){

        debug(
            "🖼 IMAGE DETECTED",
            file.name
        );

    }

    function dispatchSpreadsheet(file){

        debug(
            "📊 EXCEL DETECTED",
            file.name
        );

    }

    function dispatchDocument(file){

        debug(
            "📄 WORD DETECTED",
            file.name
        );

    }

    return{

        dispatch

    };

})();
