// ===============================================
// 🧠 ENTITY EXTRACTION ENGINE
// ===============================================

window.rbExtractEntities = function(text){

  text = String(text || "")
    .toLowerCase();

  const entities = {

    city: null,

    price: null,

    occupancy: null,

    mortgage: false,

    mortgagePercent: null,

    percentage: null

  };

  // ===========================================
  // 🌍 CITY DETECTION
  // ===========================================

  const cities =
    window.rbKnowledgeBase?.cities || {};

  for(const cityKey in cities){

    const city = cities[cityKey];

    if(
      city.aliases?.some(alias =>
        text.includes(alias)
      )
    ){

      entities.city = cityKey;
      break;

    }

  }

  // ===========================================
  // 💰 PRICE DETECTION
  // ===========================================

  const priceMatch = text.match(
    /(\d+)\s?(k|mila|000)?/
  );

  if(priceMatch){

    let value =
      Number(priceMatch[1]);

    if(
      priceMatch[2] === "k" ||
      priceMatch[2] === "mila"
    ){

      value *= 1000;

    }

    entities.price = value;

  }

  // ===========================================
  // 🏨 OCCUPANCY
  // ===========================================

  const occupancyMatch = text.match(
    /occupazione\s?(\d+)|occupancy\s?(\d+)/
  );

  if(occupancyMatch){

    entities.occupancy =
      Number(
        occupancyMatch[1] ||
        occupancyMatch[2]
      );

  }

  // ===========================================
  // 🏦 MORTGAGE
  // ===========================================

  if(
    text.includes("mutuo") ||
    text.includes("mortgage")
  ){

    entities.mortgage = true;

  }

  const mortgagePercent = text.match(
    /(\d+)\s?%/
  );

  if(mortgagePercent){

    entities.mortgagePercent =
      Number(mortgagePercent[1]);

    entities.percentage =
      Number(mortgagePercent[1]);

  }

  console.log(
    "🧠 ENTITIES:",
    entities
  );

  return entities;

};

console.log(
  "🧠 ENTITY ENGINE READY"
);
