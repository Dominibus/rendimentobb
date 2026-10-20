(function(){
  'use strict';
  function syncLinks(){
    const prefix=window.currentLang === 'en' ? '/en' : '';
    for(const link of document.querySelectorAll('[data-rb158-demo]')) link.href=prefix+'/demo/'+(link.dataset.rb158Demo==='pms'?'hospitality-pms':'investment-analytics')+'/';
    for(const [selector,path] of [['[data-bb-vision]','/basic-beyond/'],['[data-bb-form]','/racconta-idea/']]){
      for(const link of document.querySelectorAll(selector)) link.href=selector === '[data-bb-form]' && prefix ? '/en/share-your-idea/' : prefix+path;
    }
  }
  syncLinks();
  document.addEventListener('rb_language_changed',syncLinks);
})();
