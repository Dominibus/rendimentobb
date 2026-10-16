import {readInvestmentAssumptions} from './investment-assumptions.js?v=20261009-rc91';
import {buildPropertyPerformance,reportPeriod,performanceNotice} from './property-performance.js?v=20261016-rc143';
const clean=v=>String(v??'').slice(0,160);
const date=v=>{const n=v?.toMillis?.()??(typeof v?.seconds==='number'?v.seconds*1000:Date.parse(v));return Number.isFinite(n)?new Date(n).toISOString():null;};
// The handoff contains only fields needed by reports, never guest names or contacts.
export function buildReportContext({ownerUid,snapshot,analyses=[],generatedAt=new Date().toISOString()}){
 if(!ownerUid||snapshot?.ownerUid!==ownerUid||snapshot.isDemo||snapshot.portalSnapshotReady!==true||!Array.isArray(snapshot.propertyList)||!Array.isArray(snapshot.portalBookingList))throw Error('REPORT_CONTEXT_UNAVAILABLE');
 const propertyList=snapshot.propertyList.map(p=>({id:clean(p.id),name:clean(p.name),city:clean(p.city),analysisId:typeof p.analysisId==='string'?p.analysisId:null}));
 const fields=['propertyId','checkin','checkout','totalAmount','amountRecognized','guests','status','requiresAttention'];
 const portalBookingList=snapshot.portalBookingList.map(b=>Object.fromEntries(fields.filter(k=>Object.hasOwn(b,k)).map(k=>[k,b[k]])));
 const renovationList=(snapshot.renovationList||[]).map(p=>Object.fromEntries(['propertyId','propertyName','status','plannedTotal','actualSpent','progressPercent'].filter(k=>Object.hasOwn(p,k)).map(k=>[k,p[k]])));
 const list=analyses.filter(a=>a.uid===ownerUid&&typeof a.id==='string').map(a=>({id:a.id,uid:ownerUid,isPortfolio:a.isPortfolio===true,propertyId:typeof a.propertyId==='string'?a.propertyId:null,city:clean(a.realCity||a.userCity||a.city),createdAt:date(a.createdAt||a.createdAtClient),assumptions:readInvestmentAssumptions(a.assumptions),...Object.fromEntries(['gross','net','roi','equity','occupancy','annualDebtService','dscr'].map(k=>[k,a[k]??null]))}));
 return {version:1,ownerUid,generatedAt,snapshot:{ownerUid,isDemo:false,portalSnapshotReady:true,propertyList,portalBookingList,renovationList},analyses:list};
}
export function reportCatalogue(context,ownerUid){
 if(context?.version!==1||context.ownerUid!==ownerUid||context.snapshot?.ownerUid!==ownerUid||!Array.isArray(context.analyses))return [];
 const props=context.snapshot.propertyList||[];
 return context.analyses.filter(a=>a.uid===ownerUid).map(a=>{
  const candidates=props.filter(p=>p.id===a.propertyId&&p.analysisId===a.id);
  const claimants=props.filter(p=>p.analysisId===a.id);
  const verified=candidates.length===1&&claimants.length===1&&context.analyses.filter(x=>x.id===a.id).length===1;
  const property=verified?candidates[0]:null;
  return {id:a.id,isPortfolio:a.isPortfolio===true,propertyId:property?.id||null,name:property?.name||null,city:a.city,createdAt:a.createdAt,linkState:verified?'linked':a.propertyId||claimants.length?'inconsistent':'unlinked'};
 });
}
export function provenanceLabel(entry,lang='it'){
 const en=lang==='en',t=(it,eng)=>en?eng:it;
 if(!entry)return t('Origine non verificata','Origin not verified');
 const status=entry.isPortfolio?t('Nel portfolio','In portfolio'):t('Solo simulazione','Simulation only');
 const link=entry.linkState==='linked'?t('PMS collegato','PMS linked'):entry.linkState==='inconsistent'?t('Collegamento da verificare','Check link'):t('Senza collegamento PMS','No PMS link');
 const saved=entry.createdAt?new Date(entry.createdAt).toLocaleDateString(en?'en-GB':'it-IT'):t('Data non disponibile','Date unavailable');
 return [entry.name||entry.city||t('Analisi','Analysis'),status,link,saved,'ID '+entry.id].join(' · ');
}
export function integratedReport(context,{ownerUid,analysisId,period,portfolio=false,lang='it'}={}){
 const entry=reportCatalogue(context,ownerUid).find(e=>e.id===analysisId);
 if(!entry)throw Error('REPORT_ANALYSIS_UNAVAILABLE');
 if(!portfolio&&entry.linkState!=='linked')return null;
 const report=buildPropertyPerformance({snapshot:context.snapshot,analyses:context.analyses,ownerUid,propertyId:portfolio?'':entry.propertyId,period,generatedAt:context.generatedAt});
 report.performance.noticeTexts=report.performance.rows.flatMap(r=>r.notices.map(n=>r.name+': '+performanceNotice(n,lang)));
 return report;
}
export {reportPeriod};
