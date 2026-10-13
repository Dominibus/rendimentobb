import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('js/dashboard.js','utf8');
const declarations=source.slice(source.indexOf('const investment =\n'),source.indexOf('const renovation =\n',source.indexOf('const investment =\n')));
const start=source.indexOf('${investment ? `');
const end=source.indexOf('${renovation ? `',start);
const markup=source.slice(start,end);
test('PMS linked property card uses N/A at zero capital and startup basis for an owned analysis',()=>{
  for(const owned of [true,false])for(const equity of [0,12000])for(const lang of ['it','en']){
    const context={data:{analysisId:'a1',investmentSnapshot:{equity,roi:80}},window:{dashboardSimulations:[{id:'a1',assumptions:{source:owned?'owned_property':'simulator'}}]},Number,t:(it,en)=>lang==='en'?en:it,formatPercent:v=>v+'%',formatCurrency:v=>v+' EUR'};
    vm.runInNewContext(declarations+'output=`'+markup+'`;',context);
    assert.match(context.output,equity===0?/N\/A/:/80%/);
    if(equity===0)assert.doesNotMatch(context.output,/ROI[^<]*80%/);
    if(owned)assert.match(context.output,lang==='en'?/Startup capital/:/Capitale di avvio/);
  }
});
