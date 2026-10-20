// Only fixed, non-personal campaign labels and public actions are accepted.
export const isProductionAnalyticsHost = hostname => ['rendimentobb.it','www.rendimentobb.it','rendimentobb.com','www.rendimentobb.com'].includes(String(hostname||'').toLowerCase());
const campaigns={
 utm_source:['linkedin','instagram','tiktok','facebook','newsletter','partner'],
 utm_medium:['social','organic_social','email','referral'],
 utm_campaign:['tester_2026_10','host_demo','basic_beyond']
};
export function publicCampaignContext(search=''){
 const query=new URLSearchParams(search),out={};
 for(const [key,values] of Object.entries(campaigns)){
  const entries=query.getAll(key);
  if(entries.length===1&&values.includes(entries[0]))out[key==='utm_campaign'?'campaign_name':key.replace('utm_','campaign_')]=entries[0];
 }
 // An incomplete source/medium pair is not turned into fabricated attribution.
 if(!out.campaign_source||!out.campaign_medium)return {};
 return out;
}
export function publicEventPayload(name,params={}){
 if(!params||typeof params!=='object')return null;
 const language=params.language==='en'?'en':'it';
 if(name==='demo_click'&&['investment','pms'].includes(params.demo))return {demo:params.demo,language};
 if(name==='trial_entry_click'&&params.plan==='investor')return {plan:'investor',language};
 if(name==='plan_interest_submitted'&&['investor','pro','pro_yearly'].includes(params.plan))return {plan:params.plan,language};
 return null;
}
export function publicLinkEvent(href,base){
 let url,source;try{source=new URL(base);url=new URL(href,source);}catch{return null;}
 if(!isProductionAnalyticsHost(url.hostname)||url.protocol!=='https:')return null;
 const match=url.pathname.match(/^\/(?:en\/)?demo\/(investment-analytics|hospitality-pms)\/$/);
 if(match)return {name:'demo_click',params:{demo:match[1]==='hospitality-pms'?'pms':'investment'}};
 if(url.origin===source.origin&&url.pathname==='/login/'&&url.searchParams.get('intent')==='investor-trial')return {name:'trial_entry_click',params:{plan:'investor'}};
 return null;
}
