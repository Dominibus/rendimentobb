export default async function handler(req, res) {

  const city =
    (req.query.city || "napoli")
    .toLowerCase();

  const budget =
    Number(req.query.budget || 200000);

  const sqm =
    Number(req.query.sqm || 60);

  const goal =
    req.query.goal || "roi";

  // =====================================
  // 🏠 IMMOBILIARE.IT
  // =====================================
  console.log(
  "🔍 SEARCH REQUEST:",
  {
    city,
    budget,
    sqm,
    goal
  }
);

  const immobiliareResults = [

    {
      title:"Centro Storico Napoli",
      city:"napoli",
      price:180000,
      sqm:65,
      roi:17,
      portal:"Immobiliare.it",
      url:"https://www.immobiliare.it/vendita-case/napoli/"
    },

    {
      title:"University Area",
      city:"napoli",
      price:165000,
      sqm:60,
      roi:18,
      portal:"Immobiliare.it",
      url:"https://www.immobiliare.it/vendita-case/napoli/"
    },

    {
      title:"Vomero Investment",
      city:"napoli",
      price:195000,
      sqm:70,
      roi:16,
      portal:"Immobiliare.it",
      url:"https://www.immobiliare.it/vendita-case/napoli/"
    }

  ];

  // =====================================
  // 🏠 IDEALISTA
  // =====================================

  const idealistaResults = [

    {
      title:"Premium Apartment",
      city:"napoli",
      price:207000,
      sqm:75,
      roi:15,
      portal:"Idealista",
      url:"https://www.idealista.it/vendita-case/napoli/"
    },

    {
      title:"Posillipo View",
      city:"napoli",
      price:220000,
      sqm:82,
      roi:14,
      portal:"Idealista",
      url:"https://www.idealista.it/vendita-case/napoli/"
    }

  ];

  // =====================================
  // 🏠 CASA.IT
  // =====================================

  const casaItResults = [

    {
      title:"Business District",
      city:"napoli",
      price:210000,
      sqm:78,
      roi:15,
      portal:"Casa.it",
      url:"https://www.casa.it/vendita/residenziale/napoli/"
    }

  ];

  // =====================================
  // 🚀 FUTURE MULTI PORTAL ENGINE
  // =====================================

  const properties = [

  ...immobiliareResults,
  ...idealistaResults,
  ...casaItResults

];

// futuro scraping engine
// searchImmobiliare()
// searchIdealista()
// searchCasaIt()

  // =====================================
  // 🤖 AI SCORE
  // =====================================

  const calculateScore = (property) => {

    let score = 0;

    score += property.roi * 5;

    score +=
      Math.max(
        0,
        100 - property.price / 5000
      );

    score +=
      Math.min(
        property.sqm,
        100
      ) / 2;

    return Math.round(score);

  };

  // =====================================
  // 🔍 FILTER
  // =====================================

  let results =
    properties.filter(p =>

      p.city === city &&

      p.price <= budget &&

      p.sqm >= sqm

    );

  // =====================================
  // 🤖 AI ENRICHMENT
  // =====================================

  results =
    results.map(p => ({

      ...p,

      score:
        calculateScore(p),

      aiReason:

        p.roi >= 18

          ? "Highest ROI"

        : p.price <= budget * 0.9

          ? "Best value"

        : "Balanced investment"

    }));

  // =====================================
  // 🎯 SORTING
  // =====================================

  if(goal === "roi"){

    results.sort(
      (a,b)=>
        b.score - a.score
    );

  }

  else if(goal === "cashflow"){

    results.sort(
      (a,b)=>
        b.sqm - a.sqm
    );

  }

  else if(goal === "safe"){

    results.sort(
      (a,b)=>
        a.price - b.price
    );

  }

  // =====================================
  // 🏆 TOP RESULTS
  // =====================================

  results =
    results.slice(0,10);

  // =====================================
  // 📊 PORTAL STATS
  // =====================================

  const portals = {

    immobiliare:
      results.filter(
        p => p.portal === "Immobiliare.it"
      ).length,

    idealista:
      results.filter(
        p => p.portal === "Idealista"
      ).length,

    casait:
      results.filter(
        p => p.portal === "Casa.it"
      ).length

  };

  // =====================================
  // 🚀 RESPONSE
  // =====================================

  res.status(200).json({

    success:true,

    city,

    budget,

    sqm,

    goal,

    totalResults:
      results.length,

    portals,

    results

  });

}
