import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../dashboard-report/index.html',import.meta.url),'utf8');
const chart=html.slice(html.indexOf('let roiChartInstance = null;'),html.indexOf('// ================= LOCK ================='));
test('zero equity destroys a previous chart and explains N/A in both languages without plotting zero',()=>{
 for(const lang of ['it','en']){
  const canvas={},notice={};let created=0,destroyed=0;
  const c={lang,equity:30000,roi:10,document:{getElementById:id=>id==='roiChart'?canvas:notice},requestAnimationFrame:f=>f(),Chart:class{constructor(){created++;}destroy(){destroyed++;}}};
  vm.createContext(c);vm.runInContext(chart,c);c.renderChart();assert.equal(created,1);
  c.equity=0;c.renderChart();assert.equal(created,1);assert.equal(destroyed,1);assert.equal(canvas.hidden,true);assert.equal(notice.hidden,false);assert.match(notice.textContent,/N\/A/);
  c.equity=30000;c.renderChart();assert.equal(created,2);assert.equal(canvas.hidden,false);assert.equal(notice.hidden,true);
 }
});
