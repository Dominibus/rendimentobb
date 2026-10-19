/* Public UI: no account, analytics or persistent personal storage. */
(function(){
 const en=document.documentElement.lang==='en';
 document.querySelectorAll('[data-bb-question]').forEach(b=>b.addEventListener('click',()=>{const r=window.rbBuildBasicBeyondResponse?.(b.dataset.bbQuestion),a=document.getElementById('bb-answer');if(r&&a){a.hidden=false;a.textContent=en?r.textEN:r.textIT;}}));
 const form=document.getElementById('bb-idea-form');if(!form)return;
 const status=document.getElementById('bb-form-status'),submit=document.getElementById('bb-submit'),email=form.elements.email,types=[...form.querySelectorAll('input[name="types"]')];
 let sending=false,previous='',requestId='';
 function show(text,error=false){status.hidden=false;status.classList.toggle('error',error);status.textContent=text;status.focus();}
 function validate(){email.required=form.elements.contactMe.checked||form.elements.marketingConsent.checked;const n=types.filter(x=>x.checked).length;types[0].setCustomValidity(n<1||n>3?(en?'Choose one to three tool types.':'Scegli da uno a tre tipi di strumento.'):'');}
 form.addEventListener('input',validate);form.addEventListener('change',validate);
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(sending)return;validate();if(!form.reportValidity())return;
  if(!window.crypto?.randomUUID){show(en?'Use a current browser or the Contact page.':'Usa un browser aggiornato o la pagina Contatti.',true);return;}
  const body={problem:form.elements.problem.value.trim(),outcome:form.elements.outcome.value.trim(),description:form.elements.description.value.trim(),level:form.elements.level.value,types:types.filter(x=>x.checked).map(x=>x.value),email:email.value.trim(),contactMe:form.elements.contactMe.checked,processingConsent:form.elements.processingConsent.checked,marketingConsent:form.elements.marketingConsent.checked,privacyVersion:'2026-10-19-rc155',marketingVersion:'basic-beyond-updates-v1',lang:en?'en':'it',website:form.elements.website.value};
  const serialized=JSON.stringify(body);if(previous!==serialized||!requestId){requestId=crypto.randomUUID();previous=serialized;}
  sending=true;submit.disabled=true;form.setAttribute('aria-busy','true');status.hidden=false;status.textContent=en?'Sending…':'Invio in corso…';status.classList.remove('error');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch('/api/solution-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,requestId}),signal:controller.signal,credentials:'omit'}),data=await response.json();
   if(!response.ok||data.success!==true){
    const errors={RATE_LIMITED:[ 'Troppi invii. Riprova più tardi.','Too many submissions. Please try later.'],NOTICE_CHANGED:['L’informativa è cambiata. Copia il testo che vuoi conservare e ricarica la pagina.','The notice changed. Copy any text you want to keep, then reload.'],EMAIL_REQUIRED:['Inserisci un’email per il contatto o gli aggiornamenti scelti.','Enter an email for your selected contact or update preference.'],INVALID_EMAIL:['Controlla l’indirizzo email.','Check the email address.'],INVALID_REQUEST:['Controlla i campi, le opzioni e il consenso richiesto.','Check the fields, choices and required consent.'],PROCESSING_REQUIRED:['Per inviare serve il consenso specifico al trattamento della proposta.','Submission requires the specific proposal-processing consent.'],TOO_LARGE:['Il testo è troppo grande. Riduci la descrizione.','Your text is too large. Shorten the description.']};
    const pair=errors[data.error]||['La raccolta non è al momento disponibile. Il testo resta qui: riprova più tardi o usa Contatti.','Collection is temporarily unavailable. Your text remains here: try later or use Contact.'];show(pair[en?1:0],true);return;
   }
   form.reset();form.querySelectorAll('fieldset,button,.bb-trap').forEach(x=>x.hidden=true);
   show(en?'Your idea has been received privately. No plan, payment, newsletter or automatic email has been activated. A reply is not guaranteed. Thank you.':'La tua idea è stata ricevuta in forma privata. Nessun piano, pagamento, newsletter o email automatica è stato attivato. Non è garantito un riscontro. Grazie.');
  }catch{show(en?'Receipt could not be confirmed. Your text is still here. Retry from this page to avoid duplicates.':'Non possiamo confermare la ricezione. Il testo è ancora qui. Riprova da questa pagina per evitare duplicati.',true);}
  finally{clearTimeout(timer);sending=false;submit.disabled=false;form.removeAttribute('aria-busy');}
 });validate();
})();
