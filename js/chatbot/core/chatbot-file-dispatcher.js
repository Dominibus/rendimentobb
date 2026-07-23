// ==========================================
// 📂 CHATBOT FILE DISPATCHER
// ==========================================

window.rbFileDispatcher = (function(){

    function dispatch(file){

        if(!file){

            return;

        }

        const extension =
            file.name
            .split(".")
            .pop()
            .toLowerCase();

        console.log(
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

                console.warn(
                    "Unsupported file",
                    extension
                );

        }

    }

function dispatchPDF(file){

    console.log(
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

    console.warn(
        "Document Engine non disponibile."
    );

}
    function dispatchImage(file){

        console.log(
            "🖼 IMAGE DETECTED",
            file.name
        );

    }

    function dispatchSpreadsheet(file){

        console.log(
            "📊 EXCEL DETECTED",
            file.name
        );

    }

    function dispatchDocument(file){

        console.log(
            "📄 WORD DETECTED",
            file.name
        );

    }

    return{

        dispatch

    };

})();
