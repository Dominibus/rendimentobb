// ===============================================
// RENDIMENTOBB – MORTGAGE DATABASE ENGINE
// AUTO UPDATE + LANG.JS COMPATIBLE
// ===============================================

(function(){

const UPDATE_INTERVAL_DAYS = 7;


// ================= DEFAULT RATES =================

const DEFAULT_RATES = {

intesa:{
name:{
it:"Intesa Sanpaolo",
en:"Intesa Sanpaolo"
},
rate:3.45
},

unicredit:{
name:{
it:"UniCredit",
en:"UniCredit"
},
rate:3.60
},

bnl:{
name:{
it:"BNL",
en:"BNL"
},
rate:3.50
},

credit_agricole:{
name:{
it:"Credit Agricole",
en:"Credit Agricole"
},
rate:3.40
},

bpm:{
name:{
it:"Banco BPM",
en:"Banco BPM"
},
rate:3.55
}

};


// ================= LOAD =================

function loadRates(){

const saved = localStorage.getItem("rb_mortgage_rates");

if(!saved) return DEFAULT_RATES;

try{
return JSON.parse(saved);
}catch{
return DEFAULT_RATES;
}

}


// ================= SAVE =================

function saveRates(data){

localStorage.setItem(
"rb_mortgage_rates",
JSON.stringify(data)
);

localStorage.setItem(
"rb_mortgage_rates_date",
Date.now()
);

}


// ================= AUTO UPDATE =================

function checkAutoUpdate(){

const last =
parseInt(localStorage.getItem("rb_mortgage_rates_date") || "0");

const now = Date.now();

const days =
(now-last)/(1000*60*60*24);

if(days > UPDATE_INTERVAL_DAYS){

console.log("RB Mortgage rates auto update");

saveRates(DEFAULT_RATES);

}

}


// ================= INIT =================

checkAutoUpdate();

window.RB_MORTGAGE_RATES = loadRates();


// ================= LANGUAGE EVENT =================

document.addEventListener("rb_language_changed",()=>{

// niente calcoli qui
// app.js farà rerender automatico

});


// ================= MANUAL UPDATE =================

window.updateMortgageRates = function(newRates){

saveRates(newRates);

window.RB_MORTGAGE_RATES = newRates;

console.log("Mortgage rates updated");

};

})();
