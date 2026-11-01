// Presentation only: never persist, log or display provider payloads or credentials.
const references = Object.freeze({
  'auth/unauthorized-domain': 'AUTH-DOMAIN',
  'auth/app-not-authorized': 'AUTH-APP',
  'auth/invalid-api-key': 'AUTH-CONFIG',
  'auth/operation-not-allowed': 'AUTH-METHOD',
  'auth/web-storage-unsupported': 'AUTH-STORAGE',
  'auth/unsupported-persistence-type': 'AUTH-STORAGE',
  'auth/invalid-persistence-type': 'AUTH-STORAGE',
  'auth/internal-error': 'AUTH-INTERNAL'
});

export function authFailureMessage(code) {
  const reference = typeof code === 'string' && Object.hasOwn(references, code)
    ? references[code] : 'AUTH-UNCLASSIFIED';
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
