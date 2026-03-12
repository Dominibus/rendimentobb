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
"Accept-Language":"it-IT,it;q=0.9,en;q=0.8",
"Cache-Control":"no-cache",
"Pragma":"no-cache"
}
});

const html = await response.text();

let price = null;


// ===== PARSE NEXT DATA JSON =====

const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

if(jsonMatch){

const json = JSON.parse(jsonMatch[1]);

price =
json?.props?.pageProps?.ad?.price?.amount ||
json?.props?.pageProps?.listing?.price ||
null;

}


// ===== FALLBACK 1 =====

if(!price){

const match = html.match(/"price":\s*([0-9]+)/);

if(match){
price = parseInt(match[1]);
}

}

// ===== FALLBACK 2 (HTML) =====

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

return {

statusCode:200,

headers:{
"Access-Control-Allow-Origin":"*"
},

body: JSON.stringify({price})

};

}catch(e){

return {
statusCode:500,
body: JSON.stringify({error:"scrape error"})
};

}

};
