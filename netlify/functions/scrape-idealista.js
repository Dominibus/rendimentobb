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
"User-Agent":"Mozilla/5.0",
"Accept":"text/html"
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


// ===== FALLBACK =====

if(!price){

const match = html.match(/"price":\s*([0-9]+)/);

if(match){
price = parseInt(match[1]);
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
