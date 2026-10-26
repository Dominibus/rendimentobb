import {REGIONAL_CAPITALS} from './regional-capitals.js?v=20261026-rc199';
const select=document.getElementById('city-select');
if(select){
 const initial=select.value;for(const row of REGIONAL_CAPITALS){if([...select.options].some(o=>o.value===row.key))continue;const option=document.createElement('option');option.value=row.key;option.textContent=row.name+' ('+row.province+')';select.append(option);}select.value=initial;
 const label=document.createElement('label');label.htmlFor=select.id;label.textContent=window.currentLang==='en'?'City · regional capitals':'Città · capoluoghi di regione';select.before(label);
 const note=document.createElement('p');note.className='rb-capital-reference-note';note.setAttribute('role','status');select.after(note);
 const link=document.createElement('a');link.className='rb-capital-reference-link';select.parentElement.append(link);
 function render(){const row=REGIONAL_CAPITALS.find(r=>r.key===select.value),en=window.currentLang==='en';label.textContent=en?'City · regional capitals':'Città · capoluoghi di regione';note.textContent=en?'City selection does not filter your portfolio. Internal examples are not verified local benchmarks. Use Market to check available territorial evidence.':'La scelta della città non filtra il tuo portafoglio. Gli esempi interni non sono benchmark locali verificati. In Market puoi controllare le fonti territoriali disponibili.';link.textContent=en?'Check this location in Market':'Verifica questo territorio in Market';link.href=row?'/market/?municipality='+encodeURIComponent(row.istat):'/market/';}
 select.addEventListener('change',render);document.addEventListener('rb_language_changed',render);render();
}
