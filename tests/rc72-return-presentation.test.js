import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {renderFreeSimulationPreview} from '../js/free-preview.js';
const source=readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
const elements=()=>new Map(['roi-live','roi-main-basis','roi-badge','roi-verdict','roi-preview-live','roi-card-live'].map(id=>[id,{dataset:{}}]));

test('home and full simulator preserve the same positive, negative and high calculated return',()=>{
  const start=source.indexOf('    let roi = Number(result?.roi ?? 0);');
  const end=source.indexOf('// 🔥 salva ROI stimato globale',start);
  assert.ok(start>0 && end>start);
  for(const value of [-20,0,10,80])for(const isTool of [false,true]){
    const result=vm.runInNewContext(source.slice(start,end)+'\n({roi,realROI,visualROI})',{result:{roi:value,realROI:value/5},isTool});
    assert.equal(result.roi,value);assert.equal(result.visualROI,value);assert.equal(result.realROI,value/5);
  }
});
test('paid zero equity displays N/A in both languages while retaining measurable property ROI',()=>{
  for(const lang of ['it','en'])for(const equity of [0,'0']){
    const rows=elements();renderFreeSimulationPreview({roi:0,equity,realROI:4.5},{access:{isPro:true},document:{getElementById:id=>rows.get(id)},lang});
    assert.equal(rows.get('roi-live').textContent,'N/A');
    assert.equal(rows.get('roi-card-live').textContent,lang==='en'?'4.5%':'4,5%');
    assert.match(rows.get('roi-badge').textContent,lang==='en'?/not applicable/:/non applicabile/);
    assert.match(rows.get('roi-verdict').textContent,/100%/);
  }
});
test('measured zero return with positive equity remains 0%, and missing equity is not invented as zero',()=>{
  for(const equity of [10000,undefined,null,'']){
    const rows=elements();renderFreeSimulationPreview({roi:0,equity,realROI:0},{access:{isInvestor:true},document:{getElementById:id=>rows.get(id)},lang:'en'});
    assert.equal(rows.get('roi-live').textContent,'0.0%');
  }
});
function comparison({equity=30000,roi=20,reference=7,lang='it'}={}){
  const container={innerHTML:''};
  const start=source.indexOf('function renderROIMarketComparison('),end=source.indexOf('// ================= REVENUE FORECAST',start);
  const ctx={document:{getElementById:()=>container},window:{currentLang:lang,lastAnalysisData:{equity},RB_MARKET_DATA:reference===null?{}:{roma:{roi:reference}}},Intl,t:(it,en)=>lang==='en'?en:it};
  vm.runInNewContext(source.slice(start,end)+'\nrenderROIMarketComparison('+roi+',"roma");',ctx);
  return container.innerHTML;
}
test('illustrative reference never produces an above/below market grade, even for strong or weak return',()=>{
  for(const lang of ['it','en'])for(const roi of [-10,20]){
    const html=comparison({roi,lang});
    assert.match(html,lang==='en'?/Bases not comparable/:/Basi non comparabili/);
    assert.doesNotMatch(html,/Above|Below|sopra|sotto|#10b981|#ef4444/i);
  }
});
test('comparison handles zero equity and missing city reference without a fabricated numeric benchmark',()=>{
  const html=comparison({equity:0,reference:null});assert.match(html,/N\/A/);assert.match(html,/<strong>—<\/strong>/);
  assert.match(html,/non è applicabile/);
});

test('paid messages reset across zero/positive equity, profit/loss and language changes',()=>{
 const rows=elements(),document={getElementById:id=>rows.get(id)},access={isPro:true};
 renderFreeSimulationPreview({equity:0,roi:0,realROI:-4.6,net:-22891},{access,document,lang:'it'});
 assert.match(rows.get('roi-verdict').textContent,/100%/);
 renderFreeSimulationPreview({equity:30000,roi:-69.3,realROI:-4.2,net:-20803.64},{access,document,lang:'en'});
 assert.equal(rows.get('roi-live').textContent,'-69.3%');
 assert.match(rows.get('roi-verdict').textContent,/negative cashflow/);
 assert.doesNotMatch(rows.get('roi-verdict').textContent,/100%/);
 assert.doesNotMatch(rows.get('roi-badge').textContent,/not applicable/);
 renderFreeSimulationPreview({equity:30000,roi:10,realROI:2,net:3000},{access,document,lang:'it'});
 assert.match(rows.get('roi-verdict').textContent,/cashflow positivo/);
 renderFreeSimulationPreview({equity:30000,roi:0,realROI:0,net:0},{access,document,lang:'en'});
 assert.match(rows.get('roi-verdict').textContent,/breaks even/);
});
