import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, getDoc, deleteDoc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';

const projectId = 'demo-rendimentobb-security';
const profiles = {
  free: { plan: 'free' }, investor: { plan: 'investor' },
  pro: { plan: 'pro' }, annual: { plan: 'pro_yearly' },
  legacyPaid: { plan: 'pro' }, normalized: { plan: ' Investor ' },
  nullSession: { plan: 'investor', stripeSessionId: null },
  sandboxOnly: { plan: 'free', sandboxPlan: 'pro' },
  testMode: { plan: 'pro', stripeLiveMode: false },
  legacyTest: { plan: 'pro', stripeSessionId: 'cs_test_legacy' },
  live: { plan: 'pro', stripeLiveMode: true, stripeSessionId: 'cs_live_current' },
  explicitLive: { plan: 'investor', stripeLiveMode: true, stripeSessionId: 'cs_test_legacy' },
  forgedRole: { plan: 'free', role: 'admin' }, unknown: { plan: 'enterprise' }
};
let env;
const dbFor = (uid, claims = {}) => env.authenticatedContext(uid, {
  email: `${uid}@example.invalid`, email_verified: true, ...claims
}).firestore();

before(async () => {
  // No production project or credentials: this suite requires the local emulator.
  assert.match(process.env.FIRESTORE_EMULATOR_HOST || '', /^(127\.0\.0\.1|localhost):8089$/);
  env = await initializeTestEnvironment({ projectId, firestore: {
    host: '127.0.0.1', port: 8089,
    rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8')
  }});
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    for (const [uid, profile] of Object.entries(profiles)) {
      await setDoc(doc(db, 'users', uid), { email: `${uid}@example.invalid`, role: 'user', ...profile });
      await setDoc(doc(db, 'analyses', uid), { uid, roi: -0.9, city: 'Roma', isPortfolio: false });
      await setDoc(doc(db, 'properties', uid), { uid, name: 'Casa test', city: 'Roma' });
      await setDoc(doc(db, 'bookings', uid), { uid, propertyId: uid, guestName: 'Test', guestPortal: { enabled: false } });
    }
    await setDoc(doc(db, 'leads', 'private'), { email: 'lead@example.invalid' });
  });
});
after(async () => { if (env) await env.cleanup(); });

for (const uid of ['investor', 'pro', 'annual', 'legacyPaid', 'normalized', 'nullSession', 'live', 'explicitLive']) {
  test(`${uid}: own analysis/property creates and updates remain allowed`, async () => {
    const db = dbFor(uid);
    await assertSucceeds(setDoc(doc(db, 'analyses', `${uid}-new`), { uid, roi: -0.9, city: 'Roma' }));
    await assertSucceeds(updateDoc(doc(db, 'analyses', uid), { isPortfolio: true }));
    await assertSucceeds(setDoc(doc(db, 'properties', `${uid}-new`), { uid, name: 'Casa' }));
    await assertSucceeds(updateDoc(doc(db, 'properties', uid), { name: 'Casa aggiornata', renovationPlan: { notes: 'Test' } }));
  });
}
for (const uid of ['free', 'sandboxOnly', 'testMode', 'legacyTest', 'forgedRole', 'unknown', 'noProfile']) {
  test(`${uid}: client claims cannot grant paid writes`, async () => {
    const db = dbFor(uid, { plan: 'pro', role: 'admin' });
    await assertFails(setDoc(doc(db, 'analyses', `${uid}-blocked`), { uid, roi: 10 }));
    await assertFails(setDoc(doc(db, 'properties', `${uid}-blocked`), { uid, name: 'Casa' }));
    if (uid !== 'noProfile') {
      await assertFails(updateDoc(doc(db, 'analyses', uid), { roi: 25 }));
      await assertFails(updateDoc(doc(db, 'properties', uid), { name: 'Blocked' }));
      await assertSucceeds(getDoc(doc(db, 'analyses', uid)));
      await assertSucceeds(getDoc(doc(db, 'properties', uid)));
      await assertSucceeds(getDoc(doc(db, 'bookings', uid)));
    }
  });
}
test('anonymous cannot read or write any private account resources', async () => {
  const db = env.unauthenticatedContext().firestore();
  for (const name of ['users', 'analyses', 'properties', 'bookings']) {
    await assertFails(getDoc(doc(db, name, 'pro')));
    await assertFails(setDoc(doc(db, name, 'anonymous'), { uid: 'pro' }));
  }
});
test('paid account cannot read/write another account or reassign ownership', async () => {
  const db = dbFor('pro');
  for (const name of ['users', 'analyses', 'properties', 'bookings']) {
    await assertFails(getDoc(doc(db, name, 'investor')));
    await assertFails(updateDoc(doc(db, name, 'investor'), { name: 'Wrong owner' }));
  }
  for (const name of ['analyses', 'properties']) {
    await assertFails(setDoc(doc(db, name, 'cross-owner'), { uid: 'investor' }));
    await assertFails(updateDoc(doc(db, name, 'pro'), { uid: 'investor' }));
  }
  await assertFails(getDocs(collection(db, 'properties')));
  await assertSucceeds(getDocs(query(collection(db, 'properties'), where('uid', '==', 'pro'))));
});
test('Free cannot change protected entitlement fields, including sandbox fields', async () => {
  const db = dbFor('free');
  for (const patch of [{plan:'pro'}, {role:'admin'}, {isAdmin:true}, {sandboxPlan:'pro'}, {stripeLiveMode:true}]) {
    await assertFails(updateDoc(doc(db, 'users', 'free'), patch));
  }
  await assertSucceeds(updateDoc(doc(db, 'users', 'free'), { 'notificationPreferences.pmsReminderEmail': false }));
});
test('account creation accepts Free and rejects self-issued paid/admin accounts', async () => {
  const uid = 'signup'; const db = dbFor(uid);
  const base = { email: `${uid}@example.invalid`, role: 'user' };
  await assertFails(setDoc(doc(db, 'users', uid), { ...base, plan: 'pro' }));
  await assertFails(setDoc(doc(db, 'users', uid), { ...base, plan: 'free', role: 'admin' }));
  await assertSucceeds(setDoc(doc(db, 'users', uid), { ...base, plan: 'free' }));
});
test('analysis/property linked batch still works for a paid account', async () => {
  const uid = 'pro'; const db = dbFor(uid); const batch = writeBatch(db);
  batch.set(doc(db, 'properties', 'linked-pro'), { uid, name: 'Linked', analysisId: 'pro', investmentSnapshot: { roi: -0.9 } });
  batch.update(doc(db, 'analyses', 'pro'), { propertyId: 'linked-pro', isPortfolio: true });
  await assertSucceeds(batch.commit());
});
test('booking business mutations remain server-only for every plan', async () => {
  for (const uid of ['free', 'investor', 'pro', 'annual']) {
    const db = dbFor(uid);
    await assertFails(setDoc(doc(db, 'bookings', `${uid}-new`), { uid }));
    await assertFails(updateDoc(doc(db, 'bookings', uid), { status: 'checked_in' }));
    await assertFails(deleteDoc(doc(db, 'bookings', uid)));
    await assertFails(deleteDoc(doc(db, 'properties', uid)));
  }
});
test('paid owner can enable guest link; Free can only revoke their own link', async () => {
  const portal = { enabled: true, tokenHash: 'a'.repeat(64), expiresAt: '2026-10-15T00:00:00.000Z', createdAt: '2026-10-07T00:00:00.000Z' };
  await assertSucceeds(updateDoc(doc(dbFor('pro'), 'bookings', 'pro'), { guestPortal: portal }));
  await assertFails(updateDoc(doc(dbFor('free'), 'bookings', 'free'), { guestPortal: portal }));
  await assertSucceeds(updateDoc(doc(dbFor('free'), 'bookings', 'free'), { guestPortal: { enabled: false, tokenHash: '', expiresAt: '', revokedAt: '2026-10-07T00:00:00.000Z' } }));
  await assertFails(updateDoc(doc(dbFor('pro'), 'bookings', 'investor'), { guestPortal: portal }));
});
test('verified existing admin exception does not grant cross-account access', async () => {
  const db = dbFor('admin', { email: 'rendimentobb@gmail.com', email_verified: true });
  await assertSucceeds(setDoc(doc(db, 'analyses', 'admin-new'), { uid: 'admin' }));
  await assertSucceeds(getDoc(doc(db, 'leads', 'private')));
  await assertFails(getDoc(doc(db, 'properties', 'pro')));
  const unverified = dbFor('unverifiedAdmin', { email: 'rendimentobb@gmail.com', email_verified: false });
  await assertFails(setDoc(doc(unverified, 'analyses', 'unverified-new'), { uid: 'unverifiedAdmin' }));
});
test('downgraded owner can read and delete their own saved analysis', async () => {
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'users', 'downgraded'), { plan: 'free', role: 'user', email: 'downgraded@example.invalid' });
    await setDoc(doc(db, 'analyses', 'old-analysis'), { uid: 'downgraded', roi: -0.9 });
  });
  const db = dbFor('downgraded');
  await assertSucceeds(getDoc(doc(db, 'analyses', 'old-analysis')));
  await assertFails(updateDoc(doc(db, 'analyses', 'old-analysis'), { roi: 20 }));
  await assertSucceeds(deleteDoc(doc(db, 'analyses', 'old-analysis')));
});

// RC50 real payload and boundary tests.
const analysisPayload = uid => ({uid,propertyPrice:150000,equity:30000,gross:27375,expenses:6000,roi:-4.2,visualROI:-4.2,realROI:-0.84,net:-1260,risk:78,riskBreakdown:{base:10,roi:25,occupancy:15,leverage:10,debtCoverage:15,cashflow:10},ltv:80,dscr:0.94,noi:5000,netOperatingIncome:5000,capRate:3.33,annualDebtService:6260,occupancy:50,investmentScore:0,verdict:'AVOID',marketCity:'roma',realCity:'Roma',createdAt:new Date(),createdAtClient:new Date()});
const propertyPayload = uid => ({uid,name:'Casa test',city:'Roma',address:'Via test 1',priceNight:150,touristTaxConfig:{enabled:true,ratePerGuestNight:5,currency:'EUR',maxTaxableNights:10,minimumTaxableAge:12,collectionTime:'checkin'},analysisId:null,investmentSnapshot:null,createdAt:new Date(),updatedAt:new Date()});
test('RC50 full simulator payload accepts negative ROI, cashflow, NOI and DSCR',async()=>{
 const db=dbFor('pro');
 await assertSucceeds(setDoc(doc(db,'analyses','negative-scenario'),{...analysisPayload('pro'),dscr:-1,noi:-5000,netOperatingIncome:-5000}));
 await assertSucceeds(setDoc(doc(db,'properties','full-property'),propertyPayload('pro')));
});
test('RC50 analyses reject unknown fields, wrong types and non-finite numbers',async()=>{
 const db=dbFor('pro');
 for(const patch of [{isAdmin:true},{roi:'20'},{roi:NaN},{net:Infinity},{risk:101},{occupancy:-1},{ltv:101},{marketCity:'x'.repeat(201)},{riskBreakdown:{unexpected:1}},{createdAt:'2026-10-07'},{isPortfolio:'true'}])
  await assertFails(setDoc(doc(db,'analyses','invalid-analysis'),{...analysisPayload('pro'),...patch}));
 await assertFails(updateDoc(doc(db,'analyses','pro'),{roi:'25'}));
});
test('RC50 properties reject unknown fields, empty names, negative prices and oversized text',async()=>{
 const db=dbFor('pro');
 for(const patch of [{admin:true},{name:' '},{name:123},{name:'x'.repeat(201)},{address:'x'.repeat(501)},{priceNight:-1},{priceNight:NaN},{priceNight:'100'},{investmentSnapshot:{risk:101}},{renovationPlan:[]}])
  await assertFails(setDoc(doc(db,'properties','invalid-property'),{...propertyPayload('pro'),...patch}));
 await assertFails(updateDoc(doc(db,'properties','pro'),{priceNight:-10}));
});
test('RC50 tourist tax validates type, range, currency and collection time',async()=>{
 const db=dbFor('pro'),base=propertyPayload('pro');
 for(const patch of [{ratePerGuestNight:-1},{ratePerGuestNight:0},{enabled:'true'},{currency:'XXX'},{maxTaxableNights:1.5},{minimumTaxableAge:121},{collectionTime:'automatic'},{secret:'unexpected'}])
  await assertFails(setDoc(doc(db,'properties','invalid-tax'),{...base,touristTaxConfig:{...base.touristTaxConfig,...patch}}));
 await assertSucceeds(setDoc(doc(db,'properties','supported-tax'),{...base,touristTaxConfig:{...base.touristTaxConfig,currency:'GBP',collectionTime:'checkout'}}));
});
test('RC50 cross-account, missing and path-shaped references are denied',async()=>{
 const db=dbFor('pro');
 for(const id of ['investor','missing-analysis','pro/other',''])
  await assertFails(setDoc(doc(db,'properties','invalid-link'),{...propertyPayload('pro'),analysisId:id}));
 for(const id of ['investor','missing-property','pro/other',''])
  await assertFails(updateDoc(doc(db,'analyses','pro'),{propertyId:id}));
 await assertFails(updateDoc(doc(db,'properties','pro'),{analysisId:'investor'}));
});
test('RC50 getAfter accepts property and analysis created together by the same owner',async()=>{
 const db=dbFor('investor'),batch=writeBatch(db);
 batch.set(doc(db,'analyses','new-batch-analysis'),{...analysisPayload('investor'),propertyId:'new-batch-property',isPortfolio:true});
 batch.set(doc(db,'properties','new-batch-property'),{...propertyPayload('investor'),analysisId:'new-batch-analysis',investmentSnapshot:{roi:-4.2,annualCashflow:-1260,occupancy:50,risk:78}});
 await assertSucceeds(batch.commit());
});
test('RC50 batches can switch or remove existing owner links',async()=>{
 const db=dbFor('investor');
 await assertSucceeds(setDoc(doc(db,'analyses','second-analysis'),analysisPayload('investor')));
 const batch=writeBatch(db);
 batch.update(doc(db,'properties','new-batch-property'),{analysisId:'second-analysis',investmentSnapshot:{roi:-4.2}});
 batch.update(doc(db,'analyses','new-batch-analysis'),{propertyId:null,isPortfolio:false});
 batch.update(doc(db,'analyses','second-analysis'),{propertyId:'new-batch-property',isPortfolio:true});
 await assertSucceeds(batch.commit());
 const unlink=writeBatch(db);
 unlink.update(doc(db,'properties','new-batch-property'),{analysisId:null,investmentSnapshot:null});
 unlink.update(doc(db,'analyses','second-analysis'),{propertyId:null,isPortfolio:false});
 await assertSucceeds(unlink.commit());
});
test('RC50 legacy fields and invalid untouched values allow unrelated corrections',async()=>{
 await env.withSecurityRulesDisabled(async context=>{
  const db=context.firestore();
  await setDoc(doc(db,'properties','legacy-property'),{uid:'pro',name:'Legacy',oldField:{version:1},priceNight:'150',analysisId:'deleted-analysis'});
  await setDoc(doc(db,'analyses','legacy-analysis'),{uid:'pro',roi:'-4.2',oldField:'legacy'});
 });
 const db=dbFor('pro');
 await assertSucceeds(updateDoc(doc(db,'properties','legacy-property'),{name:'Corretto'}));
 await assertSucceeds(updateDoc(doc(db,'properties','legacy-property'),{priceNight:150}));
 await assertSucceeds(updateDoc(doc(db,'analyses','legacy-analysis'),{isPortfolio:true}));
 await assertFails(updateDoc(doc(db,'properties','legacy-property'),{oldField:'new'}));
 await assertFails(updateDoc(doc(db,'analyses','legacy-analysis'),{oldField:'new'}));
});
test('RC50 creation timestamps cannot be overwritten',async()=>{
 const db=dbFor('pro');
 await assertFails(updateDoc(doc(db,'analyses','negative-scenario'),{createdAt:new Date('2030-01-01')}));
 await assertFails(updateDoc(doc(db,'properties','full-property'),{createdAt:new Date('2030-01-01')}));
});
test('RC50 full property editor update preserves renovation and refreshes owner snapshot',async()=>{
 const db=dbFor('pro');
 await assertSucceeds(setDoc(doc(db,'properties','editor-existing'),{...propertyPayload('pro'),renovationPlan:{notes:'Conservare',items:[{description:'Bagno',actualCost:1000}]}}));
 const {createdAt,...edit}=propertyPayload('pro');
 await assertSucceeds(updateDoc(doc(db,'properties','editor-existing'),{...edit,name:'Casa aggiornata',priceNight:180,analysisId:'negative-scenario',investmentSnapshot:{propertyPrice:150000,equity:30000,roi:-4.2,realROI:-0.84,annualCashflow:-1260,risk:78,occupancy:50,city:'Roma'}}));
 const saved=(await getDoc(doc(db,'properties','editor-existing'))).data();
 assert.equal(saved.renovationPlan.notes,'Conservare');
 assert.equal(saved.investmentSnapshot.roi,-4.2);
 const {uid,createdAt:analysisCreated,createdAtClient,...values}=analysisPayload('pro');
 await assertSucceeds(updateDoc(doc(db,'analyses','negative-scenario'),values));
});

const assumptionsPayload = () => ({schemaVersion:1,calculationVersion:'roi-monthly-v1',source:'simulator',expensesUnit:'monthly_eur',propertyPrice:150000,equity:30000,loanAmount:120000,priceNight:150,occupancy:70,expenses:2500,commission:15,tax:21,interestRate:3.5,loanYears:20});
test('full analysis with complete assumptions is allowed, linking preserves immutable snapshot',async()=>{
 const db=dbFor('pro');const ref=doc(db,'analyses','snapshot-full');
 await assertSucceeds(setDoc(ref,{...analysisPayload('pro'),assumptions:assumptionsPayload()}));
 await assertSucceeds(updateDoc(ref,{isPortfolio:true,propertyId:'pro'}));
 await assertFails(updateDoc(ref,{'assumptions.expenses':0}));
 await assertFails(updateDoc(ref,{assumptions:null}));
 await assertFails(updateDoc(doc(db,'analyses','pro'),{assumptions:assumptionsPayload()}));
});
test('snapshot schema rejects unknown keys, missing fields, wrong types and nonfinite values',async()=>{
 const db=dbFor('pro');let i=0;
 for(const patch of [{extra:1},{schemaVersion:2},{source:'unknown'},{expensesUnit:'yearly_eur'},{occupancy:101},{interestRate:NaN},{loanAmount:Infinity},{loanYears:0},{tax:'21'},{commission:-1},{expensesUnit:'percentage',expenses:101}]){
  await assertFails(setDoc(doc(db,'analyses','snapshot-invalid-'+i++),{uid:'pro',assumptions:{...assumptionsPayload(),...patch}}));
 }
 const incomplete=assumptionsPayload();delete incomplete.tax;
 await assertFails(setDoc(doc(db,'analyses','snapshot-missing'),{uid:'pro',assumptions:incomplete}));
});
test('home percentage and zero-cost snapshots allowed; Free and other owners remain blocked',async()=>{
 const a={...assumptionsPayload(),source:'home_preview',expensesUnit:'percentage',expenses:35};
 await assertSucceeds(setDoc(doc(dbFor('investor'),'analyses','snapshot-home'),{uid:'investor',assumptions:a}));
 await assertSucceeds(setDoc(doc(dbFor('pro'),'analyses','snapshot-zero'),{uid:'pro',assumptions:{...assumptionsPayload(),expenses:0,loanAmount:0,interestRate:0,tax:0,commission:0}}));
 await assertFails(setDoc(doc(dbFor('free'),'analyses','snapshot-free'),{uid:'free',assumptions:a}));
 await assertFails(getDoc(doc(dbFor('investor'),'analyses','snapshot-full')));
});
test('compact creation validation still denies nonnumeric financial and risk fields',async()=>{
 const db=dbFor('pro');let i=0;
 for(const field of ['propertyPrice','equity','gross','expenses','annualDebtService','roi','visualROI','realROI','net','dscr','noi','netOperatingIncome','capRate','risk','ltv','occupancy','investmentScore']){
  for(const value of [false,null,'0',{},[]])await assertFails(setDoc(doc(db,'analyses','bad-numeric-'+i++),{uid:'pro',[field]:value}));
 }
 for(const value of [false,null,'0',{},[],NaN,Infinity,-1,101])await assertFails(setDoc(doc(db,'analyses','bad-breakdown-'+i++),{uid:'pro',riskBreakdown:{base:value}}));
});
test('full snapshot survives atomic property creation and analysis link',async()=>{
 const db=dbFor('pro');const a=doc(db,'analyses','snapshot-batch');const p=doc(db,'properties','snapshot-property');const batch=writeBatch(db);
 batch.set(a,{...analysisPayload('pro'),assumptions:assumptionsPayload(),isPortfolio:true,propertyId:p.id});
 batch.set(p,{...propertyPayload('pro'),analysisId:a.id});
 await assertSucceeds(batch.commit());
 const saved=await assertSucceeds(getDoc(a));assert.equal(saved.data().assumptions.expenses,2500);
 await assertSucceeds(updateDoc(p,{name:'Immobile aggiornato'}));
});
