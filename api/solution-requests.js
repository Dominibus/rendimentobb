// RC168: suspended general-purpose submissions. No database reads or writes.
export default function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Allow','POST');
  return res.status(410).json({success:false,error:'service_discontinued'});
}
