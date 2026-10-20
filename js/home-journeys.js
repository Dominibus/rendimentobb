(function(){
  'use strict';
  function syncLinks(){
    const prefix=window.currentLang === 'en' ? '/en' : '';
    for(const link of document.querySelectorAll('[data-rb158-demo]')) link.href=prefix+'/demo/'+(link.dataset.rb158Demo==='pms'?'hospitality-pms':'investment-analytics')+'/';
  }
  syncLinks();
  document.addEventListener('rb_language_changed',syncLinks);
})();
