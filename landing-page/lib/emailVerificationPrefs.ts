/** Client-only prefs; same behavior for patient and doctor accounts (per Firebase uid). */
const STORAGE_PREFIX = 'medi_analytica_email_verify_later_'

export function isEmailVerificationDeferred(uid: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${uid}`) === '1'
  } catch {
    return false
  }
}

export function setEmailVerificationDeferred(uid: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${uid}`, '1')
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearEmailVerificationDeferred(uid: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${uid}`)
  } catch {
    /* ignore */
  }
}

/** True when the app should block access and send the user to /verify-email */
export function shouldRequireEmailVerification(user: { uid: string; emailVerified: boolean }): boolean {
  return !user.emailVerified && !isEmailVerificationDeferred(user.uid)
}
