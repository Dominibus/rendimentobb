import {loadMunicipalities,municipalityLocation} from './municipalities.js?v=20261028-rc216';
import {mountMunicipalityPicker} from './municipality-picker.js?v=20261028-rc219';
import {applyMunicipalityToTool,setMunicipalityURL} from './municipality-tool.js?v=20261028-rc216';
const input=document.getElementById('custom-location');
if(input){
 const parent=document.createElement('div');input.before(parent);parent.append(input);
 const picker=mountMunicipalityPicker(parent,{input,display:municipalityLocation,label:()=>window.currentLang==='en'?'Property municipality · all of Italy':'Comune dell’immobile · tutta Italia',onSelect:applyMunicipalityToTool,onEdit:()=>{delete input.dataset.municipality;setMunicipalityURL(null);document.dispatchEvent(new CustomEvent('rb_municipality_edit'));}});
 document.addEventListener('rb_municipality_changed',event=>picker.setSelection(event.detail));
 const requested=new URLSearchParams(window.location.search).get('municipality');
 if(/^\d{6}$/.test(requested||''))loadMunicipalities().then(rows=>{const row=rows.find(r=>r.istat===requested);if(row){picker.setSelection(row);applyMunicipalityToTool(row);}}).catch(()=>{});
 document.addEventListener('DOMContentLoaded',()=>{const row=picker.getSelection();if(row)applyMunicipalityToTool(row);});
}
