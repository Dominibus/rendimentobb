import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {REGIONAL_CAPITALS} from '../js/regional-capitals.js';
import {parseMunicipalities,municipalityCoverage} from '../js/municipalities.js';
import {illustrativeCityReference} from '../js/city-reference.js';
const rows=parseMunicipalities(JSON.parse(readFileSync(new URL('../data/geography/municipalities-it.json',import.meta.url))));
test('regional capitals exactly match 20 identities in the included official snapshot',()=>{
 assert.equal(REGIONAL_CAPITALS.length,20);assert.equal(new Set(REGIONAL_CAPITALS.map(r=>r.region)).size,20);
 for(const capital of REGIONAL_CAPITALS){const row=rows.find(r=>r.istat===capital.istat);assert.ok(row);for(const k of ['name','province','region'])assert.equal(capital[k],row[k]);}
});
for(const capital of REGIONAL_CAPITALS)test('capital reference never inherits national data: '+capital.name,()=>{
 const table={italy:{roi:8,occupancy:60,adr:120},roma:{roi:9,occupancy:65,adr:130}};
 const actual=illustrativeCityReference(table,capital.key);
 assert.equal(actual,capital.key==='roma'?table.roma:null);
 if(!['roma','napoli','milano','firenze','bologna','venezia','bari','palermo','trento'].includes(capital.key))assert.equal(municipalityCoverage(capital),null);
});
test('city reference accepts known aliases but rejects inherited and incomplete entries',()=>{
 const roma={roi:0,occupancy:0,adr:0};assert.equal(illustrativeCityReference({rome:roma},'Roma (RM)'),roma);
 assert.equal(illustrativeCityReference({roma:{roi:8}},'roma'),null);
 assert.equal(illustrativeCityReference(Object.create({roma}),'roma'),null);
});
