/* Progressive presentation only. Existing nodes, IDs, listeners and values are retained. */
(function(){
'use strict';
function label(node,it,english){node.dataset.it=it;node.dataset.en=english;node.textContent=(window.currentLang||document.documentElement.lang)==='en'?english:it;}
function group(nodes,it,english,className='rb222-group'){
 nodes=nodes.filter(Boolean);if(!nodes.length)return;
 const details=document.createElement('details');details.className=className;
 const summary=document.createElement('summary');label(summary,it,english);details.append(summary);
 const content=document.createElement('div');content.className='rb222-group-content';details.append(content);
 nodes[0].before(details);nodes.forEach(node=>content.append(node));return details;
}
function mount(){
 if(document.body.dataset.rb222Mounted)return;document.body.dataset.rb222Mounted='true';
 if(document.body.classList.contains('home-page')){
  const preview=document.querySelector('.rb158-preview');
  if(preview)group([...preview.querySelectorAll('.rb158-preview-checks,.rb158-preview-note')],'Come ti aiuta Autopilot','How Autopilot helps','rb222-preview-more');
  const sections=[...document.querySelectorAll('details.rb-flow-disclosure')].filter(n=>!n.parentElement.closest('details'));
  const pick=names=>sections.filter(n=>names.includes(n.querySelector(':scope>summary')?.dataset.it));
  group(pick(['Trova il percorso adatto a te','Disponibilità per B&B, locali e studi']),'Inizia da qui','Start here');
  group(pick(['Un esempio: confrontare due ipotesi','Come ti aiuta Autopilot','Dalla simulazione alla gestione: il report Pro','Guide e strumenti per approfondire']),'Funzioni e approfondimenti','Features and insights');
  group(pick(['Demo, Investor e Pro: accesso e condizioni','Domande frequenti']),'Piani e domande','Plans and questions');
  // Keep one disclosure level for navigation. The content nodes themselves move,
  // so IDs, entered values and listeners remain attached to the same objects.
  for(const disclosure of document.querySelectorAll('.home-page .rb222-group-content > details.rb-flow-disclosure')){
   const section=document.createElement('section');
   for(const attr of disclosure.attributes)if(attr.name!=='open')section.setAttribute(attr.name,attr.value);
   section.classList.remove('rb-flow-disclosure');section.classList.add('rb223-topic');
   const summary=disclosure.querySelector(':scope>summary');
   if(summary){const heading=document.createElement('h2');for(const attr of summary.attributes)heading.setAttribute(attr.name,attr.value);while(summary.firstChild)heading.append(summary.firstChild);section.append(heading);summary.remove();}
   while(disclosure.firstChild)section.append(disclosure.firstChild);
   disclosure.replaceWith(section);
  }
  const guidesTitle=document.querySelector('[data-it="Impara a trovare investimenti profittevoli"]');
  const guideTopic=[...document.querySelectorAll('.rb223-topic')].find(node=>node.querySelector(':scope>h2')?.dataset.it==='Guide e strumenti per approfondire');
  if(guidesTitle&&guideTopic){const cards=guidesTitle.closest('section');cards.classList.add('rb223-guides');guideTopic.append(cards);label(guidesTitle,'Guide pratiche per valutare il progetto','Practical guides to assess your project');}

 }

 const commercialHero=document.querySelector('.cm-hero');
 if(commercialHero){
  const original=[...commercialHero.querySelectorAll(':scope>p:not(.cm-kicker):not(.cm-badge)')];
  if(original.length){
   const lead=document.createElement('p');lead.className='cm-lead';label(lead,'Confronta canoni, costi e finanziamento di locali e stanze professionali.','Compare rent, costs and financing for commercial units and professional rooms.');original[0].before(lead);
   const more=group(original,'A chi si rivolge e cosa comprende','Who it is for and what it covers');if(more)commercialHero.append(more);
  }
  const actions=commercialHero.querySelector('.cm-actions'),badge=commercialHero.querySelector('.cm-badge');
  if(actions&&badge)badge.before(actions);
 }
 group([document.querySelector('.cw-method')],'Metodo, limiti e dati da verificare','Method, limits and checks');
 if(document.querySelector('.cw-page')&&new URLSearchParams(location.search).get('demo')==='1'){
  const link=document.querySelector('.cw-hero a[href*="?demo=1"]');
  if(link){link.href='#commercial-input-help';label(link,'Demo attiva · guida alla compilazione','Demo active · input guide');}
 }
 // Preserve deep links into the new disclosures, including the calendar return.
 function reveal(hash){let target;try{target=document.getElementById(decodeURIComponent(hash.slice(1)));}catch{return;}
  if(!target)return;for(let node=target.parentElement;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
 }
 document.addEventListener('click',event=>{const link=event.target.closest?.('a[href^="#"]');if(link)reveal(link.getAttribute('href'));});
 window.addEventListener('hashchange',()=>reveal(location.hash));reveal(location.hash);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
