(() => {
  "use strict";

  const state = { language: "it", bookingId: "", token: "", ready: false, booking: null };
  const context = document.getElementById("stay-context");
  const form = document.getElementById("guest-report-form");
  const status = document.getElementById("form-status");
  const submitButton = document.getElementById("submit-button");

  const text = (it, en) => state.language === "en" ? en : it;
  const formatDate = value => {
    const date = new Date(`${value || ""}T12:00:00`);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString(state.language === "en" ? "en-GB" : "it-IT", { day: "2-digit", month: "short", year: "numeric" });
  };

  function applyLanguage(language){
    state.language = language === "en" ? "en" : "it";
    document.documentElement.lang = state.language;
    document.querySelectorAll("[data-it][data-en]").forEach(element => {
      element.textContent = element.dataset[state.language];
    });
    document.querySelectorAll("[data-it-placeholder][data-en-placeholder]").forEach(element => {
      element.placeholder = element.dataset[`${state.language}Placeholder`];
    });
    document.getElementById("lang-it").setAttribute("aria-pressed", String(state.language === "it"));
    document.getElementById("lang-en").setAttribute("aria-pressed", String(state.language === "en"));
    renderStayContext();
  }

  function renderStayContext(){
    if(!state.booking) return;
    context.textContent = text(
      `Ciao ${state.booking.guestFirstName}. Soggiorno ${formatDate(state.booking.checkin)} → ${formatDate(state.booking.checkout)}.`,
      `Hello ${state.booking.guestFirstName}. Stay ${formatDate(state.booking.checkin)} → ${formatDate(state.booking.checkout)}.`
    );
  }

  function showStatus(message, type){
    status.textContent = message;
    status.className = `status ${type}`;
  }

  async function request(payload){
    const response = await fetch("/api/guest-report", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ bookingId: state.bookingId, token: state.token, ...payload })
    });
    const result = await response.json().catch(() => ({}));
    if(!response.ok) throw new Error(result.error || "request_failed");
    return result;
  }

  async function initialize(){
    const storageKey = "rb_guest_report_access";
    let storedAccess = "";
    try{ storedAccess = sessionStorage.getItem(storageKey) || ""; }catch(_error){}
    const fragment = window.location.hash.slice(1) || storedAccess;
    const separator = fragment.indexOf(".");
    if(separator < 1){
      context.textContent = text("Collegamento non valido o incompleto.", "Invalid or incomplete link.");
      return;
    }
    state.bookingId = fragment.slice(0, separator);
    state.token = fragment.slice(separator + 1);
    try{ sessionStorage.setItem(storageKey, fragment); }catch(_error){}
    history.replaceState(null, "", `${location.pathname}${location.search}`);

    try{
      const result = await request({ action: "context" });
      state.booking = result.booking || {};
      renderStayContext();
      form.hidden = false;
      state.ready = true;
    }catch(_error){
      context.textContent = text(
        "Questo collegamento non è valido oppure è scaduto. Contatta direttamente l’host.",
        "This link is invalid or has expired. Please contact the host directly."
      );
      try{ sessionStorage.removeItem(storageKey); }catch(_storageError){}
    }
  }

  document.getElementById("lang-it").addEventListener("click", () => applyLanguage("it"));
  document.getElementById("lang-en").addEventListener("click", () => applyLanguage("en"));
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if(!state.ready) return;
    submitButton.disabled = true;
    try{
      await request({
        action: "submit",
        category: document.getElementById("category").value,
        priority: document.getElementById("priority").value,
        note: document.getElementById("note").value,
        website: document.getElementById("website").value
      });
      form.hidden = true;
      showStatus(text(
        "✅ Segnalazione inviata. L’host può già visualizzarla e gestirla.",
        "✅ Report sent. The host can now view and manage it."
      ), "success");
    }catch(error){
      const rateLimited = error.message === "too_many_requests";
      showStatus(text(
        rateLimited ? "Attendi un minuto prima di inviare una nuova segnalazione." : "Invio non riuscito. Controlla il collegamento e riprova.",
        rateLimited ? "Wait one minute before sending another report." : "Could not send the report. Check the link and try again."
      ), "error");
      submitButton.disabled = false;
    }
  });

  applyLanguage((navigator.language || "it").toLowerCase().startsWith("en") ? "en" : "it");
  initialize();
})();
