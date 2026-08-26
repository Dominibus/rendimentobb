// ===============================
// 🧠 PLAN SYSTEM – SINGLE SOURCE
// ===============================

window.PLAN = {

  current: "free",
  role: "user",

  // Limiti simulazioni per piano
  limits: {
    simulations: 3
  },

  usage: {
    simulations: 0
  },

  // ===============================
  // SET PLAN
  // ===============================

  set(plan, role){

    const cleanPlan =
      String(plan || "free")
        .toLowerCase()
        .trim()
        .replace(/[^a-z_]/g, "");

    const cleanRole =
      String(role || "user")
        .toLowerCase()
        .trim();

    this.current =
      cleanPlan;

    this.role =
      cleanRole;

    window.currentPlan =
      cleanPlan;

    window.userRole =
      cleanRole;

    // ===============================
    // LIMITI PER PIANO
    // ===============================

    if(cleanPlan === "free"){

      this.limits.simulations =
        3;

    }

    if(cleanPlan === "investor"){

      this.limits.simulations =
        50;

    }

    if(
      cleanPlan === "pro" ||
      cleanPlan === "pro_yearly"
    ){

      this.limits.simulations =
        Infinity;

    }

    window.dispatchEvent(
      new Event("plan_updated")
    );

  },

  // ===============================
  // CHECKS
  // ===============================

  isPro(){

    return [
      "pro",
      "pro_yearly"
    ].includes(this.current);

  },

  isInvestor(){

    return (
      this.current ===
      "investor"
    );

  },

  isAdmin(){

    return (
      this.role ===
      "admin"
    );

  },

  has(required){

    if(this.isAdmin()){
      return true;
    }

    if(required === "pro"){

      return this.isPro();

    }

    if(required === "investor"){

      return [
        "investor",
        "pro",
        "pro_yearly"
      ].includes(this.current);

    }

    return true;

  },

  // ===============================
  // SIMULATION LIMIT
  // ===============================

  canSimulate(){

    if(this.isAdmin()){
      return true;
    }

    return (
      this.usage.simulations <
      this.limits.simulations
    );

  },

  registerSimulation(){

    this.usage.simulations++;

  },

  // ===============================
  // PDF ACCESS
  // ===============================

  canDownloadPDF(){

    return (
      this.isPro() ||
      this.isAdmin()
    );

  },

  // ===============================
  // ADVANCED DASHBOARD ACCESS
  // ===============================

  canAccessAdvancedDashboard(){

    return (
      this.isPro() ||
      this.isAdmin()
    );

  }

};

// ===============================
// GLOBAL ALIASES
// ===============================

window.isPro =
  () => window.PLAN.isPro();

window.isInvestor =
  () => window.PLAN.isInvestor();

window.isAdmin =
  () => window.PLAN.isAdmin();

window.hasPlan =
  plan => window.PLAN.has(plan);
