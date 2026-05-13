// ===============================================
// RENDIMENTOBB – AI CHATBOT UI 1.0
// ===============================================

document.addEventListener("DOMContentLoaded", initRBChatbot);

document.addEventListener(
  "rb_language_changed",
  ()=>{
    document.getElementById("rb-chatbot-wrapper")?.remove();
    initRBChatbot();
  }
);

function initRBChatbot(){

  if(document.getElementById("rb-chatbot-wrapper")) return;

  const wrapper = document.createElement("div");

  wrapper.id = "rb-chatbot-wrapper";

  wrapper.innerHTML = `

  <div id="rb-chatbot-button">
    ✨
  </div>

  <div id="rb-chatbot-window">

    <div class="rb-chat-header">

      <div class="rb-chat-title">
        ${window.t(
          "AI Investment Assistant",
          "AI Investment Assistant"
        )}
      </div>

      <div class="rb-chat-subtitle">
        ${window.t(
          "Powered by RendimentoBB",
          "Powered by RendimentoBB"
        )}
      </div>

    </div>

    <div id="rb-chat-messages">

      <div class="rb-bot-message">

        ${window.t(
          "Ciao 👋 Posso aiutarti ad analizzare investimenti B&B.",
          "Hi 👋 I can help you analyze B&B investments."
        )}

      </div>

    </div>

    <div class="rb-chat-input-area">

      <input
        type="text"
        id="rb-chat-input"

        placeholder="${window.t(
          'Scrivi un messaggio...',
          'Write a message...'
        )}"
      >

      <button id="rb-chat-send">
        ➜
      </button>

    </div>

  </div>
  `;

  document.body.appendChild(wrapper);

  const button = document.getElementById("rb-chatbot-button");
  const chatWindow = document.getElementById("rb-chatbot-window");

  button.onclick = ()=>{
    chatWindow.classList.toggle("open");
  };

  const sendBtn = document.getElementById("rb-chat-send");
  const input = document.getElementById("rb-chat-input");

  function sendMessage(){

    const text = input.value.trim();

    if(!text) return;

    const messages = document.getElementById("rb-chat-messages");

    messages.innerHTML += `
      <div class="rb-user-message">
        ${text}
      </div>
    `;

    const response = window.generateAIResponse(text);

    messages.innerHTML += `
      <div class="rb-bot-message">
        ${response}
      </div>
    `;

    input.value = "";

    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn.onclick = sendMessage;

  input.addEventListener("keypress", e=>{
    if(e.key === "Enter"){
      sendMessage();
    }
  });

}
