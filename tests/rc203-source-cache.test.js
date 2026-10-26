import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadTerritorialCity} from '../js/territorial-benchmarks.js';
test('territorial fetch revalidates same-origin aggregates without credentials',async()=>{
 const calls=[];const data=JSON.parse(readFileSync(new URL('../data/territorial/roma.json',import.meta.url)));
 const result=await loadTerritorialCity('roma',{fetcher:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>data};}});
 assert.equal(result.city.key,'roma');assert.equal(calls[0].options.cache,'no-cache');assert.equal(calls[0].options.credentials,'omit');assert.match(calls[0].url,/^\/data\/territorial\/roma\.json/);
});
