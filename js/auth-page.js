import { NEW_PASSWORD_MIN_LENGTH, NEW_PASSWORD_MAX_LENGTH, newPasswordIssue } from './password-policy.js?v=20261012-rc109';
import { app } from '/js/firebase-init.js?v=20261016-rc140';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, setPersistence, browserSessionPersistence,
  browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { safeAuthDestination, createAuthActionGuard } from './auth-safety.js?v=20261025-rc196';

// BEGIN AUTH FAILURE PRESENTATION
// Presentation only: never persist, log or display provider payloads or credentials.
const authFailureReferences = Object.freeze({
  'auth/unauthorized-domain': 'AUTH-DOMAIN',
  'auth/app-not-authorized': 'AUTH-APP',
  'auth/invalid-api-key': 'AUTH-CONFIG',
  'auth/operation-not-allowed': 'AUTH-METHOD',
  'auth/web-storage-unsupported': 'AUTH-STORAGE',
  'auth/unsupported-persistence-type': 'AUTH-STORAGE',
  'auth/invalid-persistence-type': 'AUTH-PERSISTENCE',
  'auth/internal-error': 'AUTH-INTERNAL'
});

function authFailureMessage(code) {
  const reference = typeof code === 'string' && Object.hasOwn(authFailureReferences, code)
    ? authFailureReferences[code] : 'AUTH-UNCLASSIFIED';
  const details = {
    'AUTH-DOMAIN': [
      'Il servizio di autenticazione non autorizza questo dominio. Contatta il supporto; non occorre cambiare password.',
      'The authentication service does not authorize this domain. Contact support; there is no need to change your password.'
    ],
    'AUTH-APP': [
      'Il servizio di autenticazione non autorizza questa applicazione. Il supporto deve verificare la configurazione; il codice non conferma una password errata.',
      'The authentication service does not authorize this application. Support must check the configuration; this code does not confirm an incorrect password.'
    ],
    'AUTH-CONFIG': [
      'La configurazione del servizio di autenticazione non è valida. Contatta il supporto; non modificare le credenziali del tuo account.',
      'The authentication service configuration is invalid. Contact support; do not change your account credentials.'
    ],
    'AUTH-METHOD': [
      'Questo metodo di accesso non è abilitato dal servizio di autenticazione. Contatta il supporto.',
      'This sign-in method is not enabled by the authentication service. Contact support.'
    ],
    'AUTH-PERSISTENCE': [
      'Il tipo di persistenza richiesto dall’applicazione non è valido. Il supporto deve verificarne la configurazione.',
      'The persistence type requested by the application is invalid. Support must review its configuration.'
    ],
    'AUTH-STORAGE': [
      'Il browser non consente la memorizzazione richiesta per la sessione. Verifica le impostazioni del browser o contatta il supporto.',
      'The browser does not allow the storage required for the session. Check browser settings or contact support.'
    ],
    'AUTH-INTERNAL': [
      'Il servizio di autenticazione ha restituito un errore interno. Contatta il supporto; non posso determinarne la causa da questo messaggio.',
      'The authentication service returned an internal error. Contact support; its cause cannot be determined from this message.'
    ],
    'AUTH-UNCLASSIFIED': [
      'Operazione non completata. La causa non è identificata: contatta il supporto prima di ripetere il tentativo.',
      'Operation incomplete. The cause is unidentified: contact support before repeating the attempt.'
    ]
  };
  const [it, en] = details[reference];
  return {reference, textIT: `${it} Riferimento: ${reference}.`, textEN: `${en} Reference: ${reference}.`};
}
// END AUTH FAILURE PRESENTATION

const auth = getAuth(app), db = getFirestore(app), guard = createAuthActionGuard();
const $ = id => document.getElementById(id);
const t = (it, en) => window.RB_LANG?.current === 'en' ? en : it;
const trialIntent = new URLSearchParams(location.search).get('intent') === 'investor-trial';
let mode = trialIntent ? 'register' : 'login';
if(trialIntent) {
  localStorage.setItem('login_redirect','/?investor_trial=1');
  localStorage.removeItem('selected_city');
}
function message(it, en, success = false) {
  $('login-message').textContent = t(it, en);
  $('login-message').classList.toggle('success', success);
  $('login-message').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function ui() {
  const register = mode === 'register';
  $('auth-title').textContent = t(register ? 'Crea account' : 'Accesso', register ? 'Create account' : 'Sign in');
  $('auth-subtitle').textContent = trialIntent
    ? t(register ? 'Crea un account gratuito per richiedere la prova Investor' : 'Accedi per verificare la disponibilità della prova Investor', register ? 'Create a free account to request the Investor trial' : 'Sign in to check Investor trial eligibility')
    : t(register ? 'Crea un account gratuito per iniziare' : 'Accedi al tuo spazio di lavoro', register ? 'Create a free account to get started' : 'Access your workspace');
  const context = $('trial-auth-context');
  if(context){context.hidden=!trialIntent;context.textContent=t('Investor per 30 giorni, per account idonei: salva analisi e prova dashboard e PMS. Prima verifica l’email, poi conferma la prova nell’area Abbonamento. Nessuna carta o addebito; PDF esclusi. La registrazione non attiva automaticamente la prova.', 'Investor for 30 days, for eligible accounts: save analyses and try the dashboard and PMS. Verify your email first, then confirm the trial in Subscription. No card or charges; PDFs excluded. Registration does not automatically activate the trial.');}
  $('authBtn').textContent = guard.busy ? t('Attendi…', 'Please wait…') : t(register ? 'Crea account gratuito' : 'Accedi', register ? 'Create free account' : 'Sign in');
  for (const id of ['name','role','registration-terms']) $(id).hidden = !register;
  $('name').style.display = $('role').style.display = register ? 'block' : 'none';
  $('name').required = register;
  $('terms-accepted').required = register;
  $('password').autocomplete = register ? 'new-password' : 'current-password';
  $('password').minLength = register ? NEW_PASSWORD_MIN_LENGTH : 1;
  if (register) $('password').maxLength = NEW_PASSWORD_MAX_LENGTH;
  else $('password').removeAttribute('maxlength');
  $('password-help').hidden = !register;
  $('password-help').textContent = t('Usa almeno 15 caratteri. Puoi usare una frase lunga e un password manager; non sono obbligatori numeri o simboli. Non riutilizzare password di altri servizi.', 'Use at least 15 characters. You can use a long passphrase and a password manager; numbers or symbols are not required. Do not reuse passwords from other services.');
  $('switch-text').textContent = t(register ? 'Hai già un account?' : 'Non hai un account?', register ? 'Already have an account?' : 'Don’t have an account?');
  $('switch-action').textContent = t(register ? 'Accedi' : 'Registrati', register ? 'Sign in' : 'Sign up');
  $('show-password').textContent = $('password').type === 'password' ? t('Mostra password', 'Show password') : t('Nascondi password', 'Hide password');
  for (const id of ['authBtn','switch-action','forgot-password','show-password']) $(id).disabled = guard.busy;
  $('auth-form').setAttribute('aria-busy', String(guard.busy));
}
function error(code) {
  const errors = {
    'auth/invalid-email': ['Inserisci un indirizzo email valido.', 'Enter a valid email address.'],
    'auth/invalid-credential': ['Accesso non riuscito. Controlla email e password.', 'Sign-in failed. Check your email and password.'],
    'auth/user-not-found': ['Accesso non riuscito. Controlla email e password.', 'Sign-in failed. Check your email and password.'],
    'auth/wrong-password': ['Accesso non riuscito. Controlla email e password.', 'Sign-in failed. Check your email and password.'],
    'auth/email-already-in-use': ['Registrazione non completata. Prova ad accedere o recuperare la password.', 'Registration incomplete. Try signing in or resetting your password.'],
    'auth/weak-password': ['La password non soddisfa i requisiti: usa almeno 15 caratteri e consulta le indicazioni del modulo.', 'The password does not meet the requirements: use at least 15 characters and check the form guidance.'],
    'auth/password-does-not-meet-requirements': ['La password non soddisfa i requisiti: usa almeno 15 caratteri e consulta le indicazioni del modulo.', 'The password does not meet the requirements: use at least 15 characters and check the form guidance.'],
    'auth/too-many-requests': ['Troppi tentativi. Attendi prima di riprovare.', 'Too many attempts. Please wait before trying again.'],
    'auth/network-request-failed': ['Connessione non disponibile. Riprova quando sei online.', 'Connection unavailable. Try again when online.']
  };
  if (Object.hasOwn(errors, code)) { message(...errors[code]); return; }
  const fallback = authFailureMessage(code);
  message(fallback.textIT, fallback.textEN);
}
window.changeLang = lang => { window.setLang?.(lang); ui(); };
document.addEventListener('rb_language_changed', ui);
// Language initialization listens on window; run after DOMContentLoaded has bubbled.
document.addEventListener('DOMContentLoaded', () => setTimeout(ui, 0));
$('switch-action').onclick = () => { if (guard.busy) return; mode = mode === 'login' ? 'register' : 'login'; $('login-message').textContent = ''; ui(); };
$('show-password').onclick = () => { $('password').type = $('password').type === 'password' ? 'text' : 'password'; ui(); };
$('auth-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (guard.busy) return;
  // Explicit check also covers submissions whose HTML validation was bypassed.
  if (mode === 'register') {
    const issue = newPasswordIssue($('password').value);
    if (issue) {
      if (issue === 'too-short') message('Scegli una password di almeno 15 caratteri.', 'Choose a password with at least 15 characters.');
      else message('La password supera il limite di 4096 caratteri.', 'The password exceeds the 4096-character limit.');
      return;
    }
  }
  if (!$('auth-form').reportValidity()) return;
  await guard.run(async () => {
    ui(); $('login-message').textContent = '';
    const email = $('email').value.trim(), password = $('password').value;
    try {
      await setPersistence(auth, $('remember-access').checked ? browserLocalPersistence : browserSessionPersistence);
      if (mode === 'login') await signInWithEmailAndPassword(auth, email, password);
      else {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const name = $('name').value.trim().slice(0,100), role = $('role').value || 'unknown';
        const funnel = localStorage.getItem('lead_source') || 'direct';
        try {
          await setDoc(doc(db, 'users', credential.user.uid), { email, name, role:'user', profileRole:role, plan:'free',
            source:'/login/', funnel, intentScore:role === 'investor' ? 100 : role === 'agency' ? 80 : role === 'broker' ? 90 : 30,
            createdAt:new Date(), lastLogin:new Date(), leadConverted:true,
            termsAcceptedAt:new Date(), termsURL:'/terms.html', privacyURL:'/privacy.html' });
        } catch {
          message('Account creato, ma il profilo non è stato salvato. Contatta il supporto prima di ripetere la registrazione.', 'Account created, but the profile was not saved. Contact support before registering again.');
          mode = 'login'; return;
        }
        if (role === 'investor') localStorage.setItem('show_investor_modal','1');
        // Secondary notification must not strand a successfully created account.
        (async () => {
          const token = await credential.user.getIdToken();
          await fetch('/api/send-lead', {method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
            keepalive:true, signal:AbortSignal.timeout(8000), body:JSON.stringify({email,name,role,type:'auth',source:'/login/',funnel,lang:window.currentLang || 'it'})});
        })().catch(() => {});
        localStorage.removeItem('lead_source');
      }
      localStorage.setItem('just_logged','1');
      const destination = safeAuthDestination(localStorage.getItem('login_redirect'),localStorage.getItem('selected_city'),location.origin);
      localStorage.removeItem('login_redirect'); localStorage.removeItem('selected_city');
      location.assign(destination);
    } catch (failure) { error(failure?.code); }
  });
  ui();
});
$('forgot-password').onclick = async () => {
  if (guard.busy || !$('email').reportValidity()) return;
  await guard.run(async () => {
    ui();
    try {
      await sendPasswordResetEmail(auth,$('email').value.trim());
      message('Se l’indirizzo è associato a un account, riceverai le istruzioni. Controlla anche lo spam. Per la nuova password usa almeno 15 caratteri.', 'If the address belongs to an account, you will receive instructions. Check your spam folder too. Use at least 15 characters for your new password.',true);
    } catch (failure) {
      if (failure?.code === 'auth/user-not-found') message('Se l’indirizzo è associato a un account, riceverai le istruzioni. Controlla anche lo spam. Per la nuova password usa almeno 15 caratteri.', 'If the address belongs to an account, you will receive instructions. Check your spam folder too. Use at least 15 characters for your new password.',true);
      else error(failure?.code);
    }
  });
  ui();
};
ui();
