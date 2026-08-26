(function(){
  "use strict";

  // =====================================
  // HOME PANEL NAVIGATION
  // =====================================

  function openHomePanel(panelName, shouldScroll){

    const tabs =
      document.querySelectorAll(
        "[data-rb-panel-target]"
      );

    const panels =
      document.querySelectorAll(
        "[data-rb-home-panel]"
      );

    if(
      !tabs.length ||
      !panels.length
    ){
      return;
    }

    tabs.forEach(tab => {

      const isActive =
        tab.dataset.rbPanelTarget ===
        panelName;

      tab.classList.toggle(
        "is-active",
        isActive
      );

      tab.setAttribute(
        "aria-selected",
        String(isActive)
      );

    });

    panels.forEach(panel => {

      panel.hidden =
        panel.dataset.rbHomePanel !==
        panelName;

    });

    if(shouldScroll){

      document
        .getElementById(
          "rb-home-experience"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    }

    // Il pannello pricing potrebbe essere aperto
    // dopo il caricamento asincrono del piano.
    if(panelName === "pricing"){
      syncCurrentPricingPlan();
    }

  }

  window.rbOpenHomePanel =
    openHomePanel;

  // =====================================
  // CURRENT PRICING PLAN
  // Usa esclusivamente Firestore plan.
  // Non utilizza il profilo role.
  // =====================================

  function getPricingButtons(){

    return [

      {
        plan: "investor",
        button:
          document.querySelector(
            ".plan-investor button"
          )
      },

      {
        plan: "pro",
        button:
          document.querySelector(
            ".plan-pro button"
          )
      },

      {
        plan: "pro_yearly",
        button:
          document.querySelector(
            ".plan-yearly button"
          )
      }

    ];

  }

  function saveOriginalButtonState(button){

    if(!button){
      return;
    }

    if(
      button.dataset.rbOriginalStateSaved ===
      "true"
    ){
      return;
    }

    button.dataset.rbOriginalStateSaved =
      "true";

    button.dataset.rbOriginalIt =
      button.getAttribute("data-it") ||
      button.textContent.trim();

    button.dataset.rbOriginalEn =
      button.getAttribute("data-en") ||
      button.textContent.trim();

    button.dataset.rbOriginalOnclick =
      button.getAttribute("onclick") ||
      "";

  }

  function restorePricingButton(button){

    if(!button){
      return;
    }

    saveOriginalButtonState(button);

    button.disabled = false;

    button.removeAttribute(
      "aria-current"
    );

    button.classList.remove(
      "rb-current-plan"
    );

    const originalIt =
      button.dataset.rbOriginalIt;

    const originalEn =
      button.dataset.rbOriginalEn;

    const originalOnclick =
      button.dataset.rbOriginalOnclick;

    if(originalIt){
      button.setAttribute(
        "data-it",
        originalIt
      );
    }

    if(originalEn){
      button.setAttribute(
        "data-en",
        originalEn
      );
    }

    if(originalOnclick){
      button.setAttribute(
        "onclick",
        originalOnclick
      );
    }

    button.textContent =
      window.currentLang === "en"
        ? originalEn
        : originalIt;

  }

  function markCurrentPricingButton(
    button
  ){

    if(!button){
      return;
    }

    saveOriginalButtonState(button);

    button.disabled = true;

    button.removeAttribute(
      "onclick"
    );

    button.setAttribute(
      "aria-current",
      "true"
    );

    button.classList.add(
      "rb-current-plan"
    );

    button.setAttribute(
      "data-it",
      "✓ Piano attuale"
    );

    button.setAttribute(
      "data-en",
      "✓ Current plan"
    );

    button.textContent =
      window.currentLang === "en"
        ? "✓ Current plan"
        : "✓ Piano attuale";

  }

  function syncCurrentPricingPlan(){

    const currentPlan =
      String(
        window.currentPlan || "free"
      )
      .trim()
      .toLowerCase();

    const pricingButtons =
      getPricingButtons();

    pricingButtons.forEach(item => {

      restorePricingButton(
        item.button
      );

    });

    // Un piano Free non corrisponde
    // a nessuna delle tre schede a pagamento.
    if(currentPlan === "free"){
      return;
    }

    const currentItem =
      pricingButtons.find(
        item =>
          item.plan === currentPlan
      );

    if(currentItem){
      markCurrentPricingButton(
        currentItem.button
      );
    }

  }

  window.rbSyncCurrentPricingPlan =
    syncCurrentPricingPlan;

  // =====================================
  // GLOBAL PANEL TRIGGERS
  // =====================================

  document.addEventListener(
    "click",
    event => {

      const simulatorTrigger =
        event.target.closest(
          '[onclick*="qr_price"]'
        );

      const pricingTrigger =
        event.target.closest(
          '[onclick*="pricing"]'
        );

      if(simulatorTrigger){

        openHomePanel(
          "simulator",
          false
        );

      }

      if(pricingTrigger){

        openHomePanel(
          "pricing",
          false
        );

      }

    },
    true
  );

  // =====================================
  // DOM READY
  // =====================================

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      document
        .querySelectorAll(
          "[data-rb-panel-target]"
        )
        .forEach(tab => {

          tab.addEventListener(
            "click",
            () => {

              openHomePanel(
                tab.dataset.rbPanelTarget,
                false
              );

            }
          );

        });

      document
        .querySelectorAll(
          "[data-rb-open-panel]"
        )
        .forEach(trigger => {

          trigger.addEventListener(
            "click",
            event => {

              event.preventDefault();

              openHomePanel(
                trigger.dataset.rbOpenPanel,
                true
              );

            }
          );

        });

      openHomePanel(
        "simulator",
        false
      );

      syncCurrentPricingPlan();

    }
  );

  // =====================================
  // FIREBASE / PLAN EVENTS
  // =====================================

  window.addEventListener(
    "rb_plan_ready",
    syncCurrentPricingPlan
  );

  window.addEventListener(
    "plan_updated",
    syncCurrentPricingPlan
  );

  document.addEventListener(
    "rb_plan_loaded",
    syncCurrentPricingPlan
  );

  document.addEventListener(
    "rb_auth_ready",
    syncCurrentPricingPlan
  );

})();
