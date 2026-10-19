import admin from 'firebase-admin';
import {createSolutionRequestHandler,SOLUTION_ORIGINS} from '../lib/solution-request-service.js';

export default createSolutionRequestHandler({
 enabled:()=>process.env.BASIC_BEYOND_REQUESTS_ENABLED==='true',
 secret:()=>process.env.BASIC_BEYOND_RATE_SECRET||'',
 origins:()=>[...SOLUTION_ORIGINS,...String(process.env.BASIC_BEYOND_PREVIEW_ORIGINS||'').split(',').map(v=>v.trim()).filter(v=>/^https:\/\/[^/\s]+$/.test(v))],
 getDB:()=>{
  if(!admin.apps.length){
   const {FIREBASE_PROJECT_ID,FIREBASE_CLIENT_EMAIL,FIREBASE_PRIVATE_KEY}=process.env;
   if(!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY)throw Error('configuration_missing');
   admin.initializeApp({credential:admin.credential.cert({projectId:FIREBASE_PROJECT_ID,clientEmail:FIREBASE_CLIENT_EMAIL,privateKey:FIREBASE_PRIVATE_KEY.replace(/\\n/g,'\n')})});
  }
  return admin.firestore();
 }
});
