import {createCommercialModel}from'../../js/commercial-property-engine.js';
// Independent arithmetic fixture, never used by the public demo.
export function commercialFixture(mode='weekly_monthly'){
 const m=createCommercialModel(2027);m.property.value=180000;m.property.works=10000;m.costs.fixedAnnual=2400;m.rooms.push({id:'R2'});
 m.assignments=[{id:'A1',roomId:'R1',code:'P01',mode,weekdays:[1],slotIds:['AM'],start:'2027-01-01',end:'2027-12-31',amount:305,vat:{status:'unknown',rate:null},expectedPct:100}];return m;
}
