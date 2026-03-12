exports.handler = async (event) => {

const url = event.queryStringParameters.url;

if(!url){
return {
statusCode:400,
body: JSON.stringify({error:"Missing URL"})
};
}

try{

const response = await fetch(url,{
headers:{
"User-Agent":
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",

"Accept":
"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

"Accept-Language":
"it-IT,it;q=0.9,en;q=0.8",

"Referer":
"https://www.google.com/",

"Cache-Control":
"no-cache"
}
});

const html = await response.text();

// DEBUG: mostra cosa riceve davvero Netlify
console.log(html.substring(0,2000));

let price = null;
let city = null; 

// ================= METHOD 1 JSON-LD =================

const jsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

if(jsonMatch){

try{

let json = JSON.parse(jsonMatch[1]);

if(Array.isArray(json)){
json = json[0];
}

if(json?.offers?.price){
price = parseInt(json.offers.price);
}

}catch(e){
console.log("JSON parse error");
}

}


// ================= METHOD 2 JSON PRICE =================

if(!price){

const match = html.match(/"price":\s*([0-9]+)/);

if(match){
price = parseInt(match[1]);
}

}

// ================= METHOD 3 IMMOBILIARE JSON =================

if(!price){

const match = html.match(/"priceValue":\s*([0-9]+)/);

if(match){
price = parseInt(match[1]);
}

}  


// ================= METHOD 3 HTML FALLBACK =================

if(!price){

// prezzo singolo
let match = html.match(/€\s*([0-9\.\,]+)/);

if(match){

price = match[1]
.replace(/\./g,"")
.replace(",",".")
.trim();

price = parseFloat(price);

}

// range prezzo (es: €255.000 – €900.000)
if(!price){

let range = html.match(/€\s*([0-9\.\,]+)\s*–\s*€\s*([0-9\.\,]+)/);

if(range){

let min = range[1].replace(/\./g,"");
let max = range[2].replace(/\./g,"");

price = Math.round((parseInt(min) + parseInt(max)) / 2);

}

}

}

// ================= CITY EXTRACTION =================

if(!city){

// metodo 1 – address JSON
const cityMatch = html.match(/"addressLocality":"([^"]+)"/);

if(cityMatch){
city = cityMatch[1];
}

}

// fallback semplice
if(!city){

const cityFallback = html.match(/([A-Z][a-z]+)\s?(?:\(|\-)\s?(?:NA|RM|MI|FI)/);

if(cityFallback){
city = cityFallback[1];
}

}

console.log("Extracted city:", city);  


// ================= RETURN =================

return {

statusCode:200,

headers:{
"Access-Control-Allow-Origin":"*"
},

body: JSON.stringify({
price: price || 0,
city: city || null
})

};

}catch(e){

console.log("SCRAPE ERROR", e);

return {

statusCode:200,

headers:{
"Access-Control-Allow-Origin":"*"
},

body: JSON.stringify({
price:0,
city:null
})

};

}

};
