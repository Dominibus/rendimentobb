// Administrative identities and verified source coverage; never nearest-city fallback.
export const TERRITORIAL_COVERAGE=Object.freeze([
 {key:'roma',istat:'058091',name:'Roma',aliases:['rome']},
 {key:'napoli',istat:'063049',name:'Napoli',aliases:['naples']},
 {key:'milano',istat:'015146',name:'Milano',aliases:['milan']},
 {key:'firenze',istat:'048017',name:'Firenze',aliases:['florence']},
 {key:'bologna',istat:'037006',name:'Bologna',aliases:[]},
 {key:'venezia',istat:'027042',name:'Venezia',aliases:['venice']},
 {key:'bari',istat:'072006',name:'Bari',aliases:[],municipalityFilter:'Bari'},
 {key:'trento',istat:'022205',name:'Trento',aliases:[],municipalityFilter:'Trento, Trentino'},
 {key:'palermo',istat:'082053',name:'Palermo',aliases:[],municipalityFilter:'Palermo'}
].map(row=>Object.freeze({...row,aliases:Object.freeze(row.aliases)})));
export function territorialDefinition(value){const key=String(value||'').trim().toLowerCase();return TERRITORIAL_COVERAGE.find(row=>row.key===key||row.aliases.includes(key))||null;}
