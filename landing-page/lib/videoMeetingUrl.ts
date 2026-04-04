const FALLBACK = '/dashboard'

/** Only same-app relative paths; blocks open redirects and `..`. */
export function sanitizeVideoReturnTo(raw: string | null | undefined): string {
  if (raw == null || typeof raw !== 'string') return FALLBACK
  let s = raw.trim()
  try {
    s = decodeURIComponent(s)
  } catch {
    return FALLBACK
  }
  if (!s.startsWith('/') || s.startsWith('//')) return FALLBACK
  if (s.includes('://')) return FALLBACK
  if (s.includes('..')) return FALLBACK
  return s || FALLBACK
}

export function buildVideoMeetingHref(opts: {
  roomName: string
  appointmentId: string
  isDoctor: boolean
  /** Where to send the user after they leave the call (path + optional hash). */
  returnTo?: string
}): string {
  const params = new URLSearchParams()
  params.set('room', opts.roomName)
  params.set('appointmentId', opts.appointmentId)
  params.set('isDoctor', opts.isDoctor ? 'true' : 'false')
  params.set('returnTo', sanitizeVideoReturnTo(opts.returnTo ?? FALLBACK))
  return `/video?${params.toString()}`
}
