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
"User-Agent":"Mozilla/5.0"
}
});

const html = await response.text();

let price = null;


// ===== PATTERN 1 (Idealista JSON) =====

let match = html.match(/"price":\s*([0-9]+)/);

if(match){
price = parseInt(match[1]);
}


// ===== PATTERN 2 (meta property price) =====

if(!price){

match = html.match(/content="([0-9]{5,7})"\s*itemprop="price"/);

if(match){
price = parseInt(match[1]);
}

}


// ===== PATTERN 3 (fallback € format) =====

if(!price){

match = html.match(/([0-9]{2,3}\.?[0-9]{3})\s?€/);

if(match){
price = parseInt(match[1].replace(".",""));
}

}


// ===== DEBUG =====

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
