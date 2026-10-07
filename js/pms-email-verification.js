// Firebase owns email verification; no client-side flag grants permission.
export function createEmailVerification({getUser,send,reload,now=Date.now}){
  let busy=false,lastSent=-Infinity,lastUid=null;
  const user=()=>{const value=getUser();if(!value||value.uid==='demo-user')throw Error('signed_in_required');return value;};
  return {
    async send(){
      const current=user();
      if(current.uid!==lastUid){lastSent=-Infinity;lastUid=current.uid;}
      if(busy)throw Error('verification_busy');
      if(now()-lastSent<60000)throw Error('verification_cooldown');
      busy=true;
      try{
        await reload(current);
        if(getUser()?.uid!==current.uid)throw Error('account_changed');
        if(current.emailVerified){await current.getIdToken(true);return 'verified';}
        await send(current);lastSent=now();return 'sent';
      }finally{busy=false;}
    },
    async check(){
      const current=user();await reload(current);
      if(getUser()?.uid!==current.uid)throw Error('account_changed');
      await current.getIdToken(true);
      return current.emailVerified?'verified':'unverified';
    }
  };
}
