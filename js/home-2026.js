(function(){
  "use strict";

  function openHomePanel(panelName, shouldScroll){
    const tabs = document.querySelectorAll("[data-rb-panel-target]");
    const panels = document.querySelectorAll("[data-rb-home-panel]");

    if(!tabs.length || !panels.length) return;

    tabs.forEach(tab => {
      const isActive = tab.dataset.rbPanelTarget === panelName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach(panel => {
      panel.hidden = panel.dataset.rbHomePanel !== panelName;
    });

    if(shouldScroll){
      document.getElementById("rb-home-experience")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  window.rbOpenHomePanel = openHomePanel;

  document.addEventListener("click", event => {
    const simulatorTrigger = event.target.closest('[onclick*="qr_price"]');
    const pricingTrigger = event.target.closest('[onclick*="pricing"]');

    if(simulatorTrigger){
      openHomePanel("simulator", false);
    }

    if(pricingTrigger){
      openHomePanel("pricing", false);
    }
  }, true);

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-rb-panel-target]").forEach(tab => {
      tab.addEventListener("click", () => {
        openHomePanel(tab.dataset.rbPanelTarget, false);
      });
    });

    document.querySelectorAll("[data-rb-open-panel]").forEach(trigger => {
      trigger.addEventListener("click", event => {
        event.preventDefault();
        openHomePanel(trigger.dataset.rbOpenPanel, true);
      });
    });

    openHomePanel("simulator", false);
  });
})();
