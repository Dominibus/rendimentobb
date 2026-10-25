// Shared by the authenticated service, the real UI and the explicit memory demo.
import {calculateCommercial,createCommercialDemo} from './commercial-property-engine.js';
import {createCommercialActivityPlan} from './commercial-activity-plan.js';
export class CommercialOperationError extends Error{constructor(code,status=400){super(code);this.code=code;this.status=status;}}
export const commercialFail=(code,status)=>{throw new CommercialOperationError(code,status);};
const fail=commercialFail;
const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
const id=x=>typeof x==='string'&&/^[-A-Za-z0-9_]{1,64}$/.test(x);
const text=(x,max)=>typeof x==='string'&&x.trim().length>0&&x.length<=max&&!/[<>\u0000-\u001f\u007f]/.test(x);
const exact=(o,keys)=>{if(!plain(o)||Object.keys(o).some(k=>!keys.includes(k)))fail('invalid_payload');};
function day(x){if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x)||x<'1900-01-01'||x>'2100-12-31'||!Number.isFinite(Date.parse(x+'T00:00:00Z'))||new Date(x+'T00:00:00Z').toISOString().slice(0,10)!==x)fail('invalid_date');return x;}
export function normalizeCommercialModel(input){
 if(!plain(input)||JSON.stringify(input).length>90000)fail('model_too_large');
 exact(input,['schema','year','property','costs','openDays','slots','rooms','assignments','closures']);
 exact(input.property,['ownership','value','acquisitionCosts','works','otherCapital','newLoan','existingLoan']);
 exact(input.property.newLoan,['amount','rate','years']);exact(input.property.existingLoan,['amount','annualService']);exact(input.costs,['fixedAnnual','variablePct']);
 for(const [key,keys]of [['rooms',['id']],['slots',['id','start','end']],['closures',['roomId','start','end']],['assignments',['id','roomId','code','mode','weekdays','slotIds','start','end','amount','vat','expectedPct']]]){
  if(!Array.isArray(input[key]))fail('invalid_payload');for(const row of input[key]){exact(row,keys);if(key==='assignments')exact(row.vat,['status','rate']);}
 }
 try{calculateCommercial(input);}catch(e){fail(e.code==='collision'?'collision':'invalid_model');}
 return JSON.parse(JSON.stringify(input));
}
export function newCommercialWorkspace({name,model},now,idValue){
 if(!text(name,80)||!id(idValue))fail('invalid_payload');
 return {schema:'commercial-workspace-v1',kind:'commercial',id:idValue,name:name.trim(),version:1,scenarioRevision:1,scenario:normalizeCommercialModel(model),operating:null,operatingRevision:0,confirmedScenarioRevision:null,ledger:[],tasks:[],history:[],createdAt:now,updatedAt:now};
}
export function applyCommercialOperation(current,operation,data,{now,id:idValue}={}){
 if(!current||current.schema!=='commercial-workspace-v1'||current.kind!=='commercial')fail('invalid_workspace');
 const w=structuredClone(current);data=data||{};
 const event={operation,at:now,revision:w.version+1};
 if(operation==='save_scenario'){
  exact(data,['model','name']);const scenario=normalizeCommercialModel(data.model);if(w.operating&&scenario.year!==w.operating.year)fail('operating_year_locked');w.scenario=scenario;w.scenarioRevision++;
  if(data.name!==undefined){if(!text(data.name,80))fail('invalid_payload');w.name=data.name.trim();}
 }else if(operation==='confirm'){
  exact(data,[]);if(!w.scenario.assignments.length)fail('contracts_required');
  if(w.operating)fail('already_confirmed',409);
  w.operating=normalizeCommercialModel(w.scenario);w.operatingRevision=1;w.confirmedScenarioRevision=w.scenarioRevision;
 }else if(operation==='update_operating'){
  exact(data,['model']);if(!w.operating)fail('confirmation_required');const next=normalizeCommercialModel(data.model);
  if(next.year!==w.operating.year)fail('operating_year_locked');if(w.tasks.some(t=>!next.rooms.some(r=>r.id===t.roomId)))fail('room_has_tasks');
  // Preserve contract identity and terms once a financial movement has been recorded.
  if(w.ledger.length){
   for(const key of ['rooms','slots','openDays'])if(JSON.stringify(next[key])!==JSON.stringify(w.operating[key]))fail('recorded_contract_locked');
   const linked=new Set(w.ledger.map(e=>e.contractId).filter(Boolean));
   for(const key of linked){const old=w.operating.assignments.find(a=>a.id===key),fresh=next.assignments.find(a=>a.id===key);if(JSON.stringify(old)!==JSON.stringify(fresh))fail('recorded_contract_locked');}
   if(JSON.stringify(next.closures)!==JSON.stringify(w.operating.closures)){
    const lastPeriod=w.ledger.map(e=>e.period).sort().at(-1);
    const oldPast=w.operating.closures.filter(c=>c.start.slice(0,7)<=lastPeriod),newPast=next.closures.filter(c=>c.start.slice(0,7)<=lastPeriod);
    if(JSON.stringify(oldPast)!==JSON.stringify(newPast))fail('recorded_period_locked');
   }
  }
  w.operating=next;w.operatingRevision++;
 }else if(operation==='add_movement'){
  exact(data,['kind','date','period','contractId','cents','reference']);if(!w.operating)fail('confirmation_required');if(w.ledger.length>=500)fail('ledger_limit');
  if(!['receipt','refund','cost'].includes(data.kind)||!Number.isSafeInteger(data.cents)||data.cents<=0||data.cents>1e10||!text(data.reference,64)||!id(idValue))fail('invalid_movement');
  day(data.date);const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome'}).format(new Date(now));if(data.date>today)fail('future_movement');if(!new RegExp('^'+w.operating.year+'-(0[1-9]|1[0-2])$').test(data.period))fail('invalid_period');
  if(data.kind==='cost'){if(data.contractId!==null)fail('invalid_contract');}
  else{
   const contract=w.operating.assignments.find(a=>a.id===data.contractId);if(!contract||contract.start.slice(0,7)>data.period||contract.end.slice(0,7)<data.period)fail('invalid_contract');
   if(data.kind==='refund'){
    const balance=w.ledger.filter(e=>!e.voided&&e.contractId===data.contractId&&e.period===data.period).reduce((n,e)=>n+(e.kind==='receipt'?e.cents:e.kind==='refund'?-e.cents:0),0);
    if(data.cents>balance)fail('refund_exceeds_receipts');
   }
  }
  w.ledger.push({id:idValue,...data,reference:data.reference.trim(),voided:false,createdAt:now});event.recordId=idValue;
 }else if(operation==='void_movement'){
  exact(data,['id','reason']);if(!text(data.reason,64))fail('invalid_payload');const entry=w.ledger.find(e=>e.id===data.id);if(!entry||entry.voided)fail('movement_not_found');
  if(entry.kind==='receipt'){
   const balance=w.ledger.filter(e=>!e.voided&&e.contractId===entry.contractId&&e.period===entry.period).reduce((n,e)=>n+(e.kind==='receipt'?e.cents:e.kind==='refund'?-e.cents:0),0);if(balance<entry.cents)fail('refund_exceeds_receipts');
  }
  entry.voided=true;entry.voidReason=data.reason.trim();entry.voidedAt=now;event.recordId=entry.id;
 }else if(operation==='add_task'){
  exact(data,['roomId','category','priority','dueDate','note']);if(!w.operating)fail('confirmation_required');if(w.tasks.length>=200)fail('task_limit');
  if(!w.operating.rooms.some(r=>r.id===data.roomId)||!['maintenance','cleaning','access','user_report','other'].includes(data.category)||!['low','normal','urgent'].includes(data.priority)||!text(data.note,200)||!id(idValue))fail('invalid_task');day(data.dueDate);
  w.tasks.push({id:idValue,...data,note:data.note.trim(),status:'open',createdAt:now});event.recordId=idValue;
 }else if(operation==='task_status'){
  exact(data,['id','status']);const task=w.tasks.find(t=>t.id===data.id);if(!task||!['open','done'].includes(data.status))fail('invalid_task');task.status=data.status;task.updatedAt=now;event.recordId=task.id;
 }else fail('invalid_operation');
 // Refunds can never exceed receipts already recorded on that date, including after a void.
 const balances=new Map();for(const e of w.ledger.filter(e=>!e.voided&&e.kind!=='cost').sort((a,b)=>a.date.localeCompare(b.date)||(a.kind==='receipt'?-1:1))){const key=e.contractId+':'+e.period,balance=(balances.get(key)||0)+(e.kind==='receipt'?e.cents:-e.cents);if(balance<0)fail('refund_exceeds_receipts');balances.set(key,balance);}
 w.version++;w.updatedAt=now;w.history=[...w.history,event].slice(-100);
 if(JSON.stringify(w).length>450000)fail('workspace_limit');
 return w;
}
const roundedCents=x=>Math.round(x*100);
export function commercialWorkspaceSummary(w,month){
 const model=w.operating||w.scenario;
 if(!Number.isInteger(month)||month<1||month>12)fail('invalid_period');
 const plan=createCommercialActivityPlan(model),m=plan.months[month-1],period=`${model.year}-${String(month).padStart(2,'0')}`;
 const active=w.ledger.filter(e=>!e.voided),entries=active.filter(e=>e.period===period),cashEntries=active.filter(e=>e.date.slice(0,7)===period);
 const totals=rows=>rows.reduce((n,e)=>{n[e.kind]+=e.cents;return n;},{receipt:0,refund:0,cost:0});const accrued=totals(entries),cash=totals(cashEntries);
 const receipts=accrued.receipt-accrued.refund;
 return {period,source:w.operating?'confirmed_contracts':'scenario_only',operatingRevision:w.operatingRevision,month:m,plan,entries,cashEntries,
  registeredReceipts:entries.some(e=>e.kind!=='cost')?receipts/100:null,
  registeredCosts:entries.some(e=>e.kind==='cost')?accrued.cost/100:null,
  recordedCashBalance:cashEntries.length?(cash.receipt-cash.refund-cash.cost)/100:null,
  reconciliationDifference:entries.some(e=>e.kind!=='cost')?(roundedCents(m.contractualGross)-receipts)/100:null,
  contractBalances:m.contracts.map(a=>{const linked=entries.filter(e=>e.contractId===a.id);const paid=linked.reduce((n,e)=>n+(e.kind==='receipt'?e.cents:e.kind==='refund'?-e.cents:0),0);return {...a,registered:linked.length?paid/100:null,difference:linked.length?(roundedCents(a.contractualGross)-paid)/100:null};})};
}
export function createCommercialWorkspaceDemo(){
 const m=createCommercialDemo('mixed');for(const a of m.assignments)a.vat={status:'no_vat',rate:null};
 let w=newCommercialWorkspace({name:'Spazio dimostrativo / Demo space',model:m},'2027-01-01T09:00:00Z','demo-space');
 w=applyCommercialOperation(w,'confirm',{}, {now:'2027-01-01T09:01:00Z',id:'confirm-demo'});
 w=applyCommercialOperation(w,'add_movement',{kind:'receipt',date:'2027-01-08',period:'2027-01',contractId:'A1',cents:120000,reference:'DEMO-001'},{now:'2027-01-08T09:00:00Z',id:'demo-receipt'});
 w=applyCommercialOperation(w,'add_movement',{kind:'cost',date:'2027-01-09',period:'2027-01',contractId:null,cents:12000,reference:'DEMO-COST-001'},{now:'2027-01-09T09:00:00Z',id:'demo-cost'});
 return applyCommercialOperation(w,'add_task',{roomId:'R2',category:'maintenance',priority:'normal',dueDate:'2027-01-15',note:'Verifica dotazione stanza / Check room equipment'},{now:'2027-01-09T09:00:00Z',id:'demo-task'});
}
