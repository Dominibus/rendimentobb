import {createHmac, randomUUID} from 'node:crypto';
import {isIP} from 'node:net';

export const SOLUTION_PRIVACY_VERSION='2026-10-19-rc155';
export const SOLUTION_MARKETING_VERSION='basic-beyond-updates-v1';
export const SOLUTION_RETENTION_MS=90*86400000;
export const SOLUTION_ORIGINS=['https://www.rendimentobb.it','https://rendimentobb.it','https://www.rendimentobb.com','https://rendimentobb.com'];
export class SolutionError extends Error {
 constructor(code,status=400){super(code);this.code=code;this.status=status;}
}
const keys=new Set(['problem','outcome','description','level','types','email','contactMe','processingConsent','marketingConsent','privacyVersion','marketingVersion','lang','website','requestId']);
const types=new Set(['website','management','dashboard','app','automation','other','unsure']);
function text(value,max,min=0){
 if(typeof value!=='string')throw new SolutionError('INVALID_REQUEST');
 const clean=value.normalize('NFC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').trim();
 if(clean.length<min || clean.length>max)throw new SolutionError('INVALID_REQUEST');
 return clean;
}
export function normalizeSolutionRequest(body){
 if(!body || typeof body!=='object' || Array.isArray(body) || Object.keys(body).some(k=>!keys.has(k)))throw new SolutionError('INVALID_REQUEST');
 if(body.website!==undefined && body.website!=='')throw new SolutionError('INVALID_REQUEST');
 if(!['it','en'].includes(body.lang) || !['beginner','intermediate','expert'].includes(body.level))throw new SolutionError('INVALID_REQUEST');
 if(body.processingConsent!==true)throw new SolutionError('PROCESSING_REQUIRED');
 if(typeof body.contactMe!=='boolean' || typeof body.marketingConsent!=='boolean')throw new SolutionError('INVALID_REQUEST');
 if(!Array.isArray(body.types) || body.types.length<1 || body.types.length>3 || new Set(body.types).size!==body.types.length || body.types.some(t=>!types.has(t)))throw new SolutionError('INVALID_REQUEST');
 if(body.privacyVersion!==SOLUTION_PRIVACY_VERSION || body.marketingVersion!==SOLUTION_MARKETING_VERSION)throw new SolutionError('NOTICE_CHANGED',409);
 if(typeof body.requestId!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId))throw new SolutionError('INVALID_REQUEST');
 const email=text(body.email??'',254).toLowerCase();
 if(email && !/^[^\s@<>"\u0000-\u001f\u007f]+@[^\s@<>"\u0000-\u001f\u007f]+\.[^\s@<>"\u0000-\u001f\u007f]{2,}$/.test(email))throw new SolutionError('INVALID_EMAIL');
 if((body.contactMe || body.marketingConsent) && !email)throw new SolutionError('EMAIL_REQUIRED');
 return {problem:text(body.problem,1500,20),outcome:text(body.outcome??'',1500),description:text(body.description??'',3000),level:body.level,types:[...body.types].sort(),email,processingConsent:true,contactMe:body.contactMe,marketingConsent:body.marketingConsent,lang:body.lang,privacyVersion:SOLUTION_PRIVACY_VERSION,marketingVersion:SOLUTION_MARKETING_VERSION,requestId:body.requestId};
}
function digest(secret,value){return createHmac('sha256',secret).update(value).digest('hex');}
export function requestIP(req){
 // Vercel sets this trusted proxy header. Do not trust client-selected X-Forwarded-For.
 const ip=String(req.headers?.['x-vercel-forwarded-for']||(!process.env.VERCEL?req.socket?.remoteAddress:'')||'').trim();
 if(!isIP(ip))throw new SolutionError('UNAVAILABLE',503);
 return ip;
}
export async function saveSolutionRequest({db,value,ip,secret,now=Date.now()}){
 if(typeof secret!=='string' || secret.length<32)throw new SolutionError('UNAVAILABLE',503);
 const {requestId,...data}=value;
 const keyRef=db.collection('_solution_request_keys').doc(digest(secret,`request:${ip}:${requestId}`));
 const payload=digest(secret,JSON.stringify(data));
 const hour=Math.floor(now/3600000),day=Math.floor(now/86400000);
 const buckets=[['hour',ip,hour,5,3600],['day',ip,day,20,86400],...(data.email?[['email',data.email,day,3,86400]]:[])].map(([kind,id,window,max,retry])=>({ref:db.collection('_solution_request_limits').doc(digest(secret,`${kind}:${id}:${window}`)),max,retry}));
 const ref=db.collection('_solution_requests').doc(randomUUID());
 await db.runTransaction(async tx=>{
  const old=await tx.get(keyRef);
  if(old.exists && old.data().expiresAt>now){if(old.data().payload!==payload)throw new SolutionError('RETRY_CHANGED',409);return;}
  const counters=[];
  for(const bucket of buckets){const snap=await tx.get(bucket.ref);const count=snap.exists && snap.data().expiresAt>now?Number(snap.data().count)||0:0;if(count>=bucket.max){const error=new SolutionError('RATE_LIMITED',429);error.retryAfter=bucket.retry;throw error;}counters.push(count);}
  buckets.forEach((bucket,i)=>tx.set(bucket.ref,{count:counters[i]+1,expiresAt:now+2*86400000}));
  tx.set(ref,{...data,status:'new',emailVerified:false,marketingStatus:data.marketingConsent?'pending_verification':'not_requested',createdAt:now,expiresAt:now+SOLUTION_RETENTION_MS,source:'basic-beyond',processingRecordedAt:now,marketingRecordedAt:data.marketingConsent?now:null});
  tx.set(keyRef,{payload,createdAt:now,expiresAt:now+86400000});
 });
 return {success:true};
}
export function createSolutionRequestHandler({getDB,enabled=()=>false,secret=()=>'',origins=()=>SOLUTION_ORIGINS,clock=()=>Date.now()}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({success:false,error:'METHOD_NOT_ALLOWED'});}
  if(!enabled())return res.status(503).json({success:false,error:'UNAVAILABLE'});
  try{
   if(!origins().includes(req.headers?.origin))throw new SolutionError('ORIGIN_NOT_ALLOWED',403);
   if(!/^application\/json(?:\s*;|$)/i.test(req.headers?.['content-type']||''))throw new SolutionError('INVALID_REQUEST',415);
   const claimed=Number(req.headers?.['content-length']);if(Number.isFinite(claimed)&&claimed>12288)throw new SolutionError('TOO_LARGE',413);
   let body=req.body;
   let serialized;try{serialized=typeof body==='string'?body:JSON.stringify(body);}catch{throw new SolutionError('INVALID_REQUEST');}
   if(!serialized || Buffer.byteLength(serialized,'utf8')>12288)throw new SolutionError('TOO_LARGE',413);
   if(typeof body==='string'){try{body=JSON.parse(body);}catch{throw new SolutionError('INVALID_REQUEST');}}
   const value=normalizeSolutionRequest(body),ip=requestIP(req),key=secret();
   if(typeof key!=='string' || key.length<32)throw new SolutionError('UNAVAILABLE',503);
   await saveSolutionRequest({db:await getDB(),value,ip,secret:key,now:clock()});
   return res.status(200).json({success:true});
  }catch(error){
   if(error instanceof SolutionError){if(error.status===429)res.setHeader('Retry-After',String(error.retryAfter||3600));return res.status(error.status).json({success:false,error:error.code});}
   // No payload, email, address or stack trace in response/logs.
   return res.status(503).json({success:false,error:'UNAVAILABLE'});
  }
 };
}
export async function purgeExpiredSolutionRequests({db,now=Date.now(),limit=100}){
 const cap=Math.max(1,Math.min(200,limit));let deleted=0,limitReached=false;
 for(const name of ['_solution_requests','_solution_request_keys','_solution_request_limits']){
  const rows=await db.collection(name).where('expiresAt','<=',now).limit(cap).get();
  if(rows.docs.length===cap)limitReached=true;
  for(const row of rows.docs){const removed=await db.runTransaction(async tx=>{const current=await tx.get(row.ref);if(!current.exists || !Number.isFinite(current.data().expiresAt) || current.data().expiresAt>now)return false;tx.delete(row.ref);return true;});if(removed)deleted++;}
 }
 return {deleted,limitReached};
}
