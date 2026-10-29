/* RC221: one lightweight shell for portal and public demos. No account dependency. */
(function(){
'use strict';
function initializeMobileTabs(){
  if(document.getElementById('rb-mobile-tabs')) return;
  const nav=document.createElement('nav');
  nav.id='rb-mobile-tabs';nav.className='rb-mobile-tabs';
  const icon=paths=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const items=[
    {href:'/',it:'Home',en:'Home',svg:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>'},
    {href:'/tool/',it:'Analizza',en:'Analyze',svg:'<path d="M4 20h16M6 16v-4m6 4V8m6 8V4"/>'},
    {href:'/dashboard/',it:'Dashboard',en:'Dashboard',svg:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'}
  ];
  const path=(window.location.pathname.replace(/^\/en(?=\/)/,'').replace(/\/+$/,'')||'/');
  for(const item of items){
    const link=document.createElement('a');link.href=item.href;
    link.innerHTML=icon(item.svg)+'<span></span>';
    const active=item.href==='/'?path==='/':item.href==='/dashboard/'?['/dashboard','/dashboard-report','/gestione-commerciale','/demo/hospitality-pms'].includes(path):['/tool','/immobili-commerciali','/demo/investment-analytics'].includes(path);
    if(active)link.setAttribute('aria-current','page');
    link.dataset.labelIt=item.it;link.dataset.labelEn=item.en;nav.appendChild(link);
  }
  const assistant=document.createElement('button');assistant.type='button';assistant.dataset.labelIt='Assistente';assistant.dataset.labelEn='Assistant';
  assistant.innerHTML=icon('<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V11a9 9 0 0 1 18 0Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>')+'<span></span>';
  assistant.addEventListener('click',()=>{
    const headerButton=document.getElementById('rb-header-ai-btn');
    if(headerButton){headerButton.click();return;}
    const help=document.querySelector('.rb-public-assistant');
    if(help){help.open=true;help.querySelector('summary')?.focus();}
  });
  nav.appendChild(assistant);
  const translate=()=>{
    const en=(window.currentLang || document.documentElement.lang)==='en';nav.setAttribute('aria-label',en?'Main mobile navigation':'Navigazione mobile principale');
    for(const item of nav.children)item.querySelector('span').textContent=en?item.dataset.labelEn:item.dataset.labelIt;
  };
  translate();document.addEventListener('rb_language_changed',translate);
  document.body.classList.add('rb-mobile-app');document.body.appendChild(nav);
}

window.rbMountMobileShell=initializeMobileTabs;
function mount(){
 initializeMobileTabs();
 const header=document.getElementById('global-header') || document.querySelector('.rb-public-header');
 if(header && window.ResizeObserver){
  const update=()=>document.documentElement.style.setProperty('--rb-shell-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');
  new window.ResizeObserver(update).observe(header);update();
 }
 // Keep language and login reachable in the menu when the compact header is shown.
 const publicHeader=document.querySelector('.rb-public-header');
 if(publicHeader){
  const menu=publicHeader.querySelector('.rb-public-menu nav');
  const controls=[...publicHeader.querySelectorAll('.rb-public-actions > .rb-public-languages,.rb-public-actions > .rb-public-login')];
  const positions=controls.map(control=>{const marker=document.createComment('mobile menu control');control.before(marker);return marker;});
  const compact=window.matchMedia('(max-width:760px)');
  const syncHeader=()=>controls.forEach((control,index)=>{if(compact.matches&&menu)menu.appendChild(control);else positions[index].after(control);});
  syncHeader();compact.addEventListener('change',syncHeader);
  const help=publicHeader.querySelector('.rb-public-assistant > summary');if(help)help.textContent=document.documentElement.lang==='en'?'Help':'Aiuto';
 }
 const footer=document.querySelector('.rb-public-footer');
 if(!footer || footer.dataset.compactReady==='true')return;
 footer.dataset.compactReady='true';
 const columns=Array.from(footer.querySelectorAll('.footer-grid > .footer-col'));
 const groups=[];
 for(const index of [1,2,3]){
  const column=columns[index],heading=column?.querySelector('strong');if(!heading)continue;
  const group=document.createElement('details');group.className='footer-col rb-mobile-footer-group';
  const summary=document.createElement('summary');summary.appendChild(heading);group.appendChild(summary);
  const links=document.createElement('div');links.className='rb-footer-group-links';
  while(column.firstChild)links.appendChild(column.firstChild);
  group.appendChild(links);column.replaceWith(group);groups.push(group);
 }
 columns[4]?.classList.add('rb-footer-legal');
 const mobile=window.matchMedia('(max-width:760px)');
 const sync=()=>groups.forEach(group=>{group.open=!mobile.matches;group.querySelector('summary').tabIndex=mobile.matches?0:-1;});
 sync();mobile.addEventListener('change',sync);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
