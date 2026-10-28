// Keep the same request ID after an uncertain network outcome, avoiding duplicate creation.
export function createPMSApiClient({getUser, fetchImpl = globalThis.fetch, cryptoImpl = globalThis.crypto, storage = null}){
  const registries = new Map(), inFlight = new Map();
  const stateError = () => {const error=new Error('pending_state_invalid');error.code='booking/pending_state_invalid';return error;};
  function read(uid, key){
    let raw;
    try{raw=storage?.getItem(key);}catch{return registries.get(uid) || {};}
    if(!raw)return registries.get(uid) || {};
    let data;try{data=JSON.parse(raw);}catch{throw stateError();}
    if(data?.uid!==uid)throw stateError();
    if(data.version===2 && data.requests && typeof data.requests==='object' && !Array.isArray(data.requests)){
      for(const [signature,row] of Object.entries(data.requests)){
        if(!/^[a-f0-9]{64}$/.test(signature) || typeof row?.requestId!=='string' || !row.requestId)throw stateError();
      }
      return {...data.requests,...(registries.get(uid)||{})};
    }
    if(typeof data.signature==='string' && /^[a-f0-9]{64}$/.test(data.signature) && typeof data.requestId==='string' && data.requestId){
      return {...(registries.get(uid)||{}),[data.signature]:{requestId:data.requestId}};
    }
    throw stateError();
  }
  function persist(uid,key,requests){
    registries.set(uid,requests);
    try{if(Object.keys(requests).length)storage?.setItem(key,JSON.stringify({version:2,uid,requests}));else storage?.removeItem(key);}catch{}
  }
  return async function(operation, values = {}){
    const user = getUser();
    if(!user || typeof user.getIdToken !== 'function') { const error = new Error('unauthorized'); error.code='booking/unauthorized'; throw error; }
    const body = {action:'host_booking',operation,...values};
    const bytes = new TextEncoder().encode(JSON.stringify(body));
    const digest = await cryptoImpl.subtle.digest('SHA-256',bytes);
    const signature = Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');
    const key = `rb_pms_pending_${user.uid}`, flightKey=`${user.uid}:${signature}`;
    if(inFlight.has(flightKey))return inFlight.get(flightKey);
    const requests=read(user.uid,key);
    if(!requests[signature])requests[signature]={requestId:cryptoImpl.randomUUID()};
    persist(user.uid,key,requests);
    const requestId=requests[signature].requestId;
    const promise=(async()=>{
    try{
      const token = await user.getIdToken();
      const response = await fetchImpl('/api/guest-report',{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({...body,requestId})
      });
      let result;
      try{ result = await response.json(); }
      catch{
        const error = new Error(response.ok ? 'write_uncertain' : 'server_unavailable');
        error.code = response.ok ? 'booking/write_uncertain' : 'booking/server_unavailable';
        throw error;
      }
      if(!response.ok || result.success !== true){
        const error=new Error(result.error || 'server_unavailable'); error.code=`booking/${result.error || 'server_unavailable'}`; throw error;
      }
      const latest=read(user.uid,key);
      if(latest[signature]?.requestId===requestId)delete latest[signature];
      persist(user.uid,key,latest);
      return result;
    }catch(error){
      if(!error.code){error.code='booking/write_uncertain';}
      throw error;
    }
    })();
    inFlight.set(flightKey,promise);
    try{return await promise;}finally{if(inFlight.get(flightKey)===promise)inFlight.delete(flightKey);}
  };
}
