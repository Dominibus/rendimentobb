export default async function handler(req, res) {

  res.status(200).json({

    success: true,

    message: "Property Search API Ready",

    city: req.query.city || null,

    budget: req.query.budget || null

  });

}
