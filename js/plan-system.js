// ===============================
// 🧠 PLAN SYSTEM – SINGLE SOURCE
// ===============================

window.PLAN = {

  current: "free",
  role: "user",

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

    console.log("🧠 PLAN SYSTEM SET:", cleanPlan, cleanRole);

    // evento globale unico
    window.dispatchEvent(new Event("plan_updated"));
  },

  // ===============================
  // CHECKS
  // ===============================
  isPro(){
    return ["pro","investor","pro_yearly"].includes(this.current);
  },

  isAdmin(){
    return this.role === "admin";
  },

  has(required){

    if(this.isAdmin()) return true;

    if(required === "pro"){
      return ["pro","pro_yearly"].includes(this.current);
    }

    if(required === "investor"){
      return ["investor","pro","pro_yearly"].includes(this.current);
    }

    return true;
  }

};

// alias globali (compatibilità)
window.isPro = () => window.PLAN.isPro();
window.isAdmin = () => window.PLAN.isAdmin();
window.hasPlan = (p) => window.PLAN.has(p);
