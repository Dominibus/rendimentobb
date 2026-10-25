import {loadMunicipalities,searchMunicipalities,municipalityLabel,MUNICIPALITY_SOURCE} from './municipalities.js?v=20261025-rc198';
let sequence=0;
export function mountMunicipalityPicker(parent,{input=null,selected=null,onSelect=()=>{},onEdit=()=>{},label=null,load=loadMunicipalities,language=()=>window.currentLang||'it',display=municipalityLabel}={}){
 const t=(it,en)=>language()==='en'?en:it;
 const add=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;parent.append(e);return e;};
 parent.classList.add('rb-municipality-picker');const prefix='rb-municipality-'+(++sequence);
 const title=add('label');
 if(!input)input=add('input');else input.before(title);input.id=input.id||prefix;title.htmlFor=input.id;
 input.type='text';input.maxLength=180;input.autocomplete='off';input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls',prefix+'-list');input.placeholder=t('Es. Pisa, Cagliari o nome + provincia','e.g. Pisa, Cagliari or name + province');
 const help=add('p',t('Scrivi almeno 2 caratteri e scegli un risultato.','Type at least 2 characters and select a result.'));help.id=prefix+'-help';input.setAttribute('aria-describedby',help.id);
 const list=add('div');list.id=prefix+'-list';list.className='rb-municipality-results';list.setAttribute('role','listbox');list.setAttribute('aria-label',t('Comuni trovati','Matching municipalities'));list.hidden=true;
 const status=add('p');status.setAttribute('role','status');status.className='rb-municipality-status';
 const source=add('p');source.className='rb-municipality-source';
 function refreshLanguage(){
  title.textContent=typeof label==='function'?label():label||t('Cerca il tuo comune italiano','Find your Italian municipality');
  input.placeholder=t('Es. Pisa, Cagliari o nome + provincia','e.g. Pisa, Cagliari or name + province');help.textContent=t('Scrivi almeno 2 caratteri e scegli un risultato.','Type at least 2 characters and select a result.');
  list.setAttribute('aria-label',t('Comuni trovati','Matching municipalities'));source.replaceChildren(document.createTextNode(t('Anagrafica ISTAT · 21/02/2026 · ','ISTAT municipality register · 21 Feb 2026 · ')));
  for(const [text,href]of [[t('Fonte','Source'),MUNICIPALITY_SOURCE],['CC BY 4.0','https://creativecommons.org/licenses/by/4.0/']]){const a=document.createElement('a');a.textContent=text;a.href=href;a.target='_blank';a.rel='noopener noreferrer';source.append(a,document.createTextNode(' '));}
 }
 refreshLanguage();document.addEventListener('rb_language_changed',()=>{refreshLanguage();if(selected)setSelection(selected);else if(open)suggest();});

 let rows=null,matches=[],active=-1,request=0,open=false;
 function close(){open=false;list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');}
 function setSelection(row){selected=row;input.value=row?display(row):'';matches=[];close();status.textContent=row?t('Comune selezionato: ','Selected municipality: ')+municipalityLabel(row):'';}
 function choose(row){setSelection(row);onSelect(row);}
 function highlight(){matches.forEach((_,i)=>{const e=list.children[i];e.setAttribute('aria-selected',String(i===active));});if(active>=0)input.setAttribute('aria-activedescendant',prefix+'-option-'+active);else input.removeAttribute('aria-activedescendant');}
 async function suggest(){
  const run=++request;const query=input.value;if(query.trim().length<2){matches=[];close();status.textContent='';return;}
  status.textContent=t('Cerco il comune…','Finding municipality…');
  try{rows=rows||await load();if(run!==request||input.value!==query||!open)return;matches=searchMunicipalities(rows,query);active=-1;list.replaceChildren();
   for(const [i,row]of matches.entries()){const option=document.createElement('button');option.type='button';option.id=prefix+'-option-'+i;option.setAttribute('role','option');option.setAttribute('aria-selected','false');option.tabIndex=-1;option.textContent=municipalityLabel(row);option.addEventListener('click',()=>choose(row));list.append(option);}
   list.hidden=!matches.length;input.setAttribute('aria-expanded',String(matches.length>0));status.textContent=matches.length?t('Scegli un comune dall’elenco. Affina la ricerca con la provincia.','Select a municipality. Add its province to refine the search.'):t('Nessun comune trovato. Controlla il nome o prova senza abbreviazioni.','No municipality found. Check the name or try without abbreviations.');
  }catch{if(run===request){close();status.textContent=t('Elenco non disponibile. Modifica la ricerca per riprovare; nel simulatore puoi inserire la località manualmente.','Register unavailable. Edit the search to retry; you may enter the location manually in the simulator.');}}
 }
 input.addEventListener('input',()=>{if(selected&&input.value===display(selected))return;selected=null;onEdit();open=true;suggest();});
 input.addEventListener('focus',()=>{if(!selected){open=true;suggest();}});
 input.addEventListener('keydown',e=>{
  if(e.key==='Escape'){request++;close();return;}
  if(e.key==='Tab'){close();return;}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!matches.length){open=true;suggest();return;}open=true;list.hidden=false;input.setAttribute('aria-expanded','true');active=(active+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length;highlight();}
  if(e.key==='Enter'&&open&&matches.length){e.preventDefault();choose(matches[active<0?0:active]);}
 });
 document.addEventListener('click',e=>{if(!parent.contains(e.target)&&e.target!==input){request++;close();}});
 if(selected)setSelection(selected);
 return{input,setSelection,getSelection:()=>selected,close};
}
