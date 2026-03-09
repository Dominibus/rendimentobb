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
let match;


// ===== PATTERN JSON PRICE =====

match = html.match(/"price"\s*:\s*([0-9]+)/);

if(match){
price = parseInt(match[1]);
}


// ===== PATTERN MAIN PRICE =====

if(!price){

match = html.match(/"mainPrice"\s*:\s*"([0-9]+)"/);

if(match){
price = parseInt(match[1]);
}

}


// ===== FALLBACK HTML =====

if(!price){

match = html.match(/([0-9\.]{4,12})\s?€/);

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
