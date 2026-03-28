import type { User } from 'firebase/auth'
import { sendEmailVerification } from 'firebase/auth'

/** Action link: after user clicks Firebase email link they can land here; they still need "Yenile" or re-login. */
export function getEmailVerificationContinueUrl(): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/verify-email`
}

export async function sendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user, {
    url: getEmailVerificationContinueUrl(),
    handleCodeInApp: false,
  })
}
