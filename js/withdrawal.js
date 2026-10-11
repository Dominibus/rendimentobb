(() => {
 'use strict';
 const get=id=>document.getElementById('withdrawal-'+id);
 const form=get('entry');if(!form)return;
 const t=(it,en)=>window.currentLang==='en'?en:it;
 let draft=null,payload=null,result=null,busy=false;
 function status(){
  if(busy)get('status').textContent=t('Invio della dichiarazione…','Submitting your declaration…');
  else if(result)get('status').textContent=result.receiptEmail==='pending'?t('Dichiarazione registrata. L’invio della ricevuta email è in attesa: scarica e conserva la ricevuta qui sotto.','Declaration recorded. The receipt email is pending: download and keep the receipt below.'):t('Dichiarazione registrata. La ricevuta email è stata affidata al servizio di invio: controlla anche lo spam e conserva la copia scaricabile.','Declaration recorded. The receipt email was accepted by the sending service: check spam too and keep the downloadable copy.');
 }
 function review(){
  const list=get('summary');list.replaceChildren();
  for(const [label,value] of [[t('Nome e cognome','Full name'),draft.name],[t('Email per la ricevuta','Receipt email'),draft.email],[t('Contratto','Contract'),draft.contract]]){
   const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;list.append(dt,dd);
  }
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();if(busy||!form.reportValidity())return;
  draft={name:get('name').value.trim(),email:get('email').value.trim(),contract:get('contract').value.trim(),website:form.elements.website.value};
  payload=null;result=null;review();form.hidden=true;get('review').hidden=false;get('status').textContent='';get('confirm').focus();
 });
 get('back').addEventListener('click',()=>{if(busy)return;form.hidden=false;get('review').hidden=true;get('name').focus();});
 async function send(){
  if(busy)return;busy=true;get('confirm').disabled=true;get('back').disabled=true;get('retry').disabled=true;status();
  try{
   if(!payload)payload={...draft,confirmed:true,requestId:crypto.randomUUID(),lang:window.currentLang==='en'?'en':'it'};
   const response=await fetch('/api/send-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'withdrawal',...payload})});
   const data=await response.json();if(!response.ok||data.success!==true||typeof data.receiptText!=='string'||!/^wr_[a-f0-9]{64}$/.test(data.id))throw Error('REQUEST_FAILED');
   result=data;get('review').hidden=true;get('result').hidden=false;get('receipt').textContent=data.receiptText;get('retry').hidden=data.receiptEmail!=='pending';
  }catch{
   if(!result)get('status').textContent=t('Invio non confermato. Riprova con gli stessi dati o comunica il recesso a support@rendimentobb.com.','Submission not confirmed. Retry with the same information or email your notice to support@rendimentobb.com.');
   else get('status').textContent=t('La dichiarazione è già registrata; il nuovo tentativo email non è confermato. Conserva la ricevuta scaricabile.','Your declaration is already recorded; the email retry is not confirmed. Keep the downloadable receipt.');
   busy=false;get('confirm').disabled=false;get('back').disabled=false;get('retry').disabled=false;return;
  }
  busy=false;get('confirm').disabled=false;get('back').disabled=false;get('retry').disabled=false;status();
 }
 get('confirm').addEventListener('click',send);get('retry').addEventListener('click',send);
 get('download').addEventListener('click',()=>{
  if(!result)return;const url=URL.createObjectURL(new Blob([result.receiptText],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='RendimentoBB-recesso-'+result.id.slice(-12)+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 document.addEventListener('rb_language_changed',()=>{if(draft)review();status();});
})();
