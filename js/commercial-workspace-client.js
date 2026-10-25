export function createCommercialClient({getUser,fetchImpl=globalThis.fetch,cryptoImpl=globalThis.crypto,storage=null}){
 let pending=null,busy=false,busyOwner=null,sequence=0;
 return async(operation,values={})=>{
  const user=getUser();if(!user)throw Error('unauthorized');if(busy&&busyOwner===user.uid)throw Error('operation_pending');busy=true;busyOwner=user.uid;const ticket=++sequence;
  try{
   const body={action:'commercial_workspace',operation,...values};
   if(!['list','get'].includes(operation)){
    const digest=await cryptoImpl.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(body)));
    const signature=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join(''),key='rb_commercial_pending_'+user.uid;
    if(!pending)try{pending=JSON.parse(storage?.getItem(key)||'null');}catch{}
    if(!pending||pending.uid!==user.uid||pending.signature!==signature){pending={uid:user.uid,signature,requestId:cryptoImpl.randomUUID()};try{storage?.setItem(key,JSON.stringify(pending));}catch{}}
    body.requestId=pending.requestId;
   }
   const token=await user.getIdToken();if(getUser()?.uid!==user.uid)throw Error('account_changed');
   const response=await fetchImpl('/api/guest-report',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});
   let payload;try{payload=await response.json();}catch{throw Error('write_uncertain');}
   if(getUser()?.uid!==user.uid)throw Error('account_changed');
   if(!response.ok||payload.success!==true)throw Error(payload.error||'server_unavailable');
   if(!['list','get'].includes(operation)){pending=null;try{storage?.removeItem('rb_commercial_pending_'+user.uid);}catch{}}
   return payload;
  }finally{if(ticket===sequence){busy=false;busyOwner=null;}}
 };
}
