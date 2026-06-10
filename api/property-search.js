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

  const properties = [

    {
      title:"Centro Storico Napoli",
      city:"napoli",
      price:180000,
      sqm:65,
      roi:17,
      portal:"Immobiliare.it",
      url:`https://www.immobiliare.it/vendita-case/${city}/`
    },

    {
      title:"Premium Apartment Napoli",
      city:"napoli",
      price:207000,
      sqm:75,
      roi:15,
      portal:"Idealista",
      url:`https://www.idealista.it/vendita-case/${city}/`
    }

  ];

  const results =
    properties.filter(p =>
      p.city === city &&
      p.price <= budget &&
      p.sqm >= sqm
    );

  res.status(200).json({
    success:true,
    city,
    budget,
    sqm,
    goal,
    results
  });

}
