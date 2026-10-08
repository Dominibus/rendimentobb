import { app } from '/js/firebase-init.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, setPersistence, browserSessionPersistence,
  browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { safeAuthDestination, createAuthActionGuard } from './auth-safety.js?v=20261008-rc58';

const auth = getAuth(app), db = getFirestore(app), guard = createAuthActionGuard();
const $ = id => document.getElementById(id);
const t = (it, en) => window.RB_LANG?.current === 'en' ? en : it;
let mode = 'login';
function message(it, en, success = false) {
  $('login-message').textContent = t(it, en);
  $('login-message').classList.toggle('success', success);
}
function ui() {
  const register = mode === 'register';
  $('auth-title').textContent = t(register ? 'Crea account' : 'Accesso', register ? 'Create account' : 'Sign in');
  $('auth-subtitle').textContent = t(register ? 'Crea un account gratuito per iniziare' : 'Accedi al tuo spazio di lavoro', register ? 'Create a free account to get started' : 'Access your workspace');
  $('authBtn').textContent = guard.busy ? t('Attendi…', 'Please wait…') : t(register ? 'Crea account gratuito' : 'Accedi', register ? 'Create free account' : 'Sign in');
  for (const id of ['name','role','registration-terms']) $(id).hidden = !register;
  $('name').style.display = $('role').style.display = register ? 'block' : 'none';
  $('name').required = register;
  $('terms-accepted').required = register;
  $('password').autocomplete = register ? 'new-password' : 'current-password';
  $('password').minLength = register ? 6 : 1;
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
    'auth/weak-password': ['La password non soddisfa i requisiti del servizio.', 'The password does not meet the service requirements.'],
    'auth/password-does-not-meet-requirements': ['La password non soddisfa i requisiti del servizio.', 'The password does not meet the service requirements.'],
    'auth/too-many-requests': ['Troppi tentativi. Attendi prima di riprovare.', 'Too many attempts. Please wait before trying again.'],
    'auth/network-request-failed': ['Connessione non disponibile. Riprova quando sei online.', 'Connection unavailable. Try again when online.']
  };
  message(...(errors[code] || ['Operazione non completata. Riprova tra poco.', 'Operation incomplete. Please try again shortly.']));
}
window.changeLang = lang => { window.setLang?.(lang); ui(); };
document.addEventListener('rb_language_changed', ui);
$('switch-action').onclick = () => { if (guard.busy) return; mode = mode === 'login' ? 'register' : 'login'; $('login-message').textContent = ''; ui(); };
$('show-password').onclick = () => { $('password').type = $('password').type === 'password' ? 'text' : 'password'; ui(); };
$('auth-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (guard.busy || !$('auth-form').reportValidity()) return;
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
        fetch('/api/send-lead', {method:'POST', headers:{'Content-Type':'application/json'},
          signal:AbortSignal.timeout(8000), body:JSON.stringify({email,name,role,type:'auth',source:'/login/',funnel,lang:window.currentLang || 'it'})}).catch(() => {});
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
      message('Se l’indirizzo è associato a un account, riceverai le istruzioni. Controlla anche lo spam.', 'If the address belongs to an account, you will receive instructions. Check your spam folder too.',true);
    } catch (failure) {
      if (failure?.code === 'auth/user-not-found') message('Se l’indirizzo è associato a un account, riceverai le istruzioni. Controlla anche lo spam.', 'If the address belongs to an account, you will receive instructions. Check your spam folder too.',true);
      else error(failure?.code);
    }
  });
  ui();
};
ui();
