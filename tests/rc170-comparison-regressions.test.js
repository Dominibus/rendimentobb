import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {evaluateQuotes,initMortgageQuotes} from '../js/mortgage-quotes.js';
import {compareProperties,safeListingURL,initPropertyComparison} from '../js/property-comparison.js';
const c={};vm.runInNewContext(readFileSync(new URL('../js/investment-journey.js',import.meta.url),'utf8'),c);
const journey=c.RBInvestmentJourney;
const quotes=()=>({amount:'120.000',years:'20',a:{tan:'3,5',apr:'4,1'},b:{tan:'4'}});
const property=()=>({budget:'180.000',a:{city:'Volla',price:'150.000',sqm:'70',works:'10.000',other:'5.000',url:'https://example.com/annuncio',date:'2026-10-21'},b:{city:'Roma',price:'165.000',sqm:'75',works:'0',other:'0'}});
const near=(a,b,tolerance=.00001)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} differs from ${b}`);
// Independent month-by-month balance search, without the engine's closed formula.
function payment(principal,rate,years){let low=0,high=principal*(1+rate/1200);for(let i=0;i<90;i++){const monthly=(low+high)/2;let balance=principal;for(let n=0;n<years*12;n++)balance=balance*(1+rate/1200)-monthly;if(balance>0)low=monthly;else high=monthly;}return (low+high)/2;}
test('quote calculations agree with independent amortisation across principal, rate and term',()=>{
 for(const principal of [10000,120000,530000])for(const rate of [0,1e-8,3.5,12])for(const years of [1,20,40]){
  const raw=quotes();raw.amount=principal;raw.years=years;raw.a.tan=rate;raw.b.tan=rate;
  const r=evaluateQuotes(raw,journey);assert.equal(r.valid,true);const q=r.quotes[0];
  near(q.monthlyPayment,payment(principal,rate,years),.0001);near(q.totalPaid,q.monthlyPayment*12*years);near(q.totalInterest,q.totalPaid-principal);
 }
});
test('unknown fees stay unknown, while explicit zero produces an exact known total',()=>{
 const r=evaluateQuotes(quotes(),journey);assert.equal(r.valid,true);
 for(const q of r.quotes){assert.equal(q.upfront,null);assert.equal(q.monthlyFee,null);assert.equal(q.monthlyOutlay,null);assert.equal(q.totalWithRecordedFees,null);}
 const raw=quotes();raw.a.upfront='0';raw.a.monthlyFee='0';const q=evaluateQuotes(raw,journey).quotes[0];near(q.monthlyOutlay,q.monthlyPayment);near(q.totalWithRecordedFees,q.totalPaid);
});
test('APR remains a recorded quote value and does not replace the nominal amortisation rate',()=>{
 const raw=quotes(),before=evaluateQuotes(raw,journey);raw.a.apr='20';const after=evaluateQuotes(raw,journey);assert.equal(after.quotes[0].apr,20);near(before.quotes[0].monthlyPayment,after.quotes[0].monthlyPayment);
});
test('known fees are added once over the whole term',()=>{const raw=quotes();raw.a.upfront='1.200,50';raw.a.monthlyFee='5,50';const q=evaluateQuotes(raw,journey).quotes[0];near(q.monthlyOutlay,q.monthlyPayment+5.5);near(q.totalWithRecordedFees,q.totalPaid+1200.5+5.5*240);});
for(const [path,value] of [['amount','0'],['years','20.5'],['years','101'],['a.tan',''],['a.tan','-1'],['a.tan','abc'],['b.tan','Infinity'],['a.upfront','-1'],['a.monthlyFee','€300x']])test('invalid quote cannot render a valid comparison: '+path+'='+value,()=>{const raw=quotes();const [k,f]=path.split('.');if(f)raw[k][f]=value;else raw[k]=value;assert.equal(evaluateQuotes(raw,journey).valid,false);});
test('property comparison supports any entered town, exact totals and budget overrun',()=>{
 const raw=property();raw.b.works='20.000';const r=compareProperties(raw,journey.parseNumber);assert.equal(r.valid,true);assert.equal(r.properties[0].city,'Volla');near(r.properties[0].pricePerSqm,150000/70);assert.equal(r.properties[0].total,165000);assert.equal(r.properties[0].budgetAfterCosts,15000);assert.equal(r.properties[1].budgetAfterCosts,-5000);
});
test('missing upfront costs never become zero or a complete total',()=>{const raw=property();delete raw.a.works;delete raw.a.other;const p=compareProperties(raw,journey.parseNumber).properties[0];assert.equal(p.total,null);assert.equal(p.budgetAfterCosts,null);assert.equal(p.budgetAfterPrice,30000);});
test('Italian and English decimal representations produce identical property calculations',()=>{const a=property(),b=property();a.a.price='150.000,50';a.a.sqm='70,5';b.a.price='150,000.50';b.a.sqm='70.5';const x=compareProperties(a,journey.parseNumber),y=compareProperties(b,journey.parseNumber);assert.equal(x.valid,true);assert.equal(y.valid,true);near(x.properties[0].pricePerSqm,y.properties[0].pricePerSqm);near(x.properties[0].total,y.properties[0].total);});
for(const [path,value] of [['a.city','<img src=x>'],['a.price','0'],['b.sqm','0'],['a.works','-10'],['budget','-1'],['a.date','2026-02-29'],['a.date','2026-13-01'],['a.url','javascript:alert(1)'],['a.url','https://user:password@example.com/']])test('invalid property input is rejected: '+path,()=>{const raw=property();const [k,f]=path.split('.');if(f)raw[k][f]=value;else raw[k]=value;assert.equal(compareProperties(raw,journey.parseNumber).valid,false);});
test('external listing links reject script, data, credentials, controls and insecure protocols',()=>{for(const url of ['javascript:alert(1)','data:text/html,hello','http://example.com','https://user:pass@example.com/','https://example.com/\nfoo','//example.com/'])assert.equal(safeListingURL(url),null,url);assert.equal(safeListingURL(''), '');assert.equal(safeListingURL('https://example.com/listing?a=1'),'https://example.com/listing?a=1');});
class Element{
 constructor(id=''){this.id=id;this.value='';this.children=[];this.listeners=new Map();this.attrs={};this.hidden=true;this._text='';this.dataset={};}
 set textContent(s){this._text=String(s);this.children=[];}
 get textContent(){return this._text+this.children.map(e=>e.textContent).join(' ');}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this._text='';this.children=nodes;}
 addEventListener(name,fn){const arr=this.listeners.get(name)||[];arr.push(fn);this.listeners.set(name,arr);}
 dispatchEvent(e){for(const fn of this.listeners.get(e.type)||[])fn(e);}
 fire(type){this.dispatchEvent({type,preventDefault(){}});}
 setAttribute(k,v){this.attrs[k]=v;}
 removeAttribute(k){delete this.attrs[k];}
 focus(){this.focused=true;}
 closest(){return null;}
 scrollIntoView(){}
}
function dom(ids){const nodes=new Map(ids.map(id=>[id,new Element(id)])),events=new Map();return {nodes,document:{getElementById:id=>nodes.get(id)||null,createElement:()=>new Element(),addEventListener:(n,fn)=>events.set(n,fn)},events};}
function descendants(e){return e.children.flatMap(c=>[c,...descendants(c)]);}
function propertyUI(){const fields=['budget',...['a','b'].flatMap(k=>['city','price','sqm','url','date','works','other'].map(f=>`${k}-${f}`))];const h=dom(['rb167-comparison','rb167-result','rb167-status','rb167-submit',...fields.map(f=>'rb167-'+f),'property-link','detected-price','detected-sqm','detected-city','property-preview']);let prepared=0;h.window={currentLang:'it',analyzeProperty:()=>{prepared++;}};initPropertyComparison({...h,parseNumber:journey.parseNumber});h.submit=raw=>{h.nodes.get('rb167-budget').value=raw.budget||'';for(const key of ['a','b'])for(const field of ['city','price','sqm','url','date','works','other'])h.nodes.get(`rb167-${key}-${field}`).value=raw[key][field]||'';h.nodes.get('rb167-comparison').fire('submit');};h.prepared=()=>prepared;return h;}
test('property inputs invalidate old results and detached old transfer controls cannot copy stale data',()=>{const h=propertyUI();h.submit(property());const result=h.nodes.get('rb167-result');assert.equal(result.hidden,false);const oldButton=descendants(result).filter(x=>x.type==='button')[0];h.nodes.get('rb167-a-price').fire('input');assert.equal(result.hidden,true);assert.equal(result.children.length,0);oldButton.fire('click');assert.equal(h.prepared(),0);assert.match(h.nodes.get('rb167-status').textContent,/Dati modificati/);});
test('property worksheet transfer copies only declared fields and keeps the cost limitation visible in both languages',()=>{const h=propertyUI();h.submit(property());descendants(h.nodes.get('rb167-result')).filter(x=>x.type==='button')[0].fire('click');assert.equal(h.prepared(),1);assert.equal(h.nodes.get('detected-price').value,'150000');assert.equal(h.nodes.get('detected-city').value,'Volla');assert.equal(h.nodes.get('detected-sqm').value,'70');const note=h.nodes.get('property-preview').children[0];assert.match(note.attrs['data-it'],/non vengono trasferiti/);assert.match(note.attrs['data-en'],/not transferred/);h.window.currentLang='en';h.events.get('rb_language_changed')();assert.match(h.nodes.get('rb167-result').textContent,/Asking price per m²/);});
test('property reset removes results and subsequent invalid submissions stay hidden',()=>{const h=propertyUI();h.submit(property());h.nodes.get('rb167-comparison').fire('reset');assert.equal(h.nodes.get('rb167-result').hidden,true);const raw=property();raw.a.sqm='0';h.submit(raw);assert.equal(h.nodes.get('rb167-result').hidden,true);assert.equal(h.nodes.get('rb167-a-sqm').attrs['aria-invalid'],'true');});
function mortgageUI(){const fields=['amount','years',...['a','b'].flatMap(k=>['tan','apr','upfront','monthlyFee'].map(f=>`quote-${k}-${f}`))];const h=dom(['quote-comparison','quote-result','quote-status','compare-quotes','rate',...fields]);h.window={currentLang:'it',Event:class{constructor(type){this.type=type;}}};initMortgageQuotes({...h,journey});const raw=quotes();h.nodes.get('amount').value=raw.amount;h.nodes.get('years').value=raw.years;for(const k of ['a','b'])for(const f of ['tan','apr','upfront','monthlyFee'])h.nodes.get(`quote-${k}-${f}`).value=raw[k][f]||'';return h;}
test('mortgage comparison invalidates stale actions after inputs change',()=>{const h=mortgageUI();h.nodes.get('compare-quotes').fire('click');const result=h.nodes.get('quote-result');assert.equal(result.hidden,false);const old=descendants(result).filter(x=>x.type==='button')[0];h.nodes.get('quote-a-tan').fire('input');assert.equal(result.hidden,true);old.fire('click');assert.equal(h.nodes.get('rate').value,'');});
test('mortgage language changes preserve terms and TAN transfer explicitly excludes APR and fees',()=>{const h=mortgageUI();h.nodes.get('compare-quotes').fire('click');h.window.currentLang='en';h.events.get('rb_language_changed')();assert.match(h.nodes.get('quote-result').textContent,/Monthly payment excluding fees/);descendants(h.nodes.get('quote-result')).filter(x=>x.type==='button')[0].fire('click');assert.equal(h.nodes.get('rate').value,'3.5');assert.match(h.nodes.get('quote-status').textContent,/APR and fees.+not transferred/);assert.equal(h.nodes.get('quote-a-apr').value,'4,1');});
