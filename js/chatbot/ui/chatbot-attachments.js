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

        fileInput.accept = `
            .pdf,
            .doc,
            .docx,
            .xls,
            .xlsx,
            .csv,
            .png,
            .jpg,
            .jpeg,
            .webp
        `;

        fileInput.style.display = "none";

        document.body.appendChild(fileInput);

        fileInput.addEventListener(
            "change",
            onFileSelected
        );

        console.log(
            "📎 ATTACHMENTS READY"
        );

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

        console.log(
            "📎 FILE SELECTED",
            file
        );

        window.rbFileDispatcher.dispatch(
         file
       );

        event.target.value = "";

    }

    return{

        init,

        open

    };

})();
