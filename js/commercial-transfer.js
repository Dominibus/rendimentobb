import {normalizeCommercialModel} from './commercial-workspace-model.js?v=20261025-rc196';
const key='rb_commercial_transfer_v1';
export function stageCommercialTransfer(model,storage,now=Date.now()){
 const clean=normalizeCommercialModel(model);storage.setItem(key,JSON.stringify({expires:now+15*60*1000,model:clean}));
}
export function consumeCommercialTransfer(storage,now=Date.now()){
 let data;try{const raw=storage.getItem(key);storage.removeItem(key);if(!raw||raw.length>100000)return null;data=JSON.parse(raw);if(!Number.isFinite(data.expires)||data.expires<=now||data.expires>now+15*60*1000)return null;return normalizeCommercialModel(data.model);}catch{return null;}
}
