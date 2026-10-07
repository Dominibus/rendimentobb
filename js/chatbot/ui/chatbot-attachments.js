// ===============================================
// 📎 RENDIMENTOBB AI - ATTACHMENTS MODULE
// ===============================================

window.rbChatAttachments = (function(){

    let fileInput = null;

    function init(){

        if(fileInput){
            return;
        }

        fileInput = document.createElement("input");

        fileInput.type = "file";

        fileInput.accept = ".pdf";

        fileInput.style.display = "none";

        document.body.appendChild(fileInput);

        fileInput.addEventListener(
            "change",
            onFileSelected
        );

        if(window.RB_DEBUG === true){
            console.debug("📎 ATTACHMENTS READY");
        }

    }

    function open(){

        if(!fileInput){

            init();

        }

        fileInput.click();

    }

    function onFileSelected(event){

        const file =
            event.target.files[0];

        if(!file){

            return;

        }

        if(window.RB_DEBUG === true){
            console.debug("📎 FILE SELECTED", file);
        }

        // Dispatcher owns progress and completion messages.
        Promise.resolve(window.rbFileDispatcher.dispatch(file)).catch(() => {
            window.addMessage?.("assistant", window.currentLang === "en"
                ? "The file could not be processed. Please try again."
                : "Non riesco a elaborare il file. Riprova.");
        });

        event.target.value = "";

    }

    return{

        init,

        open

    };

})();
