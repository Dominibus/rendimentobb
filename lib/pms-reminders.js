import {getPlanForScope} from '../js/account-plan.js';
import {reminderDays,selectReminderTasks,buildReminderEmail} from './pms-reminder-model.js';
import {taskNotificationId} from './pms-notification-queue.js';
// Bounded, cursor-based batches keep the existing cron within its time budget.
export async function queueDailyReminders({db,getAuthUser,timestamp,now=Date.now(),clock=Date.now,budgetMs=12000,limit=20}){
  const started=clock(),stats={checked:0,queued:0,skipped:0,errors:0,largeAccounts:0},day=reminderDays(now).today;
  const cursorRef=db.collection('_pms_jobs').doc('reminder_scan');
  const previous=await cursorRef.get();
  let query=db.collection('users').where('notificationPreferences.pmsReminderEmail','==',true).orderBy('__name__').limit(limit);
  const cursor=previous.data()?.cursor;
  if(cursor)query=query.startAfter(cursor);
  const users=await query.get();let last='',processed=0;
  for(const row of users.docs){
    if(clock()-started>=budgetMs)break;
    last=row.id;processed++;stats.checked++;
    try{
      const user=row.data(),account=await getAuthUser(row.id);
      const admin=account.emailVerified && account.email==='rendimentobb@gmail.com';
      if(account.disabled || !account.emailVerified || !account.email || (!admin && !['investor','pro','pro_yearly'].includes(getPlanForScope(user,false)))){stats.skipped++;continue;}
      const bookings=await db.collection('bookings').where('uid','==',row.id).limit(201).get();
      if(bookings.docs.length>200){stats.largeAccounts++;continue;}
      const items=selectReminderTasks(bookings.docs.map(doc=>({...doc.data(),id:doc.id})),now).slice(0,20);
      if(!items.length){stats.skipped++;continue;}
      const names=new Map();let valid=true;
      for(const item of items){
        if(!names.has(item.propertyId)){
          const property=await db.collection('properties').doc(item.propertyId).get();
          if(!property.exists || property.data().uid!==row.id){valid=false;break;}
          names.set(item.propertyId,property.data().name || '—');
        }
        item.propertyName=names.get(item.propertyId);
      }
      if(!valid){stats.skipped++;continue;}
      const eventId=`reminder:${day}`,id=taskNotificationId(row.id,eventId),ref=db.collection('_pms_notifications').doc(id);
      const lang=user.lang==='en'?'en':'it',email=buildReminderEmail(items,day,lang);
      const created=await db.runTransaction(async tx=>{
        const [existing,freshUser]=await Promise.all([tx.get(ref),tx.get(db.collection('users').doc(row.id))]);
        if(existing.exists || freshUser.data()?.notificationPreferences?.pmsReminderEmail!==true)return false;
        tx.set(ref,{queueVersion:1,type:'daily_reminder',uid:row.id,eventId,reminderDay:day,reminderItems:items,
          recipient:account.email,lang,sandbox:false,status:'pending',attempts:0,readyAt:now,
          createdAt:timestamp(),updatedAt:timestamp(),payload:{from:'RendimentoBB PMS <analisi@rendimentobb.it>',to:[account.email],subject:email.title,html:email.html,text:email.text}});
        return true;
      });
      if(created)stats.queued++;
    }catch{stats.errors++;}
  }
  await cursorRef.set({cursor:processed===users.docs.length && users.docs.length<limit?'':last || cursor || '',lastRunAt:timestamp(),...stats});
  return stats;
}
