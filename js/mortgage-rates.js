// Illustrative financing assumptions. No bank feeds or automatic market update.
(function(){
  const rates = [3.45,3.60,3.50,3.40,3.55,3.48,3.52];
  const keys = ['intesa','unicredit','bnl','credit_agricole','bpm','mediolanum','chebanca'];
  window.RB_MORTGAGE_RATES = Object.fromEntries(keys.map((key,index)=>[key,{name:{it:`Scenario ${index+1}`,en:`Scenario ${index+1}`},rate:rates[index]}]));
  window.RB_MORTGAGE_RATES_META = {dataType:'illustrative-assumptions',source:'internal-static',marketUpdatedAt:null};
  window.updateMortgageRates = function(newRates){
    if(!newRates || typeof newRates !== 'object' || Array.isArray(newRates)) return false;
    const entries = Object.entries(newRates);
    if(!entries.length || entries.length > 20 || entries.some(([,value])=>!value || !Number.isFinite(value.rate) || value.rate < 0 || value.rate > 100)) return false;
    window.RB_MORTGAGE_RATES = newRates;
    window.RB_MORTGAGE_RATES_META = {dataType:'user-assumptions',source:'manual-input',marketUpdatedAt:null};
    return true;
  };
})();
