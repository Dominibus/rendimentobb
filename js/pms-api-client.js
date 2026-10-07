// Keep the same request ID after an uncertain network outcome, avoiding duplicate creation.
export function createPMSApiClient({getUser, fetchImpl = globalThis.fetch, cryptoImpl = globalThis.crypto, storage = null}){
  let pending = null;
  return async function(operation, values = {}){
    const user = getUser();
    if(!user) { const error = new Error('unauthorized'); error.code='booking/unauthorized'; throw error; }
    const body = {action:'host_booking',operation,...values};
    const bytes = new TextEncoder().encode(JSON.stringify(body));
    const digest = await cryptoImpl.subtle.digest('SHA-256',bytes);
    const signature = Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');
    const key = `rb_pms_pending_${user.uid}`;
    if(!pending){ try{pending=JSON.parse(storage?.getItem(key) || 'null');}catch{} }
    if(!pending || pending.uid !== user.uid || pending.signature !== signature){
      pending = {uid:user.uid,signature,requestId:cryptoImpl.randomUUID()};
      try{storage?.setItem(key,JSON.stringify(pending));}catch{}
    }
    const requestId = pending.requestId;
    try{
      const token = await user.getIdToken();
      const response = await fetchImpl('/api/guest-report',{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({...body,requestId})
      });
      const result = await response.json();
      if(!response.ok || result.success !== true){
        const error=new Error(result.error || 'server_unavailable'); error.code=`booking/${result.error || 'server_unavailable'}`; throw error;
      }
      pending=null;
      try{storage?.removeItem(key);}catch{}
      return result;
    }catch(error){
      if(!error.code){error.code='booking/write_uncertain';}
      throw error;
    }
  };
}
