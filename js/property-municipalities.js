import {mountMunicipalityPicker} from './municipality-picker.js?v=20261026-rc199';
import {municipalityLocation} from './municipalities.js?v=20261025-rc198';
for(const id of ['rb167-a-city','rb167-b-city']){
 const input=document.getElementById(id);if(!input)continue;
 const host=document.createElement('div');input.before(host);host.append(input);
 mountMunicipalityPicker(host,{input,label:false,display:municipalityLocation,onSelect:row=>{input.dataset.municipality=row.istat;input.dispatchEvent(new Event('input',{bubbles:true}));},onEdit:()=>{delete input.dataset.municipality;}});
}
