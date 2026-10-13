// Registration requirements. Firebase must enforce the matching policy server-side.
export const NEW_PASSWORD_MIN_LENGTH = 15;
export const NEW_PASSWORD_MAX_LENGTH = 4096;
export function newPasswordIssue(password) {
  if (typeof password !== 'string') return 'too-short';
  if (Array.from(password).length < NEW_PASSWORD_MIN_LENGTH) return 'too-short';
  if (password.length > NEW_PASSWORD_MAX_LENGTH) return 'too-long';
  return null;
}
