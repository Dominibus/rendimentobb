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

// Idealista JSON
const priceMatch = html.match(/"price":\s*([0-9]+)/);

if(priceMatch){
price = parseInt(priceMatch[1]);
}

// fallback prezzo
if(!price){

const altMatch = html.match(/([0-9]{2,3}\.?[0-9]{3})\s*€/);

if(altMatch){
price = parseInt(altMatch[1].replace(".",""));
}

}

return {
statusCode:200,
body: JSON.stringify({
price: price || null
})
};

}catch(e){

return {
statusCode:500,
body: JSON.stringify({error:"scrape error"})
};

}

};
