// Shared dashboard/email projection: evidence only, no changes to customer data.
export function controlSummary(data,now=Date.now()) {
 const issues=[],gaps=[];
 for(const job of data.jobs||[]){
  const check=job.check;
  if(!job.available||!check||check.state==='unverified'){gaps.push({id:job.id,reason:'unverified'});continue;}
  const validTime=Number.isFinite(check.lastRunAt)&&check.lastRunAt>0&&check.lastRunAt<=now+300000;
  const stale=validTime&&(check.stale===true||now-check.lastRunAt>36*3600000);
  if(!validTime)gaps.push({id:job.id,reason:'unverified'});
  if(check.state==='attention'||check.needsAttention)issues.push({id:job.id,reason:'attention'});
  if(stale)issues.push({id:job.id,reason:'stale'});
 }
 for(const key of ['manual','due']){
  const q=data.queues?.[key];
  if(!q?.available){gaps.push({id:key,reason:'unavailable'});continue;}
  // Due items are scheduled work, not necessarily failures. Only old LIVE items are raised.
  const live=key==='manual'?(q.counts?.live||0):q.entries.filter(e=>e.environment==='live'&&e.ageMs>24*3600000).length;
  if(live>0)issues.push({id:key,reason:key==='manual'?'manual':'backlog',count:live});
  if((q.counts?.unknown||0)>0)gaps.push({id:key,reason:'unknown_environment'});
 }
 if(!data.interests?.available)gaps.push({id:'interests',reason:'unavailable'});
 const interests=(data.interests?.entries||[]).filter(e=>e.environment==='live'&&e.state==='recorded').length;
 return {issues,gaps,interests,snapshotStale:!Number.isFinite(data.observedAt)||now-data.observedAt>300000};
}
