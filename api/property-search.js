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

  image:"/immobili/napoli-1.jpg",

  url:"https://www.immobiliare.it/vendita-case/napoli/"
},

    {
  title:"University Area",
  city:"napoli",
  price:165000,
  sqm:60,
  roi:18,
  portal:"Immobiliare.it",

  image:"/immobili/napoli-2.jpg",

  url:"https://www.immobiliare.it/vendita-case/napoli/"
},

    {
  title:"Vomero Investment",
  city:"napoli",
  price:195000,
  sqm:70,
  roi:16,
  portal:"Immobiliare.it",

  image:"/immobili/napoli-3.jpg",

  url:"https://www.immobiliare.it/vendita-case/napoli/"
},

// =====================================
// 🏠 ROMA
// =====================================

{
  title:"Trastevere Tourist Hub",
  city:"roma",
  price:295000,
  sqm:62,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/roma-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/roma/"
},

{
  title:"Vatican Rooms Investment",
  city:"roma",
  price:320000,
  sqm:68,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/roma-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/roma/"
},

{
  title:"Termini Cashflow Property",
  city:"roma",
  price:280000,
  sqm:70,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/roma-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/roma/"
},

// =====================================
// 🏠 MILANO
// =====================================

{
  title:"Navigli Business Stay",
  city:"milano",
  price:340000,
  sqm:60,
  roi:11,
  portal:"Immobiliare.it",
  image:"/immobili/milano-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/milano/"
},

{
  title:"Porta Romana Investment",
  city:"milano",
  price:365000,
  sqm:66,
  roi:10,
  portal:"Immobiliare.it",
  image:"/immobili/milano-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/milano/"
},

{
  title:"Central Station Property",
  city:"milano",
  price:315000,
  sqm:58,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/milano-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/milano/"
},

// =====================================
// 🏠 FIRENZE
// =====================================

{
  title:"Historic Center Firenze",
  city:"firenze",
  price:285000,
  sqm:60,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/firenze-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/firenze/"
},

{
  title:"Duomo Premium Stay",
  city:"firenze",
  price:310000,
  sqm:68,
  roi:11,
  portal:"Immobiliare.it",
  image:"/immobili/firenze-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/firenze/"
},

{
  title:"Santa Maria Novella Hub",
  city:"firenze",
  price:270000,
  sqm:64,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/firenze-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/firenze/"
},

// =====================================
// 🏠 TORINO
// =====================================

{
  title:"Centro Torino Investment",
  city:"torino",
  price:195000,
  sqm:65,
  roi:11,
  portal:"Immobiliare.it",
  image:"/immobili/torino-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/torino/"
},

{
  title:"Porta Nuova Apartment",
  city:"torino",
  price:225000,
  sqm:72,
  roi:10,
  portal:"Immobiliare.it",
  image:"/immobili/torino-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/torino/"
},

{
  title:"Politecnico Area",
  city:"torino",
  price:185000,
  sqm:58,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/torino-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/torino/"
},

// =====================================
// 🏠 BOLOGNA
// =====================================

{
  title:"Historic Center Bologna",
  city:"bologna",
  price:275000,
  sqm:64,
  roi:11,
  portal:"Immobiliare.it",
  image:"/immobili/bologna-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/bologna/"
},

{
  title:"University District",
  city:"bologna",
  price:250000,
  sqm:60,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/bologna-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/bologna/"
},

{
  title:"Central Bologna Residence",
  city:"bologna",
  price:295000,
  sqm:70,
  roi:10,
  portal:"Immobiliare.it",
  image:"/immobili/bologna-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/bologna/"
},

// =====================================
// 🏠 PALERMO
// =====================================

{
  title:"Palermo Centro Storico",
  city:"palermo",
  price:155000,
  sqm:68,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/palermo-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/palermo/"
},

{
  title:"Teatro Massimo Area",
  city:"palermo",
  price:175000,
  sqm:72,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/palermo-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/palermo/"
},

{
  title:"Mondello Investment",
  city:"palermo",
  price:210000,
  sqm:78,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/palermo-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/palermo/"
},

// =====================================
// 🏠 BARI
// =====================================

{
  title:"Bari Vecchia Apartment",
  city:"bari",
  price:170000,
  sqm:62,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/bari-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/bari/"
},

{
  title:"Lungomare Premium",
  city:"bari",
  price:235000,
  sqm:75,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/bari-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/bari/"
},

{
  title:"University Area Bari",
  city:"bari",
  price:185000,
  sqm:65,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/bari-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/bari/"
},

    // =====================================
// 🏠 VERONA
// =====================================

{
  title:"Arena District Investment",
  city:"verona",
  price:210000,
  sqm:62,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/verona-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/verona/"
},

{
  title:"Historic Center Verona",
  city:"verona",
  price:245000,
  sqm:68,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/verona-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/verona/"
},

{
  title:"University Area Verona",
  city:"verona",
  price:195000,
  sqm:58,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/verona-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/verona/"
},

// =====================================
// 🏠 VENEZIA
// =====================================

{
  title:"Cannaregio Tourist Stay",
  city:"venezia",
  price:295000,
  sqm:55,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/venezia-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/venezia/"
},

{
  title:"Grand Canal Investment",
  city:"venezia",
  price:340000,
  sqm:62,
  roi:11,
  portal:"Immobiliare.it",
  image:"/immobili/venezia-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/venezia/"
},

{
  title:"Santa Lucia Hub",
  city:"venezia",
  price:280000,
  sqm:60,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/venezia-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/venezia/"
},

// =====================================
// 🏠 GENOVA
// =====================================

{
  title:"Porto Antico Apartment",
  city:"genova",
  price:185000,
  sqm:65,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/genova-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/genova/"
},

{
  title:"Historic Center Genova",
  city:"genova",
  price:175000,
  sqm:60,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/genova-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/genova/"
},

{
  title:"Aquarium Tourist Area",
  city:"genova",
  price:210000,
  sqm:70,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/genova-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/genova/"
},

// =====================================
// 🏠 CATANIA
// =====================================

{
  title:"Catania Centro Storico",
  city:"catania",
  price:145000,
  sqm:65,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/catania-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/catania/"
},

{
  title:"Etna View Residence",
  city:"catania",
  price:170000,
  sqm:70,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/catania-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/catania/"
},

{
  title:"University Area Catania",
  city:"catania",
  price:155000,
  sqm:60,
  roi:17,
  portal:"Immobiliare.it",
  image:"/immobili/catania-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/catania/"
},

// =====================================
// 🏠 LECCE
// =====================================

{
  title:"Baroque Center Investment",
  city:"lecce",
  price:165000,
  sqm:62,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/lecce-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/lecce/"
},

{
  title:"Historic Lecce Stay",
  city:"lecce",
  price:185000,
  sqm:68,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/lecce-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/lecce/"
},

{
  title:"Salento Tourist Hub",
  city:"lecce",
  price:210000,
  sqm:75,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/lecce-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/lecce/"
},

// =====================================
// 🏠 RIMINI
// =====================================

{
  title:"Marina Centro Investment",
  city:"rimini",
  price:190000,
  sqm:60,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/rimini-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/rimini/"
},

{
  title:"Beachfront Apartment",
  city:"rimini",
  price:230000,
  sqm:70,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/rimini-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/rimini/"
},

{
  title:"Historic Rimini Center",
  city:"rimini",
  price:175000,
  sqm:58,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/rimini-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/rimini/"
},

// =====================================
// 🏠 SALERNO
// =====================================

{
  title:"Lungomare Salerno",
  city:"salerno",
  price:175000,
  sqm:62,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/salerno-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/salerno/"
},

{
  title:"Historic Center Salerno",
  city:"salerno",
  price:195000,
  sqm:68,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/salerno-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/salerno/"
},

{
  title:"Amalfi Gateway Property",
  city:"salerno",
  price:220000,
  sqm:75,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/salerno-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/salerno/"
},

// =====================================
// 🏠 MATERA
// =====================================

{
  title:"Sassi Investment",
  city:"matera",
  price:165000,
  sqm:58,
  roi:17,
  portal:"Immobiliare.it",
  image:"/immobili/matera-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/matera/"
},

{
  title:"Historic Cave Residence",
  city:"matera",
  price:190000,
  sqm:65,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/matera-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/matera/"
},

{
  title:"Matera Tourist Hub",
  city:"matera",
  price:210000,
  sqm:70,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/matera-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/matera/"
},

// =====================================
// 🏠 PISA
// =====================================

{
  title:"Tower District Apartment",
  city:"pisa",
  price:185000,
  sqm:60,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/pisa-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/pisa/"
},

{
  title:"University Area Pisa",
  city:"pisa",
  price:170000,
  sqm:58,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/pisa-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/pisa/"
},

{
  title:"Historic Center Pisa",
  city:"pisa",
  price:210000,
  sqm:70,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/pisa-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/pisa/"
},

// =====================================
// 🏠 TRIESTE
// =====================================

{
  title:"Canal Grande Residence",
  city:"trieste",
  price:180000,
  sqm:62,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/trieste-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/trieste/"
},

{
  title:"Piazza Unità Investment",
  city:"trieste",
  price:220000,
  sqm:70,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/trieste-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/trieste/"
},

{
  title:"Seafront Trieste Stay",
  city:"trieste",
  price:195000,
  sqm:65,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/trieste-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/trieste/"
},

    // =====================================
// 🏠 BERGAMO
// =====================================

{
  title:"Città Alta Investment",
  city:"bergamo",
  price:195000,
  sqm:60,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/bergamo-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/bergamo/"
},

{
  title:"Airport Business Stay",
  city:"bergamo",
  price:215000,
  sqm:68,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/bergamo-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/bergamo/"
},

{
  title:"Central Bergamo Hub",
  city:"bergamo",
  price:185000,
  sqm:58,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/bergamo-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/bergamo/"
},

// =====================================
// 🏠 COMO
// =====================================

{
  title:"Lake Como Residence",
  city:"como",
  price:285000,
  sqm:62,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/como-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/como/"
},

{
  title:"Historic Como Center",
  city:"como",
  price:255000,
  sqm:58,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/como-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/como/"
},

{
  title:"Lake View Apartment",
  city:"como",
  price:320000,
  sqm:70,
  roi:11,
  portal:"Immobiliare.it",
  image:"/immobili/como-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/como/"
},

// =====================================
// 🏠 PADOVA
// =====================================

{
  title:"University District",
  city:"padova",
  price:190000,
  sqm:60,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/padova-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/padova/"
},

{
  title:"Prato della Valle",
  city:"padova",
  price:220000,
  sqm:68,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/padova-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/padova/"
},

{
  title:"Historic Padova Center",
  city:"padova",
  price:205000,
  sqm:65,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/padova-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/padova/"
},

// =====================================
// 🏠 PARMA
// =====================================

{
  title:"Parma Historic Center",
  city:"parma",
  price:180000,
  sqm:58,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/parma-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/parma/"
},

{
  title:"University Area Parma",
  city:"parma",
  price:195000,
  sqm:62,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/parma-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/parma/"
},

{
  title:"Food Valley Property",
  city:"parma",
  price:215000,
  sqm:68,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/parma-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/parma/"
},

// =====================================
// 🏠 MODENA
// =====================================

{
  title:"Ferrari District",
  city:"modena",
  price:210000,
  sqm:65,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/modena-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/modena/"
},

{
  title:"Historic Modena Center",
  city:"modena",
  price:225000,
  sqm:70,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/modena-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/modena/"
},

{
  title:"University Modena Stay",
  city:"modena",
  price:190000,
  sqm:60,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/modena-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/modena/"
},

// =====================================
// 🏠 SIENA
// =====================================

{
  title:"Piazza del Campo Area",
  city:"siena",
  price:230000,
  sqm:60,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/siena-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/siena/"
},

{
  title:"Historic Siena Stay",
  city:"siena",
  price:250000,
  sqm:68,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/siena-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/siena/"
},

{
  title:"Tuscan Tourist Hub",
  city:"siena",
  price:270000,
  sqm:72,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/siena-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/siena/"
},

// =====================================
// 🏠 PERUGIA
// =====================================

{
  title:"Historic Perugia Center",
  city:"perugia",
  price:165000,
  sqm:58,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/perugia-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/perugia/"
},

{
  title:"University Area Perugia",
  city:"perugia",
  price:180000,
  sqm:62,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/perugia-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/perugia/"
},

{
  title:"Umbrian Tourist Stay",
  city:"perugia",
  price:195000,
  sqm:68,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/perugia-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/perugia/"
},

// =====================================
// 🏠 TAORMINA
// =====================================

{
  title:"Sea View Taormina",
  city:"taormina",
  price:295000,
  sqm:60,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/taormina-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/taormina/"
},

{
  title:"Corso Umberto Property",
  city:"taormina",
  price:340000,
  sqm:70,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/taormina-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/taormina/"
},

{
  title:"Greek Theatre Investment",
  city:"taormina",
  price:310000,
  sqm:65,
  roi:17,
  portal:"Immobiliare.it",
  image:"/immobili/taormina-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/taormina/"
},

// =====================================
// 🏠 SIRACUSA
// =====================================

{
  title:"Ortigia Residence",
  city:"siracusa",
  price:175000,
  sqm:58,
  roi:17,
  portal:"Immobiliare.it",
  image:"/immobili/siracusa-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/siracusa/"
},

{
  title:"Historic Siracusa Center",
  city:"siracusa",
  price:195000,
  sqm:65,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/siracusa-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/siracusa/"
},

{
  title:"Seafront Ortigia Stay",
  city:"siracusa",
  price:225000,
  sqm:70,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/siracusa-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/siracusa/"
},

// =====================================
// 🏠 OLBIA
// =====================================

{
  title:"Costa Smeralda Gateway",
  city:"olbia",
  price:250000,
  sqm:60,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/olbia-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/olbia/"
},

{
  title:"Porto Olbia Investment",
  city:"olbia",
  price:275000,
  sqm:68,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/olbia-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/olbia/"
},

{
  title:"Sardinia Tourist Hub",
  city:"olbia",
  price:295000,
  sqm:72,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/olbia-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/olbia/"
},

    // =====================================
// 🏠 ANCONA
// =====================================

{
  title:"Porto Antico Residence",
  city:"ancona",
  price:165000,
  sqm:60,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/ancona-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/ancona/"
},

{
  title:"Centro Storico Ancona",
  city:"ancona",
  price:185000,
  sqm:68,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/ancona-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/ancona/"
},

{
  title:"University Area Ancona",
  city:"ancona",
  price:155000,
  sqm:58,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/ancona-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/ancona/"
},

// =====================================
// 🏠 PESCARA
// =====================================

{
  title:"Lungomare Investment",
  city:"pescara",
  price:185000,
  sqm:62,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/pescara-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/pescara/"
},

{
  title:"Pescara Beach Stay",
  city:"pescara",
  price:220000,
  sqm:70,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/pescara-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/pescara/"
},

{
  title:"Central Pescara Hub",
  city:"pescara",
  price:175000,
  sqm:60,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/pescara-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/pescara/"
},

// =====================================
// 🏠 LIVORNO
// =====================================

{
  title:"Porto Mediceo Property",
  city:"livorno",
  price:170000,
  sqm:60,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/livorno-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/livorno/"
},

{
  title:"Terrazza Mascagni Area",
  city:"livorno",
  price:210000,
  sqm:70,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/livorno-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/livorno/"
},

{
  title:"Historic Livorno Center",
  city:"livorno",
  price:185000,
  sqm:65,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/livorno-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/livorno/"
},

// =====================================
// 🏠 LA SPEZIA
// =====================================

{
  title:"Cinque Terre Gateway",
  city:"laspezia",
  price:190000,
  sqm:60,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/laspezia-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/la-spezia/"
},

{
  title:"Port Area Investment",
  city:"laspezia",
  price:175000,
  sqm:58,
  roi:17,
  portal:"Immobiliare.it",
  image:"/immobili/laspezia-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/la-spezia/"
},

{
  title:"Historic Center La Spezia",
  city:"laspezia",
  price:205000,
  sqm:68,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/laspezia-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/la-spezia/"
},

// =====================================
// 🏠 VICENZA
// =====================================

{
  title:"Palladio District",
  city:"vicenza",
  price:185000,
  sqm:60,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/vicenza-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/vicenza/"
},

{
  title:"Historic Vicenza Center",
  city:"vicenza",
  price:210000,
  sqm:68,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/vicenza-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/vicenza/"
},

{
  title:"Business Stay Vicenza",
  city:"vicenza",
  price:175000,
  sqm:58,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/vicenza-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/vicenza/"
},

// =====================================
// 🏠 TREVISO
// =====================================

{
  title:"Historic Treviso Residence",
  city:"treviso",
  price:195000,
  sqm:60,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/treviso-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/treviso/"
},

{
  title:"Canal District Investment",
  city:"treviso",
  price:220000,
  sqm:68,
  roi:12,
  portal:"Immobiliare.it",
  image:"/immobili/treviso-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/treviso/"
},

{
  title:"University Area Treviso",
  city:"treviso",
  price:180000,
  sqm:58,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/treviso-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/treviso/"
},

// =====================================
// 🏠 RAVENNA
// =====================================

{
  title:"Mosaic District Property",
  city:"ravenna",
  price:175000,
  sqm:60,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/ravenna-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/ravenna/"
},

{
  title:"Historic Ravenna Center",
  city:"ravenna",
  price:190000,
  sqm:65,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/ravenna-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/ravenna/"
},

{
  title:"Tourist Hub Ravenna",
  city:"ravenna",
  price:210000,
  sqm:72,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/ravenna-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/ravenna/"
},

// =====================================
// 🏠 FERRARA
// =====================================

{
  title:"Este Castle Area",
  city:"ferrara",
  price:165000,
  sqm:58,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/ferrara-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/ferrara/"
},

{
  title:"Historic Ferrara Residence",
  city:"ferrara",
  price:185000,
  sqm:65,
  roi:13,
  portal:"Immobiliare.it",
  image:"/immobili/ferrara-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/ferrara/"
},

{
  title:"University District Ferrara",
  city:"ferrara",
  price:175000,
  sqm:60,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/ferrara-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/ferrara/"
},

// =====================================
// 🏠 REGGIO CALABRIA
// =====================================

{
  title:"Lungomare Falcomatà",
  city:"reggiocalabria",
  price:145000,
  sqm:60,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/reggio-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/reggio-calabria/"
},

{
  title:"Historic Center Reggio",
  city:"reggiocalabria",
  price:165000,
  sqm:65,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/reggio-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/reggio-calabria/"
},

{
  title:"Waterfront Investment",
  city:"reggiocalabria",
  price:185000,
  sqm:72,
  roi:14,
  portal:"Immobiliare.it",
  image:"/immobili/reggio-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/reggio-calabria/"
},

// =====================================
// 🏠 MESSINA
// =====================================

{
  title:"Messina Historic Hub",
  city:"messina",
  price:140000,
  sqm:58,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/messina-1.jpg",
  url:"https://www.immobiliare.it/vendita-case/messina/"
},

{
  title:"Strait View Apartment",
  city:"messina",
  price:170000,
  sqm:68,
  roi:15,
  portal:"Immobiliare.it",
  image:"/immobili/messina-2.jpg",
  url:"https://www.immobiliare.it/vendita-case/messina/"
},

{
  title:"University Area Messina",
  city:"messina",
  price:155000,
  sqm:62,
  roi:16,
  portal:"Immobiliare.it",
  image:"/immobili/messina-3.jpg",
  url:"https://www.immobiliare.it/vendita-case/messina/"
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
// 🤖 SMART FALLBACK ENGINE
// =====================================

if(results.length === 0){

  const cityProperties =
    properties.filter(
      p => p.city === city
    );

  if(cityProperties.length){

    results =
      cityProperties
      .sort((a,b)=>
        a.price - b.price
      )
      .slice(0,5);

  }

}

// =====================================
// 🇮🇹 NATIONAL FALLBACK
// =====================================

if(results.length === 0){

  results =
    [...properties]

    .sort((a,b)=>
      b.roi - a.roi
    )

    .slice(0,5)

    .map(p=>({

      ...p,

      aiReason:
      "Market Similarity"

    }));

}

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
