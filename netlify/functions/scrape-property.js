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
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
"Accept":
"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
"Accept-Language":"it-IT,it;q=0.9,en;q=0.8",
"Cache-Control":"no-cache",
"Pragma":"no-cache"
}
});

const html = await response.text();

let price = null;


// ===== PATTERN 1 =====
let match = html.match(/"price":\s*([0-9]+)/);

if(match){
price = parseInt(match[1]);
}


// ===== PATTERN 2 =====
if(!price){

match = html.match(/"mainPrice":\s*"?([0-9]+)"?/);

if(match){
price = parseInt(match[1]);
}

}


// ===== PATTERN 3 =====
if(!price){

match = html.match(/([0-9]{2,3}\.?[0-9]{3})\s?€/);

if(match){
price = parseInt(match[1].replace(".",""));
}

}


console.log("Price extracted:",price);


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
