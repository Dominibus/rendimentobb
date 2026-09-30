/* Explicit file capabilities: never pretend an unsupported file was analyzed. */
window.rbFileDispatcher = (function(){
    async function dispatch(file){
        if(!file) return {success:false,error:"no_file"};
        const extension = String(file.name || "").split(".").pop().toLowerCase();
        if(extension === "pdf" && typeof window.rbAnalyzeUploadedPDF === "function"){
            return window.rbAnalyzeUploadedPDF(file);
        }
        window.addMessage?.("assistant", window.currentLang === "en"
          ? "This format is not supported yet. Upload a PDF with selectable text; images, scans, Word and Excel are not analyzed."
          : "Questo formato non è ancora supportato. Carica un PDF con testo selezionabile; immagini, scansioni, Word ed Excel non vengono analizzati.");
        return {success:false,error:"unsupported"};
    }
    return {dispatch};
})();
