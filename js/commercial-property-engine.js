// RC193. Pure economic planning; no account, tourism formulas or I/O.
import {calculateMortgage} from './mortgage-engine.js';

export class CommercialInputError extends Error {
 constructor(code,field){super(`${code}: ${field}`);this.name='CommercialInputError';this.code=code;this.field=field;}
}
const fail=(code,field)=>{throw new CommercialInputError(code,field);};
function number(v,field,min=0,max=1e12){
 if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail('number',field);
 return v;
}
function integer(v,field,min,max){number(v,field,min,max);if(!Number.isInteger(v))fail('integer',field);return v;}
function list(v,field,min,max){if(!Array.isArray(v)||v.length<min||v.length>max)fail('list',field);return v;}
function unique(v,field){if(new Set(v).size!==v.length)fail('duplicate',field);return v;}
function id(v,field){if(typeof v!=='string'||!/^[-A-Za-z0-9_]{1,32}$/.test(v))fail('code',field);return v;}
function date(v,field){
 if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))fail('date',field);
 const d=new Date(`${v}T00:00:00Z`);
 if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==v||v<'1900-01-01'||v>'2100-12-31')fail('date',field);
 return v;
}
const iso=d=>d.toISOString().slice(0,10);
const daysBetween=(a,b)=>Math.round((Date.parse(`${b}T00:00:00Z`)-Date.parse(`${a}T00:00:00Z`))/86400000)+1;
function range(o,field){date(o.start,field+'.start');date(o.end,field+'.end');if(o.start>o.end)fail('range',field);}
function time(v,field){if(typeof v!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(v))fail('time',field);return Number(v.slice(0,2))*60+Number(v.slice(3));}
const contains=(o,d)=>o.start<=d&&o.end>=d;
function monthFraction(start,end,year){
 let sum=0;
 for(let m=0;m<12;m++){
  const a=iso(new Date(Date.UTC(year,m,1))),b=iso(new Date(Date.UTC(year,m+1,0)));
  const lo=start>a?start:a,hi=end<b?end:b;
  if(lo<=hi)sum+=daysBetween(lo,hi)/daysBetween(a,b);
 }
 return sum;
}
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const sumKnown=xs=>xs.every(x=>x!==null)?sum(xs):null;
const pct=(a,b)=>a===null||b<=0?null:a/b*100;

export function validateCommercialModel(m){
 if(!m||m.schema!=='commercial-property-v1')fail('schema','schema');
 integer(m.year,'year',1900,2100);
 const p=m.property;
 if(!p||!['owned','purchase'].includes(p.ownership))fail('choice','property.ownership');
 for(const k of ['value','acquisitionCosts','works','otherCapital'])number(p[k],'property.'+k);
 if(p.ownership==='owned'&&p.acquisitionCosts!==0)fail('owned_cost','property.acquisitionCosts');
 const loan=p.newLoan;if(!loan)fail('choice','property.newLoan');
 number(loan.amount,'newLoan.amount');number(loan.rate,'newLoan.rate',0,100);number(loan.years,'newLoan.years',1,60);
 const initial=(p.ownership==='purchase'?p.value+p.acquisitionCosts:0)+p.works+p.otherCapital;
 if(loan.amount>initial)fail('funding','newLoan.amount');
 const old=p.existingLoan;if(!old)fail('choice','property.existingLoan');
 number(old.amount,'existingLoan.amount');number(old.annualService,'existingLoan.annualService');
 if((old.amount===0)!==(old.annualService===0))fail('debt','existingLoan');
 if(p.ownership==='purchase'&&old.amount!==0)fail('debt','existingLoan');
 if(!m.costs)fail('choice','costs');
 number(m.costs.fixedAnnual,'costs.fixedAnnual');number(m.costs.variablePct,'costs.variablePct',0,100);
 unique(list(m.openDays,'openDays',1,7),'openDays').forEach(x=>integer(x,'openDays',1,7));
 unique(list(m.rooms,'rooms',1,30).map(r=>id(r.id,'room.id')),'rooms');
 unique(list(m.slots,'slots',1,12).map(s=>id(s.id,'slot.id')),'slots');
 for(const s of m.slots)if(time(s.start,'slot.start')>=time(s.end,'slot.end'))fail('range','slots');
 for(let i=0;i<m.slots.length;i++)for(let j=i+1;j<m.slots.length;j++)if(m.slots[i].start<m.slots[j].end&&m.slots[j].start<m.slots[i].end)fail('overlap','slots');
 const rooms=new Set(m.rooms.map(r=>r.id)),slots=new Set(m.slots.map(s=>s.id));
 unique(list(m.assignments,'assignments',0,120).map(a=>id(a.id,'assignment.id')),'assignments');
 for(const a of m.assignments){
  if(!rooms.has(a.roomId))fail('room','assignment.roomId');id(a.code,'assignment.code');
  if(!['room_monthly','weekly_monthly','per_use'].includes(a.mode))fail('tariff','assignment.mode');
  range(a,'assignment');number(a.amount,'assignment.amount',0,1e7);number(a.expectedPct,'assignment.expectedPct',0,100);
  if(!a.vat||!['unknown','taxable','no_vat'].includes(a.vat.status))fail('vat','assignment.vat');
  if(a.vat.status==='taxable')number(a.vat.rate,'assignment.vat.rate',0,100);
  else if(a.vat.rate!==null)fail('vat','assignment.vat.rate');
  if(a.mode!=='room_monthly'){
   unique(list(a.weekdays,'assignment.weekdays',1,7),'assignment.weekdays').forEach(d=>{if(!m.openDays.includes(d))fail('weekday','assignment.weekdays');});
   unique(list(a.slotIds,'assignment.slotIds',1,12),'assignment.slotIds').forEach(s=>{if(!slots.has(s))fail('slot','assignment.slotIds');});
  }
 }
 list(m.closures,'closures',0,100).forEach(c=>{if(c.roomId!=='*'&&!rooms.has(c.roomId))fail('room','closure.roomId');range(c,'closure');});
 return m;
}

export function calculateCommercial(m){
 validateCommercialModel(m);
 const first=`${m.year}-01-01`,last=`${m.year}-12-31`,calendar=[];
 const stats=new Map(m.assignments.map(a=>[a.id,{a,uses:0,reserved:0,expectedSlots:0}]));
 const roomStats=new Map(m.rooms.map(r=>[r.id,{roomId:r.id,capacity:0,reserved:0,expectedSlots:0}]));
 // Collisions are checked even during closures: two contracts cannot reserve the same slot.
 for(let d=new Date(first+'T00:00:00Z');iso(d)<=last;d.setUTCDate(d.getUTCDate()+1)){
  const day=iso(d),weekday=d.getUTCDay()||7;if(!m.openDays.includes(weekday))continue;
  for(const r of m.rooms){
   const closed=m.closures.some(c=>(c.roomId==='*'||c.roomId===r.id)&&contains(c,day));
   for(const s of m.slots){
    const matches=m.assignments.filter(a=>a.roomId===r.id&&contains(a,day)&&(a.mode==='room_monthly'||a.weekdays.includes(weekday)&&a.slotIds.includes(s.id)));
    if(matches.length>1)fail('collision',`${day}/${r.id}/${s.id}`);
    const a=matches[0],rs=roomStats.get(r.id);
    if(!closed){
     rs.capacity++;
     if(a){const st=stats.get(a.id);st.uses++;st.reserved++;st.expectedSlots+=a.expectedPct/100;rs.reserved++;rs.expectedSlots+=a.expectedPct/100;}
    }
    calendar.push({date:day,roomId:r.id,slotId:s.id,closed,assignmentId:a?.id??null,code:a?.code??null});
   }
  }
 }
 const assignments=[...stats.values()].map(({a,uses,reserved,expectedSlots})=>{
  const units=a.mode==='per_use'?uses:monthFraction(a.start,a.end,m.year);
  const contractualGross=a.amount*units,expectedGross=contractualGross*a.expectedPct/100;
  const divisor=a.vat.status==='unknown'?null:a.vat.status==='taxable'?1+a.vat.rate/100:1;
  const contractualNet=divisor===null?null:contractualGross/divisor,expectedNet=divisor===null?null:expectedGross/divisor;
  return {id:a.id,roomId:a.roomId,code:a.code,mode:a.mode,amount:a.amount,vat:a.vat,expectedPct:a.expectedPct,start:a.start,end:a.end,weekdays:a.weekdays,slotIds:a.slotIds,units,reserved,expectedSlots,contractualGross,expectedGross,contractualNet,expectedNet,expectedVAT:expectedNet===null?null:expectedGross-expectedNet};
 });
 const contractualGross=sum(assignments.map(a=>a.contractualGross)),expectedGross=sum(assignments.map(a=>a.expectedGross));
 const contractualNet=sumKnown(assignments.map(a=>a.contractualNet)),expectedNet=sumKnown(assignments.map(a=>a.expectedNet));
 const p=m.property,initialOutlay=(p.ownership==='purchase'?p.value+p.acquisitionCosts:0)+p.works+p.otherCapital;
 const newEquity=initialOutlay-p.newLoan.amount;
 const newDebtService=p.newLoan.amount?calculateMortgage(p.newLoan.amount,p.newLoan.rate,p.newLoan.years):0;
 const annualDebtService=newDebtService+p.existingLoan.annualService;
 const variableCosts=expectedNet===null?null:expectedNet*m.costs.variablePct/100;
 const operatingCosts=variableCosts===null?null:m.costs.fixedAnnual+variableCosts;
 const operatingMargin=expectedNet===null?null:expectedNet-operatingCosts;
 const cashflow=operatingMargin===null?null:operatingMargin-annualDebtService;
 const contribution=1-m.costs.variablePct/100;
 const breakEvenRevenue=contribution>0?(m.costs.fixedAnnual+annualDebtService)/contribution:null;
 const breakEvenRealisationPct=contractualNet===null||contractualNet<=0||breakEvenRevenue===null?null:breakEvenRevenue/contractualNet*100;
 const rooms=[...roomStats.values()].map(r=>{
  const rows=assignments.filter(a=>a.roomId===r.roomId);
  return {...r,free:r.capacity-r.reserved,utilisationPct:pct(r.reserved,r.capacity),expectedUtilisationPct:pct(r.expectedSlots,r.capacity),contractualGross:sum(rows.map(a=>a.contractualGross)),expectedGross:sum(rows.map(a=>a.expectedGross)),expectedNet:sumKnown(rows.map(a=>a.expectedNet))};
 });
 const byCode=new Map();for(const a of assignments)byCode.set(a.code,(byCode.get(a.code)||0)+a.contractualGross);
 const largestContractSharePct=contractualGross>0?Math.max(0,...byCode.values())/contractualGross*100:null;
 return {schema:m.schema,year:m.year,assignments,rooms,calendar,contractualGross,expectedGross,contractualNet,expectedNet,expectedVAT:expectedNet===null?null:expectedGross-expectedNet,initialOutlay,newEquity,newDebtService,annualDebtService,operatingCosts,operatingMargin,cashflow,grossYieldPct:pct(expectedNet,p.value),operatingYieldPct:pct(operatingMargin,p.value),newEquityReturnPct:pct(cashflow,newEquity),breakEvenRevenue,breakEvenRealisationPct,largestContractSharePct,capacity:sum(rooms.map(r=>r.capacity)),reserved:sum(rooms.map(r=>r.reserved)),free:sum(rooms.map(r=>r.free))};
}

export function commercialSensitivity(m,{revenueDropPct=0,costIncreasePct=0}={}){
 number(revenueDropPct,'revenueDropPct',0,100);number(costIncreasePct,'costIncreasePct',0,1000);
 const base=calculateCommercial(m),revenue=base.expectedNet===null?null:base.expectedNet*(1-revenueDropPct/100);
 const costs=revenue===null?null:(m.costs.fixedAnnual+revenue*m.costs.variablePct/100)*(1+costIncreasePct/100);
 return {revenueDropPct,costIncreasePct,expectedNet:revenue,operatingCosts:costs,cashflow:revenue===null?null:revenue-costs-base.annualDebtService};
}

export function createCommercialModel(year=2027){
 return {schema:'commercial-property-v1',year,property:{ownership:'owned',value:0,acquisitionCosts:0,works:0,otherCapital:0,newLoan:{amount:0,rate:0,years:20},existingLoan:{amount:0,annualService:0}},costs:{fixedAnnual:0,variablePct:0},openDays:[1,2,3,4,5],slots:[{id:'AM',start:'09:00',end:'13:00'},{id:'PM',start:'14:00',end:'18:00'}],rooms:[{id:'R1'}],assignments:[],closures:[]};
}

export function createCommercialDemo(mode='weekly_monthly'){
 // Entirely fictional public scenarios; separate from numerical regression fixtures.
 const m=createCommercialModel(2027);m.property.value=240000;m.property.works=18000;m.costs.fixedAnnual=4800;
 m.rooms.push({id:'R2'});
 const mixed=mode==='mixed';
 if(mixed)mode='room_monthly';
 const amount=mode==='per_use'?75:mode==='room_monthly'?1200:600;
 m.assignments=[{id:'A1',roomId:'R1',code:'P01',mode,weekdays:[2,4],slotIds:['AM'],start:'2027-01-01',end:'2027-12-31',amount,vat:{status:'unknown',rate:null},expectedPct:100}];
 if(mixed){
  m.assignments.push({...structuredClone(m.assignments[0]),id:'A2',roomId:'R2',code:'P02',mode:'weekly_monthly',amount:450,weekdays:[1],slotIds:['AM']});
  m.assignments.push({...structuredClone(m.assignments[0]),id:'A3',roomId:'R2',code:'P03',mode:'per_use',amount:65,weekdays:[3],slotIds:['PM']});
 }
 return m;
}
