import crypto from 'node:crypto';
import {reconcilePMSTasks,recordPMSTaskTransitions} from '../js/pms-tasks.js';
import {evaluateAvailability, canAdvanceBooking, isKnownBookingStatus} from '../js/pms-availability.js';
import {stayNights, calendarDay} from '../js/pms-calendar.js';
import {getPlanForScope} from '../js/account-plan.js';

export class PMSOperationError extends Error {
  constructor(code, status = 400){ super(code); this.code = code; this.status = status; }
}
const fail = (code, status) => { throw new PMSOperationError(code,status); };
const id = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const plain = value => value && typeof value === 'object' && !Array.isArray(value);
const text = (value, max = 160) => typeof value === 'string' ? value.replace(/[<>\u0000-\u001f\u007f]/g,'').trim().slice(0,max) : '';
function number(value, max = 1e9, integer = false){
  if(typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max || (integer && !Number.isSafeInteger(value))) fail('invalid_payload');
  return value;
}
function choice(value, values, fallback){
  const selected = value ?? fallback;
  if(!values.includes(selected)) fail('invalid_payload');
  return selected;
}
const revision = booking => Number.isSafeInteger(booking?._pmsVersion) && booking._pmsVersion >= 0 ? booking._pmsVersion : 0;

export function normalizeBookingInput(input){
  if(!plain(input) || !id(input.propertyId) || !isKnownBookingStatus(input.status)) fail('invalid_payload');
  const nights = stayNights(input.checkin,input.checkout);
  if(!nights) fail('invalid_dates');
  const guestName = text(input.guestName);
  if(!guestName) fail('invalid_payload');
  const guests = number(input.guests,1000,true), totalAmount = number(input.totalAmount);
  if(!guests || !totalAmount) fail('invalid_payload');
  const contact = input.guestContact || {};
  const email = text(contact.email,254).toLowerCase();
  if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('invalid_payload');
  const registration = input.guestRegistration || {};
  const documentsReceived = number(registration.documentsReceived ?? 0,guests,true);
  const authorityStatus = choice(registration.authorityStatus,['pending','submitted','not_required'],'pending');
  if(authorityStatus === 'submitted' && documentsReceived < guests) fail('invalid_payload');
  const cleaning = input.cleaning || {};
  const required = cleaning.required !== false;
  const cleaningStatus = required ? choice(cleaning.status,['pending','scheduled','completed'],'pending') : 'not_required';
  const scheduledDate = required ? cleaning.scheduledDate || input.checkout : '';
  if(required && (calendarDay(scheduledDate) === null || scheduledDate < input.checkout)) fail('invalid_payload');
  const issue = input.guestIssue || {};
  const active = issue.active === true;
  const issueStatus = active ? choice(issue.status,['open','in_progress','resolved'],'open') : 'none';
  const source = text(input.source || 'direct',40);
  // Copy only supported fields. UID, revisions, portal tokens and timestamps are server-owned.
  const result = {
    propertyId:input.propertyId,guestName,guestContact:{phone:text(contact.phone,30),email},
    checkin:input.checkin,checkout:input.checkout,nights,guests,totalAmount,
    status:choice(input.status,['pending','arrival','checkin','checkout','completed','cancelled'],'arrival'),source,
    guestRegistration:{documentsReceived,authorityStatus,completed:documentsReceived === guests && ['submitted','not_required'].includes(authorityStatus)},
    cleaning:{required,status:cleaningStatus,scheduledDate,assignee:text(cleaning.assignee,160),completed:!required || cleaningStatus === 'completed'},
    guestIssue:{active,status:issueStatus,category:active ? choice(issue.category,['maintenance','cleaning','access','noise','comfort','safety','payment','other'],'other') : '',
      priority:active ? choice(issue.priority,['low','medium','high','urgent'],'medium') : '',note:active ? text(issue.note,500) : '',resolved:!active || issueStatus === 'resolved'},
    pricingAssistant:null
  };
  if(input.pricingAssistant != null){
    const pricing = input.pricingAssistant;
    if(!plain(pricing)) fail('invalid_payload');
    result.pricingAssistant={version:'assisted-v2',seasonMode:choice(pricing.seasonMode,['auto','high','medium','low'],'auto'),seasonLevel:choice(pricing.seasonLevel,['high','medium','low'],'medium'),applied:pricing.applied === true,finalADR:Math.round(totalAmount/nights*100)/100};
    for(const key of ['baseADR','marketADR','suggestedADR','suggestedTotal','seasonFactor']) result.pricingAssistant[key]=number(pricing[key] ?? 0);
  }
  const tax = input.touristTax || {};
  result.touristTax = tax.enabled === true ? {
    enabled:true,taxableGuests:number(tax.taxableGuests,guests,true),taxableNights:number(tax.taxableNights,nights,true),
    ratePerGuestNight:number(tax.ratePerGuestNight,10000),amount:number(tax.amount),currency:text(tax.currency || 'EUR',3),
    minimumTaxableAge:number(tax.minimumTaxableAge ?? 0,120,true),
    status:choice(tax.status,['pending','collected','exempt','platform'],'pending'),
    paymentMethod:choice(tax.paymentMethod,['cash','card','bank','transfer','platform','other'],'cash'),
    collectionTime:choice(tax.collectionTime,['checkin','checkout'],'checkin')
  } : {enabled:false,amount:0};
  return result;
}

export async function performPMSOperation(db, decoded, body, {timestamp, now = Date.now(), sandbox = false} = {}){
  if(!plain(body) || !['save','advance','cancel','delete','delete_property','task'].includes(body.operation) || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(body.requestId || '')) fail('invalid_request');
  const uid = decoded.uid;
  const operation = body.operation;
  if(!uid) fail('unauthorized',401);
  if(operation !== 'save' || body.bookingId){ if(operation !== 'delete_property' && !id(body.bookingId)) fail('invalid_request'); }
  if(operation === 'delete_property' && !id(body.propertyId)) fail('invalid_request');
  const data = operation === 'save' ? normalizeBookingInput(body.data) : null;
  if(operation !== 'delete_property' && body.bookingId && (!Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 0)) fail('invalid_request');
  const digest = crypto.createHash('sha256').update(`${uid}:${body.requestId}`).digest('hex');
  const fingerprint = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
  const operationRef = db.collection('_pms_operations').doc(digest);
  const bookingRef = operation === 'delete_property' ? null : db.collection('bookings').doc(body.bookingId || digest.slice(0,32));
  const userRef = db.collection('users').doc(uid);
  const rateRef = db.collection('_pms_rate').doc(uid);
  return db.runTransaction(async transaction => {
    const previous = await transaction.get(operationRef);
    if(previous.exists){
      if(previous.data().fingerprint !== fingerprint) fail('idempotency_mismatch',409);
      return {...previous.data().result,duplicate:true};
    }
    const user = await transaction.get(userRef);
    const isAdmin = decoded.email_verified === true && decoded.email === 'rendimentobb@gmail.com';
    if(!isAdmin && (!user.exists || !['investor','pro','pro_yearly'].includes(getPlanForScope(user.data(),sandbox)))) fail('plan_required',403);
    const rate = await transaction.get(rateRef);
    const rateData = rate.exists ? rate.data() : {};
    const rateCount = now - (rateData.start || 0) < 60000 ? (rateData.count || 0) : 0;
    if(rateCount >= 60) fail('too_many_requests',429);
    const currentSnap = bookingRef ? await transaction.get(bookingRef) : null;
    const current = currentSnap?.exists ? currentSnap.data() : null;
    if(current && current.uid !== uid) fail('forbidden',403);
    if(body.bookingId && !current) fail('not_found',404);
    if(current && body.expectedVersion !== revision(current)) fail('stale_version',409);
    const destination = operation === 'delete_property' ? body.propertyId : data?.propertyId || current?.propertyId;
    if(!id(destination)) fail('not_found',404);
    const propertyIds = [...new Set([destination,current?.propertyId].filter(Boolean))].sort();
    const locks = [];
    let property;
    for(const propertyId of propertyIds){
      const ref = db.collection('_pms_locks').doc(propertyId);
      const lock = await transaction.get(ref);
      if(lock.exists && lock.data().uid !== uid) fail('forbidden',403);
      locks.push({ref,version:revision(lock.exists ? {_pmsVersion:lock.data().version} : null)});
      const snapshot = await transaction.get(db.collection('properties').doc(propertyId));
      if(snapshot.exists && snapshot.data().uid !== uid) fail('forbidden',403);
      if(propertyId === destination) property = snapshot;
    }
    if((operation === 'save' || operation === 'advance' || operation === 'delete_property') && !property?.exists) fail('not_found',404);
    const bookingsQuery = db.collection('bookings').where('propertyId','==',destination);
    const bookings = await transaction.get(bookingsQuery);
    let patch;
    if(operation === 'save') patch = {...data};
    if(operation === 'advance'){
      if(!canAdvanceBooking(current.status,body.nextStatus)) fail('stale_status',409);
      patch = {...current,status:body.nextStatus};
    }
    if(patch){
      const decision = evaluateAvailability(patch,bookings.docs.map(item=>({...item.data(),id:item.id})),body.bookingId || null);
      if(!decision.available) fail(decision.reason,409);
    }
    let linkedAnalysis;
    if(operation === 'delete_property'){
      if(bookings.docs.length) fail('property_has_bookings',409);
      const analysisId = property.data().analysisId;
      if(id(analysisId)) linkedAnalysis = await transaction.get(db.collection('analyses').doc(analysisId));
      if(linkedAnalysis?.exists && linkedAnalysis.data().uid !== uid) fail('forbidden',403);
    }
    const taskTime = new Date(now).toISOString();
    let taskState;
    if(operation === 'task'){
      if(!['documents','authority','tax','cleaning','issue'].includes(body.taskCode) || !['open','in_progress'].includes(body.taskStatus)) fail('invalid_request');
      taskState = reconcilePMSTasks(current,current.autopilotTasks || {},taskTime);
      const task = taskState[body.taskCode];
      if(!task || task.status === 'resolved') fail('task_resolved',409);
      if(body.taskFingerprint !== task.fingerprint) fail('stale_task',409);
      taskState[body.taskCode] = {...task,status:body.taskStatus,updatedAt:taskTime};
      if(body.taskStatus === 'in_progress') taskState[body.taskCode].takenAt=taskTime;
      else delete taskState[body.taskCode].takenAt;
    }
    // All reads precede writes. Every occupancy mutation shares the property lock,
    // including empty calendars, transfers, cancellations and deletion.
    const version = revision(current) + 1;
    const actor={uid,email:text(decoded.email,254),name:text(decoded.name || decoded.email || uid,160)};
    let taskEvents=[];
    const trackTasks=next=>{
      const recorded=recordPMSTaskTransitions(current?.autopilotTasks || {},next,actor,taskTime,digest,current?.autopilotEvents || []);
      if(operation==='cancel') for(const event of recorded.events) event.reason='booking_cancelled';
      taskEvents=recorded.events;
      return {autopilotTasks:recorded.tasks,autopilotEvents:recorded.history};
    };
    if(operation === 'save'){
      // Recompute the tax from the property settings read in this transaction.
      const config = property.data().touristTaxConfig || {};
      if(config.enabled === true){
        const ratePerGuestNight = number(Number(config.ratePerGuestNight || 0),10000);
        const maxNights = number(Number(config.maxTaxableNights || 0),10000,true);
        const taxableGuests = Math.min(patch.guests,data.touristTax.taxableGuests ?? patch.guests);
        const taxableNights = maxNights ? Math.min(patch.nights,maxNights) : patch.nights;
        patch.touristTax={...data.touristTax,enabled:true,taxableGuests,taxableNights,ratePerGuestNight,amount:Math.round(ratePerGuestNight*taxableGuests*taxableNights*100)/100,
          currency:text(config.currency || 'EUR',3),minimumTaxableAge:Number(config.minimumTaxableAge || 0),collectionTime:config.collectionTime || 'checkin',status:data.touristTax.status || 'pending',paymentMethod:data.touristTax.paymentMethod || 'cash'};
      }else patch.touristTax={enabled:false,amount:0};
      if(patch.guestIssue.active){
        const previousIssue=current?.guestIssue || {};
        const sameIssue=['active','category','priority','note'].every(key=>previousIssue[key]===patch.guestIssue[key]);
        patch.guestIssue.reportedAt=sameIssue && previousIssue.reportedAt ? previousIssue.reportedAt : taskTime;
        patch.guestIssue.source=sameIssue && previousIssue.source ? previousIssue.source : 'host';
      }
      Object.assign(patch,trackTasks(reconcilePMSTasks({...current,...patch},current?.autopilotTasks || {},taskTime)));
      if(current) transaction.update(bookingRef,{...patch,_pmsVersion:version,updatedAt:timestamp()});
      else transaction.set(bookingRef,{...patch,uid,_pmsVersion:version,createdAt:timestamp(),updatedAt:timestamp()});
    }else if(operation === 'advance') transaction.update(bookingRef,{status:body.nextStatus,...trackTasks(reconcilePMSTasks({...current,status:body.nextStatus},current.autopilotTasks || {},taskTime)),_pmsVersion:version,statusUpdatedAt:timestamp(),updatedAt:timestamp()});
    else if(operation === 'cancel') transaction.update(bookingRef,{status:'cancelled',...trackTasks(reconcilePMSTasks({...current,status:'cancelled'},current.autopilotTasks || {},taskTime)),_pmsVersion:version,cancelledAt:timestamp(),updatedAt:timestamp()});
    else if(operation === 'task') transaction.update(bookingRef,{...trackTasks(taskState),_pmsVersion:version,updatedAt:timestamp()});
    else if(operation === 'delete') transaction.delete(bookingRef);
    else if(operation === 'delete_property'){
      transaction.delete(property.ref);
      if(linkedAnalysis?.exists) transaction.update(linkedAnalysis.ref,{isPortfolio:false,propertyId:null});
    }
    for(const lock of locks) transaction.set(lock.ref,{uid,version:lock.version+1,updatedAt:timestamp()});
    const result={success:true,bookingId:bookingRef?.id || null,version:operation === 'delete_property' ? null : version,taskEmailEventIds:operation==='cancel'?[]:taskEvents.filter(event=>['in_progress','resolved'].includes(event.status)).map(event=>event.id)};
    transaction.set(rateRef,{start:rateCount ? rateData.start : now,count:rateCount+1});
    transaction.set(operationRef,{uid,fingerprint,result,createdAt:timestamp()});
    return result;
  });
}

export function createHostBookingHandler({getFirestore,verifyToken,timestamp,env = process.env,clock = Date.now}){
  return async function(req,res){
    try{
      if(req.method !== 'POST') return res.status(405).json({success:false,error:'method_not_allowed'});
      const token = String(req.headers?.authorization || '').match(/^Bearer (\S+)$/)?.[1];
      if(!token) return res.status(401).json({success:false,error:'unauthorized'});
      if(!plain(req.body) || Buffer.byteLength(JSON.stringify(req.body)) > 32768) fail('invalid_request');
      const db = getFirestore();
      let decoded;
      try{decoded = await verifyToken(token);}catch{fail('unauthorized',401);}
      const sandbox = env.VERCEL_ENV !== 'production' && String(env.STRIPE_SECRET_KEY || '').startsWith('sk_test_');
      const result = await performPMSOperation(db,decoded,req.body,{timestamp,now:clock(),sandbox});
      return res.status(200).json(result);
    }catch(error){
      if(error instanceof PMSOperationError) return res.status(error.status).json({success:false,error:error.code});
      // No guest names, request bodies or tokens in logs.
      console.error('PMS transaction failed',String(error?.code || 'internal_error'));
      return res.status(503).json({success:false,error:'server_unavailable'});
    }
  };
}
