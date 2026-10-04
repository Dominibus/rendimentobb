import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../dashboard/index.html',import.meta.url),'utf8');
test('portfolio narrative cards grow without changing global KPI heights',()=>{
 assert.match(html,/#dashboard-ai-insight,\s*#dashboard-ai-insight > \.analysis-card,\s*#investment-intelligence-card\s*\{\s*height:auto;\s*min-height:0;/);
 assert.match(html,/\.analysis-card,\s*\.rb-kpi,\s*\.kpi-card\{[\s\S]*?height:100%;/);
 assert.equal(html.split('id="investment-intelligence-card"').length-1,1);
 const start=html.indexOf('id="investment-intelligence-card"');const end=html.indexOf('<!-- VERDICT -->',start);assert.ok(html.slice(start,end).includes('id="investment-intelligence-content"'));
});
