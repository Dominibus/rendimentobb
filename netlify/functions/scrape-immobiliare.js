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
"Accept-Language":"it-IT,it;q=0.9,en;q=0.8"
}
});

const html = await response.text();

let price = null;


// ===== METHOD 1 JSON-LD =====

const jsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

if(jsonMatch){

try{

const json = JSON.parse(jsonMatch[1]);

if(json.offers && json.offers.price){

price = parseInt(json.offers.price);

}

}catch(e){}

}


// ===== METHOD 2 IMMOBILIARE JSON =====

if(!price){

const match = html.match(/"price":\s*([0-9]+)/);

if(match){

price = parseInt(match[1]);

}

}


// ===== METHOD 3 HTML FALLBACK =====

if(!price){

const match = html.match(/([0-9\.]{4,12})\s?€/);

if(match){

price = match[1]
.replace(/\./g,"")
.replace(",",".")
.trim();

price = parseInt(price);

}

}

console.log("Extracted price:",price);

return {

statusCode:200,

headers:{
"Access-Control-Allow-Origin":"*"
},

body: JSON.stringify({
price: price
})

};

}catch(e){

console.log("SCRAPE ERROR",e);

return {

statusCode:500,
body: JSON.stringify({error:"scrape error"})
};

}

};
