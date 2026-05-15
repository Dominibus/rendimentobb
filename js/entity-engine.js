// ===============================================
// 🧠 ENTITY ENGINE
// ===============================================

window.rbExtractEntities = function(message){

  if(!message){

    return {};

  }

  const text =
    String(message).toLowerCase();

  const entities = {

    city: null,
    roi: null,
    occupancy: null,
    price: null,
    mortgage: false,
    risk: null,
    percentages: [],
    amounts: []

  };

  // ===========================================
  // 🌍 CITY DETECTION
  // ===========================================

  const cities = [
    "roma",
    "milano",
    "napoli",
    "firenze",
    "torino",
    "bologna",
    "venezia",
    "palermo",
    "bari"
  ];

  for(const city of cities){

    if(text.includes(city)){

      entities.city = city;
      break;

    }

  }

  // ===========================================
  // 📈 PERCENTAGES
  // ===========================================

  const percentageMatches =
    text.match(/\d+(?:[\.,]\d+)?\s?%/g);

  if(percentageMatches){

    entities.percentages =
      percentageMatches.map(v =>

        parseFloat(
          v
            .replace("%","")
            .replace(",",".")
        )

      );

  }

  // ===========================================
  // 🏨 OCCUPANCY DETECTION
  // ===========================================

  if(
    text.includes("occupazione") ||
    text.includes("occupancy")
  ){

    const occ =
      entities.percentages.find(
        p => p >= 20 && p <= 100
      );

    if(occ){

      entities.occupancy = occ;

    }

  }

  // ===========================================
  // 📈 ROI DETECTION
  // ===========================================

  if(text.includes("roi")){

    const roi =
      entities.percentages.find(
        p => p >= 1 && p <= 200
      );

    if(roi){

      entities.roi = roi;

    }

  }

  // ===========================================
  // 💰 MONEY EXTRACTION
  // ===========================================

  const moneyMatches =
    text.match(/\d{2,9}/g);

  if(moneyMatches){

    entities.amounts =
      moneyMatches.map(v =>

        parseInt(v)

      );

  }

  // ===========================================
  // 🏠 PROPERTY PRICE
  // ===========================================

  const likelyPrice =
    entities.amounts.find(
      n => n >= 30000
    );

  if(likelyPrice){

    entities.price = likelyPrice;

  }

  // ===========================================
  // 🏦 MORTGAGE DETECTION
  // ===========================================

  const mortgageWords = [

    "mutuo",
    "mortgage",
    "loan",
    "finanziamento",
    "leva"

  ];

  entities.mortgage =
    mortgageWords.some(word =>
      text.includes(word)
    );

  // ===========================================
  // ⚠️ RISK DETECTION
  // ===========================================

  if(
    text.includes("rischio") ||
    text.includes("risk")
  ){

    entities.risk = true;

  }

  return entities;

};

console.log("🧠 ENTITY ENGINE READY");
