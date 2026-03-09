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
"Accept-Language":"it-IT,it;q=0.9"
}
});

const html = await response.text();

let price = null;


// ===== METHOD 1 (Idealista structured JSON) =====

let jsonMatch = html.match(/"price"\s*:\s*([0-9]+)/);

if(jsonMatch){
price = parseInt(jsonMatch[1]);
}


// ===== METHOD 2 (schema.org structured data) =====

if(!price){

let schemaMatch = html.match(/"@type":"Offer".*?"price":"?([0-9]+)"?/);

if(schemaMatch){
price = parseInt(schemaMatch[1]);
}

}


// ===== METHOD 3 (visual price fallback) =====

if(!price){

let euroMatch = html.match(/([0-9]{2,3}\.?[0-9]{3})\s?€/);

if(euroMatch){
price = parseInt(euroMatch[1].replace(".",""));
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
