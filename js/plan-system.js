// ===============================
// 🧠 PLAN SYSTEM – SINGLE SOURCE (ULTRA)
// ===============================

window.PLAN = {

  current: "free",
  role: "user",

  // limiti runtime
  limits: {
    simulations: 3 // default free
  },

  usage: {
    simulations: 0
  },

  // ===============================
  // SET PLAN (SANITIZE + SYNC)
  // ===============================
  set(plan, role){

    const cleanPlan = String(plan || "free")
      .toLowerCase()
      .trim()
      .replace(/[^a-z_]/g,"");

    const cleanRole = String(role || "user")
      .toLowerCase()
      .trim();

    this.current = cleanPlan;
    this.role = cleanRole;

    window.currentPlan = cleanPlan;
    window.userRole = cleanRole;

    // ===============================
    // 🎯 LIMITI PER PIANO
    // ===============================

    if(cleanPlan === "free"){
      this.limits.simulations = 3;
    }

    if(cleanPlan === "investor"){
      this.limits.simulations = 10; // 👈 LIMITATO
    }

    if(cleanPlan === "pro" || cleanPlan === "pro_yearly"){
      this.limits.simulations = Infinity; // 👈 UNLIMITED
    }

    console.log("🧠 PLAN SYSTEM SET:", cleanPlan, cleanRole);

    window.dispatchEvent(new Event("plan_updated"));
  },

  // ===============================
  // CHECKS
  // ===============================
  isPro(){
    return ["pro","pro_yearly"].includes(this.current);
  },

  isInvestor(){
    return this.current === "investor";
  },

  isAdmin(){
    return this.role === "admin";
  },

  has(required){

    if(this.isAdmin()) return true;

    if(required === "pro"){
      return this.isPro();
    }

    if(required === "investor"){
      return ["investor","pro","pro_yearly"].includes(this.current);
    }

    return true;
  },

  // ===============================
  // 🚫 BLOCCO SIMULAZIONI
  // ===============================
  canSimulate(){

    if(this.isAdmin()) return true;

    return this.usage.simulations < this.limits.simulations;
  },

  registerSimulation(){
    this.usage.simulations++;

    console.log("📊 Simulation count:", this.usage.simulations);
  },

  // ===============================
  // 🚫 PDF ACCESS
  // ===============================
  canDownloadPDF(){
    return this.isPro();
  },

  // ===============================
  // 🚫 DASHBOARD AVANZATA
  // ===============================
  canAccessAdvancedDashboard(){
    return this.isPro();
  }

};

// alias globali
window.isPro = () => window.PLAN.isPro();
window.isInvestor = () => window.PLAN.isInvestor();
window.isAdmin = () => window.PLAN.isAdmin();
window.hasPlan = (p) => window.PLAN.has(p);
