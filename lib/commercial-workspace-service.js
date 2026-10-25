import crypto from 'node:crypto';
import {getPlanForScope} from '../js/account-plan.js';
import {newCommercialWorkspace,applyCommercialOperation,CommercialOperationError,commercialFail as fail} from '../js/commercial-workspace-model.js';
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(x);
const id=x=>typeof x==='string'&&/^[-A-Za-z0-9_]{1,64}$/.test(x);
const writes=new Set(['create','save_scenario','confirm','update_operating','add_movement','void_movement','add_task','task_status']);
const expose=data=>{const {uid,...value}=data;return value;};
export async function performCommercialOperation(db,decoded,body,{now=Date.now()}={}){
 if(!decoded?.uid)fail('unauthorized',401);
 if(!body||typeof body!=='object'||Array.isArray(body)||JSON.stringify(body).length>110000||!['list','get',...writes].includes(body.operation))fail('invalid_request');
 const op=body.operation,write=writes.has(op),uid=decoded.uid;
 if(write&&!uuid(body.requestId))fail('invalid_request');
 if(op!=='list'&&op!=='create'&&!id(body.workspaceId))fail('invalid_request');
 if(write&&op!=='create'&&(!Number.isSafeInteger(body.expectedVersion)||body.expectedVersion<1))fail('invalid_request');
 const digest=write?crypto.createHash('sha256').update(uid+':'+body.requestId).digest('hex'):null;
 const fingerprint=write?crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex'):null;
 const ownerRef=db.collection('_commercial_owners').doc(uid),userRef=db.collection('users').doc(uid);
 const operationRef=write?db.collection('_commercial_operations').doc(digest):null;
 const workspaceId=op==='create'?digest.slice(0,32):body.workspaceId;
 const workspaceRef=op==='list'?null:db.collection('commercial_workspaces').doc(workspaceId);
 return db.runTransaction(async tx=>{
  const ownerSnap=await tx.get(ownerRef),owner=ownerSnap.exists?ownerSnap.data():{workspaceIds:[]};
  const sameWindow=typeof owner.rateStartedAt==='number'&&now>=owner.rateStartedAt&&now-owner.rateStartedAt<60000;
  const rateCount=sameWindow?(owner.rateCount||0):0;
  if(rateCount>=60)fail('too_many_requests',429);
  const oldOperation=operationRef?await tx.get(operationRef):null;
  if(oldOperation?.exists){
   if(oldOperation.data().fingerprint!==fingerprint)fail('idempotency_mismatch',409);
   const snap=await tx.get(db.collection('commercial_workspaces').doc(oldOperation.data().workspaceId));
   if(!snap.exists||snap.data().uid!==uid)fail('not_found',404);
   return {success:true,workspace:expose(snap.data()),duplicate:true};
  }
  const user=await tx.get(userRef);
  const canWrite=decoded.email_verified===true&&decoded.email==='rendimentobb@gmail.com'||user.exists&&['investor','pro','pro_yearly'].includes(getPlanForScope(user.data(),false,now));
  if(write&&!canWrite)fail('plan_required',403);
  let result;
  if(op==='list'){
   const rows=Object.values(owner.summaries||{}).filter(w=>(owner.workspaceIds||[]).includes(w.id));
   result={success:true,workspaces:rows,canWrite};
  }else{
   const snap=await tx.get(workspaceRef);
   if(op==='create'){
    if((owner.workspaceIds||[]).length>=30)fail('workspace_count_limit');
    if(snap.exists)fail('conflict',409);
    const w=newCommercialWorkspace(body.data,new Date(now).toISOString(),workspaceId);result={success:true,workspace:w};
   }else{
    if(!snap.exists||snap.data().uid!==uid||snap.data().kind!=='commercial')fail('not_found',404);
    if(op==='get')result={success:true,workspace:expose(snap.data()),canWrite};
    else{
     const current=expose(snap.data());if(current.version!==body.expectedVersion)fail('version_conflict',409);
     result={success:true,workspace:applyCommercialOperation(current,op,body.data,{now:new Date(now).toISOString(),id:digest.slice(0,32)})};
    }
   }
  }
  // All reads precede writes; the owner doc serializes creates and enforces the unit limit.
  const summaries={...(owner.summaries||{})};if(write){const w=result.workspace;summaries[w.id]={id:w.id,name:w.name,year:w.scenario.year,version:w.version,confirmed:!!w.operating,updatedAt:w.updatedAt};}
  tx.set(ownerRef,{uid,workspaceIds:op==='create'?[...(owner.workspaceIds||[]),workspaceId]:(owner.workspaceIds||[]),summaries,rateStartedAt:sameWindow?owner.rateStartedAt:now,rateCount:rateCount+1});
  if(write){tx.set(workspaceRef,{...result.workspace,uid});tx.set(operationRef,{uid,workspaceId,fingerprint,version:result.workspace.version,createdAt:new Date(now).toISOString()});}
  return result;
 });
}
export function createCommercialWorkspaceHandler({getFirestore,verifyToken,now=()=>Date.now()}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','no-store, max-age=0');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST')return res.status(405).json({success:false,error:'method_not_allowed'});
  const token=/^Bearer ([^\s]+)$/.exec(req.headers?.authorization||'')?.[1];if(!token)return res.status(401).json({success:false,error:'unauthorized'});
  try{
   const db=getFirestore(),decoded=await verifyToken(token);
   return res.status(200).json(await performCommercialOperation(db,decoded,req.body,{now:now()}));
  }catch(error){
   if(error instanceof CommercialOperationError)return res.status(error.status).json({success:false,error:error.code});
   if(String(error?.code||'').startsWith('auth/'))return res.status(401).json({success:false,error:'invalid_authentication'});
   return res.status(503).json({success:false,error:'server_unavailable'});
  }
 };
}
