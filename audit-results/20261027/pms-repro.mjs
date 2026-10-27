import {createPMSApiClient} from '/workspace/rendimentobb/js/pms-api-client.js';
import {webcrypto} from 'node:crypto';
import {buildPMSOperationalReport} from '/workspace/rendimentobb/js/pms-operational-report.js';
import {evaluateAvailability} from '/workspace/rendimentobb/js/pms-availability.js';
const writes=[];let n=0;
const api=createPMSApiClient({getUser:()=>({uid:'synthetic-owner',getIdToken:async()=> 'synthetic-token'}),cryptoImpl:webcrypto,fetchImpl:async(url,options)=>{writes.push(JSON.parse(options.body));if(n++===0)throw Error('response lost after commit');return {ok:true,json:async()=>({success:true})};}});
const a={data:{propertyId:'p1',status:'pending',guestName:'Synthetic A',checkin:'2027-01-01',checkout:'2027-01-03',totalAmount:200}};
try{await api('save',a);}catch{}
await api('save',{data:{...a.data,guestName:'Synthetic B'}});
await api('save',a);
const snapshot={ownerUid:'synthetic-owner',portalSnapshotReady:true,isDemo:false,propertyList:[{id:'p1',name:'Synthetic property'}],portalBookingList:[{id:'b1',propertyId:'p1',checkin:'2027-01-30',checkout:'2027-02-03',totalAmount:400,status:'arrival',guests:2}]};
const jan=buildPMSOperationalReport({snapshot,ownerUid:'synthetic-owner',month:'2027-01'}),feb=buildPMSOperationalReport({snapshot,ownerUid:'synthetic-owner',month:'2027-02'});
console.log(JSON.stringify({retryDifferentRequestId:writes[0].requestId!==writes[2].requestId,pendingDuplicateAllowed:evaluateAvailability(a.data,[{...a.data,id:'existing'}]).available,crossMonth:{janRevenue:jan.totals.revenue,febRevenue:feb.totals.revenue,janNights:jan.totals.nights,febNights:feb.totals.nights},janOccupancy:jan.totals.occupancy},null,2));
