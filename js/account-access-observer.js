// Observe protected account fields; stale listeners can never update another user.
export function observeAccountAccess({uid,subscribe,getCurrentUid,getPrevious,accessKey,onData,onAccessChange,onError}){
  let stopped=false;
  let previousKey=accessKey(getPrevious() || {});
  const unsubscribe=subscribe(snapshot=>{
    if(stopped || getCurrentUid()!==uid)return;
    const data=snapshot.exists()?snapshot.data():{};
    const nextKey=accessKey(data);
    onData(data,uid);
    if(nextKey!==previousKey){previousKey=nextKey;onAccessChange();}
  },()=>{
    if(!stopped && getCurrentUid()===uid)onError();
  });
  return ()=>{stopped=true;unsubscribe();};
}

// Auth-state bootstrap must not overwrite profile/acceptance metadata from signup.
export async function ensureAccountProfile({runTransaction,userRef,profile}){
 return runTransaction(async tx=>{
  const snapshot=await tx.get(userRef);
  if(!snapshot.exists())tx.set(userRef,profile);
 });
}
