// Defer Chart.js until its dedicated frame is measurable; release all callbacks on replacement.
export function managePMSChartLayout({canvas,draw,valid=()=>true,environment=globalThis}){
 const frame=canvas.parentElement;
 let chart=null,pending=null,stopped=false,observer=null;
 const raf=fn=>environment.requestAnimationFrame(fn);
 function destroy(){
  if(stopped)return;stopped=true;
  if(pending!==null)environment.cancelAnimationFrame(pending);
  pending=null;observer?.disconnect();environment.removeEventListener?.('resize',refresh);
  chart?.destroy();chart=null;
 }
 function refresh(){
  if(stopped||pending!==null)return;
  pending=raf(()=>{
   pending=null;
   if(stopped)return;
   if(!valid()||canvas.isConnected===false){destroy();return;}
   const box=frame.getBoundingClientRect();
   if(!(box.width>0&&box.height>0))return;
   // Wait for the browser to finish the layout changed by tabs or translations.
   pending=raf(()=>{
    pending=null;if(stopped)return;
    if(!valid()||canvas.isConnected===false){destroy();return;}
    const size=frame.getBoundingClientRect();if(!(size.width>0&&size.height>0))return;
    if(!chart)chart=draw();
    chart.resize();chart.update('none');
   });
  });
 }
 if(typeof environment.ResizeObserver==='function'){
  observer=new environment.ResizeObserver(refresh);observer.observe(frame);
 }
 environment.addEventListener?.('resize',refresh);refresh();
 return {refresh,destroy};
}
